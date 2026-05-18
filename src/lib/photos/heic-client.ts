/**
 * v7.3.4-PR3.8 — Client-side HEIC -> JPEG conversion.
 *
 * iPhones default to HEIC format when Camera > Formats > High
 * Efficiency. Server-side sharp on Vercel doesn't ship with libheif,
 * so HEIC uploads bounced with HTTP 415 even after PR3.7's clearer
 * error. PR3.8 fixes the actual journey: detect HEIC in the browser,
 * dynamic-import the `heic2any` library (~700KB, but only loaded
 * when needed — zero impact on normal-photo flow), convert to JPEG
 * at quality 0.9, and proceed with the upload as if it had been
 * JPEG all along.
 *
 * Pure client-side. No server changes. The /api/photos/upload route
 * never sees HEIC files because the client converts before posting.
 *
 * Failure mode: if heic2any throws (some HEIC variants don't decode
 * cleanly), we surface a friendly error suggesting the customer set
 * Camera > Formats > Most Compatible in iOS Settings.
 */

/**
 * Detect a HEIC/HEIF file by MIME type AND by file extension (some
 * browsers report empty MIME for HEIC, especially Safari).
 */
export function isHeic(file: File): boolean {
  const mime = file.type.toLowerCase()
  if (mime === 'image/heic' || mime === 'image/heif') return true
  const name = file.name.toLowerCase()
  return name.endsWith('.heic') || name.endsWith('.heif')
}

/**
 * Returns the file unchanged when it's not HEIC. Converts to JPEG
 * (q=0.9) when it is. Throws with a friendly message on conversion
 * failure — callers should surface to the user.
 *
 * Wrapped in this function so callers don't need to dynamic-import
 * heic2any themselves.
 */
export async function convertHeicIfNeeded(file: File): Promise<File> {
  if (!isHeic(file)) return file

  // Dynamic import keeps the ~700KB heic2any payload out of the main
  // bundle. Only loaded when a HEIC file is detected.
  let heic2any: typeof import('heic2any').default
  try {
    heic2any = (await import('heic2any')).default
  } catch (e) {
    throw new Error(
      `Couldn't load HEIC converter (${(e as Error).message.slice(0, 60)}). Try again, or set iPhone Camera > Formats > Most Compatible.`
    )
  }

  let blob: Blob
  try {
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })
    // heic2any returns Blob | Blob[] depending on whether the HEIC has
    // multiple frames (live photos, bursts). Take the first frame.
    blob = Array.isArray(result) ? result[0]! : result
  } catch (e) {
    const msg = (e as Error).message || ''
    // PR3.9 Bug #3: iOS Safari sometimes decodes HEIC natively before
    // heic2any sees it; the library then throws "image is already
    // browser readable" (code ERR_USER). In that case the file is
    // ALREADY a normal image as far as the upload pipeline is
    // concerned — fall through to direct upload instead of failing.
    const isBrowserReadable =
      msg.toLowerCase().includes('already browser readable') ||
      msg.toLowerCase().includes('err_user')
    if (isBrowserReadable) {
      console.log('[heic-client] heic2any reports file is already browser-readable; uploading as-is')
      // Re-wrap the file to ensure it has a JPEG-ish filename + MIME
      // (server's MIME allowlist rejects empty/heic strings).
      const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
      const fallbackType = file.type && file.type.startsWith('image/') && file.type !== 'image/heic' && file.type !== 'image/heif'
        ? file.type
        : 'image/jpeg'
      return new File([file], newName, {
        type: fallbackType,
        lastModified: file.lastModified,
      })
    }
    throw new Error(
      `Couldn't convert your iPhone HEIC photo (${msg.slice(0, 80)}). Try a different photo, or iPhone Settings > Camera > Formats > Most Compatible.`
    )
  }

  // Re-wrap as a File so downstream FormData.append("image", file)
  // sees a filename + a proper image/jpeg MIME.
  const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
  return new File([blob], newName, {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  })
}
