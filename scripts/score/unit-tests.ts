/**
 * §1-T Phase 1 test plan — the parts that are pure functions.
 * (DB-backed tests: immutability, judge cache, auto-demotion — run separately.)
 */
import { validateScoringConfig, SCORING_CONFIG, ScoringConfigError, ACTIONABILITY_HARD_CAP } from '@/lib/score/config'
import { scoreItems, groundingScore, actionabilityTieBreak, signatureHash } from '@/lib/score/score'
import { computePrior } from '@/lib/score/priors'
import type { EnrichedRecommendation } from '@/lib/recommend/types'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  [PASS] ${name}`) }
  else { fail++; console.log(`  [FAIL] ${name} ${detail}`) }
}

function mkRec(over: Partial<EnrichedRecommendation> = {}): EnrichedRecommendation {
  return {
    key: 'test_item', verdict: 'BUY', verdictReason: 'x', title: 'Re-caulk the tub seam',
    summary: 'Fresh sealant at the tub-to-tile seam.', visibleEvidence: ['gaps at tub seam'],
    claimLinks: [{ claim: 'gaps at tub seam', featureRefs: [0], signatures: ['caulk_failing:bathroom:moderate'], groundedConfidence: 0.9 }],
    costLow: null, costHigh: null, benefitType: 'prevention', confidenceScore: 0.8, confidenceLabel: 'high',
    assumptions: [], limitations: [], riskLevel: 'none', clarifyingQuestions: [], smartCartEligible: true,
    nextAction: 'Apply mildew-resistant sealant.', rebate: null, citations: [], disclosureTier: 'free',
    categorySearchQuery: null,
    cartMeta: { productCategory: 'mildew-resistant bathroom sealant', requiredSpecs: [{ spec: 'mold-resistant formulation', why: 'wet area' }, { spec: '5.5 oz cartridge', why: 'fits standard gun' }], quantity: 1, installDifficulty: 'diy_easy', searchQuery: 'mildew resistant bathroom caulk' },
    cartArtifacts: [], sortOrder: 0, ...over,
  } as EnrichedRecommendation
}

const priors = { get: (h: string) => undefined as { prior: number; n: number } | undefined }
const rules = { get: (_h: string) => undefined as string | undefined }

console.log('\n=== §1-T: determinism ===')
{
  const rec = mkRec()
  const a = scoreItems({ recs: [rec], features: [], priors, rules, region: null })
  const b = scoreItems({ recs: [mkRec()], features: [], priors, rules, region: null })
  check('identical inputs → byte-identical sub-score JSON',
    JSON.stringify(a[0].subScores) === JSON.stringify(b[0].subScores),
    `${JSON.stringify(a[0].subScores)} vs ${JSON.stringify(b[0].subScores)}`)
  check('composite identical', a[0].compositeScore === b[0].compositeScore)
}

console.log('\n=== §1-T: grounding gate (CR1) ===')
{
  // Planted ungrounded claim: "mini-split visible" citing nothing.
  const ungrounded = mkRec({
    key: 'planted_hallucination',
    claimLinks: [{ claim: 'mini-split visible on the wall', featureRefs: [], signatures: [], groundedConfidence: 0 }],
    visibleEvidence: ['mini-split visible on the wall'],
  })
  const r = scoreItems({ recs: [ungrounded], features: [], priors, rules, region: null })[0]
  check('ungrounded item suppressed', r.suppressed === true, JSON.stringify(r))
  check('failing claim captured', r.failingClaims.includes('mini-split visible on the wall'))
  check('suppressed item scores 0 composite', r.compositeScore === 0)

  // Partial grounding: 1 of 2 claims unproven → 0.45 < 0.8 floor
  const partial = mkRec({
    claimLinks: [
      { claim: 'real gap', featureRefs: [0], signatures: ['s'], groundedConfidence: 0.9 },
      { claim: 'invented mini-split', featureRefs: [], signatures: [], groundedConfidence: 0 },
    ],
  })
  const pr = scoreItems({ recs: [partial], features: [], priors, rules, region: null })[0]
  check('half-fabricated item suppressed (0.45 < 0.8)', pr.suppressed === true, `score=${pr.subScores.grounding}`)

  // Grounding measures SHARE-traceable (confidence is the weight, not
  // the value): an honestly-cited claim gets full credit even at the
  // vision model's ordinary ~0.75 confidence.
  const g = groundingScore(mkRec())
  check('fully grounded claim @0.9 conf → 1.0 (not 0.9)', Math.abs(g.score - 1) < 1e-9, String(g.score))

  const typical = mkRec({
    claimLinks: [{ claim: 'cited', featureRefs: [0], signatures: ['s'], groundedConfidence: 0.75 }],
  })
  check('fully grounded claim @0.75 conf → 1.0 (survives the floor)',
    Math.abs(groundingScore(typical).score - 1) < 1e-9, String(groundingScore(typical).score))
  const typicalScored = scoreItems({ recs: [typical], features: [], priors, rules, region: null })[0]
  check('typical-confidence grounded item is NOT suppressed', typicalScored.suppressed === false)

  const marginal = mkRec({
    claimLinks: [{ claim: 'weak cite', featureRefs: [0], signatures: ['s'], groundedConfidence: 0.35 }],
  })
  check('claim citing a marginal 0.35 observation is penalized (0.5 < 0.8)',
    Math.abs(groundingScore(marginal).score - 0.5) < 1e-9, String(groundingScore(marginal).score))
  check('marginal-only item suppressed',
    scoreItems({ recs: [marginal], features: [], priors, rules, region: null })[0].suppressed === true)

  const threeOfFour = mkRec({
    claimLinks: [
      { claim: 'a', featureRefs: [0], signatures: ['s'], groundedConfidence: 0.8 },
      { claim: 'b', featureRefs: [1], signatures: ['s'], groundedConfidence: 0.8 },
      { claim: 'c', featureRefs: [2], signatures: ['s'], groundedConfidence: 0.8 },
      { claim: 'invented', featureRefs: [], signatures: [], groundedConfidence: 0 },
    ],
  })
  check('one fabricated claim in four → 0.75, trips the 0.8 floor',
    Math.abs(groundingScore(threeOfFour).score - 0.75) < 1e-9, String(groundingScore(threeOfFour).score))
  check('3-of-4 item suppressed',
    scoreItems({ recs: [threeOfFour], features: [], priors, rules, region: null })[0].suppressed === true)
}

console.log('\n=== §1-T: CR2 mechanical ===')
{
  let threw = false
  try {
    validateScoringConfig({ ...SCORING_CONFIG, weights: { ...SCORING_CONFIG.weights, actionabilityTieBreak: 0.5 } })
  } catch (e) { threw = e instanceof ScoringConfigError }
  check('tie-break 0.5 → config validation REJECTS', threw)

  check('hard cap is 0.10', ACTIONABILITY_HARD_CAP === 0.1)
  check('tie-break on SKIP → 0 (ignored outside BUY)', actionabilityTieBreak('SKIP', 'ASIN') === 0)
  check('tie-break on WAIT → 0', actionabilityTieBreak('WAIT', 'ASIN') === 0)
  check('tie-break on BUY+ASIN → 1', actionabilityTieBreak('BUY', 'ASIN') === 1)

  let threwFloor = false
  try { validateScoringConfig({ ...SCORING_CONFIG, groundingFloor: 0 }) } catch { threwFloor = true }
  check('groundingFloor 0 → REJECTS (CR1 gate must exist)', threwFloor)

  let threwWeight = false
  try {
    const bad = { ...SCORING_CONFIG, weights: { ...SCORING_CONFIG.weights, grounding: 0.4 } as never }
    validateScoringConfig(bad)
  } catch { threwWeight = true }
  check('grounding as a WEIGHT → REJECTS (CR1)', threwWeight)

  // SKIP ordering must not be influenced: two SKIPs, one with ASIN
  const skipA = mkRec({ key: 'skip_a', verdict: 'SKIP' })
  const skipB = mkRec({ key: 'skip_b', verdict: 'SKIP' })
  const res = scoreItems({ recs: [skipA, skipB], features: [], priors, rules, region: null, resolutionModes: new Map([['skip_a', 'ASIN']]) })
  check('SKIP items get 0 tie-break regardless of resolutionMode',
    res.every((r) => r.subScores.actionabilityTieBreak === 0))
}

console.log('\n=== §1-T: priors math ===')
{
  const thin = { get: (_h: string) => ({ prior: 0.95, n: 2 }) }
  const r = scoreItems({ recs: [mkRec()], features: [], priors: thin, rules, region: null })[0]
  check('n=2 (< minN 5) → neutral 0.5', r.subScores.reactionPrior === 0.5, String(r.subScores.reactionPrior))

  // n=20 @ 80% like → 16 likes, 4 doesnt-apply, smoothing a=2
  // denom = 16+4+4 = 24; likeRate = 18/24 = 0.75; daRate = 6/24 = 0.25
  // signed = 0.5 → mapped = 0.75
  const computed = computePrior(16, 4)
  check('n=20 @80% like → hand-computed 0.75', Math.abs(computed - 0.75) < 1e-9, String(computed))

  const fat = { get: (_h: string) => ({ prior: computed, n: 20 }) }
  const r2 = scoreItems({ recs: [mkRec()], features: [], priors: fat, rules, region: null })[0]
  check('scorer uses the smoothed prior at n=20', Math.abs(r2.subScores.reactionPrior - 0.75) < 1e-4, String(r2.subScores.reactionPrior))

  check('neutral prior for unknown signature', computePrior(0, 0) === 0.5)
}

console.log('\n=== §1-T: rule demotion (demote, never suppress) ===')
{
  const sig = 'caulk_failing:bathroom:moderate'
  const demoteRules = { get: (h: string) => (h === signatureHash(sig) ? 'rule_123' : undefined) }
  const r = scoreItems({ recs: [mkRec()], features: [], priors, rules: demoteRules, region: null })[0]
  check('rule DEMOTES', r.demoted === true && r.demotedByRuleId === 'rule_123')
  check('rule does NOT suppress (CR1: only the gate suppresses)', r.suppressed === false)
  check('demoted item keeps a real composite score', r.compositeScore > 0)
}

console.log('\n=== §1-T: region fit neutrality ===')
{
  const noZip = scoreItems({ recs: [mkRec()], features: [], priors, rules, region: null })[0]
  check('no ZIP → regionFit neutral 0.5 (never a penalty)', noZip.subScores.regionFit === 0.5)
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
