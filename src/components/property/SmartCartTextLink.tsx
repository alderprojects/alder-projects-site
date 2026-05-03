'use client'

// V7 — Property page Smart Cart text link. Quieter sibling to the
// Worth-It card. Renders inline near the affiliate accessory kit
// area for visitors who are about to shop, not yet planning.

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { useEngagementGate } from '@/lib/useEngagementGate'
import type { TopicId } from '@/lib/property-modules'
import { SCOPE_VARIANTS } from '@/lib/scope-variants'

type Props = {
  topic: TopicId | null
  intent: 'owner' | 'buying' | 'researching' | null
}

export default function SmartCartTextLink({ topic, intent }: Props) {
  const cfg = CONFIG.products.smartCart
  const [mounted, setMounted] = useState(false)
  const gate = useEngagementGate()
  const gateOpen = gate.passed

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  if (!gateOpen) return null
  if (intent === 'researching') return null
  if (!topic || !(SCOPE_VARIANTS[topic]?.length)) return null

  return (
    <p className="text-xs text-[#1a1f1a]/70 mt-3">
      Not sure what is actually worth buying?{' '}
      <button
        type="button"
        data-curation-modal-open
        data-curation-modal-product="smart_cart"
        data-curation-modal-topic={topic}
        className="text-[#1f3a2e] underline-offset-2 hover:underline"
      >
        {cfg.ctaCopy} — ${cfg.priceUsd}
      </button>
    </p>
  )
}
