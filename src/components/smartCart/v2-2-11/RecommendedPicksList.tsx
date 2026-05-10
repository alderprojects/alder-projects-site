'use client'

// v7.2.11 — full list of recommended picks. Collapsed by default if
// the cart has more than 4 core slots so first-time buyers don't get
// overwhelmed by 11 equal-weight items. The Start Here hero picks
// section above always shows; this is the "show all" continuation.

import { useEffect, useState } from 'react'
import type { CartSlot, CartTier } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'
import ProductPickCard from './ProductPickCard'

interface Props {
  slots: CartSlot[]
  tier: CartTier
  /**
   * Number of slots already shown in Start Here. Used to renumber
   * the cards in this list so badge numbers run continuously across
   * the page.
   */
  startHereCount: number
}

// v7.2.14 — raised from 4 to 8 so the paid result doesn't feel hidden.
// Carts up to 8 picks default-expand; > 8 still collapses with explicit
// "Show all N picks" toggle.
const COLLAPSE_THRESHOLD = 8

export default function RecommendedPicksList({
  slots,
  tier,
  startHereCount,
}: Props) {
  const totalCount = slots.length
  const [expanded, setExpanded] = useState(totalCount <= COLLAPSE_THRESHOLD)

  useEffect(() => {
    if (expanded && totalCount > COLLAPSE_THRESHOLD) {
      trackResultPageEvent('start_here_expand_to_full', { count: totalCount })
    }
    // only fire on the toggle, not on initial render for short carts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded])

  if (totalCount === 0) return null

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl text-[#1a1f1a]">All picks</h2>
        {totalCount > COLLAPSE_THRESHOLD && (
          <button
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            className="text-sm text-[#1f3a2e] font-medium hover:underline underline-offset-2"
          >
            {expanded
              ? 'Hide full list'
              : `Show all ${totalCount} picks`} {expanded ? '▴' : '▾'}
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-4">
          {slots.map((slot, i) => (
            <ProductPickCard
              key={slot.slotId}
              slot={slot}
              tier={tier}
              index={startHereCount + i + 1}
            />
          ))}
        </div>
      )}
    </section>
  )
}
