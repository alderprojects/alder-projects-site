/**
 * v7.4.13 — Derived coverage state.
 *
 * State is NEVER stored (§1.1). A slot row carries readAt/freshUntil; what
 * that means today is computed at read time against `now`. Storing "aging"
 * would require a cron to keep it true, and a record that silently drifts
 * out of date is worse than one computed on every render.
 *
 * CR1: the three states are lit / aging / stale. None of them is a failure.
 * "Stale" means we have not looked recently — it is an invitation with a
 * date on it, not a verdict about the home.
 */

import { COVERAGE_SCHEMA, SLOT_COUNT, SYSTEM_COUNT, GENERIC_SLOT_ID, type CoverageSystemDef } from './schema'

/** A slot goes from lit to aging at 9 months, and stale at 12. */
export const AGING_AFTER_MONTHS = 9
export const STALE_AFTER_MONTHS = 12

export type SlotState = 'lit' | 'aging' | 'stale'
export type SystemState = 'lit' | 'aging' | 'dark'

export interface StoredSlot {
  systemId: string
  slotId: string
  readAt: Date
  photoQualityScore: number
  filledByReportId: string | null
}

export function addMonths(d: Date, months: number): Date {
  const out = new Date(d.getTime())
  out.setMonth(out.getMonth() + months)
  return out
}

/** freshUntil for a read taken at `readAt` (persisted alongside the row). */
export function freshUntilFor(readAt: Date): Date {
  return addMonths(readAt, STALE_AFTER_MONTHS)
}

export function slotState(readAt: Date, now: Date): SlotState {
  if (now >= addMonths(readAt, STALE_AFTER_MONTHS)) return 'stale'
  if (now >= addMonths(readAt, AGING_AFTER_MONTHS)) return 'aging'
  return 'lit'
}

// ---------------------------------------------------------------------------
// Per-system rollup
// ---------------------------------------------------------------------------

export interface SlotView {
  slotId: string
  label: string
  guidance: string
  filled: boolean
  state: SlotState | null
  readAt: Date | null
  photoQualityScore: number | null
  filledByReportId: string | null
}

export interface SystemView {
  systemId: string
  label: string
  invitation: string
  windowNote: string | null
  window: CoverageSystemDef['window']
  state: SystemState
  /** Slots counted toward the 31. Excludes stale and generic fills. */
  filledCount: number
  totalCount: number
  /** True when the system has been seen but only via untagged photos. */
  genericOnly: boolean
  slots: SlotView[]
  /** Most recent non-stale read across this system's slots. */
  lastReadAt: Date | null
}

export interface CoverageView {
  systems: SystemView[]
  /** Systems with at least one non-stale read — the "X of 9". */
  breadth: number
  breadthTotal: number
  /** Non-stale, non-generic slots — the "Y of 31". */
  depth: number
  depthTotal: number
  /** True when every system is at full depth with nothing stale (§1.6). */
  complete: boolean
  /** Systems holding at least one aging slot — "refresh due" surfaces. */
  agingSystemIds: string[]
}

/**
 * Build the full derived view for a record.
 *
 * `now` is injected rather than read from the clock so tests can seed
 * readAt at 8/10/13 months and assert the boundaries (§2 aging test).
 */
export function buildCoverageView(stored: StoredSlot[], now: Date = new Date()): CoverageView {
  const byKey = new Map<string, StoredSlot>()
  for (const s of stored) byKey.set(`${s.systemId}/${s.slotId}`, s)

  const systems: SystemView[] = COVERAGE_SCHEMA.map((def) => {
    const slots: SlotView[] = def.slots.map((slotDef) => {
      const row = byKey.get(`${def.systemId}/${slotDef.slotId}`)
      const state = row ? slotState(row.readAt, now) : null
      // A stale slot counts as unfilled for completeness, but its prior
      // read is still shown in the panel (§1.1).
      const filled = state === 'lit' || state === 'aging'
      return {
        slotId: slotDef.slotId,
        label: slotDef.label,
        guidance: slotDef.guidance,
        filled,
        state,
        readAt: row?.readAt ?? null,
        photoQualityScore: row?.photoQualityScore ?? null,
        filledByReportId: row?.filledByReportId ?? null,
      }
    })

    const generic = byKey.get(`${def.systemId}/${GENERIC_SLOT_ID}`)
    const genericState = generic ? slotState(generic.readAt, now) : null
    const genericActive = genericState === 'lit' || genericState === 'aging'

    const filledCount = slots.filter((s) => s.filled).length
    const reads = [...slots.filter((s) => s.filled), ...(genericActive ? [{ readAt: generic!.readAt }] : [])]
      .map((s) => s.readAt as Date)
      .filter(Boolean)
    const lastReadAt = reads.length ? new Date(Math.max(...reads.map((d) => d.getTime()))) : null

    const anyAging =
      slots.some((s) => s.state === 'aging') || genericState === 'aging'
    const seen = filledCount > 0 || genericActive

    return {
      systemId: def.systemId,
      label: def.label,
      invitation: def.invitation,
      windowNote: def.windowNote,
      window: def.window,
      state: !seen ? 'dark' : anyAging && filledCount === 0 ? 'aging' : anyAging ? 'aging' : 'lit',
      filledCount,
      totalCount: def.slots.length,
      genericOnly: seen && filledCount === 0,
      slots,
      lastReadAt,
    }
  })

  const breadth = systems.filter((s) => s.state !== 'dark').length
  const depth = systems.reduce((n, s) => n + s.filledCount, 0)

  return {
    systems,
    breadth,
    breadthTotal: SYSTEM_COUNT,
    depth,
    depthTotal: SLOT_COUNT,
    // "All fresh" is read as "nothing stale" — aging data is still a real
    // read. The §2 CR4 test plants a STALE system to block generation,
    // which is the boundary this matches.
    complete: systems.every((s) => s.filledCount === s.totalCount),
    agingSystemIds: systems.filter((s) => s.slots.some((sl) => sl.state === 'aging')).map((s) => s.systemId),
  }
}

/** Header line: "3 of 9 systems · 11 of 31 shots". */
export function coverageHeadline(view: CoverageView): string {
  return `${view.breadth} of ${view.breadthTotal} systems · ${view.depth} of ${view.depthTotal} shots`
}
