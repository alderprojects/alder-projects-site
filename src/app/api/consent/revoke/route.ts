/**
 * v7.4.8 — POST /api/consent/revoke  (FLAG-GATED)
 *
 * Body: {consentRecordId?, reportId?, key?}
 *
 * Sets revokedAt on the live DATA_LICENSING consent(s) the caller owns.
 * NEVER deletes and never mutates anything else on the row — the
 * granting record stays intact as the audit chain. Re-consenting later
 * inserts a NEW row (see /api/report/address).
 *
 * Revocation is immediately structural: exportableConsentedRecords()
 * filters on revokedAt IS NULL, so a revoked record leaves any future
 * export path by construction.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAnonId } from '@/lib/visitor/session'
import { logEvent } from '@/lib/events/log'
import { addressCaptureEnabled } from '@/lib/consent/licensing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const BodySchema = z.object({
  consentRecordId: z.string().min(1).optional(),
  reportId: z.string().min(1).optional(),
  key: z.string().max(64).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!addressCaptureEnabled()) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  if (!body.consentRecordId && !body.reportId) {
    return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 })
  }

  const anonId = await getAnonId()

  const candidates = await prisma.consentRecord.findMany({
    where: {
      scope: 'DATA_LICENSING',
      revokedAt: null,
      ...(body.consentRecordId ? { id: body.consentRecordId } : {}),
      ...(body.reportId ? { reportId: body.reportId } : {}),
    },
    select: { id: true, visitorAnonId: true, reportId: true },
  })
  if (candidates.length === 0) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  // Ownership: anon cookie, or the report's capability key.
  const reportIds = Array.from(new Set(candidates.map((c) => c.reportId).filter((r): r is string => r != null)))
  const reports = reportIds.length
    ? await prisma.report.findMany({ where: { id: { in: reportIds } }, select: { id: true, accessKey: true } })
    : []
  const keyedReportIds = new Set(
    reports.filter((r) => body.key != null && r.accessKey != null && r.accessKey === body.key).map((r) => r.id)
  )
  const owned = candidates.filter(
    (c) => (anonId != null && c.visitorAnonId === anonId) || (c.reportId != null && keyedReportIds.has(c.reportId))
  )
  if (owned.length === 0) {
    return NextResponse.json({ ok: false, error: 'not_yours' }, { status: 403 })
  }

  const now = new Date()
  await prisma.consentRecord.updateMany({
    where: { id: { in: owned.map((c) => c.id) }, revokedAt: null },
    data: { revokedAt: now },
  })

  for (const c of owned) {
    await logEvent({
      eventType: 'CONSENT_REVOKED',
      subjectType: 'ConsentRecord',
      subjectId: c.id,
      anonId: anonId ?? undefined,
      source: 'web',
      payload: { scope: 'DATA_LICENSING', reportId: c.reportId },
    })
  }

  return NextResponse.json({ ok: true, revoked: owned.length })
}
