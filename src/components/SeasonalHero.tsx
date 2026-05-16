/**
 * v7.2.17 — Seasonal homepage hero.
 * Renders the configured hero for the current month from seasonal-calendar.ts.
 * Server-rendered so the right content appears in HTML for SEO.
 */
import Link from 'next/link'
import { getCurrentSeasonalConfig } from '@/lib/seasonal-calendar'

export default function SeasonalHero() {
  const cfg = getCurrentSeasonalConfig()
  const chatHref = `/chat?prefill=${encodeURIComponent(cfg.chatPrompt)}&utm_source=hero&utm_medium=seasonal_chat&utm_campaign=month_${cfg.month}`

  return (
    <section style={{ backgroundColor: '#0D1A0B', padding: 'clamp(56px,8vw,96px) 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '14px' }}>
          {cfg.eyebrow} · Vermont Home Project Guidance
        </span>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 600,
          color: '#F5EFE0',
          lineHeight: 1.1,
          marginBottom: '20px',
          maxWidth: '780px',
        }}>
          {cfg.headline}
        </h1>
        <p style={{
          fontSize: 'clamp(15px, 2vw, 17px)',
          color: 'rgba(245,239,224,0.7)',
          lineHeight: 1.65,
          marginBottom: '32px',
          maxWidth: '640px',
        }}>
          {cfg.subhead}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <Link
            href={cfg.primaryCtaHref}
            style={{
              padding: '14px 24px',
              backgroundColor: '#C8732A',
              color: '#FAF7F2',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '3px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {cfg.primaryCtaLabel} →
          </Link>
          <Link
            href={cfg.secondaryCtaHref}
            style={{
              padding: '14px 24px',
              backgroundColor: 'transparent',
              color: '#F5EFE0',
              border: '1px solid rgba(245,239,224,0.25)',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '3px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {cfg.secondaryCtaLabel}
          </Link>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'rgba(122,155,111,0.08)', borderRadius: '4px', borderLeft: '3px solid #7A9B6F', maxWidth: '600px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(245,239,224,0.7)', margin: '0 0 10px 0', lineHeight: 1.55 }}>
            <strong style={{ color: '#F5EFE0' }}>Or just ask.</strong> Free chat — real Vermont answers on weatherization, lake season, kitchen refresh, basement moisture, and more.
          </p>
          <Link
            href={chatHref}
            style={{ fontSize: '13px', color: '#C8732A', textDecoration: 'none', fontWeight: 600 }}
          >
            Ask Alder a question →
          </Link>
        </div>

        <p style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.35)', marginTop: '20px', marginBottom: 0 }}>
          $19.99 · 30-day refund · Built in Vermont
        </p>
      </div>
    </section>
  )
}
