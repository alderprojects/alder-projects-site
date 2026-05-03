// Accessory kit recommender. Picks 0..2 kits per page render:
//   - Direct: kits whose .topic matches signals.topic
//   - Adjacent: kits whose .topic appears in CONFIG.topicAffinity[signals.topic]
//     with weight >= 0.5; their revenue score is discounted by half the
//     affinity weight to reflect lower buyer intent
//   - No-topic / buying state: returns the first_year_essentials kit
//
// Returns nothing for researching state (suppressed) or refund-risk
// personas. Order matters: maxK=2 means at most one direct + one
// adjacent surface on a page render.

import { CONFIG } from './recommender-config'
import { ACCESSORY_KITS, type AccessoryKit } from '@/data/affiliates'
import type { VisitorSignals, PropertyProfile, TopicId } from './property-modules'

export type AccessoryKitRec = AccessoryKit & {
  revenueScore: number
  adjacencyDiscount: number   // 1.0 for direct match, 0..0.5 for adjacent
}

function calculateRevenueScore(kit: AccessoryKit): number {
  return kit.estimatedTicketSize
       * CONFIG.revenueAssumptions.commissionRate
       * kit.expectedClickThruRate
       * CONFIG.revenueAssumptions.conversionRate
}

export function getAccessoryKits(
  signals: VisitorSignals,
  _profile: PropertyProfile,
  k: number = 2
): AccessoryKitRec[] {
  // Researchers see no upsells — they're orienting, not transacting.
  if (signals.topLevelIntent === 'researching') return []
  if (signals.refundRiskFlag) return []

  // No topic chosen yet (owner-summary or buying state) — surface the
  // first-year essentials kit as a single fallback.
  if (!signals.topic) {
    const fy = ACCESSORY_KITS.find(k => k.id === 'first_year_essentials')
    return fy ? [{
      ...fy,
      revenueScore: calculateRevenueScore(fy),
      adjacencyDiscount: 1.0,
    }] : []
  }

  const directKits: AccessoryKitRec[] = ACCESSORY_KITS
    .filter(kit => kit.topic === signals.topic)
    .map(kit => ({
      ...kit,
      revenueScore: calculateRevenueScore(kit),
      adjacencyDiscount: 1.0,
    }))

  const affMap = CONFIG.topicAffinity[signals.topic] ?? {}
  const adjacentKits: AccessoryKitRec[] = []

  for (const [adjTopicRaw, edge] of Object.entries(affMap)) {
    if (!edge || edge.weight < 0.5) continue
    const adjTopic = adjTopicRaw as TopicId
    const kits = ACCESSORY_KITS.filter(kit => kit.topic === adjTopic)
    for (const kit of kits) {
      const discount = edge.weight * 0.5
      adjacentKits.push({
        ...kit,
        revenueScore: calculateRevenueScore(kit) * discount,
        adjacencyDiscount: discount,
      })
    }
  }

  return [...directKits, ...adjacentKits]
    .sort((a, b) => b.revenueScore - a.revenueScore)
    .slice(0, k)
}
