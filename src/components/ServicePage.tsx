import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GuideFooter from '@/components/GuideFooter'
import SmartCartBridge from '@/components/SmartCartBridge'
import {
  buildArticle,
  buildBreadcrumbList,
  buildLocalBusiness,
  absUrl,
} from '@/lib/jsonld'

// v7.2.14 — Smart Cart bridge selector.
// Renders the appropriate bridge module based on slug pattern.
// Returns null on slugs that don't have a paired pre-cart landing.
function renderSmartCartBridge(slug: string) {
  if (slug.startsWith('window-replacement-')) {
    return (
      <SmartCartBridge
        headline="Before you replace, try $80–$220 of weatherization."
        body="Most pre-1990 Vermont windows have intact frames and air-leak drafts that film, weatherstripping, and removable seasonal caulk close for one winter. The Smart Cart shows you which products actually work — and which windows are genuinely past saving."
        topicSlug="window-weatherization-vermont"
        ctaText="See the window weatherization cart"
        secondaryText="Still need a pro? Continue to window installers below ↓"
      />
    )
  }
  if (slug.startsWith('basement-finishing-')) {
    return (
      <SmartCartBridge
        headline="Test for moisture before you finish."
        body="The $19.99 diagnostic kit (hygrometer, moisture meter, water alarms, properly-sized dehumidifier, mold screen) pays for itself many times over by catching problems before they're walled in. Compare to a $20–50k finish project."
        topicSlug="basement-moisture-prep"
        ctaText="See the basement moisture prep cart"
        secondaryText="Active water, mold, or foundation cracks? Continue to basement contractors below ↓"
      />
    )
  }
  return null
}

// Town × service page renderer.
//
// Each /{service}-{town}-vt page (V6 commit 11) imports its content
// record and renders it via this component. Replaces the V1-V3
// SeoPage marketplace-era pattern. No "Post your project free",
// no "matched in 48 hours" language anywhere.
//
// Layout:
//   Breadcrumb: Home → Towns → {Town} → {Service}
//   H1: {Service} in {Town}, VT — costs, contractors, rebates
//   Lead paragraph (Vermont-specific)
//   2-5 H2 body sections
//   Property tool funnel (town-prefilled)
//   <GuideFooter /> with byline + verifyDate + factIds + challenge link
//   JSON-LD: Article + BreadcrumbList + LocalBusiness

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

export type ServicePageContent = {
  slug: string                    // 'kitchen-remodeling-stowe-vt'
  serviceLabel: string            // 'Kitchen remodeling'
  townName: string                // 'Stowe' (or 'Vermont' for statewide)
  townSlug?: string | null        // for V6 town link, if applicable
  county?: string | null          // 'Lamoille County'
  metaTitle: string
  metaDescription: string
  h1: string
  leadParagraph: string
  sections: { h2: string; body: string }[]
  factIds: string[]
  relatedGuideSlugs: string[]
  // The town × service slugs to suggest at the bottom (cross-link to
  // related services in the same town, or related towns for the same
  // service — the ranker logic per V4 TOPIC_AFFINITY).
  relatedServiceSlugs: string[]
  samplePropertySlug?: string | null   // for the funnel CTA
  byline?: string | null
  verifyDate: string
}

export default function ServicePage({
  content,
}: {
  content: ServicePageContent
}) {
  const path = `/${content.slug}`
  const url = absUrl(path)

  const breadcrumbCrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Towns', url: '/towns' },
  ]
  if (content.townSlug) {
    breadcrumbCrumbs.push({ name: content.townName, url: `/${content.townSlug}` })
  } else {
    // Statewide page — skip the town tier
    breadcrumbCrumbs.push({ name: 'Vermont', url: '/towns' })
  }
  breadcrumbCrumbs.push({ name: content.serviceLabel, url: path })

  const schemas: object[] = [
    buildArticle({
      headline: content.h1,
      description: content.metaDescription,
      url,
      dateModified: content.verifyDate,
    }),
    buildBreadcrumbList(breadcrumbCrumbs),
  ]

  // LocalBusiness only for town-specific pages, not statewide
  if (content.townSlug) {
    schemas.push(
      buildLocalBusiness({
        name: `Alder Projects — ${content.serviceLabel} in ${content.townName}, VT`,
        url,
        description: content.metaDescription,
        townName: content.townName,
        areaServed: `${content.townName}, Vermont`,
      })
    )
  }

  const funnelHref = content.samplePropertySlug
    ? `/property/${content.samplePropertySlug}`
    : '/'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.cream, fontFamily: FB }}>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Nav />

      {/* Hero */}
      <div
        style={{
          backgroundColor: C.ink,
          padding: 'clamp(96px,10vw,120px) 24px clamp(40px,6vw,64px)',
          borderBottom: `1px solid ${C.sage}1a`,
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Link
              href="/towns"
              style={{
                fontSize: '11px',
                fontFamily: FM,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.sage,
                textDecoration: 'none',
              }}
            >
              ← Vermont towns
            </Link>
          </div>
          <h1
            style={{
              fontFamily: FS,
              fontSize: 'clamp(1.6rem,3.6vw,2.3rem)',
              fontWeight: 600,
              color: C.ivory,
              lineHeight: 1.2,
              margin: '0 0 18px',
            }}
          >
            {content.h1}
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
            {content.leadParagraph}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(32px,5vw,48px) 24px 80px' }}>
        {/* v7.2.14: Smart Cart bridge — show on pages where the cart is a
            better first step for some users. The bridge does not replace
            the pro funnel; severe cases continue down to the property
            funnel and related-pages section. */}
        {renderSmartCartBridge(content.slug)}

        {content.sections.map((section, i) => (
          <section key={i} style={{ marginBottom: '36px' }}>
            <h2
              style={{
                fontFamily: FS,
                fontSize: 'clamp(1.15rem,2.4vw,1.5rem)',
                fontWeight: 600,
                color: C.ink,
                marginBottom: '12px',
              }}
            >
              {section.h2}
            </h2>
            {section.body.split('\n\n').map((para, j) => (
              <p
                key={j}
                style={{
                  fontSize: '15px',
                  color: `${C.ink}c0`,
                  lineHeight: 1.85,
                  marginBottom: '12px',
                }}
              >
                {renderInlineMarkdown(para)}
              </p>
            ))}
          </section>
        ))}

        {/* Property tool funnel */}
        <div
          style={{
            backgroundColor: C.ink,
            padding: '28px 24px',
            margin: '32px 0',
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
            Get the {content.townName} property synthesis for your address.
          </p>
          <p style={{ fontSize: '14px', color: `${C.ivory}99`, lineHeight: 1.6, margin: '0 0 16px' }}>
            Permits, rebates, contractor density, lake/flood/septic context — by your specific address.
          </p>
          <Link
            href={funnelHref}
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
            {content.samplePropertySlug
              ? `See a sample ${content.townName} property →`
              : 'Enter your Vermont address →'}
          </Link>
        </div>

        {/* Related guides */}
        {content.relatedGuideSlugs.length > 0 && (
          <section style={{ borderTop: `1px solid ${C.cardLine}`, paddingTop: '24px', marginBottom: '24px' }}>
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
              Related guides
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '6px' }}>
              {content.relatedGuideSlugs.map(slug => (
                <li key={slug}>
                  <Link
                    href={`/guides/${slug}`}
                    style={{ fontSize: '14px', color: C.accent, textDecoration: 'none' }}
                  >
                    /{slug.replace(/-/g, ' ')} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related service pages */}
        {content.relatedServiceSlugs.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
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
              Related pages
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {content.relatedServiceSlugs.map(slug => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${C.cardLine}`,
                    fontSize: '12px',
                    fontFamily: FM,
                    color: C.inkSoft,
                    textDecoration: 'none',
                  }}
                >
                  {slug.replace(/-/g, ' ')} →
                </Link>
              ))}
            </div>
          </section>
        )}

        <GuideFooter
          byline={content.byline ?? undefined}
          verifyDate={content.verifyDate}
          factIds={content.factIds}
          funnelTownPrefill={content.townSlug ? content.townName : undefined}
        />
      </div>

      <Footer />
    </div>
  )
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const re = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match
  let key = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <strong key={key++} style={{ color: '#1C2B1A', fontWeight: 600 }}>
        {match[1]}
      </strong>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length > 0 ? parts : text
}
