/**
 * v7.4.0 — Full-depth pipeline orchestrator (single-pass rule).
 *
 * Runs ONCE per report, at full depth: batch extraction merge →
 * quality/privacy gate → candidate generation → deterministic verdicts +
 * dataset enrichment → cart-artifact computation → validation pass →
 * persist Report + Recommendation + CartCandidate rows with disclosure
 * tiers. Check and Cart are disclosure layers over this one analysis
 * object, never two analyses.
 *
 * Also handles refinement: answering a clarifying question re-runs
 * candidate generation with the answers appended (same evidence, same
 * pipeline, same rules) and reports what changed. Verdict changes
 * propagate to cart artifacts (removed lines) per the bidirectional
 * continuum rule.
 */

import { prisma } from '@/lib/db'
import { logEvent } from '@/lib/events/log'
import { runGate, exclusionLine } from './gate'
import { generateCandidates } from './candidates'
import { decideVerdicts } from './verdicts'
import { computeCartArtifacts } from './cart'
import { validateReport } from './validate'
import { RECOMMEND_MODEL, RECOMMEND_PROMPT_VERSION, RULES_VERSION } from './version'
import type { EnrichedRecommendation, PipelineInput, Tenure } from './types'

export interface PipelineOutput {
  reportId: string
  status: string
  recs: EnrichedRecommendation[]
  recIds: Map<string, string> // rec.key -> Recommendation row id
  buyCount: number
  excludedPhotoCount: number
  exclusionLine: string | null
  recencyFlagged: boolean
  recencyDetail: string | null
  tenure: Tenure | null
  tenureKnown: boolean
}

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const t0 = Date.now()

  // 1. Gate: merge extractions across the snapshot set, exclude
  //    privacy-flagged photos, drop low-signal features.
  const gate = await runGate(input.snapshotIds)
  if (gate.features.length === 0) {
    throw new PipelineError('no_usable_features', 'No usable observations in the provided photos.')
  }

  // 2. Candidate generation (the one LLM step — no numbers, no verdicts).
  const candidateResult = await generateCandidates({
    features: gate.features,
    tenure: input.tenure ?? null,
    userPrompt: input.userPrompt ?? null,
    photoCount: gate.includedPhotoCount,
    currentDate: new Date().toISOString().slice(0, 10),
  })

  // 3. Deterministic verdicts + dataset cost/rebate/citation enrichment.
  const enriched = decideVerdicts(candidateResult.set.candidates, input.tenure ?? null)

  // 4. Cart artifacts for BUY recs (same pass; paid-tier disclosure).
  await computeCartArtifacts(enriched)

  // 5. Validation pass (honesty invariant, precision/brand/person strip).
  const validated = validateReport(enriched)

  // 6. Persist.
  const report = await prisma.report.create({
    data: {
      visitorAnonId: input.anonId,
      snapshotIds: input.snapshotIds,
      status: 'CHECK_ISSUED',
      tenure: input.tenure ?? null,
      userPrompt: input.userPrompt ?? null,
      excludedPhotoCount: gate.excludedPhotoCount,
      exclusionSummaryJson: gate.exclusionSummary as never,
      recencyFlagged: candidateResult.set.recency_conflict.detected,
      modelVersion: RECOMMEND_MODEL,
      promptVersion: RECOMMEND_PROMPT_VERSION,
      rulesVersion: RULES_VERSION,
      pipelineLogJson: {
        candidatePrompt: { tokensIn: candidateResult.tokensIn, tokensOut: candidateResult.tokensOut, latencyMs: candidateResult.latencyMs },
        rawResponse: candidateResult.rawResponse.slice(0, 20000),
        // Validated candidate set — the refinement path (clarifying answers)
        // replays deterministic rules over these without re-calling the model
        // when the answer only affects rules (e.g. tenure).
        candidates: candidateResult.set.candidates,
        validationAdjustments: validated.adjustments,
        batchNotes: candidateResult.set.batch_notes,
        totalMs: Date.now() - t0,
      } as never,
    },
  })

  const recIds = new Map<string, string>()
  for (const rec of validated.recs) {
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

    if (rec.cartArtifacts.length > 0) {
      await prisma.cartCandidate.createMany({
        data: rec.cartArtifacts.map((a, i) => ({
          recommendationId: row.id,
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
  }

  // 7. Flywheel logging (v7.4.1c) — anonymized category observations.
  try {
    await prisma.categoryObservation.createMany({
      data: validated.recs.map((r) => ({
        category: r.cartMeta.productCategory.slice(0, 60),
        conditionBand: r.confidenceLabel === 'high' ? 'fair' : 'unknown',
        region: 'VT',
        verdict: r.verdict,
      })),
    })
  } catch {
    /* flywheel logging must never fail a report */
  }

  await logEvent({
    eventType: 'REPORT_GENERATED',
    subjectType: 'Report',
    subjectId: report.id,
    anonId: input.anonId,
    source: 'web',
    payload: {
      recCount: validated.recs.length,
      buyCount: validated.buyCount,
      skipOrWaitCount: validated.skipOrWaitCount,
      excludedPhotoCount: gate.excludedPhotoCount,
      recencyFlagged: candidateResult.set.recency_conflict.detected,
      tokensIn: candidateResult.tokensIn,
      tokensOut: candidateResult.tokensOut,
      totalMs: Date.now() - t0,
    },
  })

  const tenureKnown = input.tenure != null
  return {
    reportId: report.id,
    status: 'CHECK_ISSUED',
    recs: validated.recs,
    recIds,
    buyCount: validated.buyCount,
    excludedPhotoCount: gate.excludedPhotoCount,
    exclusionLine: exclusionLine(gate),
    recencyFlagged: candidateResult.set.recency_conflict.detected,
    recencyDetail: candidateResult.set.recency_conflict.detected
      ? candidateResult.set.recency_conflict.detail
      : null,
    tenure: input.tenure ?? null,
    tenureKnown,
  }
}

export class PipelineError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'PipelineError'
  }
}
