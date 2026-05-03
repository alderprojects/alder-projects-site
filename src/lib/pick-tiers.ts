// Pick-tier metadata for V7 Smart Cart synthesis.
//
// Each existing AffiliateItem in src/data/affiliates.ts carries one
// canonical search/url. V7 extends a subset with tight / mid / premium
// tiers so the SmartCart synthesis function can swap to a cheaper
// alternative under the tight_budget scenario, or to a longer-life pick
// under the premium scenario.
//
// Coverage at V7 launch: kitchen + weatherization + outdoor items
// reachable from the smartCartReady scope variants. V7.1 fills tiers
// for the rest of the catalog.
//
// The mid tier corresponds to the existing AffiliateItem (so default
// rendering is unchanged when no scenario is applied). Tight is a
// cheaper alternative with an honest tradeoff. Premium is a
// longer-lasting pick with a stated reason.

import { buildAmazonUrl } from './buildAmazonUrl'

export type PickTier = 'tight' | 'mid' | 'premium'

export type TierEntry = {
  searchTerms: string                 // Amazon search query
  estPrice: number                    // typical $ at the tier
  tradeoff: string                    // honest sentence — "what you give up" or "why it's worth it"
}

export type ItemTiers = {
  tight: TierEntry
  mid: TierEntry
  premium?: TierEntry                 // optional at V7 launch; V7.1 fills remaining
}

// Keyed by AffiliateItem.id. Items not present in this map fall
// through to the catalog default (mid-equivalent).
export const PICK_TIERS: Record<string, ItemTiers> = {
  // ---------- Kitchen ------------------------------------------------
  cabinet_pulls: {
    tight: {
      searchTerms: 'basic stamped cabinet pulls 3 inch black 12 pack',
      estPrice: 15,
      tradeoff: 'Stamped steel finish wears at 3-5 years vs solid brass at 10+ years. Looks identical at 5 feet.',
    },
    mid: {
      searchTerms: 'cabinet pulls 3 inch satin nickel 10 pack',
      estPrice: 35,
      tradeoff: 'Standard satin nickel — the workhorse pick. Lasts 7-10 years on Vermont kitchen use.',
    },
    premium: {
      searchTerms: 'solid brass cabinet pulls 3 inch unlacquered',
      estPrice: 80,
      tradeoff: 'Unlacquered brass develops patina; you handle these every day, the heft and finish are worth it.',
    },
  },

  cabinet_refinish: {
    tight: {
      searchTerms: 'cabinet refinish kit gel stain',
      estPrice: 35,
      tradeoff: 'Gel stain over existing finish — quick refresh that lasts 3-5 years.',
    },
    mid: {
      searchTerms: 'cabinet paint primer kit deglosser',
      estPrice: 65,
      tradeoff: 'Deglosser + primer + Benjamin Moore Advance — the full Saturday-and-Sunday refresh that lasts 10+ years.',
    },
  },

  undermount_leds: {
    tight: {
      searchTerms: 'plug-in under cabinet LED 2 pack',
      estPrice: 30,
      tradeoff: 'Plug-in strip with built-in switch. No electrical work needed.',
    },
    mid: {
      searchTerms: 'hardwired under cabinet LED kit warm white 12V',
      estPrice: 90,
      tradeoff: 'Hardwired 12V with $15 driver. Cleaner look. Requires minor electrical work.',
    },
    premium: {
      searchTerms: 'undercabinet LED dimmable warm white CRI 90 hardwired',
      estPrice: 240,
      tradeoff: 'CRI 90+ for accurate kitchen color rendering. Premium driver. Lasts 50,000+ hours.',
    },
  },

  drawer_organizer: {
    tight: {
      searchTerms: 'plastic drawer organizer adjustable 4 piece',
      estPrice: 18,
      tradeoff: 'Adjustable plastic — fits any Vermont drawer width. Sufficient.',
    },
    mid: {
      searchTerms: 'bamboo drawer divider expandable kitchen',
      estPrice: 38,
      tradeoff: 'Bamboo expandable. Better feel and longevity than plastic.',
    },
  },

  pendant_lights_3pk: {
    tight: {
      searchTerms: 'pendant light 3 pack glass shade kitchen',
      estPrice: 90,
      tradeoff: 'Generic glass pendant. Looks fine; brass / chrome finish wears at 4-6 years.',
    },
    mid: {
      searchTerms: 'pendant light kitchen island brass adjustable',
      estPrice: 220,
      tradeoff: 'Solid metal finish, adjustable cord. The pick that does not look "kit" 3 years in.',
    },
  },

  // ---------- Weatherization ------------------------------------------
  ge_silicone_caulk: {
    tight: {
      searchTerms: 'GE silicone II clear caulk',
      estPrice: 8,
      tradeoff: 'Standard 100% silicone — handles every Vermont weatherization penetration.',
    },
    mid: {
      searchTerms: 'GE silicone II window door caulk paintable',
      estPrice: 12,
      tradeoff: 'Paintable variant for visible interior runs. Same silicone base.',
    },
  },

  great_stuff_foam_pack: {
    tight: {
      searchTerms: 'Great Stuff gaps and cracks foam 12 oz',
      estPrice: 6,
      tradeoff: 'Single can. Right call if you have measured the work.',
    },
    mid: {
      searchTerms: 'Great Stuff Pro gun-foam pack 4 cans',
      estPrice: 28,
      tradeoff: 'Pro gun-foam multi-pack — better control, less waste, lasts the multi-weekend project.',
    },
    premium: {
      searchTerms: 'Pageris gun-foam dispensing kit professional',
      estPrice: 65,
      tradeoff: 'Pro dispensing gun + cleaner. Reusable across years; cuts waste by 30%.',
    },
  },

  weatherstrip_door: {
    tight: {
      searchTerms: 'foam weatherstripping self adhesive 17 ft',
      estPrice: 10,
      tradeoff: 'Foam strip — replaces every 2-3 years on Vermont winters.',
    },
    mid: {
      searchTerms: 'silicone weatherstripping door seal v-strip',
      estPrice: 22,
      tradeoff: 'V-strip silicone — lasts 5-7 years, better thermal performance.',
    },
  },

  pipe_insulation_set: {
    tight: {
      searchTerms: 'pipe insulation foam 1/2 inch 6 pack',
      estPrice: 14,
      tradeoff: 'Standard foam tube insulation. Tape seams.',
    },
    mid: {
      searchTerms: 'pipe insulation rubber EPDM 6 ft pack',
      estPrice: 32,
      tradeoff: 'EPDM rubber — better R-value, more durable on basement runs.',
    },
  },

  smart_thermostat_basic: {
    tight: {
      searchTerms: 'programmable thermostat 7 day non smart',
      estPrice: 25,
      tradeoff: 'Programmable, not smart. Saves the $200+ smart-tier purchase if you do not need remote access.',
    },
    mid: {
      searchTerms: 'Ecobee smart thermostat lite',
      estPrice: 120,
      tradeoff: 'Smart with app control. EVT-rebate eligible. Worth it once weatherization is done.',
    },
    premium: {
      searchTerms: 'Ecobee Premium with sensors',
      estPrice: 280,
      tradeoff: 'Premium tier with included sensors and air-quality. Right call for whole-house heat pump systems.',
    },
  },

  // ---------- Outdoor / Lake -----------------------------------------
  patio_cushions_sunbrella: {
    tight: {
      searchTerms: 'outdoor cushions weather resistant 2 pack',
      estPrice: 40,
      tradeoff: 'Generic outdoor fabric — fades and fails at 2-3 Vermont seasons.',
    },
    mid: {
      searchTerms: 'Sunbrella outdoor cushions standard size 2 pack',
      estPrice: 120,
      tradeoff: 'Real Sunbrella — UV stable, 7+ year life with indoor winter storage.',
    },
    premium: {
      searchTerms: 'Sunbrella outdoor cushions custom fit teak',
      estPrice: 320,
      tradeoff: 'Custom-fit Sunbrella + teak frame. Lake-property tier. Lasts 10-15 years.',
    },
  },

  outdoor_rug_8x10: {
    tight: {
      searchTerms: 'outdoor rug 8x10 polypropylene',
      estPrice: 60,
      tradeoff: 'Standard polypropylene — UV resistant, 3-4 year lifespan.',
    },
    mid: {
      searchTerms: 'outdoor rug Sunbrella 8x10 reversible',
      estPrice: 180,
      tradeoff: 'Sunbrella weave — 7+ years if stored over winter.',
    },
  },

  brightech_string_lights: {
    tight: {
      searchTerms: 'string lights outdoor 48 ft G40',
      estPrice: 28,
      tradeoff: 'Generic G40 LED string. Replace every 2-3 seasons.',
    },
    mid: {
      searchTerms: 'Brightech Ambience Pro 48ft outdoor string lights',
      estPrice: 60,
      tradeoff: 'Brightech — heavier-gauge wire, brighter LEDs, lasts 5+ Vermont seasons.',
    },
  },

  patio_4pc_set: {
    tight: {
      searchTerms: 'patio furniture 4 piece resin wicker conversation set',
      estPrice: 350,
      tradeoff: 'Resin wicker over steel — fades at year 4, frame holds up.',
    },
    mid: {
      searchTerms: 'patio furniture 4 piece aluminum frame Sunbrella',
      estPrice: 850,
      tradeoff: 'Aluminum frame, Sunbrella cushions — the 7-10 year pick for Vermont decks.',
    },
  },

  patio_furniture_covers_set: {
    tight: {
      searchTerms: 'patio furniture covers waterproof set',
      estPrice: 35,
      tradeoff: 'Generic vinyl-coated polyester — replace every 2-3 winters.',
    },
    mid: {
      searchTerms: 'patio furniture covers Vailge heavy duty waterproof',
      estPrice: 75,
      tradeoff: 'Heavy-duty 600D polyester. Vermont-winter tested. 5+ year life.',
    },
  },

  keter_deck_box: {
    tight: {
      searchTerms: 'outdoor storage deck box 70 gallon',
      estPrice: 90,
      tradeoff: 'Basic resin deck box. Sufficient for cushion storage.',
    },
    mid: {
      searchTerms: 'Keter deck box 120 gallon',
      estPrice: 160,
      tradeoff: 'Keter — the standard. Holds full cushion set, lasts 10+ years.',
    },
  },

  // ---------- Tools (cross-topic) -------------------------------------
  ir_thermometer: {
    tight: {
      searchTerms: 'infrared thermometer non contact',
      estPrice: 18,
      tradeoff: 'Basic IR thermometer — accurate enough for weatherization walkthroughs.',
    },
    mid: {
      searchTerms: 'Klein IR thermometer dual laser',
      estPrice: 42,
      tradeoff: 'Klein dual-laser — better accuracy, lasts the rest of your homeowner career.',
    },
  },
}

// ---------- Helpers ---------------------------------------------------

export type TieredPick = {
  itemId: string
  tier: PickTier
  searchTerms: string
  estPrice: number
  tradeoff: string
  url: string                          // resolved Amazon URL via buildAmazonUrl
}

// Resolve an item id + tier to a pick. Returns undefined if the item
// has no entry in PICK_TIERS or the requested tier is not authored
// (premium is optional at V7 launch).
export function getPickTier(itemId: string, tier: PickTier): TieredPick | undefined {
  const tiers = PICK_TIERS[itemId]
  if (!tiers) return undefined
  const entry = tiers[tier]
  if (!entry) return undefined
  return {
    itemId,
    tier,
    searchTerms: entry.searchTerms,
    estPrice: entry.estPrice,
    tradeoff: entry.tradeoff,
    url: buildAmazonUrl(entry.searchTerms),
  }
}

// Returns the items that have any tiered metadata — used by tests
// and the V7.1 backlog (gaps).
export function tieredItemIds(): string[] {
  return Object.keys(PICK_TIERS)
}
