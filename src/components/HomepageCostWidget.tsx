'use client'

import Link from 'next/link'
import { CONFIG } from '@/lib/recommender-config'
import {
  trackHomepageCostRowClick,
  trackSampleDemoClick,
} from '@/lib/analytics'

// Homepage cost widget. Statewide ranges only — by-address synthesis
// stays the property page's job. Each row links to the demo property
// page with the row's topic prefilled, so a click is also a sample-demo
// click. Two trackers fire per click: trackHomepageCostRowClick (for
// row-level CTR) and trackSampleDemoClick (for the homepage funnel).

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

function fmtK(n: number): string {
  return '$' + Math.round(n / 1000) + 'k'
}

// Build the demo URL for a given topic. The CONFIG owner-intent demo
// link defaults to topic=heat_pump; we replace the topic param in place.
function demoUrlForTopic(topicId: string): string {
  const ownerLink = CONFIG.homepage.intentDemoLinks.owner
  return ownerLink.replace(/topic=[^&]+/, `topic=${topicId}`)
}

export default function HomepageCostWidget() {
  const cfg = CONFIG.homepage.costWidget
  if (!cfg.enabled) return null

  return (
    <section
      data-component="homepage-cost-widget"
      style={{
        backgroundColor: C.bg,
        padding: 'clamp(56px,8vw,96px) 24px',
        borderTop: `1px solid ${C.cardLine}`,
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
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
          Cost ranges
        </p>
        <h2
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.15,
            margin: '0 0 8px',
          }}
        >
          Vermont 2026 ranges, real.
        </h2>
        <p
          style={{
            fontSize: 14,
            fontFamily: FB,
            color: C.inkSoft,
            lineHeight: 1.55,
            margin: '0 0 28px',
            maxWidth: 640,
          }}
        >
          Statewide. Your address pulls in town tier, lot, and complexity adjustments.
        </p>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gap: 8,
          }}
        >
          {cfg.rows.map(row => {
            const href = demoUrlForTopic(row.topicId)
            return (
              <li key={row.label}>
                <Link
                  href={href}
                  onClick={() => {
                    trackHomepageCostRowClick({ rowLabel: row.label, topicId: row.topicId })
                    trackSampleDemoClick({ fromSection: 'cost_widget', intentDestination: 'owner' })
                  }}
                  data-row-label={row.label}
                  data-topic-id={row.topicId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gridTemplateRows: 'auto auto',
                    columnGap: 16,
                    rowGap: 4,
                    padding: '14px 16px',
                    border: `1px solid ${C.cardLine}`,
                    borderRadius: 4,
                    background: '#fff',
                    textDecoration: 'none',
                    transition: 'border-color 150ms ease, background-color 150ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.accent
                    e.currentTarget.style.background = C.accentSoft
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.cardLine
                    e.currentTarget.style.background = '#fff'
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontFamily: FB,
                      fontWeight: 600,
                      color: C.ink,
                      gridColumn: '1 / 2',
                      gridRow: '1 / 2',
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontFamily: FM,
                      color: C.ink,
                      gridColumn: '2 / 3',
                      gridRow: '1 / 2',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {fmtK(row.rangeLow)}–{fmtK(row.rangeHigh)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: FB,
                      color: C.inkSoft,
                      gridColumn: '1 / -1',
                      gridRow: '2 / 3',
                    }}
                  >
                    {row.rebateNote}
                    <span
                      style={{
                        marginLeft: 12,
                        fontSize: 11,
                        fontFamily: FM,
                        color: C.accent,
                      }}
                    >
                      See your address-specific costs →
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
