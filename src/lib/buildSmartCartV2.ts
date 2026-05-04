// V7.2.1 — Smart Cart V2 builder.
//
// Pure function. Takes the buyer's (topic, scope, scenario, email,
// selectedTier, alreadyHave) and returns a SmartCartV2Output by
// looking up the slot universe + skip list from the catalog,
// filtering slots gated by alreadyHave, and computing honest savings
// using the selected tier as the lean-cart baseline.
//
// Lives alongside the v1 buildSmartCart; the webhook handler picks
// which builder to call via isV2Combination().

import { CONFIG } from './recommender-config'
import type { TopicId } from './property-modules'
import type { BriefScenarioId } from './recommender-config.types'
import { getScopeVariant } from './scope-variants'
import {
  getSlotUniverse,
  getSkipList,
} from '@/content/smart-cart'
import type {
  CartSlot,
  CartTier,
  CartTierVariant,
  SkipItemV2,
  SmartCartV2Output,
  SmartCartV2Savings,
} from './smart-cart-model'

const SCENARIO_LABEL: Record<BriefScenarioId, string> = {
  just_starting: 'Just starting',
  already_have_basics: 'Already have basics',
  tight_budget: 'Tight budget',
  premium: 'Premium',
  lake_property: 'Lake property',
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
  createdAt?: string                             // optional, defaults to now (used by respin to preserve)
  expiresAt?: string                             // optional, defaults to +30d (used by respin to preserve)
}

const TTL_MS = 30 * 24 * 3600 * 1000
const SKIP_CAP = 12

export function buildSmartCartV2(input: BuildSmartCartV2Input): SmartCartV2Output {
  const variant = getScopeVariant(input.topic, input.scopeVariantId)
  const scopeLabel = variant?.label ?? input.scopeVariantId
  const scenarioLabel = SCENARIO_LABEL[input.scenario] ?? input.scenario

  const selectedTier = input.selectedTier ?? 'sweet_spot'
  const alreadyHave = input.alreadyHave ?? []

  // Filter slots whose conditionalOn intersects alreadyHave.
  const universe = getSlotUniverse(input.topic, input.scopeVariantId)
  const slots = universe.filter(slot => {
    if (!slot.conditionalOn?.length) return true
    return !slot.conditionalOn.some(cond => alreadyHave.includes(cond))
  })

  // Skip list: sort by potential savings (Type A only contributes;
  // Type B has no amountSaved). Cap at 12 total.
  const skipList = [...getSkipList(input.topic, input.scopeVariantId)]
    .sort((a, b) => (b.amountSaved?.high ?? 0) - (a.amountSaved?.high ?? 0))
    .slice(0, SKIP_CAP)

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

// Resolve a slot's price for a requested tier, falling back to
// sweet_spot when the requested tier isn't authored. The fallback
// matters for budget tiers — some slots (under-sink organizer in the
// kitchen catalog) intentionally have no budget tier because no
// product in that price band actually works.
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
    // Overbuy includes the typical trap: low band reflects half the
    // floor (some buyers dodge it), high band reflects the full ceiling.
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
