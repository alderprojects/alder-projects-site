/**
 * v7.4.2 — /report/[reportId]/cart — the Smart Cart offer page.
 *
 * Reached only from a Check with ≥1 BUY (the nudge rules live in the
 * flow + are re-enforced at checkout). Upsell copy states COMPUTED
 * facts only — counts come from the persisted CartCandidate rows the
 * single-pass pipeline already created. SKU names never render here;
 * they are exclusively a paid surface (the delivered cart).
 *
 * Viewing this page transitions the report to CART_OFFERED.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getAnonId } from '@/lib/visitor/session'
import { logEvent } from '@/lib/events/log'
import ReportCartCheckout, { type CompatQuestion } from '@/components/check/ReportCartCheckout'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your Smart Cart — Alder Check',
  robots: { index: false },
}

const C = { green: '#1f3d2b', cream: '#f6f2e8', gold: '#b08d2f', ink: '#22301f', inkSoft: 'rgba(34,48,31,0.68)' }

export default async function ReportCartPage({ params }: { params: { reportId: string } }) {
  const anonId = await getAnonId()
  if (!anonId) notFound()

  const report = await prisma.report.findUnique({
    where: { id: params.reportId },
    include: {
      recommendations: {
        where: { verdict: 'BUY', disabledAt: null },
        orderBy: { sortOrder: 'asc' },
        include: { cartCandidates: { where: { fitStatus: { not: 'removed' } } } },
      },
      clarifyingAnswers: true,
    },
  })
  if (!report || report.deletedAt || report.visitorAnonId !== anonId) notFound()
  if (report.recommendations.length === 0) notFound() // nudge rule: no BUY → no cart surface

  // State machine: CHECK_* → CART_OFFERED on first view.
  if (report.status === 'CHECK_ISSUED' || report.status === 'CHECK_REFINED') {
    await prisma.report.update({ where: { id: report.id }, data: { status: 'CART_OFFERED' } })
    await logEvent({
      eventType: 'CART_OFFERED',
      subjectType: 'Report',
      subjectId: report.id,
      anonId,
      source: 'web',
      payload: { buyCount: report.recommendations.length },
    })
  }

  const answersByKey = new Map(report.clarifyingAnswers.map((a) => [`${a.recommendationId ?? ''}:${a.questionKey}`, a.answerText]))

  const questions: CompatQuestion[] = report.recommendations.flatMap((rec) => {
    const qs = (rec.clarifyingQuestionsJson as Array<{ key: string; question: string }>) ?? []
    return qs.map((q) => ({
      recommendationId: rec.id,
      recTitle: rec.title,
      key: q.key,
      question: q.question,
      prefilledAnswer: answersByKey.get(`${rec.id}:${q.key}`) ?? null,
    }))
  })

  const isRenter = report.tenure === 'rent'
  const totalLines = report.recommendations.reduce((n, r) => n + r.cartCandidates.length, 0)

  return (
    <main style={{ background: C.cream, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 13.5, color: C.green, textDecoration: 'underline' }}>
          ← Back to your Check
        </Link>
        <h1 style={{ fontSize: 30, color: C.green, fontFamily: "'Playfair Display', Georgia, serif", margin: '14px 0 6px' }}>
          {isRenter ? 'Your Renter’s Reversible Upgrade list' : 'Your Smart Cart'}
        </h1>
        <p style={{ fontSize: 15.5, color: C.inkSoft, lineHeight: 1.6, marginBottom: 20 }}>
          Your Alder Check found <strong>{report.recommendations.length}</strong> thing
          {report.recommendations.length === 1 ? '' : 's'} worth buying
          {isRenter ? ' — all reversible, all take-it-with-you-when-you-move' : ''}. We already matched{' '}
          <strong>{totalLines}</strong> candidate product{totalLines === 1 ? '' : 's'} against the specs that matter.
          The $19.99 cart is the selection layer: exact products in Good / Better / Best tiers, fit status, quantities,
          install difficulty, and the total.
        </p>

        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {report.recommendations.map((rec) => {
            const specCount = ((rec.clarifyingQuestionsJson as unknown[]) ?? []).length
            return (
              <div key={rec.id} style={{ background: '#fff', border: '1px solid rgba(31,61,43,0.14)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>{rec.title}</div>
                <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 4 }}>
                  {rec.cartCandidates.length} matched product{rec.cartCandidates.length === 1 ? '' : 's'} ·{' '}
                  {rec.cartCandidates.every((c) => c.fitStatus === 'confirmed_fit') ? 'Confirmed fit' : 'Likely fit'}
                  {specCount > 0 ? ` · ${specCount} compatibility question${specCount === 1 ? '' : 's'} below` : ''}
                </div>
              </div>
            )
          })}
        </div>

        <ReportCartCheckout reportId={report.id} questions={questions} defaultEmail={''} />
      </div>
    </main>
  )
}
