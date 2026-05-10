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

interface Props {
  cart: SmartCartV2Output
}

export default function SmartCartResultPageHeader({ cart }: Props) {
  const content = getScopeHeaderContent(cart.scopeVariantId)
  const showAvoided = cart.savings.potentialSavingsHigh >= 50

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
          label="Estimated cart"
          value={formatPriceRange(
            cart.savings.leanCartLow,
            cart.savings.leanCartHigh,
          )}
        />
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
    </header>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[#1a1f1a]/55">{label}:</dt>
      <dd className="font-medium text-[#1a1f1a]">{value}</dd>
    </div>
  )
}
