// V7.1 — homepage product strip. Two cards side by side (Smart Cart
// $19.99, Worth-It $39.99) with a comparison link to /decide.
//
// Sits between HomepageIntentCards (the "pick a project / question /
// ask" block) and HomepageCostWidget (the cost-ranges table) so the
// paid products appear at the natural decision moment on the page.

import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'

export default function HomepageProductStrip() {
  const sc = CONFIG.products.smartCart
  const wi = CONFIG.products.worthIt
  return (
    <section className="bg-[#fbf8f1] border-y border-[#e8e3d4]">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <h2 className="font-display text-2xl md:text-3xl text-[#1a1f1a] mb-6 text-center">
          Two ways Alder helps you spend smarter
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ProductCard
            label="Smart Cart"
            price={formatPrice(sc.priceUsd)}
            tagline='Buy this + this. Skip that. Lean cart for projects $100+.'
            ctaCopy="Build My Smart Cart →"
            product="smart_cart"
          />
          <ProductCard
            label="Worth-It Plan"
            price={formatPrice(wi.priceUsd)}
            tagline="DIY, hire, or hold? Ranked next moves with the skip list."
            ctaCopy="Get My Worth-It Plan →"
            product="worth_it"
          />
        </div>
        <p className="text-center text-sm text-[#1a1f1a]/70">
          Not sure which?{' '}
          <a
            href="/decide"
            className="text-[#1f3a2e] underline-offset-2 hover:underline"
          >
            See the comparison →
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
