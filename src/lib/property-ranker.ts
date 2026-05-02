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
  PropertyProfile,
  Scope,
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

// ---------- Signal extraction from URL params --------------------------
//
// Lives here (rather than in the client RankedModuleStream) so the server
// page can call it during SSR. Next.js does not allow a server component
// to invoke a function exported from a 'use client' module — those become
// Client References at the boundary. Putting it in property-ranker.ts
// (no 'use client') keeps it callable from both sides.

const TOP_LEVEL_INTENTS: TopLevelIntent[] = ['buying', 'owner', 'looking', 'researching']
const INTENT_MODES: IntentMode[] = ['decide', 'do', 'understand', 'lookup', 'handle']
const SCOPES: Scope[] = ['diy', 'mid', 'big', 'na']
const TOPIC_VALUES = new Set<TopicId>([
  'heat_pump',
  'kitchen',
  'bath',
  'solar_battery',
  'outdoor',
  'addition_adu',
  'weatherization',
  'rebate_strat',
  'property_tax',
  'flood_zone',
  'rebate_eligibility',
  'contractor_vetting',
  'general_orientation',
  'mud_season',
  'well_septic',
])

function asIntent(s: string | null | undefined): TopLevelIntent {
  return s && TOP_LEVEL_INTENTS.includes(s as TopLevelIntent) ? (s as TopLevelIntent) : 'researching'
}
function asMode(s: string | null | undefined): IntentMode | null {
  return s && INTENT_MODES.includes(s as IntentMode) ? (s as IntentMode) : null
}
function asScope(s: string | null | undefined): Scope {
  return s && SCOPES.includes(s as Scope) ? (s as Scope) : 'na'
}
function asTopic(s: string | null | undefined): TopicId | null {
  return s && TOPIC_VALUES.has(s as TopicId) ? (s as TopicId) : null
}

export function computeSignalsFromParams(
  params: { intent?: string; topic?: string; mode?: string; scope?: string; from?: string },
  profile: PropertyProfile,
  sessionDepth = 0
): VisitorSignals {
  const intent = asIntent(params.intent)
  const topic = asTopic(params.topic)
  const mode = asMode(params.mode) ?? classifyIntentMode(intent, topic)
  const cameFromArticleSlug = params.from ?? null
  const refundRiskFlag = detectRefundRisk({ topLevelIntent: intent, cameFromArticleSlug })
  // Scope is inferred from {topic, townTier, intent}. The legacy ?scope=
  // URL param is ignored — scope is no longer a user-facing input.
  const scope = inferScope({
    topic,
    townTier: profile.bucket,
    topLevelIntent: intent,
  })
  return {
    topLevelIntent: intent,
    intentMode: mode,
    topic,
    scope,
    townTier: profile.bucket,
    utilityServiceArea: profile.utility,
    refundRiskFlag,
    sessionDepth,
    cameFromArticleSlug,
  }
}

// ---------- Scope inference -------------------------------------------
//
// Scope used to be a click signal (DIY / Mid / Big tier). The polish
// pass collapsed it into a derived value: scope is computed from the
// topic, the property's town tier, and the visitor's top-level intent.
// Visitors can still expand cost-tier accordions to read budget / mid /
// high details — those are reading affordances, not scope-setters.

const INFER_SCOPE_PROJECT_TOPICS: ReadonlySet<TopicId> = new Set<TopicId>([
  'kitchen',
  'bath',
  'heat_pump',
  'solar_battery',
  'outdoor',
  'addition_adu',
  'weatherization',
  'rebate_strat',
])

export function inferScope(signals: {
  topic: TopicId | null
  townTier: VisitorSignals['townTier']
  topLevelIntent?: TopLevelIntent
}): Scope {
  if (!signals.topic) return 'na'
  if (!INFER_SCOPE_PROJECT_TOPICS.has(signals.topic)) return 'na'
  if (signals.townTier === 'resort_premium' || signals.townTier === 'burlington_metro') return 'big'
  if (signals.topic === 'addition_adu' || signals.topic === 'kitchen') return 'big'
  if (signals.topic === 'weatherization' || signals.topic === 'rebate_strat') return 'mid'
  return 'mid'
}
