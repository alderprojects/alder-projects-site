// v7.2.7 — recommended picks list.

import type { CartSlot, CartTier } from '@/lib/smart-cart-model'
import RecommendedPickCard from './RecommendedPickCard'

interface Props {
  slots: CartSlot[]
  tier: CartTier
}

export default function RecommendedPicksSection({ slots, tier }: Props) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-[#1f3a2e] text-white flex items-center justify-center font-display text-base">
          1
        </span>
        <h2 className="font-display text-xl text-[#1a1f1a]">Buy these together</h2>
      </div>
      <div className="space-y-4">
        {slots.map((slot, i) => (
          <RecommendedPickCard key={slot.slotId} slot={slot} tier={tier} index={i + 1} />
        ))}
      </div>
    </section>
  )
}
