// v7.2.7 — top-of-body urgency banner.
//
// Renders when cart.urgencyBanner.daysRemaining < 30. Tone:
// public-data deadline (frost dates, opening season) — never fake
// stock counts or countdown timers.

import type { SmartCartV2Output } from '@/lib/smart-cart-model'

export default function UrgencyBanner({ cart }: { cart: SmartCartV2Output }) {
  const u = cart.urgencyBanner
  if (!u) return null
  if (typeof u.daysRemaining === 'number' && u.daysRemaining >= 30) return null
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
      <span aria-hidden>⏰</span>
      <div className="text-sm text-amber-900">
        <strong>{u.label}</strong>
        {typeof u.daysRemaining === 'number' && (
          <span className="ml-2 text-amber-900/75">
            ({u.daysRemaining} days until {u.deadline})
          </span>
        )}
      </div>
    </div>
  )
}
