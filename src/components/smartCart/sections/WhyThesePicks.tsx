// v7.2.7 — sidebar value-prop card.
//
// 4 chips describe Smart Cart as a product (always true). Catalog's
// smartCartPromise renders as an optional context line above the
// chips when present.

import { SMART_CART_VALUE_PROPS } from '@/lib/result-page-content'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'

export default function WhyThesePicks({ cart }: { cart: SmartCartV2Output }) {
  return (
    <div className="bg-white border border-[#e8e3d4] rounded-xl p-5">
      <h3 className="font-display text-lg text-[#1a1f1a] mb-3">Why these picks?</h3>
      {cart.smartCartPromise && (
        <p className="text-sm italic text-[#1a1f1a]/85 mb-3 pb-3 border-b border-[#e8e3d4]">
          {cart.smartCartPromise}
        </p>
      )}
      <ul className="space-y-2">
        {SMART_CART_VALUE_PROPS.map(p => (
          <li key={p.title} className="text-sm">
            <strong className="text-[#1a1f1a]">{p.title}.</strong>{' '}
            <span className="text-[#1a1f1a]/75">{p.body}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
