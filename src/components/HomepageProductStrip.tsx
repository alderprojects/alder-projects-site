// V7.2.1 — homepage product strip, single-product. Worth-It is paused;
// only the Smart Cart card renders. Below the card, a small line
// links to the Worth-It coming-soon page for visitors who came
// looking for it.
//
// Sits between HomepageIntentCards and HomepageCostWidget so the
// paid product appears at the natural decision moment on the page.

import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'

export default function HomepageProductStrip() {
  const sc = CONFIG.products.smartCart
  return (
    <section className="bg-[#fbf8f1] border-y border-[#e8e3d4]">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <h2 className="font-display text-2xl md:text-3xl text-[#1a1f1a] mb-6 text-center">
          Smart Cart — buy this, skip that
        </h2>
        <div className="grid grid-cols-1 max-w-2xl mx-auto mb-4">
          <ProductCard
            label="Smart Cart"
            price={formatPrice(sc.priceUsd)}
            tagline='Lean cart for kitchen organizers (more scopes coming). Buy this + this. Skip that.'
            ctaCopy="Build My Smart Cart →"
            product="smart_cart"
          />
        </div>
        <p className="text-center text-sm text-[#1a1f1a]/70">
          Looking for the Worth-It Plan?{' '}
          <a
            href="/worth-it"
            className="text-[#1f3a2e] underline-offset-2 hover:underline"
          >
            It&apos;s being rebuilt →
          </a>
        </p>
      </div>
    </section>
  )
}

function ProductCard({
  label,
  price,
  tagline,
  ctaCopy,
  product,
}: {
  label: string
  price: string
  tagline: string
  ctaCopy: string
  product: 'smart_cart' | 'worth_it'
}) {
  return (
    <article className="bg-white border border-[#e8e3d4] rounded-2xl p-6 md:p-8">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-xl text-[#1f3a2e]">{label}</h3>
        <span className="font-display text-2xl text-[#1f3a2e]">{price}</span>
      </div>
      <p className="text-sm text-[#1a1f1a]/85 mb-5 leading-relaxed">{tagline}</p>
      <button
        type="button"
        data-curation-modal-open
        data-curation-modal-product={product}
        className="bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {ctaCopy}
      </button>
    </article>
  )
}
