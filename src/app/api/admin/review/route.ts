/**
 * v7.4.5 — POST /api/admin/review  {reportId, reviewed: boolean}
 *
 * Sets/clears the session's reviewed stamp (reviewedAt + reviewedBy).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAdmin } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(req: NextRequest): Promise<NextResponse> {
  const check = await checkAdmin()
  if (check.status === 'unauthenticated') {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (check.status === 'forbidden') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  let body: { reportId?: unknown; reviewed?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  const reportId = typeof body.reportId === 'string' ? body.reportId : ''
  if (!reportId || typeof body.reviewed !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  try {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: body.reviewed
        ? { reviewedAt: new Date(), reviewedBy: check.user.email }
        : { reviewedAt: null, reviewedBy: null },
      select: { id: true, reviewedAt: true, reviewedBy: true },
    })
    return NextResponse.json({ ok: true, reviewedAt: report.reviewedAt, reviewedBy: report.reviewedBy })
  } catch {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }
}
