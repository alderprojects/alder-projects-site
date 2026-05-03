// ---------------------------------------------------------------------------
// AFFILIATE CATALOG + PROGRAM REGISTRY
//
// Two layers:
//   1. AFFILIATE_PROGRAMS — meta-config for the affiliate networks we
//      participate in (Amazon Associates, Home Depot via Impact, Lowe's
//      via Rakuten, Wayfair, Lemonade). Used by buildAffiliateUrl /
//      trackedAffiliateLink for chat replies and any stand-alone link
//      construction.
//   2. AFFILIATE_CATALOG — the situational item library. Each item
//      declares which (intent × scope × town × topic × property
//      characteristic) situations it belongs in, plus optional
//      seasons. The property page picks 5-7 items per rendering moment
//      via property-affiliates.ts helpers.
//
// Disclosure (per FTC + brand promise to users):
// "Some links earn us a small commission. That's how a free Vermont
// site stays free. We only recommend what we'd buy ourselves."
// ---------------------------------------------------------------------------

// ===========================================================================
// PROGRAM REGISTRY (existing infrastructure preserved)
// ===========================================================================

export type AffiliateProgram = {
  id: string
  name: string
  category: 'home_improvement' | 'general_retail' | 'insurance' | 'financial' | 'tools' | 'specialty'
  envVar: string
  trackingParam: string
  baseUrl: string
  active: boolean
  notes?: string
}

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: 'amazon',
    name: 'Amazon Associates',
    category: 'general_retail',
    envVar: 'AMAZON_ASSOCIATES_TAG',
    trackingParam: 'tag',
    baseUrl: 'https://www.amazon.com',
    active: false,
    notes: 'Default for fungible items, smart-home gear, weatherization materials.',
  },
  {
    id: 'home_depot',
    name: 'Home Depot (via Impact.com)',
    category: 'home_improvement',
    envVar: 'HOME_DEPOT_AFFILIATE_ID',
    trackingParam: 'cm_mmc',
    baseUrl: 'https://www.homedepot.com',
    active: false,
    notes: 'Use for: insulation, paint, contractor-grade tools.',
  },
  {
    id: 'lowes',
    name: "Lowe's (via Rakuten Advertising)",
    category: 'home_improvement',
    envVar: 'LOWES_AFFILIATE_ID',
    trackingParam: 'cm_mmc',
    baseUrl: 'https://www.lowes.com',
    active: false,
  },
  {
    id: 'wayfair',
    name: 'Wayfair Affiliate',
    category: 'home_improvement',
    envVar: 'WAYFAIR_AFFILIATE_ID',
    trackingParam: 'refid',
    baseUrl: 'https://www.wayfair.com',
    active: false,
  },
  {
    id: 'lemonade',
    name: 'Lemonade Insurance (via Impact)',
    category: 'insurance',
    envVar: 'LEMONADE_AFFILIATE_ID',
    trackingParam: 'irclickid',
    baseUrl: 'https://www.lemonade.com',
    active: false,
    notes: 'Pre-purchase persona — home insurance recommendations.',
  },
]

export function getProgram(programId: string): AffiliateProgram | null {
  return AFFILIATE_PROGRAMS.find(x => x.id === programId) ?? null
}

export function getAffiliateIdFromEnv(programId: string): string {
  const program = getProgram(programId)
  if (!program) return ''
  if (typeof process === 'undefined' || !process.env) return ''
  return process.env[program.envVar] || ''
}

export function buildAffiliateUrl(programId: string, destUrl: string): string {
  const program = getProgram(programId)
  if (!program) return destUrl
  const affiliateId = getAffiliateIdFromEnv(programId)
  if (!affiliateId) return destUrl
  let target: URL
  try {
    target = new URL(destUrl, program.baseUrl)
  } catch {
    return destUrl
  }
  target.searchParams.set(program.trackingParam, affiliateId)
  return target.toString()
}

export function trackedAffiliateLink(programId: string, destUrl: string, label?: string): string {
  const program = getProgram(programId)
  if (!program) return destUrl
  const params = new URLSearchParams()
  params.set('p', programId)
  params.set('u', destUrl)
  if (label) params.set('label', label)
  return '/api/affiliate/click?' + params.toString()
}

export const AFFILIATE_DISCLOSURE_SHORT =
  "Some links earn us a small commission. That's how a free Vermont site stays free."

export const AFFILIATE_DISCLOSURE_LONG =
  "Some links on this site and in your briefing earn us a small commission if you buy through them. That's how a free Vermont homeowner reference stays free. We only recommend products we'd buy ourselves and the commission never affects what we recommend or how we describe it. Vermont-specific picks are made on Vermont merit, not on commission rate."

// ===========================================================================
// SITUATIONAL CATALOG TYPES
// ===========================================================================

// Topic / Scope / Intent / Tier — kept as string aliases here so this
// data file does not need to import from src/lib/property-modules.tsx.
// Anyone consuming the catalog (property-affiliates.ts) imports the
// real types and asserts narrowing at the call site.
export type AffTopicId =
  | 'heat_pump'
  | 'kitchen'
  | 'bath'
  | 'solar_battery'
  | 'outdoor'
  | 'addition_adu'
  | 'weatherization'
  | 'rebate_strat'
  | 'property_tax'
  | 'flood_zone'
  | 'rebate_eligibility'
  | 'contractor_vetting'
  | 'general_orientation'
  | 'mud_season'
  | 'well_septic'

export type AffScope = 'diy' | 'mid' | 'big' | 'na'
export type AffIntent = 'buying' | 'owner' | 'looking' | 'researching'
export type AffTownTier =
  | 'burlington_metro'
  | 'chittenden_other'
  | 'resort_premium'
  | 'small_city'
  | 'rural'

export type PropertyCharacteristic = 'lake' | 'flood' | 'pre1950' | 'rural' | 'mobile_home'

export type Season =
  | 'mud'
  | 'spring_blackfly'
  | 'lake'
  | 'lake_opening'
  | 'lake_operations'
  | 'lake_property_maintenance'
  | 'lake_closing'
  | 'fall_leaf'
  | 'pre_winter'
  | 'deep_winter'

export type SituationTag = {
  topic?: AffTopicId | '*'
  scope?: AffScope | '*'
  townTiers?: AffTownTier[] | '*'
  intents?: AffIntent[]
  propertyChars?: PropertyCharacteristic[]
}

export type AffiliateCategory =
  | 'tools'
  | 'home_systems'
  | 'seasonal'
  | 'safety'
  | 'lake'
  | 'maintenance'
  | 'aging'
  | 'rental'

export type AffiliateItem = {
  id: string
  display: string
  url: string
  shortNote: string
  category: AffiliateCategory
  situations: SituationTag[]
  seasons?: Season[]
}

const TAG = 'alderprojects-20'

// Helper to build Amazon search URLs for fungible items. Real product
// names go into the query string verbatim — the tag is appended.
function az(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${TAG}`
}

// Quick aliases that show up across many situations.
const PRE_PURCHASE: SituationTag = { intents: ['buying'] }
const FIRST_YEAR_OWNER: SituationTag = { intents: ['buying', 'owner'] }
const ANY_OWNER: SituationTag = { intents: ['owner'] }
const OWNER_NO_TOPIC: SituationTag = { intents: ['owner'], topic: '*' } // any topic incl. null

// ===========================================================================
// AFFILIATE CATALOG
// ===========================================================================

export const AFFILIATE_CATALOG: AffiliateItem[] = [
  // === Pre-purchase inspection kit ========================================
  {
    id: 'moisture_meter',
    display: 'Moisture meter',
    url: az('pinless moisture meter'),
    shortNote: 'Pinless meter spots wall, ceiling, and crawlspace damp without making holes — buyer essential.',
    category: 'tools',
    situations: [PRE_PURCHASE, { topic: 'flood_zone' }],
  },
  {
    id: 'outlet_tester',
    display: 'Outlet + GFCI tester',
    url: az('gfci outlet tester'),
    shortNote: 'Three-prong tester catches reversed wiring and missing GFCIs in a Vermont rental walkthrough.',
    category: 'tools',
    situations: [PRE_PURCHASE, FIRST_YEAR_OWNER, { topic: 'contractor_vetting' }],
  },
  {
    id: 'co_detector',
    display: 'CO detector (10-year sealed)',
    url: az('first alert 10 year sealed carbon monoxide detector'),
    shortNote: 'VT requires CO detector outside every sleeping area for any oil/gas/wood heat. Sealed unit lasts a decade.',
    category: 'safety',
    situations: [PRE_PURCHASE, FIRST_YEAR_OWNER, { intents: ['owner'], propertyChars: ['rural'] }],
  },
  {
    id: 'inspection_flashlight',
    display: 'LED inspection flashlight',
    url: az('led tactical flashlight inspection 1000 lumen'),
    shortNote: 'Crawlspaces and unfinished basements eat cheap lights. Bring real lumens.',
    category: 'tools',
    situations: [PRE_PURCHASE, ANY_OWNER],
  },
  {
    id: 'ir_thermometer',
    display: 'Infrared thermometer',
    url: az('infrared thermometer gun'),
    shortNote: 'Spot drafts at windows, cold returns, and uninsulated rim joists from across the room.',
    category: 'tools',
    situations: [PRE_PURCHASE, { topic: 'weatherization' }, { topic: 'heat_pump' }],
  },
  {
    id: 'plumb_level',
    display: 'Plumb level + post level',
    url: az('plumb level post level'),
    shortNote: 'Old VT houses settle. Quick check on door frames and floors before you fall in love.',
    category: 'tools',
    situations: [PRE_PURCHASE, { propertyChars: ['pre1950'] }],
  },
  {
    id: 'plumbers_camera',
    display: 'Drain inspection camera',
    url: az('plumbing endoscope camera wifi'),
    shortNote: "Pull a sink trap, drop the camera. Catches a buyer's bad cast-iron drain before closing.",
    category: 'tools',
    situations: [PRE_PURCHASE, { topic: 'well_septic' }],
  },

  // === First-year-as-owner essentials ====================================
  {
    id: 'smart_thermostat',
    display: 'Smart thermostat (Ecobee)',
    url: az('ecobee smart thermostat premium'),
    shortNote: 'Ecobee with remote sensors pays for itself in one Vermont winter.',
    category: 'home_systems',
    situations: [FIRST_YEAR_OWNER, { topic: 'heat_pump' }, { topic: 'weatherization' }],
  },
  {
    id: 'mud_mat',
    display: 'Mud mat (WaterHog)',
    url: az('waterhog door mat outdoor'),
    shortNote: 'Vermont mud is its own weather event. WaterHog at every entry, period.',
    category: 'seasonal',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
    seasons: ['mud'],
  },
  {
    id: 'snow_shovel',
    display: 'Slush-rated snow shovel',
    url: az('garant snow shovel ergonomic'),
    shortNote: 'Wet Vermont snow breaks plastic. Aluminum-edged shovels survive February.',
    category: 'seasonal',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
    seasons: ['deep_winter', 'pre_winter'],
  },
  {
    id: 'draft_stoppers',
    display: 'Door draft stoppers',
    url: az('door draft stopper bottom seal'),
    shortNote: 'Bottom-of-door stoppers cut the draft an old VT house still has after weatherstripping.',
    category: 'maintenance',
    situations: [FIRST_YEAR_OWNER, { topic: 'weatherization' }],
    seasons: ['pre_winter', 'deep_winter'],
  },
  {
    id: 'fire_extinguisher',
    display: 'ABC fire extinguisher',
    url: az('first alert abc fire extinguisher home'),
    shortNote: 'Every VT town fire marshal will tell you the same thing — kitchen and basement, both.',
    category: 'safety',
    situations: [FIRST_YEAR_OWNER, { intents: ['owner'], propertyChars: ['rural'] }],
  },
  {
    id: 'basic_tool_kit',
    display: 'Homeowner tool kit',
    url: az('craftsman 230 piece mechanic tool set'),
    shortNote: 'The 50 tools you need first month, in one box. Better than buying piecemeal.',
    category: 'tools',
    situations: [FIRST_YEAR_OWNER],
  },

  // === DIY weatherization (any owner) ====================================
  {
    id: 'caulk_gun_kit',
    display: 'Caulk gun + cartridges',
    url: az('silicone caulk gun kit weatherproof'),
    shortNote: 'Window perimeters and trim joints drink caulk. Buy the dripless gun, save your sleeves.',
    category: 'tools',
    situations: [{ topic: 'weatherization' }, { topic: 'heat_pump' }, FIRST_YEAR_OWNER],
  },
  {
    id: 'foam_sealant',
    display: 'Foam sealant (Great Stuff)',
    url: az('great stuff foam sealant'),
    shortNote: 'Rim joists are the biggest leak in a Vermont basement. Foam them.',
    category: 'tools',
    situations: [{ topic: 'weatherization' }, { topic: 'heat_pump' }],
  },
  {
    id: 'weatherstripping',
    display: 'Door weatherstripping',
    url: az('door weatherstripping kit foam'),
    shortNote: 'Replace it every 3-5 years. Vermont winter is brutal on the foam.',
    category: 'maintenance',
    situations: [{ topic: 'weatherization' }, FIRST_YEAR_OWNER],
    seasons: ['pre_winter'],
  },
  {
    id: 'pipe_insulation',
    display: 'Pipe insulation foam',
    url: az('pipe insulation foam outdoor 3 4 inch'),
    shortNote: 'Wrap every exposed run in the basement and crawlspace. Cheap insurance against a freeze.',
    category: 'maintenance',
    situations: [{ topic: 'weatherization' }, FIRST_YEAR_OWNER],
    seasons: ['pre_winter'],
  },
  {
    id: 'window_film_3m',
    display: '3M Window Insulator Kit',
    url: az('3M Window Insulator Kit indoor'),
    shortNote: 'Storm-window-quality without the storm window. R-value bump on single-pane VT bedrooms.',
    category: 'seasonal',
    situations: [{ topic: 'weatherization' }, { propertyChars: ['pre1950'] }],
    seasons: ['pre_winter', 'deep_winter'],
  },
  {
    id: 'attic_stair_cover',
    display: 'Attic stairway insulator',
    url: az('attic stairway insulator cover'),
    shortNote: 'Pull-down attic stairs are usually uninsulated. This cover saves a measurable amount of heat.',
    category: 'maintenance',
    situations: [{ topic: 'weatherization' }],
  },
  {
    id: 'water_heater_blanket',
    display: 'Water heater insulator blanket',
    url: az('water heater insulation blanket'),
    shortNote: 'Pre-1990 tank? Wrap it. $30 saves you a few percent on the heating bill.',
    category: 'home_systems',
    situations: [{ topic: 'weatherization' }, { propertyChars: ['pre1950'] }],
  },
  {
    id: 'dryer_vent_kit',
    display: 'Dryer vent cleaning kit',
    url: az('gardus dryer vent cleaning kit'),
    shortNote: 'Vermont houses with long vent runs catch lint fires every winter. Annual clean.',
    category: 'safety',
    situations: [{ topic: 'weatherization' }, FIRST_YEAR_OWNER],
  },
  {
    id: 'outlet_gaskets',
    display: 'Outlet + switch gaskets',
    url: az('foam outlet gasket sealer'),
    shortNote: 'Exterior-wall outlets leak more air than people think. Foam gaskets behind the plate.',
    category: 'maintenance',
    situations: [{ topic: 'weatherization' }],
  },
  {
    id: 'caulk_spray_foam',
    display: 'Spray foam (cans of small-gap)',
    url: az('great stuff small gap filler cans'),
    shortNote: 'Smaller can with the precision straw. Better than a big-gap can for trim work.',
    category: 'tools',
    situations: [{ topic: 'weatherization' }],
  },

  // === Heat-pump first-winter prep =======================================
  {
    id: 'mini_split_filter',
    display: 'Mini-split filter pack',
    url: az('mini split air filter universal'),
    shortNote: 'Every 90 days. Buy the multi-pack now so you stop forgetting.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump' }],
  },
  {
    id: 'smart_thermostat_basic',
    display: 'Programmable thermostat',
    url: az('honeywell programmable thermostat 7 day'),
    shortNote: 'If a smart thermostat is overkill, a 7-day programmable beats manual every winter.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump' }, FIRST_YEAR_OWNER],
  },
  {
    id: 'condenser_brush',
    display: 'Soft condenser brush',
    url: az('condenser fin comb brush'),
    shortNote: 'Brush the outdoor unit fins every fall. Bent fins lose efficiency fast.',
    category: 'maintenance',
    situations: [{ topic: 'heat_pump' }],
    seasons: ['fall_leaf'],
  },
  {
    id: 'condenser_cover',
    display: 'Outdoor unit cover (off-season)',
    url: az('air conditioner condenser cover top only'),
    shortNote: 'Top-only cover for the cold months — keeps leaves and snow out of the fins.',
    category: 'maintenance',
    situations: [{ topic: 'heat_pump' }],
    seasons: ['fall_leaf', 'pre_winter'],
  },
  {
    id: 'snow_drift_marker',
    display: 'Driveway / unit snow markers',
    url: az('driveway markers snow reflective'),
    shortNote: 'Mark the heat-pump pad and septic tank covers before the first storm.',
    category: 'safety',
    situations: [{ topic: 'heat_pump' }, { topic: 'well_septic' }],
    seasons: ['pre_winter'],
  },

  // === Old VT house weatherization (pre-1950) ============================
  {
    id: 'lead_test_kit',
    display: '3M LeadCheck swab kit',
    url: az('3m leadcheck instant lead test swabs'),
    shortNote: 'Pre-1978 paint? Test before you sand. RRP rules apply if you find lead.',
    category: 'safety',
    situations: [{ propertyChars: ['pre1950'] }, { intents: ['buying'], propertyChars: ['pre1950'] }],
  },
  {
    id: 'asbestos_test_kit',
    display: 'Asbestos test kit (mail-in)',
    url: az('asbestos test kit mail in'),
    shortNote: 'Vinyl tile, pipe wrap, popcorn ceiling — old VT homes hide it. $20 to know.',
    category: 'safety',
    situations: [{ propertyChars: ['pre1950'] }, { intents: ['buying'] }],
  },
  {
    id: 'plaster_repair',
    display: 'Plaster patch + setting compound',
    url: az('durabond 90 setting compound'),
    shortNote: 'Drywall mud cracks in old plaster walls. Use setting compound for repairs that last.',
    category: 'tools',
    situations: [{ propertyChars: ['pre1950'] }],
  },
  {
    id: 'period_caulk',
    display: 'Paintable acrylic caulk (trim work)',
    url: az('alex plus paintable caulk trim'),
    shortNote: 'For interior trim on plaster — paintable acrylic, not silicone.',
    category: 'tools',
    situations: [{ propertyChars: ['pre1950'] }],
  },
  {
    id: 'ir_camera_phone',
    display: 'Phone IR camera (FLIR / Seek)',
    url: az('flir one pro thermal camera ios android'),
    shortNote: 'Picture is worth a thousand draft stoppers — see the cold spots before you guess.',
    category: 'tools',
    situations: [{ propertyChars: ['pre1950'] }, { topic: 'weatherization' }],
  },

  // === Mobile home weatherization ========================================
  {
    id: 'mobile_skirting',
    display: 'Manufactured-home skirting kit',
    url: az('manufactured home skirting vinyl'),
    shortNote: "Skirting is the biggest weatherization win on a Vermont mobile home. Don't skip.",
    category: 'maintenance',
    situations: [{ propertyChars: ['mobile_home'] }],
  },
  {
    id: 'mobile_pipe_heat_tape',
    display: 'Pipe heat tape + thermostat',
    url: az('pipe heat tape thermostat self regulating'),
    shortNote: 'Self-regulating tape under the trailer keeps water lines from freezing in January.',
    category: 'safety',
    situations: [{ propertyChars: ['mobile_home'] }],
    seasons: ['pre_winter', 'deep_winter'],
  },
  {
    id: 'mobile_door_seal',
    display: 'Mobile-home door weatherstrip',
    url: az('mobile home door weatherstripping'),
    shortNote: 'The hinge seal on a 70s/80s mobile home is usually shot. Replace at first cold snap.',
    category: 'maintenance',
    situations: [{ propertyChars: ['mobile_home'] }],
  },
  {
    id: 'mobile_water_heater_blanket',
    display: 'Manufactured-home water heater blanket',
    url: az('mobile home water heater blanket'),
    shortNote: 'Smaller blanket cut for manufactured-home tank closets — better fit than retail blankets.',
    category: 'home_systems',
    situations: [{ propertyChars: ['mobile_home'] }],
  },

  // === Kitchen DIY upgrades ==============================================
  {
    id: 'cabinet_pulls',
    display: 'Cabinet pulls (set)',
    url: az('cabinet pulls brushed nickel set'),
    shortNote: "Bulk pulls — quickest 'new kitchen' look you can ship in an afternoon.",
    category: 'tools',
    situations: [{ topic: 'kitchen' }],
  },
  {
    id: 'undermount_leds',
    display: 'Undermount LED strip',
    url: az('under cabinet led light strip plug in'),
    shortNote: 'Plug-in LED strips warm up dim VT kitchens without an electrician.',
    category: 'tools',
    situations: [{ topic: 'kitchen' }],
  },
  {
    id: 'cabinet_refinish',
    display: 'Cabinet refinishing kit',
    url: az('rust oleum cabinet transformations'),
    shortNote: 'Refinish kit beats paint for cabinet doors that get washed weekly.',
    category: 'tools',
    situations: [{ topic: 'kitchen' }],
  },
  {
    id: 'drawer_organizer',
    display: 'Drawer organizers',
    url: az('expandable bamboo drawer organizer'),
    shortNote: 'Bamboo expanders fit any drawer. Good housewarming, better impulse buy.',
    category: 'tools',
    situations: [{ topic: 'kitchen' }, FIRST_YEAR_OWNER],
  },
  {
    id: 'sink_strainer',
    display: 'Stainless sink strainer',
    url: az('stainless steel sink strainer kitchen'),
    shortNote: 'Vermont older sinks stink without one. $10 fix.',
    category: 'maintenance',
    situations: [{ topic: 'kitchen' }],
  },
  {
    id: 'edge_banding',
    display: 'Iron-on edge banding',
    url: az('iron on edge banding wood veneer'),
    shortNote: "Hide chipped cabinet edges in 20 minutes. Doesn't need a refinish.",
    category: 'tools',
    situations: [{ topic: 'kitchen' }],
  },
  {
    id: 'kitchen_caulk_silicone',
    display: 'Mildew-resistant kitchen caulk',
    url: az('gorilla mold mildew resistant silicone'),
    shortNote: 'Backsplash + sink rim. Vermont humidity in summer eats the wrong caulk.',
    category: 'maintenance',
    situations: [{ topic: 'kitchen' }, { topic: 'bath' }],
  },

  // === Kitchen-while-pro-renovates helpers ==============================
  {
    id: 'temp_kitchen_kit',
    display: 'Temporary kitchen station',
    url: az('counter top burner microwave kit'),
    shortNote: 'Survive a 6-week kitchen reno. Burner + microwave + dish pan + kettle.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen' }],
  },
  {
    id: 'induction_hot_plate',
    display: 'Portable induction hot plate',
    url: az('duxtop induction cooktop portable'),
    shortNote: 'Try induction without committing to a range. Surprisingly fast for an apartment cook.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen' }],
  },
  {
    id: 'mini_fridge',
    display: 'Compact 3.2 cu ft fridge',
    url: az('compact mini fridge 3.2 cu ft'),
    shortNote: 'Garage / makeshift kitchen fridge during reno. Sells used after.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen' }],
  },

  // === Bath DIY upgrades =================================================
  {
    id: 'vanity_faucet',
    display: 'Bathroom vanity faucet',
    url: az('moen bathroom vanity faucet brushed nickel'),
    shortNote: 'New faucet + drain assembly = $80 weekend refresh.',
    category: 'tools',
    situations: [{ topic: 'bath' }],
  },
  {
    id: 'rainfall_showerhead',
    display: 'Rainfall showerhead',
    url: az('moen rainfall showerhead'),
    shortNote: 'Standard NPT thread, no plumber. Vermont well-water flow restrictor still good.',
    category: 'tools',
    situations: [{ topic: 'bath' }],
  },
  {
    id: 'soft_close_toilet_seat',
    display: 'Soft-close toilet seat',
    url: az('soft close elongated toilet seat white'),
    shortNote: 'Elongated soft-close — fits 90% of toilets, 10-minute swap.',
    category: 'tools',
    situations: [{ topic: 'bath' }],
  },
  {
    id: 'bath_exhaust_fan',
    display: 'Quiet bath exhaust fan',
    url: az('panasonic whisperceiling bath exhaust fan'),
    shortNote: 'Vermont winter humidity = mold without good extraction. Panasonic Whisper line is the standard.',
    category: 'home_systems',
    situations: [{ topic: 'bath' }, { topic: 'weatherization' }],
  },
  {
    id: 'grout_pen',
    display: 'Grout pen (white)',
    url: az('grout pen white renew'),
    shortNote: "Refresh dingy grout in an hour without a regrout. Doesn't last forever — does the trick.",
    category: 'maintenance',
    situations: [{ topic: 'bath' }],
  },
  {
    id: 'corner_shelving',
    display: 'Corner shower shelving',
    url: az('rust proof shower corner shelf adhesive'),
    shortNote: 'Adhesive corner shelves, no drilling tile. Clutch in a tight VT bath.',
    category: 'tools',
    situations: [{ topic: 'bath' }],
  },
  {
    id: 'towel_bar',
    display: 'Towel bar set',
    url: az('moen towel bar set brushed nickel'),
    shortNote: "Match the faucet finish, look intentional. $25 — biggest bang for the buck in a bath refresh.",
    category: 'tools',
    situations: [{ topic: 'bath' }],
  },

  // === Deck DIY tools ====================================================
  {
    id: 'deck_stain',
    display: 'Deck stain (semi-transparent)',
    url: az('cabot semi transparent deck stain'),
    shortNote: 'Semi-transparent shows wood grain, lasts ~3 years on a Vermont deck. Cabot makes the standard.',
    category: 'maintenance',
    situations: [{ topic: 'outdoor' }],
    seasons: ['lake'],
  },
  {
    id: 'pressure_washer_electric',
    display: 'Electric pressure washer',
    url: az('sun joe electric pressure washer 2030 psi'),
    shortNote: '2000+ PSI strips an old deck without renting gas. Sun Joe is the value pick.',
    category: 'tools',
    situations: [{ topic: 'outdoor' }],
    seasons: ['lake', 'spring_blackfly'],
  },
  {
    id: 'deck_cleaner',
    display: 'Deck cleaner / brightener',
    url: az('thompsons deck wash cleaner'),
    shortNote: 'Annual wash before you re-stain. Mildew + tannin lift in one step.',
    category: 'maintenance',
    situations: [{ topic: 'outdoor' }],
    seasons: ['lake'],
  },
  {
    id: 'deck_stripper',
    display: 'Deck stain stripper',
    url: az('behr deck stain remover stripper'),
    shortNote: 'For decks where last contractor used a film-forming stain. Solid removers needed.',
    category: 'tools',
    situations: [{ topic: 'outdoor' }],
  },
  {
    id: 'outdoor_caulk',
    display: 'Outdoor exterior caulk',
    url: az('big stretch siliconized acrylic caulk'),
    shortNote: 'Siding seams, deck-to-house joint. Big Stretch is the contractor pick — paintable, no peeling.',
    category: 'maintenance',
    situations: [{ topic: 'outdoor' }, { topic: 'weatherization' }],
  },
  {
    id: 'composite_deck_screws',
    display: 'Composite deck screws',
    url: az('starborn deckfast composite deck screws'),
    shortNote: 'Star drive composite-specific screws — won\'t mushroom the cap on Trex / TimberTech.',
    category: 'tools',
    situations: [{ topic: 'outdoor' }],
  },
  {
    id: 'joist_hangers',
    display: 'Galvanized joist hangers',
    url: az('simpson galvanized joist hanger 2x8'),
    shortNote: 'Replace any rusted hangers spotted from underneath. Simpson is the standard.',
    category: 'tools',
    situations: [{ topic: 'outdoor' }],
  },

  // === Roof / ice dam prep ===============================================
  {
    id: 'roof_rake',
    display: 'Telescoping roof rake',
    url: az('snowcaster telescoping roof rake'),
    shortNote: 'Snowcaster style — keep snow off the eave, ice dams never form.',
    category: 'safety',
    situations: [{ topic: 'outdoor' }, FIRST_YEAR_OWNER, ANY_OWNER],
    seasons: ['deep_winter', 'pre_winter'],
  },
  {
    id: 'attic_ventilation',
    display: 'Attic ventilation kit',
    url: az('attic vent kit ridge'),
    shortNote: 'Ice dams form because the attic is too warm. Cold roof = no ice dam. Vent first.',
    category: 'home_systems',
    situations: [{ topic: 'outdoor' }, { topic: 'weatherization' }],
  },
  {
    id: 'ice_melt_sock',
    display: 'Calcium chloride ice-melt sock',
    url: az('calcium chloride ice melt sock'),
    shortNote: 'Tossed in the gutter, melts a channel through an ice dam. Last-ditch save mid-storm.',
    category: 'safety',
    situations: [{ topic: 'outdoor' }, ANY_OWNER],
    seasons: ['deep_winter'],
  },

  // === Pressure washing prep =============================================
  {
    id: 'surface_cleaner',
    display: 'Pressure washer surface cleaner',
    url: az('pressure washer surface cleaner attachment'),
    shortNote: 'Spinning disc attachment — concrete and decks in half the time, no streaks.',
    category: 'tools',
    situations: [{ topic: 'outdoor' }],
  },
  {
    id: 'detergent',
    display: 'Pressure-washer detergent',
    url: az('pressure washer detergent house wash'),
    shortNote: 'House siding detergent — non-bleach formula, safe for plants.',
    category: 'maintenance',
    situations: [{ topic: 'outdoor' }],
  },

  // === Pre-solar energy monitoring ======================================
  {
    id: 'sense_monitor',
    display: 'Sense Energy Monitor',
    url: az('sense energy monitor'),
    shortNote: 'Clamp inside the panel, see real-time power draw per appliance. Sizes solar honestly.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery' }, { topic: 'rebate_strat' }],
  },
  {
    id: 'kill_a_watt',
    display: 'Kill A Watt outlet meter',
    url: az('kill a watt p3 p4400 meter'),
    shortNote: 'Plug-in meter — find the vampire loads before you size the panels.',
    category: 'tools',
    situations: [{ topic: 'solar_battery' }, { topic: 'weatherization' }],
  },
  {
    id: 'time_of_use_plug',
    display: 'Time-of-use smart plug',
    url: az('tp link kasa smart plug schedule'),
    shortNote: 'GMP customers can save by shifting load. Smart plug for the EV / dryer / dehumidifier.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery' }, { topic: 'rebate_strat' }],
  },
  {
    id: 'panel_load_calc',
    display: 'Clamp meter (electrician)',
    url: az('fluke 323 clamp meter'),
    shortNote: "Real Manual J means real measurements. Fluke 323 is the entry-level standard.",
    category: 'tools',
    situations: [{ topic: 'solar_battery' }, { topic: 'heat_pump' }],
  },

  // === EV charger pre-install ===========================================
  {
    id: 'wallbox_pulsar',
    display: 'Wallbox Pulsar Plus',
    url: az('wallbox pulsar plus 40 amp ev charger'),
    shortNote: 'Compact 40A wall charger, EVT-approved hardware list. WiFi for GMP TOU credit.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery' }],
  },
  {
    id: 'chargepoint_home',
    display: 'ChargePoint Home Flex',
    url: az('chargepoint home flex ev charger'),
    shortNote: 'Network you probably already use at work. Home Flex is the standard install in VT.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery' }],
  },
  {
    id: 'juice_box_40',
    display: 'JuiceBox 40 EV Charger',
    url: az('juicebox 40 ev charging station'),
    shortNote: 'Pinned to most VT EV install lists. Buy the hardwired version, not the plug-in.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery' }],
  },

  // === Smart home for cold climate ======================================
  {
    id: 'ecobee_remote_sensor',
    display: 'Ecobee remote room sensors',
    url: az('ecobee remote sensor 2 pack'),
    shortNote: 'Old VT houses heat unevenly. Sensors balance against the coldest room.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump' }, { topic: 'weatherization' }],
  },
  {
    id: 'leak_freeze_sensor',
    display: 'WiFi leak + freeze sensor',
    url: az('govee wifi water leak freeze sensor'),
    shortNote: 'Phone alert before a frozen pipe becomes a $20k claim. One per appliance, one per crawlspace.',
    category: 'safety',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER, { propertyChars: ['rural'] }],
    seasons: ['pre_winter', 'deep_winter'],
  },
  {
    id: 'smart_smoke_co_combo',
    display: 'Smart smoke + CO combo (X-Sense / First Alert)',
    url: az('x sense smart smoke carbon monoxide combo'),
    shortNote: 'Phone alerts to a property you only visit weekends. Pairs with hub or standalone WiFi.',
    category: 'safety',
    situations: [FIRST_YEAR_OWNER, { intents: ['owner'], propertyChars: ['rural'] }],
  },
  {
    id: 'smart_freeze_thermostat',
    display: 'Vacant-property freeze thermostat',
    url: az('low temperature alarm wifi smart'),
    shortNote: "Set a 45°F floor alarm on a second home. You'll know before pipes burst.",
    category: 'safety',
    situations: [{ propertyChars: ['lake'] }, FIRST_YEAR_OWNER],
    seasons: ['pre_winter', 'deep_winter'],
  },

  // === Septic system maintenance ========================================
  {
    id: 'septic_rid_x',
    display: 'RID-X monthly septic treatment',
    url: az('rid x septic monthly treatment'),
    shortNote: "Once-a-month enzyme dose. Cheap insurance against a $20k drain field replacement.",
    category: 'maintenance',
    situations: [{ topic: 'well_septic' }, { propertyChars: ['rural'] }, FIRST_YEAR_OWNER],
  },
  {
    id: 'septic_riser_cover',
    display: 'Septic tank riser + cover',
    url: az('septic tank riser kit 24 inch'),
    shortNote: 'Stop digging up the lid every 3 years. Riser to grade, lockable lid.',
    category: 'maintenance',
    situations: [{ topic: 'well_septic' }, { propertyChars: ['rural'] }],
  },
  {
    id: 'septic_safe_cleaners',
    display: 'Septic-safe cleaners (set)',
    url: az('seventh generation septic safe cleaner set'),
    shortNote: "Zero-phosphate, no quaternary ammonium — the stuff that doesn't kill the drain field bugs.",
    category: 'maintenance',
    situations: [{ topic: 'well_septic' }, { propertyChars: ['rural', 'lake'] }],
  },

  // === Well water owner essentials =======================================
  {
    id: 'well_water_test',
    display: 'Mail-in well water test',
    url: az('tap score well water test kit'),
    shortNote: "Tap Score covers 100+ contaminants — more than the basic VT Health test. Annual.",
    category: 'safety',
    situations: [{ topic: 'well_septic' }, { propertyChars: ['rural'] }, FIRST_YEAR_OWNER],
  },
  {
    id: 'sediment_filter',
    display: 'Whole-house sediment filter',
    url: az('whole house water filter sediment'),
    shortNote: "First line on a well system. 5-micron, change every 3 months in iron-rich VT water.",
    category: 'home_systems',
    situations: [{ topic: 'well_septic' }, { propertyChars: ['rural'] }],
  },
  {
    id: 'uv_filter_pre',
    display: 'UV pre-filter set',
    url: az('uv water filter prefilter sediment carbon'),
    shortNote: "If your well has any coliform history — UV after sediment + carbon. Not optional in NEK.",
    category: 'home_systems',
    situations: [{ topic: 'well_septic' }, { propertyChars: ['rural'] }],
  },

  // === Off-grid / rural Vermont =========================================
  {
    id: 'generator_portable',
    display: 'Portable inverter generator',
    url: az('honda eu2200i portable inverter generator'),
    shortNote: 'Honda EU2200i — quiet, sips fuel, runs the fridge + furnace for 8 hours on a tank.',
    category: 'safety',
    situations: [{ propertyChars: ['rural'] }, FIRST_YEAR_OWNER],
    seasons: ['pre_winter', 'deep_winter'],
  },
  {
    id: 'generator_interlock',
    display: 'Generator panel interlock kit',
    url: az('generator interlock kit 200 amp'),
    shortNote: 'Cheaper, code-compliant alternative to a transfer switch. Electrician installs it.',
    category: 'safety',
    situations: [{ propertyChars: ['rural'] }],
    seasons: ['pre_winter'],
  },
  {
    id: 'propane_detector',
    display: 'Propane gas detector',
    url: az('first alert combo propane gas alarm'),
    shortNote: 'Vermont propane homes — slow leak alarms before the explosion. Plug in low (propane sinks).',
    category: 'safety',
    situations: [{ propertyChars: ['rural'] }, ANY_OWNER],
  },
  {
    id: 'satellite_weather_radio',
    display: 'NOAA weather radio',
    url: az('midland weather radio noaa hand crank'),
    shortNote: 'Cell goes out in NEK storms — NOAA radio with hand crank still works.',
    category: 'safety',
    situations: [{ propertyChars: ['rural'] }],
  },
  {
    id: 'manual_hand_pump',
    display: 'Manual well hand pump',
    url: az('simple hand water well pump'),
    shortNote: "Backup access to your well when the power's out for 48 hours. NEK essential.",
    category: 'safety',
    situations: [{ propertyChars: ['rural'] }],
  },
  {
    id: 'tire_chains',
    display: 'Tire chains / cables',
    url: az('security chain tire cables suv'),
    shortNote: 'Class IV roads in March. Chains live in the trunk October to May.',
    category: 'seasonal',
    situations: [{ propertyChars: ['rural'] }],
    seasons: ['mud', 'deep_winter'],
  },

  // === Aging-in-place modifications =====================================
  {
    id: 'grab_bars',
    display: 'Bath grab bars (ADA)',
    url: az('moen home care grab bar set 24 inch'),
    shortNote: 'Bolt into studs, real load rating. Single biggest fall-prevention upgrade you can DIY.',
    category: 'aging',
    situations: [{ propertyChars: ['rural'] }, ANY_OWNER],
  },
  {
    id: 'lever_handles',
    display: 'Lever door handles (set)',
    url: az('schlage lever door handle set passage'),
    shortNote: 'Round knobs become impossible with arthritis. Levers swap straight in.',
    category: 'aging',
    situations: [ANY_OWNER],
  },
  {
    id: 'raised_toilet_seat',
    display: 'Raised toilet seat with handles',
    url: az('elevated toilet seat with handles'),
    shortNote: 'Reversible, no plumbing. 4-inch lift turns a hard sit-down into a normal one.',
    category: 'aging',
    situations: [ANY_OWNER],
  },
  {
    id: 'threshold_ramp',
    display: 'Aluminum threshold ramp',
    url: az('aluminum threshold ramp 2 inch'),
    shortNote: 'Single-step entry rooms — drop a 2-inch ramp, stop the trips.',
    category: 'aging',
    situations: [ANY_OWNER],
  },
  {
    id: 'walk_in_tub_kit',
    display: 'Walk-in tub conversion (info)',
    url: az('walk in tub conversion kit'),
    shortNote: 'For permanent aging-in-place — usually a contractor job. Survey the options first.',
    category: 'aging',
    situations: [ANY_OWNER],
  },
  {
    id: 'motion_lights',
    display: 'Motion-activated night lights',
    url: az('rechargeable motion sensor night light hallway'),
    shortNote: "Hallway and bath at night. Beats a fall trying to find the switch.",
    category: 'aging',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
  },

  // === Rental / landlord essentials ======================================
  {
    id: 'sealed_smoke_co_landlord',
    display: '10-year sealed smoke + CO combo',
    url: az('first alert 10 year sealed smoke carbon monoxide combo'),
    shortNote: 'Sealed lithium = no battery swaps for 10 years. Best LL choice for unit turnover.',
    category: 'rental',
    situations: [],
  },
  {
    id: 'lead_test_landlord',
    display: 'Lead test kit (LL screening)',
    url: az('3m leadcheck instant lead test swabs'),
    shortNote: 'Pre-1978 rental? Required disclosure. Test before each turnover.',
    category: 'rental',
    situations: [],
  },
  {
    id: 'turnover_clean_kit',
    display: 'Between-tenant deep clean kit',
    url: az('rubbermaid commercial cleaning kit'),
    shortNote: 'Commercial-grade kit — cuts turnover time from a weekend to half a day.',
    category: 'rental',
    situations: [],
  },
  {
    id: 'door_sweep_landlord',
    display: 'Heavy-duty door sweep',
    url: az('m-d heavy duty door sweep'),
    shortNote: 'Ross-tape sweeps fail in 6 months. Aluminum-back sweep lasts a tenancy.',
    category: 'rental',
    situations: [],
  },

  // === Storm prep (flood / river-corridor properties) ===================
  {
    id: 'sump_pump_battery',
    display: 'Battery backup sump pump',
    url: az('basement watchdog battery backup sump pump'),
    shortNote: 'Power goes out exactly when basements need pumping. Battery backup non-negotiable in flood zones.',
    category: 'safety',
    situations: [{ propertyChars: ['flood'] }, { topic: 'flood_zone' }],
  },
  {
    id: 'sandbags',
    display: 'Reusable sandbags (set)',
    url: az('reusable sandbags absorbent flood barrier'),
    shortNote: 'Self-expanding ones save the rush to the hardware store when river crests are forecast.',
    category: 'safety',
    situations: [{ propertyChars: ['flood'] }],
    seasons: ['mud', 'spring_blackfly'],
  },
  {
    id: 'water_alarm',
    display: 'Battery water alarm',
    url: az('basement water alarm battery'),
    shortNote: 'In every basement corner. Loud enough to wake you at 3am.',
    category: 'safety',
    situations: [{ propertyChars: ['flood'] }, FIRST_YEAR_OWNER],
  },
  {
    id: 'shop_vac',
    display: 'Wet/dry shop vac (16+ gal)',
    url: az('ridgid wet dry shop vac 16 gallon'),
    shortNote: 'Mud season + flood-zone basement = need a real vac. Ridgid is the standard.',
    category: 'tools',
    situations: [{ propertyChars: ['flood'] }, { propertyChars: ['rural'] }],
  },

  // === Lake property essentials =========================================
  {
    id: 'lake_water_test',
    display: 'Lake water test kit',
    url: az('lake water test kit phosphorus algae'),
    shortNote: 'Phosphate + bacteria swab. Useful before swimming, also for shoreland compliance.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening', 'lake_operations'],
  },
  {
    id: 'erosion_matting',
    display: 'Erosion-control matting',
    url: az('coir erosion control mat shoreland'),
    shortNote: "Coir mat protects shoreland from foot traffic. Counts toward Shoreland Protection compliance.",
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }, { topic: 'flood_zone' }],
  },
  {
    id: 'shoreland_native_plants',
    display: 'Vermont shoreland native plant kit',
    url: az('native shoreland plant kit vermont'),
    shortNote: 'Native plants stabilize the buffer and satisfy the 250-foot Shoreland Protection rule.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening'],
  },
  {
    id: 'phosphorus_free_dish',
    display: 'Zero-phosphorus dish soap',
    url: az('seventh generation free clear dish soap'),
    shortNote: 'Lake-side household — zero phosphorus household products keep your shoreland legal and the algae down.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
  },
  {
    id: 'boat_house_weatherize',
    display: 'Boat-house weatherization kit',
    url: az('boat house weatherization kit'),
    shortNote: 'Marine-grade caulk + weatherstrip for the boat house. Lake winter beats a regular kit.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_closing', 'fall_leaf'],
  },

  // === Lake opening (May 15 – Jun 30) ===================================
  {
    id: 'dock_hardware',
    display: 'Dock hardware repair kit',
    url: az('dock post bracket galvanized'),
    shortNote: 'Brackets, pins, bolts. Replace the rusted ones before the dock goes in.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening'],
  },
  {
    id: 'dock_wheels',
    display: 'Dock wheel set',
    url: az('roll in dock wheels 12 inch'),
    shortNote: '12-inch wheels make a 100-foot wheel-in dock a one-person job, not a three.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening'],
  },
  {
    id: 'dock_bumpers',
    display: 'Dock bumper set',
    url: az('dock bumper foam set'),
    shortNote: "Vermont lake water + boat hull = scratches. Foam bumpers, $20 a side.",
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening', 'lake_operations'],
  },
  {
    id: 'dock_solar_lights',
    display: 'Solar dock lights',
    url: az('solar dock lights post mount'),
    shortNote: 'Boat returns after dark — solar post lights stake into the dock cap, no wiring.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening', 'lake_operations'],
  },
  {
    id: 'boat_lift_parts',
    display: 'Boat lift cable + hardware',
    url: az('boat lift cable replacement set'),
    shortNote: 'Replace cables every 3-4 years on a Vermont lift. Stainless cable doesn\'t snap silently.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening'],
  },
  {
    id: 'marine_lubricant',
    display: 'Marine lubricant',
    url: az('marine grease lubricant lift winch'),
    shortNote: 'Boat lift winches and dock joints — grease them at opening, not when they squeal.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening'],
  },
  {
    id: 'boat_lift_cover',
    display: 'Vinyl boat lift cover',
    url: az('boat lift canopy cover replacement'),
    shortNote: '3-5 year replacement. Spring is the right time to swap before the sun starts cooking.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening'],
  },
  {
    id: 'beach_rake',
    display: 'Beach rake',
    url: az('floating beach rake lake weed'),
    shortNote: 'Lake weeds clog a swim area in two weeks. Floating rake clears it in an afternoon.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_opening', 'lake_operations'],
  },
  {
    id: 'paddle_board_pump',
    display: 'High-pressure paddle pump',
    url: az('electric paddle board pump 12v'),
    shortNote: '12V pump fills a SUP or kayak in 5 minutes — quiet and not exhausting.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'dry_bags',
    display: 'Dry bag set',
    url: az('roll top dry bag set 3 pack'),
    shortNote: 'Phone, keys, towels — all stay dry on a lake day. 5L / 10L / 20L set covers most.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },

  // === Lake operations (Jun 15 – Aug 31) ================================
  {
    id: 'lake_outdoor_cushions',
    display: 'Sunbrella outdoor cushions',
    url: az('sunbrella outdoor cushion set patio'),
    shortNote: "Lake-rated fabric — fades less, doesn't mildew. Worth the price difference.",
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'grill_cover',
    display: 'Heavy-duty grill cover',
    url: az('weber grill cover heavy duty'),
    shortNote: 'Lake winds eat thin covers. Weber covers fit 90% of grills out there.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }, ANY_OWNER],
    seasons: ['lake_operations'],
  },
  {
    id: 'propane_backup',
    display: 'Backup propane tank',
    url: az('20 lb propane tank refill'),
    shortNote: "Saturday cookout, tank empty — keep a backup full one rotated with the grill tank.",
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }, ANY_OWNER],
    seasons: ['lake_operations'],
  },
  {
    id: 'swim_ladder',
    display: 'Dock swim ladder',
    url: az('dock swim ladder stainless'),
    shortNote: 'Stainless 4-step. Easier than a rope ladder, safer for kids climbing in.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'kayak_rack',
    display: 'Kayak / paddle board rack',
    url: az('kayak storage rack outdoor wall mount'),
    shortNote: 'Wall-mount rack keeps boats off the ground in winter, off the lawn in summer.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'cooler_yeti',
    display: 'Yeti or RTIC cooler',
    url: az('yeti tundra 45 hard cooler'),
    shortNote: 'Real cooler — keeps ice 3+ days on the lake. RTIC is the value alternative.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'outdoor_speakers',
    display: 'Weatherproof outdoor speakers',
    url: az('weatherproof bluetooth outdoor speakers'),
    shortNote: 'Wall-mount Bluetooth speakers for the dock — weather-rated, not just water-resistant.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'citronella_kit',
    display: 'Citronella torch + fuel set',
    url: az('citronella torch outdoor garden 6 pack'),
    shortNote: 'Vermont mosquito hour is real. Torch perimeter buys 2-3 hours of dock time.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'mosquito_magnet',
    display: 'Mosquito propane trap',
    url: az('dynatrap mosquito trap outdoor'),
    shortNote: 'DynaTrap or Mosquito Magnet — propane-burning trap for the actual perimeter.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },
  {
    id: 'outdoor_fans',
    display: 'Outdoor patio fans',
    url: az('outdoor pedestal fan misting'),
    shortNote: 'Misting pedestal fans — Vermont August humidity, lake breeze not always cooperating.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_operations'],
  },

  // === Lake closing (Sep 1 – Oct 31) ====================================
  {
    id: 'dock_removal_hardware',
    display: 'Dock removal pin set',
    url: az('dock pin set rebar'),
    shortNote: 'Replacement pins / clips for fall pull. Lose them every year — buy spares.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_closing'],
  },
  {
    id: 'marine_antifreeze',
    display: 'Marine antifreeze (-50°F)',
    url: az('marine antifreeze 50 degree gallon'),
    shortNote: 'Boat house plumbing, lake-side outdoor showers — pink antifreeze before the freeze.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_closing', 'pre_winter'],
  },
  {
    id: 'deck_cover_lake',
    display: 'Dock furniture cover set',
    url: az('outdoor furniture cover waterproof set'),
    shortNote: 'Lake-side dirt + rain + leaves — cover everything you don\'t bring inside.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_closing'],
  },
  {
    id: 'kayak_storage_cover',
    display: 'Kayak storage cover',
    url: az('kayak storage cover outdoor uv'),
    shortNote: 'UV-rated cover — cracked plastic from a winter outside is a $400 lesson.',
    category: 'lake',
    situations: [{ propertyChars: ['lake'] }],
    seasons: ['lake_closing'],
  },
  {
    id: 'hose_drain_kit',
    display: 'Hose blowout / drain kit',
    url: az('hose drain valve compressed air winterize'),
    shortNote: 'Compressed-air fitting blows water out of irrigation and outdoor hoses before the freeze.',
    category: 'maintenance',
    situations: [{ propertyChars: ['lake'] }, ANY_OWNER, { topic: 'outdoor' }],
    seasons: ['lake_closing', 'pre_winter', 'fall_leaf'],
  },

  // === Mud season (Mar 1 – May 15) ======================================
  {
    id: 'boot_tray',
    display: 'Heavy-duty boot tray',
    url: az('rubber boot tray heavy duty'),
    shortNote: 'Big tray, raised lip. Mud sluices off boots without spilling on the floor.',
    category: 'seasonal',
    situations: [ANY_OWNER, FIRST_YEAR_OWNER],
    seasons: ['mud'],
  },
  {
    id: 'dog_towel_mud',
    display: 'Mud-rated absorbent dog towel',
    url: az('absorbent dog towel chenille'),
    shortNote: 'Chenille microfiber — actually absorbs water instead of smearing it. Vermont dogs need three.',
    category: 'seasonal',
    situations: [ANY_OWNER],
    seasons: ['mud'],
  },
  {
    id: 'car_floor_liner',
    display: 'WeatherTech floor liners',
    url: az('weathertech floor liner truck suv'),
    shortNote: "Vermont mud goes everywhere. Custom-fit liners save the resale value of your car.",
    category: 'seasonal',
    situations: [ANY_OWNER, { propertyChars: ['rural'] }],
    seasons: ['mud'],
  },
  {
    id: 'gravel_rake',
    display: 'Gravel / driveway rake',
    url: az('groundskeeper ii gravel rake'),
    shortNote: 'Mud season ruts. Pull the gravel back to the center every couple weeks.',
    category: 'seasonal',
    situations: [{ propertyChars: ['rural'] }, ANY_OWNER],
    seasons: ['mud'],
  },
  {
    id: 'outdoor_scraper',
    display: 'Heavy-duty boot scraper',
    url: az('cast iron boot scraper outdoor'),
    shortNote: 'Bolt to the porch step. Cast iron lasts decades.',
    category: 'seasonal',
    situations: [ANY_OWNER, FIRST_YEAR_OWNER],
    seasons: ['mud'],
  },
  {
    id: 'waterhog_runner',
    display: 'WaterHog entry runner',
    url: az('waterhog entry runner 3 foot'),
    shortNote: 'Long runner version of the standard mat. Catches mud on the second step.',
    category: 'seasonal',
    situations: [ANY_OWNER, FIRST_YEAR_OWNER],
    seasons: ['mud'],
  },

  // === Spring blackfly (May 15 – Jun 15) ================================
  {
    id: 'bug_net_hat',
    display: 'Bug net hat',
    url: az('bug net hat blackfly head net'),
    shortNote: 'NEK blackflies in late May. Net hat lets you actually finish yard work.',
    category: 'seasonal',
    situations: [ANY_OWNER, { propertyChars: ['rural', 'lake'] }],
    seasons: ['spring_blackfly'],
  },
  {
    id: 'picaridin_spray',
    display: 'Picaridin insect repellent',
    url: az('sawyer picaridin insect repellent 4 oz'),
    shortNote: 'Better than DEET on blackflies, doesn\'t melt synthetics. Sawyer is the standard.',
    category: 'seasonal',
    situations: [ANY_OWNER],
    seasons: ['spring_blackfly', 'lake_operations'],
  },
  {
    id: 'screen_repair_kit',
    display: 'Window screen repair kit',
    url: az('window screen repair kit fiberglass'),
    shortNote: 'Spring screen replacement before the bugs find the rip.',
    category: 'seasonal',
    situations: [ANY_OWNER],
    seasons: ['spring_blackfly'],
  },
  {
    id: 'gutter_cleaner',
    display: 'Telescoping gutter cleaner',
    url: az('gutter cleaning tool telescoping'),
    shortNote: 'Reach 2-story gutters from the ground. Spring = leaf melt + winter debris.',
    category: 'maintenance',
    situations: [ANY_OWNER, { topic: 'outdoor' }],
    seasons: ['spring_blackfly', 'fall_leaf'],
  },

  // === Fall leaf (Sep 15 – Nov 1) =======================================
  {
    id: 'gutter_guards',
    display: 'Gutter guards',
    url: az('amerimax leaf relief gutter guards'),
    shortNote: 'Mesh guards on gutters before fall. Stops the November ice-dam triggers.',
    category: 'maintenance',
    situations: [ANY_OWNER, { topic: 'outdoor' }],
    seasons: ['fall_leaf'],
  },
  {
    id: 'leaf_blower',
    display: 'Cordless leaf blower',
    url: az('ego cordless leaf blower 56v'),
    shortNote: 'EGO 56V — actually moves wet Vermont leaves, no extension cord across the lawn.',
    category: 'tools',
    situations: [ANY_OWNER, { propertyChars: ['rural'] }],
    seasons: ['fall_leaf'],
  },
  {
    id: 'chimney_brush_kit',
    display: 'Chimney brush + rod kit',
    url: az('chimney sweep brush flexible rod kit'),
    shortNote: 'DIY chimney sweep before the first hard fire. Kit pays for itself in one season.',
    category: 'maintenance',
    situations: [{ propertyChars: ['rural'] }, ANY_OWNER],
    seasons: ['fall_leaf'],
  },
  {
    id: 'mulching_mower_bag',
    display: 'Mulching mower kit',
    url: az('mulching mower blade kit'),
    shortNote: 'Mulch leaves into the lawn instead of bagging them. Vermont yard hack.',
    category: 'tools',
    situations: [ANY_OWNER],
    seasons: ['fall_leaf'],
  },
  {
    id: 'leaf_bags_paper',
    display: 'Compostable leaf bags (set)',
    url: az('30 gallon paper leaf bags compostable'),
    shortNote: 'Most VT towns require paper bags for curbside leaf pickup. Buy a stack.',
    category: 'seasonal',
    situations: [ANY_OWNER],
    seasons: ['fall_leaf'],
  },

  // === Pre-winter (Nov 1 – Dec 15) ======================================
  {
    id: 'pipe_heat_tape',
    display: 'Self-regulating pipe heat tape',
    url: az('pipe heat tape thermostat self regulating'),
    shortNote: 'Wrap the cold-spot pipes (rim joist, crawlspace, mobile home). Self-regulating only.',
    category: 'safety',
    situations: [ANY_OWNER, { propertyChars: ['mobile_home', 'rural'] }],
    seasons: ['pre_winter'],
  },
  {
    id: 'faucet_covers',
    display: 'Outdoor faucet covers',
    url: az('outdoor faucet covers insulated'),
    shortNote: 'Foam covers over hose bibs — stops the November surprise burst pipe.',
    category: 'safety',
    situations: [ANY_OWNER],
    seasons: ['pre_winter'],
  },
  {
    id: 'snow_blower_belt',
    display: 'Snow blower drive belt set',
    url: az('snow blower drive belt replacement'),
    shortNote: 'November tune-up before the first storm. Belt is the part that fails first.',
    category: 'maintenance',
    situations: [ANY_OWNER, { propertyChars: ['rural'] }],
    seasons: ['pre_winter'],
  },
  {
    id: 'storm_door_sweep',
    display: 'Storm door sweep',
    url: az('storm door sweep aluminum'),
    shortNote: 'Storm door sweeps tear in winter. Replace November before the cold gets through.',
    category: 'maintenance',
    situations: [ANY_OWNER, { topic: 'weatherization' }],
    seasons: ['pre_winter'],
  },

  // === Deep winter (Dec 15 – Mar 1) =====================================
  {
    id: 'ice_melt_petsafe',
    display: 'Pet-safe ice melt',
    url: az('safe paw pet safe ice melt'),
    shortNote: "Calcium magnesium acetate — safer for pets and concrete than rock salt.",
    category: 'seasonal',
    situations: [ANY_OWNER, FIRST_YEAR_OWNER],
    seasons: ['deep_winter'],
  },
  {
    id: 'yaktrax_pro',
    display: 'Yaktrax Pro traction',
    url: az('yaktrax pro winter traction cleats'),
    shortNote: 'Slip-on coil cleats. Vermont ice gets you eventually without them.',
    category: 'safety',
    situations: [ANY_OWNER, FIRST_YEAR_OWNER],
    seasons: ['deep_winter'],
  },
  {
    id: 'ice_dam_steamer',
    display: 'Ice dam steamer rental info',
    url: az('ice dam steamer pressure'),
    shortNote: 'When the ice dam already happened — steamer rental from local equipment shops.',
    category: 'safety',
    situations: [ANY_OWNER, { topic: 'outdoor' }],
    seasons: ['deep_winter'],
  },
  {
    id: 'propane_indicator',
    display: 'Propane tank gauge',
    url: az('propane tank gauge level indicator'),
    shortNote: 'Wirelessly read the tank from inside. No more 0°F walks to check the dial.',
    category: 'home_systems',
    situations: [ANY_OWNER, { propertyChars: ['rural'] }],
    seasons: ['deep_winter', 'pre_winter'],
  },
  {
    id: 'ice_scraper',
    display: 'Heavy-duty ice scraper',
    url: az('hopkins subzero brass ice scraper'),
    shortNote: 'Brass-edge scraper with extension. Easier on glass than a bargain plastic.',
    category: 'seasonal',
    situations: [ANY_OWNER, FIRST_YEAR_OWNER],
    seasons: ['deep_winter'],
  },

  // === Owner summary (first-year toolkit; topic=null) ===================
  // Items here that are not already in the catalog above. Many summary
  // picks reuse first-year-essentials and seasonal items via the helper.
  {
    id: 'multitool_leatherman',
    display: 'Leatherman multi-tool',
    url: az('leatherman wave plus multi tool'),
    shortNote: 'Wave Plus — homeowner classic. The 30-second fix lives in your back pocket.',
    category: 'tools',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
  },
  {
    id: 'ladder_8ft',
    display: '8-ft step ladder',
    url: az('werner 8 foot fiberglass step ladder'),
    shortNote: 'Werner fiberglass — every Vermont homeowner should own one. Reaches the ceiling fan.',
    category: 'tools',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
  },
  {
    id: 'shop_lights_set',
    display: 'LED shop lights (set)',
    url: az('led shop light 4 foot 5000k linkable'),
    shortNote: 'Linkable LED 4-footers — basement, garage, mudroom. Replace every flicker tube.',
    category: 'tools',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
  },

  // ===========================================================================
  // V4 ACCESSORY KIT ITEMS
  // Items referenced from ACCESSORY_KITS below. These complement the
  // situational catalog above (which is keyed on intent/topic/season tags
  // for inline contextual placement) — accessory items live primarily
  // inside named kits, but are tagged here for any catalog-wide pulls.
  // ===========================================================================

  // --- Outdoor: outdoor_furniture kit ---
  {
    id: 'patio_4pc_set',
    display: 'Devoko 4-piece outdoor sectional',
    url: az('devoko 4 piece outdoor sectional'),
    shortNote: 'Holds up through Vermont winters if you cover or store cushions.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'patio_cushions_sunbrella',
    display: 'Sunbrella replacement cushions',
    url: az('sunbrella outdoor patio cushions'),
    shortNote: 'Sunbrella holds up. Cheaper brands fade in two seasons.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'cantilever_umbrella',
    display: 'Cantilever patio umbrella',
    url: az('10ft cantilever patio umbrella with base'),
    shortNote: 'Cantilever clears the table. Center-pole umbrellas always end up in the way.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'patio_side_tables',
    display: 'Outdoor side tables (pair)',
    url: az('outdoor side table set 2'),
    shortNote: 'Cheap-trick layer that makes a deck feel finished.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },

  // --- Outdoor: outdoor_lighting kit ---
  {
    id: 'brightech_string_lights',
    display: 'Brightech string lights (48ft)',
    url: az('brightech ambience pro string lights 48ft'),
    shortNote: 'Brightech are the ones that survive Vermont. Shatterproof, restaurant-grade bulbs.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'solar_path_lights_8pk',
    display: 'Solar path lights (8-pack)',
    url: az('solar path lights stainless steel 8 pack'),
    shortNote: 'Stainless. Cheap solar lights last one season; these last several.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'solar_deck_post_caps',
    display: 'Solar deck post cap lights',
    url: az('solar deck post cap lights 4x4'),
    shortNote: 'Drop-in for 4x4 posts. No wiring, no GFCI run.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'motion_sconce',
    display: 'Outdoor motion sconce',
    url: az('outdoor motion sensor wall sconce dusk to dawn'),
    shortNote: 'Dusk-to-dawn + motion. Lit entry without leaving the porch light burning all night.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },

  // --- Outdoor: fire_pit_heat kit ---
  {
    id: 'solo_stove_bonfire',
    display: 'Solo Stove Bonfire 2.0',
    url: az('solo stove bonfire 2.0'),
    shortNote: 'Smokeless. Real difference between a 3-month and 6-month deck.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'fire_pit_screen',
    display: 'Fire pit spark screen',
    url: az('fire pit spark screen heat dome'),
    shortNote: 'Required by most VT towns within 25ft of a structure. Get one before the burn ban.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'patio_heater_propane',
    display: 'Propane patio heater',
    url: az('outdoor propane patio heater 48000 btu'),
    shortNote: 'Pyramid-style. Buys you October and early November on the deck.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'firewood_storage_rack',
    display: 'Firewood storage rack with cover',
    url: az('firewood storage rack outdoor with cover 8ft'),
    shortNote: 'Off the ground, under cover. Wood stays dry; no carpenter ants in the deck framing.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },

  // --- Outdoor: outdoor_textiles kit ---
  {
    id: 'outdoor_rug_8x10',
    display: 'Outdoor rug 8x10',
    url: az('outdoor rug 8x10 polypropylene reversible'),
    shortNote: 'Polypropylene reversible. Hose it off in the spring, flip it for the second season.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'sunbrella_throw_pillows',
    display: 'Sunbrella throw pillows',
    url: az('sunbrella outdoor throw pillows set'),
    shortNote: 'The only outdoor pillow fabric worth buying. Everything else molds.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'outdoor_chaise_cushions',
    display: 'Outdoor chaise cushions',
    url: az('outdoor chaise lounge cushions waterproof'),
    shortNote: 'Replacement-grade. Original chaise cushions are usually the first thing to die.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'all_weather_blanket',
    display: 'All-weather throw blanket',
    url: az('outdoor waterproof throw blanket fleece'),
    shortNote: 'Polar fleece + waterproof backing. Stays in the deck box and gets used.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },

  // --- Outdoor: outdoor_storage kit ---
  {
    id: 'keter_deck_box',
    display: 'Keter 150-gallon deck box',
    url: az('keter 150 gallon deck box outdoor'),
    shortNote: 'Holds cushions for the whole sectional. Vermont winter destroys what you leave out.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'patio_furniture_covers_set',
    display: 'Patio furniture covers (set)',
    url: az('patio furniture covers waterproof heavy duty set'),
    shortNote: 'Heavy-duty waterproof. Rip-stop seams; the cheap covers shred in a winter wind.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'outdoor_storage_shed_small',
    display: 'Resin outdoor storage shed (4x6)',
    url: az('rubbermaid resin outdoor storage shed 4x6'),
    shortNote: 'For mowers, shovels, hose. Resin doesn\'t rot like wood and doesn\'t need stain.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },

  // --- Outdoor: outdoor_cooking kit ---
  {
    id: 'weber_genesis_grill',
    display: 'Weber Genesis 3-burner gas grill',
    url: az('weber genesis 3 burner gas grill'),
    shortNote: 'Workhorse. Parts available at any hardware store for the next decade.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'ooni_pizza_oven',
    display: 'Ooni Karu 16 pizza oven',
    url: az('ooni karu 16 pizza oven'),
    shortNote: 'Wood + propane. The piece of outdoor cooking gear that gets the most use after year one.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'grill_cover_premium',
    display: 'Premium grill cover (heavy duty)',
    url: az('grill cover heavy duty waterproof 60 inch'),
    shortNote: 'A real grill cover doubles grill life in Vermont. Cheap covers tear in one winter.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },
  {
    id: 'outdoor_kitchen_cabinet',
    display: 'Stainless outdoor kitchen cabinet',
    url: az('stainless steel outdoor kitchen cabinet weatherproof'),
    shortNote: 'For the side-burner / pizza oven setup. Stainless or it\'s gone in three winters.',
    category: 'lake',
    situations: [{ topic: 'outdoor', intents: ['owner'] }],
  },

  // --- Kitchen: kitchen_cookware kit ---
  {
    id: 'allclad_d3_set',
    display: 'All-Clad D3 stainless cookware set',
    url: az('all-clad d3 stainless steel cookware set 10 piece'),
    shortNote: 'Tri-ply, lifetime warranty. The cookware that earns counter space.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'wusthof_classic_knives',
    display: 'Wüsthof Classic 7-piece knife block',
    url: az('wusthof classic 7 piece knife block set'),
    shortNote: 'German full-tang. Sharpen these once a year and they outlive the kitchen.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'lodge_dutch_oven',
    display: 'Lodge enameled Dutch oven (6qt)',
    url: az('lodge enameled cast iron dutch oven 6 quart'),
    shortNote: 'Cast iron Dutch oven at a quarter of the Le Creuset price.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'thermapen_thermometer',
    display: 'Thermapen ONE instant-read thermometer',
    url: az('thermapen one instant read thermometer'),
    shortNote: 'Two-second read. The piece of gear that quietly upgrades every meal.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },

  // --- Kitchen: kitchen_organizers kit ---
  {
    id: 'expandable_drawer_organizer',
    display: 'Expandable bamboo drawer organizer',
    url: az('expandable bamboo kitchen drawer organizer'),
    shortNote: 'Bamboo, expandable. Fits any drawer once you measure the inside dimension.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'pull_out_pantry_baskets',
    display: 'Pull-out pantry wire baskets (set)',
    url: az('pull out pantry baskets cabinet organizer'),
    shortNote: 'New cabinets are the moment to organize. Don\'t lose it.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'spice_drawer_insert',
    display: 'Spice drawer insert',
    url: az('drawer spice rack organizer 4 tier'),
    shortNote: '4-tier slope. Spices visible at a glance — the one you reach for the most.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'under_sink_organizer',
    display: 'Under-sink expandable organizer',
    url: az('under sink organizer expandable 2 tier'),
    shortNote: '2-tier expandable. Works around the disposal and the trap.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },

  // --- Kitchen: kitchen_small_appliances kit ---
  {
    id: 'kitchenaid_stand_mixer',
    display: 'KitchenAid Artisan stand mixer (5qt)',
    url: az('kitchenaid artisan stand mixer 5 quart'),
    shortNote: 'The one small appliance every cook actually uses. Buy refurbished if budget matters.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'breville_espresso',
    display: 'Breville Bambino Plus espresso',
    url: az('breville bambino plus espresso machine'),
    shortNote: 'Compact, real espresso. The Bambino is the smaller-counter version of the Barista Pro.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'instant_pot_pro',
    display: 'Instant Pot Pro (6qt)',
    url: az('instant pot pro 6 quart'),
    shortNote: 'Pressure + slow cooker + sauté. The Pro generation is quieter and better-built than older models.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'vitamix_blender',
    display: 'Vitamix 5200 blender',
    url: az('vitamix 5200 blender'),
    shortNote: 'Built like a contractor tool. Lifetime soup-and-smoothie machine.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },

  // --- Kitchen: kitchen_lighting kit ---
  {
    id: 'pendant_lights_3pk',
    display: 'Kitchen pendant lights (3-pack)',
    url: az('kitchen island pendant lights 3 pack matte black'),
    shortNote: 'Pendants and undercabinet are usually owner-supplied. Don\'t leave them out of the order.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'undercabinet_led_strip',
    display: 'Undercabinet LED strip kit',
    url: az('undercabinet led light strip kit hardwired'),
    shortNote: 'Hardwired strip — task lighting that turns the counter into a usable workspace.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'motion_pantry_light',
    display: 'Motion-activated pantry light',
    url: az('motion sensor pantry light battery'),
    shortNote: 'Stick-on. Turns the pantry into a "see what you have" room.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'edison_bulb_pack',
    display: 'LED Edison bulbs (6-pack)',
    url: az('led edison bulbs e26 dimmable 6 pack'),
    shortNote: 'Dimmable LEDs that look like real Edison bulbs without the heat or wattage.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },

  // --- Kitchen: kitchen_bar_seating kit ---
  {
    id: 'counter_stool_pair_modern',
    display: 'Counter stools (pair)',
    url: az('modern counter height stool pair'),
    shortNote: 'Counter (24") not bar height (29"). Most VT islands are counter height.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'swivel_bar_stools',
    display: 'Swivel bar stools (pair)',
    url: az('swivel bar stools with back leather pair'),
    shortNote: 'Swivel + back. The stool you actually want to sit on for an hour.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },
  {
    id: 'cushion_seat_pads_pair',
    display: 'Counter stool cushion pads (pair)',
    url: az('counter stool cushion seat pads tie on'),
    shortNote: 'Tie-on cushions. Doubles the time anyone wants to sit.',
    category: 'home_systems',
    situations: [{ topic: 'kitchen', intents: ['owner'] }],
  },

  // --- Bath: bath_textiles kit ---
  {
    id: 'turkish_towel_set',
    display: 'Turkish cotton towel set',
    url: az('turkish cotton bath towel set 6 piece'),
    shortNote: '600 gsm Turkish cotton. New bath, new towels — don\'t bring old ones into a fresh room.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'bath_mat_memory_foam',
    display: 'Memory foam bath mat',
    url: az('memory foam bath mat non slip'),
    shortNote: 'Non-slip backing. The cheap-trick bath upgrade you notice every morning.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'shower_curtain_hookless',
    display: 'Hookless hotel shower curtain',
    url: az('hookless hotel style shower curtain weighted'),
    shortNote: 'Weighted hem. No more curtain attacking you mid-shower.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'waffle_robe',
    display: 'Waffle weave robe',
    url: az('waffle weave robe cotton turkish'),
    shortNote: 'Quick-dry waffle. The hotel-feel one that doesn\'t mildew on the hook.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },

  // --- Bath: bath_organization kit ---
  {
    id: 'vanity_drawer_organizer',
    display: 'Vanity drawer organizer set',
    url: az('vanity drawer organizer bathroom set'),
    shortNote: 'Drawer dividers turn a $400 vanity into a $1,200 one in usability.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'medicine_cabinet_inserts',
    display: 'Medicine cabinet shelf inserts',
    url: az('medicine cabinet organizer expandable shelf'),
    shortNote: 'Expandable. Doubles usable shelf area in a standard 14-inch cabinet.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'under_sink_pull_out',
    display: 'Under-sink pull-out drawer',
    url: az('under sink pull out organizer drawer bathroom'),
    shortNote: 'Pull-out reaches the back. The corner under a vanity is dead space without one.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'bathroom_basket_set',
    display: 'Woven bathroom basket set',
    url: az('woven bathroom storage basket set'),
    shortNote: 'Toilet-paper visible storage. Cheap-trick layer that finishes the room.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },

  // --- Bath: bath_smart_fixtures kit ---
  {
    id: 'toto_washlet_bidet',
    display: 'Toto Washlet C2 bidet seat',
    url: az('toto washlet c2 bidet seat'),
    shortNote: 'The upgrade everyone hesitates on then never goes back from.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'rainfall_shower_head_smart',
    display: 'Rainfall shower head + handheld combo',
    url: az('rainfall shower head with handheld combo'),
    shortNote: 'Diverter combo. One shower, two modes, no plumber.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'led_mirror_dimmable',
    display: 'LED dimmable bathroom mirror',
    url: az('led bathroom mirror dimmable backlit anti fog'),
    shortNote: 'Backlit + anti-fog. Real upgrade over a flat mirror with side sconces.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },
  {
    id: 'towel_warmer_wall',
    display: 'Wall-mounted towel warmer',
    url: az('wall mounted electric towel warmer'),
    shortNote: 'Hardwired. Vermont winter mornings; warm towel after the shower. Negligible electric cost.',
    category: 'home_systems',
    situations: [{ topic: 'bath', intents: ['owner'] }],
  },

  // --- Heat pump: smart_thermostat kit ---
  {
    id: 'ecobee_premium',
    display: 'Ecobee Smart Thermostat Premium',
    url: az('ecobee smart thermostat premium'),
    shortNote: 'Heat pump-aware. Pays for itself the first Vermont winter on time-of-use rates.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }, { topic: 'weatherization', intents: ['owner'] }],
  },
  {
    id: 'ecobee_smartsensor_2pk',
    display: 'Ecobee SmartSensor (2-pack)',
    url: az('ecobee smartsensor 2 pack'),
    shortNote: 'Sensors in the bedroom + LR even out heat-pump comfort across an old VT house.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }],
  },
  {
    id: 'merv11_filters_12pk',
    display: 'MERV 11 filters (12-pack)',
    url: az('merv 11 filter 16x25x1 12 pack'),
    shortNote: 'A year\'s supply. Heat pumps die early on a clogged filter — change every month.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }],
  },
  {
    id: 'awair_iaq_monitor',
    display: 'Awair Element air-quality monitor',
    url: az('awair element indoor air quality monitor'),
    shortNote: 'Tracks CO2, VOCs, humidity. Tells you when a tight house needs the bath fan run longer.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }, { topic: 'weatherization', intents: ['owner'] }],
  },

  // --- Heat pump: hvac_supplements kit ---
  {
    id: 'frigidaire_dehumidifier',
    display: 'Frigidaire 50-pint dehumidifier',
    url: az('frigidaire 50 pint dehumidifier with pump'),
    shortNote: 'Built-in pump. Heat pumps don\'t dehumidify like central AC — basements need help in shoulder seasons.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }],
  },
  {
    id: 'vornado_space_heater',
    display: 'Vornado vortex space heater',
    url: az('vornado vh200 space heater'),
    shortNote: 'For the polar-vortex week when the heat pump alone is overmatched. Whole-room circulation, not radiant.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }],
  },
  {
    id: 'minisplit_outdoor_cover',
    display: 'Mini-split outdoor unit cover',
    url: az('mini split outdoor unit cover snow rain breathable'),
    shortNote: 'Breathable cover for the off-season. Solid wraps trap condensation — kills compressors.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }],
  },
  {
    id: 'duct_booster_fan',
    display: 'Inline duct booster fan',
    url: az('inline duct booster fan 6 inch'),
    shortNote: 'For ducted heat pumps with a long run to a back bedroom. $40 fix vs a $4k re-duct.',
    category: 'home_systems',
    situations: [{ topic: 'heat_pump', intents: ['owner'] }],
  },

  // --- Solar: solar_smart_home kit ---
  {
    id: 'sense_energy_monitor',
    display: 'Sense home energy monitor',
    url: az('sense home energy monitor solar'),
    shortNote: 'Solar version watches both production and consumption. Tells you which loads to shift.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery', intents: ['owner'] }],
  },
  {
    id: 'wallbox_ev_charger',
    display: 'Wallbox Pulsar Plus EV charger',
    url: az('wallbox pulsar plus ev charger 40a'),
    shortNote: 'Schedule charging during midday solar production. EVT $500 utility incentive in many service areas.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery', intents: ['owner'] }],
  },
  {
    id: 'kasa_smart_plug_4pk',
    display: 'Kasa smart plug (4-pack)',
    url: az('kasa smart plug 4 pack'),
    shortNote: 'Schedule loads — dehumidifier, heat tape, hot tub — to run when solar is generating.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery', intents: ['owner'] }],
  },
  {
    id: 'tp_link_smart_dimmer',
    display: 'TP-Link smart dimmer (3-pack)',
    url: az('tp-link kasa smart dimmer 3 pack'),
    shortNote: 'Dimmer-grade smart switches for the rooms you actually use most.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery', intents: ['owner'] }],
  },

  // --- Solar: battery_backup_portable kit ---
  {
    id: 'ecoflow_delta_max',
    display: 'EcoFlow Delta Max (2000)',
    url: az('ecoflow delta max 2000 portable power station'),
    shortNote: '2kWh. Runs the fridge for ~24 hours. Recharges from solar panels or wall.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery', intents: ['owner'] }],
  },
  {
    id: 'goal_zero_yeti_1500',
    display: 'Goal Zero Yeti 1500X',
    url: az('goal zero yeti 1500x portable power station'),
    shortNote: 'Solar-tied portable backup. Fridge + furnace ignition + a few lights in an outage.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery', intents: ['owner'] }],
  },
  {
    id: 'jackery_explorer_1000',
    display: 'Jackery Explorer 1000 v2',
    url: az('jackery explorer 1000 v2'),
    shortNote: 'Cheaper rung. Plenty for a weekend cabin or a one-night outage at home.',
    category: 'home_systems',
    situations: [{ topic: 'solar_battery', intents: ['owner'] }],
  },

  // --- Weatherization: diy_weatherization_tools kit ---
  {
    id: 'ge_silicone_caulk',
    display: 'GE 100% silicone caulk (case)',
    url: az('ge advanced silicone 2 caulk window door 12 pack'),
    shortNote: 'Window + door perimeter. EVT will reimburse $100 of materials with receipts.',
    category: 'tools',
    situations: [{ topic: 'weatherization', intents: ['owner'] }],
  },
  {
    id: 'great_stuff_foam_pack',
    display: 'Great Stuff window+door foam (case)',
    url: az('great stuff window door foam 12 pack'),
    shortNote: 'Low-expansion. Use the W+D version on rough openings; the regular formula bows frames.',
    category: 'tools',
    situations: [{ topic: 'weatherization', intents: ['owner'] }],
  },
  {
    id: 'weatherstrip_door',
    display: 'Door weatherstrip kit',
    url: az('door weatherstrip kit silicone bulb'),
    shortNote: 'Silicone bulb seal. One door, 30 minutes. Most-overlooked weatherization line item.',
    category: 'tools',
    situations: [{ topic: 'weatherization', intents: ['owner'] }],
  },
  {
    id: 'pipe_insulation_set',
    display: 'Pipe insulation foam (set)',
    url: az('foam pipe insulation 1/2 inch 3/4 inch set'),
    shortNote: 'Hot side first. EVT reimburses pipe insulation under the DIY Energy Saver kit.',
    category: 'tools',
    situations: [{ topic: 'weatherization', intents: ['owner'] }],
  },
  {
    id: 'outlet_gaskets_pk',
    display: 'Outlet + switch gaskets (pack)',
    url: az('outlet gasket foam exterior wall pack'),
    shortNote: 'Stops the cold pour at exterior outlets. Half-hour install across the whole house.',
    category: 'tools',
    situations: [{ topic: 'weatherization', intents: ['owner'] }],
  },

  // --- Addition/ADU: adu_basic_furnishing kit ---
  {
    id: 'queen_bed_frame',
    display: 'Queen platform bed frame',
    url: az('queen platform bed frame solid wood'),
    shortNote: 'Solid wood platform. Good for both rental-ready and family-ready ADU setups.',
    category: 'home_systems',
    situations: [{ topic: 'addition_adu', intents: ['owner'] }],
  },
  {
    id: 'mattress_queen_medium',
    display: 'Queen mattress, medium-firm',
    url: az('queen mattress medium firm hybrid'),
    shortNote: 'Hybrid medium-firm — works for any age tenant or family member.',
    category: 'home_systems',
    situations: [{ topic: 'addition_adu', intents: ['owner'] }],
  },
  {
    id: 'compact_dining_set',
    display: 'Compact 4-seat dining set',
    url: az('compact dining table set 4 chairs small space'),
    shortNote: '36-inch round, 4 chairs. Sized for an ADU\'s open living/dining footprint.',
    category: 'home_systems',
    situations: [{ topic: 'addition_adu', intents: ['owner'] }],
  },
  {
    id: 'living_room_basics_set',
    display: 'Living-room basics: sofa + coffee table',
    url: az('apartment size sofa coffee table set'),
    shortNote: 'Apartment-scale. ADUs are usually under 900 sqft; full-size sectional doesn\'t fit.',
    category: 'home_systems',
    situations: [{ topic: 'addition_adu', intents: ['owner'] }],
  },

  // --- Addition/ADU: smart_locks_security kit ---
  {
    id: 'schlage_encode_smart_lock',
    display: 'Schlage Encode Wi-Fi deadbolt',
    url: az('schlage encode wifi deadbolt'),
    shortNote: 'Code-based access. Especially for rental ADUs — beats handing out keys.',
    category: 'safety',
    situations: [{ topic: 'addition_adu', intents: ['owner'] }],
  },
  {
    id: 'ring_doorbell_pro',
    display: 'Ring Video Doorbell Pro 2',
    url: az('ring video doorbell pro 2'),
    shortNote: 'Hardwired Pro. ADU entry monitoring without a separate trip charge to install.',
    category: 'safety',
    situations: [{ topic: 'addition_adu', intents: ['owner'] }],
  },
  {
    id: 'wyze_cam_v3_pack',
    display: 'Wyze Cam v3 (3-pack)',
    url: az('wyze cam v3 3 pack outdoor'),
    shortNote: 'Indoor/outdoor rated. Cheap-trick monitoring for an ADU you rent on a long-term basis.',
    category: 'safety',
    situations: [{ topic: 'addition_adu', intents: ['owner'] }],
  },

  // --- General: first_year_essentials kit (additional items) ---
  {
    id: 'co_detector_10yr',
    display: 'CO detector (10-year sealed, 2-pack)',
    url: az('first alert 10 year sealed carbon monoxide detector 2 pack'),
    shortNote: 'VT requires CO detector outside every sleeping area. Sealed unit lasts a decade — set it and forget it.',
    category: 'safety',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
  },
  {
    id: 'mud_mat_waterhog',
    display: 'WaterHog mud mat (XL)',
    url: az('waterhog door mat outdoor xl'),
    shortNote: 'Vermont mud is its own weather event. WaterHog at every entry, period.',
    category: 'seasonal',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
    seasons: ['mud'],
  },
  {
    id: 'snow_shovel_slush',
    display: 'Slush-rated snow shovel',
    url: az('snow shovel slush deep snow ergonomic'),
    shortNote: 'Steel-edged scoop, ergonomic handle. The shovel that survives a Vermont February.',
    category: 'seasonal',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
    seasons: ['deep_winter', 'pre_winter'],
  },
  {
    id: 'outlet_tester_gfci',
    display: 'GFCI outlet tester',
    url: az('gfci outlet tester three prong'),
    shortNote: 'Three-prong tester catches reversed wiring and missing GFCIs. Five minutes per circuit.',
    category: 'tools',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
  },
  {
    id: 'fire_extinguisher_kitchen',
    display: 'Kitchen-rated fire extinguisher',
    url: az('kitchen fire extinguisher abc rated'),
    shortNote: 'ABC rated. One under the sink, one in the basement. The cheap-trick safety upgrade everyone forgets.',
    category: 'safety',
    situations: [FIRST_YEAR_OWNER, ANY_OWNER],
  },
]

// ===========================================================================
// V4 ACCESSORY KITS
//
// Each kit groups 3-7 items into a named, themed bundle that surfaces on
// the property page when the visitor is on a matching topic (or, for the
// first-year-essentials kit, on a no-topic / buying state). The
// AccessoryRecommender picks at most 2 kits per page (one direct topic
// match, one adjacent via the affinity matrix).
//
// Tunables here:
//   - estimatedTicketSize: total $ if a visitor buys the whole kit
//   - expectedClickThruRate: share of kit-views that click an item
// Both are inputs to revenueScore in CONFIG.revenueAssumptions. Tune
// against GA4 data once revenue accrues.
// ===========================================================================

export type AccessoryKit = {
  id: string
  title: string
  description: string         // Real Talk VT 1-line
  topic: AffTopicId           // primary project topic
  estimatedTicketSize: number
  expectedClickThruRate: number
  itemIds: string[]
}

export const ACCESSORY_KITS: AccessoryKit[] = [
  // === OUTDOOR (highest revenue category — 6 kits) =====================
  {
    id: 'outdoor_furniture',
    title: 'What goes on your new deck',
    description: 'Sunbrella holds up. Cheaper brands fade in two seasons.',
    topic: 'outdoor',
    estimatedTicketSize: 950,
    expectedClickThruRate: 0.05,
    itemIds: ['patio_4pc_set', 'patio_cushions_sunbrella', 'cantilever_umbrella', 'patio_side_tables'],
  },
  {
    id: 'outdoor_lighting',
    title: 'Lighting that makes a deck usable at night',
    description: 'String lights are the cheap win. Path lights are the long game.',
    topic: 'outdoor',
    estimatedTicketSize: 180,
    expectedClickThruRate: 0.06,
    itemIds: ['brightech_string_lights', 'solar_path_lights_8pk', 'solar_deck_post_caps', 'motion_sconce'],
  },
  {
    id: 'fire_pit_heat',
    title: 'Extending the deck season',
    description: 'A real fire pit is the difference between a 3-month and a 6-month deck.',
    topic: 'outdoor',
    estimatedTicketSize: 400,
    expectedClickThruRate: 0.04,
    itemIds: ['solo_stove_bonfire', 'fire_pit_screen', 'patio_heater_propane', 'firewood_storage_rack'],
  },
  {
    id: 'outdoor_textiles',
    title: 'Soft goods that survive Vermont',
    description: 'Cushions and rugs need to handle UV and rain. Most do not.',
    topic: 'outdoor',
    estimatedTicketSize: 220,
    expectedClickThruRate: 0.04,
    itemIds: ['outdoor_rug_8x10', 'sunbrella_throw_pillows', 'outdoor_chaise_cushions', 'all_weather_blanket'],
  },
  {
    id: 'outdoor_storage',
    title: 'Where to put all this when fall hits',
    description: 'Vermont winter destroys outdoor furniture left out. Storage matters.',
    topic: 'outdoor',
    estimatedTicketSize: 280,
    expectedClickThruRate: 0.03,
    itemIds: ['keter_deck_box', 'patio_furniture_covers_set', 'outdoor_storage_shed_small'],
  },
  {
    id: 'outdoor_cooking',
    title: 'Outdoor cooking setup',
    description: 'A grill is fine. Grill plus side burner plus pizza oven is a deck people actually use.',
    topic: 'outdoor',
    estimatedTicketSize: 600,
    expectedClickThruRate: 0.03,
    itemIds: ['weber_genesis_grill', 'ooni_pizza_oven', 'grill_cover_premium', 'outdoor_kitchen_cabinet'],
  },

  // === KITCHEN (5 kits) ================================================
  {
    id: 'kitchen_cookware',
    title: 'Cookware that earns counter space',
    description: 'Your new kitchen deserves better than the wedding-gift set.',
    topic: 'kitchen',
    estimatedTicketSize: 350,
    expectedClickThruRate: 0.05,
    itemIds: ['allclad_d3_set', 'wusthof_classic_knives', 'lodge_dutch_oven', 'thermapen_thermometer'],
  },
  {
    id: 'kitchen_organizers',
    title: 'Drawer + cabinet organization',
    description: 'New cabinets are the moment to actually organize. Do not lose it.',
    topic: 'kitchen',
    estimatedTicketSize: 100,
    expectedClickThruRate: 0.06,
    itemIds: ['expandable_drawer_organizer', 'pull_out_pantry_baskets', 'spice_drawer_insert', 'under_sink_organizer'],
  },
  {
    id: 'kitchen_small_appliances',
    title: 'Small appliances homeowners love',
    description: 'The ones that actually get used — not the ones that live in the garage.',
    topic: 'kitchen',
    estimatedTicketSize: 350,
    expectedClickThruRate: 0.04,
    itemIds: ['kitchenaid_stand_mixer', 'breville_espresso', 'instant_pot_pro', 'vitamix_blender'],
  },
  {
    id: 'kitchen_lighting',
    title: 'Lighting beyond the GC quote',
    description: 'Pendants and undercabinet are usually owner-supplied. Do not leave them out.',
    topic: 'kitchen',
    estimatedTicketSize: 180,
    expectedClickThruRate: 0.04,
    itemIds: ['pendant_lights_3pk', 'undercabinet_led_strip', 'motion_pantry_light', 'edison_bulb_pack'],
  },
  {
    id: 'kitchen_bar_seating',
    title: 'Counter stools',
    description: 'If you have a counter or island, this is the seating decision people regret.',
    topic: 'kitchen',
    estimatedTicketSize: 400,
    expectedClickThruRate: 0.03,
    itemIds: ['counter_stool_pair_modern', 'swivel_bar_stools', 'cushion_seat_pads_pair'],
  },

  // === BATH (3 kits) ===================================================
  {
    id: 'bath_textiles',
    title: 'Towels and bath textiles',
    description: 'New bath, new towels. Do not bring old ones into a fresh room.',
    topic: 'bath',
    estimatedTicketSize: 180,
    expectedClickThruRate: 0.05,
    itemIds: ['turkish_towel_set', 'bath_mat_memory_foam', 'shower_curtain_hookless', 'waffle_robe'],
  },
  {
    id: 'bath_organization',
    title: 'Vanity organization',
    description: 'Drawer dividers turn a $400 vanity into a $1,200 one in usability.',
    topic: 'bath',
    estimatedTicketSize: 100,
    expectedClickThruRate: 0.06,
    itemIds: ['vanity_drawer_organizer', 'medicine_cabinet_inserts', 'under_sink_pull_out', 'bathroom_basket_set'],
  },
  {
    id: 'bath_smart_fixtures',
    title: 'Smart bath upgrades',
    description: 'Bidet attachments are the upgrade everyone hesitates on then never goes back from.',
    topic: 'bath',
    estimatedTicketSize: 250,
    expectedClickThruRate: 0.04,
    itemIds: ['toto_washlet_bidet', 'rainfall_shower_head_smart', 'led_mirror_dimmable', 'towel_warmer_wall'],
  },

  // === HEAT PUMP (2 kits) ==============================================
  {
    id: 'smart_thermostat',
    title: 'Get more from your new heat pump',
    description: 'A smart thermostat with sensors is the difference between a heat pump that works fine and one that works great.',
    topic: 'heat_pump',
    estimatedTicketSize: 280,
    expectedClickThruRate: 0.07,
    itemIds: ['ecobee_premium', 'ecobee_smartsensor_2pk', 'merv11_filters_12pk', 'awair_iaq_monitor'],
  },
  {
    id: 'hvac_supplements',
    title: 'Cold-climate heat pump supplements',
    description: 'These help when the heat pump struggles in deep winter or shoulder-season humidity.',
    topic: 'heat_pump',
    estimatedTicketSize: 350,
    expectedClickThruRate: 0.04,
    itemIds: ['frigidaire_dehumidifier', 'vornado_space_heater', 'minisplit_outdoor_cover', 'duct_booster_fan'],
  },

  // === SOLAR / EV (2 kits) =============================================
  {
    id: 'solar_smart_home',
    title: 'Make the most of solar',
    description: 'These pay back fast when you are generating your own power.',
    topic: 'solar_battery',
    estimatedTicketSize: 700,
    expectedClickThruRate: 0.05,
    itemIds: ['sense_energy_monitor', 'wallbox_ev_charger', 'kasa_smart_plug_4pk', 'tp_link_smart_dimmer'],
  },
  {
    id: 'battery_backup_portable',
    title: 'Portable backup power',
    description: 'Solar + grid-tie shuts down during outages. A portable battery keeps the fridge running.',
    topic: 'solar_battery',
    estimatedTicketSize: 1200,
    expectedClickThruRate: 0.03,
    itemIds: ['ecoflow_delta_max', 'goal_zero_yeti_1500', 'jackery_explorer_1000'],
  },

  // === WEATHERIZATION DIY (1 kit) ======================================
  {
    id: 'diy_weatherization_tools',
    title: 'DIY weatherization kit',
    description: 'Submit receipts to EVT for $100 cash back on materials.',
    topic: 'weatherization',
    estimatedTicketSize: 150,
    expectedClickThruRate: 0.06,
    itemIds: ['ge_silicone_caulk', 'great_stuff_foam_pack', 'weatherstrip_door', 'pipe_insulation_set', 'outlet_gaskets_pk', 'window_film_3m'],
  },

  // === ADDITION / ADU (2 kits) =========================================
  {
    id: 'adu_basic_furnishing',
    title: 'Furnishing a new ADU',
    description: 'Rental-ready or family-ready, these are the staples that work for both.',
    topic: 'addition_adu',
    estimatedTicketSize: 1500,
    expectedClickThruRate: 0.04,
    itemIds: ['queen_bed_frame', 'mattress_queen_medium', 'compact_dining_set', 'living_room_basics_set'],
  },
  {
    id: 'smart_locks_security',
    title: 'Smart locks + security for the new space',
    description: 'Especially for ADUs you might rent. Code-based access beats handing out keys.',
    topic: 'addition_adu',
    estimatedTicketSize: 350,
    expectedClickThruRate: 0.04,
    itemIds: ['schlage_encode_smart_lock', 'ring_doorbell_pro', 'wyze_cam_v3_pack'],
  },

  // === GENERAL (1 kit — first-year + buyer) ============================
  {
    id: 'first_year_essentials',
    title: 'First-year Vermont homeowner kit',
    description: 'The stuff every Vermont homeowner ends up buying. Get ahead of it.',
    topic: 'general_orientation',
    estimatedTicketSize: 280,
    expectedClickThruRate: 0.05,
    itemIds: ['co_detector_10yr', 'smart_thermostat_basic', 'mud_mat_waterhog', 'snow_shovel_slush', 'outlet_tester_gfci', 'fire_extinguisher_kitchen'],
  },
]

// Map kit id → fully-resolved items for rendering. Resolves once at
// module load; missing item ids surface as a warning so authoring errors
// don't get swallowed.
export function resolveKitItems(kit: AccessoryKit): AffiliateItem[] {
  const items: AffiliateItem[] = []
  for (const id of kit.itemIds) {
    const item = AFFILIATE_CATALOG.find(i => i.id === id)
    if (item) items.push(item)
    else if (typeof console !== 'undefined') {
      console.warn(`AccessoryKit "${kit.id}" references missing item id: ${id}`)
    }
  }
  return items
}
