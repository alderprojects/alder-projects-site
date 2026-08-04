/**
 * v7.4.20 — redact, don't block.
 *
 * The invariant: a privacy detection costs OBSERVATIONS, never the read.
 */
import { exclusionLine } from '@/lib/recommend/gate'

let pass = 0, fail = 0
const check = (n: string, c: boolean, d = '') => {
  if (c) { pass++; console.log(`  [PASS] ${n}`) } else { fail++; console.log(`  [FAIL] ${n} ${d}`) }
}

console.log('\n=== user-facing copy no longer claims the photo was dropped ===')
{
  const line = exclusionLine({
    features: [], includedPhotoCount: 1, excludedPhotoCount: 1,
    exclusionSummary: [{ photoId: 'p1', reason: 'person_detected' }], softPersonPhotoIds: ['p1'],
  } as never)
  check('a line is produced', line != null)
  check('does NOT say "not analyzed"', !/not analyzed/i.test(line ?? ''), String(line))
  check('says we read the rest', /read the rest/i.test(line ?? ''), String(line))
  check('names what it saw', /person/i.test(line ?? ''), String(line))
  check('silent when nothing was detected',
    exclusionLine({ features: [], includedPhotoCount: 1, excludedPhotoCount: 0, exclusionSummary: [], softPersonPhotoIds: [] } as never) === null)
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
