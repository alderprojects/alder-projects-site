/**
 * v7.3.3-C-PR2 Cart Synthesis Route — LearningStore flywheel pipeline.
 *
 * POST /api/cart/synthesize
 * Body: { projectId: string }
 *
 * What changed from PR1.x:
 *   - Pivoted from synthesize-v2 (basement-only, 3 hardcoded rules,
 *     basement-scope universe filter) to synthesize-v3 (LearningStore
 *     cache lookup + per-feature LLM synthesis on cache miss).
 *   - VisionExtractions are now queried by visitorAnonId across the
 *     last 24 hours, NOT by current Project. This fixes the
 *     cross-project Photo issue from PR1 retests where reused Photos
 *     stayed associated with their original project's RoomSnapshot
 *     and were invisible to synthesize on the new project.
 *   - Catalog universe is no longer scope-filtered. The full curated
 *     catalog is loaded by synthesize-v3 and passed to the per-feature
 *     LLM as candidate products.
 *
 * Anonymous-flow only for v7.3.3. Project owner verified via anonId
 * cookie. 404 (not 403) if owner mismatch, to avoid leaking existence.
 *
 * The persisted SmartCart row keeps its existing column shape so the
 * result page render stays backwards-compat (cartJson /
 * cartItemsJsonWithPhotos). New fields land in payloadJson on the
 * EventLog for observability.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { synthesizeCartV3 } from '@/lib/smart-cart/synthesize-v3'
import { logEvent } from '@/lib/events/log'
import { isOpenExtractionShape, type OpenExtraction } from '@/lib/vision/prompt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const BodySchema = z.object({
  projectId: z.string(),
})

// PR2: pull features from photos uploaded by this anon visitor in the
// recent window. Wider than "this project's photos" because the
// upload route's find-or-create may have kept the Photo linked to an
// older project's RoomSnapshot. The flywheel cares about the
// visitor's current intent, not the project boundary.
const RECENT_PHOTO_WINDOW_MS = 24 * 60 * 60 * 1000 // 24h

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'invalid_body', detail: (e as Error).message.slice(0, 200) },
      { status: 400 }
    )
  }

  let anonId: string
  try {
    anonId = await ensureVisitorSession()
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'no_anon_cookie', detail: (e as Error).message },
      { status: 400 }
    )
  }

  const project = await prisma.project.findUnique({ where: { id: body.projectId } })
  if (!project) {
    return NextResponse.json({ ok: false, error: 'project_not_found' }, { status: 404 })
  }
  if (project.visitorAnonId !== anonId) {
    return NextResponse.json({ ok: false, error: 'project_not_found' }, { status: 404 })
  }

  // PR2: pull VisionExtractions for ALL the visitor's recent
  // (24h window) confirmed photos, not just those linked to this
  // project's RoomSnapshots. This intentionally bypasses the
  // project->snapshot->photo join because find-or-create reuses Photos
  // across requests and they keep their original snapshot binding.
  const recentSince = new Date(Date.now() - RECENT_PHOTO_WINDOW_MS)
  const photos = await prisma.photo.findMany({
    where: {
      visitorAnonId: anonId,
      blobConfirmedAt: { not: null },
      uploadedAt: { gte: recentSince },
    },
    include: {
      extractions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { uploadedAt: 'desc' },
  })

  // Flatten to OpenFeatures. Only photos with a successful new-shape
  // extraction contribute features. Legacy basement-shape rows are
  // skipped because the v2->v3 migration intentionally doesn't try to
  // back-port them (no such rows exist in prod — every v7.3.3-B
  // extraction failed with the model-404).
  const features = photos.flatMap((p) => {
    const ex = p.extractions[0]
    if (!ex) return []
    const json = ex.extractionJson as unknown
    if (!isOpenExtractionShape(json)) return []
    return (json as OpenExtraction).features
  })

  const result = await synthesizeCartV3({ features })

  const cart = await prisma.smartCart.create({
    data: {
      projectId: project.id,
      visitorAnonId: anonId,
      synthesisVersion: 'v3_learning_store',
      photoCount: photos.filter((p) => p.extractions.length > 0).length,
      photoAttached: features.length > 0,
      // Cart shape compatible with PR1.x ResultView via the
      // SynthCartItemV3 fields that overlap SynthCartItem.
      cartJson: result.withPhotos as never,
      cartItemsJsonWithoutPhotos: result.withoutPhotos as never,
      cartItemsJsonWithPhotos: result.withPhotos as never,
      photoChangedRecommendation: result.photoChangedRecommendation,
      // v7.3.4-PR3.6 — introText lives in changeSummaryJson.
      // v7.3.4-PR3.7 — clarification + needs-more-photos signals.
      changeSummaryJson: {
        ...result.changeSummary,
        introText: result.introText,
        needsCategoryClarification: result.needsCategoryClarification,
        needsMorePhotos: result.needsMorePhotos,
        clarificationFeatures: result.clarificationFeatures,
        dominantCategory: result.dominantCategory,
        dominantCategoryConfidence: result.dominantCategoryConfidence,
      } as never,
    },
  })

  // PR3.7 §1.12: log CART_INSUFFICIENT_SIGNAL when free-beta synthesis
  // landed in needsMorePhotos / needsCategoryClarification.
  if (result.needsMorePhotos || result.needsCategoryClarification) {
    try {
      await logEvent({
        eventType: 'CART_INSUFFICIENT_SIGNAL',
        subjectType: 'SmartCart',
        subjectId: cart.id,
        anonId,
        source: 'web',
        payload: {
          gate: result.needsCategoryClarification
            ? 'ambiguous_category'
            : 'empty_buy_lane',
          dominantCategory: result.dominantCategory,
          dominantCategoryConfidence: result.dominantCategoryConfidence,
        },
      })
    } catch {
      /* swallow */
    }
  }

  await logEvent({
    eventType: 'SMART_CART_SYNTHESIZED',
    subjectType: 'SmartCart',
    subjectId: cart.id,
    anonId,
    source: 'web',
    payload: {
      projectId: project.id,
      photoCount: photos.filter((p) => p.extractions.length > 0).length,
      featureCountIn: result.meta.featureCountIn,
      uniqueSignatures: result.meta.uniqueSignatures,
      cacheHits: result.meta.cacheHits,
      cacheMisses: result.meta.cacheMisses,
      llmCallsRan: result.meta.llmCallsRan,
      llmCallsSkipped: result.meta.llmCallsSkipped,
      llmTotalCostCents: result.meta.llmTotalCostCents,
      llmTotalLatencyMs: result.meta.llmTotalLatencyMs,
      photoChangedRecommendation: result.photoChangedRecommendation,
      itemCount: result.withPhotos.length,
    },
  })

  return NextResponse.json({
    ok: true,
    cartId: cart.id,
    cart: result.withPhotos,
    photoChangedRecommendation: result.photoChangedRecommendation,
    changeSummary: result.changeSummary,
    meta: result.meta,
  })
}
