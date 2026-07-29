/**
 * v7.4.13 §2 — the parts of the coverage test plan that are pure functions.
 * (DB-backed tests — claim flow, backfill idempotency, CR5 auth — run
 * separately in scripts/coverage/db-tests.ts.)
 */
import { COVERAGE_SCHEMA, SLOT_COUNT, SYSTEM_COUNT, GENERIC_SLOT_ID, isValidSlot } from '@/lib/coverage/schema'
import { mapFeature, mapFeatures } from '@/lib/coverage/mapping'
import { evaluateSlot, SLOT_QUALITY_FLOOR, coachingMessage } from '@/lib/coverage/quality'
import { buildCoverageView, slotState, addMonths, coverageHeadline, type StoredSlot } from '@/lib/coverage/state'
import { qualityFromObservations, photoQualityScore } from '@/lib/score/score'
import type { EnrichedRecommendation } from '@/lib/recommend/types'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  [PASS] ${name}`) }
  else { fail++; console.log(`  [FAIL] ${name} ${detail}`) }
}

const NOW = new Date('2026-07-28T12:00:00Z')
const ago = (months: number) => addMonths(NOW, -months)

function slot(systemId: string, slotId: string, monthsAgo: number, score = 0.9): StoredSlot {
  return { systemId, slotId, readAt: ago(monthsAgo), photoQualityScore: score, filledByReportId: 'rep_1' }
}

console.log('\n=== §1.2: schema shape ===')
{
  check('nine systems', SYSTEM_COUNT === 9, `got ${SYSTEM_COUNT}`)
  check('31 shot slots', SLOT_COUNT === 31, `got ${SLOT_COUNT}`)
  const ids = COVERAGE_SCHEMA.map((s) => s.systemId)
  check('system ids unique', new Set(ids).size === ids.length)
  check('slot ids unique within each system',
    COVERAGE_SCHEMA.every((s) => new Set(s.slots.map((x) => x.slotId)).size === s.slots.length))
  check('every slot has guidance copy', COVERAGE_SCHEMA.every((s) => s.slots.every((x) => x.guidance.length > 10)))
  check('isValidSlot accepts a real slot', isValidSlot('electrical', 'panel_door_open'))
  check('isValidSlot rejects an invented slot', !isValidSlot('electrical', 'not_a_slot'))
}

console.log('\n=== CR1: no fear vocabulary in any schema copy ===')
{
  // The record surfaces render these strings verbatim, so the grep in §2
  // starts here — at the source rather than the markup.
  const FEAR = /\b(risk|danger|dangerous|hazard|unsafe|urgent|warning|fail(ing|ure)?|damage|threat|problem|worry|alarm)\b/i
  const strings: string[] = []
  for (const s of COVERAGE_SCHEMA) {
    strings.push(s.label, s.invitation, s.windowNote ?? '')
    for (const sl of s.slots) strings.push(sl.label, sl.guidance)
  }
  const offenders = strings.filter((t) => FEAR.test(t))
  check('no fear vocabulary in schema copy', offenders.length === 0, offenders.join(' | '))

  const coachOffenders = COVERAGE_SCHEMA.flatMap((s) =>
    s.slots.map((sl) => coachingMessage(s.systemId, sl.slotId))
  ).filter((m) => FEAR.test(m))
  check('no fear vocabulary in any coaching message', coachOffenders.length === 0, coachOffenders.join(' | '))
}

console.log('\n=== CR2: seasonal windows are metadata only ===')
{
  // The window field must never be consulted to decide readability. This
  // asserts the data shape; the DOM/API assert lives in db-tests.
  const windows = new Set(COVERAGE_SCHEMA.map((s) => s.window))
  check('windows drawn from the three declared values',
    Array.from(windows).every((w) => ['spring', 'fall', 'anytime'].includes(w)))
  check('every system is fillable regardless of window',
    COVERAGE_SCHEMA.every((s) => s.slots.length > 0))
  // An out-of-window system must map and fill exactly like an in-window one.
  const roof = evaluateSlot('roof_attic', 'insulation_depth', [{ type: 'insulation_thin', confidence: 0.9 }])
  check('out-of-window system fills in July with no penalty', roof.state === 'FILL')
}

console.log('\n=== §0.2 / CR3: one quality metric, two substrates ===')
{
  // The coverage gate and RecScore must be the same function.
  const conf = [0.8, 0.9]
  const direct = qualityFromObservations(conf, 2)
  const rec = {
    claimLinks: [
      { claim: 'a', featureRefs: [0], signatures: [], groundedConfidence: 0.8 },
      { claim: 'b', featureRefs: [1], signatures: [], groundedConfidence: 0.9 },
    ],
  } as unknown as EnrichedRecommendation
  check('photoQualityScore delegates to the shared formula', photoQualityScore(rec) === direct,
    `${photoQualityScore(rec)} vs ${direct}`)

  const slotScore = evaluateSlot('electrical', 'panel_door_open',
    [{ type: 'electrical_panel_visible', confidence: 0.8 }, { type: 'panel_at_capacity_visual', confidence: 0.9 }])
  check('slot gate uses the same formula', slotScore.score === direct, `${slotScore.score} vs ${direct}`)
}

console.log('\n=== CR3: the floor, and the coaching band ===')
{
  const strong = evaluateSlot('electrical', 'panel_door_open',
    [{ type: 'electrical_panel_visible', confidence: 0.95 }, { type: 'panel_at_capacity_visual', confidence: 0.9 }, { type: 'breaker_labels', confidence: 0.9 }])
  check('clean shot fills', strong.state === 'FILL' && strong.score >= SLOT_QUALITY_FLOOR)

  // Single observation at 0.78 → 0.78 * 0.85 = 0.663, just under the floor.
  const near = evaluateSlot('electrical', 'panel_door_open', [{ type: 'electrical_panel_visible', confidence: 0.78 }])
  check('near-miss does NOT fill', near.state === 'COACH', `state=${near.state} score=${near.score}`)
  check('near-miss carries the concrete fix',
    near.state === 'COACH' && /door open/i.test(near.message) && /flash/i.test(near.message),
    near.state === 'COACH' ? near.message : '')

  const far = evaluateSlot('electrical', 'panel_door_open', [{ type: 'electrical_panel_visible', confidence: 0.35 }])
  check('far-miss is silent (no fill, no coaching noise)', far.state === 'NONE', `state=${far.state}`)

  check('coaching always ends with an invitation to retry',
    COVERAGE_SCHEMA.every((s) => s.slots.every((sl) => /retake\?/i.test(coachingMessage(s.systemId, sl.slotId)))))
}

console.log('\n=== §1.3: mapping keys off real vocabulary ===')
{
  // Cross-cutting signatures beat room-of-capture.
  const panelInBasement = mapFeature({ type: 'electrical_panel_visible', category_hint: 'basement', confidence: 0.9 })
  check('panel shot in a basement maps to Electrical, not Basement',
    panelInBasement?.systemId === 'electrical', JSON.stringify(panelInBasement))

  const heaterInLaundry = mapFeature({ type: 'water_heater_visible', category_hint: 'laundry', confidence: 0.9 })
  check('water heater in laundry maps to Plumbing/water_heater',
    heaterInLaundry?.systemId === 'plumbing' && heaterInLaundry?.slotId === 'water_heater')

  // Observed in production: window caulk tagged category_hint=bathroom.
  const windowInBath = mapFeature({ type: 'caulk_failing_window', category_hint: 'bathroom', confidence: 0.7 })
  check('window caulk shot in a bath maps to Windows & Doors',
    windowInBath?.systemId === 'windows_doors' && windowInBath?.slotId === 'window_sill_seal')

  // Synonym drift observed in production must resolve identically.
  const a = mapFeature({ type: 'caulk_failing_window', category_hint: 'bathroom', confidence: 0.7 })
  const b = mapFeature({ type: 'window_caulk_failing', category_hint: 'bathroom', confidence: 0.7 })
  check('synonym pair resolves to the same slot', JSON.stringify(a) === JSON.stringify(b))

  const fridge1 = mapFeature({ type: 'refrigerator_present', category_hint: 'kitchen', confidence: 0.9 })
  const fridge2 = mapFeature({ type: 'refrigerator_visible', category_hint: 'kitchen', confidence: 0.9 })
  check('refrigerator_present / _visible resolve identically', JSON.stringify(fridge1) === JSON.stringify(fridge2))

  // Category fallback + generic landing.
  const wall = mapFeature({ type: 'foundation_efflorescence', category_hint: 'basement', confidence: 0.83 })
  check('undirected basement wall feature lands on the generic slot',
    wall?.systemId === 'basement_foundation' && wall?.slotId === GENERIC_SLOT_ID && wall?.generic === true)

  // Honest non-mapping.
  const bedroom = mapFeature({ type: 'dated_carpet', category_hint: 'bedroom', confidence: 0.9 })
  check('bedroom carpet maps to no system (logged, not guessed)', bedroom === null)

  // Tagged uploads bypass inference entirely.
  const tagged = mapFeature({ type: 'anything_at_all', category_hint: 'unclear', confidence: 0.9 },
    { systemId: 'roof_attic', slotId: 'attic_overview' })
  check('taggedSlot short-circuits inference',
    tagged?.systemId === 'roof_attic' && tagged?.slotId === 'attic_overview' && tagged?.generic === false)

  const invalidTag = mapFeature({ type: 'insulation_thin', category_hint: 'attic', confidence: 0.9 },
    { systemId: 'roof_attic', slotId: 'bogus_slot' })
  check('an invalid tag falls back to inference rather than writing a bad slot',
    invalidTag?.slotId === 'insulation_depth')

  const { unmapped } = mapFeatures([
    { type: 'dated_carpet', category_hint: 'bedroom', confidence: 0.9 },
    { type: 'insulation_thin', category_hint: 'attic', confidence: 0.9 },
  ])
  check('unmapped tail is preserved for schema v2', unmapped.length === 1 && unmapped[0].type === 'dated_carpet')
}

console.log('\n=== §2: aging — 8 / 10 / 13 months ===')
{
  check('8 months → lit', slotState(ago(8), NOW) === 'lit')
  check('10 months → aging', slotState(ago(10), NOW) === 'aging')
  check('13 months → stale', slotState(ago(13), NOW) === 'stale')

  const view = buildCoverageView([
    slot('electrical', 'panel_door_open', 8),
    slot('electrical', 'panel_labeling', 10),
    slot('plumbing', 'water_heater', 13),
  ], NOW)

  const electrical = view.systems.find((s) => s.systemId === 'electrical')!
  const plumbing = view.systems.find((s) => s.systemId === 'plumbing')!

  check('lit + aging slots both count toward depth', electrical.filledCount === 2)
  check('a system holding an aging slot reads as aging', electrical.state === 'aging')
  check('stale slot is excluded from depth', plumbing.filledCount === 0)
  check('stale-only system reads as dark for breadth', plumbing.state === 'dark')
  check('breadth counts only non-stale systems', view.breadth === 1, `got ${view.breadth}`)
  check('depth counts only non-stale slots', view.depth === 2, `got ${view.depth}`)

  // History preservation is a DB concern, but the view must still expose
  // the prior read so the panel can show it (§1.1).
  const staleSlot = plumbing.slots.find((s) => s.slotId === 'water_heater')!
  check('stale slot keeps its prior read visible', staleSlot.state === 'stale' && staleSlot.readAt !== null)
  check('stale slot is not counted as filled', staleSlot.filled === false)
}

console.log('\n=== §1.1 / §1.6: breadth, depth, and the 9/9 gate ===')
{
  const empty = buildCoverageView([], NOW)
  check('empty record → 0 of 9, 0 of 31', empty.breadth === 0 && empty.depth === 0)
  check('empty record is not complete', empty.complete === false)
  check('headline reads honestly', coverageHeadline(empty) === '0 of 9 systems · 0 of 31 shots',
    coverageHeadline(empty))

  // Generic-only fill: system is lit for breadth, but claims no shot.
  const genericOnly = buildCoverageView([slot('basement_foundation', GENERIC_SLOT_ID, 1)], NOW)
  const bsmt = genericOnly.systems.find((s) => s.systemId === 'basement_foundation')!
  check('generic fill lights the system', bsmt.state === 'lit')
  check('generic fill is flagged as generic-only', bsmt.genericOnly === true)
  check('generic fill adds breadth', genericOnly.breadth === 1)
  check('generic fill adds NO depth', genericOnly.depth === 0)

  // Full record.
  const all: StoredSlot[] = COVERAGE_SCHEMA.flatMap((s) => s.slots.map((sl) => slot(s.systemId, sl.slotId, 1)))
  const full = buildCoverageView(all, NOW)
  check('full record → 9 of 9, 31 of 31', full.breadth === 9 && full.depth === 31,
    `${full.breadth}/${full.depth}`)
  check('full record is complete (Summary trigger)', full.complete === true)

  // CR4: one planted stale system must block the Summary.
  const planted = all.map((s) =>
    s.systemId === 'hvac' ? { ...s, readAt: ago(13) } : s)
  const blocked = buildCoverageView(planted, NOW)
  check('a single stale system blocks completeness (CR4)', blocked.complete === false)
  check('the stale system drops out of breadth', blocked.breadth === 8, `got ${blocked.breadth}`)
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
