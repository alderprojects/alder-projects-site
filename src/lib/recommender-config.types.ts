// Schema for the cross-topic recommender + accessory engine.
//
// Every tunable that drives ranking, revenue scoring, CTA tier inference,
// engagement gating, seasonal context, refund-risk handling, and reasoning
// strings lives in src/lib/recommender-config.ts as a single CONFIG
// constant. This module declares the shape of that constant so the
// recommenders read it as typed data, not magic numbers.
//
// Phase 2 plan: move CONFIG to public/recommender-config.json and import
// via fetch so non-deploy edits are possible. The schema here stays.

import type { TopicId, TownTier } from './property-modules'

export type Season =
  | 'mud'
  | 'spring_blackfly'
  | 'lake'
  | 'fall_leaf'
  | 'pre_winter'
  | 'deep_winter'

export type CtaTier =
  | 'contractor_lead' // highest revenue: pushes to a Vermont contractor lead form
  | 'mid_tier'        // mid revenue: chat handoff or premium accessory kit
  | 'chat_handoff'    // chat-only revenue path
  | 'info_only'       // no revenue path; pure information

export type AffinityEdge = {
  weight: number          // 0..1 — affinity strength used as ranking signal
  citation?: string       // human-readable evidence reference (research note)
}

export type CtaTierRule = {
  when: { topic?: TopicId | TopicId[]; townTier?: TownTier[] }
  tier: CtaTier
}

export type EngagementGateConfig = {
  scrollDepthPercent: number  // 0..100
  timeOnPageSeconds: number
  requireOneOf: ('scroll' | 'chat' | 'cost_tier' | 'time')[]
}

export type SeasonalWindow = {
  season: Season
  startMonth: number          // 1..12
  startDay: number            // 1..31
  endMonth: number
  endDay: number
}

export type RefundRiskFlag = {
  name: string
  detect: 'topic_match' | 'signal_match'
  triggers: string[]          // topic ids or signal field values
}

export type FeatureFlags = {
  ENABLE_FRAMING_TOGGLE: boolean
}

// ---------- V5: Revenue forest ----------------------------------------
//
// V4 scored accessory kits with a single linear product
// (ticket × CTR × commission × conversion). V5 replaces that with an
// 8-feature weighted forest. Each feature returns 0..1, weights sum
// (with one negative weight for inventory dilution) to a per-kit total.
// Same forest is used by the property page accessory engine and the
// homepage seasonal strip — single source of truth.

export type RevenueForestConfig = {
  enabled: boolean
  featureWeights: {
    topicAffinity: number      // weight on direct/adjacent topic match
    seasonalAlignment: number  // weight on seasonal-boost match for kit topic
    ticketSize: number         // weight on revenue magnitude (normalized)
    clickThruRate: number      // weight on expected CTR (normalized)
    commissionRate: number     // weight on Amazon commission rate (normalized)
    townTierMatch: number      // weight on tier-vs-ticket alignment
    engagementSignal: number   // weight on engagement-gate-passed boolean
    inventoryDilution: number  // negative weight: penalty for already-shown kit topic
  }
  normalizers: {
    maxTicketSize: number      // kits above this ticket clip to 1.0
    maxClickThruRate: number   // kits above this CTR clip to 1.0
    maxCommissionRate: number  // commission rates above this clip to 1.0
  }
}

// ---------- V5: Decision tree -----------------------------------------
//
// Given (intent, topic, season, town tier, lake/flood flags, refund-risk),
// the tree picks a per-visitor surface strategy: aggressive upsell,
// balanced, email-capture-first, or zero-upsell. Branches are evaluated
// top-to-bottom; first match wins. The 'refund_risk_suppress' branch
// must come first so refund-risk topics never receive upsells.

export type DecisionTreeStrategy =
  | 'aggressive_upsell'
  | 'balanced'
  | 'email_first'
  | 'zero_upsell'

export type DecisionTreeBranch = {
  name: string
  when: {
    intent?: ('owner' | 'buying' | 'researching')[]
    topic?: TopicId[]
    season?: Season[]
    townTier?: TownTier[]
    isLakeProperty?: boolean
    isFloodProperty?: boolean
    refundRiskFlag?: boolean   // explicit true OR false; undefined skips check
  }
  strategy: DecisionTreeStrategy
  kPrimary: number             // # of accessory kits to render
  kRecommendation: number      // # of cross-project recommendations
  forceKitIds?: string[]       // override forest output if specific kits required
}

export type DecisionTreeConfig = {
  enabled: boolean
  paths: DecisionTreeBranch[]  // ordered, first match wins
}

// ---------- V5: Homepage block ----------------------------------------
//
// Every homepage tunable lives here so components carry zero magic
// numbers. The homepage funnels cold visitors toward an address entry,
// a topic-specific demo URL, an affiliate click, or an email capture —
// it does not synthesize by-address itself (that remains the property
// page's job).

export type CostWidgetRow = {
  label: string
  rangeLow: number             // statewide low end, dollars
  rangeHigh: number            // statewide high end, dollars
  rebateNote: string           // short rebate / stacking note
  topicId: TopicId             // links the row to the demo property page topic
}

export type TownGridEntry = {
  town: string                 // display name, e.g. 'Stowe'
  townTier: TownTier
  topServices: string[]        // 2-3 short labels: 'heat pump', 'kitchen', 'solar'
  pageSlug: string             // URL slug under /, e.g. 'stowe-vt'
}

export type HomepageConfig = {
  enabled: boolean
  sampleProperty: {
    address: string
    slug: string
    label: string              // CTA copy, e.g. 'See a sample property →'
  }
  intentDemoLinks: {
    buying: string
    owner: string
    researching: string
  }
  costWidget: {
    enabled: boolean
    rows: CostWidgetRow[]
  }
  townGrid: {
    enabled: boolean
    towns: TownGridEntry[]
  }
  seasonalStrip: {
    enabled: boolean
    kitBySeason: Partial<Record<Season, string>>            // season → kit id
    articleBySeason: Partial<Record<Season, { title: string; url: string }>>
  }
  trustStrip: {
    enabled: boolean
    dataSources: string[]
    lastUpdatedNote: string
  }
  emailCapture: {
    enabled: boolean
    promise: string
    cadence: string
  }
  crossLinks: {
    mudSeasonArticle: string
    townsIndex: string
    disclosure: string
  }
}

export type RecommenderConfig = {
  version: string
  topicAffinity: Partial<Record<TopicId, Partial<Record<TopicId, AffinityEdge>>>>
  revenueTiers: Record<CtaTier, number>
  revenueAssumptions: {
    commissionRate: number    // Amazon Associates avg 3-4.5%
    conversionRate: number    // share of clicks that convert
  }
  ctaTierRules: CtaTierRule[]
  engagementGate: EngagementGateConfig
  seasonalWindows: SeasonalWindow[]
  seasonalTopicBoosts: Partial<Record<TopicId, Season[]>>
  lakeTowns: string[]
  refundRiskFlags: RefundRiskFlag[]
  reasoningTemplates: Record<string, string>
  featureFlags: FeatureFlags
  // V5 additions
  revenueForest: RevenueForestConfig
  decisionTree: DecisionTreeConfig
  homepage: HomepageConfig
}
