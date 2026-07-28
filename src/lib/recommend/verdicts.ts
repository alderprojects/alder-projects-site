/**
 * v7.4.0 — Deterministic verdict rules + cost/rebate enrichment.
 *
 * The LLM proposes; this layer decides. All financial conclusions
 * (cost ranges, rebates, citations) come from the Vermont dataset —
 * candidates that don't match a dataset line item get NO numbers
 * (product rule 3: never fabricate precision).
 *
 * Rule order (first match wins):
 *   R1 safety flag            → INVESTIGATE (pro_required)
 *   R2 duplicate equipment    → SKIP ("you already own this")
 *   R3 renter + irreversible  → SKIP (reframed for tenure)
 *   R4 low confidence (<0.45) → INVESTIGATE (needs confirmation)
 *   R5 lean not_worth_it      → SKIP
 *   R6 lean can_wait          → WAIT
 *   R7 lean needs_verification→ INVESTIGATE
 *   R8 lean worth_buying + confidence ≥0.6 → BUY
 *   R9 fallback               → WAIT (honest default: not sure ≠ buy)
 */

import type { Candidate, ClaimLink, EnrichedRecommendation, MergedFeature, Tenure, Verdict } from './types'
import { computeSignature } from '@/lib/learning/signature'
import { checkSafety } from './safety'
import { matchItem, rebateFromItem, citationFromItem } from './dataset'
import { buildAmazonUrl } from '@/lib/buildAmazonUrl'

const CONFIDENCE_FLOOR_INVESTIGATE = 0.45
const CONFIDENCE_FLOOR_BUY = 0.6

export function decideVerdicts(
  candidates: Candidate[],
  tenure: Tenure | null,
  // v7.4.9: the numbered observation set the candidates cited. Passing it
  // resolves each claim's feature_refs into signatures + confidences
  // (the GroundingScore substrate). Omitted → claims resolve ungrounded,
  // which is the honest reading when the observation set is unavailable.
  features: MergedFeature[] = []
): EnrichedRecommendation[] {
  const recs = candidates.map((c) => enrich(c, tenure, features))
  // ≥1 SKIP/WAIT invariant (product rule 1) is enforced in validate.ts —
  // here we just sort: BUYs first (they anchor the upsell), then WAIT,
  // SKIP, INVESTIGATE, each by confidence desc.
  const order: Record<Verdict, number> = { BUY: 0, WAIT: 1, SKIP: 2, INVESTIGATE: 3 }
  recs.sort((a, b) => order[a.verdict] - order[b.verdict] || b.confidenceScore - a.confidenceScore)
  recs.forEach((r, i) => {
    r.sortOrder = i
    // Disclosure tiers: first two recs free, the rest email-gated.
    // Cart artifacts are always paid-tier (handled at the response layer).
    r.disclosureTier = i < 2 ? 'free' : 'email'
  })
  return recs
}

/**
 * v7.4.9 — resolve one candidate's evidence entries against the numbered
 * observation set. An out-of-range or absent ref contributes nothing:
 * `groundedConfidence` stays 0 and the gate treats the claim as unproven.
 */
function resolveClaimLinks(c: Candidate, features: MergedFeature[]): ClaimLink[] {
  return c.visible_evidence.map((e) => {
    const valid = e.feature_refs.filter((n) => n >= 0 && n < features.length)
    return {
      claim: e.claim,
      featureRefs: valid,
      signatures: valid.map((n) =>
        computeSignature({
          type: features[n].type,
          location: features[n].location,
          condition: features[n].condition,
          confidence: features[n].confidence,
          category_hint: features[n].category_hint,
        } as never)
      ),
      groundedConfidence: valid.length > 0 ? Math.max(...valid.map((n) => features[n].confidence)) : 0,
    }
  })
}

function enrich(c: Candidate, tenure: Tenure | null, features: MergedFeature[]): EnrichedRecommendation {
  const safety = checkSafety(c)

  let verdict: Verdict
  let verdictReason: string
  let nextAction = c.next_action
  let riskLevel: 'none' | 'low' | 'pro_required' = 'none'

  if (safety.isSafetyRouted) {
    verdict = 'INVESTIGATE'
    verdictReason = `R1_safety:${safety.flag}`
    nextAction = safety.nextStep ?? nextAction
    riskLevel = 'pro_required'
  } else if (c.duplicate_of_present_equipment) {
    verdict = 'SKIP'
    verdictReason = 'R2_duplicate_equipment'
    nextAction = 'Your photos show equipment already doing this job — no purchase needed.'
  } else if (tenure === 'rent' && !c.renter_reversible) {
    verdict = 'SKIP'
    verdictReason = 'R3_renter_irreversible'
    nextAction = 'This is a permanent change — as a renter, flag it to your landlord instead of buying.'
  } else if (c.confidence < CONFIDENCE_FLOOR_INVESTIGATE) {
    verdict = 'INVESTIGATE'
    verdictReason = 'R4_low_confidence'
    riskLevel = 'low'
  } else if (c.suggested_lean === 'not_worth_it') {
    verdict = 'SKIP'
    verdictReason = 'R5_lean_not_worth_it'
  } else if (c.suggested_lean === 'can_wait') {
    verdict = 'WAIT'
    verdictReason = 'R6_lean_can_wait'
  } else if (c.suggested_lean === 'needs_verification') {
    verdict = 'INVESTIGATE'
    verdictReason = 'R7_lean_needs_verification'
    riskLevel = 'low'
  } else if (c.suggested_lean === 'worth_buying' && c.confidence >= CONFIDENCE_FLOOR_BUY) {
    verdict = 'BUY'
    verdictReason = 'R8_lean_worth_buying'
  } else {
    verdict = 'WAIT'
    verdictReason = 'R9_fallback_uncertain'
  }

  // Cost/rebate/citations — dataset only. "other" category → no numbers.
  const item = c.dataset_category !== 'other' ? matchItem(c.dataset_category, c.title) : null
  const rebate = item ? rebateFromItem(item) : null
  const citations = item ? [citationFromItem(item)] : []

  // INVESTIGATE recs can never become cart items until resolved to BUY;
  // only BUY recs are cart-eligible at all (continuum rule).
  const smartCartEligible = verdict === 'BUY'

  return {
    key: c.key,
    verdict,
    verdictReason,
    title: c.title,
    summary: c.summary,
    visibleEvidence: c.visible_evidence.map((e) => e.claim),
    claimLinks: resolveClaimLinks(c, features),
    costLow: item?.costLow ?? null,
    costHigh: item?.costHigh ?? null,
    benefitType: c.benefit_type,
    confidenceScore: c.confidence,
    confidenceLabel: c.confidence >= 0.75 ? 'high' : c.confidence >= 0.5 ? 'medium' : 'low',
    assumptions: c.assumptions,
    limitations: c.limitations,
    riskLevel,
    clarifyingQuestions: c.clarifying_questions,
    smartCartEligible,
    nextAction,
    rebate,
    citations,
    disclosureTier: 'free', // finalized in decideVerdicts()
    // Free-tier commerce: category-search affiliate link on BUY recs only —
    // the ONLY commerce surface the Check has. Never a SKU.
    categorySearchQuery: verdict === 'BUY' ? c.amazon_search_query : null,
    cartMeta: {
      productCategory: c.product_category,
      requiredSpecs: c.required_specs,
      quantity: c.quantity,
      installDifficulty: c.install_difficulty,
      searchQuery: c.amazon_search_query,
    },
    cartArtifacts: [], // filled by cart.ts for BUY recs
    sortOrder: 0,
  }
}

/** The rendered affiliate link for a BUY rec's category search. */
export function categorySearchUrl(rec: EnrichedRecommendation): string | null {
  return rec.categorySearchQuery ? buildAmazonUrl(rec.categorySearchQuery) : null
}
