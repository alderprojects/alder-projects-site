/**
 * v7.4.2 — Paid report-cart fulfillment.
 *
 * Called from the Stripe webhook when a report cart is purchased. The
 * cart delivered is the cart that ALREADY EXISTED when the free verdict
 * rendered (CartCandidate rows from the single-pass pipeline) — this
 * function renders and delivers it; it never re-analyzes.
 */

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { logEvent } from '@/lib/events/log'
import { buildAmazonAsinUrl, buildAmazonUrl } from '@/lib/buildAmazonUrl'

export async function deliverReportCart(reportId: string, buyerEmail: string): Promise<void> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      recommendations: {
        where: { verdict: 'BUY' },
        orderBy: { sortOrder: 'asc' },
        include: { cartCandidates: { where: { fitStatus: { not: 'removed' } }, orderBy: { sortOrder: 'asc' } } },
      },
    },
  })
  if (!report) throw new Error(`report_not_found:${reportId}`)

  const html = renderCartEmail(report.recommendations)

  const sent = await sendEmail({
    to: buyerEmail,
    subject: 'Your Smart Cart — the exact products for your Alder Check',
    html,
  })
  if (!sent.ok) {
    // Webhook will rethrow → Stripe retries. Never mark CART_BUILT on a
    // failed delivery.
    throw new Error(`cart_email_failed:${sent.reason}`)
  }

  await prisma.report.update({ where: { id: reportId }, data: { status: 'CART_BUILT' } })

  await logEvent({
    eventType: 'SMARTCART_COMPLETED',
    subjectType: 'Report',
    subjectId: reportId,
    anonId: report.visitorAnonId,
    actorId: report.userId,
    source: 'system',
    payload: {
      buyRecCount: report.recommendations.length,
      lineCount: report.recommendations.reduce((n, r) => n + r.cartCandidates.length, 0),
    },
  })
}

interface RecWithCandidates {
  title: string
  nextAction: string
  cartCandidates: Array<{
    tier: string
    productName: string
    asin: string | null
    searchQuery: string
    priceLow: number | null
    priceHigh: number | null
    fitStatus: string
    requiredSpecsJson: unknown
    quantity: number
    installDifficulty: string | null
  }>
}

const TIER_LABEL: Record<string, string> = { good: 'Good', better: 'Better', best: 'Best', accessory: 'Accessory' }
const DIFFICULTY_LABEL: Record<string, string> = {
  diy_easy: 'Easy DIY',
  diy_moderate: 'Moderate DIY',
  hire_pro: 'When to hire a pro: this one — get an installer quote',
}

function renderCartEmail(recs: RecWithCandidates[]): string {
  let totalLow = 0
  let totalHigh = 0
  const sections = recs
    .map((rec) => {
      const lines = rec.cartCandidates
        .map((c) => {
          const url = c.asin ? buildAmazonAsinUrl(c.asin) : buildAmazonUrl(c.searchQuery)
          const price =
            c.priceLow != null
              ? c.priceHigh != null && c.priceHigh !== c.priceLow
                ? `$${c.priceLow.toFixed(0)}–$${c.priceHigh.toFixed(0)}`
                : `$${c.priceLow.toFixed(0)}`
              : 'price at link'
          if (c.tier === 'better' && c.priceLow != null) {
            totalLow += c.priceLow * c.quantity
            totalHigh += (c.priceHigh ?? c.priceLow) * c.quantity
          }
          const specs = Array.isArray(c.requiredSpecsJson)
            ? (c.requiredSpecsJson as Array<{ spec: string; why: string }>)
                .map((s) => `${s.spec} — ${s.why}`)
                .join('; ')
            : ''
          const fit = c.fitStatus === 'confirmed_fit' ? 'Confirmed fit' : 'Likely fit'
          return `<tr>
            <td style="padding:8px 10px;font-weight:600">${TIER_LABEL[c.tier] ?? c.tier}</td>
            <td style="padding:8px 10px"><a href="${url}">${escapeHtml(c.productName)}</a>${c.quantity > 1 ? ` × ${c.quantity}` : ''}<br/>
              <span style="color:#666;font-size:12px">${fit}${specs ? ` · Check: ${escapeHtml(specs)}` : ''}</span></td>
            <td style="padding:8px 10px;white-space:nowrap">${price}</td>
          </tr>`
        })
        .join('')
      const difficulty = rec.cartCandidates[0]?.installDifficulty
      return `<h3 style="margin:22px 0 4px;color:#1f3d2b">${escapeHtml(rec.title)}</h3>
        ${difficulty ? `<p style="margin:0 0 8px;color:#666;font-size:13px">${DIFFICULTY_LABEL[difficulty] ?? difficulty}</p>` : ''}
        <table style="border-collapse:collapse;width:100%;font-size:14px;border:1px solid #e5e0d3">${lines}</table>`
    })
    .join('')

  return `<div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;color:#22301f">
    <h2 style="color:#1f3d2b">Your Smart Cart</h2>
    <p>These are the exact products behind the Buy verdicts in your Alder Check — same evidence, same analysis, now with specific picks in Good / Better / Best tiers.</p>
    ${sections}
    ${totalLow > 0 ? `<p style="margin-top:20px;font-size:15px"><strong>Estimated total (Better tier): $${totalLow.toFixed(0)}${totalHigh > totalLow ? `–$${totalHigh.toFixed(0)}` : ''}</strong></p>` : ''}
    <p style="margin-top:8px;font-size:13px;color:#666">Prices shown were fetched when your Check ran and can drift — the links show live prices. Items marked “Likely fit” become “Confirmed fit” once you answer the compatibility questions on your cart page; if an answer rules a product out, we remove the line and refund its share.</p>
    <p style="margin-top:16px;font-size:12px;color:#888">Affiliate disclosure: product links are Amazon affiliate links (tag alderprojects-20). Alder may earn a commission at no cost to you. That never changes a verdict — verdicts are set before any product is matched.</p>
  </div>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
