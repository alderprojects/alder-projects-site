/**
 * v7.3.4-PR3.6 — Project Read (v7.5) waitlist signup.
 *
 * POST /api/v75-signup
 * Body: { email: string, cartId: string }
 *
 * Captures email addresses for the future Project Read product launch.
 * Per the v7.3.4 amendment, this signup is BOTH a measurement device
 * (revealed preference for diagnostic content over commerce content)
 * AND a seed for the eventual v7.5 launch email list.
 *
 * Storage strategy for v0: write a V75_WAITLIST_SIGNUP EventLog row
 * with email + cartId in the payload. No new table — EventLog IS the
 * waitlist. v7.3.5+ may extract to a dedicated table if signup
 * volume or compliance requirements warrant it.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAnonId } from '@/lib/visitor/session'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

const BodySchema = z.object({
  email: z.string().email(),
  cartId: z.string().min(1).max(80),
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
    eventType: 'V75_WAITLIST_SIGNUP',
    subjectType: 'SmartCart',
    subjectId: body.cartId,
    anonId: anonId ?? undefined,
    source: 'web',
    payload: {
      // Email is the entire point of this event; payload retains it
      // for the eventual mailing list export. PII consideration:
      // EventLog rows are not exposed in any public surface; the row
      // is retained on the same retention schedule as other anon
      // events for v0. Compliance review before v7.5 launch.
      email: body.email.toLowerCase().trim(),
      cartId: body.cartId,
    },
  })

  return NextResponse.json({ ok: true })
}
