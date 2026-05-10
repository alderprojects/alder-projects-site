'use client'

// v7.2.13 — Soften "Add anyway" since cart mutation isn't live yet.
// Replaces the action button with a "When to add this" expandable that
// explains the conditions a buyer might add the item later. Heading
// shows precise count.
//
// NOTE on schema: SkipItemV2 has `realReason` (not `reasoning`) and
// `amountSaved: { low, high } | undefined` (not a string). Patch as
// supplied used wrong fields; this version reads the real ones.

import { useState } from 'react'
import { formatPriceRange } from '@/lib/format'
import type { SkipItemV2 } from '@/lib/smart-cart-model'
import { getSkipReasonBadge } from '@/lib/result-page-content'
import { trackResultPageEvent } from '@/lib/analytics'

interface Props {
  items: SkipItemV2[]
}

export default function SkipForNow({ items }: Props) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-[#1a1f1a]">
          {items.length} {items.length === 1 ? 'item' : 'items'} to skip for now
        </h2>
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
  const [showWhen, setShowWhen] = useState(false)
  const badge = getSkipReasonBadge(item.realReason)
  const hasAvoidedSpend = !!item.amountSaved

  function onSecondaryClick() {
    trackResultPageEvent('skipped_item_secondary_click', {
      skip_id: item.id,
      title: item.title,
    })
    setShowWhen(s => !s)
  }

  function onKeepSkipped() {
    trackResultPageEvent('keep_skipped_click', {
      skip_id: item.id,
      title: item.title,
    })
  }

  return (
    <article className="bg-white border border-[#e8e3d4] rounded-lg p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-base text-[#1a1f1a] leading-snug">
          {item.title}
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-[#a44e2c] bg-[#a44e2c]/10 px-2 py-0.5 rounded whitespace-nowrap">
          {badge}
        </span>
      </div>
      <p className="text-sm text-[#1a1f1a]/80 mb-2 flex-1">{item.realReason}</p>
      {hasAvoidedSpend && item.amountSaved && (
        <p className="text-sm text-[#1f3a2e] font-medium mb-3">
          Avoided: {formatPriceRange(item.amountSaved.low, item.amountSaved.high)}
        </p>
      )}
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={onKeepSkipped}
          className="px-3 py-1.5 rounded border border-[#e8e3d4] text-[#1a1f1a]/85 hover:bg-[#f5efe2]"
        >
          Keep skipped
        </button>
        <button
          onClick={onSecondaryClick}
          className="text-[#1f3a2e] hover:underline underline-offset-2 text-xs"
          aria-expanded={showWhen}
        >
          {showWhen ? 'Hide' : 'When to add this'} {showWhen ? '▴' : '▾'}
        </button>
      </div>
      {showWhen && (
        <p className="mt-3 pt-3 border-t border-[#e8e3d4] text-xs text-[#1a1f1a]/75 leading-snug">
          You might add this later if your measurements, layout, or style goals
          make it worth the extra spend. For now, Alder estimates this would
          have added more cost than benefit on most projects like yours.
        </p>
      )}
    </article>
  )
}
