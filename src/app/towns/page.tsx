import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { TOWN_TO_BUCKET, type TownBucket } from '@/data/projects'

// /towns — SEO real estate. Lists every named Vermont town the data
// graph knows about, grouped by tier, with each tile linking to a
// sample by-address property page in that town. No hand-coded town
// array on this page — reads TOWN_TO_BUCKET so the homepage town grid,
// the property-page ranker, and this index all stay in sync.
//
// Internal-link density: every named town gets a link from this page,
// which gets linked from the homepage town grid + footer. Increases
// the strength of the property-page funnel for every town we cover.

export const metadata: Metadata = {
  title: 'Vermont property tool — towns we cover | Alder Projects',
  description:
    'Vermont permits, rebates, contractor costs, and lake/flood/septic context, by address. We cover every Vermont town — Burlington and the metro, the resort towns, the small cities, the rural belt.',
  alternates: { canonical: 'https://alderprojects.com/towns' },
  openGraph: {
    title: 'Vermont property tool — towns we cover',
    description:
      'Every Vermont town we synthesize. Address-by-address.',
    url: 'https://alderprojects.com/towns',
    type: 'website',
  },
}

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.06)',
  bg: '#FAF7F2',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'
const FS = "'Playfair Display', Georgia, serif"

// Display-friendly title case with a special case for 'St.' (TOWN_TO_BUCKET
// stores both 'st johnsbury' and 'st. johnsbury' as the same tier; we
// dedupe and pick the dotted form for display).
function titleCase(name: string): string {
  return name
    .split(' ')
    .map(w => {
      if (w === 'st' || w === 'st.') return 'St.'
      return w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''
    })
    .join(' ')
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function sampleAddressFor(town: string): string {
  return `Main Street, ${town}, VT`
}

function sampleHrefFor(town: string): string {
  const slug = slugify(`main street ${town} vt`)
  return `/property/${slug}?intent=owner`
}

// Dedupe the TOWN_TO_BUCKET keys (which contain both "st johnsbury" and
// "st. johnsbury" pointing to the same tier). Keep the dotted form.
function buildTownsByTier(): Record<TownBucket, string[]> {
  const seen = new Map<string, string>() // canonical → display
  for (const key of Object.keys(TOWN_TO_BUCKET)) {
    const canonical = key.replace(/\./g, '').replace(/\s+/g, ' ').trim()
    const existing = seen.get(canonical)
    // Prefer the form with a period over the bare form
    if (!existing || (key.includes('.') && !existing.includes('.'))) {
      seen.set(canonical, key)
    }
  }

  const groups: Record<TownBucket, string[]> = {
    burlington_metro: [],
    chittenden_other: [],
    resort_premium: [],
    small_city: [],
    rural: [],
  }
  for (const display of Array.from(seen.values())) {
    const tier = TOWN_TO_BUCKET[display]
    groups[tier].push(titleCase(display))
  }
  for (const tier of Object.keys(groups) as TownBucket[]) {
    groups[tier].sort((a, b) => a.localeCompare(b))
  }
  return groups
}

const TIER_LABELS: Record<TownBucket, { label: string; description: string }> = {
  burlington_metro: {
    label: 'Burlington and the metro',
    description: 'Burlington, the eastern shore, and the suburbs. Highest cost basis, best contractor density.',
  },
  chittenden_other: {
    label: 'Chittenden county, outside the metro',
    description: 'The hill towns, Mount Mansfield foothills, and lakefront pockets. Mixed costs.',
  },
  resort_premium: {
    label: 'Resort and second-home country',
    description: 'Stowe, Manchester, Woodstock, the Mad River Valley. Premium pricing, peak demand fall + winter.',
  },
  small_city: {
    label: 'Vermont small cities',
    description: 'County seats and trade hubs. Mid-tier pricing, broad contractor base.',
  },
  rural: {
    label: 'Rural Vermont',
    description: 'The vast majority of the state. Septic, well, dirt roads, and the highest seasonal swing.',
  },
}

export default function TownsIndex() {
  const groups = buildTownsByTier()

  // JSON-LD: ItemList of every named town, ordered by tier.
  const allTowns: { name: string; url: string }[] = []
  for (const tier of Object.keys(groups) as TownBucket[]) {
    for (const town of groups[tier]) {
      allTowns.push({
        name: town,
        url: `https://alderprojects.com${sampleHrefFor(town)}`,
      })
    }
  }
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Vermont towns covered by Alder Projects',
    itemListElement: allTowns.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: t.url,
      name: t.name,
    })),
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Nav />

      <section
        style={{
          backgroundColor: C.bg,
          padding: 'clamp(72px,10vw,120px) 24px clamp(40px,6vw,64px)',
          borderBottom: `1px solid ${C.cardLine}`,
        }}
      >
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <nav
            aria-label="Breadcrumb"
            style={{
              fontSize: 12,
              fontFamily: FM,
              color: C.inkFaint,
              marginBottom: 16,
              letterSpacing: '0.04em',
            }}
          >
            <Link
              href="/"
              style={{ color: C.inkFaint, textDecoration: 'none' }}
            >
              Alder Projects
            </Link>{' '}
            → Towns
          </nav>
          <h1
            style={{
              fontFamily: FS,
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 600,
              color: C.ink,
              lineHeight: 1.1,
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
            }}
          >
            Vermont property tool — towns we cover
          </h1>
          <p
            style={{
              fontSize: 16,
              fontFamily: FB,
              color: C.inkSoft,
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 640,
            }}
          >
            We synthesize permits, rebates, contractor costs, and lake/flood/septic context for every
            Vermont town. The named towns below have specific tier and cost adjustments wired in.
            Type any Vermont address and we will figure out the rest.
          </p>
        </div>
      </section>

      <section style={{ backgroundColor: '#fff', padding: 'clamp(40px,6vw,64px) 24px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          {(Object.keys(groups) as TownBucket[]).map(tier => {
            const towns = groups[tier]
            if (towns.length === 0) return null
            const meta = TIER_LABELS[tier]
            return (
              <div key={tier} style={{ marginBottom: 48 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: FM,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: C.accent,
                    margin: '0 0 6px',
                  }}
                >
                  {tier.replace(/_/g, ' ')}
                </p>
                <h2
                  style={{
                    fontFamily: FS,
                    fontSize: 22,
                    fontWeight: 600,
                    color: C.ink,
                    lineHeight: 1.15,
                    margin: '0 0 6px',
                  }}
                >
                  {meta.label}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    fontFamily: FB,
                    color: C.inkSoft,
                    margin: '0 0 18px',
                    lineHeight: 1.55,
                    maxWidth: 640,
                  }}
                >
                  {meta.description}
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 8,
                  }}
                >
                  {towns.map(town => (
                    <li key={town}>
                      <Link
                        href={sampleHrefFor(town)}
                        title={`Sample property in ${town}`}
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          border: `1px solid ${C.cardLine}`,
                          borderRadius: 4,
                          background: '#fff',
                          textDecoration: 'none',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontFamily: FB,
                            fontWeight: 500,
                            color: C.ink,
                          }}
                        >
                          {town}
                        </span>{' '}
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: FM,
                            color: C.inkFaint,
                            marginLeft: 6,
                          }}
                        >
                          → {sampleAddressFor(town)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <Footer />
    </main>
  )
}
