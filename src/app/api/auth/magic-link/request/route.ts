import { NextRequest, NextResponse } from 'next/server'
import { requestMagicLink } from '@/lib/auth/magic-link'

export const runtime = 'nodejs'
export const maxDuration = 10

// POST /api/auth/magic-link/request
// Body: { email: string }
// Always returns 200 with { ok: true } unless the email is structurally
// invalid (then { ok: false, reason: "invalid_email" }). We never tell the
// caller whether the email is already a registered user — prevents
// enumeration.

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email : ''
  if (!email) {
    return NextResponse.json({ ok: false, reason: 'invalid_email' }, { status: 400 })
  }

  const result = await requestMagicLink(email)
  if (!result.ok && result.reason === 'invalid_email') {
    return NextResponse.json({ ok: false, reason: 'invalid_email' }, { status: 400 })
  }

  // Always 200 from here, even on send failure. Send failures surface in
  // server logs only; the user sees "check your email" either way.
  return NextResponse.json({ ok: true })
}
