import { NextRequest, NextResponse } from 'next/server'
import { consumeMagicLink } from '@/lib/auth/magic-link'
import { mintSession } from '@/lib/auth/session'

export const runtime = 'nodejs'
export const maxDuration = 10

// POST /api/auth/magic-link/verify
// Body: { token: string }
// On success: sets session cookie, returns { ok: true }.
//
// The dynamic /account/sign-in/verify/[token] server page calls this
// internally rather than performing the work itself — keeping the cookie-
// setting side effect in a route handler makes server-component caching
// behavior more predictable.

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { token?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  if (!token) {
    return NextResponse.json({ ok: false, reason: 'missing_token' }, { status: 400 })
  }

  const result = await consumeMagicLink(token)
  if (!result.ok || !result.userId) {
    return NextResponse.json(
      { ok: false, reason: result.reason ?? 'unknown' },
      { status: 400 }
    )
  }

  await mintSession(result.userId)
  return NextResponse.json({ ok: true })
}
