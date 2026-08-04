/**
 * v7.4.21 — the Home Record is wired, behind a flag.
 *
 * Asserts the two things that matter on launch night: the flag defaults
 * OFF, and a record failure cannot cost a customer their unlock.
 */
import { readFileSync } from 'fs'

let pass = 0, fail = 0
const check = (n: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  [PASS] ${n}`) } else { fail++; console.log(`  [FAIL] ${n} ${d}`) }
}

const src = readFileSync('src/app/api/report/unlock/route.ts', 'utf8')

console.log('\n=== flag discipline ===')
check('gated on HOME_RECORD_ENABLED', src.includes("process.env.HOME_RECORD_ENABLED === 'true'"))
check('opt-IN, not opt-out (=== true, never !== false)',
  !/HOME_RECORD_ENABLED\s*!==\s*'false'/.test(src))
check('not set locally → path is inert', process.env.HOME_RECORD_ENABLED !== 'true')

console.log('\n=== the unlock must survive a record failure ===')
const block = src.slice(src.indexOf('HOME_RECORD_ENABLED'), src.indexOf('HOME_RECORD_ENABLED') + 900)
check('wrapped in try/catch', /try\s*{/.test(block) && /catch/.test(block))
check('catch does not rethrow', !/catch[\s\S]{0,200}throw/.test(block))
check('failure is logged, not swallowed silently', /console\.error/.test(block))
check('record work happens AFTER the report is persisted',
  src.indexOf('emailCapturedAt') < src.indexOf('HOME_RECORD_ENABLED'))
// The customer is waiting on the recommendations and the email. Slot
// filling reads every photo + extraction for the report, so it must not
// sit in front of either.
check('record work runs AFTER the report email is sent',
  src.indexOf('renderReportEmail') < src.indexOf('HOME_RECORD_ENABLED'))
check('record work runs AFTER the EMAIL_CAPTURED event',
  src.indexOf('EMAIL_CAPTURED') < src.indexOf('HOME_RECORD_ENABLED'))

console.log('\n=== it calls the tested service, not a reimplementation ===')
check('uses attachReportToRecord', src.includes('attachReportToRecord'))
check('uses fillSlotsForReport', src.includes('fillSlotsForReport'))
check('imported lazily so the flag-off path loads nothing', /await import\('@\/lib\/coverage\/record'\)/.test(src))

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
