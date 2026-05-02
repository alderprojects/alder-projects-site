// Module ranker for the intent-aware property page.
//
// scoreModule + rankModules implement the relevance arithmetic per
// the Track C spec. Two helpers ride along:
//
// - detectRefundRisk: derives the refundRiskFlag from out-of-band
//   signals (referrer, intent). The flag suppresses big-CTA modules
//   so we don't push contractor leads where our data is thinner
//   (mobile homes, landlord, accessibility, pre-purchase).
//
// - classifyIntentMode: when the visitor only gives us topLevelIntent
//   + topic (the standard two-click hero flow), this maps that pair
//   to one of the five intent modes.

import type {
  IntentMode,
  PropertyModule,
  TopLevelIntent,
  TopicId,
  VisitorSignals,
} from './property-modules'

// ---------- Weights ----------------------------------------------------

const W_INTENT = 3
const W_MODE = 3
const W_TOPIC = 3
const W_SCOPE = 2
const W_TOWN = 1
const W_REVENUE = 1.5
const REFUND_PENALTY = 5
const UNIVERSAL_FLOOR = 5

// ---------- Scoring ----------------------------------------------------

export function scoreModule(m: PropertyModule, s: VisitorSignals): number {
  const r = m.relevanceFactors

  let score = 0
  score += (r.intentMatch[s.topLevelIntent] ?? 0) * W_INTENT
  score += (r.modeMatch[s.intentMode] ?? 0) * W_MODE
  if (s.topic && r.topicMatch[s.topic] !== undefined) {
    score += (r.topicMatch[s.topic] ?? 0) * W_TOPIC
  }
  score += (r.scopeMatch[s.scope] ?? 0) * W_SCOPE
  score += (r.townTierMatch[s.townTier] ?? 0) * W_TOWN
  score += m.revenueWeight * W_REVENUE

  if (s.refundRiskFlag && !m.refundRiskCompatible) {
    score -= REFUND_PENALTY
  }
  if (r.isUniversal) score += UNIVERSAL_FLOOR

  return score
}

export function rankModules(modules: PropertyModule[], signals: VisitorSignals): PropertyModule[] {
  return modules
    .filter(m => m.relevanceFactors.isUniversal || (signals.refundRiskFlag ? m.refundRiskCompatible : true))
    .map(m => ({ m, score: scoreModule(m, signals) }))
    .sort((a, b) => b.score - a.score)
    .map(({ m }) => m)
}

// ---------- Refund-risk detection -------------------------------------

// Keywords that, when found in a referring article slug, mark the
// visitor as in a refund-risk topic where we suppress big-ticket CTAs.
const REFUND_RISK_SLUG_KEYWORDS = [
  'mobile-home',
  'mobilehome',
  'manufactured-home',
  'landlord',
  'rental-property',
  'multi-unit',
  'accessibility',
  'aging-in-place',
  'aging',
  'ada',
] as const

export function detectRefundRisk(signals: Pick<VisitorSignals, 'topLevelIntent' | 'cameFromArticleSlug'>): boolean {
  // Pre-purchase: if the visitor is buying, contractor leads do not
  // make sense yet (they don't own the property). Suppress big CTAs;
  // info modules and chat still show.
  if (signals.topLevelIntent === 'buying') return true

  const slug = signals.cameFromArticleSlug?.toLowerCase() ?? ''
  if (!slug) return false
  return REFUND_RISK_SLUG_KEYWORDS.some(k => slug.includes(k))
}

// ---------- Intent mode classification --------------------------------

// Topics that are info-shaped — visitor is asking ABOUT something rather
// than DOING something. Looking these up is mode='lookup'.
const LOOKUP_TOPICS: ReadonlySet<TopicId> = new Set<TopicId>([
  'property_tax',
  'flood_zone',
  'rebate_eligibility',
  'contractor_vetting',
])

// Topics that imply taking on a project — execution rather than research.
// Owners doing these are 'do'; buyers asking about them are 'decide'.
const PROJECT_TOPICS: ReadonlySet<TopicId> = new Set<TopicId>([
  'heat_pump',
  'kitchen',
  'bath',
  'solar_battery',
  'outdoor',
  'addition_adu',
  'weatherization',
  'rebate_strat',
  'well_septic',
])

// Topics that are time-bound or in-the-moment — something is happening
// (or about to). Owners hit on these are in 'handle' mode.
const HANDLE_TOPICS: ReadonlySet<TopicId> = new Set<TopicId>(['mud_season'])


export function classifyIntentMode(
  topLevelIntent: TopLevelIntent,
  topic: TopicId | null
): IntentMode {
  // No topic yet — the visitor has only clicked a hero button. Default
  // mode for each top-level intent:
  if (topic === null) {
    switch (topLevelIntent) {
      case 'buying':
        return 'understand' // pre-purchase orientation
      case 'owner':
        return 'do' // I own this, help me act
      case 'looking':
        return 'understand' // browsing
      case 'researching':
        return 'understand'
    }
  }

  // With a topic, classify against the topic shape, then qualify by intent.
  if (LOOKUP_TOPICS.has(topic)) return 'lookup'
  if (HANDLE_TOPICS.has(topic) && topLevelIntent === 'owner') return 'handle'

  if (PROJECT_TOPICS.has(topic)) {
    if (topLevelIntent === 'owner') return 'do'
    if (topLevelIntent === 'buying') return 'decide'
    return 'understand' // looking/researching about a project
  }

  // general_orientation, mud_season for non-owners, anything unmapped:
  return 'understand'
}
