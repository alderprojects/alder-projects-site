/**
 * v7.4.6 — Ops dashboard metrics. Direct SQL against Neon (no external
 * analytics dependency), 5-minute data cache per metric via
 * unstable_cache. Every fetcher also reports its own query wall time so
 * the p95-under-2s budget is observable from the dashboard itself
 * (rollup-cron debt triggers only on a recorded breach).
 *
 * All queries are read-only aggregates over EventLog (append-only, so
 * deletion-proof) plus the relational projections where the doc calls
 * for them (VisionExtraction confidence, SmartCart kill metric,
 * QAFlag/Report review rates).
 */

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

const WINDOW_30D = 30
const CACHE_SECONDS = 300

export interface Timed<T> {
  data: T
  queryMs: number
}

async function timed<T>(fn: () => Promise<T>): Promise<Timed<T>> {
  const t0 = Date.now()
  const data = await fn()
  return { data, queryMs: Date.now() - t0 }
}

function since(days: number): Date {
  return new Date(Date.now() - days * 24 * 3600 * 1000)
}

// ---------------------------------------------------------------------------
// 1. Daily upload volume (30d) + failure rate by error class
// ---------------------------------------------------------------------------

export interface UploadVolumePoint {
  day: string
  uploads: number
  failures: number
}

export const getUploadVolume = unstable_cache(
  async (): Promise<Timed<{ points: UploadVolumePoint[]; failuresByClass: Record<string, number>; failureRate: number }>> =>
    timed(async () => {
      const rows = await prisma.$queryRaw<{ day: Date; kind: string; n: bigint }[]>`
        SELECT date_trunc('day', "occurredAt") AS day,
               CASE WHEN "eventType" = 'UPLOAD_FAILED' THEN 'failure' ELSE 'upload' END AS kind,
               count(*) AS n
        FROM "EventLog"
        WHERE "eventType" IN ('PHOTO_UPLOADED', 'PHOTO_REUSED', 'UPLOAD_FAILED')
          AND "occurredAt" >= ${since(WINDOW_30D)}
        GROUP BY 1, 2 ORDER BY 1`
      const byDay = new Map<string, UploadVolumePoint>()
      for (const r of rows) {
        const day = r.day.toISOString().slice(0, 10)
        const p = byDay.get(day) ?? { day, uploads: 0, failures: 0 }
        if (r.kind === 'failure') p.failures += Number(r.n)
        else p.uploads += Number(r.n)
        byDay.set(day, p)
      }
      const classes = await prisma.$queryRaw<{ stage: string | null; n: bigint }[]>`
        SELECT "payloadJson"->>'stage' AS stage, count(*) AS n
        FROM "EventLog"
        WHERE "eventType" = 'UPLOAD_FAILED' AND "occurredAt" >= ${since(WINDOW_30D)}
        GROUP BY 1 ORDER BY 2 DESC`
      const failuresByClass: Record<string, number> = {}
      for (const c of classes) failuresByClass[c.stage ?? 'unknown'] = Number(c.n)
      const points = Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day))
      const totalUploads = points.reduce((s, p) => s + p.uploads, 0)
      const totalFailures = points.reduce((s, p) => s + p.failures, 0)
      const failureRate = totalUploads + totalFailures > 0 ? totalFailures / (totalUploads + totalFailures) : 0
      return { points, failuresByClass, failureRate }
    }),
  ['admin-metrics-upload-volume'],
  { revalidate: CACHE_SECONDS }
)

// ---------------------------------------------------------------------------
// 2. Extraction confidence histogram + error rate
// ---------------------------------------------------------------------------

export const getExtractionStats = unstable_cache(
  async (): Promise<Timed<{ histogram: number[]; total: number; errorRate: number }>> =>
    timed(async () => {
      const buckets = await prisma.$queryRaw<{ bucket: number; n: bigint }[]>`
        SELECT width_bucket("overallConfidence", 0, 1.0000001, 10) AS bucket, count(*) AS n
        FROM "VisionExtraction"
        WHERE "createdAt" >= ${since(WINDOW_30D)}
        GROUP BY 1 ORDER BY 1`
      const histogram = Array.from({ length: 10 }, () => 0)
      let total = 0
      for (const b of buckets) {
        const idx = Math.min(9, Math.max(0, Number(b.bucket) - 1))
        histogram[idx] += Number(b.n)
        total += Number(b.n)
      }
      const [completed, failed] = await Promise.all([
        prisma.eventLog.count({ where: { eventType: 'VISION_EXTRACTION_COMPLETED', occurredAt: { gte: since(WINDOW_30D) } } }),
        prisma.eventLog.count({ where: { eventType: 'VISION_EXTRACTION_FAILED', occurredAt: { gte: since(WINDOW_30D) } } }),
      ])
      return { histogram, total, errorRate: completed + failed > 0 ? failed / (completed + failed) : 0 }
    }),
  ['admin-metrics-extraction'],
  { revalidate: CACHE_SECONDS }
)

// ---------------------------------------------------------------------------
// 3. photoChangedRecommendation rate — THE kill metric (SmartCart dual
//    synthesis; weekly trend, all-time so the beta baseline stays visible)
// ---------------------------------------------------------------------------

export const getKillMetric = unstable_cache(
  async (): Promise<Timed<{ weekly: Array<{ week: string; changed: number; measured: number }>; overallRate: number | null }>> =>
    timed(async () => {
      const rows = await prisma.$queryRaw<{ week: Date; changed: bigint; measured: bigint }[]>`
        SELECT date_trunc('week', "createdAt") AS week,
               count(*) FILTER (WHERE "photoChangedRecommendation" = true) AS changed,
               count(*) FILTER (WHERE "photoChangedRecommendation" IS NOT NULL) AS measured
        FROM "SmartCart"
        GROUP BY 1 ORDER BY 1 DESC LIMIT 16`
      const weekly = rows
        .map((r) => ({ week: r.week.toISOString().slice(0, 10), changed: Number(r.changed), measured: Number(r.measured) }))
        .reverse()
      const changed = weekly.reduce((s, w) => s + w.changed, 0)
      const measured = weekly.reduce((s, w) => s + w.measured, 0)
      return { weekly, overallRate: measured > 0 ? changed / measured : null }
    }),
  ['admin-metrics-kill'],
  { revalidate: CACHE_SECONDS }
)

// ---------------------------------------------------------------------------
// 4. QA flag rates (per reviewed session, 30d)
// ---------------------------------------------------------------------------

export const getFlagRates = unstable_cache(
  async (): Promise<Timed<{ reviewed: number; hallucinationRate: number | null; extractionMissRate: number | null; flagCounts: Record<string, number> }>> =>
    timed(async () => {
      const reviewed = await prisma.report.count({
        where: { reviewedAt: { not: null, gte: since(WINDOW_30D) }, deletedAt: null },
      })
      const flags = await prisma.qAFlag.groupBy({
        by: ['type'],
        where: { createdAt: { gte: since(WINDOW_30D) } },
        _count: { _all: true },
      })
      const flagCounts: Record<string, number> = {}
      for (const f of flags) flagCounts[f.type] = f._count._all
      const rate = (t: string) => (reviewed > 0 ? (flagCounts[t] ?? 0) / reviewed : null)
      return {
        reviewed,
        hallucinationRate: rate('HALLUCINATION'),
        extractionMissRate: rate('EXTRACTION_MISS'),
        flagCounts,
      }
    }),
  ['admin-metrics-flags'],
  { revalidate: CACHE_SECONDS }
)

// ---------------------------------------------------------------------------
// 5. Lane distribution over time (weekly verdict shares)
// ---------------------------------------------------------------------------

export const getLaneDistribution = unstable_cache(
  async (): Promise<Timed<Array<{ week: string; lanes: Record<string, number> }>>> =>
    timed(async () => {
      const rows = await prisma.$queryRaw<{ week: Date; verdict: string; n: bigint }[]>`
        SELECT date_trunc('week', "createdAt") AS week, "verdict", count(*) AS n
        FROM "Recommendation"
        WHERE "createdAt" >= ${since(90)}
        GROUP BY 1, 2 ORDER BY 1`
      const byWeek = new Map<string, Record<string, number>>()
      for (const r of rows) {
        const week = r.week.toISOString().slice(0, 10)
        const lanes = byWeek.get(week) ?? {}
        lanes[r.verdict] = Number(r.n)
        byWeek.set(week, lanes)
      }
      return Array.from(byWeek.entries()).map(([week, lanes]) => ({ week, lanes }))
    }),
  ['admin-metrics-lanes'],
  { revalidate: CACHE_SECONDS }
)

// ---------------------------------------------------------------------------
// 6. Funnel (30d, anon-keyed, monotonic by construction: each stage is a
//    subset of the previous one)
// ---------------------------------------------------------------------------

export interface FunnelStages {
  uploaded: number
  resultViewed: number
  emailCaptured: number
  purchased: number
}

async function anonsFor(types: string[], windowDays: number): Promise<Set<string>> {
  const rows = await prisma.eventLog.findMany({
    where: { eventType: { in: types }, occurredAt: { gte: since(windowDays) }, anonId: { not: null } },
    select: { anonId: true },
    distinct: ['anonId'],
  })
  return new Set(rows.map((r) => r.anonId!).filter(Boolean))
}

export const getFunnel = unstable_cache(
  async (): Promise<Timed<FunnelStages>> =>
    timed(async () => {
      const [uploaded, viewed, email, paid] = await Promise.all([
        anonsFor(['PHOTO_UPLOADED', 'PHOTO_REUSED'], WINDOW_30D),
        anonsFor(['REPORT_GENERATED', 'RESULT_VIEW_SECONDS', 'RECS_VIEWED'], WINDOW_30D),
        anonsFor(['EMAIL_CAPTURED'], WINDOW_30D),
        anonsFor(['PHOTO_CART_PAID', 'SMARTCART_COMPLETED'], WINDOW_30D),
      ])
      const stage2 = new Set(Array.from(uploaded).filter((a) => viewed.has(a)))
      const stage3 = new Set(Array.from(stage2).filter((a) => email.has(a)))
      const stage4 = new Set(Array.from(stage3).filter((a) => paid.has(a)))
      return {
        uploaded: uploaded.size,
        resultViewed: stage2.size,
        emailCaptured: stage3.size,
        purchased: stage4.size,
      }
    }),
  ['admin-metrics-funnel'],
  { revalidate: CACHE_SECONDS }
)

// ---------------------------------------------------------------------------
// 7. RESULT_VIEW_SECONDS distribution + RESULT_SECTION_ENGAGEMENT rollup
//    (the v7.5 tier-decision pair — surfaced prominently)
// ---------------------------------------------------------------------------

const VIEW_SECONDS_BUCKETS = [10, 30, 60, 120, 300] as const // upper bounds; last bucket = 300+

export const getResultEngagement = unstable_cache(
  async (): Promise<
    Timed<{
      viewSeconds: { buckets: number[]; labels: string[]; count: number; median: number | null }
      sections: Array<{ section: string; count: number }>
      viewEvents: number
    }>
  > =>
    timed(async () => {
      const secondsRows = await prisma.$queryRaw<{ s: number | null }[]>`
        SELECT NULLIF("payloadJson"->>'secondsOnPage', '')::int AS s
        FROM "EventLog"
        WHERE "eventType" = 'RESULT_VIEW_SECONDS' AND "occurredAt" >= ${since(WINDOW_30D)}`
      const values = secondsRows.map((r) => r.s).filter((s): s is number => s != null && s >= 0)
      const buckets = Array.from({ length: VIEW_SECONDS_BUCKETS.length + 1 }, () => 0)
      for (const v of values) {
        const idx = VIEW_SECONDS_BUCKETS.findIndex((ub) => v < ub)
        buckets[idx === -1 ? VIEW_SECONDS_BUCKETS.length : idx]++
      }
      const labels = ['<10s', '10–30s', '30–60s', '1–2m', '2–5m', '5m+']
      const sorted = [...values].sort((a, b) => a - b)
      const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null

      const sectionRows = await prisma.$queryRaw<{ section: string | null; n: bigint }[]>`
        SELECT "payloadJson"->>'section' AS section, count(*) AS n
        FROM "EventLog"
        WHERE "eventType" = 'RESULT_SECTION_ENGAGEMENT' AND "occurredAt" >= ${since(WINDOW_30D)}
        GROUP BY 1 ORDER BY 2 DESC`
      return {
        viewSeconds: { buckets, labels, count: values.length, median },
        sections: sectionRows.map((r) => ({ section: r.section ?? 'unknown', count: Number(r.n) })),
        viewEvents: values.length,
      }
    }),
  ['admin-metrics-engagement'],
  { revalidate: CACHE_SECONDS }
)

// ---------------------------------------------------------------------------
// 8. Review coverage (% of last-7-day sessions reviewed)
// ---------------------------------------------------------------------------

export const getReviewCoverage = unstable_cache(
  async (): Promise<Timed<{ total: number; reviewed: number; unreviewedAllTime: number }>> =>
    timed(async () => {
      const [total, reviewed, unreviewedAllTime] = await Promise.all([
        prisma.report.count({ where: { createdAt: { gte: since(7) }, deletedAt: null } }),
        prisma.report.count({ where: { createdAt: { gte: since(7) }, deletedAt: null, reviewedAt: { not: null } } }),
        prisma.report.count({ where: { deletedAt: null, reviewedAt: null } }),
      ])
      return { total, reviewed, unreviewedAllTime }
    }),
  ['admin-metrics-review-coverage'],
  { revalidate: CACHE_SECONDS }
)
