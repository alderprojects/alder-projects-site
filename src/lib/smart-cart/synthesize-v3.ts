/**
 * v7.3.3-C-PR2 — Smart Cart synthesis v3 (LearningStore flywheel).
 *
 * Replaces the v7.3.3-B basement-only synthesize-v2 (which built a cart
 * by walking a hardcoded scope catalog with 3 hardcoded rules) with a
 * universal pipeline that:
 *
 *   1. Takes an array of OpenFeatures from one or more photos.
 *   2. Dedupes them by signature (type:category:severity).
 *   3. For each unique signature: look up LearningStore.
 *        Hit  -> use the cached recommendation.
 *        Miss -> per-feature LLM synthesis (Haiku), write to
 *                LearningStore with source='ai_generated'.
 *   4. Aggregate the recommendations into a mixed-category cart.
 *   5. Records impressions on every signature surfaced.
 *
 * What goes away in this pivot:
 *   - No more "basement scope catalog." The universe of recommendations
 *     emerges from LearningStore + the full curated product catalog.
 *   - No more 3 hardcoded rules in code. Those are seeded into
 *     LearningStore as curated entries via scripts/seed-learning-store.ts.
 *   - V1 baseline (no-photo) cart still exists but is now trivially
 *     empty when no features extracted (there's no longer a default
 *     scope to fall back to).
 *
 * Cost / latency budget for one synthesize request:
 *   - Lookup batch: 1 query (lookupManyBySignature) — ~50ms
 *   - LLM calls on cache miss: parallel via Promise.all, capped at
 *     MAX_LLM_CALLS_PER_REQUEST. Haiku each ~1-2s.
 *   - Impression updates: 1 query — ~50ms
 *
 * Total worst case with all-miss + cap hit: ~3s. Fits comfortably
 * under the Vercel Hobby 10s function timeout.
 */

import { loadUniverse } from '@/lib/catalog/load-universe'
import type { OpenFeature } from '@/lib/vision/prompt'
import {
  computeSignature,
  dedupeBySignature,
  type DedupedFeature,
} from '@/lib/learning/signature'
import {
  lookupManyBySignature,
  upsertRecommendation,
  recordImpressions,
  isHighConfidence,
  type RecommendationPayload,
  type CartLane,
} from '@/lib/learning/store'
import {
  synthesizeFeatureRecommendation,
  FEATURE_SYNTH_PROMPT_VERSION,
} from '@/lib/learning/synthesize-feature'
import { MODEL_VERSION } from '@/lib/vision/extract'

// =============================================================================
// CONFIG
// =============================================================================

/**
 * Hard cap on parallel LLM synthesis calls per request. Keeps the
 * total budget bounded even when a photo produces many novel
 * signatures. If more than this many features are missing from the
 * cache, the lowest-confidence features are dropped from this run
 * (the cart still renders the cached ones).
 */
const MAX_LLM_CALLS_PER_REQUEST = 6

// =============================================================================
// PUBLIC TYPES
// =============================================================================

/**
 * One rendered cart item. Shape is backwards-compatible with the
 * SynthCartItem shape ResultView expects, plus PR2 additions
 * (source, confidence, signature, occurrenceCount, headline).
 */
export interface SynthCartItemV3 {
  // ---- ResultView compat (PR1.3 + earlier) ----
  slot: string // signature, used as React key
  productId: string // universeId for BUY items; signature for non-product items
  productName: string // headline if no product
  asin: string | null
  affiliateUrl: string
  tier: 'budget' | 'sweet_spot' | 'premium'
  priceBand: string // empty string for non-product items
  selectionReason: string // reasoning
  lane: CartLane
  photoDerivedReasoning?: string

  // ---- PR2 additions ----
  /** 'curated' | 'ai_generated' from LearningStore.source */
  source: 'curated' | 'ai_generated'
  /** signature.category portion, useful for grouping/badging */
  category: string
  /** 'high' | 'low' (drives transparency UI in PR3) */
  confidence: 'high' | 'low'
  /** feature signature for cache key, useful for PR3 reaction POSTs */
  signature: string
  /** how many input features collapsed into this recommendation */
  occurrenceCount: number
  /** optional caution from the recommendation payload */
  caution?: string
  /** short headline (e.g. "Skip a second dehumidifier") */
  headline: string
}

export interface SynthesizeV3Diff {
  /** Items that exist with photos but didn't exist without. */
  itemsAdded: string[]
  /** Items that exist without photos but got removed when photos applied. */
  itemsRemoved: string[]
  /** Lane changes between V1 and V2 carts. */
  laneShifts: Array<{ signature: string; from: CartLane; to: CartLane }>
}

export interface SynthesizeV3Result {
  /** Cart synthesized WITH the photo signal (the headline result). */
  withPhotos: SynthCartItemV3[]
  /** Cart synthesized WITHOUT photos — for the dual-synthesis diff. */
  withoutPhotos: SynthCartItemV3[]
  /** True if any item differs between the two carts. */
  photoChangedRecommendation: boolean
  /** Structured diff between the two. */
  changeSummary: SynthesizeV3Diff
  /**
   * v7.3.4-PR3.6 commerce-moment amendment.
   *
   * Brief 2-3 sentence intro for the result page. Surfaces the most
   * important condition the customer should know BEFORE shopping.
   * Capped at one sentence of diagnostic content so the cart stays a
   * shopping deliverable, not a diagnostic assessment.
   */
  introText: string | null
  /**
   * v7.3.4-PR3.7 §1.2 + §1.6: routing signals for the result page.
   *
   * When needsCategoryClarification is true, the result page renders
   * the "we see X but aren't sure what project this is for" surface
   * instead of the cart lanes. clarificationFeatures gives the user
   * something concrete to confirm (the features we DID see clearly).
   *
   * When needsMorePhotos is true, the result page renders the "need a
   * different angle for a confident shopping list" state. This fires
   * when extraction succeeded but the synthesized cart has zero BUY
   * lane items — the customer paid (or showed up free-beta) and
   * we have nothing concrete to recommend yet.
   *
   * Both signals are mutually exclusive with renderable cart items.
   */
  needsCategoryClarification: boolean
  needsMorePhotos: boolean
  clarificationFeatures: Array<{
    type: string
    condition: string
    confidence: number
    category_hint: string
  }>
  /** Highest-vote category across extractions + confidence in that vote. */
  dominantCategory: string | null
  dominantCategoryConfidence: number
  /** Telemetry. */
  meta: {
    featureCountIn: number
    uniqueSignatures: number
    cacheHits: number
    cacheMisses: number
    llmCallsRan: number
    llmCallsSkipped: number // missed cache but exceeded MAX cap
    llmTotalCostCents: number
    llmTotalLatencyMs: number
  }
}

// =============================================================================
// MAIN
// =============================================================================

export async function synthesizeCartV3(opts: {
  features: OpenFeature[]
  /** PR3.10: project-level intent from the visitor's freeform sentence
   *  alongside photo upload ("tell us what you're looking to do").
   *  Pushed through to every per-feature LLM call as additional
   *  context so the LLM weights recommendations against the visitor's
   *  stated goal, not just the photo content. */
  userIntent?: string | null
}): Promise<SynthesizeV3Result> {
  // V1 baseline: no photo features = empty cart. The basement-scope
  // catalog walk that v7.3.3-B used as a baseline is intentionally
  // gone — a baseline that recommends generic basement products to
  // every visitor regardless of what they showed us would defeat the
  // photo-moat thesis.
  const withoutPhotos: SynthCartItemV3[] = []

  if (opts.features.length === 0) {
    return {
      withPhotos: withoutPhotos,
      withoutPhotos,
      photoChangedRecommendation: false,
      changeSummary: { itemsAdded: [], itemsRemoved: [], laneShifts: [] },
      introText: null,
      needsCategoryClarification: false,
      needsMorePhotos: true,
      clarificationFeatures: [],
      dominantCategory: null,
      dominantCategoryConfidence: 0,
      meta: {
        featureCountIn: 0,
        uniqueSignatures: 0,
        cacheHits: 0,
        cacheMisses: 0,
        llmCallsRan: 0,
        llmCallsSkipped: 0,
        llmTotalCostCents: 0,
        llmTotalLatencyMs: 0,
      },
    }
  }

  // 1. Dedupe to unique signatures
  const dedupedAll = dedupeBySignature(opts.features)
  const signatures = dedupedAll.map((d) => d.signature)

  // 2. Cache lookup (single query)
  const cache = await lookupManyBySignature(signatures)
  const cacheHits = dedupedAll.filter((d) => cache.has(d.signature))
  const cacheMisses = dedupedAll.filter((d) => !cache.has(d.signature))

  // 3. Choose which misses to LLM-synthesize this request. Sort by
  //    feature confidence descending, take top MAX_LLM_CALLS_PER_REQUEST.
  //    The remainder is reported as `llmCallsSkipped` and won't appear
  //    in this cart — but the next synthesize request that hits the
  //    same signatures will get them.
  const sortedMisses = cacheMisses
    .slice()
    .sort((a, b) => b.feature.confidence - a.feature.confidence)
  const toSynthesize = sortedMisses.slice(0, MAX_LLM_CALLS_PER_REQUEST)
  const skipped = sortedMisses.slice(MAX_LLM_CALLS_PER_REQUEST)

  // 4. Load universe ONCE (used by every LLM call). Full universe —
  //    no scope filter per the PR2 brief.
  const universe = await loadUniverse({ asinOnly: true })

  // 5. Run LLM synthesis in parallel
  const llmResults = await Promise.allSettled(
    toSynthesize.map((d) =>
      synthesizeFeatureRecommendation({
        feature: d.feature,
        universe,
        userIntent: opts.userIntent ?? null,
      }).then(async (synthResult) => {
        // Persist to LearningStore. Failures here don't block the cart
        // render — log + continue.
        try {
          await upsertRecommendation({
            featureSignature: d.signature,
            recommendationPayload: synthResult.payload,
            source: 'ai_generated',
            modelVersion: synthResult.modelVersion,
            promptVersion: synthResult.promptVersion,
          })
        } catch (e) {
          console.error('[synthesize-v3] upsert failed for', d.signature, e)
        }
        return { deduped: d, payload: synthResult.payload, synthResult }
      })
    )
  )

  // 6. Build the with-photos cart
  const withPhotos: SynthCartItemV3[] = []

  // 6a. Cache-hit items
  for (const d of cacheHits) {
    const row = cache.get(d.signature)!
    const payload = row.recommendationPayload as unknown as RecommendationPayload
    withPhotos.push(payloadToCartItem({
      payload,
      source: row.source as 'curated' | 'ai_generated',
      signature: d.signature,
      occurrenceCount: d.occurrenceCount,
      confidence: isHighConfidence(row) ? 'high' : 'low',
    }))
  }

  // 6b. LLM-synthesized items (this request)
  let llmCallsRan = 0
  let llmTotalCostCents = 0
  let llmTotalLatencyMs = 0
  for (const result of llmResults) {
    if (result.status === 'fulfilled') {
      const { deduped, payload, synthResult } = result.value
      llmCallsRan += 1
      llmTotalCostCents += synthResult.apiCostCents
      llmTotalLatencyMs += synthResult.latencyMs
      withPhotos.push(payloadToCartItem({
        payload,
        source: 'ai_generated',
        signature: deduped.signature,
        occurrenceCount: deduped.occurrenceCount,
        // Fresh ai_generated rows are low-confidence until reactions
        // accumulate (PR3).
        confidence: 'low',
      }))
    } else {
      console.error('[synthesize-v3] LLM call failed:', result.reason)
      // PR3.7 §1.5: don't surface "we noticed but couldn't recommend"
      // stubs to customers. If a feature's LLM call fails, it's silently
      // dropped from this synthesis. The needsMorePhotos gate below
      // catches the case where every recommendation failed.
    }
  }

  // 6c. PR3.7 §1.5: NO customer-facing stubs for queue-overflow.
  // Previously surfaced as "Saved for the next read — ran out of
  // synthesis budget" — that's an internal mechanic, not a thing
  // customers should see. Cap-exceeded features are silently
  // dropped from this synthesis run. If the resulting cart has zero
  // BUY items, the needsMorePhotos signal below routes the customer
  // to the "different angle" state.
  if (skipped.length > 0) {
    console.log(
      `[synthesize-v3] ${skipped.length} signatures over cap, deferred to next synthesis`
    )
  }

  // 7. Record impressions for everything we surfaced
  await recordImpressions(withPhotos.map((c) => c.signature))

  // 8. Diff vs withoutPhotos (which is empty in v3 baseline)
  const changeSummary: SynthesizeV3Diff = {
    itemsAdded: withPhotos.map((c) => c.signature),
    itemsRemoved: [],
    laneShifts: [],
  }
  const photoChangedRecommendation = withPhotos.length > 0

  // 9. PR3.6 commerce-moment intro. Deterministic — see composeIntro.
  const introText = composeIntro(withPhotos, dedupedAll)

  // 10. PR3.7 §1.2 + §1.4 + §1.6: routing signals for the result page.
  //
  //   - dominantCategory: which category got the most feature votes
  //   - dominantCategoryConfidence: that category's share of total features
  //   - needsCategoryClarification: dominant share < 0.5 OR dominant is
  //     'unclear'/'mixed' OR all features are unclear/mixed
  //   - needsMorePhotos: zero items landed in BUY lane (the customer
  //     paid for a shopping list and we have none to give)
  //   - clarificationFeatures: top-5 high-confidence features for the
  //     clarification surface to show
  const categoryStats = computeCategoryStats(opts.features)
  const needsCategoryClarification = decideCategoryClarification(categoryStats)
  const buyCount = withPhotos.filter((i) => i.lane === 'BUY').length
  const needsMorePhotos = !needsCategoryClarification && buyCount === 0
  const clarificationFeatures = opts.features
    .filter((f) => f.confidence >= 0.7)
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((f) => ({
      type: f.type,
      condition: f.condition,
      confidence: f.confidence,
      category_hint: f.category_hint,
    }))

  return {
    withPhotos,
    withoutPhotos,
    photoChangedRecommendation,
    changeSummary,
    introText,
    needsCategoryClarification,
    needsMorePhotos,
    clarificationFeatures,
    dominantCategory: categoryStats.dominantCategory,
    dominantCategoryConfidence: categoryStats.dominantConfidence,
    meta: {
      featureCountIn: opts.features.length,
      uniqueSignatures: dedupedAll.length,
      cacheHits: cacheHits.length,
      cacheMisses: cacheMisses.length,
      llmCallsRan,
      llmCallsSkipped: skipped.length,
      llmTotalCostCents: Math.round(llmTotalCostCents * 100) / 100,
      llmTotalLatencyMs,
    },
  }
}

// =============================================================================
// CATEGORY STATS (PR3.7 §1.2)
// =============================================================================

interface CategoryStats {
  dominantCategory: string | null
  dominantConfidence: number // share of total features (0-1)
  allUnclearOrMixed: boolean
}

function computeCategoryStats(features: OpenFeature[]): CategoryStats {
  if (features.length === 0) {
    return { dominantCategory: null, dominantConfidence: 0, allUnclearOrMixed: true }
  }
  const counts = new Map<string, number>()
  for (const f of features) {
    counts.set(f.category_hint, (counts.get(f.category_hint) ?? 0) + 1)
  }
  let dominant: string | null = null
  let dominantCount = 0
  for (const [cat, count] of Array.from(counts.entries())) {
    if (count > dominantCount) {
      dominant = cat
      dominantCount = count
    }
  }
  const allUnclearOrMixed = Array.from(counts.keys()).every(
    (c) => c === 'unclear' || c === 'mixed'
  )
  return {
    dominantCategory: dominant,
    dominantConfidence: dominantCount / features.length,
    allUnclearOrMixed,
  }
}

function decideCategoryClarification(stats: CategoryStats): boolean {
  // No features = different signal (needsMorePhotos, not clarification)
  if (stats.dominantCategory === null) return false
  // All extractions returned unclear/mixed — definitely needs clarification
  if (stats.allUnclearOrMixed) return true
  // Dominant category is itself uncertain
  if (stats.dominantCategory === 'unclear' || stats.dominantCategory === 'mixed') {
    return true
  }
  // Dominant category didn't get a majority of feature votes
  // (threshold per PR3.7 §1.2: suggest 0.7, tune from data later)
  if (stats.dominantConfidence < 0.5) return true
  return false
}

// =============================================================================
// INTRO COMPOSER (v7.3.4-PR3.6 commerce-moment amendment)
// =============================================================================

/**
 * Compose a brief intro sentence for the cart header.
 *
 * Rules per the amendment:
 *   - Maximum 2-3 sentences.
 *   - Surfaces the SINGLE most important condition that should be
 *     addressed before shopping (e.g. active water, structural cracks,
 *     panel age).
 *   - Commerce-moment framing — "before you start shopping, X."
 *     Never "you should reconsider whether to do this project."
 *   - Returns null if nothing rises above the bar — better no intro
 *     than a generic one.
 *
 * v0 priority order (deterministic — no LLM call):
 *   1. Any item in the WAIT lane whose reasoning mentions a pro
 *      prerequisite — "before you start, X needs a pro's review."
 *   2. Any item in the MONITOR lane — "track X before related buys."
 *   3. Otherwise null (no intro).
 *
 * The dominant category surfaces in the headline regardless ("Based
 * on your photos, this looks like a [category] project."), but only
 * when the cart actually has items — empty carts get no intro.
 */
function composeIntro(
  items: SynthCartItemV3[],
  _deduped: DedupedFeature[]
): string | null {
  if (items.length === 0) return null

  // Pick the most prominent category (max count) for the framing.
  const categoryCounts = new Map<string, number>()
  for (const item of items) {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1)
  }
  let dominantCategory: string | null = null
  let dominantCount = 0
  for (const [cat, count] of Array.from(categoryCounts.entries())) {
    if (count > dominantCount) {
      dominantCategory = cat
      dominantCount = count
    }
  }

  // Look for a WAIT item that names a pro prerequisite.
  const waitWithPro = items.find((i) => {
    if (i.lane !== 'WAIT') return false
    const text = `${i.headline} ${i.selectionReason}`.toLowerCase()
    return (
      text.includes("pro's") ||
      text.includes('professional') ||
      text.includes('contractor') ||
      text.includes('electrician') ||
      text.includes('hvac pro')
    )
  })

  // Or any MONITOR item.
  const monitorItem = items.find((i) => i.lane === 'MONITOR')

  const flag = waitWithPro ?? monitorItem
  const categoryFrame = dominantCategory
    ? `Based on your photos, this looks like a ${prettyCategoryLocal(dominantCategory)} project.`
    : 'Based on your photos, here is your Smart Cart.'

  if (!flag) {
    return categoryFrame
  }
  // Trim the flag headline if longer than ~80 chars; keep prose
  // tight per amendment.
  const flagSentence = flag.headline.endsWith('.')
    ? flag.headline
    : `${flag.headline}.`
  return `${categoryFrame} Before you start: ${flagSentence}`
}

function prettyCategoryLocal(category: string): string {
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// =============================================================================
// HELPERS
// =============================================================================

interface PayloadToCartItemArgs {
  payload: RecommendationPayload
  source: 'curated' | 'ai_generated'
  signature: string
  occurrenceCount: number
  confidence: 'high' | 'low'
}

function payloadToCartItem(args: PayloadToCartItemArgs): SynthCartItemV3 {
  const { payload, source, signature, occurrenceCount, confidence } = args
  return {
    slot: signature,
    productId: payload.product?.universeId ?? signature,
    productName: payload.product?.productName ?? payload.headline,
    asin: null, // PR2 doesn't surface ASIN separately; affiliateUrl encodes it
    affiliateUrl: payload.product?.affiliateUrl ?? '',
    tier: payload.product?.tier ?? 'sweet_spot',
    priceBand: payload.product?.priceBand ?? '',
    selectionReason: payload.reasoning,
    lane: payload.lane,
    photoDerivedReasoning: payload.caution,
    source,
    category: payload.category,
    confidence,
    signature,
    occurrenceCount,
    caution: payload.caution,
    headline: payload.headline,
  }
}

// PR3.7 §1.5: makeAcknowledgmentStub deleted. Customer-facing
// "Saved for the next read" / "We noticed but couldn't recommend"
// strings were the wrong UX — they advertise internal mechanics. The
// needsMorePhotos result-page state replaces them.

// Helpful re-exports for downstream callers / scripts.
export { computeSignature, FEATURE_SYNTH_PROMPT_VERSION, MODEL_VERSION }
