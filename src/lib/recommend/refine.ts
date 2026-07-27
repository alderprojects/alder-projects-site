/**
 * v7.4.0 — Report refinement (clarifying answers).
 *
 * The bidirectional continuum: answers persist on the report, pre-fill
 * Smart Cart compatibility questions, and can change verdicts — and a
 * changed verdict propagates to cart artifacts (lines removed when a rec
 * leaves BUY), even after payment (refund handling lives in the cart
 * surface, v7.4.2).
 *
 * Two refinement paths:
 *   - tenure: pure rules replay over the persisted candidate set —
 *     no LLM call (the answer only flips deterministic rules).
 *   - anything else: re-run candidate generation with ALL answers
 *     appended (same evidence, same pipeline, same rules), then diff.
 *
 * Never a re-analysis of photos: the extraction evidence is fixed at
 * upload time; refinement re-reasons over the same evidence.
 */

import { prisma } from '@/lib/db'
import { logEvent } from '@/lib/events/log'
import { runGate } from './gate'
import { generateCandidates } from './candidates'
import { decideVerdicts } from './verdicts'
import { computeCartArtifacts } from './cart'
import { validateReport } from './validate'
import { CandidateSchema, type Candidate, type EnrichedRecommendation, type Tenure } from './types'
import { z } from 'zod'

export interface VerdictChange {
  recommendationId: string
  key: string
  title: string
  from: string
  to: string
  cartLinesRemoved: number
}

export interface RefineResult {
  reportId: string
  status: string
  changes: VerdictChange[]
  recs: EnrichedRecommendation[]
  recIds: Map<string, string>
  buyCount: number
}

export async function refineReport(opts: {
  reportId: string
  anonId: string | null
  key?: string | null
  questionKey: string
  answerText: string
  recommendationId?: string
}): Promise<RefineResult> {
  const report = await prisma.report.findUnique({
    where: { id: opts.reportId },
    include: { recommendations: { include: { cartCandidates: true } } },
  })
  if (!report || report.deletedAt) throw new RefineError('report_not_found', 'Report not found.')
  const byCookie = opts.anonId != null && report.visitorAnonId === opts.anonId
  const byKey = opts.key != null && report.accessKey != null && opts.key === report.accessKey
  if (!byCookie && !byKey) throw new RefineError('not_your_report', 'Not your report.')

  // 1. Persist the answer (re-answering replaces). Not an upsert because
  //    recommendationId is nullable and Postgres compound uniques treat
  //    NULLs as distinct — find-then-write instead.
  const existingAnswer = await prisma.clarifyingAnswer.findFirst({
    where: {
      reportId: report.id,
      recommendationId: opts.recommendationId ?? null,
      questionKey: opts.questionKey,
    },
  })
  if (existingAnswer) {
    await prisma.clarifyingAnswer.update({
      where: { id: existingAnswer.id },
      data: { answerText: opts.answerText.slice(0, 500), answeredAt: new Date() },
    })
  } else {
    await prisma.clarifyingAnswer.create({
      data: {
        reportId: report.id,
        recommendationId: opts.recommendationId ?? null,
        questionKey: opts.questionKey,
        questionText: opts.questionKey,
        answerText: opts.answerText.slice(0, 500),
      },
    })
  }

  await logEvent({
    eventType: 'QUESTION_ANSWERED',
    subjectType: 'Report',
    subjectId: report.id,
    anonId: opts.anonId,
    source: 'web',
    payload: { questionKey: opts.questionKey, recommendationId: opts.recommendationId ?? null },
  })

  // 2. Resolve tenure (special-cased: always deterministic).
  let tenure: Tenure | null = (report.tenure as Tenure | null) ?? null
  if (opts.questionKey === 'tenure') {
    const normalized = opts.answerText.trim().toLowerCase()
    tenure = normalized.startsWith('rent') ? 'rent' : 'own'
    await prisma.report.update({ where: { id: report.id }, data: { tenure } })
  }

  // 3. Recompute the enriched set.
  const persisted = (report.pipelineLogJson ?? {}) as { candidates?: unknown }
  let candidates: Candidate[] | null = null
  const parsedCandidates = z.array(CandidateSchema).safeParse(persisted.candidates)
  if (parsedCandidates.success) candidates = parsedCandidates.data

  let enriched: EnrichedRecommendation[]
  if (opts.questionKey === 'tenure' && candidates) {
    // Rules replay — no LLM call.
    enriched = decideVerdicts(candidates, tenure)
  } else {
    // Full re-reason with all answers appended (same evidence).
    const answers = await prisma.clarifyingAnswer.findMany({ where: { reportId: report.id } })
    const gate = await runGate(report.snapshotIds)
    if (gate.features.length === 0) throw new RefineError('no_usable_features', 'No usable observations.')
    // v7.4.7 — a ZIP stored on the report (upload-form or post-result)
    // regionalizes refinement re-reasoning the same way it does the
    // initial pass.
    const { regionProfileForZip } = await import('@/lib/region/profile')
    const regionContext = report.zip ? regionProfileForZip(report.zip) : null
    const result = await generateCandidates({
      features: gate.features,
      tenure,
      userPrompt: report.userPrompt,
      photoCount: gate.includedPhotoCount,
      currentDate: new Date().toISOString().slice(0, 10),
      clarifyingAnswers: answers.map((a) => ({ questionKey: a.questionKey, answerText: a.answerText })),
      regionContext,
    })
    if (regionContext && !report.regionContextUsed) {
      await prisma.report.update({ where: { id: report.id }, data: { regionContextUsed: true } })
    }
    candidates = result.set.candidates
    enriched = decideVerdicts(candidates, tenure)
  }

  await computeCartArtifacts(enriched)
  const validated = validateReport(enriched)

  // 4. Diff against existing rows by key; update in place.
  const existingByKey = new Map(report.recommendations.filter((r) => r.key).map((r) => [r.key as string, r]))
  const changes: VerdictChange[] = []
  const recIds = new Map<string, string>()

  for (const rec of validated.recs) {
    const existing = existingByKey.get(rec.key)
    if (existing) {
      recIds.set(rec.key, existing.id)
      const verdictChanged = existing.verdict !== rec.verdict
      await prisma.recommendation.update({
        where: { id: existing.id },
        data: {
          verdict: rec.verdict,
          title: rec.title,
          summary: rec.summary,
          visibleEvidenceJson: rec.visibleEvidence as never,
          costLow: rec.costLow,
          costHigh: rec.costHigh,
          confidenceScore: rec.confidenceScore,
          confidenceLabel: rec.confidenceLabel,
          assumptionsJson: rec.assumptions as never,
          limitationsJson: rec.limitations as never,
          riskLevel: rec.riskLevel,
          clarifyingQuestionsJson: rec.clarifyingQuestions as never,
          smartCartEligible: rec.smartCartEligible,
          nextAction: rec.nextAction,
          rebateJson: rec.rebate ? (rec.rebate as never) : undefined,
          citationsJson: rec.citations as never,
          categorySearchQuery: rec.categorySearchQuery,
          sortOrder: rec.sortOrder,
          disclosureTier: rec.disclosureTier,
        },
      })
      if (verdictChanged) {
        // Continuum rule: a rec leaving BUY takes its cart lines with it.
        let cartLinesRemoved = 0
        if (existing.verdict === 'BUY' && rec.verdict !== 'BUY') {
          const removed = await prisma.cartCandidate.updateMany({
            where: { recommendationId: existing.id, fitStatus: { not: 'removed' } },
            data: { fitStatus: 'removed' },
          })
          cartLinesRemoved = removed.count
        }
        if (rec.verdict === 'BUY' && rec.cartArtifacts.length > 0) {
          await prisma.cartCandidate.deleteMany({ where: { recommendationId: existing.id } })
          await prisma.cartCandidate.createMany({
            data: rec.cartArtifacts.map((a, i) => ({
              recommendationId: existing.id,
              tier: a.tier,
              productName: a.productName,
              asin: a.asin,
              searchQuery: a.searchQuery,
              priceLow: a.priceLow,
              priceHigh: a.priceHigh,
              availability: a.availability,
              fitStatus: a.fitStatus,
              requiredSpecsJson: a.requiredSpecs as never,
              quantity: a.quantity,
              installDifficulty: a.installDifficulty,
              sortOrder: i,
              lastPricedAt: a.priceLow !== null ? new Date() : null,
            })),
          })
        }
        changes.push({
          recommendationId: existing.id,
          key: rec.key,
          title: rec.title,
          from: existing.verdict,
          to: rec.verdict,
          cartLinesRemoved,
        })
        await logEvent({
          eventType: 'VERDICT_CHANGED',
          subjectType: 'Recommendation',
          subjectId: existing.id,
          anonId: opts.anonId,
          source: 'web',
          payload: { reportId: report.id, from: existing.verdict, to: rec.verdict, questionKey: opts.questionKey },
        })
      }
    } else {
      // New rec surfaced by refinement — insert.
      const row = await prisma.recommendation.create({
        data: {
          reportId: report.id,
          key: rec.key,
          verdict: rec.verdict,
          title: rec.title,
          summary: rec.summary,
          visibleEvidenceJson: rec.visibleEvidence as never,
          costLow: rec.costLow,
          costHigh: rec.costHigh,
          benefitType: rec.benefitType,
          confidenceScore: rec.confidenceScore,
          confidenceLabel: rec.confidenceLabel,
          assumptionsJson: rec.assumptions as never,
          limitationsJson: rec.limitations as never,
          riskLevel: rec.riskLevel,
          clarifyingQuestionsJson: rec.clarifyingQuestions as never,
          smartCartEligible: rec.smartCartEligible,
          nextAction: rec.nextAction,
          rebateJson: rec.rebate ? (rec.rebate as never) : undefined,
          citationsJson: rec.citations as never,
          disclosureTier: rec.disclosureTier,
          categorySearchQuery: rec.categorySearchQuery,
          sortOrder: rec.sortOrder,
        },
      })
      recIds.set(rec.key, row.id)
    }
  }

  // 5. Persist updated candidate set + state transition.
  await prisma.report.update({
    where: { id: report.id },
    data: {
      status: 'CHECK_REFINED',
      pipelineLogJson: {
        ...(report.pipelineLogJson as object),
        candidates,
        lastRefinedAt: new Date().toISOString(),
      } as never,
    },
  })

  return {
    reportId: report.id,
    status: 'CHECK_REFINED',
    changes,
    recs: validated.recs,
    recIds,
    buyCount: validated.buyCount,
  }
}

export class RefineError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'RefineError'
  }
}
