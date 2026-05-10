// Topic guide content registry. Each topic guide has its own
// prose file in src/content/topics/{slug}.ts. This file imports
// each one and exports them as a single map keyed by slug, plus
// a slug list for sitemap generation and the /guides index.

import type { TopicGuideContent } from './templates/topic-guide-template'

import { HEAT_PUMP_REBATE_STACK_2026_CONTENT } from './topics/vermont-heat-pump-rebate-stack-2026'
import { VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT } from './topics/vermont-weatherization-evt-rebate'
import { VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT } from './topics/vermont-solar-battery-stack-2026'
import { VERMONT_ADU_PERMIT_COST_2026_CONTENT } from './topics/vermont-adu-permit-cost-2026'
import { VERMONT_REBATE_STACK_2026_CONTENT } from './topics/vermont-rebate-stack-2026'
// v7.2.14 — pilot guides
import { WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT } from './topics/window-film-vs-replacement-vermont'
import { BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT } from './topics/before-finishing-basement-moisture-checks-vermont'

export const TOPIC_CONTENT: Record<string, TopicGuideContent> = {
  'vermont-heat-pump-rebate-stack-2026': HEAT_PUMP_REBATE_STACK_2026_CONTENT,
  'vermont-weatherization-evt-rebate': VERMONT_WEATHERIZATION_EVT_REBATE_CONTENT,
  'vermont-solar-battery-stack-2026': VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT,
  'vermont-adu-permit-cost-2026': VERMONT_ADU_PERMIT_COST_2026_CONTENT,
  'vermont-rebate-stack-2026': VERMONT_REBATE_STACK_2026_CONTENT,
  // v7.2.14
  'window-film-vs-replacement-vermont': WINDOW_FILM_VS_REPLACEMENT_VERMONT_CONTENT,
  'before-finishing-basement-moisture-checks-vermont':
    BEFORE_FINISHING_BASEMENT_MOISTURE_CHECKS_VERMONT_CONTENT,
}

export const TOPIC_SLUGS = Object.keys(TOPIC_CONTENT)

export type { TopicGuideContent } from './templates/topic-guide-template'
