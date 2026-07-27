/**
 * v7.4.8 — POST /api/report/cart/redeem  (FLAG-GATED)
 *
 * Body: {reportId, code, email, key?}
 *
 * Redeems a one-time SmartCartCredit at the existing cart gate.
 *
 * Adaptation note (pre-answered decision "conform to the existing
 * mechanism rather than adding a parallel one"): the v7.4.2 gate is a
 * Stripe Payment Link → webhook → deliverReportCart(). There is no
 * coupon/credit primitive in that flow to reuse, and a Payment Link
 * cannot be discounted to zero per-visitor. So the credit reuses the
 * FULFILLMENT path rather than the payment path: redemption calls the
 * exact same deliverReportCart() the webhook calls. One delivery path,
 * two entry points (paid, credited) — no parallel cart builder, no
 * second email template.
 *
 * Single-use is enforced by a conditional update on redeemedAt, so two
 * concurrent redemptions can never both win.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { deliverReportCart } from '@/lib/recommend/cart-delivery'
import { logEvent } from '@/lib/events/log'
import { addressCaptureEnabled } from '@/lib/consent/licensing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BodySchema = z.object({
  reportId: z.string().min(1),
  code: z.string().min(1).max(64),
  email: z.string().email().max(254),
  key: z.string().max(64).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!addressCaptureEnabled()) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  let anonId: string | null = null
  try {
    anonId = await ensureVisitorSession({ firstSource: 'report_cart_redeem' })
  } catch {
    if (!body.key) return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({
    where: { id: body.reportId },
    select: {
      id: true,
      visitorAnonId: true,
      accessKey: true,
      deletedAt: true,
      recommendations: { where: { verdict: 'BUY', disabledAt: null }, select: { id: true } },
    },
  })
  if (!report || report.deletedAt) {
    return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  }
  const byCookie = anonId != null && report.visitorAnonId === anonId
  const byKey = body.key != null && report.accessKey != null && body.key === report.accessKey
  if (!byCookie && !byKey) {
    return NextResponse.json({ ok: false, error: 'not_your_report' }, { status: 403 })
  }
  // Same nudge rule the paid gate enforces: no BUY verdicts → no cart.
  if (report.recommendations.length === 0) {
    return NextResponse.json({ ok: false, error: 'no_buy_verdicts' }, { status: 422 })
  }

  const credit = await prisma.smartCartCredit.findUnique({ where: { code: body.code.trim().toUpperCase() } })
  if (!credit) return NextResponse.json({ ok: false, error: 'credit_not_found' }, { status: 404 })
  if (credit.redeemedAt) return NextResponse.json({ ok: false, error: 'credit_already_redeemed' }, { status: 409 })
  const creditOwned =
    (credit.visitorAnonId != null && credit.visitorAnonId === (report.visitorAnonId ?? anonId)) ||
    credit.reportId === report.id
  if (!creditOwned) return NextResponse.json({ ok: false, error: 'not_your_credit' }, { status: 403 })

  // Claim atomically: only the caller who flips redeemedAt from null wins.
  const claimed = await prisma.smartCartCredit.updateMany({
    where: { id: credit.id, redeemedAt: null },
    data: { redeemedAt: new Date(), redeemedForReportId: report.id },
  })
  if (claimed.count === 0) {
    return NextResponse.json({ ok: false, error: 'credit_already_redeemed' }, { status: 409 })
  }

  try {
    await deliverReportCart(report.id, body.email.trim().toLowerCase())
  } catch (e) {
    // Delivery failed — release the claim so the visitor can retry.
    await prisma.smartCartCredit.updateMany({
      where: { id: credit.id },
      data: { redeemedAt: null, redeemedForReportId: null },
    })
    return NextResponse.json(
      { ok: false, error: 'delivery_failed', detail: (e as Error).message.slice(0, 160) },
      { status: 502 }
    )
  }

  await logEvent({
    eventType: 'CREDIT_REDEEMED',
    subjectType: 'SmartCartCredit',
    subjectId: credit.id,
    anonId: anonId ?? undefined,
    source: 'web',
    payload: { reportId: report.id },
  })

  return NextResponse.json({ ok: true, delivered: true })
}
