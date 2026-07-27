import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CheckCta from '@/components/check/CheckCta'
import VerdictCard from '@/components/check/VerdictCard'

// v7.4.1b homepage takeover — the homepage IS the product. Zero clicks
// to value: the photo flow lives at `/`, the report renders in place.
// The hero is server-rendered with no client JS until CTA interaction
// (CheckCta lazy-imports the flow bundle on first tap). Replaces the V8
// "receipt" homepage; guides move to the compact footer section below;
// contractor SEO pages keep ranking on their own.

export const metadata: Metadata = {
  title: 'Alder Check — Photograph Your Home, Get a Free Buy / Skip / Wait Plan | Vermont',
  description:
    'Upload a photo of any room. Your free Alder Check spots what’s worth buying, what can wait, and what to skip — with real Vermont costs and Efficiency Vermont rebates. No account required.',
  openGraph: {
    title: 'Alder Check — Photograph Your Home, Get a Free Buy / Skip / Wait Plan',
    description:
      'Take a photo of any room. Your free Alder Check tells you what’s worth buying in Vermont, what can wait, and what to skip — no account required.',
    url: 'https://alderprojects.com',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Check — free Buy / Skip / Wait plan from a photo',
    description:
      'Photograph any room. Get honest verdicts with real Vermont costs and Efficiency Vermont rebates. Free, no account.',
  },
  alternates: { canonical: 'https://alderprojects.com/' },
}

// FAQ content doubles as AEO surface for the (ai_assistant) channel —
// answers are complete, citable standalone sentences.
const FAQS = [
  {
    q: 'Is Alder Check free?',
    a: 'Yes. The Alder Check photo report is free and does not require an account. You upload one to five photos of any room, and Alder returns Buy, Skip, Wait, or Investigate verdicts with evidence from your photos. The optional Smart Cart upgrade, which turns Buy verdicts into specific products with confirmed specs, costs $19.99.',
  },
  {
    q: 'Do I need an account to use Alder Check?',
    a: 'No. Your first Alder Check report renders immediately after upload with no account, no ZIP code, and no signup form. An email address is only requested if you want to unlock the full set of recommendations beyond the first two, or to save your report.',
  },
  {
    q: 'How does Alder know Vermont costs and rebates?',
    a: 'Every cost range and rebate figure in an Alder Check comes from a maintained Vermont dataset with a verification date, built from Alder’s published Vermont cost guides — including Efficiency Vermont rebate amounts, installed costs from Vermont contractors, and Vermont permit rules. Each recommendation cites the guide its numbers come from, and rebate figures older than 120 days display “check current program” instead of a stale number.',
  },
  {
    q: 'What happens to my photos?',
    a: 'Photos are analyzed only to create your report. Images containing people or sensitive information are excluded or redacted where possible, and excluded photos are reported to you and not analyzed. Every report includes a working delete control that removes the report and the photo files.',
  },
]

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Alder Check',
  url: 'https://alderprojects.com/',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free photo-based Buy / Skip / Wait report for Vermont homes, with real Vermont costs and Efficiency Vermont rebates.',
  provider: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com/' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

// Static example verdicts (server-rendered): one real BUY and one real
// WAIT from the eval-fixture home (VT lake house), numbers from
// data/vermont-costs.json — crawlers and AI assistants see concrete
// product output, not marketing prose.
const EXAMPLE_BUY = {
  verdict: 'BUY',
  title: 'Cold-climate mini-split for the main living area',
  summary:
    'Your photos show hydronic baseboard heat and no visible heat pump. In Vermont, a single-zone cold-climate mini-split typically cuts winter heating cost in the room it serves and adds summer cooling.',
  visibleEvidence: [
    'Hydronic baseboard along the exterior wall',
    'No mini-split head or condenser visible',
    'Open living area suited to a single zone',
  ],
  costLow: 3500,
  costHigh: 5500,
  rebate: { program: 'Efficiency Vermont', display: '$475 per indoor head' },
  citations: [
    {
      guideSlug: 'vermont-heat-pump-rebate-stack-2026',
      guideTitle: 'Vermont Heat Pump Rebate Stack 2026',
      verifiedAt: '2026-05-03',
    },
  ],
  nextAction: 'Get two quotes from EVT-participating installers — the rebate is paid through the contractor.',
}

const EXAMPLE_WAIT = {
  verdict: 'WAIT',
  title: 'Refrigerator replacement',
  summary:
    'The fridge looks dated but shows no failure signs — no rust at the seals, no condensation streaks. An aging-but-working fridge usually isn’t worth replacing for efficiency alone; wait for a real symptom.',
  visibleEvidence: [
    'Older finish and hardware, consistent with a 2000s unit',
    'Door seals appear intact',
    'No visible leaks or frost buildup',
  ],
  costLow: null,
  costHigh: null,
  rebate: null,
  citations: [],
  nextAction: 'Re-check if you hear compressor cycling issues or see condensation inside — that changes the math.',
}

const C = { green: '#1f3d2b', cream: '#f6f2e8', gold: '#b08d2f', ink: '#22301f', inkSoft: 'rgba(34,48,31,0.68)' }

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Nav />
      <main style={{ background: C.cream, minHeight: '100vh' }}>
        {/* ── Hero = the flow ─────────────────────────────────────── */}
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
          <p
            style={{
              fontSize: 'clamp(16px, 2.5vw, 19px)',
              color: C.inkSoft,
              maxWidth: 640,
              margin: '0 auto 26px',
              lineHeight: 1.55,
            }}
          >
            Take a photo of any room. Your free Alder Check tells you what’s worth buying in Vermont, what can wait,
            and what to skip — no account required.
          </p>
          <CheckCta />
          {/* Differentiation strip — the three claims no generic AI or retailer makes */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
            {[
              'We tell you what NOT to buy',
              'Vermont costs & Efficiency Vermont rebates built in',
              'Photos with people are excluded automatically',
            ].map((t) => (
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

        {/* ── Example verdicts (static, server-rendered) ───────────── */}
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
            Real output from a Vermont lake-house Check. Every number carries a verified date and cites its source
            guide.
          </p>
        </section>

        {/* ── FAQ (on-page; JSON-LD above) ─────────────────────────── */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 48px' }}>
          <h2
            style={{
              fontSize: 24,
              color: C.green,
              fontFamily: "'Playfair Display', Georgia, serif",
              marginBottom: 14,
            }}
          >
            Questions, answered
          </h2>
          {FAQS.map((f) => (
            <details key={f.q} style={{ borderBottom: '1px solid rgba(31,61,43,0.12)', padding: '12px 0' }}>
              <summary style={{ fontSize: 16, fontWeight: 600, color: C.ink, cursor: 'pointer' }}>{f.q}</summary>
              <p style={{ fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6, margin: '8px 0 0' }}>{f.a}</p>
            </details>
          ))}
        </section>

        {/* ── Compact guides section (topical authority, zero above-fold weight) */}
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
              Vermont cost guides — the data behind your Check
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: 13.5 }}>
              {[
                ['vermont-heat-pump-rebate-stack-2026', 'Heat Pump Rebate Stack 2026'],
                ['vermont-weatherization-evt-rebate', 'Weatherization & EVT Rebates'],
                ['how-much-does-roof-replacement-cost-vermont', 'Roof Replacement Costs'],
                ['how-much-does-kitchen-remodel-cost-vermont', 'Kitchen Remodel Costs'],
                ['how-much-does-a-deck-cost-vermont', 'Deck Costs'],
                ['vermont-adu-permit-cost-2026', 'ADU Permit Costs 2026'],
                ['vermont-home-project-cost-reality-2026', 'Cost Reality Check 2026'],
                ['before-finishing-basement-moisture-checks-vermont', 'Basement Moisture Checks'],
                ['vermont-solar-battery-stack-2026', 'Solar + Battery Stack 2026'],
                ['window-film-vs-replacement-vermont', 'Window Film vs Replacement'],
              ].map(([slug, title]) => (
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
