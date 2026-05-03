import { CONFIG } from '@/lib/recommender-config'

// Homepage trust strip. Below-the-fold, quiet — lists the data sources
// our property-page synthesis pulls from. Renders server-side; no
// hooks, no analytics, just a static list.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  bg: '#F5EFE0',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export default function HomepageTrustStrip() {
  const cfg = CONFIG.homepage.trustStrip
  if (!cfg.enabled) return null

  return (
    <section
      data-component="homepage-trust-strip"
      style={{
        backgroundColor: C.bg,
        padding: 'clamp(40px,6vw,72px) 24px',
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
            color: C.inkFaint,
            margin: '0 0 12px',
          }}
        >
          Built in Vermont, for Vermont
        </p>
        <p style={{ fontSize: 14, fontFamily: FB, color: C.inkSoft, margin: '0 0 16px' }}>
          Data from:
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 18px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {cfg.dataSources.map(s => (
            <li
              key={s}
              style={{
                padding: '6px 12px',
                background: '#fff',
                border: `1px solid ${C.cardLine}`,
                borderRadius: 999,
                fontSize: 12,
                fontFamily: FB,
                color: C.ink,
              }}
            >
              {s}
            </li>
          ))}
        </ul>
        <p
          style={{
            fontSize: 11,
            fontFamily: FM,
            color: C.inkFaint,
            margin: 0,
            letterSpacing: '0.02em',
          }}
        >
          {cfg.lastUpdatedNote}
        </p>
      </div>
    </section>
  )
}
