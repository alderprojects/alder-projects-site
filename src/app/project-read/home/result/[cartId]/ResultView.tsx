'use client'

/**
 * v7.3.4-PR3.7 — Free-beta home-result wrapper around V3CartView.
 *
 * Reads routing signals (introText + needsCategoryClarification +
 * needsMorePhotos + clarificationFeatures) from changeSummaryJson set
 * by synthesizeCartV3 and passes them through so V3CartView renders
 * the right state (lanes vs clarification vs needs-more-photos).
 */

import {
  V3CartView,
  type CartItemV3,
  type ClarificationFeature,
} from '@/components/smartCart/V3CartView'

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

interface ChangeSummaryWithRouting {
  introText?: string | null
  needsCategoryClarification?: boolean
  needsMorePhotos?: boolean
  clarificationFeatures?: ClarificationFeature[]
  dominantCategory?: string | null
}

export function ResultView({ cart }: Props) {
  const items =
    ((cart.cartItemsJsonWithPhotos ?? cart.cartJson) as CartItemV3[]) ?? []
  const summary = (cart.changeSummaryJson ?? {}) as ChangeSummaryWithRouting

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <V3CartView
        cartId={cart.id}
        items={items}
        introText={summary.introText ?? null}
        needsCategoryClarification={summary.needsCategoryClarification ?? false}
        needsMorePhotos={summary.needsMorePhotos ?? false}
        clarificationFeatures={summary.clarificationFeatures ?? []}
        dominantCategory={summary.dominantCategory ?? null}
        showEmailSave
        heading="Your home photo read"
        showV75Footer
        uploadMoreHref="/project-read/home"
      />
    </main>
  )
}
