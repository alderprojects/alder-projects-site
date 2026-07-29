/**
 * v7.4.13 — Deterministic slot mapping: extraction → (systemId, slotId).
 *
 * WHY THIS SHAPE (read before editing):
 *
 * The extraction prompt (lib/vision/prompt.ts) emits TWO different kinds of
 * vocabulary, and they have opposite reliability:
 *
 *   - `category_hint` is a CLOSED enum (CATEGORY_VALUES, 20 values). The
 *     model must pick one. It is therefore safe to key on.
 *   - `type` is explicitly FREE vocabulary — the prompt says "invent new
 *     types when none of the example types fit." It is a seeded starting
 *     list, not a contract.
 *
 * The free half sprawls in practice. Across the 16 production extractions
 * live on 2026-07-28, 57 distinct types appeared, including these pairs
 * that mean the same thing:
 *
 *     caulk_failing_window / window_caulk_failing
 *     refrigerator_present / refrigerator_visible
 *     tile_grout_staining / tile_grout_discoloration
 *     exposed_wiring / exposed_electrical_wiring
 *     bathroom_lighting_present / bathroom_lighting_functional
 *     radiator_heating_present / radiator_heating_system_present
 *     kitchen_countertop_visible / _clean / _condition / countertop_condition
 *
 * So: `category_hint` is the PRIMARY key (deterministic, closed), and
 * `type` is matched by REGEX SIGNATURE rather than by equality, so that
 * synonym drift and invented types still land correctly. Every pattern
 * below is written against types that genuinely exist — either in the
 * prompt's seeded vocabulary or in the observed production set. No
 * invented feature names (§0.4).
 *
 * PRECEDENCE: cross-cutting signatures beat category. A breaker panel is
 * the electrical system whether it was photographed in a basement or a
 * garage; a water heater is plumbing wherever it stands. Room-of-capture
 * is a weaker signal than what the thing actually is.
 *
 * DEPTH IS MOSTLY NOT INFERABLE. The schema's slots are SHOTS ("panel,
 * door open" vs "panel labeling"), and the extraction vocabulary has no
 * concept of framing or intent — both shots yield `electrical_panel_visible`.
 * So for untagged (organic) photos most fills resolve to the system with
 * GENERIC_SLOT_ID. Specific slots fill reliably only when the user told us
 * what they were shooting, via the slot-tagged upload flow (§1.4 "Read
 * this"), where `taggedSlot` short-circuits inference entirely. That is by
 * design, not a gap: we credit what we can prove and invite the rest.
 */

import { GENERIC_SLOT_ID, isValidSlot } from './schema'

export interface MappableFeature {
  type: string
  category_hint?: string
  confidence: number
}

export interface SlotMatch {
  systemId: string
  slotId: string
  /**
   * True when we landed on the system but not a specific shot. Logged for
   * schema v2 so the ambiguous tail is measurable rather than guessed at.
   */
  generic: boolean
}

// ---------------------------------------------------------------------------
// 1. Cross-cutting feature signatures (checked first, beat category)
// ---------------------------------------------------------------------------

interface Signature {
  pattern: RegExp
  systemId: string
  slotId: string
}

/**
 * Ordered — first match wins. Patterns are deliberately loose (substring
 * anchored on the meaningful noun) so synonym drift still resolves.
 */
const FEATURE_SIGNATURES: readonly Signature[] = [
  // Electrical — a panel is electrical wherever it was shot.
  { pattern: /electrical_panel|panel_at_capacity|breaker/, systemId: 'electrical', slotId: 'panel_door_open' },
  { pattern: /gfci|electrical_outlet|outlet_visible/, systemId: 'electrical', slotId: 'outlet_gfci' },
  { pattern: /knob_and_tube|exposed_(electrical_)?wiring/, systemId: 'electrical', slotId: GENERIC_SLOT_ID },

  // Plumbing — fixtures identify themselves.
  { pattern: /water_heater/, systemId: 'plumbing', slotId: 'water_heater' },
  { pattern: /shutoff_valve|main_shutoff/, systemId: 'plumbing', slotId: 'main_shutoff' },
  { pattern: /leaking_pipe|pipe_corrosion/, systemId: 'plumbing', slotId: GENERIC_SLOT_ID },

  // HVAC.
  { pattern: /filter_dirty|filter_slot/, systemId: 'hvac', slotId: 'filter_slot' },
  { pattern: /condensate/, systemId: 'hvac', slotId: 'condensate_venting' },
  { pattern: /hvac_unit|furnace|boiler|air_handler|radiator_heating/, systemId: 'hvac', slotId: 'unit_dataplate' },
  { pattern: /ductwork|thermostat/, systemId: 'hvac', slotId: GENERIC_SLOT_ID },

  // Windows & doors — window features are tagged with the ROOM they were
  // shot in (observed: caulk_failing_window under category_hint=bathroom),
  // so they must be caught here or they would land in Bath.
  { pattern: /window_(caulk|air_gap|frame|sill)|caulk_failing_window/, systemId: 'windows_doors', slotId: 'window_sill_seal' },
  { pattern: /weatherstrip/, systemId: 'windows_doors', slotId: 'weatherstripping' },
  { pattern: /door_(seal|threshold|sweep)/, systemId: 'windows_doors', slotId: 'door_threshold' },

  // Roof & attic.
  { pattern: /insulation_(thin|depth)/, systemId: 'roof_attic', slotId: 'insulation_depth' },
  { pattern: /roof_decking|sheathing/, systemId: 'roof_attic', slotId: 'sheathing_underside' },
  { pattern: /vent_blocked|roof_vent|flashing_failure/, systemId: 'roof_attic', slotId: 'penetrations_vents' },
  { pattern: /shingle|moss_on_roof/, systemId: 'roof_attic', slotId: GENERIC_SLOT_ID },

  // Exterior & drainage.
  { pattern: /gutter_|downspout|drainage_pooling|grade_sloping/, systemId: 'exterior_drainage', slotId: 'grading_downspouts' },
  { pattern: /foundation_crack|settled_walkway|walkway_damage/, systemId: 'exterior_drainage', slotId: 'foundation_line' },
  { pattern: /peeling_paint_exterior|siding_damage|wood_rot_trim/, systemId: 'exterior_drainage', slotId: GENERIC_SLOT_ID },
]

// ---------------------------------------------------------------------------
// 2. category_hint → system (the closed-enum primary key)
// ---------------------------------------------------------------------------

/**
 * Every value of CATEGORY_VALUES is listed. `null` means "no honest system
 * mapping" — those categories describe living space the nine systems do not
 * cover. Unmapped is a legitimate outcome, not a failure; the alternative
 * is crediting a system the photo never showed, which would light a region
 * on a false premise.
 */
const CATEGORY_TO_SYSTEM: Readonly<Record<string, string | null>> = {
  basement: 'basement_foundation',
  kitchen: 'kitchen',
  bathroom: 'bath',
  laundry: 'plumbing',
  deck_or_patio: 'exterior_drainage',
  roof_or_gutter: 'roof_attic',
  exterior_siding: 'exterior_drainage',
  exterior_foundation: 'exterior_drainage',
  exterior_landscape: 'exterior_drainage',
  hvac: 'hvac',
  electrical_panel: 'electrical',
  plumbing: 'plumbing',
  attic: 'roof_attic',
  // No confident mapping — logged, never guessed.
  bedroom: null,
  living_area: null,
  hallway_or_stair: null,
  closet: null,
  garage: null, // genuinely mixed-use: panels, heaters, storage all appear
  mixed: null,
  unclear: null,
}

// ---------------------------------------------------------------------------
// 3. Within-category slot hints (only where the vocabulary discriminates)
// ---------------------------------------------------------------------------

const CATEGORY_SLOT_HINTS: Readonly<Record<string, ReadonlyArray<{ pattern: RegExp; slotId: string }>>> = {
  basement_foundation: [
    { pattern: /floor|slab|concrete_floor/, slotId: 'floor_perimeter' },
    // Wall features exist (efflorescence, staining) but carry no compass
    // direction, and the four wall slots are directional. Generic is the
    // honest landing spot.
  ],
  kitchen: [
    { pattern: /countertop|counter_|sink|backsplash|caulk/, slotId: 'sink_counter_seam' },
    { pattern: /range_hood|cooktop|refrigerator|appliance|dishwasher|cabinet/, slotId: 'appliance_surround' },
  ],
  bath: [
    { pattern: /tub|shower|tile|grout|surround/, slotId: 'tub_shower_surround' },
    { pattern: /toilet/, slotId: 'toilet_base' },
    { pattern: /exhaust|ventilation|fan/, slotId: 'exhaust_fan' },
  ],
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/**
 * Map a single extraction feature to a coverage address.
 *
 * `taggedSlot` short-circuits everything: when the user entered the upload
 * from a specific empty slot ("Read this"), they have told us what the shot
 * is and inference is neither needed nor welcome.
 */
export function mapFeature(
  feature: MappableFeature,
  taggedSlot?: { systemId: string; slotId: string } | null
): SlotMatch | null {
  if (taggedSlot && isValidSlot(taggedSlot.systemId, taggedSlot.slotId)) {
    return { systemId: taggedSlot.systemId, slotId: taggedSlot.slotId, generic: false }
  }

  const type = (feature.type ?? '').toLowerCase()

  // 1. Cross-cutting signatures win over room-of-capture.
  for (const sig of FEATURE_SIGNATURES) {
    if (sig.pattern.test(type)) {
      return {
        systemId: sig.systemId,
        slotId: sig.slotId,
        generic: sig.slotId === GENERIC_SLOT_ID,
      }
    }
  }

  // 2. Fall back to the closed category enum.
  const systemId = CATEGORY_TO_SYSTEM[(feature.category_hint ?? '').toLowerCase()] ?? null
  if (!systemId) return null

  // 3. Refine to a slot only where the vocabulary genuinely discriminates.
  for (const hint of CATEGORY_SLOT_HINTS[systemId] ?? []) {
    if (hint.pattern.test(type)) {
      return { systemId, slotId: hint.slotId, generic: false }
    }
  }

  return { systemId, slotId: GENERIC_SLOT_ID, generic: true }
}

/** Feature types that mapped nowhere — the schema v2 input (§1.3). */
export interface UnmappedFeature {
  type: string
  categoryHint: string | null
}

export interface MappingResult {
  matches: SlotMatch[]
  unmapped: UnmappedFeature[]
}

/** Map a whole extraction set, preserving the unmapped tail for logging. */
export function mapFeatures(
  features: MappableFeature[],
  taggedSlot?: { systemId: string; slotId: string } | null
): MappingResult {
  const matches: SlotMatch[] = []
  const unmapped: UnmappedFeature[] = []
  for (const f of features) {
    const m = mapFeature(f, taggedSlot)
    if (m) matches.push(m)
    else unmapped.push({ type: f.type, categoryHint: f.category_hint ?? null })
  }
  return { matches, unmapped }
}
