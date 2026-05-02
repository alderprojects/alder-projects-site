'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { PropertyProfile, TopicId, TopLevelIntent } from '@/lib/property-modules'
import { classifyIntentMode } from '@/lib/property-ranker'

// Two-click hero. The visitor's first click picks one of three top-level
// intents; the second click (a project tile, a question chip, or the
// chat input) sets the topic and implicitly the intent mode. We never
// ask a second explicit question — the second signal is the topic.
//
// Signals are written to URL params (?intent=...&topic=...) so the
// page is shareable and the SSR'd ranker has them on the next render.
// They are also mirrored to sessionStorage under 'alder.propertySignals'
// for cross-session persistence within the tab.
//
// Chat-input prompts are stashed in sessionStorage under
// 'alder.chatPendingPrompt' and broadcast via an 'alder:chatPrompt'
// CustomEvent so PropertyChat (commit 6) can pick them up.

type Props = {
  profile: PropertyProfile
}

const TOP_LEVEL: { id: TopLevelIntent; label: string; sub: string }[] = [
  { id: 'buying', label: 'The deal with this property', sub: 'I am looking at this place' },
  { id: 'owner', label: 'Help with my place', sub: 'I own this property' },
  { id: 'researching', label: 'Information about Vermont', sub: 'I just want to learn' },
]

const PROJECT_TILES: { id: TopicId; label: string; sub: string }[] = [
  { id: 'heat_pump', label: 'Heat pump / weatherization', sub: 'The big VT retrofit' },
  { id: 'kitchen', label: 'Kitchen', sub: 'Refresh, mid, gut' },
  { id: 'bath', label: 'Bathroom', sub: 'From paint to full gut' },
  { id: 'solar_battery', label: 'Solar + battery', sub: 'Net metering, 25D' },
  { id: 'outdoor', label: 'Decks + outdoor', sub: 'Setbacks, shoreline' },
  { id: 'addition_adu', label: 'Addition or ADU', sub: 'Act 47, septic gating' },
  { id: 'weatherization', label: 'Weatherization', sub: 'EVT 75% / 90% tier' },
  { id: 'rebate_strat', label: 'Rebate strategy', sub: 'Stack the stack' },
]

const QUESTION_CHIPS: { id: TopicId; label: string }[] = [
  { id: 'property_tax', label: 'Property tax cycle' },
  { id: 'flood_zone', label: 'Flood / shoreland / corridor' },
  { id: 'rebate_eligibility', label: 'Am I rebate-eligible?' },
  { id: 'contractor_vetting', label: 'Vetting a contractor' },
  { id: 'general_orientation', label: 'New to Vermont' },
  { id: 'mud_season', label: 'Mud season timing' },
]

const SUMMARY_TILE_ID = '__summary__'

const C = {
  bg: '#FAF7F2',
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  cardLineStrong: 'rgba(28,43,26,0.18)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.12)',
  green: '#1C2B1A',
  greenInk: '#F5EFE0',
  pillBg: 'rgba(122,155,111,0.12)',
}
const FD = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export default function PropertyHero({ profile }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlIntent = searchParams?.get('intent') as TopLevelIntent | null
  const urlTopic = searchParams?.get('topic') as TopicId | null
  const [intent, setIntent] = useState<TopLevelIntent | null>(urlIntent ?? null)

  const tileGroupRef = useRef<HTMLDivElement>(null)

  // Hydrate from sessionStorage on first mount if URL is bare. URL wins
  // when present so shareable links never get overwritten by stale storage.
  useEffect(() => {
    if (urlIntent || urlTopic) return
    try {
      const raw = sessionStorage.getItem('alder.propertySignals')
      if (!raw) return
      const stored = JSON.parse(raw) as { intent?: TopLevelIntent; topic?: TopicId }
      if (stored?.intent) setIntent(stored.intent)
    } catch {
      /* ignore */
    }
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function persistAndRoute(next: { intent: TopLevelIntent; topic: TopicId | null }) {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('intent', next.intent)
    if (next.topic) {
      params.set('topic', next.topic)
      params.set('mode', classifyIntentMode(next.intent, next.topic))
    } else {
      params.delete('topic')
      params.set('mode', classifyIntentMode(next.intent, null))
    }
    // Strip any legacy scope param — scope is now inferred, not asked.
    params.delete('scope')
    try {
      sessionStorage.setItem(
        'alder.propertySignals',
        JSON.stringify({ intent: next.intent, topic: next.topic })
      )
    } catch {
      /* ignore */
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function pickIntent(id: TopLevelIntent) {
    setIntent(id)
    persistAndRoute({ intent: id, topic: null })
  }

  function pickTopic(id: TopicId | typeof SUMMARY_TILE_ID) {
    if (!intent) return
    if (id === SUMMARY_TILE_ID) {
      persistAndRoute({ intent, topic: null })
      return
    }
    persistAndRoute({ intent, topic: id })
  }

  // Roving-tabindex arrow-key nav across tiles/chips for keyboard users.
  function onTileKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const focusable = tileGroupRef.current?.querySelectorAll<HTMLButtonElement>('button[data-tile]')
    if (!focusable || focusable.length === 0) return
    const arr = Array.from(focusable)
    const idx = arr.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      arr[(idx + 1) % arr.length]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      arr[(idx - 1 + arr.length) % arr.length]?.focus()
    }
  }

  return (
    <section
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 8,
        padding: '32px 28px 28px',
        marginBottom: 32,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontFamily: FM,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.accent,
          marginBottom: 12,
        }}
      >
        {pickerKicker(intent)}
      </p>

      {!intent && (
        <h2
          style={{
            fontFamily: FD,
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.2,
            margin: '0 0 24px',
          }}
        >
          What do you want from {profile.town}?
        </h2>
      )}

      {/* Top-level intent buttons — always present, but compact after first click. */}
      <div
        role="radiogroup"
        aria-label="What kind of visitor are you"
        style={{
          display: 'grid',
          gridTemplateColumns: intent
            ? 'repeat(auto-fit, minmax(180px, 1fr))'
            : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: intent ? 24 : 8,
        }}
      >
        {TOP_LEVEL.map(opt => {
          const selected = intent === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${opt.label}. ${opt.sub}`}
              onClick={() => pickIntent(opt.id)}
              style={{
                textAlign: 'left',
                padding: intent ? '10px 14px' : '18px 20px',
                border: `1px solid ${selected ? C.accent : C.cardLine}`,
                borderRadius: 6,
                background: selected ? C.accentSoft : C.bg,
                cursor: 'pointer',
                fontFamily: FB,
                color: C.ink,
                transition: 'background-color 150ms ease, border-color 150ms ease',
              }}
            >
              <p style={{ fontSize: intent ? 13 : 15, fontWeight: 600, margin: 0 }}>{opt.label}</p>
              {!intent && (
                <p style={{ fontSize: 12, color: C.inkSoft, margin: '4px 0 0' }}>{opt.sub}</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Mixed picker — appears after intent is chosen. Branched by intent:
          owners get project tiles; buyers and researchers see only question
          chips (the questions that matter pre-purchase or in the abstract). */}
      {intent && (
        <div
          ref={tileGroupRef}
          onKeyDown={onTileKeyDown}
          style={{
            display: 'grid',
            gap: 18,
            paddingTop: 8,
            borderTop: `1px solid ${C.cardLine}`,
            marginTop: 4,
          }}
        >
          {/* Project tiles — owner only. */}
          {intent === 'owner' && (
          <div>
            <p
              style={{
                fontSize: 11,
                fontFamily: FM,
                color: C.inkFaint,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: '16px 0 10px',
              }}
            >
              Pick a project
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
              }}
            >
              {PROJECT_TILES.map((t, i) => {
                const selected = urlTopic === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    data-tile
                    tabIndex={i === 0 ? 0 : -1}
                    aria-label={`${t.label}. ${t.sub}`}
                    aria-pressed={selected}
                    onClick={() => pickTopic(t.id)}
                    style={tileStyle(selected)}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: C.ink }}>{t.label}</p>
                    <p style={{ fontSize: 11, color: C.inkSoft, margin: '4px 0 0' }}>{t.sub}</p>
                  </button>
                )
              })}
              <button
                type="button"
                data-tile
                tabIndex={-1}
                aria-label="Just want a summary — show curated three of everything"
                onClick={() => pickTopic(SUMMARY_TILE_ID)}
                style={{
                  ...tileStyle(false),
                  borderStyle: 'dashed',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: C.ink }}>Just want a summary</p>
                <p style={{ fontSize: 11, color: C.inkSoft, margin: '4px 0 0' }}>Three of everything, curated</p>
              </button>
            </div>
          </div>
          )}

          {/* Question chips */}
          <div>
            <p
              style={{
                fontSize: 11,
                fontFamily: FM,
                color: C.inkFaint,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: '4px 0 10px',
              }}
            >
              {intent === 'owner' ? 'Or a question' : 'Pick a question'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {QUESTION_CHIPS.map(q => {
                const selected = urlTopic === q.id
                return (
                  <button
                    key={q.id}
                    type="button"
                    data-tile
                    tabIndex={-1}
                    aria-label={q.label}
                    aria-pressed={selected}
                    onClick={() => pickTopic(q.id)}
                    style={chipStyle(selected)}
                  >
                    {q.label}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </section>
  )

  function tileStyle(selected: boolean): React.CSSProperties {
    return {
      textAlign: 'left',
      padding: '12px 14px',
      border: `1px solid ${selected ? C.accent : C.cardLine}`,
      borderRadius: 4,
      background: selected ? C.accentSoft : C.bg,
      cursor: 'pointer',
      fontFamily: FB,
    }
  }

  function chipStyle(selected: boolean): React.CSSProperties {
    return {
      padding: '8px 14px',
      border: `1px solid ${selected ? C.accent : C.cardLine}`,
      borderRadius: 999,
      background: selected ? C.accentSoft : C.bg,
      cursor: 'pointer',
      fontFamily: FB,
      fontSize: 12,
      fontWeight: 500,
      color: C.ink,
    }
  }
}

function pickerKicker(intent: TopLevelIntent | null): string {
  if (!intent) return 'Where are you starting from'
  if (intent === 'owner') return 'Pick a project, a question, or ask'
  if (intent === 'buying') return 'What do you want to know about this place'
  return 'What would you like to know'
}
