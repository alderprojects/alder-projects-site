/**
 * v7.4.16 §1.1/§1.4 — object grouping for multi-object reads.
 *
 * WHY DERIVED, NOT GENERATED (read before adding a prompt change):
 *
 * §1.2 proposed a new `subject` field on the synthesis output, produced by
 * the model. That is the one engine-adjacent change in the release, and its
 * release gate (§2.1 golden equivalence over 8 fixtures) cannot currently be
 * run — the golden set does not exist. See BUILD_REPORT-v7.4.16.md.
 *
 * So grouping is derived entirely from data already on the recommendation:
 * the `claimLinks[].signatures`, which are `feature_type:room:severity`
 * strings emitted by the existing pipeline. No prompt change, no schema
 * change, and therefore verdicts provably cannot drift — CR1 holds by
 * construction rather than by test.
 *
 * The chain in §1.1 is preserved exactly; only its first link is dormant:
 *   1. item.subject          — read if present, so a future §1.2 drops in
 *   2. dominant feature type — implemented here
 *   3. "Also in this photo." — final fallback
 *
 * CR5: every label below is keyed to allow-listed extraction vocabulary
 * (lib/vision/prompt.ts seeded types plus types observed in production).
 * Nothing here invents an object the extraction did not see.
 */

/** Final fallback group label (§1.1). */
export const UNGROUPED_LABEL = 'Also in this photo'

export interface ClaimLinkLike {
  signatures?: string[]
  featureRefs?: number[]
}

export interface GroupableItem {
  key?: string | null
  verdict: string
  title: string
  /** Dormant §1.2 field — honoured when present, never required. */
  subject?: string | null
  claimLinks?: ClaimLinkLike[] | null
  compositeScore?: number | null
  sortOrder?: number
}

/**
 * feature_type pattern → subject label. Ordered; first match wins, so
 * more specific patterns precede general ones.
 */
const SUBJECT_RULES: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  // Safety-class objects first — they are also the focus selector's input.
  { pattern: /smoke_detector|co_detector|carbon_monoxide/, label: 'Smoke & CO alarms' },
  { pattern: /electrical_panel|panel_at_capacity|breaker|knob_and_tube|exposed_(electrical_)?wiring/, label: 'Electrical panel & wiring' },
  { pattern: /gfci|electrical_outlet|outlet_visible/, label: 'Outlets & GFCI' },
  { pattern: /handrail|stair/, label: 'Stairs & handrails' },

  // Envelope
  { pattern: /window_treatment|blind|curtain|shade/, label: 'Window treatments' },
  { pattern: /window/, label: 'Windows' },
  { pattern: /door_(seal|threshold|sweep)|storm_door|door/, label: 'Doors' },
  { pattern: /weatherstrip/, label: 'Weatherstripping' },
  { pattern: /shingle|roof_deck|flashing|moss_on/, label: 'Roof' },
  { pattern: /gutter|downspout/, label: 'Gutters & drainage' },
  { pattern: /siding|trim|peeling_paint_exterior|wood_rot/, label: 'Siding & trim' },
  { pattern: /foundation|efflorescence|grade_sloping/, label: 'Foundation' },
  { pattern: /deck_board|rotting_wood_deck|weathered_deck|joist_visible|deck/, label: 'Deck' },
  { pattern: /insulation/, label: 'Insulation' },

  // Systems
  { pattern: /water_heater/, label: 'Water heater' },
  { pattern: /hvac|furnace|boiler|air_handler|radiator|ductwork|thermostat|filter_dirty/, label: 'Heating & cooling' },
  { pattern: /condensate|exhaust|ventilation|vent_/, label: 'Ventilation' },
  { pattern: /pipe|shutoff|faucet|leaking/, label: 'Plumbing' },

  // Surfaces & fixtures
  { pattern: /tub|shower|surround/, label: 'Tub & shower' },
  { pattern: /grout|tile/, label: 'Tile & grout' },
  { pattern: /toilet/, label: 'Toilet' },
  { pattern: /vanity|sink|countertop|counter_/, label: 'Counters & sinks' },
  { pattern: /cabinet/, label: 'Cabinets' },
  { pattern: /range_hood|cooktop|refrigerator|dishwasher|appliance/, label: 'Appliances' },
  { pattern: /ceiling/, label: 'Ceiling' },
  { pattern: /floor|carpet|baseboard/, label: 'Flooring & baseboards' },
  { pattern: /lighting|light_fixture/, label: 'Lighting' },
  { pattern: /mildew|moisture|water_stain|active_water|sump|dehumidifier|vapor_barrier/, label: 'Moisture' },
]

/** The feature types backing an item, lowercased, in claim order. */
export function featureTypesOf(item: GroupableItem): string[] {
  const out: string[] = []
  for (const link of item.claimLinks ?? []) {
    for (const sig of link.signatures ?? []) {
      // signatures are `feature_type:room:severity`
      const type = String(sig).split(':')[0]?.toLowerCase()
      if (type) out.push(type)
    }
  }
  return out
}

/**
 * Derive the subject label for one item.
 *
 * Deterministic: with several candidate feature types, the winner is the
 * one with the most supporting signatures, ties broken by SUBJECT_RULES
 * order (never by iteration order of a Map keyed on model output).
 */
export function subjectFor(item: GroupableItem): { label: string; grounded: boolean } {
  // Link 1 — a model-supplied subject, honoured only if it is traceable to
  // this item's own feature vocabulary (§1.2 validator, kept live so the
  // field can be switched on without revisiting this file).
  const supplied = item.subject?.trim()
  if (supplied) {
    const types = featureTypesOf(item)
    // The grounding check needs the claimLinks to check AGAINST. Those are
    // server-side only — the wire ships the derived label, not the raw
    // `feature_type:room:severity` signatures. So on the client there is
    // nothing to validate and the supplied label is trusted, having already
    // been validated by shapeRows() on the way out.
    //
    // Getting this wrong once cost a render: the client re-ran the check
    // with no evidence, every item failed it, and the whole read collapsed
    // into a single "Also in this photo" group.
    if (types.length === 0) return { label: supplied, grounded: true }

    const haystack = types.join(' ')
    const tokens = supplied.toLowerCase().split(/\s+/).filter((t) => t.length > 3)
    if (tokens.some((t) => haystack.includes(t.replace(/s$/, '')))) {
      return { label: supplied, grounded: true }
    }
    // Ungrounded: fall through to derivation and let the caller log
    // SUBJECT_UNGROUNDED.
    return { ...derive(item), grounded: false }
  }
  return { ...derive(item), grounded: true }
}

function derive(item: GroupableItem): { label: string } {
  const types = featureTypesOf(item)
  if (types.length === 0) return { label: UNGROUPED_LABEL }

  let best: { ruleIndex: number; count: number } | null = null
  for (let i = 0; i < SUBJECT_RULES.length; i++) {
    const count = types.filter((t) => SUBJECT_RULES[i].pattern.test(t)).length
    if (count === 0) continue
    if (!best || count > best.count) best = { ruleIndex: i, count }
  }
  return { label: best ? SUBJECT_RULES[best.ruleIndex].label : UNGROUPED_LABEL }
}

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

export interface SubjectGroup<T extends GroupableItem> {
  label: string
  items: T[]
  /** Best composite in the group — drives section order after the focus. */
  bestScore: number
}

export interface GroupingResult<T extends GroupableItem> {
  groups: SubjectGroup<T>[]
  /** Items whose supplied subject failed the grounding check (§1.2 log). */
  ungrounded: Array<{ key: string | null; supplied: string }>
  /** Grouping only activates at ≥2 subjects (§1.1.4). */
  multiSubject: boolean
}

export function groupBySubject<T extends GroupableItem>(items: T[]): GroupingResult<T> {
  const byLabel = new Map<string, T[]>()
  const ungrounded: GroupingResult<T>['ungrounded'] = []

  for (const item of items) {
    const { label, grounded } = subjectFor(item)
    if (!grounded && item.subject) ungrounded.push({ key: item.key ?? null, supplied: item.subject })
    const list = byLabel.get(label) ?? []
    list.push(item)
    byLabel.set(label, list)
  }

  const groups: SubjectGroup<T>[] = Array.from(byLabel.entries()).map(([label, groupItems]) => ({
    label,
    items: groupItems,
    bestScore: Math.max(...groupItems.map((i) => i.compositeScore ?? 0)),
  }))

  // Best group first; "Also in this photo" always last regardless of score.
  groups.sort((a, b) => {
    if (a.label === UNGROUPED_LABEL) return 1
    if (b.label === UNGROUPED_LABEL) return -1
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore
    return a.label.localeCompare(b.label)
  })

  return { groups, ungrounded, multiSubject: groups.length >= 2 }
}

/** The "We looked at:" chips — group labels in display order (§1.1.1). */
export function inventoryChips<T extends GroupableItem>(result: GroupingResult<T>): string[] {
  return result.groups.map((g) => g.label)
}
