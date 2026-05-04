// DynamicExampleCard — redacted preview shown on the rebuilt sales
// pages. Updates as the visitor switches intent. Counts and ranges
// only — no product names, no skip reasons, no move titles. The full
// data lands behind purchase.

import type { IntentTeaser } from '@/lib/intent-config'
import { formatPrice } from '@/lib/format'

type Props = {
  teaser: IntentTeaser
  scopeLabel: string
  scenarioLabel: string
  productPrice: number
}

export default function DynamicExampleCard({
  teaser,
  scopeLabel,
  scenarioLabel,
  productPrice,
}: Props) {
  return (
    <section
      id="example-preview"
      className="bg-white border border-[#e8e3d4] rounded-2xl p-6 md:p-8 my-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/55 mb-1">
            Example
          </div>
          <h3 className="font-display text-xl text-[#1a1f1a]">
            {scopeLabel} · {scenarioLabel}
          </h3>
        </div>
        <span className="text-xs text-[#1a1f1a]/60">
          Live preview · Full plan unlocks at {formatPrice(productPrice)}
        </span>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <Tile label="Items in your buy list" value={String(teaser.buyCount)} />
        <Tile label="Items to skip" value={String(teaser.skipCount)} />
        <Tile
          label="Estimated savings"
          value={priceRangeText(teaser.savingsLow, teaser.savingsHigh)}
          tone="alder"
        />
      </div>

      <div className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-md px-4 py-3 mb-4 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wide text-[#1a1f1a]/55">
          Typical spend
        </span>
        <span className="font-display text-lg text-[#1f3a2e]">
          {priceRangeText(teaser.spendLow, teaser.spendHigh)}
        </span>
      </div>

      <p className="text-sm text-[#1a1f1a]/85 leading-relaxed">
        {teaser.payoffSentence}
      </p>
    </section>
  )
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'alder'
}) {
  return (
    <div
      className={`rounded-md p-4 border ${
        tone === 'alder'
          ? 'bg-[#1f3a2e] text-white border-[#1f3a2e]'
          : 'bg-[#fbf8f1] border-[#e8e3d4]'
      }`}
    >
      <div
        className={`text-xs uppercase tracking-wide ${
          tone === 'alder' ? 'text-white/80' : 'text-[#1a1f1a]/55'
        }`}
      >
        {label}
      </div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  )
}

function priceRangeText(low: number, high: number): string {
  if (low === high) return formatPrice(low)
  return `${formatPrice(low)}–${formatPrice(high)}`
}
