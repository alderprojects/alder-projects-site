// Worth-It Plan moves — the heart of the V7 paid product.
//
// Each move is a discrete action a Vermont homeowner can take, with
// rank within path, statewide spend range, time estimate, impact +
// confidence tiers, an honest whyRanked sentence, related kit / trap /
// fact ids, and saturdayCompatible flag.
//
// Voice rule: whyRanked must give a real reason — not "this is
// important." Saturday-compatible is honest — not every move ships
// in a weekend.
//
// 40 moves authored. Kitchen-heavy (~15), weatherization (~8),
// outdoor (~6), heat-pump readiness (~5), bath accessibility (~3),
// general / cross-topic (~3).

import type { TopicId } from '../lib/property-modules'

export type Move = {
  id: string
  topic: TopicId
  scopeVariantIds: string[]            // which scopes surface this move
  title: string
  pathTags: string[]                   // 'best_overall' | 'cosmetic_only' | etc.

  rank: number                         // ordering within the path tab
  spend: { low: number; high: number; unit: string }
  timeMinutes: number

  impactLevel: 'high' | 'medium' | 'low'
  confidenceLevel: 'high' | 'medium' | 'low'
  score: number                        // 0-100, drives sort + UI score bar

  whyRanked: string                    // 1-2 sentences, voice-guide compliant

  detailContent?: string

  relatedKitIds?: string[]
  relatedTrapIds?: string[]
  relatedFactIds?: string[]

  saturdayCompatible: boolean
  diyStopLineConditions?: string[]
}

export const MOVES: Move[] = [
  // ========== KITCHEN ==================================================
  {
    id: 'kitchen_mark_doors_before_unscrewing',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh', 'kitchen_cabinet_hardware_swap'],
    title: 'Mark up cabinet doors before unscrewing pulls',
    pathTags: ['best_overall', 'cosmetic_only', 'cabinets_counters'],
    rank: 1,
    spend: { low: 0, high: 5, unit: 'tape + sharpie' },
    timeMinutes: 20,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 92,
    whyRanked:
      'Reinstalling 14-22 doors in the wrong positions is the most common Vermont kitchen-refresh redo. Numbering each door + frame slot with painters tape on the inside removes that risk for $3 of supplies and 20 minutes.',
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_test_pull_batch_first',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap'],
    title: 'Order pulls in a 2-piece test batch first',
    pathTags: ['best_overall', 'cabinets_counters'],
    rank: 2,
    spend: { low: 8, high: 25, unit: 'two pulls' },
    timeMinutes: 15,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 88,
    whyRanked:
      'Online photos misrepresent finish and weight. Holding the actual pull against your existing cabinet color in your actual kitchen lighting kills 40% of order-mistakes before the bulk order ships.',
    saturdayCompatible: true,
    relatedTrapIds: ['kitchen_premium_pulls'],
  },
  {
    id: 'kitchen_verify_hinge_type',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cabinet_hardware_swap'],
    title: 'Verify hinge type before buying soft-close',
    pathTags: ['best_overall', 'cabinets_counters'],
    rank: 3,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 10,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 76,
    whyRanked:
      'Universal soft-close adapters fit modern Blum and Salice hinges; older Vermont cabinets often use Grass or pre-1990 stamped hinges that no universal adapter matches. Open one cabinet, photograph the hinge, then order.',
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_tape_prime_before_paint',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    title: 'Tape and prime cabinet doors before paint',
    pathTags: ['best_overall', 'cosmetic_only'],
    rank: 4,
    spend: { low: 25, high: 60, unit: 'tape + primer' },
    timeMinutes: 90,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 86,
    whyRanked:
      'Skipping primer on cabinet enamel produces year-1 chip-out. Vermont basement humidity exposes the shortcut faster. Two thin primer coats + light sand cuts the redo rate roughly in half.',
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_deglosser_test_patch',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    title: 'Deglosser test patch on one door first',
    pathTags: ['best_overall', 'cosmetic_only'],
    rank: 5,
    spend: { low: 12, high: 18, unit: 'one bottle' },
    timeMinutes: 45,
    impactLevel: 'high',
    confidenceLevel: 'medium',
    score: 78,
    whyRanked:
      'Deglosser saves 6-8 hours of sanding but reacts unpredictably with older Vermont cabinet finishes (especially 1970s-1990s polyurethane stains). One-door test confirms before you commit the whole kitchen.',
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_undermount_led_voltage',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh', 'kitchen_lighting_swap'],
    title: 'Check undermount LED voltage match',
    pathTags: ['best_overall', 'cosmetic_only'],
    rank: 6,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 15,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 72,
    whyRanked:
      "Mismatched 12V vs 24V LED and driver pairings burn out the strip in 3-6 months. Read the strip label, match the driver before ordering. Mistake costs $40-90 in replacement.",
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_measure_faucet_hole_spacing',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_faucet_swap'],
    title: 'Measure faucet hole spacing before ordering',
    pathTags: ['best_overall'],
    rank: 7,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 10,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 90,
    whyRanked:
      "8-inch widespread vs 4-inch centerset is the most common return-shipping mistake on Vermont kitchen faucet swaps. Measure center-to-center on the existing faucet's outer holes before ordering.",
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_drain_water_lines',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_faucet_swap'],
    title: 'Drain water lines before faucet install',
    pathTags: ['best_overall'],
    rank: 8,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 20,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 82,
    whyRanked:
      'Vermont kitchen sink shutoffs that have not turned in 15 years often fail when you turn them. Test the shutoff by running water at the faucet for a full minute after closing — if water still trickles, stop and call a plumber before pulling the old faucet.',
    saturdayCompatible: true,
    relatedTrapIds: ['diy-faucet-without-shutoff-test'],
    diyStopLineConditions: ['Shutoff valve fails the trickle test', 'Old faucet supply lines are crimped or corroded'],
  },
  {
    id: 'kitchen_test_drawer_dividers',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_organizers'],
    title: 'Test drawer dividers in the actual drawer first',
    pathTags: ['best_overall'],
    rank: 9,
    spend: { low: 12, high: 30, unit: 'one set' },
    timeMinutes: 20,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 70,
    whyRanked:
      'Vermont kitchen drawer widths are inconsistent in pre-1990 homes. Buy one adjustable bamboo divider, fit it to the actual drawer, then order the rest. Skips ~30% return rate on kitchen organization purchases.',
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_inventory_existing_organizers',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_organizers'],
    title: 'Inventory existing organizers before buying',
    pathTags: ['best_overall'],
    rank: 10,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 30,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 68,
    whyRanked:
      "Most Vermont households already own 50-70% of the basic organizer kit — drawer dividers from a previous move, lazy susans on the inside of cabinets, etc. The new-cabinet refresh is the moment to inventory before adding to the cart.",
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_pendant_layout',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_lighting_swap'],
    title: 'Tape-out pendant layout before electrical work',
    pathTags: ['best_overall', 'layout_curious'],
    rank: 11,
    spend: { low: 0, high: 8, unit: 'painters tape' },
    timeMinutes: 30,
    impactLevel: 'medium',
    confidenceLevel: 'medium',
    score: 64,
    whyRanked:
      "Pendant spacing is the most-regretted kitchen lighting decision. Tape circles on the ceiling at three different spacings, live with each for a day, then commit. The electrician's hour is more expensive than the tape.",
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_paint_test_2_corners',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    title: 'Paint test patches in 2 corners before whole-kitchen commit',
    pathTags: ['cosmetic_only'],
    rank: 12,
    spend: { low: 8, high: 18, unit: 'sample pots' },
    timeMinutes: 30,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 80,
    whyRanked:
      "Vermont kitchen lighting (often a single overhead, often warm-tinted) shifts paint colors 1-2 chips off-spec. Paint a 1x1 patch in two corners, live with it for 48 hours, then commit. Saves the $200-450 redo when the whole-kitchen color reads different than the chip.",
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_check_existing_inventory',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh', 'kitchen_cabinet_hardware_swap', 'kitchen_organizers'],
    title: 'Check basement workshop inventory before shopping',
    pathTags: ['best_overall'],
    rank: 13,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 30,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 72,
    whyRanked:
      'Most Vermont DIY households already own 60% of the basic-tool list. A 30-minute basement walk before placing the order avoids the duplicate-purchase tax that adds $40-120 to a typical kitchen refresh.',
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_sketch_layout_paper',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_cosmetic_refresh'],
    title: 'Sketch the project on paper before buying',
    pathTags: ['layout_curious', 'cosmetic_only'],
    rank: 14,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 45,
    impactLevel: 'medium',
    confidenceLevel: 'medium',
    score: 60,
    whyRanked:
      "Sketching the cabinet doors with door numbers and pull positions catches the asymmetric pull layout you would not have noticed until the holes were drilled. Especially valuable in pre-1990 Vermont kitchens where original cabinet layouts are non-standard.",
    saturdayCompatible: true,
  },
  {
    id: 'kitchen_pull_permit_for_electrical',
    topic: 'kitchen',
    scopeVariantIds: ['kitchen_lighting_swap'],
    title: 'Pull permit before scheduling electrical work',
    pathTags: ['best_overall'],
    rank: 15,
    spend: { low: 0, high: 200, unit: 'permit fee if applicable' },
    timeMinutes: 30,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 78,
    whyRanked:
      'Adding new circuits or moving existing under-cabinet feeds is permitted work in most Vermont towns. Unsigned electrical surfaces during sale-time inspections at $1,000-6,000 in re-wiring. Pull the permit, schedule the inspector, $200 now vs the rewire later.',
    saturdayCompatible: false,
    relatedTrapIds: ['homeowner-pulled-permit', 'diy-electrical-without-permit'],
  },

  // ========== WEATHERIZATION ==========================================
  {
    id: 'weather_walkthrough_with_ir',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing', 'weatherization_attic_basics'],
    title: 'Walk-through with infrared thermometer',
    pathTags: ['best_overall', 'diy_only', 'saturday_plan'],
    rank: 1,
    spend: { low: 18, high: 35, unit: 'IR thermometer' },
    timeMinutes: 60,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 90,
    whyRanked:
      'A $20 IR thermometer in cold weather identifies the rim joists, attic plate gaps, and outlet leaks that most DIY weatherization misses. Walk perimeter on a sub-30°F evening, mark spots more than 8°F colder than the room with painters tape, then seal those spots first.',
    saturdayCompatible: true,
    relatedKitIds: ['diy_weatherization_tools'],
    relatedFactIds: ['evt-diy-weatherization-rebate'],
  },
  {
    id: 'weather_air_seal_rim_joists',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    title: 'Air-seal rim joists in basement',
    pathTags: ['best_overall', 'diy_only', 'before_heat_pump'],
    rank: 2,
    spend: { low: 40, high: 80, unit: 'foam + caulk' },
    timeMinutes: 240,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 92,
    whyRanked:
      "Rim joists account for 20-30% of Vermont basement heat loss in older homes. Three cans of Great Stuff Pro and a tube of GE Silicone II finishes a 30x40 ft basement perimeter in a Saturday afternoon. EVT $100 DIY rebate eligible.",
    saturdayCompatible: true,
    relatedFactIds: ['evt-diy-weatherization-rebate', 'vt-heating-degree-days'],
    relatedTrapIds: ['weatherization_bulk_insulation'],
  },
  {
    id: 'weather_caulk_window_perimeters',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    title: 'Caulk gun: window perimeters first',
    pathTags: ['best_overall', 'diy_only', 'saturday_plan'],
    rank: 3,
    spend: { low: 18, high: 40, unit: 'caulk + gun' },
    timeMinutes: 120,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 80,
    whyRanked:
      'Window-frame-to-wall gaps move with seasonal humidity. Re-bead with paintable silicone every 4-6 years on the south and west exposures (sun-driven movement is highest). $20 caulk gun + 2 tubes covers a typical 1,800 sq ft Vermont home.',
    saturdayCompatible: true,
  },
  {
    id: 'weather_foam_penetrations',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    title: 'Foam can: electrical and plumbing penetrations only',
    pathTags: ['best_overall', 'diy_only'],
    rank: 4,
    spend: { low: 15, high: 35, unit: '2 cans foam' },
    timeMinutes: 90,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 76,
    whyRanked:
      'Foam where pipes and wires pass through framing — under sinks, behind dryers, at electrical panel — is the second-pass after caulk. Use Great Stuff Pro Gaps & Cracks (red can), not the standard yellow.',
    saturdayCompatible: true,
  },
  {
    id: 'weather_door_bottoms',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing'],
    title: 'Weatherstripping at door bottoms',
    pathTags: ['best_overall', 'diy_only', 'warmer_this_weekend'],
    rank: 5,
    spend: { low: 12, high: 30, unit: 'sweep + stripping' },
    timeMinutes: 45,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 72,
    whyRanked:
      'Door bottoms are the visible draft and the easy fix. Replace the door sweep at the back door (where shoveling wears it) and re-stick weatherstripping on the storm door. $20 of materials, single-Saturday job.',
    saturdayCompatible: true,
  },
  {
    id: 'weather_attic_stair_cover',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_attic_basics'],
    title: 'Install attic stair cover',
    pathTags: ['best_overall', 'before_heat_pump'],
    rank: 6,
    spend: { low: 40, high: 90, unit: 'pre-built cover' },
    timeMinutes: 90,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 78,
    whyRanked:
      "Pull-down attic stairs are an uninsulated hole in the ceiling. A $50 pre-built insulated cover seals the hole until you replace the stair unit. Pays back inside one Vermont winter.",
    saturdayCompatible: true,
  },
  {
    id: 'weather_water_heater_blanket',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_attic_basics', 'weatherization_diy_air_sealing'],
    title: 'Water heater blanket install',
    pathTags: ['best_overall', 'diy_only'],
    rank: 7,
    spend: { low: 25, high: 50, unit: 'blanket kit' },
    timeMinutes: 30,
    impactLevel: 'low',
    confidenceLevel: 'high',
    score: 60,
    whyRanked:
      "Older Vermont water heaters in unconditioned basements lose measurable heat through the tank wall. A $30 blanket kit pays back inside 18 months on oil or propane water heat. Skip if your tank is post-2015 (modern foam insulation already exceeds the blanket).",
    saturdayCompatible: true,
  },
  {
    id: 'weather_merv_filter_swap',
    topic: 'weatherization',
    scopeVariantIds: ['weatherization_diy_air_sealing', 'weatherization_attic_basics'],
    title: 'MERV filter swap timing',
    pathTags: ['best_overall', 'warmer_this_weekend'],
    rank: 8,
    spend: { low: 8, high: 25, unit: 'one filter' },
    timeMinutes: 5,
    impactLevel: 'low',
    confidenceLevel: 'high',
    score: 56,
    whyRanked:
      "Most Vermont homes run forced-air furnaces with MERV 8 filters. Swap to MERV 11 (or 13 if the system supports it) once you see leaf litter pulled into returns. October swap, January swap, April swap is the typical Vermont schedule.",
    saturdayCompatible: true,
  },

  // ========== OUTDOOR =================================================
  {
    id: 'outdoor_lake_cover_removal',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    title: 'Lake furniture cover-removal sequence',
    pathTags: ['best_overall', 'lake_rated'],
    rank: 1,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 90,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 86,
    whyRanked:
      "The order matters: covers off when the deck is dry, cushions out from indoor storage, hardware re-tightened before re-mounting. Wet cushions on dry frames retain moisture all season and grow mildew. Schedule a dry forecast window before opening up.",
    saturdayCompatible: true,
  },
  {
    id: 'outdoor_deck_stain_test_patch',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_deck_refresh'],
    title: 'Deck stain test patch',
    pathTags: ['best_overall', 'cosmetic_refresh'],
    rank: 2,
    spend: { low: 12, high: 25, unit: 'sample stain' },
    timeMinutes: 60,
    impactLevel: 'high',
    confidenceLevel: 'medium',
    score: 78,
    whyRanked:
      "Vermont PT lumber takes stain unevenly across boards. Test on three boards in different parts of the deck (one weathered, one new, one in shade), then commit. Half-deck redo is the most common deck-refresh frustration.",
    saturdayCompatible: true,
  },
  {
    id: 'outdoor_lighting_circuit_check',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season', 'outdoor_deck_refresh'],
    title: 'Outdoor lighting circuit check',
    pathTags: ['best_overall'],
    rank: 3,
    spend: { low: 12, high: 25, unit: 'outlet tester' },
    timeMinutes: 30,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 68,
    whyRanked:
      "Vermont outdoor outlets fail every 3-5 years from freeze-thaw on the GFCI. Test with a $15 GFCI tester before plugging in string lights or pumps. Failed GFCI is a real fire risk during a wet lake season.",
    saturdayCompatible: true,
  },
  {
    id: 'outdoor_mosquito_audit',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    title: 'Mosquito control: standing water audit',
    pathTags: ['best_overall', 'lake_rated'],
    rank: 4,
    spend: { low: 0, high: 15, unit: 'mosquito dunks' },
    timeMinutes: 45,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 72,
    whyRanked:
      'Walk the property and identify standing water — gutters, kayak hulls, low-lying tarps, plant saucers. Mosquito dunks ($12 for a year supply) work; bug zappers and citronella do not. Two hours in early May saves an entire blackfly-and-mosquito season.',
    saturdayCompatible: true,
    relatedTrapIds: ['lake_citronella'],
  },
  {
    id: 'outdoor_dock_winter_checklist',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season'],
    title: 'Dock hardware winter checklist',
    pathTags: ['lake_rated', 'best_overall'],
    rank: 5,
    spend: { low: 25, high: 80, unit: 'replacement hardware' },
    timeMinutes: 90,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 82,
    whyRanked:
      "Galvanized hardware on a lake dock fatigues from ice-out movement. Inspect each bolt and connector at fall takeout — replace stress-cracked items before winter storage so you are not chasing parts in April when you want to be on the water.",
    saturdayCompatible: true,
  },
  {
    id: 'outdoor_rug_placement_test',
    topic: 'outdoor',
    scopeVariantIds: ['outdoor_lake_season', 'outdoor_deck_refresh'],
    title: 'Outdoor rug placement test',
    pathTags: ['cosmetic_refresh'],
    rank: 6,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 30,
    impactLevel: 'low',
    confidenceLevel: 'medium',
    score: 50,
    whyRanked:
      "Outdoor rugs trap moisture against PT or composite decking and can stain the underside. Position the rug, mark the corners, lift it weekly to check the underside for two weeks before committing to seasonal placement.",
    saturdayCompatible: true,
  },

  // ========== HEAT PUMP READINESS =====================================
  {
    id: 'hp_walkthrough_comfort_gaps',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Verify remaining comfort gaps (walk-through)',
    pathTags: ['best_overall', 'already_weatherized', 'before_heat_pump'],
    rank: 1,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 20,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 92,
    whyRanked:
      "Cold rooms, drafty corners, and uneven floor temps are what the heat pump install will not fix on its own. Identify them now so you can ask the installer to size for the whole-home post-weatherization load, not the worst-room load.",
    saturdayCompatible: true,
    relatedTrapIds: ['heat-pump-before-air-sealing'],
  },
  {
    id: 'hp_tune_airflow_registers',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Tune airflow at registers / returns',
    pathTags: ['best_overall', 'already_weatherized'],
    rank: 2,
    spend: { low: 0, high: 15, unit: 'manual dampers' },
    timeMinutes: 30,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 88,
    whyRanked:
      "Manual register damper adjustments balance airflow between rooms in 30 minutes. Most Vermont forced-air homes have not been re-balanced since the original install. Free comfort gain, often more impactful than the smart-register-damper purchase.",
    saturdayCompatible: true,
    relatedTrapIds: ['heat_pump_thermostat_before_air_seal'],
  },
  {
    id: 'hp_thermostat_schedule',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Adjust thermostat schedule',
    pathTags: ['best_overall', 'already_weatherized', 'warmer_this_weekend'],
    rank: 3,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 10,
    impactLevel: 'low',
    confidenceLevel: 'high',
    score: 84,
    whyRanked:
      "Heat pumps work best at smaller setbacks than oil or gas furnaces. Set night setback to 3-4°F (not 8-10°F). Counter-intuitive but documented in cold-climate heat-pump research.",
    saturdayCompatible: true,
  },
  {
    id: 'hp_recheck_temps_clearances',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Recheck heat pump readiness (temps & clearances)',
    pathTags: ['best_overall', 'before_heat_pump'],
    rank: 4,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 15,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 78,
    whyRanked:
      "Confirm the planned outdoor unit location: 24 inches above expected snow drift, 36 inches clear in front, no drip path from the eave above. Vermont snow loads exceed the manufacturer-default install diagrams.",
    saturdayCompatible: true,
  },
  {
    id: 'hp_confirm_rebate_timing',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Confirm rebate / next-step timing',
    pathTags: ['best_overall'],
    rank: 5,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 30,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 70,
    whyRanked:
      "Verify the EVT rebate is netted at install (paid contractor-side, not to you), confirm fuel-switch eligibility, and time the install for shoulder-season pricing if possible. EVT Customer Support confirms eligibility before you schedule.",
    saturdayCompatible: true,
    relatedFactIds: ['evt-ducted-heat-pump-rebate', 'evt-fuel-switching-bonus'],
    relatedTrapIds: ['evt-rebate-paid-to-contractor'],
  },
  {
    id: 'hp_replace_filter_overdue',
    topic: 'heat_pump',
    scopeVariantIds: ['heat_pump_readiness_prep'],
    title: 'Replace filter if overdue',
    pathTags: ['warmer_this_weekend', 'best_overall'],
    rank: 6,
    spend: { low: 10, high: 25, unit: 'one MERV filter' },
    timeMinutes: 5,
    impactLevel: 'low',
    confidenceLevel: 'high',
    score: 55,
    whyRanked:
      "If the system is forced-air and the filter has not been changed in 6+ months, swap it before the heat-pump install evaluation. Restricted airflow distorts the installer's load measurement.",
    saturdayCompatible: true,
  },

  // ========== BATH ====================================================
  {
    id: 'bath_grab_bar_location',
    topic: 'bath',
    scopeVariantIds: ['bath_accessibility_basics'],
    title: 'Grab bar location verification',
    pathTags: ['best_overall', 'accessibility_basics'],
    rank: 1,
    spend: { low: 5, high: 15, unit: 'stud finder' },
    timeMinutes: 30,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 88,
    whyRanked:
      "Grab bars must anchor to studs to support 250+ lbs. Use a stud finder, mark with painters tape, and verify the planned bar location lands on a stud at the right height (33-36 inches from finished floor for tub-side, 32-34 inches for shower-side).",
    saturdayCompatible: true,
  },
  {
    id: 'bath_tub_caulk_inspection',
    topic: 'bath',
    scopeVariantIds: ['bath_accessibility_basics'],
    title: 'Tub-surround caulk inspection',
    pathTags: ['best_overall', 'cosmetic_refresh'],
    rank: 2,
    spend: { low: 12, high: 25, unit: 'silicone caulk' },
    timeMinutes: 60,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 72,
    whyRanked:
      "Tub-surround caulk fails behind the visible joint and lets water into the framing. Pull a corner with a putty knife — if there is mildew or moisture behind, re-bead with 100% silicone before considering more cosmetic work.",
    saturdayCompatible: true,
    diyStopLineConditions: ['Visible water damage to drywall behind caulk', 'Soft floor near tub'],
  },
  {
    id: 'bath_fan_runtime_check',
    topic: 'bath',
    scopeVariantIds: ['bath_accessibility_basics'],
    title: 'Bath fan run-time check',
    pathTags: ['best_overall'],
    rank: 3,
    spend: { low: 0, high: 25, unit: 'humidity sensor switch' },
    timeMinutes: 30,
    impactLevel: 'low',
    confidenceLevel: 'medium',
    score: 50,
    whyRanked:
      "Bath fans should run 20-30 minutes after a shower to clear humidity. A $20 timer or humidity-sensor switch automates this. Reduces mildew growth in Vermont winter when showers add humidity to a closed-up house.",
    saturdayCompatible: true,
  },

  // ========== GENERAL / CROSS-TOPIC ===================================
  {
    id: 'general_inventory_check',
    topic: 'general_orientation',
    scopeVariantIds: [],
    title: 'Check existing inventory before shopping',
    pathTags: ['best_overall'],
    rank: 1,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 30,
    impactLevel: 'medium',
    confidenceLevel: 'high',
    score: 70,
    whyRanked:
      "Most Vermont DIY households already own 60% of the basic-tool list. A 30-minute basement walk before placing the order avoids the duplicate-purchase tax that adds $40-120 to a typical project.",
    saturdayCompatible: true,
  },
  {
    id: 'general_sketch_paper',
    topic: 'general_orientation',
    scopeVariantIds: [],
    title: 'Sketch the project on paper before buying',
    pathTags: ['best_overall'],
    rank: 2,
    spend: { low: 0, high: 0, unit: 'time only' },
    timeMinutes: 45,
    impactLevel: 'medium',
    confidenceLevel: 'medium',
    score: 60,
    whyRanked:
      "30 minutes of sketching catches the asymmetric layout you would not have noticed until materials were ordered. Especially valuable in pre-1990 Vermont homes where original construction is rarely standard.",
    saturdayCompatible: true,
  },
  {
    id: 'general_pull_permits',
    topic: 'general_orientation',
    scopeVariantIds: [],
    title: 'Pull permits before scheduling work',
    pathTags: ['best_overall'],
    rank: 3,
    spend: { low: 0, high: 250, unit: 'permit fee' },
    timeMinutes: 45,
    impactLevel: 'high',
    confidenceLevel: 'high',
    score: 76,
    whyRanked:
      "Even DIY work that requires a permit (most electrical, most plumbing) is cheaper to permit than to fix at sale time. Call the town clerk Monday morning, ask which work needs a permit and which does not.",
    saturdayCompatible: false,
    relatedTrapIds: ['homeowner-pulled-permit', 'diy-electrical-without-permit'],
    relatedFactIds: ['vt-residential-contract-statute', 'vt-contractor-registration-threshold'],
  },
]

// ---------- Helpers ---------------------------------------------------

export function getMovesForScope(topic: TopicId, scopeVariantId: string): Move[] {
  return MOVES.filter(
    m => m.topic === topic && (m.scopeVariantIds.length === 0 || m.scopeVariantIds.includes(scopeVariantId)),
  ).sort((a, b) => b.score - a.score)
}

export function getMovesByPath(topic: TopicId, scopeVariantId: string, pathTag: string): Move[] {
  return getMovesForScope(topic, scopeVariantId)
    .filter(m => m.pathTags.includes(pathTag))
    .sort((a, b) => b.score - a.score)
}

export function getSaturdayMoves(topic: TopicId, scopeVariantId: string, max = 5): Move[] {
  return getMovesForScope(topic, scopeVariantId)
    .filter(m => m.saturdayCompatible)
    .slice(0, max)
}

export function getMoveById(id: string): Move | undefined {
  return MOVES.find(m => m.id === id)
}
