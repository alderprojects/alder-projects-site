'use client'

// v7.2.11 — "Skip for now" section. Skip logic is value, not failure
// — surface it as an outcome the buyer is choosing.
//
// Each card shows: avoided spend (when present), reason badge derived
// from realReason via getSkipReasonBadge, one-line explanation,
// "Keep skipped" (visual confirmation) and "Add anyway" link.

import { useEffect } from 'react'
import { formatPriceRange } from '@/lib/format'
import type { SkipItemV2 } from '@/lib/smart-cart-model'
import { getSkipReasonBadge } from '@/lib/result-page-content'
import { trackResultPageEvent } from '@/lib/analytics'

interface Props {
  items: SkipItemV2[]
}

export default function SkipForNow({ items }: Props) {
  useEffect(() => {
    if (items.length > 0) {
      trackResultPageEvent('skip_card_view', { count: items.length })
    }
  }, [items.length])
  if (items.length === 0) return null
  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="font-display text-xl text-[#1a1f1a]">Skip for now</h2>
        <p className="text-sm text-[#1a1f1a]/75 mt-1">
          Low impact right now, easy to overbuy, or better after the first round.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(item => (
          <SkipCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function SkipCard({ item }: { item: SkipItemV2 }) {
  const badge = getSkipReasonBadge(item.realReason)
  return (
    <div className="bg-[#f5efe2]/60 border border-[#e8e3d4] rounded-lg p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <strong className="text-[#1a1f1a]">{item.title}</strong>
        <span className="text-[10px] uppercase tracking-wide bg-[#a44e2c]/10 text-[#a44e2c] px-1.5 py-0.5 rounded whitespace-nowrap">
          {badge}
        </span>
      </div>
      <p className="text-sm text-[#1a1f1a]/85 mb-2 leading-snug">
        {item.realReason}
      </p>
      {item.amountSaved && (
        <div className="text-sm font-medium text-[#1f3a2e] mb-3">
          Avoided: {formatPriceRange(item.amountSaved.low, item.amountSaved.high)}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          className="text-xs text-[#1f3a2e] font-medium px-2.5 py-1 rounded border border-[#e8e3d4] bg-white hover:bg-[#f5efe2]"
          onClick={() => trackResultPageEvent('keep_skipped_click', { skip_id: item.id })}
        >
          Keep skipped
        </button>
        <button
          className="text-xs text-[#1a1f1a]/65 font-medium hover:text-[#1a1f1a]"
          onClick={() =>
            trackResultPageEvent('skipped_item_add_anyway', { skip_id: item.id })
          }
        >
          Add anyway
        </button>
      </div>
    </div>
  )
}
