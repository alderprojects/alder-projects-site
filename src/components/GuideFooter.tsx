import Link from 'next/link'
import { getSourcesForGuide } from '@/content/facts'
import SmartCartGuideCTA, { type SmartCartGuideCTAConfig } from '@/components/SmartCartGuideCTA'

// E-E-A-T scaffold rendered at the bottom of every content page.
//
// Standardizes:
//   - Byline + last-verified date (Experience, Authority signal)
//   - Sources block auto-rendered from factIds (Trust signal)
//   - "See an error?" challenge link (Trust signal — actively invited)
//   - Property tool funnel (the only CTA)
//
// Without this footer, content pages look like SEO scaffolding to
// Google. With it, they look reviewed, dated, and sourced.

type GuideFooterProps = {
  byline?: string                 // defaults to 'Alder Projects editorial team'
  verifyDate: string              // ISO YYYY-MM-DD
  factIds: string[]               // FACTS table ids cited in this guide
  challengeUrl?: string           // mailto link to flag errors
  funnelTownPrefill?: string      // pre-fill the property tool form for a specific town
  funnelLabel?: string            // override default funnel CTA copy
  /**
   * v7.2.14 fix-up — when set, replaces the property-tool funnel hero
   * with a Smart Cart hero CTA. The property-tool funnel is suppressed
   * entirely (not duplicated below).
   */
  smartCartCta?: SmartCartGuideCTAConfig
}

const INK = '#1C2B1A'
const CREAM = '#FAF7F2'
const SAGE = '#7A9B6F'

function formatVerifyDate(iso: string): string {
  // 2026-04-15 → April 15, 2026
  const d = new Date(iso + 'T00:00:00Z')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function GuideFooter({
  byline = 'Alder Projects editorial team',
  verifyDate,
  factIds,
  challengeUrl,
  funnelTownPrefill,
  funnelLabel,
  smartCartCta,
}: GuideFooterProps) {
  const sources = getSourcesForGuide(factIds)
  const challenge =
    challengeUrl ??
    'mailto:hello@alderprojects.com?subject=Error+or+stale+fact+in+a+guide'

  const funnelHref = funnelTownPrefill
    ? `/?town=${encodeURIComponent(funnelTownPrefill)}#submit-project`
    : '/'

  const funnelCopy =
    funnelLabel ??
    "Got a Vermont property question this guide didn't answer?"

  return (
    <footer
      style={{
        marginTop: '64px',
        paddingTop: '48px',
        borderTop: `1px solid ${INK}10`,
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Byline + verify date */}
      <div style={{ marginBottom: '40px' }}>
        <p
          style={{
            fontSize: '13px',
            color: `${INK}99`,
            lineHeight: 1.7,
            margin: 0,
            fontFamily: 'monospace',
            letterSpacing: '0.02em',
          }}
        >
          By {byline} &middot; Last verified {formatVerifyDate(verifyDate)}
        </p>
      </div>

      {/* Sources block — only render if we have any cited facts */}
      {sources.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '18px',
              fontWeight: 600,
              color: INK,
              marginBottom: '16px',
              marginTop: 0,
            }}
          >
            Sources
          </h3>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {sources.map(s => (
              <li
                key={s.id}
                style={{
                  fontSize: '14px',
                  color: `${INK}cc`,
                  lineHeight: 1.6,
                }}
              >
                <a
                  href={s.sourceUrl}
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  style={{ color: INK, textDecoration: 'underline' }}
                >
                  {s.sourceLabel}
                </a>
                {' '}&mdash; {s.label} ({s.value}). Verified{' '}
                {formatVerifyDate(s.verifyDate)}.
                {s.notes ? (
                  <span style={{ display: 'block', color: `${INK}88`, fontSize: '13px', marginTop: '2px' }}>
                    {s.notes}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Challenge / see an error block */}
      <div
        style={{
          marginBottom: '40px',
          padding: '16px 20px',
          backgroundColor: `${SAGE}10`,
          borderLeft: `2px solid ${SAGE}`,
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: `${INK}cc`,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          See an error or a stale fact?{' '}
          <a
            href={challenge}
            style={{ color: INK, textDecoration: 'underline', fontWeight: 600 }}
          >
            Tell us
          </a>
          {' '}&mdash; we update.
        </p>
      </div>

      {/* CTA — Smart Cart hero (v7.2.14 pilot guides) OR property-tool funnel (default). */}
      {smartCartCta ? (
        <SmartCartGuideCTA variant="hero" {...smartCartCta} />
      ) : (
        <div
          style={{
            padding: '28px 24px',
            backgroundColor: INK,
            color: CREAM,
            marginBottom: '40px',
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              fontWeight: 500,
              color: CREAM,
              lineHeight: 1.4,
              margin: '0 0 12px',
            }}
          >
            {funnelCopy}
          </p>
          <Link
            href={funnelHref}
            style={{
              display: 'inline-block',
              fontSize: '14px',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              color: SAGE,
              textDecoration: 'none',
              borderBottom: `1px solid ${SAGE}`,
              paddingBottom: '2px',
            }}
          >
            Enter your address &mdash; we synthesize the rest &rarr;
          </Link>
        </div>
      )}
    </footer>
  )
}
