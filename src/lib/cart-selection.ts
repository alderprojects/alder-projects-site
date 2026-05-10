'use client'

// v7.2.12 — Cart selection state.
//
// Lets buyers multi-select which slot picks they actually want to
// buy from a Smart Cart. State is per-cartId, persisted in
// localStorage, survives reloads and tab restores. No backend
// involvement — selection is a local, per-buyer view of the cart,
// not a model field on SmartCartV2Output.
//
// Defaults:
//   - Core slots default SELECTED (preserves prior behavior:
//     buyer sees all picks "in" the cart)
//   - Addon slots default DESELECTED (matches "Add only if needed"
//     semantics — opt-in, not opt-out)

import { useCallback, useEffect, useState } from 'react'
import type { CartSlot, SmartCartV2Output } from '@/lib/smart-cart-model'
import { trackResultPageEvent } from '@/lib/analytics'

const STORAGE_PREFIX = 'alder.cart-selection.v1.'

interface SelectionState {
  selected: Record<string, boolean>
  customized: boolean
}

function storageKey(cartId: string): string {
  return `${STORAGE_PREFIX}${cartId}`
}

function defaultSelectionFor(cart: SmartCartV2Output): SelectionState {
  const selected: Record<string, boolean> = {}
  for (const slot of cart.slots) {
    selected[slot.slotId] = slot.slotKind === 'core'
  }
  return { selected, customized: false }
}

function loadSelection(cartId: string): SelectionState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(cartId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.selected === 'object'
    ) {
      return {
        selected: parsed.selected,
        customized: !!parsed.customized,
      }
    }
  } catch {
    // ignore corrupt / parse errors — fall through to default
  }
  return null
}

function saveSelection(cartId: string, state: SelectionState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(cartId), JSON.stringify(state))
  } catch {
    // localStorage may be disabled (private browsing on iOS, etc).
  }
}

export interface UseCartSelectionResult {
  isSelected: (slotId: string) => boolean
  toggle: (slotId: string) => void
  setSelected: (slotId: string, value: boolean) => void
  selectAll: () => void
  selectNone: () => void
  resetToDefaults: () => void
  selectedCount: number
  totalCount: number
  customized: boolean
  selectedMap: Record<string, boolean>
}

export function useCartSelection(
  cart: SmartCartV2Output,
): UseCartSelectionResult {
  const [state, setState] = useState<SelectionState>(() =>
    defaultSelectionFor(cart),
  )

  useEffect(() => {
    const saved = loadSelection(cart.cartId)
    if (saved) {
      const reconciled: Record<string, boolean> = {}
      for (const slot of cart.slots) {
        if (slot.slotId in saved.selected) {
          reconciled[slot.slotId] = saved.selected[slot.slotId]
        } else {
          reconciled[slot.slotId] = slot.slotKind === 'core'
        }
      }
      setState({ selected: reconciled, customized: saved.customized })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.cartId])

  useEffect(() => {
    saveSelection(cart.cartId, state)
  }, [cart.cartId, state])

  const setSelected = useCallback(
    (slotId: string, value: boolean) => {
      setState(prev => {
        if (prev.selected[slotId] === value) return prev
        return {
          selected: { ...prev.selected, [slotId]: value },
          customized: true,
        }
      })
      trackResultPageEvent(
        value ? 'cart_selection_added' : 'cart_selection_removed',
        { cart_id: cart.cartId, slot_id: slotId },
      )
    },
    [cart.cartId],
  )

  const toggle = useCallback(
    (slotId: string) => {
      setState(prev => {
        const next = !prev.selected[slotId]
        trackResultPageEvent(
          next ? 'cart_selection_added' : 'cart_selection_removed',
          { cart_id: cart.cartId, slot_id: slotId },
        )
        return {
          selected: { ...prev.selected, [slotId]: next },
          customized: true,
        }
      })
    },
    [cart.cartId],
  )

  const selectAll = useCallback(() => {
    const all: Record<string, boolean> = {}
    for (const slot of cart.slots) all[slot.slotId] = true
    setState({ selected: all, customized: true })
    trackResultPageEvent('cart_selection_select_all', {
      cart_id: cart.cartId,
    })
  }, [cart.cartId, cart.slots])

  const selectNone = useCallback(() => {
    const none: Record<string, boolean> = {}
    for (const slot of cart.slots) none[slot.slotId] = false
    setState({ selected: none, customized: true })
    trackResultPageEvent('cart_selection_select_none', {
      cart_id: cart.cartId,
    })
  }, [cart.cartId, cart.slots])

  const resetToDefaults = useCallback(() => {
    setState(defaultSelectionFor(cart))
    trackResultPageEvent('cart_selection_reset', { cart_id: cart.cartId })
  }, [cart])

  const isSelected = useCallback(
    (slotId: string) => !!state.selected[slotId],
    [state.selected],
  )

  const selectedCount = Object.values(state.selected).filter(Boolean).length
  const totalCount = cart.slots.length

  return {
    isSelected,
    toggle,
    setSelected,
    selectAll,
    selectNone,
    resetToDefaults,
    selectedCount,
    totalCount,
    customized: state.customized,
    selectedMap: state.selected,
  }
}

export function filterSelectedSlots(
  slots: CartSlot[],
  selectedMap: Record<string, boolean>,
): CartSlot[] {
  return slots.filter(s => selectedMap[s.slotId])
}

export function computeSelectedTotalRange(
  slots: CartSlot[],
  selectedMap: Record<string, boolean>,
  tier: 'budget' | 'sweet_spot' | 'premium',
): { low: number; high: number } {
  let low = 0
  let high = 0
  for (const slot of slots) {
    if (!selectedMap[slot.slotId]) continue
    const variant = slot.tiers[tier] ?? slot.tiers.sweet_spot
    if (!variant) continue
    low += variant.priceLow ?? 0
    high += variant.priceHigh ?? variant.priceLow ?? 0
  }
  return { low, high }
}
