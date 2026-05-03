import Link from 'next/link'
import Nav from '@/components/Nav'
import {
  buildArticle,
  buildBreadcrumbList,
  buildFaqPage,
  absUrl,
} from '@/lib/jsonld'

// Auto-derive form pre-fill values from the guide H1 so each guide deep-links
// the project form with the right category/town context.
const CATEGORY_KEYWORDS: Array<[RegExp, string]> = [
  [/kitchen/i, 'Kitchen Remodel'],
  [/bathroom/i, 'Bathroom Renovation'],
  [/deck|porch/i, 'Deck / Porch'],
  [/basement/i, 'Basement Finishing'],
  [/(addition|extension|expansion)/i, 'Room Addition / Expansion'],
  [/(roof|weatheriz)/i, 'Roofing / Weatherization'],
  [/(plumb|hvac|heating|septic|heat pump)/i, 'Plumbing / HVAC'],
  [/electric/i, 'Electrical'],
  [/paint/i, 'Painting & Interior'],
  [/(window|general contractor|handyman|permit|seasonal|winteriz|flood|shoreland|lake)/i, 'Other'],
]

function deriveCategory(h1: string): string {
  for (const [re, cat] of CATEGORY_KEYWORDS) {
    if (re.test(h1)) return cat
  }
  return ''
}

const VT_TOWNS = ['Burlington','South Burlington','Stowe','Middlebury','Williston','Essex','Colchester','Winooski','Shelburne','Montpelier','Woodstock','Brattleboro','Rutland','Manchester','Bennington','Barre','Newport','Waitsfield','Morrisville','St. Johnsbury','Hardwick','Charlotte','Chittenden County','Addison County','Lamoille County','Rutland County','Washington County','Windsor County']

function deriveTown(h1: string): string {
  for (const t of VT_TOWNS) {
    const re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i')
    if (re.test(h1)) return t
  }
  return ''
}

function buildSubmitUrl(h1: string, source = 'guide-page'): string {
  const sp = new URLSearchParams()
  sp.set('source', source)
  const cat = deriveCategory(h1)
  const town = deriveTown(h1)
  if (cat) sp.set('category', cat)
  if (town) sp.set('town', town)
  sp.set('description', 'Coming from guide: ' + h1)
  return '/?' + sp.toString() + '#submit-project'
}

export type GuideSection = { heading: string; body: string; list?: string[] }
export type GuideFaq = { q: string; a: string }
export type GuidePageContent = {
  eyebrow: string; h1: string; intro: string; readTime: string
  sections: GuideSection[]; faqs?: GuideFaq[]
  ctaHeading: string; ctaBody: string
  relatedGuides?: { label: string; href: string }[]
  relatedPages?: { label: string; href: string }[]
}

export type GuidePageMeta = {
  // URL path of this guide, e.g. '/guides/heat-pump-rebates-vermont' or
  // '/vermont-mud-season-homeowner-guide'. Used to build canonical URL
  // for Article and BreadcrumbList JSON-LD.
  path: string
  // ISO YYYY-MM-DD. Used as Article dateModified — the
  // last-verified date Google reads as content freshness.
  verifyDate: string
  // Optional breadcrumb override. Defaults to Home → Guides → {h1}.
  breadcrumbs?: { name: string; url: string }[]
}

export default function GuidePage({
  content,
  meta,
}: {
  content: GuidePageContent
  meta?: GuidePageMeta
}) {
  const schemas = meta ? buildSchemas(content, meta) : []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Nav />
      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(96px,10vw,120px) 24px clamp(40px,6vw,64px)', borderBottom: '1px solid rgba(122,155,111,0.1)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F' }}>{content.eyebrow}</span>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.25)' }}>&middot; {content.readTime} read</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '16px' }}>{content.h1}</h1>
          <p style={{ fontSize: '17px', color: 'rgba(245,239,224,0.6)', lineHeight: 1.7, maxWidth: '580px', margin: 0 }}>{content.intro}</p>
        </div>
      </div>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px 80px' }}>
        {content.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '14px' }}>{section.heading}</h2>
            <p style={{ fontSize: '15px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.85, marginBottom: section.list ? '14px' : 0 }}>{section.body}</p>
            {section.list && (
              <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'none' }}>
                {section.list.map((item, j) => (
                  <li key={j} style={{ fontSize: '15px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.85, paddingLeft: '8px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '-14px', color: '#7A9B6F' }}>&#10003;</span>{item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div style={{ backgroundColor: '#1C2B1A', borderRadius: '4px', padding: '32px', margin: '48px 0' }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.4rem', color: '#F5EFE0', fontWeight: 600, margin: '0 0 10px' }}>{content.ctaHeading}</h3>
          <p style={{ fontSize: '14px', color: 'rgba(245,239,224,0.55)', lineHeight: 1.7, margin: '0 0 18px' }}>{content.ctaBody}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href={buildSubmitUrl(content.h1)} style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>Post Your Project Request &rarr;</Link>
            <Link href="/plan" style={{ display: 'inline-block', padding: '12px 24px', border: '1px solid rgba(122,155,111,0.35)', color: 'rgba(245,239,224,0.7)', fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>Start Planning First</Link>
          </div>
        </div>
        {content.faqs && content.faqs.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '20px' }}>Frequently Asked Questions</h2>
            {content.faqs.map((faq, i) => (
              <div key={i} style={{ borderTop: '1px solid rgba(28,43,26,0.08)', padding: '18px 0' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '15px', fontWeight: 600, color: '#1C2B1A', marginBottom: '6px' }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.65)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        )}
        {(content.relatedGuides?.length || content.relatedPages?.length) && (
          <div style={{ borderTop: '1px solid rgba(28,43,26,0.08)', paddingTop: '32px' }}>
            {content.relatedGuides && content.relatedGuides.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,43,26,0.4)', marginBottom: '10px' }}>Related Guides</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {content.relatedGuides.map(g => <Link key={g.href} href={g.href} style={{ fontSize: '13px', color: '#C8732A', textDecoration: 'none' }}>{g.label} &rarr;</Link>)}
                </div>
              </div>
            )}
            {content.relatedPages && content.relatedPages.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,43,26,0.4)', marginBottom: '10px' }}>Find Contractors</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {content.relatedPages.map(p => <Link key={p.href} href={p.href} style={{ padding: '6px 12px', border: '1px solid rgba(28,43,26,0.12)', borderRadius: '2px', fontSize: '12px', color: 'rgba(28,43,26,0.65)', textDecoration: 'none', fontFamily: 'monospace' }}>{p.label} &rarr;</Link>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <footer style={{ backgroundColor: '#1C2B1A', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.3)', margin: 0 }}>&copy; {new Date().getFullYear()} Alder Projects LLC &middot; Vermont &middot; <Link href="/" style={{ color: 'rgba(245,239,224,0.4)', textDecoration: 'none' }}>alderprojects.com</Link></p>
      </footer>
    </div>
  )
}

// Build the JSON-LD schema list for a guide page from its content + meta.
// Returns Article + BreadcrumbList always; FAQPage if there are FAQs.
function buildSchemas(content: GuidePageContent, meta: GuidePageMeta) {
  const url = absUrl(meta.path)
  const breadcrumbs =
    meta.breadcrumbs ?? [
      { name: 'Home', url: '/' },
      { name: 'Guides', url: '/guides' },
      { name: content.h1, url: meta.path },
    ]

  const schemas: object[] = [
    buildArticle({
      headline: content.h1,
      description: content.intro,
      url,
      dateModified: meta.verifyDate,
    }),
    buildBreadcrumbList(breadcrumbs),
  ]

  if (content.faqs && content.faqs.length > 0) {
    schemas.push(
      buildFaqPage(
        content.faqs.map(f => ({ question: f.q, answer: f.a })),
      ),
    )
  }

  return schemas
}
