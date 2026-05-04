// V7.2.1 — Smart Cart V2 catalog registry.
//
// Each CatalogEntry binds a (topic, scopeVariantId) pair to a slot
// universe + skip list. The builder uses this registry to resolve
// what slots a buyer should see and what skip-for-now content to ship.
//
// v7.2.1 ships ONE entry: kitchen / kitchen_organizers (all four
// scenarios share the same slot universe; scenario differences are
// expressed via SCENARIO_DEFAULTS below for the modal data plumbing).

import type { CartSlot, SkipItemV2, CartTier } from '@/lib/smart-cart-model'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'
import { KITCHEN_ORGANIZERS_SLOTS } from './kitchen-organizers/slots'
import { KITCHEN_ORGANIZERS_SKIP_LIST } from './kitchen-organizers/skip-list'

export interface CatalogEntry {
  topic: TopicId
  scopeVariantId: string
  scenarios: BriefScenarioId[]                   // which scenarios this entry serves
  slotUniverse: CartSlot[]
  skipList: SkipItemV2[]
}

export const CATALOG: CatalogEntry[] = [
  {
    topic: 'kitchen',
    scopeVariantId: 'kitchen_organizers',
    scenarios: ['just_starting', 'already_have_basics', 'tight_budget', 'premium'],
    slotUniverse: KITCHEN_ORGANIZERS_SLOTS,
    skipList: KITCHEN_ORGANIZERS_SKIP_LIST,
  },
]

// Per-scenario defaults for the modal data plumbing. The state-probe
// UI is v7.2.2; in v7.2.1 the modal passes these defaults through.
export const SCENARIO_DEFAULTS: Record<
  string,                                        // key: `${topic}/${scope}/${scenario}`
  { selectedTier: CartTier; alreadyHave: string[] }
> = {
  'kitchen/kitchen_organizers/just_starting': {
    selectedTier: 'sweet_spot',
    alreadyHave: [],
  },
  'kitchen/kitchen_organizers/already_have_basics': {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_cutlery_tray', 'has_drawer_dividers'],
  },
  'kitchen/kitchen_organizers/tight_budget': {
    selectedTier: 'budget',
    alreadyHave: [],
  },
  'kitchen/kitchen_organizers/premium': {
    selectedTier: 'premium',
    alreadyHave: [],
  },
}

export function getSlotUniverse(topic: string, scope: string): CartSlot[] {
  const entry = CATALOG.find(e => e.topic === topic && e.scopeVariantId === scope)
  return entry?.slotUniverse ?? []
}

export function getSkipList(topic: string, scope: string): SkipItemV2[] {
  const entry = CATALOG.find(e => e.topic === topic && e.scopeVariantId === scope)
  return entry?.skipList ?? []
}

export function isV2Combination(topic: string, scope: string): boolean {
  return CATALOG.some(e => e.topic === topic && e.scopeVariantId === scope)
}

export function getScenarioDefaults(
  topic: string,
  scope: string,
  scenario: string,
): { selectedTier: CartTier; alreadyHave: string[] } {
  return (
    SCENARIO_DEFAULTS[`${topic}/${scope}/${scenario}`] ?? {
      selectedTier: 'sweet_spot',
      alreadyHave: [],
    }
  )
}
