'use client'

import Link from 'next/link'

// Researcher landing — six curated topic cards that replace the
// six-chip picker for intent='researching'. Each card has a "Walk me
// through it" button that drops a prompt into the sticky chat sidebar
// via the existing 'alder:chatPrompt' event channel, plus (where one
// exists) an authoritative external link or internal guide page.
//
// Hard rules: no affiliate items, no contractor CTAs, no project cost
// tiles. Researchers don't shop. The bottom CTA points to / so the
// visitor can apply this to a different Vermont address.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  bg: '#FAF7F2',
}
const FD = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

function dispatchChatPrompt(text: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem('alder.chatPendingPrompt', text)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('alder:chatPrompt', { detail: { text } }))
}

type ExternalLink = { label: string; url: string; sponsored?: boolean }
type Card = {
  id: string
  title: string
  body: string
  walkPrompt?: string  // dispatches to chat
  walkLabel?: string   // defaults to "Walk me through it"
  internalLink?: { label: string; href: string }
  external?: ExternalLink
}

const CARDS: Card[] = [
  {
    id: 'property_tax',
    title: 'Property tax',
    body:
      'Vermont taxes work different. Cycle, Homestead Declaration, grand list — what every owner should know.',
    walkPrompt:
      'Walk me through how Vermont property tax works — Homestead Declaration, the grand list, when bills come, the basics every owner should know.',
    external: { label: 'VT Tax Department →', url: 'https://tax.vermont.gov/property' },
  },
  {
    id: 'rebates',
    title: 'Rebates and incentives',
    body:
      'EVT runs a $7-17k stack. Federal 25D adds 30% on solar. Here is how to actually claim it.',
    walkPrompt:
      'Walk me through the Vermont rebate stack — EVT weatherization tiers, heat pump rebates, federal 25D for solar, how they stack and what you actually file.',
    external: { label: 'Efficiency Vermont →', url: 'https://www.efficiencyvermont.com/rebates' },
  },
  {
    id: 'mud_season',
    title: 'Mud season + cold climate',
    body:
      'March-May is its own thing. Driveways, septic, foundations — what mud season does to a Vermont property.',
    walkLabel: 'Read the guide',
    internalLink: { label: 'Read the guide →', href: '/vermont-mud-season-homeowner-guide' },
  },
  {
    id: 'contractor',
    title: 'Contractor reality',
    body:
      'Vermont does not license GCs. Here is how vetting actually works and what the AG registry catches.',
    walkPrompt:
      'Walk me through how to vet a Vermont contractor when there is no state GC license — the AG registry, insurance verification, the contract terms that matter, what the red flags look like.',
    external: { label: 'VT AG registry →', url: 'https://ago.vermont.gov/cap' },
  },
  {
    id: 'act47',
    title: 'Act 47 + ADU rules',
    body:
      'Statewide ADU-by-right since 2024. What it changed at the town level — and what towns can still gate.',
    walkPrompt:
      'Walk me through Act 47, Vermont’s 2024 ADU-by-right law — what it allows, what towns can still restrict (parking, owner-occupancy, septic), and how it interacts with town zoning.',
  },
  {
    id: 'alphabet',
    title: 'EVT, Act 250, Homestead — the alphabet soup',
    body: 'Three terms every Vermont property owner should know — what they are, when each one bites.',
    walkPrompt:
      'Walk me through Efficiency Vermont, Act 250, and the Homestead Declaration — what each one is, when it applies to a homeowner, and the practical thing to remember about each.',
  },
]

export default function VermontBasicsSection() {
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <header style={{ marginBottom: 4 }}>
        <h2
          style={{
            fontFamily: FD,
            fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
            fontWeight: 600,
            color: C.ink,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Vermont basics
        </h2>
        <p style={{ fontSize: 14, fontFamily: FB, color: C.inkSoft, margin: '6px 0 0', lineHeight: 1.55 }}>
          How Vermont property works — start anywhere.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {CARDS.map(card => (
          <div
            key={card.id}
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.cardLine}`,
              borderRadius: 6,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                fontFamily: FB,
                fontSize: 16,
                fontWeight: 600,
                color: C.ink,
                margin: '0 0 8px',
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontSize: 13,
                fontFamily: FB,
                color: C.inkSoft,
                lineHeight: 1.55,
                margin: '0 0 14px',
                flex: 1,
              }}
            >
              {card.body}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {card.walkPrompt && (
                <button
                  type="button"
                  onClick={() => dispatchChatPrompt(card.walkPrompt!)}
                  style={primaryButtonStyle}
                >
                  {card.walkLabel ?? 'Walk me through it'} →
                </button>
              )}
              {card.internalLink && (
                <Link href={card.internalLink.href} style={primaryLinkStyle}>
                  {card.internalLink.label}
                </Link>
              )}
              {card.external && (
                <a
                  href={card.external.url}
                  target="_blank"
                  rel={card.external.sponsored ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
                  style={secondaryLinkStyle}
                >
                  {card.external.label}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 8,
          padding: '14px 18px',
          backgroundColor: C.card,
          border: `1px solid ${C.cardLine}`,
          borderRadius: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, margin: 0 }}>
          Curious how this applies to a different VT address?
        </p>
        <Link href="/" style={primaryLinkStyle}>
          Try another →
        </Link>
      </div>
    </section>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  border: 'none',
  backgroundColor: C.accent,
  color: '#FAF7F2',
  borderRadius: 4,
  fontFamily: FB,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const primaryLinkStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  textDecoration: 'none',
  display: 'inline-block',
}

const secondaryLinkStyle: React.CSSProperties = {
  fontSize: 12,
  fontFamily: FB,
  color: C.accent,
  textDecoration: 'none',
  borderBottom: `1px solid rgba(200,115,42,0.3)`,
  whiteSpace: 'nowrap',
}
