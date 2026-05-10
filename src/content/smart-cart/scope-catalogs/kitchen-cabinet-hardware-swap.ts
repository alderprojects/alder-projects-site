// V7.2.4 — Trimmed kitchen_cabinet_hardware_swap scope catalog.
//
// Editorial layer only. Product data lives in
// src/content/smart-cart/universe.ts; this file references universe
// entries via tag query (mustHaveFunctions + tier + topic).
//
// Migrated from scripts/source-catalogs/kitchen-cabinet-hardware-swap.ts.
// All slot ordering, conditionalOn flags, whyThis / whyNotCheaper /
// whyNotPremium / contextNote / warnings prose, and skip list content
// are preserved verbatim from the source.

import type { ScopeCatalog } from '@/lib/smart-cart-model'
import { FN } from '../universe'

export const KITCHEN_CABINET_HARDWARE_SWAP: ScopeCatalog = {
  topic: 'kitchen',
  scopeVariantId: 'kitchen_cabinet_hardware_swap',
  scenarios: ['just_starting', 'already_have_basics', 'tight_budget', 'premium'],

  slots: [
    // ---------- Drawer pulls --------------------------------------
    {
      slotId: 'hardware_swap_drawer_pulls',
      slotLabel: 'Drawer pulls (10-pack)',
      slotKind: 'core',
      conditionalOn: ['has_satisfactory_pulls'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetPull],
          excludeAlreadyHaveFlag: 'has_satisfactory_pulls',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetPull],
          excludeAlreadyHaveFlag: 'has_satisfactory_pulls',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetPull],
          excludeAlreadyHaveFlag: 'has_satisfactory_pulls',
          tier: 'premium',
        },
      },
      whyThis:
        'Amerock Bar Pulls is the value-per-dollar pick across professional design forums. Substantial weight in-hand, threading stays tight after years of use. The 5-1/16" center is the most common modern drawer pull size; if your existing pulls are 3" center, order the smaller variant.',
      whyNotCheaper:
        "Liberty pulls work fine and look the same on the cabinet. The visible difference is in the threading — Liberty's tends to wobble loose after 3-5 years of daily use. You'll be retightening pulls every 6 months.",
      whyNotPremium:
        'Top Knobs is solid steel with authentic premium feel in-hand. Beautiful. Houzz pro consensus: "When the door handle is on the cabinet you\'d be hard pressed to tell the difference." For a 12-pull kitchen, that\'s $200+ paid for in-hand quality only you can detect.',
      warnings: [
        'Measure existing pull-spread first. Common sizes: 3" (76mm), 3-3/4" (96mm), 5-1/16" (128mm), 6-5/16" (160mm). Wrong size = redrill.',
        'Order 1-2 extra pulls beyond your count for spares.',
        'Check finish coordination with existing plumbing/lighting before committing.',
      ],
      citations: [
        'Amerock Bar Pulls product listing (Amazon ASIN B0DLWN5QLH, Home Depot 334543944)',
        'Houzz forum thread: "Cabinet Hardware—cheap vs. expensive"',
        'Bob Vila Best Cabinet Hardware 2025 roundup',
        'Property Nest 9 Best Kitchen Cabinet Hardware Brands 2024',
      ],
    },

    // ---------- Knobs ----------------------------------------------
    {
      slotId: 'hardware_swap_knobs',
      slotLabel: 'Cabinet knobs (6-pack)',
      slotKind: 'core',
      conditionalOn: ['has_satisfactory_knobs'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetKnob],
          excludeAlreadyHaveFlag: 'has_satisfactory_knobs',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetKnob],
          excludeAlreadyHaveFlag: 'has_satisfactory_knobs',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetKnob],
          excludeAlreadyHaveFlag: 'has_satisfactory_knobs',
          tier: 'premium',
        },
      },
      whyThis:
        'Liberty Harmon is the most-reviewed knob in this tier with consistent positive feedback for finish quality. Match the finish to your drawer pulls (same brand line is safest, but mixing finishes across Liberty + Amerock works because both companies match standard finish names).',
      whyNotCheaper:
        "Generic Amazon knobs ($9 for 6) work but the finishes aren't UV-stable. 18 months in a window-lit kitchen and matte black goes patchy.",
      whyNotPremium:
        'Top Knobs / Anthropologie / Pottery Barn knobs ($15-30 each) are aesthetic statements, not functional differences. If you want a statement, do 2-4 accent knobs (kitchen island only) and use Liberty for the rest.',
      citations: [
        'Bob Vila Best Cabinet Hardware roundup (Liberty Harmon: 1,200+ Home Depot 5-star reviews)',
        'Liberty Hardware finish coordination guide',
      ],
    },

    // ---------- Screws ---------------------------------------------
    {
      slotId: 'hardware_swap_screws',
      slotLabel: 'Replacement machine screws (assortment)',
      slotKind: 'core',
      conditionalOn: [],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.hardwareScrews],
          tier: 'sweet_spot',
        },
      },
      whyThis:
        "Most pull-replacement complaints aren't about the pull — they're about the original screw being too short for the new pull's mounting profile. New cabinets vary in face thickness from 3/4\" to 1-1/4\". An $8 assortment is insurance against the most common failure.",
      whyNotCheaper:
        'Reusing the existing screws works only if the new hardware mounts to the same depth. Most pulls have different mounting profiles than knobs, so the screw lengths need to match.',
      whyNotPremium:
        'Bulk packs of 100+ screws ($25-40) are for production cabinet shops. The variety pack is right-sized for a homeowner kitchen.',
      citations: [
        'DIY hardware install forum failure mode analysis',
        'Cabinet hardware sizing reference',
      ],
    },

    // ---------- Drill jig ------------------------------------------
    {
      slotId: 'hardware_swap_jig',
      slotLabel: 'Cabinet hardware drill jig',
      slotKind: 'core',
      conditionalOn: ['hardware_holes_match_existing'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetHardwareJig],
          excludeAlreadyHaveFlag: 'hardware_holes_match_existing',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetHardwareJig],
          excludeAlreadyHaveFlag: 'hardware_holes_match_existing',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetHardwareJig],
          excludeAlreadyHaveFlag: 'hardware_holes_match_existing',
          tier: 'premium',
        },
      },
      whyThis:
        'The Kreg KHI-PULL is the verified DIY pick. Reviews consistently praise it for "easy setup, easy use, easy to store." For a one-time hardware swap, paper templates work but introduce real risk of off-center holes — and a misdrilled cabinet door is permanent.',
      whyNotCheaper:
        "Paper templates work if all your hardware sizes match exactly and you're careful. They rarely match exactly — most kitchens mix knobs (single hole), 3\" pulls, and 5\" pulls. One off-center hole = visible imperfection forever.",
      whyNotPremium:
        'KHI-XLPULL handles longer pulls, but for typical kitchen pulls (3" to 6"), the basic KHI-PULL covers everything. The Pro version is for cabinet shops drilling 50+ doors.',
      warnings: [
        'Skip this slot if all your new hardware exactly matches your old hole spacing (rare).',
        'Test on a scrap piece or the back of a cabinet first.',
      ],
      citations: [
        'Kreg KHI-PULL Amazon listing (B01JQ74J5E)',
        'Kreg Tool Company official product documentation',
        'Amazon review consensus on KHI-PULL accuracy and ease',
      ],
    },

    // ---------- Soft-close hinges ----------------------------------
    {
      slotId: 'hardware_swap_softclose_hinges',
      slotLabel: 'Soft-close cabinet hinges (12-pack)',
      slotKind: 'core',
      conditionalOn: ['has_softclose_hinges', 'cabinets_already_softclose'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.softCloseHinge],
          excludeAlreadyHaveFlag: 'has_softclose_hinges',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.softCloseHinge],
          excludeAlreadyHaveFlag: 'has_softclose_hinges',
          tier: 'sweet_spot',
        },
      },
      whyThis:
        "Blum hinges are the cabinet-shop standard. The damper lasts the lifetime of the kitchen. Generic hinges fail in 12-18 months and you're replacing them anyway.",
      whyNotCheaper:
        'Generic soft-close hinges work for 12-18 months then dampers fail. Back to slamming doors and replacing the hinges twice in 5 years.',
      warnings: [
        'Skip this slot entirely if your cabinets already have soft-close (most cabinets manufactured post-2010 do).',
        'Measure existing hinges. European cup hinges (35mm) and face-frame hinges are NOT interchangeable.',
        'Take an existing hinge to the store or photograph it next to a ruler.',
      ],
      citations: [
        'Blum hardware product datasheet',
        'Cabinet shop forum standards on Blum vs generic',
      ],
    },

    // ---------- Wood putty -----------------------------------------
    {
      slotId: 'hardware_swap_wood_putty',
      slotLabel: 'Wood putty (color-matched)',
      slotKind: 'core',
      conditionalOn: ['hardware_holes_match_existing'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.woodPutty],
          excludeAlreadyHaveFlag: 'hardware_holes_match_existing',
          tier: 'sweet_spot',
        },
      },
      whyThis:
        'Hardware swaps that change pull length or knob-to-pull conversion leave visible holes. Filling them properly is what separates "looks intentional" from "amateur job." Minwax is the standard pre-tinted putty.',
      whyNotCheaper: 'No real cheaper tier. Skipping creates visible old holes adjacent to new ones.',
      whyNotPremium:
        'Custom-tinted epoxy fillers ($25-40) are for high-end woodworking. For cabinet hole-fill, Minwax does the job.',
      citations: [
        'Minwax product line documentation',
        'DIY cabinet repair forum consensus',
      ],
    },
  ],

  // ---------- Skip list — verbatim from source -------------------------
  skipList: [
    {
      id: 'skip_top_knobs_designer_pulls_swap',
      type: 'wrong_version',
      title: 'Top Knobs / Anthropologie / Rejuvenation designer pulls (when Amerock works)',
      marketingPitch: 'The jewelry of the kitchen.',
      realReason:
        'For a 12-pull kitchen, Top Knobs adds $200+ over Amerock for the same matte black bar pull profile. The Houzz pro consensus: "When the door handle is on the cabinet you\'d be hard pressed to tell the difference." If you genuinely want the in-hand premium feel, do 2-3 accent pulls on the kitchen island only — not the full kitchen.',
      amountSaved: { low: 150, high: 250 },
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['Houzz forum thread on cabinet hardware tiers', 'Bob Vila best cabinet hardware 2025'],
    },
    {
      id: 'skip_complete_kit',
      type: 'wrong_version',
      title: '"Complete kitchen hardware kit" deals (30+ piece sets at big-box stores)',
      marketingPitch: 'Everything you need for the whole kitchen, $89!',
      realReason:
        "These kits include knobs and pulls in random finishes/styles. Most kitchens use a consistent finish across all hardware. You'd use 22 pieces in your style and waste 8. Per-piece, the kit isn't cheaper than buying Amerock + Liberty in your specific finish.",
      amountSaved: { low: 30, high: 50 },
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['Per-piece pricing analysis vs kit pricing'],
    },
    {
      id: 'skip_self_tapping_screws',
      type: 'wrong_version',
      title: 'Self-tapping cabinet hardware screws',
      marketingPitch: 'Drills its own hole through cabinet — no measuring needed.',
      realReason:
        'They strip out cabinet box plywood. The standard machine screw + drill template approach is the universal pro answer. If you want shortcuts, the Kreg jig is the right one — not the screws.',
      amountSaved: { low: 10, high: 15 },
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['Cabinet shop forum screw failure analysis'],
    },
    {
      id: 'skip_premium_hinge_dampers',
      type: 'wrong_version',
      title: '"Retrofit" hinge dampers for old hinges',
      marketingPitch: 'Add soft-close to your existing cabinet hinges.',
      realReason:
        "These add-on dampers ($30 for a 10-pack) fail within 6-12 months because they're trying to add a mechanism to a hinge not designed for it. If you want soft-close, replace the hinges entirely. The retrofit dampers are throwing money at a mechanical problem that needs a different mechanism.",
      amountSaved: { low: 25, high: 40 },
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['Amazon review aggregation on retrofit dampers'],
    },
    {
      id: 'skip_magic_pull_remover',
      type: 'wrong_version',
      title: 'Specialty "stuck hardware" sprays and removal tools',
      marketingPitch: 'Loosens stuck hardware in seconds.',
      realReason:
        'A 1/4" socket wrench and 30 seconds of patience does this for free. Most stuck pulls are stuck because the previous installer used the wrong screw length, and a wrench handles that easily. The $15-25 specialty spray adds nothing.',
      amountSaved: { low: 12, high: 22 },
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['DIY hardware removal consensus'],
    },
    {
      id: 'skip_placement_calculator_widgets',
      type: 'wrong_category',
      title: 'Cabinet hardware "perfect placement" calculator tools',
      realReason:
        '$30-50 widgets that "calculate" optimal pull placement. The standard rule (centered on door style rails, 1/2" to 1" from edge of drawer face) is a 30-second look at any cabinet design book. Free.',
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['Cabinet design reference standards'],
    },
    {
      id: 'skip_hardware_finish_sprays',
      type: 'wrong_category',
      title: 'Hardware-finish maintenance sprays',
      realReason:
        '"Polish your matte black hardware with our specialty spray." Matte finishes are matte for a reason — adding sheen defeats the design. Just wipe with a damp cloth.',
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['Hardware finish care manufacturer guidance'],
    },
    {
      id: 'skip_painting_existing_hardware',
      type: 'wrong_category',
      title: 'Painting existing cabinet hardware to "save replacement cost"',
      realReason:
        "Hardware paint chips at every grip point within 3-6 months because it's a high-touch surface. Just buy the new hardware.",
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['DIY hardware painting failure reports'],
    },
    {
      id: 'skip_hardware_subscription',
      type: 'wrong_category',
      title: 'Cabinet hardware "subscription clubs" or recurring delivery',
      realReason:
        "You replace cabinet hardware every 10-20 years. There's no subscription play here — these are pure marketing constructs.",
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['Hardware replacement cycle analysis'],
    },
    {
      id: 'skip_cabinet_door_decals',
      type: 'wrong_category',
      title: 'Cabinet door decals or vinyl wraps as "alternative to hardware change"',
      realReason:
        "Lift at corners within 2 months in kitchen humidity. Printed wood-grain doesn't match cabinets next to them. Real hardware swap is what changes the look — not decals.",
      appliesToScope: ['kitchen_cabinet_hardware_swap'],
      citations: ['DIY cabinet refacing forum failure analysis'],
    },
  ],

  scenarioDefaults: {
    just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
    already_have_basics: {
      selectedTier: 'sweet_spot',
      alreadyHave: ['has_softclose_hinges', 'hardware_holes_match_existing'],
    },
    tight_budget: { selectedTier: 'budget', alreadyHave: [] },
    premium: { selectedTier: 'premium', alreadyHave: [] },
  },

  // v7.2.14: scope-level metadata added to legacy v7.2.3 catalog.
  smartCartPromise:
    'Spend $30-$180 on hardware to give cabinets a new-kitchen feel — no paint, no replacement.',
  primaryCustomerPain:
    'The kitchen looks tired, but tearing out cabinets is years away. Hardware swap is the cheapest meaningful upgrade — and the easiest to get wrong on hole spacing.',
  valueProposition:
    'New pulls and soft-close hinges read as "renovated" to most eyes for under $200. The new-kitchen sensation for ~1% of remodel cost.',
  routeOutRules: [
    {
      condition: 'hardware_holes_dont_match_existing',
      destination: 'verify_first',
      reason:
        "If new pulls don't fit the existing center-to-center hole spacing, you'll be drilling and patching. Either match the spacing exactly, or commit to filling and repainting cabinet doors.",
    },
    {
      condition: 'cabinet_doors_warped_or_damaged',
      destination: 'small_pro',
      reason:
        "Hardware on damaged doors looks worse, not better. If doors are warped or splitting, this isn't the right scope — replace or reface.",
    },
  ],
}
