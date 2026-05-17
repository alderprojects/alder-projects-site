'use client'

/**
 * v7.3.4-PR1 — Free-beta basement-result wrapper around V3CartView.
 *
 * The render logic + reaction UI lives in src/components/smartCart/V3CartView.tsx
 * (shared across this page and /smart-cart/result/[cartId]). This file
 * exists only to adapt the Prisma SmartCart row to the V3CartView prop
 * shape and to set the heading/subhead for the free-beta context.
 */

import { V3CartView, type CartItemV3 } from '@/components/smartCart/V3CartView'

interface SmartCartRow {
  id: string
  photoChangedRecommendation: boolean | null
  cartJson: unknown
  cartItemsJsonWithPhotos: unknown
  changeSummaryJson: unknown
}

interface Props {
  cart: SmartCartRow
}

export function ResultView({ cart }: Props) {
  const items =
    ((cart.cartItemsJsonWithPhotos ?? cart.cartJson) as CartItemV3[]) ?? []

  // PR1 keeps the free-beta heading and renders email-save block under
  // the cart. The /smart-cart/result/[cartId] path passes different
  // copy + omits email-save (PR3 wires the paid claim flow there).
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <V3CartView
        cartId={cart.id}
        items={items}
        showEmailSave
        heading="Your home photo read"
      />
    </main>
  )
}
