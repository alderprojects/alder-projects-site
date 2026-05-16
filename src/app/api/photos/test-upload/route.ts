/**
 * POST /api/photos/test-upload
 *
 * Week-1 test endpoint — proves the EXIF strip + perceptual hash + Vercel
 * Blob upload pipeline works end-to-end before the real Smart Cart photo
 * UI is built in week 2.
 *
 * Auth required (session cookie). Accepts multipart/form-data with a
 * single `file` field. Returns the processed metadata as JSON.
 *
 * curl example:
 *   curl -X POST https://read.alderprojects.com/api/photos/test-upload \
 *     -H "Cookie: alder_session=<token>" \
 *     -F "file=@/path/to/photo.jpg"
 *
 * This endpoint is intentionally simple: it does NOT create Photo or
 * RoomSnapshot rows. Week 2's /api/photos/upload route handles that.
 * Here we only validate that the pipeline runs in the Vercel runtime,
 * sharp loads, EXIF strips, and Blob uploads succeed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import {
  processAndUploadPhoto,
  PhotoUploadError,
  ALLOWED_MIMES,
  MAX_BYTES,
} from '@/lib/photos/upload'

export const runtime = 'nodejs'
export const maxDuration = 30
// Don't cache; every upload is a write.
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_form_data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, reason: 'missing_file' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'too_large',
        details: { sizeBytes: file.size, maxBytes: MAX_BYTES },
      },
      { status: 413 }
    )
  }

  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'invalid_mime',
        details: { mime: file.type, allowed: Array.from(ALLOWED_MIMES) },
      },
      { status: 415 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const processed = await processAndUploadPhoto({
      buffer,
      mimeType: file.type,
      userId: user.id,
    })

    return NextResponse.json({
      ok: true,
      photo: {
        blobUrl: processed.blobUrl,
        blobKey: processed.blobKey,
        mimeType: processed.mimeType,
        bytes: processed.bytes,
        widthPx: processed.widthPx,
        heightPx: processed.heightPx,
        perceptualHash: processed.perceptualHash,
      },
    })
  } catch (e) {
    if (e instanceof PhotoUploadError) {
      return NextResponse.json(
        { ok: false, reason: e.code, details: { message: e.message } },
        { status: 400 }
      )
    }
    console.error('test-upload failed:', e)
    return NextResponse.json(
      { ok: false, reason: 'internal', details: { message: (e as Error).message } },
      { status: 500 }
    )
  }
}
