// v7.2.7 — single recommended-pick card.
//
// Layout: numbered badge + image (left) + name/price/spec/chips (right)
// + "Why not the cheaper / premium" expandables.
//
// Compliance gates:
//   - No review counts or rating numbers (data not available)
//   - "Better than cheapest" only shown when budget tier exists
//   - "Skip premium unless..." only shown when premium tier exists
//   - costBenefitClaim shown when present (slot-level data)

import { formatPriceRange } from '@/lib/format'
import { TIER_LABEL } from '@/lib/smart-cart-model'
import type { CartSlot, CartTier, CartTierVariant } from '@/lib/smart-cart-model'
import { resolveImageUrl } from '@/lib/smart-cart-images'
import { extractSpecCallouts, sanitizeProductSpec } from '@/lib/spec-callouts'
import { computePerSlotSavings } from '@/lib/per-slot-savings'
import ProductImage from '../ProductImage'
import CategoryTag from '../chips/CategoryTag'
import BenefitChip from '../chips/BenefitChip'
import WarningChip from '../chips/WarningChip'

interface Props {
  slot: CartSlot
  tier: CartTier
  index: number
}

export default function RecommendedPickCard({ slot, tier, index }: Props) {
  const variant: CartTierVariant = slot.tiers[tier] ?? slot.tiers.sweet_spot
  const usedTier: CartTier = slot.tiers[tier] ? tier : 'sweet_spot'
  const imageUrl = resolveImageUrl(variant)
  const cleanSpec = sanitizeProductSpec(variant.productSpec)
  const callouts = extractSpecCallouts(variant.productSpec)
  const perSlotSavings = computePerSlotSavings(slot)
  const hasBudget = !!slot.tiers.budget
  const hasPremium = !!slot.tiers.premium

  return (
    <article className="border border-[#e8e3d4] rounded-lg p-5 bg-white">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="w-7 h-7 rounded-full bg-[#1f3a2e] text-white inline-flex items-center justify-center text-xs font-medium flex-shrink-0">
          {index}
        </span>
        <h3 className="font-display text-lg text-[#1a1f1a]">{slot.slotLabel}</h3>
      </div>

      <div className="ml-10 flex gap-4">
        <div className="relative flex-shrink-0">
          <ProductImage
            src={imageUrl}
            alt={variant.productName}
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md bg-white border border-[#e8e3d4]"
          />
          <CategoryTag imageUrl={imageUrl} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
            <a
              href={variant.affiliateUrl}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="text-[#1f3a2e] underline-offset-2 hover:underline font-medium"
            >
              {variant.productName}
            </a>
            <span className="text-sm text-[#1a1f1a]/85 whitespace-nowrap">
              {TIER_LABEL[usedTier]} ·{' '}
              {formatPriceRange(variant.priceLow, variant.priceHigh)}
            </span>
          </div>

          {cleanSpec && (
            <p className="text-sm italic text-[#1a1f1a]/75 mb-2">{cleanSpec}</p>
          )}

          {callouts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {callouts.map(c => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#f5efe2] text-[#1a1f1a]/80"
                >
                  <CheckMini /> {c}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-2">
            {perSlotSavings && (
              <BenefitChip
                label={`Saved ${formatPriceRange(perSlotSavings.low, perSlotSavings.high)} ${perSlotSavings.comparedTo}`}
              />
            )}
            {hasBudget && <BenefitChip label="Better than the cheapest" />}
            {hasPremium && slot.whyNotPremium && (
              <WarningChip label="Skip premium for most homes" />
            )}
            {slot.costBenefitClaim && <BenefitChip label={slot.costBenefitClaim} />}
          </div>
        </div>
      </div>

      <p className="ml-10 text-sm text-[#1a1f1a]/85 mt-3">{slot.whyThis}</p>

      {(slot.whyNotCheaper || slot.whyNotPremium) && (
        <div className="ml-10 space-y-2 mt-3">
          {slot.whyNotCheaper && (
            <details className="text-sm text-[#1a1f1a]/85">
              <summary className="cursor-pointer text-[#1f3a2e] underline-offset-2 hover:underline">
                Why not the cheaper one?
              </summary>
              <p className="mt-2 pl-3 border-l-2 border-[#e8e3d4]">{slot.whyNotCheaper}</p>
            </details>
          )}
          {slot.whyNotPremium && (
            <details className="text-sm text-[#1a1f1a]/85">
              <summary className="cursor-pointer text-[#1f3a2e] underline-offset-2 hover:underline">
                Why not the premium?
              </summary>
              <p className="mt-2 pl-3 border-l-2 border-[#e8e3d4]">{slot.whyNotPremium}</p>
            </details>
          )}
        </div>
      )}

      {slot.warnings && slot.warnings.length > 0 && (
        <div className="ml-10 space-y-1 mt-3">
          {slot.warnings.map(w => (
            <div
              key={w}
              className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-3 py-2 text-sm flex items-start gap-2"
            >
              <span aria-hidden>⚠</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {slot.contextNote && (
        <div className="ml-10 mt-3 bg-emerald-50/60 border border-emerald-200 text-emerald-900 rounded-md px-3 py-2 text-sm italic flex items-start gap-2">
          <span aria-hidden>🟢</span>
          <span>{slot.contextNote}</span>
        </div>
      )}

      {slot.vermontReasoning && (
        <p className="ml-10 mt-3 text-xs text-[#1a1f1a]/65 italic">
          Vermont context: {slot.vermontReasoning}
        </p>
      )}
    </article>
  )
}

function CheckMini() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  )
}
