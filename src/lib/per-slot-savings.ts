// v7.2.8 — per-slot savings derivation.
//
// Cart-level savings already exist (cart.savings.potentialSavings).
// Buyers asked for per-item savings on the recommended pick so the
// benefit is visible inline.
//
// We don't have a "typical-overbuy alternative" field per slot.
// Conservative derivation: when a slot offers a premium tier AND has
// authored whyNotPremium reasoning, the price differential between
// premium and sweet_spot is shown as "Saved by skipping premium."
//
// When no premium tier exists OR no whyNotPremium prose, return null
// and the chip simply doesn't render. Better silent than fabricated.

import type { CartSlot } from './smart-cart-model'

export interface PerSlotSavings {
  low: number
  high: number
  /** Short label, e.g. "vs premium tier". */
  comparedTo: string
}

export function computePerSlotSavings(slot: CartSlot): PerSlotSavings | null {
  const sweet = slot.tiers.sweet_spot
  const premium = slot.tiers.premium
  if (!premium) return null
  if (!slot.whyNotPremium) return null
  const lowDiff = premium.priceLow - sweet.priceLow
  const highDiff = premium.priceHigh - sweet.priceHigh
  if (lowDiff <= 0 && highDiff <= 0) return null
  return {
    low: Math.max(0, lowDiff),
    high: Math.max(0, highDiff),
    comparedTo: 'vs premium tier',
  }
}
