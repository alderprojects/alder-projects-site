'use client'

// V7.1 — Property page Smart Cart CTA card. Mirrors WorthItCTACard
// behavior (engagement-gated, refund-risk suppressed for the
// 'researching' intent) and pre-fills CurationModal with the topic
// + scope inferred from the page's URL params + the property
// address. Sits next to WorthItCTACard above the affiliate kit
// surfaces.

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'
import { useEngagementGate } from '@/lib/useEngagementGate'
import type { TopicId } from '@/lib/property-modules'
import { SCOPE_VARIANTS } from '@/lib/scope-variants'

type Props = {
  topic: TopicId | null
  intent: 'owner' | 'buying' | 'researching' | null
  address?: string
  slug?: string
}

const TOPIC_LABEL: Partial<Record<TopicId, string>> = {
  kitchen: 'kitchen',
  weatherization: 'weatherization',
  outdoor: 'outdoor',
  heat_pump: 'heat pump',
  bath: 'bath',
}

export default function SmartCartCTACard({ topic, intent, address, slug }: Props) {
  const cfg = CONFIG.products.smartCart
  const [mounted, setMounted] = useState(false)
  const gate = useEngagementGate()
  const gateOpen = gate.passed

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  if (!gateOpen) return null
  if (intent === 'researching') return null
  if (!topic || !(SCOPE_VARIANTS[topic]?.length)) return null

  const defaultVariant = SCOPE_VARIANTS[topic][0]
  const scenario =
    intent === 'buying' ? 'just_starting'
    : intent === 'owner' ? 'already_have_basics'
    : 'just_starting'

  return (
    <aside className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 my-6 grid md:grid-cols-3 gap-6 items-center">
      <div className="md:col-span-2">
        <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/55 mb-2">
          {cfg.productName}
        </div>
        <h3 className="font-display text-2xl text-[#1f3a2e] mb-2">
          Build the lean cart for this {TOPIC_LABEL[topic] ?? 'project'}
        </h3>
        <p className="text-sm text-[#1a1f1a]/85">
          {formatPrice(cfg.priceUsd)} · Lean shopping list, skip list,
          overbuy traps. 30-day saved view.
        </p>
      </div>
      <div className="text-right md:text-right">
        <button
          type="button"
          data-curation-modal-open
          data-curation-modal-product="smart_cart"
          data-curation-modal-topic={topic}
          data-curation-modal-scope={defaultVariant?.id}
          data-curation-modal-scenario={scenario}
          data-curation-modal-address={address ?? ''}
          data-curation-modal-slug={slug ?? ''}
          className="bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-5 py-3 rounded-lg"
        >
          Build my Smart Cart →
        </button>
        <p className="text-xs text-[#1a1f1a]/65 mt-2">
          {cfg.refundWindowHours}-hour refund window · No subscription
        </p>
      </div>
    </aside>
  )
}
