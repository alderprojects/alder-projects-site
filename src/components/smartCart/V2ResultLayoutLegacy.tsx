// V7.2.7 — Smart Cart V2 result page layout, refactored.
// v7.2.11 — preserved as Legacy. The active layout is V2ResultLayout
// which composes the v7.2.11 cost/benefit-forward sections. This
// file is retained for rollback / comparison only.
//
// Two-column desktop layout: main content (recommended picks, add-ons,
// skip-for-now, already-have) + sticky sidebar (cart summary, why
// these picks, not quite right). Mobile collapses to single column.
//
// Conditional banners render above the main content when their data
// is present: route-out (replaces everything), urgency, bundle
// prompts.
//
// Server-renderable. The only client island is ProductImage (onError
// fallback).

import Footer from '@/components/Footer'
import { TIER_LABEL } from '@/lib/smart-cart-model'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import CartActions from './CartActions'
import ValueProofBar from './sections/ValueProofBar'
import UrgencyBanner from './sections/UrgencyBanner'
import RouteOutBanner from './sections/RouteOutBanner'
import RecommendedPicksSection from './sections/RecommendedPicksSection'
import AddOnSection from './sections/AddOnSection'
import SkipForNowSection from './sections/SkipForNowSection'
import AlreadyHaveSection from './sections/AlreadyHaveSection'
import BundlePromptsSection from './sections/BundlePromptsSection'
import CartSummary from './sections/CartSummary'
import WhyThesePicks from './sections/WhyThesePicks'
import NotQuiteRight from './sections/NotQuiteRight'

type Props = { cart: SmartCartV2Output }

export default function V2ResultLayout({ cart }: Props) {
  const coreSlots = cart.slots.filter(s => s.slotKind === 'core')
  const addOnSlots = cart.slots.filter(s => s.slotKind === 'addon')
  const itemCount = coreSlots.length + addOnSlots.length

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a] print:bg-white">
      <Header cart={cart} />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <TitleBlock cart={cart} />

        {cart.routedOut ? (
          <RouteOutBanner cart={cart} />
        ) : (
          <>
            <UrgencyBanner cart={cart} />
            <ValueProofBar cart={cart} />

            <div className="lg:grid lg:grid-cols-3 lg:gap-6 items-start">
              <div className="lg:col-span-2">
                <RecommendedPicksSection slots={coreSlots} tier={cart.selectedTier} />
                {addOnSlots.length > 0 && (
                  <AddOnSection slots={addOnSlots} tier={cart.selectedTier} />
                )}
                {cart.bundlePrompts && cart.bundlePrompts.length > 0 && (
                  <BundlePromptsSection prompts={cart.bundlePrompts} />
                )}
                <SkipForNowSection items={cart.skipList} />
                {cart.nextBestGaps && cart.nextBestGaps.length > 0 && (
                  <AlreadyHaveSection gaps={cart.nextBestGaps} />
                )}
              </div>

              <aside className="lg:col-span-1 lg:sticky lg:top-6 space-y-4 mt-6 lg:mt-0">
                <CartSummary cart={cart} itemCount={itemCount} />
                <WhyThesePicks cart={cart} />
                <NotQuiteRight cart={cart} />
              </aside>
            </div>
          </>
        )}

        <CrossSellComingSoon />

        <p className="mt-8 text-xs text-[#1a1f1a]/60 text-center">
          30-day link to view your cart. Saved at{' '}
          <code>{`/smart-cart/result/${cart.cartId}`}</code>.
        </p>
      </div>

      <Footer />
    </main>
  )
}

// ---------- Header / Title ------------------------------------------

function Header({ cart }: { cart: SmartCartV2Output }) {
  return (
    <header className="bg-white border-b border-[#e8e3d4] print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <a href="/" className="flex items-baseline gap-2 text-[#1f3a2e]">
          <span className="font-display text-2xl">Smart Cart</span>
          <span className="text-xs uppercase tracking-wide text-[#1a1f1a]/55">
            by Alder
          </span>
        </a>
        <CartActions
          cartId={cart.cartId}
          topic={cart.topic}
          initialScopeVariantId={cart.scopeVariantId}
          initialScenario={cart.scenario}
          respinCount={cart.respinCount ?? 0}
        />
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-4 flex items-center gap-2 text-[#1f3a2e]">
        <CheckCircleIcon />
        <span className="font-display text-xl">Your Smart Cart is ready</span>
      </div>
    </header>
  )
}

function TitleBlock({ cart }: { cart: SmartCartV2Output }) {
  return (
    <div className="mb-4 text-sm text-[#1a1f1a]/80">
      <strong>Built for:</strong> {cart.scopeLabel} · {cart.scenarioLabel} ·{' '}
      <span className="lowercase">{TIER_LABEL[cart.selectedTier]}</span>
    </div>
  )
}

// ---------- Cross-sell ----------------------------------------------

function CrossSellComingSoon() {
  return (
    <aside className="mt-10 bg-[#1f3a2e] text-white rounded-xl p-6 md:p-8 grid md:grid-cols-3 gap-4 items-center">
      <div className="md:col-span-2">
        <div className="text-xs uppercase tracking-wide text-white/70 mb-2">
          Coming back
        </div>
        <h3 className="font-display text-xl mb-2">
          Wondering whether to organize what you have, or whether this project
          is the right one to start with?
        </h3>
        <p className="text-sm text-white/85">
          Worth-It Plan is being rebuilt — get notified when it returns.
        </p>
      </div>
      <a
        href="/worth-it"
        className="bg-white text-[#1f3a2e] font-medium px-5 py-3 rounded-lg hover:bg-[#f5efe2] inline-block text-center"
      >
        Get notified →
      </a>
    </aside>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 6.8-6.8 1.4 1.4-8.2 8.2z" />
    </svg>
  )
}
