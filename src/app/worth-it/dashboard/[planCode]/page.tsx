// V7 — Worth-It Plan dashboard (post-sale).
//
// V7.1: passcode/magic-link gate removed. The dashboard now renders
// any plan that exists in KV by planCode alone. Plan codes are
// unguessable enough (32^4 over a fixed prefix) that the share-link
// risk is acceptable relative to the UX cost of the gate.
//
// Magic-link tokens still flow through the URL for sharing and email
// re-entry, and they remain authoritative for state mutations: the
// server reads the stored privateToken from KV and passes it to the
// client component, so PATCH /api/plan/[planCode]/state continues to
// require a valid token without the visitor ever needing one in the
// URL bar.

import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import { getWorthItPlanByCode } from '@/lib/storage'
import DashboardClient from '@/components/worthIt/DashboardClient'
import PausedBanner from '@/components/worthIt/PausedBanner'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  // V7.2.1 — legacy buyers reach the dashboard via direct link; no
  // need for search engines to index per-plan URLs.
  robots: { index: false, follow: false },
}

type Props = {
  params: { planCode: string }
  searchParams: { token?: string }
}

export default async function WorthItDashboardPage({ params, searchParams }: Props) {
  const { planCode } = params
  const resolved = await getWorthItPlanByCode(planCode)

  if (!resolved) {
    return <NotFoundPlan planCode={planCode} />
  }
  if (resolved.data.refunded) {
    return <RefundedPlan planCode={planCode} />
  }

  // URL token wins for sharing/recovery; otherwise use the stored
  // privateToken so dashboard mutations still authorize.
  const effectiveToken = searchParams.token || resolved.privateToken

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a]">
      <PausedBanner />
      <DashboardClient
        plan={resolved.data}
        initialState={resolved.state}
        token={effectiveToken}
      />
      <Footer />
    </main>
  )
}

// ---------- Edge UIs --------------------------------------------------

function NotFoundPlan({ planCode }: { planCode: string }) {
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e8e3d4] rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="font-display text-2xl text-[#1f3a2e] mb-2">Plan not found</h1>
        <p className="text-sm text-[#1a1f1a]/80 mb-4">
          We couldn&apos;t find plan <code>{planCode}</code>. It may have expired,
          been refunded, or the code may be off by a character.
        </p>
        <p className="text-xs text-[#1a1f1a]/60">
          Lost the link? <a href="/worth-it/find" className="underline">Find My Plan</a> by email,
          or write <a className="underline" href="mailto:hello@alderprojects.com">hello@alderprojects.com</a>.
        </p>
      </div>
    </main>
  )
}

function RefundedPlan({ planCode }: { planCode: string }) {
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-[#1f3a2e] mb-4">Plan refunded</h1>
        <p className="text-[#1a1f1a]/85">
          Plan {planCode} was refunded. The dashboard is no longer accessible.
          Email <a className="underline" href="mailto:hello@alderprojects.com">hello@alderprojects.com</a> if this is a mistake.
        </p>
      </div>
    </main>
  )
}
