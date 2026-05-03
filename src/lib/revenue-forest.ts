// V5 revenue forest. Replaces V4's linear ticket × CTR × commission ×
// conversion product with an 8-feature weighted forest. Each feature
// returns 0..1; weights from CONFIG.revenueForest.featureWeights sum
// (with one negative weight for inventory dilution) to a per-kit score.
// Used by both the property-page accessory engine and the homepage
// seasonal strip — single source of truth.
//
// Phase 2 (after 30 days of GA4 data): retune feature weights from real
// click data. Phase 3 (after 100+ affiliate conversions): replace the
// hand-weighted forest with a fitted logistic regression.

import { CONFIG } from './recommender-config'
import type { AccessoryKit } from '@/data/affiliates'
import type { VisitorSignals, PropertyProfile, TopicId } from './property-modules'
import type { Season } from './recommender-config.types'

export type ForestFeatures = {
  topicAffinity: number
  seasonalAlignment: number
  ticketSize: number
  clickThruRate: number
  commissionRate: number
  townTierMatch: number
  engagementSignal: number
  inventoryDilution: number
}

export type ForestScore = {
  total: number
  features: ForestFeatures
}

// Season + lake/flood live outside VisitorSignals (V4 constraint). The
// caller pre-computes them via inferSeason() / isLakeProperty() and
// hands them in. alreadyShownKitTopics drives the inventoryDilution
// penalty so we don't stack two outdoor kits.
export type ScoringContext = {
  signals: VisitorSignals
  profile: PropertyProfile
  season: Season
  isLakeProperty: boolean
  isFloodProperty: boolean
  alreadyShownKitTopics: TopicId[]
  engagementGatePassed: boolean
}

export function scoreKitWithForest(
  kit: AccessoryKit,
  ctx: ScoringContext
): ForestScore {
  const w = CONFIG.revenueForest.featureWeights
  const norm = CONFIG.revenueForest.normalizers
  const kitTopic = kit.topic as TopicId

  // 1. Topic affinity. Direct match = 1.0; otherwise read the affinity
  //    matrix for adjacency strength.
  let topicAffinity = 0
  if (ctx.signals.topic && kitTopic === ctx.signals.topic) {
    topicAffinity = 1.0
  } else {
    const fromTopic = ctx.signals.topic ?? 'general_orientation'
    const aff = CONFIG.topicAffinity[fromTopic]
    topicAffinity = aff?.[kitTopic]?.weight ?? 0
  }

  // 2. Seasonal alignment. Base 0.3 so off-season kits still surface
  //    (just deprioritized); 1.0 when the kit's topic is explicitly
  //    boosted in this season.
  const seasonBoosts = CONFIG.seasonalTopicBoosts[kitTopic] ?? []
  const seasonalAlignment = seasonBoosts.includes(ctx.season) ? 1.0 : 0.3

  // 3. Ticket size. Normalized; clipped at maxTicketSize.
  const ticketSize = Math.min(1.0, kit.estimatedTicketSize / norm.maxTicketSize)

  // 4. Click-through rate. Normalized; clipped at maxClickThruRate.
  const clickThruRate = Math.min(1.0, kit.expectedClickThruRate / norm.maxClickThruRate)

  // 5. Commission rate. Drawn from CONFIG.revenueAssumptions (single
  //    site-wide rate today; per-kit rate is a phase-2 extension).
  const commissionRate = Math.min(
    1.0,
    CONFIG.revenueAssumptions.commissionRate / norm.maxCommissionRate
  )

  // 6. Town tier × ticket alignment. Resort_premium gets the high-ticket
  //    boost; rural gets the low-ticket boost. Everyone else: neutral 0.5.
  let townTierMatch = 0.5
  if (ctx.signals.townTier === 'resort_premium' && kit.estimatedTicketSize >= 500) {
    townTierMatch = 1.0
  } else if (ctx.signals.townTier === 'rural' && kit.estimatedTicketSize < 300) {
    townTierMatch = 1.0
  }

  // 7. Engagement signal. 1.0 only if the visitor cleared the gate.
  const engagementSignal = ctx.engagementGatePassed ? 1.0 : 0.0

  // 8. Inventory dilution. 1.0 when the same topic is already on the
  //    page (multiplied by the negative weight to become a penalty).
  const inventoryDilution = ctx.alreadyShownKitTopics.includes(kitTopic) ? 1.0 : 0.0

  const features: ForestFeatures = {
    topicAffinity,
    seasonalAlignment,
    ticketSize,
    clickThruRate,
    commissionRate,
    townTierMatch,
    engagementSignal,
    inventoryDilution,
  }

  const total =
      features.topicAffinity     * w.topicAffinity
    + features.seasonalAlignment * w.seasonalAlignment
    + features.ticketSize        * w.ticketSize
    + features.clickThruRate     * w.clickThruRate
    + features.commissionRate    * w.commissionRate
    + features.townTierMatch     * w.townTierMatch
    + features.engagementSignal  * w.engagementSignal
    + features.inventoryDilution * w.inventoryDilution

  return { total, features }
}
