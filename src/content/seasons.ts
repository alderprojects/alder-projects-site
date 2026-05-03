// Seasonal guide content registry. Each season has its own prose
// file in src/content/seasons/{slug}.ts. This file imports each one
// and exports them as a single map keyed by slug, plus a slug list
// for sitemap generation and the /seasons index page.
//
// Note: the "mud" season's guide is the existing
// /vermont-mud-season-homeowner-guide page (custom layout, not in
// this folder). The 5 net-new V6 seasonal guides are listed here.

import type { SeasonalGuideContent } from './templates/seasonal-guide-template'
import type { Season } from '../lib/recommender-config.types'

import { LAKE_SEASON_CONTENT } from './seasons/lake-season'
import { SPRING_BLACKFLY_CONTENT } from './seasons/spring-blackfly'
import { FALL_LEAF_WEATHERIZATION_CONTENT } from './seasons/fall-leaf-weatherization'
import { PRE_WINTER_PREP_CONTENT } from './seasons/pre-winter-prep'
import { DEEP_WINTER_CONTENT } from './seasons/deep-winter'

export const SEASON_CONTENT: Record<string, SeasonalGuideContent> = {
  'lake-season': LAKE_SEASON_CONTENT,
  'spring-blackfly': SPRING_BLACKFLY_CONTENT,
  'fall-leaf-weatherization': FALL_LEAF_WEATHERIZATION_CONTENT,
  'pre-winter-prep': PRE_WINTER_PREP_CONTENT,
  'deep-winter': DEEP_WINTER_CONTENT,
}

export const SEASON_SLUGS = Object.keys(SEASON_CONTENT)

// Map from season identifier (CONFIG.seasonalWindows season key) to
// the matching seasonal guide URL. Drives /seasons index page,
// homepage seasonal strip article link, and inline cross-links.
export const SEASON_TO_GUIDE_URL: Partial<Record<Season, string>> = {
  lake: '/vermont-lake-season',
  spring_blackfly: '/vermont-spring-blackfly',
  fall_leaf: '/vermont-fall-leaf-weatherization',
  pre_winter: '/vermont-pre-winter-prep',
  deep_winter: '/vermont-deep-winter',
  mud: '/vermont-mud-season-homeowner-guide',
}

export type { SeasonalGuideContent } from './templates/seasonal-guide-template'
