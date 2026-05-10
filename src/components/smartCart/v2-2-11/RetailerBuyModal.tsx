'use client'

// v7.2.11 — modal that surfaces every recommended product with a
// direct "Buy on retailer" CTA.
//
// v7.2.12 — receives ONLY the selected slots (filtering happens in
// CartSummarySidebar). Adds a bulk "Open all on Amazon" action that
// fires window.open() for each affiliateUrl synchronously inside
// the click handler so popup blockers allow multi-tab opens.
// Browsers may still block 2nd+ window.open if popups are disabled —
// fallback view shows manual click-through links for blocked tabs.
// Empty state when selection is zero.

import { useEffect, useRef, useState } from 'react'
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

export default function RetailerBuyModal({
  open,
  onClose,
  slots,
  tier,
  cartId,
}: Props) {
  const [bulkResult, setBulkResult] = useState<BulkOpenResult | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    setBulkResult(null)
    trackResultPageEvent('retailer_modal_open', {
      cart_id: cartId,
      selected_count: slots.length,
    })
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, cartId, slots.length])

  if (!open) return null

  function onBulkOpen() {
    // CRITICAL: this must run synchronously inside the click handler.
    // Browser popup blockers allow multiple window.open() calls only
    // when they all originate from a single user gesture. Any await
    // or setTimeout breaks that and 2nd-and-beyond opens get blocked.
    const blocked: CartSlot[] = []
    const opened: CartSlot[] = []
    for (const slot of slots) {
      const v = slot.tiers[tier] ?? slot.tiers.sweet_spot
      if (!v?.affiliateUrl) {
        blocked.push(slot)
        continue
      }
      const win = window.open(v.affiliateUrl, '_blank', 'noopener,noreferrer')
      if (win) {
        opened.push(slot)
      } else {
        blocked.push(slot)
      }
    }
    trackResultPageEvent('retailer_modal_bulk_open', {
      cart_id: cartId,
      opened_count: opened.length,
      blocked_count: blocked.length,
      total_count: slots.length,
    })
    setBulkResult({ opened, blocked })
  }

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
          <div>
            <h2
              id="retailer-modal-title"
              className="font-display text-xl text-[#1a1f1a]"
            >
              Buy your picks
            </h2>
            <p className="text-xs text-[#1a1f1a]/65 mt-0.5">
              {slots.length === 0
                ? 'No items selected yet.'
                : `${slots.length} item${slots.length === 1 ? '' : 's'} selected. View budget or premium alternatives inside each item card.`}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="text-[#1a1f1a]/65 hover:text-[#1a1f1a] text-2xl leading-none"
          >
            ×
          </button>
        </header>

        {slots.length === 0 ? (
          <EmptyState onClose={onClose} />
        ) : bulkResult ? (
          <BulkResultView
            result={bulkResult}
            tier={tier}
            cartId={cartId}
            onDone={onClose}
            onReset={() => setBulkResult(null)}
          />
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto p-5 space-y-3">
              {slots.map(slot => {
                const v = slot.tiers[tier] ?? slot.tiers.sweet_spot
                const usedTier: CartTier = slot.tiers[tier]
                  ? tier
                  : 'sweet_spot'
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

            <footer className="border-t border-[#e8e3d4] p-4 space-y-3">
              {slots.length > 1 && (
                <button
                  onClick={onBulkOpen}
                  className="w-full bg-[#1f3a2e] text-white font-medium py-3 rounded-lg hover:bg-[#162a21]"
                >
                  Open all {slots.length} on Amazon →
                </button>
              )}
              <p className="text-xs text-[#1a1f1a]/55 text-center">
                {slots.length > 1
                  ? 'Opens a new tab for each pick. Allow popups if your browser blocks them.'
                  : 'Affiliate links open in a new tab. Prices vary by retailer and date.'}
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}

interface BulkOpenResult {
  opened: CartSlot[]
  blocked: CartSlot[]
}

function BulkResultView({
  result,
  tier,
  cartId,
  onDone,
  onReset,
}: {
  result: BulkOpenResult
  tier: CartTier
  cartId: string
  onDone: () => void
  onReset: () => void
}) {
  const { opened, blocked } = result
  const allBlocked = opened.length === 0 && blocked.length > 0
  const allOpened = blocked.length === 0 && opened.length > 0

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {allOpened && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-900">
            <strong>Opened {opened.length} tabs.</strong> Check each tab to
            complete your purchases on Amazon.
          </p>
        </div>
      )}
      {!allOpened && !allBlocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>
              Opened {opened.length} of {opened.length + blocked.length}.
            </strong>{' '}
            Your browser blocked {blocked.length}{' '}
            {blocked.length === 1 ? 'tab' : 'tabs'}. Use the links below or
            enable popups for alderprojects.com.
          </p>
        </div>
      )}
      {allBlocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Your browser blocked all popups.</strong> Use the links
            below, or enable popups for alderprojects.com and try again.
          </p>
        </div>
      )}

      {blocked.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#1a1f1a] mb-2">
            Open these manually:
          </h3>
          <ul className="space-y-2">
            {blocked.map(slot => {
              const v = slot.tiers[tier] ?? slot.tiers.sweet_spot
              return (
                <li
                  key={slot.slotId}
                  className="flex items-center gap-3 border border-[#e8e3d4] rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#1a1f1a] truncate text-sm">
                      {v.productName}
                    </div>
                  </div>
                  <a
                    href={v.affiliateUrl}
                    target="_blank"
                    rel="noopener nofollow sponsored"
                    className="bg-[#1f3a2e] text-white text-sm font-medium px-3 py-1.5 rounded whitespace-nowrap flex-shrink-0"
                    onClick={() =>
                      trackResultPageEvent('retailer_modal_fallback_click', {
                        cart_id: cartId,
                        slot_id: slot.slotId,
                      })
                    }
                  >
                    Open →
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="text-sm text-[#1a1f1a]/65 hover:text-[#1a1f1a] hover:underline underline-offset-2"
        >
          ← Back to picks
        </button>
        <button
          onClick={onDone}
          className="bg-[#1f3a2e] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#162a21]"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-[#f5efe2] flex items-center justify-center mb-4">
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-[#1a1f1a]/55"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h9.4a2 2 0 0 0 2-1.6L23 6H6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="font-display text-lg text-[#1a1f1a] mb-2">
        No items picked yet
      </h3>
      <p className="text-sm text-[#1a1f1a]/70 mb-5 max-w-sm mx-auto">
        Tap the box on each card to add it to your buy list. You can pick
        as few or as many as you want.
      </p>
      <button
        onClick={onClose}
        className="bg-[#1f3a2e] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#162a21]"
      >
        Close and pick items
      </button>
    </div>
  )
}
