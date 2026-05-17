/**
 * v7.3.3-C PR1 Photo Upload Route — anonymous-first OPEN photo reader.
 *
 * POST /api/photos/upload
 *
 * Single photo per request. Inline vision extraction via the open
 * extraction path (extractOpenFeatures). No category gating at upload
 * time — the model decides what's in the photo. Vercel Hobby
 * 10-second function timeout is the binding constraint:
 *   - sharp decode + EXIF strip + re-encode + dhash: 0.5-1s
 *   - Vercel Blob put: 0.5-1s
 *   - Prisma writes (4-5 rows): 0.3-0.6s
 *   - Claude vision call (open extraction): 3-8s
 *   - response serialization: <0.1s
 *   ----------------------------------------------------------------
 *   total worst case: ~10.5s. Tight enough that we keep OPEN_MAX_TOKENS
 *   at 4096 (not higher) to bound the vision call.
 *
 * If vision extraction fails or times out, the route still returns 200
 * with `extractionError` populated — the Photo + RoomSnapshot rows are
 * saved, and the synthesizer treats the photo as having no signal.
 * Downstream UI shows "we couldn't read this photo, but kept it."
 *
 * Body shape (zod-validated):
 *   { projectId?: string,
 *     roomType?: string,        // optional hint, telemetry only — not enforced
 *     scope?: string,           // optional hint, telemetry only — not enforced
 *     imageBase64: string,
 *     consents: { product_improvement, valuation_research, public_content_use } }
 *
 * Response on success: { ok: true, photoId, projectId, snapshotId,
 *   extraction: { featureCount, overallCategory, features } | null,
 *   extractionError }
 *
 * v7.3.3-C-PR1 changes from v7.3.3-B:
 *   - Calls extractOpenFeatures (open vocab) instead of extractFromImage
 *   - roomType + scope drop from literal('basement') / literal('basement_moisture')
 *     to optional free string (telemetry only). No category gating.
 *   - Hardcoded model string replaced with MODEL_VERSION constant
 *   - Stored VisionExtraction.extractionJson is now the open shape
 *     (features[], overall_photo_category, notes)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import sharp from 'sharp'
import { put } from '@vercel/blob'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { extractOpenFeatures, MODEL_VERSION } from '@/lib/vision/extract'
import { dhashFromBuffer } from '@/lib/photos/dhash'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const BodySchema = z.object({
  projectId: z.string().optional(),
  // roomType + scope are now optional telemetry hints. The extraction
  // call ignores them — open extraction looks at what's actually in
  // the photo. Kept in the body so existing /project-read/basement
  // client code doesn't need to change in PR1.
  roomType: z.string().optional(),
  scope: z.string().optional(),
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
  let extractionResult: Awaited<ReturnType<typeof extractOpenFeatures>> | null = null
  let extractionError: string | null = null
  try {
    extractionResult = await extractOpenFeatures({
      imageBuffer: processed,
      mediaType: 'image/jpeg',
    })

    // Compute a photo-level overall confidence as the mean of feature
    // confidences. Returns 0 if zero features — open extraction can
    // legitimately produce an empty array for a photo that shows
    // nothing observable.
    const featureMeanConfidence =
      extractionResult.extraction.features.length > 0
        ? extractionResult.extraction.features.reduce((acc, f) => acc + f.confidence, 0) /
          extractionResult.extraction.features.length
        : 0

    await prisma.visionExtraction.create({
      data: {
        photoId: photo.id,
        modelVersion: extractionResult.modelVersion,
        promptVersion: extractionResult.promptVersion,
        extractionJson: extractionResult.extraction as never,
        overallConfidence: featureMeanConfidence,
        // v7.3.3-C-PR1: auto-approve threshold removed. Open extraction
        // gets all 'pending'; PR3 reaction capture is the curation layer.
        reviewStatus: 'pending',
        apiCostCents: Math.round(extractionResult.apiCostCents),
      },
    })

    await logEvent({
      eventType: 'VISION_EXTRACTION_COMPLETED',
      subjectType: 'Photo',
      subjectId: photo.id,
      anonId,
      source: 'web',
      payload: {
        confidence: featureMeanConfidence,
        featureCount: extractionResult.extraction.features.length,
        overallCategory: extractionResult.extraction.overall_photo_category,
        modelVersion: extractionResult.modelVersion,
        promptVersion: extractionResult.promptVersion,
        latencyMs: extractionResult.latencyMs,
        tokensIn: extractionResult.tokensIn,
        tokensOut: extractionResult.tokensOut,
        costCents: extractionResult.apiCostCents,
      },
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
      payload: {
        error: extractionError.slice(0, 500),
        modelVersion: MODEL_VERSION,
      },
    })
  }

  // Response shape:
  // - extraction: null on failure; otherwise the new open shape with a
  //   precomputed overallConfidence so the existing BasementUploader UI
  //   keeps rendering "Read clearly / partially / couldn't read" without
  //   client changes
  const responseExtraction = extractionResult
    ? {
        overallConfidence:
          extractionResult.extraction.features.length > 0
            ? extractionResult.extraction.features.reduce((acc, f) => acc + f.confidence, 0) /
              extractionResult.extraction.features.length
            : 0,
        featureCount: extractionResult.extraction.features.length,
        overallCategory: extractionResult.extraction.overall_photo_category,
        features: extractionResult.extraction.features,
      }
    : null

  return NextResponse.json({
    ok: true,
    photoId: photo.id,
    projectId: project.id,
    snapshotId: snap.id,
    extraction: responseExtraction,
    extractionError,
    durationMs: Date.now() - t0,
  })
}
