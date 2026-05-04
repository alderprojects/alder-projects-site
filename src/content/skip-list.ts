// Skip-list entries for V7 Smart Cart and Worth-It Plan synthesis.
// "Buy this + this. Skip that." — this module is the third panel.
//
// Each entry is a category of product or pattern most homeowners
// reach for that does not earn its dollar on the project at hand.
// Reasoning is voice-guide.md compliant: name the cost-of-being-
// wrong, name why people fall in, give the workaround.
//
// Entries can be filtered by topic, scope variant, and scenario.
// The synthesis function in commit 13 calls getSkipListForCart with
// the buyer's context and renders the resulting list under the
// "Skip For Now" section.

import type { TopicId } from '../lib/property-modules'
import type { BriefScenarioId } from '../lib/recommender-config.types'

export type SkipItemScope =
  | 'topic_specific'                 // relevant to a topic but any scope
  | 'scope_specific'                 // relevant to a specific scope variant
  | 'general'                        // generic buying-discipline advice

export type SkipItem = {
  id: string
  topic?: TopicId
  scopeVariantIds?: string[]         // narrows to specific scope; omit = applies to whole topic
  scenario?: BriefScenarioId         // narrows to scenario; omit = applies to all scenarios
  // V7.1 — drives savings honesty + UI bucketing. When omitted,
  // resolveSkipItemScope() infers the scope from topic/scopeVariantIds
  // presence. Override explicitly for items that LOOK topic-specific
  // but really are generic buying discipline.
  scope?: SkipItemScope
  title: string
  reasoning: string                  // why skip; voice-guide.md compliant
  moneyAvoided: string               // dollars or range
  confidence: 'high' | 'medium' | 'low'
}

// Resolve the effective scope of a skip item, falling back to inference
// when not explicitly authored.
export function resolveSkipItemScope(item: SkipItem): SkipItemScope {
  if (item.scope) return item.scope
  if (item.scopeVariantIds && item.scopeVariantIds.length) return 'scope_specific'
  if (item.topic) return 'topic_specific'
  return 'general'
}

// Parse "$X-Y" / "$X" / "$X-$Y" / "$X-Y per door" etc into a numeric
// {low, high} range. Used by buildSmartCart savings honesty and the
// /api/intent/teaser fallback.
export function parseMoneyAvoided(s: string): { low: number; high: number } {
  const match = s.match(/\$([0-9,]+)(?:\s*-\s*\$?([0-9,]+))?/)
  if (!match) return { low: 0, high: 0 }
  const low = Number(match[1].replace(/,/g, ''))
  const high = match[2] ? Number(match[2].replace(/,/g, '')) : low
  return { low: isNaN(low) ? 0 : low, high: isNaN(high) ? low : high }
}

export const SKIP_LIST: SkipItem[] = [
  // ---------- Kitchen — cosmetic refresh ------------------------------
  {
    id: 'skip_premium_all_in_one_cabinet_kit',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    title: 'Premium "all-in-one" cabinet refresh kit',
    reasoning:
      'The endcap kit doubles up on items you already own (sandpaper, brushes) and bundles a primer not matched to Vermont basement humidity. Buy the deglosser, brush set, and primer separately and you save without losing project speed.',
    moneyAvoided: '$60-160',
    confidence: 'high',
  },
  {
    id: 'skip_kitchen_specific_paint',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    title: '"Kitchen-specific" paint when standard cabinet enamel works',
    reasoning:
      'Most kitchen-branded paints are standard alkyd enamels with a 30% premium and a kitchen-themed label. Benjamin Moore Advance or Sherwin Pro Classic in a satin or semi-gloss does the same job for less.',
    moneyAvoided: '$25-70',
    confidence: 'high',
  },
  {
    id: 'skip_specialty_backsplash_sealer',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    title: 'Specialty backsplash sealer for tile that does not need it',
    reasoning:
      'Glazed ceramic and porcelain tiles do not need sealing — only natural stone does. Hardware-store specialty sealer for ceramic is a marketing line. Skip unless you are working with marble, slate, or unglazed terra cotta.',
    moneyAvoided: '$20-45',
    confidence: 'high',
  },

  // ---------- Kitchen — cabinet hardware ------------------------------
  {
    id: 'skip_bulk_pulls_when_you_need_12',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap'],
    title: 'Bulk packs of cabinet pulls when you only need 12',
    reasoning:
      'The 25-pack is $4 less per pull than the 12-pack and feels like value, but you end up with leftovers that go in a drawer. Count actual pull positions (typical Vermont kitchen: 14-22) and order that, plus 2 spares.',
    moneyAvoided: '$30-80',
    confidence: 'high',
  },
  {
    id: 'skip_premium_decorative_hinges',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap'],
    title: 'Decorative cabinet hinges most homeowners never see',
    reasoning:
      'Most modern Vermont kitchen cabinets use concealed European hinges — the decorative versions sit hidden behind the door and add no visual upgrade. Buy decorative only if you have face-frame cabinets with exposed hinges.',
    moneyAvoided: '$60-120',
    confidence: 'high',
  },
  {
    id: 'skip_soft_close_on_cabinets_that_dont_slam',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap'],
    title: "Soft-close upgrades on cabinets that don't slam",
    reasoning:
      'Soft-close adapters are the right buy if you have small kids or roommates who slam cabinets, but the universal-fit kits often do not match older Vermont cabinet hinge geometry. If your cabinets close gently already, the $40-80 add is wasted.',
    moneyAvoided: '$40-80 per door',
    confidence: 'medium',
  },
  {
    id: 'skip_specialty_cabinet_tools',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap', 'kitchen_cosmetic_refresh'],
    title: 'Specialty cabinet-installation tools for one project',
    reasoning:
      'A jig-and-template kit for $40 makes sense if you are installing 50 pulls. For 14-22 pulls in a Vermont kitchen, a 6-inch ruler and a square work fine. Borrow specialty jigs from neighbors or skip outright.',
    moneyAvoided: '$25-65',
    confidence: 'high',
  },

  // ---------- Kitchen — organizers ------------------------------------
  {
    id: 'skip_premium_organizer_kits',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_organizers'],
    title: 'Premium "kitchen organization" subscription bundles',
    reasoning:
      'The $200 curated set delivers a few well-designed bins and a lot of filler. Buy the 2-3 organizers that fit your specific drawers from Amazon Basics or Container Store individually for half the price.',
    moneyAvoided: '$80-150',
    confidence: 'high',
  },
  {
    id: 'skip_organizers_before_drawer_inventory',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_organizers'],
    title: 'Drawer dividers before you measure your actual drawers',
    reasoning:
      'Vermont kitchen drawers are inconsistent — older homes have non-standard widths. Buy adjustable bamboo dividers or measure first; the $30 fixed-width set that does not fit goes back to Amazon at your time-cost.',
    moneyAvoided: '$30-60',
    confidence: 'high',
  },

  // ---------- Kitchen — lighting --------------------------------------
  {
    id: 'skip_smart_undercabinet_kits',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_lighting_swap'],
    title: 'Smart-app under-cabinet LED kits',
    reasoning:
      "App-controlled under-cabinet LEDs are usually not the win they sound like. The hard-wired switch already next to the counter is faster, and the app abandons you when the manufacturer's cloud expires.",
    moneyAvoided: '$120-240',
    confidence: 'medium',
  },
  {
    id: 'skip_specialty_drivers_for_strip_led',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_lighting_swap'],
    title: 'Specialty LED drivers for the basic 12V strip',
    reasoning:
      'A 12V LED strip works with a $15 driver. The $80 "premium driver" is sold to people not running long lengths. Verify your strip total length is under 15 feet before paying for a driver upgrade.',
    moneyAvoided: '$50-90',
    confidence: 'high',
  },

  // ---------- Kitchen — faucet ----------------------------------------
  {
    id: 'skip_faucet_specialty_install_tools',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_faucet_swap'],
    title: 'Specialty faucet-install tools for a one-time swap',
    reasoning:
      'A basin wrench costs $15 and works for any household faucet swap you will ever do. The $40 specialty kit adds adapters you will not need and a plastic wrench that breaks.',
    moneyAvoided: '$25-50',
    confidence: 'high',
  },
  {
    id: 'skip_premium_faucet_brand_for_basic_kitchen',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_faucet_swap'],
    title: 'Premium European faucet brands for basic kitchen swap',
    reasoning:
      'A $400 European pull-down looks great but parts replacement at year 7 is a 6-week wait through US distributor. Moen and Delta carry replaceable cartridges at every Vermont hardware store and last as long.',
    moneyAvoided: '$200-300',
    confidence: 'medium',
  },

  // ---------- Kitchen — general ---------------------------------------
  {
    id: 'skip_smart_kitchen_gadgets_first',
    topic: 'kitchen',
    title: 'Smart kitchen gadgets bought before basics are sorted',
    reasoning:
      'Smart cutting boards, app-controlled scales, and connected coffee makers are the gadget tier. Get the cabinet hardware, lighting, and the fundamentals right first — gadgets are a Year 2 purchase.',
    moneyAvoided: '$80-300',
    confidence: 'high',
  },
  {
    id: 'skip_lifetime_warranty_marketing',
    topic: 'kitchen',
    scope: 'general',                // generic buying discipline; bucketed under "general principles"
    title: 'Lifetime warranty marketing on items that wear in 2 years',
    reasoning:
      'Cabinet pulls, faucet finishes, drawer slides — "lifetime warranty" usually means the manufacturer will replace under specific defect conditions, not "this will not wear." Vermont basement humidity wears finishes regardless of warranty language.',
    moneyAvoided: '$30-100',
    confidence: 'medium',
  },

  // ---------- Weatherization — DIY ------------------------------------
  {
    id: 'skip_bulk_insulation_pre_measure',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing', 'weatherization_attic_basics'],
    title: 'Bulk insulation rolls before measuring',
    reasoning:
      'The contractor-pack pricing is real but Vermont return policies on opened building materials are stricter than national chains suggest. Measure each cavity end-to-end, add 8% waste, and order that exact quantity.',
    moneyAvoided: '$80-300',
    confidence: 'high',
  },
  {
    id: 'skip_premium_low_expansion_foam',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    title: 'Premium low-expansion foam where Great Stuff works',
    reasoning:
      'Specialty foams (window-and-door low-expansion is the exception) are sold as upgrades for situations where standard foam is fine. Great Stuff Pro Gaps & Cracks handles 90% of Vermont weatherization without the $14-per-can premium.',
    moneyAvoided: '$30-80',
    confidence: 'high',
  },
  {
    id: 'skip_window_kit_for_sturdy_windows',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    title: 'Window insulation kits for windows that are already tight',
    reasoning:
      '3M window film is the right call for single-pane historic windows. For modern double-pane vinyl windows in good condition, the kit adds visual fog without measurable savings.',
    moneyAvoided: '$25-60',
    confidence: 'high',
  },
  {
    id: 'skip_specialty_caulk_where_silicone_works',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    title: 'Specialty "weatherization caulk" where 100% silicone works',
    reasoning:
      'Most "weatherization caulk" is rebranded acrylic or siliconized acrylic at 30% premium. GE Silicone II handles every exterior penetration and most interior; one tube covers the typical Vermont rim-joist run.',
    moneyAvoided: '$15-40',
    confidence: 'high',
  },
  {
    id: 'skip_smart_thermostat_before_air_sealing',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing', 'weatherization_attic_basics'],
    scenario: 'just_starting',
    title: 'Smart thermostat purchased before any air-sealing',
    reasoning:
      'A $280 smart thermostat is the satisfying purchase. Air-sealing the rim joists is the boring one. The boring one wins on Vermont 7,500-HDD heating loads — buy the caulk first, the thermostat after.',
    moneyAvoided: '$200-260',
    confidence: 'high',
  },

  // ---------- Outdoor — deck refresh ----------------------------------
  {
    id: 'skip_premium_deck_stain',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_deck_refresh'],
    title: 'Premium "20-year" deck stain on a pressure-treated deck',
    reasoning:
      'PT lumber moves and twists across Vermont seasons. "20-year stain" claims assume substrate stability that PT does not provide. Cabot or Olympic semi-transparent at $35/gallon, recoated every 3-4 years, beats the $90/gallon "lifetime" stain.',
    moneyAvoided: '$50-120',
    confidence: 'medium',
  },
  {
    id: 'skip_specialty_deck_cleaner',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_deck_refresh'],
    title: 'Specialty "teak deck cleaner" on PT or composite',
    reasoning:
      'Teak cleaners are formulated for actual teak. On PT, composite, or cedar, dish soap and a scrub brush do the same job. The $35 specialty bottle is performance theater.',
    moneyAvoided: '$25-50',
    confidence: 'high',
  },
  {
    id: 'skip_premium_grill_cover_at_peak_season',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_deck_refresh', 'outdoor_lake_season'],
    title: 'Premium grill covers at peak-season pricing',
    reasoning:
      'The same Weber-branded $80 cover sells for $50 in late August clearance. Buy the cover in fall at end-of-season clearance, not when you buy the grill in spring.',
    moneyAvoided: '$30-50',
    confidence: 'high',
  },

  // ---------- Outdoor — lake season -----------------------------------
  {
    id: 'skip_tall_propane_patio_heater',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    title: 'Tall propane patio heaters at lakeshore',
    reasoning:
      'Lakeshore wind tips standard tall propane heaters reliably. The fire risk is not theoretical — Vermont State Fire Marshal flags propane patio heater incidents every shoulder season. Use a wind-rated mushroom heater or a fire pit instead.',
    moneyAvoided: '$140-280',
    confidence: 'high',
  },
  {
    id: 'skip_citronella_for_blackflies',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    title: 'Citronella torches as blackfly defense',
    reasoning:
      'Citronella deters mosquitoes weakly and Vermont blackflies essentially not at all. Permethrin-treated clothing, Thermacell devices, and DEET are what actually work in May-June lake season.',
    moneyAvoided: '$30-60',
    confidence: 'high',
  },
  {
    id: 'skip_wifi_garden_kits_zone_4',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season', 'outdoor_deck_refresh'],
    title: 'WiFi smart garden kits in Vermont growing zone',
    reasoning:
      'Smart garden kits are tuned for 9-month growing seasons. Vermont zone 4-5 has a 5-month outdoor window. The app-controlled drip system is dormant for 7 months and the propietary cloud often expires before spring two.',
    moneyAvoided: '$80-200',
    confidence: 'medium',
  },
  {
    id: 'skip_wood_adirondacks_year_round',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    title: 'Wood Adirondack chairs left out year-round',
    reasoning:
      'Untreated cedar Adirondacks left in Vermont winter freeze-thaw cycles last 4-5 years instead of the marketed 20. Recycled-plastic POLY Adirondacks at $200 outlast the $400 wood version through 15+ winters.',
    moneyAvoided: '$200-400 over decade',
    confidence: 'high',
  },
  {
    id: 'skip_dock_premium_hardware_pre_freeze',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    title: 'Premium dock hardware bought in spring at peak pricing',
    reasoning:
      'Lake-property dock hardware clears 30-50% in late September when docks come out. Buy in fall, store, install at ice-out.',
    moneyAvoided: '$80-200',
    confidence: 'medium',
  },

  // ---------- Heat pump readiness -------------------------------------
  {
    id: 'skip_premium_thermostat_pre_install',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Premium $280 smart thermostat before the heat pump is installed',
    reasoning:
      'Most cold-climate heat pump installs swap the thermostat as part of the work, often included in the contractor quote. Buying the premium model preinstall risks compatibility mismatch and a wasted purchase.',
    moneyAvoided: '$200-280',
    confidence: 'high',
  },
  {
    id: 'skip_specialty_register_dampers',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Specialty smart register dampers',
    reasoning:
      "App-controlled register dampers solve a problem (zone-by-zone airflow tuning) that most Vermont 1860s-to-1990s homes do not have. Manual register adjustment for one Saturday morning achieves the same comfort gain at $0.",
    moneyAvoided: '$120-300',
    confidence: 'medium',
  },

  // ---------- Bath — accessibility ------------------------------------
  {
    id: 'skip_specialty_grab_bar_premium',
    topic: 'bath',
    scopeVariantIds: ['bath_accessibility_basics'],
    title: 'Specialty designer grab bars',
    reasoning:
      'ADA-rated stainless grab bars at $30-60 are the right call. The $200 designer matched-finish version adds aesthetic, not safety, and replacements are harder to source.',
    moneyAvoided: '$100-180',
    confidence: 'high',
  },
  {
    id: 'skip_premium_anti_slip_specialty',
    topic: 'bath',
    scopeVariantIds: ['bath_accessibility_basics'],
    title: 'Premium "lifetime" anti-slip strips',
    reasoning:
      'Standard anti-slip bath strips at $15 last 2-3 years and replace easily. "Lifetime" versions wear at the same rate and are 4× the price.',
    moneyAvoided: '$30-60',
    confidence: 'medium',
  },

  // ---------- General / cross-topic -----------------------------------
  {
    id: 'skip_premium_tool_set_one_project',
    title: 'Premium tool sets for a one-time project',
    reasoning:
      'A 100-piece tool set looks like value but you use 12 tools. Buy the 12 tools you need at decent quality (Husky or Craftsman) and skip the case of specialty bits you will never reach for.',
    moneyAvoided: '$80-200',
    confidence: 'high',
  },
  {
    id: 'skip_smart_home_kits_no_ecosystem',
    title: 'Smart home kits without an existing ecosystem',
    reasoning:
      'A $200 smart home starter kit feels like a discount on $400 of devices, but the proprietary hub locks you in. If you already have HomeKit, Google Home, or Alexa, buy device-by-device — it costs the same and stays portable.',
    moneyAvoided: '$80-160',
    confidence: 'medium',
  },
  {
    id: 'skip_specialty_cleaners_dish_soap_works',
    title: 'Specialty cleaners where dish soap and water work',
    reasoning:
      'Cabinet cleaner, deck cleaner, tile cleaner, vinyl cleaner — most are detergent at 3× retail price with a specific label. Dawn dish soap on a microfiber cloth replaces 80% of the specialty-cleaner aisle.',
    moneyAvoided: '$25-80',
    confidence: 'high',
  },
  {
    id: 'skip_bulk_supplies_pre_measure',
    title: 'Bulk supplies before you measure the job',
    reasoning:
      'The case discount is real but the surplus sits in the basement for years. Vermont return policies are tighter than national chains. Measure first, then order, then add 10% waste.',
    moneyAvoided: '$30-200',
    confidence: 'high',
  },
  {
    id: 'skip_extended_warranty_marketing',
    title: 'Extended warranties on items that wear, not break',
    reasoning:
      'Extended warranties pay back when the item fails catastrophically. They do not cover wear (finish, fit, finish-again). Save the $40 — it is not a probability bet that lands in your favor on cosmetic items.',
    moneyAvoided: '$20-80',
    confidence: 'medium',
  },
  {
    id: 'skip_premium_branded_when_pro_grade_exists',
    title: 'Premium consumer brands when pro-grade is the same price',
    scenario: 'premium',
    reasoning:
      'Home-improvement TV branding adds a 30-50% markup on consumer-line tools. Milwaukee, DEWALT, and Makita pro-grade at the trade counter are often the same price as the consumer-line celebrity brand at the box store and last 3-5× longer.',
    moneyAvoided: '$50-180',
    confidence: 'medium',
  },
]

// ---------- Helpers ---------------------------------------------------

// Filter the skip list for a given Smart Cart context. V7.1 applies
// the curation rules from spec § Section 16:
//   1. Always include scope_specific items for the user's scope
//   2. Add topic_specific items if fewer than 4 scope_specific items
//   3. Add general items only if total skip count is still < 4
//   4. Hard cap at 6 items total
// The legacy filter (topic + scope + scenario gating) is preserved
// inside the candidate pool — only items that survive that filter are
// eligible for the priority pass.
export function getSkipListForCart(
  topic: TopicId,
  scopeVariantId: string,
  scenario?: import('../lib/recommender-config.types').BriefScenarioId,
): SkipItem[] {
  const candidates = SKIP_LIST.filter(item => {
    if (item.topic && item.topic !== topic) return false
    if (item.scopeVariantIds && !item.scopeVariantIds.includes(scopeVariantId)) return false
    if (item.scenario && scenario && item.scenario !== scenario) return false
    return true
  })

  const scoped = candidates.filter(i => resolveSkipItemScope(i) === 'scope_specific')
  const topical = candidates.filter(i => resolveSkipItemScope(i) === 'topic_specific')
  const general = candidates.filter(i => resolveSkipItemScope(i) === 'general')

  const out: SkipItem[] = [...scoped]
  if (out.length < 4) {
    out.push(...topical.slice(0, 4 - out.length))
  }
  if (out.length < 4) {
    out.push(...general.slice(0, 4 - out.length))
  }
  return out.slice(0, 6)
}

// Returns the entries that should appear in the "General buying
// principles" expandable section under the savings snapshot. These are
// excluded from the headline savings tile but still surfaced for the
// educational value.
export function getGeneralSkipPrinciples(
  topic: TopicId,
  scopeVariantId: string,
  scenario?: import('../lib/recommender-config.types').BriefScenarioId,
): SkipItem[] {
  return SKIP_LIST.filter(item => {
    if (item.topic && item.topic !== topic) return false
    if (item.scopeVariantIds && !item.scopeVariantIds.includes(scopeVariantId)) return false
    if (item.scenario && scenario && item.scenario !== scenario) return false
    return resolveSkipItemScope(item) === 'general'
  })
}

export function getSkipListByTopicTag(tag: string): SkipItem[] {
  // Filter via scope variant skipListTopicTags is the typical caller —
  // this helper supports test/debug queries against a raw tag.
  return SKIP_LIST.filter(item => item.scopeVariantIds?.some(v => v.includes(tag)))
}
