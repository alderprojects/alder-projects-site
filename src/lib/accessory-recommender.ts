// V5 accessory kit recommender. Drives kit selection via the decision
// tree (which strategy to serve) + the revenue forest (which kits win
// under that strategy). Replaces V4's linear ticket × CTR × commission
// × conversion product with the 8-feature forest in revenue-forest.ts.
//
// Strategy.kPrimary controls how many kits to render.
// Strategy.forceKitIds lets a branch override the forest output (e.g.
// the prewinter_heat_pump branch forces smart_thermostat + hvac_supplements
// regardless of what the forest would otherwise pick).
// When the forest is in charge, picks are made iteratively so the
// inventoryDilution penalty kicks in for second/third placements on the
// same topic — keeps a page from stacking two outdoor kits.

import { ACCESSORY_KITS, type AccessoryKit } from '@/data/affiliates'
import { scoreKitWithForest, type ForestFeatures, type ScoringContext } from './revenue-forest'
import { selectStrategy, type StrategyContext } from './decision-tree'
import { inferSeason, isLakeProperty, isFloodProperty } from './season-helpers'
import type { VisitorSignals, PropertyProfile, TopicId } from './property-modules'

export type AccessoryKitRec = AccessoryKit & {
  revenueScore: number
  forestFeatures: ForestFeatures
  strategyName: string
}

export function getAccessoryKits(
  signals: VisitorSignals,
  profile: PropertyProfile,
  engagementGatePassed: boolean
): AccessoryKitRec[] {
  const season = inferSeason(new Date())
  const lake = isLakeProperty(profile)
  const flood = isFloodProperty(profile)

  const strategyCtx: StrategyContext = {
    signals,
    profile,
    season,
    isLakeProperty: lake,
    isFloodProperty: flood,
  }

  const strategy = selectStrategy(strategyCtx)
  if (strategy.kPrimary === 0) return []

  const baseScoringCtx: ScoringContext = {
    signals,
    profile,
    season,
    isLakeProperty: lake,
    isFloodProperty: flood,
    alreadyShownKitTopics: [],
    engagementGatePassed,
  }

  // Forced kits: render the ids the branch named, in order, scored so we
  // still get telemetry on what the forest thought of them.
  if (strategy.forceKitIds.length > 0) {
    const forced: AccessoryKitRec[] = []
    const ctx: ScoringContext = { ...baseScoringCtx, alreadyShownKitTopics: [] }
    for (const kitId of strategy.forceKitIds.slice(0, strategy.kPrimary)) {
      const kit = ACCESSORY_KITS.find(k => k.id === kitId)
      if (!kit) continue
      const score = scoreKitWithForest(kit, ctx)
      forced.push({
        ...kit,
        revenueScore: score.total,
        forestFeatures: score.features,
        strategyName: strategy.name,
      })
      ctx.alreadyShownKitTopics.push(kit.topic as TopicId)
    }
    return forced
  }

  // Forest-driven: pick top kits iteratively so the inventoryDilution
  // penalty hits later picks. After each winner, re-score the rest with
  // the winner's topic now in alreadyShownKitTopics.
  const ctx: ScoringContext = { ...baseScoringCtx, alreadyShownKitTopics: [] }
  const remaining: AccessoryKit[] = ACCESSORY_KITS.slice()
  const winners: AccessoryKitRec[] = []

  while (winners.length < strategy.kPrimary && remaining.length > 0) {
    let bestIdx = 0
    let bestScore = -Infinity
    let bestFeatures: ForestFeatures | null = null

    for (let i = 0; i < remaining.length; i++) {
      const score = scoreKitWithForest(remaining[i], ctx)
      if (score.total > bestScore) {
        bestScore = score.total
        bestIdx = i
        bestFeatures = score.features
      }
    }

    if (!bestFeatures) break
    const winner = remaining.splice(bestIdx, 1)[0]
    winners.push({
      ...winner,
      revenueScore: bestScore,
      forestFeatures: bestFeatures,
      strategyName: strategy.name,
    })
    ctx.alreadyShownKitTopics.push(winner.topic as TopicId)
  }

  return winners
}
