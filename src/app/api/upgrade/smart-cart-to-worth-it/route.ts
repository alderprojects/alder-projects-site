// V7 — Upgrade endpoint. Smart Cart → Worth-It Plan for $20.
//
// GET handler so the upgrade button is a plain link. Validates the
// Smart Cart still exists and is not expired, then redirects to the
// upgrade Stripe Payment Link with from_cart_id encoded as
// client_reference_id and metadata.

import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/recommender-config'
import { getSmartCart } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const cartId = url.searchParams.get('cartId')
  if (!cartId) return NextResponse.json({ error: 'Missing cartId' }, { status: 400 })

  const cart = await getSmartCart(cartId)
  if (!cart) return NextResponse.json({ error: 'Smart Cart not found or expired' }, { status: 404 })
  if (cart.refunded) {
    return NextResponse.json({ error: 'Original Smart Cart was refunded' }, { status: 410 })
  }
  if (new Date(cart.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Original Smart Cart expired' }, { status: 410 })
  }

  const baseLink = process.env[CONFIG.products.upgrade.stripePaymentLinkEnvVar]
  if (!baseLink) {
    return NextResponse.json({ error: 'Upgrade Payment Link not configured' }, { status: 500 })
  }

  const stripeUrl = new URL(baseLink)
  stripeUrl.searchParams.set('client_reference_id', cart.cartId)
  stripeUrl.searchParams.set('metadata_product_type', 'upgrade')
  stripeUrl.searchParams.set('from_cart_id', cart.cartId)
  if (cart.customerEmail) {
    stripeUrl.searchParams.set('prefilled_email', cart.customerEmail)
  }
  if (cart.customerProvidedAddress) {
    stripeUrl.searchParams.set('address', cart.customerProvidedAddress)
  }

  return NextResponse.redirect(stripeUrl.toString(), { status: 302 })
}

export async function POST(req: Request) {
  // POST variant for fetch-based upgrade flows.
  type Body = { cartId?: string; address?: string; slug?: string }
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const cartId = body.cartId
  if (!cartId) return NextResponse.json({ error: 'Missing cartId' }, { status: 400 })
  const cart = await getSmartCart(cartId)
  if (!cart) return NextResponse.json({ error: 'Smart Cart not found' }, { status: 404 })

  const baseLink = process.env[CONFIG.products.upgrade.stripePaymentLinkEnvVar]
  if (!baseLink) return NextResponse.json({ error: 'Upgrade Payment Link not configured' }, { status: 500 })

  const stripeUrl = new URL(baseLink)
  stripeUrl.searchParams.set('client_reference_id', cart.cartId)
  stripeUrl.searchParams.set('metadata_product_type', 'upgrade')
  stripeUrl.searchParams.set('from_cart_id', cart.cartId)
  if (cart.customerEmail) stripeUrl.searchParams.set('prefilled_email', cart.customerEmail)
  if (body.address) stripeUrl.searchParams.set('address', body.address)
  if (body.slug) stripeUrl.searchParams.set('slug', body.slug)

  return NextResponse.json({ checkoutUrl: stripeUrl.toString() })
}
