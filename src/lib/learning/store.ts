/**
 * v7.3.3-C-PR2 — LearningStore CRUD wrappers.
 *
 * Thin layer on top of Prisma's LearningStore model. Centralizes the
 * RecommendationPayload type so every caller speaks the same shape,
 * and provides the lookupBySignature / upsertRecommendation /
 * recordImpression helpers the synthesis pipeline needs.
 *
 * PR3 will add recordReaction wrappers; for PR2 we initialize counts
 * to zero and only the synthesis pipeline writes to the table.
 */

import { prisma } from '@/lib/db'
import type { LearningStore } from '@prisma/client'

// =============================================================================
// PAYLOAD TYPE
// =============================================================================

/**
 * The recommendation a synthesis call produces for one feature.
 *
 * Three flavors of recommendation are supported:
 *
 *   1. Product pick: `lane = 'BUY'`, `product` populated. Affiliate
 *      link rendered in the cart.
 *   2. Informational (no product): any lane, `product` omitted.
 *      Examples: SKIP (don't buy, existing equipment is fine),
 *      PRO_LINE (call a pro because needs sizing/inspection beyond
 *      what we can recommend), WAIT (monitor for a season before
 *      acting).
 *   3. Hybrid: lane + product + additional caution. The product is the
 *      primary suggestion but the cart still renders the caution.
 *
 * `headline` is the short title shown in the cart row (e.g. "Skip a
 * second dehumidifier"). `reasoning` is the longer-form prose that
 * explains why (rendered as the cart row body). Both come from
 * curation or from the per-feature LLM synthesis prompt.
 */
/**
 * v7.3.4 commerce-moment amendment: lane vocab is now 4 lanes.
 * - BUY: this product, at this tier, for the project the customer is shopping for
 * - SKIP: common recommendation that does NOT apply to this customer (saves money)
 * - WAIT: buy this later — here's the trigger (which may include "after a pro
 *   assesses X"). WAIT is also the routing for items that previously would
 *   have been PRO_LINE; the prose names the prerequisite explicitly.
 * - MONITOR: track this condition before spending on related products
 *
 * PRO_LINE / 'CALL A PRO' was removed in v7.3.4-PR3.6 because Alder has no
 * contractor network to route to; the lane was a false promise. Existing
 * LearningStore rows with lane='PRO_LINE' are migrated in-place to lane='WAIT'
 * with reframed prose by scripts/migrate-pro-line-to-wait.ts.
 */
export type CartLane = 'BUY' | 'SKIP' | 'WAIT' | 'MONITOR'

export type CartTier = 'budget' | 'sweet_spot' | 'premium'

export interface RecommendedProduct {
  /** Stable universe entry id from src/content/smart-cart/universe.ts. */
  universeId: string
  productName: string
  affiliateUrl: string
  priceBand: string
  tier: CartTier
}

export interface RecommendationPayload {
  lane: CartLane
  headline: string
  reasoning: string
  /** matches OpenFeature.category_hint of the signature */
  category: string
  /** present only when the recommendation is a buyable product */
  product?: RecommendedProduct
  /**
   * Optional extra caution shown alongside a BUY recommendation, or
   * the body of a WAIT/PRO_LINE recommendation. Free-text, kept short.
   */
  caution?: string
}

// =============================================================================
// LOOKUP
// =============================================================================

/**
 * Pull a single LearningStore row by its featureSignature. Returns
 * null if not yet cached.
 *
 * Side-effect-free — recordImpression() is the explicit call to
 * increment counters when the recommendation is actually surfaced to
 * a visitor.
 */
export async function lookupBySignature(
  featureSignature: string
): Promise<LearningStore | null> {
  return prisma.learningStore.findUnique({ where: { featureSignature } })
}

/**
 * Pull many signatures at once. Returns a Map keyed by signature for
 * O(1) caller lookup. Missing signatures are absent from the map
 * (caller uses .get() and null-checks).
 */
export async function lookupManyBySignature(
  signatures: string[]
): Promise<Map<string, LearningStore>> {
  if (signatures.length === 0) return new Map()
  const rows = await prisma.learningStore.findMany({
    where: { featureSignature: { in: signatures } },
  })
  const map = new Map<string, LearningStore>()
  for (const row of rows) map.set(row.featureSignature, row)
  return map
}

// =============================================================================
// WRITE
// =============================================================================

export interface UpsertOptions {
  featureSignature: string
  recommendationPayload: RecommendationPayload
  source: 'curated' | 'ai_generated'
  modelVersion?: string
  promptVersion?: string
}

/**
 * Insert a new cache entry. If a row for this signature already
 * exists, update its payload + source + model meta and reset counts
 * to zero (re-synthesis means we want fresh reaction data).
 *
 * Returns the row.
 */
export async function upsertRecommendation(
  opts: UpsertOptions
): Promise<LearningStore> {
  return prisma.learningStore.upsert({
    where: { featureSignature: opts.featureSignature },
    create: {
      featureSignature: opts.featureSignature,
      recommendationPayload: opts.recommendationPayload as never,
      source: opts.source,
      modelVersion: opts.modelVersion,
      promptVersion: opts.promptVersion,
    },
    update: {
      recommendationPayload: opts.recommendationPayload as never,
      source: opts.source,
      modelVersion: opts.modelVersion,
      promptVersion: opts.promptVersion,
      // Re-synthesis resets the trust curve. PR3+ may relax this so
      // partial trust carries forward, but for v0 simplicity: a new
      // payload means starting over.
      thumbsUpCount: 0,
      dismissCount: 0,
      doesntApplyCount: 0,
      impressionCount: 0,
    },
  })
}

/**
 * Increment the impressionCount for a list of signatures, called from
 * the synthesis route when recommendations are about to be rendered.
 *
 * Uses a single SQL UPDATE for efficiency rather than N round trips.
 * Silently ignores signatures that aren't in the store yet (the row
 * gets created by upsertRecommendation in the same synthesis run, so
 * this can run before or after).
 */
export async function recordImpressions(signatures: string[]): Promise<void> {
  if (signatures.length === 0) return
  await prisma.learningStore.updateMany({
    where: { featureSignature: { in: signatures } },
    data: { impressionCount: { increment: 1 } },
  })
}

// =============================================================================
// CONFIDENCE FUNCTION (v0)
// =============================================================================

/**
 * Compute a confidence score for a LearningStore row based on its
 * reaction counts. Returns null when there's not enough data to score
 * (used to drive "new for your situation" labels in PR3).
 *
 * Algorithm (v0, intentionally simple — see brief sidebar):
 *
 *   - Below MIN_IMPRESSIONS impressions: return null (untested).
 *   - Otherwise: thumbsUp / (thumbsUp + dismiss + doesntApply).
 *   - Curated rows get a confidence floor of 0.5 even with zero
 *     reactions, so seed entries don't show as "new" to first users.
 *
 * v0.1+ ideas (deferred):
 *   - Wilson-score lower bound on the ratio
 *   - Time-decay on old reactions
 *   - Per-anon weighting (one user's 10 dismissals shouldn't dominate)
 */
const MIN_IMPRESSIONS_FOR_CONFIDENCE = 3

export function computeConfidence(row: LearningStore): number | null {
  if (row.source === 'curated' && row.impressionCount === 0) {
    // Curated rows are trusted by default until proven otherwise.
    return 0.5
  }
  if (row.impressionCount < MIN_IMPRESSIONS_FOR_CONFIDENCE) {
    return null
  }
  const reactions =
    row.thumbsUpCount + row.dismissCount + row.doesntApplyCount
  if (reactions === 0) return null
  return row.thumbsUpCount / reactions
}

/**
 * Whether the recommendation should render with the "high confidence"
 * treatment (per PR3 transparency UI). Threshold tunable.
 */
export function isHighConfidence(row: LearningStore): boolean {
  if (row.source === 'curated') return true
  const conf = computeConfidence(row)
  return conf !== null && conf >= 0.6
}
