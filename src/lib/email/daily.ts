/**
 * v7.4.17 — THE daily email. One send, four lenses, plus today's actions.
 *
 * Replaces three separate senders:
 *   - the autoeval scoreboard (EXEC / BACKEND / CFO)
 *   - the catalog daily digest (already flag-disabled, sections absorbed)
 *   - the every-15-minutes social reminder emails
 *
 * The four lenses answer four different questions, in the order you'd read
 * them when you open the mail at 5am:
 *
 *   EXEC          Is the business working, and what needs me today?
 *   CFO           Where is the money — in, out, and at risk?
 *   SEO/MARKETING Where is demand coming from, and is it growing?
 *   DATA ANALYST  Is the engine still honest and fast?
 *
 * WHY THIS ALSO UNBLOCKS DEPLOYS: the social reminders used to need a
 * every-15-minutes cron so an 8:45 prep and a 9:30 post could arrive
 * separately. Vercel rejected that schedule on this plan and EVERY build
 * failed from 2026-07-28 onward. Folding the reminders into this one daily
 * send removes the sub-daily cron, and the whole vercel.json becomes
 * daily/weekly again.
 *
 * The cost of that is real and deliberate: same-day reminders now all
 * arrive together in the morning rather than at their individual times.
 * Each still carries its own clock label so you can sequence your day.
 *
 * HONEST EMPTY STATES: a lens with no data source says so and names the
 * missing config. It never renders zeros that look like measurements.
 */

import { prisma } from '@/lib/db'
import { buildLayeredStats, type LayeredStats } from './layers'
import type { AutoEvalResult } from '@/lib/score/autoeval'
import { selectDue, SOCIAL_REMINDER_SENT, type SocialEntry } from '@/lib/social/reminders'
import { nearEmptyWarning } from '@/lib/social/reminders'
import { runnerAlerts, type RunnerResult } from '@/lib/cron/daily-runner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SeoStats {
  /** False when GSC has never been configured or has returned nothing. */
  configured: boolean
  reason: string | null
  impressions: number
  clicks: number
  ctrPct: number | null
  avgPosition: number | null
  aiOverviewLikelyPages: number
  topPages: Array<{ url: string; clicks: number; impressions: number; position: number }>
  /** Entry-point mix from VisitorSession.firstSource — always available. */
  sourceMix: Array<{ source: string; sessions: number; reports: number }>
}

export interface DailyActions {
  /** Reminders whose moment is today. */
  today: SocialEntry[]
  /** Reminders that slipped by more than a day while nothing was sending. */
  overdue: SocialEntry[]
  calendarWarning: string | null
}

export interface DailyEmail {
  sent: boolean
  skippedReason?: string
  subject?: string
  html?: string
  alerts: string[]
  /** Reminder ids this email delivered — the caller marks them sent. */
  deliveredReminderIds: string[]
}

// ---------------------------------------------------------------------------
// SEO / marketing lens
// ---------------------------------------------------------------------------

export async function buildSeoStats(from: Date, to: Date): Promise<SeoStats> {
  // Entry-point mix is derived from data we always have.
  const sessions = await prisma.visitorSession.groupBy({
    by: ['firstSource'],
    where: { firstSeenAt: { gte: from, lt: to } },
    _count: { _all: true },
  })
  const sourceMix = await Promise.all(
    sessions.map(async (s) => ({
      source: s.firstSource ?? '(direct)',
      sessions: s._count._all,
      reports: 0,
    }))
  )

  const rows = await prisma.gscPageStats.findMany({
    where: { windowEnd: { gte: from } },
    orderBy: { clicks: 'desc' },
    take: 200,
  })

  if (rows.length === 0) {
    const everSynced = await prisma.gscPageStats.count()
    return {
      configured: false,
      reason:
        everSynced === 0
          ? 'Search Console has never synced. Set GSC_SERVICE_ACCOUNT_JSON and GSC_SITE_URL on Vercel; /api/cron/gsc-sync runs Mondays.'
          : 'No Search Console rows in this window.',
      impressions: 0,
      clicks: 0,
      ctrPct: null,
      avgPosition: null,
      aiOverviewLikelyPages: 0,
      topPages: [],
      sourceMix,
    }
  }

  const impressions = rows.reduce((n, r) => n + r.impressions, 0)
  const clicks = rows.reduce((n, r) => n + r.clicks, 0)
  return {
    configured: true,
    reason: null,
    impressions,
    clicks,
    ctrPct: impressions > 0 ? (clicks / impressions) * 100 : null,
    avgPosition: rows.reduce((n, r) => n + r.avgPosition, 0) / rows.length,
    aiOverviewLikelyPages: rows.filter((r) => r.aiOverviewLikely).length,
    topPages: rows.slice(0, 5).map((r) => ({
      url: r.pageUrl,
      clicks: r.clicks,
      impressions: r.impressions,
      position: r.avgPosition,
    })),
    sourceMix,
  }
}

// ---------------------------------------------------------------------------
// Actions lens (the folded-in reminders)
// ---------------------------------------------------------------------------

/**
 * The briefing looks FORWARD a full day, not backward.
 *
 * The send is at 08:30 UTC (4:30am ET). Most reminders are scheduled for
 * working hours — the Aug 4 launch prep is 12:45 UTC. Selecting only what
 * is already past would have delivered that the NEXT morning, a day late,
 * which would have quietly broken the entire point of the consolidation.
 * One daily email must carry the day AHEAD.
 */
export const LOOKAHEAD_MS = 24 * 60 * 60 * 1000

export async function buildDailyActions(now: Date): Promise<DailyActions> {
  const rows = await prisma.eventLog.findMany({
    where: { eventType: SOCIAL_REMINDER_SENT },
    select: { subjectId: true },
  })
  const alreadySent = new Set(rows.map((r) => r.subjectId).filter((v): v is string => v != null))
  // Selecting with the clock advanced by the lookahead pulls in everything
  // that comes due before the next send. The >24h split inside selectDue
  // still separates genuinely-stale items into `overdue`.
  const { due, missed } = selectDue(new Date(now.getTime() + LOOKAHEAD_MS), alreadySent)
  return { today: due, overdue: missed, calendarWarning: nearEmptyWarning(now) }
}

// ---------------------------------------------------------------------------
// Compose
// ---------------------------------------------------------------------------

export async function buildDailyEmail(
  run: AutoEvalResult,
  now: Date = new Date(),
  runner?: RunnerResult
): Promise<DailyEmail> {
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const from = new Date(dayStart.getTime() - 24 * 3600 * 1000)

  const stats = await buildLayeredStats(from, dayStart)
  stats.backend.judgeCacheHits = run.judgeCacheHits
  stats.backend.judgeModelCalls = run.judgeModelCalls
  const seo = await buildSeoStats(from, dayStart)
  const actions = await buildDailyActions(now)

  const alerts = [...collectAlerts(stats, run, seo, actions), ...(runner ? runnerAlerts(runner) : [])]

  // The old scoreboard skipped sending on a zero-activity day. This one
  // still sends when there are ACTIONS to deliver — a reminder you need
  // this morning must not be suppressed because nobody uploaded a photo.
  const hasActivity =
    stats.exec.sessions > 0 ||
    stats.backend.photosUploaded > 0 ||
    run.judgeFlagsCreated > 0 ||
    run.autoRulesCreated > 0
  const hasActions = actions.today.length > 0 || actions.overdue.length > 0
  if (!hasActivity && !hasActions) {
    return { sent: false, skippedReason: 'no activity and no actions due', alerts: [], deliveredReminderIds: [] }
  }

  const sections = [
    renderActions(actions),
    renderExec(stats, run),
    renderCfo(stats),
    renderSeo(seo),
    renderAnalyst(stats, run),
    renderJobRun(runner),
  ]

  const subject = buildSubject(stats, actions, alerts, run.day)
  const deliveredReminderIds = [...actions.today, ...actions.overdue].map((e) => e.entryId)

  return { sent: true, subject, html: wrap(`Alder daily · ${run.day}`, sections, alerts), alerts, deliveredReminderIds }
}

function buildSubject(stats: LayeredStats, actions: DailyActions, alerts: string[], day: string): string {
  const bits: string[] = []
  const actionCount = actions.today.length + actions.overdue.length
  if (actionCount > 0) bits.push(`${actionCount} action${actionCount === 1 ? '' : 's'}`)
  if (alerts.length > 0) bits.push(`${alerts.length} alert${alerts.length === 1 ? '' : 's'}`)
  bits.push(`${stats.exec.sessions} session${stats.exec.sessions === 1 ? '' : 's'}`)
  return `Alder ${day} · ${bits.join(' · ')}`
}

function collectAlerts(stats: LayeredStats, run: AutoEvalResult, seo: SeoStats, actions: DailyActions): string[] {
  const a: string[] = []
  if (actions.overdue.length > 0) {
    a.push(`${actions.overdue.length} reminder${actions.overdue.length === 1 ? '' : 's'} overdue — nothing was sending`)
  }
  if ((stats.backend.suppressionRatePct ?? 0) > 15) a.push(`Suppression rate ${fmtPct(stats.backend.suppressionRatePct)}`)
  if (stats.backend.decodeFailureRate > 0.05) a.push(`Decode failures ${pct(stats.backend.decodeFailureRate)}`)
  if (stats.exec.sessions > 0 && (stats.backend.skipWaitSharePct ?? 100) < 20) {
    a.push(`SKIP+WAIT share ${fmtPct(stats.backend.skipWaitSharePct)} — honesty invariant thinning`)
  }
  if (run.judgeFlagsCreated > 0) a.push(`${run.judgeFlagsCreated} judge flag(s)`)
  // A day with real traffic and no Checks is the conversion alarm.
  if (stats.exec.sessions >= 10 && stats.exec.reportsDelivered === 0) {
    a.push(`${stats.exec.sessions} sessions, zero Checks delivered`)
  }
  if (!seo.configured && seo.reason?.startsWith('Search Console has never')) {
    a.push('Search Console never synced — acquisition is unmeasured')
  }
  if (actions.calendarWarning) a.push(actions.calendarWarning)
  return a
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

function renderActions(actions: DailyActions): string {
  if (actions.today.length === 0 && actions.overdue.length === 0) {
    return `${h1('Today')}<div style="${CARD}">Nothing scheduled today.</div>`
  }
  const block = (e: SocialEntry, late: boolean) => `
    <div style="${CARD}">
      <div style="font-weight:700;color:#1C2B1A;">${late ? 'OVERDUE · ' : ''}${esc(e.localLabel)} — ${esc(e.source)}</div>
      <div style="font-weight:600;margin:2px 0 6px;">${esc(e.title)}</div>
      <pre style="${PRE}">${esc(e.body)}</pre>
    </div>`
  return [
    h1('Today'),
    actions.overdue.length > 0
      ? `<p style="${MUTED}">These slipped while nothing was sending. Act on whatever is still useful.</p>` +
        actions.overdue.map((e) => block(e, true)).join('')
      : '',
    actions.today.map((e) => block(e, false)).join(''),
  ].join('')
}

function renderExec(stats: LayeredStats, run: AutoEvalResult): string {
  const e = stats.exec
  const trend =
    e.sessionsPrev7DayAvg > 0
      ? `${e.sessions >= e.sessionsPrev7DayAvg ? '▲' : '▼'} vs ${e.sessionsPrev7DayAvg.toFixed(1)}/day trailing 7d`
      : 'no prior week to compare'
  const f = stats.cfo.funnel
  const rows = [
    metricRow('Sessions', `${e.sessions} <span style="${MUTED_INLINE}">${trend}</span>`),
    metricRow('Checks delivered', String(e.reportsDelivered), e.sessions >= 10 && e.reportsDelivered === 0),
    metricRow('Session → Check', f.uploaded > 0 ? `${((e.reportsDelivered / f.uploaded) * 100).toFixed(0)}%` : '—'),
    metricRow('Photo changed the recommendation', e.killMetricPct != null ? fmtPct(e.killMetricPct) : '—'),
    metricRow('Review coverage', e.reviewCoveragePct != null ? fmtPct(e.reviewCoveragePct) : '—'),
  ]
  const attention = e.needsAttention.length
    ? `<div style="${CARD}"><strong>Needs you:</strong><div style="${MUTED}">${e.needsAttention.map(esc).join(' · ')}</div></div>`
    : `<div style="${CARD}">Nothing needs a decision today.</div>`
  const errs = run.errors.length ? `<div style="${CARD}"><strong>Job errors:</strong> ${run.errors.map(esc).join(' · ')}</div>` : ''
  return `${h1('Exec')}${table(rows)}${attention}${errs}`
}

function renderCfo(stats: LayeredStats): string {
  const c = stats.cfo
  const f = c.funnel
  const step = (a: number, b: number) => (a > 0 ? `${((b / a) * 100).toFixed(0)}%` : '—')
  const spend = c.visionCostUsd + c.estLlmCostUsd
  const margin = c.cartRevenueUsd > 0 ? `${(((c.cartRevenueUsd - spend) / c.cartRevenueUsd) * 100).toFixed(0)}%` : '—'
  const rows = [
    sectionRow('Funnel'),
    metricRow('Uploaded', String(f.uploaded)),
    metricRow('Result viewed', `${f.resultViewed} <span style="${MUTED_INLINE}">${step(f.uploaded, f.resultViewed)} of uploads</span>`),
    metricRow('Email captured', `${f.emailCaptured} <span style="${MUTED_INLINE}">${step(f.resultViewed, f.emailCaptured)} of views</span>`),
    metricRow('Smart Cart purchased', `${f.purchased} <span style="${MUTED_INLINE}">${step(f.emailCaptured, f.purchased)} of captures</span>`),
    sectionRow('Money'),
    metricRow('Smart Cart revenue', `$${c.cartRevenueUsd.toFixed(2)}`),
    metricRow('Affiliate clicks', String(c.affiliateClicks)),
    metricRow('Cost to run', `$${spend.toFixed(4)} <span style="${MUTED_INLINE}">vision $${c.visionCostUsd.toFixed(4)} · LLM $${c.estLlmCostUsd.toFixed(4)}</span>`),
    metricRow('Gross margin', margin),
    sectionRow('Commerce coverage'),
    metricRow('BUY items', String(c.buyItems)),
    metricRow(
      'Link coverage',
      c.buyItems > 0
        ? `${((((c.linkCoverage.ASIN + c.linkCoverage.SEARCH) / c.buyItems) * 100) || 0).toFixed(0)}% <span style="${MUTED_INLINE}">ASIN ${c.linkCoverage.ASIN} · SEARCH ${c.linkCoverage.SEARCH} · none ${c.linkCoverage.none}</span>`
        : '—'
    ),
  ]
  return `${h1('CFO')}${table(rows)}`
}

function renderSeo(seo: SeoStats): string {
  const mix = seo.sourceMix.length
    ? table([
        sectionRow('Entry points (24h)'),
        ...seo.sourceMix
          .sort((a, b) => b.sessions - a.sessions)
          .map((s) => metricRow(s.source, `${s.sessions} session${s.sessions === 1 ? '' : 's'}`)),
      ])
    : `<div style="${CARD}">No sessions in this window.</div>`

  if (!seo.configured) {
    return `${h1('SEO / Marketing')}
      <div style="${CARD}"><strong>Search Console: not reporting.</strong>
      <div style="${MUTED}">${esc(seo.reason ?? '')}</div></div>${mix}`
  }

  const rows = [
    sectionRow('Search Console'),
    metricRow('Impressions', String(seo.impressions)),
    metricRow('Clicks', String(seo.clicks)),
    metricRow('CTR', seo.ctrPct != null ? `${seo.ctrPct.toFixed(2)}%` : '—'),
    metricRow('Avg position', seo.avgPosition != null ? seo.avgPosition.toFixed(1) : '—'),
    metricRow('Pages likely summarized by AI Overviews', String(seo.aiOverviewLikelyPages), seo.aiOverviewLikelyPages > 0),
  ]
  const top = seo.topPages.length
    ? table([
        sectionRow('Top pages'),
        ...seo.topPages.map((p) =>
          metricRow(esc(p.url.replace(/^https?:\/\/[^/]+/, '')), `${p.clicks} clicks <span style="${MUTED_INLINE}">${p.impressions} impr · pos ${p.position.toFixed(1)}</span>`)
        ),
      ])
    : ''
  return `${h1('SEO / Marketing')}${table(rows)}${top}${mix}`
}

function renderAnalyst(stats: LayeredStats, run: AutoEvalResult): string {
  const b = stats.backend
  const rows = [
    sectionRow('Intake'),
    metricRow('Photos uploaded', String(b.photosUploaded)),
    metricRow('Upload failures', String(b.uploadFailures), b.uploadFailures > 0),
    metricRow('Decode failure rate', pct(b.decodeFailureRate), b.decodeFailureRate > 0.05),
    sectionRow('Extraction'),
    metricRow('Extractions', String(b.extractions)),
    metricRow('Mean confidence', b.meanExtractionConfidence != null ? b.meanExtractionConfidence.toFixed(3) : '—'),
    metricRow('Extraction failures', String(b.extractionFailures), b.extractionFailures > 0),
    sectionRow('Verdict honesty'),
    metricRow('Lane mix', Object.entries(b.laneMix).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'),
    metricRow('SKIP + WAIT share', fmtPct(b.skipWaitSharePct), (b.skipWaitSharePct ?? 100) < 20),
    metricRow('Grounding violations (suppressed)', String(b.groundingViolations), b.groundingViolations > 0),
    metricRow('Suppression rate', fmtPct(b.suppressionRatePct), (b.suppressionRatePct ?? 0) > 15),
    metricRow('Score p10 / p50 / p90', `${num(b.scoreP10)} / ${num(b.scoreP50)} / ${num(b.scoreP90)}`),
    sectionRow('Auto-eval'),
    metricRow('Judge flags', String(run.judgeFlagsCreated), run.judgeFlagsCreated > 0),
    metricRow('Judge cache hits / model calls', `${b.judgeCacheHits} / ${b.judgeModelCalls}`),
    metricRow('Auto-demotion rules', String(run.autoRulesCreated)),
    metricRow('Shadow drift', run.shadowDrift.ran ? `${run.shadowDrift.medianDrift?.toFixed(3) ?? '—'}${run.shadowDrift.flagged ? ' (flagged)' : ''}` : 'not run'),
    metricRow('Median pipeline time', b.medianPipelineMs != null ? `${(b.medianPipelineMs / 1000).toFixed(1)}s` : '—'),
  ]
  return `${h1('Data analyst')}${table(rows)}`
}

/**
 * What the one nightly job actually did. Every staggered cron that used to
 * run on its own schedule now reports here, including what it skipped —
 * a step that silently didn't run is the failure mode this block exists
 * to make impossible.
 */
function renderJobRun(runner?: RunnerResult): string {
  if (!runner) return ''
  const icon: Record<string, string> = {
    ok: '✓', failed: '✕', skipped_budget: '⏱', skipped_day: '·', skipped_flag: '·',
  }
  const rows = runner.steps.map((s) =>
    metricRow(
      `${icon[s.status] ?? '·'} ${esc(s.name)}`,
      `${esc(s.detail ?? s.status)}${s.ms > 0 ? ` <span style="${MUTED_INLINE}">${(s.ms / 1000).toFixed(1)}s</span>` : ''}`,
      s.status === 'failed'
    )
  )
  return `${h1('Job run')}${table([
    sectionRow('Nightly steps'),
    ...rows,
    sectionRow('Budget'),
    metricRow('Elapsed', `${(runner.elapsedMs / 1000).toFixed(1)}s of ${(runner.budgetMs / 1000).toFixed(0)}s`),
  ])}`
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

const H1 = 'font-size:17px;font-weight:700;margin:26px 0 8px;color:#1C2B1A;border-bottom:2px solid #1C2B1A;padding-bottom:4px;'
const TABLE = 'border-collapse:collapse;width:100%;font-size:13px;'
const CARD = 'background:#faf9f5;border:1px solid #e6e2d4;border-radius:6px;padding:9px 12px;margin:6px 0;font-size:13px;'
const MUTED = 'color:#777;font-size:12px;margin:3px 0 0;'
const MUTED_INLINE = 'color:#888;font-size:12px;'
const PRE = 'white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;background:#fff;border:1px solid #e6e2d4;border-radius:4px;padding:8px;margin:0;color:#222;'

function h1(t: string): string {
  return `<h2 style="${H1}">${esc(t)}</h2>`
}
function table(rows: string[]): string {
  return `<table style="${TABLE}">${rows.join('')}</table>`
}
function metricRow(label: string, value: string, alert = false): string {
  return `<tr><td style="padding:4px 8px 4px 0;color:#555;">${label}</td><td style="padding:4px 0;text-align:right;font-weight:600;color:${alert ? '#9b3f3f' : '#1C2B1A'};">${value}</td></tr>`
}
function sectionRow(label: string): string {
  return `<tr><td colspan="2" style="padding:12px 0 2px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#b08d2f;">${esc(label)}</td></tr>`
}
function wrap(title: string, sections: string[], alerts: string[]): string {
  const alertBlock = alerts.length
    ? `<div style="background:#fdf3f3;border:1px solid #e6cfcf;border-radius:6px;padding:10px 12px;margin:0 0 12px;">
         <strong style="color:#9b3f3f;">${alerts.length} alert${alerts.length === 1 ? '' : 's'}</strong>
         <ul style="margin:6px 0 0;padding-left:18px;color:#7a3333;font-size:13px;">${alerts.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
       </div>`
    : ''
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:680px;margin:0 auto;padding:18px;color:#222;">
    <h1 style="font-size:19px;margin:0 0 12px;color:#1C2B1A;">${esc(title)}</h1>
    ${alertBlock}${sections.join('')}
    <p style="${MUTED}">One email a day. Exec → CFO → SEO → Data. Reply with what you wish it said.</p>
  </div>`
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}
function fmtPct(n: number | null): string {
  return n == null ? '—' : `${n.toFixed(1)}%`
}
function num(n: number | null): string {
  return n == null ? '—' : n.toFixed(3)
}
