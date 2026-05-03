// V7 — Refund endpoint.
//
// V7 launch ships an admin-only refund route — the operator hits this
// (or runs it from a script) to issue refunds on Smart Carts within
// 24 hours of purchase or Worth-It Plans within 7 days. Auto-customer
// refund flow ships in V7.1 once we have 30 days of issue-free data.
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
} from '@/lib/storage'
import { kv } from '@vercel/kv'

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

  return NextResponse.json({
    ok: true,
    refundId: refund.id,
    stripeStatus: refund.status,
  })
}
