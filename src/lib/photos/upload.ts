/**
 * Photo upload pipeline.
 *
 * Pipeline per photo:
 *   1. Validate mime type and size (≤ 12 MB, jpeg/png/webp/heic).
 *   2. Strip EXIF via sharp (.rotate() applies orientation then drops it).
 *   3. Re-encode to JPEG quality 85 if input is JPEG/HEIC, retain PNG/WebP.
 *      HEIC → JPEG conversion happens here because Vercel Blob serves the
 *      stored format directly; browsers want JPEG.
 *   4. Compute a 64-bit average-hash (aHash) for dedupe / near-dup
 *      detection. Stored as 16-char hex per Photo.perceptualHash spec.
 *   5. Upload to Vercel Blob via @vercel/blob. Key is content-addressed:
 *      `photos/<userId>/<sha256(buffer).substring(0,16)>.<ext>`. Same
 *      content uploaded twice ends up at the same key — Blob upsert
 *      handles dedupe.
 *   6. Return metadata for the caller to persist into the Photo row.
 *
 * Note on aHash vs pHash: aHash is a 64-bit average-luminance hash.
 * Cheap, robust to small crops and brightness shifts. True pHash uses
 * a DCT and is more robust to rotation / scaling. aHash is enough for
 * week 1's dedupe needs; upgrade to DCT pHash before the prod merge if
 * near-duplicate detection becomes load-bearing.
 */

import crypto from 'crypto'
import sharp from 'sharp'
import { put } from '@vercel/blob'

export const MAX_BYTES = 12 * 1024 * 1024 // 12 MB
export const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

export interface ProcessedPhoto {
  blobUrl: string
  blobKey: string
  mimeType: string
  bytes: number
  widthPx: number
  heightPx: number
  perceptualHash: string // 16-char hex (64-bit aHash)
  exifStrippedAt: Date
}

export class PhotoUploadError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'PhotoUploadError'
  }
}

export interface UploadInput {
  buffer: Buffer
  mimeType: string
  userId: string
}

export async function processAndUploadPhoto(input: UploadInput): Promise<ProcessedPhoto> {
  if (!ALLOWED_MIMES.has(input.mimeType)) {
    throw new PhotoUploadError('invalid_mime', `Unsupported mime: ${input.mimeType}`)
  }
  if (input.buffer.byteLength > MAX_BYTES) {
    throw new PhotoUploadError(
      'too_large',
      `Photo is ${(input.buffer.byteLength / 1024 / 1024).toFixed(1)} MB; max is ${MAX_BYTES / 1024 / 1024} MB`
    )
  }

  // 1. Strip EXIF + apply orientation. sharp().rotate() reads EXIF
  //    orientation and bakes it into the pixels, then strips it.
  const sharpInput = sharp(input.buffer, { failOn: 'truncated' }).rotate()
  const meta = await sharpInput.metadata()

  // 2. Re-encode. HEIC → JPEG (browsers don't render HEIC). Others retain.
  const outputMime =
    input.mimeType === 'image/heic' || input.mimeType === 'image/heif'
      ? 'image/jpeg'
      : input.mimeType
  const outputExt = mimeToExt(outputMime)

  let processed: Buffer
  if (outputMime === 'image/jpeg') {
    processed = await sharpInput.jpeg({ quality: 85, mozjpeg: true }).withMetadata({ exif: {} }).toBuffer()
  } else if (outputMime === 'image/webp') {
    processed = await sharpInput.webp({ quality: 85 }).withMetadata({ exif: {} }).toBuffer()
  } else {
    processed = await sharpInput.png().withMetadata({ exif: {} }).toBuffer()
  }

  // 3. Perceptual hash (aHash, 64-bit)
  const perceptualHash = await computeAHash(input.buffer)

  // 4. Content-addressed key — same bytes always map to same key,
  //    so re-uploading the same photo is a no-op in storage.
  const sha = crypto.createHash('sha256').update(processed).digest('hex')
  const blobKey = `photos/${input.userId}/${sha.substring(0, 16)}.${outputExt}`

  // 5. Upload. addRandomSuffix:false because the key is already unique.
  // @vercel/blob 0.27 has no `allowOverwrite` option — same-content
  // uploads at the same content-addressed key will throw if the blob
  // already exists. Catch that one case and return the existing URL
  // (idempotent re-upload). Any other error propagates.
  let blob: { url: string }
  try {
    blob = await put(blobKey, processed, {
      access: 'public',
      contentType: outputMime,
      addRandomSuffix: false,
    })
  } catch (e) {
    const msg = (e as Error).message || ''
    if (/already exists|conflict/i.test(msg)) {
      // Reconstruct the public URL from the known key.
      const storeHost = process.env.BLOB_STORE_HOSTNAME // optional override
      if (storeHost) {
        blob = { url: `https://${storeHost}/${blobKey}` }
      } else {
        throw new PhotoUploadError(
          'blob_exists_no_hostname',
          'Blob already exists; set BLOB_STORE_HOSTNAME to reconstruct URL or use a unique key.'
        )
      }
    } else {
      throw e
    }
  }

  return {
    blobUrl: blob.url,
    blobKey,
    mimeType: outputMime,
    bytes: processed.byteLength,
    widthPx: meta.width ?? 0,
    heightPx: meta.height ?? 0,
    perceptualHash,
    exifStrippedAt: new Date(),
  }
}

// =============================================================================
// Perceptual hash — 64-bit average hash
// =============================================================================
//
// Algorithm:
//   1. Resize to 8x8 (64 pixels)
//   2. Convert to grayscale
//   3. Compute mean luminance
//   4. For each pixel, bit = 1 if luminance >= mean else 0
//   5. Pack 64 bits into a hex string (16 chars)
//
// Properties:
//   - Identical photos always hash identically.
//   - Small crops, brightness/contrast tweaks, slight rotations: Hamming
//     distance stays low (typically < 8 bits).
//   - Different photos: typically > 20 bits apart.

export async function computeAHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .rotate()
    .grayscale()
    .resize(8, 8, { fit: 'fill', kernel: 'cubic' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (data.length !== 64) {
    // Shouldn't happen given fixed 8x8 grayscale, but fail loud if it does.
    throw new PhotoUploadError('hash_failed', `aHash expected 64 px, got ${data.length}`)
  }

  let sum = 0
  for (let i = 0; i < 64; i++) sum += data[i]
  const mean = sum / 64

  let hex = ''
  for (let i = 0; i < 8; i++) {
    let byte = 0
    for (let j = 0; j < 8; j++) {
      if (data[i * 8 + j] >= mean) byte |= 1 << (7 - j)
    }
    hex += byte.toString(16).padStart(2, '0')
  }
  return hex
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'bin'
  }
}
