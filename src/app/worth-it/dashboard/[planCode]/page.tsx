// V7 — Worth-It Plan dashboard (post-sale).
//
// Magic-link gating: if ?token= matches the plan's stored token hash,
// render the dashboard. If no token but the URL carries a passcode
// matching last 4 of the customer email, render. Otherwise render the
// passcode prompt.
//
// Server component. State mutations route through /api/plan/[planCode]/
// state from the client subcomponents.

import Footer from '@/components/Footer'
import { CONFIG } from '@/lib/recommender-config'
import {
  getWorthItPlan,
  getWorthItPlanByPasscode,
  type PlanState,
} from '@/lib/storage'
import type { WorthItOutput } from '@/lib/buildWorthItPlan'
import DashboardClient from '@/components/worthIt/DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: { planCode: string }
  searchParams: { token?: string; passcode?: string }
}

export default async function WorthItDashboardPage({ params, searchParams }: Props) {
  const { planCode } = params
  const { token, passcode } = searchParams

  let resolved: { data: WorthItOutput; state: PlanState } | null = null
  if (token) {
    resolved = await getWorthItPlan(planCode, token)
  } else if (passcode) {
    resolved = await getWorthItPlanByPasscode(planCode, passcode)
  }

  if (!resolved) {
    return <PasscodePrompt planCode={planCode} hadToken={!!token} />
  }

  if (resolved.data.refunded) {
    return <RefundedPlan planCode={planCode} />
  }

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a]">
      <DashboardClient plan={resolved.data} initialState={resolved.state} token={token ?? null} />
      <Footer />
    </main>
  )
}

// ---------- Edge UIs --------------------------------------------------

function PasscodePrompt({ planCode, hadToken }: { planCode: string; hadToken: boolean }) {
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e8e3d4] rounded-xl p-8 max-w-md w-full">
        <h1 className="font-display text-2xl text-[#1f3a2e] mb-2">Confirm your plan</h1>
        <p className="text-sm text-[#1a1f1a]/80 mb-6">
          Plan <code>{planCode}</code> needs your magic link or a recovery passcode.
          The passcode is the last 4 characters of the email used at purchase.
        </p>
        {hadToken && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            That magic link did not match. Try the email recovery method below, or
            email <a className="underline" href="mailto:hello@alderprojects.com">hello@alderprojects.com</a>.
          </p>
        )}
        <form method="get" action={`/worth-it/dashboard/${planCode}`}>
          <label className="block text-sm font-medium mb-2">Last 4 of purchase email</label>
          <input
            name="passcode"
            type="text"
            required
            maxLength={4}
            placeholder="e.g. .com"
            className="w-full bg-[#fbf8f1] border border-[#e8e3d4] rounded-md px-3 py-2 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-6 py-3 rounded-lg"
          >
            Unlock plan
          </button>
        </form>
        <p className="text-xs text-[#1a1f1a]/60 mt-6 text-center">
          Lost both? <a href="/worth-it/find" className="underline">Find My Plan</a> by email.
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

// Re-export CONFIG for downstream type narrowing if we add SSR-rendered
// content that depends on product copy. (Unused right now — kept for the
// upcoming server-side analytics bake.)
void CONFIG
