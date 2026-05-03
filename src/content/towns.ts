// Town content registry. Each town has its own prose file in
// src/content/towns/{slug}.ts that exports a TownPageContent record.
// This file just imports and re-exports them as a single map keyed
// by slug, plus a slug list for sitemap generation.
//
// Adding a new town: write src/content/towns/{slug}.ts following
// town-page-template.ts, run voice-guide rubric, then add an import
// + entry to TOWN_CONTENT below. That's the only mutation needed.

import type { TownPageContent } from './templates/town-page-template'

import { STOWE_CONTENT } from './towns/stowe'
import { BURLINGTON_CONTENT } from './towns/burlington'
import { VERGENNES_CONTENT } from './towns/vergennes'
import { MONTPELIER_CONTENT } from './towns/montpelier'
import { MANCHESTER_CONTENT } from './towns/manchester'
import { WOODSTOCK_CONTENT } from './towns/woodstock'
import { MIDDLEBURY_CONTENT } from './towns/middlebury'
import { BRATTLEBORO_CONTENT } from './towns/brattleboro'
import { ST_JOHNSBURY_CONTENT } from './towns/st-johnsbury'

export const TOWN_CONTENT: Record<string, TownPageContent> = {
  'stowe-vt': STOWE_CONTENT,
  'burlington-vt': BURLINGTON_CONTENT,
  'vergennes-vt': VERGENNES_CONTENT,
  'montpelier-vt': MONTPELIER_CONTENT,
  'manchester-vt': MANCHESTER_CONTENT,
  'woodstock-vt': WOODSTOCK_CONTENT,
  'middlebury-vt': MIDDLEBURY_CONTENT,
  'brattleboro-vt': BRATTLEBORO_CONTENT,
  'st-johnsbury-vt': ST_JOHNSBURY_CONTENT,
}

export const TOWN_SLUGS = Object.keys(TOWN_CONTENT)

export type { TownPageContent } from './templates/town-page-template'
