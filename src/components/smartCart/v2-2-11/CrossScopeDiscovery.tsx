'use client'

// v7.2.11 — cross-scope discovery: 3-4 cards near the bottom showing
// other Smart Cart scopes that often pair with this one. Turns one
// cart into a broader Alder project entry point.
//
// CTA: "Start this project" links to /smart-cart with scope query
// param prefill so the curation flow lands on the right scope.

import { useEffect } from 'react'
import { getCrossSellScopes } from '@/lib/result-page-content'
import { trackResultPageEvent } from '@/lib/analytics'

interface Props {
  scopeVariantId: string
}

export default function CrossScopeDiscovery({ scopeVariantId }: Props) {
  const cards = getCrossSellScopes(scopeVariantId)
  useEffect(() => {
    if (cards.length > 0) {
      trackResultPageEvent('cross_scope_card_view', {
        from_scope: scopeVariantId,
        count: cards.length,
      })
    }
  }, [scopeVariantId, cards.length])

  if (cards.length === 0) return null

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="font-display text-xl text-[#1a1f1a]">More for your home</h2>
        <p className="text-sm text-[#1a1f1a]/75 mt-1">
          Other project carts that often go with this one.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(card => (
          <a
            key={card.scopeVariantId}
            href={`/smart-cart?scope=${encodeURIComponent(card.scopeVariantId)}`}
            onClick={() =>
              trackResultPageEvent('cross_scope_card_click', {
                from_scope: scopeVariantId,
                to_scope: card.scopeVariantId,
              })
            }
            className="bg-white border border-[#e8e3d4] rounded-lg p-4 hover:border-[#1f3a2e] transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1a1f1a] text-sm">{card.title}</span>
              {card.seasonChip && (
                <span className="text-[10px] uppercase tracking-wide text-[#1f3a2e] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {card.seasonChip}
                </span>
              )}
            </div>
            <p className="text-sm text-[#1a1f1a]/75 leading-snug flex-1">
              {card.reason}
            </p>
            <span className="text-xs text-[#1f3a2e] font-medium mt-1">
              Start this project →
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
