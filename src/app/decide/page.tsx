// V7.1 — /decide splitter page.
//
// Three primary routes for the visitor at the top of the funnel:
//   1. "I know what I want to do" -> Smart Cart
//   2. "I'm trying to figure out what to do" -> Worth-It Plan
//   3. "I have a quote and want to know if it's fair" -> Worth-It
//      with the already_got_a_quote decision pre-selected
//
// Below the three routes: a comparison band sourced from
// intent-config curated entries, plus the upgrade-math explainer
// and a free-content escape hatch for the still-undecided visitor.

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CurationModal from '@/components/CurationModal'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'
import {
  SMART_CART_CATEGORIES,
  WORTH_IT_DECISIONS,
} from '@/lib/intent-config'

export const metadata: Metadata = {
  title: 'Smart Cart or Worth-It Plan? — Alder Projects',
  description:
    'Three quick paths to the right Alder product: Smart Cart for "I know what I want to do", Worth-It Plan for "what should I do", or Worth-It for "I have a quote".',
  alternates: { canonical: 'https://alderprojects.com/decide' },
  robots: { index: true, follow: true },
}

export default function DecidePage() {
  const sc = CONFIG.products.smartCart
  const wi = CONFIG.products.worthIt
  const upgradeDelta = wi.priceUsd - sc.priceUsd

  // Real-numbers proof from curated intent-config entries.
  const smartCartProof = SMART_CART_CATEGORIES.filter(
    c => c.curationStatus === 'curated',
  )
  const worthItProof = WORTH_IT_DECISIONS.filter(
    d => d.curationStatus === 'curated',
  )

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a]">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-[#1a1f1a] leading-[1.1] mb-4">
            What&apos;s your project at?
          </h1>
          <p className="text-lg text-[#1a1f1a]/85 mb-10 max-w-2xl">
            Three paths to the right Alder product. Pick the one that sounds
            like you.
          </p>

          <section className="grid md:grid-cols-3 gap-4 mb-12">
            <RouteCard
              icon="🛠"
              headline="I know what I want to do"
              tagline="Help me buy it right"
              productLabel="Smart Cart"
              priceText={formatPrice(sc.priceUsd)}
              ctaCopy="Build My Smart Cart →"
              dataAttrs={{ product: 'smart_cart' }}
            />
            <RouteCard
              icon="🤔"
              headline="I'm trying to figure out what to do"
              tagline="Refresh, repair, replace?"
              productLabel="Worth-It Plan"
              priceText={formatPrice(wi.priceUsd)}
              ctaCopy="Get My Worth-It Plan →"
              dataAttrs={{ product: 'worth_it' }}
              tone="alder"
            />
            <RouteCard
              icon="📞"
              headline="I have a quote and want to know if it's fair"
              tagline="Three questions to ask before signing"
              productLabel="Worth-It Plan"
              priceText={formatPrice(wi.priceUsd)}
              ctaCopy="Get My Worth-It Plan →"
              dataAttrs={{
                product: 'worth_it',
                decision: 'already_got_a_quote',
              }}
            />
          </section>

          <section className="bg-white border border-[#e8e3d4] rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-display text-2xl text-[#1a1f1a] mb-4">
              Real numbers from real curated examples
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ProofColumn
                title="Smart Cart examples"
                items={smartCartProof.map(c => ({
                  label: c.label,
                  spend: priceRangeText(c.teaser.spendLow, c.teaser.spendHigh),
                  savings: priceRangeText(c.teaser.savingsLow, c.teaser.savingsHigh),
                  detail: c.teaser.payoffSentence,
                }))}
              />
              <ProofColumn
                title="Worth-It examples"
                items={worthItProof.map(d => ({
                  label: d.label,
                  spend: priceRangeText(d.teaser.spendLow, d.teaser.spendHigh),
                  savings: priceRangeText(d.teaser.savingsLow, d.teaser.savingsHigh),
                  detail: d.teaser.payoffSentence,
                }))}
              />
            </div>
          </section>

          <aside className="bg-[#1f3a2e] text-white rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="font-display text-xl mb-2">
              Bundle math, in case you&apos;re wondering
            </h3>
            <p className="text-sm text-white/85">
              If you buy Smart Cart first ({formatPrice(sc.priceUsd)}) and
              decide later you want Worth-It, upgrade for{' '}
              {formatPrice(upgradeDelta)} — same as paying{' '}
              {formatPrice(wi.priceUsd)} for Worth-It directly. No penalty
              for trying the lighter pick first.
            </p>
          </aside>

          <p className="text-center text-sm text-[#1a1f1a]/70">
            Still not sure? Try the{' '}
            <a
              href="/property/main-street-stowe-vt"
              className="text-[#1f3a2e] underline-offset-2 hover:underline"
            >
              free property profile
            </a>
            .
          </p>
        </div>
        <CurationModal />
        <Footer />
      </main>
    </>
  )
}

// ---------- Route card ----------------------------------------------

function RouteCard({
  icon,
  headline,
  tagline,
  productLabel,
  priceText,
  ctaCopy,
  dataAttrs,
  tone,
}: {
  icon: string
  headline: string
  tagline: string
  productLabel: string
  priceText: string
  ctaCopy: string
  dataAttrs: { product: 'smart_cart' | 'worth_it'; decision?: string }
  tone?: 'alder'
}) {
  const isAlder = tone === 'alder'
  return (
    <article
      className={`rounded-2xl p-6 md:p-8 flex flex-col border ${
        isAlder
          ? 'bg-[#1f3a2e] text-white border-[#1f3a2e]'
          : 'bg-white text-[#1a1f1a] border-[#e8e3d4]'
      }`}
    >
      <div className="text-3xl mb-4" aria-hidden>
        {icon}
      </div>
      <h3
        className={`font-display text-xl mb-2 ${
          isAlder ? '' : 'text-[#1a1f1a]'
        }`}
      >
        {headline}
      </h3>
      <p
        className={`text-sm mb-4 ${
          isAlder ? 'text-white/85' : 'text-[#1a1f1a]/85'
        }`}
      >
        {tagline}
      </p>
      <div className="mt-auto">
        <div
          className={`text-xs uppercase tracking-wide mb-3 ${
            isAlder ? 'text-white/70' : 'text-[#1a1f1a]/55'
          }`}
        >
          {productLabel} · {priceText}
        </div>
        <button
          type="button"
          data-curation-modal-open
          data-curation-modal-product={dataAttrs.product}
          data-curation-modal-decision={dataAttrs.decision ?? ''}
          className={`w-full text-sm font-medium px-5 py-3 rounded-lg ${
            isAlder
              ? 'bg-white text-[#1f3a2e] hover:bg-[#f5efe2]'
              : 'bg-[#1f3a2e] text-white hover:bg-[#162a21]'
          }`}
        >
          {ctaCopy}
        </button>
      </div>
    </article>
  )
}

// ---------- Comparison band -----------------------------------------

type ProofItem = {
  label: string
  spend: string
  savings: string
  detail: string
}

function ProofColumn({ title, items }: { title: string; items: ProofItem[] }) {
  return (
    <div>
      <h3 className="font-display text-base text-[#1f3a2e] mb-3">{title}</h3>
      <ul className="space-y-3">
        {items.map(i => (
          <li
            key={i.label}
            className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-md p-3 text-sm"
          >
            <div className="font-medium text-[#1a1f1a] mb-1">{i.label}</div>
            <div className="text-xs text-[#1a1f1a]/70 mb-1">
              Spend {i.spend} · saves {i.savings}
            </div>
            <p className="text-xs text-[#1a1f1a]/80">{i.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function priceRangeText(low: number, high: number): string {
  if (low === high) return formatPrice(low)
  return `${formatPrice(low)}–${formatPrice(high)}`
}
