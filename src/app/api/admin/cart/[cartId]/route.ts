// V7.2.2 — admin cart debug endpoint.
//
// GET /api/admin/cart/[cartId]?adminToken=...
//
// Returns routing-relevant fields only (version, topic, scope,
// scenario, slot/skip counts, redacted email) so an operator can
// confirm a given cart routed through v1 vs v2 without leaking the
// full record. Uses ADMIN_REFUND_TOKEN auth — same pattern as the
// other admin endpoints. KV key is `smartcart:${cartId}` per
// storage.ts; legacy v1 carts may not carry a `version` field, so
// undefined is treated as 1.

import { NextResponse, type NextRequest } from 'next/server'
import { getSmartCart } from '@/lib/storage'
import type { SmartCartV2Output } from '@/lib/smart-cart-model'
import type { SmartCartOutput } from '@/lib/buildSmartCart'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_REFUND_TOKEN
  if (!expected) return false
  const queryToken = req.nextUrl.searchParams.get('adminToken')
  if (queryToken === expected) return true
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${expected}`) return true
  return false
}

function redactEmail(email?: string): string | null {
  if (!email) return null
  const [local, domain] = email.split('@')
  if (!domain) return null
  const visible = local.slice(0, 3)
  return `${visible}***@${domain}`
}

export async function GET(
  req: NextRequest,
  { params }: { params: { cartId: string } },
) {
  if (!authorized(req)) {
    return NextResponse.json(
      {
        error: 'unauthorized',
        hint:
          'Pass ADMIN_REFUND_TOKEN via ?adminToken=<token> or Authorization: Bearer <token>.',
      },
      { status: 401 },
    )
  }

  const cartId = params.cartId
  const cart = await getSmartCart(cartId)
  if (!cart) {
    return NextResponse.json({ error: 'not found', cartId }, { status: 404 })
  }

  const v2 = cart as SmartCartV2Output
  const v1 = cart as SmartCartOutput
  const version = v2.version ?? 1

  return NextResponse.json({
    cartId,
    version,
    product: v2.product ?? 'smart_cart',
    topic: cart.topic,
    scopeVariantId: cart.scopeVariantId,
    scenario: cart.scenario,
    selectedTier: v2.selectedTier ?? null,
    alreadyHave: v2.alreadyHave ?? [],
    slotCount: Array.isArray(v2.slots) ? v2.slots.length : null,
    leanCartItemCount: Array.isArray(v1.leanCart?.items)
      ? v1.leanCart.items.length
      : null,
    skipCount: Array.isArray(v2.skipList)
      ? v2.skipList.length
      : Array.isArray(v1.skipForNow)
        ? v1.skipForNow.length
        : null,
    customerEmailRedacted: redactEmail(cart.customerEmail),
    createdAt: cart.createdAt,
    expiresAt: cart.expiresAt,
    refunded: cart.refunded ?? false,
    respinCount: v2.respinCount ?? v1.respinCount ?? 0,
  })
}
