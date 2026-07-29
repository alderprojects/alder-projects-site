/**
 * v7.4.14 — Copy canon. THE single source of truth for policy strings and
 * lane names.
 *
 * CR1: no page may hardcode a refund window or a lane name again. The July
 * 28 teardown found the site promising a 30-day refund on marketing pages
 * while transactional email promised 24 hours. That contradiction was
 * possible only because the strings lived in a dozen files. Importing from
 * here makes the contradiction class unrepresentable.
 *
 * `src/lib/constants.ts` re-exports the refund strings from this file, so
 * the older import path keeps working and there is still exactly one
 * definition.
 */

// ---------------------------------------------------------------------------
// Refund policy
// ---------------------------------------------------------------------------

/** The canonical window, in days. Any date math must use this. */
export const REFUND_WINDOW_DAYS = 30

/** Canonical full line — price + policy. Use where both belong together. */
export const REFUND_POLICY = '$19.99 · Full refund within 30 days, no questions asked.'

/**
 * The same window in hours. The Smart Cart config and the refund API
 * express the window in hours; deriving it here means the enforced window
 * and the promised window cannot diverge.
 *
 * v7.4.16: they HAD diverged. `CONFIG.products.smartCart.refundWindowHours`
 * was a hardcoded 24, interpolated at runtime into the purchase modal, the
 * pricing CTA, two CTA cards, the cart actions block, and the photo-cart
 * receipt — and enforced by /api/refund, which returned 422 after 24h. The
 * v7.4.14 grep searched for the literal text "24 hour" and so never saw any
 * of it. Never express this window as a literal again.
 */
export const REFUND_WINDOW_HOURS = REFUND_WINDOW_DAYS * 24

/** Policy alone, for surfaces that state the price separately. */
export const REFUND_POLICY_SHORT = 'Full refund within 30 days'

/** Long form for receipts and transactional email. */
export const REFUND_POLICY_FULL =
  'Full refund within 30 days, no questions asked. Reply "refund" to the receipt — no form.'

// ---------------------------------------------------------------------------
// Lanes
// ---------------------------------------------------------------------------

/**
 * IMPORTANT — display layer only.
 *
 * The engine's verdict enum is BUY | WAIT | SKIP | INVESTIGATE, it is
 * persisted on `Recommendation.verdict`, and live production rows already
 * carry 'INVESTIGATE'. v7.4.14 is a copy release (§1.8: no engine changes),
 * so the lane is RENAMED IN THE UI ONLY. `laneLabel()` is the mapping;
 * never rewrite the stored value or the enum.
 */
export type VerdictId = 'BUY' | 'SKIP' | 'WAIT' | 'INVESTIGATE'

export interface Lane {
  /** The engine's stored verdict value. */
  id: VerdictId
  /** What the reader sees. */
  label: string
  bg: string
  fg: string
}

/**
 * Display order for chip rows and legends: Buy / Skip / Wait / Monitor.
 * Colors are the ESTABLISHED result-card values from
 * components/check/VerdictCard.tsx, so the homepage and the real result
 * page cannot drift apart.
 */
export const LANES: readonly Lane[] = [
  { id: 'BUY', label: 'Buy', bg: '#e5efe2', fg: '#2d5a3d' },
  { id: 'SKIP', label: 'Skip', bg: '#f0e4e0', fg: '#8a3d2e' },
  { id: 'WAIT', label: 'Wait', bg: '#f3ecd9', fg: '#8a6d1f' },
  { id: 'INVESTIGATE', label: 'Monitor', bg: '#e7e9f0', fg: '#3d4a7a' },
] as const

const LANE_BY_ID = new Map(LANES.map((l) => [l.id, l]))

/** Reader-facing label for a stored verdict. 'INVESTIGATE' → 'Monitor'. */
export function laneLabel(verdict: string): string {
  return LANE_BY_ID.get(verdict as VerdictId)?.label ?? verdict
}

export function lane(verdict: string): Lane | undefined {
  return LANE_BY_ID.get(verdict as VerdictId)
}

/** "Buy / Skip / Wait / Monitor" — built from the canon, never typed out. */
export const LANE_LIST_PHRASE = LANES.map((l) => l.label).join(' / ')

// ---------------------------------------------------------------------------
// Calls to action
// ---------------------------------------------------------------------------

/** Everywhere the Check is the action. */
export const CTA_CHECK = 'Start my free Check'

/** Smart Cart keeps its own verb. */
export const CTA_CART = 'Build my Smart Cart'

// ---------------------------------------------------------------------------
// Hero + badges
// ---------------------------------------------------------------------------

export const HERO_SUBHEAD =
  'Photograph any room. Your free Check comes back in minutes — with evidence from your photos and at least one thing not to buy.'

/**
 * The badge row replaces three inline repetitions of "no account required"
 * above the fold. After v7.4.14 that phrase appears in prose zero times
 * above the fold (§2 grep assert).
 */
export const HERO_BADGES: readonly string[] = ['Free', 'No account', 'Costs verified & dated'] as const

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

export const FOOTER_TAGLINE =
  'Honest project guidance for your home. Costs verified and dated — deepest in Vermont.'

/**
 * /project-read badge. Reads "Free beta" until the owner decides an end
 * date and sets BETA_END_LABEL (e.g. "Free through Fall '26"), at which
 * point it is appended. Renders nothing extra while unset.
 */
export function betaBadge(endLabel: string | undefined = process.env.BETA_END_LABEL): string {
  const trimmed = endLabel?.trim()
  return trimmed ? `Free beta · ${trimmed}` : 'Free beta'
}

// ---------------------------------------------------------------------------
// Worth-It
// ---------------------------------------------------------------------------

export const WORTH_IT_DEFINITION =
  "Worth-It is the whole-house version of a Check — for renovation-scale decisions. Join the waitlist and we'll open it to you first."
