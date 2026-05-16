/**
 * Daily Digest Cron Handler
 *
 * Scheduled at 5 AM ET = 10:00 UTC during EST.
 * vercel.json entry: { "path": "/api/cron/daily-digest", "schedule": "0 10 * * *" }
 */

import type { NextRequest } from 'next/server'
import { sendDailyDigest } from '@/lib/email/digest'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (process.env.DISABLE_DIGEST_EMAIL === 'true') {
    return Response.json({ skipped: true, reason: 'DISABLE_DIGEST_EMAIL=true' })
  }

  try {
    const result = await sendDailyDigest()
    return Response.json({ ok: true, ...result })
  } catch (e) {
    console.error('Daily digest failed:', e)
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
