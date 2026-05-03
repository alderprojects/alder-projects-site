'use client'

import { useState, useEffect, useRef } from 'react'
import { CONFIG } from './recommender-config'

// useEngagementGate returns true once the visitor has signaled
// engagement: scroll past CONFIG.engagementGate.scrollDepthPercent,
// time on page past CONFIG.engagementGate.timeOnPageSeconds, the chat
// has been opened, or a cost-tier accordion was clicked.
//
// Recommendations and accessory kits gate on this — we don't push
// affiliate links or cross-topic recs at a bouncing visitor. Both the
// chat and cost-tier signals are wired via window CustomEvents
// dispatched from the corresponding components (ChatWidget, cost-tier
// accordion). When triggers don't include 'time' or 'scroll' the hook
// only listens for those events.
//
// Returns { passed, trigger, secondsUntilPassed } so callers (analytics)
// know which signal flipped the gate and how long it took.

export type EngagementResult = {
  passed: boolean
  trigger: string | null
  secondsUntilPassed: number | null
}

export function useEngagementGate(): EngagementResult {
  const [passed, setPassed] = useState(false)
  const [trigger, setTrigger] = useState<string | null>(null)
  const startMs = useRef<number>(0)
  const passedAtMs = useRef<number | null>(null)

  useEffect(() => {
    if (passed) return
    if (typeof window === 'undefined') return
    startMs.current = Date.now()

    const cfg = CONFIG.engagementGate
    const triggers = cfg.requireOneOf
    const handlers: Array<() => void> = []

    function flip(which: string) {
      if (passedAtMs.current !== null) return
      passedAtMs.current = Date.now()
      setTrigger(which)
      setPassed(true)
    }

    if (triggers.includes('scroll')) {
      const onScroll = () => {
        const doc = document.documentElement
        const total = doc.scrollHeight - window.innerHeight
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0
        if (pct >= cfg.scrollDepthPercent) flip('scroll')
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      handlers.push(() => window.removeEventListener('scroll', onScroll))
    }

    if (triggers.includes('time')) {
      const t = setTimeout(() => flip('time'), cfg.timeOnPageSeconds * 1000)
      handlers.push(() => clearTimeout(t))
    }

    if (triggers.includes('chat')) {
      const onChat = () => flip('chat')
      window.addEventListener('alder.chat-opened', onChat)
      handlers.push(() => window.removeEventListener('alder.chat-opened', onChat))
    }

    if (triggers.includes('cost_tier')) {
      const onCost = () => flip('cost_tier')
      window.addEventListener('alder.cost-tier-clicked', onCost)
      handlers.push(() => window.removeEventListener('alder.cost-tier-clicked', onCost))
    }

    return () => handlers.forEach(h => h())
  }, [passed])

  const secondsUntilPassed =
    passedAtMs.current !== null && startMs.current > 0
      ? (passedAtMs.current - startMs.current) / 1000
      : null

  return { passed, trigger, secondsUntilPassed }
}
