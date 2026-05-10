'use client'

// v7.2.11 — sticky right-side cart summary on desktop, mobile bottom
// sheet that expands. Always shows: items count, estimated total,
// fee, avoided spend (when meaningful), and the primary "View
// retailers & buy" CTA + secondary "Save for later" + tertiary
// "Adjust my cart".
//
// "Save for later" copies the 30-day result URL to clipboard
// (lightweight; no email integration in v7.2.11 — that's v7.3.1
// per the scope agreement).
// "Adjust my cart" defers to existing CartActions for the respin
// flow.

import { useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import type { CartSlot, CartTier, SmartCartV2Output } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'
import RetailerBuyModal from './RetailerBuyModal'
import CartActions from '../CartActions'

interface Props {
  cart: SmartCartV2Output
  coreSlots: CartSlot[]
  tier: CartTier
}

export default function CartSummarySidebar({ cart, coreSlots, tier }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const fee = CONFIG.products.smartCart.priceUsd
  const { leanCartLow, leanCartHigh, potentialSavingsLow, potentialSavingsHigh } =
    cart.savings
  const itemCount = cart.slots.length
  const showAvoided = potentialSavingsHigh >= 50

  function onPrimaryCTA() {
    trackResultPageEvent('primary_cta_view_retailers_buy_click', { cart_id: cart.cartId })
    setModalOpen(true)
  }

  async function onSaveForLater() {
    trackResultPageEvent('save_for_later_click', { cart_id: cart.cartId })
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setSavedNote('Link copied. Comes back to this cart for 30 days.')
      } catch {
        setSavedNote('Bookmark this page — saved for 30 days.')
      }
    } else {
      setSavedNote('Bookmark this page — saved for 30 days.')
    }
    window.setTimeout(() => setSavedNote(null), 4000)
  }

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-6">
        <div className="bg-white border border-[#e8e3d4] rounded-xl p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-display text-lg text-[#1a1f1a]">Cart summary</h3>
            <span className="text-xs text-[#1a1f1a]/65 px-2 py-0.5 rounded-full bg-[#f5efe2]">
              {itemCount} items
            </span>
          </div>
          <dl className="space-y-2 text-sm mb-4">
            <Row
              label="Estimated total"
              value={formatPriceRange(leanCartLow, leanCartHigh)}
            />
            <Row label="Smart Cart fee" value={formatPrice(fee)} subtle />
            {showAvoided && (
              <Row
                label="Avoided spend"
                value={formatPriceRange(potentialSavingsLow, potentialSavingsHigh)}
                tone="alder"
              />
            )}
          </dl>
          <button
            onClick={onPrimaryCTA}
            className="w-full bg-[#1f3a2e] text-white font-medium py-3 rounded-lg hover:bg-[#162a21] mb-2"
          >
            View retailers & buy →
          </button>
          <button
            onClick={onSaveForLater}
            className="w-full text-sm text-[#1f3a2e] font-medium py-2 rounded-lg border border-[#e8e3d4] hover:bg-[#f5efe2] mb-2"
          >
            Save for later
          </button>
          {savedNote && (
            <p className="text-xs text-[#1f3a2e] italic mb-2" role="status">
              {savedNote}
            </p>
          )}
          <div className="pt-3 border-t border-[#e8e3d4]">
            <p className="text-xs text-[#1a1f1a]/60 mb-2">Need to tweak it?</p>
            <CartActions
              cartId={cart.cartId}
              topic={cart.topic}
              initialScopeVariantId={cart.scopeVariantId}
              initialScenario={cart.scenario}
              respinCount={cart.respinCount ?? 0}
            />
          </div>
        </div>
      </aside>

      {/* Mobile sticky bottom sheet */}
      <MobileBottomSheet
        cart={cart}
        onPrimary={onPrimaryCTA}
        savedNote={savedNote}
        onSave={onSaveForLater}
      />

      <RetailerBuyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        slots={coreSlots}
        tier={tier}
        cartId={cart.cartId}
      />
    </>
  )
}

function Row({
  label,
  value,
  subtle,
  tone,
}: {
  label: string
  value: string
  subtle?: boolean
  tone?: 'alder'
}) {
  return (
    <div className="flex justify-between items-baseline">
      <dt className={`${subtle ? 'text-[#1a1f1a]/55' : 'text-[#1a1f1a]/75'}`}>{label}</dt>
      <dd
        className={`font-medium ${
          tone === 'alder' ? 'text-[#1f3a2e]' : 'text-[#1a1f1a]'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

function MobileBottomSheet({
  cart,
  onPrimary,
  savedNote,
  onSave,
}: {
  cart: SmartCartV2Output
  onPrimary: () => void
  savedNote: string | null
  onSave: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const fee = CONFIG.products.smartCart.priceUsd
  const { leanCartLow, leanCartHigh } = cart.savings
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e3d4] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            aria-label="Show cart details"
            className="flex flex-col items-start text-left flex-1"
          >
            <span className="text-xs text-[#1a1f1a]/60 uppercase tracking-wide">
              Estimated total {expanded ? '▾' : '▴'}
            </span>
            <span className="font-display text-lg text-[#1a1f1a]">
              {formatPriceRange(leanCartLow, leanCartHigh)}
            </span>
          </button>
          <button
            onClick={onPrimary}
            className="bg-[#1f3a2e] text-white font-medium px-4 py-2.5 rounded-lg whitespace-nowrap"
          >
            View & buy →
          </button>
        </div>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#e8e3d4] text-sm text-[#1a1f1a]/85 space-y-2">
            <div className="flex justify-between">
              <span className="text-[#1a1f1a]/55">Smart Cart fee</span>
              <span>{formatPrice(fee)}</span>
            </div>
            <button
              onClick={onSave}
              className="w-full text-sm text-[#1f3a2e] font-medium py-2 rounded-lg border border-[#e8e3d4]"
            >
              Save for later
            </button>
            {savedNote && (
              <p className="text-xs text-[#1f3a2e] italic" role="status">
                {savedNote}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
