/**
 * v7.4.16 §1.1.3 — the "Start here" focus item.
 *
 * Exactly one item, chosen DETERMINISTICALLY:
 *   1. safety-class items first (smoke/CO, electrical hazard, handrails)
 *   2. otherwise the highest composite among non-SKIP items
 *   3. ties broken by sortOrder, then key — never by array order alone,
 *      so the same read picks the same winner across runs (§2 determinism)
 *
 * The reason line is the item's EXISTING text. No new prose is generated
 * here — that would be a synthesis change wearing a presentation hat.
 */

import { featureTypesOf, subjectFor, type GroupableItem } from './subjects'

/**
 * Safety classes, keyed to allow-listed extraction vocabulary. These win
 * focus over any score because a missing smoke detector outranks a better-
 * scoring cosmetic item regardless of composite.
 */
const SAFETY_PATTERN =
  /smoke_detector|co_detector|carbon_monoxide|gfci|exposed_(electrical_)?wiring|knob_and_tube|panel_at_capacity|missing_handrail|active_water|gas_leak/

export interface FocusItem<T extends GroupableItem> {
  item: T
  subject: string
  lane: string
  /** The item's existing WHY line, unmodified. */
  reason: string
  safety: boolean
}

export function isSafetyItem(item: GroupableItem): boolean {
  return featureTypesOf(item).some((t) => SAFETY_PATTERN.test(t))
}

/**
 * Pick the focus item, or null when there is nothing to focus on (an
 * all-SKIP read, or an empty one — §1.1.5 leaves those untouched).
 */
export function selectFocus<T extends GroupableItem & { summary?: string; nextAction?: string }>(
  items: T[]
): FocusItem<T> | null {
  const eligible = items.filter((i) => i.verdict !== 'SKIP')
  if (eligible.length === 0) return null

  const safety = eligible.filter(isSafetyItem)
  const pool = safety.length > 0 ? safety : eligible

  const winner = [...pool].sort((a, b) => {
    const scoreDelta = (b.compositeScore ?? 0) - (a.compositeScore ?? 0)
    if (scoreDelta !== 0) return scoreDelta
    const orderDelta = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (orderDelta !== 0) return orderDelta
    return String(a.key ?? a.title).localeCompare(String(b.key ?? b.title))
  })[0]

  return {
    item: winner,
    subject: subjectFor(winner).label,
    lane: winner.verdict,
    reason: (winner.summary ?? winner.nextAction ?? '').trim(),
    safety: safety.length > 0,
  }
}

/** Copy frame from §1.1.3. */
export function focusHeadline(focus: { subject: string; reason: string }): string {
  return `If you do one thing: ${focus.subject} — ${focus.reason}`
}
