// V7 — Worth-It Plan pre-sale hero. Matches the four-quadrant
// mockup bottom-left quadrant: serif headline, body, 6 bullets with
// green checks, dashboard preview thumbnail, "Everything You Get"
// panel, $39 button + "Best Value" badge, trust row, testimonial
// placeholder.

import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'

export default function WorthItPreSaleHero() {
  const cfg = CONFIG.products.worthIt
  return (
    <section className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-2xl p-8 md:p-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left column */}
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-[#1a1f1a] leading-[1.1] mb-6">
            {cfg.headline}
          </h1>
          <p className="text-lg leading-relaxed text-[#1a1f1a]/80 mb-8">
            {cfg.subhead}
          </p>
          <ul className="space-y-3 mb-8">
            {cfg.bullets.map(b => (
              <li key={b} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-[#1a1f1a]">{b}</span>
              </li>
            ))}
          </ul>

          <DashboardPreview />
        </div>

        {/* Right column */}
        <aside className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="font-display text-xl text-[#1a1f1a] mb-5">
            Everything You Get
          </h3>
          <ul className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <Feature title="Ranked Moves" sub="High impact first" />
            <Feature title="Alternate Paths" sub="If already done" />
            <Feature title="Shopping List" sub="What to buy" />
            <Feature title="Skip List" sub="What not to do" />
            <Feature title="Saturday Plan" sub="What to do this weekend" />
            <Feature title="DIY Stop Line" sub="Know your limits" />
            <Feature title="Reminders" sub="Friday, Sat, Sun" />
            <Feature title="Saved Plan" sub="Return anytime" />
          </ul>

          <div className="border-t border-[#e8e3d4] pt-6">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-display text-4xl text-[#1f3a2e]">{formatPrice(cfg.priceUsd)}</span>
              <span className="text-xs uppercase tracking-wide bg-[#1f3a2e] text-white px-2 py-1 rounded">
                Best Value
              </span>
            </div>
            <p className="text-sm text-[#1a1f1a]/70 mt-1">One-time · No subscription</p>

            <button
              type="button"
              data-curation-modal-open
              data-curation-modal-product="worth_it"
              className="mt-4 w-full bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {cfg.ctaCopy}
            </button>

            <p className="mt-3 text-xs text-[#1a1f1a]/60 text-center flex items-center justify-center gap-1">
              <LockIcon />
              {cfg.refundWindowDays}-day guarantee · No account required
            </p>
          </div>
        </aside>
      </div>

      {/* Trust row */}
      <div className="mt-10 pt-8 border-t border-[#e8e3d4] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {cfg.trustRow.map(t => (
          <div key={t} className="text-xs text-[#1a1f1a]/70 uppercase tracking-wide">
            {t}
          </div>
        ))}
      </div>
    </section>
  )
}

function Feature({ title, sub }: { title: string; sub: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-7 h-7 rounded-full bg-[#f5efe2] flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-[#1f3a2e]">
          <circle cx="8" cy="8" r="3" />
        </svg>
      </span>
      <span>
        <span className="block font-medium text-[#1a1f1a]">{title}</span>
        <span className="text-[#1a1f1a]/65 text-xs">{sub}</span>
      </span>
    </li>
  )
}

function DashboardPreview() {
  return (
    <div className="bg-white border border-[#e8e3d4] rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-base text-[#1f3a2e]">Highest-Payoff Moves</span>
        <span className="text-xs text-[#1a1f1a]/50">preview</span>
      </div>
      <div className="space-y-2 text-xs">
        {[
          { rank: 1, title: 'Air-seal rim joists', score: 92 },
          { rank: 2, title: 'Tune airflow at registers', score: 88 },
          { rank: 3, title: 'Adjust thermostat schedule', score: 84 },
        ].map(m => (
          <div key={m.rank} className="flex items-center gap-3 py-1.5 border-b border-[#e8e3d4] last:border-0">
            <span className="w-5 h-5 rounded-full bg-[#1f3a2e] text-white flex items-center justify-center text-[10px]">
              {m.rank}
            </span>
            <span className="flex-1 truncate">{m.title}</span>
            <span className="font-mono text-[10px] text-[#1f3a2e]">{m.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mt-1 text-[#1f3a2e] flex-shrink-0">
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 111.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 inline-block">
      <path d="M5 7V5a3 3 0 116 0v2h.5A1.5 1.5 0 0113 8.5v5A1.5 1.5 0 0111.5 15h-7A1.5 1.5 0 013 13.5v-5A1.5 1.5 0 014.5 7H5zm1 0h4V5a2 2 0 00-4 0v2z" />
    </svg>
  )
}
