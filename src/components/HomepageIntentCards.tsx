'use client'

import Link from 'next/link'
import { CONFIG } from '@/lib/recommender-config'
import { trackSampleDemoClick } from '@/lib/analytics'

// Three intent cards mirroring the property page's three-button hero.
// Card click = sample-demo click into the intent's pre-built URL.
// Cold-flow goal: visitors without an address still land on a meaningful
// property-page demo configured for their persona.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.06)',
  bg: '#FFFFFF',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'
const FS = "'Playfair Display', Georgia, serif"

const CARDS = [
  {
    key: 'buying' as const,
    label: 'Buying a place?',
    copy: 'Inspection-week checklist by lake, flood, septic, and well risk. Inherited rebate eligibility from the prior owner.',
    cta: 'See a sample buyer view →',
  },
  {
    key: 'owner' as const,
    label: 'Working on your place?',
    copy: 'Real Vermont contractor cost ranges, sequenced step-by-step, stacked rebates. EVT, BED, VGS, federal — all of it.',
    cta: 'See a sample owner view →',
  },
  {
    key: 'researching' as const,
    label: 'Vermont curious?',
    copy: 'Mud season, lake property rules, AMI, property tax windows. Plain language, no buzzwords.',
    cta: 'See Vermont basics →',
  },
]

export default function HomepageIntentCards() {
  const links = CONFIG.homepage.intentDemoLinks

  return (
    <section
      data-component="homepage-intent-cards"
      style={{
        backgroundColor: C.bg,
        padding: 'clamp(56px,8vw,96px) 24px',
        borderTop: `1px solid ${C.cardLine}`,
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <p
          style={{
            fontSize: 11,
            fontFamily: FM,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: C.accent,
            margin: '0 0 10px',
          }}
        >
          What you will see
        </p>
        <h2
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.15,
            margin: '0 0 28px',
          }}
        >
          What we will show you.
        </h2>

        <div
          className="homepage-intent-cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {CARDS.map(card => (
            <Link
              key={card.key}
              href={links[card.key]}
              onClick={() =>
                trackSampleDemoClick({
                  fromSection: 'intent_card',
                  intentDestination: card.key,
                })
              }
              data-intent-destination={card.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 22px',
                border: `1px solid ${C.cardLine}`,
                borderRadius: 4,
                background: '#fff',
                textDecoration: 'none',
                minHeight: 200,
                transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.accent
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,43,26,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.cardLine
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <h3
                style={{
                  fontFamily: FS,
                  fontSize: 20,
                  fontWeight: 600,
                  color: C.ink,
                  margin: '0 0 10px',
                  lineHeight: 1.15,
                }}
              >
                {card.label}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  fontFamily: FB,
                  color: C.inkSoft,
                  lineHeight: 1.55,
                  margin: '0 0 18px',
                  flex: 1,
                }}
              >
                {card.copy}
              </p>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: FM,
                  color: C.accent,
                  letterSpacing: '0.02em',
                }}
              >
                {card.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
