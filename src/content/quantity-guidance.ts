// Per-item quantity guidance — powers the "Qty" column in the Smart
// Cart lean cart table.
//
// The synthesis function looks up an item id and renders the typical
// quantity for the project shape. "How many caulk tubes for an
// average Vermont kitchen" — answers like that live here.
//
// Voice rule: be specific. "Per kitchen" or "per door" beats "as
// needed." Round numbers, plus a notes line for the gotcha.

export type QuantityGuidance = {
  itemId: string                       // matches AffiliateItem.id
  typicalQuantity: { low: number; mid: number; high: number; unit: string }
  perWhat: string                      // 'per kitchen', 'per door', 'per home'
  notes: string                        // the gotcha or the "what to verify"
}

export const QUANTITY_GUIDANCE: Record<string, QuantityGuidance> = {
  // ---------- Kitchen — hardware -------------------------------------
  cabinet_pulls: {
    itemId: 'cabinet_pulls',
    typicalQuantity: { low: 14, mid: 18, high: 22, unit: 'pulls' },
    perWhat: 'per kitchen',
    notes:
      'Count actual pull positions on cabinet doors and drawer fronts. Vermont kitchens average 14-22. Order +2 spares for replacements.',
  },
  cabinet_refinish: {
    itemId: 'cabinet_refinish',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'kits' },
    perWhat: 'per kitchen',
    notes: 'One kit covers ~30 sq ft of cabinet face. Larger kitchens need a second kit.',
  },
  pendant_lights_3pk: {
    itemId: 'pendant_lights_3pk',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'sets of 3' },
    perWhat: 'per kitchen island',
    notes: 'Most VT islands fit 2-3 pendants per 6-8 ft of island. Verify spacing tape-out before ordering.',
  },
  undermount_leds: {
    itemId: 'undermount_leds',
    typicalQuantity: { low: 1, mid: 2, high: 3, unit: 'strips' },
    perWhat: 'per kitchen',
    notes:
      'Average Vermont kitchen has 8-12 linear feet of upper cabinet bottom. Match strip length to actual run.',
  },
  drawer_organizer: {
    itemId: 'drawer_organizer',
    typicalQuantity: { low: 2, mid: 3, high: 5, unit: 'organizers' },
    perWhat: 'per kitchen',
    notes:
      'Inventory drawers and pick the 3 worth organizing. Adjustable bamboo dividers fit any drawer width.',
  },
  edge_banding: {
    itemId: 'edge_banding',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'roll' },
    perWhat: 'per cabinet box',
    notes: 'One roll covers ~30 ft of edge. Most kitchen refreshes need one roll for visible plywood edges.',
  },
  sink_strainer: {
    itemId: 'sink_strainer',
    typicalQuantity: { low: 1, mid: 2, high: 2, unit: 'units' },
    perWhat: 'per sink',
    notes: 'Buy 2 — keeps a spare for replacement.',
  },

  // ---------- Weatherization -----------------------------------------
  ge_silicone_caulk: {
    itemId: 'ge_silicone_caulk',
    typicalQuantity: { low: 2, mid: 3, high: 5, unit: 'tubes' },
    perWhat: 'per home',
    notes:
      'One tube covers ~40 ft of bead. Vermont rim-joist + window perimeter pass uses 3-4 tubes; add 1 for outdoor penetrations.',
  },
  great_stuff_foam_pack: {
    itemId: 'great_stuff_foam_pack',
    typicalQuantity: { low: 2, mid: 3, high: 4, unit: 'cans' },
    perWhat: 'per home',
    notes:
      'Three Great Stuff Pro cans handle the typical Vermont basement perimeter + electrical/plumbing penetrations. Pro gun-foam wastes less.',
  },
  weatherstrip_door: {
    itemId: 'weatherstrip_door',
    typicalQuantity: { low: 1, mid: 2, high: 3, unit: 'rolls' },
    perWhat: 'per home',
    notes:
      'One roll per exterior door. Vermont homes typically have 2-3 exterior doors plus a basement bulkhead.',
  },
  pipe_insulation_set: {
    itemId: 'pipe_insulation_set',
    typicalQuantity: { low: 8, mid: 14, high: 22, unit: 'feet' },
    perWhat: 'per home',
    notes:
      'Measure exposed copper or PEX in unconditioned basement. Average Vermont 1,800 sq ft home has 12-18 ft of insulatable pipe.',
  },
  outlet_gaskets: {
    itemId: 'outlet_gaskets',
    typicalQuantity: { low: 12, mid: 20, high: 30, unit: 'gaskets' },
    perWhat: 'per home',
    notes: 'Count exterior-wall outlets and switches. Average VT home: 18-28.',
  },
  outlet_gaskets_pk: {
    itemId: 'outlet_gaskets_pk',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'packs' },
    perWhat: 'per home',
    notes: 'One pack of 20-30 covers most homes. Buy two for larger homes.',
  },
  caulk_spray_foam: {
    itemId: 'caulk_spray_foam',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'kits' },
    perWhat: 'per home',
    notes: 'Combo kit covers Saturday weatherization for most Vermont homes.',
  },
  window_film_3m: {
    itemId: 'window_film_3m',
    typicalQuantity: { low: 4, mid: 8, high: 14, unit: 'windows' },
    perWhat: 'per home',
    notes:
      'Film only single-pane historic windows or known-leaky windows. Count actual single-pane window count.',
  },
  attic_stair_cover: {
    itemId: 'attic_stair_cover',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'cover' },
    perWhat: 'per home',
    notes: 'Measure the rough opening before ordering. Standard sizes 22×54 or 25×54.',
  },
  water_heater_blanket: {
    itemId: 'water_heater_blanket',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'blanket' },
    perWhat: 'per heater',
    notes: 'Skip if your tank is post-2015 — modern foam already exceeds the blanket R-value.',
  },

  // ---------- Heat pump / smart thermostat ---------------------------
  smart_thermostat_basic: {
    itemId: 'smart_thermostat_basic',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'unit' },
    perWhat: 'per home',
    notes:
      'One thermostat per heating zone. Most Vermont single-zone homes use one; multi-zone homes need one per zone.',
  },
  ecobee_premium: {
    itemId: 'ecobee_premium',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'unit' },
    perWhat: 'per home',
    notes:
      'Includes one room sensor; buy ecobee_smartsensor_2pk if you have rooms remote from the thermostat.',
  },
  merv11_filters_12pk: {
    itemId: 'merv11_filters_12pk',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'pack of 12' },
    perWhat: 'per year',
    notes:
      'Most Vermont systems run a swap every 90 days — 4 filters/year. The 12-pack covers 3 years.',
  },

  // ---------- Outdoor / Lake -----------------------------------------
  patio_cushions_sunbrella: {
    itemId: 'patio_cushions_sunbrella',
    typicalQuantity: { low: 4, mid: 6, high: 8, unit: 'cushions' },
    perWhat: 'per deck',
    notes:
      'Count seat + back per chair. 4-piece set = 4 seats and 4 backs (8 cushions). Verify dimensions before ordering.',
  },
  outdoor_rug_8x10: {
    itemId: 'outdoor_rug_8x10',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'rugs' },
    perWhat: 'per deck',
    notes: 'Most Vermont decks fit one 8×10. Larger decks (16×20+) take two.',
  },
  brightech_string_lights: {
    itemId: 'brightech_string_lights',
    typicalQuantity: { low: 1, mid: 2, high: 3, unit: 'sets' },
    perWhat: 'per deck',
    notes:
      'One 48-ft set covers most decks. Larger or wraparound decks need two; pergolas can take three.',
  },
  patio_furniture_covers_set: {
    itemId: 'patio_furniture_covers_set',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'set' },
    perWhat: 'per deck',
    notes: 'One set covers a 4-piece conversation set. Add separate covers for grills and umbrellas.',
  },
  keter_deck_box: {
    itemId: 'keter_deck_box',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'boxes' },
    perWhat: 'per deck',
    notes: 'One box stores the cushion set for a 4-piece. Two for larger sets or extra storage.',
  },
  solar_path_lights_8pk: {
    itemId: 'solar_path_lights_8pk',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'packs of 8' },
    perWhat: 'per yard',
    notes: 'One pack lines a 30-50 ft path. Larger yards need two.',
  },

  // ---------- Bath ---------------------------------------------------
  turkish_towel_set: {
    itemId: 'turkish_towel_set',
    typicalQuantity: { low: 1, mid: 1, high: 2, unit: 'sets' },
    perWhat: 'per bath',
    notes: 'One full set per active bathroom — bath, hand, washcloth × 2 people.',
  },
  bath_mat_memory_foam: {
    itemId: 'bath_mat_memory_foam',
    typicalQuantity: { low: 1, mid: 2, high: 2, unit: 'mats' },
    perWhat: 'per bath',
    notes: 'One in front of tub + one in front of vanity = 2 typical.',
  },
  vanity_drawer_organizer: {
    itemId: 'vanity_drawer_organizer',
    typicalQuantity: { low: 1, mid: 2, high: 3, unit: 'organizers' },
    perWhat: 'per bath',
    notes:
      'Measure each drawer. Top drawer benefits most from organization; lower drawers usually fine with a single bin.',
  },

  // ---------- Tools (cross-topic) ------------------------------------
  basic_tool_kit: {
    itemId: 'basic_tool_kit',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'kit' },
    perWhat: 'per home',
    notes: 'One kit for the basement workshop. Most Vermont DIY households already have one.',
  },
  caulk_gun_kit: {
    itemId: 'caulk_gun_kit',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'kit' },
    perWhat: 'per home',
    notes: 'One quality caulk gun lasts a homeowner career. Skip the dollar-store version.',
  },
  ir_thermometer: {
    itemId: 'ir_thermometer',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'unit' },
    perWhat: 'per home',
    notes: 'Single unit, lasts the rest of your homeowner career.',
  },
  outlet_tester: {
    itemId: 'outlet_tester',
    typicalQuantity: { low: 1, mid: 1, high: 1, unit: 'tester' },
    perWhat: 'per home',
    notes: 'A $15 GFCI tester catches the failed outdoor GFCI before it becomes a fire risk.',
  },
}

// ---------- Helpers ---------------------------------------------------

export function getQuantityForItem(itemId: string):
  | { quantity: number; unit: string; notes: string }
  | undefined {
  const g = QUANTITY_GUIDANCE[itemId]
  if (!g) return undefined
  return {
    quantity: g.typicalQuantity.mid,
    unit: g.typicalQuantity.unit,
    notes: g.notes,
  }
}

export function getQuantityRange(itemId: string): QuantityGuidance | undefined {
  return QUANTITY_GUIDANCE[itemId]
}
