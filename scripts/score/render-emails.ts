/** Render the daily + weekly scoreboards to HTML files for visual verification. */
import { writeFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'
import { runAutoEval } from '@/lib/score/autoeval'
import { buildDailyScoreboard, buildWeeklyRollup } from '@/lib/email/scoreboard'

const p = new PrismaClient()
const OUT = process.env.OUT_DIR || '/tmp'

async function main() {
  const run = await runAutoEval(new Date())

  const daily = await buildDailyScoreboard(run)
  if (daily.html) {
    writeFileSync(`${OUT}/daily-scoreboard.html`, daily.html)
    console.log('DAILY:  sent=' + daily.sent + ' subject="' + daily.subject + '" alerts=' + daily.alerts.length)
  } else {
    console.log('DAILY:  skipped — ' + daily.skippedReason)
  }

  const weekly = await buildWeeklyRollup(run)
  if (weekly.html) {
    writeFileSync(`${OUT}/weekly-rollup.html`, weekly.html)
    console.log('WEEKLY: sent=' + weekly.sent + ' subject="' + weekly.subject + '" alerts=' + weekly.alerts.length)
  }

  // Zero-activity assertion: a run with no sessions/flags/rules sends nothing.
  const quiet = await buildDailyScoreboard({
    ...run, metricsId: null, judgeFlagsCreated: 0, autoRulesCreated: 0,
  })
  console.log('ZERO-ACTIVITY: sent=' + quiet.sent + ' (must be false) reason="' + quiet.skippedReason + '"')

  await p.$disconnect()
}
main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1) })
