// V7.2.1 — POST /api/worth-it/notify-me
//
// Captures email addresses for the Worth-It paused/coming-soon list.
// No TTL — we want this list to persist until the rebuild ships.
// Idempotent: duplicate submits return success without rewriting.

import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

type Body = { email?: string }

const INDEX_KEY = 'worth_it_notify:index'
const RECORD_PREFIX = 'worth_it_notify'

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

function normalize(email: string): string {
  return email.trim().toLowerCase()
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const email = body.email ? normalize(body.email) : ''
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const key = `${RECORD_PREFIX}:${email}`
  const existing = await kv.get(key)
  if (existing) {
    return NextResponse.json({ success: true, duplicate: true })
  }

  const record = {
    email,
    capturedAt: new Date().toISOString(),
    source: 'worth_it_paused_page',
  }
  await kv.set(key, record)

  // Maintain a capped list for admin inspection / future export.
  const index = (await kv.get<string[]>(INDEX_KEY)) ?? []
  if (!index.includes(email)) {
    await kv.set(INDEX_KEY, [...index, email].slice(-5000))
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  // Internal-friendly count endpoint for v7-diag and operator scripts.
  // No PII returned — just the count.
  const index = (await kv.get<string[]>(INDEX_KEY)) ?? []
  return NextResponse.json({ count: index.length })
}
