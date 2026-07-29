/**
 * v7.4.15 — GET /api/cron/social-reminders
 *
 * Every 15 minutes: send any reminder whose sendAtUtc has passed and that
 * has not already been sent, then record it. Idempotency is the EventLog
 * row (SOCIAL_REMINDER_SENT + entryId) — no new table.
 *
 * Reminders only. This route never posts anywhere; it emails copy for a
 * human to paste.
 *
 * Auth: Bearer CRON_SECRET, matching every other cron route. No user-agent
 * fallback (spoofable), and deliberately no admin-session fallback — this
 * is a machine trigger.
 *
 * `?dryRun=1` returns what WOULD be sent without sending or logging.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logEvent } from '@/lib/events/log'
import {
  selectDue,
  subjectFor,
  bodyFor,
  missedDigest,
  nearEmptyWarning,
  SOCIAL_REMINDER_SENT,
  type SocialEntry,
} from '@/lib/social/reminders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Plain-text send. The body is paste-ready copy; styling would be noise. */
async function sendPlain(subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')
  const env = process.env.VERCEL_ENV === 'production' ? '' : '[STAGING] '
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL || 'Alder Read <alerts@alderprojects.com>',
      to: [process.env.ALERT_EMAIL || 'hello@alderprojects.com'],
      subject: `${env}${subject}`,
      text,
    }),
  })
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 200)}`)
  }
}

async function markSent(entry: SocialEntry, missed: boolean): Promise<void> {
  await logEvent({
    eventType: SOCIAL_REMINDER_SENT,
    subjectType: 'SocialReminder',
    subjectId: entry.entryId,
    payload: { entryId: entry.entryId, sendAtUtc: entry.sendAtUtc, source: entry.source, missed },
    source: 'cron',
  })
}

export async function GET(request: NextRequest): Promise<Response> {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1'
  const now = new Date()

  // The idempotency read. Scoped to this event type; subjectId is the
  // entryId, so a resent entry is impossible without deleting the row.
  const sentRows = await prisma.eventLog.findMany({
    where: { eventType: SOCIAL_REMINDER_SENT },
    select: { subjectId: true },
  })
  const alreadySent = new Set(sentRows.map((r) => r.subjectId).filter((v): v is string => v != null))

  const { due, missed, future } = selectDue(now, alreadySent)

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      now: now.toISOString(),
      alreadySentCount: alreadySent.size,
      due: due.map((e) => ({ entryId: e.entryId, subject: subjectFor(e), localLabel: e.localLabel })),
      missed: missed.map((e) => ({ entryId: e.entryId, localLabel: e.localLabel })),
      futureCount: future.length,
      nearEmptyWarning: nearEmptyWarning(now),
    })
  }

  const sent: string[] = []
  const errors: Array<{ entryId: string; error: string }> = []

  // Missed entries collapse into ONE digest, then all get marked — so a
  // cron that was paused for a week resumes without flooding the inbox.
  if (missed.length > 0) {
    try {
      const digest = missedDigest(missed)
      await sendPlain(digest.subject, digest.body)
      for (const entry of missed) {
        await markSent(entry, true)
        sent.push(entry.entryId)
      }
    } catch (e) {
      errors.push({ entryId: '(missed-digest)', error: (e as Error).message.slice(0, 200) })
    }
  }

  // Due entries send individually, verbatim.
  for (const entry of due) {
    try {
      await sendPlain(subjectFor(entry), bodyFor(entry))
      // Marked only after a confirmed send, so a Resend failure retries on
      // the next run rather than silently swallowing the reminder.
      await markSent(entry, false)
      sent.push(entry.entryId)
    } catch (e) {
      errors.push({ entryId: entry.entryId, error: (e as Error).message.slice(0, 200) })
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    now: now.toISOString(),
    sentCount: sent.length,
    sent,
    missedCount: missed.length,
    futureCount: future.length,
    nearEmptyWarning: nearEmptyWarning(now),
    errors,
  })
}
