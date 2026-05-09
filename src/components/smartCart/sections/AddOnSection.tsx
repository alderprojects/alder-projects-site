// v7.2.7 — add-ons (optional picks). Same shape as previous version
// but pulled into its own file for the refactored layout.

import { formatPriceRange } from '@/lib/format'
import type { CartSlot, CartTier } from '@/lib/smart-cart-model'
import { resolveImageUrl } from '@/lib/smart-cart-images'
import ProductImage from '../ProductImage'
import CategoryTag from '../chips/CategoryTag'

interface Props {
  slots: CartSlot[]
  tier: CartTier
}

export default function AddOnSection({ slots, tier }: Props) {
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-[#1f3a2e] text-white flex items-center justify-center font-display text-base">
          2
        </span>
        <h2 className="font-display text-xl text-[#1a1f1a]">Add-ons (optional)</h2>
      </div>
      <ul className="space-y-3">
        {slots.map(slot => {
          const variant = slot.tiers[tier] ?? slot.tiers.sweet_spot
          const imageUrl = resolveImageUrl(variant)
          return (
            <li
              key={slot.slotId}
              className="flex items-start gap-3 border-b border-[#e8e3d4] pb-3 last:border-0"
            >
              <div className="relative flex-shrink-0">
                <ProductImage
                  src={imageUrl}
                  alt={variant.productName}
                  className="w-14 h-14 object-contain rounded bg-white border border-[#e8e3d4]"
                />
                <CategoryTag imageUrl={imageUrl} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <a
                    href={variant.affiliateUrl}
                    target="_blank"
                    rel="noopener nofollow sponsored"
                    className="font-medium text-[#1f3a2e] hover:underline"
                  >
                    {variant.productName}
                  </a>
                  <p className="text-sm text-[#1a1f1a]/80 mt-1">{slot.whyThis}</p>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {formatPriceRange(variant.priceLow, variant.priceHigh)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
