/**
 * v7.4.9 — GET /api/cron/autoeval — the nightly auto-eval job.
 *
 * Takes over the legacy digest's schedule slot (10:00 UTC). Runs the
 * priors refresh, the cached judge pass, metrics, bounded auto-curation,
 * and (Mondays) the shadow re-score — then sends the ONE scoreboard
 * email: weekly rollup on Mondays, daily digest otherwise.
 *
 * maxDuration is the Hobby fluid ceiling: the judge pass is the long
 * pole and it is cache-backed, so steady-state runs are short.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runAutoEval } from '@/lib/score/autoeval'
import { buildDailyScoreboard, buildWeeklyRollup, sendScoreboard } from '@/lib/email/scoreboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest): Promise<Response> {
  // Same auth convention as the other crons.
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
  if (secret && auth !== `Bearer ${secret}` && !isVercelCron) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (process.env.DISABLE_AUTOEVAL_CRON === 'true') {
    return NextResponse.json({ ok: true, skipped: 'DISABLE_AUTOEVAL_CRON' })
  }

  const now = new Date()
  const run = await runAutoEval(now)

  const isMonday = now.getUTCDay() === 1
  const board = isMonday ? await buildWeeklyRollup(run) : await buildDailyScoreboard(run)

  let emailSent = false
  let emailError: string | null = null
  if (board.sent && process.env.DISABLE_AUTOEVAL_EMAIL !== 'true') {
    try {
      emailSent = await sendScoreboard(board)
    } catch (e) {
      emailError = (e as Error).message.slice(0, 200)
    }
  }

  return NextResponse.json({
    ok: true,
    kind: isMonday ? 'weekly' : 'daily',
    ...run,
    emailSent,
    emailSkippedReason: board.sent ? null : board.skippedReason,
    emailError,
    alerts: board.alerts,
  })
}
