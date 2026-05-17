/**
 * Alder Read v1 — Vision Extraction
 *
 * v7.3.3-C update: MODEL_VERSION bumped to claude-sonnet-4-5-20250929
 * after the v7.3.3-B diagnostic showed every basement extraction was
 * failing with 404 not_found_error on the deprecated
 * claude-3-5-sonnet-20241022 model ID. Same model the chat route uses.
 *
 * Two extraction paths now coexist in this file:
 *
 *   1. extractFromPhoto (v1.0.0) — original Tier 2 closed-schema path
 *      (room confirmation + era + per-room feature enums). Used by
 *      legacy room-confirmation surfaces. Kept as-is.
 *
 *   2. extractFromImage (DEPRECATED, basement-only) — v7.3.3-B
 *      basement-moisture path. After v7.3.3-C PR1 it delegates to
 *      extractOpenFeatures + a shim that maps open-shape features to
 *      the basement signal vocabulary. Kept callable so any legacy
 *      caller doesn't break; new callers should use extractOpenFeatures.
 *
 *   3. extractOpenFeatures (v7.3.3-C, open extraction) — the new
 *      strategic path. Looks at any home photo and returns a feature
 *      array with type/location/condition/confidence/category_hint.
 *      Prompt + schema live in src/lib/vision/prompt.ts so the eval
 *      harness can import them without pulling the Anthropic client.
 *
 * The prompt is the product. The synthesis quality downstream depends
 * entirely on this file. Treat changes here as production deploys.
 *
 * Version history:
 *   v1.0.0      — initial Tier 2 closed-schema (room/era/features)
 *   basement-v1 — v7.3.3-B basement-moisture extraction (now deprecated)
 *   open-v1.0.0 — v7.3.3-C open extraction (current strategic path)
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  OPEN_EXTRACTION_PROMPT_VERSION,
  PROMPT_SYSTEM,
  PROMPT_USER,
  parseModelOutput,
  type OpenExtraction,
  type OpenFeature,
} from './prompt'

// =============================================================================
// CONFIG
// =============================================================================

export const PROMPT_VERSION = 'v1.0.0'
// v7.3.3-C-PR1.3: switched from claude-sonnet-4-5-20250929 to
// claude-haiku-4-5. Sonnet 4.5 vision was consistently taking >10s
// on Hobby plan even after capping output tokens at 1500 (PR1.2),
// breaking every upload with a 504. Haiku is ~3-5x faster (typical
// 1-3s) at ~4x lower cost. Tradeoff: slightly lower per-feature
// accuracy, acceptable for v7.3.3-C because PR3 reaction capture is
// the curation layer that drives confidence scores in LearningStore
// going forward.
//
// Model ID note: using the alias form (no date suffix), matching the
// existing claude-opus-4-7 pattern in src/lib/catalog/expand.ts.
// extractFromPhoto (the unused legacy v1.0.0 path) still references
// MODEL_VERSION so it gets the upgrade too.
export const MODEL_VERSION = 'claude-haiku-4-5'
export const CONFIDENCE_THRESHOLD = 0.7
export const MAX_TOKENS = 1024
// Open extraction tokens cap. Bumped back up from 1500 (PR1.2) to
// 2500 because Haiku is fast enough that we can afford richer output
// without timing out. Real ceiling: ~3-5s for the API call leaves
// ~5-7s for the rest of the route, comfortably under the 10s function
// budget.
export const OPEN_MAX_TOKENS = 2500

// Re-export so callers can read both versions from a single import.
export { OPEN_EXTRACTION_PROMPT_VERSION }

// =============================================================================
// EXTRACTION SCHEMA
// =============================================================================

/**
 * The strict JSON shape Claude vision returns. Tier 2 today, designed
 * to extend at Tier 3 without breaking downstream consumers.
 *
 * Downstream consumers (Smart Cart synthesis, condition score computation,
 * Alder Read valuation pipeline) read individual fields with safe defaults.
 * If a field is missing, treat as unknown — never assume.
 */
export interface VisionExtractionV1 {
  // Room classification — the most important field. If this is wrong,
  // everything downstream is wrong.
  room_type_confirmed:
    | 'kitchen'
    | 'bathroom'
    | 'living_room'
    | 'bedroom'
    | 'dining_room'
    | 'deck'
    | 'patio'
    | 'basement'
    | 'mudroom'
    | 'laundry'
    | 'hallway'
    | 'office'
    | 'exterior_front'
    | 'exterior_back'
    | 'garage'
    | 'attic'
    | 'closet'
    | 'other'
    | 'unclear'
  room_type_confidence: number // 0-1

  // Era classification — when does this room appear to have been last
  // significantly renovated or installed? Coarse buckets to keep accuracy.
  finish_era_estimate:
    | 'pre_1970s'
    | '1970s'
    | '1980s'
    | '1990s'
    | '2000s'
    | '2010s'
    | '2020s'
    | 'mixed'
    | 'unclear'
  finish_era_confidence: number

  // Visible features — structured booleans and categoricals. These are
  // the join keys for Smart Cart synthesis. Each field is per-room-type
  // relevant; null for fields not applicable to the detected room.
  visible_features: {
    // Kitchen-specific
    cabinet_style?:
      | 'shaker'
      | 'flat_slab'
      | 'raised_panel'
      | 'glass_front'
      | 'open_shelving'
      | 'mixed'
      | 'unclear'
    cabinet_color?:
      | 'white'
      | 'cream'
      | 'wood_light'
      | 'wood_medium'
      | 'wood_dark'
      | 'painted_color'
      | 'two_tone'
      | 'unclear'
    cabinet_hardware_present?: boolean
    soft_close_hardware_visible?: boolean
    countertop_material?:
      | 'granite'
      | 'quartz'
      | 'laminate'
      | 'butcher_block'
      | 'solid_surface'
      | 'tile'
      | 'concrete'
      | 'marble'
      | 'unclear'
    backsplash_present?: boolean
    backsplash_material?: 'subway_tile' | 'mosaic' | 'natural_stone' | 'other_tile' | 'painted_drywall' | 'unclear'
    under_cabinet_lighting?: boolean
    appliance_era?: '1990s_or_older' | '2000s' | '2010s' | '2020s' | 'mixed' | 'unclear'
    appliance_finish?: 'stainless' | 'white' | 'black' | 'panel_ready' | 'mixed' | 'unclear'

    // Bathroom-specific
    vanity_style?: 'pedestal' | 'cabinet_single' | 'cabinet_double' | 'floating' | 'unclear'
    shower_type?: 'tub_only' | 'tub_shower_combo' | 'walk_in_shower' | 'no_shower' | 'unclear'
    tile_present?: boolean
    tile_extent?: 'floor_only' | 'walls_partial' | 'walls_full' | 'floor_and_walls' | 'unclear'

    // Universal interior
    flooring_type?: 'hardwood' | 'engineered_wood' | 'laminate' | 'tile' | 'vinyl' | 'carpet' | 'concrete' | 'mixed' | 'unclear'
    wall_finish?: 'painted_drywall' | 'wallpaper' | 'shiplap' | 'tile' | 'wood_panel' | 'exposed_brick' | 'mixed' | 'unclear'
    ceiling_height_estimate?: 'standard_8ft' | 'tall_9_plus' | 'low_under_8' | 'vaulted' | 'unclear'
    natural_light?: 'abundant' | 'moderate' | 'limited' | 'unclear'

    // Deck/exterior-specific
    deck_material?: 'pressure_treated' | 'cedar' | 'composite' | 'pvc' | 'ipe_hardwood' | 'unclear'
    deck_size_estimate?: 'small_under_200sqft' | 'medium_200_400' | 'large_400_plus' | 'unclear'
    railing_present?: boolean
    railing_material?: 'wood' | 'composite' | 'metal' | 'cable' | 'glass' | 'none' | 'unclear'

    // Universal exterior
    siding_material?: 'wood_clapboard' | 'vinyl' | 'fiber_cement' | 'brick' | 'stone' | 'stucco' | 'mixed' | 'unclear'
    roof_material?: 'asphalt_shingle' | 'metal' | 'slate' | 'cedar_shake' | 'other' | 'not_visible'
  }

  // Short condition note — qualitative, used in cart receipt prose, not
  // in any structured downstream join. Keep it factual, not evaluative.
  // Bad: "Outdated kitchen, needs full reno." Good: "Cabinets and counters
  // present and intact, no under-cabinet lighting visible, hardware appears
  // original."
  condition_note_short: string

  // Overall confidence in the extraction as a whole. Min of room confidence
  // and the geometric mean of feature confidences. Computed by the model,
  // sanity-checked by the worker.
  overall_confidence: number

  // ----- Tier 3 reserved fields (NOT populated in v1.0.0) -----
  // defects_visible?: string[]
  // damage_severity?: 'none' | 'cosmetic' | 'functional' | 'urgent'
  // product_identifications?: Array<{ category: string; brand?: string; confidence: number }>
}

// =============================================================================
// THE PROMPT
// =============================================================================

/**
 * The system prompt. Frozen at PROMPT_VERSION. Changes require version bump
 * and re-extraction of affected photos (background job).
 *
 * Notes on prompt design:
 *   1. The model is told to return JSON only. No prose. No markdown fence.
 *   2. The schema is enumerated explicitly. Free-text values are rejected.
 *   3. "unclear" is always a valid value. Forcing a guess is the main
 *      failure mode for vision extraction; we prefer "unclear" + low
 *      confidence over a confident hallucination.
 *   4. The condition_note_short is constrained to factual observation.
 *   5. The model is told NOT to attempt product identification, defect
 *      detection, or value judgments. These are Tier 3 and will be added
 *      with a different prompt and a different review process.
 */
export const SYSTEM_PROMPT = `You are an interior condition observer for Alder, a home renovation data platform. You are given a single photograph of a room or exterior of a residential property. Your job is to return a single JSON object describing what is visible.

# Rules

1. Output a single JSON object. No prose. No markdown code fences. No commentary before or after.
2. Use only the values enumerated in the schema below. "unclear" is always a valid value. Do not invent values not in the enum.
3. Use "unclear" liberally. A confident wrong answer is worse than an honest "unclear". When you are not sure, return "unclear" and lower the relevant confidence.
4. Do not identify products by brand. Do not identify defects, damage, or wear severity. Do not make value judgments ("dated", "needs work", "outdated"). Those are out of scope for this version.
5. condition_note_short is one sentence, 20 words maximum, factual observation only. Bad: "Cabinets look dated and need replacement." Good: "Shaker-style white cabinets with knob hardware, no under-cabinet lighting visible, countertops appear to be granite."
6. Populate only the visible_features fields that are relevant to the room_type_confirmed value. Fields not relevant should be omitted. For example, a bathroom photo should not have cabinet_style or appliance_era; a kitchen photo should not have vanity_style or shower_type.
7. overall_confidence reflects your total certainty about the extraction. If room_type_confidence is below 0.7, overall_confidence must also be below 0.7.

# Schema

\`\`\`json
{
  "room_type_confirmed": "kitchen | bathroom | living_room | bedroom | dining_room | deck | patio | basement | mudroom | laundry | hallway | office | exterior_front | exterior_back | garage | attic | closet | other | unclear",
  "room_type_confidence": 0.0-1.0,
  "finish_era_estimate": "pre_1970s | 1970s | 1980s | 1990s | 2000s | 2010s | 2020s | mixed | unclear",
  "finish_era_confidence": 0.0-1.0,
  "visible_features": {
    // Kitchen fields (omit if not a kitchen):
    "cabinet_style": "shaker | flat_slab | raised_panel | glass_front | open_shelving | mixed | unclear",
    "cabinet_color": "white | cream | wood_light | wood_medium | wood_dark | painted_color | two_tone | unclear",
    "cabinet_hardware_present": true | false,
    "soft_close_hardware_visible": true | false,
    "countertop_material": "granite | quartz | laminate | butcher_block | solid_surface | tile | concrete | marble | unclear",
    "backsplash_present": true | false,
    "backsplash_material": "subway_tile | mosaic | natural_stone | other_tile | painted_drywall | unclear",
    "under_cabinet_lighting": true | false,
    "appliance_era": "1990s_or_older | 2000s | 2010s | 2020s | mixed | unclear",
    "appliance_finish": "stainless | white | black | panel_ready | mixed | unclear",

    // Bathroom fields (omit if not a bathroom):
    "vanity_style": "pedestal | cabinet_single | cabinet_double | floating | unclear",
    "shower_type": "tub_only | tub_shower_combo | walk_in_shower | no_shower | unclear",
    "tile_present": true | false,
    "tile_extent": "floor_only | walls_partial | walls_full | floor_and_walls | unclear",

    // Universal interior fields (include for any interior room):
    "flooring_type": "hardwood | engineered_wood | laminate | tile | vinyl | carpet | concrete | mixed | unclear",
    "wall_finish": "painted_drywall | wallpaper | shiplap | tile | wood_panel | exposed_brick | mixed | unclear",
    "ceiling_height_estimate": "standard_8ft | tall_9_plus | low_under_8 | vaulted | unclear",
    "natural_light": "abundant | moderate | limited | unclear",

    // Deck fields (omit if not a deck):
    "deck_material": "pressure_treated | cedar | composite | pvc | ipe_hardwood | unclear",
    "deck_size_estimate": "small_under_200sqft | medium_200_400 | large_400_plus | unclear",
    "railing_present": true | false,
    "railing_material": "wood | composite | metal | cable | glass | none | unclear",

    // Exterior fields (include if exterior_front or exterior_back):
    "siding_material": "wood_clapboard | vinyl | fiber_cement | brick | stone | stucco | mixed | unclear",
    "roof_material": "asphalt_shingle | metal | slate | cedar_shake | other | not_visible"
  },
  "condition_note_short": "one factual sentence, 20 words max",
  "overall_confidence": 0.0-1.0
}
\`\`\`

# Final reminder

Return only the JSON object. Nothing else.`

// =============================================================================
// THE WORKER
// =============================================================================

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ExtractInput {
  photoBlobUrl: string // signed Vercel Blob URL, public-readable
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  // Optional: user-supplied room type hint at upload time. The model uses
  // this as context but is allowed to disagree (in which case the
  // disagreement is flagged for review).
  userRoomTypeHint?: string
}

export interface ExtractOutput {
  extraction: VisionExtractionV1
  rawResponse: string
  modelVersion: string
  promptVersion: string
  apiCostCents: number
  shouldReview: boolean // true if confidence < threshold OR hint mismatch
  reviewReason?: string
}

/**
 * Run vision extraction on a single photo.
 *
 * Errors thrown:
 *   - VisionExtractionError if the model returns non-JSON or fails schema
 *     validation. The caller should retry once with a stronger
 *     "JSON only" reminder appended; if it fails again, route to review
 *     queue with status="rejected".
 */
export async function extractFromPhoto(input: ExtractInput): Promise<ExtractOutput> {
  // The SDK 0.30 image block only supports base64-encoded sources (URL
  // sources were added in a later SDK rev). resolveImageSource accepts
  // either a Vercel Blob URL (fetches + encodes) or a data URI (parses
  // out the base64) so eval.ts can keep passing data URIs.
  const { data: imageData, mediaType } = await resolveImageSource(input)

  const userContent: Array<
    Anthropic.Messages.TextBlockParam | Anthropic.Messages.ImageBlockParam
  > = [
    {
      type: 'image',
      source: {
        type: 'base64',
        data: imageData,
        media_type: mediaType,
      },
    },
  ]

  if (input.userRoomTypeHint) {
    userContent.push({
      type: 'text',
      text: `User-supplied room type hint at upload: ${input.userRoomTypeHint}. Treat as context. Disagree if the photo shows a different room type.`,
    })
  } else {
    userContent.push({
      type: 'text',
      text: 'Extract per the schema.',
    })
  }

  const response = await client.messages.create({
    model: MODEL_VERSION,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userContent,
      },
    ],
  })

  // Single text block expected
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new VisionExtractionError('no_text_block', 'Model returned no text content')
  }
  const rawText = textBlock.text.trim()

  // Strip code fences if the model included them despite instructions
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: VisionExtractionV1
  try {
    parsed = JSON.parse(jsonText) as VisionExtractionV1
  } catch (e) {
    throw new VisionExtractionError('invalid_json', `Could not parse JSON: ${(e as Error).message}`, rawText)
  }

  // Schema sanity check — confidence values in range, room type in enum
  validateExtraction(parsed)

  // Cost estimate — Sonnet vision: ~$3/M input, ~$15/M output
  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const apiCostCents = Math.ceil((inputTokens * 0.0003 + outputTokens * 0.0015) * 100) / 100

  // Review decision
  let shouldReview = false
  let reviewReason: string | undefined
  if (parsed.overall_confidence < CONFIDENCE_THRESHOLD) {
    shouldReview = true
    reviewReason = `Low confidence: ${parsed.overall_confidence.toFixed(2)}`
  }
  if (
    input.userRoomTypeHint &&
    parsed.room_type_confirmed !== 'unclear' &&
    parsed.room_type_confirmed !== input.userRoomTypeHint
  ) {
    shouldReview = true
    reviewReason = `Room type mismatch: hint=${input.userRoomTypeHint}, detected=${parsed.room_type_confirmed}`
  }

  return {
    extraction: parsed,
    rawResponse: rawText,
    modelVersion: MODEL_VERSION,
    promptVersion: PROMPT_VERSION,
    apiCostCents,
    shouldReview,
    reviewReason,
  }
}

// =============================================================================
// IMAGE SOURCE RESOLUTION
// =============================================================================

type AllowedMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

async function resolveImageSource(input: ExtractInput): Promise<{
  data: string
  mediaType: AllowedMediaType
}> {
  if (input.photoBlobUrl.startsWith('data:')) {
    const match = input.photoBlobUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      throw new VisionExtractionError('invalid_data_uri', 'Could not parse data URI')
    }
    const [, mimeStr, b64] = match
    return { data: b64, mediaType: mimeStr as AllowedMediaType }
  }

  const resp = await fetch(input.photoBlobUrl)
  if (!resp.ok) {
    throw new VisionExtractionError(
      'fetch_failed',
      `Could not fetch photo ${input.photoBlobUrl}: HTTP ${resp.status}`
    )
  }
  const buf = Buffer.from(await resp.arrayBuffer())
  return { data: buf.toString('base64'), mediaType: input.mimeType }
}

// =============================================================================
// VALIDATION
// =============================================================================

const VALID_ROOM_TYPES = new Set([
  'kitchen',
  'bathroom',
  'living_room',
  'bedroom',
  'dining_room',
  'deck',
  'patio',
  'basement',
  'mudroom',
  'laundry',
  'hallway',
  'office',
  'exterior_front',
  'exterior_back',
  'garage',
  'attic',
  'closet',
  'other',
  'unclear',
])

const VALID_ERAS = new Set([
  'pre_1970s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
  'mixed',
  'unclear',
])

function validateExtraction(e: VisionExtractionV1): void {
  if (!VALID_ROOM_TYPES.has(e.room_type_confirmed)) {
    throw new VisionExtractionError('invalid_room_type', `Unknown room_type_confirmed: ${e.room_type_confirmed}`)
  }
  if (!VALID_ERAS.has(e.finish_era_estimate)) {
    throw new VisionExtractionError('invalid_era', `Unknown finish_era_estimate: ${e.finish_era_estimate}`)
  }
  if (e.room_type_confidence < 0 || e.room_type_confidence > 1) {
    throw new VisionExtractionError('confidence_out_of_range', 'room_type_confidence not in [0,1]')
  }
  if (e.finish_era_confidence < 0 || e.finish_era_confidence > 1) {
    throw new VisionExtractionError('confidence_out_of_range', 'finish_era_confidence not in [0,1]')
  }
  if (e.overall_confidence < 0 || e.overall_confidence > 1) {
    throw new VisionExtractionError('confidence_out_of_range', 'overall_confidence not in [0,1]')
  }
  if (!e.condition_note_short || typeof e.condition_note_short !== 'string') {
    throw new VisionExtractionError('missing_note', 'condition_note_short missing or not a string')
  }
  if (e.condition_note_short.length > 200) {
    // Soft cap — we asked for 20 words, allow some grace before failing
    throw new VisionExtractionError('note_too_long', `condition_note_short is ${e.condition_note_short.length} chars`)
  }
}

export class VisionExtractionError extends Error {
  constructor(public code: string, message: string, public rawText?: string) {
    super(message)
    this.name = 'VisionExtractionError'
  }
}

// =============================================================================
// SMART CART JOIN HELPERS
// =============================================================================

/**
 * Pull boolean features for Smart Cart synthesis. Returns null for any
 * feature where the extraction is "unclear" or missing — callers must
 * treat null as "unknown" not "false".
 */
export function featureBooleans(e: VisionExtractionV1): Record<string, boolean | null> {
  const f = e.visible_features
  return {
    has_under_cabinet_lighting: nullableBool(f.under_cabinet_lighting),
    has_backsplash: nullableBool(f.backsplash_present),
    has_cabinet_hardware: nullableBool(f.cabinet_hardware_present),
    has_soft_close: nullableBool(f.soft_close_hardware_visible),
    has_tile: nullableBool(f.tile_present),
    has_railing: nullableBool(f.railing_present),
  }
}

function nullableBool(v: boolean | undefined): boolean | null {
  return v === undefined ? null : v
}

/**
 * Returns the structured feature categories useful for filtering the
 * Smart Cart universe. Values are stable enum strings or null.
 */
export function featureCategories(e: VisionExtractionV1): Record<string, string | null> {
  const f = e.visible_features
  return {
    cabinet_style: nullableEnum(f.cabinet_style),
    cabinet_color: nullableEnum(f.cabinet_color),
    countertop_material: nullableEnum(f.countertop_material),
    flooring_type: nullableEnum(f.flooring_type),
    appliance_era: nullableEnum(f.appliance_era),
    appliance_finish: nullableEnum(f.appliance_finish),
    deck_material: nullableEnum(f.deck_material),
    siding_material: nullableEnum(f.siding_material),
  }
}

function nullableEnum(v: string | undefined): string | null {
  if (v === undefined || v === 'unclear') return null
  return v
}

// =============================================================================
// V7.3.3-B: BASEMENT-SPECIFIC EXTRACTION FOR PHOTO READER BETA
// =============================================================================
//
// Distinct from extractFromPhoto above — basement_moisture beta uses a
// tighter schema with explicit moisture-signal enums tuned for the
// dual-synthesis rules in lib/smart-cart/synthesize-v2. Single category
// for v7.3.3; other categories continue to use extractFromPhoto's
// general-purpose path.

export interface BasementVisibleFeature {
  feature: string
  confidence: number
}

export type BasementMoistureSignal =
  | 'efflorescence'
  | 'staining'
  | 'active_water'
  | 'visible_cracks'
  | 'rust_on_metal'
  | 'musty_indicators_visual'
  | 'sump_pump_present'
  | 'dehumidifier_present'
  | 'vapor_barrier_visible'
  | 'none_visible'

export interface BasementExtraction {
  roomTypeConfirmed: boolean
  detectedRoomType: string
  finishState: 'unfinished' | 'partially_finished' | 'finished' | 'unknown'
  visibleFeatures: BasementVisibleFeature[]
  moistureSignals: BasementMoistureSignal[]
  overallConfidence: number
  promptVersion: string
}

// v7.3.3-C: basement-only prompt + helpers removed. extractFromImage
// now delegates to extractOpenFeatures + openFeaturesToBasementExtraction.
// Shim lives at the bottom of this file.

/**
 * DEPRECATED in v7.3.3-C — kept callable for backwards compatibility.
 *
 * Now delegates to extractOpenFeatures (the open-vocabulary path) and
 * converts the result to the basement-signal shape via the bridge shim.
 * The bridge shim exists so the existing 3 basement rules in
 * synthesize-v2.ts still fire during the PR1 → PR2 window. Shim will
 * be deleted in PR2 when synthesis pivots to feature-signature lookup.
 *
 * New callers should use extractOpenFeatures directly.
 */
export async function extractFromImage(opts: {
  imageBuffer: Buffer
  contextRoomType?: 'basement'
  scope?: 'basement_moisture'
}): Promise<BasementExtraction> {
  const { extraction } = await extractOpenFeatures({ imageBuffer: opts.imageBuffer })
  return openFeaturesToBasementExtraction(extraction)
}

// =============================================================================
// V7.3.3-C: OPEN EXTRACTION (current strategic path)
// =============================================================================

export interface OpenExtractionResult {
  /** The parsed + zod-validated extraction. */
  extraction: OpenExtraction
  /** Raw text the model returned, for replay + debugging. */
  rawResponse: string
  /** Model ID we called. */
  modelVersion: string
  /** Prompt version constant — bumped on any prompt or schema change. */
  promptVersion: string
  /** Estimated dollar cost in cents, computed from token usage. */
  apiCostCents: number
  /** Token counts for audit + per-call cost reporting. */
  tokensIn: number
  tokensOut: number
  /** Server-side wall-clock latency for the API call. */
  latencyMs: number
}

/**
 * v7.3.3-C — open photo extraction.
 *
 * Sends the photo + open-vocab prompt to Claude vision. Returns the
 * parsed feature array + meta. Throws on:
 *   - Anthropic API error (network, auth, model 404, content policy)
 *   - JSON parse failure
 *   - zod schema validation failure
 *
 * Caller (api/photos/upload) wraps in try/catch and records
 * VISION_EXTRACTION_FAILED with the error message. The Photo row is
 * still saved so the synthesizer can later surface "we couldn't read
 * this one."
 *
 * Latency budget: 3-8s on Sonnet 4.5 for a 2400px JPEG with
 * OPEN_MAX_TOKENS=4096. Stays under the Vercel Hobby 10s function
 * timeout with margin for sharp + blob + Prisma writes.
 */
export async function extractOpenFeatures(opts: {
  imageBuffer: Buffer
  /** Defaults to image/jpeg (upload route always normalizes to JPEG). */
  mediaType?: 'image/jpeg' | 'image/png' | 'image/webp'
}): Promise<OpenExtractionResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set')
  }
  const apiClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const t0 = Date.now()

  const base64 = opts.imageBuffer.toString('base64')

  const resp = await apiClient.messages.create({
    model: MODEL_VERSION,
    max_tokens: OPEN_MAX_TOKENS,
    system: PROMPT_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: opts.mediaType ?? 'image/jpeg',
              data: base64,
            },
          },
          { type: 'text', text: PROMPT_USER },
        ],
      },
    ],
  })

  const rawText = resp.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text)
    .join('')

  // Parsing + zod validation happens here. parseModelOutput throws
  // OpenExtractionParseError on failure.
  const extraction = parseModelOutput(rawText)

  // Haiku 4.5 pricing as of v7.3.3-C-PR1.3: ~$1/M input, ~$5/M output.
  // (Sonnet 4.5 was $3/$15.) Output dominates total cost because vision
  // call output is much larger than the text portion of the input; the
  // image is comparatively cheap once tokenized.
  const tokensIn = resp.usage.input_tokens
  const tokensOut = resp.usage.output_tokens
  const apiCostCents = Math.ceil((tokensIn * 0.0001 + tokensOut * 0.0005) * 100) / 100

  return {
    extraction,
    rawResponse: rawText,
    modelVersion: MODEL_VERSION,
    promptVersion: OPEN_EXTRACTION_PROMPT_VERSION,
    apiCostCents,
    tokensIn,
    tokensOut,
    latencyMs: Date.now() - t0,
  }
}

// =============================================================================
// V7.3.3-C BRIDGE SHIM: open features -> basement extraction
// =============================================================================
//
// Exists for one purpose: keep the 3 existing basement rules in
// synthesize-v2.ts firing during the PR1 -> PR2 window. PR2 replaces
// synthesize-v2 with feature-signature lookup against LearningStore;
// at that point this shim gets deleted and BasementExtraction itself
// can be retired.
//
// Mapping logic (intentionally minimal):
//   - finishState <- look for unfinished_basement_walls /
//     finished_basement_walls in features[].type, fall back to "unknown"
//   - moistureSignals <- match feature.type against the
//     BasementMoistureSignal enum directly (model is seeded with these
//     exact strings in PROMPT_SYSTEM)
//   - visibleFeatures <- one row per basement-category feature
//   - overallConfidence <- mean of basement-category feature confidences,
//     falls back to 0 if no basement features

const BASEMENT_SIGNAL_VALUES: ReadonlySet<string> = new Set<BasementMoistureSignal>([
  'efflorescence',
  'staining',
  'active_water',
  'visible_cracks',
  'rust_on_metal',
  'musty_indicators_visual',
  'sump_pump_present',
  'dehumidifier_present',
  'vapor_barrier_visible',
  'none_visible',
])

// Some open-extraction types include a prefix or suffix. Strip common
// ones so "moisture_efflorescence" still maps to "efflorescence" etc.
const BASEMENT_SIGNAL_TYPE_ALIASES: Record<string, BasementMoistureSignal> = {
  moisture_efflorescence: 'efflorescence',
  water_staining: 'staining',
  visible_cracks_wall: 'visible_cracks',
  foundation_crack: 'visible_cracks',
  rust_on_metal: 'rust_on_metal',
  musty_indicators_visual: 'musty_indicators_visual',
  sump_pump_present: 'sump_pump_present',
  dehumidifier_present: 'dehumidifier_present',
  vapor_barrier_visible: 'vapor_barrier_visible',
  active_water: 'active_water',
}

export function openFeaturesToBasementExtraction(
  open: OpenExtraction
): BasementExtraction {
  // Only consider features the model categorized as basement (or
  // category_hint=unclear, just in case — some moisture features
  // could plausibly belong elsewhere but we don't want to drop a
  // dehumidifier in a utility room shot).
  const basementFeatures = open.features.filter(
    (f) => f.category_hint === 'basement' || f.category_hint === 'unclear'
  )

  // moistureSignals: direct enum match OR aliased match
  const moistureSignals: BasementMoistureSignal[] = []
  for (const f of basementFeatures) {
    if (BASEMENT_SIGNAL_VALUES.has(f.type)) {
      moistureSignals.push(f.type as BasementMoistureSignal)
    } else if (BASEMENT_SIGNAL_TYPE_ALIASES[f.type]) {
      moistureSignals.push(BASEMENT_SIGNAL_TYPE_ALIASES[f.type]!)
    }
  }
  // Dedup
  const dedupedSignals = Array.from(new Set(moistureSignals))

  // finishState from type pattern match
  let finishState: BasementExtraction['finishState'] = 'unknown'
  for (const f of basementFeatures) {
    if (f.type === 'finished_basement_walls') {
      finishState = 'finished'
      break
    }
    if (f.type === 'unfinished_basement_walls') {
      finishState = 'unfinished'
      break
    }
  }

  // visibleFeatures: one per basement-category feature, condition as label
  const visibleFeatures: BasementVisibleFeature[] = basementFeatures.map((f) => ({
    feature: f.type,
    confidence: f.confidence,
  }))

  // overallConfidence: mean of basement features, or 0 if none. We
  // intentionally don't fall back to overall_photo_category confidence
  // because that's not a field in the open shape — the photo-level
  // category is categorical, not confidence-weighted.
  const overallConfidence =
    basementFeatures.length > 0
      ? basementFeatures.reduce((acc, f) => acc + f.confidence, 0) / basementFeatures.length
      : 0

  const roomTypeConfirmed =
    open.overall_photo_category === 'basement' ||
    basementFeatures.length > 0

  return {
    roomTypeConfirmed,
    detectedRoomType: open.overall_photo_category,
    finishState,
    visibleFeatures,
    moistureSignals: dedupedSignals,
    overallConfidence,
    promptVersion: OPEN_EXTRACTION_PROMPT_VERSION,
  }
}

// Re-export the open types so callers can import everything from
// '@/lib/vision/extract' without needing two import statements.
export type { OpenExtraction, OpenFeature }
