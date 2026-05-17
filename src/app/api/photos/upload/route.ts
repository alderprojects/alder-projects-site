/**
 * v7.3.3-B Photo Upload Route — anonymous-first basement photo reader.
 *
 * POST /api/photos/upload
 *
 * Single photo per request. Inline vision extraction. Vercel Hobby
 * 10-second function timeout is the binding constraint — the realistic
 * budget breakdown:
 *   - sharp decode + EXIF strip + re-encode + dhash: 0.5-1s
 *   - Vercel Blob put: 0.5-1s
 *   - Prisma writes (4-5 rows): 0.3-0.6s
 *   - Claude vision call: 3-7s
 *   - response serialization: <0.1s
 *   ----------------------------------------------------------------
 *   total worst case: ~9.5s. Tight. No batching, no retry chains.
 *
 * If vision extraction fails or times out, the route still returns 200
 * with `extractionError` populated — the Photo and RoomSnapshot rows
 * are saved, and the synthesizer treats the photo as having no signal.
 * Downstream UI shows "we couldn't read this photo, but kept it."
 *
 * Body shape (zod-validated):
 *   { projectId?: string, roomType: 'basement',
 *     scope: 'basement_moisture', imageBase64: string,
 *     consents: { product_improvement, valuation_research, public_content_use } }
 *
 * Response on success: { ok: true, photoId, projectId, snapshotId,
 *   extraction: { overallConfidence, features } | null, extractionError }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'
import { put } from '@vercel/blob'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { extractFromImage } from '@/lib/vision/extract'
import { dhashFromBuffer } from '@/lib/photos/dhash'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const BodySchema = z.object({
  projectId: z.string().optional(),
  roomType: z.literal('basement'),
  scope: z.literal('basement_moisture'),
  // ~10MB upper guard on base64 (raw bytes after decode capped at ~7.5MB)
  imageBase64: z.string().min(100).max(15_000_000),
  consents: z.object({
    product_improvement: z.boolean(),
    valuation_research: z.boolean(),
    public_content_use: z.boolean(),
  }),
})

const CONSENT_VERSION = 'v1.0.0' // privacy policy version snapshot

export async function POST(req: NextRequest): Promise<NextResponse> {
  const t0 = Date.now()

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'invalid_body', detail: (e as Error).message.slice(0, 200) },
      { status: 400 }
    )
  }

  let anonId: string
  try {
    anonId = await ensureVisitorSession({ firstSource: 'photo_upload' })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'no_anon_cookie', detail: (e as Error).message },
      { status: 400 }
    )
  }

  // 1. Decode base64 (strip data: URI prefix if present)
  const base64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const raw = Buffer.from(base64, 'base64')
  if (raw.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty_image' }, { status: 400 })
  }

  // 2. EXIF strip + auto-rotate + resize cap + re-encode to JPEG
  let processed: Buffer
  let widthPx: number | undefined
  let heightPx: number | undefined
  try {
    const result = await sharp(raw)
      .rotate() // auto-rotate per EXIF orientation, then sharp strips metadata
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer({ resolveWithObject: true })
    processed = result.data
    widthPx = result.info.width
    heightPx = result.info.height
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'image_decode_failed', detail: (e as Error).message.slice(0, 200) },
      { status: 400 }
    )
  }

  // 3. Hashes
  const sha = createHash('sha256').update(processed).digest('hex')
  const dhash = await dhashFromBuffer(processed)
  const blobKey = `photos/${sha.substring(0, 2)}/${sha}.jpg`

  // 4. Find-or-create Project (anon-owned for this beta)
  let project = body.projectId
    ? await prisma.project.findUnique({ where: { id: body.projectId } })
    : null
  if (project && project.visitorAnonId !== anonId) {
    // The provided projectId doesn't belong to this visitor. Don't leak
    // existence — treat as "not your project."
    return NextResponse.json({ ok: false, error: 'not_your_project' }, { status: 403 })
  }
  if (!project) {
    project = await prisma.project.create({
      data: {
        topic: 'basement_moisture',
        scopeVariant: 'basement_moisture_prep',
        visitorAnonId: anonId,
      },
    })
  }

  // 5. Find-or-create RoomSnapshot for this Project + room type
  let snap = await prisma.roomSnapshot.findFirst({
    where: { projectId: project.id, roomType: 'basement' },
    orderBy: { snapshotAt: 'desc' },
  })
  if (!snap) {
    snap = await prisma.roomSnapshot.create({
      data: {
        projectId: project.id,
        roomType: 'basement',
        snapshotAt: new Date(),
        captureContext: 'anon_photo_upload',
        visitorAnonId: anonId,
      },
    })
  }

  // 6. Create Photo row (blobUrl filled after blob write succeeds)
  const consentFlags = {
    personal_recommendations: true, // implicit — can't use the service without it
    product_improvement: body.consents.product_improvement,
    valuation_research: body.consents.valuation_research,
    public_content_use: body.consents.public_content_use,
  }

  let photo
  try {
    photo = await prisma.photo.create({
      data: {
        roomSnapshotId: snap.id,
        blobUrl: '', // filled after blob write
        blobKey,
        mimeType: 'image/jpeg',
        bytes: processed.length,
        widthPx,
        heightPx,
        perceptualHash: dhash,
        exifStrippedAt: new Date(),
        captureMethod: 'web_upload',
        consentFlagsJson: consentFlags as never,
        visitorAnonId: anonId,
      },
    })
  } catch (e) {
    // Most likely cause: duplicate blobKey (same content-addressed key
    // from a prior upload of the identical image). Don't dedup across
    // sessions during beta — fail cleanly with a friendly message.
    return NextResponse.json(
      { ok: false, error: 'photo_create_failed', detail: (e as Error).message.slice(0, 200) },
      { status: 409 }
    )
  }

  // Write consent rows for this anon visitor — one per purpose. Each
  // row is dataType=photo, source=anon_upload. Linked to a User on email
  // claim (PR 7.3.3-C reassigns rows from anonId to userId).
  await prisma.consent.createMany({
    data: [
      { anonId, purpose: 'personal_recommendations', dataType: 'photo', granted: true, version: CONSENT_VERSION, source: 'anon_upload' },
      { anonId, purpose: 'product_improvement', dataType: 'photo', granted: body.consents.product_improvement, version: CONSENT_VERSION, source: 'anon_upload' },
      { anonId, purpose: 'valuation_research', dataType: 'photo', granted: body.consents.valuation_research, version: CONSENT_VERSION, source: 'anon_upload' },
      { anonId, purpose: 'public_content_use', dataType: 'photo', granted: body.consents.public_content_use, version: CONSENT_VERSION, source: 'anon_upload' },
    ],
    skipDuplicates: true, // partial unique on (anonId, purpose, dataType) — re-uploads update existing rows is acceptable behavior
  })

  // 7. Blob upload (content-addressed key; no random suffix)
  let blobUrl: string
  try {
    const blob = await put(blobKey, processed, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
    })
    blobUrl = blob.url
  } catch (e) {
    // Blob write failed — Photo row exists but is orphaned. Cleanup cron
    // will sweep it (Photo.blobConfirmedAt is null).
    return NextResponse.json(
      {
        ok: false,
        error: 'blob_write_failed',
        detail: (e as Error).message.slice(0, 200),
        photoId: photo.id,
      },
      { status: 502 }
    )
  }

  await prisma.photo.update({
    where: { id: photo.id },
    data: { blobUrl, blobConfirmedAt: new Date() },
  })

  await logEvent({
    eventType: 'PHOTO_UPLOADED',
    subjectType: 'Photo',
    subjectId: photo.id,
    anonId,
    source: 'web',
    payload: {
      projectId: project.id,
      scope: body.scope,
      bytes: processed.length,
    },
  })

  // 8. Inline vision extraction (the long-pole step). On failure, route
  // still returns 200 — Photo + RoomSnapshot are saved, synthesizer
  // treats this photo as "no signal."
  let extraction: Awaited<ReturnType<typeof extractFromImage>> | null = null
  let extractionError: string | null = null
  try {
    extraction = await extractFromImage({
      imageBuffer: processed,
      contextRoomType: 'basement',
      scope: 'basement_moisture',
    })

    await prisma.visionExtraction.create({
      data: {
        photoId: photo.id,
        modelVersion: 'claude-3-5-sonnet-20241022',
        promptVersion: extraction.promptVersion,
        extractionJson: extraction as never,
        overallConfidence: extraction.overallConfidence,
        // High-confidence = auto-approved during beta because
        // /admin/photo-review UI isn't built yet (v7.3.4 backlog). Low-
        // confidence stays "pending" until manual DB review.
        reviewStatus: extraction.overallConfidence >= 0.7 ? 'approved' : 'pending',
        apiCostCents: 0, // basement extraction is small; cost capture is v7.3.4 backlog
      },
    })

    await logEvent({
      eventType: 'VISION_EXTRACTION_COMPLETED',
      subjectType: 'Photo',
      subjectId: photo.id,
      anonId,
      source: 'web',
      payload: { confidence: extraction.overallConfidence },
    })
  } catch (e) {
    extractionError = (e as Error).message
    console.error('[photo-upload] vision extraction failed:', extractionError)
    await logEvent({
      eventType: 'VISION_EXTRACTION_FAILED',
      subjectType: 'Photo',
      subjectId: photo.id,
      anonId,
      source: 'web',
      payload: { error: extractionError.slice(0, 500) },
    })
  }

  return NextResponse.json({
    ok: true,
    photoId: photo.id,
    projectId: project.id,
    snapshotId: snap.id,
    extraction: extraction
      ? {
          overallConfidence: extraction.overallConfidence,
          features: extraction.visibleFeatures,
        }
      : null,
    extractionError,
    durationMs: Date.now() - t0,
  })
}
