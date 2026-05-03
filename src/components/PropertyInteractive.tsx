'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropertyHero from './PropertyHero'
import RankedModuleStream from './RankedModuleStream'
import VermontBasicsSection from './VermontBasicsSection'
import RecommendationStrip from './RecommendationStrip'
import AccessoryKit from './AccessoryKit'
import type {
  PropertyProfile,
  TopicId,
  TopLevelIntent,
  VisitorSignals,
} from '@/lib/property-modules'
import { classifyIntentMode, computeSignalsFromParams } from '@/lib/property-ranker'
import { getRecommendations, type Recommendation } from '@/lib/topic-recommender'
import { getAccessoryKits } from '@/lib/accessory-recommender'
import { useEngagementGate } from '@/lib/useEngagementGate'
import { inferSeason, isLakeProperty, isFloodProperty } from '@/lib/season-helpers'
import { CONFIG } from '@/lib/recommender-config'
import {
  trackEngagementGatePassed,
  trackSeasonalContext,
  trackRenderDecision,
} from '@/lib/analytics'

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

  // Mirror state to URL via window.history.replaceState — bookmark-
  // friendly AND no scroll-to-top. We deliberately use the raw browser
  // API rather than next/navigation's useRouter().replace() because
  // the Next router treats replace() as a navigation: it kicks off a
  // server-component refresh, which mounts a new <main> element and
  // resets window.scrollY. replaceState updates the URL bar and the
  // history stack without any of that — the React tree is preserved
  // in place and our scroll position survives. (Verified: V4 audit
  // confirmed PropertyFraming was the only remaining consumer of
  // router.push on /property/[slug]; it is now feature-flagged off in
  // commit 17 of this pass, removing the last nav-triggering call.)
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

  // Engagement gate — passes once the visitor has scrolled past the
  // CONFIG threshold, opened chat, clicked a cost tier, or hit the
  // time threshold. Recs + accessory kits stay hidden until then so
  // we don't push affiliate links at a bouncing visitor.
  const engagement = useEngagementGate()

  // Cross-topic recommendations — empty for buyers (no topic), refund-
  // risk personas, and visitors with topics that have no edges in the
  // affinity matrix. Memoize on signals so we don't recompute every
  // engagement-tick.
  const season = useMemo(() => inferSeason(new Date()), [])
  const recommendations = useMemo<Recommendation[]>(
    () => getRecommendations(signals, { season, k: 3 }),
    [signals, season]
  )

  // Accessory kits — count + ids driven by the V5 decision tree, scored
  // by the V5 revenue forest. Researchers / refund-risk personas hit
  // zero-upsell branches and get []. Re-runs once engagement passes so
  // the engagementSignal feature flips on for the second-pass scoring.
  const accessoryKits = useMemo(
    () => getAccessoryKits(signals, profile, engagement.passed),
    [signals, profile, engagement.passed]
  )

  // Recommendation click handler: pick the new topic and let the URL
  // sync useEffect mirror it via replaceState (no scroll, no navigate).
  const onPickRecommendation = useCallback((toTopic: TopicId, _rec: Recommendation) => {
    setTopic(toTopic)
  }, [])

  // Common analytics envelope shared with child surfaces. Device is a
  // simple width threshold (matches the 600px breakpoint Tailwind uses
  // for the property-grid stack).
  const device = useMemo<'mobile' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop'
    return window.innerWidth < 600 ? 'mobile' : 'desktop'
  }, [])
  const analyticsCtx = useMemo(
    () => ({
      intent: signals.topLevelIntent,
      topic: signals.topic ?? undefined,
      town: profile.town,
      townTier: signals.townTier,
      device,
    }),
    [signals.topLevelIntent, signals.topic, signals.townTier, profile.town, device]
  )

  // One-shot mount events: seasonal_context + render_decision. Refire
  // render_decision when signals change (re-rank), but seasonal_context
  // is stable for the page lifetime.
  const seasonalContextFiredRef = useRef(false)
  useEffect(() => {
    if (seasonalContextFiredRef.current) return
    seasonalContextFiredRef.current = true
    trackSeasonalContext({
      ...analyticsCtx,
      season,
      isLakeProperty: isLakeProperty(profile),
      isFloodProperty: isFloodProperty(profile),
    })
  }, [analyticsCtx, profile, season])

  useEffect(() => {
    if (isResearching) return
    // Lightweight render-decision snapshot. Module IDs come from the
    // ranker-decided inline set; we approximate with the recommended
    // topics + accessory-kit ids since this client doesn't ingest the
    // full ranked list. The intent is to track which CONFIG produced
    // the surface — exact module IDs flow through GA4 BigQuery export.
    trackRenderDecision({
      ...analyticsCtx,
      inlineModuleIds: [
        ...recommendations.map(r => `rec_${r.topicId}`),
        ...accessoryKits.map(k => `kit_${k.id}`),
      ],
      hiddenModuleCount: 0,
      topModuleScore: recommendations[0]?.score ?? 0,
      bottomModuleScore: recommendations[recommendations.length - 1]?.score ?? 0,
      configVersion: CONFIG.version,
    })
  }, [analyticsCtx, recommendations, accessoryKits, isResearching])

  // engagement_gate_passed — fire once when the gate flips.
  const engagementGateFiredRef = useRef(false)
  useEffect(() => {
    if (engagementGateFiredRef.current) return
    if (!engagement.passed || !engagement.trigger) return
    engagementGateFiredRef.current = true
    trackEngagementGatePassed({
      ...analyticsCtx,
      trigger: engagement.trigger,
      timeOnPage: engagement.secondsUntilPassed ?? 0,
    })
  }, [engagement.passed, engagement.trigger, engagement.secondsUntilPassed, analyticsCtx])

  return (
    <>
      <PropertyHero profile={profile} intent={intent} topic={topic} onPickIntent={onPickIntent} onPickTopic={onPickTopic} />
      {isResearching ? (
        <VermontBasicsSection />
      ) : (
        <>
          <RankedModuleStream profile={profile} signals={signals} />

          {/* Engagement-gated revenue surfaces. Order:
                1. Direct accessory kit (highest revenue match)
                2. Project↔project recommendations
                3. Adjacent accessory kit (lower-revenue, broader)
              All hidden until the visitor demonstrates engagement. */}
          {engagement.passed && accessoryKits[0] && (
            <AccessoryKit
              kit={accessoryKits[0]}
              placement="topic_module_inline"
              analyticsCtx={analyticsCtx}
            />
          )}
          {engagement.passed && (
            <RecommendationStrip
              recs={recommendations}
              signals={signals}
              onPick={onPickRecommendation}
              analyticsCtx={{
                ...analyticsCtx,
                engagementGateReason: engagement.trigger ?? 'unknown',
              }}
            />
          )}
          {engagement.passed && accessoryKits[1] && (
            <AccessoryKit
              kit={accessoryKits[1]}
              placement="after_recommendations"
              analyticsCtx={analyticsCtx}
            />
          )}
        </>
      )}
    </>
  )
}
