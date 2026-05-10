'use client'

// v7.2.11 — fee justification banner.
//
// Anchors $19.99 fee to estimated avoided spend. When savings can't
// meaningfully justify the price (potentialSavingsHigh < $50), falls
// back to qualitative copy. "How we estimate this" expandable shows
// the savings buckets so buyers can see the math.
//
// v7.2.12 — when the buyer has customized their selection, the
// "If you bought every pick" stat tile flips to show "Your selection"
// with the partial total. Center-tile label flips by selection state.

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'
import { computeCartTotals, computeSelectedTotalRange } from '@/lib/cart-selection'
import { useOptionalCartSelectionContext } from './CartSelectionContext'

interface Props {
  cart: SmartCartV2Output
}

const QUALITATIVE_THRESHOLD = 50

// v7.2.15 — scope-keyed "project deferral" framing. The big-number ceiling
// in the savings line was reading as marketing because it conflated
// avoided-overbuying with "if you don't end up replacing windows" upside.
// Split it: avoided overbuy stays on the cart line; deferral reads as a
// conditional. Empty entries fall through to a generic disclaimer.
const DEFERRAL_COPY: Record<
  string,
  { headline: string; body: string }
> = {
  window_weatherization: {
    headline: 'Possibly deferring a major project: $1,000+',
    body:
      'Only if your windows turn out to be intact-but-drafty after the diagnostic step. Replacement runs $800–$1,500/window; weatherization buys you a winter to decide.',
  },
  basement_moisture_prep: {
    headline: 'Possibly deferring a major project: $1,000+',
    body:
      'Only if the diagnostic surfaces a moisture problem that would have been walled in. Catching it now beats discovering a $20–50k finished basement is wet six months in.',
  },
}

export default function SmartCartValueBanner({ cart }: Props) {
  const [methodologyOpen, setMethodologyOpen] = useState(false)
  const selection = useOptionalCartSelectionContext()
  const fee = CONFIG.products.smartCart.priceUsd
  const { potentialSavingsLow, potentialSavingsHigh } = cart.savings
  const showAvoided = potentialSavingsHigh >= QUALITATIVE_THRESHOLD
  // v7.2.15 — derive core/addon/all-in totals from slot tiers so this banner
  // shows the same numbers as the header and the sidebar.
  const totals = computeCartTotals(cart)
  const hasAddOns = totals.addOnHigh > 0

  const showSelected = selection?.customized ?? false
  const selectedRange =
    selection && showSelected
      ? computeSelectedTotalRange(
          cart.slots,
          selection.selectedMap,
          cart.selectedTier,
        )
      : null
  const selectedCount = selection?.selectedCount ?? 0

  // v7.2.13 — Real skip examples for the methodology dropdown.
  // SkipItemV2.amountSaved is { low, high } | undefined; we format as
  // a price range string for display.
  const skipExamples = (cart.skipList ?? [])
    .filter(s => !!s.amountSaved)
    .slice(0, 5)

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
        {showSelected && selectedRange ? (
          <Stat
            label="Your selection"
            value={
              selectedCount === 0
                ? '—'
                : formatPriceRange(selectedRange.low, selectedRange.high)
            }
            caption={`${selectedCount} of ${cart.slots.length} picks · all-in ${formatPriceRange(totals.allInLow, totals.allInHigh)}`}
          />
        ) : (
          <Stat
            label="Core cart"
            value={formatPriceRange(totals.coreLow, totals.coreHigh)}
            caption={
              hasAddOns
                ? `Optional add-ons: +${formatPriceRange(totals.addOnLow, totals.addOnHigh)} · all-in ${formatPriceRange(totals.allInLow, totals.allInHigh)}`
                : 'Most buyers pick 3–5'
            }
          />
        )}
        {showAvoided ? (
          <Stat
            label="Overbuying on this project"
            value={formatPriceRange(potentialSavingsLow, potentialSavingsHigh)}
            caption="Sum of skipped-item ranges from this cart."
          />
        ) : (
          <Stat
            label="Overbuying on this project"
            value="Hard to put a number on"
          />
        )}
      </div>

      {DEFERRAL_COPY[cart.scopeVariantId] && (
        <div className="mt-1 mb-3 rounded-md bg-white/10 p-3 text-sm text-white/90">
          <div className="font-medium text-white/95">
            {DEFERRAL_COPY[cart.scopeVariantId].headline}
          </div>
          <p className="mt-1 text-white/80 leading-snug">
            {DEFERRAL_COPY[cart.scopeVariantId].body}
          </p>
        </div>
      )}

      <p className="text-sm text-white/90 mb-2">
        {showAvoided
          ? 'Pays for itself if you avoid one wrong item, one duplicate purchase, or one unnecessary upgrade.'
          : 'Designed to help avoid one wrong purchase or one extra trip.'}
      </p>

      <p className="text-xs text-white/65 italic mb-2">
        Savings are avoided-overbuying estimates, not guaranteed rebates.
        Bigger numbers usually mean: do the low-cost diagnostic step before
        committing to the expensive project.
      </p>

      <button
        onClick={onToggleMethodology}
        className="text-sm text-white/80 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-white/50 rounded"
        aria-expanded={methodologyOpen}
      >
        How we estimate this {methodologyOpen ? '▴' : '▾'}
      </button>

      {methodologyOpen && (
        <div className="mt-3 bg-white/5 rounded-md p-4 text-sm text-white/85 space-y-3">
          <p className="font-medium text-white/95">How we estimate avoided spend:</p>
          <p className="text-white/80 leading-snug">
            Alder compares your recommended cart against common overbuy paths —
            premium kits or custom versions you don&rsquo;t need yet, duplicate
            organizers or tools, wrong-fit products that often get returned,
            and remodel-level purchases before the small fix is tested.
          </p>
          {skipExamples.length > 0 && (
            <>
              <p className="font-medium text-white/95 pt-1">Skipped in this cart:</p>
              <ul className="space-y-1 list-disc list-inside text-white/80">
                {skipExamples.map(s => (
                  <li key={s.id}>
                    <span>{s.title}</span>
                    {s.amountSaved && (
                      <span className="text-white/65">
                        {' '}— avoided ~{formatPriceRange(s.amountSaved.low, s.amountSaved.high)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="text-white/65 italic text-xs pt-1">
            Avoided spend is estimated from skipped categories and common
            overbuy paths. Your actual savings depends on what you would have
            bought otherwise.
          </p>
        </div>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
  caption,
}: {
  label: string
  value: string
  caption?: string
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-white/65 mb-1">
        {label}
      </div>
      <div className="font-display text-xl md:text-2xl">{value}</div>
      {caption && (
        <div className="text-xs text-white/60 mt-1">{caption}</div>
      )}
    </div>
  )
}
