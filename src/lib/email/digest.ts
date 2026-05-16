/**
 * Daily Review Digest Email
 *
 * Sent at 5 AM ET (10:00 UTC) to ALERT_EMAIL (hello@alderprojects.com).
 *
 * Contents:
 *   1. Catalog refresh changes needing review (from RecommendationChange)
 *   2. Catalog expansion candidates pending (from CatalogExpansionCandidate)
 *   3. GSC feedback signals from the past week (from GscPageStats)
 *   4. Drafts blocked on missing evidence (subset of candidates)
 *
 * Each actionable row has three buttons:
 *   - Approve            → one-click token URL, no UI
 *   - Reject             → one-click token URL, no UI
 *   - Supply evidence    → tap-through to mobile form (evidence-required cases)
 *
 * Mobile-first design. Buttons are minimum 44px tap targets. Email renders
 * in Apple Mail, Gmail mobile/web, Outlook.
 *
 * Tokens generated here are 32-byte hex, single-use, 7-day expiry, bound
 * to (subject_id, action) tuple. Handled by /admin/catalog-review/action/[token].
 */

import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const TOKEN_EXPIRY_DAYS = 7

// =============================================================================
// MAIN
// =============================================================================

export interface DigestRunResult {
  changesPending: number
  candidatesPending: number
  evidenceBlocked: number
  gscSignals: number
  emailSent: boolean
  errors: string[]
}

export async function sendDailyDigest(): Promise<DigestRunResult> {
  const errors: string[] = []

  // Pull pending items
  const [pendingChanges, pendingCandidates, evidenceBlockedCandidates, gscSignals] = await Promise.all([
    prisma.recommendationChange.findMany({
      where: { status: 'pending_review' },
      orderBy: [{ riskTier: 'asc' }, { createdAt: 'desc' }],
      take: 30,
    }),
    prisma.catalogExpansionCandidate.findMany({
      where: { status: 'pending_review' },
      orderBy: [{ commodityRiskScore: 'asc' }, { createdAt: 'desc' }],
      take: 30,
    }),
    prisma.catalogExpansionCandidate.findMany({
      where: { status: 'needs_evidence' },
      orderBy: { reviewedAt: 'desc' },
      take: 30,
    }),
    prisma.gscPageStats.findMany({
      where: {
        aiOverviewLikely: true,
        createdAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { impressions: 'desc' },
      take: 20,
    }),
  ])

  // Nothing to report? Send a silent summary anyway, so you know the
  // cron ran. Once a week (Mondays), send the silent summary; other days
  // skip if everything is zero.
  const isMonday = new Date().getUTCDay() === 1
  const hasActionableContent =
    pendingChanges.length > 0 ||
    pendingCandidates.length > 0 ||
    evidenceBlockedCandidates.length > 0 ||
    gscSignals.length > 0
  if (!hasActionableContent && !isMonday) {
    return {
      changesPending: 0,
      candidatesPending: 0,
      evidenceBlocked: 0,
      gscSignals: 0,
      emailSent: false,
      errors: [],
    }
  }

  // Generate action tokens for each actionable row
  const tokens = await issueTokens(pendingChanges, pendingCandidates)

  // Build the HTML email
  const html = buildEmailHtml({
    pendingChanges,
    pendingCandidates,
    evidenceBlockedCandidates,
    gscSignals,
    tokens,
  })

  // Send via Resend
  let emailSent = false
  try {
    await sendViaResend({
      to: process.env.ALERT_EMAIL || 'hello@alderprojects.com',
      from: process.env.ALERT_FROM_EMAIL || 'Alder Read <alerts@alderprojects.com>',
      subject: buildSubject(pendingChanges.length, pendingCandidates.length, evidenceBlockedCandidates.length),
      html,
    })
    emailSent = true
  } catch (e) {
    errors.push(`Email send failed: ${(e as Error).message}`)
  }

  await prisma.eventLog.create({
    data: {
      eventType: 'CATALOG_DIGEST_SENT',
      payloadJson: {
        changesPending: pendingChanges.length,
        candidatesPending: pendingCandidates.length,
        evidenceBlocked: evidenceBlockedCandidates.length,
        gscSignals: gscSignals.length,
        emailSent,
      },
      source: 'cron',
    },
  })

  return {
    changesPending: pendingChanges.length,
    candidatesPending: pendingCandidates.length,
    evidenceBlocked: evidenceBlockedCandidates.length,
    gscSignals: gscSignals.length,
    emailSent,
    errors,
  }
}

// =============================================================================
// TOKEN ISSUANCE
// =============================================================================

interface TokenMap {
  // Keyed by changeId or candidateId — value is a map of action → token
  [subjectId: string]: Record<string, string>
}

async function issueTokens(
  changes: Array<{ id: string }>,
  candidates: Array<{ id: string; commodityRiskScore: number; evidenceNeededJson: any }>
): Promise<TokenMap> {
  const tokens: TokenMap = {}
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  // For each change: approve and reject tokens
  for (const change of changes) {
    tokens[change.id] = {}
    for (const action of ['approve', 'reject'] as const) {
      const token = randomBytes(32).toString('hex')
      await prisma.reviewActionToken.create({
        data: {
          token,
          action,
          changeId: change.id,
          expiresAt,
        },
      })
      tokens[change.id][action] = token
    }
  }

  // For each candidate: approve, reject, and (if evidence needed) supply_evidence
  for (const candidate of candidates) {
    tokens[candidate.id] = {}
    const actions: string[] = ['reject']
    const needsEvidence = Array.isArray(candidate.evidenceNeededJson) && candidate.evidenceNeededJson.length > 0
    if (needsEvidence) {
      // Low-risk approve is still available, but flagged
      actions.push('approve_low_confidence', 'supply_evidence')
    } else {
      actions.push('approve')
    }
    for (const action of actions) {
      const token = randomBytes(32).toString('hex')
      await prisma.reviewActionToken.create({
        data: {
          token,
          action,
          candidateId: candidate.id,
          expiresAt,
        },
      })
      tokens[candidate.id][action] = token
    }
  }

  return tokens
}

// =============================================================================
// EMAIL HTML
// =============================================================================

function buildSubject(changes: number, candidates: number, blocked: number): string {
  const env = process.env.VERCEL_ENV === 'production' ? '' : '[STAGING] '
  const parts: string[] = []
  if (changes > 0) parts.push(`${changes} price/availability`)
  if (candidates > 0) parts.push(`${candidates} expansion`)
  if (blocked > 0) parts.push(`${blocked} need evidence`)
  if (parts.length === 0) return `${env}Alder Read · Weekly catalog digest (no action needed)`
  return `${env}Alder Read · ${parts.join(' · ')}`
}

function buildEmailHtml(args: {
  pendingChanges: any[]
  pendingCandidates: any[]
  evidenceBlockedCandidates: any[]
  gscSignals: any[]
  tokens: TokenMap
}): string {
  const { pendingChanges, pendingCandidates, evidenceBlockedCandidates, gscSignals, tokens } = args

  const sections: string[] = []

  if (pendingChanges.length > 0) {
    sections.push(renderChangesSection(pendingChanges, tokens))
  }
  if (pendingCandidates.length > 0) {
    sections.push(renderCandidatesSection(pendingCandidates, tokens))
  }
  if (evidenceBlockedCandidates.length > 0) {
    sections.push(renderEvidenceBlockedSection(evidenceBlockedCandidates))
  }
  if (gscSignals.length > 0) {
    sections.push(renderGscSection(gscSignals))
  }

  if (sections.length === 0) {
    sections.push(`<p style="color: #666; padding: 20px; text-align: center;">Quiet week. Cron is running normally; nothing needs your attention.</p>`)
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Alder Read · Catalog digest</title>
</head>
<body style="margin: 0; font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif; background: #f7f5f0; color: #1a1a1a; line-height: 1.5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
<tr><td style="padding: 24px 20px 8px;">
  <h1 style="margin: 0 0 4px; font-size: 18px; font-weight: 600;">Catalog digest · ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h1>
  <p style="margin: 0; font-size: 13px; color: #666;">One click to act. Cron is running normally.</p>
</td></tr>
${sections.map((s) => `<tr><td style="padding: 0 20px;">${s}</td></tr>`).join('')}
<tr><td style="padding: 16px 20px 24px; border-top: 1px solid #e5e5e5; margin-top: 24px;">
  <p style="margin: 0; font-size: 11px; color: #999;">Sent by the Alder Read catalog cron. Links expire in 7 days and are single-use. To stop these emails, set DISABLE_DIGEST_EMAIL=true in Vercel.</p>
</td></tr>
</table>
</body></html>`
}

function renderChangesSection(changes: any[], tokens: TokenMap): string {
  const rows = changes.map((c) => {
    const approveUrl = `${BASE_URL}/admin/catalog-review/action/${tokens[c.id]?.approve}`
    const rejectUrl = `${BASE_URL}/admin/catalog-review/action/${tokens[c.id]?.reject}`
    const pct = c.pctChange ? ` (${c.pctChange > 0 ? '+' : ''}${c.pctChange.toFixed(1)}%)` : ''
    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0; background: #fafafa; border-radius: 8px;">
<tr><td style="padding: 12px 14px;">
  <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">${escapeHtml(c.productName)}</div>
  <div style="font-size: 12px; color: #555; margin-bottom: 10px;">${escapeHtml(c.changeType)}: ${escapeHtml(c.oldValue)} → ${escapeHtml(c.newValue)}${pct}</div>
  <div>
    <a href="${approveUrl}" style="display: inline-block; padding: 10px 18px; background: #1d9e75; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; min-height: 24px; margin-right: 6px; margin-bottom: 4px;">Approve</a>
    <a href="${rejectUrl}" style="display: inline-block; padding: 10px 18px; background: #fff; color: #a32d2d; text-decoration: none; border: 1px solid #d4a4a4; border-radius: 6px; font-size: 13px; font-weight: 500;">Reject</a>
  </div>
</td></tr>
</table>`
  }).join('')

  return `<h2 style="font-size: 14px; font-weight: 600; margin: 20px 0 4px;">Catalog refresh · ${changes.length} change${changes.length === 1 ? '' : 's'}</h2>${rows}`
}

function renderCandidatesSection(candidates: any[], tokens: TokenMap): string {
  const rows = candidates.map((c) => {
    const needsEvidence = Array.isArray(c.evidenceNeededJson) && c.evidenceNeededJson.length > 0
    const supplyUrl = needsEvidence ? `${BASE_URL}/admin/catalog-review/action/${tokens[c.id]?.supply_evidence}` : null
    const approveUrl = needsEvidence
      ? `${BASE_URL}/admin/catalog-review/action/${tokens[c.id]?.approve_low_confidence}`
      : `${BASE_URL}/admin/catalog-review/action/${tokens[c.id]?.approve}`
    const rejectUrl = `${BASE_URL}/admin/catalog-review/action/${tokens[c.id]?.reject}`
    const riskBadge = c.commodityRiskScore >= 70 ? `<span style="display: inline-block; padding: 2px 7px; background: #fde8e8; color: #a32d2d; border-radius: 3px; font-size: 11px; margin-left: 6px;">commodity ${c.commodityRiskScore}</span>` : ''
    const evidenceList = needsEvidence
      ? `<div style="font-size: 11px; color: #856404; background: #fff3cd; padding: 6px 8px; border-radius: 4px; margin: 8px 0;">Evidence needed: ${(c.evidenceNeededJson as string[]).map((s) => s.replace(/_/g, ' ')).join(', ')}</div>`
      : ''
    return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0; background: #fafafa; border-radius: 8px;">
<tr><td style="padding: 12px 14px;">
  <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">${escapeHtml(c.title)} ${riskBadge}</div>
  <div style="font-size: 12px; color: #555; margin-bottom: 4px;">${escapeHtml(c.candidateType)} · ${escapeHtml(c.scopeId)}</div>
  <div style="font-size: 12px; color: #444; margin-bottom: 8px;">${escapeHtml(c.rationale)}</div>
  ${evidenceList}
  <div>
    ${needsEvidence && supplyUrl ? `<a href="${supplyUrl}" style="display: inline-block; padding: 10px 18px; background: #1d6e95; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; margin-right: 6px; margin-bottom: 4px;">Supply evidence</a>` : ''}
    <a href="${approveUrl}" style="display: inline-block; padding: 10px 18px; background: ${needsEvidence ? '#fff' : '#1d9e75'}; color: ${needsEvidence ? '#666' : '#fff'}; text-decoration: none; border: 1px solid ${needsEvidence ? '#ccc' : '#1d9e75'}; border-radius: 6px; font-size: 13px; font-weight: 500; margin-right: 6px; margin-bottom: 4px;">${needsEvidence ? 'Approve as low-confidence' : 'Approve'}</a>
    <a href="${rejectUrl}" style="display: inline-block; padding: 10px 18px; background: #fff; color: #a32d2d; text-decoration: none; border: 1px solid #d4a4a4; border-radius: 6px; font-size: 13px; font-weight: 500;">Reject</a>
  </div>
</td></tr>
</table>`
  }).join('')
  return `<h2 style="font-size: 14px; font-weight: 600; margin: 20px 0 4px;">Expansion candidates · ${candidates.length}</h2>${rows}`
}

function renderEvidenceBlockedSection(blocked: any[]): string {
  const rows = blocked.map((c) => `
<div style="padding: 8px 0; border-bottom: 1px solid #eee;">
  <div style="font-size: 13px; font-weight: 500;">${escapeHtml(c.title)}</div>
  <div style="font-size: 11px; color: #666;">Awaiting: ${(c.evidenceNeededJson as string[]).map((s) => s.replace(/_/g, ' ')).join(', ')}</div>
</div>`).join('')
  return `<h2 style="font-size: 14px; font-weight: 600; margin: 20px 0 4px; color: #856404;">Drafts blocked on evidence · ${blocked.length}</h2>
<div style="background: #fff8e7; padding: 8px 14px; border-radius: 8px; margin: 8px 0;">${rows}</div>`
}

function renderGscSection(signals: any[]): string {
  const rows = signals.map((s) => `
<div style="padding: 8px 0; border-bottom: 1px solid #eee;">
  <div style="font-size: 12px; font-weight: 500;">${escapeHtml(s.pageUrl)}</div>
  <div style="font-size: 11px; color: #666;">${s.impressions} impressions · ${(s.ctr * 100).toFixed(1)}% CTR · pos ${s.avgPosition.toFixed(1)}</div>
</div>`).join('')
  return `<h2 style="font-size: 14px; font-weight: 600; margin: 20px 0 4px;">AI Overview signal · ${signals.length} page${signals.length === 1 ? '' : 's'}</h2>
<p style="font-size: 12px; color: #555; margin: 0 0 8px;">Pages with rising impressions and falling CTR — likely being summarized in AI Overviews.</p>
<div style="background: #f0f4f8; padding: 8px 14px; border-radius: 8px;">${rows}</div>`
}

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// =============================================================================
// RESEND
// =============================================================================

async function sendViaResend(args: { to: string; from: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Resend ${response.status}: ${text.substring(0, 200)}`)
  }
}
