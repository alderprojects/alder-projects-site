/**
 * v7.4.13 — CoverageSchema v1: the nine systems and their shot slots.
 *
 * This is the static, versioned definition of what a "complete read" of a
 * home means. Structure is FIXED by the v7.4.13 spec §1.2 — nine systems,
 * 31 slots. Labels and guidance are editorial and may be polished without
 * a version bump; adding/removing/renaming a system or slot MUST bump
 * COVERAGE_SCHEMA_VERSION, because CoverageSlot rows key off slotId.
 *
 * CR1 (coverage is knowledge, never fear): every string in this file is
 * an invitation or a factual instruction. No slot is described in terms of
 * risk, danger, failure, or consequence. `invitation` is the copy shown on
 * a dark region; `guidance` is the how-to-shoot line shown in the panel.
 *
 * CR2 (no artificial locks): `window` is ordering/nudge metadata ONLY.
 * Nothing in this file gates capture — every system is readable any day.
 * See coverage/order.ts, which is the only consumer of `window`.
 */

/** Bump on any structural change (system/slot ids, counts). */
export const COVERAGE_SCHEMA_VERSION = 'coverage-v1'

/** Seasonal read windows. Ordering metadata only — never a gate (CR2). */
export type SeasonWindow = 'spring' | 'fall' | 'anytime'

export interface CoverageSlotDef {
  /** Stable id, unique within its system. Persisted on CoverageSlot. */
  slotId: string
  /** Panel label, e.g. "North wall". */
  label: string
  /** How to take the shot. Doubles as the coaching baseline (CR3). */
  guidance: string
}

export interface CoverageSystemDef {
  /** Stable id. Persisted on CoverageSlot. */
  systemId: string
  /** Display name, e.g. "Basement & Foundation". */
  label: string
  /** Copy for a dark region — an invitation, never a warning (CR1). */
  invitation: string
  /** Honest reason this system reads well in its window (CR2 copy). */
  windowNote: string | null
  window: SeasonWindow
  slots: CoverageSlotDef[]
}

/**
 * The nine systems, in schema order. Display order is computed per-record
 * (see coverage/order.ts); this array is the canonical definition only.
 */
export const COVERAGE_SCHEMA: readonly CoverageSystemDef[] = [
  {
    systemId: 'basement_foundation',
    label: 'Basement & Foundation',
    invitation: "Haven't seen your basement yet",
    window: 'spring',
    windowNote: 'Basements read best in spring, when the ground is wettest and the walls show what they show.',
    slots: [
      { slotId: 'wall_north', label: 'North wall', guidance: 'Stand back far enough to get the full wall, floor to ceiling. Lights on.' },
      { slotId: 'wall_south', label: 'South wall', guidance: 'Same as the north wall — full height, straight on.' },
      { slotId: 'wall_east', label: 'East wall', guidance: 'Same again. If something blocks the wall, shoot what you can see.' },
      { slotId: 'wall_west', label: 'West wall', guidance: 'Last of the four. Corners are useful — include them if you can.' },
      { slotId: 'floor_perimeter', label: 'Floor & perimeter', guidance: 'Point down at the seam where the floor meets the wall. Walk a little if the basement is large.' },
    ],
  },
  {
    systemId: 'roof_attic',
    label: 'Roof & Attic',
    invitation: "Haven't seen your attic yet",
    window: 'fall',
    windowNote: 'Attics read best before freeze-up, while you can still see how the season left them.',
    slots: [
      { slotId: 'attic_overview', label: 'Attic overview', guidance: 'From the hatch, shoot the length of the space. A flashlight or flash helps a lot.' },
      { slotId: 'sheathing_underside', label: 'Sheathing underside', guidance: 'Point up at the underside of the roof deck. Flash on.' },
      { slotId: 'insulation_depth', label: 'Insulation depth', guidance: 'Shoot across the insulation at a low angle so its depth is visible, not straight down.' },
      { slotId: 'penetrations_vents', label: 'Penetrations & vents', guidance: 'Anywhere something passes through the roof — vent stacks, fans, chimney.' },
    ],
  },
  {
    systemId: 'exterior_drainage',
    label: 'Exterior & Drainage',
    invitation: "Haven't seen the outside yet",
    window: 'spring',
    windowNote: 'Exteriors read best in spring, when drainage shows itself.',
    slots: [
      { slotId: 'front_elevation', label: 'Front elevation', guidance: 'Stand back and get the whole front of the house in one frame.' },
      { slotId: 'rear_elevation', label: 'Rear elevation', guidance: 'Same from the back. Include the roofline if you can.' },
      { slotId: 'grading_downspouts', label: 'Grading & downspouts', guidance: 'Shoot where a downspout meets the ground, including a few feet of the ground beyond it.' },
      { slotId: 'foundation_line', label: 'Foundation line', guidance: 'The band where the house meets the earth. Walk the perimeter and shoot a representative stretch.' },
    ],
  },
  {
    systemId: 'electrical',
    label: 'Electrical',
    invitation: "Haven't seen your panel yet",
    window: 'anytime',
    windowNote: null,
    slots: [
      { slotId: 'panel_door_open', label: 'Panel, door open', guidance: 'Open the panel door and shoot the breakers straight on. Flash on — panels are always darker than they look.' },
      { slotId: 'panel_labeling', label: 'Panel labeling', guidance: 'Close in on the label card or handwritten labels so the text is readable.' },
      { slotId: 'outlet_gfci', label: 'A representative outlet', guidance: 'Any outlet — ideally one near a sink, so the GFCI buttons are visible.' },
    ],
  },
  {
    systemId: 'plumbing',
    label: 'Plumbing',
    invitation: "Haven't seen your plumbing yet",
    window: 'anytime',
    windowNote: null,
    slots: [
      { slotId: 'water_heater', label: 'Water heater & dataplate', guidance: 'One of the whole unit, then step in close on the dataplate sticker so the text reads.' },
      { slotId: 'main_shutoff', label: 'Main shutoff', guidance: 'Where the water line enters the house, usually basement or utility wall.' },
      { slotId: 'under_sink_kitchen', label: 'Under the kitchen sink', guidance: 'Open the cabinet, move what is in the way, flash on.' },
      { slotId: 'under_sink_bath', label: 'Under the bathroom sink', guidance: 'Same as the kitchen — the trap and the supply lines.' },
    ],
  },
  {
    systemId: 'hvac',
    label: 'Heating & Cooling',
    invitation: "Haven't seen your heating yet",
    window: 'fall',
    windowNote: 'Heating reads best in fall, before the system is working hard.',
    slots: [
      { slotId: 'unit_dataplate', label: 'Furnace or air handler', guidance: 'The whole unit, then close on the dataplate so the model and year read.' },
      { slotId: 'filter_slot', label: 'Filter slot', guidance: 'Slide the filter partway out and shoot it, or shoot the slot with the filter in place.' },
      { slotId: 'condensate_venting', label: 'Condensate & venting', guidance: 'The drain line and the flue or exhaust pipe where they leave the unit.' },
    ],
  },
  {
    systemId: 'windows_doors',
    label: 'Windows & Doors',
    invitation: "Haven't seen your windows yet",
    window: 'fall',
    windowNote: 'Windows read best in fall, ahead of the heating season.',
    slots: [
      { slotId: 'window_sill_seal', label: 'A representative window', guidance: 'Shoot the sill and the seal where the sash meets the frame, close enough to see the caulk line.' },
      { slotId: 'door_threshold', label: 'Exterior door threshold', guidance: 'Open the door and shoot down at the threshold and the gap beneath it.' },
      { slotId: 'weatherstripping', label: 'Weatherstripping', guidance: 'Close on the strip along a door or window edge.' },
    ],
  },
  {
    systemId: 'kitchen',
    label: 'Kitchen',
    invitation: "Haven't seen your kitchen yet",
    window: 'anytime',
    windowNote: null,
    slots: [
      { slotId: 'sink_counter_seam', label: 'Sink & counter seam', guidance: 'The seam where the sink meets the counter, and the backsplash line behind it.' },
      { slotId: 'appliance_surround', label: 'Appliance surround', guidance: 'The range or dishwasher and the cabinetry immediately around it.' },
    ],
  },
  {
    systemId: 'bath',
    label: 'Bath',
    invitation: "Haven't seen your bath yet",
    window: 'anytime',
    windowNote: null,
    slots: [
      { slotId: 'tub_shower_surround', label: 'Tub or shower surround', guidance: 'The wall surface and the corners where it meets the tub or pan.' },
      { slotId: 'toilet_base', label: 'Toilet base', guidance: 'Point down at the floor where the toilet meets it.' },
      { slotId: 'exhaust_fan', label: 'Exhaust fan', guidance: 'Point up at the fan grille in the ceiling.' },
    ],
  },
] as const

// ---------------------------------------------------------------------------
// Derived constants + lookups
// ---------------------------------------------------------------------------

export const SYSTEM_COUNT = COVERAGE_SCHEMA.length

/** Total shot slots across all systems — the "Y of 31 shots" denominator. */
export const SLOT_COUNT = COVERAGE_SCHEMA.reduce((n, s) => n + s.slots.length, 0)

const SYSTEM_BY_ID = new Map(COVERAGE_SCHEMA.map((s) => [s.systemId, s]))

export function getSystem(systemId: string): CoverageSystemDef | undefined {
  return SYSTEM_BY_ID.get(systemId)
}

export function getSlot(systemId: string, slotId: string): CoverageSlotDef | undefined {
  return SYSTEM_BY_ID.get(systemId)?.slots.find((s) => s.slotId === slotId)
}

/** True when (systemId, slotId) is a real address in this schema version. */
export function isValidSlot(systemId: string, slotId: string): boolean {
  return getSlot(systemId, slotId) != null
}

/**
 * The generic slot every system carries implicitly. Used when a photo maps
 * confidently to a system but not to a specific shot — the common case for
 * organic (untagged) uploads. It occupies no slot in SLOT_COUNT: it records
 * that the system was seen without claiming any particular shot was taken.
 *
 * See coverage/mapping.ts for why untagged photos usually land here.
 */
export const GENERIC_SLOT_ID = '_general'
