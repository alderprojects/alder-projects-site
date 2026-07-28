/**
 * v7.4.11 — the three-layer daily report.
 *
 * One email, three audiences, in the order you'd actually read them:
 *
 *   EXEC     Is the product working and does anything need me today?
 *   BACKEND  Photos in, extraction quality, what the engine recommended,
 *            and how honest those recommendations were.
 *   CFO      Funnel, conversion, revenue, affiliate coverage, and what
 *            the day cost to run.
 *
 * All windows are "yesterday UTC" with a 7-day trailing comparison, so
 * every number has a baseline next to it rather than sitting alone.
 */

import { prisma } from '@/lib/db'

const CART_PRICE_USD = 19.99

export interface LayeredStats {
  exec: {
    sessions: number
    sessionsPrev7DayAvg: number
    reportsDelivered: number
    reviewCoveragePct: number | null
    killMetricPct: number | null
    needsAttention: string[]
  }
  backend: {
    photosUploaded: number
    uploadFailures: number
    uploadFailuresByStage: Record<string, number>
    decodeFailureRate: number
    extractions: number
    meanExtractionConfidence: number | null
    extractionFailures: number
    laneMix: Record<string, number>
    skipWaitSharePct: number | null
    groundingViolations: number
    suppressionRatePct: number | null
    scoreP10: number | null
    scoreP50: number | null
    scoreP90: number | null
    judgeFlags: number
    judgeCacheHits: number
    judgeModelCalls: number
    autoRules: number
    medianPipelineMs: number | null
  }
  cfo: {
    funnel: { uploaded: number; resultViewed: number; emailCaptured: number; purchased: number }
    emailCaptureRatePct: number | null
    purchaseRatePct: number | null
    cartRevenueUsd: number
    buyItems: number
    linkCoverage: { ASIN: number; SEARCH: number; none: number }
    affiliateClicks: number
    affiliateClicksByLane: Record<string, number>
    visionCostUsd: number
    reportTokensOut: number
    estLlmCostUsd: number
  }
}

function pctOrNull(num: number, den: number): number | null {
  return den > 0 ? (num / den) * 100 : null
}

export async function buildLayeredStats(from: Date, to: Date): Promise<LayeredStats> {
  const prev7From = new Date(from.getTime() - 7 * 24 * 3600 * 1000)

  const [
    reports,
    prev7Reports,
    uploadEvents,
    failEvents,
    extractions,
    extractionFails,
    recs,
    suppressions,
    judgeFlags,
    autoRules,
    reviewedYday,
    carts,
    reportGenEvents,
    affiliateEvents,
    purchasedReports,
  ] = await Promise.all([
    prisma.report.findMany({
      where: { createdAt: { gte: from, lt: to }, deletedAt: null },
      select: { id: true, visitorAnonId: true, emailCapturedAt: true, status: true, reviewedAt: true },
    }),
    prisma.report.count({ where: { createdAt: { gte: prev7From, lt: from }, deletedAt: null } }),
    prisma.eventLog.count({ where: { eventType: { in: ['PHOTO_UPLOADED', 'PHOTO_REUSED'] }, occurredAt: { gte: from, lt: to } } }),
    prisma.eventLog.findMany({
      where: { eventType: 'UPLOAD_FAILED', occurredAt: { gte: from, lt: to } },
      select: { payloadJson: true },
    }),
    prisma.visionExtraction.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: { overallConfidence: true, apiCostCents: true },
    }),
    prisma.eventLog.count({ where: { eventType: 'VISION_EXTRACTION_FAILED', occurredAt: { gte: from, lt: to } } }),
    prisma.recommendation.findMany({
      where: { report: { createdAt: { gte: from, lt: to }, deletedAt: null } },
      select: { verdict: true, compositeScore: true, resolutionJson: true },
    }),
    prisma.eventLog.count({ where: { eventType: 'ITEM_SUPPRESSED_GROUNDING', occurredAt: { gte: from, lt: to } } }),
    prisma.qAFlag.count({ where: { createdBy: 'autoeval', createdAt: { gte: from, lt: to } } }),
    prisma.curationRule.count({ where: { source: 'AUTOEVAL', createdAt: { gte: from, lt: to } } }),
    prisma.report.count({ where: { createdAt: { gte: from, lt: to }, deletedAt: null, reviewedAt: { not: null } } }),
    prisma.smartCart.findMany({
      where: { createdAt: { gte: from, lt: to }, photoChangedRecommendation: { not: null } },
      select: { photoChangedRecommendation: true },
    }),
    prisma.eventLog.findMany({
      where: { eventType: 'REPORT_GENERATED', occurredAt: { gte: from, lt: to } },
      select: { payloadJson: true },
    }),
    prisma.eventLog.findMany({
      where: { eventType: 'AFFILIATE_CLICKED', occurredAt: { gte: from, lt: to } },
      select: { payloadJson: true },
    }),
    prisma.report.count({ where: { createdAt: { gte: from, lt: to }, deletedAt: null, status: 'CART_BUILT' } }),
  ])

  // ---- backend: uploads + extraction ----
  const uploadFailuresByStage: Record<string, number> = {}
  for (const f of failEvents) {
    const stage = (f.payloadJson as { stage?: string } | null)?.stage ?? 'unknown'
    uploadFailuresByStage[stage] = (uploadFailuresByStage[stage] ?? 0) + 1
  }
  const decodeFailures = uploadFailuresByStage['image_decode'] ?? 0
  const meanConf =
    extractions.length > 0
      ? extractions.reduce((s, e) => s + e.overallConfidence, 0) / extractions.length
      : null

  // ---- backend: distribution + quality ----
  const laneMix: Record<string, number> = {}
  for (const r of recs) laneMix[r.verdict] = (laneMix[r.verdict] ?? 0) + 1
  const skipWait = (laneMix.SKIP ?? 0) + (laneMix.WAIT ?? 0)
  const scores = recs.map((r) => r.compositeScore).filter((s): s is number => s != null).sort((a, b) => a - b)
  const pctl = (p: number) => (scores.length ? scores[Math.min(scores.length - 1, Math.floor(scores.length * p))] : null)
  const totalItems = recs.length + suppressions

  const pipelineMsValues = reportGenEvents
    .map((e) => (e.payloadJson as { totalMs?: number } | null)?.totalMs)
    .filter((n): n is number => typeof n === 'number')
    .sort((a, b) => a - b)

  // ---- cfo: funnel (anon-keyed within the day) ----
  const dayAnons = new Set(reports.map((r) => r.visitorAnonId).filter((a): a is string => a != null))
  const viewedRows = await prisma.eventLog.findMany({
    where: {
      eventType: { in: ['RESULT_VIEW_SECONDS', 'RECS_VIEWED'] },
      occurredAt: { gte: from, lt: to },
      anonId: { in: Array.from(dayAnons) },
    },
    select: { anonId: true },
    distinct: ['anonId'],
  })
  const emailCaptured = reports.filter((r) => r.emailCapturedAt != null).length

  // ---- cfo: link coverage + clicks ----
  const linkCoverage = { ASIN: 0, SEARCH: 0, none: 0 }
  let buyItems = 0
  for (const r of recs) {
    if (r.verdict !== 'BUY') continue
    buyItems++
    const mode = (r.resolutionJson as { resolutionMode?: string } | null)?.resolutionMode
    if (mode === 'ASIN') linkCoverage.ASIN++
    else if (mode === 'SEARCH') linkCoverage.SEARCH++
    else linkCoverage.none++
  }
  const affiliateClicksByLane: Record<string, number> = {}
  for (const c of affiliateEvents) {
    const lane = (c.payloadJson as { verdict?: string } | null)?.verdict ?? 'unknown'
    affiliateClicksByLane[lane] = (affiliateClicksByLane[lane] ?? 0) + 1
  }

  // ---- cfo: what the day cost ----
  const visionCents = extractions.reduce((s, e) => s + (e.apiCostCents ?? 0), 0)
  const tokensOut = reportGenEvents.reduce(
    (s, e) => s + ((e.payloadJson as { tokensOut?: number } | null)?.tokensOut ?? 0),
    0
  )
  const tokensIn = reportGenEvents.reduce(
    (s, e) => s + ((e.payloadJson as { tokensIn?: number } | null)?.tokensIn ?? 0),
    0
  )
  // Opus pricing at time of writing: $15/M in, $75/M out.
  const reportCostUsd = (tokensIn / 1_000_000) * 15 + (tokensOut / 1_000_000) * 75

  // ---- exec: what needs a human ----
  const needsAttention: string[] = []
  if (judgeFlags > 0) needsAttention.push(`${judgeFlags} session${judgeFlags === 1 ? '' : 's'} auto-flagged for review`)
  if (autoRules > 0) needsAttention.push(`${autoRules} auto-demotion rule${autoRules === 1 ? '' : 's'} created`)
  if (suppressions > 0) needsAttention.push(`${suppressions} item${suppressions === 1 ? '' : 's'} suppressed by the grounding gate`)
  const unreviewed = reports.length - reviewedYday
  if (unreviewed > 0) needsAttention.push(`${unreviewed} session${unreviewed === 1 ? '' : 's'} still unreviewed`)
  if (Object.keys(uploadFailuresByStage).length > 0) {
    needsAttention.push(`${failEvents.length} upload failure${failEvents.length === 1 ? '' : 's'}`)
  }

  return {
    exec: {
      sessions: reports.length,
      sessionsPrev7DayAvg: prev7Reports / 7,
      reportsDelivered: reportGenEvents.length,
      reviewCoveragePct: pctOrNull(reviewedYday, reports.length),
      killMetricPct: carts.length
        ? (carts.filter((c) => c.photoChangedRecommendation).length / carts.length) * 100
        : null,
      needsAttention,
    },
    backend: {
      photosUploaded: uploadEvents,
      uploadFailures: failEvents.length,
      uploadFailuresByStage,
      decodeFailureRate: uploadEvents + decodeFailures > 0 ? decodeFailures / (uploadEvents + decodeFailures) : 0,
      extractions: extractions.length,
      meanExtractionConfidence: meanConf,
      extractionFailures: extractionFails,
      laneMix,
      skipWaitSharePct: pctOrNull(skipWait, recs.length),
      groundingViolations: suppressions,
      suppressionRatePct: pctOrNull(suppressions, totalItems),
      scoreP10: pctl(0.1),
      scoreP50: pctl(0.5),
      scoreP90: pctl(0.9),
      judgeFlags,
      judgeCacheHits: 0, // filled by the caller from the run result
      judgeModelCalls: 0,
      autoRules,
      medianPipelineMs: pipelineMsValues.length
        ? pipelineMsValues[Math.floor(pipelineMsValues.length / 2)]
        : null,
    },
    cfo: {
      funnel: {
        uploaded: dayAnons.size,
        resultViewed: viewedRows.length,
        emailCaptured,
        purchased: purchasedReports,
      },
      emailCaptureRatePct: pctOrNull(emailCaptured, reports.length),
      purchaseRatePct: pctOrNull(purchasedReports, reports.length),
      cartRevenueUsd: purchasedReports * CART_PRICE_USD,
      buyItems,
      linkCoverage,
      affiliateClicks: affiliateEvents.length,
      affiliateClicksByLane,
      visionCostUsd: visionCents / 100,
      reportTokensOut: tokensOut,
      estLlmCostUsd: visionCents / 100 + reportCostUsd,
    },
  }
}
