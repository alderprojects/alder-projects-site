import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import EmailCaptureV8 from '@/components/EmailCaptureV8'
import SeasonalHero from '@/components/SeasonalHero'

// V8 homepage — "The Receipt." Conversion-focused single-funnel page
// for the $19.99 Smart Cart. Single primary CTA above the fold; the
// math is the pitch; receipt graphic is the visual hook. Replaces the
// V5 multi-section homepage. The 60+ SEO landing pages still rank on
// their own and deep-link into the project grid below the fold.

export const metadata: Metadata = {
  title: 'Alder Projects — The shopping list for your next Vermont home project',
  description:
    'A $19.99 Smart Cart tells you what to buy and what to skip for one Vermont home project. Built in Montpelier. 30-day refund, no form.',
  openGraph: {
    title: 'Alder Projects — Smart Cart for Vermont home projects',
    description:
      'Tell us the project. We send back the buy list, the skip list, and the two or three things that are different here than in the box-store guide. $19.99.',
    url: 'https://alderprojects.com',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Projects — Smart Cart for Vermont home projects',
    description:
      'Buy this. Skip that. One project, one fee, $19.99. 30-day refund, no form.',
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
    areaServed: 'VT',
  },
}

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Smart Cart',
  description:
    'A curated buy/skip shopping list for one Vermont home project. Tells you what to buy, what to skip, and the Vermont-specific gotchas.',
  brand: { '@type': 'Brand', name: 'Alder Projects' },
  offers: {
    '@type': 'Offer',
    price: '19.99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://alderprojects.com/smart-cart',
  },
}

// ── Tokens ───────────────────────────────────────────────────────────
const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  line: 'rgba(28,43,26,0.1)',
  lineSoft: 'rgba(28,43,26,0.06)',
  bg: '#FAF7F2',
  paper: '#F2EBDB',
  card: '#ffffff',
  accent: '#C8732A',
  green: '#3F6B3A',
  red: '#9B3F3F',
  sage: '#7A9B6F',
  forest: '#1f3a2e',
}
const FS = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = "'DM Mono', 'Courier New', monospace"

// ── Tiny icons ───────────────────────────────────────────────────────
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8.5l3 3 7-7"
        stroke={C.green}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke={C.red}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
function IconWarn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.5L15 14H1L8 1.5z"
        stroke={C.accent}
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M8 6v4" stroke={C.accent} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.9" fill={C.accent} />
    </svg>
  )
}

// ── Receipt card ─────────────────────────────────────────────────────
function ReceiptCard() {
  const row: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '20px 1fr',
    gap: 10,
    alignItems: 'baseline',
    fontFamily: FM,
    fontSize: 13,
    color: C.ink,
    padding: '7px 0',
  }
  return (
    <div
      style={{
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        padding: '24px 22px',
        boxShadow: '0 1px 0 rgba(28,43,26,0.04), 0 8px 24px rgba(28,43,26,0.06)',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontFamily: FM,
          fontSize: 11,
          letterSpacing: '0.12em',
          color: C.inkSoft,
          textTransform: 'uppercase',
          paddingBottom: 10,
          borderBottom: `1px dashed ${C.line}`,
          marginBottom: 6,
        }}
      >
        Kitchen backsplash · 4 sq ft
      </div>

      <div style={row}>
        <span style={{ paddingTop: 3 }}>
          <IconCheck />
        </span>
        <span>
          Buy: notched trowel <span style={{ color: C.inkSoft }}>— $9</span>
        </span>
      </div>
      <div style={row}>
        <span style={{ paddingTop: 3 }}>
          <IconCheck />
        </span>
        <span>
          Buy: pre-mixed mastic, not thinset <span style={{ color: C.inkSoft }}>— $22</span>
        </span>
      </div>
      <div style={row}>
        <span style={{ paddingTop: 3 }}>
          <IconX />
        </span>
        <span style={{ textDecoration: 'line-through', color: C.inkSoft }}>
          Skip: spacer kit. Use nickels.
        </span>
      </div>
      <div style={row}>
        <span style={{ paddingTop: 3 }}>
          <IconWarn />
        </span>
        <span>Worth a pro: outlet relocation</span>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 12,
          borderTop: `1px dashed ${C.line}`,
          fontFamily: FM,
          fontSize: 14,
          fontWeight: 600,
          color: C.ink,
        }}
      >
        You did not spend $184.
      </div>
    </div>
  )
}

// ── Stat tile ────────────────────────────────────────────────────────
function StatTile({ number, label }: { number: string; label: string }) {
  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        padding: '22px 20px',
        background: C.bg,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: FS,
          fontSize: 'clamp(1.8rem, 3.6vw, 2.4rem)',
          fontWeight: 600,
          color: C.ink,
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: FM,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: C.inkSoft,
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ── Project grid ─────────────────────────────────────────────────────
const PROJECTS: Array<{ label: string; href: string }> = [
  { label: 'Kitchen refresh', href: '/kitchen-remodeling-vermont' },
  { label: 'Bathroom remodel', href: '/bathroom-remodeling-vermont' },
  { label: 'Deck repair', href: '/deck-builders-vermont' },
  { label: 'Roofing', href: '/roofing-contractors-vermont' },
  { label: 'Window replacement', href: '/window-replacement-vermont' },
  { label: 'Painting', href: '/painting-contractors-vermont' },
  { label: 'Basement finishing', href: '/basement-finishing-vermont' },
  { label: 'Home additions', href: '/home-additions-vermont' },
  { label: 'Electrical', href: '/electrical-contractors-vermont' },
  { label: 'Plumbing', href: '/plumbing-contractors-vermont' },
  { label: 'HVAC + heat pumps', href: '/hvac-contractors-vermont' },
  { label: 'General contractors', href: '/general-contractors-vermont' },
]

// ── Page ─────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={{ backgroundColor: C.bg }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Nav />

      {/* ── Hero (v7.2.17 SeasonalHero) ─────────────────────────── */}
      <SeasonalHero />

      {/* ── v7.2.18-A5: First-time entry strip + curated guide grid ── */}
      <FirstTimeEntrySection />

      {/* ── Stat tiles ───────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(40px,6vw,64px) 24px',
          borderBottom: `1px solid ${C.lineSoft}`,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          <StatTile number="$19.99" label="One project, one fee" />
          <StatTile number="$184" label="Average skipped purchase" />
          <StatTile number="30 days" label="Refund, no form" />
        </div>
      </section>

      {/* ── Five things, every cart ──────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,8vw,96px) 24px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.accent,
              margin: '0 0 14px',
            }}
          >
            What you get
          </p>
          <h2
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 600,
              color: C.ink,
              margin: '0 0 28px',
              lineHeight: 1.15,
            }}
          >
            Five things, every cart.
          </h2>
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 22,
            }}
          >
            {[
              {
                t: 'The buy list.',
                b: 'With sizes, quantities, and the brand we would actually pick.',
              },
              {
                t: 'The skip list.',
                b: 'What the YouTube video told you to buy that you do not need.',
              },
              {
                t: 'The wait-until list.',
                b: 'Stuff that is cheaper in October. Or April.',
              },
              {
                t: 'The licensed-pro line.',
                b: 'Drawn the way Vermont draws it. So you do not get fined.',
              },
              {
                t: 'One Efficiency Vermont rebate.',
                b: 'If there is one to catch on this project, it is in the cart.',
              },
            ].map(({ t, b }, i) => (
              <li
                key={i}
                style={{
                  borderTop: `1px solid ${C.line}`,
                  paddingTop: 16,
                  fontFamily: FB,
                }}
              >
                <div
                  style={{
                    fontFamily: FS,
                    fontSize: 18,
                    color: C.ink,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {t}
                </div>
                <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55 }}>{b}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── v7.2.14: Before you spend thousands ─────────────────── */}
      <BeforeYouSpendThousandsSection />

      {/* ── Sample cart, full ────────────────────────────────────── */}
      <section
        id="sample-cart"
        style={{
          padding: 'clamp(56px,8vw,96px) 24px',
          background: C.paper,
          borderTop: `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.accent,
              margin: '0 0 14px',
            }}
          >
            Sample cart · open
          </p>
          <h2
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 600,
              color: C.ink,
              margin: '0 0 8px',
              lineHeight: 1.15,
            }}
          >
            Kitchen backsplash, 4 sq ft.
          </h2>
          <p
            style={{
              fontFamily: FB,
              fontSize: 15,
              color: C.inkSoft,
              lineHeight: 1.55,
              margin: '0 0 28px',
              maxWidth: 540,
            }}
          >
            Real cart, real prices, real Vermont notes. This is what arrives in your inbox
            the same day you order.
          </p>

          <div
            style={{
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              padding: 'clamp(20px,3vw,32px)',
            }}
          >
            <SampleCartRow icon="check" label="Buy: 1/8 in. notched trowel" price="$9" />
            <SampleCartRow
              icon="check"
              label="Buy: pre-mixed mastic, not thinset"
              price="$22"
            />
            <SampleCartRow
              icon="check"
              label="Buy: 1/4 in. caulk for the sink edge"
              price="$6"
            />
            <SampleCartRow
              icon="check"
              label="Buy: peel-and-stick mosaic sheets, 4 ct"
              price="$72"
            />
            <SampleCartRow
              icon="x"
              strike
              label="Skip: tile spacer kit. Use nickels."
              price="-$14"
            />
            <SampleCartRow
              icon="x"
              strike
              label="Skip: full thinset bag for 4 sq ft."
              price="-$28"
            />
            <SampleCartRow
              icon="x"
              strike
              label="Skip: branded grout sealer pen."
              price="-$11"
            />
            <SampleCartRow
              icon="warn"
              label="Worth a pro: outlet relocation behind the range. Vermont electrical permit."
              note
            />
            <SampleCartRow
              icon="warn"
              label="Wait until October: contractor-grade sponges, half off at Aubuchon."
              note
            />
            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: `1px dashed ${C.line}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontFamily: FM,
                fontSize: 15,
                color: C.ink,
              }}
            >
              <span style={{ fontWeight: 600 }}>You did not spend</span>
              <span style={{ fontWeight: 600, fontSize: 18 }}>$184</span>
            </div>
            <p
              style={{
                fontFamily: FB,
                fontSize: 12,
                color: C.inkSoft,
                margin: '14px 0 0',
                lineHeight: 1.6,
              }}
            >
              <em>Vermont note:</em> ask the hardware store to cut the tile. Most will,
              for free, if you bring a sketch on a napkin.
            </p>
          </div>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link
              href="/smart-cart"
              style={{
                display: 'inline-block',
                padding: '14px 26px',
                background: C.accent,
                color: '#FAF7F2',
                fontFamily: FB,
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 4,
              }}
            >
              Build my Smart Cart — $19.99
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why $19.99 ───────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,8vw,96px) 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.accent,
              margin: '0 0 14px',
            }}
          >
            Why $19.99
          </p>
          <h2
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 600,
              color: C.ink,
              margin: '0 0 18px',
              lineHeight: 1.15,
            }}
          >
            The math is the pitch.
          </h2>
          <p
            style={{
              fontFamily: FB,
              fontSize: 16,
              color: C.inkSoft,
              lineHeight: 1.7,
              margin: '0 0 14px',
            }}
          >
            Most Vermont DIY projects have one $30-to-$80 purchase that is wrong for the
            job. Wrong adhesive. Wrong fastener. Wrong-grade lumber for an unheated
            mudroom. The cart&apos;s whole job is to catch that one.
          </p>
          <p
            style={{
              fontFamily: FB,
              fontSize: 16,
              color: C.inkSoft,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            If it does not catch it, ask for your money back. We would rather you keep
            the $19.99 than pretend it earned its keep.
          </p>
        </div>
      </section>

      {/* ── Refund block ─────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(56px,8vw,96px) 24px',
          background: C.forest,
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C8732A',
              margin: '0 0 18px',
            }}
          >
            Refund policy
          </p>
          <h2
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 600,
              color: '#F5EFE0',
              margin: '0 0 18px',
              lineHeight: 1.2,
            }}
          >
            Reply <em style={{ color: '#C8732A' }}>refund</em>. That is the whole process.
          </h2>
          <p
            style={{
              fontFamily: FB,
              fontSize: 16,
              color: 'rgba(245,239,224,0.78)',
              lineHeight: 1.7,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            30-day refund, no form, no &quot;tell us why.&quot; Reply to the receipt with
            the word &quot;refund&quot; and we send the $19.99 back the same day. We are
            betting you will keep it.
          </p>
        </div>
      </section>

      {/* ── Project grid ─────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,8vw,96px) 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: FM,
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.accent,
              margin: '0 0 14px',
            }}
          >
            What you can ask for
          </p>
          <h2
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 600,
              color: C.ink,
              margin: '0 0 28px',
              lineHeight: 1.15,
            }}
          >
            Twelve project types we cover.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {PROJECTS.map(p => (
              <Link
                key={p.href}
                href={p.href}
                style={{
                  display: 'block',
                  padding: '18px 20px',
                  border: `1px solid ${C.line}`,
                  borderRadius: 6,
                  background: C.card,
                  color: C.ink,
                  fontFamily: FB,
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {p.label}
                <span
                  aria-hidden="true"
                  style={{
                    color: C.accent,
                    fontFamily: FM,
                    fontSize: 13,
                    marginLeft: 8,
                  }}
                >
                  →
                </span>
              </Link>
            ))}
          </div>
          <p
            style={{
              fontFamily: FB,
              fontSize: 13,
              color: C.inkFaint,
              margin: '20px 0 0',
              fontStyle: 'italic',
            }}
          >
            The big ones we will not sell you a cart for: roofs, panels, septic. We will
            tell you who to call instead.
          </p>
        </div>
      </section>

      {/* ── Final CTA banner ─────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(56px,8vw,96px) 24px',
          background: C.paper,
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 600,
              color: C.ink,
              margin: '0 0 14px',
              lineHeight: 1.15,
            }}
          >
            Tell us the project. We will do the list.
          </h2>
          <p
            style={{
              fontFamily: FB,
              fontSize: 15,
              color: C.inkSoft,
              fontStyle: 'italic',
              margin: '0 0 24px',
            }}
          >
            Average turnaround on a weekday: 47 minutes.
          </p>
          <Link
            href="/smart-cart"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: C.accent,
              color: '#FAF7F2',
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 4,
            }}
          >
            Start a Smart Cart — $19.99
          </Link>
        </div>
      </section>

      <EmailCaptureV8 />
      <Footer />

      {/* Hero responsive split (desktop only) */}
      <style>{`
        @media (min-width: 880px) {
          .v8-hero-grid {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr) !important;
          }
        }
      `}</style>
    </main>
  )
}

// ── Sample-cart line ─────────────────────────────────────────────────
function SampleCartRow({
  icon,
  label,
  price,
  strike,
  note,
}: {
  icon: 'check' | 'x' | 'warn'
  label: string
  price?: string
  strike?: boolean
  note?: boolean
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '20px 1fr auto',
        gap: 12,
        alignItems: 'baseline',
        padding: '10px 0',
        borderBottom: `1px solid ${note ? 'transparent' : C.lineSoft}`,
      }}
    >
      <span style={{ paddingTop: 3 }}>
        {icon === 'check' && <IconCheck />}
        {icon === 'x' && <IconX />}
        {icon === 'warn' && <IconWarn />}
      </span>
      <span
        style={{
          fontFamily: FB,
          fontSize: 14,
          color: note ? C.ink : strike ? C.inkSoft : C.ink,
          textDecoration: strike ? 'line-through' : 'none',
          lineHeight: 1.55,
        }}
      >
        {label}
      </span>
      {price && (
        <span
          style={{
            fontFamily: FM,
            fontSize: 13,
            color: strike ? C.inkSoft : C.ink,
            textDecoration: strike ? 'line-through' : 'none',
          }}
        >
          {price}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// v7.2.14 — "Before you spend thousands" section
//
// Four pilot Smart Cart tiles framed around the brand thesis: small
// product lists that help homeowners avoid the expensive version of the
// wrong project. Two pilots have dedicated topic landing pages (window,
// basement); the other two open the curation modal directly via
// data-curation-modal-* attributes so existing scopes get exposure
// without needing new pages.
// ============================================================================

type CartTile =
  | {
      kind: 'topic-page'
      title: string
      subtitle: string
      cta: string
      href: string
    }
  | {
      kind: 'modal'
      title: string
      subtitle: string
      cta: string
      topicAttr: string
      scopeAttr: string
    }

const BEFORE_YOU_SPEND_TILES: CartTile[] = [
  {
    kind: 'topic-page',
    title: 'Window weatherization',
    subtitle: 'Close drafts before you replace windows',
    cta: '$19.99 product list →',
    href: '/smart-cart/topic/window-weatherization-vermont',
  },
  {
    kind: 'topic-page',
    title: 'Basement moisture prep',
    subtitle: 'Check for water risk before finishing',
    cta: '$19.99 product list →',
    href: '/smart-cart/topic/basement-moisture-prep',
  },
  {
    kind: 'modal',
    title: 'Mudroom & entry reset',
    subtitle: 'Solve mud-season chaos for a Vermont entry',
    cta: '$19.99 product list →',
    topicAttr: 'mudroom',
    scopeAttr: 'mudroom_entry_reset',
  },
  {
    kind: 'modal',
    title: 'Moisture & smell prevention',
    subtitle: 'Catch basement moisture before it becomes mold',
    cta: '$19.99 product list →',
    topicAttr: 'home_repair',
    scopeAttr: 'home_moisture_control',
  },
]

function BeforeYouSpendThousandsSection() {
  return (
    <section
      style={{
        padding: 'clamp(56px,8vw,96px) 24px',
        background: C.paper,
        borderTop: `1px solid ${C.line}`,
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: FM,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.accent,
            margin: '0 0 14px',
          }}
        >
          Before you spend thousands
        </p>
        <h2
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 600,
            color: C.ink,
            margin: '0 0 12px',
            lineHeight: 1.15,
          }}
        >
          Small product lists. Expensive mistakes avoided.
        </h2>
        <p
          style={{
            fontFamily: FB,
            fontSize: 17,
            color: C.inkSoft,
            margin: '0 0 32px',
            lineHeight: 1.6,
            maxWidth: 640,
          }}
        >
          Vermont-specific lists that help you avoid the expensive version of
          the wrong project. Each is $19.99, one-time, no subscription.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 18,
          }}
        >
          {BEFORE_YOU_SPEND_TILES.map((tile, i) => (
            <BeforeYouSpendTile key={i} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BeforeYouSpendTile({ tile }: { tile: CartTile }) {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    padding: '22px 22px 20px',
    background: C.paper,
    border: `1px solid ${C.line}`,
    borderRadius: 6,
    fontFamily: FB,
    color: C.ink,
    textDecoration: 'none',
    cursor: 'pointer',
    minHeight: 160,
  }
  const titleEl = (
    <div
      style={{
        fontFamily: FS,
        fontSize: 19,
        fontWeight: 600,
        color: C.ink,
        lineHeight: 1.25,
      }}
    >
      {tile.title}
    </div>
  )
  const subtitleEl = (
    <div
      style={{
        fontSize: 14,
        color: C.inkSoft,
        lineHeight: 1.55,
        flexGrow: 1,
      }}
    >
      {tile.subtitle}
    </div>
  )
  const ctaEl = (
    <div
      style={{
        marginTop: 8,
        fontSize: 13,
        color: C.accent,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {tile.cta}
    </div>
  )

  if (tile.kind === 'topic-page') {
    return (
      <a href={tile.href} style={cardStyle}>
        {titleEl}
        {subtitleEl}
        {ctaEl}
      </a>
    )
  }
  return (
    <button
      type="button"
      data-curation-modal-open
      data-curation-modal-product="smart_cart"
      data-curation-modal-topic={tile.topicAttr}
      data-curation-modal-scope={tile.scopeAttr}
      style={{ ...cardStyle, border: cardStyle.border, textAlign: 'left' as const, font: 'inherit' }}
    >
      {titleEl}
      {subtitleEl}
      {ctaEl}
    </button>
  )
}

// ============================================================================
// v7.2.18-A5 — First-time entry strip + curated guide grid.
//
// Soft entry for visitors who landed on the seasonal hero but aren't ready to
// buy. Three top-of-funnel doors (what we are / how we save / free chat), six
// curated guides, then a single Smart Cart CTA at the bottom — not inside each
// card. Matches the homepage's existing token palette and type system.
// ============================================================================

const FIRST_TIME_ENTRIES: { eyebrow: string; title: string; body: string; href: string }[] = [
  {
    eyebrow: 'New here?',
    title: 'What we are',
    body: 'A Vermont-built shopping list service for one home project at a time. No subscription, no contractor referral fees, no upsell.',
    href: '/guides',
  },
  {
    eyebrow: 'The method',
    title: 'How we save you money',
    body: 'Buy / Skip / Wait — a real Vermont read on which products are worth it, which are designer markup, and which to wait on.',
    href: '/guides/how-to-shop-for-home-projects-without-overspending?utm_source=homepage&utm_medium=entry_strip&utm_campaign=method',
  },
  {
    eyebrow: 'Just ask',
    title: 'Free chat for Vermont homeowners',
    body: 'Heat pumps, rebates, kitchen costs, when to schedule. Real answers from a Vermont local. No signup.',
    href: '/chat?utm_source=homepage&utm_medium=entry_strip&utm_campaign=free_chat',
  },
]

const CURATED_GUIDES: { label: string; sub: string; href: string }[] = [
  { label: 'Lake Season', sub: 'Patio, lights, grill, bug control — what to buy this weekend.', href: '/guides/lake-season-buy-skip-wait' },
  { label: 'Kitchen Refresh', sub: 'Hardware swap, faucet, lighting. The $260 lift, not the $20k remodel.', href: '/guides/kitchen-refresh-buy-skip-wait' },
  { label: 'Windows', sub: 'Weatherize before you replace. The $200 fix vs the $14,000 quote.', href: '/guides/windows-buy-skip-wait' },
  { label: 'Basement', sub: 'Diagnostic before finishing. The $40 test that prevents the $30k mistake.', href: '/guides/basement-buy-skip-wait' },
  { label: 'Grills', sub: 'Weber vs BGE vs Kamado Joe — which one actually fits your cookout.', href: '/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost' },
  { label: 'Buy-Timing Calendar', sub: 'When patio drops, when grills clear, when paint moves. Month-by-month.', href: '/guides/home-improvement-buy-timing-calendar' },
]

function FirstTimeEntrySection() {
  return (
    <section
      style={{
        padding: 'clamp(48px,7vw,80px) 24px',
        borderBottom: `1px solid ${C.lineSoft}`,
        background: C.bg,
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: FM,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.sage,
            margin: '0 0 14px',
          }}
        >
          First time here?
        </p>
        <h2
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.7rem, 3.6vw, 2.4rem)',
            fontWeight: 600,
            color: C.ink,
            margin: '0 0 28px',
            lineHeight: 1.15,
            maxWidth: 720,
          }}
        >
          Three doors in. Pick the one that matches where you are.
        </h2>

        {/* ── Three entry points ───────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 48,
          }}
        >
          {FIRST_TIME_ENTRIES.map((entry, i) => (
            <Link
              key={i}
              href={entry.href}
              style={{
                display: 'block',
                padding: '22px 22px 20px',
                background: C.card,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                textDecoration: 'none',
                color: C.ink,
              }}
            >
              <div
                style={{
                  fontFamily: FM,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.accent,
                  marginBottom: 8,
                }}
              >
                {entry.eyebrow}
              </div>
              <div
                style={{
                  fontFamily: FS,
                  fontSize: 19,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 8,
                  lineHeight: 1.25,
                }}
              >
                {entry.title}
              </div>
              <div
                style={{
                  fontFamily: FB,
                  fontSize: 14,
                  color: C.inkSoft,
                  lineHeight: 1.55,
                }}
              >
                {entry.body}
              </div>
              <div
                style={{
                  fontFamily: FB,
                  fontSize: 13,
                  color: C.accent,
                  fontWeight: 600,
                  marginTop: 12,
                }}
              >
                Open →
              </div>
            </Link>
          ))}
        </div>

        {/* ── Curated guides ───────────────────────────────────── */}
        <p
          style={{
            fontFamily: FM,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.accent,
            margin: '0 0 14px',
          }}
        >
          The shortlist
        </p>
        <h3
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
            fontWeight: 600,
            color: C.ink,
            margin: '0 0 22px',
            lineHeight: 1.2,
          }}
        >
          Six guides that cover most Vermont projects.
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            marginBottom: 36,
          }}
        >
          {CURATED_GUIDES.map((g, i) => (
            <Link
              key={i}
              href={g.href}
              style={{
                display: 'block',
                padding: '18px 20px',
                background: C.card,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                textDecoration: 'none',
                color: C.ink,
              }}
            >
              <div
                style={{
                  fontFamily: FS,
                  fontSize: 17,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 6,
                  lineHeight: 1.25,
                }}
              >
                {g.label}{' '}
                <span aria-hidden="true" style={{ color: C.accent, fontFamily: FM, fontSize: 13 }}>
                  →
                </span>
              </div>
              <div style={{ fontFamily: FB, fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
                {g.sub}
              </div>
            </Link>
          ))}
        </div>

        {/* ── Single Smart Cart CTA at section bottom ────────── */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: 24,
            borderTop: `1px dashed ${C.line}`,
          }}
        >
          <p
            style={{
              fontFamily: FB,
              fontSize: 14,
              color: C.inkSoft,
              margin: '0 0 14px',
            }}
          >
            Or skip the reading — tell us the project and we&apos;ll build the cart.
          </p>
          <Link
            href="/smart-cart?utm_source=homepage&utm_medium=entry_strip&utm_campaign=section_bottom"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: C.accent,
              color: '#FAF7F2',
              fontFamily: FB,
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 4,
              textDecoration: 'none',
            }}
          >
            Build a Smart Cart — $19.99 →
          </Link>
        </div>
      </div>
    </section>
  )
}
