'use client'

import Link from 'next/link'
import { CONFIG } from '@/lib/recommender-config'
import { inferSeason, getSeasonNote } from '@/lib/season-helpers'
import { ACCESSORY_KITS, resolveKitItems } from '@/data/affiliates'
import { useElementVisibility } from '@/lib/useElementVisibility'
import {
  trackHomepageSeasonalKitView,
  trackAccessoryItemClick,
} from '@/lib/analytics'

// Homepage seasonal strip. Reads CONFIG.homepage.seasonalStrip to pick
// the kit for the current Vermont season, then renders the kit's items
// as inline affiliate buttons (no card box — keeps revenue surfaces
// quiet on the homepage). Below the items: a one-line "we use these"
// disclosure and the optional season-tied long-form article link.
//
// Item URLs already carry ?tag=alderprojects-20 via the az() helper in
// src/data/affiliates.ts — no per-component URL building.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.12)',
  bg: '#FAF7F2',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'
const FS = "'Playfair Display', Georgia, serif"

export default function HomepageSeasonalStrip() {
  const cfg = CONFIG.homepage.seasonalStrip
  const season = inferSeason(new Date())
  const kitId = cfg.kitBySeason[season]
  const kit = kitId ? ACCESSORY_KITS.find(k => k.id === kitId) : null

  const sectionRef = useElementVisibility<HTMLElement>(0.5, () => {
    if (kit) {
      trackHomepageSeasonalKitView({ season, kitId: kit.id })
    }
  })

  if (!cfg.enabled || !kit) return null

  const items = resolveKitItems(kit)
  if (items.length === 0) return null

  const note = getSeasonNote(season)
  const article = cfg.articleBySeason[season]

  return (
    <section
      ref={sectionRef}
      data-component="homepage-seasonal-strip"
      data-season={season}
      data-kit-id={kit.id}
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
          Right now in Vermont
        </p>
        <h2
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.15,
            margin: '0 0 12px',
          }}
        >
          {note.headline}
        </h2>
        <p
          style={{
            fontSize: 15,
            fontFamily: FB,
            color: C.inkSoft,
            lineHeight: 1.6,
            margin: '0 0 24px',
            maxWidth: 640,
          }}
        >
          {note.note}
        </p>

        <p
          style={{
            fontSize: 13,
            fontFamily: FB,
            color: C.ink,
            fontWeight: 600,
            margin: '0 0 12px',
          }}
        >
          {kit.title}
        </p>

        <div
          className="kit-items-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 8,
            marginBottom: 16,
          }}
          aria-label={kit.title}
        >
          {items.map((item, idx) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              data-item-id={item.id}
              data-item-position={idx}
              onClick={() =>
                trackAccessoryItemClick({
                  kitId: kit.id,
                  itemId: item.id,
                  itemDisplay: item.display,
                  itemPositionInKit: idx,
                  kitRevenueScore: 0,
                })
              }
              style={{
                display: 'block',
                padding: '10px 14px',
                border: `1px solid ${C.cardLine}`,
                borderRadius: 4,
                background: '#fff',
                fontFamily: FB,
                fontSize: 12,
                color: C.ink,
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
              <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>
                {item.display}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: C.inkFaint,
                  margin: '2px 0 0',
                  fontFamily: FM,
                }}
              >
                See on Amazon →
              </p>
            </a>
          ))}
        </div>

        <p
          style={{
            fontSize: 11,
            fontFamily: FM,
            color: C.inkFaint,
            margin: 0,
          }}
        >
          We use these on Vermont projects. Affiliate links keep this free.
        </p>

        {article && (
          <p
            style={{
              fontSize: 13,
              fontFamily: FB,
              color: C.inkSoft,
              margin: '14px 0 0',
            }}
          >
            Want the full guide?{' '}
            <Link
              href={article.url}
              style={{ color: C.accent, textDecoration: 'none', fontWeight: 500 }}
            >
              {article.title} →
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
