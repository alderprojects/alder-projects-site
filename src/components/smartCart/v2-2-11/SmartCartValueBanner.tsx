'use client'

// v7.2.11 — fee justification banner.
//
// Anchors $19.99 fee to estimated avoided spend. When savings can't
// meaningfully justify the price (potentialSavingsHigh < $50), falls
// back to qualitative copy. "How we estimate this" expandable shows
// the savings buckets so buyers can see the math.
//
// Per-card "Saved $X vs premium" badges from v7.2.8 are removed —
// savings live here, not on every product card.

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'

interface Props {
  cart: SmartCartV2Output
}

const QUALITATIVE_THRESHOLD = 50

export default function SmartCartValueBanner({ cart }: Props) {
  const [methodologyOpen, setMethodologyOpen] = useState(false)
  const fee = CONFIG.products.smartCart.priceUsd
  const { potentialSavingsLow, potentialSavingsHigh, leanCartLow, leanCartHigh } =
    cart.savings
  const showAvoided = potentialSavingsHigh >= QUALITATIVE_THRESHOLD

  useEffect(() => {
    trackResultPageEvent('value_banner_view', {
      scope_variant_id: cart.scopeVariantId,
      avoided_high: potentialSavingsHigh,
    })
  }, [cart.scopeVariantId, potentialSavingsHigh])

  function onToggleMethodology() {
    if (!methodologyOpen) {
      trackResultPageEvent('savings_methodology_expand', {
        scope_variant_id: cart.scopeVariantId,
      })
    }
    setMethodologyOpen(o => !o)
  }

  return (
    <section className="bg-[#1f3a2e] text-white rounded-xl p-5 md:p-6 mb-8">
      <div className="grid md:grid-cols-3 gap-5 mb-3">
        <Stat label="Smart Cart fee" value={formatPrice(fee)} />
        <Stat
          label="Estimated cart total"
          value={formatPriceRange(leanCartLow, leanCartHigh)}
        />
        {showAvoided ? (
          <Stat
            label="Avoided spend"
            value={formatPriceRange(potentialSavingsLow, potentialSavingsHigh)}
          />
        ) : (
          <Stat label="Avoided spend" value="Hard to put a number on" />
        )}
      </div>

      <p className="text-sm text-white/90 mb-2">
        {showAvoided
          ? 'Pays for itself if you avoid one wrong item, one duplicate purchase, or one unnecessary upgrade.'
          : 'Designed to help avoid one wrong purchase or one extra trip.'}
      </p>

      <button
        onClick={onToggleMethodology}
        className="text-sm text-white/80 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-white/50 rounded"
        aria-expanded={methodologyOpen}
      >
        How we estimate this {methodologyOpen ? '▴' : '▾'}
      </button>

      {methodologyOpen && (
        <div className="mt-3 bg-white/5 rounded-md p-4 text-sm text-white/85 space-y-2">
          <p className="font-medium text-white/95">
            Avoided spend buckets we count:
          </p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Premium-tier picks the cart skips when sweet-spot is enough</li>
            <li>Duplicate or unnecessary products avoided</li>
            <li>Wrong-fit categories not bought before measuring</li>
            <li>Custom or remodel-level items deferred</li>
            <li>Lower-impact items skipped for now</li>
          </ul>
          <p className="text-white/65 italic">
            Estimated, not guaranteed. Final spend varies by retailer, date,
            and which picks you actually buy.
          </p>
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-white/65 mb-1">
        {label}
      </div>
      <div className="font-display text-xl md:text-2xl">{value}</div>
    </div>
  )
}
