/**
 * v7.4.5 §1.3 — EXIF capture boundary.
 *
 * Parses EXIF from the RAW upload bytes once, before the sharp re-encode
 * strips all metadata. Returns ONLY the allowed field set.
 *
 * R1 GUARD (do not remove): GPS coordinates must never cross this
 * boundary — not as return values, not in logs, not in error messages.
 * The GPS IFD is inspected solely for presence; `hadGps` is the sole
 * permitted derivative. Any change that reads GPS tag VALUES out of
 * this module violates cardinal rule R1 of the v7.4.5–v7.4.8 series.
 */

import sharp from 'sharp'
import exifReader from 'exif-reader'

export interface CapturedExifFields {
  capturedAt: Date | null
  deviceMake: string | null
  deviceModel: string | null
  origWidth: number | null
  origHeight: number | null
  orientation: number | null
  hadGps: boolean
}

const EMPTY: CapturedExifFields = {
  capturedAt: null,
  deviceMake: null,
  deviceModel: null,
  origWidth: null,
  origHeight: null,
  orientation: null,
  hadGps: false,
}

/** Trim + cap a device string; EXIF fields are untrusted input. */
function cleanDeviceString(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.replace(/\0/g, '').trim()
  return s.length > 0 ? s.slice(0, 64) : null
}

/**
 * Never throws — a malformed EXIF blob (or none at all, e.g. screenshots)
 * must not fail the upload. All parse failures return the empty shape.
 */
export async function captureExifFields(raw: Buffer): Promise<CapturedExifFields> {
  try {
    const meta = await sharp(raw).metadata()
    const out: CapturedExifFields = {
      ...EMPTY,
      origWidth: meta.width ?? null,
      origHeight: meta.height ?? null,
      orientation: meta.orientation ?? null,
    }
    if (!meta.exif) return out

    // exif-reader shape: { Image: {Make, Model, ...}, Photo:
    // {DateTimeOriginal, ...}, GPSInfo: {...} }. GPSInfo is checked for
    // key presence only — its values are never read.
    const parsed = exifReader(meta.exif)
    const dto = (parsed as { Photo?: { DateTimeOriginal?: unknown } }).Photo?.DateTimeOriginal
    if (dto instanceof Date && !Number.isNaN(dto.getTime())) {
      out.capturedAt = dto
    }
    const image = (parsed as { Image?: { Make?: unknown; Model?: unknown } }).Image
    out.deviceMake = cleanDeviceString(image?.Make)
    out.deviceModel = cleanDeviceString(image?.Model)
    const gps = (parsed as { GPSInfo?: Record<string, unknown> }).GPSInfo
    out.hadGps = !!gps && Object.keys(gps).length > 0
    return out
  } catch {
    return EMPTY
  }
}
