// V7 — Smart Cart checkout endpoint.
//
// Accepts the curation-modal payload, validates inputs, generates a
// cartId, stores the pending input under pending:smartcart:<cartId>
// (30-min TTL), and returns the Stripe Payment Link URL with the
// cartId encoded in metadata via client_reference_id.
//
// The actual SmartCart synthesis runs after the Stripe webhook
// confirms payment (commit 21), so we never charge for a cart that
// the engine cannot build.

import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/recommender-config'
import { savePendingSmartCart } from '@/lib/storage'
import { SCOPE_VARIANTS } from '@/lib/scope-variants'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

export const dynamic = 'force-dynamic'

type Body = {
  topic?: TopicId
  scopeVariantId?: string
  scenario?: BriefScenarioId
  email?: string
  address?: string
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { topic, scopeVariantId, scenario, email, address } = body
  if (!topic || !scopeVariantId || !scenario || !email) {
    return NextResponse.json(
      { error: 'topic, scopeVariantId, scenario, and email are required' },
      { status: 400 },
    )
  }

  const variant = (SCOPE_VARIANTS[topic] ?? []).find(v => v.id === scopeVariantId)
  if (!variant) {
    return NextResponse.json({ error: `Unknown scope variant: ${scopeVariantId}` }, { status: 400 })
  }

  const cartId = generateCartId()

  await savePendingSmartCart(cartId, {
    topic,
    scopeVariantId,
    scenario,
    email,
    address: address || undefined,
  })

  const baseLink = process.env[CONFIG.products.smartCart.stripePaymentLinkEnvVar]
  if (!baseLink) {
    return NextResponse.json(
      { error: 'Stripe Payment Link is not configured' },
      { status: 500 },
    )
  }

  const checkoutUrl = appendStripeMetadata(baseLink, {
    client_reference_id: cartId,
    prefilled_email: email,
    metadata_product_type: 'smart_cart',
  })

  return NextResponse.json({ checkoutUrl, cartId })
}

function appendStripeMetadata(
  base: string,
  fields: Record<string, string>,
): string {
  const url = new URL(base)
  for (const [k, v] of Object.entries(fields)) {
    url.searchParams.set(k, v)
  }
  return url.toString()
}

function generateCartId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `CART-${suffix}`
}
