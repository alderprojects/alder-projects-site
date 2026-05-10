'use client'

// v7.2.11 — "Add only if needed" addon section. Visually distinct
// from core picks — these are conditional, not first-line.
//
// Per spec: each card shows "Add if" and "Skip if" hints derived from
// available slot fields (contextNote / slotPurpose for "add if";
// warnings / whenToSkip for "skip if"). When fields are missing, the
// card falls back to a simpler version with just whyThis.

import type { CartSlot, CartTier } from '@/lib/smart-cart-model'
import { formatPriceRange } from '@/lib/format'
import { resolveImageUrl } from '@/lib/smart-cart-images'
import ProductImage from './ProductImage'

interface Props {
  slots: CartSlot[]
  tier: CartTier
}

export default function AddOnlyIfNeeded({ slots, tier }: Props) {
  if (slots.length === 0) return null
  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="font-display text-xl text-[#1a1f1a]">Add only if needed</h2>
        <p className="text-sm text-[#1a1f1a]/75 mt-1">
          Useful in some homes, skippable in others.
        </p>
      </div>
      <ul className="space-y-3">
        {slots.map(slot => (
          <AddOnRow key={slot.slotId} slot={slot} tier={tier} />
        ))}
      </ul>
    </section>
  )
}

function AddOnRow({ slot, tier }: { slot: CartSlot; tier: CartTier }) {
  const variant = slot.tiers[tier] ?? slot.tiers.sweet_spot
  const imageUrl = resolveImageUrl(variant)
  const addIf = slot.contextNote ?? slot.slotPurpose ?? null
  const skipIf =
    slot.warnings && slot.warnings.length > 0 ? slot.warnings[0] : null
  return (
    <li className="bg-white border border-[#e8e3d4] rounded-lg p-4 flex gap-3">
      <ProductImage
        src={imageUrl}
        alt={variant.productName}
        className="w-16 h-16 object-contain rounded bg-white border border-[#e8e3d4] flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <a
            href={variant.affiliateUrl}
            target="_blank"
            rel="noopener nofollow sponsored"
            className="font-medium text-[#1f3a2e] hover:underline truncate"
          >
            {variant.productName}
          </a>
          <span className="text-sm whitespace-nowrap">
            {formatPriceRange(variant.priceLow, variant.priceHigh)}
          </span>
        </div>
        <p className="text-sm text-[#1a1f1a]/80 mb-2">{slot.whyThis}</p>
        <div className="space-y-1 text-xs">
          {addIf && (
            <div className="text-[#1f3a2e]">
              <span className="font-medium">Add if:</span>{' '}
              <span className="text-[#1a1f1a]/85">{addIf}</span>
            </div>
          )}
          {skipIf && (
            <div className="text-amber-900">
              <span className="font-medium">Skip if:</span>{' '}
              <span className="text-[#1a1f1a]/85">{skipIf}</span>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
