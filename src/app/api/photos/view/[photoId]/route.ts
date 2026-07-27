/**
 * v7.4.3 — GET /api/photos/view/[photoId]
 *
 * Session-gated photo access: verifies the caller's anon session (or
 * claimed user) owns the photo, then 302s to the capability URL. Client
 * surfaces must use THIS route — Photo.blobUrl never appears in any
 * API response payload.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAnonId } from '@/lib/visitor/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

export async function GET(
  req: NextRequest,
  context: { params: { photoId: string } }
): Promise<NextResponse> {
  const anonId = await getAnonId()
  if (!anonId) return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 401 })

  const photo = await prisma.photo.findUnique({
    where: { id: context.params.photoId },
    select: { blobUrl: true, blobConfirmedAt: true, hiddenAt: true, visitorAnonId: true },
  })
  if (!photo || !photo.blobConfirmedAt || photo.hiddenAt) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  let owned = photo.visitorAnonId === anonId
  if (!owned) {
    // Claimed-session path: the photo's anon was claimed by a user who
    // also claimed the caller's anon (same person, new device/cookie).
    const [callerSession, photoSession] = await Promise.all([
      prisma.visitorSession.findUnique({ where: { anonId } }),
      photo.visitorAnonId ? prisma.visitorSession.findUnique({ where: { anonId: photo.visitorAnonId } }) : null,
    ])
    owned =
      callerSession?.claimedByUserId != null && callerSession.claimedByUserId === photoSession?.claimedByUserId
  }
  if (!owned) return NextResponse.json({ ok: false, error: 'not_your_photo' }, { status: 403 })

  return NextResponse.redirect(photo.blobUrl, 302)
}
