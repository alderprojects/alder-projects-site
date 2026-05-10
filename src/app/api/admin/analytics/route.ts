// v7.2.13 — Admin analytics view. Aggregates buyer event log into
// HTML tables. Single internal user. No fancy dashboard tooling.

import { NextResponse } from 'next/server'
import { getEventsForRange, aggregateEvents } from '@/lib/buyer-events'

export const dynamic = 'force-dynamic'

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_REFUND_TOKEN
  if (!expected) return false
  const url = new URL(req.url)
  if (url.searchParams.get('adminToken') === expected) return true
  if (req.headers.get('authorization') === `Bearer ${expected}`) return true
  return false
}

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nMonthsAgo(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const fromMonth = url.searchParams.get('from') ?? nMonthsAgo(6)
  const toMonth = url.searchParams.get('to') ?? currentMonth()
  const format = url.searchParams.get('format') ?? 'html'
  const tokenForLinks = url.searchParams.get('adminToken') ?? ''

  const events = await getEventsForRange(fromMonth, toMonth)
  const stats = aggregateEvents(events)

  if (format === 'json') {
    return NextResponse.json({
      stats,
      range: { fromMonth, toMonth },
      eventCount: events.length,
    })
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Alder analytics · ${fromMonth} to ${toMonth}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; max-width: 1100px; margin: 2rem auto; padding: 0 1rem; color: #1a1f1a; background: #fbf8f1; }
  h1 { font-family: ui-serif, Georgia, serif; font-size: 1.75rem; margin-bottom: .25rem; }
  .meta { color: #666; font-size: .9rem; margin-bottom: 2rem; }
  h2 { font-family: ui-serif, Georgia, serif; font-size: 1.25rem; margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #e8e3d4; }
  table { width: 100%; border-collapse: collapse; margin: .5rem 0 1.5rem; background: white; border: 1px solid #e8e3d4; border-radius: 6px; overflow: hidden; }
  th, td { padding: .5rem .75rem; text-align: left; border-bottom: 1px solid #f0ead8; font-size: .9rem; }
  th { background: #f5efe2; font-weight: 600; }
  tr:last-child td { border-bottom: 0; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .topline { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
  .stat { background: white; border: 1px solid #e8e3d4; padding: .75rem 1rem; border-radius: 6px; }
  .stat-label { font-size: .75rem; color: #666; text-transform: uppercase; letter-spacing: .05em; }
  .stat-value { font-family: ui-serif, Georgia, serif; font-size: 1.5rem; }
  .controls { background: white; border: 1px solid #e8e3d4; padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: .9rem; }
  .empty { color: #999; font-style: italic; padding: 1rem; }
</style>
</head>
<body>
<h1>Smart Cart analytics</h1>
<div class="meta">Range: ${fromMonth} → ${toMonth} · ${events.length} events</div>

<div class="controls">
  Range: <a href="?adminToken=${tokenForLinks}&from=${nMonthsAgo(1)}&to=${currentMonth()}">last 1mo</a>
  · <a href="?adminToken=${tokenForLinks}&from=${nMonthsAgo(3)}&to=${currentMonth()}">3mo</a>
  · <a href="?adminToken=${tokenForLinks}&from=${nMonthsAgo(6)}&to=${currentMonth()}">6mo</a>
  · <a href="?adminToken=${tokenForLinks}&from=${nMonthsAgo(12)}&to=${currentMonth()}">12mo</a>
  · <a href="?adminToken=${tokenForLinks}&from=${fromMonth}&to=${toMonth}&format=json">json</a>
</div>

<div class="topline">
  <div class="stat"><div class="stat-label">Total carts</div><div class="stat-value">${fmt(stats.totalCarts)}</div></div>
  <div class="stat"><div class="stat-label">Revenue</div><div class="stat-value">${fmtUsd(stats.totalRevenue)}</div></div>
  <div class="stat"><div class="stat-label">Refund rate</div><div class="stat-value">${fmtPct(stats.refundRate)}</div></div>
  <div class="stat"><div class="stat-label">Unique buyers</div><div class="stat-value">${fmt(stats.uniqueBuyers)}</div></div>
</div>

<h2>By month</h2>
${renderByMonthTable(stats)}

<h2>By topic</h2>
${renderByTopicTable(stats)}

<h2>By scope variant</h2>
${renderByScopeTable(stats)}

<h2>By traffic source (UTM)</h2>
${renderByUtmTable(stats)}

<h2>Refund reasons</h2>
${renderRefundReasons(stats)}

<h2>Top towns / addresses</h2>
${renderTopTowns(stats)}

<h2>Repeat buyers</h2>
<p>${fmt(stats.repeatBuyers)} of ${fmt(stats.uniqueBuyers)} unique buyers (${
    stats.uniqueBuyers === 0 ? '0%' : fmtPct(stats.repeatBuyers / stats.uniqueBuyers)
  }) bought more than one cart in this window.</p>

</body></html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function renderByMonthTable(stats: {
  byMonth: Record<string, { count: number; revenue: number; refunded: number }>
}): string {
  const rows = Object.entries(stats.byMonth).sort((a, b) => a[0].localeCompare(b[0]))
  if (rows.length === 0) return '<div class="empty">No data in range.</div>'
  return `<table>
<thead><tr><th>Month</th><th class="num">Carts</th><th class="num">Revenue</th><th class="num">Refunded</th><th class="num">Refund rate</th></tr></thead>
<tbody>${rows
    .map(
      ([month, s]) =>
        `<tr><td>${month}</td><td class="num">${fmt(s.count)}</td><td class="num">${fmtUsd(s.revenue)}</td><td class="num">${fmt(s.refunded)}</td><td class="num">${s.count === 0 ? '—' : fmtPct(s.refunded / s.count)}</td></tr>`,
    )
    .join('')}
</tbody></table>`
}

function renderByTopicTable(stats: {
  byTopic: Record<string, { count: number; revenue: number; refunded: number }>
}): string {
  const rows = Object.entries(stats.byTopic).sort((a, b) => b[1].count - a[1].count)
  if (rows.length === 0) return '<div class="empty">No data in range.</div>'
  return `<table>
<thead><tr><th>Topic</th><th class="num">Carts</th><th class="num">Revenue</th><th class="num">Refunded</th><th class="num">Refund rate</th></tr></thead>
<tbody>${rows
    .map(
      ([topic, s]) =>
        `<tr><td>${topic}</td><td class="num">${fmt(s.count)}</td><td class="num">${fmtUsd(s.revenue)}</td><td class="num">${fmt(s.refunded)}</td><td class="num">${s.count === 0 ? '—' : fmtPct(s.refunded / s.count)}</td></tr>`,
    )
    .join('')}
</tbody></table>`
}

function renderByScopeTable(stats: {
  byScope: Record<string, { count: number; revenue: number; refunded: number }>
}): string {
  const rows = Object.entries(stats.byScope).sort((a, b) => b[1].count - a[1].count).slice(0, 30)
  if (rows.length === 0) return '<div class="empty">No data in range.</div>'
  return `<table>
<thead><tr><th>Scope variant</th><th class="num">Carts</th><th class="num">Revenue</th><th class="num">Refunded</th><th class="num">Refund rate</th></tr></thead>
<tbody>${rows
    .map(
      ([scope, s]) =>
        `<tr><td>${scope}</td><td class="num">${fmt(s.count)}</td><td class="num">${fmtUsd(s.revenue)}</td><td class="num">${fmt(s.refunded)}</td><td class="num">${s.count === 0 ? '—' : fmtPct(s.refunded / s.count)}</td></tr>`,
    )
    .join('')}
</tbody></table>`
}

function renderByUtmTable(stats: {
  byUtmSource: Record<string, { count: number; revenue: number }>
}): string {
  const rows = Object.entries(stats.byUtmSource).sort((a, b) => b[1].count - a[1].count)
  if (rows.length === 0) return '<div class="empty">No data in range.</div>'
  return `<table>
<thead><tr><th>UTM source</th><th class="num">Carts</th><th class="num">Revenue</th><th class="num">Avg fee</th></tr></thead>
<tbody>${rows
    .map(
      ([source, s]) =>
        `<tr><td>${source}</td><td class="num">${fmt(s.count)}</td><td class="num">${fmtUsd(s.revenue)}</td><td class="num">${s.count === 0 ? '—' : fmtUsd(s.revenue / s.count)}</td></tr>`,
    )
    .join('')}
</tbody></table>`
}

function renderRefundReasons(stats: { refundReasons: Record<string, number> }): string {
  const rows = Object.entries(stats.refundReasons).sort((a, b) => b[1] - a[1])
  if (rows.length === 0) return '<div class="empty">No refunds in range.</div>'
  return `<table>
<thead><tr><th>Reason</th><th class="num">Count</th></tr></thead>
<tbody>${rows
    .map(([reason, count]) => `<tr><td>${reason}</td><td class="num">${fmt(count)}</td></tr>`)
    .join('')}
</tbody></table>`
}

function renderTopTowns(stats: { topTowns: Array<{ town: string; count: number }> }): string {
  if (stats.topTowns.length === 0) return '<div class="empty">No data.</div>'
  return `<table>
<thead><tr><th>Town / address</th><th class="num">Carts</th></tr></thead>
<tbody>${stats.topTowns
    .map(t => `<tr><td>${t.town}</td><td class="num">${fmt(t.count)}</td></tr>`)
    .join('')}
</tbody></table>`
}
