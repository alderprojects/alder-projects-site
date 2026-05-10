// v7.2.12 — "Why these picks?" section, now scope-aware.
//
// Reads value-prop chips from getValueProps() so the topic / scope
// can override the universal copy with project-specific framing.

import { getValueProps } from '@/lib/result-page-content'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'

export default function WhyThesePicks({ cart }: { cart: SmartCartV2Output }) {
  const props = getValueProps(cart.topic, cart.scopeVariantId)
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-5 md:p-6 mb-6">
      <h2 className="font-display text-xl text-[#1a1f1a] mb-3">Why these picks?</h2>
      {cart.smartCartPromise && (
        <p className="text-sm italic text-[#1a1f1a]/85 mb-4 pb-4 border-b border-[#e8e3d4]">
          {cart.smartCartPromise}
        </p>
      )}
      <ul className="grid sm:grid-cols-2 gap-3">
        {props.map(p => (
          <li key={p.title} className="text-sm">
            <strong className="text-[#1a1f1a]">{p.title}.</strong>{' '}
            <span className="text-[#1a1f1a]/75">{p.body}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
