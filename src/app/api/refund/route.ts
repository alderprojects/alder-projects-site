// V7 — Refund endpoint.
//
// V7 launch ships an admin-only refund route — the operator hits this
// (or runs it from a script) to issue refunds on Smart Carts or Worth-It
// Plans. Auto-customer refund flow ships in V7.1 once we have 30 days of
// issue-free data.
//
// v7.4.16 — this route DOES enforce the window in code: the age check
// below returns 422 outside it. (A v7.4.14 comment here claimed otherwise;
// that was wrong.) The bound is CONFIG.products.smartCart.refundWindowHours,
// which now derives from REFUND_WINDOW_DAYS in lib/copy/canon.ts — so the
// enforced window and the promised window are the same number by
// construction. Until v7.4.16 it was a hardcoded 24 while every marketing
// surface promised 30 days, meaning a customer who asked on day 5 got a 422.
//
// Auth: ADMIN_REFUND_TOKEN env var. Send as Authorization: Bearer <token>
// or as ?adminToken=<token> query string. Lock down at the WAF when
// V7.1 ships customer-facing refunds.

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { CONFIG } from '@/lib/recommender-config'
import {
  getSmartCart,
  markSmartCartRefunded,
  markWorthItPlanRefunded,
  logPlanEvent,
  isV2Cart,
} from '@/lib/storage'
import { kv } from '@vercel/kv'
import { logBuyerEvent, hashEmail } from '@/lib/buyer-events'

export const dynamic = 'force-dynamic'

type Body = {
  cartId?: string
  planCode?: string
  reason?: string
  stripeChargeId?: string
  stripePaymentIntentId?: string
}

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_REFUND_TOKEN
  if (!expected) return false
  const url = new URL(req.url)
  const queryToken = url.searchParams.get('adminToken')
  if (queryToken === expected) return true
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${expected}`) return true
  return false
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not set')
  return new Stripe(key)
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { cartId, planCode, reason, stripeChargeId, stripePaymentIntentId } = body
  if (!cartId && !planCode) {
    return NextResponse.json({ error: 'cartId or planCode required' }, { status: 400 })
  }
  if (!stripeChargeId && !stripePaymentIntentId) {
    return NextResponse.json(
      { error: 'stripeChargeId or stripePaymentIntentId required' },
      { status: 400 },
    )
  }

  // Window check
  if (cartId) {
    const cart = await getSmartCart(cartId)
    if (!cart) return NextResponse.json({ error: 'Smart Cart not found' }, { status: 404 })
    const ageHours = (Date.now() - new Date(cart.createdAt).getTime()) / (1000 * 3600)
    if (ageHours > CONFIG.products.smartCart.refundWindowHours) {
      return NextResponse.json(
        { error: `Outside refund window (${CONFIG.products.smartCart.refundWindowHours}h). Manual approval required.` },
        { status: 422 },
      )
    }
  }
  if (planCode) {
    const planRecord = (await kv.get<{ data: { createdAt: string } }>(`plan:${planCode}`)) as
      | { data: { createdAt: string } }
      | null
    if (!planRecord) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const ageDays = (Date.now() - new Date(planRecord.data.createdAt).getTime()) / (1000 * 86400)
    if (ageDays > CONFIG.products.worthIt.refundWindowDays) {
      return NextResponse.json(
        { error: `Outside refund window (${CONFIG.products.worthIt.refundWindowDays} days). Manual approval required.` },
        { status: 422 },
      )
    }
  }

  // Issue Stripe refund
  const stripe = getStripe()
  let refund: Stripe.Refund
  try {
    refund = await stripe.refunds.create({
      ...(stripeChargeId ? { charge: stripeChargeId } : {}),
      ...(stripePaymentIntentId ? { payment_intent: stripePaymentIntentId } : {}),
      reason: 'requested_by_customer',
      metadata: {
        cartId: cartId ?? '',
        planCode: planCode ?? '',
        adminReason: reason ?? '',
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Stripe refund failed'
    return NextResponse.json({ error: `Stripe refund failed: ${msg}` }, { status: 502 })
  }

  // Mark in KV
  if (cartId) await markSmartCartRefunded(cartId)
  if (planCode) {
    await markWorthItPlanRefunded(planCode)
    await logPlanEvent(planCode, 'plan_refunded', { reason: reason ?? '', refundId: refund.id })
  }

  // v7.2.13 — durable buyer event log for refund analytics. Wrapped
  // in try/catch so analytics never blocks the refund response.
  // Only v2 carts have the structured fields; v1 carts (legacy) skip
  // the analytics log — there are no live v1 carts being refunded.
  if (cartId) {
    try {
      const cart = await getSmartCart(cartId)
      if (cart && isV2Cart(cart)) {
        await logBuyerEvent({
          eventType: 'cart_refunded',
          cartId,
          customerEmailHash: hashEmail(cart.customerEmail),
          topic: cart.topic,
          scopeVariantId: cart.scopeVariantId,
          scenario: cart.scenario,
          town: cart.customerProvidedAddress ?? null,
          townTier: null,
          fee: 19.99,
          leanCartLow: cart.savings.leanCartLow,
          leanCartHigh: cart.savings.leanCartHigh,
          avoidedSpendLow: cart.savings.potentialSavingsLow,
          avoidedSpendHigh: cart.savings.potentialSavingsHigh,
          selectedSlotCount: null,
          totalSlotCount: cart.slots.length,
          refundReason: reason ?? '(no reason given)',
          refundedAt: new Date().toISOString(),
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          referrer: null,
          sessionId: null,
        })
      }
    } catch (err) {
      console.error('[buyer-events] cart_refunded log failed', err)
    }
  }

  return NextResponse.json({
    ok: true,
    refundId: refund.id,
    stripeStatus: refund.status,
  })
}
