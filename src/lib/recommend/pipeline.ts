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
import { regionProfileForZip } from '@/lib/region/profile'
import { loadServeLookups } from '@/lib/score/priors'
import { applyScoreOrdering, scoreItems, type ScoredItem } from '@/lib/score/score'
import { resolveForReport } from '@/lib/commerce/resolve'
import { runGate, exclusionLine } from './gate'
import { generateCandidates } from './candidates'
import { decideVerdicts } from './verdicts'
import { computeCartArtifacts } from './cart'
import { validateReport } from './validate'
import { RECOMMEND_MODEL, RECOMMEND_PROMPT_VERSION, RULES_VERSION } from './version'
import type { EnrichedRecommendation, MergedFeature, PipelineInput, Tenure } from './types'

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

/** Score a set against live priors + active curation rules. */
async function scoreEnriched(
  recs: EnrichedRecommendation[],
  features: MergedFeature[],
  region: { climateZone: string; frostDepthClass: string; humidityClass: string } | null,
  _tenure: Tenure | null
): Promise<ScoredItem[]> {
  const { priors, rules } = await loadServeLookups(recs)
  return scoreItems({ recs, features, priors, rules, region })
}

/** >50% of candidates gated out — the synthesis itself is suspect. */
function isMassSuppression(scored: ScoredItem[]): boolean {
  if (scored.length === 0) return false
  return scored.filter((s) => s.suppressed).length / scored.length > 0.5
}

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const t0 = Date.now()

  // 1. Gate: merge extractions across the snapshot set, exclude
  //    privacy-flagged photos, drop low-signal features.
  const gate = await runGate(input.snapshotIds)
  if (gate.features.length === 0) {
    // Distinguish "we threw your photos away for privacy" from "we
    // couldn't read them" — the previous message conflated the two and
    // read as though the photo were unreadable (observed 2026-07-28).
    const privacyExcluded = gate.exclusionSummary.filter((e) => e.reason.endsWith('_detected'))
    if (privacyExcluded.length > 0 && privacyExcluded.length === gate.exclusionSummary.length) {
      const reasons = Array.from(new Set(privacyExcluded.map((e) => e.reason.replace(/_/g, ' '))))
      throw new PipelineError(
        'all_photos_privacy_excluded',
        `We set ${privacyExcluded.length === 1 ? 'your photo' : 'those photos'} aside without analyzing ${privacyExcluded.length === 1 ? 'it' : 'them'} — our privacy check flagged ${reasons.join(', ')}. Nothing was stored for analysis. Try a photo of just the room, with no people, documents, or screens in frame.`
      )
    }
    throw new PipelineError('no_usable_features', 'No usable observations in the provided photos.')
  }

  // 2. Candidate generation (the one LLM step — no numbers, no verdicts).
  // v7.4.7: optional ZIP resolves to a static region profile; region
  // facts inform candidates but are never photo observations (rule 9).
  const regionContext = input.zip ? regionProfileForZip(input.zip) : null
  const candidateResult = await generateCandidates({
    features: gate.features,
    tenure: input.tenure ?? null,
    userPrompt: input.userPrompt ?? null,
    photoCount: gate.includedPhotoCount,
    currentDate: new Date().toISOString().slice(0, 10),
    regionContext,
  })

  // 3. Deterministic verdicts + dataset cost/rebate/citation enrichment.
  let enriched = decideVerdicts(candidateResult.set.candidates, input.tenure ?? null, gate.features)

  // 3b. v7.4.9 RecScore — gate + rank, computed ONCE here and frozen.
  //
  // Mass-suppression guard (§1.2): if the grounding gate removes >50% of
  // candidates, the synthesis itself is suspect, so re-reason ONCE with
  // the same evidence. If it still fails, serve the survivors and
  // auto-flag the session for review rather than shipping a thin report
  // silently.
  // Measures the SCORING work only (lookup + pure computation) so the
  // <100ms serve-path budget stays meaningful; the retry's LLM call is
  // accounted separately under candidatePrompt.
  const scoreT0 = Date.now()
  let scored = await scoreEnriched(enriched, gate.features, regionContext, input.tenure ?? null)
  const scoreMs = Date.now() - scoreT0
  let suppressionRetried = false
  let massSuppression = isMassSuppression(scored)
  if (massSuppression) {
    suppressionRetried = true
    const retry = await generateCandidates({
      features: gate.features,
      tenure: input.tenure ?? null,
      userPrompt: input.userPrompt ?? null,
      photoCount: gate.includedPhotoCount,
      currentDate: new Date().toISOString().slice(0, 10),
      regionContext,
    })
    const retryEnriched = decideVerdicts(retry.set.candidates, input.tenure ?? null, gate.features)
    const retryScored = await scoreEnriched(retryEnriched, gate.features, regionContext, input.tenure ?? null)
    if (!isMassSuppression(retryScored)) {
      enriched = retryEnriched
      scored = retryScored
      massSuppression = false
    }
  }

  const scoreByKey = new Map(scored.map((s) => [s.key, s]))
  for (const s of scored) {
    if (!s.suppressed) continue
    await logEvent({
      eventType: 'ITEM_SUPPRESSED_GROUNDING',
      subjectType: 'Report',
      subjectId: 'pending', // report row not created yet; key identifies the item
      anonId: input.anonId,
      source: 'system',
      payload: { itemKey: s.key, reason: s.suppressedReason, failingClaims: s.failingClaims.slice(0, 6) },
    })
  }
  for (const s of scored) {
    if (s.demoted) {
      await logEvent({
        eventType: 'CURATION_RULE_APPLIED',
        subjectType: 'CurationRule',
        subjectId: s.demotedByRuleId ?? 'unknown',
        anonId: input.anonId,
        source: 'system',
        payload: { itemKey: s.key },
      })
    }
  }

  // Suppressed items never reach the customer (CR1) — ordering also
  // sinks rule-demoted items to their lane bottom.
  enriched = applyScoreOrdering(enriched, scoreByKey)

  // 4. Cart artifacts for BUY recs (same pass; paid-tier disclosure).
  await computeCartArtifacts(enriched)

  // 4b. v7.4.10 — commerce resolution for BUY + WAIT only (CR4).
  // Degrades to search links on any failure; never blocks the result.
  let resolutions = new Map<string, Awaited<ReturnType<typeof resolveForReport>> extends Map<string, infer R> ? R : never>()
  try {
    resolutions = await resolveForReport(
      enriched.map((r) => ({
        recKey: r.key,
        verdict: r.verdict,
        productCategory: r.cartMeta.productCategory,
        searchQuery: r.cartMeta.searchQuery,
        requiredSpecs: r.cartMeta.requiredSpecs,
        specificity: scoreByKey.get(r.key)?.subScores.specificity ?? 0,
      }))
    )
  } catch (e) {
    console.error('[pipeline] resolution failed (non-fatal):', (e as Error).message.slice(0, 160))
  }

  // 5. Validation pass (honesty invariant, precision/brand/person strip).
  const validated = validateReport(enriched)

  // 6. Persist.
  const { newAccessKey } = await import('./access')
  const report = await prisma.report.create({
    data: {
      accessKey: newAccessKey(),
      visitorAnonId: input.anonId,
      snapshotIds: input.snapshotIds,
      status: 'CHECK_ISSUED',
      tenure: input.tenure ?? null,
      userPrompt: input.userPrompt ?? null,
      excludedPhotoCount: gate.excludedPhotoCount,
      exclusionSummaryJson: gate.exclusionSummary as never,
      recencyFlagged: candidateResult.set.recency_conflict.detected,
      zip: input.zip ?? null,
      zipSource: input.zip ? 'UPLOAD_FORM' : null,
      regionContextUsed: regionContext != null,
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
        // v7.4.9 scoring audit trail
        scoring: {
          scoreVersion: scored[0]?.scoreVersion ?? null,
          suppressedKeys: scored.filter((s) => s.suppressed).map((s) => ({ key: s.key, reason: s.suppressedReason })),
          demotedKeys: scored.filter((s) => s.demoted).map((s) => s.key),
          suppressionRetried,
          massSuppression,
          scoreMs: scoreMs,
        },
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
        // v7.4.9 — frozen at synthesis (CR3). Never updated for a
        // served row; a config/version change affects new rows only.
        compositeScore: scoreByKey.get(rec.key)?.compositeScore ?? null,
        subScoresJson: (scoreByKey.get(rec.key)?.subScores ?? null) as never,
        scoreVersion: scoreByKey.get(rec.key)?.scoreVersion ?? null,
        suppressed: false, // suppressed items are never persisted as served rows
        claimLinksJson: rec.claimLinks as never,
        // v7.4.10 — resolution outcome for this item (BUY/WAIT only)
        resolutionJson: (resolutions.get(rec.key) ?? null) as never,
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

  // 6b. v7.4.9 — mass-suppression auto-flag (§1.5.4). A session that
  // still gates out >50% of its candidates after a retry goes into the
  // unreviewed queue with a HALLUCINATION flag rather than passing
  // quietly.
  if (massSuppression) {
    try {
      await prisma.qAFlag.create({
        data: {
          reportId: report.id,
          type: 'HALLUCINATION',
          note: `Auto-flag: grounding gate suppressed ${scored.filter((s) => s.suppressed).length}/${scored.length} candidates${suppressionRetried ? ' (retry did not recover)' : ''}.`,
          createdBy: 'autoeval',
        },
      })
    } catch {
      /* flagging must never fail a report */
    }
  }

  // 6c. v7.4.12 — photos admitted despite an uncorroborated
  // people_present flag. The customer gets their read; the session is
  // marked so a human reviews it and it never reaches a dataset
  // (exportableConsentedRecords filters PEOPLE_VISIBLE).
  if (gate.softPersonPhotoIds && gate.softPersonPhotoIds.length > 0) {
    try {
      await prisma.qAFlag.create({
        data: {
          reportId: report.id,
          type: 'PEOPLE_VISIBLE',
          note: `Auto: extraction reported people_present with no corroborating person feature on ${gate.softPersonPhotoIds.length} photo(s) (${gate.softPersonPhotoIds.map((id) => id.slice(-8)).join(', ')}). Analyzed for the customer; excluded from dataset paths pending review.`,
          createdBy: 'gate',
        },
      })
    } catch {
      /* flagging must never fail a report */
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
