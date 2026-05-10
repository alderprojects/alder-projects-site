'use client'

// v7.2.11 — modal that surfaces every recommended product with a
// direct "Buy on retailer" CTA. Triggered by the primary CTA in the
// sidebar / mobile bottom sheet. Each row links to the variant's
// affiliateUrl in a new tab.

import { useEffect } from 'react'
import { formatPriceRange } from '@/lib/format'
import { TIER_LABEL } from '@/lib/smart-cart-model'
import type { CartSlot, CartTier } from '@/lib/smart-cart-model'
import { resolveImageUrl } from '@/lib/smart-cart-images'
import { trackResultPageEvent } from '@/lib/analytics'
import ProductImage from './ProductImage'

interface Props {
  open: boolean
  onClose: () => void
  slots: CartSlot[]
  tier: CartTier
  cartId: string
}

export default function RetailerBuyModal({ open, onClose, slots, tier, cartId }: Props) {
  useEffect(() => {
    if (!open) return
    trackResultPageEvent('retailer_modal_open', { cart_id: cartId })
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, cartId])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retailer-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-[#e8e3d4]">
          <h2 id="retailer-modal-title" className="font-display text-xl text-[#1a1f1a]">
            Buy your picks
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#1a1f1a]/65 hover:text-[#1a1f1a] text-2xl leading-none"
          >
            ×
          </button>
        </header>

        <ul className="flex-1 overflow-y-auto p-5 space-y-3">
          {slots.map(slot => {
            const v = slot.tiers[tier] ?? slot.tiers.sweet_spot
            const usedTier: CartTier = slot.tiers[tier] ? tier : 'sweet_spot'
            const imageUrl = resolveImageUrl(v)
            return (
              <li
                key={slot.slotId}
                className="flex items-center gap-3 border border-[#e8e3d4] rounded-lg p-3"
              >
                <ProductImage
                  src={imageUrl}
                  alt={v.productName}
                  className="w-16 h-16 object-contain rounded bg-white border border-[#e8e3d4] flex-shrink-0"
                  showRepresentativeTag={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#1a1f1a] truncate">
                    {v.productName}
                  </div>
                  <div className="text-xs text-[#1a1f1a]/65">
                    {TIER_LABEL[usedTier]} ·{' '}
                    {formatPriceRange(v.priceLow, v.priceHigh)}
                  </div>
                </div>
                <a
                  href={v.affiliateUrl}
                  target="_blank"
                  rel="noopener nofollow sponsored"
                  className="bg-[#1f3a2e] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#162a21] whitespace-nowrap flex-shrink-0"
                  onClick={() =>
                    trackResultPageEvent('retailer_modal_product_click', {
                      cart_id: cartId,
                      slot_id: slot.slotId,
                    })
                  }
                >
                  Buy →
                </a>
              </li>
            )
          })}
        </ul>

        <footer className="p-4 text-xs text-[#1a1f1a]/55 border-t border-[#e8e3d4]">
          Affiliate links open in a new tab. Prices vary by retailer and date.
        </footer>
      </div>
    </div>
  )
}
