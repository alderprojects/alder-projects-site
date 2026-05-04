// Per-item price-range resolver for Smart Cart synthesis.
//
// The AffiliateItem catalog historically carried no price field — every
// lean-cart item that lacked a PICK_TIERS entry fell through to a hard-
// coded $25 default, which made every Smart Cart feel synthetic. This
// module fills that gap with three layers, in order:
//
//   1. PICK_TIERS mid-tier estPrice (when present)
//   2. Explicit per-item-id range (ITEM_ID_PRICES below)
//   3. Display-name pattern match (NAME_PATTERNS) — broadens coverage
//      when the id is unknown but the product name is recognizable
//   4. AffiliateCategory band (CATEGORY_BANDS) — last-resort coarse band
//
// All ranges are honest: low is the tight-pick equivalent at the
// hardware store; high is the premium pick. If the homeowner's actual
// purchase falls outside, the price is still in the right neighborhood
// instead of a flat $25.

import type { AffiliateItem, AffiliateCategory } from '@/data/affiliates'
import { PICK_TIERS } from './pick-tiers'

export type PriceRange = { low: number; high: number }

// ---------- Layer 2: explicit per-item-id ranges ---------------------
// Keyed off AffiliateItem.id. Filled from spec § Section 2 plus
// catalog inspection. Add to this map when a new item launches a
// Smart Cart surface and the price ought to be authored.
export const ITEM_ID_PRICES: Record<string, PriceRange> = {
  // Kitchen
  drawer_organizer: { low: 12, high: 35 },
  bamboo_drawer_divider: { low: 18, high: 38 },
  pantry_baskets: { low: 18, high: 45 },
  spice_insert: { low: 15, high: 35 },
  under_sink_organizer: { low: 18, high: 40 },
  cabinet_pulls: { low: 15, high: 80 },
  cabinet_refinish: { low: 35, high: 80 },
  pendant_lights_3pk: { low: 60, high: 180 },
  undermount_leds: { low: 25, high: 80 },
  motion_pantry_light: { low: 8, high: 28 },
  edison_bulbs_6pk: { low: 14, high: 35 },
  led_strip_kit: { low: 25, high: 80 },

  // Outdoor / lake
  patio_cushions_sunbrella: { low: 180, high: 480 },
  patio_4pc_set: { low: 280, high: 850 },
  cantilever_umbrella: { low: 90, high: 280 },
  outdoor_rug_8x10: { low: 60, high: 180 },
  side_table_pair: { low: 50, high: 150 },
  brightech_string_lights: { low: 28, high: 60 },
  patio_furniture_covers_set: { low: 35, high: 75 },
  keter_deck_box: { low: 90, high: 160 },

  // Heat pump / weatherization / air quality
  smart_thermostat: { low: 130, high: 270 },
  ecobee_premium: { low: 220, high: 270 },
  ecobee_smartsensor_2pk: { low: 75, high: 95 },
  smart_thermostat_basic: { low: 25, high: 280 },
  merv_11_filters_12pk: { low: 50, high: 90 },
  awair_element: { low: 130, high: 180 },
  ge_silicone_caulk: { low: 8, high: 12 },
  great_stuff_foam_pack: { low: 6, high: 65 },
  weatherstrip_door: { low: 10, high: 22 },
  pipe_insulation_set: { low: 14, high: 32 },
  ir_thermometer: { low: 18, high: 42 },
  caulk_gun_kit: { low: 12, high: 35 },
  foam_sealant: { low: 6, high: 14 },
  weatherstripping: { low: 10, high: 22 },
  pipe_insulation: { low: 12, high: 28 },
  window_film_3m: { low: 12, high: 28 },
  attic_stair_cover: { low: 35, high: 80 },
  water_heater_blanket: { low: 25, high: 50 },
  dryer_vent_kit: { low: 20, high: 45 },
  outlet_gaskets: { low: 8, high: 18 },
  caulk_spray_foam: { low: 6, high: 16 },
  draft_stoppers: { low: 12, high: 28 },
  mini_split_filter: { low: 18, high: 40 },

  // Pre-purchase / first-year owner
  moisture_meter: { low: 22, high: 65 },
  outlet_tester: { low: 12, high: 30 },
  co_detector: { low: 18, high: 45 },
  inspection_flashlight: { low: 18, high: 50 },
  plumb_level: { low: 12, high: 30 },
  plumbers_camera: { low: 35, high: 90 },
  mud_mat: { low: 35, high: 90 },
  snow_shovel: { low: 25, high: 65 },
  fire_extinguisher: { low: 28, high: 65 },
  basic_tool_kit: { low: 60, high: 180 },
}

// ---------- Layer 3: display-name pattern match ----------------------
// Run lowercased item.display through these regexes in order. First
// match wins. Prefer specific patterns over generic ones.
const NAME_PATTERNS: Array<[RegExp, PriceRange]> = [
  [/sunbrella.*cushion/i,            { low: 120, high: 480 }],
  [/sectional|conversation set/i,    { low: 280, high: 850 }],
  [/cantilever umbrella/i,           { low: 90, high: 280 }],
  [/outdoor rug/i,                   { low: 60, high: 180 }],
  [/string lights/i,                 { low: 28, high: 75 }],
  [/deck box|outdoor storage/i,      { low: 90, high: 180 }],
  [/heat pump|mini.?split/i,         { low: 60, high: 320 }],
  [/ecobee|smart thermostat/i,       { low: 120, high: 280 }],
  [/awair|air quality monitor/i,     { low: 130, high: 200 }],
  [/merv|hvac filter/i,              { low: 30, high: 90 }],
  [/pendant light/i,                 { low: 60, high: 220 }],
  [/under.?cabinet led|led strip/i,  { low: 25, high: 240 }],
  [/edison bulb/i,                   { low: 14, high: 35 }],
  [/motion.*light/i,                 { low: 8, high: 35 }],
  [/drawer organizer|drawer divider/i,{ low: 12, high: 40 }],
  [/pantry basket|pantry organizer/i,{ low: 18, high: 60 }],
  [/spice (rack|insert|organizer)/i, { low: 15, high: 35 }],
  [/under.?sink/i,                   { low: 18, high: 40 }],
  [/cabinet pull|cabinet hardware/i, { low: 15, high: 80 }],
  [/caulk/i,                         { low: 6, high: 14 }],
  [/great stuff|spray foam/i,        { low: 6, high: 32 }],
  [/weather.?strip/i,                { low: 10, high: 25 }],
  [/window (film|insulator)/i,       { low: 12, high: 35 }],
  [/water heater (blanket|insulator)/i,{ low: 25, high: 55 }],
  [/draft stopper/i,                 { low: 12, high: 30 }],
  [/pipe insulation/i,               { low: 12, high: 32 }],
  [/dryer vent/i,                    { low: 20, high: 45 }],
  [/co detector|carbon monoxide/i,   { low: 18, high: 45 }],
  [/fire extinguisher/i,             { low: 25, high: 65 }],
  [/moisture meter/i,                { low: 22, high: 65 }],
  [/grab bar/i,                      { low: 25, high: 65 }],
  [/anti.?slip/i,                    { low: 12, high: 35 }],
  [/snow shovel/i,                   { low: 25, high: 65 }],
  [/(snow|leaf) blower/i,            { low: 180, high: 700 }],
  [/generator/i,                     { low: 350, high: 1500 }],
  [/tool (kit|set|bag)/i,            { low: 60, high: 200 }],
  [/thermometer/i,                   { low: 15, high: 50 }],
  [/(door )?mat\b/i,                 { low: 25, high: 90 }],
  [/(grill|patio) cover/i,           { low: 30, high: 90 }],
]

// ---------- Layer 4: AffiliateCategory bands -------------------------
// Coarse last-resort range. Set conservatively — homeowners would
// rather see a range that brackets reality than a synthetic exact
// number. These are wider than the patterns above on purpose.
const CATEGORY_BANDS: Record<AffiliateCategory, PriceRange> = {
  tools:        { low: 15, high: 70 },
  home_systems: { low: 40, high: 280 },
  seasonal:     { low: 20, high: 95 },
  safety:       { low: 18, high: 60 },
  lake:         { low: 50, high: 250 },
  maintenance:  { low: 12, high: 45 },
  aging:        { low: 25, high: 85 },
  rental:       { low: 20, high: 90 },
}

// ---------- Resolver -------------------------------------------------

export function resolveItemPriceRange(item: AffiliateItem): PriceRange {
  // 1. Pick-tier mid (collapsed range — tiers are point estimates).
  const mid = PICK_TIERS[item.id]?.mid?.estPrice
  if (mid) return { low: mid, high: mid }

  // 2. Explicit per-item-id range.
  const explicit = ITEM_ID_PRICES[item.id]
  if (explicit) return explicit

  // 3. Display-name pattern match.
  for (const [pattern, range] of NAME_PATTERNS) {
    if (pattern.test(item.display)) return range
  }

  // 4. Category band.
  return CATEGORY_BANDS[item.category] ?? { low: 15, high: 50 }
}

// Tier-aware variant — used when a scenario forced tight or premium
// tier. If the requested tier is authored, use that exact price.
export function resolveItemPriceRangeForTier(
  item: AffiliateItem,
  tier: 'tight' | 'mid' | 'premium' | undefined,
): PriceRange {
  if (tier) {
    const tierEntry = PICK_TIERS[item.id]?.[tier]
    if (tierEntry) return { low: tierEntry.estPrice, high: tierEntry.estPrice }
  }
  return resolveItemPriceRange(item)
}

// Add-on price range — same logic but slightly widened on the high
// end since add-ons often span tiers and we want to communicate range.
export function resolveAddOnPriceRange(item: AffiliateItem): PriceRange {
  const base = resolveItemPriceRange(item)
  if (base.low === base.high) {
    // Pad a 30% range around a point estimate so add-ons read as ranges.
    const pad = Math.max(2, Math.round(base.low * 0.3))
    return { low: Math.max(1, base.low - pad), high: base.high + pad }
  }
  return base
}
