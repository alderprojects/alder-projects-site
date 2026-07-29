/**
 * v7.4.2 — Shape persisted Recommendation rows for the wire at a given
 * disclosure tier. Used by routes that read reports back from the DB
 * (unlock, cart page) as opposed to the pipeline path, which shapes
 * in-memory results. Same tier rules as disclosure.ts.
 */

import type { Prisma, Recommendation } from '@prisma/client'
import { buildAmazonUrl } from '@/lib/buildAmazonUrl'
import type { DisclosureTier } from './types'
import type { LockedStub, WireRecommendation } from './disclosure'
import { subjectFor } from '@/lib/result/subjects'
import { isSafetyItem } from '@/lib/result/focus'

const TIER_RANK: Record<DisclosureTier, number> = { free: 0, email: 1, paid: 2 }

type RecRow = Recommendation & { cartCandidates?: Array<Record<string, unknown>> }

export function shapeRows(
  rows: RecRow[],
  callerTier: DisclosureTier
): { visible: WireRecommendation[]; locked: LockedStub[] } {
  const rank = TIER_RANK[callerTier]
  const visible: WireRecommendation[] = []
  const locked: LockedStub[] = []

  // v7.4.4: admin-disabled recs render nowhere, at any tier.
  const sorted = [...rows].filter((r) => r.disabledAt == null).sort((a, b) => a.sortOrder - b.sortOrder)
  for (const row of sorted) {
    const rowTier = (row.disclosureTier as DisclosureTier) ?? 'free'
    if (TIER_RANK[rowTier] > rank) {
      locked.push({ locked: true, verdict: row.verdict, title: row.title, unlockTier: 'email' })
      continue
    }
    const rebate = row.rebateJson as { program?: string; amount?: string; stale?: boolean } | null
    const wire: WireRecommendation = {
      id: row.id,
      key: row.key ?? row.id,
      verdict: row.verdict,
      title: row.title,
      summary: row.summary,
      visibleEvidence: (row.visibleEvidenceJson as string[]) ?? [],
      costLow: row.costLow,
      costHigh: row.costHigh,
      benefitType: row.benefitType,
      confidenceLabel: row.confidenceLabel,
      riskLevel: row.riskLevel,
      nextAction: row.nextAction,
      rebate:
        rebate && rebate.program
          ? { program: rebate.program, display: rebate.stale ? 'check current program' : (rebate.amount ?? '') }
          : null,
      citations: (row.citationsJson as WireRecommendation['citations']) ?? [],
      categorySearchUrl: row.categorySearchQuery ? buildAmazonUrl(row.categorySearchQuery) : null,
      clarifyingQuestions: ((row.clarifyingQuestionsJson as Array<{ key: string; question: string }>) ?? []).map(
        (q) => ({ key: q.key, question: q.question })
      ),
      smartCartEligible: row.smartCartEligible,
      // v7.4.10 — product card payload. Present for BUY/WAIT only (the
      // resolver never runs for SKIP/INVESTIGATE), so CR4 holds by
      // construction all the way to the client.
      product: (row.resolutionJson as WireRecommendation['product']) ?? null,
    }

    // v7.4.16 — derive the grouping subject here, on the server. The
    // claimLinks stay server-side; only the label ships.
    const groupable = {
      key: row.key ?? row.id,
      verdict: row.verdict,
      title: row.title,
      claimLinks: (row.claimLinksJson as Array<{ signatures?: string[] }>) ?? [],
      compositeScore: row.compositeScore,
      sortOrder: row.sortOrder,
    }
    wire.subject = subjectFor(groupable).label
    wire.safety = isSafetyItem(groupable)
    wire.compositeScore = row.compositeScore
    if (rank >= TIER_RANK.email) {
      wire.assumptions = (row.assumptionsJson as string[]) ?? []
      wire.limitations = (row.limitationsJson as string[]) ?? []
    }
    if (rank >= TIER_RANK.paid && row.cartCandidates) {
      wire.cartArtifacts = row.cartCandidates as unknown[]
    }
    visible.push(wire)
  }
  return { visible, locked }
}

export type { Prisma }
