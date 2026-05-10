'use client'

// v7.2.12 — single product pick card.
//
// Image-first layout. Three reason chips max. ONE expandable
// "Why this one?" reveals a tier drawer with REAL budget/premium
// product names + retailer links per the v7.2.12 spec, plus a
// scope-aware "measure first" reminder for fit-sensitive products.
// Selection checkbox top-right wires into the cart-selection
// context for multi-select buy.

import { useState } from 'react'
import { formatPriceRange } from '@/lib/format'
import type { CartSlot, CartTier, CartTierVariant } from '@/lib/smart-cart-model'
import { resolveImageUrl } from '@/lib/smart-cart-images'
import {
  extractSpecChips,
  getMeasurementReminder,
} from '@/lib/result-page-content'
import { trackResultPageEvent, type ResultPageEvent } from '@/lib/analytics'
import ProductImage from './ProductImage'
import SelectionCheckbox from './SelectionCheckbox'
import { useOptionalCartSelectionContext } from './CartSelectionContext'

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
  const ctx = useOptionalCartSelectionContext()
  const variant: CartTierVariant = slot.tiers[tier] ?? slot.tiers.sweet_spot
  const usedTier: CartTier = slot.tiers[tier] ? tier : 'sweet_spot'
  const imageUrl = resolveImageUrl(variant)
  const chips = extractSpecChips(variant.productSpec)
  const isSelected = ctx ? ctx.isSelected(slot.slotId) : true

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
      className={`bg-white border rounded-xl transition-colors ${
        hero ? 'p-5 md:p-6' : 'p-4 md:p-5'
      } ${
        isSelected
          ? 'border-[#e8e3d4]'
          : 'border-[#e8e3d4] bg-[#fbf8f1]/60 opacity-75'
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
          <div className="flex items-start gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-[#1f3a2e] text-white inline-flex items-center justify-center text-xs font-medium flex-shrink-0">
              {index}
            </span>
            <span className="text-xs uppercase tracking-wide text-[#1a1f1a]/60 truncate flex-1 mt-0.5">
              {slot.slotLabel}
            </span>
            <SelectionCheckbox
              slotId={slot.slotId}
              ariaLabel={variant.productName}
              size={hero ? 'hero' : 'default'}
            />
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
  // v7.2.12 spec — budget/premium PRODUCTS shown in the drawer, not just
  // reasoning. Buyers (across all topics) trust the recommendation more
  // when they can see what was rejected by name and price.
  const ctx = useOptionalCartSelectionContext()
  const budgetVariant = slot.tiers.budget
  const premiumVariant = slot.tiers.premium
  const sweetVariant = slot.tiers.sweet_spot
  const measurementReminder = getMeasurementReminder(
    ctx?.cartTopic,
    ctx?.cartScopeVariantId,
  )

  return (
    <div className="mt-4 pt-4 border-t border-[#e8e3d4]">
      <p className="text-xs text-[#1a1f1a]/70 mb-3 leading-snug">
        Not every home needs the same tier. Alder picks the middle path
        unless budget, finish, or durability matter more for your project.
      </p>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <TierColumn
          label="Cheaper option"
          variant={budgetVariant}
          slotId={slot.slotId}
          fallback={slot.whyNotCheaper}
          fallbackDefault="No cheaper version we'd recommend — most under-deliver on this job."
          ctaLabel="View cheaper"
          eventName="product_tier_budget_click"
        />
        <TierColumn
          label="Alder picks this"
          tone="alder"
          variant={sweetVariant}
          slotId={slot.slotId}
          fallback={slot.whyThis}
          fallbackDefault="Best balance of fit, quality, and price for most homes."
          ctaLabel="View recommended"
          eventName="product_tier_recommended_click"
          isRecommended
        />
        <TierColumn
          label="Premium option"
          variant={premiumVariant}
          slotId={slot.slotId}
          fallback={slot.whyNotPremium}
          fallbackDefault="Nicer materials but the lift is small for most homes."
          ctaLabel="View premium"
          eventName="product_tier_premium_click"
        />
      </div>
      {hasMeasurementSensitiveSpec(sweetVariant?.productSpec) && (
        <p className="mt-3 text-xs text-[#a44e2c] flex items-start gap-1.5">
          <span aria-hidden="true">📏</span>
          <span>{measurementReminder}</span>
        </p>
      )}
    </div>
  )
}

function TierColumn({
  label,
  variant,
  slotId,
  fallback,
  fallbackDefault,
  ctaLabel,
  eventName,
  tone,
  isRecommended,
}: {
  label: string
  variant?: CartTierVariant
  slotId: string
  fallback?: string
  fallbackDefault: string
  ctaLabel: string
  eventName: ResultPageEvent
  tone?: 'alder'
  isRecommended?: boolean
}) {
  const reasoning = fallback ?? fallbackDefault

  return (
    <div
      className={`rounded-md p-3 border ${
        tone === 'alder'
          ? 'border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-200'
          : 'border-[#e8e3d4] bg-white/60'
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-wide mb-1.5 font-semibold ${
          tone === 'alder' ? 'text-emerald-900' : 'text-[#1a1f1a]/60'
        }`}
      >
        {label}
      </div>
      {variant ? (
        <>
          <div className="text-sm font-medium text-[#1a1f1a] mb-0.5 leading-snug">
            {variant.productName}
          </div>
          <div className="text-xs text-[#1a1f1a]/70 mb-2">
            {formatPriceRange(variant.priceLow, variant.priceHigh)}
          </div>
          <p className="text-xs text-[#1a1f1a]/80 leading-snug mb-2.5">
            {reasoning}
          </p>
          {variant.affiliateUrl && (
            <a
              href={variant.affiliateUrl}
              target="_blank"
              rel="noopener nofollow sponsored"
              className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded ${
                isRecommended
                  ? 'bg-[#1f3a2e] text-white hover:bg-[#162a21]'
                  : 'border border-[#e8e3d4] text-[#1f3a2e] hover:bg-[#f5efe2]'
              }`}
              onClick={() =>
                trackResultPageEvent(eventName, {
                  slot_id: slotId,
                  product_name: variant.productName,
                })
              }
            >
              {ctaLabel} →
            </a>
          )}
        </>
      ) : (
        <p className="text-xs text-[#1a1f1a]/70 leading-snug italic">
          {reasoning}
        </p>
      )}
    </div>
  )
}

// Detects measurement-sensitive products by scanning productSpec for
// dimension language. Used to surface a "measure first" reminder at
// the decision moment — wrong-fit purchases are the #1 return reason
// across kitchen, outdoor, freeze prevention, mudroom, and safety.
function hasMeasurementSensitiveSpec(spec?: string): boolean {
  if (!spec) return false
  const s = spec.toLowerCase()
  return (
    /\d+(?:\.\d+)?\s*(?:to|–|-)\s*\d+(?:\.\d+)?\s*(?:inch|"|in\b|ft\b|feet)/i.test(s) ||
    /\b\d+(?:\.\d+)?\s*(?:inch|"|in\b|ft\b|feet|foot|cm|mm)/i.test(s) ||
    /\b\d+\/\d+\s*(?:inch|"|in\b|OD|ID)/i.test(s) ||
    /\bfits?\b.*(?:inch|drawer|cabinet|pipe|window|door|hose|bib)/i.test(s) ||
    /\bsized\b.*\d/i.test(s) ||
    /\bcover(s|age)?\b.*\d/i.test(s) ||
    /\bcapacity\b/i.test(s) ||
    /\bexpand(s|able|ing)?\b/i.test(s) ||
    /\b\d+[\d,]*\s*sq\s*\.?\s*(?:ft|feet|m)/i.test(s) ||
    /\b\d+(?:\.\d+)?\s*(?:gallon|gal\b|liter|qt|quart|pint)/i.test(s)
  )
}
