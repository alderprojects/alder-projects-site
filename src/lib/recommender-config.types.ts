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
}
