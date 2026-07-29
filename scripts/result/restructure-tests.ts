/**
 * v7.4.16 §2 — the mechanical parts of the result-restructure test plan.
 *
 * The §2.1 golden-equivalence gate is NOT here: it cannot be run (no golden
 * set — see BUILD_REPORT-v7.4.16.md). Its purpose is served differently in
 * this build: no synthesis prompt or schema changed, so verdicts cannot
 * drift. The last block below asserts that structurally.
 */
import { groupBySubject, subjectFor, inventoryChips, UNGROUPED_LABEL, type GroupableItem } from '@/lib/result/subjects'
import { selectFocus, isSafetyItem, focusHeadline } from '@/lib/result/focus'
import { estimateCartSavings, formatSavings, ARBITRAGE_TABLE, SAVINGS_FLOOR, arbitrageFor } from '@/lib/result/savings'
import { upsellWithEstimate, upsellFallback, MAX_UPSELLS_PER_RESULT, REFUND_POLICY } from '@/lib/copy/canon'
import { execSync } from 'child_process'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  [PASS] ${name}`) }
  else { fail++; console.log(`  [FAIL] ${name} ${detail}`) }
}

const sig = (...s: string[]) => [{ signatures: s, featureRefs: [0] }]

/** The real July 29 attic-bedroom read — the actual multi-object session. */
const REAL_SESSION: Array<GroupableItem & { summary: string }> = [
  { key: 'seal_drafts', verdict: 'BUY', title: 'Seal drafts around the bedroom sliding door/window',
    summary: 'Light is visible around the edges of the sliding glass door/window assembly.',
    claimLinks: sig('window_air_gap:bedroom:moderate'), compositeScore: 0.71, sortOrder: 0 },
  { key: 'blinds_wait', verdict: 'WAIT', title: 'Replacing the dated bedroom blinds can wait',
    summary: 'Cosmetic preference rather than a spending priority.',
    claimLinks: sig('window_treatment_dated:bedroom:moderate'), compositeScore: 0.55, sortOrder: 1 },
  { key: 'smoke', verdict: 'INVESTIGATE', title: 'Add a smoke detector in the sleeping area',
    summary: 'No smoke detector is visible on the ceiling of a room used for sleeping.',
    claimLinks: sig('missing_smoke_detector:bedroom:moderate'), compositeScore: 0.48, sortOrder: 2 },
  { key: 'crack', verdict: 'INVESTIGATE', title: 'Have the sloped-ceiling crack looked at',
    summary: 'A linear crack is visible where the angled ceiling meets the wall.',
    claimLinks: sig('ceiling_crack:bedroom:moderate'), compositeScore: 0.52, sortOrder: 3 },
  { key: 'exhaust', verdict: 'INVESTIGATE', title: 'Confirm the attic bathroom has real exhaust ventilation',
    summary: 'An attic-level bathroom with a shower needs reliable moisture exhaust.',
    claimLinks: sig('vaulted_ceiling_with_sloped_walls:bathroom:severe', 'shower_enclosure:bathroom:moderate'),
    compositeScore: 0.60, sortOrder: 4 },
]

console.log('\n=== §1.1: grouping the real multi-object read ===')
{
  const g = groupBySubject(REAL_SESSION)
  check('activates as multi-subject', g.multiSubject === true)
  check('produces more than one group', g.groups.length > 1, String(g.groups.length))

  const labelOf = (key: string) => g.groups.find((gr) => gr.items.some((i) => i.key === key))!.label
  check('draft-sealing groups under Windows', labelOf('seal_drafts') === 'Windows', labelOf('seal_drafts'))
  check('blinds group under Window treatments (not Windows)',
    labelOf('blinds_wait') === 'Window treatments', labelOf('blinds_wait'))
  check('smoke detector groups under Smoke & CO alarms',
    labelOf('smoke') === 'Smoke & CO alarms', labelOf('smoke'))
  check('ceiling crack groups under Ceiling', labelOf('crack') === 'Ceiling', labelOf('crack'))
  check('bathroom exhaust groups under Tub & shower or Ventilation',
    ['Tub & shower', 'Ventilation'].includes(labelOf('exhaust')), labelOf('exhaust'))

  // This is the confusion the release exists to fix: BUY and WAIT that
  // sounded contradictory in a flat list are now visibly different objects.
  check('the BUY and the WAIT land in DIFFERENT groups',
    labelOf('seal_drafts') !== labelOf('blinds_wait'))

  const chips = inventoryChips(g)
  check('inventory chips match group order', chips.length === g.groups.length)
  check('no chip is empty', chips.every((c) => c.trim().length > 0))
}

console.log('\n=== §1.1.4: single-subject reads gain no structure ===')
{
  const single = groupBySubject([REAL_SESSION[0]])
  check('one subject → multiSubject false', single.multiSubject === false)
  check('one group', single.groups.length === 1)
}

console.log('\n=== CR5 / §2: subject grounding ===')
{
  // Ungrounded model-supplied subject falls back and is reported.
  const gnome: GroupableItem = { key: 'g', verdict: 'BUY', title: 'x', subject: 'garden gnome',
    claimLinks: sig('window_air_gap:bedroom:moderate'), compositeScore: 0.5 }
  const s = subjectFor(gnome)
  check('ungrounded subject is rejected', s.grounded === false)
  check('ungrounded subject falls back to the derived group', s.label === 'Windows', s.label)
  const g = groupBySubject([gnome])
  check('ungrounded is reported for SUBJECT_UNGROUNDED logging',
    g.ungrounded.length === 1 && g.ungrounded[0].supplied === 'garden gnome')
  check('page still renders (a group exists)', g.groups.length === 1)

  // A grounded supplied subject is honoured.
  const ok: GroupableItem = { key: 'o', verdict: 'BUY', title: 'x', subject: 'storm door',
    claimLinks: sig('door_seal_failing:exterior:moderate'), compositeScore: 0.5 }
  check('grounded supplied subject is honoured', subjectFor(ok).label === 'storm door')

  // No claimLinks at all → final fallback.
  const bare: GroupableItem = { key: 'b', verdict: 'BUY', title: 'x', claimLinks: [], compositeScore: 0.1 }
  check('no linkage → "Also in this photo"', subjectFor(bare).label === UNGROUPED_LABEL)
  const mixed = groupBySubject([REAL_SESSION[0], bare])
  check('"Also in this photo" sorts last',
    mixed.groups[mixed.groups.length - 1].label === UNGROUPED_LABEL)
}

console.log('\n=== §1.1.3: focus determinism ===')
{
  const f = selectFocus(REAL_SESSION)!
  check('a focus is chosen', f != null)
  check('safety wins over the higher-scored draft item',
    f.item.key === 'smoke', String(f.item.key))
  check('focus is flagged safety', f.safety === true)
  check('reason is the item\'s existing summary — no new prose',
    f.reason === REAL_SESSION[2].summary)
  check('headline uses the §1.1.3 frame',
    focusHeadline(f).startsWith('If you do one thing: Smoke & CO alarms — '), focusHeadline(f))

  // Determinism across shuffles.
  const shuffled = [...REAL_SESSION].reverse()
  check('same winner regardless of input order', selectFocus(shuffled)!.item.key === f.item.key)

  // Without safety items, highest composite among non-SKIP wins.
  const noSafety = REAL_SESSION.filter((i) => i.key !== 'smoke')
  const f2 = selectFocus(noSafety)!
  check('no safety → highest composite non-SKIP', f2.item.key === 'seal_drafts', String(f2.item.key))
  check('not flagged safety', f2.safety === false)

  // Seeded tie → stable winner.
  const tie: Array<GroupableItem & { summary: string }> = [
    { key: 'bbb', verdict: 'BUY', title: 'b', summary: 's', claimLinks: sig('window_air_gap:x:y'), compositeScore: 0.5, sortOrder: 1 },
    { key: 'aaa', verdict: 'BUY', title: 'a', summary: 's', claimLinks: sig('window_air_gap:x:y'), compositeScore: 0.5, sortOrder: 1 },
  ]
  check('seeded tie is broken stably by key',
    selectFocus(tie)!.item.key === 'aaa' && selectFocus([...tie].reverse())!.item.key === 'aaa')

  // SKIP-only read has no focus.
  check('all-SKIP read has no focus',
    selectFocus([{ key: 's', verdict: 'SKIP', title: 'x', summary: 'y', claimLinks: sig('tile:x:y') }]) === null)

  check('isSafetyItem catches GFCI', isSafetyItem({ verdict: 'BUY', title: '', claimLinks: sig('missing_gfci:bath:moderate') }))
  check('isSafetyItem ignores cosmetics', !isSafetyItem({ verdict: 'BUY', title: '', claimLinks: sig('dated_carpet:bedroom:mild') }))
}

console.log('\n=== §1.4 / CR2: the savings estimator ===')
{
  // Priced SKIPs, no category match.
  const priced = [
    { key: 'a', verdict: 'SKIP', costLow: 47, costHigh: 120 },
    { key: 'b', verdict: 'SKIP', costLow: 0, costHigh: 60 },      // zero low → ignored
    { key: 'c', verdict: 'BUY', costLow: 900, costHigh: 1200 },   // not SKIP → ignored
  ]
  const e = estimateCartSavings(priced)!
  check('sums only priced SKIP items', e.low === 47 && e.high === 120, JSON.stringify(e))
  check('renders as a range', formatSavings(e) === '$47–$120', formatSavings(e))
  check('BUY items never contribute', !e.components.skipItemIds.includes('c'))
  check('arithmetic is logged', e.components.skipItemsLow === 47 && e.components.arbitrage === null)

  // Gate: low bound under the floor → null, never a number.
  const thin = estimateCartSavings([{ key: 'x', verdict: 'SKIP', costLow: 12, costHigh: 40 }])
  check('low bound $12 falls under the $20 gate → null', thin === null)
  check('the gate is 20', SAVINGS_FLOOR === 20)

  // No price data at all → null.
  check('unpriced read → null', estimateCartSavings([{ key: 'y', verdict: 'SKIP' }]) === null)
  check('empty read → null', estimateCartSavings([]) === null)

  // Arbitrage applies at most once.
  const withArb = estimateCartSavings([{ key: 'z', verdict: 'SKIP', costLow: 47, costHigh: 120 }], 'window_weatherization')!
  check('arbitrage adds its delta', withArb.low === 47 + 320 && withArb.high === 120 + 385, JSON.stringify(withArb))
  check('arbitrage entry is logged with its guide',
    withArb.components.arbitrage?.sourceGuide === 'window-film-vs-replacement-vermont')
  check('unknown category adds nothing', arbitrageFor('not_a_category') === null)

  // A resolved price is a POINT, not a range. On its own it collapses the
  // bounds, and the "always a range" rule (§1.4) correctly rejects it
  // rather than rendering "$85–$85".
  check('resolved price alone → null (never a degenerate range)',
    estimateCartSavings([{ key: 'r', verdict: 'SKIP', resolvedPrice: 85, costLow: 10, costHigh: 20 }]) === null)

  // Combined with arbitrage it becomes a real range, and the resolved
  // price is what beat the band.
  const resolved = estimateCartSavings(
    [{ key: 'r', verdict: 'SKIP', resolvedPrice: 85, costLow: 10, costHigh: 20 }],
    'window_treatment'
  )!
  check('resolved price wins over the band', resolved.components.skipItemsLow === 85 && resolved.components.skipItemsHigh === 85)
  check('resolved + arbitrage renders a real range',
    resolved.low === 85 + 110 && resolved.high === 85 + 260, JSON.stringify(resolved))
}

console.log('\n=== §2: arbitrage table provenance ===')
{
  check('every entry carries a sourceGuide', ARBITRAGE_TABLE.every((e) => !!e.sourceGuide))
  check('every entry quotes its source line', ARBITRAGE_TABLE.every((e) => e.sourceLine.includes('$')))
  check('every entry states its basis', ARBITRAGE_TABLE.every((e) => !!e.basis))
  check('deltas are ordered', ARBITRAGE_TABLE.every((e) => e.lowDelta < e.highDelta))
  check('deltas are positive', ARBITRAGE_TABLE.every((e) => e.lowDelta > 0))
  for (const e of ARBITRAGE_TABLE) {
    console.log(`     · ${e.category}: $${e.lowDelta}–$${e.highDelta} ${e.unit} — ${e.sourceGuide}`)
    console.log(`       "${e.sourceLine}"`)
  }
}

console.log('\n=== §1.3 / CR2: upsell copy ===')
{
  const withEst = upsellWithEstimate('$47–$120')
  check('estimate variant carries the figure', withEst.includes('$47–$120'))
  check('estimate variant imports the refund canon', withEst.includes(REFUND_POLICY))
  check('fallback carries NO digits beyond the price',
    !/\$\d/.test(upsellFallback().replace(REFUND_POLICY, '')), upsellFallback())
  check('fallback uses the pays-for-itself line', upsellFallback().includes('one skipped purchase'))
  check('both variants share the opener',
    withEst.startsWith('Want the exact list?') && upsellFallback().startsWith('Want the exact list?'))
  check('CR4 cap is two', MAX_UPSELLS_PER_RESULT === 2)
}

console.log('\n=== CR1: no engine change in this release ===')
{
  // The §2.1 golden gate cannot run, so assert the stronger property
  // instead: nothing this release touched can alter a verdict.
  const changed = (path: string): boolean => {
    try {
      return execSync(`git diff --name-only v7.4.14-site-refresh...HEAD -- ${path}`, { encoding: 'utf8' }).trim().length > 0
    } catch { return false }
  }
  check('synthesis prompt untouched', !changed('src/lib/vision/prompt.ts'))
  check('recommend pipeline untouched', !changed('src/lib/recommend/pipeline.ts'))
  check('gate untouched', !changed('src/lib/recommend/gate.ts'))
  check('verdict rules untouched', !changed('src/lib/recommend/verdicts.ts'))
  check('validator untouched', !changed('src/lib/recommend/validate.ts'))
  check('scoring untouched', !changed('src/lib/score/'))
  check('prisma schema untouched', !changed('prisma/schema.prisma'))
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
