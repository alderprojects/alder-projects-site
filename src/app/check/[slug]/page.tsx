/**
 * v7.4.1c — /check/[slug]: programmatic verdict-hub pages targeting
 * "is it worth it" queries. Server-rendered from the hub definitions +
 * the Vermont dataset (pages update when the dataset does). AEO-first:
 * FAQPage JSON-LD with citable standalone answers, the standing verdict
 * as concrete product output, and the one-tap photo CTA because the
 * category default is never the last word on YOUR home.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CheckCta from '@/components/check/CheckCta'
import VerdictCard from '@/components/check/VerdictCard'
import { CHECK_PALETTE as C } from '@/lib/check/content'
import { VERDICT_HUBS, hubBySlug, hubItems } from '@/lib/check/hubs'
import { isRebateStale } from '@/lib/recommend/dataset'
import { buildAmazonUrl } from '@/lib/buildAmazonUrl'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return VERDICT_HUBS.map((h) => ({ slug: h.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const hub = hubBySlug(params.slug)
  if (!hub) return {}
  const title = `${hub.question} ${hub.titleSuffix}`
  const description = `${hub.rationale.slice(0, 150).replace(/\s+\S*$/, '')}… Standing verdict: ${hub.verdict}. Verified costs and rebates, plus a free photo Check for your home.`
  return {
    title,
    description,
    alternates: { canonical: `https://alderprojects.com/check/${hub.slug}` },
    openGraph: { title, description, url: `https://alderprojects.com/check/${hub.slug}`, siteName: 'Alder Projects', type: 'article' },
  }
}

export default function VerdictHubPage({ params }: { params: { slug: string } }) {
  const hub = hubBySlug(params.slug)
  if (!hub) notFound()

  const items = hubItems(hub)
  const headline = items.find((i) => i.costLow != null && i.costHigh != null)
  const rebateItem = items.find((i) => i.rebate)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hub.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  const cardData = {
    verdict: hub.verdict,
    title: hub.question.replace(/\?$/, ''),
    summary: hub.rationale,
    visibleEvidence: hub.evidence,
    costLow: headline?.costLow ?? null,
    costHigh: headline?.costHigh ?? null,
    rebate: rebateItem?.rebate
      ? {
          program: rebateItem.rebate.program,
          display: isRebateStale(rebateItem.rebate.verifiedAt) ? 'check current program' : rebateItem.rebate.amount,
        }
      : null,
    citations: headline
      ? [{ guideSlug: headline.sourceGuideSlug, guideTitle: hub.parentGuideTitle ?? headline.sourceGuideSlug, verifiedAt: headline.verifiedAt }]
      : [],
    nextAction: hub.nextAction,
    categorySearchUrl: hub.verdict === 'BUY' && hub.categorySearchQuery ? buildAmazonUrl(hub.categorySearchQuery) : null,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Nav />
      <main style={{ background: C.cream, minHeight: '100vh', padding: '40px 20px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 8 }}>
            Standing verdict · updates with the dataset
          </p>
          <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 38px)', color: C.green, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15, margin: '0 0 16px' }}>
            {hub.question}
          </h1>

          <VerdictCard data={cardData} />

          <p style={{ fontSize: 13.5, color: C.inkSoft, margin: '10px 0 28px' }}>
            This is the category default{hub.parentGuideSlug ? (
              <>
                {' '}(full numbers in the{' '}
                <Link href={`/guides/${hub.parentGuideSlug}`} style={{ color: C.green, textDecoration: 'underline' }}>
                  {hub.parentGuideTitle}
                </Link>{' '}
                guide)
              </>
            ) : null}
            . Your home may read differently — the free Check below is the answer for YOUR photos.
          </p>

          {items.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, color: C.green, marginBottom: 10 }}>Verified costs {rebateItem ? '& rebates' : ''}</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, fontSize: 14 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: C.inkSoft, fontSize: 12.5 }}>
                      <th style={{ padding: '10px 12px' }}>Item</th>
                      <th style={{ padding: '10px 12px' }}>Typical cost</th>
                      <th style={{ padding: '10px 12px' }}>Rebate</th>
                      <th style={{ padding: '10px 12px' }}>Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.item} style={{ borderTop: '1px solid rgba(31,61,43,0.1)' }}>
                        <td style={{ padding: '10px 12px', color: C.ink }}>{i.item}</td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          {i.costLow != null && i.costHigh != null ? `$${i.costLow.toLocaleString()}–$${i.costHigh.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>
                          {i.rebate ? (isRebateStale(i.rebate.verifiedAt) ? `${i.rebate.program}: check current program` : `${i.rebate.program}: ${i.rebate.amount}`) : '—'}
                        </td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: C.inkSoft, fontSize: 13 }}>{i.verifiedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, color: C.green, marginBottom: 8 }}>Assumptions behind this verdict</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: C.inkSoft, fontSize: 14.5, lineHeight: 1.6 }}>
              {hub.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
              <li>Region: verified figures are Vermont-deep; elsewhere, verdicts hold but numbers may not apply.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, color: C.green, marginBottom: 8 }}>Questions people ask</h2>
            {hub.faqs.map((f) => (
              <details key={f.q} style={{ borderBottom: '1px solid rgba(31,61,43,0.12)', padding: '10px 0' }}>
                <summary style={{ fontSize: 15, fontWeight: 600, color: C.ink, cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, margin: '8px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </section>
        </div>

        <section style={{ background: '#efe9db', margin: '0 -20px', padding: '36px 20px 44px', textAlign: 'center' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, color: C.green, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 8 }}>
              Get the verdict for YOUR home
            </h2>
            <p style={{ fontSize: 15, color: C.inkSoft, marginBottom: 20 }}>
              The category default above is a starting point. Photograph your room and the free Alder Check reads what’s
              actually there.
            </p>
            <CheckCta />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
