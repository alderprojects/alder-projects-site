/**
 * v7.4.5 — GET /api/admin/photos/[photoId]
 *
 * Admin photo passthrough: allowlisted-session check, AdminAccessLog
 * PHOTO_VIEWED on every issuance (no exceptions), then 302 to the
 * capability URL. Admin surfaces must use THIS route — Photo.blobUrl
 * never renders in admin HTML. Session auth only: the legacy
 * ADMIN_REFUND_TOKEN convention deliberately does not unlock photo
 * bytes. Photos hidden by consent revocation (hiddenAt) are 404 here —
 * revocation binds admins too.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAdmin, logAdminAccess } from '@/lib/auth/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

export async function GET(
  _req: NextRequest,
  context: { params: { photoId: string } }
): Promise<NextResponse> {
  const check = await checkAdmin()
  if (check.status === 'unauthenticated') {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (check.status === 'forbidden') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const photo = await prisma.photo.findUnique({
    where: { id: context.params.photoId },
    select: { id: true, blobUrl: true, blobConfirmedAt: true, hiddenAt: true },
  })
  if (!photo || !photo.blobConfirmedAt || photo.hiddenAt || !photo.blobUrl) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  await logAdminAccess(check.user.email, 'PHOTO_VIEWED', photo.id)
  return NextResponse.redirect(photo.blobUrl, 302)
}
