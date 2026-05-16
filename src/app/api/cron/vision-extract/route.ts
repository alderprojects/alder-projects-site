/**
 * Vision Extraction Cron Handler — week-1 stub.
 *
 * vercel.json schedules this every minute (`* * * * *`). Week 2 wires it
 * to a Postgres-backed queue that polls `VisionExtraction.reviewStatus =
 * 'pending'` rows, calls `extractFromPhoto` from `@/lib/vision/extract`,
 * and routes low-confidence results to the manual review queue.
 *
 * Until week 2 ships, this stub returns immediately so Vercel doesn't
 * log a 1440x/day stream of 404s. Auth still enforced.
 */

import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (process.env.DISABLE_VISION_EXTRACT_CRON === 'true') {
    return Response.json({ skipped: true, reason: 'DISABLE_VISION_EXTRACT_CRON=true' })
  }

  // Week-1 stub. Replace in week 2 with queue polling + extract pipeline.
  return Response.json({
    skipped: true,
    reason: 'stub_until_week_2',
    note: 'Queue worker not yet implemented; no photos to extract.',
  })
}
