'use client'

// v7.2.11 — page header that bridges buyer friction to cart contents.
//
// Mandatory section per spec. Connects the original signal (e.g. "the
// kitchen feels off") to the curated answer ("better access and less
// clutter may solve more than new cabinets would"). Uses per-scope
// content from result-page-content.ts.
//
// Context strip is short — Built for / Project / Cart fee / Estimated
// cart / Avoided spend (when meaningful). Avoided spend hides when
// potentialSavingsHigh < $50 (per spec).

import { useEffect } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import { getScopeHeaderContent } from '@/lib/result-page-content'
import { trackResultPageEvent } from '@/lib/analytics'
import { computeCartTotals } from '@/lib/cart-selection'

interface Props {
  cart: SmartCartV2Output
}

export default function SmartCartResultPageHeader({ cart }: Props) {
  const content = getScopeHeaderContent(cart.scopeVariantId)
  const showAvoided = cart.savings.potentialSavingsHigh >= 50
  // v7.2.15 — split core vs optional totals so the header stops claiming
  // "every pick" equals the core total.
  const totals = computeCartTotals(cart)
  const hasAddOns = totals.addOnHigh > 0

  useEffect(() => {
    trackResultPageEvent('result_header_view', {
      scope_variant_id: cart.scopeVariantId,
    })
  }, [cart.scopeVariantId])

  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wide text-[#1f3a2e] font-medium mb-2">
        Smart Cart
      </div>
      <h1 className="font-display text-3xl md:text-4xl text-[#1a1f1a] mb-3">
        {content.title}
      </h1>
      <p className="text-base text-[#1a1f1a]/85 max-w-3xl mb-5">
        {content.framing}
      </p>
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#1a1f1a]/75">
        <Item label="Built for" value={cart.scenarioLabel} />
        <Item label="Project" value={cart.scopeLabel} />
        <Item
          label="Cart fee"
          value={formatPrice(CONFIG.products.smartCart.priceUsd)}
        />
        <Item
          label="Core cart"
          value={formatPriceRange(totals.coreLow, totals.coreHigh)}
        />
        {hasAddOns && (
          <>
            <Item
              label="Optional add-ons"
              value={`+${formatPriceRange(totals.addOnLow, totals.addOnHigh)}`}
            />
            <Item
              label="All-in if every pick"
              value={formatPriceRange(totals.allInLow, totals.allInHigh)}
            />
          </>
        )}
        {showAvoided && (
          <Item
            label="Avoided spend"
            value={formatPriceRange(
              cart.savings.potentialSavingsLow,
              cart.savings.potentialSavingsHigh,
            )}
          />
        )}
      </dl>
      {hasAddOns && (
        <p className="mt-3 text-sm text-[#1a1f1a]/70 max-w-3xl">
          Recommended: start with the core cart and add only the optional
          items that match your home.
        </p>
      )}
      {SCOPE_USE_HELPER[cart.scopeVariantId] && (
        <p className="mt-1 text-sm text-[#1a1f1a]/70 max-w-3xl">
          {SCOPE_USE_HELPER[cart.scopeVariantId]}
        </p>
      )}
    </header>
  )
}

// v7.2.15 — scope-specific "use this cart when … skip it if …" helper.
// Only the two pilots have this today.
const SCOPE_USE_HELPER: Record<string, string> = {
  window_weatherization:
    'Use this cart when the windows are intact but drafty. Skip it if the frame is rotted, the glass is failed, or the sash does not operate.',
  basement_moisture_prep:
    'Use this cart to check whether the basement is ready for finishing. Skip it and call a pro if there is active water, visible mold, structural cracking, or recurring dampness.',
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[#1a1f1a]/55">{label}:</dt>
      <dd className="font-medium text-[#1a1f1a]">{value}</dd>
    </div>
  )
}
