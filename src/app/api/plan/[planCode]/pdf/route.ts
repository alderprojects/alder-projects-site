// V7 — Worth-It Plan PDF endpoint.
//
// V7 launch ships an HTML-rendered "PDF-ready" page. The browser's
// Print → Save as PDF flow generates the PDF from this page. This
// keeps the V7 build off the @react-pdf/renderer dependency tree
// and ships visual fidelity to the dashboard. V7.1 swaps in
// server-rendered PDF generation.

import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/recommender-config'
import { getWorthItPlan, logPlanEvent } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { planCode: string } },
) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

  const result = await getWorthItPlan(params.planCode, token)
  if (!result) return NextResponse.json({ error: 'Plan not found or invalid token' }, { status: 404 })

  await logPlanEvent(params.planCode, 'pdf_downloaded', {})

  const html = renderPrintableHtml(result.data)
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

function renderPrintableHtml(plan: import('@/lib/buildWorthItPlan').WorthItOutput): string {
  const cfg = CONFIG.products.worthIt
  const movesAll = Object.values(plan.movesByPath).flat()
  const seen = new Set<string>()
  const moves = movesAll.filter(m => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })
  const stylesheet = `
    body { font-family: 'Inter', system-ui, sans-serif; color: #1a1f1a; background: #fbf8f1; padding: 40px; max-width: 760px; margin: 0 auto; }
    h1, h2, h3 { font-family: 'Fraunces', Georgia, serif; color: #1f3a2e; margin-top: 32px; }
    h1 { font-size: 32px; margin-bottom: 8px; }
    h2 { font-size: 22px; margin-bottom: 12px; }
    h3 { font-size: 16px; }
    .meta { font-size: 12px; color: rgba(26,31,26,0.7); margin-bottom: 24px; }
    .card { background: white; border: 1px solid #e8e3d4; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .move { border-bottom: 1px solid #e8e3d4; padding: 12px 0; }
    .move:last-child { border-bottom: 0; }
    .rank { display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; background: #1f3a2e; color: white; border-radius: 50%; font-size: 12px; margin-right: 8px; }
    .why { font-size: 13px; color: rgba(26,31,26,0.75); margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid #e8e3d4; }
    .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .summary-grid .stat { background: #f5efe2; border: 1px solid #e8e3d4; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(26,31,26,0.6); }
    .stat-value { font-family: 'Fraunces', Georgia, serif; font-size: 20px; color: #1f3a2e; }
    @media print { body { background: white; } }
  `
  const skipRows = plan.whatToSkip.slice(0, 12).map(s => (
    `<li><strong>${escapeHtml(s.title)}</strong> — ${escapeHtml(s.reasoning)}</li>`
  )).join('')
  const stopRows = plan.diyStopLine.slice(0, 12).map(s => (
    `<li><strong>${escapeHtml(s.trigger)}</strong> — ${escapeHtml(s.why)} <em>(${escapeHtml(s.whoToCall)})</em></li>`
  )).join('')
  const moveRows = moves.slice(0, 16).map(m => `
    <div class="move">
      <span class="rank">${m.rank}</span>
      <strong>${escapeHtml(m.title)}</strong>
      <div class="why">${escapeHtml(m.whyRanked)}</div>
      <div style="font-size:11px;color:#1f3a2e;margin-top:4px">
        ${m.impactLevel} impact · $${m.spend.low}${m.spend.low !== m.spend.high ? `–$${m.spend.high}` : ''}
        · ${m.timeMinutes < 60 ? `${m.timeMinutes} min` : `${Math.round(m.timeMinutes/60)} hr`}
        · score ${m.score}
      </div>
    </div>
  `).join('')
  const buyRows = plan.whatToBuy.slice(0, 12).map(i => `
    <tr>
      <td>${escapeHtml(i.display)}</td>
      <td>${i.quantity} ${escapeHtml(i.unit)}</td>
      <td>$${i.estimatedPrice}</td>
    </tr>
  `).join('')
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Worth-It Plan — ${plan.planCode}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fraunces:wght@500;700&display=swap" />
  <style>${stylesheet}</style>
</head>
<body>
  <h1>${escapeHtml(plan.scopeLabel)}</h1>
  <div class="meta">
    Plan code: <strong>${plan.planCode}</strong>
    ${plan.address ? ` · ${escapeHtml(plan.address)}` : ''}
    · Created ${new Date(plan.createdAt).toLocaleDateString()}
    · Plan version ${plan.pdfTemplateVersion}
  </div>

  <h2>Best path: ${escapeHtml(plan.bestPath.title)}</h2>
  <p>${escapeHtml(plan.bestPath.description)}</p>

  <h2>Highest-payoff moves</h2>
  <div class="card">${moveRows}</div>

  <h2>What to buy</h2>
  <div class="card">
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Est.</th></tr></thead>
      <tbody>${buyRows}</tbody>
    </table>
  </div>

  <h2>What to skip</h2>
  <div class="card"><ul>${skipRows}</ul></div>

  <h2>DIY stop line</h2>
  <div class="card"><ul>${stopRows}</ul></div>

  <h2>Plan summary</h2>
  <div class="card summary-grid">
    <div class="stat"><div class="stat-label">Est Spend</div><div class="stat-value">$${plan.summary.estSpend.low}–$${plan.summary.estSpend.high}</div></div>
    <div class="stat"><div class="stat-label">Total Time</div><div class="stat-value">${plan.summary.totalTimeHours.low}–${plan.summary.totalTimeHours.high} hrs</div></div>
    <div class="stat"><div class="stat-label">Comfort</div><div class="stat-value">${plan.summary.comfortLift}</div></div>
    <div class="stat"><div class="stat-label">Confidence</div><div class="stat-value">${plan.summary.confidence}</div></div>
    <div class="stat"><div class="stat-label">Worth-It</div><div class="stat-value">${plan.worthItScore}</div></div>
  </div>

  <p style="font-size:11px;color:rgba(26,31,26,0.6);margin-top:32px">
    Alder Projects · ${cfg.productName} · This plan is saved at
    https://alderprojects.com/worth-it/dashboard/${plan.planCode}.
    Use Cmd/Ctrl+P → Save as PDF to capture this view as a file.
  </p>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
