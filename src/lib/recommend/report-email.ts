/**
 * v7.4.2f — The full-report email. Sent on unlock: the entire Check
 * (email tier) rendered inline, plus a capability link back to the
 * report page that works on any device. NO sign-in, NO accounts —
 * the link IS the access.
 */

import type { Recommendation } from '@prisma/client'
import { buildAmazonUrl } from '@/lib/buildAmazonUrl'

const VERDICT_COLORS: Record<string, { bg: string; fg: string }> = {
  BUY: { bg: '#e5efe2', fg: '#2d5a3d' },
  WAIT: { bg: '#f3ecd9', fg: '#8a6d1f' },
  SKIP: { bg: '#f0e4e0', fg: '#8a3d2e' },
  INVESTIGATE: { bg: '#e7e9f0', fg: '#3d4a7a' },
}

export function renderReportEmail(rows: Recommendation[], reportUrl: string): string {
  // (disabledAt filtering arrives with the v7.4.4 admin-lite PR)
  const live = [...rows].sort((a, b) => a.sortOrder - b.sortOrder)
  const buyCount = live.filter((r) => r.verdict === 'BUY').length

  const cards = live
    .map((r) => {
      const c = VERDICT_COLORS[r.verdict] ?? VERDICT_COLORS.INVESTIGATE
      const evidence = ((r.visibleEvidenceJson as string[]) ?? []).slice(0, 3)
      const rebate = r.rebateJson as { program?: string; amount?: string; stale?: boolean } | null
      const citations = (r.citationsJson as Array<{ guideSlug: string; guideTitle: string; verifiedAt: string }>) ?? []
      const cost =
        r.costLow != null && r.costHigh != null
          ? `<strong>Typical cost:</strong> $${r.costLow.toLocaleString()}–$${r.costHigh.toLocaleString()}`
          : ''
      const rebateLine = rebate?.program
        ? ` &nbsp;·&nbsp; <strong>${escapeHtml(rebate.program)}:</strong> ${rebate.stale ? 'check current program' : escapeHtml(rebate.amount ?? '')}`
        : ''
      const searchLink =
        r.verdict === 'BUY' && r.categorySearchQuery
          ? `<p style="margin:8px 0 0;font-size:13px"><a href="${buildAmazonUrl(r.categorySearchQuery)}" style="color:#1f3d2b">Browse options on Amazon →</a></p>`
          : ''
      const citation = citations[0]
        ? `<p style="margin:8px 0 0;font-size:11.5px;color:#888">Cost basis: ${escapeHtml(citations[0].guideTitle)}, verified ${citations[0].verifiedAt.slice(0, 7)}</p>`
        : ''
      return `<div style="border:1px solid #e5e0d3;border-radius:10px;padding:16px 18px;margin:0 0 12px;background:#ffffff">
        <p style="margin:0 0 6px"><span style="background:${c.bg};color:${c.fg};font-weight:700;font-size:12px;letter-spacing:0.05em;border-radius:5px;padding:3px 9px">${r.verdict}</span>
        &nbsp;<strong style="font-size:15px;color:#22301f">${escapeHtml(r.title)}</strong></p>
        <p style="margin:0 0 8px;font-size:13.5px;color:#4a5245;line-height:1.55">${escapeHtml(r.summary)}</p>
        ${evidence.length ? `<p style="margin:0 0 6px;font-size:12px;color:#b08d2f;font-weight:700;letter-spacing:0.05em">WHAT WE SAW</p><ul style="margin:0 0 8px;padding-left:18px;font-size:13px;color:#4a5245">${evidence.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>` : ''}
        ${cost || rebateLine ? `<p style="margin:0;font-size:13px;color:#22301f">${cost}${rebateLine}</p>` : ''}
        <p style="margin:8px 0 0;font-size:13px;color:#22301f"><strong>Next step:</strong> ${escapeHtml(r.nextAction)}</p>
        ${searchLink}${citation}
      </div>`
    })
    .join('')

  const cartCta =
    buyCount > 0
      ? `<div style="background:#1f3d2b;border-radius:10px;padding:16px 18px;margin:16px 0">
          <p style="margin:0 0 10px;color:#f6f2e8;font-size:14px;line-height:1.5">Your Check found <strong>${buyCount}</strong> thing${buyCount === 1 ? '' : 's'} worth buying. Smart Cart turns ${buyCount === 1 ? 'it' : 'them'} into the exact products and specs — $19.99.</p>
          <a href="${reportUrl.replace(/\?.*$/, '')}/cart?key=${encodeURIComponent(new URL(reportUrl).searchParams.get('key') ?? '')}" style="display:inline-block;background:#b08d2f;color:#ffffff;font-weight:700;font-size:14px;border-radius:8px;padding:10px 18px;text-decoration:none">Build My Smart Cart →</a>
        </div>`
      : `<p style="font-size:13px;color:#4a5245">Nothing worth buying right now — that's the honest answer. Keep this email and re-check when the season or the symptoms change.</p>`

  return `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;color:#22301f;background:#f6f2e8;padding:24px 18px;border-radius:12px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;color:#b08d2f;font-weight:700">ALDER CHECK</p>
    <h1 style="margin:0 0 6px;font-size:22px;color:#1f3d2b">Your full Buy / Skip / Wait plan</h1>
    <p style="margin:0 0 16px;font-size:13.5px;color:#4a5245">All ${live.length} findings, every number carrying a verified date. This email is your access — no account, no password.</p>
    <p style="margin:0 0 16px"><a href="${reportUrl}" style="display:inline-block;background:#1f3d2b;color:#f6f2e8;font-weight:700;font-size:14px;border-radius:8px;padding:11px 20px;text-decoration:none">Open my report (works on any device) →</a></p>
    ${cards}
    ${cartCta}
    <p style="margin:14px 0 0;font-size:11.5px;color:#888">Product links are Amazon affiliate links (tag alderprojects-20) — that never changes a verdict. Photos are analyzed only to create your report; the report page has a working delete control.</p>
  </div>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
