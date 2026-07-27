/**
 * v7.4.0 — Cart-artifact computation (same pass as the verdicts).
 *
 * For every BUY recommendation, compute the paid-tier cart layer NOW:
 * PA-API category search → Good/Better/Best candidates with `likely_fit`
 * status. The cart the buyer eventually receives is the cart that already
 * existed when the free verdict rendered — post-payment compatibility
 * answers REFINE it (flip likely_fit → confirmed_fit or remove a line),
 * never re-analyze.
 *
 * Candidates only, not detached lists: every artifact hangs off its
 * recommendation. If PA-API is unavailable, artifacts persist with
 * searchQuery + specs only and get priced at cart-open.
 */

import type { CartArtifact, EnrichedRecommendation } from './types'
import { searchItems } from './paapi'

export async function computeCartArtifacts(recs: EnrichedRecommendation[]): Promise<void> {
  const buys = recs.filter((r) => r.verdict === 'BUY' && r.categorySearchQuery)
  await Promise.all(
    buys.map(async (rec) => {
      rec.cartArtifacts = await artifactsForRec(rec)
    })
  )
}

async function artifactsForRec(rec: EnrichedRecommendation): Promise<CartArtifact[]> {
  const query = rec.categorySearchQuery as string
  const results = await searchItems(query, 8)
  const priced = results.filter((r) => r.priceLow !== null && r.availability !== 'out_of_stock')

  const base = {
    searchQuery: query,
    fitStatus: 'likely_fit' as const,
    requiredSpecs: rec.cartMeta.requiredSpecs,
    quantity: rec.cartMeta.quantity,
    installDifficulty: rec.cartMeta.installDifficulty,
  }

  if (priced.length === 0) {
    // No PA-API signal — persist the tier slots unpriced so the paid cart
    // can price them at open time.
    return (['good', 'better', 'best'] as const).map((tier) => ({
      ...base,
      tier,
      productName: `${rec.cartMeta.productCategory} — ${tier} option (priced at cart open)`,
      asin: null,
      priceLow: null,
      priceHigh: null,
      availability: 'unknown',
    }))
  }

  priced.sort((a, b) => (a.priceLow ?? 0) - (b.priceLow ?? 0))
  const good = priced[0]
  const best = priced[priced.length - 1]
  const better = priced[Math.floor(priced.length / 2)]
  const picks: Array<[('good' | 'better' | 'best'), typeof good]> = [
    ['good', good],
    ['better', better],
    ['best', best],
  ]

  // Dedupe when fewer than 3 distinct results
  const seen = new Set<string>()
  const artifacts: CartArtifact[] = []
  for (const [tier, item] of picks) {
    if (seen.has(item.asin)) continue
    seen.add(item.asin)
    artifacts.push({
      ...base,
      tier,
      productName: item.title ?? query,
      asin: item.asin,
      priceLow: item.priceLow,
      priceHigh: item.priceHigh,
      availability: item.availability,
    })
  }
  return artifacts
}
