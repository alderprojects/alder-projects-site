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
  // V7.2.3 — citations describing this slot's editorial framing
  // (research notes, reviewer rankings). Optional for back-compat
  // with v7.2.1/v7.2.2 carts that didn't carry citations.
  citations?: string[]

  // ===================================================================
  // v7.2.5 — slot-level metadata forwarded by the builder onto the
  // cart output for the result page. All optional so v1-shaped carts
  // and v7.2.1-7.2.4 v2 carts in KV continue to render unchanged.
  // ===================================================================

  /** Slot purpose (forwarded from ScopeCatalogSlot.slotPurpose). */
  slotPurpose?: string

  /** Why-it-matters copy (forwarded from ScopeCatalogSlot). */
  whyItMatters?: string

  /** Common buyer mistake (forwarded from ScopeCatalogSlot). */
  commonMistake?: string

  /**
   * Cost-benefit claim from the resolved sweet-spot product.
   * Builder copies from UniverseProduct.costBenefitClaim.
   */
  costBenefitClaim?: string

  /** Vermont reasoning from the resolved sweet-spot product. */
  vermontReasoning?: string

  /** Slot-level urgency window from the sweet-spot product. */
  urgencyWindow?: {
    buyByDate?: string
    earliestUseful?: string
    label?: string
    daysRemaining?: number
  }

  // ===================================================================
  // v7.2.5 — source-file authoring carryover. These fields properly
  // belong on ScopeCatalogSlot (they describe catalog editorial
  // intent, not runtime cart state). They're declared optional on
  // CartSlot so source-file authors can write a single CartSlot[] in
  // the v7.2.2-shape source files and have the ingestion script
  // normalize them into ScopeCatalogSlot. Runtime cart output leaves
  // them undefined.
  // ===================================================================
  nextBestIfAlreadyHave?: {
    targetSlotOrFunction: string
    reason: string
  }
  whenToSkip?: string[]
  routeOutOfSmartCartIf?: Array<{
    condition: string
    destination: 'worth_it' | 'small_pro' | 'contractor' | 'verify_first'
    reason: string
  }>
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
  // V7.2.3 — citations describing this skip claim's research basis.
  // Optional for back-compat with v7.2.1/v7.2.2 records.
  citations?: string[]
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

  // ===================================================================
  // v7.2.5 — optional output extensions forwarded from the catalog +
  // universe. Result page can render these when present; carts saved
  // before v7.2.5 simply omit them.
  // ===================================================================

  /** Scope-level promise to surface at top of result page. */
  smartCartPromise?: string

  /** Scope-level value proposition. */
  valueProposition?: string

  /**
   * Route-out triggered. If set, the cart is suppressed and the
   * buyer sees the route-out message instead of the slot list.
   */
  routedOut?: {
    destination: 'worth_it' | 'small_pro' | 'contractor' | 'verify_first'
    reason: string
  }

  /**
   * Bundle prompts — pairs of universeIds where the cart can surface
   * "buy these together" callouts.
   */
  bundlePrompts?: Array<{
    primaryUniverseId: string
    bundleUniverseIds: string[]
    bundleReason: string
  }>

  /**
   * Next-best gap fillers — products to recommend based on alreadyHave
   * flags. Built from slots' nextBestIfAlreadyHave entries.
   */
  nextBestGaps?: Array<{
    triggeredByFlag: string
    recommendedSlot: string
    reason: string
  }>

  /** Urgency banner — top-of-page "buy by" callout. */
  urgencyBanner?: {
    deadline: string
    label: string
    daysRemaining?: number
  }

  /**
   * v7.2.14 — full list of scope-level route-out conditions, forwarded
   * from the catalog so the result page can render a "when to call a pro"
   * callout even when the cart is NOT actively routed out. Distinct
   * from `routedOut` (singular, the triggered rule).
   */
  routeOutRules?: Array<{
    condition: string
    destination: 'worth_it' | 'small_pro' | 'contractor' | 'verify_first'
    reason: string
  }>
}

export const TIER_LABEL: Record<CartTier, string> = {
  budget: 'Budget pick',
  sweet_spot: 'Recommended pick',
  premium: 'Premium pick',
}

// =====================================================================
// V7.2.3 — Hybrid universe + scope-catalog architecture
// =====================================================================
//
// The types above (CartSlot, SkipItemV2, SmartCartV2Output, etc.) are
// the BUILDER OUTPUT shape — what the result page renders. Those stay
// stable.
//
// The types below describe the SOURCE shape — what we author. A
// ScopeCatalog references the universe by tag query and layers in
// scope-specific editorial prose. The builder joins the two and emits
// the same SmartCartV2Output shape as v7.2.1.

import type { UniverseQuery } from './smart-cart-universe'

/**
 * ScopeCatalogSlot — slot definition in a scope catalog.
 *
 * A slot is "the cabinet pull recommendation for this scope". It
 * defines what role to fill (via tierQueries) and how to present it
 * (via prose).
 *
 * Differences from CartSlot:
 *   - Carries `tierQueries` instead of resolved `tiers` — the builder
 *     resolves queries against the universe at synthesis time.
 *   - `conditionalOn` is required (always an array; empty if no gate).
 *   - `citations` is required (always an array; empty if none).
 */
export interface ScopeCatalogSlot {
  slotId: CartSlotId
  slotLabel: string
  slotKind: 'core' | 'addon'
  conditionalOn: string[]
  tierQueries: {
    budget?: UniverseQuery
    sweet_spot: UniverseQuery                    // required
    premium?: UniverseQuery
  }
  whyThis: string
  whyNotCheaper?: string
  whyNotPremium?: string
  contextNote?: string
  warnings?: string[]
  citations: string[]

  // ===================================================================
  // v7.2.5 — optional slot-level metadata. The builder forwards these
  // through CartSlot onto SmartCartV2Output for the result page.
  // ===================================================================

  /**
   * Slot-level purpose. Shown above the product card.
   * Example: "Detect leaks before they cause damage."
   */
  slotPurpose?: string

  /**
   * Why this slot matters. Customer-facing.
   * Example: "An undetected leak in a second home can flood for
   * weeks before discovery."
   */
  whyItMatters?: string

  /**
   * Common mistakes buyers make at this slot.
   * Example: "Buying a non-WiFi alarm for an absentee property."
   */
  commonMistake?: string

  /**
   * What to recommend if buyer already has the product satisfying
   * this slot.
   */
  nextBestIfAlreadyHave?: {
    /**
     * Universal-friendly description: which next-best slot to
     * recommend, or function tag to query.
     */
    targetSlotOrFunction: string
    /** Why this is the next-best move. */
    reason: string
  }

  /** When to skip this slot entirely. */
  whenToSkip?: string[]

  /** When this slot should route the buyer out of Smart Cart. */
  routeOutOfSmartCartIf?: Array<{
    condition: string
    destination: 'worth_it' | 'small_pro' | 'contractor' | 'verify_first'
    reason: string
  }>
}

/**
 * ScopeCatalogSkipItem — same shape as SkipItemV2 but with required
 * citations (the builder's emitted SkipItemV2 keeps citations
 * optional for back-compat with v7.2.1/v7.2.2 carts).
 */
export interface ScopeCatalogSkipItem {
  id: string
  type: SkipReasonType
  title: string
  marketingPitch?: string
  realReason: string
  amountSaved?: { low: number; high: number }
  appliesToScope: string[]
  citations: string[]

  // ===================================================================
  // v7.2.5 — optional skip-card refinements.
  // ===================================================================

  /**
   * When skipping might actually be wrong — i.e., the edge case where
   * the marketed product IS appropriate.
   */
  whenItMayBeOkay?: string

  /** What to buy instead. Function tag or universeId. */
  betterAlternative?: string

  /**
   * Customer-facing copy. Used directly on the skip card if present;
   * otherwise composed from realReason.
   */
  customerFacingCopy?: string
}

/**
 * ScopeCatalogScenarioDefaults — scenario-keyed map of default
 * selectedTier + alreadyHave the modal data plumbing fills when the
 * buyer hasn't answered the state probe.
 */
export type ScopeCatalogScenarioDefaults = Record<
  string,                                        // BriefScenarioId
  { selectedTier: CartTier; alreadyHave: string[] }
>

/**
 * ScopeCatalog — full editorial layer for one (topic, scope)
 * combination. One file per catalog under
 * src/content/smart-cart/scope-catalogs/.
 */
export interface ScopeCatalog {
  topic: TopicId
  scopeVariantId: string
  scenarios: BriefScenarioId[]
  slots: ScopeCatalogSlot[]
  skipList: ScopeCatalogSkipItem[]
  scenarioDefaults: ScopeCatalogScenarioDefaults

  // ===================================================================
  // v7.2.5 — optional scope-level value-prop and route-out fields.
  // The builder forwards these onto SmartCartV2Output so the result
  // page can render the scope's promise banner, route-out screen, and
  // seasonal urgency callout.
  // ===================================================================

  /**
   * Customer-facing promise. The "spend X to prevent/defer Y" framing.
   * Shown at the top of the result page. Example:
   *   "Spend $100-$500 to reduce risk of frozen pipes, water damage,
   *    and emergency calls."
   */
  smartCartPromise?: string

  /** Customer pain this scope addresses. */
  primaryCustomerPain?: string

  /** Why this scope earns the $19.99. */
  valueProposition?: string

  /**
   * Route-out conditions — when the cart should redirect the buyer
   * to Worth-It Plan, a small pro, or a contractor rather than
   * synthesize a Smart Cart.
   */
  routeOutRules?: Array<{
    /**
     * Condition (state-probe flag, scenario, or text-match pattern
     * on the buyer's intent input).
     */
    condition: string
    /** Where to route. */
    destination: 'worth_it' | 'small_pro' | 'contractor' | 'verify_first'
    /** Customer-facing reason. */
    reason: string
  }>

  /**
   * Seasonal urgency for the scope as a whole. Drives the "buy by"
   * banner at the top of the result page.
   */
  seasonalUrgency?: {
    season: string
    /** MM-DD format (no year). */
    deadline: string
    label: string
  }
}

