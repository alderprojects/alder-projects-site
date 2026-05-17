/**
 * v7.3.3-B Anonymous Visitor Data Cleanup Cron.
 *
 * Daily at 05:00 ET (10:00 UTC). Sweeps unclaimed VisitorSession rows
 * older than the data-lifetime threshold and deletes the entire row
 * chain: Consent, Photo (+ blob), VisionExtraction, RoomSnapshot,
 * SmartCart, Project, VisitorSession.
 *
 * Data lifetime is consent-tiered:
 *   - Default: 30 days from VisitorSession.lastSeenAt
 *   - With valuation_research consent: 90 days (user opted into research use)
 *
 * Per-cron-run batch limit: 100 sessions. Larger queues get processed
 * across multiple days. Acceptable for the v7.3.3 beta scale.
 *
 * Disable via env: DISABLE_ANON_CLEANUP_CRON=true.
 */

import type { NextRequest } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH_LIMIT = 100
const DEFAULT_LIFETIME_DAYS = 30
const RESEARCH_LIFETIME_DAYS = 90

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (process.env.DISABLE_ANON_CLEANUP_CRON === 'true') {
    return Response.json({ skipped: true, reason: 'DISABLE_ANON_CLEANUP_CRON=true' })
  }

  const now = Date.now()
  const defaultCutoff = new Date(now - DEFAULT_LIFETIME_DAYS * 24 * 60 * 60 * 1000)
  const researchCutoff = new Date(now - RESEARCH_LIFETIME_DAYS * 24 * 60 * 60 * 1000)

  // Unclaimed sessions older than the DEFAULT cutoff are candidates.
  // We re-evaluate per-photo against the RESEARCH cutoff inside the
  // loop because a single session may have mixed-consent photos.
  const candidateSessions = await prisma.visitorSession.findMany({
    where: {
      claimedByUserId: null,
      lastSeenAt: { lt: defaultCutoff },
    },
    take: BATCH_LIMIT,
    orderBy: { lastSeenAt: 'asc' },
  })

  let photosDeleted = 0
  let blobsDeleted = 0
  let blobErrors = 0
  let sessionsFullyDeleted = 0
  let sessionsPartialKept = 0

  for (const session of candidateSessions) {
    const photos = await prisma.photo.findMany({
      where: { visitorAnonId: session.anonId },
    })

    let allPhotosDeleted = true
    for (const photo of photos) {
      const flags = (photo.consentFlagsJson as { valuation_research?: boolean }) ?? {}
      const cutoff = flags.valuation_research ? researchCutoff : defaultCutoff
      if (photo.uploadedAt > cutoff) {
        // Photo is research-consented and not yet 90 days old — keep.
        allPhotosDeleted = false
        continue
      }

      if (photo.blobUrl) {
        try {
          await del(photo.blobUrl)
          blobsDeleted++
        } catch (e) {
          console.error('[anon-cleanup] blob delete failed', photo.id, (e as Error).message)
          blobErrors++
          // Continue — DB row gets deleted regardless; blob becomes
          // orphan storage we can sweep manually later.
        }
      }

      await prisma.visionExtraction.deleteMany({ where: { photoId: photo.id } })
      await prisma.photo.delete({ where: { id: photo.id } })
      photosDeleted++
    }

    if (!allPhotosDeleted) {
      // Some research-consented photos still exist — keep the session
      // and the rest of the chain alive so they're queryable.
      sessionsPartialKept++
      continue
    }

    // Full cascade: SmartCart -> RoomSnapshot -> Project -> Consent -> VisitorSession
    await prisma.smartCart.deleteMany({ where: { visitorAnonId: session.anonId } })
    await prisma.roomSnapshot.deleteMany({ where: { visitorAnonId: session.anonId } })
    await prisma.project.deleteMany({ where: { visitorAnonId: session.anonId } })
    await prisma.consent.deleteMany({ where: { anonId: session.anonId } })
    await prisma.visitorSession.delete({ where: { id: session.id } })
    sessionsFullyDeleted++
  }

  await logEvent({
    eventType: 'ANON_CLEANUP_RUN_COMPLETED',
    subjectType: 'system',
    subjectId: 'anon-cleanup',
    source: 'cron',
    payload: {
      sessionsProcessed: candidateSessions.length,
      sessionsFullyDeleted,
      sessionsPartialKept,
      photosDeleted,
      blobsDeleted,
      blobErrors,
    },
  })

  return Response.json({
    ok: true,
    sessionsProcessed: candidateSessions.length,
    sessionsFullyDeleted,
    sessionsPartialKept,
    photosDeleted,
    blobsDeleted,
    blobErrors,
  })
}
