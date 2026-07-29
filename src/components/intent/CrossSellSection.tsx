// V7.2.1 — Cross-sell while Worth-It is paused.
// v7.2.15 — reframed as a low-emphasis waitlist line so it does not
// cannibalize the Smart Cart conversion. Sits below the primary CTA
// rather than competing with it.
//
// On Smart Cart pages this is the secondary "bigger than a shopping
// list?" waitlist note. On Worth-It pages this component is no longer
// rendered (the page is the coming-soon page).

import FunnelLink from '@/components/check/FunnelLink'
import { WORTH_IT_DEFINITION } from '@/lib/copy/canon'
type Props = { fromProduct: 'smart_cart' | 'worth_it' }

export default function CrossSellSection({ fromProduct }: Props) {
  if (fromProduct !== 'smart_cart') return null

  return (
    <aside className="my-8 border-t border-[#e8e3d4] pt-6 flex flex-wrap items-baseline gap-3 text-sm text-[#1a1f1a]/75">
      <div className="flex-1 min-w-[220px]">
        <p className="font-medium text-[#1a1f1a] mb-1">
          Bigger than a shopping list?
        </p>
        <p className="text-[#1a1f1a]/70">{WORTH_IT_DEFINITION}</p>
      </div>
      {/* v7.4.14 §1.7 — this link is demand instrumentation for the
          premium tier. ASSESSMENT_INTEREST is the same event the coverage
          work uses, so both waitlist surfaces feed one signal. Do not
          remove the link without replacing the signal. */}
      <FunnelLink
        href="/worth-it"
        eventType="ASSESSMENT_INTEREST"
        payload={{ source: 'smart_cart_cross_sell' }}
        className="text-[#1f3a2e] font-medium underline-offset-2 hover:underline"
      >
        Join waitlist →
      </FunnelLink>
    </aside>
  )
}
