// Scope variants for V7 Smart Cart and Worth-It Plan synthesis.
//
// A "scope variant" narrows a topic to the actual project shape the
// homeowner is buying for. Kitchen → cosmetic refresh, cabinet hardware
// swap, organizers, lighting swap, faucet swap. Each carries the
// metadata the engine needs: default execution lane, statewide cost
// range (no town adjustment — Smart Cart is property-independent),
// relevant accessory kit ids, overbuy trap ids, skip-list topic tags,
// and an optional shopping-timing category.
//
// The CurationModal (commit 18) renders the variants for the user to
// pick from. The synthesis function (commit 13) reads
// SCOPE_VARIANTS[topic][variantId] to build the lean cart.
//
// smartCartReady flag: V7 fully authors content for the variants
// flagged true. The remaining variants ship structurally and the
// engine fills picks from existing AffiliateItem.shortNote values.
// V7.1 fills full authored content for the deferred variants.

import type { TopicId } from './property-modules'

export type ExecutionLane = 'diy' | 'small_pro' | 'contractor'

export type ScopeVariant = {
  id: string                          // unique within topic
  topic: TopicId
  label: string                       // dropdown display
  description: string                 // 1-2 sentence helper text
  smartCartReady: boolean
  defaultLane: ExecutionLane
  estCostRange: { low: number; high: number }
  relevantKitIds: string[]            // existing ACCESSORY_KITS ids
  overbuyTrapIds: string[]            // src/content/overbuy-traps.ts entries
  skipListTopicTags: string[]         // src/content/skip-list.ts filter tags
  timingCategory?: string             // CONFIG.shoppingTiming key
}

// Spec ships 11 variants. 4 carry smartCartReady=true (V7 fully
// authored): kitchen_cosmetic_refresh, kitchen_cabinet_hardware_swap,
// weatherization_diy_air_sealing, outdoor_lake_season. The remaining
// 7 ship structurally for V7 launch and get full authored content
// in V7.1.

export const SCOPE_VARIANTS: Record<TopicId, ScopeVariant[]> = {
  // ---------- Kitchen (5 variants) -----------------------------------
  // V7.2.2: kitchen_organizers leads because it's the longest-verified
  // v2-curated catalog. Modal auto-default lands here when no explicit
  // data-curation-modal-scope is passed.
  kitchen: [
    {
      id: 'kitchen_organizers',
      topic: 'kitchen',
      label: 'Kitchen organizers',
      description: 'Drawer dividers, lazy susans, pantry organizers. Pulled from the existing kit; deeper authored content lands in V7.1.',
      smartCartReady: false,
      defaultLane: 'diy',
      estCostRange: { low: 40, high: 200 },
      relevantKitIds: ['kitchen_organizers'],
      overbuyTrapIds: ['organizer_premium_kits'],
      skipListTopicTags: ['kitchen_organizers'],
      timingCategory: 'kitchen_organizers',
    },
    {
      id: 'kitchen_cosmetic_refresh',
      topic: 'kitchen',
      label: 'Cosmetic refresh — paint, hardware, lighting',
      description: 'No layout changes. Saturday-afternoon DIY territory.',
      smartCartReady: true,
      defaultLane: 'diy',
      estCostRange: { low: 80, high: 220 },
      relevantKitIds: ['kitchen_organizers', 'kitchen_lighting'],
      overbuyTrapIds: ['kitchen_all_in_one_kit', 'kitchen_specialty_tools'],
      skipListTopicTags: ['kitchen_cosmetic'],
      timingCategory: 'paint',
    },
    {
      id: 'kitchen_cabinet_hardware_swap',
      topic: 'kitchen',
      label: 'Cabinet hardware swap',
      description: 'Pulls, hinges, soft-close. The "new kitchen" feel for under $200.',
      smartCartReady: true,
      defaultLane: 'diy',
      estCostRange: { low: 30, high: 180 },
      relevantKitIds: ['kitchen_organizers'],
      overbuyTrapIds: ['kitchen_premium_pulls', 'kitchen_decorative_hinges'],
      skipListTopicTags: ['kitchen_hardware'],
      timingCategory: 'kitchen_cabinet_hardware',
    },
    {
      id: 'kitchen_lighting_swap',
      topic: 'kitchen',
      label: 'Kitchen lighting swap',
      description: 'Under-cabinet LEDs and pendant fixtures. Ships structurally for V7; full authored content in V7.1.',
      smartCartReady: false,
      defaultLane: 'diy',
      estCostRange: { low: 30, high: 280 },
      relevantKitIds: ['kitchen_lighting'],
      overbuyTrapIds: ['lighting_smart_kits', 'lighting_specialty_drivers'],
      skipListTopicTags: ['kitchen_lighting'],
      timingCategory: 'light_fixtures',
    },
    {
      id: 'kitchen_faucet_swap',
      topic: 'kitchen',
      label: 'Faucet replacement',
      description: 'Single-handle faucet swap. DIY with caveats — verify the shutoff valves first.',
      smartCartReady: false,
      defaultLane: 'diy',
      estCostRange: { low: 80, high: 320 },
      relevantKitIds: [],
      overbuyTrapIds: ['faucet_specialty_tools', 'faucet_premium_brands'],
      skipListTopicTags: ['kitchen_faucet'],
    },
  ],

  // ---------- Weatherization (2 variants) ----------------------------
  weatherization: [
    {
      id: 'weatherization_diy_air_sealing',
      topic: 'weatherization',
      label: 'DIY air sealing — caulk, foam, weatherstrip',
      description: 'The high-payoff DIY pass. Submit receipts to EVT for $100 cash back.',
      smartCartReady: true,
      defaultLane: 'diy',
      estCostRange: { low: 60, high: 180 },
      relevantKitIds: ['diy_weatherization_tools'],
      overbuyTrapIds: ['weatherization_smart_thermostat_first', 'weatherization_bulk_insulation'],
      skipListTopicTags: ['weatherization_diy'],
      timingCategory: 'weatherization_materials',
    },
    {
      id: 'weatherization_attic_basics',
      topic: 'weatherization',
      label: 'Attic insulation basics',
      description: 'Attic plate seal + add-on insulation. Pro-handed-off if rafters are tight; DIY otherwise.',
      smartCartReady: false,
      defaultLane: 'small_pro',
      estCostRange: { low: 200, high: 1200 },
      relevantKitIds: ['diy_weatherization_tools'],
      overbuyTrapIds: ['weatherization_bulk_insulation'],
      skipListTopicTags: ['weatherization_attic'],
      timingCategory: 'weatherization_materials',
    },
  ],

  // ---------- Outdoor (5 variants) -----------------------------------
  // V7.2.2: outdoor_lake_season leads because it becomes v2-curated in
  // this PR (Section 4). outdoor_deck_refresh stays available via the
  // dropdown for buyers whose project doesn't fit lake-season.
  // V7.2.5: 3 new variants (freeze prevention, seasonal opening, dock
  // & lake) ship structurally; pastes 2-4 fill in catalog content and
  // flip smartCartReady to true.
  outdoor: [
    {
      id: 'outdoor_lake_season',
      topic: 'outdoor',
      label: 'Lake season — open-up + lake-rated picks',
      description: 'Early-summer lake-house open-up. Sunbrella, marine-grade, mosquito control.',
      smartCartReady: true,
      defaultLane: 'diy',
      estCostRange: { low: 200, high: 800 },
      relevantKitIds: ['outdoor_furniture', 'outdoor_textiles', 'outdoor_storage', 'fire_pit_heat'],
      overbuyTrapIds: ['lake_propane_patio_heater', 'lake_specialty_cleaners', 'lake_citronella'],
      skipListTopicTags: ['outdoor_lake', 'outdoor_textiles'],
      timingCategory: 'lake_dock_hardware',
    },
    {
      id: 'outdoor_deck_refresh',
      topic: 'outdoor',
      label: 'Deck refresh — stain, hardware, soft goods',
      description: 'Spring-to-summer cosmetic refresh of an existing deck. Ships structurally for V7.',
      smartCartReady: true, // v7.2.5 paste 2 — catalog ingested
      defaultLane: 'diy',
      estCostRange: { low: 120, high: 450 },
      relevantKitIds: ['outdoor_furniture', 'outdoor_textiles', 'outdoor_storage'],
      overbuyTrapIds: ['deck_premium_stain', 'deck_specialty_cleaner'],
      skipListTopicTags: ['outdoor_deck', 'outdoor_textiles'],
      timingCategory: 'patio_furniture',
    },

    // ===== v7.2.5 — outdoor additions ===============================
    {
      id: 'outdoor_freeze_prevention',
      topic: 'outdoor',
      label: 'Winterization & freeze prevention',
      description:
        'Detect, prevent, and contain frozen-pipe risk before the season.',
      smartCartReady: true, // v7.2.5 paste 2 — catalog ingested
      defaultLane: 'diy',
      estCostRange: { low: 100, high: 500 },
      relevantKitIds: ['outdoor_freeze_prevention', 'home_freeze_kit'],
      overbuyTrapIds: [],
      skipListTopicTags: ['outdoor_freeze_prevention', 'winterization'],
      timingCategory: 'fall_closing',
    },
    {
      id: 'outdoor_seasonal_opening',
      topic: 'outdoor',
      label: 'Spring opening & water startup',
      description:
        'Open a seasonal home without losing the first weekend to leaks, missing supplies, and reset work.',
      smartCartReady: true, // v7.2.5 paste 2 — catalog ingested
      defaultLane: 'diy',
      estCostRange: { low: 80, high: 300 },
      relevantKitIds: ['outdoor_seasonal_opening', 'home_water_startup'],
      overbuyTrapIds: [],
      skipListTopicTags: ['outdoor_seasonal_opening'],
      timingCategory: 'spring_opening',
    },
    {
      id: 'outdoor_dock_lake',
      topic: 'outdoor',
      label: 'Dock & lake practical maintenance',
      description:
        'Make the dock and lake setup safer and more usable without turning every issue into a rebuild.',
      smartCartReady: false, // flips to true in paste 4
      defaultLane: 'diy',
      estCostRange: { low: 150, high: 800 },
      relevantKitIds: ['outdoor_dock_lake'],
      overbuyTrapIds: [],
      skipListTopicTags: ['dock', 'lake_practical'],
      timingCategory: 'spring_opening',
    },
  ],

  // ---------- Heat pump (1 variant) ----------------------------------
  heat_pump: [
    {
      id: 'heat_pump_readiness_prep',
      topic: 'heat_pump',
      label: 'Heat pump readiness prep — DIY draft & comfort plan',
      description: 'Pre-install prep: airflow tuning, thermostat schedule, register/return checks.',
      smartCartReady: false,
      defaultLane: 'diy',
      estCostRange: { low: 0, high: 35 },
      relevantKitIds: ['smart_thermostat'],
      overbuyTrapIds: ['heat_pump_thermostat_before_air_seal'],
      skipListTopicTags: ['heat_pump_prep'],
      timingCategory: 'smart_thermostat',
    },
  ],

  // ---------- Bath (1 variant) ---------------------------------------
  bath: [
    {
      id: 'bath_accessibility_basics',
      topic: 'bath',
      label: 'Accessibility basics — grab bars, anti-slip',
      description: 'Aging-in-place safety basics. DIY if studs are reachable.',
      smartCartReady: false,
      defaultLane: 'diy',
      estCostRange: { low: 80, high: 320 },
      relevantKitIds: ['bath_organization'],
      overbuyTrapIds: ['bath_specialty_grab_bars', 'bath_premium_fixtures'],
      skipListTopicTags: ['bath_accessibility'],
    },
  ],

  // ---------- Topics without V7 scope variants -----------------------
  // Topics outside the V7 scope-variant matrix still have empty arrays
  // so consumers can iterate the SCOPE_VARIANTS map safely.
  solar_battery: [],
  addition_adu: [],
  rebate_strat: [],
  property_tax: [],
  flood_zone: [],
  rebate_eligibility: [],
  contractor_vetting: [],
  general_orientation: [],
  mud_season: [],
  well_septic: [],

  // ---------- Mudroom (1 variant — v7.2.5) ---------------------------
  mudroom: [
    {
      id: 'mudroom_entry_reset',
      topic: 'mudroom',
      label: 'Mudroom & entry reset',
      description:
        'Keep mud, boots, wet gear, and lake stuff from taking over the house.',
      smartCartReady: false, // flips to true in paste 3
      defaultLane: 'diy',
      estCostRange: { low: 80, high: 400 },
      relevantKitIds: ['mudroom_entry_reset'],
      overbuyTrapIds: [],
      skipListTopicTags: ['mudroom'],
      timingCategory: 'mud_season',
    },
  ],

  // ---------- Home repair (3 variants — v7.2.5) ----------------------
  home_repair: [
    {
      id: 'home_moisture_control',
      topic: 'home_repair',
      label: 'Moisture & smell prevention',
      description:
        'Catch moisture problems before they become smell, mold, or repair issues.',
      smartCartReady: true, // v7.2.5 paste 3 — catalog ingested
      defaultLane: 'diy',
      estCostRange: { low: 80, high: 450 },
      relevantKitIds: ['home_moisture_control'],
      overbuyTrapIds: [],
      skipListTopicTags: ['moisture'],
      timingCategory: 'year_round',
    },
    {
      id: 'home_water_quality',
      topic: 'home_repair',
      label: 'Water quality & filtration',
      description:
        'Test before treating. Avoid buying the wrong filter for the wrong water problem.',
      smartCartReady: false, // flips to true in paste 4
      defaultLane: 'diy',
      estCostRange: { low: 50, high: 350 },
      relevantKitIds: ['home_water_quality'],
      overbuyTrapIds: [],
      skipListTopicTags: ['water_quality'],
      timingCategory: 'spring_opening',
    },
    {
      id: 'home_safety_kit',
      topic: 'home_repair',
      label: 'Seasonal home safety kit',
      description:
        'Cover the basics that are easy to forget when a home is used seasonally.',
      smartCartReady: false, // flips to true in paste 4
      defaultLane: 'diy',
      estCostRange: { low: 120, high: 450 },
      relevantKitIds: ['home_safety_kit'],
      overbuyTrapIds: [],
      skipListTopicTags: ['safety'],
      timingCategory: 'year_round',
    },
  ],

  // ---------- Universal (2 variants — v7.2.5) ------------------------
  // Cross-project tools and prep that show up across multiple scope
  // contexts. Universal scopes are fully-featured catalogs in their
  // own right; the result page does not auto-blend them into other
  // carts (that's a result-page UX decision deferred to post-paste-4).
  universal: [
    {
      id: 'universal_owner_kit',
      topic: 'universal',
      label: 'Small repair owner kit',
      description:
        'The minimal kit that prevents extra trips and avoids buying contractor-grade tools.',
      smartCartReady: true, // v7.2.5 paste 3 — catalog ingested
      defaultLane: 'diy',
      estCostRange: { low: 120, high: 500 },
      relevantKitIds: ['universal_owner_kit'],
      overbuyTrapIds: [],
      skipListTopicTags: ['owner_tools'],
      timingCategory: 'year_round',
    },
    {
      id: 'universal_project_prep',
      topic: 'universal',
      label: 'Project prep, measure, document',
      description:
        'Get the measurements, photos, and notes right before buying materials or calling someone.',
      smartCartReady: false, // flips to true in paste 4
      defaultLane: 'diy',
      estCostRange: { low: 40, high: 200 },
      relevantKitIds: ['universal_project_prep'],
      overbuyTrapIds: [],
      skipListTopicTags: ['project_prep'],
      timingCategory: 'year_round',
    },
  ],
}

// ---------- Helpers ---------------------------------------------------

export function getScopeVariant(topic: TopicId, variantId: string): ScopeVariant | undefined {
  return SCOPE_VARIANTS[topic].find(v => v.id === variantId)
}

export function getScopeVariantsForTopic(topic: TopicId): ScopeVariant[] {
  return SCOPE_VARIANTS[topic] ?? []
}

// Topics that have at least one V7 scope variant — drives the topic
// dropdown in the curation modal.
export function getV7Topics(): TopicId[] {
  return (Object.keys(SCOPE_VARIANTS) as TopicId[]).filter(t => SCOPE_VARIANTS[t].length > 0)
}

// Variants flagged smartCartReady=true — used by tests to confirm V7
// content coverage and by analytics to label launch-tier variants.
export function getReadyVariants(): ScopeVariant[] {
  const ready: ScopeVariant[] = []
  for (const variants of Object.values(SCOPE_VARIANTS)) {
    for (const v of variants) if (v.smartCartReady) ready.push(v)
  }
  return ready
}
