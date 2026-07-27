/**
 * v7.4.3 — GET /api/report/deletion-status?requestId=... | ?reportId=...
 *
 * Lets a visitor confirm their delete-my-report request completed and
 * what it removed. Ownership-gated by anon session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAnonId } from '@/lib/visitor/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

export async function GET(req: NextRequest): Promise<NextResponse> {
  const anonId = await getAnonId()
  if (!anonId) return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 401 })

  const requestId = req.nextUrl.searchParams.get('requestId')
  const reportId = req.nextUrl.searchParams.get('reportId')
  if (!requestId && !reportId) {
    return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 })
  }

  const request = await prisma.deletionRequest.findFirst({
    where: {
      anonId, // ownership: only your own deletion requests
      ...(requestId ? { id: requestId } : {}),
      ...(reportId ? { reportId } : {}),
    },
    orderBy: { requestedAt: 'desc' },
  })
  if (!request) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  const detail = (request.detailJson ?? {}) as { photosDeleted?: number; blobsDeleted?: number }
  return NextResponse.json({
    ok: true,
    status: request.status,
    requestedAt: request.requestedAt,
    completedAt: request.completedAt,
    photosDeleted: detail.photosDeleted ?? null,
    blobsDeleted: detail.blobsDeleted ?? null,
  })
}
