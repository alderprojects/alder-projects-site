import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PropertyGisOverlay from '@/components/PropertyGisOverlay'
import PropertyChat from '@/components/PropertyChat'
import PropertyFraming from '@/components/PropertyFraming'
import PropertyInteractive from '@/components/PropertyInteractive'
// V7.2.1 — WorthItCTACard removed while Worth-It Plan is paused.
// SmartCartCTACard is the only paid-product CTA on property pages.
import SmartCartCTACard from '@/components/property/SmartCartCTACard'
import SmartCartTextLink from '@/components/property/SmartCartTextLink'
import CurationModal from '@/components/CurationModal'
import { computeSignalsFromParams } from '@/lib/property-ranker'
import { CONFIG } from '@/lib/recommender-config'
import type { PropertyProfile } from '@/lib/property-modules'
import { buildBreadcrumbList, buildWebPage, absUrl } from '@/lib/jsonld'

// Per-address pages are noindex by decision. They are working surfaces for
// a homeowner, not SEO entry points; the SEO entry points are the town and
// guide pages.
export async function generateMetadata({
  searchParams,
  params,
}: {
  params: { slug: string }
  searchParams?: { address?: string }
}): Promise<Metadata> {
  const address = (searchParams?.address || '').trim() || deslug(params.slug)
  return {
    title: `Property profile · ${address} · Alder Projects`,
    description:
      'Vermont property profile — what to do, what it costs, what the regulators say, what to hire out. Built from public Vermont data and the Alder rebate stack.',
    robots: { index: false, follow: false },
  }
}

function deslug(slug: string): string {
  let s = slug.replace(/-+/g, ' ').trim()
  if (/\bvt\b/i.test(s)) s = s.replace(/\bvt\b/i, ', VT')
  else s = `${s}, VT`
  return s
}

type ApiError = { error: string; suggestion?: string }

async function loadProfile(address: string): Promise<PropertyProfile | ApiError> {
  const h = headers()
  const host = h.get('host') || 'alderprojects.com'
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  try {
    const res = await fetch(`${proto}://${host}/api/property`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
      cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data) {
      return { error: data?.error || 'Could not load property profile.', suggestion: data?.suggestion }
    }
    return data as PropertyProfile
  } catch {
    return { error: 'Network hiccup loading the property profile.' }
  }
}

// ---- Style tokens — kept consistent with the rest of the site --------

const C = {
  bg: '#FAF7F2',
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  green: '#1C2B1A',
  greenInk: '#F5EFE0',
}
const FD = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

// ---- Page (server component) -----------------------------------------

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: {
    address?: string
    intent?: string
    topic?: string
    mode?: string
    scope?: string
    from?: string
  }
}) {
  const address = (searchParams?.address || '').trim() || deslug(params.slug)
  const data = await loadProfile(address)

  if ('error' in data) return <ErrorView error={data.error} suggestion={data.suggestion} />

  // Compute initial signals from URL params for SSR ranking. The client
  // RankedModuleStream re-derives these on hydration so URL ↔ render are
  // always in sync without a hydration mismatch on first paint.
  const initialSignals = computeSignalsFromParams(
    {
      intent: searchParams?.intent,
      topic: searchParams?.topic,
      mode: searchParams?.mode,
      scope: searchParams?.scope,
      from: searchParams?.from,
    },
    data
  )
  // JSON-LD: WebPage + BreadcrumbList. Skip Article (these pages are
  // working surfaces, not articles, and they're noindex anyway — but
  // schema is harmless and helps if the page is ever indexed).
  const propertyPath = `/property/${params.slug}`
  const propertySchemas = [
    buildWebPage({
      url: absUrl(propertyPath),
      name: `Property profile · ${data.address}`,
      description: 'Vermont property profile — what to do, what it costs, what the regulators say, what to hire out.',
    }),
    buildBreadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Towns', url: '/towns' },
      { name: data.address, url: propertyPath },
    ]),
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>
      {propertySchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Nav />
      <AddressStrip address={data.address} />

      <main
        className="property-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '32px 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: 40,
          alignItems: 'start',
        }}
      >
        <article style={{ minWidth: 0, display: 'grid', gap: 24 }}>
          {/* Universal: hero summary always shows. */}
          <HeroSummary data={data} />
          {/* V2 framing toggle — feature-flagged off in V4 (single source
              of truth: CONFIG.featureFlags.ENABLE_FRAMING_TOGGLE).
              Component file kept so V5 can revive without re-implementing. */}
          {CONFIG.featureFlags.ENABLE_FRAMING_TOGGLE && <PropertyFraming />}

          {/* V7.2.1 — Smart Cart only (Worth-It paused).
              Engagement-gated and refund-risk suppressed. */}
          <SmartCartCTACard
            topic={initialSignals.topic ?? null}
            intent={mapTopLevelIntent(initialSignals.topLevelIntent)}
            address={data.address}
            slug={params.slug}
          />

          {/* Live FEMA + ANR Atlas overlay — universal, fetches client-side. */}
          <PropertyGisOverlay address={data.address} />

          {/* Two-click intent hero + ranked module stream, with state lifted
              to a single client wrapper so clicks never trigger route changes
              (no scroll-to-top). URL is mirrored via history.replaceState. */}
          <PropertyInteractive
            profile={data}
            initialSignals={initialSignals}
            hadExplicitIntent={Boolean(searchParams?.intent)}
          />

          {/* V7 — Smart Cart text link near the affiliate-kit area. */}
          <SmartCartTextLink
            topic={initialSignals.topic ?? null}
            intent={mapTopLevelIntent(initialSignals.topLevelIntent)}
          />

          {data.dataLinks.length > 0 && <Sources data={data} />}
        </article>

        <aside className="property-aside" style={{ position: 'sticky', top: 88, alignSelf: 'start' }}>
          <PropertyChat profile={data} />
        </aside>
      </main>

      <CurationModal />
      <Footer />

      <style>{`
        @media (max-width: 960px) {
          .property-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .property-aside {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}

// ---- Universal blocks ------------------------------------------------

function HeroSummary({ data }: { data: PropertyProfile }) {
  return (
    <section
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 8,
        padding: '24px 24px 22px',
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontFamily: FM,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.accent,
          marginBottom: 10,
        }}
      >
        Here is the deal with this property
      </p>
      <h1
        style={{
          fontFamily: FD,
          fontSize: 'clamp(1.5rem, 2.6vw, 1.9rem)',
          fontWeight: 600,
          color: C.ink,
          lineHeight: 1.25,
          margin: 0,
        }}
      >
        {data.hero.summary}
      </h1>
      {data.hero.facts.length > 0 && (
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            paddingTop: 16,
            borderTop: `1px solid ${C.cardLine}`,
          }}
        >
          {/* Filter to Town | County | Cost tier | Utility — drop the
              80% AMI (HH3) and Market entries so jargon stays out of the
              hero. Income-tier figures only surface inside the
              eligibility module after explicit engagement. */}
          {data.hero.facts
            .filter(f => f.label !== '80% AMI (HH3)' && f.label !== 'Market')
            .map(f => (
            <div key={f.label}>
              <p
                style={{
                  fontSize: 10,
                  fontFamily: FM,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.inkFaint,
                  margin: 0,
                }}
              >
                {f.label}
              </p>
              <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, margin: '3px 0 0', fontWeight: 500 }}>
                {f.value}
              </p>
            </div>
            ))}
        </div>
      )}
    </section>
  )
}

function Sources({ data }: { data: PropertyProfile }) {
  return (
    <section style={{ marginTop: 16, paddingTop: 24, borderTop: `1px solid ${C.cardLine}` }}>
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.inkFaint,
          marginBottom: 12,
        }}
      >
        Sources
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        {data.dataLinks.map(d => (
          <a
            key={d.url}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: C.inkSoft,
              textDecoration: 'none',
              borderBottom: `1px solid ${C.cardLine}`,
            }}
          >
            {d.label} →
          </a>
        ))}
      </div>
      <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, marginTop: 16 }}>
        Generated{' '}
        {new Date(data.generatedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}{' '}
        · Not legal advice.
      </p>
    </section>
  )
}

// ---- Chrome (kept from Track B) --------------------------------------

function ErrorView({ error, suggestion }: { error: string; suggestion?: string }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>
      <Nav />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '120px 24px' }}>
        <p
          style={{
            fontSize: 11,
            fontFamily: FM,
            color: C.inkFaint,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Could not load this property
        </p>
        <h1 style={{ fontFamily: FD, fontSize: '2rem', color: C.ink, marginBottom: 16 }}>{error}</h1>
        {suggestion && (
          <p style={{ fontFamily: FB, fontSize: 15, color: C.inkSoft, lineHeight: 1.7, marginBottom: 24 }}>
            {suggestion}
          </p>
        )}
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: C.ink,
            color: C.greenInk,
            fontFamily: FB,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: 3,
          }}
        >
          Try another address →
        </Link>
      </main>
      <Footer />
    </div>
  )
}

function AddressStrip({ address }: { address: string }) {
  return (
    <div
      style={{
        backgroundColor: C.green,
        color: C.greenInk,
        padding: '14px 24px',
        fontFamily: FB,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontSize: 10,
              fontFamily: FM,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(245,239,224,0.5)',
              marginRight: 12,
            }}
          >
            Property profile
          </span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{address}</span>
        </div>
        <Link href="/" style={{ fontSize: 12, color: 'rgba(245,239,224,0.7)', textDecoration: 'underline' }}>
          Try another address
        </Link>
      </div>
    </div>
  )
}


// V7 helper: map V4 TopLevelIntent ('looking' included) to the V7 CTA
// component's narrower intent prop ('buying' | 'owner' | 'researching').
function mapTopLevelIntent(
  intent: 'buying' | 'owner' | 'looking' | 'researching',
): 'buying' | 'owner' | 'researching' | null {
  if (intent === 'buying') return 'buying'
  if (intent === 'owner') return 'owner'
  if (intent === 'researching') return 'researching'
  return null
}
