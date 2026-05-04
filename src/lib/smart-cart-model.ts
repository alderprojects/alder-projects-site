// V7.2.1 — Smart Cart V2 model.
//
// Replaces the v1 flat-list cart with a tiered-slot model that ships
// crossover prose ("why not the cheaper one", "why not the premium")
// per slot, plus a two-type skip list (wrong version vs wrong
// category) so the savings math can be honest.
//
// Existing v1 carts (legacy customers in KV) keep working — they
// resolve through buildSmartCart and render via the v1 result-page
// branch. The result page discriminates on `cart.version`, treating
// undefined as 1 for back-compat with records persisted before the
// version discriminator was added.

import type { TopicId } from './property-modules'
import type { BriefScenarioId } from './recommender-config.types'

export type CartSlotId = string                 // e.g. 'kitchen_cutlery_tray'
export type CartTier = 'budget' | 'sweet_spot' | 'premium'

export interface CartTierVariant {
  productName: string                            // e.g. "Pipishell Bamboo Drawer Organizer"
  priceLow: number                               // dollars
  priceHigh: number                              // dollars
  amazonAsin?: string                            // optional ASIN — populated for v7.2.1 sample only when known
  affiliateUrl: string                           // built from ASIN when present, else search query
  imageUrl?: string                              // optional thumbnail
  productSpec: string                            // 1-2 sentences of technical spec
}

export interface CartSlot {
  slotId: CartSlotId
  slotLabel: string                              // e.g. "Cutlery tray — expandable bamboo"
  tiers: {
    budget?: CartTierVariant
    sweet_spot: CartTierVariant                  // required
    premium?: CartTierVariant
  }
  whyNotCheaper?: string                         // crossover prose: why budget loses
  whyNotPremium?: string                         // crossover prose: why premium loses
  whyThis: string                                // why sweet-spot is in your cart
  warnings?: string[]                            // e.g. "Cabinet opening must be 15-1/4""
  contextNote?: string                           // optional editorial note ("Vermont tip:...")
  slotKind: 'core' | 'addon'
  conditionalOn?: string[]                       // alreadyHave values that HIDE this slot
}

export type SkipReasonType =
  | 'wrong_version'                              // Type A: don't buy this version of this thing
  | 'wrong_category'                             // Type B: don't buy this thing at all

export interface SkipItemV2 {
  id: string
  type: SkipReasonType
  title: string                                  // e.g. "Container Store premium dividers"
  marketingPitch?: string                        // for Type A only
  realReason: string                             // why skip
  amountSaved?: { low: number; high: number }   // Type A only
  appliesToScope: string[]                       // scope variant ids this applies to
}

export interface SmartCartV2Savings {
  leanCartLow: number
  leanCartHigh: number
  typicalOverbuyLow: number
  typicalOverbuyHigh: number
  potentialSavingsLow: number
  potentialSavingsHigh: number
}

export interface SmartCartV2Output {
  cartId: string
  version: 2                                     // discriminator vs legacy v1 carts
  product: 'smart_cart'
  topic: TopicId
  scopeVariantId: string
  scopeLabel: string                             // resolved from scope-variants for display
  scenario: BriefScenarioId
  scenarioLabel: string                          // resolved for display
  selectedTier: CartTier                         // user's tier preference
  alreadyHave: string[]                          // state probe answers
  slots: CartSlot[]                              // ordered, includes only slots the user should see
  skipList: SkipItemV2[]                         // both Type A and Type B mixed, sorted by amountSaved.high desc
  savings: SmartCartV2Savings
  customerEmail: string
  customerProvidedAddress?: string
  createdAt: string                              // ISO
  expiresAt: string                              // ISO, +30d
  respinCount?: number
  refunded?: boolean
  configVersion: string
}

export const TIER_LABEL: Record<CartTier, string> = {
  budget: 'Budget pick',
  sweet_spot: 'Recommended pick',
  premium: 'Premium pick',
}
