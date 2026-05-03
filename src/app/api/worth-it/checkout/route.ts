// V7 — Worth-It Plan checkout endpoint.

import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/recommender-config'
import { savePendingWorthItPlan } from '@/lib/storage'
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
  slug?: string
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { topic, scopeVariantId, scenario, email, address, slug } = body
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

  const planCode = generatePlanCode(address ?? slug)
  await savePendingWorthItPlan(planCode, {
    topic,
    scopeVariantId,
    scenario,
    email,
    address: address || undefined,
    slug: slug || undefined,
  })

  const baseLink = process.env[CONFIG.products.worthIt.stripePaymentLinkEnvVar]
  if (!baseLink) {
    return NextResponse.json({ error: 'Stripe Payment Link is not configured' }, { status: 500 })
  }

  const checkoutUrl = appendStripeMetadata(baseLink, {
    client_reference_id: planCode,
    prefilled_email: email,
    metadata_product_type: 'worth_it',
  })

  return NextResponse.json({ checkoutUrl, planCode })
}

function appendStripeMetadata(base: string, fields: Record<string, string>): string {
  const url = new URL(base)
  for (const [k, v] of Object.entries(fields)) url.searchParams.set(k, v)
  return url.toString()
}

function generatePlanCode(addressOrSlug?: string): string {
  const source = (addressOrSlug ?? '').toLowerCase()
  const map: Array<[string, string]> = [
    ['stowe', 'STOWE'], ['burlington', 'BURL'], ['montpelier', 'MONT'],
    ['manchester', 'MANCH'], ['woodstock', 'WOOD'], ['middlebury', 'MIDD'],
    ['brattleboro', 'BRAT'], ['vergennes', 'VERG'],
  ]
  let town = 'PROJ'
  for (const [needle, abbrev] of map) {
    if (source.includes(needle)) { town = abbrev; break }
  }
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i += 1) suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `${town}-${suffix}`
}
