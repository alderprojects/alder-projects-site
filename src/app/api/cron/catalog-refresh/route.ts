/**
 * Vercel Cron handler for catalog refresh.
 *
 * Scheduled in vercel.json:
 *   "0 11,23 * * *"  — 6 AM and 6 PM ET (11:00 and 23:00 UTC during EST)
 *
 * Vercel cron sends a GET to this route with an Authorization header
 * containing the CRON_SECRET. We verify it before running.
 *
 * In staging (read.alderprojects.com) this runs against the staging
 * universe and the staging Anthropic key. In prod (alderprojects.com)
 * the same code runs against the prod universe. Same code, different
 * environment variables.
 */

import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes — catalog refresh of 220 SKUs runs ~3-4 minutes

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Allow opt-out via env flag — useful during the 4-week build if the
  // staging cron is noisy or the PA-API quota is shared with manual runs.
  // Check before dynamic import so worker module's load-time side effects
  // (Anthropic client init, Prisma singleton resolution) don't fire on
  // skipped invocations.
  if (process.env.DISABLE_CATALOG_CRON === 'true') {
    return Response.json({ skipped: true, reason: 'DISABLE_CATALOG_CRON=true' })
  }

  const { runCatalogRefresh } = await import('@/lib/catalog/refresh')
  try {
    const summary = await runCatalogRefresh({ dryRun: false, write: true })
    return Response.json({
      ok: true,
      summary: {
        productsRefreshed: summary.productsRefreshed,
        productsFailed: summary.productsFailed,
        pricesUpdated: summary.pricesUpdated,
        driftCount: summary.driftEvents.length,
        bulkDriftDetected: summary.bulkDriftDetected,
        durationMs: summary.finishedAt.getTime() - summary.startedAt.getTime(),
      },
    })
  } catch (e) {
    console.error('Catalog refresh failed:', e)
    return Response.json(
      {
        ok: false,
        error: (e as Error).message,
      },
      { status: 500 }
    )
  }
}
