/**
 * v7.4.9 — SignaturePrior loading (serve path) and materialization
 * (nightly job).
 *
 * Serve path does a single indexed read of the priors + active rules the
 * session actually needs, then scoring is pure computation. Nightly
 * materialization rolls LearningStore reaction counts into smoothed
 * priors — pre-aggregating INPUTS, never pre-scoring outputs.
 */

import { prisma } from '@/lib/db'
import { computeSignature } from '@/lib/learning/signature'
import type { EnrichedRecommendation, MergedFeature } from '@/lib/recommend/types'
import { SCORING_CONFIG, type ScoringConfig } from './config'
import { signatureHash, type PriorLookup, type RuleLookup } from './score'

/**
 * Laplace-smoothed prior mapped into 0..1.
 *
 *   raw = (likes + a) / (likes + doesntApply + 2a) - (doesntApply + a) / (...)
 *
 * which simplifies to a smoothed (likeRate − doesntApplyRate) in −1..1;
 * we map to 0..1 so it composes with the other sub-scores. Dismisses are
 * deliberately NOT counted as negative signal — a dismiss often means
 * "not now", while doesn't-apply means "you were wrong about my home".
 */
export function computePrior(
  likeCount: number,
  doesntApplyCount: number,
  cfg: ScoringConfig = SCORING_CONFIG
): number {
  const a = cfg.priorSmoothing
  const denom = likeCount + doesntApplyCount + 2 * a
  const likeRate = (likeCount + a) / denom
  const doesntApplyRate = (doesntApplyCount + a) / denom
  const signed = likeRate - doesntApplyRate // −1..1
  return Math.min(1, Math.max(0, (signed + 1) / 2))
}

/** Collect the signature hashes a scored set will look up. */
export function neededHashes(recs: EnrichedRecommendation[]): string[] {
  return Array.from(
    new Set(recs.flatMap((r) => (r.claimLinks ?? []).flatMap((l) => l.signatures)).map(signatureHash))
  )
}

export interface ServeLookups {
  priors: PriorLookup
  rules: RuleLookup
}

/** One indexed read each; both maps are plain in-memory lookups after that. */
export async function loadServeLookups(recs: EnrichedRecommendation[]): Promise<ServeLookups> {
  const hashes = neededHashes(recs)
  if (hashes.length === 0) {
    return { priors: emptyLookup(), rules: emptyLookup() }
  }

  const [priorRows, ruleRows] = await Promise.all([
    prisma.signaturePrior.findMany({
      where: { signatureHash: { in: hashes } },
      select: { signatureHash: true, prior: true, n: true },
    }),
    prisma.curationRule.findMany({
      where: { signatureHash: { in: hashes }, revokedAt: null, action: 'DEMOTE' },
      select: { id: true, signatureHash: true },
    }),
  ])

  const priorMap = new Map(priorRows.map((r) => [r.signatureHash, { prior: r.prior, n: r.n }]))
  const ruleMap = new Map(ruleRows.map((r) => [r.signatureHash, r.id]))
  return {
    priors: { get: (h) => priorMap.get(h) },
    rules: { get: (h) => ruleMap.get(h) },
  }
}

function emptyLookup(): { get: () => undefined } {
  return { get: () => undefined }
}

/**
 * Nightly: rebuild SignaturePrior from LearningStore reaction counts.
 * Idempotent — safe to re-run, and a failure mid-way leaves prior rows
 * simply stale rather than wrong.
 */
export async function refreshSignaturePriors(cfg: ScoringConfig = SCORING_CONFIG): Promise<{ updated: number }> {
  const rows = await prisma.learningStore.findMany({
    select: {
      featureSignature: true,
      thumbsUpCount: true,
      dismissCount: true,
      doesntApplyCount: true,
      impressionCount: true,
    },
  })

  let updated = 0
  for (const r of rows) {
    const n = r.thumbsUpCount + r.doesntApplyCount
    const prior = computePrior(r.thumbsUpCount, r.doesntApplyCount, cfg)
    const hash = signatureHash(r.featureSignature)
    await prisma.signaturePrior.upsert({
      where: { signatureHash: hash },
      create: {
        signatureHash: hash,
        signature: r.featureSignature,
        likeCount: r.thumbsUpCount,
        dismissCount: r.dismissCount,
        doesntApplyCount: r.doesntApplyCount,
        impressionCount: r.impressionCount,
        n,
        prior,
      },
      update: {
        signature: r.featureSignature,
        likeCount: r.thumbsUpCount,
        dismissCount: r.dismissCount,
        doesntApplyCount: r.doesntApplyCount,
        impressionCount: r.impressionCount,
        n,
        prior,
      },
    })
    updated++
  }
  return { updated }
}

/** Signature strings for a merged feature set — used by the nightly job. */
export function signaturesFor(features: MergedFeature[]): string[] {
  return Array.from(new Set(features.map((f) => computeSignature(f as never))))
}
