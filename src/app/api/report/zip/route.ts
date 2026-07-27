/**
 * v7.4.7 — POST /api/report/zip  {reportId, zip, key?}
 *
 * Post-result ZIP capture (the dismissible banner). Stores zip +
 * zipSource=POST_RESULT on the report; the stored ZIP regionalizes any
 * subsequent refinement re-reasoning. Never re-runs synthesis by
 * itself, never blocks anything. Ownership: anon cookie or accessKey
 * (same rule as feedback/unlock). An upload-form ZIP is never
 * overwritten.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { regionProfileForZip } from '@/lib/region/profile'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

const BodySchema = z.object({
  reportId: z.string().min(1),
  zip: z.string().regex(/^\d{5}$/),
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
    anonId = await ensureVisitorSession({ firstSource: 'report_zip' })
  } catch {
    if (!body.key) return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({
    where: { id: body.reportId },
    select: { id: true, visitorAnonId: true, accessKey: true, zip: true, deletedAt: true },
  })
  if (!report || report.deletedAt) {
    return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  }
  const byCookie = anonId != null && report.visitorAnonId === anonId
  const byKey = body.key != null && report.accessKey != null && body.key === report.accessKey
  if (!byCookie && !byKey) {
    return NextResponse.json({ ok: false, error: 'not_your_report' }, { status: 403 })
  }

  if (report.zip) {
    // First ZIP wins (upload-form or an earlier banner submit).
    return NextResponse.json({ ok: true, alreadySet: true })
  }

  await prisma.report.update({
    where: { id: report.id },
    data: { zip: body.zip, zipSource: 'POST_RESULT' },
  })

  await logEvent({
    eventType: 'ZIP_SUBMITTED',
    subjectType: 'Report',
    subjectId: report.id,
    anonId: anonId ?? undefined,
    source: 'web',
    payload: { source: 'POST_RESULT', zip3: body.zip.slice(0, 3), resolvable: regionProfileForZip(body.zip) != null },
  })

  return NextResponse.json({ ok: true })
}
