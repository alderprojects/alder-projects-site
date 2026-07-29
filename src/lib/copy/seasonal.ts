/**
 * v7.4.14 §1.5 — seasonal windows for topic chips.
 *
 * A chip with no `windows` is evergreen and always renders. A chip WITH
 * windows renders only when today falls inside one, and that window may
 * override the label (so "Winterizing" can read "Winterizing — early bird"
 * in its July–September run-up and revert in October).
 *
 * Dates are month-day strings, 'MM-DD', so the config never carries a year.
 * A window whose `from` is later than its `until` wraps the new year
 * (e.g. deep winter, '11-01' → '03-31').
 *
 * This gates DISPLAY of a topic chip only. It is not a paywall or a lock:
 * every catalog remains reachable by direct URL year-round.
 */

export interface SeasonalWindow {
  /** 'MM-DD' inclusive. */
  from: string
  /** 'MM-DD' inclusive. */
  until: string
  /** Optional label override while inside this window. */
  label?: string
}

export interface SeasonallyGated {
  label: string
  windows?: readonly SeasonalWindow[]
}

function toDayOfYearKey(monthDay: string): number {
  const [m, d] = monthDay.split('-').map(Number)
  if (!m || !d) throw new Error(`seasonal: bad month-day "${monthDay}"`)
  return m * 100 + d
}

function todayKey(now: Date): number {
  return (now.getMonth() + 1) * 100 + now.getDate()
}

export function inWindow(w: SeasonalWindow, now: Date): boolean {
  const from = toDayOfYearKey(w.from)
  const until = toDayOfYearKey(w.until)
  const today = todayKey(now)
  // Wrapping window (e.g. Nov → Mar) is satisfied by either side.
  return from <= until ? today >= from && today <= until : today >= from || today <= until
}

/** The active window for `item` today, or null when it should not render. */
export function activeWindow(item: SeasonallyGated, now: Date = new Date()): SeasonalWindow | null | undefined {
  if (!item.windows || item.windows.length === 0) return undefined // evergreen
  return item.windows.find((w) => inWindow(w, now)) ?? null
}

/** True when the chip should render today. Evergreen chips always do. */
export function isActive(item: SeasonallyGated, now: Date = new Date()): boolean {
  return activeWindow(item, now) !== null
}

/** Label for today, honouring any in-window override. */
export function seasonalLabel(item: SeasonallyGated, now: Date = new Date()): string {
  const w = activeWindow(item, now)
  return w?.label ?? item.label
}

/** Filter + relabel a list of chips for today. */
export function activeChips<T extends SeasonallyGated>(items: readonly T[], now: Date = new Date()): T[] {
  return items.filter((i) => isActive(i, now)).map((i) => ({ ...i, label: seasonalLabel(i, now) }))
}
