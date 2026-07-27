/**
 * v7.4.0 — Safety routing (product rule 2).
 *
 * Anything structural, electrical-panel, gas, roofing, mold, foundation,
 * major-plumbing, or fire-safety routes to INVESTIGATE with a
 * professional-verification next step. Never diagnose safety from a photo.
 * Enforced deterministically here — not just asked of the model.
 */

import type { Candidate } from './types'

const SAFETY_FLAGS = new Set([
  'structural',
  'electrical_panel',
  'gas',
  'roofing',
  'mold_suspected',
  'foundation',
  'major_plumbing',
  'fire_safety',
])

// Belt-and-suspenders keyword scan in case the model under-flags.
const SAFETY_KEYWORDS =
  /\b(mold|asbestos|structural|foundation crack|gas leak|gas line|electrical panel|knob.and.tube|roof leak|re-?roof|sewage|septic failure|fire hazard|smoke detector missing|carbon monoxide)\b/i

const NEXT_STEP: Record<string, string> = {
  structural: 'Have a structural professional assess this in person before spending anything.',
  electrical_panel: 'Have a licensed electrician evaluate the panel — this is not diagnosable from a photo.',
  gas: 'Have a licensed professional inspect anything gas-related before acting.',
  roofing: 'Get an on-roof inspection from a roofing professional; photos cannot confirm roof condition.',
  mold_suspected: 'Confirm with a moisture meter or professional test before treating this as mold.',
  foundation: 'Have a foundation professional measure and assess before any purchase.',
  major_plumbing: 'Have a plumber scope this — photo evidence is not enough to size the fix.',
  fire_safety: 'Verify with your local fire safety resources or a licensed professional.',
}

export interface SafetyResult {
  isSafetyRouted: boolean
  flag: string | null
  nextStep: string | null
}

export function checkSafety(candidate: Candidate): SafetyResult {
  const flags = candidate.risk_flags.filter((f) => SAFETY_FLAGS.has(f))
  if (flags.length > 0) {
    return { isSafetyRouted: true, flag: flags[0], nextStep: NEXT_STEP[flags[0]] }
  }
  const text = `${candidate.title} ${candidate.summary} ${candidate.next_action}`
  const m = text.match(SAFETY_KEYWORDS)
  if (m) {
    return {
      isSafetyRouted: true,
      flag: 'keyword_match',
      nextStep: 'Confirm with a qualified professional before acting — this is not diagnosable from a photo.',
    }
  }
  return { isSafetyRouted: false, flag: null, nextStep: null }
}
