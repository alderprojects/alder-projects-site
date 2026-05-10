// v7.2.11 — "Why these picks?" practical-rationale section.
//
// Catalog smartCartPromise (when present) sits above 5 always-true
// chips that describe how Alder builds Smart Cart. No "Vermont
// context" heading; Vermont language flows through scope-specific
// header framing instead.

import { SMART_CART_VALUE_PROPS } from '@/lib/result-page-content'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'

export default function WhyThesePicks({ cart }: { cart: SmartCartV2Output }) {
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-5 md:p-6 mb-6">
      <h2 className="font-display text-xl text-[#1a1f1a] mb-3">Why these picks?</h2>
      {cart.smartCartPromise && (
        <p className="text-sm italic text-[#1a1f1a]/85 mb-4 pb-4 border-b border-[#e8e3d4]">
          {cart.smartCartPromise}
        </p>
      )}
      <ul className="grid sm:grid-cols-2 gap-3">
        {SMART_CART_VALUE_PROPS.map(p => (
          <li key={p.title} className="text-sm">
            <strong className="text-[#1a1f1a]">{p.title}.</strong>{' '}
            <span className="text-[#1a1f1a]/75">{p.body}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
