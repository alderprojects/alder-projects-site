// V7 — admin synthesis preview.
//
// Hits buildSmartCart() / buildWorthItPlan() with whatever inputs you
// pass and returns the JSON that the webhook would have stored. Lets
// you eyeball the actual cart contents and plan moves for a given
// (topic, scope, scenario) before any money changes hands.
//
// Auth: ADMIN_REFUND_TOKEN.
//
// Usage:
//   GET /api/admin/v7-preview?adminToken=...&product=smart_cart
//        &topic=kitchen&scope=kitchen_cosmetic_refresh&scenario=just_starting
//   GET /api/admin/v7-preview?adminToken=...&product=worth_it
//        &topic=heat_pump&scope=heat_pump_readiness_prep&scenario=already_have_basics
//        &address=1920+Lake+Dunmore+Rd,+Salisbury,+VT
//
// Nothing is persisted — pure preview.

import { NextResponse } from 'next/server'
import { buildSmartCart } from '@/lib/buildSmartCart'
import { buildWorthItPlan } from '@/lib/buildWorthItPlan'
import { inferSeason } from '@/lib/season-helpers'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

export const dynamic = 'force-dynamic'

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_REFUND_TOKEN
  if (!expected) return false
  const url = new URL(req.url)
  if (url.searchParams.get('adminToken') === expected) return true
  if (req.headers.get('authorization') === `Bearer ${expected}`) return true
  return false
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const product = url.searchParams.get('product') ?? 'smart_cart'
  const topic = (url.searchParams.get('topic') ?? 'kitchen') as TopicId
  const scope = url.searchParams.get('scope') ?? 'kitchen_cosmetic_refresh'
  const scenario = (url.searchParams.get('scenario') ?? 'just_starting') as BriefScenarioId
  const email = url.searchParams.get('email') ?? 'preview@example.com'
  const address = url.searchParams.get('address') ?? undefined
  const season = inferSeason(new Date())

  try {
    if (product === 'smart_cart') {
      const cart = buildSmartCart({
        topic,
        scopeVariantId: scope,
        scenario,
        season,
        customerEmail: email,
        customerProvidedAddress: address,
      })
      return NextResponse.json({ product, season, cart })
    }
    if (product === 'worth_it') {
      const plan = buildWorthItPlan({
        topic,
        scopeVariantId: scope,
        scenario,
        season,
        address,
        customerEmail: email,
      })
      // Strip the unhashed token from the preview — even in admin
      // context, no need to surface the raw token.
      const { privateToken: _, ...safe } = plan
      void _
      return NextResponse.json({ product, season, plan: safe })
    }
    return NextResponse.json(
      { error: `Unknown product: ${product}. Use product=smart_cart or product=worth_it.` },
      { status: 400 },
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Synthesis failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
