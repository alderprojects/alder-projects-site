// V7.1 — POST /api/smart-cart/[cartId]/respin
//
// Lets the buyer re-pick scope and scenario after seeing the cart.
// Re-runs buildSmartCart with the same topic + email and persists
// the new content to the same cartId. Topic change is NOT permitted
// (a different project = a new cart). Capped at 3 respins per cart;
// past that we ask the buyer to email for a refund.

import { NextResponse } from 'next/server'
import { getSmartCart, saveSmartCart } from '@/lib/storage'
import { buildSmartCart } from '@/lib/buildSmartCart'
import { getScopeVariant } from '@/lib/scope-variants'
import { inferSeason } from '@/lib/season-helpers'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

export const dynamic = 'force-dynamic'

const MAX_RESPINS = 3

type Body = { scopeVariantId?: string; scenario?: BriefScenarioId }

export async function POST(
  req: Request,
  { params }: { params: { cartId: string } },
) {
  const cartId = params.cartId
  const cart = await getSmartCart(cartId)
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  if (cart.refunded) {
    return NextResponse.json({ error: 'Cart was refunded' }, { status: 410 })
  }

  const respinCount = cart.respinCount ?? 0
  if (respinCount >= MAX_RESPINS) {
    return NextResponse.json(
      {
        error: 'Respin limit reached',
        message:
          'Still not right? Email hello@alderprojects.com for a refund.',
      },
      { status: 429 },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const newScope = body.scopeVariantId
  const newScenario = body.scenario
  if (!newScope || !newScenario) {
    return NextResponse.json(
      { error: 'Missing scopeVariantId or scenario' },
      { status: 400 },
    )
  }

  // Topic-locking: the new scope must belong to the cart's existing topic.
  const variant = getScopeVariant(cart.topic, newScope)
  if (!variant) {
    return NextResponse.json(
      { error: 'Scope does not belong to this cart\'s topic' },
      { status: 422 },
    )
  }

  const newCart = buildSmartCart({
    topic: cart.topic,
    scopeVariantId: newScope,
    scenario: newScenario,
    season: inferSeason(new Date()),
    customerEmail: cart.customerEmail,
    customerProvidedAddress: cart.customerProvidedAddress,
  })
  // Preserve the original cartId and bump respinCount.
  newCart.cartId = cart.cartId
  newCart.createdAt = cart.createdAt
  newCart.expiresAt = cart.expiresAt
  newCart.respinCount = respinCount + 1
  await saveSmartCart(newCart)

  return NextResponse.json({
    ok: true,
    cart: newCart,
    respinsRemaining: MAX_RESPINS - newCart.respinCount,
  })
}
