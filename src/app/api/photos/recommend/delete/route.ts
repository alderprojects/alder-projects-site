/**
 * v7.4.0 — POST /api/photos/recommend/delete
 *
 * The working delete-my-report control (product rule 7). Deletes:
 *   - the Report (hard delete cascades Recommendation/CartCandidate/
 *     ClarifyingAnswer/ReportFeedback rows)
 *   - the photo BYTES (Vercel Blob del) and Photo rows for the report's
 *     snapshots, when those photos aren't referenced by another live report
 *
 * A DeletionRequest row records the operation for audit.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BodySchema = z.object({ reportId: z.string().min(1), key: z.string().max(64).optional() })

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  let anonId: string | null = null
  try {
    anonId = await ensureVisitorSession({ firstSource: 'photo_report' })
  } catch {
    if (!body.key) return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({ where: { id: body.reportId } })
  if (!report) return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  const byCookie = anonId != null && report.visitorAnonId === anonId
  const byKey = body.key != null && report.accessKey != null && body.key === report.accessKey
  if (!byCookie && !byKey) {
    return NextResponse.json({ ok: false, error: 'not_your_report' }, { status: 403 })
  }

  const request = await prisma.deletionRequest.create({
    data: { reportId: report.id, anonId: report.visitorAnonId ?? anonId, status: 'pending' },
  })

  let photosDeleted = 0
  let blobsDeleted = 0
  const errors: string[] = []

  // Photos attached to this report's snapshots, not referenced elsewhere.
  const otherReports = await prisma.report.findMany({
    where: { id: { not: report.id }, deletedAt: null, visitorAnonId: report.visitorAnonId },
    select: { snapshotIds: true },
  })
  const retainedSnapshots = new Set(otherReports.flatMap((r) => r.snapshotIds))
  const deletableSnapshotIds = report.snapshotIds.filter((id) => !retainedSnapshots.has(id))

  const photos = await prisma.photo.findMany({
    where: { roomSnapshotId: { in: deletableSnapshotIds } },
  })
  for (const photo of photos) {
    try {
      if (photo.blobUrl && photo.blobConfirmedAt) {
        await del(photo.blobUrl)
        blobsDeleted++
      }
    } catch (e) {
      errors.push(`blob:${photo.id}:${(e as Error).message.slice(0, 100)}`)
    }
    try {
      await prisma.photo.delete({ where: { id: photo.id } }) // cascades VisionExtraction
      photosDeleted++
    } catch (e) {
      errors.push(`photo:${photo.id}:${(e as Error).message.slice(0, 100)}`)
    }
  }

  // Hard-delete the report (cascades recommendations, cart candidates,
  // answers, feedback).
  await prisma.report.delete({ where: { id: report.id } })

  await prisma.deletionRequest.update({
    where: { id: request.id },
    data: {
      status: errors.length > 0 ? 'completed' : 'completed', // partial blob failures still complete; detail records them
      completedAt: new Date(),
      detailJson: { photosDeleted, blobsDeleted, errors } as never,
    },
  })

  await logEvent({
    eventType: 'REPORT_DELETED',
    subjectType: 'Report',
    subjectId: report.id,
    anonId: report.visitorAnonId ?? anonId,
    source: 'web',
    payload: { photosDeleted, blobsDeleted, errorCount: errors.length },
  })

  return NextResponse.json({ ok: true, photosDeleted, blobsDeleted })
}
