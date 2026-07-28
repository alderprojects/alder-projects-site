/**
 * v7.4.0 — Quality + privacy gate.
 *
 * Runs BEFORE candidate generation. Two jobs:
 *
 * 1. Privacy: exclude photos whose extraction indicates people, faces,
 *    documents, screens with readable content, or visible addresses.
 *
 *    v7.4.12 — `people_present` alone is NOT sufficient to discard a
 *    photo. Observed 2026-07-28: an empty bathroom (large mirror,
 *    hanging towel) came back people_present=true / faces_visible=false
 *    with five clean fixture features and zero person features, and the
 *    hard gate threw the whole session away. `faces_visible` remains an
 *    absolute exclusion — that is the identifiability signal that
 *    matters. A bare `people_present` now needs corroboration from the
 *    feature vocabulary; uncorroborated, the photo is analyzed and the
 *    session is flagged PEOPLE_VISIBLE, which already excludes it
 *    structurally from any future dataset/export path (v7.4.8
 *    exportableConsentedRecords). The customer gets their read; the
 *    data asset stays clean.
 *    Extraction prompt v1.2.0 emits an optional `privacy` object; legacy
 *    v1.1.0 extractions don't have it, so we also keyword-scan feature
 *    types/conditions as a fallback. Excluded photos are counted and
 *    surfaced to the user ("1 photo excluded (person detected)") but their
 *    features never reach the model. Full crop/redact hardening is v7.4.3.
 *
 * 2. Quality: drop features below a confidence floor and photos with zero
 *    usable signal, then merge the surviving features across the SET —
 *    batch reasoning (life-stage, multi-room) requires the whole batch.
 */

import { prisma } from '@/lib/db'
import type { GateResult, MergedFeature } from './types'

const FEATURE_CONFIDENCE_FLOOR = 0.3

const PRIVACY_KEYWORDS = /\b(person|people|face|child|children|pet_owner|document|mail|envelope|address_visible|screen_content|photo_of_person)\b/

interface ExtractionShape {
  features?: Array<{
    type: string
    location: string
    condition: string
    confidence: number
    category_hint: string
  }>
  overall_photo_category?: string
  privacy?: {
    people_present?: boolean
    faces_visible?: boolean
    documents_visible?: boolean
    readable_screens?: boolean
    address_visible?: boolean
  }
}

/** Feature-vocabulary corroboration for a bare `people_present` flag. */
const PERSON_FEATURE = /\b(person|people|human|face|child|children|baby|occupant|hand|arm|leg|body|portrait|pet_owner|photo_of_person)\b/

export async function runGate(snapshotIds: string[]): Promise<GateResult> {
  const photos = await prisma.photo.findMany({
    where: { roomSnapshotId: { in: snapshotIds }, hiddenAt: null },
    include: { extractions: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })

  const features: MergedFeature[] = []
  const exclusionSummary: Array<{ photoId: string; reason: string }> = []
  const softPersonPhotoIds: string[] = []
  let includedPhotoCount = 0

  for (const photo of photos) {
    const extraction = photo.extractions[0]
    if (!extraction) {
      exclusionSummary.push({ photoId: photo.id, reason: 'no_extraction' })
      continue
    }
    const json = extraction.extractionJson as unknown as ExtractionShape
    const privacyReason = privacyExclusionReason(json)
    if (privacyReason) {
      exclusionSummary.push({ photoId: photo.id, reason: privacyReason })
      continue
    }
    // Uncorroborated people_present: analyze, but mark the session so a
    // human reviews it and it never reaches a dataset.
    if (json.privacy?.people_present && !hasPersonFeature(json)) {
      softPersonPhotoIds.push(photo.id)
    }
    const usable = (json.features ?? []).filter((f) => f.confidence >= FEATURE_CONFIDENCE_FLOOR)
    if (usable.length === 0) {
      exclusionSummary.push({ photoId: photo.id, reason: 'no_usable_signal' })
      continue
    }
    includedPhotoCount++
    for (const f of usable) {
      features.push({ ...f, photoId: photo.id })
    }
  }

  return {
    features,
    includedPhotoCount,
    // Privacy exclusions only — "no signal" photos aren't reported as
    // exclusions to the user (they just contribute nothing).
    excludedPhotoCount: exclusionSummary.filter((e) => isPrivacyReason(e.reason)).length,
    exclusionSummary,
    softPersonPhotoIds,
  }
}

function hasPersonFeature(json: ExtractionShape): boolean {
  for (const f of json.features ?? []) {
    if (PERSON_FEATURE.test(f.type) || PERSON_FEATURE.test(f.condition.toLowerCase())) return true
  }
  return false
}

function privacyExclusionReason(json: ExtractionShape): string | null {
  const p = json.privacy
  if (p) {
    // Faces are the identifiability signal — always an exclusion.
    if (p.faces_visible) return 'person_detected'
    // people_present alone excludes only when the feature vocabulary
    // agrees a person is actually in frame (v7.4.12).
    if (p.people_present && hasPersonFeature(json)) return 'person_detected'
    if (p.documents_visible) return 'document_detected'
    if (p.readable_screens) return 'screen_content_detected'
    if (p.address_visible) return 'address_detected'
  }
  // Legacy-extraction fallback: keyword scan over feature vocabulary
  for (const f of json.features ?? []) {
    if (PRIVACY_KEYWORDS.test(f.type) || PRIVACY_KEYWORDS.test(f.condition.toLowerCase())) {
      return 'person_detected'
    }
  }
  return null
}

function isPrivacyReason(reason: string): boolean {
  return reason.endsWith('_detected')
}

/** User-facing exclusion line, e.g. "1 photo excluded (person detected) — not analyzed." */
export function exclusionLine(result: GateResult): string | null {
  if (result.excludedPhotoCount === 0) return null
  const reasons = new Set(
    result.exclusionSummary.filter((e) => isPrivacyReason(e.reason)).map((e) => e.reason.replace(/_/g, ' '))
  )
  const noun = result.excludedPhotoCount === 1 ? 'photo' : 'photos'
  return `${result.excludedPhotoCount} ${noun} excluded (${Array.from(reasons).join(', ')}) — not analyzed.`
}
