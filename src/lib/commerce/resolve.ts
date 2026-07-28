/**
 * v7.4.10 §2.1–2.2 — the resolution pipeline.
 *
 * Runs post-synthesis, post-score, for BUY + WAIT items only (CR4:
 * SKIP/INVESTIGATE never get links). No LLM anywhere in this path — the
 * match score is deterministic token/spec/category arithmetic.
 *
 * Failure posture: every degrade lands on a tagged SEARCH link, which
 * is always correct and always earns. We never guess an ASIN — a wrong
 * specific product under the Alder brand costs more than a search link
 * earns.
 *
 * OPERATIONAL NOTE (2026-07-28): AMAZON_PAAPI_ACCESS_KEY/SECRET_KEY are
 * absent from every environment, so searchItems() returns [] and every
 * item resolves in SEARCH mode. The ASIN path below is complete and
 * exercised by unit tests; it activates the moment the keys land, with
 * no code change.
 */

import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { searchItems, type SearchResult } from '@/lib/recommend/paapi'
import { buildAmazonUrl, buildAmazonAsinUrl } from '@/lib/buildAmazonUrl'
import { logEvent } from '@/lib/events/log'
import { categoryForProduct, illustrationUrl, type IllustrationCategory } from './categories'

/** §2.1.3 — below this we ship a search link instead of an ASIN. */
export const RESOLUTION_FLOOR = 0.75
/** §2.1.5 — inline budget; past this we degrade and retry in background. */
export const INLINE_BUDGET_MS = 3000
/** §2.2 — price freshness. */
export const PRICE_TTL_MS = 24 * 3600 * 1000

export type ResolutionMode = 'ASIN' | 'SEARCH'

export interface ResolveRequest {
  recKey: string
  verdict: string
  productCategory: string
  searchQuery: string
  requiredSpecs: Array<{ spec: string; why: string }>
  /** Low Specificity → straight to search mode (§2.1.1). */
  specificity: number
}

export interface Resolution {
  recKey: string
  /** Human-readable name + spec for the card (never a brand). */
  productName: string
  spec: string | null
  specHash: string
  resolutionMode: ResolutionMode
  asin: string | null
  url: string
  imageUrl: string | null
  illustration: string
  category: IllustrationCategory
  title: string | null
  price: number | null
  priceAsOf: Date | null
  matchScore: number
}

export function specHashFor(req: Pick<ResolveRequest, 'productCategory' | 'searchQuery' | 'requiredSpecs'>): string {
  const canonical = JSON.stringify({
    c: req.productCategory.trim().toLowerCase(),
    q: req.searchQuery.trim().toLowerCase(),
    s: req.requiredSpecs.map((s) => s.spec.trim().toLowerCase()).sort(),
  })
  return createHash('sha256').update(canonical, 'utf8').digest('hex')
}

// ---------------------------------------------------------------------------
// Deterministic match scoring (§2.1.2) — no LLM
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(['the', 'a', 'an', 'for', 'with', 'and', 'of', 'to', 'in', 'on', 'by'])

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

/** Size/spec tokens like "5.5 oz", "80 cfm", "3/4 in", "20 amp". */
const MEASURE = /(\d+(?:\.\d+)?(?:\/\d+)?)\s*(oz|ml|l|in|inch|inches|ft|foot|feet|cfm|amp|a|w|watt|watts|gal|gallon|mil|mm|cm|lb|lbs|r-?\d+)?/gi

function measures(s: string): string[] {
  const out: string[] = []
  let m: RegExpExecArray | null
  const re = new RegExp(MEASURE.source, 'gi')
  while ((m = re.exec(s)) !== null) {
    if (m[2]) out.push(`${m[1]}${m[2].toLowerCase()}`)
  }
  return out
}

/**
 * Score a PA-API candidate against the requested spec.
 *   0.55 product-type token overlap
 * + 0.30 size/spec match
 * + 0.15 category sanity (no obviously-wrong product type)
 */
export function matchScore(req: ResolveRequest, candidate: { title: string | null }): number {
  const title = candidate.title ?? ''
  if (!title) return 0

  const wanted = tokens(`${req.productCategory} ${req.searchQuery}`)
  const got = new Set(tokens(title))
  const overlap = wanted.length ? wanted.filter((t) => got.has(t)).length / wanted.length : 0

  const wantedMeasures = measures(req.requiredSpecs.map((s) => s.spec).join(' '))
  const gotMeasures = new Set(measures(title))
  const measureScore = wantedMeasures.length
    ? wantedMeasures.filter((m) => gotMeasures.has(m)).length / wantedMeasures.length
    : 0.5 // no measurable spec requested → neutral, neither reward nor punish

  // Category sanity: the illustration classifier must agree about what
  // kind of thing this is. Disagreement is a strong wrong-product signal.
  const wantCat = categoryForProduct(req.productCategory, req.searchQuery)
  const gotCat = categoryForProduct(title, title)
  const sane = wantCat === gotCat ? 1 : wantCat === 'general' || gotCat === 'general' ? 0.5 : 0

  return Math.min(1, overlap * 0.55 + measureScore * 0.3 + sane * 0.15)
}

// ---------------------------------------------------------------------------
// Resolve
// ---------------------------------------------------------------------------

function nameAndSpec(req: ResolveRequest): { productName: string; spec: string | null } {
  return {
    productName: req.productCategory || 'Recommended option',
    spec: req.requiredSpecs.length ? req.requiredSpecs.map((s) => s.spec).join(' · ') : null,
  }
}

function searchResolution(req: ResolveRequest, specHash: string, category: IllustrationCategory): Resolution {
  return {
    recKey: req.recKey,
    ...nameAndSpec(req),
    specHash,
    resolutionMode: 'SEARCH',
    asin: null,
    url: buildAmazonUrl(req.searchQuery || req.productCategory),
    imageUrl: null,
    illustration: illustrationUrl(category, false),
    category,
    title: null,
    price: null,
    priceAsOf: null,
    matchScore: 0,
  }
}

function fromRow(req: ResolveRequest, row: {
  specHash: string; asin: string | null; detailUrl: string | null; searchUrl: string | null
  imageUrl: string | null; title: string | null; price: number | null; priceAsOf: Date | null
  matchScore: number; resolutionMode: string; category: string | null
}): Resolution {
  const category = (row.category as IllustrationCategory) ?? categoryForProduct(req.productCategory, req.searchQuery)
  const isAsin = row.resolutionMode === 'ASIN' && row.asin != null
  return {
    recKey: req.recKey,
    ...nameAndSpec(req),
    specHash: row.specHash,
    resolutionMode: isAsin ? 'ASIN' : 'SEARCH',
    asin: isAsin ? row.asin : null,
    url: (isAsin ? row.detailUrl : row.searchUrl) ?? buildAmazonUrl(req.searchQuery || req.productCategory),
    imageUrl: isAsin ? row.imageUrl : null,
    illustration: illustrationUrl(category, false),
    category,
    title: isAsin ? row.title : null,
    price: isAsin ? row.price : null,
    priceAsOf: isAsin ? row.priceAsOf : null,
    matchScore: row.matchScore,
  }
}

/** One item. Never throws — every failure path degrades to SEARCH. */
export async function resolveOne(req: ResolveRequest): Promise<Resolution> {
  const specHash = specHashFor(req)
  const category = categoryForProduct(req.productCategory, req.searchQuery)

  // Cache: serve fresh rows; stale-priced ASIN rows fall through to re-resolve.
  try {
    const cached = await prisma.resolvedProduct.findUnique({ where: { specHash } })
    if (cached) {
      const stale =
        cached.resolutionMode === 'ASIN' &&
        (!cached.priceAsOf || Date.now() - cached.priceAsOf.getTime() > PRICE_TTL_MS)
      if (!stale) return fromRow(req, cached)
    }
  } catch {
    /* cache read failure must never block a customer result */
  }

  // §2.1.1 — vague items skip the lookup entirely.
  if (req.specificity < 0.4) {
    await persist(req, specHash, category, null, 0)
    return searchResolution(req, specHash, category)
  }

  let candidates: SearchResult[] = []
  try {
    candidates = await withTimeout(searchItems(req.searchQuery || req.productCategory, 6), INLINE_BUDGET_MS)
  } catch {
    candidates = []
  }

  let best: SearchResult | null = null
  let bestScore = 0
  for (const c of candidates) {
    const s = matchScore(req, c)
    if (s > bestScore) {
      bestScore = s
      best = c
    }
  }

  if (!best || bestScore < RESOLUTION_FLOOR) {
    await persist(req, specHash, category, null, bestScore)
    await logEvent({
      eventType: 'PRODUCT_RESOLUTION_FALLBACK',
      subjectType: 'ResolvedProduct',
      subjectId: specHash,
      source: 'system',
      payload: {
        recKey: req.recKey,
        reason: candidates.length === 0 ? 'no_candidates_or_api_unavailable' : 'below_floor',
        bestScore,
        floor: RESOLUTION_FLOOR,
      },
    })
    return searchResolution(req, specHash, category)
  }

  await persist(req, specHash, category, best, bestScore)
  await logEvent({
    eventType: 'PRODUCT_RESOLVED',
    subjectType: 'ResolvedProduct',
    subjectId: specHash,
    source: 'system',
    payload: { recKey: req.recKey, asin: best.asin, matchScore: bestScore },
  })

  return {
    recKey: req.recKey,
    // ASIN mode: the real product title names the card.
    productName: best.title ?? nameAndSpec(req).productName,
    spec: nameAndSpec(req).spec,
    specHash,
    resolutionMode: 'ASIN',
    asin: best.asin,
    url: buildAmazonAsinUrl(best.asin),
    imageUrl: best.imageUrl ?? null,
    illustration: illustrationUrl(category, false),
    category,
    title: best.title,
    price: best.priceLow,
    priceAsOf: new Date(),
    matchScore: bestScore,
  }
}

async function persist(
  req: ResolveRequest,
  specHash: string,
  category: IllustrationCategory,
  best: SearchResult | null,
  score: number
): Promise<void> {
  const searchUrl = buildAmazonUrl(req.searchQuery || req.productCategory)
  const data = best
    ? {
        query: req.searchQuery,
        asin: best.asin,
        detailUrl: buildAmazonAsinUrl(best.asin),
        searchUrl,
        imageUrl: best.imageUrl ?? null,
        title: best.title,
        price: best.priceLow,
        priceAsOf: new Date(),
        matchScore: score,
        resolutionMode: 'ASIN',
        category,
      }
    : {
        query: req.searchQuery,
        asin: null,
        detailUrl: null,
        searchUrl,
        imageUrl: null,
        title: null,
        price: null,
        priceAsOf: null,
        matchScore: score,
        resolutionMode: 'SEARCH',
        category,
      }
  try {
    await prisma.resolvedProduct.upsert({ where: { specHash }, create: { specHash, ...data }, update: data })
  } catch {
    /* persistence failure must never block a customer result */
  }
}

/** BUY + WAIT only (CR4). Runs items concurrently within one budget. */
export async function resolveForReport(reqs: ResolveRequest[]): Promise<Map<string, Resolution>> {
  const eligible = reqs.filter((r) => r.verdict === 'BUY' || r.verdict === 'WAIT')
  const results = await Promise.all(eligible.map((r) => resolveOne(r).catch(() => null)))
  const map = new Map<string, Resolution>()
  for (const r of results) {
    if (r) map.set(r.recKey, r)
  }
  return map
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('resolution_timeout')), ms)),
  ])
}
