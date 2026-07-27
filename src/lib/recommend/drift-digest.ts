/**
 * v7.4.4 — Confidence-drift section for the daily digest email.
 *
 * Last-24h Alder Check stats: reports created, verdict mix, mean
 * confidence per verdict, validation-adjustment counts (from
 * pipelineLogJson), drip sends, and last eval-run marker. Pure
 * read + HTML string; failure never blocks the digest.
 */

import { prisma } from '@/lib/db'

export interface DriftStats {
  reportsCreated: number
  verdictMix: Record<string, number>
  meanConfidence: Record<string, number>
  validationAdjustments: number
  dripSent: number
  html: string
}

export async function buildReportDriftSection(): Promise<DriftStats> {
  const since = new Date(Date.now() - 24 * 3600 * 1000)

  const [reports, recs, dripSent] = await Promise.all([
    prisma.report.findMany({
      where: { createdAt: { gte: since } },
      select: { pipelineLogJson: true },
    }),
    prisma.recommendation.findMany({
      where: { createdAt: { gte: since } },
      select: { verdict: true, confidenceScore: true },
    }),
    prisma.eventLog.count({ where: { eventType: 'DRIP_SENT', occurredAt: { gte: since } } }),
  ])

  const verdictMix: Record<string, number> = {}
  const confSum: Record<string, { s: number; n: number }> = {}
  for (const r of recs) {
    verdictMix[r.verdict] = (verdictMix[r.verdict] ?? 0) + 1
    confSum[r.verdict] ??= { s: 0, n: 0 }
    confSum[r.verdict].s += r.confidenceScore
    confSum[r.verdict].n++
  }
  const meanConfidence: Record<string, number> = {}
  for (const [v, { s, n }] of Object.entries(confSum)) meanConfidence[v] = Math.round((s / n) * 100) / 100

  let validationAdjustments = 0
  for (const r of reports) {
    const log = (r.pipelineLogJson ?? {}) as { validationAdjustments?: string[] }
    validationAdjustments += log.validationAdjustments?.length ?? 0
  }

  const mixLine =
    Object.entries(verdictMix)
      .map(([v, n]) => `${v} ${n} (conf ${meanConfidence[v] ?? '—'})`)
      .join(' · ') || 'none'

  const html = `
  <div style="border: 1px solid #e0d9c7; border-radius: 6px; padding: 16px 18px; margin: 14px 0;">
    <h3 style="margin: 0 0 8px; font-size: 15px; color: #1f3d2b;">Alder Check — last 24h</h3>
    <p style="margin: 0; font-size: 13px; color: #444; line-height: 1.7;">
      Reports created: <strong>${reports.length}</strong><br/>
      Verdict mix: ${mixLine}<br/>
      Validation adjustments (honesty demotions / strips): <strong>${validationAdjustments}</strong><br/>
      Drip emails sent: <strong>${dripSent}</strong>
    </p>
    <p style="margin: 8px 0 0; font-size: 11.5px; color: #999;">
      Watch for: BUY mean confidence sliding toward 0.6 (the BUY floor), or adjustments spiking — both mean the
      candidate prompt is drifting. Eval: npm run check:eval.
    </p>
  </div>`

  return { reportsCreated: reports.length, verdictMix, meanConfidence, validationAdjustments, dripSent, html }
}
