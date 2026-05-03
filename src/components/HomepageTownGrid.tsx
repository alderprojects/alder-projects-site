'use client'

import Link from 'next/link'
import { CONFIG } from '@/lib/recommender-config'
import { trackHomepageTownTileClick } from '@/lib/analytics'

// Homepage town grid. Renders the 9 most-asked-about Vermont towns from
// CONFIG.homepage.townGrid.towns. Tile click drives the visitor to the
// town's existing town × service page (slug). Each tile fires
// trackHomepageTownTileClick so we can see which towns / tiers the
// homepage actually drives traffic to.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.06)',
  bg: '#F5EFE0',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'
const FS = "'Playfair Display', Georgia, serif"

export default function HomepageTownGrid() {
  const cfg = CONFIG.homepage.townGrid
  if (!cfg.enabled) return null

  return (
    <section
      data-component="homepage-town-grid"
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
          By town
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
          Pages by town
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
          Nine towns most asked about. Same data engine for all 45.
        </p>

        <div
          className="homepage-town-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {cfg.towns.map(town => (
            <Link
              key={town.pageSlug}
              href={`/${town.pageSlug}`}
              onClick={() =>
                trackHomepageTownTileClick({ town: town.town, townTier: town.townTier })
              }
              data-town={town.town}
              data-town-tier={town.townTier}
              style={{
                display: 'block',
                padding: '16px 18px',
                background: '#fff',
                border: `1px solid ${C.cardLine}`,
                borderRadius: 4,
                textDecoration: 'none',
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
                  fontSize: 17,
                  fontWeight: 600,
                  color: C.ink,
                  margin: '0 0 6px',
                  lineHeight: 1.15,
                }}
              >
                {town.town}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  fontFamily: FM,
                  color: C.inkFaint,
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {town.topServices.join(' · ')}
              </p>
            </Link>
          ))}
        </div>

        <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, margin: 0 }}>
          We cover 45 Vermont towns.{' '}
          <Link
            href={CONFIG.homepage.crossLinks.townsIndex}
            style={{ color: C.accent, textDecoration: 'none', fontWeight: 500 }}
          >
            See all →
          </Link>
        </p>
      </div>
    </section>
  )
}
