// Smart Cart pre-sale hero. Matches the four-quadrant mockup
// top-left quadrant: serif headline, body, bullet list with green
// checks, "What You Get" card, $19 button, trust row.

import { CONFIG } from '@/lib/recommender-config'

export default function SmartCartPreSaleHero() {
  const cfg = CONFIG.products.smartCart
  return (
    <section className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-2xl p-8 md:p-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left: headline, body, bullets, cart illustration */}
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-[#1a1f1a] leading-[1.1] mb-6">
            {cfg.headline}
          </h1>
          <p className="text-lg leading-relaxed text-[#1a1f1a]/80 mb-8">{cfg.subhead}</p>
          <ul className="space-y-3 mb-8">
            {cfg.bullets.map(b => (
              <li key={b} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-[#1a1f1a]">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: "What You Get" card, $19 button, trust row */}
        <aside className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="font-display text-xl text-[#1a1f1a] mb-5">What You Get</h3>
          <ul className="space-y-3 mb-8 text-[#1a1f1a]/85 text-sm">
            <li className="flex items-start gap-3">
              <DotIcon />
              <span><strong>Lean cart</strong>: buy these together</span>
            </li>
            <li className="flex items-start gap-3">
              <DotIcon />
              <span><strong>Skip for now</strong>: what not to buy</span>
            </li>
            <li className="flex items-start gap-3">
              <DotIcon />
              <span>Overbuy traps and product warnings</span>
            </li>
            <li className="flex items-start gap-3">
              <DotIcon />
              <span>Estimated total and savings range</span>
            </li>
            <li className="flex items-start gap-3">
              <DotIcon />
              <span>Product links and quantity guidance</span>
            </li>
            <li className="flex items-start gap-3">
              <DotIcon />
              <span>One-time purchase — no subscription</span>
            </li>
          </ul>

          <div className="border-t border-[#e8e3d4] pt-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-4xl text-[#1f3a2e]">${cfg.priceUsd}</span>
              <span className="text-sm text-[#1a1f1a]/70">One-time · No subscription</span>
            </div>

            {/* CTA button — opens CurationModal client-side */}
            <button
              type="button"
              data-curation-modal-open
              data-curation-modal-product="smart_cart"
              className="mt-4 w-full bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {cfg.ctaCopy}
            </button>

            <p className="mt-3 text-xs text-[#1a1f1a]/60 text-center flex items-center justify-center gap-1">
              <LockIcon />
              30-day link to view your cart
            </p>
          </div>
        </aside>
      </div>

      {/* Trust row */}
      <div className="mt-10 pt-8 border-t border-[#e8e3d4] grid grid-cols-3 gap-4 text-center">
        {cfg.trustRow.map(t => (
          <div key={t} className="text-xs text-[#1a1f1a]/70 uppercase tracking-wide">
            {t}
          </div>
        ))}
      </div>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5 mt-1 text-[#1f3a2e] flex-shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 111.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function DotIcon() {
  return (
    <span className="w-4 h-4 mt-1 inline-flex items-center justify-center text-[#1f3a2e] flex-shrink-0">
      <svg viewBox="0 0 8 8" fill="currentColor" className="w-2 h-2">
        <circle cx="4" cy="4" r="4" />
      </svg>
    </span>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 inline-block">
      <path d="M5 7V5a3 3 0 116 0v2h.5A1.5 1.5 0 0113 8.5v5A1.5 1.5 0 0111.5 15h-7A1.5 1.5 0 013 13.5v-5A1.5 1.5 0 014.5 7H5zm1 0h4V5a2 2 0 00-4 0v2z" />
    </svg>
  )
}
