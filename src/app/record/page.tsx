/**
 * v7.4.13 — /record, the Home Record page.
 *
 * CR5 — COMPLETENESS IS PRIVATE. This page requires an authenticated claim
 * (magic link). There is no public, shareable, or token-based variant, and
 * no unauthenticated surface anywhere renders a completeness number.
 */

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { buildCoverageView, coverageHeadline } from '@/lib/coverage/state'
import { nextUpOrder } from '@/lib/coverage/order'
import { loadRecordSlots } from '@/lib/coverage/record'
import RecordView from '@/components/record/RecordView'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Your Home Record',
  // Private surface — never indexed (CR5).
  robots: { index: false, follow: false },
}

export default async function RecordPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/account/sign-in?next=/record')

  const record = await prisma.homeRecord.findUnique({
    where: { email: user.email.toLowerCase() },
    select: { id: true },
  })

  if (!record) return <EmptyRecord />

  const slots = await loadRecordSlots(record.id)
  const view = buildCoverageView(slots)
  const nextUp = nextUpOrder(view)

  const reads = await prisma.homeRecordReport.findMany({
    where: { homeRecordId: record.id },
    select: { reportId: true, report: { select: { createdAt: true, status: true } } },
    orderBy: { attachedAt: 'desc' },
    take: 20,
  })

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Your Home Record</h1>
        <p className="mt-1 text-sm text-gray-600">{coverageHeadline(view)}</p>
      </header>

      <RecordView view={view} nextUp={nextUp} />

      {reads.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium text-gray-900">Your reads</h2>
          <ul className="space-y-2">
            {reads.map((r) => (
              <li key={r.reportId} className="flex items-baseline justify-between gap-3 text-sm">
                <a href={`/check/${r.reportId}`} className="text-[#1f3d2b] underline underline-offset-2">
                  {r.report.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </a>
                <span className="text-xs text-gray-500">{r.report.status.replace(/_/g, ' ').toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

function EmptyRecord() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-medium text-gray-900">Your Home Record</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your record starts with your first read. Upload a few photos and we&rsquo;ll begin filling it in.
      </p>
      <a
        href="/check"
        className="mt-6 inline-block rounded-lg bg-[#1f3d2b] px-5 py-2.5 text-sm font-medium text-white"
      >
        Start a read
      </a>
    </main>
  )
}
