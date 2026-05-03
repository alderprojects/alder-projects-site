// V7 — small Smart Cart CTA component used in guide and seasonal
// page footers. Server-rendered (no client hooks); points at
// /smart-cart with topic + scenario pre-fill query params that the
// CurationModal picks up on landing.

import { CONFIG } from '@/lib/recommender-config'

type Props = {
  topicHint?: string                  // 'kitchen', 'weatherization', etc.
  scenarioHint?: string
  variant?: 'default' | 'compact'
}

export default function SmartCartGuideFooterCta({
  topicHint,
  scenarioHint,
  variant = 'default',
}: Props) {
  const cfg = CONFIG.products.smartCart
  const params = new URLSearchParams()
  if (topicHint) params.set('topic', topicHint)
  if (scenarioHint) params.set('scenario', scenarioHint)
  const href = params.toString() ? `/smart-cart?${params.toString()}` : '/smart-cart'

  if (variant === 'compact') {
    return (
      <div className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-md p-4 text-sm flex items-center justify-between gap-4">
        <span>
          <strong>Skip the wrong cart.</strong> Alder writes the lean cart for this
          project shape — what to buy, what to skip, what most people overspend on.
        </span>
        <a
          href={href}
          className="bg-[#1f3a2e] hover:bg-[#162a21] text-white text-sm whitespace-nowrap px-4 py-2 rounded-md"
        >
          Get the Smart Cart — ${cfg.priceUsd}
        </a>
      </div>
    )
  }

  return (
    <aside className="bg-[#1f3a2e] text-white rounded-xl p-6 md:p-8 my-10 grid md:grid-cols-3 gap-6 items-center">
      <div className="md:col-span-2">
        <div className="text-xs uppercase tracking-wide text-white/70 mb-2">{cfg.productName}</div>
        <h3 className="font-display text-2xl mb-2">Want the lean cart for this project?</h3>
        <p className="text-sm text-white/85">
          Alder writes the lean cart for the actual project shape so the
          obvious upsells go in the skip column. Designed to save more than
          ${cfg.priceUsd} before checkout.
        </p>
      </div>
      <div>
        <a
          href={href}
          className="bg-white text-[#1f3a2e] font-medium px-5 py-3 rounded-lg hover:bg-[#fbf8f1] inline-block"
        >
          Build My Smart Cart — ${cfg.priceUsd}
        </a>
        <p className="text-xs text-white/65 mt-2">
          {cfg.refundWindowHours}-hour refund window · No subscription
        </p>
      </div>
    </aside>
  )
}
