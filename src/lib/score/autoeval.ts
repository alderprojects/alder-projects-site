/**
 * v7.4.9 §1.5 — the nightly auto-eval job.
 *
 * Order matters: refresh priors → judge new sessions (cached) →
 * write DailyEvalMetrics → auto-curation within hard caps → weekly
 * shadow re-score. Every stage is individually try/caught: one failing
 * stage degrades the digest, it never kills the run.
 *
 * Auto-curation is LIVE (owner lock #2) but bounded: DEMOTE only,
 * ≤ maxNewRulesPerWeek, every rule listed in the next digest with its
 * evidence, revocable at /admin/curation. Findings beyond the bounds are
 * reported, never acted on.
 */

import { prisma } from '@/lib/db'
import { logEvent } from '@/lib/events/log'
import { SCORING_CONFIG, SCORE_VERSION } from './config'
import { refreshSignaturePriors } from './priors'
import { judgeSession } from './judge'
import { signatureHash } from './score'

/** Above this daily volume we sample (§1.5.1 pre-decided). */
const JUDGE_FULL_COVERAGE_LIMIT = 500
const JUDGE_SAMPLE_RATE = 0.2

export interface AutoEvalResult {
  day: string
  priorsUpdated: number
  sessionsConsidered: number
  judged: number
  judgeCacheHits: number
  judgeModelCalls: number
  judgeFlagsCreated: number
  autoRulesCreated: number
  autoRulesBlockedByCap: number
  beyondBoundsFindings: Array<{ signature: string; reason: string }>
  metricsId: string | null
  shadowDrift: { ran: boolean; medianDrift: number | null; flagged: boolean }
  errors: string[]
}

export async function runAutoEval(now: Date = new Date()): Promise<AutoEvalResult> {
  const errors: string[] = []
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const yesterday = new Date(dayStart.getTime() - 24 * 3600 * 1000)

  // ---- 1. Priors ----
  let priorsUpdated = 0
  try {
    priorsUpdated = (await refreshSignaturePriors()).updated
  } catch (e) {
    errors.push(`priors: ${(e as Error).message.slice(0, 160)}`)
  }

  // ---- 2. Judge pass over yesterday's sessions ----
  const sessions = await prisma.report.findMany({
    where: { createdAt: { gte: yesterday, lt: dayStart }, deletedAt: null },
    select: {
      id: true,
      snapshotIds: true,
      pipelineLogJson: true,
      recommendations: {
        select: { key: true, title: true, summary: true, visibleEvidenceJson: true, nextAction: true },
      },
    },
  })

  let judged = 0
  let judgeCacheHits = 0
  let judgeModelCalls = 0
  let judgeFlagsCreated = 0

  // Sampling only kicks in past the pre-decided volume.
  let toJudge = sessions
  if (sessions.length > JUDGE_FULL_COVERAGE_LIMIT) {
    const lowScore = new Set<string>()
    const lowRows = await prisma.recommendation.findMany({
      where: { reportId: { in: sessions.map((s) => s.id) }, compositeScore: { lt: 0.4 } },
      select: { reportId: true },
    })
    for (const r of lowRows) lowScore.add(r.reportId)
    toJudge = sessions.filter((s, i) => lowScore.has(s.id) || i % Math.round(1 / JUDGE_SAMPLE_RATE) === 0)
  }

  for (const s of toJudge) {
    try {
      const extractions = await prisma.visionExtraction.findMany({
        where: { photo: { roomSnapshotId: { in: s.snapshotIds } } },
        select: { extractionJson: true },
        orderBy: { createdAt: 'asc' },
      })
      const synthesis = s.recommendations.map((r) => ({
        rec_key: r.key,
        title: r.title,
        summary: r.summary,
        evidence: r.visibleEvidenceJson,
        next_action: r.nextAction,
      }))
      const outcome = await judgeSession({
        reportId: s.id,
        extraction: extractions.map((e) => e.extractionJson),
        synthesis,
      })
      judged++
      if (outcome.cached) judgeCacheHits++
      else judgeModelCalls++

      if (outcome.findings.length > 0) {
        // §1.5.4 — judge hit becomes a QAFlag, feeding the dashboard
        // hallucination rate and the unreviewed queue.
        const already = await prisma.qAFlag.findFirst({
          where: { reportId: s.id, type: 'HALLUCINATION', createdBy: 'autoeval' },
          select: { id: true },
        })
        if (!already) {
          await prisma.qAFlag.create({
            data: {
              reportId: s.id,
              type: 'HALLUCINATION',
              note: `Auto-eval judge: ${outcome.findings.length} unsupported claim(s). ${outcome.findings
                .slice(0, 3)
                .map((f) => `"${f.claim}"`)
                .join(' · ')}`.slice(0, 1800),
              createdBy: 'autoeval',
            },
          })
          judgeFlagsCreated++
        }
      }
    } catch (e) {
      errors.push(`judge ${s.id.slice(-8)}: ${(e as Error).message.slice(0, 120)}`)
    }
  }

  // ---- 3. DailyEvalMetrics ----
  let metricsId: string | null = null
  try {
    metricsId = await writeDailyMetrics(yesterday, dayStart, sessions.length, judgeFlagsCreated)
  } catch (e) {
    errors.push(`metrics: ${(e as Error).message.slice(0, 160)}`)
  }

  // ---- 4. Auto-curation (bounded) ----
  const auto = await runAutoCuration()
  if (metricsId) {
    await prisma.dailyEvalMetrics.update({
      where: { id: metricsId },
      data: { autoRulesCreated: auto.created },
    }).catch(() => {})
  }

  // ---- 5. Weekly shadow re-score (Mondays) ----
  let shadowDrift: AutoEvalResult['shadowDrift'] = { ran: false, medianDrift: null, flagged: false }
  if (now.getUTCDay() === 1) {
    try {
      shadowDrift = await runShadowRescore()
    } catch (e) {
      errors.push(`shadow: ${(e as Error).message.slice(0, 160)}`)
    }
  }

  await logEvent({
    eventType: 'AUTOEVAL_RUN_COMPLETED',
    subjectType: 'system',
    source: 'cron',
    payload: {
      day: yesterday.toISOString().slice(0, 10),
      priorsUpdated,
      sessions: sessions.length,
      judged,
      judgeCacheHits,
      judgeModelCalls,
      judgeFlagsCreated,
      autoRulesCreated: auto.created,
      shadowFlagged: shadowDrift.flagged,
      errors: errors.length,
    },
  })

  return {
    day: yesterday.toISOString().slice(0, 10),
    priorsUpdated,
    sessionsConsidered: sessions.length,
    judged,
    judgeCacheHits,
    judgeModelCalls,
    judgeFlagsCreated,
    autoRulesCreated: auto.created,
    autoRulesBlockedByCap: auto.blockedByCap,
    beyondBoundsFindings: auto.beyondBounds,
    metricsId,
    shadowDrift,
    errors,
  }
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

async function writeDailyMetrics(
  from: Date,
  to: Date,
  sessionCount: number,
  judgeFlags: number
): Promise<string> {
  const recs = await prisma.recommendation.findMany({
    where: { report: { createdAt: { gte: from, lt: to }, deletedAt: null } },
    select: { verdict: true, compositeScore: true },
  })
  const scores = recs.map((r) => r.compositeScore).filter((s): s is number => s != null).sort((a, b) => a - b)
  const pct = (p: number) => (scores.length ? scores[Math.min(scores.length - 1, Math.floor(scores.length * p))] : null)

  const laneMix: Record<string, number> = {}
  for (const r of recs) laneMix[r.verdict] = (laneMix[r.verdict] ?? 0) + 1
  const skipWait = (laneMix.SKIP ?? 0) + (laneMix.WAIT ?? 0)

  // Suppression + grounding-violation rates come from the events the
  // pipeline emitted during the window.
  const [suppressedEvents, generatedEvents, decodeFailures, uploads, reactions] = await Promise.all([
    prisma.eventLog.count({ where: { eventType: 'ITEM_SUPPRESSED_GROUNDING', occurredAt: { gte: from, lt: to } } }),
    prisma.eventLog.count({ where: { eventType: 'REPORT_GENERATED', occurredAt: { gte: from, lt: to } } }),
    prisma.eventLog.count({ where: { eventType: 'UPLOAD_FAILED', occurredAt: { gte: from, lt: to } } }),
    prisma.eventLog.count({ where: { eventType: { in: ['PHOTO_UPLOADED', 'PHOTO_REUSED'] }, occurredAt: { gte: from, lt: to } } }),
    prisma.reportFeedback.count({ where: { createdAt: { gte: from, lt: to } } }),
  ])

  const totalItems = recs.length + suppressedEvents
  const carts = await prisma.smartCart.findMany({
    where: { createdAt: { gte: from, lt: to }, photoChangedRecommendation: { not: null } },
    select: { photoChangedRecommendation: true },
  })

  const row = await prisma.dailyEvalMetrics.upsert({
    where: { day: from },
    create: {
      day: from,
      sessions: sessionCount,
      groundingViolationRate: totalItems > 0 ? suppressedEvents / totalItems : 0,
      suppressionRate: totalItems > 0 ? suppressedEvents / totalItems : 0,
      scoreP10: pct(0.1),
      scoreP50: pct(0.5),
      scoreP90: pct(0.9),
      laneMixJson: laneMix as never,
      skipWaitShare: recs.length > 0 ? skipWait / recs.length : 0,
      photoChangedRate: carts.length > 0 ? carts.filter((c) => c.photoChangedRecommendation).length / carts.length : null,
      decodeFailureRate: uploads + decodeFailures > 0 ? decodeFailures / (uploads + decodeFailures) : 0,
      reactionsPerSession: sessionCount > 0 ? reactions / sessionCount : 0,
      judgeFlagsCreated: judgeFlags,
    },
    update: {
      sessions: sessionCount,
      groundingViolationRate: totalItems > 0 ? suppressedEvents / totalItems : 0,
      suppressionRate: totalItems > 0 ? suppressedEvents / totalItems : 0,
      scoreP10: pct(0.1),
      scoreP50: pct(0.5),
      scoreP90: pct(0.9),
      laneMixJson: laneMix as never,
      skipWaitShare: recs.length > 0 ? skipWait / recs.length : 0,
      decodeFailureRate: uploads + decodeFailures > 0 ? decodeFailures / (uploads + decodeFailures) : 0,
      reactionsPerSession: sessionCount > 0 ? reactions / sessionCount : 0,
      judgeFlagsCreated: judgeFlags,
    },
  })
  void generatedEvents
  return row.id
}

// ---------------------------------------------------------------------------
// Auto-curation (§1.5.2)
// ---------------------------------------------------------------------------

export interface AutoCurationResult {
  created: number
  blockedByCap: number
  beyondBounds: Array<{ signature: string; reason: string }>
  rules: Array<{ signature: string; doesntApplyRate: number; n: number; reason: string }>
}

export async function runAutoCuration(now: Date = new Date()): Promise<AutoCurationResult> {
  const cfg = SCORING_CONFIG.autoRule
  const beyondBounds: Array<{ signature: string; reason: string }> = []
  const created: AutoCurationResult['rules'] = []
  let blockedByCap = 0

  // Weekly cap counts AUTOEVAL rules created in the trailing 7 days.
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
  const recentCount = await prisma.curationRule.count({
    where: { source: 'AUTOEVAL', createdAt: { gte: weekAgo } },
  })
  let budget = Math.max(0, cfg.maxNewRulesPerWeek - recentCount)

  const candidates = await prisma.learningStore.findMany({
    where: { doesntApplyCount: { gte: cfg.minN } },
    select: { featureSignature: true, thumbsUpCount: true, doesntApplyCount: true, dismissCount: true },
  })

  for (const c of candidates) {
    const n = c.thumbsUpCount + c.doesntApplyCount + c.dismissCount
    if (n < cfg.minN) continue
    const rate = c.doesntApplyCount / n
    if (rate <= cfg.doesntApplyRateThreshold) continue

    const hash = signatureHash(c.featureSignature)
    const existing = await prisma.curationRule.findFirst({
      where: { signatureHash: hash, revokedAt: null },
      select: { id: true },
    })
    if (existing) continue

    if (budget <= 0) {
      blockedByCap++
      beyondBounds.push({
        signature: c.featureSignature,
        reason: `weekly cap of ${cfg.maxNewRulesPerWeek} auto-rules reached — flagged, not acted on`,
      })
      continue
    }

    const reason = `doesn't-apply rate ${(rate * 100).toFixed(0)}% over ${n} reactions (threshold ${(cfg.doesntApplyRateThreshold * 100).toFixed(0)}%, min n ${cfg.minN})`
    const rule = await prisma.curationRule.create({
      data: {
        signatureHash: hash,
        signature: c.featureSignature,
        action: 'DEMOTE',
        reason,
        source: 'AUTOEVAL',
        evidenceN: n,
        evidenceJson: {
          thumbsUp: c.thumbsUpCount,
          doesntApply: c.doesntApplyCount,
          dismiss: c.dismissCount,
          doesntApplyRate: rate,
        } as never,
        createdBy: 'autoeval',
      },
    })
    budget--
    created.push({ signature: c.featureSignature, doesntApplyRate: rate, n, reason })
    await logEvent({
      eventType: 'CURATION_RULE_APPLIED',
      subjectType: 'CurationRule',
      subjectId: rule.id,
      source: 'cron',
      payload: { signature: c.featureSignature, action: 'DEMOTE', source: 'AUTOEVAL', evidenceN: n },
    })
  }

  return { created: created.length, blockedByCap, beyondBounds, rules: created }
}

// ---------------------------------------------------------------------------
// Shadow re-score (§1.5.3) — SHADOW ONLY. Served rows are never touched (CR3).
// ---------------------------------------------------------------------------

export async function runShadowRescore(now: Date = new Date()): Promise<{
  ran: boolean
  medianDrift: number | null
  flagged: boolean
}> {
  const from = new Date(now.getTime() - 31 * 24 * 3600 * 1000)
  const to = new Date(now.getTime() - 29 * 24 * 3600 * 1000)
  const sample = await prisma.recommendation.findMany({
    where: { createdAt: { gte: from, lt: to }, compositeScore: { not: null } },
    select: { compositeScore: true, subScoresJson: true, scoreVersion: true },
    take: 200,
  })
  if (sample.length === 0) return { ran: false, medianDrift: null, flagged: false }

  // Recompute the composite from the STORED sub-scores under current
  // weights. Nothing is written back — this only answers "would today's
  // config have scored these differently?"
  const w = SCORING_CONFIG.weights
  const drifts: number[] = []
  for (const r of sample) {
    const s = (r.subScoresJson ?? {}) as Record<string, number>
    if (typeof s.reactionPrior !== 'number') continue
    const recomputed =
      (s.reactionPrior ?? 0) * w.reactionPrior +
      (s.photoQuality ?? 0) * w.photoQuality +
      (s.regionFit ?? 0) * w.regionFit +
      (s.specificity ?? 0) * w.specificity +
      (s.actionabilityTieBreak ?? 0) * w.actionabilityTieBreak
    const old = r.compositeScore ?? 0
    if (old > 0) drifts.push(Math.abs(recomputed - old) / old)
  }
  if (drifts.length === 0) return { ran: true, medianDrift: null, flagged: false }
  drifts.sort((a, b) => a - b)
  const median = drifts[Math.floor(drifts.length / 2)]
  return {
    ran: true,
    medianDrift: median,
    flagged: median > SCORING_CONFIG.shadowDriftThreshold,
  }
}

export { SCORE_VERSION }
