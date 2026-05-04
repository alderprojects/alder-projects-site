// V7 — Smart Cart result page (post-sale).

import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import { getSmartCart } from '@/lib/storage'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice, formatPriceRange } from '@/lib/format'
import type { SmartCartOutput } from '@/lib/buildSmartCart'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: { cartId: string } }

export default async function SmartCartResultPage({ params }: Props) {
  const cart = await getSmartCart(params.cartId)
  if (!cart) {
    notFound()
  }
  if (cart.refunded) {
    return <RefundedCart cart={cart} />
  }
  if (new Date(cart.expiresAt).getTime() < Date.now()) {
    return <ExpiredCart cart={cart} />
  }
  return <SmartCartResult cart={cart} />
}

// ---------- Result content -------------------------------------------

function SmartCartResult({ cart }: { cart: SmartCartOutput }) {
  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a] print:bg-white">
      <ResultHeader cart={cart} />

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 text-sm text-[#1a1f1a]/80">
          <strong>Built for your project:</strong> {cart.scopeLabel}
          {cart.customerProvidedAddress ? ` · ${cart.customerProvidedAddress}` : null}
        </div>

        <div className="bg-[#1f3a2e] text-white rounded-lg px-5 py-3 mb-8 flex items-center gap-3">
          <CheckCircleIcon />
          <span>Designed to save more than {formatPrice(CONFIG.products.smartCart.priceUsd)} before checkout.</span>
        </div>

        <LeanCartSection cart={cart} />
        <AddOnsSection cart={cart} />
        <SkipForNowSection cart={cart} />
        <SavingsSnapshot cart={cart} />

        <p className="mt-8 text-xs text-[#1a1f1a]/60 text-center">
          30-day link to view your cart. Saved at <code>{`/smart-cart/result/${cart.cartId}`}</code>.
        </p>

        <UpgradeCard cart={cart} />
      </div>

      <Footer />
    </main>
  )
}

// ---------- Header ----------------------------------------------------

function ResultHeader({ cart: _cart }: { cart: SmartCartOutput }) {
  return (
    <header className="bg-white border-b border-[#e8e3d4] print:hidden">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="font-display text-2xl text-[#1f3a2e]">
          Alder
        </a>
        <div className="flex items-center gap-3">
          <PrintButton />
          <DownloadButton />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 pb-4 flex items-center gap-2 text-[#1f3a2e]">
        <CheckCircleIcon />
        <span className="font-display text-xl">Your Smart Cart is Ready</span>
      </div>
    </header>
  )
}

// ---------- Sections --------------------------------------------------

function LeanCartSection({ cart }: { cart: SmartCartOutput }) {
  return (
    <Section number={1} title="Buy These Together (Lean Cart)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-[#1a1f1a]/60">
            <tr>
              <th className="pb-3 pr-4">Item</th>
              <th className="pb-3 pr-4">Qty</th>
              <th className="pb-3 pr-4">Est. Price</th>
              <th className="pb-3">Why This</th>
            </tr>
          </thead>
          <tbody>
            {cart.leanCart.items.map(item => (
              <tr key={item.itemId} className="border-t border-[#e8e3d4]">
                <td className="py-3 pr-4">
                  <a
                    href={item.affiliateUrl}
                    target="_blank"
                    rel="noopener nofollow sponsored"
                    className="text-[#1f3a2e] underline-offset-2 hover:underline"
                  >
                    {item.display}
                  </a>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  {formatPriceRange(item.estimatedPrice.low, item.estimatedPrice.high)}
                </td>
                <td className="py-3 text-[#1a1f1a]/85">{item.whyThis}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#1f3a2e]">
              <td className="pt-3 font-medium" colSpan={2}>
                Lean Cart Total (est.)
              </td>
              <td className="pt-3 font-display text-lg text-[#1f3a2e]" colSpan={2}>
                ${cart.leanCart.totalLow} – ${cart.leanCart.totalHigh}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Section>
  )
}

function AddOnsSection({ cart }: { cart: SmartCartOutput }) {
  if (!cart.addOns.length) return null
  return (
    <Section number={2} title="Optional Add-Ons (If Needed)">
      <ul className="space-y-3 text-sm">
        {cart.addOns.map(a => (
          <li
            key={a.itemId}
            className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 border-b border-[#e8e3d4] pb-3"
          >
            <a
              href={a.affiliateUrl}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="font-medium text-[#1f3a2e] hover:underline"
            >
              {a.display}
            </a>
            <span className="text-[#1a1f1a]/70 italic">{a.whenYouNeedIt}</span>
            <span className="font-medium whitespace-nowrap">
              {formatPriceRange(a.estimatedPrice.low, a.estimatedPrice.high)}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function SkipForNowSection({ cart }: { cart: SmartCartOutput }) {
  if (!cart.skipForNow.length) return null
  return (
    <Section number={3} title="Skip For Now" tone="skip">
      <div className="grid md:grid-cols-2 gap-6">
        <ul className="space-y-3 text-sm">
          {cart.skipForNow.map(s => (
            <li key={s.id} className="border-b border-[#e8e3d4] pb-3">
              <strong className="block text-[#1a1f1a]">{s.title}</strong>
              <p className="mt-1 text-[#1a1f1a]/80">{s.reasoning}</p>
              <p className="mt-1 text-xs text-[#1a1f1a]/60">
                Avoided: {s.moneyAvoided} · {s.confidence} confidence
              </p>
            </li>
          ))}
        </ul>

        {cart.overbuyTrapCallout && (
          <aside className="bg-[#f5efe2] border-l-4 border-[#a44e2c] rounded-md p-4 text-sm h-fit">
            <h4 className="font-display text-lg text-[#a44e2c] mb-2">Overbuy Trap</h4>
            <p className="mb-2 text-[#1a1f1a]/85">
              Homeowners often spend ${cart.overbuyTrapCallout.total.low}–
              ${cart.overbuyTrapCallout.total.high} on products they do not end
              up using.
            </p>
            <ul className="text-xs space-y-1 text-[#1a1f1a]/70 list-disc list-inside">
              {cart.overbuyTrapCallout.items.map(i => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </Section>
  )
}

function SavingsSnapshot({ cart }: { cart: SmartCartOutput }) {
  return (
    <Section number={4} title="Your Savings Snapshot">
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <Stat
          label="Lean Cart (est.)"
          value={`$${cart.savings.leanCartEstLow}–$${cart.savings.leanCartEstHigh}`}
          tone="alder"
        />
        <Stat
          label="Common Overbuy Cart"
          value={`$${cart.savings.commonOverbuyLow}–$${cart.savings.commonOverbuyHigh}`}
          tone="warn"
        />
        <Stat
          label="Potential Savings"
          value={`$${cart.savings.potentialSavingsLow}–$${cart.savings.potentialSavingsHigh}+`}
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
      <div className={`mt-2 font-display text-2xl ${emphasis ? '' : ''}`}>{value}</div>
    </div>
  )
}

function UpgradeCard({ cart }: { cart: SmartCartOutput }) {
  if (!CONFIG.products.upgrade.enabled) return null
  const target = `/api/upgrade/smart-cart-to-worth-it?cartId=${cart.cartId}`
  const delta =
    CONFIG.products.worthIt.priceUsd - CONFIG.products.smartCart.priceUsd
  return (
    <aside className="mt-10 bg-white border border-[#e8e3d4] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="text-sm text-[#1a1f1a]/85 max-w-2xl">
        {CONFIG.products.upgrade.inlineCtaCopy}
      </div>
      <a
        href={target}
        className="bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
      >
        Upgrade Now — {formatPrice(delta)}
      </a>
    </aside>
  )
}

// ---------- Section primitive ----------------------------------------

function Section({
  number,
  title,
  tone,
  children,
}: {
  number: number
  title: string
  tone?: 'skip'
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-base ${
            tone === 'skip' ? 'bg-[#a44e2c] text-white' : 'bg-[#1f3a2e] text-white'
          }`}
        >
          {number}
        </span>
        <h2 className="font-display text-xl text-[#1a1f1a]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

// ---------- Print/Download buttons -----------------------------------

function PrintButton() {
  // No 'use client' here — render as a form action that calls window.print
  // via a small inline script. Server-rendered page.
  return (
    <a
      href="javascript:window.print()"
      className="text-sm border border-[#e8e3d4] rounded-md px-3 py-2 hover:bg-[#f5efe2]"
    >
      Print
    </a>
  )
}

function DownloadButton() {
  return (
    <a
      href="javascript:window.print()"
      className="text-sm border border-[#e8e3d4] rounded-md px-3 py-2 hover:bg-[#f5efe2]"
    >
      Download
    </a>
  )
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.7l-4.5-4.5 1.4-1.4 3.1 3.1 6.8-6.8 1.4 1.4-8.2 8.2z" />
    </svg>
  )
}

// ---------- Edge states ----------------------------------------------

function ExpiredCart({ cart: _cart }: { cart: SmartCartOutput }) {
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-[#1f3a2e] mb-4">Smart Cart expired</h1>
        <p className="text-[#1a1f1a]/85 mb-8">
          The 30-day link for this Smart Cart has passed. Project shapes evolve;
          building a new one with current product picks runs {formatPrice(CONFIG.products.smartCart.priceUsd)}.
        </p>
        <a
          href="/smart-cart"
          className="inline-block bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-6 py-3 rounded-lg"
        >
          Build a new Smart Cart — {formatPrice(CONFIG.products.smartCart.priceUsd)}
        </a>
      </div>
    </main>
  )
}

function RefundedCart({ cart: _cart }: { cart: SmartCartOutput }) {
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-[#1f3a2e] mb-4">Smart Cart refunded</h1>
        <p className="text-[#1a1f1a]/85">
          This Smart Cart was refunded. The cart contents are no longer available.
          If this is a mistake, email <a className="underline" href="mailto:hello@alderprojects.com">hello@alderprojects.com</a>.
        </p>
      </div>
    </main>
  )
}
