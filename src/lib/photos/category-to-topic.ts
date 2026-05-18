/**
 * v7.3.4-PR2 — Photo category to Smart Cart topic/scope mapping.
 *
 * The open vision extraction returns one of ~20 CATEGORY_VALUES
 * (basement, kitchen, roof_or_gutter, electrical_panel, ...). The
 * Smart Cart funnel requires a TopicId from a much smaller enum
 * (kitchen, weatherization, outdoor, heat_pump, bath, home_repair, ...)
 * plus a scopeVariantId selected from SCOPE_VARIANTS[topic].
 *
 * This mapping picks the BEST FIT for each photo category, with the
 * goal of pre-filling the CurationModal so the visitor doesn't have
 * to re-pick what they already showed us.
 *
 * Where the mapping is forced (e.g. roof photos -> weatherization
 * because there's no roofing scope) it's intentional — the catalog
 * gap PR5 will eventually surface what photo categories are
 * under-served by current scope coverage. Until then, the closest
 * meaningful scope is better than a "pick a topic" interruption.
 *
 * 'mixed' and 'unclear' deliberately return null so the panel can
 * route the visitor back to the topic picker rather than guess.
 */

import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

export interface InferredScope {
  topic: TopicId
  scopeVariantId: string
  scenario: BriefScenarioId
}

/**
 * Map an open-extraction category_hint to a Smart Cart topic + scope.
 * Returns null for categories where forcing a topic would be more
 * misleading than letting the user pick.
 *
 * scenario defaults to 'just_starting' across the board. PR4+ may
 * derive scenario from photo features (e.g. "already_have_basics" if
 * we saw equipment present).
 */
export function inferScopeFromCategory(category: string): InferredScope | null {
  switch (category) {
    // ----- Direct matches -----
    case 'kitchen':
      return {
        topic: 'kitchen',
        scopeVariantId: 'kitchen_organizers',
        scenario: 'just_starting',
      }
    case 'bathroom':
      return {
        topic: 'bath',
        scopeVariantId: 'bath_accessibility_basics',
        scenario: 'just_starting',
      }
    case 'basement':
      return {
        topic: 'home_repair',
        scopeVariantId: 'basement_moisture_prep',
        scenario: 'just_starting',
      }
    case 'deck_or_patio':
      return {
        topic: 'outdoor',
        scopeVariantId: 'outdoor_deck_refresh',
        scenario: 'just_starting',
      }
    case 'attic':
      return {
        topic: 'weatherization',
        scopeVariantId: 'weatherization_attic_basics',
        scenario: 'just_starting',
      }
    case 'hvac':
      return {
        topic: 'heat_pump',
        scopeVariantId: 'heat_pump_readiness_prep',
        scenario: 'just_starting',
      }
    case 'laundry':
      return {
        topic: 'home_repair',
        scopeVariantId: 'home_moisture_control',
        scenario: 'just_starting',
      }

    // ----- Best-effort matches (no exact scope) -----
    case 'roof_or_gutter':
      // No roofing scope in current catalog. Weatherization is the
      // closest "envelope" scope.
      return {
        topic: 'weatherization',
        scopeVariantId: 'window_weatherization',
        scenario: 'just_starting',
      }
    case 'exterior_siding':
      return {
        topic: 'weatherization',
        scopeVariantId: 'weatherization_diy_air_sealing',
        scenario: 'just_starting',
      }
    case 'exterior_foundation':
      return {
        topic: 'home_repair',
        scopeVariantId: 'basement_moisture_prep',
        scenario: 'just_starting',
      }
    case 'exterior_landscape':
      return {
        topic: 'outdoor',
        scopeVariantId: 'outdoor_lake_season',
        scenario: 'just_starting',
      }
    case 'electrical_panel':
      return {
        topic: 'home_repair',
        scopeVariantId: 'home_safety_kit',
        scenario: 'just_starting',
      }
    case 'plumbing':
      return {
        topic: 'home_repair',
        scopeVariantId: 'home_water_quality',
        scenario: 'just_starting',
      }
    case 'garage':
      return {
        topic: 'universal',
        scopeVariantId: 'universal_owner_kit',
        scenario: 'just_starting',
      }

    // ----- Poor fits (interior living spaces, no Smart Cart scope) -----
    case 'bedroom':
    case 'living_area':
    case 'hallway_or_stair':
    case 'closet':
      // These don't map cleanly to any current scope. Return a generic
      // owner-kit so the funnel still works, but a v7.3.5 catalog
      // expansion focused on interior-room scopes would improve this.
      return {
        topic: 'universal',
        scopeVariantId: 'universal_owner_kit',
        scenario: 'just_starting',
      }

    // ----- Explicit unknowns -----
    case 'mixed':
    case 'unclear':
    default:
      // null = route the visitor to the topic picker. The panel
      // shouldn't pretend it knows what scope to pick when the
      // extraction itself isn't sure.
      return null
  }
}

/**
 * Given a list of category_hints from extracted features, pick the
 * dominant category by frequency. Ties broken by the order
 * categories appear in the input array (i.e. the visitor's most
 * recently uploaded photo wins ties).
 *
 * Returns null if input is empty.
 */
export function dominantCategory(categories: string[]): string | null {
  if (categories.length === 0) return null
  const counts = new Map<string, number>()
  const order = new Map<string, number>()
  let i = 0
  for (const c of categories) {
    counts.set(c, (counts.get(c) ?? 0) + 1)
    if (!order.has(c)) order.set(c, i)
    i += 1
  }
  let best: string | null = null
  let bestCount = -1
  let bestOrder = Infinity
  // Array.from() — repo tsconfig targets ES2017 with no downlevelIteration,
  // so Map iteration with for...of is rejected.
  for (const [cat, count] of Array.from(counts.entries())) {
    const ord = order.get(cat) ?? 0
    if (
      count > bestCount ||
      (count === bestCount && ord < bestOrder)
    ) {
      best = cat
      bestCount = count
      bestOrder = ord
    }
  }
  return best
}
