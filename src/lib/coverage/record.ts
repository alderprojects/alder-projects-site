/**
 * v7.4.13 — Home Record service: create-or-attach, and slot filling.
 *
 * Entry points:
 *   attachReportToRecord()  — called on email capture (§1.1 create-or-attach)
 *   fillSlotsForReport()    — called after synthesis, once a report is claimed
 *
 * Both are idempotent. The backfill job (scripts/backfill-home-records.ts)
 * calls exactly these, which is why a second backfill run cannot duplicate
 * anything (§2 idempotency test).
 *
 * CR5: nothing here exposes completeness outside an authenticated context.
 * These functions return data; only /record renders it, behind a claim.
 */

import { prisma } from '@/lib/db'
import { logEvent } from '@/lib/events/log'
import { mapFeatures, type MappableFeature } from './mapping'
import { evaluateSlot, type SlotObservation } from './quality'
import { freshUntilFor } from './state'
import { COVERAGE_SCHEMA_VERSION, GENERIC_SLOT_ID } from './schema'

export const COVERAGE_EVENTS = {
  RECORD_CREATED: 'RECORD_CREATED',
  RECORD_CLAIMED: 'RECORD_CLAIMED',
  SLOT_FILLED: 'SLOT_FILLED',
  SLOT_COACHED: 'SLOT_COACHED',
  SLOT_RETRY_UPLOAD: 'SLOT_RETRY_UPLOAD',
  SUMMARY_GENERATED: 'SUMMARY_GENERATED',
  ASSESSMENT_INTEREST: 'ASSESSMENT_INTEREST',
  COVERAGE_NUDGE_SHOWN: 'COVERAGE_NUDGE_SHOWN',
  COVERAGE_NUDGE_CLICKED: 'COVERAGE_NUDGE_CLICKED',
} as const

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Get the record for an email, creating it if absent. Safe under
 * concurrency: the unique index on email is the arbiter, and a losing
 * race falls back to a read.
 */
export async function getOrCreateRecord(
  email: string,
  opts: { userId?: string | null; source?: 'capture' | 'claim' | 'backfill' } = {}
): Promise<{ id: string; created: boolean }> {
  const normalized = normalizeEmail(email)
  const existing = await prisma.homeRecord.findUnique({ where: { email: normalized }, select: { id: true } })
  if (existing) {
    // Late-binding the userId: capture creates the record anonymously,
    // a later magic-link claim attaches the User.
    if (opts.userId) {
      await prisma.homeRecord.updateMany({
        where: { id: existing.id, userId: null },
        data: { userId: opts.userId },
      })
    }
    return { id: existing.id, created: false }
  }

  try {
    const rec = await prisma.homeRecord.create({
      data: { email: normalized, userId: opts.userId ?? null, schemaVersion: COVERAGE_SCHEMA_VERSION },
      select: { id: true },
    })
    await logEvent({
      eventType: COVERAGE_EVENTS.RECORD_CREATED,
      subjectType: 'HomeRecord',
      subjectId: rec.id,
      payload: { source: opts.source ?? 'capture', schemaVersion: COVERAGE_SCHEMA_VERSION },
      source: opts.source === 'backfill' ? 'system' : 'web',
    })
    return { id: rec.id, created: true }
  } catch {
    // Lost the create race — the row exists now.
    const row = await prisma.homeRecord.findUnique({ where: { email: normalized }, select: { id: true } })
    if (!row) throw new Error(`getOrCreateRecord: could not resolve record for ${normalized}`)
    return { id: row.id, created: false }
  }
}

/** Attach a report to the record for `email`, creating the record if needed. */
export async function attachReportToRecord(
  reportId: string,
  email: string,
  opts: { userId?: string | null; source?: 'capture' | 'claim' | 'backfill' } = {}
): Promise<{ recordId: string; created: boolean; attached: boolean }> {
  const { id: recordId, created } = await getOrCreateRecord(email, opts)
  const link = await prisma.homeRecordReport.upsert({
    where: { homeRecordId_reportId: { homeRecordId: recordId, reportId } },
    create: { homeRecordId: recordId, reportId },
    update: {},
    select: { attachedAt: true },
  })
  // `attached` is true only on the first link, so callers can avoid
  // re-emitting RECORD_CLAIMED on every capture.
  const attached = Date.now() - link.attachedAt.getTime() < 5000
  return { recordId, created, attached }
}

// ---------------------------------------------------------------------------
// Slot filling
// ---------------------------------------------------------------------------

export interface CoachedSlot {
  systemId: string
  slotId: string
  message: string
  score: number
}

export interface FillResult {
  recordId: string
  filled: Array<{ systemId: string; slotId: string; score: number; refreshed: boolean }>
  coached: CoachedSlot[]
  /** Feature types that mapped to no system — the schema v2 input. */
  unmapped: Array<{ type: string; categoryHint: string | null }>
}

interface ExtractionShape {
  features?: Array<{ type: string; confidence: number; category_hint?: string }>
}

/**
 * Read a report's stored extractions, map them onto coverage slots, and
 * fill the ones that clear the CR3 floor.
 *
 * Reads STORED extractions only — never re-runs vision. That is what makes
 * this safe to run over historical reports in the backfill.
 *
 * `taggedSlot` is set when the user entered from a specific empty slot
 * ("Read this"), which bypasses inference entirely.
 */
export async function fillSlotsForReport(
  reportId: string,
  recordId: string,
  opts: { taggedSlot?: { systemId: string; slotId: string } | null; now?: Date } = {}
): Promise<FillResult> {
  const now = opts.now ?? new Date()
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { snapshotIds: true, createdAt: true },
  })
  if (!report) throw new Error(`fillSlotsForReport: no report ${reportId}`)

  const photos = await prisma.photo.findMany({
    where: { roomSnapshotId: { in: report.snapshotIds }, hiddenAt: null },
    include: { extractions: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })

  // Group every observation by the slot it maps to.
  const observations = new Map<string, SlotObservation[]>()
  const unmapped: Array<{ type: string; categoryHint: string | null }> = []

  for (const photo of photos) {
    const extraction = photo.extractions[0]
    if (!extraction) continue
    const json = extraction.extractionJson as unknown as ExtractionShape
    const features: MappableFeature[] = (json.features ?? []).map((f) => ({
      type: f.type,
      confidence: f.confidence,
      category_hint: f.category_hint,
    }))
    const { matches, unmapped: u } = mapFeatures(features, opts.taggedSlot)
    unmapped.push(...u)
    matches.forEach((m, i) => {
      const key = `${m.systemId}/${m.slotId}`
      const list = observations.get(key) ?? []
      list.push({ type: features[i]?.type ?? 'unknown', confidence: features[i]?.confidence ?? 0 })
      observations.set(key, list)
    })
  }

  const filled: FillResult['filled'] = []
  const coached: CoachedSlot[] = []

  // The read date is the report's own date, not "now" — a backfilled 2025
  // report must age from when it was actually taken.
  const readAt = report.createdAt

  for (const [key, obs] of Array.from(observations.entries())) {
    const [systemId, slotId] = key.split('/')
    const outcome = evaluateSlot(systemId, slotId, obs)

    if (outcome.state === 'FILL') {
      const existing = await prisma.coverageSlot.findUnique({
        where: { homeRecordId_systemId_slotId: { homeRecordId: recordId, systemId, slotId } },
        select: { id: true, readAt: true, photoQualityScore: true, filledByReportId: true },
      })

      // Never let an older read overwrite a newer one — the backfill
      // processes reports in arbitrary order.
      if (existing && existing.readAt >= readAt) continue

      if (existing) {
        await prisma.coverageSlotHistory.create({
          data: {
            homeRecordId: recordId,
            systemId,
            slotId,
            filledByReportId: existing.filledByReportId,
            photoQualityScore: existing.photoQualityScore,
            readAt: existing.readAt,
          },
        })
      }

      await prisma.coverageSlot.upsert({
        where: { homeRecordId_systemId_slotId: { homeRecordId: recordId, systemId, slotId } },
        create: {
          homeRecordId: recordId,
          systemId,
          slotId,
          filledByReportId: reportId,
          photoQualityScore: outcome.score,
          readAt,
          freshUntil: freshUntilFor(readAt),
        },
        update: {
          filledByReportId: reportId,
          photoQualityScore: outcome.score,
          readAt,
          freshUntil: freshUntilFor(readAt),
        },
      })

      filled.push({ systemId, slotId, score: outcome.score, refreshed: existing != null })
      await logEvent({
        eventType: COVERAGE_EVENTS.SLOT_FILLED,
        subjectType: 'HomeRecord',
        subjectId: recordId,
        payload: {
          systemId,
          slotId,
          photoQualityScore: outcome.score,
          reportId,
          refreshed: existing != null,
          generic: slotId === GENERIC_SLOT_ID,
        },
      })
    } else if (outcome.state === 'COACH') {
      coached.push({ systemId, slotId, message: outcome.message, score: outcome.score })
      await logEvent({
        eventType: COVERAGE_EVENTS.SLOT_COACHED,
        subjectType: 'HomeRecord',
        subjectId: recordId,
        payload: { systemId, slotId, photoQualityScore: outcome.score, reportId },
      })
    }
  }

  return { recordId, filled, coached, unmapped }
}

/** Load a record's slots for the derived view. */
export async function loadRecordSlots(recordId: string) {
  return prisma.coverageSlot.findMany({
    where: { homeRecordId: recordId },
    select: { systemId: true, slotId: true, readAt: true, photoQualityScore: true, filledByReportId: true },
    orderBy: { readAt: 'desc' },
  })
}
