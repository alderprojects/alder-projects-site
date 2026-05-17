/**
 * v7.3.3-C-PR2 — Feature signature normalization.
 *
 * Maps an OpenFeature (the per-photo observation shape from open
 * extraction) to a canonical signature string used as the lookup key
 * into LearningStore.
 *
 * Format: `<type>:<categoryHint>:<severityBucket>`
 *   e.g. `moisture_efflorescence:basement:moderate`
 *        `dehumidifier_present:basement:moderate`
 *        `water_staining_ceiling:laundry:severe`
 *
 * The signature is intentionally coarse — by collapsing free-text
 * `condition` into a 3-bucket severity, we get cache hits across
 * many photos that describe the same situation differently. PR3
 * reaction counts then refine which signature->recommendation mappings
 * are good vs need re-synthesis.
 *
 * Severity bucketing is heuristic v0 (keyword match against the
 * condition string). PR3+ may switch to a small LLM call or learned
 * classifier if the heuristic proves too noisy in production data.
 */

import type { OpenFeature } from '@/lib/vision/prompt'

// Three buckets — keeps the cache key space tractable.
// "moderate" is the default; "low" and "severe" require positive
// keyword evidence in the condition text.
export type SeverityBucket = 'low' | 'moderate' | 'severe'

/**
 * Words that signal MILD / EARLY observations. Match against lowercased
 * condition text. Order doesn't matter; first hit wins for low.
 */
const LOW_SEVERITY_KEYWORDS = [
  'minor',
  'slight',
  'small amount',
  'trace',
  'minimal',
  'isolated',
  'localized',
  'cosmetic',
  'superficial',
  'spot of',
  'few',
  'small section',
] as const

/**
 * Words that signal SEVERE / ACTIVE / WIDESPREAD observations.
 * Checked first because severe trumps low when both keywords appear.
 */
const SEVERE_SEVERITY_KEYWORDS = [
  'active',
  'extensive',
  'widespread',
  'significant',
  'severe',
  'substantial',
  'large area',
  'throughout',
  'ongoing',
  'standing',
  'flowing',
  'pooling',
  'heavy',
  'major',
  'visible damage',
  'structural',
  'compromised',
  'failing',
  'rotted through',
  'across the',
] as const

/**
 * Bucket the free-text `condition` into low|moderate|severe.
 *
 * Severe wins over low if both keywords appear (interpreting "small
 * amount of severe damage" as severe). Moderate is the default when
 * neither keyword set hits.
 */
export function bucketSeverity(condition: string): SeverityBucket {
  const text = condition.toLowerCase()
  for (const kw of SEVERE_SEVERITY_KEYWORDS) {
    if (text.includes(kw)) return 'severe'
  }
  for (const kw of LOW_SEVERITY_KEYWORDS) {
    if (text.includes(kw)) return 'low'
  }
  return 'moderate'
}

/**
 * Compute the canonical signature for a single feature.
 *
 * Both `type` and `category_hint` come out of the vision model already
 * in lowercase snake_case (the prompt + zod enforce this), so no
 * further normalization is needed on those parts.
 */
export function computeSignature(feature: OpenFeature): string {
  const severity = bucketSeverity(feature.condition)
  return `${feature.type}:${feature.category_hint}:${severity}`
}

/**
 * Deduplicate features by signature. When the same signature appears
 * across multiple photos in one synthesis run, keep the highest-
 * confidence instance (its condition text is what gets surfaced in
 * the cart, and we don't need to LLM-synthesize the same signature
 * more than once per request).
 *
 * Returned in the order of first appearance — caller can use this
 * for stable UI rendering.
 */
export interface DedupedFeature {
  signature: string
  feature: OpenFeature
  /** How many input features collapsed into this signature. */
  occurrenceCount: number
}

export function dedupeBySignature(features: OpenFeature[]): DedupedFeature[] {
  const map = new Map<string, DedupedFeature>()
  for (const f of features) {
    const sig = computeSignature(f)
    const existing = map.get(sig)
    if (!existing) {
      map.set(sig, { signature: sig, feature: f, occurrenceCount: 1 })
    } else {
      existing.occurrenceCount += 1
      if (f.confidence > existing.feature.confidence) {
        existing.feature = f
      }
    }
  }
  return Array.from(map.values())
}
