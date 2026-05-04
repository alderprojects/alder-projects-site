// V7.1 — Stripe exchange route for Smart Cart.
//
// Stripe Payment Links redirect to:
//   /smart-cart/result?session_id={CHECKOUT_SESSION_ID}
// This server component looks up the session, reads
// session.client_reference_id (the cartId), and either redirects to
// the existing dynamic /smart-cart/result/[cartId] route or shows a
// "building your cart..." page that auto-refreshes while the webhook
// finishes writing to KV.
//
// This file lives at /smart-cart/result/page.tsx — Next.js routes
// without dynamic segments win over the [cartId] segment when no
// path suffix is supplied.

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import Footer from '@/components/Footer'
import { getSmartCart } from '@/lib/storage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { searchParams: { session_id?: string } }

export default async function SmartCartResultExchangePage({ searchParams }: Props) {
  const sessionId = searchParams.session_id
  if (!sessionId) {
    return <NotFoundView reason="missing_session_id" />
  }

  let cartId: string | null = null
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    cartId = session.client_reference_id ?? null
  } catch {
    return <NotFoundView reason="stripe_lookup_failed" />
  }

  if (!cartId) return <NotFoundView reason="no_reference_id" />

  // Webhook may not have written to KV yet — show a polling page until
  // the cart appears, then redirect to the rendered cart route.
  const cart = await getSmartCart(cartId)
  if (cart) {
    redirect(`/smart-cart/result/${cartId}`)
  }
  return <BuildingView cartId={cartId} sessionId={sessionId} />
}

function BuildingView({ cartId, sessionId }: { cartId: string; sessionId: string }) {
  // Server-side meta refresh — Vercel KV is eventual relative to the
  // Stripe webhook write. 3 seconds gives the webhook room to finish.
  const refreshUrl = `/smart-cart/result?session_id=${encodeURIComponent(sessionId)}`
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex flex-col">
      <head>
        <meta httpEquiv="refresh" content={`3; url=${refreshUrl}`} />
      </head>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-[#e8e3d4] rounded-xl p-8">
          <h1 className="font-display text-2xl text-[#1f3a2e] mb-3">
            Building your Smart Cart…
          </h1>
          <p className="text-sm text-[#1a1f1a]/85 mb-4">
            Cart <code className="font-mono">{cartId}</code> is being assembled.
            This usually takes a few seconds. The page refreshes automatically.
          </p>
          <p className="text-xs text-[#1a1f1a]/60">
            Still spinning after a minute? Email{' '}
            <a className="underline" href="mailto:hello@alderprojects.com">
              hello@alderprojects.com
            </a>{' '}
            with this cart code.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function NotFoundView({ reason }: { reason: string }) {
  void reason
  return (
    <main className="min-h-screen bg-[#fbf8f1] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-[#1f3a2e] mb-4">
            Cart not found
          </h1>
          <p className="text-[#1a1f1a]/85 mb-6">
            We couldn&apos;t resolve this Stripe session to a Smart Cart.
            If you just paid, it may take a few seconds to land — refresh once.
            Otherwise email{' '}
            <a className="underline" href="mailto:hello@alderprojects.com">
              hello@alderprojects.com
            </a>{' '}
            with the receipt and we&apos;ll sort it out.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
