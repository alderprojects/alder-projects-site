import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GuideFooter from '@/components/GuideFooter'
import PageViewEvent from '@/components/PageViewEvent'
import SmartCartGuideCTA from '@/components/SmartCartGuideCTA'
import CurationModal from '@/components/CurationModal'
import Why1999Module from '@/components/Why1999Module'
import {
  buildArticle,
  buildBreadcrumbList,
  buildFaqPage,
  absUrl,
} from '@/lib/jsonld'
import type { TopicGuideContent } from '@/content/topics'

// Shared rendering component for the 5 V6 topic guides (heat pump
// rebate stack, weatherization, solar+battery, ADU permit, rebate
// stack overview). Each guide's page.tsx renders this with its
// content record.

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

export default function TopicGuide({
  content,
  path,
}: {
  content: TopicGuideContent
  path: string
}) {
  const url = absUrl(path)

  const schemas = [
    buildArticle({
      headline: content.h1,
      description: content.metaDescription,
      url,
      dateModified: content.verifyDate,
    }),
    buildBreadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Guides', url: '/guides' },
      { name: content.h1, url: path },
    ]),
    buildFaqPage(
      content.faq.map(f => ({ question: f.question, answer: f.answer })),
    ),
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.cream, fontFamily: FB }}>
      {/* v7.2.14 — fire guide_view event on mount. */}
      <PageViewEvent kind="guide" slug={content.slug} topicId={content.topicId} />
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Nav />

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
              href="/guides"
              style={{
                fontSize: '11px',
                fontFamily: FM,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.sage,
                textDecoration: 'none',
              }}
            >
              ← Vermont guides
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

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px 80px' }}>
        {/* v7.2.14 fix-up — CTA #1: top-of-guide */}
        {content.smartCartCta && (
          <SmartCartGuideCTA variant="top" {...content.smartCartCta} />
        )}

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
            {/* v7.2.14 fix-up — CTA #2: end of "What the $19.99..." section */}
            {content.smartCartCta &&
              /^What the \$19\.99 Smart Cart actually does/i.test(section.h2) && (
                <>
                  <SmartCartGuideCTA variant="inline" {...content.smartCartCta} />
                  {/* v7.2.15 — concrete "Why $19.99?" right after the
                      second CTA so the trust pitch follows the action. */}
                  {content.why1999Variant && (
                    <Why1999Module variant={content.why1999Variant} />
                  )}
                </>
              )}
          </section>
        ))}

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

        {(content.relatedGuideSlugs.length > 0 || content.relatedTownSlugs.length > 0) && (
          <section style={{ borderTop: `1px solid ${C.cardLine}`, paddingTop: '32px', marginBottom: '32px' }}>
            {content.relatedGuideSlugs.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
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
              </div>
            )}
            {content.relatedTownSlugs.length > 0 && (
              <div>
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
                  Vermont towns
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {content.relatedTownSlugs.map(slug => (
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
                      {slug.replace('-vt', '').replace(/-/g, ' ')} →
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <GuideFooter
          byline={content.byline}
          verifyDate={content.verifyDate}
          factIds={content.factIds}
          smartCartCta={content.smartCartCta}
        />
      </div>

      {/* v7.2.14 fix-up — mount CurationModal so the in-guide CTAs work. */}
      {content.smartCartCta && <CurationModal />}

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
