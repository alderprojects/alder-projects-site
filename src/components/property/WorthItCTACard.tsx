'use client'

// V7 — Property page Worth-It CTA card.
//
// Renders after the main topic summary on /property/[slug]. Respects
// V4 engagement gating (40% scroll) and V5 refund-risk suppression
// (intent=researching = no upsell). The card opens the CurationModal
// pre-filled with topic + scenario inferred from the visitor's
// VisitorSignals, plus the property address from the URL slug.

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { useEngagementGate } from '@/lib/useEngagementGate'
import type { TopicId } from '@/lib/property-modules'
import { SCOPE_VARIANTS } from '@/lib/scope-variants'

type Props = {
  topic: TopicId | null
  intent: 'owner' | 'buying' | 'researching' | null
  address?: string
  slug?: string
}

export default function WorthItCTACard({ topic, intent, address, slug }: Props) {
  const cfg = CONFIG.products.worthIt
  const [mounted, setMounted] = useState(false)
  const gate = useEngagementGate()
  const gateOpen = gate.passed

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  if (!gateOpen) return null
  // V5 refund-risk suppression — researchers do not get the paid upsell.
  if (intent === 'researching') return null
  // No scope variants for the topic? Skip rendering.
  if (!topic || !(SCOPE_VARIANTS[topic]?.length)) return null

  const defaultVariant = SCOPE_VARIANTS[topic][0]
  const scenario =
    intent === 'buying' ? 'just_starting'
    : intent === 'owner' ? 'already_have_basics'
    : 'just_starting'

  return (
    <aside className="bg-[#1f3a2e] text-white rounded-xl p-6 md:p-8 my-6 grid md:grid-cols-3 gap-6 items-center">
      <div className="md:col-span-2">
        <div className="text-xs uppercase tracking-wide text-white/70 mb-2">{cfg.productName}</div>
        <h3 className="font-display text-2xl mb-2">Turn this into a Worth-It Plan</h3>
        <p className="text-sm text-white/85">
          Alder can rank the small, high-payoff moves for this property: what
          to do first, what to skip, what to buy, and when to bundle small
          fixes. Saved plan, optional reminders, no account needed.
        </p>
      </div>
      <div className="text-right md:text-right">
        <button
          type="button"
          data-curation-modal-open
          data-curation-modal-product="worth_it"
          data-curation-modal-topic={topic}
          data-curation-modal-scenario={scenario}
          data-curation-modal-variant={defaultVariant?.id}
          data-curation-modal-address={address ?? ''}
          data-curation-modal-slug={slug ?? ''}
          className="bg-white text-[#1f3a2e] font-medium px-5 py-3 rounded-lg hover:bg-[#fbf8f1]"
        >
          {cfg.ctaCopy} — ${cfg.priceUsd}
        </button>
        <p className="text-xs text-white/65 mt-2">
          {cfg.refundWindowDays}-day guarantee · No subscription
        </p>
      </div>
    </aside>
  )
}
