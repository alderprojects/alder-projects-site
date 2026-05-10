'use client'

// v7.2.11 — refund-prevention "Not quite right?" module. Quick chips
// to rebuild the cart, plus a single Adjust CTA.
//
// Chips fire analytics so we can see which mismatches drive respin.
// CTA defers to the existing CartActions respin flow already wired
// for v7.x.

import { useEffect } from 'react'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'
import CartActions from '../CartActions'

const ADJUST_CHIPS = [
  'Lower budget',
  'Higher quality',
  'More compact',
  'More durable',
  'More design-forward',
  'I already own some of this',
  'This is bigger than I thought',
] as const

export default function NotQuiteRight({ cart }: { cart: SmartCartV2Output }) {
  useEffect(() => {
    trackResultPageEvent('not_right_click', { cart_id: cart.cartId, view: true })
  }, [cart.cartId])
  return (
    <section className="bg-[#f5efe2]/60 border border-[#e8e3d4] rounded-xl p-5 md:p-6 mb-6">
      <h2 className="font-display text-xl text-[#1a1f1a] mb-2">Not quite right?</h2>
      <p className="text-sm text-[#1a1f1a]/75 mb-4">
        Tell us what to change and we&rsquo;ll rebuild your cart around your space, style, or budget.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ADJUST_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() =>
              trackResultPageEvent('adjust_cart_chip_click', {
                chip,
                cart_id: cart.cartId,
              })
            }
            className="text-sm px-3 py-1.5 rounded-full bg-white border border-[#e8e3d4] text-[#1a1f1a] hover:bg-[#f5efe2]"
          >
            {chip}
          </button>
        ))}
      </div>
      <CartActions
        cartId={cart.cartId}
        topic={cart.topic}
        initialScopeVariantId={cart.scopeVariantId}
        initialScenario={cart.scenario}
        respinCount={cart.respinCount ?? 0}
      />
    </section>
  )
}
