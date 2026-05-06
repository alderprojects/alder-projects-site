// Authored content layer for the V7 brief scenarios. CONFIG.scenarios
// holds the structural definition (id, label, emphasizes, etc.); this
// file holds the prose hooks that render in Smart Cart and Worth-It
// output: the opener, the per-topic hook, the per-season hook, the
// "verify before buying" checklist, and the additional traps that
// only fire under that scenario.
//
// Real Talk VT voice — voice-guide.md rules apply. Specifics over
// claims. Banned phrases out. Action endings.

import type { BriefScenarioId } from '../lib/recommender-config.types'
import type { TopicId } from '../lib/property-modules'
import type { Season } from '../lib/recommender-config.types'

export type ScenarioContent = {
  id: BriefScenarioId
  openerHook: string                 // 1-2 sentences shown above the cart synthesis
  topicHooks: Partial<Record<TopicId, string>>
  seasonHooks: Partial<Record<Season, string>>
  verifyBeforeBuying: string[]       // 3-5 things the buyer should physically verify
  additionalTraps: string[]          // trap ids from src/content/traps.ts
}

export const SCENARIOS: Record<BriefScenarioId, ScenarioContent> = {
  // ---------- Just starting --------------------------------------------
  just_starting: {
    id: 'just_starting',
    openerHook:
      "First time on this project, so the cart is built around the items that work the first weekend without specialty tools. Mid-tier picks, honest quantities, no premium upsells.",
    topicHooks: {
      kitchen:
        "For a first-time kitchen refresh, the cart leans on items that forgive small mistakes — deglosser instead of full sand, primer-tinted paint instead of matched custom mix, and pulls in a returnable test-batch first.",
      weatherization:
        "Air-sealing is the first move that pays back fastest. The cart starts at the rim joists and basement penetrations, where 30% of Vermont attic-load heat loss originates and where the materials are cheap.",
      outdoor:
        "Outdoor projects compound. The first weekend is the inventory walk and one quick win — finishing the deck stain test patch, not the deck stain.",
      heat_pump:
        "Before you order the heat pump, the prep work runs in this order: walk-through with an infrared thermometer, then air-seal, then schedule the install. Skip the order; you have time.",
      bath:
        "First-time bath cosmetic refresh runs $80-220 and sticks for 5-7 years. Save the demo-and-rebuild for a later year.",
    },
    seasonHooks: {
      mud:
        "Mud season is for indoor prep, not outdoor work. Stain test patches, paint a single door, plan the spring outdoor sequence.",
      spring_blackfly:
        "Mid-May to mid-June is the worst window for outdoor labor. Permethrin-treated clothing or DEET, otherwise the project gets abandoned at the third bite.",
      lake:
        "Lake-season weekend windows are short. Buy materials before, install during the one good weekend.",
      fall_leaf:
        "Fall is the air-sealing window. Materials are still summer-priced, evenings are workable, and the payback shows up in November.",
      pre_winter:
        "October weekend windows close fast. Pick the one moveable project per weekend and stop adding to the cart.",
      deep_winter:
        "Outdoor work pauses. Cabinet hardware, paint test patches, pre-bought weatherization for spring.",
    },
    verifyBeforeBuying: [
      "Measure the actual surface (door count, linear feet, cubic feet) before ordering quantities",
      "Open the cabinet under the sink and confirm the shutoff valves turn — they often have not in 15 years",
      "Test one door or section in a hidden spot before buying the full project quantity",
      "Check what is already in the basement workshop — most first-time DIYers already own 60% of the basic-tool list",
    ],
    additionalTraps: [
      'all-in-one-cabinet-refresh-kit',
      'bulk-insulation-before-measuring',
      'diy-faucet-without-shutoff-test',
    ],
  },

  // ---------- Already have basics --------------------------------------
  already_have_basics: {
    id: 'already_have_basics',
    openerHook:
      "You already have the screwdriver, the caulk gun, and a half-empty bag of foam. The cart skips the obvious and surfaces the secondary items most projects miss.",
    topicHooks: {
      kitchen:
        "Skipping the basics, the next-most-common kitchen miss is the right primer for cabinet paint that has to live in Vermont basement humidity. That is the item homeowners borrow from neighbors and end up with the wrong one.",
      weatherization:
        "The first-pass DIY hits the obvious gaps. The second pass — rim joists, attic plate, electrical penetrations — is where the next $200 of materials returns the next $400/year of fuel savings.",
      outdoor:
        "If the deck and the cushions are squared away, the secondary picks are the dock hardware, the lake cover-removal sequence, and the mosquito-control timing.",
      heat_pump:
        "If the air-sealing is done, the next layer is airflow tuning at registers and returns. $0-15 in dampers and a free Saturday morning.",
      bath:
        "If the cosmetic refresh is done, the secondary picks are the silicone caulk re-bead at the tub-surround joint and the bath-fan run-time check.",
    },
    seasonHooks: {
      fall_leaf:
        "Second-pass weatherization season. The first pass got the windows; the second pass gets the basement rim joists and attic plate.",
      pre_winter:
        "Last-window items: water-heater blanket, MERV filter swap, and the heat-cable check on the 1860s eaves where ice dams form.",
      deep_winter:
        "Indoor-only secondary work: cabinet hinge soft-close, drawer dividers tested in actual drawers, paint test patches in low-light corners.",
    },
    verifyBeforeBuying: [
      "Do a basement-and-garage inventory walk before ordering — most DIY households double-buy caulk, foam, and weatherstripping",
      "Photograph what you have so a return run does not pull the wrong size",
      "Check the consumable expiration on canned foam (most loses propellant after 2 years) before assuming the can on the shelf still works",
    ],
    additionalTraps: [
      'bulk-insulation-before-measuring',
      'smart-thermostat-before-air-sealing',
    ],
  },

  // ---------- Tight budget ---------------------------------------------
  tight_budget: {
    id: 'tight_budget',
    openerHook:
      "The cart is the lower-tier swap-in for every premium pick the engine surfaces. Where the tradeoff is honest, we say so. Where it is not, we say that too.",
    topicHooks: {
      kitchen:
        "Tight-budget kitchen refresh leans on the $35 stamped pull instead of the $80 solid brass — same look at 5 feet, less heft in hand. Skip the $280 smart under-cabinet LED for the $30 plug-in strip.",
      weatherization:
        "The $25 caulk-gun-and-foam combo beats the $280 smart thermostat for measurable Vermont winter comfort. Tight-budget cart leads with the high-payoff, low-spend items first.",
      outdoor:
        "Generic outdoor cushions ($40) versus Sunbrella ($120) is a 2-year-versus-7-year tradeoff. If the deck is a rental or sale-prep, generic wins. If the deck is the family's Saturdays for the next decade, Sunbrella amortizes.",
      heat_pump:
        "Tight-budget heat pump path is single-zone ductless ($3,500-5,500) over multi-zone ($7,000-12,000). Pair the rebate stack to bring net cost under $2,000.",
      bath:
        "Tight-budget bath refresh is paint, hardware, and silicone re-bead. $80-220 total, sticks 5-7 years.",
    },
    seasonHooks: {
      mud:
        "Mud-season pricing on outdoor stock is the year's lowest. Buy snow blowers, patio furniture, and outdoor stains in April-May for next-season storage.",
      pre_winter:
        "Black Friday catches a lot of weatherization gear at 30-40% off — but only the well-stocked items. Buy the case of caulk in summer; buy the smart thermostat in November.",
    },
    verifyBeforeBuying: [
      "Confirm the lower-tier item is in stock at the local hardware store, not just online — Vermont return policies on opened building materials are stricter than Amazon's",
      "Read the lower-tier reviews specifically for cold-climate use; pull-out drawer slides with plastic bushings fail in Vermont basements within 18 months",
      "If the budget item is the wrong tier, do less of the project this year rather than buying tier-tight on the wrong category",
    ],
    additionalTraps: [
      'all-in-one-cabinet-refresh-kit',
      'patio-furniture-peak-pricing',
      'snow-blower-november-rush',
    ],
  },

  // ---------- Premium --------------------------------------------------
  premium: {
    id: 'premium',
    openerHook:
      "The cart leans on longer-lasting picks where the upgrade actually returns the dollar. We still call out the categories where premium is wasted on a project of this scope.",
    topicHooks: {
      kitchen:
        "Premium-tier kitchen refresh: solid brass pulls ($80 vs $35 stamped) carry the patina you want; soft-close hinges on doors that actually slam (not all of them); under-cabinet LED with a real driver, not the $30 strip.",
      weatherization:
        "Premium weatherization is professional dense-pack cellulose at the rim joist over DIY foam — pays back inside 5 years on a Vermont 7,500-HDD heating load. EVT 75% rebate makes the math better.",
      outdoor:
        "Sunbrella cushions over generic, hidden-fastener decking over screws, marine-grade hardware on the dock. Each picks up 4-8 years of life over the budget alternative.",
      heat_pump:
        "Premium heat pump path: cold-climate NEEP-listed ducted system ($14,000-22,000 in resort-tier towns) with backup-strip electric heater, sized to the post-weatherization load. Stack the rebates to net $11k-17k off list.",
      bath:
        "Premium bath cosmetic refresh: real cabinet-grade vanity, replaceable Moen or Delta cartridge faucet, mounted GFCI outlets at the right height. Skip the all-in-one vanity kit.",
    },
    seasonHooks: {
      pre_winter:
        "Premium picks for fall: water-heater blanket-and-pipe-wrap kit, MERV 13 filter ($25 vs $8), and the upgraded Honeywell Pro vs. the basic round thermostat.",
      lake:
        "Lake-property premium: marine-grade dock hardware, Sunbrella + teak combo, and the actual YETI cooler over the off-brand rotomold.",
    },
    verifyBeforeBuying: [
      "Verify that the premium pick has parts availability through a US distributor — premium imports often have a 3-month part-replacement lead time that turns the high-end pick into a stranded asset",
      "Confirm the warranty is transferable on resale — some premium fixtures void warranty on title transfer, which dings sale price",
      "On items the contractor will install, the premium pick should be on the contractor's preferred list — premium-but-unfamiliar adds an installation premium that wipes out the upgrade math",
    ],
    additionalTraps: [
      'expired-quote-lumber-jump',
      'unsigned-change-orders',
    ],
  },

  // ---------- Lake property --------------------------------------------
  lake_property: {
    id: 'lake_property',
    openerHook:
      "Lake property cart: weatherproof, cold-stored over winter, and rated for the lakeshore wind that destroys ungrounded patio heaters. Sunbrella, marine-grade, hidden fastener.",
    topicHooks: {
      kitchen:
        "Lake-property kitchen has different math: the kitchen runs hard 4 weekends in summer and sits unheated 8 months a year. Picks need to survive freeze-thaw on the cabinet hardware and the under-counter caulk.",
      weatherization:
        "Lake-property weatherization is about the close-down sequence, not the heating load. Pick antifreeze for trap drains, pipe-blow-out compressor adapter, and the digital low-temp thermostat alarm that texts at 35°F.",
      outdoor:
        "Lake-property outdoor leads with the cover-removal-and-replacement sequence, the dock hardware that handles ice-out, and the mosquito-control timing keyed to the ice-off date.",
      heat_pump:
        "Lake-property heat pump is single-zone ductless in the main great room, sized for shoulder-season weekend visits, not whole-winter occupancy. EVT rebate still applies.",
      bath:
        "Lake-property bath refresh assumes 8-month freeze. Pick fixtures with replaceable cartridges, never built-in valves, and silicone-caulk every joint that touches the wall framing.",
    },
    seasonHooks: {
      lake:
        "Peak lake season has a 12-week working window. Buy materials in late April, install by mid-May, store the rest by Columbus Day.",
      fall_leaf:
        "Lake-property close-down starts the day after Columbus Day. The water shutoff, antifreeze in traps, and disconnect outdoor hoses sequence runs in that order — not the other way around.",
      pre_winter:
        "Last weekend of October: drain the water heater, blow out lines with compressed air, set thermostat to 50°F minimum, photograph everything for the spring re-open punch list.",
    },
    verifyBeforeBuying: [
      "Confirm the property is inside the 250-ft Vermont Shoreland Protection buffer before any clearing, building, or impervious surface — DEC fines start at $2,000 and replant orders compound",
      "Photograph the close-down state in late October — you will not remember in April which valve was where",
      "Verify the propane patio heater is wind-rated — lakeshore wind tips standard models, and the resulting fire risk is not theoretical",
    ],
    additionalTraps: [
      'shoreland-buffer-clearing',
      'patio-furniture-peak-pricing',
    ],
  },

  // ---------- v7.2.5 placeholder scenarios -----------------------------
  // These are implicit scenarios introduced for v7.2.5 scopes (freeze
  // prevention, spring opening, mud-season entry reset, absentee owner).
  // Pastes 2-4 fill in the prose hooks alongside the catalog content
  // they target. Paste 1 ships them as minimal placeholders so the
  // BriefScenarioId Record stays exhaustive.

  absentee_owner: {
    id: 'absentee_owner',
    openerHook:
      "Absentee-owner cart leans on remote monitoring (WiFi sensors, smart shutoffs, cellular alerts) over comfort items. The goal is detecting trouble before the next visit, not making the kitchen nicer.",
    topicHooks: {},
    seasonHooks: {},
    verifyBeforeBuying: [],
    additionalTraps: [],
  },

  pre_winter_prep: {
    id: 'pre_winter_prep',
    openerHook:
      "Pre-winter prep is the October freeze-prevention pass: pipe insulation, hose-bib covers, draft sealing, and the smart-shutoff or freeze sensor that pages you at 35°F.",
    topicHooks: {},
    seasonHooks: {},
    verifyBeforeBuying: [],
    additionalTraps: [],
  },

  spring_opening: {
    id: 'spring_opening',
    openerHook:
      "Spring opening cart: the test kits, filters, consumables, and reset gear that turn the first weekend back from a punch list into a coffee-on-the-deck weekend.",
    topicHooks: {},
    seasonHooks: {},
    verifyBeforeBuying: [],
    additionalTraps: [],
  },

  mud_season: {
    id: 'mud_season',
    openerHook:
      "Mud-season cart: boot trays, contractor-grade entry mats, gear bins, and the towel station that keeps the rest of the house dry between March and May.",
    topicHooks: {},
    seasonHooks: {},
    verifyBeforeBuying: [],
    additionalTraps: [],
  },
}

// ---------- Helpers ---------------------------------------------------

export function getScenarioContent(id: BriefScenarioId): ScenarioContent {
  const c = SCENARIOS[id]
  if (!c) throw new Error(`Unknown scenario id: ${id}`)
  return c
}

// Resolve the topic hook with a graceful fallback for topics not
// hand-authored under this scenario. Returns the opener if no
// topic-specific hook exists.
export function getTopicHookForScenario(scenarioId: BriefScenarioId, topic: TopicId): string {
  const c = getScenarioContent(scenarioId)
  return c.topicHooks[topic] ?? c.openerHook
}

export function getSeasonHookForScenario(scenarioId: BriefScenarioId, season: Season): string | null {
  const c = getScenarioContent(scenarioId)
  return c.seasonHooks[season] ?? null
}
