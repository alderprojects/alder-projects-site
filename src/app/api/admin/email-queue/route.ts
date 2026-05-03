// V7 — admin email-queue inspector.
//
// Lists everything currently in the KV email:queue:* namespace so you
// can verify a webhook actually enqueued a delivery. The queue is the
// V7-launch transport seam — the actual SMTP/API send is wired in
// V7.1; until then this endpoint plus the masked body field is how
// you confirm messages were prepared correctly.
//
// Auth: ADMIN_REFUND_TOKEN.

import { NextResponse } from 'next/server'
import { listQueuedEmails } from '@/lib/email'

export const dynamic = 'force-dynamic'

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_REFUND_TOKEN
  if (!expected) return false
  const url = new URL(req.url)
  if (url.searchParams.get('adminToken') === expected) return true
  if (req.headers.get('authorization') === `Bearer ${expected}`) return true
  return false
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const includeBody = url.searchParams.get('body') === '1'
  const status = url.searchParams.get('status')                  // queued | sent | failed
  const type = url.searchParams.get('type')                      // smart_cart_receipt | etc.
  const limit = Number(url.searchParams.get('limit') ?? '50')

  let envelopes = await listQueuedEmails()
  if (status) envelopes = envelopes.filter(e => e.status === status)
  if (type) envelopes = envelopes.filter(e => e.type === type)
  envelopes = envelopes.slice(-limit).reverse()                  // newest first

  const summary = {
    total: envelopes.length,
    byStatus: countBy(envelopes, e => e.status),
    byType: countBy(envelopes, e => e.type),
  }

  const items = envelopes.map(e => ({
    id: e.id,
    type: e.type,
    toEmail: e.toEmail,
    subject: e.subject,
    status: e.status,
    attempts: e.attempts,
    scheduledFor: e.scheduledFor,
    createdAt: e.createdAt,
    sentAt: e.sentAt,
    error: e.error,
    metadata: e.metadata,
    body: includeBody ? e.body : undefined,
  }))

  return NextResponse.json({ summary, items })
}

function countBy<T>(items: T[], keyFn: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const i of items) {
    const k = keyFn(i)
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}
