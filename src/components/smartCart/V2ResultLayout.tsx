// V7.2.1 — Smart Cart V2 result page layout.
//
// Server-renderable. Renders the full tiered-slot cart for a v2
// SmartCart record: header strip, savings banner, lean cart with
// per-slot crossover prose (rendered as <details>/<summary> so the
// page works without client JS), add-ons, two-type skip list, the
// savings snapshot, and the cross-sell to the Worth-It coming-soon
// page.

import Footer from '@/components/Footer'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import { TIER_LABEL } from '@/lib/smart-cart-model'
import type {
  CartSlot,
  CartTier,
  CartTierVariant,
  SkipItemV2,
  SmartCartV2Output,
} from '@/lib/smart-cart-model'
import { resolveImageUrl } from '@/lib/smart-cart-images'
import CartActions from './CartActions'
import ProductImage from './ProductImage'

type Props = { cart: SmartCartV2Output }

export default function V2ResultLayout({ cart }: Props) {
  const coreSlots = cart.slots.filter(s => s.slotKind === 'core')
  const addOnSlots = cart.slots.filter(s => s.slotKind === 'addon')
  const skipA = cart.skipList.filter(s => s.type === 'wrong_version')
  const skipB = cart.skipList.filter(s => s.type === 'wrong_category')

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a] print:bg-white">
      <Header cart={cart} />

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <TitleBlock cart={cart} />
        <SavingsBanner cart={cart} />
        <LeanCartSection slots={coreSlots} tier={cart.selectedTier} />
        {addOnSlots.length > 0 && (
          <AddOnSection slots={addOnSlots} tier={cart.selectedTier} />
        )}
        {skipA.length > 0 && <SkipASection items={skipA} />}
        {skipB.length > 0 && <SkipBSection items={skipB} />}
        <SavingsSnapshot cart={cart} />
        <CrossSellComingSoon />

        <p className="mt-8 text-xs text-[#1a1f1a]/60 text-center">
          30-day link to view your cart. Saved at <code>{`/smart-cart/result/${cart.cartId}`}</code>.
        </p>
      </div>

      <Footer />
    </main>
  )
}

// ---------- Header ---------------------------------------------------

function Header({ cart }: { cart: SmartCartV2Output }) {
  return (
    <header className="bg-white border-b border-[#e8e3d4] print:hidden">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
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
      <div className="max-w-4xl mx-auto px-4 pb-4 flex items-center gap-2 text-[#1f3a2e]">
        <CheckCircleIcon />
        <span className="font-display text-xl">Your Smart Cart is Ready</span>
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

// ---------- Savings banner ------------------------------------------

function SavingsBanner({ cart }: { cart: SmartCartV2Output }) {
  return (
    <div className="bg-[#1f3a2e] text-white rounded-lg px-5 py-3 mb-8 flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-3">
        <CheckCircleIcon />
        <span>
          Designed to save more than {formatPrice(CONFIG.products.smartCart.priceUsd)} before checkout.
        </span>
      </div>
      <span className="sm:ml-auto text-sm text-white/85">
        Estimated savings on this cart:{' '}
        <strong>
          {formatPriceRange(cart.savings.potentialSavingsLow, cart.savings.potentialSavingsHigh)}
        </strong>
      </span>
    </div>
  )
}

// ---------- Lean cart -----------------------------------------------

function LeanCartSection({ slots, tier }: { slots: CartSlot[]; tier: CartTier }) {
  return (
    <Section number={1} title="Buy these together (Your lean cart)">
      <div className="space-y-6">
        {slots.map((slot, i) => (
          <SlotCard key={slot.slotId} slot={slot} tier={tier} index={i + 1} />
        ))}
      </div>
    </Section>
  )
}

function SlotCard({
  slot,
  tier,
  index,
}: {
  slot: CartSlot
  tier: CartTier
  index: number
}) {
  const variant: CartTierVariant = slot.tiers[tier] ?? slot.tiers.sweet_spot
  const usedTier: CartTier = slot.tiers[tier] ? tier : 'sweet_spot'
  const imageUrl = resolveImageUrl(variant)
  return (
    <article className="border border-[#e8e3d4] rounded-lg p-5">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-7 h-7 rounded-full bg-[#1f3a2e] text-white inline-flex items-center justify-center text-xs font-medium">
          {index}
        </span>
        <h3 className="font-display text-lg text-[#1a1f1a]">
          {slot.slotLabel}
        </h3>
      </div>

      <div className="ml-10 flex gap-4 mb-3">
        <div className="flex-shrink-0">
          <ProductImage
            src={imageUrl}
            alt={variant.productName}
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md bg-white border border-[#e8e3d4]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
            <a
              href={variant.affiliateUrl}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="text-[#1f3a2e] underline-offset-2 hover:underline font-medium"
            >
              {variant.productName}
            </a>
            <span className="text-sm text-[#1a1f1a]/85 whitespace-nowrap">
              {TIER_LABEL[usedTier]} · {formatPriceRange(variant.priceLow, variant.priceHigh)}
            </span>
          </div>
          <p className="text-sm italic text-[#1a1f1a]/75">
            {variant.productSpec}
          </p>
        </div>
      </div>

      <p className="ml-10 text-sm text-[#1a1f1a]/85 mb-3">{slot.whyThis}</p>

      {(slot.whyNotCheaper || slot.whyNotPremium) && (
        <div className="ml-10 space-y-2 mb-3">
          {slot.whyNotCheaper && (
            <details className="text-sm text-[#1a1f1a]/85 group">
              <summary className="cursor-pointer text-[#1f3a2e] underline-offset-2 hover:underline">
                Why not the cheaper one?
              </summary>
              <p className="mt-2 pl-3 border-l-2 border-[#e8e3d4]">
                {slot.whyNotCheaper}
              </p>
            </details>
          )}
          {slot.whyNotPremium && (
            <details className="text-sm text-[#1a1f1a]/85 group">
              <summary className="cursor-pointer text-[#1f3a2e] underline-offset-2 hover:underline">
                Why not the premium?
              </summary>
              <p className="mt-2 pl-3 border-l-2 border-[#e8e3d4]">
                {slot.whyNotPremium}
              </p>
            </details>
          )}
        </div>
      )}

      {slot.warnings && slot.warnings.length > 0 && (
        <div className="ml-10 space-y-1 mb-2">
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
        <div className="ml-10 bg-emerald-50/60 border border-emerald-200 text-emerald-900 rounded-md px-3 py-2 text-sm italic flex items-start gap-2">
          <span aria-hidden>🟢</span>
          <span>{slot.contextNote}</span>
        </div>
      )}
    </article>
  )
}

// ---------- Add-ons -------------------------------------------------

function AddOnSection({ slots, tier }: { slots: CartSlot[]; tier: CartTier }) {
  return (
    <Section number={2} title="Add-ons (optional)">
      <ul className="space-y-3">
        {slots.map(slot => {
          const variant = slot.tiers[tier] ?? slot.tiers.sweet_spot
          const imageUrl = resolveImageUrl(variant)
          return (
            <li
              key={slot.slotId}
              className="flex items-start gap-3 border-b border-[#e8e3d4] pb-3"
            >
              <ProductImage
                src={imageUrl}
                alt={variant.productName}
                className="w-14 h-14 object-contain rounded bg-white border border-[#e8e3d4] flex-shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <a
                    href={variant.affiliateUrl}
                    target="_blank"
                    rel="noopener nofollow sponsored"
                    className="font-medium text-[#1f3a2e] hover:underline"
                  >
                    {variant.productName}
                  </a>
                  <p className="text-sm text-[#1a1f1a]/80 mt-1">{slot.whyThis}</p>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {formatPriceRange(variant.priceLow, variant.priceHigh)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

// ---------- Skip lists ----------------------------------------------

function SkipASection({ items }: { items: SkipItemV2[] }) {
  return (
    <Section number={3} title="Skip for now (Type A: Don't buy this version)" tone="skipA">
      <ul className="space-y-4">
        {items.map(item => (
          <li
            key={item.id}
            className="bg-[#f5efe2] border border-[#e8e3d4] rounded-md p-4"
          >
            <strong className="block text-[#1a1f1a] mb-2">{item.title}</strong>
            {item.marketingPitch && (
              <p className="text-sm italic text-[#1a1f1a]/70 mb-2">
                Marketing pitch: {item.marketingPitch}
              </p>
            )}
            <p className="text-sm text-[#1a1f1a]/85 mb-2">
              <strong>Real reason to skip:</strong> {item.realReason}
            </p>
            {item.amountSaved && (
              <p className="text-sm font-medium text-[#1f3a2e]">
                Saved: {formatPriceRange(item.amountSaved.low, item.amountSaved.high)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

function SkipBSection({ items }: { items: SkipItemV2[] }) {
  return (
    <Section number={4} title="Skip for now (Type B: Don't buy this category)" tone="skipB">
      <ul className="space-y-3">
        {items.map(item => (
          <li
            key={item.id}
            className="bg-white border border-[#e8e3d4] rounded-md p-4"
          >
            <strong className="block text-[#1a1f1a] mb-1">{item.title}</strong>
            <p className="text-sm text-[#1a1f1a]/85">{item.realReason}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ---------- Savings snapshot ----------------------------------------

function SavingsSnapshot({ cart }: { cart: SmartCartV2Output }) {
  return (
    <Section number={5} title="Your savings snapshot">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <Stat
          label="Your lean cart total"
          value={formatPriceRange(cart.savings.leanCartLow, cart.savings.leanCartHigh)}
          tone="alder"
        />
        <Stat
          label="Typical first-time buyer spend"
          value={formatPriceRange(cart.savings.typicalOverbuyLow, cart.savings.typicalOverbuyHigh)}
          tone="warn"
        />
        <Stat
          label="Your potential savings"
          value={formatPriceRange(cart.savings.potentialSavingsLow, cart.savings.potentialSavingsHigh)}
          tone="alder"
          emphasis
        />
      </div>
    </Section>
  )
}

function Stat({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string
  value: string
  tone: 'alder' | 'warn'
  emphasis?: boolean
}) {
  return (
    <div
      className={`rounded-lg p-4 border ${
        emphasis
          ? 'bg-[#1f3a2e] text-white border-[#1f3a2e]'
          : 'bg-white border-[#e8e3d4]'
      }`}
    >
      <div
        className={`text-xs uppercase tracking-wide ${
          emphasis ? 'text-white/80' : tone === 'warn' ? 'text-[#a44e2c]' : 'text-[#1f3a2e]'
        }`}
      >
        {label}
      </div>
      <div className="mt-2 font-display text-2xl">{value}</div>
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
          Wondering whether to organize what you have, or whether kitchen organization is the right project at all?
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

// ---------- Section primitive ---------------------------------------

function Section({
  number,
  title,
  tone,
  children,
}: {
  number: number
  title: string
  tone?: 'skipA' | 'skipB'
  children: React.ReactNode
}) {
  const numColor =
    tone === 'skipA'
      ? 'bg-[#a44e2c] text-white'
      : tone === 'skipB'
        ? 'bg-[#1a1f1a]/65 text-white'
        : 'bg-[#1f3a2e] text-white'
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-base ${numColor}`}
        >
          {number}
        </span>
        <h2 className="font-display text-xl text-[#1a1f1a]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 6.8-6.8 1.4 1.4-8.2 8.2z" />
    </svg>
  )
}
