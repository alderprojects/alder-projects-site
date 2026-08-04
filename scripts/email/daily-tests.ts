/**
 * v7.4.17 — the one-daily-email consolidation.
 *
 * DB-backed: runs against whatever the current database holds, so the
 * assertions are about STRUCTURE and INVARIANTS, not about specific
 * numbers that change daily.
 */
import { buildDailyEmail, buildSeoStats, buildDailyActions } from '@/lib/email/daily'
import type { AutoEvalResult } from '@/lib/score/autoeval'
import { readFileSync, existsSync } from 'fs'
import { runDailySteps, STEP_BUDGET_MS, runnerAlerts } from '@/lib/cron/daily-runner'
import { LOOKAHEAD_MS } from '@/lib/email/daily'
import { SOCIAL_CALENDAR } from '@/lib/social/reminders'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  [PASS] ${name}`) }
  else { fail++; console.log(`  [FAIL] ${name} ${detail}`) }
}

const RUN: AutoEvalResult = {
  day: '2026-08-03', priorsUpdated: 0, sessionsConsidered: 0, judged: 0,
  judgeCacheHits: 0, judgeModelCalls: 0, judgeFlagsCreated: 0, autoRulesCreated: 0,
  autoRulesBlockedByCap: 0, beyondBoundsFindings: [], metricsId: null,
  shadowDrift: { ran: false, medianDrift: null, flagged: false }, errors: [],
}

async function main() {
  console.log('\n=== one email, four lenses ===')
  const email = await buildDailyEmail(RUN, new Date())
  check('email builds', email.sent === true, email.skippedReason ?? '')
  const html = email.html ?? ''
  for (const [name, marker] of [
    ['Today (actions)', '>Today<'],
    ['Exec', '>Exec<'],
    ['CFO', '>CFO<'],
    ['SEO / Marketing', '>SEO / Marketing<'],
    ['Data analyst', '>Data analyst<'],
  ] as const) {
    check(`section present: ${name}`, html.includes(marker))
  }
  check('lens order is Exec → CFO → SEO → Data',
    html.indexOf('>Exec<') < html.indexOf('>CFO<') &&
    html.indexOf('>CFO<') < html.indexOf('>SEO / Marketing<') &&
    html.indexOf('>SEO / Marketing<') < html.indexOf('>Data analyst<'))
  check('actions sit above the lenses', html.indexOf('>Today<') < html.indexOf('>Exec<'))
  check('subject names the day', (email.subject ?? '').includes(RUN.day), email.subject)

  console.log('\n=== honest empty states ===')
  const seo = await buildSeoStats(new Date(Date.now() - 864e5), new Date())
  if (!seo.configured) {
    check('unconfigured SEO explains itself', (seo.reason ?? '').length > 20, String(seo.reason))
    check('unconfigured SEO names the missing config',
      /GSC_SERVICE_ACCOUNT_JSON|No Search Console rows/.test(seo.reason ?? ''), String(seo.reason))
    check('unconfigured SEO renders no fake metrics',
      seo.ctrPct === null && seo.avgPosition === null && seo.topPages.length === 0)
    check('the section says "not reporting", not "0"', html.includes('not reporting'))
  } else {
    check('configured SEO carries real figures', seo.impressions >= 0 && seo.ctrPct != null)
  }
  check('entry-point mix is always available (never gated on GSC)', Array.isArray(seo.sourceMix))

  console.log('\n=== reminders folded in ===')
  const actions = await buildDailyActions(new Date())
  check('actions load', Array.isArray(actions.today) && Array.isArray(actions.overdue))
  const delivered = email.deliveredReminderIds
  check('every surfaced reminder is claimed for marking',
    delivered.length === actions.today.length + actions.overdue.length,
    `${delivered.length} vs ${actions.today.length + actions.overdue.length}`)
  for (const e of [...actions.today, ...actions.overdue]) {
    check(`body rendered verbatim: ${e.entryId}`, html.includes(esc(e.body.slice(0, 60))))
  }
  if (actions.overdue.length > 0) {
    check('overdue is labelled as such', html.includes('OVERDUE'))
    check('overdue raises an alert', email.alerts.some((a) => /overdue/i.test(a)))
  }
  check('each reminder keeps its own clock label',
    [...actions.today, ...actions.overdue].every((e) => html.includes(esc(e.localLabel))))

  console.log('\n=== cron consolidation ===')
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as { crons: Array<{ path: string; schedule: string }> }
  const subDaily = vercel.crons.filter((c) => c.schedule.split(' ')[0].startsWith('*'))
  check('ZERO sub-daily crons — the deploy blocker is gone', subDaily.length === 0,
    subDaily.map((c) => `${c.schedule} ${c.path}`).join(', '))
  check('exactly one email cron', vercel.crons.filter((c) => c.path === '/api/cron/daily').length === 1)
  for (const gone of ['/api/cron/autoeval', '/api/cron/social-reminders', '/api/cron/daily-digest',
                      '/api/cron/catalog-refresh', '/api/cron/catalog-expand', '/api/cron/gsc-sync',
                      '/api/cron/anon-cleanup']) {
    check(`cron entry retired: ${gone}`, !vercel.crons.some((c) => c.path === gone))
  }

  console.log('\n=== one cron, in the inbox before 5am ET ===')
  const cron = vercel.crons
  check('exactly ONE cron entry', cron.length === 1, JSON.stringify(cron))
  check('it is the daily job', cron[0]?.path === '/api/cron/daily')
  const [min, hr] = cron[0].schedule.split(' ')
  const utcMinutes = Number(hr) * 60 + Number(min)
  // EDT is UTC-4, EST is UTC-5. Convert and require both to land before 5am.
  const edt = utcMinutes - 4 * 60
  const est = utcMinutes - 5 * 60
  check('lands before 5am ET in summer (EDT)', edt < 5 * 60 && edt > 0, `${edt / 60}h`)
  check('lands before 5am ET in winter (EST)', est < 5 * 60 && est > 0, `${est / 60}h`)
  check('leaves >=25min headroom for a 300s run before 5am EDT', 5 * 60 - edt >= 25, `${5 * 60 - edt}min`)
  for (const gone of ['catalog-refresh','catalog-expand','gsc-sync','anon-cleanup','autoeval','daily-digest','social-reminders']) {
    check(`route retired: ${gone}`, !existsSync(`src/app/api/cron/${gone}/route.ts`))
  }

  console.log('\n=== the briefing looks FORWARD ===')
  // The send is at 08:30 UTC but most reminders are scheduled for working
  // hours. Selecting only what is already past would deliver same-day
  // reminders a day late — the bug this lookahead exists to prevent.
  check('lookahead is a full day', LOOKAHEAD_MS === 24 * 60 * 60 * 1000)
  const sendHourUtc = Number(cron[0].schedule.split(' ')[1])
  const laterToday = SOCIAL_CALENDAR.filter((e) => {
    const d = new Date(e.sendAtUtc)
    return d.getUTCHours() > sendHourUtc
  })
  check('the calendar does contain reminders due after the send hour',
    laterToday.length > 0, `${laterToday.length}`)
  // Pick a real entry and prove it is surfaced on its own morning.
  const target = SOCIAL_CALENDAR.find((e) => new Date(e.sendAtUtc).getUTCHours() > sendHourUtc)!
  const morningOf = new Date(target.sendAtUtc)
  morningOf.setUTCHours(sendHourUtc, 30, 0, 0)
  const fresh = await buildDailyActions(morningOf)
  check(`same-day reminder surfaces on its own morning (${target.entryId})`,
    fresh.today.some((e) => e.entryId === target.entryId),
    fresh.today.map((e) => e.entryId).join(','))
  check('and is NOT misfiled as overdue',
    !fresh.overdue.some((e) => e.entryId === target.entryId))

  console.log('\n=== budget discipline ===')
  // Simulate a run that has already burned nearly all its budget: every
  // remaining step must be skipped, not attempted, and the email still ships.
  const exhausted = await runDailySteps(new Date(), Date.now() - (STEP_BUDGET_MS - 1000), STEP_BUDGET_MS)
  check('a nearly-spent budget skips every step',
    exhausted.steps.every((s) => s.status !== 'ok'), JSON.stringify(exhausted.steps.map((s) => s.status)))
  check('budget skips are reported, not silent',
    exhausted.steps.some((s) => s.status === 'skipped_budget'))
  check('budget skips surface as alerts', runnerAlerts(exhausted).length > 0)
  check('the email still builds with an exhausted runner',
    (await buildDailyEmail(RUN, new Date(), exhausted)).sent === true)
  const withRunner = await buildDailyEmail(RUN, new Date(), exhausted)
  check('Job run section renders', (withRunner.html ?? '').includes('>Job run<'))
  check('every step is named in the email',
    exhausted.steps.every((s) => (withRunner.html ?? '').includes(s.name)))

  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
  process.exit(fail === 0 ? 0 : 1)
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

main().catch((e) => { console.error(e); process.exit(1) })
