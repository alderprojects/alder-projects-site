/**
 * v7.3.4-PR3.7 Photo Upload Route — multipart/form-data ingest.
 *
 * POST /api/photos/upload
 *
 * Accepts multipart/form-data with the raw image file as the 'image'
 * field. Switched from base64-in-JSON (PR1) to multipart in PR3.7
 * because base64 inflates payload size by 33%, pushing real iPhone
 * photos (1.7MB+) past Vercel Hobby's 4.5MB request body cap and
 * causing sharp to throw "image_decode_failed: bad seek to N" on
 * truncated buffers. Multipart uses the raw bytes, no inflation.
 *
 * Single photo per request. Inline vision extraction via
 * extractOpenFeatures. No category gating at upload time — the
 * model decides what's in the photo.
 *
 * Form fields:
 *   - image           File (image/jpeg | image/png | image/webp), required
 *   - projectId       string, optional
 *   - roomType        string, optional (telemetry hint only)
 *   - scope           string, optional (telemetry hint only)
 *   - consents        JSON string of { product_improvement, valuation_research, public_content_use }, required
 *
 * Response on success: { ok: true, photoId, projectId, snapshotId,
 *   extraction: { overallConfidence, featureCount, overallCategory, features } | null,
 *   extractionError, durationMs }
 *
 * If vision extraction fails or times out, the route still returns 200
 * with extractionError populated — the Photo + RoomSnapshot rows are
 * saved.
 *
 * v7.3.4-PR3.7 changes from PR3:
 *   - Body is multipart/form-data, not JSON (uploads 4-8MB photos cleanly)
 *   - On failure, writes UPLOAD_FAILED EventLog (was silent before)
 *   - Project + RoomSnapshot creation no longer hardcoded to basement
 *     (was 'basement_moisture' / 'basement_moisture_prep' / roomType='basement';
 *     now defaults to 'home_photo_read' / null / 'home' so synthesis
 *     downstream isn't biased toward a category the photo may not be)
 */

import { NextRequest, NextResponse } from 'next/server'
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

// Vercel Hobby caps function request bodies at ~4.5MB. Multipart
// avoids base64's 33% overhead, so a 4.5MB JPEG fits cleanly.
const MAX_IMAGE_BYTES = 4_500_000
const ACCEPTED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

interface UploadConsents {
  product_improvement: boolean
  valuation_research: boolean
  public_content_use: boolean
}

const CONSENT_VERSION = 'v1.0.0' // privacy policy version snapshot

export async function POST(req: NextRequest): Promise<NextResponse> {
  const t0 = Date.now()

  // PR3.7: multipart/form-data parse. Handles real iPhone JPEGs
  // (1-4MB) that previously failed under base64-in-JSON ingest.
  let formData: FormData
  try {
    formData = await req.formData()
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_body',
        detail: `Could not parse multipart body: ${(e as Error).message.slice(0, 160)}`,
      },
      { status: 400 }
    )
  }

  const imageEntry = formData.get('image')
  const projectId = optionalString(formData.get('projectId'))
  const roomType = optionalString(formData.get('roomType'))
  const scope = optionalString(formData.get('scope'))
  const consentsRaw = formData.get('consents')
  // PR3.10: visitor's freeform "tell us what you're looking to do"
  // text. Capped at 500 chars. Plumbed to Project.userIntent on
  // create; on existing-project upload, fills the field if it's not
  // already set (don't overwrite — first intent wins).
  const userIntentRaw = optionalString(formData.get('userIntent'))
  const userIntent =
    userIntentRaw && userIntentRaw.length > 500
      ? userIntentRaw.slice(0, 500)
      : userIntentRaw

  if (!(imageEntry instanceof File)) {
    return NextResponse.json(
      { ok: false, error: 'missing_image', detail: 'Form must include an "image" file field.' },
      { status: 400 }
    )
  }
  if (imageEntry.size === 0) {
    return NextResponse.json({ ok: false, error: 'empty_image' }, { status: 400 })
  }
  if (imageEntry.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: 'image_too_large',
        detail: `Max ${(MAX_IMAGE_BYTES / 1_000_000).toFixed(1)}MB — yours is ${(imageEntry.size / 1_000_000).toFixed(1)}MB.`,
      },
      { status: 413 }
    )
  }
  if (imageEntry.type && !ACCEPTED_MIME.has(imageEntry.type.toLowerCase())) {
    return NextResponse.json(
      {
        ok: false,
        error: 'unsupported_image_type',
        detail: `Got ${imageEntry.type}. Supported: JPEG, PNG, WebP. iPhone HEIC photos need to be exported as JPEG first.`,
      },
      { status: 415 }
    )
  }

  let consents: UploadConsents
  try {
    if (typeof consentsRaw !== 'string') throw new Error('consents must be a JSON string')
    const parsed = JSON.parse(consentsRaw) as unknown
    if (typeof parsed !== 'object' || parsed === null) throw new Error('consents must be an object')
    const p = parsed as Record<string, unknown>
    consents = {
      product_improvement: !!p.product_improvement,
      valuation_research: !!p.valuation_research,
      public_content_use: !!p.public_content_use,
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'invalid_consents', detail: (e as Error).message.slice(0, 160) },
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

  // 1. Read the image bytes (no base64 inflation; sharp gets the
  //    full buffer in one read).
  const raw = Buffer.from(await imageEntry.arrayBuffer())
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
    const detail = (e as Error).message.slice(0, 200)
    // PR3.7 §1.12: UPLOAD_FAILED EventLog for the v7.3.4 retro.
    try {
      await logEvent({
        eventType: 'UPLOAD_FAILED',
        subjectType: 'VisitorSession',
        subjectId: anonId,
        anonId,
        source: 'web',
        payload: {
          stage: 'image_decode',
          fileBytes: imageEntry.size,
          mimeType: imageEntry.type,
          detail,
        },
      })
    } catch {
      /* event log failure must never block the response */
    }
    return NextResponse.json(
      { ok: false, error: 'image_decode_failed', detail },
      { status: 400 }
    )
  }

  // 3. Hashes
  const sha = createHash('sha256').update(processed).digest('hex')
  const dhash = await dhashFromBuffer(processed)
  const blobKey = `photos/${sha.substring(0, 2)}/${sha}.jpg`

  // 4. Find-or-create Project (anon-owned for this beta).
  //
  // PR3.7 §1.1: dropped the 'basement_moisture' / 'basement_moisture_prep'
  // hardcoded defaults. Project now records the OPEN-extraction context
  // ('home_photo_read'), and downstream synthesis infers the actual
  // project category from the extracted features, not from this row.
  let project = projectId
    ? await prisma.project.findUnique({ where: { id: projectId } })
    : null
  if (project && project.visitorAnonId !== anonId) {
    return NextResponse.json({ ok: false, error: 'not_your_project' }, { status: 403 })
  }
  if (!project) {
    project = await prisma.project.create({
      data: {
        topic: 'home_photo_read',
        scopeVariant: 'open_photo_intake',
        visitorAnonId: anonId,
        userIntent: userIntent ?? null,
      },
    })
  } else if (userIntent && !project.userIntent) {
    // PR3.10: existing project, no intent yet — backfill on first
    // upload that includes intent. Don't overwrite a prior intent
    // (the visitor's earlier framing of the project wins).
    project = await prisma.project.update({
      where: { id: project.id },
      data: { userIntent },
    })
  }

  // 5. Find-or-create RoomSnapshot for this Project.
  //
  // PR3.7 §1.1: roomType defaults to 'home' (was hardcoded 'basement').
  // The room type the visitor uploaded isn't known until extraction
  // runs; for the snapshot row we use a generic placeholder.
  const snapshotRoomType = roomType || 'home'
  let snap = await prisma.roomSnapshot.findFirst({
    where: { projectId: project.id, roomType: snapshotRoomType },
    orderBy: { snapshotAt: 'desc' },
  })
  if (!snap) {
    snap = await prisma.roomSnapshot.create({
      data: {
        projectId: project.id,
        roomType: snapshotRoomType,
        snapshotAt: new Date(),
        captureContext: 'anon_photo_upload',
        visitorAnonId: anonId,
      },
    })
  }
  // scope is currently a no-op telemetry hint; logEvent already
  // captures it. Mark as intentionally unused.
  void scope

  // 6. Find-or-create Photo on (visitorAnonId, blobKey).
  //
  // v7.3.3-C-PR1.1: same-anon re-upload of the same content-addressed
  // bytes reuses the existing Photo row instead of failing with the
  // unique-constraint violation that surfaced as `photo_create_failed`.
  // The global unique on blobKey was dropped in the matching migration;
  // dedup is now per-anon at the application layer.
  //
  // On reuse: skip blob upload (the blob already exists), skip new
  // VisionExtraction if a successful one already exists for this Photo.
  // Useful both for retests and for users who hit the back button +
  // re-add the same photo.
  const consentFlags = {
    personal_recommendations: true, // implicit — can't use the service without it
    product_improvement: consents.product_improvement,
    valuation_research: consents.valuation_research,
    public_content_use: consents.public_content_use,
  }

  let photo
  let reusedExistingPhoto = false
  try {
    const existing = await prisma.photo.findFirst({
      where: { visitorAnonId: anonId, blobKey },
      orderBy: { uploadedAt: 'desc' },
    })
    if (existing) {
      reusedExistingPhoto = true
      photo = existing
    } else {
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
    }
  } catch (e) {
    const detail = (e as Error).message.slice(0, 200)
    try {
      await logEvent({
        eventType: 'UPLOAD_FAILED',
        subjectType: 'VisitorSession',
        subjectId: anonId,
        anonId,
        source: 'web',
        payload: { stage: 'photo_create', fileBytes: imageEntry.size, detail },
      })
    } catch {
      /* swallow */
    }
    return NextResponse.json(
      { ok: false, error: 'photo_create_failed', detail },
      { status: 500 }
    )
  }

  // Write consent rows for this anon visitor — one per purpose. Each
  // row is dataType=photo, source=anon_upload. Linked to a User on email
  // claim (PR 7.3.3-C reassigns rows from anonId to userId).
  // skipDuplicates handles the reuse case where consents already exist.
  await prisma.consent.createMany({
    data: [
      { anonId, purpose: 'personal_recommendations', dataType: 'photo', granted: true, version: CONSENT_VERSION, source: 'anon_upload' },
      { anonId, purpose: 'product_improvement', dataType: 'photo', granted: consents.product_improvement, version: CONSENT_VERSION, source: 'anon_upload' },
      { anonId, purpose: 'valuation_research', dataType: 'photo', granted: consents.valuation_research, version: CONSENT_VERSION, source: 'anon_upload' },
      { anonId, purpose: 'public_content_use', dataType: 'photo', granted: consents.public_content_use, version: CONSENT_VERSION, source: 'anon_upload' },
    ],
    skipDuplicates: true,
  })

  // 7. Blob upload (content-addressed key; no random suffix). Skipped
  // when reusing an existing Photo whose blob is already confirmed.
  if (!reusedExistingPhoto || !photo.blobConfirmedAt) {
    let blobUrl: string
    try {
      const blob = await put(blobKey, processed, {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: false,
      })
      blobUrl = blob.url
    } catch (e) {
      const detail = (e as Error).message.slice(0, 200)
      try {
        await logEvent({
          eventType: 'UPLOAD_FAILED',
          subjectType: 'VisitorSession',
          subjectId: anonId,
          anonId,
          source: 'web',
          payload: {
            stage: 'blob_write',
            fileBytes: imageEntry.size,
            photoId: photo.id,
            detail,
          },
        })
      } catch {
        /* swallow */
      }
      // Blob write failed — Photo row exists but is orphaned. Cleanup
      // cron will sweep it (Photo.blobConfirmedAt is null).
      return NextResponse.json(
        {
          ok: false,
          error: 'blob_write_failed',
          detail,
          photoId: photo.id,
        },
        { status: 502 }
      )
    }

    photo = await prisma.photo.update({
      where: { id: photo.id },
      data: { blobUrl, blobConfirmedAt: new Date() },
    })
  }

  await logEvent({
    eventType: reusedExistingPhoto ? 'PHOTO_REUSED' : 'PHOTO_UPLOADED',
    subjectType: 'Photo',
    subjectId: photo.id,
    anonId,
    source: 'web',
    payload: {
      projectId: project.id,
      scope: scope ?? null,
      bytes: processed.length,
      reusedExistingPhoto,
    },
  })

  // 8. Inline vision extraction (the long-pole step). On failure, route
  // still returns 200 — Photo + RoomSnapshot are saved, synthesizer
  // treats this photo as "no signal."
  //
  // PR1.1: when reusing an existing Photo, skip re-extraction if a
  // prior VisionExtraction succeeded. If the prior extraction failed
  // (the v7.3.3-B 404 case for everyone) we DO re-run, so retests
  // recover automatically.
  let extractionResult: Awaited<ReturnType<typeof extractOpenFeatures>> | null = null
  let extractionError: string | null = null
  let reusedExistingExtraction = false

  if (reusedExistingPhoto) {
    const priorExtraction = await prisma.visionExtraction.findFirst({
      where: { photoId: photo.id },
      orderBy: { createdAt: 'desc' },
    })
    // overallConfidence > 0 indicates a parsed extraction (failures
    // never write a row at all; this guards against a hypothetical
    // future where we DO write 0-conf rows on failure).
    if (priorExtraction && priorExtraction.overallConfidence > 0) {
      reusedExistingExtraction = true
      const cached = priorExtraction.extractionJson as unknown as {
        features?: Array<{ confidence: number }>
        overall_photo_category?: string
      }
      const cachedConfidence =
        cached.features && cached.features.length > 0
          ? cached.features.reduce((acc, f) => acc + f.confidence, 0) / cached.features.length
          : 0
      return NextResponse.json({
        ok: true,
        photoId: photo.id,
        projectId: project.id,
        snapshotId: snap.id,
        extraction: {
          overallConfidence: cachedConfidence,
          featureCount: cached.features?.length ?? 0,
          overallCategory: cached.overall_photo_category ?? 'unclear',
          features: cached.features ?? [],
        },
        extractionError: null,
        reused: { photo: true, extraction: true },
        durationMs: Date.now() - t0,
      })
    }
  }

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
  // - extraction: null on failure; otherwise the open shape with a
  //   precomputed overallConfidence so the PhotoUploader UI can render
  //   "Read clearly / partially / couldn't read" without recomputing.
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

// =============================================================================
// HELPERS
// =============================================================================

/** Extract a string-valued field from a FormData entry, or null. */
function optionalString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  return trimmed.length > 0 ? trimmed : null
}
