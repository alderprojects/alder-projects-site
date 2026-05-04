'use client'

// IntentSelector — grid of intent buttons used on the rebuilt
// /smart-cart and /worth-it sales pages. Selecting a button updates
// the page's selectedIntentId state, which drives the dynamic
// example card and the CTA's data attributes.
//
// Coming-soon items remain clickable so the page can show a soft
// "this category is being curated" message instead of going dead.
// Beta items render with a small badge.

import type { CurationStatus } from '@/lib/intent-config'

export type IntentSelectorItem = {
  id: string
  label: string
  iconSvg: string
  curationStatus: CurationStatus
}

type Props = {
  items: IntentSelectorItem[]
  value: string
  onChange: (id: string) => void
  title: string
  columns?: number                       // defaults to 3 on md+
}

export default function IntentSelector({
  items,
  value,
  onChange,
  title,
  columns = 3,
}: Props) {
  const gridCols =
    columns === 2
      ? 'md:grid-cols-2'
      : columns === 4
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="my-8">
      <h2 className="font-display text-xl text-[#1a1f1a] mb-4">{title}</h2>
      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        {items.map(item => {
          const selected = item.id === value
          const dim = item.curationStatus === 'coming_soon'
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={[
                'text-left rounded-xl border px-4 py-3 transition-colors flex items-start gap-3 bg-white',
                selected
                  ? 'border-[#1f3a2e] shadow-sm ring-2 ring-[#1f3a2e]/30'
                  : 'border-[#e8e3d4] hover:border-[#1f3a2e]/40',
                dim ? 'opacity-70' : '',
              ].join(' ')}
            >
              <span className="w-9 h-9 rounded-md bg-[#fbf8f1] flex items-center justify-center flex-shrink-0 text-[#1f3a2e]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d={item.iconSvg} />
                </svg>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium text-[#1a1f1a]">{item.label}</span>
                {item.curationStatus === 'beta' && (
                  <span className="mt-1 inline-block text-[10px] uppercase tracking-wide bg-[#f5efe2] text-[#1f3a2e] px-1.5 py-0.5 rounded">
                    Beta
                  </span>
                )}
                {item.curationStatus === 'coming_soon' && (
                  <span className="mt-1 inline-block text-[10px] uppercase tracking-wide bg-[#fbf8f1] text-[#1a1f1a]/70 border border-[#e8e3d4] px-1.5 py-0.5 rounded">
                    Coming soon
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
