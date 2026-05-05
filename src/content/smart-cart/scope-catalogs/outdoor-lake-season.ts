// V7.2.4 — Trimmed outdoor_lake_season scope catalog.
//
// Editorial layer only. Product data lives in universe.ts. No
// dedup overlap with the kitchen catalogs.
//
// Migrated from scripts/source-catalogs/outdoor-lake-season.ts.
// All slot ordering, conditionalOn flags, prose, warnings, and skip
// list content preserved verbatim.

import type { ScopeCatalog } from '@/lib/smart-cart-model'
import { FN } from '../universe'

export const OUTDOOR_LAKE_SEASON: ScopeCatalog = {
  topic: 'outdoor',
  scopeVariantId: 'outdoor_lake_season',
  scenarios: ['lake_property', 'just_starting', 'already_have_basics', 'tight_budget', 'premium'],

  slots: [
    // ---------- Adirondack chairs ---------------------------------
    {
      slotId: 'lake_adirondack_chairs',
      slotLabel: 'Adirondack chairs (set of 4)',
      slotKind: 'core',
      conditionalOn: ['has_adirondack_chairs'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.adirondackChair],
          excludeAlreadyHaveFlag: 'has_adirondack_chairs',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.adirondackChair],
          excludeAlreadyHaveFlag: 'has_adirondack_chairs',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.adirondackChair],
          excludeAlreadyHaveFlag: 'has_adirondack_chairs',
          tier: 'premium',
        },
      },
      whyThis:
        'Polywood Classic Folding is the Wirecutter / Bob Vila pick for lake-property Adirondacks. Stays outside year-round in cold climates without covers. The 20-year warranty is real — and the ColorStay pigment is built into the lumber, not painted on.',
      whyNotCheaper:
        'Walmart resin chairs ($30-80) work but reviews show fading within 1-2 seasons and lightweight construction means they blow into the lake during storms. If your lake gets 25+mph gusts, factor in retrieval cost or replacement every 3 seasons.',
      whyNotPremium:
        "Wood Adirondacks (West Elm, Pottery Barn solid mahogany or eucalyptus, $400-650+) are beautiful but require yearly seal/stain. For a lake property, that's a Saturday lost every spring. Polywood = zero maintenance.",
      warnings: [
        'Polywood Classic Folding has a 250-lb weight capacity (premium Modern variant goes to 325 lb). Confirm fit for any heavier guests.',
        'Some buyers report squirrel chewing on Polywood armrests. If your lake property has heavy squirrel activity, ask neighbors before committing or use deterrent spray the first season.',
      ],
      contextNote:
        'Buy navy or slate grey rather than white — both age more gracefully against wood decks and weather salt spray better.',
      citations: [
        'Polywood Classic Folding Adirondack Amazon listing (B001VNCJ36)',
        'Polywood Modern Adirondack Amazon listing (B079Y5K6HX)',
        'Bob Vila Best Adirondack Chairs 2026 roundup',
        'RoomforTuesday Polywood real-world review',
        'PolyTeak material comparison',
      ],
    },

    // ---------- Side tables --------------------------------------
    {
      slotId: 'lake_side_tables',
      slotLabel: 'Adirondack side tables (pair)',
      slotKind: 'core',
      conditionalOn: ['has_outdoor_side_tables'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorSideTable],
          excludeAlreadyHaveFlag: 'has_outdoor_side_tables',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorSideTable],
          excludeAlreadyHaveFlag: 'has_outdoor_side_tables',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorSideTable],
          excludeAlreadyHaveFlag: 'has_outdoor_side_tables',
          tier: 'premium',
        },
      },
      whyThis:
        'Polywood side tables match your chairs in color and material. Same zero-maintenance promise. They look like a coordinated furniture set rather than mixed-and-matched.',
      whyNotCheaper:
        "Plastic resin side tables crack at leg joints from temperature swings within 1-2 seasons. You'll buy them twice.",
      whyNotPremium:
        'Teak is beautiful but requires sealing for color retention. Same maintenance hit as wood Adirondacks.',
      citations: ['Polywood furniture line documentation'],
    },

    // ---------- Cushions -----------------------------------------
    {
      slotId: 'lake_cushions',
      slotLabel: 'Outdoor seat cushions (Sunbrella, set of 4)',
      slotKind: 'core',
      conditionalOn: ['has_outdoor_cushions'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorCushion],
          excludeAlreadyHaveFlag: 'has_outdoor_cushions',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorCushion],
          excludeAlreadyHaveFlag: 'has_outdoor_cushions',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorCushion],
          excludeAlreadyHaveFlag: 'has_outdoor_cushions',
          tier: 'premium',
        },
      },
      whyThis:
        'Sunbrella is the verified premium outdoor fabric. Solution-dyed acrylic with 5-year fade warranty. Cost-per-year math: $90 cushion lasting 5+ years = $18/year vs $30 polyester cushion lasting 18 months = $20/year. Sunbrella wins on total cost AND looks newer the whole time.',
      whyNotCheaper:
        'CushionGuard polyester (Home Depot Hampton Bay line) lasts 2-3 seasons. Cobalt blue shifts to purple-grey within 18 months. You replace them more often, which adds up to more dollars and more shopping trips.',
      whyNotPremium:
        "Frontgate and Restoration Hardware use the same Sunbrella fabric. The premium markup is in cushion construction (fill density, custom welt, embroidery). Your lake guests can't tell the difference from 6 feet away.",
      contextNote:
        'For a Vermont lake, neutrals (taupe, navy, forest green) age more gracefully than bright colors. Sunbrella vibrant fabrics also stay vibrant — but if you redecorate elsewhere, they look "stuck in 2026" sooner.',
      warnings: [
        'Even Sunbrella benefits from indoor winter storage — clean before storing or mold can grow on dirt trapped in fibers.',
        "Don't buy if your Adirondacks are non-standard sizing. Measure first.",
      ],
      citations: [
        'Sunbrella vs CushionGuard durability comparison (Neighbor blog)',
        'FabricaKraft cost-over-time analysis',
        'Triad Cushion Factory outdoor fabric guide',
      ],
    },

    // ---------- Umbrella -----------------------------------------
    {
      slotId: 'lake_umbrella',
      slotLabel: 'Outdoor umbrella + base (10ft cantilever)',
      slotKind: 'core',
      conditionalOn: ['has_outdoor_umbrella'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.patioUmbrella],
          excludeAlreadyHaveFlag: 'has_outdoor_umbrella',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.patioUmbrella],
          excludeAlreadyHaveFlag: 'has_outdoor_umbrella',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.patioUmbrella],
          excludeAlreadyHaveFlag: 'has_outdoor_umbrella',
          tier: 'premium',
        },
      },
      whyThis:
        'A 10ft cantilever with Sunbrella canopy and a real 200lb base is the lake-property sweet spot. The cantilever design means you can angle shade where you need it without moving the table, and Sunbrella canopy lasts as long as your cushions.',
      whyNotCheaper:
        "Walmart pole-and-base umbrellas blow over in lake winds even with a 50lb base. Polyester canopies fade in one season. The crank-tilt mechanism stiffens within 12 months. You'll replace it before you replace the chairs.",
      whyNotPremium:
        'Treasure Garden is for properties on open water with sustained 25+mph winds. If your lake site is sheltered (cove, treeline windbreak), the standard cantilever handles 90% of conditions for $400+ less.',
      warnings: [
        'A 200lb base is the MINIMUM for a 10ft cantilever umbrella. Lake properties on open water often need 250-300lb base or wall-anchored mount.',
        'Wind-rated specs assume cantilever is closed during storms. Always close in sustained 20mph+ winds.',
      ],
      citations: [
        'Patio umbrella wind-rating standards',
        'Sunbrella canopy fabric specs',
        'Cantilever vs pole-and-base umbrella comparison',
      ],
    },

    // ---------- Outdoor rug --------------------------------------
    {
      slotId: 'lake_outdoor_rug',
      slotLabel: 'Outdoor rug (8x10, polypropylene)',
      slotKind: 'core',
      conditionalOn: ['has_outdoor_rug'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorRug],
          excludeAlreadyHaveFlag: 'has_outdoor_rug',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorRug],
          excludeAlreadyHaveFlag: 'has_outdoor_rug',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorRug],
          excludeAlreadyHaveFlag: 'has_outdoor_rug',
          tier: 'premium',
        },
      },
      whyThis:
        "Polypropylene rugs are the right material for a lake. They don't hold water, hose off easily, and the solution-dyed color stays put.",
      whyNotCheaper:
        '$40 polyester "outdoor" rugs fade and trap mildew. The rain doesn\'t drain through them properly.',
      whyNotPremium:
        'Jute/sisal rugs hold moisture and rot at the lake. Beautiful indoors, wrong material for outdoor by water.',
      citations: ['Outdoor rug material durability comparisons'],
    },

    // ---------- Gas grill ----------------------------------------
    {
      slotId: 'lake_gas_grill',
      slotLabel: 'Gas grill (3-burner mid-tier)',
      slotKind: 'core',
      conditionalOn: ['has_working_grill'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.gasGrill],
          excludeAlreadyHaveFlag: 'has_working_grill',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.gasGrill],
          excludeAlreadyHaveFlag: 'has_working_grill',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.gasGrill],
          excludeAlreadyHaveFlag: 'has_working_grill',
          tier: 'premium',
        },
      },
      whyThis:
        'Weber Spirit II E-310 is the verified pro recommendation for a long-term backyard or lake grill. 10-year warranty on the parts that fail (lid, burners). The $769 retail looks high until you compare it to replacing a $250 grill three times in 6 years.',
      whyNotCheaper:
        "Char-Broil and Nexgrill 3-burners ($200-300) work for 1-2 seasons. Burners corrode, igniters fail, wheels seize. By year 3 you're replacing it. Total cost over 6 years: $600-900 + 3 grill assemblies.",
      whyNotPremium:
        'Weber Genesis is real upgrade — sear station, side burner, larger surface. If you grill 3+ nights a week and entertain large groups, the upgrade earns its price. For occasional lake-weekend grilling (burgers, chicken, the occasional steak), the Spirit II delivers 95% of the cook quality at 50% of the cost.',
      warnings: [
        "Skip this slot if the lake property already has a working Weber. Replace once it's actually broken — not because it looks dated.",
        'Confirm propane vs natural gas before ordering. The same grill model has different SKUs.',
      ],
      citations: [
        'Weber Spirit II E-310 Amazon listing (B077JTCMKQ)',
        'Weber 10-year warranty terms',
        'Grillio retail pricing reference',
      ],
    },

    // ---------- Grill cover --------------------------------------
    {
      slotId: 'lake_grill_cover',
      slotLabel: 'Grill cover (Weber-rated)',
      slotKind: 'core',
      conditionalOn: ['has_grill_cover'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.grillCover],
          excludeAlreadyHaveFlag: 'has_grill_cover',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.grillCover],
          excludeAlreadyHaveFlag: 'has_grill_cover',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.grillCover],
          excludeAlreadyHaveFlag: 'has_grill_cover',
          tier: 'premium',
        },
      },
      whyThis:
        'A model-fit Weber cover protects the grill without trapping moisture. The Spirit II has a specific shape; universal covers fit poorly and create condensation pockets that rust the grates faster than no cover at all.',
      whyNotCheaper:
        'Generic $20-30 grill covers fit poorly, trap moisture, and accelerate rust. The metal grill rusts faster under them than it would uncovered.',
      whyNotPremium:
        "Marine-grade covers are overkill unless your lake gets actual sea spray (it doesn't — it's freshwater).",
      citations: ['Weber grill cover product line', 'Grill cover material comparison'],
    },

    // ---------- Grill tools --------------------------------------
    {
      slotId: 'lake_grill_tools',
      slotLabel: 'Grill tools set (3-piece basic)',
      slotKind: 'core',
      conditionalOn: ['has_grill_tools'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.grillTools],
          excludeAlreadyHaveFlag: 'has_grill_tools',
          tier: 'sweet_spot',
        },
      },
      whyThis:
        'Cheap tool sets bend and burn. Spatula heads wobble within 5 uses. Weber 3-piece is the right size and weight for a lake-weekend grill setup.',
      whyNotCheaper:
        "$10 tool sets bend within 5 uses. The handle/head connection wobbles, and you can't get a clean flip on a steak.",
      whyNotPremium:
        '$80-150 sets with extra tools (fish basket, vegetable basket, marinade injector) — buy these only when you need them, not as a kit.',
      citations: ['Weber accessories product line'],
    },

    // ---------- String lights ------------------------------------
    {
      slotId: 'lake_string_lights',
      slotLabel: 'Outdoor string lights (LED, 48ft)',
      slotKind: 'core',
      conditionalOn: ['has_outdoor_lighting'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorStringLights],
          excludeAlreadyHaveFlag: 'has_outdoor_lighting',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorStringLights],
          excludeAlreadyHaveFlag: 'has_outdoor_lighting',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorStringLights],
          excludeAlreadyHaveFlag: 'has_outdoor_lighting',
          tier: 'premium',
        },
      },
      whyThis:
        "Brightech Ambience Pro is the verified Wirecutter / Bob Vila pick at this tier. Replaceable bulbs mean one bulb death doesn't kill the strand.",
      whyNotCheaper:
        "Walmart $15 string lights have non-replaceable bulbs. One bulb dies and the whole strand is trash. You're buying them every 18 months.",
      whyNotPremium:
        'Pottery Barn $200+ "café lights" are the same product with branding. The Brightech is the verified pick; designer labels add $130 of pure markup.',
      citations: [
        'Wirecutter outdoor string lights review',
        'Brightech product line documentation',
      ],
    },

    // ---------- Cooler -------------------------------------------
    {
      slotId: 'lake_cooler',
      slotLabel: 'Cooler (65-70qt mid-tier)',
      slotKind: 'core',
      conditionalOn: ['has_lake_cooler'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorCooler],
          excludeAlreadyHaveFlag: 'has_lake_cooler',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorCooler],
          excludeAlreadyHaveFlag: 'has_lake_cooler',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorCooler],
          excludeAlreadyHaveFlag: 'has_lake_cooler',
          tier: 'premium',
        },
      },
      whyThis:
        'RTIC is the hidden value pick. Same roto-molded construction as Yeti, same 7-day ice retention, half the price. Less brand prestige but same physics.',
      whyNotCheaper:
        'Coleman Xtreme works for short trips but the styrofoam-walled coolers melt ice in 8 hours and the lid hinges break by season 2.',
      whyNotPremium:
        "Yeti Tundra delivers the exact same 7-day ice retention as RTIC. The $150-200 premium is brand prestige. Also worth knowing: Yeti is the most-stolen cooler at public docks because it's worth stealing.",
      citations: [
        'RTIC vs Yeti Reddit r/Coolers consensus',
        'Roto-molded cooler ice retention testing',
      ],
    },

    // ---------- Floats -------------------------------------------
    {
      slotId: 'lake_floats_essentials',
      slotLabel: 'Inflatable floats + lake essentials',
      slotKind: 'core',
      conditionalOn: ['has_lake_floats'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.lakeFloats],
          excludeAlreadyHaveFlag: 'has_lake_floats',
          tier: 'sweet_spot',
        },
      },
      whyThis:
        'Mid-grade inflatables that survive a season of regular use. Skip the brand markup, skip the dollar-store deflators.',
      whyNotCheaper:
        'Dollar-store pool floats deflate within 3-4 uses. Seams give out. Cheaper to buy mid-grade once.',
      whyNotPremium:
        '$200+ "luxury lake floats" with cup holders, canopies, and drink stations sound great until the canopy tears in the first windy day.',
      citations: ['Lake float durability consumer reviews'],
    },

    // ---------- Bug control ---------------------------------------
    {
      slotId: 'lake_bug_control',
      slotLabel: 'Mosquito control (Thermacell + refills)',
      slotKind: 'core',
      conditionalOn: ['has_bug_control'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.mosquitoControl],
          excludeAlreadyHaveFlag: 'has_bug_control',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.mosquitoControl],
          excludeAlreadyHaveFlag: 'has_bug_control',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.mosquitoControl],
          excludeAlreadyHaveFlag: 'has_bug_control',
          tier: 'premium',
        },
      },
      whyThis:
        "Thermacell MR300 is the budget-tier scientific mosquito solution. The butane-powered MR300 creates a real 15-foot zone where mosquitoes can't reach you. Citronella is theater; Thermacell is chemistry.",
      whyNotCheaper:
        'Citronella candles are aesthetic only — the active zone is 2-3 ft, not the 15 ft a Thermacell delivers. Spray repellents work but coat your skin and clothing.',
      whyNotPremium:
        'Battery/rechargeable Thermacells use the same chemistry. The butane MR300 works fine for the cost — refills are $5-7 per 12-hour mat pack.',
      contextNote:
        'Mosquitoes are worst at dawn/dusk near lake edges. Light the Thermacell 30 minutes before you sit down.',
      citations: [
        'Thermacell efficacy testing data',
        'CDC mosquito control comparison resources',
      ],
    },
  ],

  // ---------- Skip list — verbatim from source ----------------------
  skipList: [
    {
      id: 'skip_wood_adirondacks',
      type: 'wrong_version',
      title: 'Solid wood Adirondacks (mahogany, teak, eucalyptus from major retailers)',
      marketingPitch: 'Premium hardwood, classic look, made to last.',
      realReason:
        "Wood Adirondacks at the lake mean an annual seal/stain ritual. The Polywood differential isn't aesthetic — it's never having to do that ritual. For a 4-chair set, you're saving 4-8 hours every spring. Over 10 years, that's 40-80 hours of free time.",
      amountSaved: { low: 200, high: 400 },
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Polywood vs wood Adirondack comparison (RoomforTuesday)'],
    },
    {
      id: 'skip_designer_cushions',
      type: 'wrong_version',
      title: 'Frontgate / Restoration Hardware "premium" cushions when Sunbrella IS the actual fabric',
      marketingPitch: 'Custom-tailored cushions in premium colors.',
      realReason:
        'Both use Sunbrella fabric. The premium ($150-250 per cushion) is in cushion construction (fill density, custom welt, embroidery). At the lake, none of that is visible from 6 feet away. Generic Sunbrella cushions are the same fabric.',
      amountSaved: { low: 80, high: 150 },
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Sunbrella sourcing analysis'],
    },
    {
      id: 'skip_yeti_tundra',
      type: 'wrong_version',
      title: 'Yeti Tundra over RTIC (matching specs)',
      marketingPitch: 'Bear-rated, 7-day ice retention, heritage cooler brand.',
      realReason:
        'RTIC matches the actual ice retention specs at half the price. Same roto-molded construction. The Yeti markup is brand prestige. For a lake cooler used for day trips, the 7-day spec is theoretical anyway. Plus: Yeti is the most-stolen cooler at public docks.',
      amountSaved: { low: 130, high: 220 },
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Reddit r/Coolers Yeti vs RTIC consensus'],
    },
    {
      id: 'skip_treasure_garden_umbrella',
      type: 'wrong_version',
      title: 'Treasure Garden cantilever umbrella (when standard cantilever works)',
      marketingPitch: 'Country-club grade, 25mph wind-rated.',
      realReason:
        'A standard 10ft cantilever from Sunbrella + 200lb base ($300-400) handles 90% of lake conditions. Treasure Garden is for properties on open water with sustained 25+mph winds. If your lake site is sheltered (cove, treeline windbreak), the upgrade is paying for unused capability.',
      amountSaved: { low: 300, high: 700 },
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Cantilever umbrella wind-rating standards'],
    },
    {
      id: 'skip_premium_kettle_grill',
      type: 'wrong_version',
      title: 'Big Green Egg / Kamado Joe (when Weber Spirit II E-310 works)',
      marketingPitch: 'Heat retention up to 750°F, sears better than gas.',
      realReason:
        "BGE and Kamado are real performance products for ceramic/wood cooking. If you grill mostly burgers, chicken, and the occasional steak, the Weber Spirit II E-310 delivers 95% of the cook quality at 50% of the cost. Plus the Weber's 10-year warranty covers what actually breaks.",
      amountSaved: { low: 600, high: 1200 },
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Grill type cost-vs-use analysis'],
    },
    {
      id: 'skip_pottery_barn_lights',
      type: 'wrong_version',
      title: 'Pottery Barn / Restoration Hardware string lights',
      marketingPitch: 'Curated café-style outdoor lighting.',
      realReason:
        'Same Brightech / Wirecutter winner picks at 3-5x markup for the brand label. Often the exact same product manufactured by the same OEM with different branding.',
      amountSaved: { low: 100, high: 200 },
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Outdoor lighting brand sourcing analysis'],
    },
    {
      id: 'skip_smart_outdoor_lighting',
      type: 'wrong_category',
      title: 'Smart outdoor lighting systems with hub control',
      realReason:
        "$300-500 for hub + bulbs + app. The lake doesn't need scheduled programmable lighting. A wall switch on a string of Brightech lights does what you actually need. Smart lighting in indoor entertaining spaces is one thing — outdoor smart lighting at a lake is solving a problem you don't have.",
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Outdoor lighting use-case analysis'],
    },
    {
      id: 'skip_outdoor_furniture_covers',
      type: 'wrong_category',
      title: 'Universal-fit furniture covers (tarps for chairs/tables)',
      realReason:
        'The Polywood / Sunbrella / Weber gear listed above is rated to live outdoors uncovered. Adding tarps creates condensation pockets where mold grows. Skip the covers entirely — they cause more problems than they solve.',
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Polywood and Sunbrella weatherability docs'],
    },
    {
      id: 'skip_citronella_torches',
      type: 'wrong_category',
      title: 'Citronella torches and tiki torches',
      realReason:
        "Aesthetic only. Mosquito control rating is less than half a percent of what a Thermacell delivers. They burn through fuel and leave soot stains on the deck. If you want torches for ambiance, fine, but don't buy them as bug control.",
      appliesToScope: ['outdoor_lake_season'],
      citations: ['EPA mosquito control efficacy comparison'],
    },
    {
      id: 'skip_lake_decor_signage',
      type: 'wrong_category',
      title: 'Lake-themed signs, "Welcome to the Lake," "Drinking Time" decor',
      realReason:
        'Aesthetic preference, not investment. The reviews aggregate: these items look dated 24 months in and the next owner of the property throws them out. If you want lake atmosphere, invest in better lights and seating.',
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Outdoor decor longevity surveys'],
    },
    {
      id: 'skip_patio_heater',
      type: 'wrong_category',
      title: 'Propane patio heaters for early-spring lake use',
      realReason:
        "$200-400 plus fuel. If you're at the lake in April, sweaters and a fire pit are warmer per dollar. A $50 fire pit + firewood does what a patio heater does for less than half the cost.",
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Patio heater vs fire pit warmth comparison'],
    },
    {
      id: 'skip_outdoor_kitchen_islands',
      type: 'wrong_category',
      title: 'Outdoor kitchen islands and prep stations',
      realReason:
        'The "outdoor kitchen" trend at $1,500-5,000 makes sense for a permanent residence. For a seasonal lake property, a folding side table and the grill is enough. A propane connection to a built-in island also requires permitting in most jurisdictions.',
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Outdoor kitchen ROI analysis for seasonal properties'],
    },
    {
      id: 'skip_premium_dock_fenders',
      type: 'wrong_category',
      title: 'Premium dock fenders, dock bumpers, marine-specialty hardware',
      realReason:
        "Don't buy these until you actually have boat dock-impact issues. Then buy specifically for what's hitting. Buying preemptively means you have hardware that doesn't fit the actual problem.",
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Dock hardware purchase timing analysis'],
    },
    {
      id: 'skip_premium_yard_games',
      type: 'wrong_category',
      title: 'Premium yard games (cornhole, ladder ball) at $200+ when $40 works',
      realReason:
        "Walmart cornhole at $40 lasts as long as $200 cornhole at the lake. The aesthetic premium isn't visible from 30 feet on the dock. Save the $160 for the Sunbrella cushions or the better cooler.",
      appliesToScope: ['outdoor_lake_season'],
      citations: ['Yard game durability vs price analysis'],
    },
  ],

  scenarioDefaults: {
    just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
    already_have_basics: {
      selectedTier: 'sweet_spot',
      alreadyHave: [
        'has_adirondack_chairs',
        'has_outdoor_side_tables',
        'has_working_grill',
        'has_grill_cover',
      ],
    },
    tight_budget: { selectedTier: 'budget', alreadyHave: [] },
    premium: { selectedTier: 'premium', alreadyHave: [] },
    lake_property: { selectedTier: 'sweet_spot', alreadyHave: [] },
  },
}
