// V7.1 — GET /api/intent/teaser
//
// Returns the IntentTeaser shape for the visitor's selection. Used by
// CurationModal step 2 (sneak peek) and the rebuilt sales pages when
// they need a fresh number for an intent-config category whose default
// teaser drifted from what the engine would currently produce.
//
// Resolution order:
//   1. KV cache (teaser:{product}:{topic}:{scope}:{scenario}, 7-day TTL)
//   2. intent-config static teaser if the (topic, scope, scenario)
//      matches an authored category/decision
//   3. Live dry-run via buildSmartCart / buildWorthItPlan, then cache
//
// Same redaction rules as the sales page: counts and ranges only, no
// product names, no skip reasons, no move titles.

import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { buildSmartCart } from '@/lib/buildSmartCart'
import { buildWorthItPlan } from '@/lib/buildWorthItPlan'
import {
  SMART_CART_CATEGORIES,
  WORTH_IT_DECISIONS,
  type IntentTeaser,
} from '@/lib/intent-config'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId, Season } from '@/lib/recommender-config.types'
import { inferSeason } from '@/lib/season-helpers'

export const dynamic = 'force-dynamic'

const TEASER_TTL_SECONDS = 7 * 24 * 3600
const SKIP_CAP = 6                                 // matches Section 16

export async function GET(req: Request) {
  const url = new URL(req.url)
  const product = url.searchParams.get('product')
  const topic = url.searchParams.get('topic')
  const scope = url.searchParams.get('scope')
  const scenario = url.searchParams.get('scenario')

  if (product !== 'smart_cart' && product !== 'worth_it') {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }
  if (!topic || !scope || !scenario) {
    return NextResponse.json(
      { error: 'Missing topic, scope, or scenario' },
      { status: 400 },
    )
  }

  // Layer 1 — KV cache.
  const cacheKey = `teaser:${product}:${topic}:${scope}:${scenario}`
  try {
    const cached = (await kv.get<IntentTeaser>(cacheKey)) ?? null
    if (cached) return NextResponse.json({ teaser: cached, source: 'cache' })
  } catch {
    // KV unavailable in some local envs; fall through to compute.
  }

  // Layer 2 — Authored intent-config teaser if the tuple matches one.
  const fromConfig = findAuthoredTeaser(product, topic, scope, scenario)
  if (fromConfig) {
    try {
      await kv.set(cacheKey, fromConfig, { ex: TEASER_TTL_SECONDS })
    } catch {
      /* best-effort cache */
    }
    return NextResponse.json({ teaser: fromConfig, source: 'authored' })
  }

  // Layer 3 — Live dry-run.
  let teaser: IntentTeaser
  try {
    teaser = computeTeaser(
      product,
      topic as TopicId,
      scope,
      scenario as BriefScenarioId,
    )
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not synthesize teaser' },
      { status: 422 },
    )
  }
  try {
    await kv.set(cacheKey, teaser, { ex: TEASER_TTL_SECONDS })
  } catch {
    /* best-effort cache */
  }
  return NextResponse.json({ teaser, source: 'computed' })
}

function findAuthoredTeaser(
  product: 'smart_cart' | 'worth_it',
  topic: string,
  scope: string,
  scenario: string,
): IntentTeaser | null {
  if (product === 'smart_cart') {
    const m = SMART_CART_CATEGORIES.find(
      c =>
        c.topicId === topic &&
        c.defaultScopeVariantId === scope &&
        c.defaultScenarioId === scenario,
    )
    return m?.teaser ?? null
  }
  const m = WORTH_IT_DECISIONS.find(
    d =>
      d.primaryTopicId === topic &&
      d.defaultScopeVariantId === scope &&
      d.defaultScenarioId === scenario,
  )
  return m?.teaser ?? null
}

function computeTeaser(
  product: 'smart_cart' | 'worth_it',
  topic: TopicId,
  scope: string,
  scenario: BriefScenarioId,
): IntentTeaser {
  const season: Season = inferSeason(new Date())
  const cart = buildSmartCart({
    topic,
    scopeVariantId: scope,
    scenario,
    season,
    customerEmail: 'preview@alderprojects.com',
  })
  const buyCount = cart.leanCart.items.length
  const skipCount = Math.min(cart.skipForNow.length, SKIP_CAP)
  const spendLow = cart.leanCart.totalLow
  const spendHigh = cart.leanCart.totalHigh
  const savingsLow = cart.savings.potentialSavingsLow
  const savingsHigh = cart.savings.potentialSavingsHigh

  let payoffSentence =
    'Skips the bundles, kits, and brand-name upcharges that bloat the average DIY cart for this scope.'

  if (product === 'worth_it') {
    // For Worth-It we still show the cart-derived counts, but the
    // payoff sentence frames the ranked plan instead of the lean cart.
    const plan = buildWorthItPlan({
      topic,
      scopeVariantId: scope,
      scenario,
      season,
      customerEmail: 'preview@alderprojects.com',
    })
    payoffSentence = plan.bestPath.description
  }

  return {
    buyCount,
    skipCount,
    spendLow,
    spendHigh,
    savingsLow,
    savingsHigh,
    payoffSentence,
  }
}
