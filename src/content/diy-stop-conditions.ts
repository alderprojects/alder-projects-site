// DIY Stop Line conditions — the per-topic structured list of
// "if you see this, stop and call a pro" triggers that the
// Worth-It Plan dashboard renders in its DIY Stop Line panel.
//
// Each condition is a concrete observation a homeowner can make
// while doing the work. Voice-guide compliant: name the actual
// trigger, name why it matters, name who to call.

import type { TopicId } from '../lib/property-modules'

export type StopCondition = {
  id: string
  topic: TopicId
  trigger: string                    // 'Wet or moldy areas'
  why: string                        // 1-2 sentences explaining
  whoToCall: string                  // 'Licensed plumber' / 'Electrician' / etc.
  referToFactIds?: string[]
}

export const STOP_CONDITIONS: StopCondition[] = [
  // ---------- Kitchen ------------------------------------------------
  {
    id: 'kitchen_shutoff_failed',
    topic: 'kitchen',
    trigger: 'Sink shutoff valve fails the trickle test',
    why:
      "Vermont kitchen shutoffs that have not turned in 15+ years often fail. Pulling the old faucet without a working shutoff means cutting water at the basement, which is fine — until you discover the shutoff at the basement is also corroded.",
    whoToCall: 'Licensed plumber',
  },
  {
    id: 'kitchen_corroded_supply_lines',
    topic: 'kitchen',
    trigger: 'Old faucet supply lines are crimped, corroded, or fixed-rigid',
    why:
      "Pre-1990 Vermont kitchens often have rigid copper supply lines instead of flex hoses. Cutting and re-soldering these is licensed plumbing work. DIY swap is safe only if you have flex supplies and working shutoffs.",
    whoToCall: 'Licensed plumber',
  },
  {
    id: 'kitchen_unsigned_electrical',
    topic: 'kitchen',
    trigger: 'Electrical work needed beyond direct fixture replacement',
    why:
      "Adding a new circuit, moving a feed, or running new wiring is permitted work in most Vermont towns. Unsigned electrical surfaces during sale-time inspection at $1,000-6,000 in re-wiring.",
    whoToCall: 'Licensed electrician',
    referToFactIds: ['vt-residential-contract-statute'],
  },
  {
    id: 'kitchen_load_bearing_uncertain',
    topic: 'kitchen',
    trigger: 'Wall removal where load-bearing status is uncertain',
    why:
      "Even a partial wall removal in pre-1980 Vermont homes can intersect load paths the original framer hand-built. Wrong call = ceiling sag or failure. A structural engineer's site visit is $250-450.",
    whoToCall: 'Structural engineer or licensed contractor',
  },

  // ---------- Weatherization ----------------------------------------
  {
    id: 'weather_knob_and_tube',
    topic: 'weatherization',
    trigger: 'Knob-and-tube wiring visible in basement or attic',
    why:
      "Pre-1950 Vermont homes often retain knob-and-tube. Insulating around K&T is a fire risk and an insurance-policy violation. Identify K&T before any insulation work.",
    whoToCall: 'Licensed electrician for K&T evaluation, then weatherization installer',
  },
  {
    id: 'weather_visible_mold',
    topic: 'weatherization',
    trigger: 'Visible mold or water staining in attic or basement',
    why:
      'Air-sealing over an active leak traps moisture against the framing. Identify and resolve the moisture source before sealing — otherwise the rot accelerates.',
    whoToCall: 'Licensed contractor or water-damage specialist',
  },
  {
    id: 'weather_asbestos_suspect',
    topic: 'weatherization',
    trigger: 'Suspect asbestos in attic insulation (vermiculite, wrapped pipes)',
    why:
      "Vermiculite insulation in pre-1990 homes commonly contains asbestos (Zonolite). Disturbing it during DIY weatherization releases fibers. State-licensed abatement is required.",
    whoToCall: 'State-licensed asbestos abatement contractor',
  },
  {
    id: 'weather_active_leak',
    topic: 'weatherization',
    trigger: 'Active roof or ice-dam leak',
    why:
      "Air-sealing the attic does not solve a roof leak. The leak compounds; the sealing slows drying. Address the roof first.",
    whoToCall: 'Roofing contractor',
  },

  // ---------- Outdoor ------------------------------------------------
  {
    id: 'outdoor_deck_structural_rot',
    topic: 'outdoor',
    trigger: 'Soft, spongy, or rotted deck framing',
    why:
      'Cosmetic refresh on a deck with rotted ledger boards or joists is unsafe. Probe the framing with a screwdriver — anything that gives more than a quarter inch needs replacement before refinishing.',
    whoToCall: 'Licensed contractor',
  },
  {
    id: 'outdoor_dock_fastener_failure',
    topic: 'outdoor',
    trigger: 'Dock connectors with stress cracks or loose decking',
    why:
      "Lake-property dock failures during ice-out or summer heat can cause injury. Replace stress-cracked galvanized hardware before reinstalling.",
    whoToCall: 'Marine contractor or licensed contractor familiar with lake docks',
  },
  {
    id: 'outdoor_buried_utilities',
    topic: 'outdoor',
    trigger: 'Any digging — even shallow — without locating utilities',
    why:
      "Vermont Dig Safe (call 811) is free and required by law before digging. Hitting a buried gas, electric, or fiber line is dangerous and expensive.",
    whoToCall: 'Vermont Dig Safe — call 811 (free)',
  },

  // ---------- Heat pump ---------------------------------------------
  {
    id: 'hp_panel_capacity_unclear',
    topic: 'heat_pump',
    trigger: 'Existing electrical panel near capacity',
    why:
      "Cold-climate heat pumps often need a dedicated 20-30A circuit. If the existing panel is full or near capacity, the install requires a panel upgrade ($2,500-5,000). Verify before ordering.",
    whoToCall: 'Licensed electrician or HVAC installer',
    referToFactIds: ['evt-electrical-service-upgrade'],
  },
  {
    id: 'hp_existing_oil_removal',
    topic: 'heat_pump',
    trigger: 'Removing oil furnace or tank',
    why:
      "Removing an active oil furnace or tank is licensed work. Vermont DEC requires proper closure of buried tanks. Permits and disposal are not DIY.",
    whoToCall: 'Licensed HVAC contractor + Vermont DEC for tank closure',
  },
  {
    id: 'hp_refrigerant_handling',
    topic: 'heat_pump',
    trigger: 'Any refrigerant line work',
    why:
      "Refrigerant handling requires EPA Section 608 certification. DIY refrigerant work is illegal and dangerous.",
    whoToCall: 'Licensed HVAC technician with EPA 608 certification',
  },

  // ---------- Bath ---------------------------------------------------
  {
    id: 'bath_water_damage_behind_caulk',
    topic: 'bath',
    trigger: 'Visible water damage to drywall behind tub-surround caulk',
    why:
      "Re-caulking over water-damaged drywall traps the existing damage and lets it spread. The framing behind the tub may already be rotted.",
    whoToCall: 'Licensed contractor or restoration specialist',
  },
  {
    id: 'bath_soft_floor',
    topic: 'bath',
    trigger: 'Soft or spongy floor near tub or toilet',
    why:
      "Subfloor rot from a long-term leak. Surface-level repair (tile, vinyl, paint) over rotted subfloor fails inside 12 months. Open the floor and assess before refinishing.",
    whoToCall: 'Licensed contractor',
  },
  {
    id: 'bath_grab_bar_no_stud',
    topic: 'bath',
    trigger: 'No stud at planned grab-bar location',
    why:
      "Drywall anchors fail under 250+ lb load. Grab bars must anchor to a stud, blocking, or a fixture-rated mounting plate.",
    whoToCall: 'Licensed contractor (for blocking installation)',
  },

  // ---------- Cross-topic --------------------------------------------
  {
    id: 'general_lead_paint_pre_1978',
    topic: 'general_orientation',
    trigger: 'Sanding, scraping, or removing paint in a pre-1978 Vermont home',
    why:
      "Pre-1978 paint may contain lead. Disturbing lead paint without RRP-certified containment is a health hazard, particularly with children in the home.",
    whoToCall: 'EPA RRP-certified contractor for any disturbance over 6 sq ft interior or 20 sq ft exterior',
  },
  {
    id: 'general_uncertain_permits',
    topic: 'general_orientation',
    trigger: 'Uncertainty whether the work needs a permit',
    why:
      "When in doubt, call the town clerk Monday morning. The 5-minute call is free; the after-the-fact permit retroactive fee is not.",
    whoToCall: 'Town clerk',
    referToFactIds: ['vt-residential-contract-statute'],
  },
]

// ---------- Helpers ---------------------------------------------------

export function getStopConditionsForTopic(topic: TopicId): StopCondition[] {
  return STOP_CONDITIONS.filter(s => s.topic === topic || s.topic === 'general_orientation')
}

export function getStopConditionById(id: string): StopCondition | undefined {
  return STOP_CONDITIONS.find(s => s.id === id)
}
