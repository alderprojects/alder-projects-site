/**
 * Dual-synthesis Smart Cart V2 for the v7.3.3 basement moisture beta.
 *
 * Synthesizes the same cart TWICE — once without photo signal (V1
 * baseline), once with photo signal (V2) — then diffs them. The result
 * captures both rendered carts plus `photoChangedRecommendation` plus
 * a structured diff. SmartCart persistence stores all four fields.
 *
 * This is the kill-metric harness for the entire photo-moat thesis.
 * If `photoChangedRecommendation` is true less than ~40% of the time
 * by end of v7.3.3 beta, the moat thesis is in trouble.
 *
 * Scope: basement_moisture only. Other scopes continue to use v7.2.x's
 * `buildSmartCart` / `buildSmartCartV2` (no photo signal).
 *
 * Rules that DO fire against the live basement_moisture_prep scope:
 *   - dehumidifier_present → lane-shift basement_dehumidifier to SKIP
 *   - active_water         → upgrade basement_dehumidifier tier to premium
 *                            + upgrade basement_moisture_meter tier to premium
 *   - finishState=finished → lane-shift basement_vapor_barrier to SKIP
 *
 * Rules referenced in the v7.3.3 spec but NO-OP because the
 * basement_moisture_prep scope has no matching slot (backlog for
 * v7.3.4 scope-catalog expansion):
 *   - sump_pump_present, efflorescence, staining, visible_cracks
 *
 * The synthesizer otherwise applies V1 defaults: every core slot is
 * BUY at sweet_spot tier; every addon slot is BUY at sweet_spot tier.
 * (v7.2.x's full builder is richer; we keep it minimal here for the
 * beta — no scenario defaults, no already-have toggles, no tiered
 * pricing experiment.)
 */

import { getAllCatalogs } from '@/content/smart-cart'
import { loadUniverse } from '@/lib/catalog/load-universe'
import type { ScopeCatalog, ScopeCatalogSlot, CartTier } from '@/lib/smart-cart-model'
import type { UniverseProduct } from '@/lib/smart-cart-universe'
import type { BasementExtraction, BasementMoistureSignal } from '@/lib/vision/extract'

export type CartLane = 'BUY' | 'SKIP' | 'WAIT' | 'PRO_LINE'

export interface SynthCartItem {
  slot: string
  productId: string
  productName: string
  asin: string | null
  affiliateUrl: string
  tier: CartTier
  priceBand: string
  selectionReason: string
  lane: CartLane
  photoDerivedReasoning?: string
}

export interface DualSynthChangeSummary {
  itemsAdded: string[]
  itemsRemoved: string[]
  tierShifts: Array<{ slot: string; from: CartTier; to: CartTier }>
  laneShifts: Array<{ productId: string; from: CartLane; to: CartLane }>
}

export interface DualSynthResult {
  withoutPhotos: SynthCartItem[]
  withPhotos: SynthCartItem[]
  photoChangedRecommendation: boolean
  changeSummary: DualSynthChangeSummary
}

interface AggregatedSignal {
  signals: Set<BasementMoistureSignal>
  finishState: BasementExtraction['finishState']
  meanConfidence: number
}

// =============================================================================
// MAIN
// =============================================================================

export async function synthesizeBasementCart(opts: {
  projectId: string
  extractions: BasementExtraction[]
}): Promise<DualSynthResult> {
  const catalog = getAllCatalogs().find((c) => c.scopeVariantId === 'basement_moisture_prep')
  if (!catalog) {
    throw new Error('basement_moisture_prep scope catalog not found in registry')
  }

  const universe = await loadUniverse({ scope: 'basement' })

  const withoutPhotos = synthesizeFromCatalog(catalog, universe, null)

  const aggregated = aggregateExtractions(opts.extractions)
  const withPhotos = synthesizeFromCatalog(catalog, universe, aggregated)

  const summary = diffCarts(withoutPhotos, withPhotos)
  const changed =
    summary.itemsAdded.length > 0 ||
    summary.itemsRemoved.length > 0 ||
    summary.tierShifts.length > 0 ||
    summary.laneShifts.length > 0

  return {
    withoutPhotos,
    withPhotos,
    photoChangedRecommendation: changed,
    changeSummary: summary,
  }
}

// =============================================================================
// SIGNAL AGGREGATION
// =============================================================================

function aggregateExtractions(
  extractions: BasementExtraction[]
): AggregatedSignal | null {
  if (extractions.length === 0) return null
  const signals = new Set<BasementMoistureSignal>()
  for (const e of extractions) {
    for (const s of e.moistureSignals) signals.add(s)
  }
  // Use the first photo's finishState as the canonical read — wide shots
  // typically come first in user uploads. Multi-photo finishState
  // consensus is a v7.3.4 refinement.
  const finishState = extractions[0]!.finishState
  const meanConfidence =
    extractions.reduce((acc, e) => acc + e.overallConfidence, 0) / extractions.length
  return { signals, finishState, meanConfidence }
}

// =============================================================================
// CART SYNTHESIS (single pass)
// =============================================================================

function synthesizeFromCatalog(
  catalog: ScopeCatalog,
  universe: UniverseProduct[],
  signal: AggregatedSignal | null
): SynthCartItem[] {
  const items: SynthCartItem[] = []

  for (const slot of catalog.slots) {
    // Baseline: every slot in BUY at sweet_spot tier.
    let tier: CartTier = 'sweet_spot'
    let lane: CartLane = 'BUY'
    let photoDerivedReasoning: string | undefined

    // Apply photo-derived rules. See file header for the rule list and
    // notes about which fire vs which are no-op for v7.3.3.
    if (signal) {
      const sigs = signal.signals

      // Rule: dehumidifier_present → SKIP the dehumidifier slot
      if (slot.slotId === 'basement_dehumidifier' && sigs.has('dehumidifier_present')) {
        lane = 'SKIP'
        photoDerivedReasoning =
          'We saw a dehumidifier already running in your basement. No need to buy another.'
      }

      // Rule: active_water → upgrade dehumidifier + moisture meter to premium
      if (slot.slotId === 'basement_dehumidifier' && sigs.has('active_water') && lane === 'BUY') {
        tier = 'premium'
        photoDerivedReasoning =
          'We saw active water in your basement. The premium dehumidifier is sized for higher moisture loads.'
      }
      if (slot.slotId === 'basement_moisture_meter' && sigs.has('active_water')) {
        tier = 'premium'
        photoDerivedReasoning =
          'Active water in your basement means you need accurate readings to track drying progress — the premium pinless meter is the right tool.'
      }

      // Rule: finishState=finished → SKIP vapor barrier (pre-finish only)
      if (slot.slotId === 'basement_vapor_barrier' && signal.finishState === 'finished') {
        lane = 'SKIP'
        photoDerivedReasoning =
          'Your basement is already finished — vapor barrier sheeting goes under unfinished slabs and walls, not over finished surfaces.'
      }
    }

    const variant = pickProductForSlot(slot, universe, tier)
    if (!variant) {
      // No universe product matches this slot at this tier — skip the
      // slot entirely rather than emit a broken cart row. (Common during
      // basement beta because the universe is sparse for this scope.)
      continue
    }

    items.push({
      slot: slot.slotId,
      productId: variant.universeId,
      productName: variant.variant.productName,
      asin: variant.variant.amazonAsin ?? null,
      affiliateUrl: variant.variant.affiliateUrl,
      tier,
      priceBand: `$${variant.variant.priceLow}-$${variant.variant.priceHigh}`,
      selectionReason: slot.whyThis ?? 'Recommended for this slot.',
      lane,
      photoDerivedReasoning,
    })
  }

  return items
}

/**
 * Pick the best universe product for a slot+tier. Naive: filter by tag
 * overlap with the slot's tier query, then take the highest-rank
 * (lowest rank number) match. Falls back to any product matching the
 * sweet_spot query if the requested tier has no candidates.
 */
function pickProductForSlot(
  slot: ScopeCatalogSlot,
  universe: UniverseProduct[],
  tier: CartTier
): UniverseProduct | null {
  const tryTier = (t: CartTier): UniverseProduct | null => {
    const query = slot.tierQueries[t]
    if (!query) return null
    const matches = universe.filter((u) => {
      // mustHaveTopics: all must be present in u.tags.topics
      if (query.mustHaveTopics) {
        for (const topic of query.mustHaveTopics) {
          if (!u.tags.topics.includes(topic as never)) return false
        }
      }
      // mustHaveFunctions: at least one must match
      if (query.mustHaveFunctions && query.mustHaveFunctions.length > 0) {
        const hit = query.mustHaveFunctions.some((fn) =>
          u.tags.functions.includes(fn)
        )
        if (!hit) return false
      }
      // mustHaveRoles: all must be present
      if (query.mustHaveRoles) {
        for (const role of query.mustHaveRoles) {
          if (!u.tags.roles.includes(role as never)) return false
        }
      }
      // tier match
      if (query.tier && u.tags.tier !== query.tier) return false
      return true
    })
    if (matches.length === 0) return null
    matches.sort((a, b) => a.rank - b.rank)
    return matches[0]!
  }

  return tryTier(tier) ?? tryTier('sweet_spot')
}

// =============================================================================
// DIFF
// =============================================================================

function diffCarts(a: SynthCartItem[], b: SynthCartItem[]): DualSynthChangeSummary {
  const aIds = new Set(a.map((i) => i.productId))
  const bIds = new Set(b.map((i) => i.productId))
  // Array.from() instead of spread — repo tsconfig doesn't set
  // --downlevelIteration / --target=es2015+; same fix pattern as v7.3.2-A.
  const itemsAdded = Array.from(bIds).filter((id) => !aIds.has(id))
  const itemsRemoved = Array.from(aIds).filter((id) => !bIds.has(id))

  const tierShifts: DualSynthChangeSummary['tierShifts'] = []
  const laneShifts: DualSynthChangeSummary['laneShifts'] = []

  for (const itemA of a) {
    const itemB = b.find((x) => x.slot === itemA.slot)
    if (!itemB) continue
    if (itemA.tier !== itemB.tier) {
      tierShifts.push({ slot: itemA.slot, from: itemA.tier, to: itemB.tier })
    }
    if (itemA.lane !== itemB.lane) {
      laneShifts.push({ productId: itemA.productId, from: itemA.lane, to: itemB.lane })
    }
  }

  return { itemsAdded, itemsRemoved, tierShifts, laneShifts }
}
