'use client'

/**
 * v7.3.4-PR3.6 — Free-beta basement-result wrapper around V3CartView.
 *
 * Reads introText (added in PR3.6) out of changeSummaryJson so the
 * commerce-moment intro renders. Otherwise identical to the prior
 * thin wrapper.
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
  const summary = (cart.changeSummaryJson ?? {}) as { introText?: string | null }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <V3CartView
        cartId={cart.id}
        items={items}
        introText={summary.introText ?? null}
        showEmailSave
        heading="Your home photo read"
        showV75Footer
      />
    </main>
  )
}
