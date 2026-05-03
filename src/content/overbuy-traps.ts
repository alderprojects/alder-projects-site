// Overbuy-trap data for the Smart Cart Savings Snapshot.
//
// "What most homeowners buy that they don't end up needing" — this
// module models the typical bloated cart so the synthesis function
// can compute lean-cart vs. common-overbuy-cart side-by-side.
//
// Each entry references one or more scopeVariantIds and lists the
// items most homeowners reach for under that scope, with typical
// price ranges and the "why people overbuy" explanation. The total
// of the typical-overbuy items rolls up into typicalOverbuyTotal,
// which the savings calculator subtracts from to compute the
// savings range shown on the result page.

import type { TopicId } from '../lib/property-modules'

export type OverboughtItem = {
  label: string
  typicalPrice: { low: number; high: number }
  whyOverbought: string
}

export type OverbuyTrap = {
  id: string                            // referenced from SCOPE_VARIANT.overbuyTrapIds
  topic: TopicId
  scopeVariantIds: string[]
  overboughtItems: OverboughtItem[]
  typicalOverbuyTotal: { low: number; high: number }
}

export const OVERBUY_TRAPS: Record<string, OverbuyTrap> = {
  // ---------- Kitchen — cosmetic refresh ----------------------------
  kitchen_all_in_one_kit: {
    id: 'kitchen_all_in_one_kit',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    overboughtItems: [
      {
        label: 'Premium "all-in-one" cabinet refresh kit',
        typicalPrice: { low: 80, high: 160 },
        whyOverbought:
          'On the endcap, looks comprehensive, includes items the buyer already owns. The bundled primer is rarely Vermont-basement-humidity rated.',
      },
      {
        label: 'Kitchen-specific paint (vs standard cabinet enamel)',
        typicalPrice: { low: 50, high: 90 },
        whyOverbought: 'Branded label, 30% premium over Benjamin Moore Advance for the same job.',
      },
      {
        label: 'Specialty backsplash sealer for ceramic',
        typicalPrice: { low: 20, high: 45 },
        whyOverbought: 'Glazed ceramic and porcelain do not need sealing. Marketing line.',
      },
      {
        label: 'Premium application tools (rollers, brushes, trays)',
        typicalPrice: { low: 35, high: 80 },
        whyOverbought: 'Buyer panics at the tool wall and adds a $40 bundle of items they own.',
      },
      {
        label: 'Branded kitchen-themed cleaning supplies',
        typicalPrice: { low: 15, high: 45 },
        whyOverbought: 'Marketed as project-specific. Dish soap and water do the same job.',
      },
    ],
    typicalOverbuyTotal: { low: 200, high: 420 },
  },

  kitchen_specialty_tools: {
    id: 'kitchen_specialty_tools',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh', 'kitchen_cabinet_hardware_swap'],
    overboughtItems: [
      {
        label: 'Cabinet pull jig and template kit',
        typicalPrice: { low: 30, high: 65 },
        whyOverbought: 'Sized for 50+ pull installs. Vermont kitchen has 14-22.',
      },
      {
        label: 'Specialty drilling kit for cabinet hardware',
        typicalPrice: { low: 25, high: 60 },
        whyOverbought: 'Standard 1/8" and 5/32" drill bits handle every standard pull spacing.',
      },
      {
        label: 'Premium tape kit for cabinet refinish',
        typicalPrice: { low: 18, high: 35 },
        whyOverbought: 'Frog Tape multi-pack at $15 covers the same job.',
      },
    ],
    typicalOverbuyTotal: { low: 75, high: 165 },
  },

  // ---------- Kitchen — cabinet hardware ----------------------------
  kitchen_premium_pulls: {
    id: 'kitchen_premium_pulls',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap'],
    overboughtItems: [
      {
        label: 'Premium solid-brass pulls (vs stamped steel mid-tier)',
        typicalPrice: { low: 60, high: 140 },
        whyOverbought: 'Looks identical at 5 feet. Premium worth it only if you handle them daily and want patina.',
      },
      {
        label: 'Decorative cabinet hinges most stay hidden',
        typicalPrice: { low: 60, high: 120 },
        whyOverbought: 'Most modern cabinets use concealed European hinges. Decorative version invisible.',
      },
      {
        label: 'Bulk pull packs beyond actual pull count',
        typicalPrice: { low: 30, high: 80 },
        whyOverbought: 'The 25-pack feels like value. Vermont kitchens use 14-22 pulls; rest sits in a drawer.',
      },
      {
        label: 'Universal soft-close adapters that do not fit',
        typicalPrice: { low: 40, high: 80 },
        whyOverbought: 'Most universal-fit kits do not match older Vermont cabinet hinge geometry.',
      },
    ],
    typicalOverbuyTotal: { low: 190, high: 420 },
  },

  kitchen_decorative_hinges: {
    id: 'kitchen_decorative_hinges',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap'],
    overboughtItems: [
      {
        label: 'Decorative concealed hinges (vs functional standard)',
        typicalPrice: { low: 60, high: 110 },
        whyOverbought: 'Hidden behind the door. Adds zero visual upgrade on most modern cabinets.',
      },
      {
        label: 'Premium hinge installation tooling',
        typicalPrice: { low: 25, high: 60 },
        whyOverbought: 'Standard Phillips driver and a torque-feel handles the install.',
      },
    ],
    typicalOverbuyTotal: { low: 85, high: 170 },
  },

  // ---------- Kitchen — organizers ---------------------------------
  organizer_premium_kits: {
    id: 'organizer_premium_kits',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_organizers'],
    overboughtItems: [
      {
        label: 'Premium curated kitchen organization bundle',
        typicalPrice: { low: 150, high: 280 },
        whyOverbought: 'Subscription-feel set; most pieces do not fit specific Vermont drawer dimensions.',
      },
      {
        label: 'Fixed-width drawer dividers bought before measuring',
        typicalPrice: { low: 30, high: 60 },
        whyOverbought: 'Older Vermont kitchens have non-standard drawer widths. Adjustable bamboo wins.',
      },
      {
        label: 'Specialty pantry organizers for items you do not store',
        typicalPrice: { low: 40, high: 90 },
        whyOverbought: 'Spice carousels, can-rotators, etc. — bought from the catalog photo, used once.',
      },
    ],
    typicalOverbuyTotal: { low: 220, high: 430 },
  },

  // ---------- Kitchen — lighting -----------------------------------
  lighting_smart_kits: {
    id: 'lighting_smart_kits',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_lighting_swap'],
    overboughtItems: [
      {
        label: 'Smart-app under-cabinet LED kit',
        typicalPrice: { low: 120, high: 240 },
        whyOverbought: 'App control adds $100+ over hard-wired switch. Cloud often expires.',
      },
      {
        label: 'Specialty 12V drivers for short LED runs',
        typicalPrice: { low: 50, high: 90 },
        whyOverbought: 'A $15 driver handles every run under 15 feet.',
      },
      {
        label: 'Color-changing RGB strips marketed as kitchen lighting',
        typicalPrice: { low: 60, high: 140 },
        whyOverbought: 'RGB belongs in a teen room, not over the cooktop. Warm white wins.',
      },
    ],
    typicalOverbuyTotal: { low: 230, high: 470 },
  },

  lighting_specialty_drivers: {
    id: 'lighting_specialty_drivers',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_lighting_swap'],
    overboughtItems: [
      {
        label: 'Premium LED driver upgrade',
        typicalPrice: { low: 50, high: 90 },
        whyOverbought: 'Sold to long-run installs only. Most kitchens have under 15 feet.',
      },
      {
        label: 'Specialty dimmer for non-dimmable LEDs',
        typicalPrice: { low: 35, high: 80 },
        whyOverbought: 'If the LEDs are not dimmable-rated, the dimmer does not solve the buzz.',
      },
    ],
    typicalOverbuyTotal: { low: 85, high: 170 },
  },

  // ---------- Kitchen — faucet -------------------------------------
  faucet_specialty_tools: {
    id: 'faucet_specialty_tools',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_faucet_swap'],
    overboughtItems: [
      {
        label: 'Specialty faucet-install tool kit',
        typicalPrice: { low: 30, high: 65 },
        whyOverbought: 'A $15 basin wrench replaces the kit.',
      },
      {
        label: 'Premium plumbing tape and sealant bundle',
        typicalPrice: { low: 18, high: 35 },
        whyOverbought: 'Standard PTFE tape ($3) and pipe dope ($6) cover every faucet swap.',
      },
    ],
    typicalOverbuyTotal: { low: 50, high: 100 },
  },

  faucet_premium_brands: {
    id: 'faucet_premium_brands',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_faucet_swap'],
    overboughtItems: [
      {
        label: 'Premium European-brand faucet for basic swap',
        typicalPrice: { low: 200, high: 350 },
        whyOverbought: 'Parts replacement at year 7 is a 6-week wait through US distributors. Moen/Delta lasts as long with local availability.',
      },
      {
        label: 'Coordinated soap dispenser, sprayer, etc.',
        typicalPrice: { low: 80, high: 180 },
        whyOverbought: 'Bought to match the premium faucet finish; rarely used after the first month.',
      },
    ],
    typicalOverbuyTotal: { low: 280, high: 530 },
  },

  // ---------- Weatherization ---------------------------------------
  weatherization_smart_thermostat_first: {
    id: 'weatherization_smart_thermostat_first',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    overboughtItems: [
      {
        label: '$280 smart thermostat purchased before air-sealing',
        typicalPrice: { low: 240, high: 320 },
        whyOverbought: 'Satisfying purchase. Air-sealing is the boring one. Boring wins on Vermont 7,500-HDD load.',
      },
      {
        label: 'Premium remote sensors (set of 2-3) that do not pay back',
        typicalPrice: { low: 80, high: 150 },
        whyOverbought: 'Vermont open-floor-plan homes do not benefit from zone sensors as much as marketing suggests.',
      },
      {
        label: 'Smart-home hub bought to integrate the thermostat',
        typicalPrice: { low: 60, high: 140 },
        whyOverbought: 'Thermostat works on its own; hub adds complexity not value.',
      },
    ],
    typicalOverbuyTotal: { low: 380, high: 610 },
  },

  weatherization_bulk_insulation: {
    id: 'weatherization_bulk_insulation',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing', 'weatherization_attic_basics'],
    overboughtItems: [
      {
        label: 'Bulk insulation rolls before measuring cavities',
        typicalPrice: { low: 80, high: 200 },
        whyOverbought: 'Contractor pack discount is real, but Vermont return policies are tight on opened rolls.',
      },
      {
        label: 'Premium foam vs standard Great Stuff Pro',
        typicalPrice: { low: 30, high: 80 },
        whyOverbought: 'Specialty low-expansion is the only premium that earns the upgrade.',
      },
      {
        label: '3M window film for already-tight modern windows',
        typicalPrice: { low: 25, high: 60 },
        whyOverbought: 'Right call for single-pane historic; no measurable savings on modern double-pane.',
      },
      {
        label: '"Weatherization caulk" branded products',
        typicalPrice: { low: 15, high: 40 },
        whyOverbought: 'Acrylic at premium pricing. GE Silicone II handles every penetration.',
      },
    ],
    typicalOverbuyTotal: { low: 150, high: 380 },
  },

  // ---------- Outdoor — deck refresh -------------------------------
  deck_premium_stain: {
    id: 'deck_premium_stain',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_deck_refresh'],
    overboughtItems: [
      {
        label: '"20-year" premium deck stain on PT lumber',
        typicalPrice: { low: 50, high: 120 },
        whyOverbought: 'PT moves and twists; 20-year claim assumes substrate stability PT does not provide.',
      },
      {
        label: 'Premium application brushes and rollers',
        typicalPrice: { low: 30, high: 70 },
        whyOverbought: 'Quality nylon at $12 outperforms premium-branded $40 set on rough PT.',
      },
      {
        label: 'Specialty deck cleaner for non-teak surfaces',
        typicalPrice: { low: 25, high: 50 },
        whyOverbought: 'Dish soap and a scrub brush handle PT, composite, and cedar.',
      },
    ],
    typicalOverbuyTotal: { low: 105, high: 240 },
  },

  deck_specialty_cleaner: {
    id: 'deck_specialty_cleaner',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_deck_refresh'],
    overboughtItems: [
      {
        label: 'Specialty teak cleaner on non-teak deck',
        typicalPrice: { low: 25, high: 50 },
        whyOverbought: 'Performance theater. Dish soap works.',
      },
      {
        label: 'Multi-step composite-deck cleaning kit',
        typicalPrice: { low: 35, high: 80 },
        whyOverbought: 'Composite is functionally maintenance-free; specialty cleaner offers no lifecycle gain.',
      },
    ],
    typicalOverbuyTotal: { low: 60, high: 130 },
  },

  // ---------- Outdoor — lake season --------------------------------
  lake_propane_patio_heater: {
    id: 'lake_propane_patio_heater',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    overboughtItems: [
      {
        label: 'Tall propane patio heater at lakeshore',
        typicalPrice: { low: 140, high: 280 },
        whyOverbought: 'Lakeshore wind tips them. Fire risk is real. State Fire Marshal flags incidents.',
      },
      {
        label: 'Replacement propane tank dedicated to heater',
        typicalPrice: { low: 50, high: 120 },
        whyOverbought: 'If the heater is unsafe, the tank is wasted.',
      },
      {
        label: 'Premium cover for heater that should not exist',
        typicalPrice: { low: 30, high: 60 },
        whyOverbought: 'Compounds the original wrong purchase.',
      },
    ],
    typicalOverbuyTotal: { low: 220, high: 460 },
  },

  lake_specialty_cleaners: {
    id: 'lake_specialty_cleaners',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    overboughtItems: [
      {
        label: 'Marine-grade specialty cleaners for boat dock',
        typicalPrice: { low: 30, high: 70 },
        whyOverbought: 'Most dock cleaning is power-wash with water; specialty product offers minimal gain.',
      },
      {
        label: 'Specialty Sunbrella cleaner',
        typicalPrice: { low: 18, high: 35 },
        whyOverbought: 'Mild detergent and warm water clean Sunbrella per the manufacturer guide.',
      },
    ],
    typicalOverbuyTotal: { low: 48, high: 105 },
  },

  lake_citronella: {
    id: 'lake_citronella',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    overboughtItems: [
      {
        label: 'Citronella torch set as blackfly defense',
        typicalPrice: { low: 30, high: 60 },
        whyOverbought: 'Citronella does not deter Vermont blackflies. Permethrin-treated clothing or DEET works.',
      },
      {
        label: 'Premium citronella oil refills',
        typicalPrice: { low: 20, high: 40 },
        whyOverbought: 'Buyer doubles down on the failed approach.',
      },
      {
        label: 'Decorative citronella candles',
        typicalPrice: { low: 25, high: 50 },
        whyOverbought: 'Aesthetic, not bug control.',
      },
    ],
    typicalOverbuyTotal: { low: 75, high: 150 },
  },

  // ---------- Heat pump --------------------------------------------
  heat_pump_thermostat_before_air_seal: {
    id: 'heat_pump_thermostat_before_air_seal',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    overboughtItems: [
      {
        label: 'Premium smart thermostat before heat pump install',
        typicalPrice: { low: 240, high: 320 },
        whyOverbought: 'Most installers swap thermostat as part of work. Compatibility risk + wasted purchase.',
      },
      {
        label: 'Specialty smart register dampers',
        typicalPrice: { low: 120, high: 300 },
        whyOverbought: 'Solves a problem most Vermont homes do not have. Manual register adjustment is free.',
      },
      {
        label: 'Duct-airflow measurement kit',
        typicalPrice: { low: 60, high: 140 },
        whyOverbought: 'Installer has the tools. Homeowner-grade kit reads inaccurately.',
      },
    ],
    typicalOverbuyTotal: { low: 420, high: 760 },
  },

  // ---------- Bath -------------------------------------------------
  bath_specialty_grab_bars: {
    id: 'bath_specialty_grab_bars',
    topic: 'bath',
    scopeVariantIds: ['bath_accessibility_basics'],
    overboughtItems: [
      {
        label: 'Designer matched-finish grab bars',
        typicalPrice: { low: 100, high: 200 },
        whyOverbought: 'ADA-rated stainless at $30-60 is the safety pick. Designer adds aesthetic, not safety.',
      },
      {
        label: 'Premium "lifetime" anti-slip strip kit',
        typicalPrice: { low: 30, high: 60 },
        whyOverbought: 'Standard at $15 lasts the same and replaces easily.',
      },
    ],
    typicalOverbuyTotal: { low: 130, high: 260 },
  },

  bath_premium_fixtures: {
    id: 'bath_premium_fixtures',
    topic: 'bath',
    scopeVariantIds: ['bath_accessibility_basics'],
    overboughtItems: [
      {
        label: 'Smart bidet attachment for accessibility refresh',
        typicalPrice: { low: 250, high: 450 },
        whyOverbought: 'Right purchase eventually; not part of the $80-320 accessibility scope.',
      },
      {
        label: 'Premium LED dimmable mirror',
        typicalPrice: { low: 180, high: 380 },
        whyOverbought: 'Standard mirror works. LED-dimmable is a separate cosmetic project.',
      },
    ],
    typicalOverbuyTotal: { low: 430, high: 830 },
  },
}

// ---------- Helpers ---------------------------------------------------

export function getOverbuyTrap(id: string): OverbuyTrap | undefined {
  return OVERBUY_TRAPS[id]
}

// Resolve trap ids to OverbuyTrap records — used by the SmartCart
// synthesis function (commit 13) to compute the savings snapshot.
// Skips unknown ids silently; the type system catches them at build.
export function resolveOverbuyTraps(ids: string[]): OverbuyTrap[] {
  return ids.map(id => OVERBUY_TRAPS[id]).filter(Boolean)
}

// Roll up trap totals across a list. Returns the combined low / high
// dollar range. Used by the SmartCart Savings Snapshot.
export function combineOverbuyTotals(traps: OverbuyTrap[]): { low: number; high: number } {
  return traps.reduce(
    (acc, t) => ({
      low: acc.low + t.typicalOverbuyTotal.low,
      high: acc.high + t.typicalOverbuyTotal.high,
    }),
    { low: 0, high: 0 },
  )
}
