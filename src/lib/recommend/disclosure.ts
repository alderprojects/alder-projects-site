/**
 * v7.4.0 — Disclosure-tier response shaping.
 *
 * The full analysis (Check + Cart layers) is persisted; the response only
 * carries elements at or below the caller's current tier. The paid layer
 * exists in the DB from minute one but never crosses the wire ungated.
 *
 *   free  — recs 1-2: verdict, evidence, category, cost range, rebate,
 *           category-search affiliate link; recs 3+ appear as locked stubs.
 *   email — all recs + assumption detail.
 *   paid  — everything incl. cart artifacts (SKUs live here ONLY).
 */

import type { DisclosureTier, EnrichedRecommendation } from './types'
import { categorySearchUrl } from './verdicts'

const TIER_RANK: Record<DisclosureTier, number> = { free: 0, email: 1, paid: 2 }

/** v7.4.10 — product card payload; BUY/WAIT only (CR4). */
export interface WireProduct {
  productName?: string
  spec?: string | null
  resolutionMode: 'ASIN' | 'SEARCH'
  asin: string | null
  url: string
  imageUrl: string | null
  illustration: string
  category: string
  title: string | null
  price: number | null
  priceAsOf: string | null
  matchScore: number
}

export interface WireRecommendation {
  product?: WireProduct | null
  id?: string
  key: string
  verdict: string
  title: string
  summary: string
  visibleEvidence: string[]
  costLow: number | null
  costHigh: number | null
  benefitType: string
  confidenceLabel: string
  riskLevel: string
  nextAction: string
  // Rebate renders "check current program" when stale (rule 8)
  rebate: { program: string; display: string } | null
  citations: Array<{ guideSlug: string; guideTitle: string; verifiedAt: string }>
  categorySearchUrl: string | null
  clarifyingQuestions: Array<{ key: string; question: string }>
  smartCartEligible: boolean
  // v7.4.16 — presentation grouping. Computed SERVER-SIDE from claimLinks
  // so the raw `feature_type:room:severity` signatures never cross the
  // wire; the client receives only the derived label.
  subject?: string
  /** Safety-class item — drives the deterministic focus pick (§1.1.3). */
  safety?: boolean
  /** Frozen RecScore composite, for group ordering. Never recomputed. */
  compositeScore?: number | null
  // email tier and up
  assumptions?: string[]
  limitations?: string[]
  // paid tier only
  cartArtifacts?: unknown[]
}

export interface LockedStub {
  locked: true
  verdict: string
  title: string
  unlockTier: 'email'
}

export function shapeResponse(
  recs: EnrichedRecommendation[],
  callerTier: DisclosureTier
): { visible: WireRecommendation[]; locked: LockedStub[] } {
  const rank = TIER_RANK[callerTier]
  const visible: WireRecommendation[] = []
  const locked: LockedStub[] = []

  for (const rec of recs) {
    if (TIER_RANK[rec.disclosureTier] > rank) {
      // Locked stub: verdict + title only — enough to show value exists,
      // not enough to skip the unlock.
      locked.push({ locked: true, verdict: rec.verdict, title: rec.title, unlockTier: 'email' })
      continue
    }
    const wire: WireRecommendation = {
      key: rec.key,
      verdict: rec.verdict,
      title: rec.title,
      summary: rec.summary,
      visibleEvidence: rec.visibleEvidence,
      costLow: rec.costLow,
      costHigh: rec.costHigh,
      benefitType: rec.benefitType,
      confidenceLabel: rec.confidenceLabel,
      riskLevel: rec.riskLevel,
      nextAction: rec.nextAction,
      rebate: rec.rebate
        ? {
            program: rec.rebate.program,
            display: rec.rebate.stale ? 'check current program' : rec.rebate.amount,
          }
        : null,
      citations: rec.citations,
      categorySearchUrl: categorySearchUrl(rec),
      clarifyingQuestions: rec.clarifyingQuestions.map((q) => ({ key: q.key, question: q.question })),
      smartCartEligible: rec.smartCartEligible,
    }
    if (rank >= TIER_RANK.email) {
      wire.assumptions = rec.assumptions
      wire.limitations = rec.limitations
    }
    if (rank >= TIER_RANK.paid) {
      wire.cartArtifacts = rec.cartArtifacts
    }
    visible.push(wire)
  }

  return { visible, locked }
}
