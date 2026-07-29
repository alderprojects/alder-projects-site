import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CheckCta from '@/components/check/CheckCta'
import VerdictCard from '@/components/check/VerdictCard'
import HowItWorks from '@/components/check/HowItWorks'
import { HeroArt, IconCheckBadge, IconCart, IconGuides } from '@/components/check/CheckArt'
import FunnelLink from '@/components/check/FunnelLink'
import { getRealExample } from '@/lib/check/real-example'
import { HERO_SUBHEAD, HERO_BADGES, CTA_CHECK } from '@/lib/copy/canon'
import {
  CHECK_PALETTE as C,
  EXAMPLE_BUY,
  EXAMPLE_WAIT,
  GUIDE_LINKS,
} from '@/lib/check/content'

// v7.4.2b — `/` is the Alder Projects brand home. The Alder Check flow
// still lives in the hero (one tap to camera — zero clicks lost), but
// the page reads as the company: Check (free) → Smart Cart ($19.99) →
// guides + assistant. Alder Check's canonical product page is /check.

export const metadata: Metadata = {
  title: 'Alder Projects — Spend Smarter on Your Home',
  description:
    'Alder tells you what’s worth buying for your home, what can wait, and what to skip. Start with a free photo Check — honest Buy / Skip / Wait verdicts with verified costs and rebates, deepest in Vermont.',
  openGraph: {
    title: 'Alder Projects — Spend Smarter on Your Home',
    description:
      'Free photo Check: honest Buy / Skip / Wait verdicts for your home. Smart Cart turns the Buys into exact products — $19.99.',
    url: 'https://alderprojects.com',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Projects — Spend Smarter on Your Home',
    description: 'Photograph any room, get the honest plan. Free Check, $19.99 Smart Cart.',
  },
  alternates: { canonical: 'https://alderprojects.com/' },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Alder Projects',
  url: 'https://alderprojects.com/',
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Alder Projects',
  url: 'https://alderprojects.com/',
  logo: 'https://alderprojects.com/favicon.ico',
  foundingLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressRegion: 'VT', addressCountry: 'US' },
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@alderprojects.com',
  },
}

const PRODUCTS = [
  {
    eyebrow: 'Start here · Free',
    title: 'Alder Check',
    body: 'Every project list has something on it that isn’t worth the money. Photograph the room and get Buy / Skip / Wait / Monitor verdicts backed by what’s visible in your photos — including at least one thing NOT to buy, every time.',
    cta: CTA_CHECK,
    href: '/check',
    icon: 'check' as const,
  },
  {
    eyebrow: '$19.99 · Built from your Check',
    title: 'Smart Cart',
    body: 'A Buy verdict still leaves you comparing forty near-identical models. Smart Cart names the exact products — Good / Better / Best tiers, the specs that matter, quantities, and how hard the install really is.',
    cta: 'Get the exact products →',
    href: '/smart-cart',
    icon: 'cart' as const,
  },
  {
    eyebrow: 'Free · No signup',
    title: 'Guides & assistant',
    body: 'Photos can’t tell you what a permit costs or which rebates stack. The verified cost guides behind every Check can — real installed costs, rebates, permits — plus a free assistant for the rest.',
    cta: 'Check the real costs →',
    href: '/guides',
    icon: 'guides' as const,
  },
]

const PRODUCT_ICONS = { check: IconCheckBadge, cart: IconCart, guides: IconGuides }

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <Nav />
      <main style={{ background: C.cream, minHeight: '100vh' }}>
        {/* ── Hero: the brand promise, with the Check flow inline.
            Two columns on desktop (copy + flow left, illustration
            right); the art collapses away on mobile. ─────────────── */}
        <section style={{ maxWidth: 1040, margin: '0 auto', padding: '48px 20px 32px' }}>
          <div className="md:grid" style={{ gridTemplateColumns: '1.15fr 0.85fr', gap: 32, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  color: C.green,
                  margin: '0 0 14px',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  lineHeight: 1.12,
                }}
              >
                Know what’s worth buying — and what to skip.
              </h1>
              <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', color: C.inkSoft, maxWidth: 620, margin: '0 auto 26px', lineHeight: 1.55 }}>
                {HERO_SUBHEAD}
              </p>
              <CheckCta />
            </div>
            <div className="hidden md:block">
              <HeroArt />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
            {HERO_BADGES.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 13.5,
                  color: C.green,
                  background: '#fff',
                  border: '1px solid rgba(31,61,43,0.15)',
                  borderRadius: 999,
                  padding: '7px 14px',
                  fontWeight: 600,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── How a Check works (illustrated) ──────────────────────── */}
        <HowItWorks />

        {/* ── The Alder continuum: Check → Smart Cart → Guides ─────── */}
        <section style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px 40px' }}>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {PRODUCTS.map((p) => {
              const Icon = PRODUCT_ICONS[p.icon]
              return (
                <Link
                  key={p.title}
                  href={p.href}
                  style={{
                    display: 'block',
                    background: '#fff',
                    border: '1px solid rgba(31,61,43,0.14)',
                    borderRadius: 12,
                    padding: '20px 22px',
                    textDecoration: 'none',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, fontWeight: 700 }}>
                      {p.eyebrow}
                    </div>
                    <Icon />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.green, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 6 }}>
                    {p.title}
                  </div>
                  <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>{p.body}</p>
                  <span style={{ fontSize: 13.5, color: C.green, fontWeight: 600 }}>{p.cta}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── The example section (v7.4.14 §1.2).
            CR2: renders from live production rows when they load, and
            claims realness ONLY then. Any failure → the authored fallback
            under "Example Check", with no realness claim. ───────────── */}
        <RealExampleSection />

        {/* ── Compact guides section (topical authority) ───────────── */}
        <section style={{ background: '#efe9db', padding: '28px 20px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 14,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.gold,
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              The verified cost data behind every Check
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: 13.5 }}>
              {GUIDE_LINKS.map(([slug, title]) => (
                <Link key={slug} href={`/guides/${slug}`} style={{ color: C.green, textDecoration: 'underline' }}>
                  {title}
                </Link>
              ))}
              <Link href="/guides" style={{ color: C.gold, fontWeight: 600, textDecoration: 'underline' }}>
                All guides →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

/**
 * v7.4.14 §1.2 — the example section.
 *
 * CR2 is enforced structurally: the "real" header and the provenance
 * footer line are inside the `example != null` branch and cannot render
 * over authored copy. The fallback branch says "Example Check" and makes
 * no claim about where the content came from.
 */
async function RealExampleSection() {
  const example = await getRealExample()
  const heading = example ? 'A real Check, verbatim' : 'Example Check'
  const buy = example?.buy ?? EXAMPLE_BUY
  const wait = example?.wait ?? EXAMPLE_WAIT

  return (
    <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px 40px' }}>
      <h2
        style={{
          fontSize: 14,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.gold,
          textAlign: 'center',
          marginBottom: 16,
          fontWeight: 700,
        }}
      >
        {heading}
      </h2>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <VerdictCard data={buy} />
        <VerdictCard data={wait} />
      </div>
      <p style={{ textAlign: 'center', fontSize: 13.5, color: C.inkSoft, marginTop: 12 }}>
        {example ? (
          <>
            Unedited output from a real session, {example.sessionLabel} —{' '}
            <FunnelLink
              href="/check"
              eventType="REAL_EXAMPLE_CTA_CLICKED"
              payload={{ reportId: example.reportId }}
              style={{ color: C.green, textDecoration: 'underline' }}
            >
              run your own free Check
            </FunnelLink>
            .
          </>
        ) : (
          <>
            An illustration of the format. Every number in a real Check carries a verified date and names the
            guide it came from —{' '}
            <FunnelLink href="/check" eventType="REAL_EXAMPLE_CTA_CLICKED" style={{ color: C.green, textDecoration: 'underline' }}>
              get your own free Check
            </FunnelLink>
            .
          </>
        )}
      </p>
    </section>
  )
}
