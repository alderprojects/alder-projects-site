// V7.1 — POST /api/intent/start
//
// Records the email-first capture from Step 0 of the CurationModal.
// Fire-and-forget from the client; the modal does not block on the
// response. KV record carries 30-day TTL so a stalled visitor's email
// is still recoverable for the lifecycle email queue.

import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

type Body = {
  email?: string
  product?: 'smart_cart' | 'worth_it'
  sourcePageUrl?: string
}

const INTENT_TTL_SECONDS = 30 * 24 * 3600

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

function intentStartId(): string {
  return `is_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const email = (body.email ?? '').trim()
  const product = body.product
  const sourcePageUrl = body.sourcePageUrl

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (product !== 'smart_cart' && product !== 'worth_it') {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  const id = intentStartId()
  const record = {
    id,
    email,
    product,
    sourcePageUrl: sourcePageUrl ?? null,
    ts: new Date().toISOString(),
  }

  await kv.set(`intent_starts:${id}`, record, { ex: INTENT_TTL_SECONDS })
  // Maintain a capped index for admin inspection.
  const indexKey = 'intent_starts:index'
  const existing = (await kv.get<string[]>(indexKey)) ?? []
  await kv.set(indexKey, [...existing, id].slice(-1000))

  return NextResponse.json({ ok: true, id })
}
