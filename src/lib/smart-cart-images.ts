// v7.2.7 — runtime helpers for product images.
// v7.2.9 — added image-source classification + per-source labels.
// v7.2.10 — enrichCartWithCurrentImages: backfill imageUrl on carts
//   persisted in KV before the image pipeline existed. Result page
//   calls this before render so old carts inherit current imagery
//   without re-saving.

import { UNIVERSE } from '@/content/smart-cart/universe'
import type { CartSlot, CartTierVariant, SmartCartV2Output } from './smart-cart-model'
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

// ---------- Cart-level enrichment (v7.2.10) -------------------------
//
// Carts persisted in KV before v7.2.7-v7.2.9 have empty/stale
// variant.imageUrl values. Result page reads from KV verbatim, so
// historical carts don't pick up later image work without help.
//
// At render time we walk each slot's tiers and look up the current
// imageUrl from UNIVERSE by productName. If the persisted variant
// already has a non-empty imageUrl, leave it alone — only backfill
// missing data.

const PRODUCT_NAME_TO_IMAGE_URL: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const p of UNIVERSE) {
    if (p.variant.imageUrl && p.variant.productName) {
      map[p.variant.productName] = p.variant.imageUrl
    }
  }
  return map
})()

function enrichVariant(variant: CartTierVariant): CartTierVariant {
  // v7.2.10 — universe is source of truth. Persisted carts have
  // imageUrl values that are snapshots at cart-generation time;
  // when the universe has new imagery, prefer the universe value.
  // Only fall back to the persisted value when the productName isn't
  // in the current universe (e.g., a slot whose product was renamed).
  const fromUniverse = PRODUCT_NAME_TO_IMAGE_URL[variant.productName]
  if (fromUniverse) return { ...variant, imageUrl: fromUniverse }
  return variant
}

function enrichSlot(slot: CartSlot): CartSlot {
  return {
    ...slot,
    tiers: {
      budget: slot.tiers.budget ? enrichVariant(slot.tiers.budget) : undefined,
      sweet_spot: enrichVariant(slot.tiers.sweet_spot),
      premium: slot.tiers.premium ? enrichVariant(slot.tiers.premium) : undefined,
    },
  }
}

/**
 * Backfill imageUrl on every variant in the cart from the current
 * universe. Pure: returns a shallow copy with enriched slots.
 */
export function enrichCartWithCurrentImages(
  cart: SmartCartV2Output,
): SmartCartV2Output {
  return { ...cart, slots: cart.slots.map(enrichSlot) }
}
