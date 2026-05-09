// V7.2.3 — Smart Cart V2 catalog registry.
//
// The registry imports all scope catalogs and the universe, exposes
// lookup helpers used by the webhook + checkout endpoints, and keeps
// `isV2Combination` and `getScenarioDefaults` signatures backwards-
// compatible with v7.2.1/v7.2.2 callers.
//
// v7.2.3 ships ONE catalog: kitchen_organizers (migrated to the new
// hybrid universe + scope-catalog model). The 3 v7.2.2 catalogs
// (kitchen_cosmetic_refresh, kitchen_cabinet_hardware_swap,
// outdoor_lake_season) plug in here when their content lands.

import type { CartTier, ScopeCatalog } from '@/lib/smart-cart-model'
import type { UniverseProduct } from '@/lib/smart-cart-universe'

import { UNIVERSE } from './universe'
import { KITCHEN_ORGANIZERS } from './scope-catalogs/kitchen-organizers'
import { KITCHEN_COSMETIC_REFRESH } from './scope-catalogs/kitchen-cosmetic-refresh'
import { KITCHEN_CABINET_HARDWARE_SWAP } from './scope-catalogs/kitchen-cabinet-hardware-swap'
import { OUTDOOR_LAKE_SEASON } from './scope-catalogs/outdoor-lake-season'
// V7.2.5
import { OUTDOOR_DECK_REFRESH } from './scope-catalogs/outdoor-deck-refresh'
import { OUTDOOR_SEASONAL_OPENING } from './scope-catalogs/outdoor-seasonal-opening'
import { OUTDOOR_FREEZE_PREVENTION } from './scope-catalogs/outdoor-freeze-prevention'
import { HOME_MOISTURE_CONTROL } from './scope-catalogs/home-moisture-control'
import { UNIVERSAL_OWNER_KIT } from './scope-catalogs/universal-owner-kit'
import { HOME_WATER_QUALITY } from './scope-catalogs/home-water-quality'
import { OUTDOOR_DOCK_LAKE } from './scope-catalogs/outdoor-dock-lake'
import { HOME_SAFETY_KIT } from './scope-catalogs/home-safety-kit'
import { UNIVERSAL_PROJECT_PREP } from './scope-catalogs/universal-project-prep'
// V7.2.6
import { MUDROOM_ENTRY_RESET } from './scope-catalogs/mudroom-entry-reset'

const CATALOGS: ScopeCatalog[] = [
  KITCHEN_ORGANIZERS,
  KITCHEN_COSMETIC_REFRESH,
  KITCHEN_CABINET_HARDWARE_SWAP,
  OUTDOOR_LAKE_SEASON,
  // V7.2.5 paste 2
  OUTDOOR_DECK_REFRESH,
  OUTDOOR_SEASONAL_OPENING,
  OUTDOOR_FREEZE_PREVENTION,
  // V7.2.5 paste 3
  HOME_MOISTURE_CONTROL,
  UNIVERSAL_OWNER_KIT,
  // V7.2.5 paste 4
  HOME_WATER_QUALITY,
  OUTDOOR_DOCK_LAKE,
  HOME_SAFETY_KIT,
  UNIVERSAL_PROJECT_PREP,
  // V7.2.6
  MUDROOM_ENTRY_RESET,
]

// ---------- Catalog lookup ------------------------------------------

export function getCatalog(
  topic: string,
  scopeVariantId: string,
): ScopeCatalog | null {
  return (
    CATALOGS.find(
      c => c.topic === topic && c.scopeVariantId === scopeVariantId,
    ) ?? null
  )
}

export function getAllCatalogs(): ScopeCatalog[] {
  return CATALOGS
}

export function isV2Combination(
  topic: string,
  scopeVariantId: string,
): boolean {
  return getCatalog(topic, scopeVariantId) !== null
}

// ---------- Scenario defaults ---------------------------------------
// V7.2.1/v7.2.2 callers (checkout route, webhook) use this to fill
// modal data plumbing when state-probe UI hasn't run. Signature
// preserved: always returns a value, falls back to sweet_spot/[] if
// the catalog or scenario is unknown.

export function getScenarioDefaults(
  topic: string,
  scopeVariantId: string,
  scenario: string,
): { selectedTier: CartTier; alreadyHave: string[] } {
  const catalog = getCatalog(topic, scopeVariantId)
  if (catalog && catalog.scenarioDefaults[scenario]) {
    return catalog.scenarioDefaults[scenario]
  }
  return { selectedTier: 'sweet_spot', alreadyHave: [] }
}

// ---------- Universe access -----------------------------------------

export function getUniverse(): UniverseProduct[] {
  return UNIVERSE
}
