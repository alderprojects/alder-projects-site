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

  const createdAt = input.createdAt ?? new Date().toISOString()
  const expiresAt =
    input.expiresAt ?? new Date(Date.now() + TTL_MS).toISOString()

  // v7.2.5 — Route-out check first. If a catalog rule matches the
  // buyer's scenario or alreadyHave, short-circuit: emit an empty
  // cart with `routedOut` set so the result page renders the
  // route-out message instead of the slot list.
  const routedOut = evaluateRouteOut(catalog, input, alreadyHave)
  if (routedOut) {
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
      slots: [],
      skipList: [],
      savings: emptySavings(),
      customerEmail: input.customerEmail,
      customerProvidedAddress: input.customerProvidedAddress,
      createdAt,
      expiresAt,
      respinCount: 0,
      configVersion: CONFIG.version,
      smartCartPromise: catalog.smartCartPromise,
      valueProposition: catalog.valueProposition,
      routedOut,
    }
  }

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

  // v7.2.5 — Build derived fields from new schema metadata.
  const nextBestGaps = buildNextBestGaps(catalog, alreadyHave)
  const bundlePrompts = buildBundlePrompts(slots, universe)
  const urgencyBanner = computeUrgencyBanner(catalog.seasonalUrgency)

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
    // v7.2.5 — pass-through fields. All omitted when undefined.
    smartCartPromise: catalog.smartCartPromise,
    valueProposition: catalog.valueProposition,
    nextBestGaps,
    bundlePrompts,
    urgencyBanner,
  }
}

// ---------- Slot composition ----------------------------------------

function composeSlot(
  scopeSlot: ScopeCatalogSlot,
  universe: UniverseProduct[],
  alreadyHave: string[],
): CartSlot | null {
  const sweetSpotProduct = resolveProduct(
    scopeSlot.tierQueries.sweet_spot,
    universe,
    alreadyHave,
  )
  if (!sweetSpotProduct) return null  // defensive — sweet_spot is required

  const tiers: CartSlot['tiers'] = { sweet_spot: sweetSpotProduct.variant }

  if (scopeSlot.tierQueries.budget) {
    const v = resolveVariant(scopeSlot.tierQueries.budget, universe, alreadyHave)
    if (v) tiers.budget = v
  }
  if (scopeSlot.tierQueries.premium) {
    const v = resolveVariant(scopeSlot.tierQueries.premium, universe, alreadyHave)
    if (v) tiers.premium = v
  }

  // v7.2.5 — forward urgency window from sweet-spot product, with
  // a computed daysRemaining alongside the raw MM-DD buyByDate.
  let urgencyWindow: CartSlot['urgencyWindow']
  const productUrgency = sweetSpotProduct.tags.urgencyWindow
  if (productUrgency) {
    urgencyWindow = {
      buyByDate: productUrgency.buyByDate,
      earliestUseful: productUrgency.earliestUseful,
      label: productUrgency.label,
      daysRemaining: computeDaysRemaining(productUrgency.buyByDate),
    }
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
    // v7.2.5 — slot-level metadata pass-through.
    slotPurpose: scopeSlot.slotPurpose,
    whyItMatters: scopeSlot.whyItMatters,
    commonMistake: scopeSlot.commonMistake,
    costBenefitClaim: sweetSpotProduct.costBenefitClaim,
    vermontReasoning: sweetSpotProduct.vermontReasoning,
    urgencyWindow,
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

function resolveProduct(
  query: UniverseQuery,
  universe: UniverseProduct[],
  alreadyHave: string[],
): UniverseProduct | undefined {
  const results = queryUniverse(universe, query, alreadyHave)
  if (results.length === 0) return undefined
  return results[0]
}

// ---------- v7.2.5 — route-out, bundles, next-best, urgency ----------

function evaluateRouteOut(
  catalog: ScopeCatalog,
  input: BuildSmartCartV2Input,
  alreadyHave: string[],
): SmartCartV2Output['routedOut'] | undefined {
  if (!catalog.routeOutRules?.length) return undefined
  for (const rule of catalog.routeOutRules) {
    // Match condition against alreadyHave flags (substring) or
    // scenario id (exact-or-substring). Loose matching is intentional
    // — catalog authors write conditions like "absentee_owner" or
    // "no_wifi" without needing structured operators.
    const matchedFlag = alreadyHave.some(flag => rule.condition.includes(flag))
    const matchedScenario = rule.condition.includes(input.scenario)
    if (matchedFlag || matchedScenario) {
      return { destination: rule.destination, reason: rule.reason }
    }
  }
  return undefined
}

function buildNextBestGaps(
  catalog: ScopeCatalog,
  alreadyHave: string[],
): SmartCartV2Output['nextBestGaps'] {
  const gaps: NonNullable<SmartCartV2Output['nextBestGaps']> = []
  for (const slot of catalog.slots) {
    if (!slot.nextBestIfAlreadyHave) continue
    const triggered = slot.conditionalOn.find(flag =>
      alreadyHave.includes(flag),
    )
    if (!triggered) continue
    gaps.push({
      triggeredByFlag: triggered,
      recommendedSlot: slot.nextBestIfAlreadyHave.targetSlotOrFunction,
      reason: slot.nextBestIfAlreadyHave.reason,
    })
  }
  return gaps.length > 0 ? gaps : undefined
}

function buildBundlePrompts(
  slots: CartSlot[],
  universe: UniverseProduct[],
): SmartCartV2Output['bundlePrompts'] {
  const prompts: NonNullable<SmartCartV2Output['bundlePrompts']> = []
  for (const slot of slots) {
    const sweetSpotName = slot.tiers.sweet_spot.productName
    const product = universe.find(
      p => p.variant.productName === sweetSpotName,
    )
    if (!product?.tags.bundleWith?.length) continue
    prompts.push({
      primaryUniverseId: product.universeId,
      bundleUniverseIds: product.tags.bundleWith,
      bundleReason: 'Buy these together for full coverage.',
    })
  }
  return prompts.length > 0 ? prompts : undefined
}

function computeUrgencyBanner(
  urgency: ScopeCatalog['seasonalUrgency'],
): SmartCartV2Output['urgencyBanner'] {
  if (!urgency) return undefined
  return {
    deadline: urgency.deadline,
    label: urgency.label,
    daysRemaining: computeDaysRemaining(urgency.deadline),
  }
}

/**
 * Days remaining until the next occurrence of an MM-DD date. If the
 * date has already passed for the current year, returns days until
 * the same date next year. Returns undefined for malformed input.
 */
function computeDaysRemaining(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 2) return undefined
  const [month, day] = parts
  if (!month || !day) return undefined
  const now = new Date()
  const target = new Date(now.getFullYear(), month - 1, day)
  if (target.getTime() < now.getTime()) {
    target.setFullYear(target.getFullYear() + 1)
  }
  return Math.floor((target.getTime() - now.getTime()) / 86_400_000)
}

function emptySavings(): SmartCartV2Savings {
  return {
    leanCartLow: 0,
    leanCartHigh: 0,
    typicalOverbuyLow: 0,
    typicalOverbuyHigh: 0,
    potentialSavingsLow: 0,
    potentialSavingsHigh: 0,
  }
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
