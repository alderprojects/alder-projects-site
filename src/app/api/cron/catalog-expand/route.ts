/**
 * Catalog Expansion Cron Handler
 *
 * Scheduled in vercel.json: { "path": "/api/cron/catalog-expand", "schedule": "47 8 * * *" }
 * (8:47 UTC = 3:47 AM ET during EST. Runs after catalog-refresh at 8:17 UTC.)
 *
 * Picks one scope per run, generates 3-5 LLM candidates with Google-aligned
 * commodity risk + evidence tags, writes drafts to CatalogExpansionCandidate.
 *
 * The candidates surface in the 5 AM ET digest email sent by digest-email.ts.
 */

import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Disable check before dynamic import — keeps Anthropic client
  // initialization out of skipped invocations.
  if (process.env.DISABLE_CATALOG_EXPAND_CRON === 'true') {
    return Response.json({ skipped: true, reason: 'DISABLE_CATALOG_EXPAND_CRON=true' })
  }

  // Optional: support ?scope=basement_moisture_prep for manual single-scope runs
  const url = new URL(request.url)
  const scopeOverride = url.searchParams.get('scope') || undefined

  const { runExpansion } = await import('@/lib/catalog/expand')
  try {
    const result = await runExpansion({ scopeId: scopeOverride })
    return Response.json({ ok: true, ...result })
  } catch (e) {
    console.error('Catalog expansion failed:', e)
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
