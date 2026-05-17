/**
 * Difference-hash (dhash) perceptual fingerprint.
 *
 * Used to dedup photos that are visually identical (e.g. the same shot
 * uploaded twice). 64-bit hash, hex-encoded as 16 chars.
 *
 * Algorithm: greyscale + downscale to 9x8, then for each row, set bit
 * for each pixel pair where left > right. 8 rows * 8 bits = 64-bit hash.
 *
 * Two photos with Hamming distance <= ~6 bits are likely the same image.
 * Smart Cart V2 uses this for the dedup index on Photo.perceptualHash;
 * higher-distance dedup (e.g. "this is a slightly different angle of
 * the same room") is out of scope for v7.3.3.
 */

import sharp from 'sharp'

export async function dhashFromBuffer(buf: Buffer): Promise<string> {
  const { data } = await sharp(buf)
    .greyscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  let hash = BigInt(0)
  let bit = BigInt(0)
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = data[y * 9 + x]
      const right = data[y * 9 + x + 1]
      if (left > right) hash |= BigInt(1) << bit
      bit++
    }
  }
  return hash.toString(16).padStart(16, '0')
}
