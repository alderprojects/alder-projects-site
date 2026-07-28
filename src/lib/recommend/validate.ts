/**
 * v7.4.0 — Validation pass (the last gate before persistence).
 *
 * Enforces the non-negotiable product rules deterministically:
 *   V1 Every report contains ≥1 SKIP or WAIT (the honesty invariant).
 *      If the model produced none, the lowest-confidence BUY is demoted
 *      to WAIT with honest copy — never ship an all-BUY report.
 *   V2 No fabricated precision: any dollar figure, percentage, or
 *      payback claim in LLM-authored text fields is stripped (numbers
 *      live only in dataset-backed costLow/costHigh/rebate fields).
 *   V3 No person/household/demographic inference in any text field.
 *   V4 No brand names in Check-visible text (spot-check against a list
 *      of common home-product brands; cart artifacts are exempt — SKUs
 *      are exactly what the paid tier is for).
 *   V5 INVESTIGATE recs are never smartCartEligible.
 *   V6 Upsell facts must be computed facts: buyCount reported to the
 *      caller is counted here, from the validated set — copy layers can
 *      only state what this function returns.
 *   V7 A BUY may never rest on an ABSENCE claim. You cannot prove a
 *      negative from one photo: "no exhaust fan visible" means the fan
 *      wasn't seen, not that it isn't there. Observed on prod
 *      2026-07-28 — the same bathroom extracted
 *      `bathroom_ventilation_present` on one run and "no ventilation
 *      visible" on the next, and the second produced BUY "Add exhaust
 *      ventilation" for a room that already had a vent. The grounding
 *      gate cannot catch this: the claim legitimately cites a feature,
 *      and the falsehood lives inside that feature's text. So an
 *      absence-grounded BUY is demoted to INVESTIGATE, which asks the
 *      homeowner to confirm rather than telling them to spend.
 */

import type { EnrichedRecommendation } from './types'

/**
 * Absence language in evidence text. Deliberately narrow — it must hit
 * "no exhaust fan visible" / "lacks a vent" / "none visible" and NOT
 * ordinary condition text like "no longer sealed" or "shows no rust".
 */
const ABSENCE_CLAIM =
  /\b(?:no|not)\s+(?:\w+\s+){0,3}(?:visible|present|installed|evident|detected|apparent|found)\b|\b(?:missing|absent|lacks?|lacking|without)\b|\bnone\s+(?:visible|present)\b|\bdoes\s+not\s+(?:appear|have)\b/i

const MONEY_OR_PRECISION = /\$\s?[\d,]+|(?:\d+(?:\.\d+)?)\s?%|\b\d+\s?(?:year|yr|month)s?\s+payback\b/gi

const PERSON_INFERENCE =
  /\b(family|families|kids?|child(?:ren)?|baby|babies|elderly|senior|wife|husband|spouse|income|afford|wealthy|budget-conscious|cluttered|messy|dirty|hoarder|tidy)\b/gi

// Common home-product brands that must never surface in Check copy.
const BRANDS =
  /\b(Panasonic|Broan|NuTone|Delta(?:\s?Breez)?|Mitsubishi|Daikin|Fujitsu|LG|Samsung|Whirlpool|GE|Bosch|Honeywell|Nest|Ecobee|Frigidaire|Rheem|A\.?O\.?\s?Smith|Kidde|First Alert|Govee|Aqara|Ring|3M|Frost King|Duck Brand|DeWalt|Milwaukee|Ryobi)\b/g

export interface ValidationResult {
  recs: EnrichedRecommendation[]
  buyCount: number
  skipOrWaitCount: number
  adjustments: string[] // audit trail of what validation changed
}

export function validateReport(recs: EnrichedRecommendation[]): ValidationResult {
  const adjustments: string[] = []

  // V2 + V3 + V4 — sanitize LLM-authored text fields
  for (const rec of recs) {
    rec.title = sanitize(rec.title, rec.key, adjustments)
    rec.summary = sanitize(rec.summary, rec.key, adjustments)
    rec.nextAction = sanitize(rec.nextAction, rec.key, adjustments)
    rec.visibleEvidence = rec.visibleEvidence.map((e) => sanitize(e, rec.key, adjustments))
    rec.assumptions = rec.assumptions.map((a) => sanitize(a, rec.key, adjustments))
    rec.limitations = rec.limitations.map((l) => sanitize(l, rec.key, adjustments))
  }

  // V5
  for (const rec of recs) {
    if (rec.verdict === 'INVESTIGATE' && rec.smartCartEligible) {
      rec.smartCartEligible = false
      adjustments.push(`${rec.key}: stripped smartCartEligible from INVESTIGATE`)
    }
  }

  // V7 — no BUY may rest on an absence claim (see header).
  for (const rec of recs) {
    if (rec.verdict !== 'BUY') continue
    const evidenceText = [...rec.visibleEvidence, rec.summary].join(' ')
    if (!ABSENCE_CLAIM.test(evidenceText)) continue
    rec.verdict = 'INVESTIGATE'
    rec.verdictReason = 'V7_absence_grounded_buy'
    rec.riskLevel = rec.riskLevel === 'none' ? 'low' : rec.riskLevel
    rec.smartCartEligible = false
    rec.categorySearchQuery = null
    rec.cartArtifacts = []
    rec.nextAction =
      'Check whether this is already there before buying anything — a single photo can miss equipment that exists just out of frame. If it genuinely is missing, this is worth doing.'
    adjustments.push(`${rec.key}: demoted BUY→INVESTIGATE — recommendation rests on an absence claim (V7)`)
  }

  // V1 — the honesty invariant
  let skipOrWait = recs.filter((r) => r.verdict === 'WAIT' || r.verdict === 'SKIP')
  if (skipOrWait.length === 0 && recs.length > 0) {
    const buys = recs.filter((r) => r.verdict === 'BUY').sort((a, b) => a.confidenceScore - b.confidenceScore)
    const demote = buys[0] ?? recs[recs.length - 1]
    demote.verdict = 'WAIT'
    demote.verdictReason = 'V1_demoted_for_honesty_invariant'
    demote.smartCartEligible = false
    demote.categorySearchQuery = null
    demote.cartArtifacts = []
    demote.nextAction =
      'This one is plausible but not urgent from what the photos show — wait until the higher-confidence items are handled.'
    adjustments.push(`${demote.key}: demoted BUY→WAIT to satisfy ≥1 SKIP/WAIT invariant`)
    skipOrWait = [demote]
  }

  const buyCount = recs.filter((r) => r.verdict === 'BUY').length

  return { recs, buyCount, skipOrWaitCount: skipOrWait.length, adjustments }
}

function sanitize(text: string, key: string, adjustments: string[]): string {
  let out = text
  if (MONEY_OR_PRECISION.test(out)) {
    out = out.replace(MONEY_OR_PRECISION, '[see cost range]')
    adjustments.push(`${key}: stripped fabricated precision from text`)
  }
  if (PERSON_INFERENCE.test(out)) {
    out = out.replace(PERSON_INFERENCE, '').replace(/\s{2,}/g, ' ').trim()
    adjustments.push(`${key}: stripped person/household inference from text`)
  }
  if (BRANDS.test(out)) {
    out = out.replace(BRANDS, 'a suitable product').replace(/\s{2,}/g, ' ').trim()
    adjustments.push(`${key}: stripped brand name from Check-visible text`)
  }
  // Reset lastIndex on the global regexes (test() advances them)
  MONEY_OR_PRECISION.lastIndex = 0
  PERSON_INFERENCE.lastIndex = 0
  BRANDS.lastIndex = 0
  return out
}
