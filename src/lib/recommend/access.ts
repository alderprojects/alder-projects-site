/**
 * v7.4.2f — Report access + payload shaping, shared by every surface
 * that reads a persisted report (report page, latest-poll, unlock,
 * answer, delete, cart, checkout).
 *
 * Authorization is deliberately account-free: the anon session cookie
 * (same device) OR the report's accessKey (email links, any device).
 * There is no login anywhere in this product's flow.
 */

import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { shapeRows } from './wire'
import type { DisclosureTier } from './types'
import type { Prisma } from '@prisma/client'

export function newAccessKey(): string {
  return randomBytes(24).toString('base64url')
}

export type AuthorizedReport = NonNullable<Awaited<ReturnType<typeof authorizeReport>>>

/**
 * Load + authorize a report. Returns null when it doesn't exist, was
 * deleted, or the caller presents neither the owning anon cookie nor
 * the access key.
 */
export async function authorizeReport(opts: {
  reportId: string
  anonId: string | null
  key?: string | null
  include?: Prisma.ReportInclude
}) {
  const report = await prisma.report.findUnique({
    where: { id: opts.reportId },
    include: { recommendations: true, ...(opts.include ?? {}) },
  })
  if (!report || report.deletedAt) return null

  const byCookie = opts.anonId != null && report.visitorAnonId === opts.anonId
  const byKey = opts.key != null && report.accessKey != null && opts.key === report.accessKey
  if (!byCookie && !byKey) return null

  // Tier: email once captured (the key itself only exists in the unlock
  // email, so key-holders are definitionally email-tier), else check the
  // session claim, else free.
  let tier: DisclosureTier = 'free'
  if (report.emailCapturedAt || byKey) tier = 'email'
  else if (opts.anonId) {
    const session = await prisma.visitorSession.findUnique({ where: { anonId: opts.anonId } })
    if (session?.claimedByUserId) tier = 'email'
  }

  return { report, tier, byKey }
}

/** The standard wire payload every report surface returns/renders. */
export function reportPayload(report: AuthorizedReport['report'], tier: DisclosureTier) {
  const { visible, locked } = shapeRows(report.recommendations, tier)
  // v7.4.7: buyCount now matches shapeRows' disabledAt filtering (a
  // disabled BUY must not inflate the upsell count).
  const buyCount = report.recommendations.filter((r) => r.verdict === 'BUY' && r.disabledAt == null).length
  return {
    reportId: report.id,
    status: report.status,
    tier,
    // v7.4.7 — post-result ZIP banner renders only when absent
    hasZip: report.zip != null,
    recommendations: visible,
    lockedRecommendations: locked,
    upsell: buyCount > 0 ? { eligible: true, buyCount } : { eligible: false, buyCount: 0 },
    exclusionNotice:
      report.excludedPhotoCount > 0
        ? `${report.excludedPhotoCount} photo${report.excludedPhotoCount === 1 ? '' : 's'} excluded (privacy detected) — not analyzed.`
        : null,
    recency: report.recencyFlagged
      ? { flagged: true, question: 'Are these photos current?' }
      : { flagged: false },
    tenureQuestion: report.tenure ? null : { key: 'tenure', question: 'Do you own or rent this home?' },
  }
}
