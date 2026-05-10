import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CurationModal from '@/components/CurationModal'
import PageViewEvent from '@/components/PageViewEvent'
import Why1999Module from '@/components/Why1999Module'
import {
  buildArticle,
  buildBreadcrumbList,
  buildSmartCartProduct,
  absUrl,
} from '@/lib/jsonld'
import { CONFIG } from '@/lib/recommender-config'
import {
  SMART_CART_TOPIC_LANDINGS,
  SMART_CART_TOPIC_SLUGS,
} from '@/content/smart-cart-topic-pages'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return SMART_CART_TOPIC_SLUGS.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const c = SMART_CART_TOPIC_LANDINGS[params.slug]
  if (!c) return {}
  const path = `/smart-cart/topic/${c.slug}`
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `https://alderprojects.com${path}` },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `https://alderprojects.com${path}`,
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
  cream: '#FAF7F2',
  ivory: '#F5EFE0',
  sage: '#7A9B6F',
}

// v7.2.15 — map topic landing slugs to the matching Why $19.99 variant.
const WHY_VARIANT_BY_SLUG: Record<string, 'window' | 'basement'> = {
  'window-weatherization-vermont': 'window',
  'basement-moisture-prep': 'basement',
}
const FS = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"

export default function SmartCartTopicPage({ params }: Props) {
  const c = SMART_CART_TOPIC_LANDINGS[params.slug]
  if (!c) notFound()

  const path = `/smart-cart/topic/${c.slug}`
  const url = absUrl(path)

  const schemas = [
    buildArticle({
      headline: c.h1,
      description: c.metaDescription,
      url,
      dateModified: '2026-05-10',
    }),
    buildBreadcrumbList([
      { name: 'Home', url: '/' },
      { name: 'Smart Cart', url: '/smart-cart' },
      { name: c.h1.replace(/\.$/, ''), url: path },
    ]),
    // v7.2.15 — Smart Cart Product / Offer schema. The page IS the product
    // landing page for the $19.99 cart for this scope. No fake reviews,
    // no aggregate ratings.
    buildSmartCartProduct({
      name: c.h1.replace(/\.$/, ''),
      description: c.metaDescription,
      url,
      priceUsd: CONFIG.products.smartCart.priceUsd,
      category: c.scopeVariantId,
    }),
  ]

  return (
    <>
      <Nav />
      <PageViewEvent
        kind="topic"
        slug={c.slug}
        topicId={c.topicId}
        scopeVariantId={c.scopeVariantId}
      />
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <main
        style={{
          background: C.cream,
          color: C.ink,
          fontFamily: FB,
          minHeight: '60vh',
        }}
      >
        <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.accent,
              marginBottom: 16,
            }}
          >
            Smart Cart · $19.99
          </p>
          <h1
            style={{
              fontFamily: FS,
              fontSize: 40,
              lineHeight: 1.15,
              margin: '0 0 16px',
              fontWeight: 500,
            }}
          >
            {c.h1}
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.5,
              color: C.inkSoft,
              margin: '0 0 24px',
            }}
          >
            {c.subtitle}
          </p>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: C.ink,
              margin: '0 0 32px',
            }}
          >
            {c.leadParagraph}
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
            <button
              type="button"
              data-curation-modal-open
              data-curation-modal-product="smart_cart"
              data-curation-modal-topic={c.topicId}
              data-curation-modal-scope={c.scopeVariantId}
              data-curation-modal-scenario="just_starting"
              data-topic-id={c.topicId}
              data-scope-id={c.scopeVariantId}
              data-scenario-id="just_starting"
              style={{
                background: C.accent,
                color: '#fff',
                border: 'none',
                padding: '14px 24px',
                fontFamily: FB,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              {c.primaryCtaText} →
            </button>
            <Link
              href={c.secondaryCta.href}
              style={{
                color: C.ink,
                fontSize: 15,
                alignSelf: 'center',
                textDecoration: 'underline',
              }}
            >
              {c.secondaryCta.text}
            </Link>
          </div>

          <Section title="What the cart picks for you" items={c.pickTeaser} accent={C.sage} />
          {/* v7.2.15 — concrete "Why $19.99?" module above the skip
              section. Mapped from the topic slug to the buyer's actual
              fear. */}
          {WHY_VARIANT_BY_SLUG[c.slug] && (
            <Why1999Module variant={WHY_VARIANT_BY_SLUG[c.slug]} />
          )}
          <Section title="What it skips" items={c.skipTeaser} accent={C.inkFaint} />
          <Section
            title="When to skip the cart and call a pro"
            items={c.routeOutTeaser}
            accent={C.accent}
          />

          <div
            style={{
              marginTop: 40,
              padding: 24,
              background: C.ivory,
              borderRadius: 6,
            }}
          >
            <p
              style={{
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.inkFaint,
                margin: '0 0 8px',
              }}
            >
              Read first
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0 }}>
              The deeper guide:{' '}
              <Link
                href={`/guides/${c.relatedGuideSlug}`}
                style={{ color: C.accent, fontWeight: 600 }}
              >
                Read the full Vermont guide →
              </Link>
            </p>
          </div>

          <p
            style={{
              fontSize: 13,
              color: C.inkFaint,
              marginTop: 32,
              fontStyle: 'italic',
            }}
          >
            Savings claims are avoided-overbuying estimates, not guaranteed rebates.
          </p>
        </article>
      </main>
      <CurationModal />
      <Footer />
    </>
  )
}

function Section({
  title,
  items,
  accent,
}: {
  title: string
  items: string[]
  accent: string
}) {
  return (
    <section style={{ margin: '32px 0' }}>
      <h2
        style={{
          fontFamily: FS,
          fontSize: 22,
          fontWeight: 500,
          margin: '0 0 12px',
          color: C.ink,
        }}
      >
        {title}
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              borderLeft: `3px solid ${accent}`,
              padding: '8px 0 8px 14px',
              margin: '8px 0',
              fontSize: 16,
              lineHeight: 1.5,
              color: C.ink,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
