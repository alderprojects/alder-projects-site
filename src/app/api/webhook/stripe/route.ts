// V7 — Stripe webhook handler.
//
// Verifies the request signature, then routes by metadata
// product_type: smart_cart, worth_it, upgrade. On checkout.session
// .completed, runs the synthesis function, persists the result, sends
// the delivery email, and (for Smart Cart) schedules the 72-hour
// upgrade-offer email.
//
// Required environment variables:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//
// Endpoint URL to register in the Stripe dashboard:
//   POST https://alderprojects.com/api/webhook/stripe

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { CONFIG } from '@/lib/recommender-config'
import {
  saveSmartCart,
  saveWorthItPlan,
  getPendingSmartCart,
  getPendingWorthItPlan,
  getSmartCart,
  defaultPlanState,
  logPlanEvent,
} from '@/lib/storage'
import { buildSmartCart, type SmartCartInput } from '@/lib/buildSmartCart'
import { buildWorthItPlan, type WorthItInput } from '@/lib/buildWorthItPlan'
import { inferSeason } from '@/lib/season-helpers'
import {
  sendSmartCartReceiptEmail,
  sendWorthItDeliveryEmail,
  sendUpgradeCompleteEmail,
  scheduleUpgradeOfferEmail,
} from '@/lib/email'

export const dynamic = 'force-dynamic'

type PendingSmartCartInput = Omit<SmartCartInput, 'season' | 'customerEmail'> & {
  email: string
  address?: string
}
type PendingWorthItInput = Omit<WorthItInput, 'season' | 'customerEmail'> & {
  email: string
  slug?: string
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not set')
  return new Stripe(key)
}

export async function POST(req: Request) {
  const sig = headers().get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 })

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bad signature'
    return NextResponse.json({ error: `Signature verification failed: ${msg}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    try {
      await handleSessionCompleted(session)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Handler error'
      console.error(`webhook handler failed: ${msg}`, { sessionId: session.id })
      // Return 500 so Stripe retries — operator alert via email handled below
      // (intentionally not catching all errors silently; Stripe retry is the
      // right behavior).
      throw e
    }
  }

  return NextResponse.json({ received: true })
}

async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const productType = session.metadata?.product_type
    ?? readQueryParam(session, 'metadata_product_type')
  const customerEmail =
    session.customer_details?.email
    ?? session.customer_email
    ?? readQueryParam(session, 'prefilled_email')
    ?? ''
  const reference = session.client_reference_id ?? ''
  const season = inferSeason(new Date())

  if (productType === 'smart_cart') {
    const cartId = reference
    const pending = (await getPendingSmartCart(cartId)) as PendingSmartCartInput | null
    if (!pending) throw new Error(`No pending Smart Cart for ${cartId}`)
    const cart = buildSmartCart({
      topic: pending.topic,
      scopeVariantId: pending.scopeVariantId,
      scenario: pending.scenario,
      season,
      customerEmail: customerEmail || pending.email,
      customerProvidedAddress: pending.address,
    })
    cart.cartId = cartId
    await saveSmartCart(cart)
    await sendSmartCartReceiptEmail(cart, cart.customerEmail)
    if (CONFIG.products.upgrade.enabled) {
      await scheduleUpgradeOfferEmail(cart, CONFIG.products.upgrade.emailDelayHours)
    }
    return
  }

  if (productType === 'worth_it') {
    const planCode = reference
    const pending = (await getPendingWorthItPlan(planCode)) as PendingWorthItInput | null
    if (!pending) throw new Error(`No pending Worth-It Plan for ${planCode}`)
    const plan = buildWorthItPlan({
      topic: pending.topic,
      scopeVariantId: pending.scopeVariantId,
      scenario: pending.scenario,
      season,
      address: pending.address,
      slug: pending.slug,
      customerEmail: customerEmail || pending.email,
    })
    plan.planCode = planCode
    await saveWorthItPlan(plan, defaultPlanState())
    await logPlanEvent(planCode, 'plan_created', { topic: plan.topic, scenario: plan.scenario })
    await sendWorthItDeliveryEmail(plan, plan.customerEmail)
    return
  }

  if (productType === 'upgrade') {
    const fromCartId = session.metadata?.from_cart_id ?? readQueryParam(session, 'from_cart_id') ?? ''
    if (!fromCartId) throw new Error('Upgrade session missing from_cart_id')
    const cart = await getSmartCart(fromCartId)
    if (!cart) throw new Error(`Original Smart Cart ${fromCartId} not found`)
    const plan = buildWorthItPlan({
      topic: cart.topic,
      scopeVariantId: cart.scopeVariantId,
      scenario: cart.scenario,
      season,
      address: session.metadata?.address ?? cart.customerProvidedAddress,
      slug: session.metadata?.slug,
      customerEmail: customerEmail || cart.customerEmail,
      upgradedFromCartId: fromCartId,
    })
    await saveWorthItPlan(plan, defaultPlanState())
    await logPlanEvent(plan.planCode, 'plan_created_from_upgrade', { fromCartId })
    await sendUpgradeCompleteEmail(plan, fromCartId, plan.customerEmail)
    return
  }

  throw new Error(`Unknown product_type: ${productType}`)
}

function readQueryParam(session: Stripe.Checkout.Session, key: string): string | undefined {
  // Stripe Payment Links carry our metadata via query string captured at
  // session creation; surface the metadata key consistently with how
  // the checkout endpoint encodes it.
  const url = session.url ?? session.success_url ?? ''
  if (!url) return undefined
  try {
    const u = new URL(url)
    return u.searchParams.get(key) ?? undefined
  } catch {
    return undefined
  }
}
