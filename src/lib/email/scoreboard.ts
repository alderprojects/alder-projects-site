/**
 * v7.4.9 §1.5.5 — the scoreboard digests. This is the ONE live email
 * system after this release; the legacy catalog sender is flag-disabled
 * (DISABLE_DIGEST_EMAIL) and its actionable sections are embedded here,
 * so one-click review tokens keep working and nothing is lost.
 *
 * Daily: yesterday's numbers, judge flags with admin deep links, auto
 * demotions with evidence, link coverage (v7.4.10). Sent ONLY when
 * yesterday had ≥1 session or any flag/auto-rule — a zero-activity day
 * sends nothing.
 *
 * Weekly (Mondays, the legacy slot): WoW deltas, auto-demotions with
 * evidence, top-3/bottom-3 scored items with deep links, judge-flag
 * queue count, drift watch. A quiet week still shows the proving
 * numbers — never "nothing to report".
 */

import { prisma } from '@/lib/db'
import { SCORING_CONFIG } from '@/lib/score/config'
import type { AutoEvalResult } from '@/lib/score/autoeval'
import { buildLayeredStats } from './layers'
import { nearEmptyWarning } from '@/lib/social/reminders'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alderprojects.com'

/** Absolute alarm thresholds; breached values render in alert styling. */
const ABS_THRESHOLDS = {
  groundingViolationRate: 0.1,
  suppressionRate: 0.15,
  decodeFailureRate: 0.05,
  skipWaitShareFloor: 0.2,
}
/** Relative drift alarm needs a minimum base to avoid small-number noise. */
const REL_DRIFT = 0.25
const REL_MIN_N = 5

export interface ScoreboardResult {
  sent: boolean
  skippedReason?: string
  subject?: string
  html?: string
  alerts: string[]
}

// ---------------------------------------------------------------------------
// Daily
// ---------------------------------------------------------------------------

export async function buildDailyScoreboard(run: AutoEvalResult): Promise<ScoreboardResult> {
  const now = new Date()
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const from = new Date(dayStart.getTime() - 24 * 3600 * 1000)
  const stats = await buildLayeredStats(from, dayStart)
  stats.backend.judgeCacheHits = run.judgeCacheHits
  stats.backend.judgeModelCalls = run.judgeModelCalls

  const hasActivity =
    stats.exec.sessions > 0 || stats.backend.photosUploaded > 0 || run.judgeFlagsCreated > 0 || run.autoRulesCreated > 0
  if (!hasActivity) {
    return { sent: false, skippedReason: 'zero-activity day (no sessions, no photos, no flags, no rules)', alerts: [] }
  }

  const alerts: string[] = []
  if ((stats.backend.suppressionRatePct ?? 0) > 15) alerts.push(`Suppression rate ${fmtPct(stats.backend.suppressionRatePct)}`)
  if (stats.backend.decodeFailureRate > 0.05) alerts.push(`Decode failures ${pct(stats.backend.decodeFailureRate)}`)
  if (stats.exec.sessions > 0 && (stats.backend.skipWaitSharePct ?? 100) < 20) {
    alerts.push(`SKIP+WAIT share ${fmtPct(stats.backend.skipWaitSharePct)} — honesty invariant thinning`)
  }
  if (run.judgeFlagsCreated > 0) alerts.push(`${run.judgeFlagsCreated} judge flag(s)`)
  // v7.4.15 — the social reminder cron no-ops silently once the calendar
  // runs out, so the digest is where that surfaces.
  const socialWarning = nearEmptyWarning(new Date())
  if (socialWarning) alerts.push(socialWarning)

  // ---------------- EXEC ----------------
  const e = stats.exec
  const trend =
    e.sessionsPrev7DayAvg > 0
      ? `${e.sessions >= e.sessionsPrev7DayAvg ? '▲' : '▼'} vs ${e.sessionsPrev7DayAvg.toFixed(1)}/day trailing 7d`
      : 'no prior week to compare'
  const execRows = [
    metricRow('Sessions', `${e.sessions} <span style="${MUTED_INLINE}">${trend}</span>`),
    metricRow(
      'Reports delivered',
      e.reportsDelivered === e.sessions
        ? String(e.reportsDelivered)
        : `${e.reportsDelivered} <span style="${MUTED_INLINE}">incl. since-deleted sessions (events are append-only)</span>`
    ),
    metricRow('Photo changed the recommendation', e.killMetricPct != null ? fmtPct(e.killMetricPct) : '— <span style="' + MUTED_INLINE + '">no dual-synthesis carts</span>'),
    metricRow('Review coverage', e.reviewCoveragePct != null ? fmtPct(e.reviewCoveragePct) : '—'),
  ]
  const attention = e.needsAttention.length
    ? `<div style="${CARD}"><strong>Needs you:</strong><div style="${MUTED}">${e.needsAttention.map(esc).join(' · ')}</div>
       <div style="${MUTED}"><a href="${BASE_URL}/admin/queue">review queue</a> · <a href="${BASE_URL}/admin/curation">curation rules</a></div></div>`
    : `<div style="${CARD}">Nothing needs a decision today.</div>`

  // ---------------- BACKEND ----------------
  const b = stats.backend
  const backendRows = [
    sectionRow('Photos'),
    metricRow('Uploaded', String(b.photosUploaded)),
    metricRow('Upload failures', b.uploadFailures === 0 ? '0' : `${b.uploadFailures} <span style="${MUTED_INLINE}">${Object.entries(b.uploadFailuresByStage).map(([k, v]) => `${k} ${v}`).join(' · ')}</span>`, b.uploadFailures > 0),
    metricRow('Decode failure rate', pct(b.decodeFailureRate), b.decodeFailureRate > 0.05),
    sectionRow('Extraction'),
    metricRow('Extractions', String(b.extractions)),
    metricRow('Mean confidence', b.meanExtractionConfidence != null ? b.meanExtractionConfidence.toFixed(3) : '—'),
    metricRow('Extraction failures', String(b.extractionFailures), b.extractionFailures > 0),
    sectionRow('Recommendation distribution'),
    metricRow('Lane mix', laneMix(b.laneMix)),
    metricRow('SKIP + WAIT share', fmtPct(b.skipWaitSharePct), (b.skipWaitSharePct ?? 100) < 20),
    sectionRow('Recommendation quality'),
    metricRow('Grounding violations (suppressed)', String(b.groundingViolations), b.groundingViolations > 0),
    metricRow('Suppression rate', fmtPct(b.suppressionRatePct), (b.suppressionRatePct ?? 0) > 15),
    metricRow('Score p10 / p50 / p90', `${num(b.scoreP10)} / ${num(b.scoreP50)} / ${num(b.scoreP90)}`),
    metricRow('Judge flags raised', String(b.judgeFlags), b.judgeFlags > 0),
    metricRow('Judge cache hits / model calls', `${b.judgeCacheHits} / ${b.judgeModelCalls}`),
    metricRow('Auto-demotion rules created', String(b.autoRules)),
    metricRow('Median pipeline time', b.medianPipelineMs != null ? `${(b.medianPipelineMs / 1000).toFixed(1)}s` : '—'),
  ]

  // ---------------- CFO ----------------
  const c = stats.cfo
  const f = c.funnel
  const step = (a: number, bb: number) => (a > 0 ? `${((bb / a) * 100).toFixed(0)}%` : '—')
  const cfoRows = [
    sectionRow('Funnel'),
    metricRow('Uploaded', String(f.uploaded)),
    metricRow('Result viewed', `${f.resultViewed} <span style="${MUTED_INLINE}">${step(f.uploaded, f.resultViewed)} of uploads</span>`),
    metricRow('Email captured', `${f.emailCaptured} <span style="${MUTED_INLINE}">${step(f.resultViewed, f.emailCaptured)} of views</span>`),
    metricRow('Smart Cart purchased', `${f.purchased} <span style="${MUTED_INLINE}">${step(f.emailCaptured, f.purchased)} of captures</span>`),
    sectionRow('Revenue'),
    metricRow('Smart Cart revenue', `$${c.cartRevenueUsd.toFixed(2)}`),
    metricRow('Affiliate clicks', c.affiliateClicks === 0 ? '0' : `${c.affiliateClicks} <span style="${MUTED_INLINE}">${Object.entries(c.affiliateClicksByLane).map(([k, v]) => `${k} ${v}`).join(' · ')}</span>`),
    sectionRow('Commerce coverage'),
    metricRow('BUY items', String(c.buyItems)),
    metricRow('Link coverage', c.buyItems > 0
      ? `${(((c.linkCoverage.ASIN + c.linkCoverage.SEARCH) / c.buyItems) * 100).toFixed(0)}% <span style="${MUTED_INLINE}">ASIN ${c.linkCoverage.ASIN} · SEARCH ${c.linkCoverage.SEARCH} · none ${c.linkCoverage.none}</span>`
      : '—'),
    sectionRow('Cost to run'),
    metricRow('Vision extraction', `$${c.visionCostUsd.toFixed(4)}`),
    metricRow('Report synthesis (est.)', `$${(c.estLlmCostUsd - c.visionCostUsd).toFixed(4)}`),
    metricRow('Total LLM spend', `$${c.estLlmCostUsd.toFixed(4)}`),
    metricRow('Gross margin', c.cartRevenueUsd > 0
      ? `$${(c.cartRevenueUsd - c.estLlmCostUsd).toFixed(2)}`
      : `–$${c.estLlmCostUsd.toFixed(4)} <span style="${MUTED_INLINE}">no cart sales yesterday</span>`),
  ]

  const sections: string[] = [
    `<h2 style="${H1L}">Exec</h2><p style="${MUTED}">Is the product working, and does anything need a decision?</p>
     ${attention}<table style="${TABLE}">${execRows.join('')}</table>`,
    `<h2 style="${H1L}">Backend</h2><p style="${MUTED}">Photos in, what the engine said, and how honest it was.</p>
     <table style="${TABLE}">${backendRows.join('')}</table>`,
    `<h2 style="${H1L}">CFO</h2><p style="${MUTED}">Funnel, revenue, coverage, and what the day cost.</p>
     <table style="${TABLE}">${cfoRows.join('')}</table>`,
  ]

  const newRules = await prisma.curationRule.findMany({
    where: { source: 'AUTOEVAL', revokedAt: null, createdAt: { gte: from } },
    select: { signature: true, reason: true },
  })
  if (newRules.length > 0) {
    sections.push(`<h2 style="${H2}">Auto-demotions applied (${newRules.length})</h2>
      <p style="${MUTED}">Demote-only, capped at ${SCORING_CONFIG.autoRule.maxNewRulesPerWeek}/week. Revoke at <a href="${BASE_URL}/admin/curation">/admin/curation</a>.</p>
      ${newRules.map((r) => `<div style="${CARD}"><code>${esc(r.signature)}</code><div style="${MUTED}">${esc(r.reason)}</div></div>`).join('')}`)
  }
  if (run.autoRulesBlockedByCap > 0) {
    sections.push(`<div style="${CARD}"><strong>${run.autoRulesBlockedByCap} finding(s) beyond the weekly cap</strong><div style="${MUTED}">Flagged, not acted on.</div></div>`)
  }

  const openFlags = await prisma.qAFlag.findMany({
    where: { createdBy: 'autoeval', report: { reviewedAt: null, deletedAt: null } },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { reportId: true, note: true },
  })
  if (openFlags.length > 0) {
    sections.push(`<h2 style="${H2}">Judge flags awaiting review (${openFlags.length})</h2>
      ${openFlags.map((x) => `<div style="${CARD}"><a href="${BASE_URL}/admin/session/${x.reportId}?queue=1">${x.reportId.slice(-8)}</a><div style="${MUTED}">${esc(x.note.slice(0, 220))}</div></div>`).join('')}`)
  }
  if (run.errors.length > 0) {
    sections.push(`<h2 style="${H2}">Run errors (${run.errors.length})</h2><div style="${CARD}">${run.errors.slice(0, 6).map(esc).join('<br/>')}</div>`)
  }

  const catalog = await buildEmbeddedCatalogSection()
  if (catalog) sections.push(catalog)

  const subject = alerts.length
    ? `Alder · ${alerts.length} alert${alerts.length === 1 ? '' : 's'} · ${e.sessions} session${e.sessions === 1 ? '' : 's'}`
    : `Alder · ${e.sessions} session${e.sessions === 1 ? '' : 's'} · $${c.cartRevenueUsd.toFixed(2)} · all clear`

  return { sent: true, subject, html: wrap(`Daily report · ${run.day}`, sections, alerts), alerts }
}

// ---------------------------------------------------------------------------
// Weekly
// ---------------------------------------------------------------------------

export async function buildWeeklyRollup(run: AutoEvalResult): Promise<ScoreboardResult> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 3600 * 1000)

  const [thisWeek, lastWeek] = await Promise.all([
    prisma.dailyEvalMetrics.findMany({ where: { day: { gte: weekAgo } } }),
    prisma.dailyEvalMetrics.findMany({ where: { day: { gte: twoWeeksAgo, lt: weekAgo } } }),
  ])

  const sum = (rows: typeof thisWeek, f: (r: (typeof thisWeek)[number]) => number) =>
    rows.reduce((s, r) => s + f(r), 0)
  const mean = (rows: typeof thisWeek, f: (r: (typeof thisWeek)[number]) => number) =>
    rows.length ? sum(rows, f) / rows.length : 0

  const alerts: string[] = []
  const wow = (label: string, cur: number, prev: number, minN = REL_MIN_N) => {
    if (prev <= 0 || cur + prev < minN) return `${fmt(cur)} <span style="${MUTED_INLINE}">(vs ${fmt(prev)})</span>`
    const delta = (cur - prev) / prev
    if (Math.abs(delta) > REL_DRIFT) alerts.push(`${label} moved ${(delta * 100).toFixed(0)}% WoW`)
    const arrow = delta > 0 ? '▲' : '▼'
    return `${fmt(cur)} <span style="${MUTED_INLINE}">${arrow} ${(Math.abs(delta) * 100).toFixed(0)}% WoW</span>`
  }

  const sessionsCur = sum(thisWeek, (r) => r.sessions)
  const sessionsPrev = sum(lastWeek, (r) => r.sessions)

  const rows = [
    metricRow('Sessions', wow('Sessions', sessionsCur, sessionsPrev)),
    metricRow('Grounding violation rate', wow('Grounding violations', mean(thisWeek, (r) => r.groundingViolationRate), mean(lastWeek, (r) => r.groundingViolationRate), 0)),
    metricRow('Suppression rate', wow('Suppression', mean(thisWeek, (r) => r.suppressionRate), mean(lastWeek, (r) => r.suppressionRate), 0)),
    metricRow('Median score', wow('Median score', mean(thisWeek, (r) => r.scoreP50 ?? 0), mean(lastWeek, (r) => r.scoreP50 ?? 0), 0)),
    metricRow('SKIP+WAIT share', wow('SKIP+WAIT share', mean(thisWeek, (r) => r.skipWaitShare), mean(lastWeek, (r) => r.skipWaitShare), 0)),
    metricRow('Judge flags created', wow('Judge flags', sum(thisWeek, (r) => r.judgeFlagsCreated), sum(lastWeek, (r) => r.judgeFlagsCreated))),
  ]

  // Top-3 / bottom-3 scored items this week, deep-linked.
  const scoredItems = await prisma.recommendation.findMany({
    where: { createdAt: { gte: weekAgo }, compositeScore: { not: null }, report: { deletedAt: null } },
    orderBy: { compositeScore: 'desc' },
    select: { reportId: true, title: true, verdict: true, compositeScore: true },
  })
  const top3 = scoredItems.slice(0, 3)
  const bottom3 = scoredItems.slice(-3).reverse()

  const itemList = (items: typeof top3) =>
    items
      .map(
        (i) =>
          `<div style="${CARD}"><a href="${BASE_URL}/admin/session/${i.reportId}">${esc(i.title)}</a> <span style="${MUTED_INLINE}">${i.verdict} · ${i.compositeScore?.toFixed(3)}</span></div>`
      )
      .join('') || `<div style="${MUTED}">No scored items this week.</div>`

  const activeRules = await prisma.curationRule.findMany({
    where: { revokedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { signature: true, reason: true, source: true, evidenceN: true },
  })
  const openFlagCount = await prisma.qAFlag.count({
    where: { createdBy: 'autoeval', report: { reviewedAt: null, deletedAt: null } },
  })

  const sections: string[] = [
    `<h2 style="${H2}">Week over week</h2><table style="${TABLE}">${rows.join('')}</table>`,
    `<h2 style="${H2}">Top 3 scored</h2>${itemList(top3)}`,
    `<h2 style="${H2}">Bottom 3 scored</h2>${itemList(bottom3)}`,
    `<h2 style="${H2}">Active curation rules (${activeRules.length})</h2>${
      activeRules.length
        ? activeRules
            .map((r) => `<div style="${CARD}"><code>${esc(r.signature)}</code> <span style="${MUTED_INLINE}">${r.source} · n=${r.evidenceN}</span><div style="${MUTED}">${esc(r.reason)}</div></div>`)
            .join('')
        : `<div style="${MUTED}">None active.</div>`
    }<p style="${MUTED}"><a href="${BASE_URL}/admin/curation">Manage at /admin/curation</a></p>`,
    `<h2 style="${H2}">Judge-flag queue</h2><div style="${CARD}">${openFlagCount} unreviewed session${openFlagCount === 1 ? '' : 's'} with an auto-eval flag · <a href="${BASE_URL}/admin/queue">open queue</a></div>`,
    `<h2 style="${H2}">Drift watch</h2><div style="${CARD}">${
      run.shadowDrift.ran
        ? run.shadowDrift.medianDrift == null
          ? 'Shadow re-score ran; no comparable sample yet.'
          : `Median composite drift ${(run.shadowDrift.medianDrift * 100).toFixed(1)}% vs served scores${run.shadowDrift.flagged ? ' — <strong>above the 15% threshold</strong>' : ' (within threshold)'}. Served output untouched.`
        : 'Shadow re-score runs Mondays.'
    }</div>`,
  ]

  if (run.shadowDrift.flagged) alerts.push('Shadow re-score drift above 15%')

  const catalog = await buildEmbeddedCatalogSection()
  if (catalog) sections.push(catalog)

  const subject = alerts.length
    ? `Alder weekly · ${alerts.length} alert${alerts.length === 1 ? '' : 's'} · ${sessionsCur} sessions`
    : `Alder weekly · ${sessionsCur} sessions · steady`

  return { sent: true, subject, html: wrap('Weekly rollup', sections, alerts), alerts }
}

// ---------------------------------------------------------------------------
// Legacy catalog content, embedded so exactly ONE email goes out
// ---------------------------------------------------------------------------

async function buildEmbeddedCatalogSection(): Promise<string | null> {
  const [changes, candidates] = await Promise.all([
    prisma.recommendationChange.count({ where: { status: 'pending_review' } }),
    prisma.catalogExpansionCandidate.count({ where: { status: 'pending_review' } }),
  ])
  if (changes === 0 && candidates === 0) return null
  return `<h2 style="${H2}">Catalog review</h2>
    <div style="${CARD}">${changes} price/availability change${changes === 1 ? '' : 's'} · ${candidates} expansion candidate${candidates === 1 ? '' : 's'} pending.
    <div style="${MUTED}">One-click approve/reject links are issued by the catalog digest, which is currently disabled (DISABLE_DIGEST_EMAIL). Review in the admin console.</div></div>`
}

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------

export async function sendScoreboard(result: ScoreboardResult): Promise<boolean> {
  if (!result.sent || !result.html || !result.subject) return false
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')
  const env = process.env.VERCEL_ENV === 'production' ? '' : '[STAGING] '
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL || 'Alder Read <alerts@alderprojects.com>',
      to: [process.env.ALERT_EMAIL || 'hello@alderprojects.com'],
      subject: `${env}${result.subject}`,
      html: result.html,
    }),
  })
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 200)}`)
  }
  return true
}

// ---------------------------------------------------------------------------
// Presentation helpers
// ---------------------------------------------------------------------------

const H1L = 'font-size:17px;font-weight:700;margin:26px 0 2px;color:#1C2B1A;border-bottom:2px solid #1C2B1A;padding-bottom:4px;'
const H2 = 'font-size:14px;font-weight:600;margin:22px 0 6px;color:#1C2B1A;'
const TABLE = 'border-collapse:collapse;width:100%;font-size:13px;'
const CARD = 'background:#faf9f5;border:1px solid #e6e2d4;border-radius:6px;padding:9px 12px;margin:6px 0;font-size:13px;'
const MUTED = 'color:#777;font-size:12px;margin:3px 0 0;'
const MUTED_INLINE = 'color:#888;font-size:12px;'

function metricRow(label: string, value: string, alert = false): string {
  return `<tr>
    <td style="padding:5px 8px;border-bottom:1px solid #eee;color:#555;">${label}</td>
    <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;${alert ? 'color:#a32d2d;' : ''}">${value}${alert ? ' ⚠' : ''}</td>
  </tr>`
}

function sectionRow(label: string): string {
  return `<tr><td colspan="2" style="padding:12px 8px 3px;font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#8a8a80;">${label}</td></tr>`
}
function fmtPct(v: number | null): string {
  return v == null ? '—' : `${v.toFixed(1)}%`
}
function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`
}
function num(v: number | null | undefined): string {
  return v == null ? '—' : v.toFixed(3)
}
function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(3)
}
function laneMix(json: unknown): string {
  if (!json || typeof json !== 'object') return '—'
  const m = json as Record<string, number>
  const entries = Object.entries(m)
  return entries.length ? entries.map(([k, v]) => `${k} ${v}`).join(' · ') : '—'
}
function linkCoverage(json: unknown): string {
  if (!json || typeof json !== 'object') return '—'
  const m = json as Record<string, number>
  return Object.entries(m).map(([k, v]) => `${k} ${v}`).join(' · ')
}
function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function wrap(title: string, sections: string[], alerts: string[]): string {
  const alertBlock = alerts.length
    ? `<div style="background:#fdeaea;border:1px solid #e4b8b8;border-radius:6px;padding:10px 12px;margin:12px 0;">
        <strong style="font-size:13px;color:#a32d2d;">${alerts.length} alert${alerts.length === 1 ? '' : 's'}</strong>
        <div style="${MUTED}">${alerts.map(esc).join('<br/>')}</div></div>`
    : `<div style="background:#eef4ec;border:1px solid #c7dcc0;border-radius:6px;padding:10px 12px;margin:12px 0;font-size:13px;color:#2d5a3d;">
        No threshold breaches. The numbers below are the proof, not a summary.</div>`

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:-apple-system,system-ui,'Segoe UI',Roboto,sans-serif;background:#f7f5f0;color:#1a1a1a;line-height:1.5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;">
<tr><td style="padding:22px 20px 4px;">
  <h1 style="margin:0 0 2px;font-size:18px;font-weight:600;">Alder Check · ${title}</h1>
  <p style="margin:0;font-size:12px;color:#777;">${new Date().toUTCString().slice(0, 16)} · <a href="${BASE_URL}/admin/dashboard">dashboard</a></p>
</td></tr>
<tr><td style="padding:0 20px;">${alertBlock}${sections.join('')}</td></tr>
<tr><td style="padding:14px 20px 22px;border-top:1px solid #e5e5e5;">
  <p style="margin:0;font-size:11px;color:#999;">Auto-eval cron · scores are frozen at synthesis and never recomputed. Curation rules demote only. To stop these emails set DISABLE_AUTOEVAL_EMAIL=true.</p>
</td></tr></table></body></html>`
}
