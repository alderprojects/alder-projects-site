// v7.2.7 — runtime helpers for product images.
// v7.2.9 — added image-source classification + per-source labels.
//
// V2ResultLayout calls resolveImageUrl(variant) to get the path. If
// the variant has imageUrl populated (universe.ts), use that. Otherwise
// fall back to the default icon. The 404 fallback is handled at the
// component layer via <img onError>.
//
// CategoryTag calls getImageSource(universeId) to classify the image
// for display labeling.

import type { CartTierVariant } from './smart-cart-model'
import manifest from './image-source-manifest.json'

export const DEFAULT_IMAGE_URL = '/product-images/categories/_package.svg'

export type ImageSource =
  | 'manufacturer'
  | 'pexels'
  | 'ai_illustration'
  | 'svg_fallback'

export function resolveImageUrl(variant: CartTierVariant): string {
  return variant.imageUrl && variant.imageUrl.length > 0
    ? variant.imageUrl
    : DEFAULT_IMAGE_URL
}

/**
 * Look up the source class by image URL. Defaults to svg_fallback when
 * the manifest doesn't carry the path (graceful for new entries before
 * the next pipeline run regenerates the manifest).
 */
export function getImageSource(imageUrl: string): ImageSource {
  const m = manifest as Record<string, ImageSource>
  if (m[imageUrl]) return m[imageUrl]
  // Fallback heuristic for paths the manifest hasn't seen yet
  return imageUrl.includes('/categories/') ? 'svg_fallback' : 'manufacturer'
}

/** UI label for the image-source tag overlaid on the thumbnail. */
export function getImageSourceLabel(source: ImageSource): string | null {
  switch (source) {
    case 'manufacturer':
      return null // real product photo — no overlay needed
    case 'pexels':
      return 'Stock'
    case 'ai_illustration':
      return 'Illustration'
    case 'svg_fallback':
      return 'Category'
  }
}
