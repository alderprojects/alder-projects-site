/**
 * v7.4.13 — CR3: quality-gated slot filling.
 *
 * A slot fills only when the quality of the observations supporting it
 * clears SLOT_QUALITY_FLOOR. The metric is the v7.4.9 PhotoQualityScore
 * formula, imported from lib/score/score.ts — same curve, same constants,
 * one implementation (§0.2: do not build a second quality metric).
 *
 * The substrate differs by necessity. RecScore's photoQualityScore reads a
 * recommendation's claimLinks, which is the right substrate for "is this
 * ADVICE well-supported". A coverage slot asks a different question — "did
 * this PHOTO actually show the thing" — whose evidence is the extraction
 * features that mapped to the slot. Scoring a slot off recommendation
 * claimLinks would be a category error: a strong water-heater rec says
 * nothing about whether the attic shot was any good.
 *
 * CR1: a near-miss is never a failure state. The session still gets its
 * normal read; the slot simply stays dark and we say what would fix it.
 */

import { qualityFromObservations } from '@/lib/score/score'
import { getSlot, GENERIC_SLOT_ID } from './schema'

/** Default floor. Overridable per-deploy via env for calibration. */
export const SLOT_QUALITY_FLOOR = Number(process.env.SLOT_QUALITY_FLOOR ?? 0.7)

/**
 * Band below the floor that earns a coaching message rather than silence.
 * Below this the photo didn't really show the thing at all, and telling the
 * user to "retake" would be noise.
 */
export const COACHING_BAND = 0.15

export interface SlotObservation {
  /** Feature type — used only for coaching specificity. */
  type: string
  confidence: number
}

export type SlotOutcome =
  | { state: 'FILL'; score: number }
  | { state: 'COACH'; score: number; message: string }
  | { state: 'NONE'; score: number }

/**
 * Score one slot's supporting observations and decide its fate.
 *
 * Returns FILL above the floor, COACH within COACHING_BAND below it, and
 * NONE further down (no fill, no message — nothing useful to say).
 */
export function evaluateSlot(
  systemId: string,
  slotId: string,
  observations: SlotObservation[]
): SlotOutcome {
  const distinct = new Set(observations.map((o) => o.type)).size
  const score = qualityFromObservations(
    observations.map((o) => o.confidence),
    distinct
  )

  if (score >= SLOT_QUALITY_FLOOR) return { state: 'FILL', score }
  if (score >= SLOT_QUALITY_FLOOR - COACHING_BAND) {
    return { state: 'COACH', score, message: coachingMessage(systemId, slotId) }
  }
  return { state: 'NONE', score }
}

/**
 * The concrete fix for a near-miss (CR3: "the concrete fix", e.g. "panel
 * door open, flash on").
 *
 * Slot-specific where a specific instruction exists, falling back to the
 * schema's own shot guidance — which is already written as an instruction,
 * so it reads correctly in this position without duplicating copy.
 */
const SLOT_COACHING: Readonly<Record<string, string>> = {
  'electrical/panel_door_open': 'Almost — the panel needs its door open, and flash on. Panels are darker than they look. Retake?',
  'electrical/panel_labeling': 'Almost — step closer so the label text is readable. Retake?',
  'plumbing/water_heater': 'Almost — one more of the dataplate sticker, close enough to read the model. Retake?',
  'hvac/unit_dataplate': 'Almost — step in close on the dataplate so the model and year read. Retake?',
  'roof_attic/attic_overview': 'Almost — attics need light. Flash on, or a flashlight pointed where you are shooting. Retake?',
  'roof_attic/insulation_depth': 'Almost — shoot across the insulation at a low angle so the depth shows, not straight down. Retake?',
  'basement_foundation/floor_perimeter': 'Almost — point down at the seam where the floor meets the wall, with the lights on. Retake?',
  'windows_doors/window_sill_seal': 'Almost — closer on the seal where the sash meets the frame, so the caulk line is visible. Retake?',
}

export function coachingMessage(systemId: string, slotId: string): string {
  const specific = SLOT_COACHING[`${systemId}/${slotId}`]
  if (specific) return specific
  if (slotId === GENERIC_SLOT_ID) {
    return 'Almost — a little more light and a step back would let us read this one. Retake?'
  }
  // The schema's guidance is written as a standalone instruction, so it
  // stands as its own sentence here rather than being spliced mid-clause.
  const guidance = getSlot(systemId, slotId)?.guidance
  return guidance ? `Almost. ${guidance} Retake?` : 'Almost — a bit more light would let us read this one. Retake?'
}
