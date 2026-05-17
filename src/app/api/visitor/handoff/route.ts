/**
 * POST /api/visitor/handoff
 *
 * Issues a desktop->mobile handoff token bound to the caller's
 * alder_anon_id cookie. Returns the raw token + the redemption URL +
 * a server-rendered QR PNG data URL.
 *
 * Called client-side from the basement page after page load, because
 * server components can't read cookies that middleware just set in the
 * same request — middleware mutates the RESPONSE, server components
 * read the REQUEST. By the time this fetch fires, the browser has the
 * cookie and the server can read it.
 */

import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { issueHandoffToken } from '@/lib/visitor/handoff'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(req: NextRequest): Promise<NextResponse> {
  let anonId: string
  try {
    anonId = await ensureVisitorSession({ firstSource: 'basement_landing' })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'no_anon_cookie' },
      { status: 400 }
    )
  }

  const { rawToken, expiresAt } = await issueHandoffToken(anonId)
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin
  const url = `${baseUrl}/handoff/${rawToken}`

  const qrDataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 240,
    color: { dark: '#111827', light: '#ffffff' },
  })

  return NextResponse.json({
    ok: true,
    qrDataUrl,
    url,
    expiresAt: expiresAt.toISOString(),
  })
}
