/**
 * v7.4.17 — GET /api/cron/daily — the ONE daily job.
 *
 * Runs the auto-eval work, then sends the single four-lens email
 * (Exec / CFO / SEO-Marketing / Data analyst) with today's actions on top.
 *
 * Replaces three cron entries:
 *   /api/cron/autoeval          — the job still runs, here
 *   /api/cron/daily-digest      — already flag-disabled, sections absorbed
 *   /api/cron/social-reminders  — the `*\/15` schedule this plan rejects
 *
 * Reminders are marked sent only AFTER the email is accepted by Resend, so
 * a send failure retries tomorrow rather than silently swallowing the day's
 * actions. The trade is that a failed send re-delivers, which is the safe
 * direction for a reminder.
 *
 * Auth: Bearer CRON_SECRET, matching every other cron route.
 * `?dryRun=1` builds and returns the email without sending or marking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runAutoEval } from '@/lib/score/autoeval'
import { buildDailyEmail } from '@/lib/email/daily'
import { logEvent } from '@/lib/events/log'
import { SOCIAL_REMINDER_SENT } from '@/lib/social/reminders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function send(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')
  const env = process.env.VERCEL_ENV === 'production' ? '' : '[STAGING] '
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL || 'Alder Read <alerts@alderprojects.com>',
      to: [process.env.ALERT_EMAIL || 'hello@alderprojects.com'],
      subject: `${env}${subject}`,
      html,
    }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

export async function GET(request: NextRequest): Promise<Response> {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1'
  const now = new Date()

  const run = await runAutoEval(now)
  const email = await buildDailyEmail(run, now)

  if (!email.sent) {
    return NextResponse.json({ ok: true, sent: false, skippedReason: email.skippedReason, ...run })
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      subject: email.subject,
      alerts: email.alerts,
      remindersWouldDeliver: email.deliveredReminderIds,
      htmlBytes: email.html?.length ?? 0,
    })
  }

  let emailSent = false
  let emailError: string | null = null
  if (process.env.DISABLE_DAILY_EMAIL !== 'true') {
    try {
      await send(email.subject!, email.html!)
      emailSent = true
    } catch (e) {
      emailError = (e as Error).message.slice(0, 200)
    }
  }

  // Only mark reminders delivered once the email actually went out.
  if (emailSent) {
    for (const entryId of email.deliveredReminderIds) {
      await logEvent({
        eventType: SOCIAL_REMINDER_SENT,
        subjectType: 'SocialReminder',
        subjectId: entryId,
        payload: { entryId, deliveredVia: 'daily-email' },
        source: 'cron',
      })
    }
  }

  return NextResponse.json({
    ok: emailError == null,
    sent: emailSent,
    subject: email.subject,
    alerts: email.alerts,
    remindersDelivered: emailSent ? email.deliveredReminderIds.length : 0,
    emailError,
    ...run,
  })
}
