'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MODULES } from '@/lib/property-modules'
import type { PropertyModule, PropertyProfile, VisitorSignals } from '@/lib/property-modules'
import { computeSignalsFromParams, rankModules } from '@/lib/property-ranker'
import {
  pickInlineCta,
  OwnerSummaryFooterCta,
  ResearcherFooterCta,
} from './InlineCta'

// The page renders a stream of property modules ranked by the visitor's
// signal vector. The server pre-renders this with whatever signals come
// from URL params (so non-JS users and crawlers get a sensible top-N).
// On hydration the component re-reads URL + sessionStorage and re-ranks.
//
// The MODULES catalog is imported here, not passed as a prop, because
// each module carries a render function that cannot cross the server →
// client boundary serialization.

const TOP_N = 6

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

  // Suppress the V1 standalone-billboard CTA modules — replaced by
  // inline CTAs inside content modules (see InlineCta.pickInlineCta).
  const filtered = useMemo(() => MODULES.filter(m => m.contentType !== 'cta'), [])
  const ranked = useMemo(() => rankModules(filtered, signals), [signals, filtered])
  const top = ranked.slice(0, TOP_N)
  const rest = ranked.slice(TOP_N)

  // The picker mutates a Set so we cap each CTA-shape at one instance
  // per render pass. Each render of RankedModuleStream gets a fresh set.
  const picked = new Set<string>()

  function renderModuleCard(m: PropertyModule) {
    const cta = pickInlineCta(m, profile, signals, picked)
    return (
      <div key={m.moduleId} data-module-id={m.moduleId}>
        {m.render(profile, signals)}
        {cta}
      </div>
    )
  }

  const isOwnerSummary = signals.topLevelIntent === 'owner' && !signals.topic
  const isResearcher = signals.topLevelIntent === 'researching'

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {top.map(renderModuleCard)}

      {/* State-level CTAs — every state has at least one revenue path,
          even when no module-level CTA fires. */}
      {isOwnerSummary && <OwnerSummaryFooterCta />}
      {isResearcher && <ResearcherFooterCta />}

      {rest.length > 0 && (
        <details
          data-disclosure-id="show_everything_else"
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
