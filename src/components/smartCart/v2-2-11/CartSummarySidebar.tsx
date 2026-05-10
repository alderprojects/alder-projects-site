'use client'

// v7.2.11 — sticky right-side cart summary on desktop, mobile bottom
// sheet that expands.
//
// v7.2.12 — selection awareness. When the buyer engages with the
// per-card checkboxes, the sidebar shows "X of Y selected" + the
// running selected total. Modal opens with only selected items.

import { useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import type { CartSlot, CartTier, SmartCartV2Output } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'
import {
  computeSelectedTotalRange,
  filterSelectedSlots,
} from '@/lib/cart-selection'
import RetailerBuyModal from './RetailerBuyModal'
import CartActions from '../CartActions'
import { useCartSelectionContext } from './CartSelectionContext'

interface Props {
  cart: SmartCartV2Output
  coreSlots: CartSlot[]
  addOnSlots: CartSlot[]
  tier: CartTier
}

function pickCountLabel(coreCount: number, addOnCount: number): string {
  if (coreCount === 0 && addOnCount === 0) return 'No picks'
  if (addOnCount === 0) return `${coreCount} core ${coreCount === 1 ? 'pick' : 'picks'}`
  if (coreCount === 0) return `${addOnCount} optional ${addOnCount === 1 ? 'add-on' : 'add-ons'}`
  return `${coreCount} core + ${addOnCount} optional`
}

export default function CartSummarySidebar({
  cart,
  coreSlots,
  addOnSlots,
  tier,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const selection = useCartSelectionContext()
  const fee = CONFIG.products.smartCart.priceUsd
  const { leanCartLow, leanCartHigh, potentialSavingsLow, potentialSavingsHigh } =
    cart.savings
  const showAvoided = potentialSavingsHigh >= 50

  const allSelectableSlots = [...coreSlots, ...addOnSlots]
  const selectedSlots = filterSelectedSlots(
    allSelectableSlots,
    selection.selectedMap,
  )
  const selectedTotal = computeSelectedTotalRange(
    allSelectableSlots,
    selection.selectedMap,
    tier,
  )

  const showSelectedView = selection.customized
  const selectedCount = selection.selectedCount
  const totalSelectable = allSelectableSlots.length
  // v7.2.13 — precise item-count language. Disambiguates "11 items"
  // (which conflated core + addons + skip into a single number) into
  // "5 core + 3 optional" so buyers see what they're actually buying.
  const headerLabel = showSelectedView
    ? `${selectedCount} of ${totalSelectable} selected`
    : pickCountLabel(coreSlots.length, addOnSlots.length)

  function onPrimaryCTA() {
    trackResultPageEvent('primary_cta_view_retailers_buy_click', {
      cart_id: cart.cartId,
      selected_count: selectedCount,
      total_count: totalSelectable,
    })
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

  const canBuy = selectedCount > 0
  const buyButtonLabel = canBuy
    ? showSelectedView
      ? `View ${selectedCount} pick${selectedCount === 1 ? '' : 's'} & buy →`
      : 'View retailers & buy →'
    : 'Pick at least one item'

  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-6">
        <div className="bg-white border border-[#e8e3d4] rounded-xl p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-4 gap-2">
            <h3 className="font-display text-lg text-[#1a1f1a]">Cart summary</h3>
            <span className="text-xs text-[#1a1f1a]/65 px-2 py-0.5 rounded-full bg-[#f5efe2] whitespace-nowrap">
              {headerLabel}
            </span>
          </div>

          {!showSelectedView && (
            <p className="text-xs text-[#1a1f1a]/65 mb-3 leading-snug">
              Cart includes {coreSlots.length}{' '}
              {coreSlots.length === 1 ? 'core pick' : 'core picks'}
              {addOnSlots.length > 0
                ? ` and ${addOnSlots.length} optional ${addOnSlots.length === 1 ? 'add-on' : 'add-ons'}`
                : ''}
              .
            </p>
          )}

          {showSelectedView && (
            <p className="text-xs text-[#1a1f1a]/65 mb-3 leading-snug">
              You picked {selectedCount}{' '}
              {selectedCount === 1 ? 'item' : 'items'} to buy. Toggle the
              boxes on each card to change the list.
            </p>
          )}

          <dl className="space-y-2 text-sm mb-4">
            {showSelectedView ? (
              <>
                <Row
                  label="Selected total"
                  value={
                    selectedCount === 0
                      ? '—'
                      : formatPriceRange(selectedTotal.low, selectedTotal.high)
                  }
                  tone="alder"
                />
                <Row
                  label="Full cart"
                  value={formatPriceRange(leanCartLow, leanCartHigh)}
                  subtle
                />
              </>
            ) : (
              <Row
                label="If you bought every pick"
                value={formatPriceRange(leanCartLow, leanCartHigh)}
              />
            )}
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
            disabled={!canBuy}
            className={`w-full font-medium py-3 rounded-lg mb-2 transition-colors ${
              canBuy
                ? 'bg-[#1f3a2e] text-white hover:bg-[#162a21]'
                : 'bg-[#e8e3d4] text-[#1a1f1a]/50 cursor-not-allowed'
            }`}
          >
            {buyButtonLabel}
          </button>

          {showSelectedView && (
            <div className="flex items-center justify-between text-xs mb-3">
              <button
                onClick={selection.selectAll}
                className="text-[#1f3a2e] hover:underline underline-offset-2"
              >
                Select all
              </button>
              <button
                onClick={selection.resetToDefaults}
                className="text-[#1a1f1a]/55 hover:text-[#1a1f1a] hover:underline underline-offset-2"
              >
                Reset to defaults
              </button>
            </div>
          )}

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

      <MobileBottomSheet
        cart={cart}
        onPrimary={onPrimaryCTA}
        savedNote={savedNote}
        onSave={onSaveForLater}
        showSelectedView={showSelectedView}
        selectedCount={selectedCount}
        totalSelectable={totalSelectable}
        selectedTotal={selectedTotal}
        canBuy={canBuy}
        headerLabel={headerLabel}
      />

      <RetailerBuyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        slots={selectedSlots}
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
  showSelectedView,
  selectedCount,
  totalSelectable,
  selectedTotal,
  canBuy,
  headerLabel,
}: {
  cart: SmartCartV2Output
  onPrimary: () => void
  savedNote: string | null
  onSave: () => void
  showSelectedView: boolean
  selectedCount: number
  totalSelectable: number
  selectedTotal: { low: number; high: number }
  canBuy: boolean
  headerLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const fee = CONFIG.products.smartCart.priceUsd
  const { leanCartLow, leanCartHigh } = cart.savings

  const displayTotal = showSelectedView
    ? selectedCount === 0
      ? '—'
      : formatPriceRange(selectedTotal.low, selectedTotal.high)
    : formatPriceRange(leanCartLow, leanCartHigh)
  const totalLabel = showSelectedView
    ? `${selectedCount} of ${totalSelectable} selected`
    : headerLabel

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
              {totalLabel} {expanded ? '▾' : '▴'}
            </span>
            <span className="font-display text-lg text-[#1a1f1a]">
              {displayTotal}
            </span>
          </button>
          <button
            onClick={onPrimary}
            disabled={!canBuy}
            className={`font-medium px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              canBuy
                ? 'bg-[#1f3a2e] text-white'
                : 'bg-[#e8e3d4] text-[#1a1f1a]/50 cursor-not-allowed'
            }`}
          >
            {canBuy && showSelectedView
              ? `View ${selectedCount} & buy →`
              : canBuy
                ? 'View & buy →'
                : 'Pick one'}
          </button>
        </div>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[#e8e3d4] text-sm text-[#1a1f1a]/85 space-y-2">
            <div className="flex justify-between">
              <span className="text-[#1a1f1a]/55">Smart Cart fee</span>
              <span>{formatPrice(fee)}</span>
            </div>
            {showSelectedView && (
              <div className="flex justify-between">
                <span className="text-[#1a1f1a]/55">Full cart</span>
                <span>{formatPriceRange(leanCartLow, leanCartHigh)}</span>
              </div>
            )}
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
