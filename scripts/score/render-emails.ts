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

  // Zero-activity assertion. The guard reads the DB for the day window,
  // so simulate a genuinely empty day (a window far in the past with no
  // data) rather than mutating the run object.
  const { buildLayeredStats } = await import('@/lib/email/layers')
  const emptyFrom = new Date('2020-01-01T00:00:00Z')
  const emptyTo = new Date('2020-01-02T00:00:00Z')
  const empty = await buildLayeredStats(emptyFrom, emptyTo)
  const wouldSend =
    empty.exec.sessions > 0 || empty.backend.photosUploaded > 0 || empty.backend.judgeFlags > 0 || empty.backend.autoRules > 0
  console.log('ZERO-ACTIVITY: wouldSend=' + wouldSend + ' (must be false) — sessions=' +
    empty.exec.sessions + ' photos=' + empty.backend.photosUploaded + ' flags=' + empty.backend.judgeFlags + ' rules=' + empty.backend.autoRules)

  await p.$disconnect()
}
main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1) })
