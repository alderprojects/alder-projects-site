/**
 * v7.3.3-C PR1 — Open Photo Extraction prompt + schema.
 *
 * The prompt is the product. Downstream synthesis (PR2+), LearningStore
 * signature normalization, and the photo-moat thesis as a whole all
 * depend on what this file emits.
 *
 * Design constraints from the v7.3.3-C brief:
 *   - Open extraction, no category gating. The model looks at a single
 *     photo of any part of a home and returns a feature array.
 *   - features[].type is free-vocabulary snake_case. Coverage matters
 *     more than vocabulary uniformity. Seeded with examples in the
 *     prompt; model is told to invent new types as needed.
 *   - category_hint and overall_photo_category use a CONTROLLED enum
 *     (20 values + "unclear") to make PR2 signature normalization
 *     tractable. Locking the vocab in v7.3.3 with a planned escape
 *     hatch to pure free-text in v7.4.x once we have data to inform
 *     vocabulary expansion.
 *   - Observations, never recommendations. Equipment present is as
 *     important as problems present (so the synthesizer doesn't
 *     recommend duplicates of what the homeowner already owns).
 *   - "unclear" / fewer high-confidence features over many low-
 *     confidence guesses.
 *
 * This file deliberately exports the prompt strings (not just the
 * caller). scripts/eval-vision.ts imports them directly so the eval
 * corpus runs against the same prompt the live route uses.
 */

import { z } from 'zod'

// =============================================================================
// VERSION
// =============================================================================

/**
 * Bump on any change to PROMPT_SYSTEM, PROMPT_USER, CategoryHintEnum,
 * or OpenExtractionSchema. Stored on every VisionExtraction row so we
 * can replay or re-eval across prompt versions.
 */
// v1.1.0 — PR3.7 §1.1: rebalanced example types so the prompt does
// not over-bias the model toward basement vocabulary. The May 17
// MCP test found that a living-room photo extracted with basement
// signatures because the example list was 60% basement. v1.1.0
// distributes examples across all 20 categories evenly, with an
// explicit "be category-honest" instruction added to the system
// prompt rules.
export const OPEN_EXTRACTION_PROMPT_VERSION = 'open-v1.1.0'

// =============================================================================
// CONTROLLED CATEGORY VOCABULARY
// =============================================================================

/**
 * 20 values. Same vocab used for per-feature `category_hint` and the
 * photo-level `overall_photo_category`. "mixed" is valid for
 * overall_photo_category (multiple distinct rooms visible) but not for
 * a single feature. "unclear" is always valid.
 *
 * Locked for v7.3.3-C. Vocabulary expansion happens in v7.3.4+ once
 * miss-log data from real users tells us what's actually under-served.
 */
export const CATEGORY_VALUES = [
  'basement',
  'kitchen',
  'bathroom',
  'bedroom',
  'living_area',
  'laundry',
  'hallway_or_stair',
  'closet',
  'deck_or_patio',
  'roof_or_gutter',
  'exterior_siding',
  'exterior_foundation',
  'exterior_landscape',
  'hvac',
  'electrical_panel',
  'plumbing',
  'attic',
  'garage',
  'mixed', // overall_photo_category only
  'unclear',
] as const

export type CategoryValue = (typeof CATEGORY_VALUES)[number]

const CategoryEnum = z.enum(CATEGORY_VALUES)

// =============================================================================
// SCHEMA
// =============================================================================

/**
 * A single observation from a single photo. `type` is free vocabulary
 * (snake_case), `condition` is one-sentence free-text. Everything else
 * is constrained.
 */
export const OpenFeatureSchema = z.object({
  type: z
    .string()
    .min(2)
    .max(80)
    // Accept lowercase letters, digits, underscores. No spaces, no
    // CamelCase, no hyphens — keeps downstream signature normalization
    // simple.
    .regex(/^[a-z0-9_]+$/, 'type must be lowercase snake_case'),
  location: z.string().min(1).max(200),
  condition: z.string().min(1).max(400),
  confidence: z.number().min(0).max(1),
  category_hint: CategoryEnum,
})

export type OpenFeature = z.infer<typeof OpenFeatureSchema>

export const OpenExtractionSchema = z.object({
  features: z.array(OpenFeatureSchema).max(40), // sane upper bound
  overall_photo_category: CategoryEnum,
  notes: z.string().max(600).default(''),
})

export type OpenExtraction = z.infer<typeof OpenExtractionSchema>

// =============================================================================
// PROMPTS
// =============================================================================

/**
 * SYSTEM prompt. The instructions about what to observe, how to write,
 * what NOT to do.
 *
 * Why the prohibitions are explicit:
 *   - "no recommendations" — synthesis is downstream; prompt-time
 *     recommendations bias the extraction toward sellable products.
 *   - "no value judgments" — keeps the data asset usable for valuation
 *     research without subjective noise.
 *   - "no defect inference beyond what's visible" — guards against
 *     model hallucination on the most consequential observations
 *     (mold, structural cracks, electrical hazards).
 *   - "no demographic/household inference" — privacy + bias.
 */
export const PROMPT_SYSTEM = `You are a vision observer for Alder, a home maintenance and recommendation engine. You look at a single photograph of a residential home — inside or outside — and return a structured list of observations.

Your job is to surface the most actionable observations a homeowner might want to act on, AND any equipment already present that's doing a job. Both matter: the downstream system uses problems to recommend purchases and uses present-equipment to avoid recommending duplicates of what the homeowner already owns.

# Output

Return a single JSON object that conforms to the schema below. Output JSON only — no prose, no markdown code fences, no commentary.

**Target 3-7 features per photo.** Quality over quantity. Skip trivial observations (e.g. "wall is painted white"). If the photo is genuinely sparse, returning 1-2 features is fine. If it's busy, prioritize the highest-confidence and highest-actionability observations and stop at ~7.

# What to observe

Surface the genuinely visible observations that match these categories:
- Moisture, water, staining, efflorescence, rust, peeling paint
- Damage: cracks, rot, settled walkways, missing shingles, peeling caulk, gaps
- Missing safety equipment: GFCIs, smoke detectors, handrails, gutters
- Present equipment: dehumidifiers, sump pumps, vapor barriers, water heaters, electrical panels, appliances, HVAC units
- Finish state: finished/unfinished, dated/recent
- Exposure risks: clogged gutters, overhanging branches, accumulated debris
- Deferred maintenance: weathered wood, sagging fixtures, neglected sealants

# Rules

1. Each feature has a snake_case \`type\` (e.g. \`moisture_efflorescence\`, \`dehumidifier_present\`, \`missing_gfci\`, \`rotting_wood_deck\`, \`gutter_clogged\`). Use lowercase letters, digits, and underscores only — no spaces, no hyphens, no CamelCase. Coverage matters more than vocabulary uniformity: invent new types when none of the example types fit.

2. \`location\` is free text describing WHERE in the photo (e.g. "northwest corner of basement wall near sump", "kitchen counter to the left of the sink"). Be specific.

3. \`condition\` is a one-sentence factual OBSERVATION, not a recommendation. Good: "approximately 6 inches of white crystalline efflorescence along the lower mortar joints, no active water visible." Bad: "needs sealing."

4. \`confidence\` is 0.0-1.0. Be honest. A confident wrong answer is worse than a low-confidence honest one. If you can't clearly see it, lower confidence or omit the feature entirely.

5. \`category_hint\` MUST be one of the enum values listed in the schema. Pick the best fit. Use "unclear" if you genuinely cannot tell.

6. \`overall_photo_category\` MUST be one of the enum values. Use "mixed" if multiple distinct categories are equally visible. Use "unclear" if you cannot tell.

7. \`notes\` is short free text for things that don't fit the feature shape (e.g. "photo is very dark", "appears to be a partial wall section, full context unclear"). Can be empty.

# Prohibitions

Do NOT:
- Recommend products, brands, or actions. (Out of scope.)
- Make value judgments ("dated", "ugly", "needs work", "outdated"). Describe what's there.
- Infer defects you cannot see. Do not assume mold from staining. Do not assume structural failure from cracks. Do not assume electrical hazards from panel age alone.
- Infer demographics, income, household composition, or neighborhood.
- Identify products by brand or model.
- Estimate cost or property value.
- Fabricate features to fill out the array. An empty features array is acceptable if nothing is genuinely observable.

# Be category-honest

Set \`overall_photo_category\` and each feature's \`category_hint\` based on what you actually see in the photo. Do NOT pre-bias toward any category. A living room is a living room; a kitchen is a kitchen; a basement is a basement. If you can't tell what room or area you're looking at, use "unclear" rather than guessing. If the photo shows multiple areas (e.g. a doorway between kitchen and living room), use "mixed" at the photo level and pick the right per-feature category_hint individually.

# Example feature types (starting vocabulary — extend as needed)

Examples are distributed across categories. Use the right example for the category in the photo, not whichever sounds most common.

KITCHEN: dated_kitchen_cabinets, missing_under_cabinet_lighting, cabinet_hardware_missing, range_hood_visible, leaking_faucet_visible, water_stained_ceiling, missing_gfci, electrical_panel_visible
BATHROOM: leaking_faucet_visible, missing_gfci, missing_handrail, vanity_lighting_missing, mildew_on_grout, tile_cracked, sink_caulk_failing
BEDROOM: dated_carpet, ceiling_crack, baseboard_separation, window_air_gap, missing_smoke_detector, closet_organization_missing
LIVING_AREA: dated_carpet, ceiling_crack, baseboard_separation, missing_smoke_detector, dated_window_treatments, fireplace_visible, hardwood_floor_wear
BASEMENT: moisture_efflorescence, water_staining, active_water, dehumidifier_present, sump_pump_present, vapor_barrier_visible, unfinished_basement_walls, finished_basement_walls
LAUNDRY: washer_dryer_visible, water_heater_visible, water_stained_ceiling, exposed_wiring, dryer_vent_visible
DECK_OR_PATIO: rotting_wood_deck, weathered_deck_finish, missing_handrail, deck_board_lifting, joist_visible
ROOF_OR_GUTTER: asphalt_shingle_curl, missing_shingle, gutter_clogged, gutter_separated, flashing_failure, moss_on_shingles
EXTERIOR_SIDING: peeling_paint_exterior, siding_damage, caulk_failing_window, wood_rot_trim
EXTERIOR_FOUNDATION: foundation_crack, settled_walkway, grade_sloping_toward_house, foundation_efflorescence
EXTERIOR_LANDSCAPE: overgrown_vegetation, drainage_pooling, walkway_damage
HVAC: hvac_unit_outdoor, hvac_unit_indoor, ductwork_visible, condensate_line_visible, filter_dirty
ELECTRICAL_PANEL: electrical_panel_visible, panel_at_capacity_visual, exposed_wiring, knob_and_tube_visible
PLUMBING: leaking_faucet_visible, leaking_pipe_visible, pipe_corrosion, shutoff_valve_visible
ATTIC: insulation_thin, knob_and_tube_visible, roof_decking_stain, vent_blocked
GARAGE: door_seal_failing, exposed_wiring, water_heater_visible

The above is a starting list — invent new \`type\` values whenever the photo shows something not covered.`

/**
 * USER prompt sent with the image. Includes the JSON schema and a final
 * "return JSON only" reminder.
 *
 * Kept short. The system prompt does the heavy lifting; this is the
 * per-message instruction the model reads last (and tends to honor most).
 */
export const PROMPT_USER = `Analyze this photo and return a single JSON object matching this schema. No prose, no markdown fences, JSON only.

{
  "features": [
    {
      "type": "snake_case_string",
      "location": "free text describing where in the photo",
      "condition": "one-sentence factual observation, no recommendations",
      "confidence": 0.0,
      "category_hint": "${CATEGORY_VALUES.filter((c) => c !== 'mixed').join(' | ')}"
    }
  ],
  "overall_photo_category": "${CATEGORY_VALUES.join(' | ')}",
  "notes": "short free text or empty string"
}

Return JSON only.`

// =============================================================================
// PARSING + BACKWARDS-COMPAT
// =============================================================================

/**
 * Parse raw model output into a validated OpenExtraction. Strips
 * markdown code fences if present (some models still wrap despite
 * instructions). Throws OpenExtractionParseError on failure.
 */
export function parseModelOutput(raw: string): OpenExtraction {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/gm, '')
    .replace(/```\s*$/gm, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    throw new OpenExtractionParseError(
      'invalid_json',
      `Model output was not valid JSON: ${(e as Error).message}. First 200 chars: ${cleaned.slice(0, 200)}`
    )
  }

  // Coerce: if features is missing, treat as empty array. Some models
  // omit empty arrays.
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    !Array.isArray((parsed as Record<string, unknown>).features)
  ) {
    ;(parsed as Record<string, unknown>).features = []
  }
  // Coerce: if notes is missing, default empty string.
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    (parsed as Record<string, unknown>).notes == null
  ) {
    ;(parsed as Record<string, unknown>).notes = ''
  }

  const result = OpenExtractionSchema.safeParse(parsed)
  if (!result.success) {
    throw new OpenExtractionParseError(
      'schema_validation_failed',
      `Model output did not match schema: ${result.error.message}`
    )
  }
  return result.data
}

export class OpenExtractionParseError extends Error {
  constructor(
    public code: 'invalid_json' | 'schema_validation_failed',
    message: string
  ) {
    super(message)
    this.name = 'OpenExtractionParseError'
  }
}

/**
 * Backwards-compat detection. v7.3.3-B basement-shaped rows look like
 *   { roomTypeConfirmed, detectedRoomType, finishState, visibleFeatures,
 *     moistureSignals, overallConfidence, promptVersion }
 * v7.3.3-C open-shape rows look like
 *   { features, overall_photo_category, notes }
 *
 * Returns true if the json is the new (open) shape.
 *
 * Called by: cart synthesis (to decide whether to run the bridge shim
 * vs treat as native old-shape BasementExtraction).
 */
export function isOpenExtractionShape(json: unknown): json is OpenExtraction {
  return (
    typeof json === 'object' &&
    json !== null &&
    Array.isArray((json as Record<string, unknown>).features) &&
    typeof (json as Record<string, unknown>).overall_photo_category === 'string'
  )
}
