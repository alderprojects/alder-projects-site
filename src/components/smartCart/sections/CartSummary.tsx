// v7.2.7 — sticky right-sidebar cart summary.

import { formatPriceRange } from '@/lib/format'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'

interface Props {
  cart: SmartCartV2Output
  itemCount: number
}

export default function CartSummary({ cart, itemCount }: Props) {
  const { leanCartLow, leanCartHigh, potentialSavingsLow, potentialSavingsHigh } =
    cart.savings
  const savingsPositive = potentialSavingsHigh > 0
  return (
    <div className="bg-white border border-[#e8e3d4] rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-lg text-[#1a1f1a]">Cart summary</h3>
        <span className="text-xs text-[#1a1f1a]/65 px-2 py-0.5 rounded-full bg-[#f5efe2]">
          {itemCount} items
        </span>
      </div>
      <dl className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <dt className="text-[#1a1f1a]/75">Estimated total</dt>
          <dd className="font-medium">
            {formatPriceRange(leanCartLow, leanCartHigh)}
          </dd>
        </div>
        {savingsPositive && (
          <div className="flex justify-between">
            <dt className="text-[#1a1f1a]/75">Estimated savings</dt>
            <dd className="font-medium text-[#1f3a2e]">
              {formatPriceRange(potentialSavingsLow, potentialSavingsHigh)}
            </dd>
          </div>
        )}
      </dl>
      <p className="text-xs text-[#1a1f1a]/60">
        Estimates only. Final pricing varies by retailer and date.
      </p>
    </div>
  )
}
