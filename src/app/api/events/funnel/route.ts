/**
 * v7.3.4-PR2 — Generic client-fired funnel event logger.
 *
 * POST /api/events/funnel
 * Body: { eventType: <allowlisted>, payload?: Record<string, unknown> }
 *
 * Lets client components emit EventLog rows without exposing the full
 * logEvent contract (which can write arbitrary subjectType/subjectId
 * pairs and would be abuse-prone if exposed directly).
 *
 * Allowlisted events are the v7.3.4 photo funnel transitions per the
 * strategy doc section 7. Server-side events (CART_REACTION,
 * VISION_EXTRACTION_*, PHOTO_PREVIEW_RENDERED, etc.) continue to be
 * written directly by their owning route — they don't need this
 * endpoint.
 *
 * Auth: anonymous (anon cookie). No auth check beyond cookie presence
 * so visitors who don't have a session yet don't break the funnel
 * (we just attribute the event with anonId: null).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAnonId } from '@/lib/visitor/session'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

const FUNNEL_EVENT_ALLOWLIST = [
  // PR2 photo-funnel transitions
  'PHOTO_PANEL_OPENED',
  'PHOTO_UPLOAD_STARTED',
  'PHOTO_PREVIEW_CONFIRMED_READ',
  'PHOTO_PREVIEW_REJECTED_READ',
  'PHOTO_PAYWALL_CLICKED',
  // PR3.6 commerce-moment instrumentation (drives v7.5 product-tier
  // decision per amendment Change 3). RESULT_VIEW_SECONDS fires via
  // navigator.sendBeacon on page unload; RESULT_SECTION_ENGAGEMENT
  // fires on first scroll-into-view per section + reaction/affiliate/
  // signup clicks.
  'RESULT_VIEW_SECONDS',
  'RESULT_SECTION_ENGAGEMENT',
  // PR3.7 §1.12 — captures the user's category pick when the result
  // page renders the §1.2 clarification surface. Lets the retro
  // distinguish "we guessed right" from "user told us the answer."
  'CATEGORY_CLARIFICATION_SUBMITTED',
] as const

const FunnelEventEnum = z.enum(FUNNEL_EVENT_ALLOWLIST)

const BodySchema = z.object({
  eventType: FunnelEventEnum,
  payload: z.record(z.string(), z.unknown()).optional(),
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

  const anonId = await getAnonId()

  await logEvent({
    eventType: body.eventType,
    subjectType: 'VisitorSession',
    subjectId: anonId ?? 'unknown',
    anonId: anonId ?? undefined,
    source: 'web',
    payload: body.payload ?? {},
  })

  return NextResponse.json({ ok: true })
}
