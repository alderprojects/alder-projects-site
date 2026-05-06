// V7.2.3 — Smart Cart V2 builder, refactored over the hybrid
// universe + scope-catalog model.
//
// Pure function. Takes the buyer's (topic, scope, scenario, email,
// selectedTier, alreadyHave) PLUS injected scope catalog + universe
// and returns a SmartCartV2Output. Output shape unchanged from v7.2.1
// — the result page consumes the same fields. Internal sourcing
// changed from per-scope embedded products to universe queries.
//
// Lives alongside the v1 buildSmartCart; the webhook handler picks
// which builder to call via isV2Combination().

import { CONFIG } from './recommender-config'
import type { TopicId } from './property-modules'
import type { BriefScenarioId } from './recommender-config.types'
import { getScopeVariant } from './scope-variants'
import type {
  CartSlot,
  CartTier,
  CartTierVariant,
  ScopeCatalog,
  ScopeCatalogSlot,
  SkipItemV2,
  SmartCartV2Output,
  SmartCartV2Savings,
} from './smart-cart-model'
import { queryUniverse, type UniverseProduct, type UniverseQuery } from './smart-cart-universe'

const SCENARIO_LABEL: Record<BriefScenarioId, string> = {
  just_starting: 'Just starting',
  already_have_basics: 'Already have basics',
  tight_budget: 'Tight budget',
  premium: 'Premium',
  lake_property: 'Lake property',
  // v7.2.5 — second-home and seasonal-window scenarios.
  absentee_owner: 'Absentee owner',
  pre_winter_prep: 'Pre-winter prep',
  spring_opening: 'Spring opening',
  mud_season: 'Mud season',
}

export interface BuildSmartCartV2Input {
  cartId: string
  topic: TopicId
  scopeVariantId: string
  scenario: BriefScenarioId
  customerEmail: string
  customerProvidedAddress?: string
  selectedTier?: CartTier
  alreadyHave?: string[]
  /** Optional, defaults to now (used by respin to preserve). */
  createdAt?: string
  /** Optional, defaults to +30d (used by respin to preserve). */
  expiresAt?: string
}

const TTL_MS = 30 * 24 * 3600 * 1000
const SKIP_CAP = 14

/**
 * Build a v2 cart from the hybrid universe + scope catalog.
 *
 * The builder is pure and dependency-injected: catalog and universe
 * are passed in. The webhook handler resolves both from the registry
 * (`getCatalog`, `getUniverse`) before calling. Tests can construct
 * fixtures directly.
 *
 * Returns null if the scope catalog can't resolve a sweet_spot tier
 * variant for any required slot — the webhook should fall through to
 * the legacy v1 path in that case (defensive; shouldn't happen with
 * a healthy catalog).
 */
export function buildSmartCartV2(
  input: BuildSmartCartV2Input,
  catalog: ScopeCatalog,
  universe: UniverseProduct[],
): SmartCartV2Output {
  const variant = getScopeVariant(input.topic, input.scopeVariantId)
  const scopeLabel = variant?.label ?? input.scopeVariantId
  const scenarioLabel = SCENARIO_LABEL[input.scenario] ?? input.scenario

  const selectedTier = input.selectedTier ?? 'sweet_spot'
  const alreadyHave = input.alreadyHave ?? []

  // 1. Filter scope-catalog slots whose conditionalOn intersects
  //    alreadyHave. Empty conditionalOn = always visible.
  const visibleScopeSlots = catalog.slots.filter(slot => {
    if (!slot.conditionalOn.length) return true
    return !slot.conditionalOn.some(flag => alreadyHave.includes(flag))
  })

  // 2. Resolve each visible slot's tier variants from the universe.
  //    Drop slots whose required sweet_spot tier returns no product
  //    (defensive — indicates a tag-mismatch authoring bug).
  const slots: CartSlot[] = []
  for (const scopeSlot of visibleScopeSlots) {
    const composed = composeSlot(scopeSlot, universe, alreadyHave)
    if (composed) slots.push(composed)
  }

  // 3. Pull and filter skip list. Sort by potential savings desc
  //    (Type A wrong_version contributes; Type B has no amountSaved).
  //    Cap at SKIP_CAP.
  const skipList: SkipItemV2[] = catalog.skipList
    .filter(s => s.appliesToScope.includes(input.scopeVariantId))
    .map(s => ({
      id: s.id,
      type: s.type,
      title: s.title,
      marketingPitch: s.marketingPitch,
      realReason: s.realReason,
      amountSaved: s.amountSaved,
      appliesToScope: s.appliesToScope,
      citations: s.citations,
    }))
    .sort((a, b) => (b.amountSaved?.high ?? 0) - (a.amountSaved?.high ?? 0))
    .slice(0, SKIP_CAP)

  // 4. Compute savings (same math as v7.2.1).
  const savings = computeSavings(slots, skipList, selectedTier)

  const createdAt = input.createdAt ?? new Date().toISOString()
  const expiresAt =
    input.expiresAt ?? new Date(Date.now() + TTL_MS).toISOString()

  return {
    cartId: input.cartId,
    version: 2,
    product: 'smart_cart',
    topic: input.topic,
    scopeVariantId: input.scopeVariantId,
    scopeLabel,
    scenario: input.scenario,
    scenarioLabel,
    selectedTier,
    alreadyHave,
    slots,
    skipList,
    savings,
    customerEmail: input.customerEmail,
    customerProvidedAddress: input.customerProvidedAddress,
    createdAt,
    expiresAt,
    respinCount: 0,
    configVersion: CONFIG.version,
  }
}

// ---------- Slot composition ----------------------------------------

function composeSlot(
  scopeSlot: ScopeCatalogSlot,
  universe: UniverseProduct[],
  alreadyHave: string[],
): CartSlot | null {
  const sweetSpot = resolveVariant(
    scopeSlot.tierQueries.sweet_spot,
    universe,
    alreadyHave,
  )
  if (!sweetSpot) return null  // defensive — sweet_spot is required

  const tiers: CartSlot['tiers'] = { sweet_spot: sweetSpot }

  if (scopeSlot.tierQueries.budget) {
    const v = resolveVariant(scopeSlot.tierQueries.budget, universe, alreadyHave)
    if (v) tiers.budget = v
  }
  if (scopeSlot.tierQueries.premium) {
    const v = resolveVariant(scopeSlot.tierQueries.premium, universe, alreadyHave)
    if (v) tiers.premium = v
  }

  return {
    slotId: scopeSlot.slotId,
    slotLabel: scopeSlot.slotLabel,
    slotKind: scopeSlot.slotKind,
    conditionalOn: scopeSlot.conditionalOn,
    tiers,
    whyThis: scopeSlot.whyThis,
    whyNotCheaper: scopeSlot.whyNotCheaper,
    whyNotPremium: scopeSlot.whyNotPremium,
    contextNote: scopeSlot.contextNote,
    warnings: scopeSlot.warnings,
    citations: scopeSlot.citations,
  }
}

function resolveVariant(
  query: UniverseQuery,
  universe: UniverseProduct[],
  alreadyHave: string[],
): CartTierVariant | undefined {
  const results = queryUniverse(universe, query, alreadyHave)
  if (results.length === 0) return undefined
  return results[0].variant
}

// ---------- Savings math (verbatim from v7.2.1) ---------------------

function resolveTierVariant(slot: CartSlot, tier: CartTier): CartTierVariant {
  return slot.tiers[tier] ?? slot.tiers.sweet_spot
}

function computeSavings(
  slots: CartSlot[],
  skipList: SkipItemV2[],
  tier: CartTier,
): SmartCartV2Savings {
  // Lean cart total = sum of selected-tier prices for visible core
  // slots only (add-ons are optional, not part of the baseline).
  const coreSlots = slots.filter(s => s.slotKind === 'core')

  let leanLow = 0
  let leanHigh = 0
  for (const s of coreSlots) {
    const v = resolveTierVariant(s, tier)
    leanLow += v.priceLow
    leanHigh += v.priceHigh
  }

  // Typical overbuy: what they'd pay if they bought premium for every
  // slot PLUS hit the typical Type-A skip traps.
  let overbuyLow = 0
  let overbuyHigh = 0
  for (const s of coreSlots) {
    const v = s.tiers.premium ?? s.tiers.sweet_spot
    overbuyLow += v.priceLow
    overbuyHigh += v.priceHigh
  }
  for (const item of skipList) {
    if (item.type !== 'wrong_version' || !item.amountSaved) continue
    overbuyLow += item.amountSaved.low * 0.5
    overbuyHigh += item.amountSaved.high
  }

  return {
    leanCartLow: Math.round(leanLow),
    leanCartHigh: Math.round(leanHigh),
    typicalOverbuyLow: Math.round(overbuyLow),
    typicalOverbuyHigh: Math.round(overbuyHigh),
    potentialSavingsLow: Math.max(0, Math.round(overbuyLow - leanHigh)),
    potentialSavingsHigh: Math.max(0, Math.round(overbuyHigh - leanLow)),
  }
}
