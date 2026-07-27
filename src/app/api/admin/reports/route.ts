/**
 * v7.4.4 — Admin-lite reports API.
 *
 * GET  /api/admin/reports?adminToken=...&days=7
 *   Recent reports with verdict mix, confidence, flags, feedback, and
 *   per-report pipeline-log access, plus CategoryObservation counts
 *   (the flywheel surface) and 24h drift stats.
 *
 * POST /api/admin/reports  {recommendationId, disabled: boolean}
 *   The disable toggle — sets/clears Recommendation.disabledAt. A
 *   disabled rec renders nowhere (wire, unlock, cart page, delivery).
 *
 * Auth (v7.4.5): admin session (magic link + ADMIN_EMAILS) — the
 * adminToken query-param convention is retired for this endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAdmin } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 15

async function authorized(): Promise<boolean> {
  return (await checkAdmin()).status === 'ok'
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!(await authorized())) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const days = Math.min(90, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '7', 10) || 7))
  const since = new Date(Date.now() - days * 24 * 3600 * 1000)

  const reports = await prisma.report.findMany({
    where: { createdAt: { gte: since }, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      recommendations: {
        select: { id: true, key: true, verdict: true, title: true, confidenceScore: true, confidenceLabel: true, disabledAt: true, smartCartEligible: true },
        orderBy: { sortOrder: 'asc' },
      },
      feedback: { select: { useful: true, reason: true } },
    },
  })

  const shaped = reports.map((r) => {
    const log = (r.pipelineLogJson ?? {}) as { validationAdjustments?: string[]; candidatePrompt?: { tokensOut?: number; latencyMs?: number }; totalMs?: number }
    return {
      id: r.id,
      createdAt: r.createdAt,
      status: r.status,
      tenure: r.tenure,
      recencyFlagged: r.recencyFlagged,
      excludedPhotoCount: r.excludedPhotoCount,
      emailCaptured: r.emailCapturedAt != null,
      verdicts: r.recommendations.map((x) => x.verdict),
      meanConfidence:
        r.recommendations.length > 0
          ? r.recommendations.reduce((s, x) => s + x.confidenceScore, 0) / r.recommendations.length
          : null,
      validationAdjustments: log.validationAdjustments?.length ?? 0,
      pipelineMs: log.totalMs ?? null,
      feedback: r.feedback,
      recommendations: r.recommendations,
    }
  })

  // Flywheel: CategoryObservation counts per category/verdict (all-time
  // + window)
  const observations = await prisma.categoryObservation.groupBy({
    by: ['category', 'verdict'],
    _count: { _all: true },
    orderBy: { _count: { category: 'desc' } },
    take: 50,
  })

  // Drift stats over the window: mean confidence per verdict
  const drift: Record<string, { count: number; meanConfidence: number }> = {}
  for (const r of shaped) {
    for (const rec of r.recommendations) {
      drift[rec.verdict] ??= { count: 0, meanConfidence: 0 }
      drift[rec.verdict].meanConfidence =
        (drift[rec.verdict].meanConfidence * drift[rec.verdict].count + rec.confidenceScore) /
        (drift[rec.verdict].count + 1)
      drift[rec.verdict].count++
    }
  }

  return NextResponse.json({ ok: true, days, reportCount: shaped.length, drift, observations, reports: shaped })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await authorized())) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  let body: { recommendationId?: string; disabled?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  if (!body.recommendationId || typeof body.disabled !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  const rec = await prisma.recommendation.update({
    where: { id: body.recommendationId },
    data: { disabledAt: body.disabled ? new Date() : null },
  })
  return NextResponse.json({ ok: true, recommendationId: rec.id, disabledAt: rec.disabledAt })
}
