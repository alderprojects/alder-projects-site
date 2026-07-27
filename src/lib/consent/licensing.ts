/**
 * v7.4.8 — Licensing-consent copy, hashing, and the structural
 * exclusion helper. FLAG-GATED: nothing here renders while
 * ADDRESS_CAPTURE_ENABLED is off.
 *
 * The consent TEXT lives here as a single exported constant so the
 * hash written to ConsentRecord.textHash is provably the exact language
 * the visitor saw. Change the copy → the hash changes → the new consent
 * is a different, separately-auditable consent. Never edit
 * CONSENT_TEXT without bumping CONSENT_POLICY_VERSION.
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db'

export const CONSENT_POLICY_VERSION = 'licensing-v1.0.0'

/** The EXACT checkbox label shown to the visitor. Hash source of truth. */
export const CONSENT_TEXT =
  'Alder may license anonymized insights and, with this permission, property-level insights to partners.'

export function consentTextHash(text: string = CONSENT_TEXT): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

/** Server-side flag read. Default OFF — the flag flips only after counsel review. */
export function addressCaptureEnabled(): boolean {
  return process.env.ADDRESS_CAPTURE_ENABLED === 'true'
}

/** Uppercase + whitespace-collapse for dedupe (never for display). */
export function normalizeAddressHash(parts: {
  line1: string
  line2?: string | null
  city: string
  state: string
  zip: string
}): string {
  const joined = [parts.line1, parts.line2 ?? '', parts.city, parts.state, parts.zip]
    .join(' ')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return crypto.createHash('sha256').update(joined, 'utf8').digest('hex')
}

/**
 * STRUCTURAL exclusion for any future export path (there is no export
 * tooling in this series — this helper exists so exclusion can never be
 * a thing someone remembers to do). A property record is exportable
 * only when a live (non-revoked) DATA_LICENSING consent covers it AND
 * no photo session tied to it was flagged PEOPLE_VISIBLE.
 *
 * Any future export MUST source its rows from this function.
 */
export async function exportableConsentedRecords(limit = 1000): Promise<
  Array<{ propertyRecordId: string; consentRecordId: string; reportId: string | null }>
> {
  const live = await prisma.consentRecord.findMany({
    where: { scope: 'DATA_LICENSING', revokedAt: null, propertyRecordId: { not: null } },
    select: { id: true, propertyRecordId: true, reportId: true },
    take: limit,
  })
  if (live.length === 0) return []

  // Exclude anything whose report carries a PEOPLE_VISIBLE QA flag.
  const reportIds = live.map((c) => c.reportId).filter((r): r is string => r != null)
  const flagged = reportIds.length
    ? await prisma.qAFlag.findMany({
        where: { reportId: { in: reportIds }, type: 'PEOPLE_VISIBLE' },
        select: { reportId: true },
      })
    : []
  const flaggedSet = new Set(flagged.map((f) => f.reportId))

  return live
    .filter((c) => !(c.reportId && flaggedSet.has(c.reportId)))
    .map((c) => ({
      propertyRecordId: c.propertyRecordId as string,
      consentRecordId: c.id,
      reportId: c.reportId,
    }))
}
