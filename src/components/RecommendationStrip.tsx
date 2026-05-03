'use client'

import { useCallback } from 'react'
import type { Recommendation } from '@/lib/topic-recommender'
import type { TopicId, VisitorSignals } from '@/lib/property-modules'

// Renders the project↔project recommendation strip — 2-3 horizontally-
// stacked cards (vertical on mobile). Each card shows a one-line
// reasoning + a "go" arrow. Click updates the URL via replaceState
// (no scroll, no Next route event) and re-ranks the page in place.
//
// Hidden entirely when recs is empty (no topic, refund-risk persona,
// or no edges in the affinity matrix above the score threshold).

const C = {
  bg: '#FAF7F2',
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.12)',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

type Props = {
  recs: Recommendation[]
  signals: VisitorSignals
  // Called when a card is clicked — parent owns the topic state.
  // Parent should call setTopic(toTopic) and let URL replaceState
  // happen via PropertyInteractive's useEffect.
  onPick: (toTopic: TopicId, rec: Recommendation) => void
}

const TOPIC_LABEL: Partial<Record<TopicId, string>> = {
  heat_pump: 'Heat pump / weatherization',
  weatherization: 'Weatherization',
  kitchen: 'Kitchen',
  bath: 'Bathroom',
  solar_battery: 'Solar + battery',
  outdoor: 'Decks + outdoor',
  addition_adu: 'Addition or ADU',
  rebate_strat: 'Rebate strategy',
  rebate_eligibility: 'Am I rebate-eligible?',
  contractor_vetting: 'Vetting a contractor',
  property_tax: 'Property tax cycle',
  flood_zone: 'Flood / shoreland / corridor',
  general_orientation: 'New to Vermont',
  mud_season: 'Mud season timing',
  well_septic: 'Well + septic',
}

function topicLabel(t: TopicId): string {
  return TOPIC_LABEL[t] ?? t
}

export default function RecommendationStrip({ recs, signals, onPick }: Props) {
  const onClick = useCallback(
    (rec: Recommendation) => {
      onPick(rec.topicId, rec)
    },
    [onPick]
  )

  if (recs.length === 0) return null

  return (
    <section
      data-component="recommendation-strip"
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
        padding: '18px 20px',
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.accent,
          margin: '0 0 6px',
        }}
      >
        What people on this path usually ask next
      </p>
      <p style={{ fontSize: 14, fontFamily: FB, color: C.ink, fontWeight: 600, margin: '0 0 14px' }}>
        Adjacent to {topicLabel(signals.topic ?? 'general_orientation')}
      </p>

      <div
        className="rec-strip-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {recs.map((rec, idx) => (
          <button
            key={rec.topicId}
            type="button"
            onClick={() => onClick(rec)}
            data-rec-position={idx}
            data-rec-topic={rec.topicId}
            style={{
              textAlign: 'left',
              padding: '14px 16px',
              border: `1px solid ${C.cardLine}`,
              borderRadius: 6,
              background: C.bg,
              cursor: 'pointer',
              fontFamily: FB,
              transition: 'border-color 150ms ease, background-color 150ms ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.accent
              e.currentTarget.style.background = C.accentSoft
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.cardLine
              e.currentTarget.style.background = C.bg
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>
              {topicLabel(rec.topicId)}
            </p>
            <p style={{ fontSize: 12, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
              {rec.reasoning}
            </p>
            <p style={{ fontSize: 11, fontFamily: FM, color: C.accent, margin: 0, fontWeight: 600 }}>
              Show me →
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
