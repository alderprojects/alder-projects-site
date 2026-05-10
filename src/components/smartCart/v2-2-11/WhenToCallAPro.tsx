'use client'

// v7.2.14 — "When to call a pro" trust callout.
//
// Renders the scope's routeOutRules as a section on the result page
// (only when the cart is NOT in active route-out mode). Tells the
// buyer what conditions mean the cart is the wrong tool — the same
// honesty signal that underwrites the brand thesis.

import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import { trackRouteOutClick } from '@/lib/analytics'

const DEST_LABEL: Record<string, string> = {
  worth_it: 'Worth-It Plan',
  small_pro: 'a small pro',
  contractor: 'a contractor',
  verify_first: 'verify before buying',
}

interface Props {
  cart: SmartCartV2Output
}

export default function WhenToCallAPro({ cart }: Props) {
  const rules = cart.routeOutRules ?? []
  if (rules.length === 0) return null

  return (
    <section className="my-8 rounded-xl border border-[#e8e3d4] bg-[#fbf8f1] p-5 md:p-6">
      <h2 className="font-display text-xl text-[#1a1f1a] mb-2">
        When to skip this cart and call a pro
      </h2>
      <p className="text-sm text-[#1a1f1a]/70 mb-4">
        This cart is NOT the right tool for the cases below. If any of these
        apply, skip the cart and talk to a pro first.
      </p>
      <ul className="space-y-3 text-sm text-[#1a1f1a]/85">
        {rules.map((r, i) => (
          <li
            key={i}
            className="border-l-2 border-[#C8732A] pl-3 leading-relaxed cursor-default"
            onClick={() =>
              trackRouteOutClick({
                scopeVariantId: cart.scopeVariantId,
                condition: r.condition,
                destination: r.destination,
                surface: 'result_page',
              })
            }
          >
            <span className="font-medium">
              {humanizeCondition(r.condition)}
            </span>
            <span className="text-[#1a1f1a]/65"> — </span>
            <span>{r.reason}</span>
            <span className="block text-xs uppercase tracking-wide text-[#1a1f1a]/50 mt-1">
              Route to: {DEST_LABEL[r.destination] ?? r.destination}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Convert snake_case state-flag conditions ("has_visible_mold",
// "considering_whole_house_treatment_no_test") to readable phrases.
function humanizeCondition(c: string): string {
  return c
    .replace(/_/g, ' ')
    .replace(/^has /, 'If you have ')
    .replace(/^considering /, 'If you are considering ')
    .replace(/^single /, 'If you have a single ')
    .replace(/^humidity /, 'If humidity ')
    .replace(/^lake /, 'If you ')
    .replace(/^cabinets /, 'If cabinets are ')
    .replace(/^cabinet /, 'If a cabinet is ')
    .replace(/^hardware /, 'If hardware ')
    .replace(/^dock /, 'If the dock ')
    .replace(/^planning /, 'If you are planning ')
    .replace(/\babove (\d+)/, 'above $1')
    .replace(/\bover (\d+)/, 'over $1')
    .replace(/\bsq ?ft\b/, 'sq ft')
    .replace(/^./, (c) => c.toUpperCase())
}
