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

  // Canonical env var is DISABLE_VISION_CRON (matches Vercel + the
  // other DISABLE_* flags). Route remains a stub until v7.3.3 ships the
  // queue worker; honor the flag explicitly for consistency.
  if (process.env.DISABLE_VISION_CRON === 'true') {
    return Response.json({ skipped: true, reason: 'DISABLE_VISION_CRON=true' })
  }

  // Stub until v7.3.3. Replace with queue polling + extract pipeline.
  return Response.json({
    skipped: true,
    reason: 'stub_until_v7.3.3',
    note: 'Queue worker not yet implemented; no photos to extract.',
  })
}
