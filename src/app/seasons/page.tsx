import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { SEASON_CONTENT, SEASON_TO_GUIDE_URL } from '@/content/seasons'
import { inferSeason } from '@/lib/season-helpers'
import { CONFIG } from '@/lib/recommender-config'
import {
  buildBreadcrumbList,
  buildItemList,
  absUrl,
} from '@/lib/jsonld'
import type { Season } from '@/lib/recommender-config.types'

const PATH = '/seasons'

export const metadata: Metadata = {
  title: 'Vermont property seasons — what is happening when',
  description: "Vermont's property year carved into 6 windows. Mud season, blackfly, lake, fall weatherization, pre-winter, deep winter. What contractors book, what costs more, what to do this week.",
  alternates: { canonical: `https://alderprojects.com${PATH}` },
  openGraph: {
    title: 'Vermont property seasons',
    description: "Vermont's 6 property seasons and what to do in each.",
    url: `https://alderprojects.com${PATH}`,
    type: 'website',
  },
}

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  cream: '#FAF7F2',
  ivory: '#F5EFE0',
  sage: '#7A9B6F',
}
const FS = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

// All 6 Vermont seasons in calendar order, with their guide URL.
// 'mud' uses the existing custom guide; the other 5 use the V6 routes
// in src/content/seasons/.
const SEASONS_ORDERED: Array<{
  season: Season
  label: string
  windowLabel: string
  url: string
  blurb: string
}> = [
  {
    season: 'mud',
    label: 'Mud season',
    windowLabel: 'March 1 – May 15',
    url: SEASON_TO_GUIDE_URL.mud!,
    blurb: 'Frost coming out of the ground; dirt roads turn to soup. Most exterior work blocked by weight limits. Contractor schedule transition window.',
  },
  {
    season: 'spring_blackfly',
    label: 'Spring blackfly',
    windowLabel: 'May 15 – June 14',
    url: SEASON_TO_GUIDE_URL.spring_blackfly!,
    blurb: 'Three weeks that shape the whole spring. Outdoor work fights bug pressure. Realistic project window for interior renovation.',
  },
  {
    season: 'lake',
    label: 'Lake season',
    windowLabel: 'June 15 – September 14',
    url: SEASON_TO_GUIDE_URL.lake!,
    blurb: 'Vermont contractor demand peak. Roof, siding, deck, septic, dock work all run summer-only. Book by April for same-summer.',
  },
  {
    season: 'fall_leaf',
    label: 'Fall weatherization',
    windowLabel: 'September 15 – October 31',
    url: SEASON_TO_GUIDE_URL.fall_leaf!,
    blurb: "EVT's 75% weatherization rebate window. Federal 25C expired Dec 2025; EVT pot runs out before December. Book in September.",
  },
  {
    season: 'pre_winter',
    label: 'Pre-winter prep',
    windowLabel: 'November 1 – December 14',
    url: SEASON_TO_GUIDE_URL.pre_winter!,
    blurb: 'Contractor scramble. Heat pump installs scheduling crunch. Second-home winterization window. Fuel deliveries, last exterior projects.',
  },
  {
    season: 'deep_winter',
    label: 'Deep winter',
    windowLabel: 'December 15 – February 28',
    url: SEASON_TO_GUIDE_URL.deep_winter!,
    blurb: 'Heating bill peak. Smart thermostat optimization, ice dam mitigation, power outage prep. Interior renovation gets the strong crews.',
  },
]

const seasonsIndexSchemas = [
  buildItemList({
    url: absUrl(PATH),
    name: 'Vermont property seasons',
    items: SEASONS_ORDERED.map(s => ({ name: s.label, url: s.url })),
  }),
  buildBreadcrumbList([
    { name: 'Home', url: '/' },
    { name: 'Seasons', url: PATH },
  ]),
]

export default function SeasonsIndex() {
  const currentSeason = inferSeason(new Date())

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.cream, fontFamily: FB }}>
      {seasonsIndexSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Nav />

      <div
        style={{
          backgroundColor: C.ink,
          padding: 'clamp(96px,10vw,120px) 24px clamp(40px,6vw,64px)',
          borderBottom: `1px solid ${C.sage}1a`,
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: FM,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.sage,
              display: 'block',
              marginBottom: '14px',
            }}
          >
            Vermont property seasons
          </span>
          <h1
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.8rem,4vw,2.6rem)',
              fontWeight: 600,
              color: C.ivory,
              lineHeight: 1.15,
              margin: '0 0 18px',
            }}
          >
            Vermont property seasons — what's actually happening when.
          </h1>
          <p
            style={{
              fontSize: '17px',
              color: `${C.ivory}99`,
              lineHeight: 1.7,
              maxWidth: '600px',
              margin: 0,
            }}
          >
            Vermont's calendar runs on six windows, not four. Each one shapes
            what contractors will do, what costs more, and what's worth booking
            this week. {CONFIG.homepage.trustStrip.lastUpdatedNote}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px 80px' }}>
        {/* Current season highlight */}
        {(() => {
          const current = SEASONS_ORDERED.find(s => s.season === currentSeason)
          if (!current) return null
          return (
            <div
              style={{
                backgroundColor: `${C.accent}10`,
                borderLeft: `3px solid ${C.accent}`,
                padding: '20px 24px',
                marginBottom: '32px',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontFamily: FM,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: C.accent,
                  marginBottom: '8px',
                }}
              >
                Right now in Vermont
              </p>
              <h2
                style={{
                  fontFamily: FS,
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: C.ink,
                  margin: '0 0 8px',
                }}
              >
                {current.label} — {current.windowLabel}
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: `${C.ink}b3`,
                  lineHeight: 1.7,
                  margin: '0 0 12px',
                }}
              >
                {current.blurb}
              </p>
              <Link
                href={current.url}
                style={{
                  fontSize: '13px',
                  fontFamily: FM,
                  letterSpacing: '0.04em',
                  color: C.ink,
                  textDecoration: 'underline',
                }}
              >
                Read the {current.label.toLowerCase()} guide →
              </Link>
            </div>
          )
        })()}

        {/* All seasons listed */}
        <h2
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.2rem,2.4vw,1.5rem)',
            fontWeight: 600,
            color: C.ink,
            margin: '32px 0 16px',
          }}
        >
          The Vermont property year
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {SEASONS_ORDERED.map(s => {
            const isCurrent = s.season === currentSeason
            return (
              <Link
                key={s.season}
                href={s.url}
                style={{
                  display: 'block',
                  padding: '18px 20px',
                  border: `1px solid ${isCurrent ? C.accent + '60' : C.cardLine}`,
                  background: isCurrent ? `${C.accent}05` : '#fff',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: FS,
                      fontSize: '17px',
                      fontWeight: 600,
                      color: C.ink,
                      margin: 0,
                    }}
                  >
                    {s.label}
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: FM,
                      color: C.inkFaint,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {s.windowLabel}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    color: `${C.ink}a3`,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {s.blurb}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Property tool funnel */}
        <div
          style={{
            backgroundColor: C.ink,
            padding: '28px 24px',
            margin: '40px 0 24px',
          }}
        >
          <p
            style={{
              fontFamily: FS,
              fontSize: '20px',
              fontWeight: 500,
              color: C.ivory,
              lineHeight: 1.4,
              margin: '0 0 12px',
            }}
          >
            Want season-aware guidance for your specific Vermont property?
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              fontSize: '14px',
              fontFamily: FM,
              letterSpacing: '0.06em',
              color: C.sage,
              textDecoration: 'none',
              borderBottom: `1px solid ${C.sage}`,
              paddingBottom: '2px',
            }}
          >
            Enter your address — we synthesize the rest →
          </Link>
        </div>

        {/* Cross-links */}
        <div style={{ borderTop: `1px solid ${C.cardLine}`, paddingTop: '24px' }}>
          <p
            style={{
              fontSize: '11px',
              fontFamily: FM,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: C.inkFaint,
              marginBottom: '10px',
            }}
          >
            Related
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link
              href="/guides"
              style={{ fontSize: '14px', color: C.accent, textDecoration: 'none' }}
            >
              All guides →
            </Link>
            <Link
              href="/towns"
              style={{ fontSize: '14px', color: C.accent, textDecoration: 'none' }}
            >
              Towns we cover →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
