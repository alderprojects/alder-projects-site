'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MODULES } from '@/lib/property-modules'
import type {
  PropertyProfile,
  VisitorSignals,
  TopLevelIntent,
  IntentMode,
  TopicId,
  Scope,
} from '@/lib/property-modules'
import { classifyIntentMode, rankModules, detectRefundRisk } from '@/lib/property-ranker'

// The page renders a stream of property modules ranked by the visitor's
// signal vector. The server pre-renders this with whatever signals come
// from URL params (so non-JS users and crawlers get a sensible top-N).
// On hydration the component re-reads URL + sessionStorage and re-ranks.
//
// The MODULES catalog is imported here, not passed as a prop, because
// each module carries a render function that cannot cross the server →
// client boundary serialization.

const TOP_N = 6

const TOP_LEVEL_INTENTS: TopLevelIntent[] = ['buying', 'owner', 'looking', 'researching']
const INTENT_MODES: IntentMode[] = ['decide', 'do', 'understand', 'lookup', 'handle']
const SCOPES: Scope[] = ['diy', 'mid', 'big', 'na']
const TOPIC_VALUES = new Set<TopicId>([
  'heat_pump',
  'kitchen',
  'bath',
  'solar_battery',
  'outdoor',
  'addition_adu',
  'weatherization',
  'rebate_strat',
  'property_tax',
  'flood_zone',
  'rebate_eligibility',
  'contractor_vetting',
  'general_orientation',
  'mud_season',
  'well_septic',
])

function asIntent(s: string | null | undefined): TopLevelIntent {
  return s && TOP_LEVEL_INTENTS.includes(s as TopLevelIntent) ? (s as TopLevelIntent) : 'researching'
}
function asMode(s: string | null | undefined): IntentMode | null {
  return s && INTENT_MODES.includes(s as IntentMode) ? (s as IntentMode) : null
}
function asScope(s: string | null | undefined): Scope {
  return s && SCOPES.includes(s as Scope) ? (s as Scope) : 'na'
}
function asTopic(s: string | null | undefined): TopicId | null {
  return s && TOPIC_VALUES.has(s as TopicId) ? (s as TopicId) : null
}

export function computeSignalsFromParams(
  params: { intent?: string; topic?: string; mode?: string; scope?: string; from?: string },
  profile: PropertyProfile,
  sessionDepth = 0
): VisitorSignals {
  const intent = asIntent(params.intent)
  const topic = asTopic(params.topic)
  const mode = asMode(params.mode) ?? classifyIntentMode(intent, topic)
  const scope = asScope(params.scope)
  const cameFromArticleSlug = params.from ?? null
  const refundRiskFlag = detectRefundRisk({ topLevelIntent: intent, cameFromArticleSlug })
  return {
    topLevelIntent: intent,
    intentMode: mode,
    topic,
    scope,
    townTier: profile.bucket,
    utilityServiceArea: profile.utility,
    refundRiskFlag,
    sessionDepth,
    cameFromArticleSlug,
  }
}

const C = {
  bg: '#FAF7F2',
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

type Props = {
  profile: PropertyProfile
  initialSignals: VisitorSignals
}

export default function RankedModuleStream({ profile, initialSignals }: Props) {
  const searchParams = useSearchParams()
  const [signals, setSignals] = useState<VisitorSignals>(initialSignals)

  // Re-derive signals whenever URL params change. Also pull in any
  // sessionStorage hints that were not already in the URL (in v1 there
  // are none, but the storage is the future home of newcomer / framing
  // toggles in v2).
  useEffect(() => {
    if (!searchParams) return
    const next = computeSignalsFromParams(
      {
        intent: searchParams.get('intent') ?? undefined,
        topic: searchParams.get('topic') ?? undefined,
        mode: searchParams.get('mode') ?? undefined,
        scope: searchParams.get('scope') ?? undefined,
        from: searchParams.get('from') ?? undefined,
      },
      profile,
      signals.sessionDepth + 1
    )
    setSignals(prev => (shallowEqualSignals(prev, next) ? prev : next))
    // signals.sessionDepth deliberately omitted to avoid loop; depth bumps once per param change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, profile])

  const ranked = useMemo(() => rankModules(MODULES, signals), [signals])
  const top = ranked.slice(0, TOP_N)
  const rest = ranked.slice(TOP_N)

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {top.map(m => (
        <div key={m.moduleId} data-module-id={m.moduleId}>
          {m.render(profile, signals)}
        </div>
      ))}
      {rest.length > 0 && (
        <details
          style={{
            marginTop: 8,
            border: `1px solid ${C.cardLine}`,
            borderRadius: 6,
            padding: '12px 16px',
            background: '#fff',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.accent,
              fontWeight: 600,
            }}
          >
            Show everything else ({rest.length})
          </summary>
          <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: '8px 0 12px' }}>
            Lower-ranked for your current path. Still here if you want it.
          </p>
          <div style={{ display: 'grid', gap: 16 }}>
            {rest.map(m => (
              <div key={m.moduleId} data-module-id={m.moduleId}>
                {m.render(profile, signals)}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function shallowEqualSignals(a: VisitorSignals, b: VisitorSignals): boolean {
  return (
    a.topLevelIntent === b.topLevelIntent &&
    a.intentMode === b.intentMode &&
    a.topic === b.topic &&
    a.scope === b.scope &&
    a.townTier === b.townTier &&
    a.utilityServiceArea === b.utilityServiceArea &&
    a.refundRiskFlag === b.refundRiskFlag &&
    a.cameFromArticleSlug === b.cameFromArticleSlug
  )
}
