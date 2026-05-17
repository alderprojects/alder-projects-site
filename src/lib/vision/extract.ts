/**
 * Alder Read v1 — Vision Extraction
 *
 * Tier 2: structured extraction from a single uploaded photo via Claude
 * vision (claude-3-5-sonnet-20241022 or claude-3-7-sonnet). Output is a
 * strict JSON schema. Confidence under 0.7 routes to manual review.
 *
 * The prompt is the product. The synthesis quality downstream depends
 * entirely on this file. Treat changes here as production deploys.
 *
 * Version history:
 *   v1.0.0 — initial Tier 2 schema (room confirmation, era, features,
 *            short condition note). No defect detection. No product
 *            identification.
 *
 * Tier 3 fields (defects_visible, damage_severity, product_identifications)
 * are NOT populated in this version. They are defined as optional in the
 * schema so downstream consumers can ignore missing fields without code
 * changes when Tier 3 ships.
 */

import Anthropic from '@anthropic-ai/sdk'

// =============================================================================
// CONFIG
// =============================================================================

export const PROMPT_VERSION = 'v1.0.0'
export const MODEL_VERSION = 'claude-3-5-sonnet-20241022'
export const CONFIDENCE_THRESHOLD = 0.7
export const MAX_TOKENS = 1024

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

const BASEMENT_SYSTEM_PROMPT = `You analyze homeowner-uploaded basement photos to assist a home-improvement shopping recommendation engine.

YOU MUST:
- Return strict JSON matching the provided schema
- Stick to visible facts only
- Use the moistureSignals enum exactly — no other values
- Provide overallConfidence as a 0-1 number reflecting how well the photo supports the extraction

YOU MUST NOT:
- Make value judgments ("this basement looks bad")
- Estimate cost or savings of any work
- Infer income, demographics, neighborhood, or homeowner characteristics
- Recommend specific products
- Diagnose mold, structural damage, electrical issues, or safety hazards
- Suggest remediation steps

If the photo is not actually a basement, set roomTypeConfirmed: false and overallConfidence: 0, and leave other fields at defaults.`

const BASEMENT_USER_PROMPT = `Analyze this basement photo. Return JSON only, matching this schema (no markdown fences):

{
  "roomTypeConfirmed": boolean,
  "detectedRoomType": string,
  "finishState": "unfinished" | "partially_finished" | "finished" | "unknown",
  "visibleFeatures": [{"feature": string, "confidence": 0-1}],
  "moistureSignals": ["efflorescence" | "staining" | "active_water" | "visible_cracks" | "rust_on_metal" | "musty_indicators_visual" | "sump_pump_present" | "dehumidifier_present" | "vapor_barrier_visible" | "none_visible"],
  "overallConfidence": 0-1,
  "promptVersion": "${PROMPT_VERSION}"
}`

const ALLOWED_MOISTURE_SIGNALS: ReadonlySet<string> = new Set<BasementMoistureSignal>([
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

const ALLOWED_FINISH_STATES = ['unfinished', 'partially_finished', 'finished', 'unknown'] as const

/**
 * Inline, synchronous basement-photo extraction for the v7.3.3 photo
 * reader beta. ~3-7 second latency per call against claude vision.
 * Caller (upload route) must budget for this within the Vercel Hobby
 * 10s function timeout.
 *
 * Throws on any failure (Anthropic API error, schema parse failure,
 * etc.). Caller catches and records VisionExtraction.reviewStatus
 * appropriately.
 */
export async function extractFromImage(opts: {
  imageBuffer: Buffer
  contextRoomType: 'basement'
  scope: 'basement_moisture'
}): Promise<BasementExtraction> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set')
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const base64 = opts.imageBuffer.toString('base64')

  const resp = await client.messages.create({
    model: MODEL_VERSION,
    max_tokens: 1500,
    system: BASEMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
          },
          { type: 'text', text: BASEMENT_USER_PROMPT },
        ],
      },
    ],
  })

  const text = resp.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text)
    .join('')

  const cleaned = text
    .replace(/^```(?:json)?\s*/gm, '')
    .replace(/```\s*$/gm, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Vision response was not parseable JSON: ${cleaned.slice(0, 200)}`)
  }

  return validateBasementExtraction(parsed)
}

function validateBasementExtraction(raw: unknown): BasementExtraction {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Vision response is not an object')
  }
  const r = raw as Record<string, unknown>

  const finishState = typeof r.finishState === 'string' && (ALLOWED_FINISH_STATES as readonly string[]).includes(r.finishState)
    ? (r.finishState as BasementExtraction['finishState'])
    : 'unknown'

  const moistureSignalsRaw = Array.isArray(r.moistureSignals) ? r.moistureSignals : []
  const moistureSignals = moistureSignalsRaw
    .filter((s): s is BasementMoistureSignal => typeof s === 'string' && ALLOWED_MOISTURE_SIGNALS.has(s))

  const visibleFeaturesRaw = Array.isArray(r.visibleFeatures) ? r.visibleFeatures : []
  const visibleFeatures = visibleFeaturesRaw
    .filter((f): f is { feature: string; confidence: number } =>
      typeof f === 'object' && f !== null &&
      typeof (f as Record<string, unknown>).feature === 'string' &&
      typeof (f as Record<string, unknown>).confidence === 'number'
    )
    .map((f) => ({ feature: f.feature, confidence: Math.max(0, Math.min(1, f.confidence)) }))

  return {
    roomTypeConfirmed: !!r.roomTypeConfirmed,
    detectedRoomType: typeof r.detectedRoomType === 'string' ? r.detectedRoomType : 'unknown',
    finishState,
    visibleFeatures,
    moistureSignals,
    overallConfidence: typeof r.overallConfidence === 'number' ? Math.max(0, Math.min(1, r.overallConfidence)) : 0,
    promptVersion: PROMPT_VERSION,
  }
}
