/**
 * v7.4.2 — POST /api/report/feedback
 *
 * Lightweight "Was this useful?" on every report. Yes / Not really →
 * optional reason picklist. One row per (report, anon) — re-submitting
 * updates rather than duplicating.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

const REASONS = ['not_relevant', 'already_knew', 'too_cautious', 'wrong_read', 'not_really', 'other'] as const

const BodySchema = z.object({
  reportId: z.string().min(1),
  useful: z.boolean(),
  reason: z.enum(REASONS).optional(),
  key: z.string().max(64).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  let anonId: string | null = null
  try {
    anonId = await ensureVisitorSession({ firstSource: 'report_feedback' })
  } catch {
    if (!body.key) return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({ where: { id: body.reportId }, select: { id: true, visitorAnonId: true, accessKey: true } })
  if (!report) return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  const byCookie = anonId != null && report.visitorAnonId === anonId
  const byKey = body.key != null && report.accessKey != null && body.key === report.accessKey
  if (!byCookie && !byKey) {
    return NextResponse.json({ ok: false, error: 'not_your_report' }, { status: 403 })
  }
  const feedbackAnon = report.visitorAnonId ?? anonId

  const existing = await prisma.reportFeedback.findFirst({ where: { reportId: report.id, anonId: feedbackAnon } })
  if (existing) {
    await prisma.reportFeedback.update({
      where: { id: existing.id },
      data: { useful: body.useful, reason: body.reason ?? null },
    })
  } else {
    await prisma.reportFeedback.create({
      data: { reportId: report.id, anonId: feedbackAnon, useful: body.useful, reason: body.reason ?? null },
    })
  }

  return NextResponse.json({ ok: true })
}
