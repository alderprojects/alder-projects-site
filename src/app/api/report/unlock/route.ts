/**
 * v7.4.2f — POST /api/report/unlock
 *
 * The email gate, account-free (rewritten after live testing caught
 * the old version sending a SIGN-IN magic link that dead-ended on a
 * placeholder page — wrong product: there are no accounts here).
 *
 * What happens now:
 *   1. Unlock is immediate in-session (response carries email-tier recs).
 *   2. The FULL report is emailed inline, plus a capability link
 *      (/report/[id]?key=...) that opens the report on any device.
 *   3. The anonymous→user merge still runs silently (User row, session
 *      claim, consent reassignment) so drip + analytics have identity —
 *      but the visitor never sees a login of any kind.
 *
 * Body: { reportId, email, key? } — key allows unlocking from an
 * email-link session on another device.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAnonId } from '@/lib/visitor/session'
import { sendEmail } from '@/lib/email/send'
import { logEvent } from '@/lib/events/log'
import { authorizeReport, newAccessKey } from '@/lib/recommend/access'
import { shapeRows } from '@/lib/recommend/wire'
import { renderReportEmail } from '@/lib/recommend/report-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 15

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alderprojects.com'

const BodySchema = z.object({
  reportId: z.string().min(1),
  email: z.string().email().max(254),
  key: z.string().max(64).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const anonId = await getAnonId()
  const auth = await authorizeReport({ reportId: body.reportId, anonId, key: body.key ?? null })
  if (!auth) return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  const report = auth.report

  const email = body.email.trim().toLowerCase()

  // 1. Silent identity merge (no login anywhere).
  const user = await prisma.user.upsert({ where: { email }, create: { email }, update: {} })
  if (report.visitorAnonId) {
    await prisma.visitorSession.updateMany({
      where: { anonId: report.visitorAnonId, claimedByUserId: null },
      data: { claimedByUserId: user.id, claimedAt: new Date() },
    })
    await prisma.consent.updateMany({
      where: { anonId: report.visitorAnonId, userId: null },
      data: { userId: user.id },
    })
  }

  // 2. Ensure a capability key exists (legacy reports predate the column).
  let accessKey = report.accessKey
  if (!accessKey) {
    accessKey = newAccessKey()
    await prisma.report.update({ where: { id: report.id }, data: { accessKey } })
  }
  await prisma.report.update({
    where: { id: report.id },
    data: { userId: user.id, emailCapturedAt: report.emailCapturedAt ?? new Date() },
  })

  // 3. Email the FULL report + the any-device link. Send failure doesn't
  //    block the in-session unlock (the response below carries the recs).
  const reportUrl = `${BASE_URL}/report/${report.id}?key=${encodeURIComponent(accessKey)}`
  const sent = await sendEmail({
    to: email,
    subject: 'Your Alder Check — the full Buy / Skip / Wait plan',
    html: renderReportEmail(report.recommendations, reportUrl),
  })
  if (!sent.ok) console.error('[report/unlock] report email failed:', sent.reason)

  await logEvent({
    eventType: 'EMAIL_CAPTURED',
    subjectType: 'Report',
    subjectId: report.id,
    anonId: report.visitorAnonId,
    actorId: user.id,
    source: 'web',
    payload: { reportId: report.id, emailSent: sent.ok },
  })

  // v7.4.21 — email capture is create-or-attach for the Home Record.
  //
  // Placed AFTER the email send and the EMAIL_CAPTURED event on purpose:
  // fillSlotsForReport reads every photo and extraction for the report and
  // writes slot rows, and none of that should sit in front of the thing
  // the customer is actually waiting for.
  //
  // Behind HOME_RECORD_ENABLED and OFF by default: this is the first code
  // that touches the live unlock path since the record shipped, and it is
  // landing the night before a launch post. With the flag off the path is
  // byte-identical to what runs today.
  //
  // Wrapped so a record failure can NEVER cost the customer their unlock —
  // they came here for the recommendations, not the coverage map.
  if (process.env.HOME_RECORD_ENABLED === 'true') {
    try {
      const { attachReportToRecord, fillSlotsForReport } = await import('@/lib/coverage/record')
      const { recordId } = await attachReportToRecord(report.id, email, {
        userId: user.id,
        source: 'capture',
      })
      await fillSlotsForReport(report.id, recordId)
    } catch (e) {
      console.error('[report/unlock] home record attach failed (non-fatal):', (e as Error).message)
    }
  }

  const { visible } = shapeRows(report.recommendations, 'email')
  return NextResponse.json({ ok: true, tier: 'email', emailSent: sent.ok, recommendations: visible })
}
