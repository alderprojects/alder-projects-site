// Intent-driven catalog for the v7.1 sales-page rebuild.
//
// /smart-cart and /worth-it both let the visitor pick an "intent" tile;
// each tile knows the topic + scope + scenario the engine should hydrate,
// what the redacted preview should claim about the resulting cart/plan,
// and whether the curation is fully shipped, in beta, or still being
// authored.
//
// Substitutions vs the original spec
// ----------------------------------
// Several scope variant ids referenced in the spec do not exist in the
// v7 catalog (window_drafts_seal, weatherization_full_audit,
// fall_pre_winter_prep, outdoor_mudroom_kit). They are mapped to the
// nearest authored variant; deltas are documented in the PR description.
// The teaser numbers below are hand-authored estimates that reflect what
// buildSmartCart / buildWorthItPlan return at v7.1 launch. The live
// /api/intent/teaser endpoint recomputes from the synthesis function so
// the static numbers here serve only as a fast first paint.

import type { TopicId } from './property-modules'
import type { BriefScenarioId, Season } from './recommender-config.types'

export type SmartCartCategoryId =
  | 'window_weatherization' // v7.2.14 pilot
  | 'basement_moisture_prep' // v7.2.14 pilot
  | 'mudroom_entry'
  | 'deck_outdoor'
  | 'kitchen_refresh'
  | 'winterizing'
  | 'opening_the_house'
  | 'small_repair'

export type WorthItDecisionId =
  | 'refresh_vs_remodel'
  | 'repair_vs_replace'
  | 'diy_vs_hire'
  | 'what_to_do_first'
  | 'already_got_a_quote'
  | 'mud_or_winter_prep'

export type CurationStatus = 'curated' | 'beta' | 'coming_soon'

export interface IntentTeaser {
  buyCount: number
  skipCount: number
  spendLow: number
  spendHigh: number
  savingsLow: number
  savingsHigh: number
  payoffSentence: string
}

export interface SmartCartCategory {
  id: SmartCartCategoryId
  label: string
  iconSvg: string                         // inline SVG path d=
  problem: string                         // one sentence
  topicId: TopicId
  defaultScopeVariantId: string
  defaultScenarioId: BriefScenarioId
  seasonality?: 'winter' | 'mud' | 'summer' | 'fall' | 'all'
  teaser: IntentTeaser
  rightForYouIf: string[]
  notRightIfPointsToWorthIt: string[]
  curationStatus: CurationStatus
}

export interface WorthItDecision {
  id: WorthItDecisionId
  label: string
  iconSvg: string
  problem: string
  primaryTopicId: TopicId
  defaultScopeVariantId: string
  defaultScenarioId: BriefScenarioId
  seasonality?: 'winter' | 'mud' | 'summer' | 'fall' | 'all'
  teaser: IntentTeaser
  rightForYouIf: string[]
  notRightIfPointsToSmartCart: string[]
  curationStatus: CurationStatus
  exampleDecision: {
    title: string
    rankedSteps: string[]
  }
}

// ---------- SVG path strings ----------------------------------------
// Plain d= attribute strings, used inside an inline <svg viewBox="0 0 24 24">
// so the icons match the existing CheckIcon / DotIcon / LockIcon pattern.

// v7.2.14 fix-up — pilot scope icons.
const ICON_WINDOW =
  'M4 4h16v16H4V4zm2 2v6h6V6H6zm8 0v6h4V6h-4zM6 14v4h6v-4H6zm8 0v4h4v-4h-4z'
const ICON_DROPLET =
  'M12 2.5C12 2.5 6 9.5 6 14a6 6 0 1012 0c0-4.5-6-11.5-6-11.5zM10 16a3 3 0 003 3v-1.5a1.5 1.5 0 01-1.5-1.5H10z'

const ICON_KITCHEN =
  'M4 9h16v2H4V9zm0 4h16v8H4v-8zm2-7h12v2H6V6z'
const ICON_DECK =
  'M3 8h18v2H3V8zm0 4h18v2H3v-2zm0 4h18v2H3v-2zM5 5l14 0L17 7H7L5 5z'
const ICON_WINTER =
  'M11 2h2v6.6l4.7-4.7 1.4 1.4L13.4 11H20v2h-6.6l5.7 5.7-1.4 1.4L13 15.4V22h-2v-6.6l-4.7 4.7-1.4-1.4L10.6 13H4v-2h6.6L4.9 5.3l1.4-1.4L11 8.6V2z'
const ICON_MUD =
  'M5 16c2-2 4-2 7-2s5 0 7 2v3H5v-3zM7 12a5 5 0 0110 0v1H7v-1z'
const ICON_SUNSHINE =
  'M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7l1.4-1.4M5 19l1.4-1.4M5 5l1.4 1.4M17.7 17.7l1.4 1.4M12 7a5 5 0 100 10 5 5 0 000-10z'
const ICON_TOOLBOX =
  'M3 9h18v11H3V9zm5-3h8v3H8V6zm-3 5h14v8H5v-8zm6 2v4m4-4v4'
const ICON_QUESTION =
  'M12 2a10 10 0 100 20 10 10 0 000-20zm0 16a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm1-5h-2v-1c0-1.5 1-2 2-3a1.5 1.5 0 10-3-1.5h-2A3.5 3.5 0 1115 9c0 1.5-1.3 2.5-2 3v1z'
const ICON_BALANCE =
  'M12 3v18M5 21h14M5 9l-2 6h6l-2-6m12 0l-2 6h6l-2-6M3 6h18'
const ICON_HAMMER =
  'M14.7 3.3l6 6-3 3-6-6 3-3zM10 8L3 15v6h6l7-7-6-6z'
const ICON_RANKED =
  'M3 4h13v2H3V4zm0 5h13v2H3V9zm0 5h9v2H3v-2zm15-9l3 3-3 3V5z'
const ICON_PHONE =
  'M3 5a2 2 0 012-2h2.5l1.5 4-2 1.5a11 11 0 005 5L17 11l4 1.5V15a2 2 0 01-2 2 16 16 0 01-16-16V5z'
const ICON_LEAF =
  'M5 19c2-12 8-14 16-14-1 11-7 14-15 14l-1-1 1-2c2-1 6-3 8-7-3 3-7 5-9 6 0 1 0 2 1 3-1 1-1 1-1 1z'

// ---------- Smart Cart categories -----------------------------------

export const SMART_CART_CATEGORIES: SmartCartCategory[] = [
  // ===== v7.2.14 fix-up — two pilots lead the picker =====
  {
    id: 'window_weatherization',
    label: 'Window weatherization',
    iconSvg: ICON_WINDOW,
    problem:
      'Frames are intact but the house is drafty. What do I buy for one winter before deciding on $800-$1,500/window replacement?',
    topicId: 'weatherization',
    defaultScopeVariantId: 'window_weatherization',
    defaultScenarioId: 'just_starting',
    seasonality: 'winter',
    teaser: {
      buyCount: 6,
      skipCount: 4,
      spendLow: 80,
      spendHigh: 220,
      savingsLow: 40,
      savingsHigh: 180,
      payoffSentence:
        'Avoids the $400/window acrylic insert kit, the designer thermal curtain, and the premium weatherstripping tape that does the same job as the $4 V-strip.',
    },
    rightForYouIf: [
      'Pre-1990 Vermont house with intact frames and air-leak drafts',
      'You want a one-winter pass before committing to replacement',
      'You want the diagnostic order, not just a product list',
    ],
    notRightIfPointsToWorthIt: [
      'Frames are visibly rotted, glass has failed, or you have a contractor quote in hand',
    ],
    curationStatus: 'curated',
  },
  {
    id: 'basement_moisture_prep',
    label: 'Basement moisture prep',
    iconSvg: ICON_DROPLET,
    problem:
      'Considering finishing the basement. How do I check moisture, leaks, and water risk before committing $20-50k?',
    topicId: 'home_repair',
    defaultScopeVariantId: 'basement_moisture_prep',
    defaultScenarioId: 'just_starting',
    seasonality: 'all',
    teaser: {
      buyCount: 5,
      skipCount: 5,
      spendLow: 80,
      spendHigh: 300,
      savingsLow: 80,
      savingsHigh: 260,
      payoffSentence:
        "Avoids the contractor-grade dehumidifier sized for a warehouse, the mold-fogger sprays that don't fix moisture, and the smart sensor that just measures humidity twice.",
    },
    rightForYouIf: [
      'Pre-finish: you want to know if the basement is dry enough to commit',
      'Vermont basement that runs musty in winter or humid in summer',
      'You want the diagnostic kit, not the repair kit',
    ],
    notRightIfPointsToWorthIt: [
      'Active water during snowmelt, visible mold > 10 sq ft, or foundation cracks',
    ],
    curationStatus: 'curated',
  },
  {
    id: 'mudroom_entry',
    label: 'Mudroom & entry',
    iconSvg: ICON_MUD,
    problem:
      'The boots, the leashes, the snow shovel — staged so the rest of the house stays clean.',
    topicId: 'mudroom',
    // v7.2.14 fix-up — re-pointed from outdoor_lake_season placeholder to
    // the launch-ready mudroom_entry_reset scope (mudroom topic).
    defaultScopeVariantId: 'mudroom_entry_reset',
    defaultScenarioId: 'just_starting',
    seasonality: 'mud',
    teaser: {
      buyCount: 4,
      skipCount: 3,
      spendLow: 80,
      spendHigh: 240,
      savingsLow: 60,
      savingsHigh: 180,
      payoffSentence:
        'Avoids the all-in-one mudroom kit and the premium boot tray when a $25 WaterHog and a wall hook do the job.',
    },
    rightForYouIf: [
      'It is mud season and the front door is losing the daily fight',
      'You want a list of the 4-5 things that actually help, not a Container Store haul',
    ],
    notRightIfPointsToWorthIt: [
      'You are debating a mudroom build-out or addition',
    ],
    // v7.2.14: removed beta — backed by launch-ready mudroom_entry_reset.
    curationStatus: 'curated',
  },
  {
    id: 'deck_outdoor',
    label: 'Deck & outdoor',
    iconSvg: ICON_DECK,
    problem:
      'Lake-rated, Vermont-rated, the right stuff to leave outside through a real winter.',
    topicId: 'outdoor',
    defaultScopeVariantId: 'outdoor_lake_season',
    defaultScenarioId: 'lake_property',
    seasonality: 'summer',
    teaser: {
      buyCount: 5,
      skipCount: 5,
      spendLow: 220,
      spendHigh: 760,
      savingsLow: 280,
      savingsHigh: 660,
      payoffSentence:
        'Steers you off propane patio heaters at lakeshore, citronella for blackflies, and wood Adirondacks left out year-round.',
    },
    rightForYouIf: [
      'You are opening the deck, dock, or yard for the season',
      'Lake-rated picks matter — Sunbrella, marine-grade, hidden-fastener',
      'You want to know which "outdoor" gear actually survives Vermont winters',
      'You have $100+ to spend on outdoor goods this season',
    ],
    notRightIfPointsToWorthIt: [
      'You are debating whether to refresh, repair, or rebuild the deck',
      'You have a contractor quote on deck rebuild',
    ],
    curationStatus: 'curated',
  },
  {
    id: 'kitchen_refresh',
    label: 'Kitchen organizers',
    iconSvg: ICON_KITCHEN,
    problem:
      "I want a kitchen that finally works. What do I actually buy and what do I skip?",
    topicId: 'kitchen',
    // V7.2.1 — points at the curated v2 combination so the modal
    // and the webhook route through buildSmartCartV2.
    defaultScopeVariantId: 'kitchen_organizers',
    defaultScenarioId: 'just_starting',
    seasonality: 'all',
    teaser: {
      buyCount: 8,
      skipCount: 11,
      spendLow: 260,
      spendHigh: 342,
      savingsLow: 140,
      savingsHigh: 310,
      payoffSentence:
        'Avoids the bamboo cutlery tray that does not fit older drawers, the pantry pull-out that hits the P-trap, and the premium spice rack you will outgrow.',
    },
    rightForYouIf: [
      'You want a working kitchen, not a Pinterest one',
      'You can spend a Saturday on it and want a clear shopping list before you go',
      'You are wary of the all-in-one organization kits at Container Store',
      'You have $100+ to spend and want real savings on the cart',
    ],
    notRightIfPointsToWorthIt: [
      'You are deciding whether to refresh, repair, or remodel — Worth-It returns soon',
    ],
    curationStatus: 'curated',
  },
  {
    id: 'winterizing',
    label: 'Winterizing',
    iconSvg: ICON_WINTER,
    problem:
      'Air sealing, draft fixes, the small stuff that makes January bearable.',
    topicId: 'weatherization',
    // v7.2.14: weatherization_diy_air_sealing flagged smartCartReady=false;
    // re-pointed at the launch-ready window_weatherization scope so this
    // tile doesn't 500 if anyone clicks it. Window scope also handles the
    // air-sealing intent in editorial copy on the result page.
    defaultScopeVariantId: 'window_weatherization',
    defaultScenarioId: 'already_have_basics',
    seasonality: 'winter',
    teaser: {
      buyCount: 5,
      skipCount: 6,
      spendLow: 65,
      spendHigh: 175,
      savingsLow: 120,
      savingsHigh: 320,
      payoffSentence:
        'Skips the smart thermostat purchase before air-sealing, the premium window kit on tight modern windows, and the bulk insulation buy before you measured.',
    },
    rightForYouIf: [
      'You feel cold spots and want a clear DIY action plan',
      'You want the right caulk, foam, and weatherstrip without overbuying',
      'You want the receipts so EVT will refund 75-90% of qualifying weatherization',
      'You already have a caulk gun and the basics',
    ],
    notRightIfPointsToWorthIt: [
      'You are deciding heat pump vs better windows vs insulation upgrade',
      'You have an EVT audit quote and want it ranked against alternatives',
    ],
    curationStatus: 'curated',
  },
  {
    id: 'opening_the_house',
    label: 'Opening the house',
    iconSvg: ICON_SUNSHINE,
    problem:
      'Spring open-up checklist for the lake place or the seasonal home.',
    topicId: 'outdoor',
    defaultScopeVariantId: 'outdoor_lake_season',
    defaultScenarioId: 'just_starting',
    seasonality: 'summer',
    teaser: {
      buyCount: 5,
      skipCount: 4,
      spendLow: 180,
      spendHigh: 640,
      savingsLow: 200,
      savingsHigh: 540,
      payoffSentence:
        'Steers you off the lakeshore propane heater and the wifi smart-garden kit.',
    },
    rightForYouIf: [
      'It is May/June and you are getting the seasonal place open',
      'You want a single trip with the right inventory',
    ],
    notRightIfPointsToWorthIt: [
      'You are deciding whether to add a screen porch or rebuild the dock',
    ],
    // v7.2.14: removed beta — backed by launch-ready outdoor_lake_season +
    // outdoor_seasonal_opening + outdoor_dock_lake.
    curationStatus: 'curated',
  },
  {
    id: 'small_repair',
    label: 'Small repair',
    iconSvg: ICON_TOOLBOX,
    problem:
      'A single fix — a sweep on the back door, a fan switch, a leaky faucet. What do I buy and what do I skip?',
    topicId: 'kitchen',
    defaultScopeVariantId: 'kitchen_cosmetic_refresh',
    defaultScenarioId: 'just_starting',
    seasonality: 'all',
    teaser: {
      buyCount: 3,
      skipCount: 2,
      spendLow: 25,
      spendHigh: 90,
      savingsLow: 30,
      savingsHigh: 120,
      payoffSentence:
        'A free property profile is the right starting point for a single fix.',
    },
    rightForYouIf: [
      'You only have one specific fix in mind',
    ],
    notRightIfPointsToWorthIt: [
      'A free property profile already covers single-task help — try that first',
    ],
    curationStatus: 'coming_soon',
  },
]

// ---------- Worth-It decisions --------------------------------------

export const WORTH_IT_DECISIONS: WorthItDecision[] = [
  {
    id: 'refresh_vs_remodel',
    label: 'Refresh vs remodel',
    iconSvg: ICON_QUESTION,
    problem:
      'Do I refresh the kitchen, or does it actually need a real remodel?',
    primaryTopicId: 'kitchen',
    defaultScopeVariantId: 'kitchen_cosmetic_refresh',
    defaultScenarioId: 'just_starting',
    seasonality: 'all',
    teaser: {
      buyCount: 6,
      skipCount: 5,
      spendLow: 95,
      spendHigh: 240,
      savingsLow: 1800,
      savingsHigh: 6500,
      payoffSentence:
        'Saves the wrong remodel — most kitchens that "feel dated" are a refresh, not a teardown.',
    },
    rightForYouIf: [
      'You are not sure whether the kitchen needs a refresh or a real remodel',
      'You want a ranked plan and a stop line, not just a shopping list',
      'You will spend $100+ before you commit either way',
    ],
    notRightIfPointsToSmartCart: [
      'You already decided refresh — Smart Cart is faster',
    ],
    curationStatus: 'curated',
    exampleDecision: {
      title: 'Refresh first if layout, cabinets, plumbing work',
      rankedSteps: [
        'Refresh first if layout and systems work',
        'Use a small pro for lighting and fixture swaps',
        'Remodel only if function is broken',
      ],
    },
  },
  {
    id: 'repair_vs_replace',
    label: 'Repair vs replace',
    iconSvg: ICON_HAMMER,
    problem:
      'Is the deck (or roof, or appliance) worth repairing, or do I bite the bullet and replace?',
    primaryTopicId: 'outdoor',
    defaultScopeVariantId: 'outdoor_deck_refresh',
    defaultScenarioId: 'already_have_basics',
    seasonality: 'summer',
    teaser: {
      buyCount: 5,
      skipCount: 4,
      spendLow: 140,
      spendHigh: 420,
      savingsLow: 1200,
      savingsHigh: 4500,
      payoffSentence:
        'Tells you which boards are repair-worthy and which are time to rebuild.',
    },
    rightForYouIf: [
      'You see rot, sag, or wear and want a "repair-or-replace" call',
      'You want the next ranked step plus the stop line',
    ],
    notRightIfPointsToSmartCart: [
      'You already decided to refresh the deck cosmetically',
    ],
    curationStatus: 'beta',
    exampleDecision: {
      title: 'Repair first if framing and ledger are sound',
      rankedSteps: [
        'Inspect ledger flashing and joist hangers before any boards',
        'Replace single-board damage in place — sister joists if needed',
        'Plan a full rebuild only if more than ~30% needs replacement',
      ],
    },
  },
  {
    id: 'diy_vs_hire',
    label: 'DIY vs hire',
    iconSvg: ICON_BALANCE,
    problem:
      'Where is the line between "I can do this Saturday" and "this needs a pro"?',
    primaryTopicId: 'heat_pump',
    defaultScopeVariantId: 'heat_pump_readiness_prep',
    defaultScenarioId: 'already_have_basics',
    seasonality: 'all',
    teaser: {
      buyCount: 4,
      skipCount: 4,
      spendLow: 0,
      spendHigh: 35,
      savingsLow: 600,
      savingsHigh: 2800,
      payoffSentence:
        'Names the DIY moves that pay first, and the moves where calling a pro is cheaper than the bad weekend.',
    },
    rightForYouIf: [
      'You are weighing your time vs a contractor bill',
      'You want a ranked DIY list with an explicit stop line',
    ],
    notRightIfPointsToSmartCart: [
      'You already know what to buy — Smart Cart is the lighter lift',
    ],
    curationStatus: 'curated',
    exampleDecision: {
      title: 'DIY the airflow and stop at the panel',
      rankedSteps: [
        'Walk the house with an IR thermometer; mark cold spots',
        'Tune registers and air-seal rim joists yourself',
        'Hire out the panel/service work — the stop line is electrical',
      ],
    },
  },
  {
    id: 'what_to_do_first',
    label: 'What to do first',
    iconSvg: ICON_RANKED,
    problem:
      'Long list of projects, finite weekends. What is the highest payoff move now?',
    primaryTopicId: 'weatherization',
    // Spec referenced weatherization_full_audit; substituted to the
    // authored weatherization_diy_air_sealing.
    defaultScopeVariantId: 'weatherization_diy_air_sealing',
    defaultScenarioId: 'just_starting',
    seasonality: 'fall',
    teaser: {
      buyCount: 5,
      skipCount: 6,
      spendLow: 65,
      spendHigh: 175,
      savingsLow: 800,
      savingsHigh: 3200,
      payoffSentence:
        'Ranks the small high-payoff DIY moves above the big-ticket purchases that wait.',
    },
    rightForYouIf: [
      'You have a list and want it sequenced',
      'You want the order of operations spelled out',
    ],
    notRightIfPointsToSmartCart: [
      'You only need the materials list — Smart Cart skips the sequencing',
    ],
    curationStatus: 'curated',
    exampleDecision: {
      title: 'Air-seal first, then plan the rebate stack',
      rankedSteps: [
        'Air-seal the rim joists and attic plate',
        'Submit the EVT receipts for 75-90% cash back',
        'Stack the heat pump rebate after weatherization is done',
      ],
    },
  },
  {
    id: 'already_got_a_quote',
    label: 'Already got a quote',
    iconSvg: ICON_PHONE,
    problem:
      'Contractor handed me a number. Is it fair? What is missing? What should I push back on?',
    primaryTopicId: 'heat_pump',
    defaultScopeVariantId: 'heat_pump_readiness_prep',
    defaultScenarioId: 'premium',
    seasonality: 'all',
    teaser: {
      buyCount: 3,
      skipCount: 4,
      spendLow: 0,
      spendHigh: 35,
      savingsLow: 1500,
      savingsHigh: 6800,
      payoffSentence:
        'Three questions to ask the contractor before signing — typically catches an oversize spec or a missed rebate.',
    },
    rightForYouIf: [
      'You have a quote in hand and want a second opinion',
      'You want a list of the 3 questions to ask before signing',
    ],
    notRightIfPointsToSmartCart: [
      'No quote yet — start with what to do first instead',
    ],
    curationStatus: 'beta',
    exampleDecision: {
      title: 'Three questions before you sign',
      rankedSteps: [
        'Ask for the Manual J load calc — not a square-foot rule of thumb',
        'Confirm the EVT rebate is included and who files',
        'Ask which subcontractor handles the panel work',
      ],
    },
  },
  {
    id: 'mud_or_winter_prep',
    label: 'Mud or winter prep',
    iconSvg: ICON_LEAF,
    problem:
      'Pre-mud or pre-winter — what is the right ranked checklist for THIS Vermont season?',
    primaryTopicId: 'weatherization',
    // Spec referenced window_drafts_seal; substituted to weatherization_diy_air_sealing.
    defaultScopeVariantId: 'weatherization_diy_air_sealing',
    defaultScenarioId: 'already_have_basics',
    // Resolved per season at runtime in resolveDecisionForSeason().
    seasonality: 'winter',
    teaser: {
      buyCount: 5,
      skipCount: 6,
      spendLow: 65,
      spendHigh: 175,
      savingsLow: 200,
      savingsHigh: 1100,
      payoffSentence:
        'Vermont-specific ranked checklist tuned for the season Alder detects when you load the page.',
    },
    rightForYouIf: [
      'You want a seasonal checklist ranked for impact',
      'You want the small fixes bundled with the timing badges',
    ],
    notRightIfPointsToSmartCart: [
      'You only want a shopping list — Smart Cart winterizing is the lighter pick',
    ],
    curationStatus: 'curated',
    exampleDecision: {
      title: 'Pre-winter: three weekends, three passes',
      rankedSteps: [
        'Walk the perimeter on a sub-30°F evening with an IR thermometer',
        'Caulk and foam the spots colder than 8°F below room temp',
        'Replace door sweeps and storm-door weatherstrip last',
      ],
    },
  },
]

// ---------- Lookup helpers ------------------------------------------

export function getSmartCartCategory(id: string): SmartCartCategory | undefined {
  return SMART_CART_CATEGORIES.find(c => c.id === id)
}

export function getWorthItDecision(id: string): WorthItDecision | undefined {
  return WORTH_IT_DECISIONS.find(d => d.id === id)
}

// ---------- Season-aware resolution ---------------------------------
// Some categories shift their (scope, scenario) based on Vermont season.
// Today only winterizing and mudroom_entry change; the rest pass through.

export function resolveCategoryForSeason(
  categoryId: SmartCartCategoryId,
  season: Season,
): { scopeVariantId: string; scenario: BriefScenarioId } {
  const cat = getSmartCartCategory(categoryId)
  if (!cat) throw new Error(`Unknown SmartCartCategory: ${categoryId}`)

  if (categoryId === 'winterizing') {
    if (season === 'fall_leaf' || season === 'pre_winter') {
      return { scopeVariantId: 'weatherization_diy_air_sealing', scenario: 'just_starting' }
    }
    return { scopeVariantId: 'weatherization_diy_air_sealing', scenario: 'already_have_basics' }
  }
  if (categoryId === 'mudroom_entry') {
    return { scopeVariantId: 'outdoor_lake_season', scenario: 'just_starting' }
  }
  return { scopeVariantId: cat.defaultScopeVariantId, scenario: cat.defaultScenarioId }
}

export function resolveDecisionForSeason(
  decisionId: WorthItDecisionId,
  season: Season,
): { scopeVariantId: string; scenario: BriefScenarioId } {
  const d = getWorthItDecision(decisionId)
  if (!d) throw new Error(`Unknown WorthItDecision: ${decisionId}`)

  if (decisionId === 'mud_or_winter_prep') {
    if (season === 'mud') {
      return { scopeVariantId: 'weatherization_diy_air_sealing', scenario: 'just_starting' }
    }
    if (season === 'fall_leaf' || season === 'pre_winter') {
      return { scopeVariantId: 'weatherization_diy_air_sealing', scenario: 'just_starting' }
    }
    return { scopeVariantId: 'weatherization_diy_air_sealing', scenario: 'already_have_basics' }
  }
  return { scopeVariantId: d.defaultScopeVariantId, scenario: d.defaultScenarioId }
}
