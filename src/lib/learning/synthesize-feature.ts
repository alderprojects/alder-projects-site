/**
 * v7.3.3-C-PR2 — Per-feature LLM synthesis.
 *
 * Called by synthesize-v3 on cache-miss: given an extracted feature
 * (signature + the raw OpenFeature for context) and the available
 * universe of curated products, ask Claude (Haiku) to produce a
 * RecommendationPayload that fits the LearningStore shape.
 *
 * The synthesis is the cheapest possible LLM call:
 *   - Haiku 4.5 (~1-2s, ~0.5c per call)
 *   - max_tokens capped tight so the response fits within the
 *     budget of N parallel calls in the synthesize route
 *   - Universe is pre-filtered by category match before the LLM
 *     even sees it, so the prompt is small
 *
 * The LLM is allowed to recommend:
 *   - A product from the universe (lane=BUY, populates `product`)
 *   - A SKIP (don't buy a duplicate of present equipment)
 *   - A WAIT (monitor for a season)
 *   - A PRO_LINE (needs sizing/inspection beyond a generic
 *     recommendation)
 *
 * It is NOT allowed to invent a product not in the universe.
 *
 * Failure mode: if the LLM returns malformed output or throws, the
 * caller falls back to a generic "we noticed this but don't have a
 * recommendation yet" stub rather than crashing the whole synthesis.
 */

import Anthropic from '@anthropic-ai/sdk'
import { MODEL_VERSION } from '@/lib/vision/extract'
import type { OpenFeature } from '@/lib/vision/prompt'
import type { UniverseProduct } from '@/lib/smart-cart-universe'
import type {
  CartLane,
  CartTier,
  RecommendationPayload,
} from './store'

// =============================================================================
// VERSION
// =============================================================================

/**
 * Bump on any change to PROMPT_TEMPLATE or the output schema. Stored
 * on every LearningStore row generated via this path so the retro
 * can compare quality across versions.
 */
export const FEATURE_SYNTH_PROMPT_VERSION = 'feat-synth-v1.0.0'

// Bounded so a request synthesizing many cache-miss features can't
// blow past Vercel's 10s function timeout. Haiku at this cap is
// ~1-2s per call.
const SYNTH_MAX_TOKENS = 700

// How many universe candidates the LLM is shown per call. More
// candidates = better picks but slower + larger context. 12 covers
// the current 16-item universe with category filtering applied.
const UNIVERSE_CANDIDATES_PER_CALL = 12

// =============================================================================
// PROMPT
// =============================================================================

const SYSTEM_PROMPT = `You are a recommendation generator for Alder, a home maintenance shopping platform.

You receive ONE observed feature from a homeowner's photo (e.g. "moisture_efflorescence on a basement wall") and a short list of available curated products. Your job is to produce a single JSON recommendation that the cart will render.

Rules:
1. Output a single JSON object matching the schema. No prose, no markdown fences.
2. Pick the BEST lane for this feature:
   - "BUY": the universe has a product that genuinely addresses this feature. You MUST pick a product from the supplied list — never invent product names. Populate the product object with the supplied universeId / productName / affiliateUrl / priceBand / tier.
   - "SKIP": the homeowner already has equipment doing this job (e.g. dehumidifier_present means: don't buy another). No product. Headline tells the homeowner what to skip and why.
   - "WAIT": observation is real but doesn't require immediate action — monitor through a season. No product.
   - "PRO_LINE": the situation needs professional sizing/inspection (e.g. active water, structural cracks, electrical hazards). No product. Headline tells the homeowner what kind of pro.
3. NEVER invent product names. If nothing in the universe genuinely fits, use SKIP, WAIT, or PRO_LINE instead of forcing a BUY.
4. headline: short, action-oriented, ≤60 chars. Examples: "Skip a second dehumidifier", "Call a foundation contractor", "Add a moisture meter".
5. reasoning: 1-2 sentences explaining why, factual and grounded in the feature condition. No value judgments ("ugly", "dated").
6. caution: optional, only when BUY needs additional warning (e.g. "Confirm the existing unit's capacity first").
7. category: copy from the supplied feature.category_hint exactly.

You are generating cache entries that will be reused for many future homeowners seeing similar features. Optimize for "what would a thoughtful home inspector say." Keep it specific and useful, not generic.`

interface PromptInput {
  feature: OpenFeature
  candidates: UniverseProduct[]
}

function buildUserPrompt(input: PromptInput): string {
  const candidatesJson = input.candidates.map((c) => ({
    universeId: c.universeId,
    productName: c.variant.productName,
    tier: c.tags.tier,
    priceBand: `$${c.variant.priceLow}-$${c.variant.priceHigh}`,
    affiliateUrl: c.variant.affiliateUrl,
    topics: c.tags.topics,
    functions: c.tags.functions,
  }))

  return `Observed feature:
  type: ${input.feature.type}
  category_hint: ${input.feature.category_hint}
  location: ${input.feature.location}
  condition: ${input.feature.condition}
  confidence: ${input.feature.confidence}

Available products (you may pick AT MOST one; you may pick zero and choose a non-BUY lane):
${JSON.stringify(candidatesJson, null, 2)}

Return JSON matching this schema:
{
  "lane": "BUY | SKIP | WAIT | PRO_LINE",
  "headline": "short action-oriented title, ≤60 chars",
  "reasoning": "1-2 sentence factual explanation",
  "category": "${input.feature.category_hint}",
  "product": { "universeId": "...", "productName": "...", "affiliateUrl": "...", "priceBand": "...", "tier": "sweet_spot | premium | budget" } // omit unless lane=BUY
  "caution": "optional short warning, omit if not needed"
}

Return JSON only.`
}

// =============================================================================
// SYNTHESIS
// =============================================================================

/**
 * Pre-filter the universe to candidates that plausibly match the
 * feature's category. Keeps the prompt small and constrains the LLM
 * to picks that are roughly on-topic.
 *
 * Matching is bidirectional substring (same approach loadUniverse used
 * for its old scope param) plus a fallback to ALL products if nothing
 * matches the category — that way the LLM can still find a relevant
 * pick for an unusual feature.
 */
export function filterUniverseForFeature(
  feature: OpenFeature,
  universe: UniverseProduct[]
): UniverseProduct[] {
  const cat = feature.category_hint
  const matches = universe.filter((u) =>
    u.tags.topics.some((t) => t.includes(cat) || cat.includes(t))
  )
  const pool = matches.length > 0 ? matches : universe
  // Sort by rank then take top N — universe entries have a rank field
  // for stable ordering.
  return pool
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .slice(0, UNIVERSE_CANDIDATES_PER_CALL)
}

export interface SynthesizeFeatureResult {
  payload: RecommendationPayload
  modelVersion: string
  promptVersion: string
  latencyMs: number
  tokensIn: number
  tokensOut: number
  apiCostCents: number
}

/**
 * Run a single per-feature LLM synthesis. Throws on transport / parse
 * errors; the caller in synthesize-v3 catches and falls back to a
 * generic stub.
 */
export async function synthesizeFeatureRecommendation(opts: {
  feature: OpenFeature
  universe: UniverseProduct[]
}): Promise<SynthesizeFeatureResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set')
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const t0 = Date.now()

  const candidates = filterUniverseForFeature(opts.feature, opts.universe)
  const user = buildUserPrompt({ feature: opts.feature, candidates })

  const resp = await client.messages.create({
    model: MODEL_VERSION,
    max_tokens: SYNTH_MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: user }],
  })

  const text = resp.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text)
    .join('')

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/gm, '')
    .replace(/```\s*$/gm, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    throw new Error(
      `feature-synth response was not parseable JSON: ${(e as Error).message}. First 200 chars: ${cleaned.slice(0, 200)}`
    )
  }

  const payload = validateAndNormalize(parsed, opts.feature.category_hint)

  const tokensIn = resp.usage.input_tokens
  const tokensOut = resp.usage.output_tokens
  // Haiku 4.5 pricing — same as extract.ts apiCostCents.
  const apiCostCents = Math.ceil((tokensIn * 0.0001 + tokensOut * 0.0005) * 100) / 100

  return {
    payload,
    modelVersion: MODEL_VERSION,
    promptVersion: FEATURE_SYNTH_PROMPT_VERSION,
    latencyMs: Date.now() - t0,
    tokensIn,
    tokensOut,
    apiCostCents,
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

const VALID_LANES: ReadonlySet<CartLane> = new Set<CartLane>([
  'BUY',
  'SKIP',
  'WAIT',
  'PRO_LINE',
])
const VALID_TIERS: ReadonlySet<CartTier> = new Set<CartTier>([
  'budget',
  'sweet_spot',
  'premium',
])

function validateAndNormalize(raw: unknown, categoryFallback: string): RecommendationPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('feature-synth response is not an object')
  }
  const r = raw as Record<string, unknown>

  const lane = r.lane as CartLane
  if (!VALID_LANES.has(lane)) {
    throw new Error(`feature-synth returned invalid lane: ${r.lane}`)
  }
  const headline = typeof r.headline === 'string' ? r.headline.trim() : ''
  const reasoning = typeof r.reasoning === 'string' ? r.reasoning.trim() : ''
  if (!headline || !reasoning) {
    throw new Error('feature-synth missing headline or reasoning')
  }
  const category =
    typeof r.category === 'string' && r.category.length > 0
      ? r.category
      : categoryFallback

  const caution = typeof r.caution === 'string' && r.caution.trim().length > 0
    ? r.caution.trim()
    : undefined

  let product: RecommendationPayload['product']
  if (lane === 'BUY' && typeof r.product === 'object' && r.product !== null) {
    const p = r.product as Record<string, unknown>
    const tier = p.tier as CartTier
    if (!VALID_TIERS.has(tier)) {
      throw new Error(`feature-synth BUY recommended invalid tier: ${p.tier}`)
    }
    if (
      typeof p.universeId !== 'string' ||
      typeof p.productName !== 'string' ||
      typeof p.affiliateUrl !== 'string' ||
      typeof p.priceBand !== 'string'
    ) {
      throw new Error('feature-synth BUY recommendation missing product fields')
    }
    product = {
      universeId: p.universeId,
      productName: p.productName,
      affiliateUrl: p.affiliateUrl,
      priceBand: p.priceBand,
      tier,
    }
  }

  return {
    lane,
    headline,
    reasoning,
    category,
    product,
    caution,
  }
}
