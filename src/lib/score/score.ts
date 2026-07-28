/**
 * v7.4.9 — RecScore: gate + weighted rank, computed ONCE at synthesis.
 *
 * Every function here is a deterministic function of (stored extraction,
 * SignaturePrior aggregates, config). No LLM, no network, no clock — so
 * the same inputs always produce byte-identical sub-scores (§1-T
 * determinism) and the customer request path stays fast.
 *
 * Stage 1 GATE (CR1): GroundingScore < floor → SUPPRESS. Suppression is
 * absolute; there is no weight that can rescue an ungrounded item.
 * Then CurationRule DEMOTE → lane bottom (rules demote, only the gate
 * suppresses).
 *
 * Stage 2 RANK: weighted sum of the four honest sub-scores, plus the
 * BUY-only ActionabilityTieBreak (CR2, hard-capped in config).
 */

import { createHash } from 'crypto'
import type { EnrichedRecommendation, MergedFeature, Verdict } from '@/lib/recommend/types'
import { SCORE_VERSION, SCORING_CONFIG, type ScoringConfig } from './config'

export interface SubScores {
  grounding: number
  reactionPrior: number
  photoQuality: number
  regionFit: number
  specificity: number
  actionabilityTieBreak: number
}

export interface ScoredItem {
  key: string
  suppressed: boolean
  suppressedReason: string | null
  /** Claims that failed to resolve — logged with the suppression event. */
  failingClaims: string[]
  demoted: boolean
  demotedByRuleId: string | null
  subScores: SubScores
  compositeScore: number
  scoreVersion: string
}

export interface PriorLookup {
  /** signatureHash → {prior, n} */
  get(signatureHash: string): { prior: number; n: number } | undefined
}

export interface RuleLookup {
  /** signatureHash → active DEMOTE rule id */
  get(signatureHash: string): string | undefined
}

export function signatureHash(signature: string): string {
  return createHash('sha256').update(signature, 'utf8').digest('hex')
}

// ---------------------------------------------------------------------------
// Sub-scores
// ---------------------------------------------------------------------------

/**
 * Extraction confidence at or above this counts as fully grounded.
 *
 * Rationale: runGate already drops features below 0.3, so anything a
 * claim can cite is allow-listed; confidence then modulates credit
 * WITHIN that set. Real vision confidences cluster at 0.7–0.85, so a
 * reference of 0.7 gives an honestly-cited claim full credit and only
 * penalizes citations to genuinely marginal observations.
 *
 * Calibrated against live output: with the reference set to 1.0 (the
 * naive reading), three fully-cited items scored 0.725–0.775 and were
 * suppressed purely for the vision model's ordinary confidence — the
 * floor was measuring extraction confidence rather than groundedness.
 */
const CONFIDENCE_REFERENCE = 0.7

/**
 * GroundingScore: share of the item's claims traceable to allow-listed
 * extraction features, weighted by extraction confidence (§1.2).
 *
 * The primary quantity is the SHARE of claims that trace to a real
 * observation; confidence is the weight applied to each traced claim,
 * not the value itself. An uncited claim contributes 0, so one
 * fabricated claim in four caps the item at 0.75 and trips the 0.8
 * floor — which is the intent — while four honestly-cited claims score
 * 1.0 regardless of whether the vision model said 0.72 or 0.95.
 */
export function groundingScore(rec: EnrichedRecommendation): { score: number; failingClaims: string[] } {
  const links = rec.claimLinks ?? []
  if (links.length === 0) return { score: 0, failingClaims: rec.visibleEvidence ?? [] }
  let sum = 0
  const failing: string[] = []
  for (const l of links) {
    const traceable = l.featureRefs.length > 0 && l.groundedConfidence > 0
    sum += traceable ? clamp01(l.groundedConfidence / CONFIDENCE_REFERENCE) : 0
    if (!traceable) failing.push(l.claim)
  }
  return { score: sum / links.length, failingClaims: failing }
}

/**
 * ReactionPrior from the nightly-materialized SignaturePrior aggregates.
 * Neutral 0.5 when the item's signatures are unknown or thin (n < minN),
 * so a brand-new signature is never punished for being new.
 */
export function reactionPriorScore(
  rec: EnrichedRecommendation,
  priors: PriorLookup,
  cfg: ScoringConfig
): number {
  const hashes = Array.from(new Set((rec.claimLinks ?? []).flatMap((l) => l.signatures).map(signatureHash)))
  const usable = hashes
    .map((h) => priors.get(h))
    .filter((p): p is { prior: number; n: number } => p != null && p.n >= cfg.priorMinN)
  if (usable.length === 0) return 0.5
  // Weight each signature's prior by its evidence count, so a signature
  // with 50 reactions outvotes one with 6.
  const totalN = usable.reduce((s, p) => s + p.n, 0)
  return clamp01(usable.reduce((s, p) => s + p.prior * (p.n / totalN), 0))
}

/**
 * PhotoQualityScore: mean extraction confidence of the supporting
 * features, lifted by completeness (how many distinct observations back
 * the item). One thin observation scores lower than three strong ones.
 */
export function photoQualityScore(rec: EnrichedRecommendation): number {
  const links = rec.claimLinks ?? []
  const confidences = links.map((l) => l.groundedConfidence).filter((c) => c > 0)
  if (confidences.length === 0) return 0
  const mean = confidences.reduce((s, c) => s + c, 0) / confidences.length
  const distinctFeatures = new Set(links.flatMap((l) => l.featureRefs)).size
  // Completeness: 1 feature → 0.85×, 2 → 0.93×, 3+ → 1.0×
  const completeness = distinctFeatures >= 3 ? 1 : distinctFeatures === 2 ? 0.93 : 0.85
  return clamp01(mean * completeness)
}

/**
 * RegionFit: alignment between the item and the session's region
 * profile. Neutral 0.5 without a ZIP — an absent ZIP must never be a
 * penalty (the field is optional by design, v7.4.7).
 */
export function regionFitScore(
  rec: EnrichedRecommendation,
  region: { climateZone: string; frostDepthClass: string; humidityClass: string } | null
): number {
  if (!region) return 0.5
  const text = `${rec.title} ${rec.summary} ${rec.nextAction}`.toLowerCase()
  let score = 0.5
  // Cold/frost-relevant work in a deep-frost region, and vice versa.
  const coldWork = /(caulk|weather.?strip|insulat|draft|freeze|frost|heat|furnace|boiler|pipe|ice)/.test(text)
  const humidWork = /(humid|moisture|mold|mildew|dehumidif|condensation|damp|ventilat)/.test(text)
  const deepFrost = region.frostDepthClass === 'deep' || region.frostDepthClass === 'very_deep'
  const humid = region.humidityClass === 'humid' || region.humidityClass === 'marine'
  if (coldWork && deepFrost) score += 0.3
  if (humidWork && humid) score += 0.3
  if (coldWork && region.frostDepthClass === 'none') score -= 0.2
  if (humidWork && region.humidityClass === 'dry') score -= 0.15
  return clamp01(score)
}

/**
 * Specificity: deterministic heuristics over the item's own structured
 * fields — a named product category with real specs and a quantity beats
 * "some caulk". Also the input Phase 2's resolver keys off.
 */
export function specificityScore(rec: EnrichedRecommendation): number {
  let score = 0
  const cat = rec.cartMeta?.productCategory ?? ''
  const specs = rec.cartMeta?.requiredSpecs ?? []
  const query = rec.cartMeta?.searchQuery ?? ''

  // Named category, not a vague noun
  if (cat.length >= 8 && /\s/.test(cat)) score += 0.3
  else if (cat.length > 0) score += 0.15
  // Real specs with reasons
  if (specs.length >= 2) score += 0.3
  else if (specs.length === 1) score += 0.18
  // Measurable dimension/rating anywhere in the specs
  if (specs.some((s) => /\d|\b(cfm|inch|in\.|ft|gauge|amp|watt|gallon|oz|mil|r-?value)\b/i.test(s.spec))) score += 0.2
  // A usable search query
  if (query.trim().length >= 10) score += 0.2
  return clamp01(score)
}

/**
 * ActionabilityTieBreak (CR2): BUY lane ONLY, hard-capped by config.
 * Reads Phase 2's resolutionMode — a resolved ASIN is more actionable
 * for the reader than a search link. Returns 0 outside BUY so it can
 * never influence inclusion or lane assignment.
 */
export function actionabilityTieBreak(
  verdict: Verdict,
  resolutionMode: 'ASIN' | 'SEARCH' | null
): number {
  if (verdict !== 'BUY') return 0
  if (resolutionMode === 'ASIN') return 1
  if (resolutionMode === 'SEARCH') return 0.5
  return 0
}

// ---------------------------------------------------------------------------
// Composite
// ---------------------------------------------------------------------------

export interface ScoreInput {
  recs: EnrichedRecommendation[]
  features: MergedFeature[]
  priors: PriorLookup
  rules: RuleLookup
  region: { climateZone: string; frostDepthClass: string; humidityClass: string } | null
  /** rec.key → resolutionMode, when Phase 2 has already resolved. */
  resolutionModes?: Map<string, 'ASIN' | 'SEARCH'>
  cfg?: ScoringConfig
}

export function scoreItems(input: ScoreInput): ScoredItem[] {
  const cfg = input.cfg ?? SCORING_CONFIG
  const out: ScoredItem[] = []

  for (const rec of input.recs) {
    const g = groundingScore(rec)

    // ---- Stage 1: GATE (CR1) ----
    if (g.score < cfg.groundingFloor) {
      out.push({
        key: rec.key,
        suppressed: true,
        suppressedReason: `grounding ${g.score.toFixed(3)} < floor ${cfg.groundingFloor}`,
        failingClaims: g.failingClaims,
        demoted: false,
        demotedByRuleId: null,
        subScores: {
          grounding: round4(g.score),
          reactionPrior: 0,
          photoQuality: 0,
          regionFit: 0,
          specificity: 0,
          actionabilityTieBreak: 0,
        },
        compositeScore: 0,
        scoreVersion: SCORE_VERSION,
      })
      continue
    }

    // ---- Stage 1b: CurationRule (demote only) ----
    const hashes = Array.from(new Set((rec.claimLinks ?? []).flatMap((l) => l.signatures).map(signatureHash)))
    let demotedByRuleId: string | null = null
    for (const h of hashes) {
      const ruleId = input.rules.get(h)
      if (ruleId) {
        demotedByRuleId = ruleId
        break
      }
    }

    // ---- Stage 2: RANK ----
    const sub: SubScores = {
      grounding: round4(g.score),
      reactionPrior: round4(reactionPriorScore(rec, input.priors, cfg)),
      photoQuality: round4(photoQualityScore(rec)),
      regionFit: round4(regionFitScore(rec, input.region)),
      specificity: round4(specificityScore(rec)),
      actionabilityTieBreak: round4(
        actionabilityTieBreak(rec.verdict, input.resolutionModes?.get(rec.key) ?? null)
      ),
    }

    const composite =
      sub.reactionPrior * cfg.weights.reactionPrior +
      sub.photoQuality * cfg.weights.photoQuality +
      sub.regionFit * cfg.weights.regionFit +
      sub.specificity * cfg.weights.specificity +
      // CR2: already 0 outside BUY; the cap is enforced in config validation.
      sub.actionabilityTieBreak * cfg.weights.actionabilityTieBreak

    out.push({
      key: rec.key,
      suppressed: false,
      suppressedReason: null,
      failingClaims: g.failingClaims,
      demoted: demotedByRuleId != null,
      demotedByRuleId,
      subScores: sub,
      compositeScore: round4(composite),
      scoreVersion: SCORE_VERSION,
    })
  }

  return out
}

/**
 * Lane order is never touched by scores (CR2): BUY first, then WAIT,
 * SKIP, INVESTIGATE. Within a lane, composite descending — except
 * rule-demoted items, which sink to the lane bottom.
 */
const LANE_ORDER: Record<Verdict, number> = { BUY: 0, WAIT: 1, SKIP: 2, INVESTIGATE: 3 }

export function applyScoreOrdering(
  recs: EnrichedRecommendation[],
  scored: Map<string, ScoredItem>
): EnrichedRecommendation[] {
  const survivors = recs.filter((r) => !scored.get(r.key)?.suppressed)
  survivors.sort((a, b) => {
    const laneDelta = LANE_ORDER[a.verdict] - LANE_ORDER[b.verdict]
    if (laneDelta !== 0) return laneDelta
    const sa = scored.get(a.key)
    const sb = scored.get(b.key)
    // Demoted items go to the bottom of their lane.
    if (!!sa?.demoted !== !!sb?.demoted) return sa?.demoted ? 1 : -1
    return (sb?.compositeScore ?? 0) - (sa?.compositeScore ?? 0)
  })
  survivors.forEach((r, i) => {
    r.sortOrder = i
    r.disclosureTier = i < 2 ? 'free' : 'email'
  })
  return survivors
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

/** Fixed precision keeps persisted sub-scores byte-identical across runs. */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
