// V7.1 — Stripe exchange route for Worth-It dashboard.
//
// Stripe Payment Links redirect to:
//   /worth-it/dashboard?session_id={CHECKOUT_SESSION_ID}
// This server component looks up the session, reads
// session.client_reference_id (the planCode), and redirects to the
// existing /worth-it/dashboard/[planCode] route. Polls if the
// webhook hasn't yet written to KV.

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import Footer from '@/components/Footer'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { searchParams: { session_id?: string } }

export default async function WorthItDashboardExchangePage({ searchParams }: Props) {
  const sessionId = searchParams.session_id
  if (!sessionId) {
    return <NotFoundView />
  }

  let planCode: string | null = null
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    planCode = session.client_reference_id ?? null
  } catch {
    return <NotFoundView />
  }

  if (!planCode) return <NotFoundView />

  // KV write may lag — poll by checking for plan record presence.
  const planExists = await kv.get(`plan:${planCode}`)
  if (planExists) {
    redirect(`/worth-it/dashboard/${planCode}`)
  }
  return <BuildingView planCode={planCode} sessionId={sessionId} />
}

function BuildingView({ planCode, sessionId }: { planCode: string; sessionId: string }) {
  const refreshUrl = `/worth-it/dashboard?session_id=${encodeURIComponent(sessionId)}`
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex flex-col">
      <head>
        <meta httpEquiv="refresh" content={`3; url=${refreshUrl}`} />
      </head>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-[#e8e3d4] rounded-xl p-8">
          <h1 className="font-display text-2xl text-[#1f3a2e] mb-3">
            Building your Worth-It Plan…
          </h1>
          <p className="text-sm text-[#1a1f1a]/85 mb-4">
            Plan <code className="font-mono">{planCode}</code> is being assembled.
            This usually takes a few seconds. The page refreshes automatically.
          </p>
          <p className="text-xs text-[#1a1f1a]/60">
            Still spinning after a minute? Email{' '}
            <a className="underline" href="mailto:hello@alderprojects.com">
              hello@alderprojects.com
            </a>{' '}
            with this plan code.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function NotFoundView() {
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-[#1f3a2e] mb-4">
            Plan not found
          </h1>
          <p className="text-[#1a1f1a]/85 mb-6">
            We couldn&apos;t resolve this Stripe session to a Worth-It Plan.
            If you just paid, refresh once — the plan may need a moment.
            Lost the link?{' '}
            <a className="underline" href="/worth-it/find">
              Find My Plan
            </a>{' '}
            looks it up by email.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
