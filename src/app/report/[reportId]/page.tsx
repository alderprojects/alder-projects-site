/**
 * v7.4.2f — /report/[reportId]: the canonical Alder Check report page.
 *
 * Every journey lands here: the upload flow redirects here after
 * processing, the desktop QR poll navigates here, and the unlock/drip
 * emails link here with ?key= (capability access — any device, no
 * cookie, NO accounts, NO sign-in). Refreshable, bookmarkable.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ReportView from '@/components/check/ReportView'
import { HeroArt } from '@/components/check/CheckArt'
import { getAnonId } from '@/lib/visitor/session'
import { authorizeReport, reportPayload } from '@/lib/recommend/access'
import { CHECK_PALETTE as C } from '@/lib/check/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your Alder Check',
  robots: { index: false },
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: { reportId: string }
  searchParams: { key?: string }
}) {
  const anonId = await getAnonId()
  const auth = await authorizeReport({ reportId: params.reportId, anonId, key: searchParams.key ?? null })
  if (!auth) notFound()

  const payload = reportPayload(auth.report, auth.tier)
  const recCount = payload.recommendations.length + payload.lockedRecommendations.length

  return (
    <>
      <Nav />
      <main style={{ background: C.cream, minHeight: '100vh', padding: '32px 20px 48px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Report masthead — creative, not just copy */}
          <div className="md:grid" style={{ gridTemplateColumns: '1fr 220px', gap: 20, alignItems: 'center', marginBottom: 18 }}>
            <div>
              <p style={{ fontSize: 12.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, margin: '0 0 6px' }}>
                Alder Check · {new Date(auth.report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 36px)', color: C.green, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15, margin: '0 0 6px' }}>
                Your Buy / Skip / Wait plan
              </h1>
              <p style={{ fontSize: 14.5, color: C.inkSoft, margin: 0 }}>
                {recCount} finding{recCount === 1 ? '' : 's'} · {payload.upsell.buyCount} worth buying · honest about the
                rest. Every number carries a verified date.
              </p>
            </div>
            <div className="hidden md:block" style={{ opacity: 0.9 }}>
              <HeroArt />
            </div>
          </div>

          <ReportView initialReport={payload} accessKey={auth.byKey ? (searchParams.key as string) : undefined} />

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: C.inkSoft }}>
            Need a fresh read after a fix or a season change?{' '}
            <Link href="/check" style={{ color: C.green, textDecoration: 'underline' }}>
              Run another free Check
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
