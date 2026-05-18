/**
 * v7.3.4-PR2 — Photo preview computation.
 *
 * Lookup-only path that surfaces what the visitor would see if they
 * paid. Distinct from the full synthesize-v3 pipeline in two ways:
 *
 *   1. NO per-feature LLM synthesis on cache miss. Preview only shows
 *      sample recommendations for signatures already in LearningStore
 *      (curated OR high-confidence ai_generated). Cache misses are
 *      counted but not surfaced as items. Cheap enough to call on
 *      every preview request (~50ms vs synthesize-v3's 3-5s).
 *
 *   2. NO SmartCart persistence. The preview output is ephemeral.
 *      The cart only persists at webhook time when the visitor
 *      actually pays (PR3 lands this).
 *
 * Confidence gate (strategy section 6, measure 1):
 *   - If extraction overall confidence < CONFIDENCE_GATE_MIN, OR
 *   - If ALL features have category_hint === 'unclear', OR
 *   - If feature count == 0
 *   the gate rejects the paywall and the panel shows
 *   "we had trouble reading your photos clearly".
 */

import { prisma } from '@/lib/db'
import { isOpenExtractionShape, type OpenExtraction, type OpenFeature } from '@/lib/vision/prompt'
import { computeSignature } from '@/lib/learning/signature'
import { lookupManyBySignature, isHighConfidence, type RecommendationPayload } from '@/lib/learning/store'
import { inferScopeFromCategory, dominantCategory, type InferredScope } from './category-to-topic'

// Strategy section 6: "If confidence is below a threshold (start at
// 0.6, calibrate post-launch)". Calibrate via the v7.3.4 retro.
const CONFIDENCE_GATE_MIN = 0.6

const RECENT_PHOTO_WINDOW_MS = 24 * 60 * 60 * 1000 // 24h

// =============================================================================
// PUBLIC TYPES
// =============================================================================

export interface PreviewCategorySummary {
  category: string
  featureCount: number
  /** A single high-confidence sample recommendation for this category.
   *  Null when no LearningStore entry exists for any signature in
   *  this category (visitor still sees the category in the summary
   *  but no preview rec to whet appetite). */
  sampleRecommendation: {
    headline: string
    lane: RecommendationPayload['lane']
    reasoning: string
    source: 'curated' | 'ai_generated'
  } | null
}

export interface PreviewResult {
  /** Whether the panel should show the "Continue to cart" CTA. */
  paywallAllowed: boolean
  /** Human-readable explanation when paywallAllowed=false. */
  lowConfidenceReason?: string

  /** Summary fields the panel renders. */
  photoCount: number
  featureCount: number
  overallConfidence: number
  /** Sorted by featureCount desc. */
  categories: PreviewCategorySummary[]
  /** Dominant category across all extracted features. */
  dominantCategory: string | null
  /** Best-effort topic/scope inferred from the dominant category.
   *  Null when dominantCategory is null or maps to 'mixed'/'unclear'. */
  inferredScope: InferredScope | null
  /** PR3.8: most-recent Project id owned by the visitor. Lets the
   *  PhotoUploader's polling-driven synthesis call /api/cart/synthesize
   *  with a real projectId even when the desktop session has no local
   *  uploads (photos all came from phone via QR handoff). Null when
   *  the visitor has no projects yet. */
  recentProjectId: string | null
}

export interface ComputePreviewOptions {
  anonId: string
  /** Override the default 24h window for diagnostics. */
  windowMs?: number
}

// =============================================================================
// MAIN
// =============================================================================

export async function computePreview(opts: ComputePreviewOptions): Promise<PreviewResult> {
  const since = new Date(Date.now() - (opts.windowMs ?? RECENT_PHOTO_WINDOW_MS))

  // Same query the synthesize route uses — by anonId, confirmed
  // blob, recent window. Latest extraction per photo.
  const photos = await prisma.photo.findMany({
    where: {
      visitorAnonId: opts.anonId,
      blobConfirmedAt: { not: null },
      uploadedAt: { gte: since },
    },
    include: {
      extractions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { uploadedAt: 'desc' },
  })

  // PR3.8 — recent project id for the polling-driven synthesis path
  // (PhotoUploader on desktop, after photos arrive from mobile via
  // QR handoff). The synthesize route requires a projectId for
  // ownership check even though it queries photos by anonId.
  const recentProject = await prisma.project.findFirst({
    where: { visitorAnonId: opts.anonId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  const recentProjectId = recentProject?.id ?? null

  const features: OpenFeature[] = []
  let photosWithExtractions = 0
  for (const photo of photos) {
    const ex = photo.extractions[0]
    if (!ex) continue
    const json = ex.extractionJson as unknown
    if (!isOpenExtractionShape(json)) continue
    photosWithExtractions += 1
    features.push(...(json as OpenExtraction).features)
  }

  // -- empty / sparse cases --
  if (features.length === 0) {
    return {
      paywallAllowed: false,
      lowConfidenceReason:
        photosWithExtractions === 0
          ? "We didn't find any photos to read. Upload at least one."
          : "We couldn't extract any features from your photos. Try clearer wide-angle shots.",
      photoCount: photos.length,
      featureCount: 0,
      overallConfidence: 0,
      categories: [],
      dominantCategory: null,
      inferredScope: null,
      recentProjectId,
    }
  }

  const overallConfidence =
    features.reduce((acc, f) => acc + f.confidence, 0) / features.length

  // -- Group features by category for the per-category summary --
  const byCategory = new Map<string, OpenFeature[]>()
  for (const f of features) {
    const list = byCategory.get(f.category_hint) ?? []
    list.push(f)
    byCategory.set(f.category_hint, list)
  }

  // -- Confidence gate (strategy section 6, measure 1) --
  if (overallConfidence < CONFIDENCE_GATE_MIN) {
    return {
      paywallAllowed: false,
      lowConfidenceReason:
        'Your photos were a bit hard to read. Try a different photo with more of the area in frame, or use the topic picker instead.',
      photoCount: photos.length,
      featureCount: features.length,
      overallConfidence,
      categories: Array.from(byCategory.entries())
        .map(([category, list]) => ({
          category,
          featureCount: list.length,
          sampleRecommendation: null,
        }))
        .sort((a, b) => b.featureCount - a.featureCount),
      dominantCategory: null,
      inferredScope: null,
      recentProjectId,
    }
  }
  const allUnclear = Array.from(byCategory.keys()).every(
    (c) => c === 'unclear' || c === 'mixed'
  )
  if (allUnclear) {
    return {
      paywallAllowed: false,
      lowConfidenceReason:
        "We couldn't tell what part of your home is in these photos. Try a different angle, or use the topic picker.",
      photoCount: photos.length,
      featureCount: features.length,
      overallConfidence,
      categories: Array.from(byCategory.entries())
        .map(([category, list]) => ({
          category,
          featureCount: list.length,
          sampleRecommendation: null,
        }))
        .sort((a, b) => b.featureCount - a.featureCount),
      dominantCategory: null,
      inferredScope: null,
      recentProjectId,
    }
  }

  // -- LearningStore lookup for sample recommendations --
  const allSignatures = features.map((f) => computeSignature(f))
  const cache = await lookupManyBySignature(allSignatures)

  const categorySummaries: PreviewCategorySummary[] = []
  // Array.from() — ES2017 target rejects raw Map iteration.
  for (const [category, list] of Array.from(byCategory.entries())) {
    // Pick the highest-confidence signature in this category that
    // has a cached recommendation. Falls back to null if none cached.
    let sample: PreviewCategorySummary['sampleRecommendation'] = null
    const sortedByConfidence = list
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
    for (const feature of sortedByConfidence) {
      const sig = computeSignature(feature)
      const row = cache.get(sig)
      if (row && isHighConfidence(row)) {
        const payload = row.recommendationPayload as unknown as RecommendationPayload
        sample = {
          headline: payload.headline,
          lane: payload.lane,
          reasoning: payload.reasoning,
          source: row.source as 'curated' | 'ai_generated',
        }
        break
      }
    }
    categorySummaries.push({
      category,
      featureCount: list.length,
      sampleRecommendation: sample,
    })
  }
  categorySummaries.sort((a, b) => b.featureCount - a.featureCount)

  const dominant = dominantCategory(features.map((f) => f.category_hint))
  const inferred = dominant ? inferScopeFromCategory(dominant) : null

  return {
    paywallAllowed: true,
    photoCount: photos.length,
    featureCount: features.length,
    overallConfidence,
    categories: categorySummaries,
    dominantCategory: dominant,
    inferredScope: inferred,
    recentProjectId,
  }
}
