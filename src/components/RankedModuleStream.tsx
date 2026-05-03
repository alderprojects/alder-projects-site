'use client'

import { useMemo } from 'react'
import { MODULES } from '@/lib/property-modules'
import type { PropertyModule, PropertyProfile, VisitorSignals } from '@/lib/property-modules'
import { rankModules, shouldRenderInline } from '@/lib/property-ranker'
import {
  pickInlineCta,
  OwnerSummaryFooterCta,
  ResearcherFooterCta,
} from './InlineCta'
import Disclosure from './Disclosure'

// The page renders a stream of property modules ranked by the visitor's
// signal vector. signals are owned by PropertyInteractive above — this
// component is a pure presentation layer that re-runs the ranker
// whenever signals change. The MODULES catalog is imported here (not
// passed as a prop) because each module carries a render function that
// cannot cross the server → client boundary serialization.

type Props = {
  profile: PropertyProfile
  signals: VisitorSignals
}

export default function RankedModuleStream({ profile, signals }: Props) {
  // Suppress the V1 standalone-billboard CTA modules — replaced by
  // inline CTAs inside content modules (see InlineCta.pickInlineCta).
  const filtered = useMemo(() => MODULES.filter(m => m.contentType !== 'cta'), [])
  const ranked = useMemo(() => rankModules(filtered, signals), [signals, filtered])
  // Render-floor split: passing modules get the main flow; failing ones
  // go inside the "Show everything else" disclosure.
  const top = ranked.filter(m => shouldRenderInline(m, signals))
  const rest = ranked.filter(m => !shouldRenderInline(m, signals))

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
      {isOwnerSummary && <OwnerSummaryFooterCta profile={profile} signals={signals} />}
      {isResearcher && <ResearcherFooterCta />}

      {rest.length > 0 && (
        <Disclosure
          label={`Show everything else (${rest.length})`}
          hint="Lower-ranked for your current path. Still here if you want it."
        >
          {rest.map(m => (
            <div key={m.moduleId} data-module-id={m.moduleId}>
              {m.render(profile, signals)}
            </div>
          ))}
        </Disclosure>
      )}
    </div>
  )
}

