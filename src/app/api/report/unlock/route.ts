/**
 * v7.4.2 — POST /api/report/unlock
 *
 * The email gate: recommendations 3+ unlock with an email address.
 * Performs the anonymous→user merge (the piece v7.3.3-C schema'd but
 * never wired): find-or-create User, claim the VisitorSession, reassign
 * anon Consent rows, stamp the report, and send a magic link so the
 * visitor can reach the report from email later. The report unlocks
 * immediately in-session — the magic link is access, not a gate.
 *
 * Body: { reportId, email }
 * Returns the email-tier recommendations so the client can render the
 * unlocked report without a second fetch.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { requestMagicLink } from '@/lib/auth/magic-link'
import { logEvent } from '@/lib/events/log'
import { shapeRows } from '@/lib/recommend/wire'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 15

const BodySchema = z.object({
  reportId: z.string().min(1),
  email: z.string().email().max(254),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  let anonId: string
  try {
    anonId = await ensureVisitorSession({ firstSource: 'report_unlock' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({
    where: { id: body.reportId },
    include: { recommendations: true },
  })
  if (!report || report.deletedAt) {
    return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  }
  if (report.visitorAnonId !== anonId && report.userId === null) {
    return NextResponse.json({ ok: false, error: 'not_your_report' }, { status: 403 })
  }

  const email = body.email.trim().toLowerCase()

  // 1. Find-or-create the user.
  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
  })

  // 2. Claim the visitor session (anonymous → user merge).
  await prisma.visitorSession.updateMany({
    where: { anonId, claimedByUserId: null },
    data: { claimedByUserId: user.id, claimedAt: new Date() },
  })

  // 3. Reassign anon consent rows to the user (keep anonId for audit).
  await prisma.consent.updateMany({
    where: { anonId, userId: null },
    data: { userId: user.id },
  })

  // 4. Stamp the report.
  await prisma.report.update({
    where: { id: report.id },
    data: { userId: user.id, emailCapturedAt: report.emailCapturedAt ?? new Date() },
  })

  // 5. Send the magic link (fire-and-forget semantics — send failure
  //    must not block the unlock; the report is already unlocked
  //    in-session and the drip re-engages).
  try {
    await requestMagicLink(email)
  } catch (e) {
    console.error('[report/unlock] magic link send failed:', (e as Error).message)
  }

  await logEvent({
    eventType: 'EMAIL_CAPTURED',
    subjectType: 'Report',
    subjectId: report.id,
    anonId,
    actorId: user.id,
    source: 'web',
    payload: { reportId: report.id },
  })

  const { visible } = shapeRows(report.recommendations, 'email')
  return NextResponse.json({ ok: true, tier: 'email', recommendations: visible })
}
