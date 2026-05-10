// V7.2.11 — Smart Cart V2 result page, refreshed.
//
// Composition of v2-2-11/* sections. Mobile-first ordering; desktop
// shifts to two-column with sticky sidebar. Conditional banners
// (route-out, urgency) render at top when their data is present.
//
// Old behavior preserved as V2ResultLayoutLegacy.tsx for rollback.

import Footer from '@/components/Footer'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'

import SmartCartResultPageHeader from './v2-2-11/SmartCartResultPageHeader'
import SmartCartValueBanner from './v2-2-11/SmartCartValueBanner'
import StartHerePicks from './v2-2-11/StartHerePicks'
import { selectStartHere } from '@/lib/result-page-content'
import RecommendedPicksList from './v2-2-11/RecommendedPicksList'
import AddOnlyIfNeeded from './v2-2-11/AddOnlyIfNeeded'
import SkipForNow from './v2-2-11/SkipForNow'
import WhyThesePicks from './v2-2-11/WhyThesePicks'
import NotQuiteRight from './v2-2-11/NotQuiteRight'
import CrossScopeDiscovery from './v2-2-11/CrossScopeDiscovery'
import PhotoBetaStrip from './v2-2-11/PhotoBetaStrip'
import CartSummarySidebar from './v2-2-11/CartSummarySidebar'
import { CartSelectionProvider } from './v2-2-11/CartSelectionContext'
import RouteOutBanner from './sections/RouteOutBanner'
import UrgencyBanner from './sections/UrgencyBanner'
import CartActions from './CartActions'

type Props = { cart: SmartCartV2Output }

export default function V2ResultLayout({ cart }: Props) {
  const coreSlots = cart.slots.filter(s => s.slotKind === 'core')
  const addOnSlots = cart.slots.filter(s => s.slotKind === 'addon')
  const heroSlots = selectStartHere(coreSlots)
  const heroIds = new Set(heroSlots.map(s => s.slotId))
  // The full list shows the non-hero core slots (deduped against Start Here)
  const fullListSlots = coreSlots.filter(s => !heroIds.has(s.slotId))

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a] print:bg-white pb-24 lg:pb-0">
      <Header cart={cart} />

      <CartSelectionProvider cart={cart}>
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {cart.routedOut ? (
            <>
              <SmartCartResultPageHeader cart={cart} />
              <RouteOutBanner cart={cart} />
            </>
          ) : (
            <>
              <SmartCartResultPageHeader cart={cart} />
              <UrgencyBanner cart={cart} />
              <SmartCartValueBanner cart={cart} />

              <div className="lg:grid lg:grid-cols-3 lg:gap-6 items-start">
                <div className="lg:col-span-2">
                  <StartHerePicks slots={heroSlots} tier={cart.selectedTier} />
                  {fullListSlots.length > 0 && (
                    <RecommendedPicksList
                      slots={fullListSlots}
                      tier={cart.selectedTier}
                      startHereCount={heroSlots.length}
                    />
                  )}
                  {addOnSlots.length > 0 && (
                    <AddOnlyIfNeeded slots={addOnSlots} tier={cart.selectedTier} />
                  )}
                  <SkipForNow items={cart.skipList} />
                  <WhyThesePicks cart={cart} />
                  <NotQuiteRight cart={cart} />
                  <CrossScopeDiscovery scopeVariantId={cart.scopeVariantId} />
                  <PhotoBetaStrip />
                </div>

                <div className="lg:col-span-1">
                  <CartSummarySidebar
                    cart={cart}
                    coreSlots={coreSlots}
                    addOnSlots={addOnSlots}
                    tier={cart.selectedTier}
                  />
                </div>
              </div>
            </>
          )}

          <p className="mt-8 text-xs text-[#1a1f1a]/55 text-center">
            30-day link to view your cart. Saved at{' '}
            <code>{`/smart-cart/result/${cart.cartId}`}</code>.
          </p>
        </div>
      </CartSelectionProvider>

      <Footer />
    </main>
  )
}

// ---------- Top nav --------------------------------------------------

function Header({ cart }: { cart: SmartCartV2Output }) {
  return (
    <header className="bg-white border-b border-[#e8e3d4] print:hidden sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <a href="/" className="flex items-baseline gap-2 text-[#1f3a2e]">
          <span className="font-display text-2xl">Alder</span>
          <span className="hidden sm:inline text-xs uppercase tracking-wide text-[#1a1f1a]/55">
            Vermont home projects
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-5 text-sm text-[#1a1f1a]/85">
          <a href="/" className="hover:text-[#1f3a2e]">
            Projects
          </a>
          <a href="/" className="hover:text-[#1f3a2e]">
            Guides &amp; Ideas
          </a>
          <a
            href="/smart-cart"
            className="text-[#1f3a2e] font-medium underline-offset-4 underline decoration-[#1f3a2e]/30"
          >
            Smart Cart
          </a>
          <a href="/about" className="hover:text-[#1f3a2e]">
            About
          </a>
          <span
            className="text-xs uppercase tracking-wide bg-[#f5efe2] text-[#1a1f1a]/65 px-2 py-1 rounded"
            aria-label="Region"
          >
            Vermont
          </span>
        </nav>
        <div className="flex items-center gap-2">
          <CartActions
            cartId={cart.cartId}
            topic={cart.topic}
            initialScopeVariantId={cart.scopeVariantId}
            initialScenario={cart.scenario}
            respinCount={cart.respinCount ?? 0}
          />
        </div>
      </div>
    </header>
  )
}
