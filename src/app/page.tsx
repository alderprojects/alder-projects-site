import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CheckCta from '@/components/check/CheckCta'
import VerdictCard from '@/components/check/VerdictCard'
import {
  CHECK_PALETTE as C,
  CHECK_SUBLINE,
  DIFFERENTIATION_STRIP,
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
    body: 'Photograph any room. Get honest Buy / Skip / Wait verdicts with evidence from your photos — and at least one thing NOT to buy, every time.',
    cta: 'Alder Check has its own page →',
    href: '/check',
  },
  {
    eyebrow: '$19.99 · Built from your Check',
    title: 'Smart Cart',
    body: 'Turns your Check’s Buy verdicts into the exact products — Good / Better / Best tiers, the specs that matter, quantities, and install difficulty.',
    cta: 'How Smart Cart works →',
    href: '/smart-cart',
  },
  {
    eyebrow: 'Free · No signup',
    title: 'Guides & assistant',
    body: 'The verified cost guides behind every Check — rebates, permits, real installed costs — plus a free assistant for the questions photos can’t answer.',
    cta: 'Browse the guides →',
    href: '/guides',
  },
]

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <Nav />
      <main style={{ background: C.cream, minHeight: '100vh' }}>
        {/* ── Hero: the brand promise, with the Check flow inline ──── */}
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 20px 32px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 6vw, 52px)',
              color: C.green,
              margin: '0 0 14px',
              fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1.12,
            }}
          >
            Spend smarter on your home.
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 19px)', color: C.inkSoft, maxWidth: 640, margin: '0 auto 26px', lineHeight: 1.55 }}>
            {CHECK_SUBLINE}
          </p>
          <CheckCta />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
            {DIFFERENTIATION_STRIP.map((t) => (
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

        {/* ── The Alder continuum: Check → Smart Cart → Guides ─────── */}
        <section style={{ maxWidth: 980, margin: '0 auto', padding: '12px 20px 40px' }}>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {PRODUCTS.map((p) => (
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
                <div style={{ fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 8 }}>
                  {p.eyebrow}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.green, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 6 }}>
                  {p.title}
                </div>
                <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>{p.body}</p>
                <span style={{ fontSize: 13.5, color: C.green, fontWeight: 600 }}>{p.cta}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Example verdicts (static, server-rendered) ───────────── */}
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
            What a Check looks like
          </h2>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <VerdictCard data={EXAMPLE_BUY} />
            <VerdictCard data={EXAMPLE_WAIT} />
          </div>
          <p style={{ textAlign: 'center', fontSize: 13.5, color: C.inkSoft, marginTop: 12 }}>
            Real output. Every number carries a verified date and cites its source guide —{' '}
            <Link href="/check" style={{ color: C.green, textDecoration: 'underline' }}>
              more on how the Check works
            </Link>
            .
          </p>
        </section>

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
              Verified cost guides — the data behind every Check
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
