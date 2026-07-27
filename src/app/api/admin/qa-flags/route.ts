/**
 * v7.4.5 — POST /api/admin/qa-flags  {reportId, type, note?}
 *
 * Creates a QAFlag on a session. Multiple flags per session are allowed.
 * Writes AdminAccessLog FLAG_CREATED + EventLog QA_FLAG_CREATED.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAdmin, logAdminAccess } from '@/lib/auth/admin'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const FLAG_TYPES = new Set(['HALLUCINATION', 'EXTRACTION_MISS', 'LANE_ERROR', 'PEOPLE_VISIBLE', 'OTHER'])

export async function POST(req: NextRequest): Promise<NextResponse> {
  const check = await checkAdmin()
  if (check.status === 'unauthenticated') {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (check.status === 'forbidden') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  let body: { reportId?: unknown; type?: unknown; note?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  const reportId = typeof body.reportId === 'string' ? body.reportId : ''
  const type = typeof body.type === 'string' ? body.type : ''
  const note = typeof body.note === 'string' ? body.note.slice(0, 2000) : ''
  if (!reportId || !FLAG_TYPES.has(type)) {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({ where: { id: reportId }, select: { id: true } })
  if (!report) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  const flag = await prisma.qAFlag.create({
    data: { reportId, type, note, createdBy: check.user.email },
  })

  await Promise.all([
    logAdminAccess(check.user.email, 'FLAG_CREATED', reportId),
    logEvent({
      eventType: 'QA_FLAG_CREATED',
      subjectType: 'Report',
      subjectId: reportId,
      actorId: check.user.id,
      source: 'admin',
      payload: { flagId: flag.id, type },
    }),
  ])

  return NextResponse.json({ ok: true, flagId: flag.id })
}
