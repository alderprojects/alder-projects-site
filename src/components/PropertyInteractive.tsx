'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropertyHero from './PropertyHero'
import RankedModuleStream from './RankedModuleStream'
import VermontBasicsSection from './VermontBasicsSection'
import type {
  PropertyProfile,
  TopicId,
  TopLevelIntent,
  VisitorSignals,
} from '@/lib/property-modules'
import { classifyIntentMode, computeSignalsFromParams } from '@/lib/property-ranker'

// PropertyInteractive lifts the {intent, topic} state out of PropertyHero
// and RankedModuleStream so a click on the hero never triggers a route
// change and never resets scroll. URL gets written via
// window.history.replaceState in a useEffect; both children read from
// component-local state.
//
// The PropertyChat sidebar still reads useSearchParams for its page-state
// awareness. After replaceState the URL has changed but Next's
// useSearchParams hook has not refreshed (since no Next route event
// fired), so we also fire a window event 'alder:signalsChanged' that
// PropertyChat listens for to update its tracked currentTopic / scope.

type Props = {
  profile: PropertyProfile
  initialSignals: VisitorSignals
  // True when the URL explicitly carried ?intent=… so we know to honour
  // that as the visitor's choice (vs the default-fallback 'researching'
  // value that computeSignalsFromParams returns when intent is absent).
  // Without this, an explicit ?intent=researching gets collapsed back
  // to "no intent picked yet" and the page renders the wrong branch.
  hadExplicitIntent: boolean
}

export default function PropertyInteractive({ profile, initialSignals, hadExplicitIntent }: Props) {
  const [intent, setIntent] = useState<TopLevelIntent | null>(
    hadExplicitIntent ? initialSignals.topLevelIntent : null
  )
  const [topic, setTopic] = useState<TopicId | null>(initialSignals.topic)

  // Recompute signals whenever the visitor changes intent / topic. mode
  // and scope ride along automatically (classifyIntentMode + inferScope
  // inside computeSignalsFromParams).
  const signals = useMemo<VisitorSignals>(() => {
    return computeSignalsFromParams(
      {
        intent: intent ?? undefined,
        topic: topic ?? undefined,
      },
      profile,
      initialSignals.sessionDepth
    )
    // intent / topic / profile cover everything that affects the result.
  }, [intent, topic, profile, initialSignals.sessionDepth])

  // Mirror state to URL via replaceState — bookmark-friendly, no scroll.
  // Also broadcast so PropertyChat can keep its page-state in sync.
  const firstRenderRef = useRef(true)
  useEffect(() => {
    if (firstRenderRef.current) {
      // Skip the initial pass: URL already reflects whatever brought us here.
      firstRenderRef.current = false
      return
    }
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (intent) params.set('intent', intent)
    else params.delete('intent')
    if (topic) {
      params.set('topic', topic)
      if (intent) params.set('mode', classifyIntentMode(intent, topic))
    } else {
      params.delete('topic')
      if (intent) params.set('mode', classifyIntentMode(intent, null))
    }
    // Strip legacy scope param — scope is inferred now.
    params.delete('scope')
    const next = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`
    window.history.replaceState(window.history.state, '', next)
    window.dispatchEvent(
      new CustomEvent('alder:signalsChanged', {
        detail: { intent, topic, mode: signals.intentMode, scope: signals.scope },
      })
    )
  }, [intent, topic, signals.intentMode, signals.scope])

  const onPickIntent = useCallback((next: TopLevelIntent) => {
    setIntent(next)
    setTopic(null)
  }, [])

  const onPickTopic = useCallback((next: TopicId | null) => {
    setTopic(next)
  }, [])

  // Researcher branch: skip the ranked module stream entirely. Vermont
  // basics is its own curated experience — six topic cards + a bottom
  // "try another address" link. No costs, no contractor CTAs, no
  // affiliate items.
  const isResearching = intent === 'researching'

  return (
    <>
      <PropertyHero profile={profile} intent={intent} topic={topic} onPickIntent={onPickIntent} onPickTopic={onPickTopic} />
      {isResearching ? (
        <VermontBasicsSection />
      ) : (
        <RankedModuleStream profile={profile} signals={signals} />
      )}
    </>
  )
}
