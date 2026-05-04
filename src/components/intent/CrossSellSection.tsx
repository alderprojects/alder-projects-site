// CrossSellSection — bottom-of-page card linking to the other product.
// On Smart Cart pages, makes the upgrade math explicit. On Worth-It
// pages, frames Smart Cart as the lighter pick.

import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'

type Props = { fromProduct: 'smart_cart' | 'worth_it' }

export default function CrossSellSection({ fromProduct }: Props) {
  const smartCartPrice = CONFIG.products.smartCart.priceUsd
  const worthItPrice = CONFIG.products.worthIt.priceUsd
  const upgradeDelta = worthItPrice - smartCartPrice

  if (fromProduct === 'smart_cart') {
    return (
      <aside className="my-10 bg-[#1f3a2e] text-white rounded-xl p-6 md:p-8 grid md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-white/70 mb-2">
            Cross-sell
          </div>
          <h3 className="font-display text-xl mb-2">
            Already paid {formatPrice(smartCartPrice)} for Smart Cart?
          </h3>
          <p className="text-sm text-white/85">
            Upgrade to Worth-It for {formatPrice(upgradeDelta)} — same as
            paying {formatPrice(worthItPrice)} directly. Get the ranked plan,
            DIY stop line, and the alternate paths on top of your saved cart.
          </p>
        </div>
        <a
          href="/worth-it"
          className="bg-white text-[#1f3a2e] font-medium px-5 py-3 rounded-lg hover:bg-[#fbf8f1] inline-block text-center"
        >
          See Worth-It Plan →
        </a>
      </aside>
    )
  }

  // Worth-It → Smart Cart
  return (
    <aside className="my-10 bg-[#fbf8f1] border border-[#e8e3d4] rounded-xl p-6 md:p-8 grid md:grid-cols-3 gap-4 items-center">
      <div className="md:col-span-2">
        <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/55 mb-2">
          Cross-sell
        </div>
        <h3 className="font-display text-xl text-[#1f3a2e] mb-2">
          Smart Cart features are included with Worth-It.
        </h3>
        <p className="text-sm text-[#1a1f1a]/85">
          Want just the lean shopping list, the skip column, and the savings
          snapshot? Smart Cart is the lighter pick at {formatPrice(smartCartPrice)}.
        </p>
      </div>
      <a
        href="/smart-cart"
        className="bg-[#1f3a2e] text-white font-medium px-5 py-3 rounded-lg hover:bg-[#162a21] inline-block text-center"
      >
        See Smart Cart →
      </a>
    </aside>
  )
}
