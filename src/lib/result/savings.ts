/**
 * v7.4.16 §1.4 — the savings estimator.
 *
 * CR2 — NO INVENTED DOLLARS. Every number this returns is arithmetic over
 * (a) price data already attached to this read's SKIP items and (b) one
 * entry from the verified arbitrage table. The LLM is not consulted. There
 * is no code path that produces a figure from anything else, and the
 * function returns null rather than guessing.
 *
 * The render gate exists because the upsell says "$19.99 … saves you $X".
 * That sentence must be arithmetically true at the LOW bound, so a low
 * bound under SAVINGS_FLOOR degrades to the no-number copy.
 */

import arbitrage from '@/config/skipArbitrage.json'

/** Show numbers only when the low bound clears this (§1.4 render gate). */
export const SAVINGS_FLOOR = 20

export interface ArbitrageEntry {
  category: string
  lowDelta: number
  highDelta: number
  unit: string
  sourceGuide: string
  sourceLine: string
  basis: string
}

export const ARBITRAGE_TABLE: ArbitrageEntry[] = (arbitrage as { entries: ArbitrageEntry[] }).entries

export interface PricedItem {
  key?: string | null
  verdict: string
  /** ResolvedProduct price, when Phase 2 resolved one. */
  resolvedPrice?: number | null
  /** Synthesis price band. Both bounds required to contribute. */
  costLow?: number | null
  costHigh?: number | null
}

export interface SavingsEstimate {
  low: number
  high: number
  /** The full arithmetic, logged with SAVINGS_ESTIMATE_SHOWN (§1.4). */
  components: {
    skipItemsLow: number
    skipItemsHigh: number
    skipItemIds: string[]
    arbitrage: { category: string; lowDelta: number; highDelta: number; sourceGuide: string } | null
  }
}

/**
 * Component A — the price of what this read told you NOT to buy.
 *
 * Only SKIP-lane items contribute, and only when they carry real price
 * data. An item with no price contributes zero rather than an assumption.
 */
function skipComponent(items: PricedItem[]): { low: number; high: number; ids: string[] } {
  let low = 0
  let high = 0
  const ids: string[] = []
  for (const item of items) {
    if (item.verdict !== 'SKIP') continue
    if (item.resolvedPrice != null && item.resolvedPrice > 0) {
      low += item.resolvedPrice
      high += item.resolvedPrice
      ids.push(String(item.key ?? '(unkeyed)'))
      continue
    }
    if (item.costLow != null && item.costHigh != null && item.costLow > 0) {
      low += item.costLow
      high += item.costHigh
      ids.push(String(item.key ?? '(unkeyed)'))
    }
  }
  return { low, high, ids }
}

/** Component B — at most ONE arbitrage entry per read (§1.4). */
export function arbitrageFor(category: string | null | undefined): ArbitrageEntry | null {
  if (!category) return null
  return ARBITRAGE_TABLE.find((e) => e.category === category) ?? null
}

/**
 * Estimate what a Smart Cart saves, or null when nothing qualifies.
 *
 * Null is the common, correct answer. Callers must render the fallback
 * copy on null and must never substitute a number of their own.
 */
export function estimateCartSavings(
  items: PricedItem[],
  category?: string | null
): SavingsEstimate | null {
  const skip = skipComponent(items)
  const entry = arbitrageFor(category)

  const low = skip.low + (entry?.lowDelta ?? 0)
  const high = skip.high + (entry?.highDelta ?? 0)

  // The gate. Below the floor the claim would not be true at the low bound.
  if (low < SAVINGS_FLOOR) return null
  // Always a range, never a point estimate (§1.4).
  if (high <= low) return null

  return {
    low: Math.round(low),
    high: Math.round(high),
    components: {
      skipItemsLow: Math.round(skip.low),
      skipItemsHigh: Math.round(skip.high),
      skipItemIds: skip.ids,
      arbitrage: entry
        ? {
            category: entry.category,
            lowDelta: entry.lowDelta,
            highDelta: entry.highDelta,
            sourceGuide: entry.sourceGuide,
          }
        : null,
    },
  }
}

/** "$47–$180" — the only place an estimate becomes display text. */
export function formatSavings(estimate: SavingsEstimate): string {
  return `$${estimate.low.toLocaleString()}–$${estimate.high.toLocaleString()}`
}

/**
 * Subject label → arbitrage category.
 *
 * Kept deliberately small and literal. The category is derived from a SKIP
 * item's OWN subject, which came from its own claimLinks — so an arbitrage
 * delta can only apply to a read that actually contains a SKIP about that
 * object. There is no path where a window delta lands on a read with no
 * window item in it.
 */
const SUBJECT_TO_CATEGORY: Readonly<Record<string, string>> = {
  Windows: 'window_weatherization',
  'Window treatments': 'window_treatment',
}

/** The arbitrage category for a read, or null when none of its SKIPs match. */
export function categoryForRead(
  items: Array<{ verdict: string; subject?: string | null }>
): string | null {
  for (const item of items) {
    if (item.verdict !== 'SKIP') continue
    const category = SUBJECT_TO_CATEGORY[item.subject ?? '']
    if (category) return category
  }
  return null
}
