// v7.2.7 — "Skip for now" two-column grid.
//
// Mixes wrong-version (Type A) and wrong-category (Type B) skips
// into a single grid. Type A items show savings range when present.
// "Skip" button is visual confirmation only in v7.2.7 (no state
// persistence yet).

import { formatPriceRange } from '@/lib/format'
import type { SkipItemV2 } from '@/lib/smart-cart-model'

interface Props {
  items: SkipItemV2[]
}

export default function SkipForNowSection({ items }: Props) {
  if (items.length === 0) return null
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-[#a44e2c] text-white flex items-center justify-center font-display text-base">
          3
        </span>
        <h2 className="font-display text-xl text-[#1a1f1a]">Skip for now</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => (
          <SkipCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function SkipCard({ item }: { item: SkipItemV2 }) {
  const isTypeA = item.type === 'wrong_version'
  return (
    <div
      className={`rounded-md p-4 border ${
        isTypeA ? 'bg-[#f5efe2] border-[#e8e3d4]' : 'bg-white border-[#e8e3d4]'
      }`}
    >
      <strong className="block text-[#1a1f1a] mb-1">{item.title}</strong>
      {isTypeA && item.marketingPitch && (
        <p className="text-xs italic text-[#1a1f1a]/65 mb-2">
          Marketing pitch: {item.marketingPitch}
        </p>
      )}
      <p className="text-sm text-[#1a1f1a]/85 mb-2">
        <strong>Why skip:</strong> {item.realReason}
      </p>
      {isTypeA && item.amountSaved && (
        <p className="text-sm font-medium text-[#1f3a2e]">
          Saved: {formatPriceRange(item.amountSaved.low, item.amountSaved.high)}
        </p>
      )}
    </div>
  )
}
