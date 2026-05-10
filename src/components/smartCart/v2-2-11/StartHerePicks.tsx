'use client'

// v7.2.11 — "Start here" hero picks. Top 2-3 core slots above the
// full list. Selection logic per spec:
//   1. First 2-3 core slots in catalog order
//   2. Prioritize slots with costBenefitClaim
//   3. Exclude addons
//   4. If fewer than 4 core slots total, render all here and skip
//      the full list (caller decides via slot count)

import { useEffect } from 'react'
import type { CartSlot, CartTier } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'
import ProductPickCard from './ProductPickCard'

interface Props {
  slots: CartSlot[]
  tier: CartTier
}

export function selectStartHere(coreSlots: CartSlot[]): CartSlot[] {
  if (coreSlots.length === 0) return []
  // Prefer slots with costBenefitClaim, preserving catalog order otherwise
  const withClaim = coreSlots.filter(s => s.costBenefitClaim)
  const without = coreSlots.filter(s => !s.costBenefitClaim)
  const ordered = [...withClaim, ...without]
  return ordered.slice(0, Math.min(3, coreSlots.length))
}

export default function StartHerePicks({ slots, tier }: Props) {
  const heroSlots = selectStartHere(slots)
  useEffect(() => {
    trackResultPageEvent('start_here_view', { count: heroSlots.length })
  }, [heroSlots.length])

  if (heroSlots.length === 0) return null

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-[#1a1f1a]">Start here</h2>
        <p className="text-sm text-[#1a1f1a]/75 mt-1">
          The first few picks most likely to move this project forward.
        </p>
      </div>
      <div className="space-y-4">
        {heroSlots.map((slot, i) => (
          <ProductPickCard
            key={slot.slotId}
            slot={slot}
            tier={tier}
            index={i + 1}
            hero
          />
        ))}
      </div>
    </section>
  )
}
