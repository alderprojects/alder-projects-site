'use client'

// v7.2.11 — single product pick card.
//
// Image-first layout. Three reason chips max. ONE expandable
// "Why this one?" reveals a mini comparison (recommended vs cheaper
// vs premium). No per-card savings badge — savings live in the value
// banner only. No fake reviews or ratings.
//
// Tier label is a friendlier framing than the raw tier name:
//   sweet_spot → "Sweet-spot pick"
//   premium    → "Durable pick"
//   budget     → "Best value"

import { useState } from 'react'
import { formatPriceRange } from '@/lib/format'
import type { CartSlot, CartTier, CartTierVariant } from '@/lib/smart-cart-model'
import { resolveImageUrl } from '@/lib/smart-cart-images'
import { extractSpecChips } from '@/lib/result-page-content'
import { trackResultPageEvent } from '@/lib/analytics'
import ProductImage from './ProductImage'

interface Props {
  slot: CartSlot
  tier: CartTier
  index: number
  hero?: boolean
}

const TIER_LABEL_FRIENDLY: Record<CartTier, string> = {
  sweet_spot: 'Sweet-spot pick',
  premium: 'Durable pick',
  budget: 'Best value',
}

export default function ProductPickCard({ slot, tier, index, hero }: Props) {
  const [open, setOpen] = useState(false)
  const variant: CartTierVariant = slot.tiers[tier] ?? slot.tiers.sweet_spot
  const usedTier: CartTier = slot.tiers[tier] ? tier : 'sweet_spot'
  const imageUrl = resolveImageUrl(variant)
  const chips = extractSpecChips(variant.productSpec)

  function onExpand() {
    if (!open) {
      trackResultPageEvent('product_card_expand_why_this', {
        slot_id: slot.slotId,
      })
    }
    setOpen(o => !o)
  }

  return (
    <article
      className={`bg-white border border-[#e8e3d4] rounded-xl ${
        hero ? 'p-5 md:p-6' : 'p-4 md:p-5'
      }`}
    >
      <div className="flex gap-4 md:gap-5">
        <ProductImage
          src={imageUrl}
          alt={variant.productName}
          className={`object-contain rounded-lg bg-white border border-[#e8e3d4] flex-shrink-0 ${
            hero
              ? 'w-32 h-32 sm:w-40 sm:h-40'
              : 'w-24 h-24 sm:w-28 sm:h-28'
          }`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-[#1f3a2e] text-white inline-flex items-center justify-center text-xs font-medium flex-shrink-0">
              {index}
            </span>
            <span className="text-xs uppercase tracking-wide text-[#1a1f1a]/60 truncate">
              {slot.slotLabel}
            </span>
          </div>

          <h3
            className={`font-display text-[#1a1f1a] ${
              hero ? 'text-lg md:text-xl' : 'text-base'
            } mb-1`}
          >
            <a
              href={variant.affiliateUrl}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="hover:underline underline-offset-2"
              onClick={() =>
                trackResultPageEvent('retailer_click', {
                  slot_id: slot.slotId,
                  product_name: variant.productName,
                })
              }
            >
              {variant.productName}
            </a>
          </h3>

          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <span className="text-sm font-medium text-[#1a1f1a]">
              {formatPriceRange(variant.priceLow, variant.priceHigh)}
            </span>
            <span className="text-xs text-[#1f3a2e] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              {TIER_LABEL_FRIENDLY[usedTier]}
            </span>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {chips.map(c => (
                <span
                  key={c}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#f5efe2] text-[#1a1f1a]/85"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <a
              href={variant.affiliateUrl}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="inline-flex items-center bg-[#1f3a2e] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-[#162a21]"
              onClick={() =>
                trackResultPageEvent('retailer_click', {
                  slot_id: slot.slotId,
                  product_name: variant.productName,
                })
              }
            >
              View retailer →
            </a>
            <button
              onClick={onExpand}
              aria-expanded={open}
              className="inline-flex items-center text-sm text-[#1f3a2e] font-medium px-3 py-1.5 rounded-lg border border-[#e8e3d4] hover:bg-[#f5efe2]"
            >
              Why this one? {open ? '▴' : '▾'}
            </button>
          </div>
        </div>
      </div>

      {open && <WhyThisOne slot={slot} />}
    </article>
  )
}

function WhyThisOne({ slot }: { slot: CartSlot }) {
  const sweetSpot = slot.whyThis
  const cheaper = slot.whyNotCheaper
  const premium = slot.whyNotPremium
  return (
    <div className="mt-4 pt-4 border-t border-[#e8e3d4]">
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <Column
          label="This pick"
          tone="alder"
          body={sweetSpot}
          fallback="The best fit for most homes in this scope."
        />
        <Column
          label="Cheaper option"
          body={cheaper}
          fallback="The cheaper version isn't featured because it commonly under-delivers on this slot."
        />
        <Column
          label="Premium option"
          body={premium}
          fallback="The premium version isn't featured because the lift over this pick is small for most homes."
        />
      </div>
    </div>
  )
}

function Column({
  label,
  body,
  fallback,
  tone,
}: {
  label: string
  body?: string
  fallback: string
  tone?: 'alder'
}) {
  return (
    <div
      className={`rounded-md p-3 border ${
        tone === 'alder'
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-[#e8e3d4] bg-[#f5efe2]/40'
      }`}
    >
      <div
        className={`text-xs uppercase tracking-wide mb-1 font-medium ${
          tone === 'alder' ? 'text-emerald-900' : 'text-[#1a1f1a]/70'
        }`}
      >
        {label}
      </div>
      <p className="text-sm text-[#1a1f1a]/85 leading-snug">
        {body ?? fallback}
      </p>
    </div>
  )
}
