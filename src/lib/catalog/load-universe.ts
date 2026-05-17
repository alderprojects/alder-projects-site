/**
 * Universe loader for catalog-side consumers.
 *
 * Wraps the Smart Cart V2 universe registry (`@/content/smart-cart`)
 * with two affordances catalog code wants:
 *
 *   1. Optional scope filter — return only entries with a topic that
 *      matches the supplied scope keyword.
 *   2. ASIN-backed filter — v7.3.3 decision #10 says photo-V2
 *      recommendations are Amazon-only during beta. Non-Amazon entries
 *      (Vermont local hardware, in-store-only items) are excluded.
 *
 * The shape returned here is the rich UniverseProduct from the
 * registry — callers project further as needed (the refresh worker
 * flattens to its own SKU-row shape; the synthesizer keeps the full
 * tags + variant data for slot resolution).
 */

import { getUniverse } from '@/content/smart-cart'
import type { UniverseProduct } from '@/lib/smart-cart-universe'

export interface LoadUniverseOptions {
  /**
   * Restrict to entries whose tags.topics contains a topic that
   * matches this scope keyword. Examples:
   *   "basement_moisture" -> matches topics like "basement",
   *     "moisture", "weatherization"
   *   "kitchen_organizers" -> matches "kitchen"
   *
   * Match is bidirectional substring — either side containing the
   * other counts. Avoids over-specifying the topic taxonomy.
   */
  scope?: string

  /**
   * If true (default), filter to entries with an Amazon ASIN on the
   * variant. The catalog-refresh cron only refreshes ASIN-backed
   * entries, and the photo-V2 synthesizer only recommends ASIN-backed
   * picks during the v7.3.3 beta.
   */
  asinOnly?: boolean
}

export async function loadUniverse(
  options: LoadUniverseOptions = {}
): Promise<UniverseProduct[]> {
  const { scope, asinOnly = true } = options
  let entries = getUniverse()

  if (asinOnly) {
    entries = entries.filter((u) => !!u.variant.amazonAsin)
  }

  if (scope) {
    entries = entries.filter((u) =>
      u.tags.topics.some(
        (t) => t.includes(scope) || scope.includes(t)
      )
    )
  }

  return entries
}
