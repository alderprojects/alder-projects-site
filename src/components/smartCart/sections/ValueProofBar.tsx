// v7.2.7 — top-of-body savings bar.
//
// Compliance gate: only render when the cart's high-side savings
// estimate exceeds the product price. If projected savings can't even
// cover the $19.99 cost, we don't show a "designed to save" claim.

import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'

export default function ValueProofBar({ cart }: { cart: SmartCartV2Output }) {
  const { potentialSavingsLow, potentialSavingsHigh } = cart.savings
  const productPrice = CONFIG.products.smartCart.priceUsd
  if (potentialSavingsHigh < productPrice) return null
  return (
    <div className="bg-[#1f3a2e] text-white rounded-lg px-5 py-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="flex items-center gap-2 text-sm">
        <CheckIcon />
        <span>Designed to save more than {formatPrice(productPrice)} before checkout.</span>
      </div>
      <div className="text-sm">
        Estimated savings on this cart:{' '}
        <strong>{formatPriceRange(potentialSavingsLow, potentialSavingsHigh)}</strong>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 6.8-6.8 1.4 1.4-8.2 8.2z" />
    </svg>
  )
}
