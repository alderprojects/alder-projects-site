/**
 * v7.4.13 — "What's next" ordering.
 *
 * CR2 — THIS IS THE ONLY MODULE THAT READS `window`, and it only ever
 * SORTS. It never filters, disables, defers, or hides. Every system stays
 * one tap from a read on any day of the year; the season decides what we
 * mention first, and the copy says why (schema.windowNote).
 *
 * Ranking, most useful first:
 *   1. dark systems      — a first read tells us the most
 *   2. aging systems     — a refresh keeps what we know true
 *   3. partial systems   — filling out depth
 * with in-window systems sorted ahead of out-of-window ones inside each
 * band, and schema order as the final deterministic tiebreak.
 */

import type { CoverageView, SystemView } from './state'
import type { SeasonWindow } from './schema'
import { COVERAGE_SCHEMA } from './schema'

/** Northern-hemisphere read seasons. Vermont is the first market. */
export function currentWindow(now: Date = new Date()): SeasonWindow | null {
  const m = now.getMonth() // 0-indexed
  if (m >= 2 && m <= 4) return 'spring' // Mar–May
  if (m >= 8 && m <= 10) return 'fall' // Sep–Nov
  return null
}

function band(s: SystemView): number {
  if (s.state === 'dark') return 0
  if (s.state === 'aging') return 1
  return s.filledCount < s.totalCount ? 2 : 3
}

const SCHEMA_ORDER = new Map(COVERAGE_SCHEMA.map((s, i) => [s.systemId, i]))

/**
 * Ordered systemIds for the "what's next" strip. Complete, fresh systems
 * sort last but are still present — nothing is removed from the list.
 */
export function nextUpOrder(view: CoverageView, now: Date = new Date()): string[] {
  const season = currentWindow(now)
  return [...view.systems]
    .sort((a, b) => {
      const bandDelta = band(a) - band(b)
      if (bandDelta !== 0) return bandDelta
      // In-window first — ordering only (CR2).
      const aIn = season != null && a.window === season ? 0 : 1
      const bIn = season != null && b.window === season ? 0 : 1
      if (aIn !== bIn) return aIn - bIn
      return (SCHEMA_ORDER.get(a.systemId) ?? 99) - (SCHEMA_ORDER.get(b.systemId) ?? 99)
    })
    .map((s) => s.systemId)
}

/**
 * The single next-best suggestion for the post-result nudge (§1.5).
 * Returns null only when every system is complete and fresh.
 */
export function nextBestSystem(view: CoverageView, now: Date = new Date()): SystemView | null {
  const order = nextUpOrder(view, now)
  for (const id of order) {
    const sys = view.systems.find((s) => s.systemId === id)
    if (sys && (sys.state === 'dark' || sys.state === 'aging' || sys.filledCount < sys.totalCount)) return sys
  }
  return null
}
