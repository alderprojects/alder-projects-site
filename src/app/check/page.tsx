import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CheckCta from '@/components/check/CheckCta'
import VerdictCard from '@/components/check/VerdictCard'
import {
  CHECK_FAQS,
  CHECK_PALETTE as C,
  CHECK_SUBLINE,
  DIFFERENTIATION_STRIP,
  EXAMPLE_BUY,
  EXAMPLE_WAIT,
  FAQ_JSONLD,
  GUIDE_LINKS,
  WEBAPP_JSONLD,
} from '@/lib/check/content'

// v7.4.2b — /check: Alder Check's own page. The homepage (`/`) is the
// Alder Projects brand home with the Check as flagship; this page is
// the product's canonical URL (funnel deep links, ads, and the QR
// handoff's phone destination all point here). Same one-tap flow.

export const metadata: Metadata = {
  title: 'Alder Check — Photograph Your Home, Get a Free Buy / Skip / Wait Plan',
  description:
    'Upload a photo of any room. Your free Alder Check spots what’s worth buying, what can wait, and what to skip — with verified regional costs and rebates, deepest in Vermont. No account required.',
  openGraph: {
    title: 'Alder Check — Photograph Your Home, Get a Free Buy / Skip / Wait Plan',
    description:
      'Take a photo of any room. Your free Alder Check tells you what’s worth buying, what can wait, and what to skip — no account required.',
    url: 'https://alderprojects.com/check',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Check — free Buy / Skip / Wait plan from a photo',
    description: 'Photograph any room. Honest verdicts with verified regional costs and rebates. Free, no account.',
  },
  alternates: { canonical: 'https://alderprojects.com/check' },
}

export default function CheckPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPP_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <Nav />
      <main style={{ background: C.cream, minHeight: '100vh' }}>
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 20px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 10 }}>
            Alder Check · Free
          </p>
          <h1
            style={{
              fontSize: 'clamp(32px, 6vw, 52px)',
              color: C.green,
              margin: '0 0 14px',
              fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1.12,
            }}
          >
            Photograph your home. Get the honest plan.
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

        <section style={{ maxWidth: 860, margin: '0 auto', padding: '8px 20px 40px' }}>
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
            Real output from a lake-house Check. Every number carries a verified date and cites its source guide.
          </p>
        </section>

        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 48px' }}>
          <h2 style={{ fontSize: 24, color: C.green, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 14 }}>
            Questions, answered
          </h2>
          {CHECK_FAQS.map((f) => (
            <details key={f.q} style={{ borderBottom: '1px solid rgba(31,61,43,0.12)', padding: '12px 0' }}>
              <summary style={{ fontSize: 16, fontWeight: 600, color: C.ink, cursor: 'pointer' }}>{f.q}</summary>
              <p style={{ fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6, margin: '8px 0 0' }}>{f.a}</p>
            </details>
          ))}
        </section>

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
              The cost guides behind your Check
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
