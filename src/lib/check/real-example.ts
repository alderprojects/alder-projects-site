/**
 * v7.4.14 §1.2 — the homepage "A real Check, verbatim" section.
 *
 * CR2: a section may claim realness ONLY when it rendered from production
 * records. This loader returns null on any failure — no rows, DB
 * unreachable, no BUY/WAIT pair — and the homepage then renders the
 * authored fallback under the header "Example Check" with no realness
 * claim anywhere. There is deliberately no code path that labels authored
 * copy as real.
 *
 * CACHING: the homepage must not query per visit (§1.2). Wrapped in
 * unstable_cache with a long TTL; a copy release does not need minute-level
 * freshness on an example.
 *
 * NOTE ON SESSION SELECTION: the spec named a specific July 28 "door read"
 * with a Cabot Australian Timber Oil BUY. That session does not exist in
 * production — see BUILD_REPORT-v7.4.14.md. Rather than hardcode a missing
 * id, this selects the most recent report that actually carries both a BUY
 * and a WAIT, which is what the section needs structurally. If the intended
 * session is later imported it will be selected automatically as the most
 * recent qualifying report.
 */

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export interface RealExampleCard {
  verdict: string
  title: string
  summary: string
  visibleEvidence: string[]
  costLow: number | null
  costHigh: number | null
  rebate: { program: string; display: string } | null
  citations: Array<{ guideSlug: string; guideTitle: string; verifiedAt: string }>
  nextAction: string
}

export interface RealExample {
  reportId: string
  /** e.g. "July 2026" — the honest date stamp for the footer line. */
  sessionLabel: string
  buy: RealExampleCard
  wait: RealExampleCard
}

interface RebateShape {
  program?: string
  amount?: string
  display?: string
}

function toCard(r: {
  verdict: string
  title: string
  summary: string
  visibleEvidenceJson: unknown
  costLow: number | null
  costHigh: number | null
  rebateJson: unknown
  citationsJson: unknown
  nextAction: string
}): RealExampleCard {
  const rebate = (r.rebateJson ?? null) as RebateShape | null
  return {
    verdict: r.verdict,
    title: r.title,
    summary: r.summary,
    visibleEvidence: Array.isArray(r.visibleEvidenceJson) ? (r.visibleEvidenceJson as string[]) : [],
    costLow: r.costLow,
    costHigh: r.costHigh,
    rebate:
      rebate && rebate.program
        ? { program: rebate.program, display: rebate.display ?? rebate.amount ?? '' }
        : null,
    citations: Array.isArray(r.citationsJson)
      ? (r.citationsJson as RealExample['buy']['citations'])
      : [],
    nextAction: r.nextAction,
  }
}

async function load(): Promise<RealExample | null> {
  try {
    // Most recent report carrying BOTH a live BUY and a live WAIT.
    const reports = await prisma.report.findMany({
      where: {
        deletedAt: null,
        recommendations: { some: { verdict: 'BUY', suppressed: false, disabledAt: null } },
      },
      select: {
        id: true,
        createdAt: true,
        recommendations: {
          where: { suppressed: false, disabledAt: null },
          select: {
            verdict: true,
            title: true,
            summary: true,
            visibleEvidenceJson: true,
            costLow: true,
            costHigh: true,
            rebateJson: true,
            citationsJson: true,
            nextAction: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    for (const report of reports) {
      const buy = report.recommendations.find((r) => r.verdict === 'BUY')
      const wait = report.recommendations.find((r) => r.verdict === 'WAIT')
      if (!buy || !wait) continue
      return {
        reportId: report.id,
        sessionLabel: report.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        buy: toCard(buy),
        wait: toCard(wait),
      }
    }
    return null
  } catch (e) {
    // CR2: any failure degrades to the relabeled fallback, never a false
    // "real" claim.
    console.error('[real-example] load failed, falling back to Example Check:', (e as Error).message)
    return null
  }
}

const loadCached = unstable_cache(load, ['home-real-example-v1'], {
  revalidate: 3600,
  tags: ['real-example'],
})

/**
 * Cached accessor for the homepage.
 *
 * `REAL_EXAMPLE_DISABLED=1` forces the fallback path — used by the §2 CR2
 * test to prove the fallback renders without a realness claim.
 *
 * The kill switch is deliberately OUTSIDE unstable_cache. Inside, it was
 * only consulted on a cache MISS, so flipping the env changed nothing until
 * the hour expired — the switch appeared not to work at all. Anything that
 * must take effect immediately has to sit in front of the cache, not
 * behind it.
 */
export async function getRealExample(): Promise<RealExample | null> {
  if (process.env.REAL_EXAMPLE_DISABLED === '1') return null
  return loadCached()
}
