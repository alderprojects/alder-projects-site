// v7.2.11 — photo beta signup endpoint.
//
// v7.2.11 implementation: validate + log server-side. No mailing
// list integration yet (Resend wiring is a v7.3+ task per scope).
// Returns 200 on success so the form can confirm receipt.

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const email =
    body && typeof body === 'object' && 'email' in body
      ? String((body as { email: unknown }).email ?? '').trim().toLowerCase()
      : ''
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  // v7.2.11: server-log only. v7.3+ will route to a mailing-list
  // provider with double opt-in.
  // eslint-disable-next-line no-console
  console.log(`[photo-beta-signup] new signup: ${email} @ ${new Date().toISOString()}`)
  return NextResponse.json({ ok: true })
}
