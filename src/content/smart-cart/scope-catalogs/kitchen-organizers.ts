// V7.2.3 — Trimmed kitchen_organizers scope catalog.
//
// Editorial layer only. Product data lives in
// src/content/smart-cart/universe.ts; this file references universe
// entries via tag query (mustHaveFunctions + tier).
//
// Migrated from src/content/smart-cart/kitchen-organizers/{slots,
// skip-list}.ts. All slot ordering, conditionalOn flags, whyThis /
// whyNotCheaper / whyNotPremium / contextNote / warnings prose, and
// skip list content are preserved verbatim.

import type { ScopeCatalog } from '@/lib/smart-cart-model'
import { FN } from '../universe'

export const KITCHEN_ORGANIZERS: ScopeCatalog = {
  topic: 'kitchen',
  scopeVariantId: 'kitchen_organizers',
  scenarios: ['just_starting', 'already_have_basics', 'tight_budget', 'premium'],

  slots: [
    // ---------- SLOT 1: Cutlery tray --------------------------------
    {
      slotId: 'kitchen_cutlery_tray',
      slotLabel: 'Cutlery tray — expandable bamboo',
      slotKind: 'core',
      conditionalOn: ['has_cutlery_tray'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cutleryDrawerOrganizer],
          excludeAlreadyHaveFlag: 'has_cutlery_tray',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cutleryDrawerOrganizer],
          excludeAlreadyHaveFlag: 'has_cutlery_tray',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cutleryDrawerOrganizer],
          excludeAlreadyHaveFlag: 'has_cutlery_tray',
          tier: 'premium',
        },
      },
      whyThis:
        'Expandable bamboo, fits standard residential 18-22 inch drawers — measure yours. Holds silverware plus 2-3 serving utensils.',
      whyNotCheaper:
        "Ryqtop only fits drawers up to 17 inches. Most kitchen drawers built post-1985 are wider, so the cheap one leaves gaps that let utensils migrate. Save $8 today, regret it the first time you reach for a wooden spoon and it's two compartments over.",
      whyNotPremium:
        "The Container Store version is genuinely beautiful but doesn't subdivide better than the Pipishell. The Kitchn's reviewer ranked them: 'Container Store was the prettiest, but Pipishell did the job for less than half the price.' Premium is for show kitchens, not function.",
      citations: [],
    },

    // ---------- SLOT 2: Pull-out pantry baskets --------------------
    {
      slotId: 'kitchen_pull_out_pantry',
      slotLabel: 'Pull-out pantry baskets — heavy-duty steel',
      slotKind: 'core',
      conditionalOn: ['has_pantry_baskets'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.pullOutPantryBasket],
          excludeAlreadyHaveFlag: 'has_pantry_baskets',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.pullOutPantryBasket],
          excludeAlreadyHaveFlag: 'has_pantry_baskets',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.pullOutPantryBasket],
          excludeAlreadyHaveFlag: 'has_pantry_baskets',
          tier: 'premium',
        },
      },
      whyThis:
        'Heavy-duty steel that handles canned goods and small appliances without the wire bowing. Full-extension slides bring the back of the cabinet to you.',
      whyNotCheaper:
        "Simple Houseware uses a wire basket that bows under canned goods. The 17 inch depth is a tease — your cabinet is probably 22+ inches deep, so the wire won't reach. If you store food in this cabinet, you'll replace it within a year.",
      whyNotPremium:
        "Rev-A-Shelf two-tier is cabinet-shop grade with soft close. Two tiers is a tax for a feature you didn't ask for — most under-counter cabinets are 22-24 inches tall, and the top tier ends up sitting empty or holding things you can't reach.",
      warnings: [
        'Measure first — cabinet opening must be at least 15-1/4 inches wide. Many older cabinets are narrower.',
      ],
      citations: [],
    },

    // ---------- SLOT 3: Spice drawer --------------------------------
    {
      slotId: 'kitchen_spice_drawer',
      slotLabel: 'Spice drawer organizer — expandable bamboo, 4-tier',
      slotKind: 'core',
      conditionalOn: ['has_spice_solution'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.spiceDrawerOrganizer],
          excludeAlreadyHaveFlag: 'has_spice_solution',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.spiceDrawerOrganizer],
          excludeAlreadyHaveFlag: 'has_spice_solution',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.spiceDrawerOrganizer],
          excludeAlreadyHaveFlag: 'has_spice_solution',
          tier: 'premium',
        },
      },
      whyThis:
        'Expandable bamboo fits 12-23 inch drawers. Holds ~48 standard spice jars across 4 tiers.',
      whyNotCheaper:
        "DIOLOVE's plastic is functionally similar but the vents collect spice dust the bamboo doesn't, and reviews flag the non-slip pads detaching after 3-4 months in a humid kitchen. Vermont kitchens with summer humidity over 60 percent see this fast.",
      whyNotPremium:
        "KraftMaid drop-in looks great but you're paying for cabinet-shop precision in a drawer that holds spice jars regardless. The expandable bamboo is the right buy unless you're refacing.",
      warnings: [
        "Measure first — drawer interior must be at least 3 inches deep. Older kitchen drawers can be exactly 2-3/4 inches and won't fit.",
      ],
      citations: [],
    },

    // ---------- SLOT 4: Under-sink organizer (no budget tier) ------
    {
      slotId: 'kitchen_under_sink',
      slotLabel: 'Under-sink organizer — expandable, P-trap friendly',
      slotKind: 'core',
      conditionalOn: ['has_under_sink_organization'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.underSinkOrganizer],
          excludeAlreadyHaveFlag: 'has_under_sink_organization',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.underSinkOrganizer],
          excludeAlreadyHaveFlag: 'has_under_sink_organization',
          tier: 'premium',
        },
      },
      whyThis:
        "Expandable steel that routes around your P-trap and garbage disposal — that's the whole point of the modular panels. Holds detergents and cast iron without sagging.",
      whyNotCheaper:
        "There isn't a real budget tier worth recommending here. Most $20-30 under-sink racks have a fixed frame that assumes a flat cabinet floor and no plumbing. They literally don't fit around a garbage disposal — you'd return it.",
      whyNotPremium:
        "Rev-A-Shelf custom kit is real cabinet-shop install. If you're doing a sink replacement anyway, time it then. Otherwise this is overkill for 'I want to find the dish soap.'",
      warnings: [
        "Plumbing check: this product is for cabinets with standard P-trap or P-trap-and-disposal configurations. If your sink has an S-trap (older homes), you may have a code situation that needs addressing first — don't put an organizer over it.",
      ],
      citations: [],
    },

    // ---------- SLOT 5: Lid organizer (sweet_spot only) ------------
    {
      slotId: 'kitchen_lid_organizer',
      slotLabel: 'Tupperware / food container lid organizer',
      slotKind: 'core',
      conditionalOn: ['has_lid_organizer'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.lidOrganizer],
          excludeAlreadyHaveFlag: 'has_lid_organizer',
          tier: 'sweet_spot',
        },
      },
      whyThis:
        "Most plastic-divider lid organizers tip when you grab one. The EVERIE adjustable holds lids upright — that's the point.",
      contextNote:
        'Honest call — if you have fewer than 6 lids total, skip this entirely and use a small bin you already own. The lid organizer pays off when you\'re past 8 lids and the chaos is real.',
      citations: [],
    },

    // ---------- SLOT 6: Bag/wrap organizer -------------------------
    {
      slotId: 'kitchen_bag_organizer',
      slotLabel: 'Plastic bag and wrap organizer',
      slotKind: 'core',
      conditionalOn: ['has_bag_organizer'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.bagWrapOrganizer],
          excludeAlreadyHaveFlag: 'has_bag_organizer',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.bagWrapOrganizer],
          excludeAlreadyHaveFlag: 'has_bag_organizer',
          tier: 'premium',
        },
      },
      whyThis:
        'Holds bags, foil, wrap, parchment in one drawer. Anchor clips keep it from migrating when you open the drawer.',
      whyNotCheaper:
        'Single-slot bag organizers (~$10) work for one box but you end up buying 4 at the same per-unit cost as the bundle.',
      whyNotPremium:
        "Rev-A-Shelf wrap organizer is overkill unless you're refacing. The bamboo 4-pack is what most people need.",
      contextNote:
        'Vermont tip — keep this in a drawer near the stove, not the fridge. Cooking workstation placement makes the difference.',
      citations: [],
    },

    // ---------- SLOT 7: Drawer dividers ----------------------------
    {
      slotId: 'kitchen_drawer_dividers',
      slotLabel: 'Drawer dividers — adjustable bamboo, set of 4',
      slotKind: 'core',
      conditionalOn: ['has_drawer_dividers'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.drawerDivider],
          excludeAlreadyHaveFlag: 'has_drawer_dividers',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.drawerDivider],
          excludeAlreadyHaveFlag: 'has_drawer_dividers',
          tier: 'premium',
        },
      },
      whyThis:
        'Spring-loaded bamboo dividers that adapt to any drawer. Pros use these to break up deep drawers (food containers, baking pans, hot pads) without buying purpose-built organizers for each. One $30 set replaces $80 of single-purpose organizers.',
      whyNotPremium:
        'Container Store version is the same mechanism in prettier wood. Beautiful, no functional advantage.',
      citations: [],
    },

    // ---------- SLOT 8: Lazy Susan ---------------------------------
    {
      slotId: 'kitchen_lazy_susan',
      slotLabel: 'Lazy Susan — corner cabinet retrofit',
      slotKind: 'core',
      // Hide if user has a Susan already OR if they have no corner cabinet.
      conditionalOn: ['has_lazy_susan', 'no_corner_cabinet'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.lazySusan],
          excludeAlreadyHaveFlag: 'has_lazy_susan',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.lazySusan],
          excludeAlreadyHaveFlag: 'has_lazy_susan',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.lazySusan],
          excludeAlreadyHaveFlag: 'has_lazy_susan',
          tier: 'premium',
        },
      },
      whyThis:
        'Two-tier 18 inch fits most corner cabinets. Ball-bearing rotation handles canned goods. No cabinet modification needed.',
      whyNotCheaper:
        "$20 plastic spinners aren't strong enough for canned goods. They wobble, items fall behind the spinner, and you've created a worse problem.",
      whyNotPremium:
        'Full kidney pullout is real cabinet retrofit — worth it if your corner cabinet is dead space and you cook a lot. Not for first-time organizers.',
      warnings: [
        "Skip this slot entirely if you don't have a corner cabinet.",
      ],
      citations: [],
    },

    // ---------- ADD-ON 1: Magnetic spice ---------------------------
    {
      slotId: 'kitchen_magnetic_spice',
      slotLabel: 'Magnetic spice tin set + range hood mount',
      slotKind: 'addon',
      conditionalOn: [],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.magneticSpiceStorage],
          tier: 'sweet_spot',
        },
      },
      whyThis:
        "Magnetic tins on a steel range hood put your most-used spices in arm's reach. Real failure mode: people buy these for stainless steel hoods and the magnets don't hold — only buy if your hood is actual steel.",
      warnings: [
        'Test with a fridge magnet first — stainless steel range hoods are non-magnetic.',
      ],
      citations: [],
    },

    // ---------- ADD-ON 2: Drying mat -------------------------------
    {
      slotId: 'kitchen_drying_mat',
      slotLabel: 'Roll-up dish drying mat',
      slotKind: 'addon',
      conditionalOn: [],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.dishDryingMat],
          tier: 'sweet_spot',
        },
      },
      whyThis:
        "If you don't have a dishwasher or hand-wash a lot. Skip otherwise.",
      citations: [],
    },

    // ---------- ADD-ON 3: Fridge bins ------------------------------
    {
      slotId: 'kitchen_fridge_bins',
      slotLabel: 'Clear fridge bin set (variety pack)',
      slotKind: 'addon',
      conditionalOn: [],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.fridgeOrganizer],
          tier: 'sweet_spot',
        },
      },
      whyThis:
        "Different category but bought together. Real win: low-cost, immediate visual change. Real loss: doesn't fit door-shelf-style fridges.",
      warnings: [
        'Measure your fridge interior first — door-shelf designs have non-standard widths.',
      ],
      citations: [],
    },
  ],

  // ---------- Skip list -----------------------------------------------
  // Migrated verbatim from kitchen-organizers/skip-list.ts.
  skipList: [
    // ===== TYPE A — Wrong version =====================================
    {
      id: 'skip_premium_dividers',
      type: 'wrong_version',
      title: 'Container Store premium drawer dividers',
      marketingPitch: 'Beautiful bamboo, premium feel, perfect fit',
      realReason:
        'Functionally identical to the $25 Pipishell. The Kitchn ranked the cheaper one higher for daily use. You are paying $40 extra per drawer for an aesthetic upgrade nobody but you sees.',
      amountSaved: { low: 35, high: 50 },
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_two_tier_pullout',
      type: 'wrong_version',
      title: 'Rev-A-Shelf two-tier pullout (when you only need one)',
      marketingPitch: 'Doubles your cabinet capacity',
      realReason:
        'Two tiers is great if your cabinet has 24+ inches of vertical clearance. Most under-counter cabinets are 22-24 inches tall — once you fit the second tier and account for what you are storing, the top tier sits empty or holds things you cannot reach. The HOLDN STORAGE single-tier does the actual work for $40 less.',
      amountSaved: { low: 40, high: 65 },
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_spice_kit_with_jars',
      type: 'wrong_version',
      title: 'SpaceAid bamboo spice drawer with jars + labels kit',
      marketingPitch: 'Complete starter kit, 28 jars and 386 labels',
      realReason:
        'The jars are the upcharge. Standard Penzeys / Trader Joes / store-brand spice jars fit the $25 organizer fine. The kit prices the same organizer at $50+ because of jars you do not need. If your spices are already in jars, buy the organizer alone.',
      amountSaved: { low: 25, high: 30 },
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_kraftmaid_drop_in',
      type: 'wrong_version',
      title: 'KraftMaid (or any cabinet-shop-branded) spice insert',
      marketingPitch: 'Custom fit, perfect drawer match',
      realReason:
        'Makes sense only if you are doing a KraftMaid kitchen install — these are designed for one cabinet brand and dimensioned exactly. If you are retrofitting an existing kitchen, the expandable bamboo fits the same drawers without trim work or template knowledge.',
      amountSaved: { low: 70, high: 95 },
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_williams_sonoma_kit',
      type: 'wrong_version',
      title: 'Williams Sonoma / Crate & Barrel branded organization starter kit',
      marketingPitch: 'Curated set of 12 essential pieces',
      realReason:
        'These kits include 3-4 things you need (cutlery tray, dividers, pantry basket) and 8-9 things you do not (specialty cookbook stand, decorative bin set, branded labels). You pay $180-250 for $90 of useful items. Build your own kit from the lean cart.',
      amountSaved: { low: 90, high: 160 },
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },

    // ===== TYPE B — Wrong category ====================================
    {
      id: 'skip_acrylic',
      type: 'wrong_category',
      title: 'Acrylic everything',
      realReason:
        'Premium clear acrylic looks great in social media photos and yellows in 18 months. Reviews on every acrylic spice rack flag the same thing: it scratches, holds spice dust visibly, and discolors near the stove from heat exposure. The $30 acrylic spice rack becomes a $30 cloudy spice rack. Bamboo and steel age better.',
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_brand_specific_organizers',
      type: 'wrong_category',
      title: 'Made for IKEA or fits Wayfair specialty organizers',
      realReason:
        'These are sized for one cabinet brand and one model line. Most kitchens are not those brands. The fit ranges advertised are aspirational — Tasting Table notes IKEA UTRUSTA baskets need DIY modification to work in non-IKEA cabinets.',
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_fridge_freshness_systems',
      type: 'wrong_category',
      title: 'Shelf-life-extending fridge organization systems',
      realReason:
        'Berry produce keepers, herb tubes, "stays fresh 3x longer" pods — most are tested in lab humidity that does not match a home fridge. Cheaper to wrap herbs in damp paper towels in a regular bin.',
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_subscription_organization',
      type: 'wrong_category',
      title: 'Subscription organization services',
      realReason:
        'Anything that auto-ships you "more organizers" monthly is a category mistake. You do not need refills.',
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_aesthetic_bins_for_active_items',
      type: 'wrong_category',
      title: 'Aesthetic bins for items you use weekly',
      realReason:
        'Bamboo bins with metal handles look great but the items inside become invisible. If you use it weekly, store it where you can see it. Aesthetic bins are for closets, not active kitchens.',
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
    {
      id: 'skip_junk_drawer_kit',
      type: 'wrong_category',
      title: 'Junk drawer kits',
      realReason:
        'A $40 kit of trays for a junk drawer defeats the point of a junk drawer. Buy nothing for that drawer; the chaos is the feature.',
      appliesToScope: ['kitchen_organizers'],
      citations: [],
    },
  ],

  scenarioDefaults: {
    just_starting: {
      selectedTier: 'sweet_spot',
      alreadyHave: [],
    },
    already_have_basics: {
      selectedTier: 'sweet_spot',
      alreadyHave: ['has_cutlery_tray', 'has_drawer_dividers'],
    },
    tight_budget: {
      selectedTier: 'budget',
      alreadyHave: [],
    },
    premium: {
      selectedTier: 'premium',
      alreadyHave: [],
    },
  },
}
