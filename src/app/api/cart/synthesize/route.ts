/**
 * v7.3.3-B Cart Synthesis Route — dual-synthesis (V1 + V2) for basement.
 *
 * POST /api/cart/synthesize
 * Body: { projectId: string }
 *
 * Pulls all confirmed vision extractions for the project's photos,
 * synthesizes the basement_moisture cart twice (without + with photo
 * signal), persists both + the diff + the kill-metric boolean.
 *
 * v7.3.3-C-PR1 bridge: VisionExtraction rows now store the OPEN shape
 * (features[]+overall_photo_category+notes). To keep the 3 existing
 * basement rules firing during the PR1->PR2 window, this route detects
 * open-shape rows and runs the openFeaturesToBasementExtraction shim.
 * The shim + this branch get deleted in PR2 when synthesis pivots to
 * LearningStore signature lookup.
 *
 * Anonymous-flow only for v7.3.3. Project owner verified via anonId
 * cookie. 404 (not 403) if owner mismatch, to avoid leaking existence.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { synthesizeBasementCart } from '@/lib/smart-cart/synthesize-v2'
import { logEvent } from '@/lib/events/log'
import {
  openFeaturesToBasementExtraction,
  type BasementExtraction,
} from '@/lib/vision/extract'
import { isOpenExtractionShape } from '@/lib/vision/prompt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const BodySchema = z.object({
  projectId: z.string(),
})

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
    // Owner mismatch — return 404 to not leak existence.
    return NextResponse.json({ ok: false, error: 'project_not_found' }, { status: 404 })
  }

  // Pull confirmed extractions for this project's snapshots
  const snaps = await prisma.roomSnapshot.findMany({
    where: { projectId: project.id },
    include: {
      photos: {
        where: { blobConfirmedAt: { not: null } },
        include: { extractions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
  })

  // v7.3.3-C-PR1: extractionJson now stores the open shape. Detect
  // shape per row, apply the bridge shim for open rows, treat legacy
  // basement-shape rows as-is. Empty arrays / non-objects skipped.
  const extractions: BasementExtraction[] = []
  for (const snap of snaps) {
    for (const photo of snap.photos) {
      const ex = photo.extractions[0]
      if (!ex) continue
      const json = ex.extractionJson as unknown
      if (!json || typeof json !== 'object') continue
      if (isOpenExtractionShape(json)) {
        extractions.push(openFeaturesToBasementExtraction(json))
      } else {
        // Legacy v7.3.3-B basement-shape row (none exist in prod today
        // because every B extraction failed with the 404 model error,
        // but defensive code is cheap).
        extractions.push(json as BasementExtraction)
      }
    }
  }

  const result = await synthesizeBasementCart({
    projectId: project.id,
    extractions,
  })

  const cart = await prisma.smartCart.create({
    data: {
      projectId: project.id,
      visitorAnonId: anonId,
      synthesisVersion: extractions.length > 0 ? 'v2_photo' : 'v1_baseline',
      // priceCohort/pricePaidCents stay null during anon beta — set at
      // Stripe webhook time when purchase completes (v7.3.7 pricing A/B).
      photoCount: extractions.length,
      photoAttached: extractions.length > 0,
      cartJson: result.withPhotos as never,
      cartItemsJsonWithoutPhotos: result.withoutPhotos as never,
      cartItemsJsonWithPhotos: result.withPhotos as never,
      photoChangedRecommendation: result.photoChangedRecommendation,
      changeSummaryJson: result.changeSummary as never,
    },
  })

  await logEvent({
    eventType: 'SMART_CART_SYNTHESIZED',
    subjectType: 'SmartCart',
    subjectId: cart.id,
    anonId,
    source: 'web',
    payload: {
      projectId: project.id,
      photoCount: extractions.length,
      photoChangedRecommendation: result.photoChangedRecommendation,
      itemsAdded: result.changeSummary.itemsAdded.length,
      itemsRemoved: result.changeSummary.itemsRemoved.length,
      tierShifts: result.changeSummary.tierShifts.length,
      laneShifts: result.changeSummary.laneShifts.length,
    },
  })

  return NextResponse.json({
    ok: true,
    cartId: cart.id,
    cart: result.withPhotos,
    photoChangedRecommendation: result.photoChangedRecommendation,
    changeSummary: result.changeSummary,
  })
}
