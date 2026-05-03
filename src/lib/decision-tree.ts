// V5 decision tree. Picks the per-visitor surface strategy by walking
// CONFIG.decisionTree.paths top-down — first match wins. Returns a
// Strategy describing how many accessory kits and project recs to
// render, plus an optional list of kit ids to force.
//
// Branch order matters. refund_risk_suppress is first so refund-risk
// topics never receive upsells, regardless of intent or season.
// researching_email_first is second so researchers never see affiliates.
// catch_all is last so unmatched contexts default to zero upsell.

import { CONFIG } from './recommender-config'
import type { VisitorSignals, PropertyProfile } from './property-modules'
import type {
  Season,
  DecisionTreeBranch,
  DecisionTreeStrategy,
} from './recommender-config.types'

export type Strategy = {
  name: string
  type: DecisionTreeStrategy
  kPrimary: number
  kRecommendation: number
  forceKitIds: string[]
}

// Season + lake/flood live outside VisitorSignals (V4 constraint).
// Caller pre-computes via inferSeason() / isLakeProperty() and hands
// them in.
export type StrategyContext = {
  signals: VisitorSignals
  profile: PropertyProfile
  season: Season
  isLakeProperty: boolean
  isFloodProperty: boolean
}

export function selectStrategy(ctx: StrategyContext): Strategy {
  if (!CONFIG.decisionTree.enabled) {
    return {
      name: 'config_disabled',
      type: 'balanced',
      kPrimary: 1,
      kRecommendation: 1,
      forceKitIds: [],
    }
  }

  for (const branch of CONFIG.decisionTree.paths) {
    if (matches(branch, ctx)) {
      return {
        name: branch.name,
        type: branch.strategy,
        kPrimary: branch.kPrimary,
        kRecommendation: branch.kRecommendation,
        forceKitIds: branch.forceKitIds ?? [],
      }
    }
  }

  return {
    name: 'no_match',
    type: 'zero_upsell',
    kPrimary: 0,
    kRecommendation: 0,
    forceKitIds: [],
  }
}

function matches(branch: DecisionTreeBranch, ctx: StrategyContext): boolean {
  const w = branch.when

  if (w.refundRiskFlag !== undefined && ctx.signals.refundRiskFlag !== w.refundRiskFlag) {
    return false
  }

  if (w.intent && !w.intent.includes(ctx.signals.topLevelIntent as 'owner' | 'buying' | 'researching')) {
    // signals.topLevelIntent can be 'looking' which the tree never matches
    // by intent — those visitors fall through to catch_all.
    return false
  }

  if (w.topic && (!ctx.signals.topic || !w.topic.includes(ctx.signals.topic))) {
    return false
  }

  if (w.season && !w.season.includes(ctx.season)) {
    return false
  }

  if (w.townTier && !w.townTier.includes(ctx.signals.townTier)) {
    return false
  }

  if (w.isLakeProperty !== undefined && ctx.isLakeProperty !== w.isLakeProperty) {
    return false
  }

  if (w.isFloodProperty !== undefined && ctx.isFloodProperty !== w.isFloodProperty) {
    return false
  }

  return true
}
