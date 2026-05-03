// Cross-topic recommender. Given a visitor's signals, returns the top-K
// related topics worth surfacing in the RecommendationStrip on the
// property page. Reads everything from CONFIG — no hard-coded weights
// or thresholds live here.

import { CONFIG } from './recommender-config'
import type { CtaTier } from './recommender-config.types'
import type { Season } from './recommender-config.types'
import type { TopicId, VisitorSignals } from './property-modules'

export type Recommendation = {
  topicId: TopicId
  ctaTier: CtaTier
  score: number
  reasoning: string
  affinityWeight: number      // logged for analytics — lets us validate
                              // the configured weights against actual
                              // click-through behaviour.
}

function inferCtaTier(topic: TopicId, signals: VisitorSignals): CtaTier {
  for (const rule of CONFIG.ctaTierRules) {
    const topicMatch = !rule.when.topic
      ? true
      : Array.isArray(rule.when.topic)
        ? rule.when.topic.includes(topic)
        : rule.when.topic === topic
    const tierMatch = !rule.when.townTier
      ? true
      : rule.when.townTier.includes(signals.townTier)
    if (topicMatch && tierMatch) return rule.tier
  }
  return 'info_only'
}

function seasonalBoost(topic: TopicId, season?: Season | null): number {
  if (!season) return 0
  const boostedSeasons = CONFIG.seasonalTopicBoosts[topic]
  return (boostedSeasons ?? []).includes(season) ? 1 : 0
}

function buildReasoning(fromTopic: TopicId, toTopic: TopicId): string {
  const key = `${fromTopic}→${toTopic}`
  return CONFIG.reasoningTemplates[key] ?? CONFIG.reasoningTemplates['default']
}

// Optional season passed in by the caller (page mount infers via
// season-helpers.inferSeason and threads it through). We keep this
// out of VisitorSignals so the existing ranker doesn't need to know
// about season — it's a recommender-only signal.
type RecOptions = { season?: Season | null; k?: number }

export function getRecommendations(
  signals: VisitorSignals,
  options: RecOptions = {}
): Recommendation[] {
  const { season = null, k = 3 } = options

  if (!signals.topic) return []
  if (signals.refundRiskFlag) return []

  const candidates: Recommendation[] = []
  const affMap = CONFIG.topicAffinity[signals.topic] ?? {}

  for (const [topicIdRaw, edge] of Object.entries(affMap)) {
    if (!edge) continue
    const topicId = topicIdRaw as TopicId
    const ctaTier = inferCtaTier(topicId, signals)
    const revenueWeight = CONFIG.revenueTiers[ctaTier]

    const score =
        edge.weight * 3
      + revenueWeight
      + seasonalBoost(topicId, season)
      - (topicId === signals.topic ? 100 : 0)

    candidates.push({
      topicId,
      ctaTier,
      score,
      reasoning: buildReasoning(signals.topic, topicId),
      affinityWeight: edge.weight,
    })
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}
