// V7.2.3 — Smart Cart Universe.
//
// Single tagged product table. Scope catalogs reference universe
// entries by tag query (or by direct universeId for slots that pin
// to one specific product). Replaces the v7.2.1/v7.2.2 pattern of
// embedding product data inside per-scope slot definitions.
//
// Why hybrid (universe + scope catalog) instead of universe-only:
//  - Skip lists are scope-specific (the Top Knobs trap reads
//    differently in cabinet_hardware_swap vs cosmetic_refresh)
//  - whyThis prose changes per scope ("Polywood anchors a lake
//    property" vs "Polywood handles deck wind exposure")
//  - Slot ordering is scope-specific
//
// The universe is the product layer. The scope catalog is the
// editorial layer.

import type { CartTierVariant, CartTier } from './smart-cart-model'

// ---------- Tag categories -------------------------------------------

/**
 * Topic categories — high-level project areas. A product can belong
 * to multiple (a magnetic spice rack is kitchen; an outdoor mat is
 * outdoor + mudroom).
 *
 * v7.2.5 — added 'universal' for cross-project tools (owner kit,
 * project prep, safety basics) that show up across multiple scope
 * contexts.
 */
export type UniverseTopic =
  | 'kitchen'
  | 'outdoor'
  | 'mudroom'
  | 'bathroom'
  | 'weatherization'
  | 'home_repair'
  | 'universal'

/**
 * Roles within a project — the "what is this thing" facet. Loose
 * ontology used by scope catalogs to compose visual sections.
 *
 * v7.2.5 — added sensor/monitor/cleaner/preventer/document_aid/
 * measurement_tool to cover freeze-prevention, water-quality,
 * project-prep scopes.
 */
export type UniverseRole =
  | 'tool'
  | 'consumable_material'
  | 'hardware'
  | 'furniture'
  | 'fixture'
  | 'finish'
  | 'accessory'
  | 'organizer'
  | 'safety_item'
  | 'lighting'
  | 'textile'
  | 'appliance'
  | 'plant_material'
  | 'sensor'
  | 'monitor'
  | 'cleaner'
  | 'preventer'
  | 'document_aid'
  | 'measurement_tool'

/**
 * Seasonal relevance. Empty array = year-round.
 *
 * v7.2.5 — added pre_winter/pre_summer/year_round for freeze prep
 * and opening windows that don't map cleanly to a single season.
 */
export type UniverseSeason =
  | 'spring'
  | 'summer'
  | 'fall'
  | 'winter'
  | 'mud_season'
  | 'opening_season'
  | 'closing_season'
  | 'pre_winter'
  | 'pre_summer'
  | 'year_round'

/**
 * Property characteristics — used by outdoor / lake / mountain etc.
 */
export type UniversePropertyType =
  | 'urban'
  | 'suburban'
  | 'rural'
  | 'lake'
  | 'coastal'
  | 'mountain'
  | 'cabin'
  | 'condo'

export interface UniverseTags {
  /** Project topic categories. AND across tag categories, OR within. */
  topics: UniverseTopic[]
  /** Role within a project. */
  roles: UniverseRole[]
  /**
   * Functional category — open string-set so adding a new function
   * doesn't require type changes. Examples: 'cabinet_pull',
   * 'undercabinet_lighting', 'soft_close_hinge', 'lazy_susan',
   * 'adirondack_chair', 'patio_umbrella', 'gas_grill'.
   */
  functions: string[]
  seasons: UniverseSeason[]
  /**
   * State-probe gate. If a buyer has this flag in alreadyHave,
   * scope catalog slots that gate on this flag will skip products
   * carrying it. Empty string = product is not gated.
   */
  alreadyHaveFlag: string
  /** Open string-set for cabinet/site conditions, e.g. 'has_corner_cabinet'. */
  conditions: string[]
  /** Tier slot — which 3-tier comparison position this product fills. */
  tier: CartTier
  /** Property characteristics this product is appropriate for. */
  propertyTypes: UniversePropertyType[]

  // ===================================================================
  // v7.2.5 — optional metadata layer used by the result page to
  // surface "why this slot" context, route-out logic, and seasonal
  // urgency. All optional so existing 82 universe entries continue
  // to validate without modification.
  // ===================================================================

  /**
   * What value the product creates. Used by builder to surface the
   * "why this slot" callout on the result page.
   */
  valueMechanism?: Array<
    | 'prevents_damage'
    | 'avoids_overbuying'
    | 'defers_larger_project'
    | 'reduces_extra_trips'
    | 'improves_livability'
    | 'improves_safety'
    | 'preserves_season_readiness'
    | 'fills_ownership_gap'
    | 'supports_project_prep'
    | 'improves_remote_monitoring'
  >

  /** How the buyer should approach this purchase. */
  executionLane?:
    | 'diy_first'
    | 'small_pro'
    | 'contractor_worthy'
    | 'verify_first'
    | 'hold'

  /** Replacement frequency. Drives lifecycle messaging. */
  replacementCycle?:
    | 'one_time'
    | 'seasonal'
    | 'annual'
    | 'every_3_5_years'
    | 'as_needed'

  /**
   * Affiliate revenue likelihood. Used internally for catalog
   * prioritization, not shown to buyer.
   */
  affiliateFit?: 'high' | 'medium' | 'low'

  /**
   * Trust risk if buyer chooses wrong product. high = real damage
   * potential, medium = wasted money, low = aesthetic.
   */
  trustRisk?: 'low' | 'medium' | 'high'

  /**
   * Urgency window — when this product is most relevant. Drives
   * "buy by" callouts on the result page when the current date is
   * approaching the window deadline.
   */
  urgencyWindow?: {
    /**
     * Latest useful purchase date in MM-DD format (no year). Builder
     * compares against current date to determine urgency badges.
     */
    buyByDate?: string
    /** Earliest purchase date that makes sense. */
    earliestUseful?: string
    /** Display label, e.g. "Best by November 1". */
    label?: string
  }

  /**
   * Bundle mechanism — products that are MORE valuable when bought
   * together. References universeIds of paired products. Result page
   * surfaces these as "buy this with..." prompts.
   */
  bundleWith?: string[]
}

// ---------- Universe entry ------------------------------------------

/**
 * UniverseTierVariant — same shape as CartTierVariant, kept as an
 * alias for clarity. The universe stores variants once and the
 * builder reuses them across slots that resolve to the same product.
 */
export type UniverseTierVariant = CartTierVariant

/**
 * Migration provenance — which original catalog this product came
 * from. Useful during the v7.2.3 migration audit; informational
 * after.
 */
export interface MigrationProvenance {
  scope: string
  slotId: string
  tier: CartTier
}

export interface UniverseProduct {
  /**
   * Stable lowercase_snake_case identifier. Convention: brand+model
   * words (e.g. `pipishell_bamboo_drawer_organizer`). Generic items
   * fall back to `${slotId}__${slug}` (e.g.
   * `kitchen_lid_organizer__everie_extendable_food_container_lid_organizer`).
   */
  universeId: string
  /** Sort order within tier (lower = preferred). 100 = default. */
  rank: number
  variant: UniverseTierVariant
  tags: UniverseTags
  /** Citations describing the product (research, reviewer rankings). */
  citations: string[]
  migratedFrom?: MigrationProvenance

  // ===================================================================
  // v7.2.5 — optional product-level value-prop and route-out fields.
  // The builder forwards these through CartSlot onto SmartCartV2Output
  // so the result page can render the cost/benefit framing, Vermont
  // reasoning, and next-best-if-already-have prompts.
  // ===================================================================

  /**
   * Cost-benefit claim — short, customer-facing, structured. Examples:
   *   "Spend $40 to detect a leak before it ruins drywall."
   *   "Spend $150 to defer a $15k cosmetic remodel by 5 years."
   * Used on the result page as the primary value-prop callout for
   * the slot.
   */
  costBenefitClaim?: string

  /**
   * Vermont-specific reasoning. Soft phrasing — public-data claims
   * only (frost depth, growing season dates, mud season timing).
   * NO contractor-specific claims until verified. Examples:
   *   "Vermont frost line is ~48 inches in northern counties.
   *    Pipe insulation matters more in unconditioned crawlspaces."
   *   "Mud season runs March-May; entry mats see 10x normal use."
   */
  vermontReasoning?: string

  /**
   * What customer intent this product serves. Used for routing
   * buyers to the right scope when intent is ambiguous.
   */
  customerIntent?: string

  /**
   * If buyer already has this product, what to recommend instead.
   * Reference to another universeId or a function tag. Powers the
   * next-best-if-already-have logic.
   */
  ifAlreadyHaveNextBest?: {
    /** Reference style — universeId for direct, function for query-based. */
    type: 'universeId' | 'function'
    /** The universeId or function tag to recommend instead. */
    target: string
    /** Why this is the next-best. */
    reason: string
  }

  /**
   * When the buyer should NOT use this product. Examples:
   *   ["if WiFi unreliable", "if owner present > 50% of time"]
   */
  doNotRecommendIf?: string[]
}

// ---------- Query --------------------------------------------------

export interface UniverseQuery {
  mustHaveTopics?: UniverseTopic[]
  mustHaveRoles?: UniverseRole[]
  mustHaveFunctions?: string[]
  mustHaveSeasons?: UniverseSeason[]
  mustHavePropertyTypes?: UniversePropertyType[]
  /** ALL conditions in this list must be present on the product. */
  mustHaveConditions?: string[]
  /** Skip product whose alreadyHaveFlag matches AND buyer has the flag. */
  excludeAlreadyHaveFlag?: string
  tier: CartTier
  /** Default 1. Most slots want one product per tier. */
  limit?: number
}

/**
 * Run a tag query against the universe.
 *
 * Match semantics for each `mustHave*` array:
 *   - AND across categories (must satisfy every populated category)
 *   - OR within a category (any single tag in the array matches)
 *
 * Pure function — no side effects, no external state.
 */
export function queryUniverse(
  universe: UniverseProduct[],
  query: UniverseQuery,
  buyerAlreadyHave: string[] = [],
): UniverseProduct[] {
  const matches = universe.filter(p => {
    if (p.tags.tier !== query.tier) return false

    if (query.mustHaveTopics?.length) {
      const has = query.mustHaveTopics.some(t => p.tags.topics.includes(t))
      if (!has) return false
    }
    if (query.mustHaveRoles?.length) {
      const has = query.mustHaveRoles.some(r => p.tags.roles.includes(r))
      if (!has) return false
    }
    if (query.mustHaveFunctions?.length) {
      const has = query.mustHaveFunctions.some(f => p.tags.functions.includes(f))
      if (!has) return false
    }
    if (query.mustHaveSeasons?.length) {
      const has = query.mustHaveSeasons.some(s => p.tags.seasons.includes(s))
      if (!has) return false
    }
    if (query.mustHavePropertyTypes?.length) {
      const has = query.mustHavePropertyTypes.some(pt =>
        p.tags.propertyTypes.includes(pt),
      )
      if (!has) return false
    }
    if (query.mustHaveConditions?.length) {
      const all = query.mustHaveConditions.every(c =>
        p.tags.conditions.includes(c),
      )
      if (!all) return false
    }
    if (
      query.excludeAlreadyHaveFlag &&
      p.tags.alreadyHaveFlag === query.excludeAlreadyHaveFlag &&
      buyerAlreadyHave.includes(query.excludeAlreadyHaveFlag)
    ) {
      return false
    }
    return true
  })

  matches.sort((a, b) => a.rank - b.rank)
  const limit = query.limit ?? 1
  return matches.slice(0, limit)
}

/**
 * Direct lookup by universeId. Used when a slot pins to one
 * specific product instead of running a tag query.
 */
export function getUniverseProduct(
  universe: UniverseProduct[],
  universeId: string,
): UniverseProduct | null {
  return universe.find(p => p.universeId === universeId) ?? null
}
