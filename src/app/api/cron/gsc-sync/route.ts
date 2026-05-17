/**
 * GSC Sync Cron Handler
 *
 * Scheduled in vercel.json: { "path": "/api/cron/gsc-sync", "schedule": "17 9 * * 1" }
 * (Mondays at 9:17 UTC = 4:17 AM ET. Weekly cadence, runs before the daily
 *  digest so the digest has fresh data.)
 *
 * Note: per Vercel cron docs, only production deployments run crons. This
 * route will not fire from preview deploys.
 */

import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Disable check before dynamic import — keeps GSC client + private-key
  // JWT signer out of skipped invocations.
  if (process.env.DISABLE_GSC_CRON === 'true') {
    return Response.json({ skipped: true, reason: 'DISABLE_GSC_CRON=true' })
  }

  const { runGscSync } = await import('@/lib/gsc/feedback')
  try {
    const result = await runGscSync()
    return Response.json({ ok: true, ...result })
  } catch (e) {
    console.error('GSC sync failed:', e)
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
