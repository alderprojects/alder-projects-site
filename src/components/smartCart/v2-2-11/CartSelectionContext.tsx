'use client'

// v7.2.12 — Cart selection context.
//
// V2ResultLayout wraps everything in CartSelectionProvider so any
// descendant (ProductPickCard, AddOnlyIfNeeded, CartSummarySidebar,
// SmartCartValueBanner, RetailerBuyModal) can read/write selection
// without prop-drilling.
//
// Also exposes cart-shape info (topic, scopeVariantId) so descendants
// can render scope-aware copy without prop-drilling the cart through
// every component.

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import {
  useCartSelection,
  type UseCartSelectionResult,
} from '@/lib/cart-selection'

interface CartSelectionContextValue extends UseCartSelectionResult {
  cartTopic: string
  cartScopeVariantId: string
}

const CartSelectionContext =
  createContext<CartSelectionContextValue | null>(null)

export function CartSelectionProvider({
  cart,
  children,
}: {
  cart: SmartCartV2Output
  children: ReactNode
}) {
  const selection = useCartSelection(cart)
  const value = useMemo<CartSelectionContextValue>(
    () => ({
      ...selection,
      cartTopic: cart.topic,
      cartScopeVariantId: cart.scopeVariantId,
    }),
    [selection, cart.topic, cart.scopeVariantId],
  )
  return (
    <CartSelectionContext.Provider value={value}>
      {children}
    </CartSelectionContext.Provider>
  )
}

export function useCartSelectionContext(): CartSelectionContextValue {
  const ctx = useContext(CartSelectionContext)
  if (!ctx) {
    throw new Error(
      'useCartSelectionContext must be used inside CartSelectionProvider',
    )
  }
  return ctx
}

export function useOptionalCartSelectionContext(): CartSelectionContextValue | null {
  return useContext(CartSelectionContext)
}
