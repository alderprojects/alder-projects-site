/**
 * v7.4.2 — Resend drip for captured-but-unconverted report emails.
 *
 * Runs from the existing daily cron (no new cron slot on Hobby).
 * Day-1 and day-4 follow-ups to users who unlocked a report by email
 * but haven't bought the cart. Zero-BUY reports get the save/re-check
 * framing (never a cart offer — nudge rule); ≥1-BUY reports get the
 * computed-fact cart nudge.
 *
 * Dedup: a DRIP_SENT EventLog row per (report, day) — append-only,
 * queried before sending.
 */

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { logEvent } from '@/lib/events/log'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alderprojects.com'

export interface DripResult {
  scanned: number
  sent: number
  skipped: number
  errors: number
}

export async function runReportDrip(now = new Date()): Promise<DripResult> {
  const result: DripResult = { scanned: 0, sent: 0, skipped: 0, errors: 0 }

  // Candidates: email captured, cart not built, created 1–5 days ago.
  const windowStart = new Date(now.getTime() - 5 * 24 * 3600 * 1000)
  const reports = await prisma.report.findMany({
    where: {
      emailCapturedAt: { not: null },
      status: { not: 'CART_BUILT' },
      deletedAt: null,
      createdAt: { gte: windowStart },
      userId: { not: null },
    },
    include: {
      recommendations: { where: { verdict: 'BUY' }, select: { id: true, title: true } },
    },
  })

  for (const report of reports) {
    result.scanned++
    const ageDays = (now.getTime() - report.createdAt.getTime()) / (24 * 3600 * 1000)
    const day = ageDays >= 4 ? 4 : ageDays >= 1 ? 1 : 0
    if (day === 0) {
      result.skipped++
      continue
    }

    const alreadySent = await prisma.eventLog.findFirst({
      where: {
        eventType: 'DRIP_SENT',
        subjectType: 'Report',
        subjectId: report.id,
        payloadJson: { path: ['day'], equals: day },
      },
    })
    if (alreadySent) {
      result.skipped++
      continue
    }

    const user = await prisma.user.findUnique({ where: { id: report.userId as string } })
    if (!user) {
      result.skipped++
      continue
    }

    const buyCount = report.recommendations.length
    const subject =
      buyCount > 0
        ? day === 1
          ? `Your Alder Check found ${buyCount} thing${buyCount === 1 ? '' : 's'} worth buying`
          : 'Still deciding? Your Smart Cart is already built'
        : day === 1
          ? 'Your Alder Check: nothing worth buying right now — and that’s the point'
          : 'Worth a re-check when something changes'

    const cartUrl = `${BASE_URL}/report/${report.id}/cart`
    const html =
      buyCount > 0
        ? `<div style="font-family:Georgia,serif;max-width:560px;color:#22301f">
            <p>Your Alder Check found <strong>${buyCount}</strong> thing${buyCount === 1 ? '' : 's'} worth buying:</p>
            <ul>${report.recommendations.map((r) => `<li>${escapeHtml(r.title)}</li>`).join('')}</ul>
            <p>The Smart Cart turns ${buyCount === 1 ? 'it' : 'them'} into the exact products and specs — the matching already ran when your Check did.</p>
            <p><a href="${cartUrl}" style="color:#1f3d2b;font-weight:700">Get my Smart Cart — $19.99 →</a></p>
            <p style="font-size:12px;color:#888">You're getting this because you unlocked an Alder Check report with this email. No more than two of these, ever.</p>
          </div>`
        : `<div style="font-family:Georgia,serif;max-width:560px;color:#22301f">
            <p>Your Alder Check came back with no Buy verdicts — the honest read was wait and skip. That answer is the product working.</p>
            <p>Seasons change the math (heating season, rebate cycles, wet springs). Take new photos any time for a fresh Check — it's free.</p>
            <p><a href="${BASE_URL}/" style="color:#1f3d2b;font-weight:700">Run a fresh Check →</a></p>
            <p style="font-size:12px;color:#888">You're getting this because you unlocked an Alder Check report with this email. No more than two of these, ever.</p>
          </div>`

    const sent = await sendEmail({ to: user.email, subject, html })
    if (sent.ok) {
      result.sent++
      await logEvent({
        eventType: 'DRIP_SENT',
        subjectType: 'Report',
        subjectId: report.id,
        actorId: user.id,
        source: 'cron',
        payload: { day, buyCount },
      })
    } else {
      result.errors++
    }
  }

  return result
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
