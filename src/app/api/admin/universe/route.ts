// V7.2.3 — admin universe stats endpoint.
//
// GET /api/admin/universe?adminToken=<ADMIN_REFUND_TOKEN>
//
// Returns aggregate stats about the v2 universe + scope catalogs.
// Used for monitoring during v7.2.4+ universe expansion. As content
// batches land, this endpoint shows real-time skew growth.

import { NextResponse, type NextRequest } from 'next/server'
import { getAllCatalogs, getUniverse } from '@/content/smart-cart'

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

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const universe = getUniverse()
  const catalogs = getAllCatalogs()

  const byTier: Record<'budget' | 'sweet_spot' | 'premium', number> = {
    budget: 0,
    sweet_spot: 0,
    premium: 0,
  }
  const byTopic: Record<string, number> = {}
  const byFunction: Record<string, number> = {}
  let verifiedAsins = 0

  for (const p of universe) {
    byTier[p.tags.tier] += 1
    p.tags.topics.forEach(t => {
      byTopic[t] = (byTopic[t] ?? 0) + 1
    })
    p.tags.functions.forEach(f => {
      byFunction[f] = (byFunction[f] ?? 0) + 1
    })
    if (p.variant.amazonAsin) verifiedAsins += 1
  }

  return NextResponse.json({
    universe: {
      total: universe.length,
      byTier,
      byTopic,
      byFunction,
      verifiedAsins,
    },
    catalogs: catalogs.map(c => ({
      topic: c.topic,
      scopeVariantId: c.scopeVariantId,
      scenarios: c.scenarios,
      slotCount: c.slots.length,
      coreSlotCount: c.slots.filter(s => s.slotKind === 'core').length,
      addonSlotCount: c.slots.filter(s => s.slotKind === 'addon').length,
      skipCount: c.skipList.length,
    })),
  })
}
