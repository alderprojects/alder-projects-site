/**
 * v7.4.2b — GET /api/report/latest?after=<ISO>
 *
 * Desktop half of the QR handoff: after issuing a QR, the desktop polls
 * here for a report created on the shared anon session (by the phone).
 * Returns the newest non-deleted report at the caller's disclosure
 * tier, or {found:false}. `after` bounds the search so an old report
 * from an earlier visit doesn't hijack the poll.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAnonId } from '@/lib/visitor/session'
import { shapeRows } from '@/lib/recommend/wire'
import type { DisclosureTier } from '@/lib/recommend/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

export async function GET(req: NextRequest): Promise<NextResponse> {
  const anonId = await getAnonId()
  if (!anonId) return NextResponse.json({ ok: true, found: false })

  const afterRaw = req.nextUrl.searchParams.get('after')
  const after = afterRaw ? new Date(afterRaw) : null

  const report = await prisma.report.findFirst({
    where: {
      visitorAnonId: anonId,
      deletedAt: null,
      ...(after && !isNaN(after.getTime()) ? { createdAt: { gt: after } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { recommendations: true },
  })
  if (!report) return NextResponse.json({ ok: true, found: false })

  const visitor = await prisma.visitorSession.findUnique({ where: { anonId } })
  const tier: DisclosureTier = visitor?.claimedByUserId ? 'email' : 'free'
  const { visible, locked } = shapeRows(report.recommendations, tier)
  const buyCount = report.recommendations.filter((r) => r.verdict === 'BUY').length

  return NextResponse.json({
    ok: true,
    found: true,
    reportId: report.id,
    status: report.status,
    tier,
    recommendations: visible,
    lockedRecommendations: locked,
    upsell: buyCount > 0 ? { eligible: true, buyCount } : { eligible: false, buyCount: 0 },
    exclusionNotice: null,
    recency: { flagged: false },
    tenureQuestion: report.tenure ? null : { key: 'tenure', question: 'Do you own or rent this home?' },
  })
}
