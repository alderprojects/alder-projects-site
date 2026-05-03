import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GuideFooter from '@/components/GuideFooter'
import { TOWN_CONTENT, TOWN_SLUGS } from '@/content/towns'
import {
  buildArticle,
  buildBreadcrumbList,
  buildFaqPage,
  buildLocalBusiness,
  absUrl,
} from '@/lib/jsonld'

// Standalone town page route. /[townSlug] resolves only for the
// 9 V6 priority town slugs (stowe-vt, burlington-vt, etc.) — every
// other single-segment URL 404s via notFound(). The 45 town × service
// pages are individual static routes (e.g. /kitchen-remodeling-stowe-vt)
// and take precedence over this dynamic route automatically.
//
// generateStaticParams pre-renders these 9 pages at build time. dynamicParams
// is set to false so any slug not in the list 404s without hitting the
// renderer.

export const dynamicParams = false

export function generateStaticParams() {
  return TOWN_SLUGS.map(townSlug => ({ townSlug }))
}

export async function generateMetadata({
  params,
}: {
  params: { townSlug: string }
}): Promise<Metadata> {
  const content = TOWN_CONTENT[params.townSlug]
  if (!content) return {}
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: absUrl(`/${params.townSlug}`) },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: absUrl(`/${params.townSlug}`),
      type: 'article',
    },
  }
}

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.06)',
  cream: '#FAF7F2',
  ivory: '#F5EFE0',
  sage: '#7A9B6F',
}
const FS = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export default function TownPage({ params }: { params: { townSlug: string } }) {
  const content = TOWN_CONTENT[params.townSlug]
  if (!content) notFound()

  const url = absUrl(`/${params.townSlug}`)

  const schemas = [
    buildArticle({
      headline: content.h1,
      description: content.metaDescription,
      url,
      dateModified: content.verifyDate,
    }),
    buildBreadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Towns', url: '/towns' },
      { name: content.townName, url: `/${params.townSlug}` },
    ]),
    buildLocalBusiness({
      name: `Alder Projects — ${content.townName}, VT property guide`,
      url,
      description: content.metaDescription,
      townName: content.townName,
      areaServed: `${content.townName}, Vermont`,
    }),
    buildFaqPage(
      content.faq.map(f => ({ question: f.question, answer: f.answer })),
    ),
  ]

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
              fontSize: 'clamp(1.8rem,4vw,2.6rem)',
              fontWeight: 600,
              color: C.ivory,
              lineHeight: 1.15,
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

      {/* Quick facts panel */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 0' }}>
        <div
          style={{
            border: `1px solid ${C.cardLine}`,
            background: '#fff',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            fontSize: '13px',
            color: C.inkSoft,
          }}
        >
          <div>
            <div style={{ fontFamily: FM, fontSize: '10px', textTransform: 'uppercase', color: C.inkFaint, letterSpacing: '0.08em', marginBottom: '4px' }}>County</div>
            <div style={{ color: C.ink, fontWeight: 600 }}>{content.county}</div>
          </div>
          <div>
            <div style={{ fontFamily: FM, fontSize: '10px', textTransform: 'uppercase', color: C.inkFaint, letterSpacing: '0.08em', marginBottom: '4px' }}>Tier</div>
            <div style={{ color: C.ink, fontWeight: 600 }}>{prettyTier(content.townTier)}</div>
          </div>
          <div>
            <div style={{ fontFamily: FM, fontSize: '10px', textTransform: 'uppercase', color: C.inkFaint, letterSpacing: '0.08em', marginBottom: '4px' }}>Utility</div>
            <div style={{ color: C.ink, fontWeight: 600 }}>{content.utility}</div>
          </div>
          {content.medianHomeValue ? (
            <div>
              <div style={{ fontFamily: FM, fontSize: '10px', textTransform: 'uppercase', color: C.inkFaint, letterSpacing: '0.08em', marginBottom: '4px' }}>Median home</div>
              <div style={{ color: C.ink, fontWeight: 600 }}>${(content.medianHomeValue / 1000).toFixed(0)}k</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(32px,5vw,48px) 24px 80px' }}>
        {content.sections.map((section, i) => (
          <section key={i} style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontFamily: FS,
                fontSize: 'clamp(1.2rem,2.5vw,1.55rem)',
                fontWeight: 600,
                color: C.ink,
                marginBottom: '14px',
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
                  marginBottom: '14px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {renderInlineMarkdown(para)}
              </p>
            ))}
          </section>
        ))}

        {/* Property tool funnel — town pre-filled */}
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
            Get the {content.townName} synthesis for your address.
          </p>
          <p style={{ fontSize: '14px', color: `${C.ivory}99`, lineHeight: 1.6, margin: '0 0 16px' }}>
            Permits, rebates, contractor density, lake/flood/septic context — by your specific {content.townName} address.
          </p>
          <Link
            href={`/property/${content.samplePropertySlug}`}
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
            See a sample {content.townName} property →
          </Link>
        </div>

        {/* FAQ */}
        {content.faq.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontFamily: FS,
                fontSize: 'clamp(1.2rem,2.5vw,1.55rem)',
                fontWeight: 600,
                color: C.ink,
                marginBottom: '20px',
              }}
            >
              Frequently asked
            </h2>
            {content.faq.map((f, i) => (
              <div key={i} style={{ borderTop: `1px solid ${C.cardLine}`, padding: '18px 0' }}>
                <h3 style={{ fontFamily: FB, fontSize: '15px', fontWeight: 600, color: C.ink, margin: '0 0 6px' }}>{f.question}</h3>
                <p style={{ fontSize: '14px', color: `${C.ink}a3`, lineHeight: 1.75, margin: 0 }}>{f.answer}</p>
              </div>
            ))}
          </section>
        )}

        {/* Related guides */}
        {content.relatedGuideSlugs.length > 0 && (
          <section style={{ borderTop: `1px solid ${C.cardLine}`, paddingTop: '32px', marginBottom: '32px' }}>
            <p
              style={{
                fontSize: '11px',
                fontFamily: FM,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: C.inkFaint,
                marginBottom: '12px',
              }}
            >
              Related guides
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '8px' }}>
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
        {content.relatedServiceSlugs && content.relatedServiceSlugs.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <p
              style={{
                fontSize: '11px',
                fontFamily: FM,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: C.inkFaint,
                marginBottom: '12px',
              }}
            >
              {content.townName} service pages
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
                  {slug.replace(`-${params.townSlug}`, '').replace(/-/g, ' ')} →
                </Link>
              ))}
            </div>
          </section>
        )}

        <GuideFooter
          byline={content.byline}
          verifyDate={content.verifyDate}
          factIds={content.factIds}
          funnelTownPrefill={content.townName}
          funnelLabel={`Got a ${content.townName} property question this guide didn't answer?`}
        />
      </div>

      <Footer />
    </div>
  )
}

function prettyTier(tier: string): string {
  switch (tier) {
    case 'resort_premium': return 'Resort premium'
    case 'burlington_metro': return 'Burlington metro'
    case 'small_city': return 'Small city'
    case 'rural': return 'Rural'
    default: return tier
  }
}

// Render inline markdown-ish text: **bold** and "Trap:" emphasis. Avoids
// loading a full MD parser — content has consistent simple syntax.
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
