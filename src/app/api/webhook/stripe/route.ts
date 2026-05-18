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
import { buildSmartCartV2 } from '@/lib/buildSmartCartV2'
import { logBuyerEvent, hashEmail } from '@/lib/buyer-events'
import { readSessionFromCookies } from '@/lib/session-tracking'
import { buildWorthItPlan, type WorthItInput } from '@/lib/buildWorthItPlan'
import { inferSeason } from '@/lib/season-helpers'
import {
  isV2Combination,
  getScenarioDefaults,
  getCatalog,
  getUniverse,
} from '@/content/smart-cart'
import type { CartTier } from '@/lib/smart-cart-model'
import {
  sendSmartCartReceiptEmail,
  sendSmartCartReceiptEmailV2,
  sendPhotoCartReceiptEmail,
  sendWorthItDeliveryEmail,
  sendUpgradeCompleteEmail,
} from '@/lib/email'
import { buildCartFromPhotos } from '@/lib/photos/build-cart-from-photos'

export const dynamic = 'force-dynamic'

type PendingSmartCartInput = Omit<SmartCartInput, 'season' | 'customerEmail'> & {
  email: string
  address?: string
  // V7.2.1 — passed by the modal data-plumbing for v2 combinations.
  // Optional and ignored for legacy v1 carts.
  selectedTier?: CartTier
  alreadyHave?: string[]
  // v7.3.4-PR3 — photo-source fields written by the PR3 checkout
  // route. When productSource === 'photo' the webhook bypasses
  // buildSmartCart and runs buildCartFromPhotos against anonId.
  productSource?: 'chat' | 'photo'
  anonId?: string
  photoPreviewMeta?: unknown
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
    const buyerEmail = customerEmail || pending.email

    // v7.3.4-PR3 — photo path. When the visitor came through the
    // photo side panel, productSource was stamped 'photo' on the
    // pending row (and on Stripe metadata as a backup). Run
    // synthesizeCartV3 against their recent extractions instead of
    // buildSmartCart against topic/scope. The result persists to
    // Prisma SmartCart (not KV) with the cartId as the row id, so
    // /smart-cart/result/[cartId] dispatches to V3CartView via
    // PR1's KV-first-then-Prisma fallback.
    const stripeProductSource =
      session.metadata?.product_source
      ?? readQueryParam(session, 'metadata_product_source')
    const productSource =
      (pending.productSource ?? stripeProductSource ?? 'chat') as 'photo' | 'chat'

    if (productSource === 'photo') {
      const anonId =
        pending.anonId
        ?? session.metadata?.anon_id
        ?? readQueryParam(session, 'metadata_anon_id')
      if (!anonId) {
        throw new Error(
          `Photo cart ${cartId}: no anonId on pending row or Stripe metadata`
        )
      }
      const built = await buildCartFromPhotos({
        cartId,
        anonId,
        customerEmail: buyerEmail,
      })
      await sendPhotoCartReceiptEmail({
        cartId: built.cartId,
        toEmail: buyerEmail,
        itemCount: built.itemCount,
        photoCount: built.photoCount,
      })
      // Email-claim flow (mint User from email + reassign anon rows)
      // is intentionally NOT wired here in PR3. It ships as a follow-up
      // (v7.3.4-PR3.5) so this webhook change can be reviewed cleanly
      // without touching the identity layer in the same PR.
      return
    }

    // V7.2.1 — route to v2 builder when the (topic, scope) is in the
    // v2 catalog; otherwise fall back to legacy v1 path.
    // V7.2.3 — pass the resolved scope catalog and universe into the
    // builder (dependency injection) so tests can call buildSmartCartV2
    // directly without touching the registry. isV2Combination is a
    // catalog presence check; getCatalog returns the same catalog the
    // builder needs.
    if (isV2Combination(pending.topic, pending.scopeVariantId)) {
      const defaults = getScenarioDefaults(
        pending.topic,
        pending.scopeVariantId,
        pending.scenario,
      )
      const catalog = getCatalog(pending.topic, pending.scopeVariantId)!
      const universe = getUniverse()
      const cart = buildSmartCartV2(
        {
          cartId,
          topic: pending.topic,
          scopeVariantId: pending.scopeVariantId,
          scenario: pending.scenario,
          customerEmail: buyerEmail,
          customerProvidedAddress: pending.address,
          selectedTier: pending.selectedTier ?? defaults.selectedTier,
          alreadyHave: pending.alreadyHave ?? defaults.alreadyHave,
        },
        catalog,
        universe,
      )
      await saveSmartCart(cart)
      await sendSmartCartReceiptEmailV2(cart, cart.customerEmail)
      // v7.2.13 — buyer event log for durable analytics. Wrapped in
      // try/catch so analytics failure never blocks cart creation.
      // SmartCartV2Output doesn't carry a structured town/townTier
      // today; we pass customerProvidedAddress as `town` so the admin
      // analytics view shows what we have. v7.3+ can add structured
      // town fields to the cart.
      try {
        const session = readSessionFromCookies()
        await logBuyerEvent({
          eventType: 'cart_created',
          cartId: cart.cartId,
          customerEmailHash: hashEmail(cart.customerEmail),
          topic: cart.topic,
          scopeVariantId: cart.scopeVariantId,
          scenario: cart.scenario,
          town: cart.customerProvidedAddress ?? null,
          townTier: null,
          fee: CONFIG.products.smartCart.priceUsd,
          leanCartLow: cart.savings.leanCartLow,
          leanCartHigh: cart.savings.leanCartHigh,
          avoidedSpendLow: cart.savings.potentialSavingsLow,
          avoidedSpendHigh: cart.savings.potentialSavingsHigh,
          selectedSlotCount: null,
          totalSlotCount: cart.slots.length,
          refundReason: null,
          refundedAt: null,
          utmSource: session.utmSource,
          utmMedium: session.utmMedium,
          utmCampaign: session.utmCampaign,
          referrer: session.referrer,
          sessionId: session.sessionId || null,
        })
      } catch (err) {
        console.error('[buyer-events] cart_created log failed', err)
      }
      // V7.2.1 — Worth-It is paused. Skip the T+72h upgrade-offer
      // schedule until Worth-It returns.
      return
    }

    const cart = buildSmartCart({
      topic: pending.topic,
      scopeVariantId: pending.scopeVariantId,
      scenario: pending.scenario,
      season,
      customerEmail: buyerEmail,
      customerProvidedAddress: pending.address,
    })
    cart.cartId = cartId
    await saveSmartCart(cart)
    await sendSmartCartReceiptEmail(cart, cart.customerEmail)
    // V7.2.1 — Worth-It paused; skip the T+72h upgrade-offer schedule.
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
