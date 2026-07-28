/**
 * v7.4.11 — POST /api/admin/autoeval/run
 *
 * Run the auto-eval job and send the daily report on demand, from an
 * admin session. Same code path as the 5am cron — this is not a second
 * implementation, just a second trigger.
 *
 * Auth is the admin allowlist (magic link + ADMIN_EMAILS), deliberately
 * NOT the cron secret: a human triggering a report is an admin action,
 * and the cron route stays Bearer-only with no fallback.
 *
 * Body (optional): {"dryRun": true} builds the report and returns the
 * stats without sending.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runAutoEval } from '@/lib/score/autoeval'
import { buildDailyScoreboard, buildWeeklyRollup, sendScoreboard } from '@/lib/email/scoreboard'
import { checkAdmin, logAdminAccess } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: NextRequest): Promise<NextResponse> {
  const check = await checkAdmin()
  if (check.status === 'unauthenticated') {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (check.status === 'forbidden') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  let body: { dryRun?: boolean; kind?: 'daily' | 'weekly' } = {}
  try {
    body = await req.json()
  } catch {
    /* empty body is fine */
  }

  const now = new Date()
  const run = await runAutoEval(now)
  const kind = body.kind ?? (now.getUTCDay() === 1 ? 'weekly' : 'daily')
  const board = kind === 'weekly' ? await buildWeeklyRollup(run) : await buildDailyScoreboard(run)

  let emailSent = false
  let emailError: string | null = null
  if (board.sent && !body.dryRun) {
    try {
      emailSent = await sendScoreboard(board)
    } catch (e) {
      emailError = (e as Error).message.slice(0, 200)
    }
  }

  await logAdminAccess(check.user.email, 'SESSION_VIEWED', `autoeval:${kind}`)

  return NextResponse.json({
    ok: true,
    triggeredBy: check.user.email,
    kind,
    dryRun: !!body.dryRun,
    ...run,
    emailSent,
    emailSkippedReason: board.sent ? null : board.skippedReason,
    emailError,
    alerts: board.alerts,
  })
}
