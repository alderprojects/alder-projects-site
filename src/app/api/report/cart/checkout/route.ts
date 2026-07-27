/**
 * v7.4.2 — POST /api/report/cart/checkout
 *
 * Starts the $19.99 Smart Cart purchase for a report. Server-enforces
 * the nudge rule: a report with zero BUY verdicts can never reach
 * checkout (the restraint IS the marketing). Stores a pending record in
 * KV keyed by reportId and returns the existing Stripe Payment Link URL
 * with metadata_product_type=report_cart so the webhook fulfills from
 * the pre-computed CartCandidate rows.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { kv } from '@vercel/kv'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { CONFIG } from '@/lib/recommender-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const BodySchema = z.object({
  reportId: z.string().min(1),
  email: z.string().email().max(254),
})

const PENDING_TTL_SECONDS = 30 * 60

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  let anonId: string
  try {
    anonId = await ensureVisitorSession({ firstSource: 'report_cart' })
  } catch {
    return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({
    where: { id: body.reportId },
    include: { recommendations: { where: { verdict: 'BUY' }, select: { id: true } } },
  })
  if (!report || report.deletedAt) {
    return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  }
  if (report.visitorAnonId !== anonId) {
    return NextResponse.json({ ok: false, error: 'not_your_report' }, { status: 403 })
  }
  // Nudge rule, server-enforced: no BUY verdicts → no cart, ever.
  if (report.recommendations.length === 0) {
    return NextResponse.json({ ok: false, error: 'no_buy_verdicts' }, { status: 422 })
  }

  const baseLink = process.env[CONFIG.products.smartCart.stripePaymentLinkEnvVar]
  if (!baseLink) {
    return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 500 })
  }

  await kv.set(
    `pending:reportcart:${report.id}`,
    { reportId: report.id, email: body.email.trim().toLowerCase(), anonId, ts: new Date().toISOString() },
    { ex: PENDING_TTL_SECONDS }
  )

  const url = new URL(baseLink)
  url.searchParams.set('client_reference_id', report.id)
  url.searchParams.set('prefilled_email', body.email.trim().toLowerCase())
  url.searchParams.set('metadata_product_type', 'report_cart')
  url.searchParams.set('metadata_anon_id', anonId)

  return NextResponse.json({ ok: true, checkoutUrl: url.toString() })
}
