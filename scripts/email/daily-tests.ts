/**
 * v7.4.17 — the one-daily-email consolidation.
 *
 * DB-backed: runs against whatever the current database holds, so the
 * assertions are about STRUCTURE and INVARIANTS, not about specific
 * numbers that change daily.
 */
import { buildDailyEmail, buildSeoStats, buildDailyActions } from '@/lib/email/daily'
import type { AutoEvalResult } from '@/lib/score/autoeval'
import { readFileSync } from 'fs'

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
  for (const gone of ['/api/cron/autoeval', '/api/cron/social-reminders', '/api/cron/daily-digest']) {
    check(`retired: ${gone}`, !vercel.crons.some((c) => c.path === gone))
  }
  check('worker crons survive',
    ['/api/cron/catalog-refresh', '/api/cron/catalog-expand', '/api/cron/gsc-sync', '/api/cron/anon-cleanup']
      .every((p) => vercel.crons.some((c) => c.path === p)))

  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
  process.exit(fail === 0 ? 0 : 1)
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

main().catch((e) => { console.error(e); process.exit(1) })
