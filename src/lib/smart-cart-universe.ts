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
 */
export type UniverseTopic =
  | 'kitchen'
  | 'outdoor'
  | 'mudroom'
  | 'bathroom'
  | 'weatherization'
  | 'home_repair'

/**
 * Roles within a project — the "what is this thing" facet. Loose
 * ontology used by scope catalogs to compose visual sections.
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

/**
 * Seasonal relevance. Empty array = year-round.
 */
export type UniverseSeason =
  | 'spring'
  | 'summer'
  | 'fall'
  | 'winter'
  | 'mud_season'
  | 'opening_season'
  | 'closing_season'

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
