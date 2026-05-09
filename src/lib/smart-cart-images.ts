// v7.2.7 — runtime helpers for product images.
//
// V2ResultLayout calls resolveImageUrl(variant) to get the path. If
// the variant has imageUrl populated (universe.ts), use that. Otherwise
// fall back to the default icon. The 404 fallback is handled at the
// component layer via <img onError>.

import type { CartTierVariant } from './smart-cart-model'

export const DEFAULT_IMAGE_URL = '/product-images/categories/_package.svg'

export function resolveImageUrl(variant: CartTierVariant): string {
  return variant.imageUrl && variant.imageUrl.length > 0
    ? variant.imageUrl
    : DEFAULT_IMAGE_URL
}
