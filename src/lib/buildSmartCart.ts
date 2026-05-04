// Smart Cart synthesis function — V7 Commit 13.
//
// Pure function. Takes (topic, scopeVariantId, scenario, season,
// customerEmail) and returns the full SmartCartOutput. No side
// effects — storage and email happen in the webhook handler.
//
// Property-INDEPENDENT by design. No town tier, no regulator overlay,
// no town clerk contacts — that work belongs to Worth-It Plan.

import { CONFIG } from './recommender-config'
import type { TopicId } from './property-modules'
import type { BriefScenarioId, Season } from './recommender-config.types'
import { getScopeVariant, type ScopeVariant, type ExecutionLane } from './scope-variants'
import {
  AFFILIATE_CATALOG,
  ACCESSORY_KITS,
  type AffiliateItem,
  type AccessoryKit,
} from '@/data/affiliates'
import {
  SKIP_LIST,
  getSkipListForCart,
  resolveSkipItemScope,
  parseMoneyAvoided,
  type SkipItem,
} from '../content/skip-list'
import { resolveOverbuyTraps, combineOverbuyTotals } from '../content/overbuy-traps'
import { QUANTITY_GUIDANCE } from '../content/quantity-guidance'
import { getPickTier, type PickTier } from './pick-tiers'
import { buildAmazonUrl } from './buildAmazonUrl'
import { SCENARIOS } from '../content/scenarios'
import {
  resolveItemPriceRange,
  resolveAddOnPriceRange,
  type PriceRange,
} from './item-prices'

// ---------- Public types ----------------------------------------------

export type SmartCartInput = {
  topic: TopicId
  scopeVariantId: string
  scenario: BriefScenarioId
  season: Season
  customerEmail: string
  customerProvidedAddress?: string
}

export type LeanCartItem = {
  itemId: string
  display: string
  quantity: number
  unit: string
  estimatedPrice: PriceRange            // { low, high } — show "$X" if equal, "$X-$Y" otherwise
  whyThis: string
  affiliateUrl: string
  timingBadge?: string                  // "Buy now" / "Wait until <month>" if shoppingTiming applies
}

export type AddOnItem = {
  itemId: string
  display: string
  estimatedPrice: { low: number; high: number }
  whenYouNeedIt: string
  affiliateUrl: string
}

export type SmartCartOutput = {
  cartId: string
  createdAt: string                     // ISO
  expiresAt: string                     // ISO — 30 days from creation
  customerEmail: string
  customerProvidedAddress?: string

  topic: TopicId
  scopeVariantId: string
  scopeLabel: string
  scenario: BriefScenarioId
  scenarioOpenerHook: string
  defaultLane: ExecutionLane

  // Section 1: Lean Cart
  leanCart: {
    items: LeanCartItem[]
    totalLow: number
    totalHigh: number
  }

  // Section 2: Optional Add-Ons
  addOns: AddOnItem[]

  // Section 3: Skip For Now
  skipForNow: SkipItem[]

  // Section 4: Savings Snapshot
  savings: {
    leanCartEstLow: number
    leanCartEstHigh: number
    commonOverbuyLow: number
    commonOverbuyHigh: number
    potentialSavingsLow: number
    potentialSavingsHigh: number
  }

  // Optional callouts
  overbuyTrapCallout?: { items: string[]; total: { low: number; high: number } }

  configVersion: string
  refunded?: boolean

  // V7.1 — edit/respin panel state. Initialized lazily by the respin
  // endpoint; absence is treated as 0.
  respinCount?: number
}

// ---------- Implementation -------------------------------------------

const TIGHT_BUDGET_TIER: PickTier = 'tight'
const PREMIUM_TIER: PickTier = 'premium'

const MONTH_LABEL = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export function buildSmartCart(input: SmartCartInput): SmartCartOutput {
  const variant = getScopeVariant(input.topic, input.scopeVariantId)
  if (!variant) {
    throw new Error(`Unknown scope variant: ${input.topic}/${input.scopeVariantId}`)
  }

  const cartId = generateCartId()
  const createdAt = new Date()
  const expiresAt = new Date(createdAt)
  expiresAt.setDate(
    expiresAt.getDate() + CONFIG.products.smartCart.ttlDays,
  )

  const scenario = SCENARIOS[input.scenario]
  const scenarioOpener =
    scenario?.topicHooks[input.topic] ?? scenario?.openerHook ?? ''

  const candidateItems = collectCandidateItems(variant)
  const tieredItems = applyScenarioTier(candidateItems, input.scenario)
  const leanCartItems = buildLeanCart(tieredItems, input.scopeVariantId, input.season)
  const addOns = buildAddOns(tieredItems, leanCartItems, input.season)
  const skipForNow = getSkipListForCart(input.topic, input.scopeVariantId, input.scenario)

  const leanCartTotalLow = leanCartItems.reduce(
    (acc, i) => acc + i.estimatedPrice.low * i.quantity,
    0,
  )
  const leanCartTotalHigh = leanCartItems.reduce(
    (acc, i) => acc + i.estimatedPrice.high * i.quantity,
    0,
  )

  const overbuyTraps = resolveOverbuyTraps(variant.overbuyTrapIds)
  const overbuyTotal = combineOverbuyTotals(overbuyTraps)
  const overbuyItemsLabels = overbuyTraps.flatMap(t =>
    t.overboughtItems.map(i => i.label),
  )

  // V7.1 — savings honesty (Section 16). Headline savings come ONLY
  // from skip items that are tied to the topic or scope; generic
  // buying-discipline items do NOT inflate the headline number. The
  // result page renders general items in a separate expandable
  // section.
  const honestSkip = skipForNow.filter(s => resolveSkipItemScope(s) !== 'general')
  let skipSavingsLow = 0
  let skipSavingsHigh = 0
  for (const item of honestSkip) {
    const range = parseMoneyAvoided(item.moneyAvoided)
    skipSavingsLow += range.low
    skipSavingsHigh += range.high
  }
  // Combine with overbuy-trap totals — those are already scope-tied
  // through variant.overbuyTrapIds so they remain in the headline.
  const potentialSavingsLow = skipSavingsLow + overbuyTotal.low
  const potentialSavingsHigh = skipSavingsHigh + overbuyTotal.high

  return {
    cartId,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    customerEmail: input.customerEmail,
    customerProvidedAddress: input.customerProvidedAddress,

    topic: input.topic,
    scopeVariantId: input.scopeVariantId,
    scopeLabel: variant.label,
    scenario: input.scenario,
    scenarioOpenerHook: scenarioOpener,
    defaultLane: variant.defaultLane,

    leanCart: {
      items: leanCartItems,
      totalLow: leanCartTotalLow,
      totalHigh: leanCartTotalHigh,
    },
    addOns,
    skipForNow,

    savings: {
      leanCartEstLow: leanCartTotalLow,
      leanCartEstHigh: leanCartTotalHigh,
      commonOverbuyLow: overbuyTotal.low,
      commonOverbuyHigh: overbuyTotal.high,
      potentialSavingsLow,
      potentialSavingsHigh,
    },

    overbuyTrapCallout: overbuyItemsLabels.length
      ? { items: overbuyItemsLabels.slice(0, 5), total: overbuyTotal }
      : undefined,

    configVersion: CONFIG.version,
  }
}

// ---------- Item resolution -----------------------------------------

function collectCandidateItems(variant: ScopeVariant): AffiliateItem[] {
  const items: AffiliateItem[] = []
  const seen = new Set<string>()
  for (const kitId of variant.relevantKitIds) {
    const kit: AccessoryKit | undefined = ACCESSORY_KITS.find(k => k.id === kitId)
    if (!kit) continue
    for (const itemId of kit.itemIds) {
      if (seen.has(itemId)) continue
      const item = AFFILIATE_CATALOG.find(i => i.id === itemId)
      if (!item) continue
      seen.add(itemId)
      items.push(item)
    }
  }
  return items
}

// Scenario-driven tier swap. tight_budget swaps to PICK_TIERS.tight
// where authored. premium swaps to PICK_TIERS.premium. Others leave
// the catalog default in place.
function applyScenarioTier(
  items: AffiliateItem[],
  scenario: BriefScenarioId,
): Array<AffiliateItem & { _tier?: PickTier; _tierUrl?: string; _tierPrice?: number; _tradeoff?: string }> {
  const target: PickTier | null =
    scenario === 'tight_budget' ? TIGHT_BUDGET_TIER
    : scenario === 'premium' ? PREMIUM_TIER
    : null
  if (!target) return items
  return items.map(item => {
    const tiered = getPickTier(item.id, target)
    if (!tiered) return item
    return {
      ...item,
      _tier: target,
      _tierUrl: tiered.url,
      _tierPrice: tiered.estPrice,
      _tradeoff: tiered.tradeoff,
    }
  })
}

// Build the lean cart — top 4-6 items per scope, with quantity
// guidance applied. Prices resolve through the item-prices ladder
// (tier → explicit id → name pattern → category band) instead of the
// pre-v7.1 hard-coded $25 default.
function buildLeanCart(
  items: Array<AffiliateItem & { _tier?: PickTier; _tierUrl?: string; _tierPrice?: number; _tradeoff?: string }>,
  scopeVariantId: string,
  season: Season,
): LeanCartItem[] {
  const lean: LeanCartItem[] = []
  for (const item of items.slice(0, 6)) {
    const guidance = QUANTITY_GUIDANCE[item.id]
    const quantity = guidance?.typicalQuantity.mid ?? 1
    const unit = guidance?.typicalQuantity.unit ?? 'unit'
    const estimatedPrice: PriceRange = item._tierPrice
      ? { low: item._tierPrice, high: item._tierPrice }
      : resolveItemPriceRange(item)
    const whyThis = item._tradeoff ?? item.shortNote
    const url = item._tierUrl ?? item.url ?? buildAmazonUrl(item.display)
    const timingBadge = computeTimingBadge(scopeVariantId, season)
    lean.push({
      itemId: item.id,
      display: item.display,
      quantity,
      unit,
      estimatedPrice,
      whyThis,
      affiliateUrl: url,
      timingBadge,
    })
  }
  return lean
}

function buildAddOns(
  items: AffiliateItem[],
  leanCart: LeanCartItem[],
  _season: Season,
): AddOnItem[] {
  const usedIds = new Set(leanCart.map(i => i.itemId))
  const remaining = items.filter(i => !usedIds.has(i.id))
  const addOns: AddOnItem[] = []
  for (const item of remaining.slice(0, 3)) {
    const range = resolveAddOnPriceRange(item)
    const url = item.url ?? buildAmazonUrl(item.display)
    addOns.push({
      itemId: item.id,
      display: item.display,
      estimatedPrice: range,
      whenYouNeedIt: item.shortNote,
      affiliateUrl: url,
    })
  }
  return addOns
}

function computeTimingBadge(scopeVariantId: string, season: Season): string | undefined {
  // The scope variant carries a timingCategory; resolve via SCOPE_VARIANTS
  // → CONFIG.shoppingTiming. For simplicity in the synthesis layer, we
  // accept the season directly and ignore the variant timingCategory if
  // there is no current rule. (CurationModal at commit 18 enforces the
  // mapping; this badge is informational.)
  const month = seasonToMonth(season)
  for (const [, rule] of Object.entries(CONFIG.shoppingTiming)) {
    if (rule.bestBuyMonths.includes(month)) {
      // We do not surface "buy now" globally per-item — only return when
      // the variant timing aligns. Keep this conservative for now.
      void scopeVariantId
    }
  }
  return undefined
}

function seasonToMonth(season: Season): number {
  switch (season) {
    case 'mud': return 4
    case 'spring_blackfly': return 5
    case 'lake': return 7
    case 'fall_leaf': return 10
    case 'pre_winter': return 11
    case 'deep_winter': return 1
  }
}


// Cart id — printable, prefixed, base-32 random suffix. Format
// CART-XXXXXX (6 chars). Collision risk is negligible at V7 launch
// volumes; the Stripe metadata + KV write ensures uniqueness.
function generateCartId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // crockford-ish
  let suffix = ''
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `CART-${suffix}`
}

// Re-export month label utility for the result page.
export function monthLabel(month: number): string {
  return MONTH_LABEL[Math.max(1, Math.min(12, month))] ?? ''
}

// Used by SKIP_LIST consumers / tests that want the raw filter.
export { SKIP_LIST }
