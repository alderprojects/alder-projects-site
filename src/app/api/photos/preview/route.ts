/**
 * v7.3.4-PR2 — Photo preview endpoint.
 *
 * POST /api/photos/preview
 * Body: {} (uses anon cookie for identity)
 *
 * Returns the free preview rendered inside the photo side panel
 * before the paywall. See src/lib/photos/preview.ts for the
 * computation logic.
 *
 * Latency: ~50-100ms typical (one Prisma read + one batched
 * LearningStore lookup, no LLM calls).
 *
 * Cost: ~0 (no Anthropic spend).
 *
 * This endpoint does NOT persist anything. The cart only materializes
 * at Stripe webhook time after successful payment (PR3).
 */

import { NextRequest, NextResponse } from 'next/server'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { computePreview } from '@/lib/photos/preview'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(req: NextRequest): Promise<NextResponse> {
  let anonId: string
  try {
    anonId = await ensureVisitorSession()
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'no_anon_cookie', detail: (e as Error).message },
      { status: 400 }
    )
  }

  const result = await computePreview({ anonId })

  // Server-side telemetry — counts every preview render so the
  // v7.3.4 retro can compute upload->preview->paywall->paid funnel.
  await logEvent({
    eventType: 'PHOTO_PREVIEW_RENDERED',
    subjectType: 'VisitorSession',
    subjectId: anonId,
    anonId,
    source: 'web',
    payload: {
      photoCount: result.photoCount,
      featureCount: result.featureCount,
      overallConfidence: result.overallConfidence,
      paywallAllowed: result.paywallAllowed,
      lowConfidenceReason: result.lowConfidenceReason,
      categoryCount: result.categories.length,
      dominantCategory: result.dominantCategory,
      inferredTopic: result.inferredScope?.topic,
    },
  })

  // Suppress unused-import warning if logEvent gets compiled into a
  // shape that doesn't reference the request. The request object is
  // here for future cookie-only header inspection.
  void req

  return NextResponse.json({ ok: true, ...result })
}
