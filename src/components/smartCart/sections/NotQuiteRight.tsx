// v7.2.7 — sidebar "adjust your cart" link.

import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import CartActions from '../CartActions'

export default function NotQuiteRight({ cart }: { cart: SmartCartV2Output }) {
  return (
    <div className="bg-[#f5efe2] border border-[#e8e3d4] rounded-xl p-5">
      <h3 className="font-display text-base text-[#1a1f1a] mb-2">Not quite right?</h3>
      <p className="text-sm text-[#1a1f1a]/75 mb-3">
        Adjust your selections to better fit your space, style, or budget.
      </p>
      <CartActions
        cartId={cart.cartId}
        topic={cart.topic}
        initialScopeVariantId={cart.scopeVariantId}
        initialScenario={cart.scenario}
        respinCount={cart.respinCount ?? 0}
      />
    </div>
  )
}
