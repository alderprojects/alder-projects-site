// V7.2.4 — Trimmed kitchen_cosmetic_refresh scope catalog.
//
// Editorial layer only. Product data lives in universe.ts. The
// pulls / knobs / hinges (budget + sweet_spot) tier queries resolve
// to the same universe entries as kitchen_cabinet_hardware_swap —
// both scopes share the Liberty bar pulls, Amerock, Liberty Harmon,
// generic round knobs, generic concealed hinges, and Blum Compact.
// The premium Blum Clip Top Blumotion is unique to this scope.
//
// Migrated from scripts/source-catalogs/kitchen-cosmetic-refresh.ts.
// All slot ordering, conditionalOn flags, prose, warnings, and skip
// list content preserved verbatim.

import type { ScopeCatalog } from '@/lib/smart-cart-model'
import { FN } from '../universe'

export const KITCHEN_COSMETIC_REFRESH: ScopeCatalog = {
  topic: 'kitchen',
  scopeVariantId: 'kitchen_cosmetic_refresh',
  scenarios: ['just_starting', 'already_have_basics', 'tight_budget', 'premium'],

  slots: [
    // ---------- SLOT 1: Cabinet paint -----------------------------
    {
      slotId: 'kitchen_cabinet_paint',
      slotLabel: 'Cabinet enamel paint (1 gallon)',
      slotKind: 'core',
      conditionalOn: ['has_painted_cabinets_recently'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetPaint],
          excludeAlreadyHaveFlag: 'has_painted_cabinets_recently',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetPaint],
          excludeAlreadyHaveFlag: 'has_painted_cabinets_recently',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.cabinetPaint],
          excludeAlreadyHaveFlag: 'has_painted_cabinets_recently',
          tier: 'premium',
        },
      },
      whyThis:
        'INSL-X is the cabinet-paint sweet spot. Made by Benjamin Moore but sold through Amazon at consistent stock, with the no-primer-needed adhesion that saves a full prep step. Reviewers report factory-like finish with one product instead of three.',
      whyNotCheaper:
        'Behr alkyd enamel works but reviewers consistently flag tackiness 2 weeks after painting and drawer fronts sticking together when reinstalled. The save is $30-40, but you accept a longer cure window and a real risk of having to redo the doors that stick.',
      whyNotPremium:
        'Benjamin Moore Advance tests neck-and-neck with INSL-X on durability, but Advance is sold mainly through BM dealers (limited Amazon stock) and requires a separate primer for slick surfaces. INSL-X gives you the same quality finish without the primer step, and Amazon shipping is reliable.',
      warnings: [
        'Stir thoroughly — both INSL-X and Advance separate during shipping',
        'Wait 14-21 days before reinstalling doors. Curing not the same as drying.',
        'Apply between 50-90°F. Cold basement application leads to soft finish.',
      ],
      contextNote:
        'A typical 10x12 kitchen needs 1 gallon for 2 coats. Larger kitchens or full upper+lower repaint may need 1.5-2 gallons.',
      citations: [
        'Reviewed.com 2026 Best Cabinet Paint roundup',
        'Brackens Painting (4-generation paint pro) cabinet paint guide',
        'Renovated Faith 24-brand blind test (BM Advance overall winner)',
        'Greathomedepot.com INSL-X Cabinet Coat hands-on review',
      ],
    },

    // ---------- SLOT 2: Bonding primer ----------------------------
    {
      slotId: 'kitchen_bonding_primer',
      slotLabel: 'Bonding primer (1 gallon)',
      slotKind: 'core',
      conditionalOn: ['has_bare_wood_cabinets', 'painting_with_inslx'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.bondingPrimer],
          excludeAlreadyHaveFlag: 'has_bare_wood_cabinets',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.bondingPrimer],
          excludeAlreadyHaveFlag: 'has_bare_wood_cabinets',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.bondingPrimer],
          excludeAlreadyHaveFlag: 'has_bare_wood_cabinets',
          tier: 'premium',
        },
      },
      whyThis:
        'Stix is the slot to spend on if your cabinets are glossy, slick laminate, or previously oiled. Saves a full sanding step and bonds in one coat.',
      whyNotCheaper:
        'KILZ Adhesion works but reviewers flag spotty coverage on glossy surfaces — you end up doing 2 coats which negates the save.',
      whyNotPremium:
        'Zinsser BIN is the right call ONLY if your cabinets are oak or knotty pine bleeding tannins through the paint. For most kitchens (maple, painted, MDF), BIN is overkill at $15 more.',
      warnings: [
        'Skip this slot if your cabinets are bare wood AND sanded — INSL-X Cabinet Coat applies directly',
        'Stix needs 1 hour to dry; do not topcoat sooner',
      ],
      citations: [
        'INSL-X Stix product datasheet',
        'cathleendavittbell.com Stix Primer review thread',
      ],
    },

    // ---------- SLOT 3: Cabinet pulls (shares with hardware_swap) -
    {
      slotId: 'kitchen_cabinet_pulls',
      slotLabel: 'Cabinet pulls (10-pack)',
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
        'Amerock is the value-per-dollar pick. Substantial enough to feel quality in-hand, threading stays tight after years of use. Most-recommended pull across professional design forums.',
      whyNotCheaper:
        "Liberty pulls work fine and look the same on the cabinet. The visible difference is in the threading — Liberty's tends to wobble loose after 3-5 years of daily use. You'll be retightening pulls every 6 months.",
      whyNotPremium:
        'Top Knobs is solid steel with authentic premium feel in-hand. Beautiful. The Houzz pro consensus: "When the door handle is on the cabinet you\'d be hard pressed to tell the difference." For a 16-pull kitchen, that\'s $200+ paid for in-hand quality only you can detect.',
      warnings: [
        'Measure existing pull-spread first. Common sizes: 3", 3-3/4", 5-1/16", 6-5/16". Wrong size = redrill.',
        'Buy 1-2 extra pulls beyond your count for spares.',
      ],
      citations: [
        'Houzz forum thread "Cabinet Hardware—cheap vs. expensive"',
        'Bob Vila Best Cabinet Hardware 2025 roundup',
        'Property Nest 9 Best Kitchen Cabinet Hardware Brands 2024',
      ],
    },

    // ---------- SLOT 4: Cabinet knobs (shares with hardware_swap) -
    {
      slotId: 'kitchen_cabinet_knobs',
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
        'Liberty Harmon is the most-reviewed cabinet knob at this tier with consistent positive feedback for finish quality. Best value-per-dollar in the category.',
      whyNotCheaper:
        "Generic Amazon knobs (e.g. $9 for 6) work but the finishes aren't UV-stable. 18 months in a window-lit kitchen and matte black goes patchy.",
      whyNotPremium:
        'Top Knobs and Anthropologie/Pottery Barn knobs ($15-30 each) are aesthetic statements. If you want a statement, do 2-4 accent knobs (kitchen island only) and use Liberty for the rest.',
      citations: [
        'Bob Vila Best Cabinet Hardware roundup (Liberty Harmon: 1,200+ Home Depot 5-star reviews)',
        'Cathleen Davitt Bell hardware comparison',
      ],
    },

    // ---------- SLOT 5: Soft-close hinges -------------------------
    {
      slotId: 'kitchen_softclose_hinges',
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
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.softCloseHinge],
          excludeAlreadyHaveFlag: 'has_softclose_hinges',
          tier: 'premium',
        },
      },
      whyThis:
        "Blum hinges are the cabinet-shop standard. The damper lasts the lifetime of the kitchen. Generic hinges fail in 12-18 months and you're replacing them anyway.",
      whyNotCheaper:
        "Generic soft-close hinges work for 12-18 months then the dampers fail. You're back to slamming doors and replacing the hinges twice in 5 years.",
      whyNotPremium:
        'Clip Top Blumotion saves install time (tool-less clip vs screws) but the time savings on a 12-hinge install is 30-45 minutes. For a one-time DIY job, the screwdown version is the right tier.',
      warnings: [
        'Measure existing hinges before ordering. European cup hinges (35mm) and face-frame hinges are NOT interchangeable.',
        'Take an existing hinge to the store or photograph it next to a ruler.',
      ],
      citations: [
        'Blum hardware product datasheet',
        'IKEA UTRUSTA cabinet documentation references',
        'Pro forum consensus on Blum vs generic',
      ],
    },

    // ---------- SLOT 6: Under-cabinet lighting --------------------
    {
      slotId: 'kitchen_undercabinet_lighting',
      slotLabel: 'Under-cabinet LED strip lighting (plug-in, 10ft)',
      slotKind: 'core',
      conditionalOn: ['has_undercabinet_lighting'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.undercabinetLighting],
          excludeAlreadyHaveFlag: 'has_undercabinet_lighting',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.undercabinetLighting],
          excludeAlreadyHaveFlag: 'has_undercabinet_lighting',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.undercabinetLighting],
          excludeAlreadyHaveFlag: 'has_undercabinet_lighting',
          tier: 'premium',
        },
      },
      whyThis:
        'Wobane is the Wirecutter / Bob Vila pick at this tier. Easy DIY install, dimmable, replaceable LED segments. 5-year typical lifespan vs 6-12 months for the cheap strips.',
      whyNotCheaper:
        'Generic $15 LED strips work for 6-12 months then sections fail randomly. The adhesive backing also peels in kitchen humidity within a year.',
      whyNotPremium:
        "Hardwired GE bars are the polished install but require an electrician (~$200-400 of labor) or real DIY electrical skill. The visual difference at night is the absence of a cord — not worth $300+ unless you're refacing the kitchen anyway.",
      warnings: [
        'Use warm color temp (2700-3000K), not cool (5000K+). Cool light makes maple cabinets look gray-green.',
        'Do not run cord across cooking surface or near sink without proper rating.',
      ],
      citations: [
        'Bob Vila Best Under-Cabinet Lighting 2026 roundup',
        'Lumaz hardwired-vs-plug-in guide',
        'PROLIGHTING fixture installation guide',
      ],
    },

    // ---------- SLOT 7: Caulk -------------------------------------
    {
      slotId: 'kitchen_caulk_kit',
      slotLabel: 'Kitchen-rated caulk + caulking gun',
      slotKind: 'core',
      conditionalOn: [],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.kitchenCaulk],
          tier: 'sweet_spot',
        },
      },
      whyThis:
        'DAP Alex Plus is paintable (so you can match cabinet paint over the seam) AND mildew-resistant. Steel gun is reusable for life — skip the plastic ones.',
      whyNotCheaper:
        'No real cheaper tier. Skipping caulk entirely is a category mistake — water gets behind the backsplash and ruins drywall.',
      whyNotPremium:
        "GE 100% Silicone II Kitchen ($12-15) is technically superior for moisture but it's NOT paintable. If you want to repaint trim later, you're stripping silicone first.",
      citations: [
        'DAP product datasheet',
        'Pro caulking guide consensus',
      ],
    },

    // ---------- SLOT 8: Painting supplies -------------------------
    {
      slotId: 'kitchen_painting_supplies',
      slotLabel: 'Painting supplies (consumables)',
      slotKind: 'core',
      conditionalOn: [],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.paintingSupplies],
          tier: 'sweet_spot',
        },
      },
      whyThis:
        "Cheap brushes shed bristles into your cabinet enamel. Every shed bristle is an artifact you'll see for the next 10 years. Wooster Shortcut is the verified pro brush at this tier.",
      whyNotCheaper:
        "Plastic drop cloths tear and don't absorb spills. Generic brushes shed.",
      whyNotPremium:
        'Festool sander + premium brush set is craftsman tier — for one project, $200 of overkill for $40 of work.',
      citations: [
        'Wooster product line review consensus',
        'DIY painting tool guides',
      ],
    },

    // ---------- SLOT 9: Drawer slides -----------------------------
    {
      slotId: 'kitchen_drawer_slides',
      slotLabel: 'Cabinet drawer slides (5-pair, full extension)',
      slotKind: 'core',
      conditionalOn: ['drawers_already_full_extension', 'no_drawer_issues'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.drawerSlide],
          excludeAlreadyHaveFlag: 'drawers_already_full_extension',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.drawerSlide],
          excludeAlreadyHaveFlag: 'drawers_already_full_extension',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['kitchen'],
          mustHaveFunctions: [FN.drawerSlide],
          excludeAlreadyHaveFlag: 'drawers_already_full_extension',
          tier: 'premium',
        },
      },
      whyThis:
        'Blum Tandem is the cabinet-shop standard. Drop-in compatible with most cabinets manufactured after 1995.',
      whyNotCheaper:
        "Generic side-mount slides bow under load (heavy pots in lower drawers). 18 months and you're hitting the cabinet bottoms.",
      whyNotPremium:
        'Movento is invisible from outside the drawer — beautiful but cabinet-shop install. Worth it on a kitchen rebuild, not on a refresh.',
      warnings: [
        'Skip this slot if your existing drawers are full-extension and not sagging. Most cabinets manufactured after 1995 already have decent slides.',
      ],
      citations: [
        'Blum Tandem product datasheet',
        'Pro cabinet shop forum standards',
      ],
    },
  ],

  // ---------- Skip list — verbatim from source -----------------------
  skipList: [
    {
      id: 'skip_top_knobs_designer_pulls',
      type: 'wrong_version',
      title: 'Top Knobs / Anthropologie / Rejuvenation designer pulls (when Amerock works)',
      marketingPitch: 'The jewelry of the kitchen. These elevate the whole room.',
      realReason:
        'For a 16-pull kitchen, swapping Amerock ($55) to Top Knobs ($240) for the same matte black bar pull profile is $185 paid for in-hand quality difference invisible from 3 feet away. The Houzz pro consensus on a $200 hardware decision: "When the door handle is on the cabinet you\'d be hard pressed to tell the difference."',
      amountSaved: { low: 140, high: 220 },
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['Houzz forum thread on cabinet hardware tiers', 'Bob Vila best cabinet hardware 2025'],
    },
    {
      id: 'skip_behr_marquee_for_cabinets',
      type: 'wrong_version',
      title: 'Behr Marquee or Premium Plus Ultra for cabinets',
      marketingPitch: 'One-coat coverage, lifetime warranty, made for trim.',
      realReason:
        "Marquee is a wall paint — it doesn't cure to enamel hardness. Cabinet doors get touched daily; wall paint scuffs and shows fingerprints within weeks. The Behr line that actually works on cabinets is their Cabinet & Trim Enamel (alkyd), not the wall paints. Save $20 vs INSL-X but you accept a real risk of having to repaint within 2 years.",
      amountSaved: { low: 20, high: 35 },
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['Brackens Painting cabinet paint guide', 'Reviewed.com 2026 best cabinet paint testing'],
    },
    {
      id: 'skip_smart_lighting_kit',
      type: 'wrong_version',
      title: 'Smart-controlled "kitchen lighting kits" (Philips Hue, Lutron Caseta with kitchen bundle)',
      marketingPitch: 'Voice-controlled, dimmable, app-driven kitchen mood lighting.',
      realReason:
        "$200-300 for a kit that requires hub setup, app pairing, and a learning curve every guest at your house has to redo. The Wobane plug-in dimmable strip with a wall switch dimmer ($28 + $15 dimmer) does 90% of what you actually want for $200+ less. Smart lighting earns its place in living rooms; in kitchens you're flipping a switch on the way in and off on the way out.",
      amountSaved: { low: 130, high: 240 },
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['Wobane vs smart lighting comparison consensus'],
    },
    {
      id: 'skip_cabinet_transformations_kit',
      type: 'wrong_version',
      title: 'Rust-Oleum Cabinet Transformations kit (or similar all-in-one kits)',
      marketingPitch: 'Complete kit, no priming, no sanding, transform your cabinets in a weekend.',
      realReason:
        'These kits work — the trap is the kit pricing. The sandpaper, primer, paint, and topcoat in the kit retail for $90-120 if bought separately as the brand-name versions. The kit at $150-200 is convenience pricing for items you should size correctly anyway. 1-quart kit covers ~50 sq ft; most kitchens need 100-150 sq ft.',
      amountSaved: { low: 50, high: 90 },
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['Rust-Oleum product line vs component pricing analysis'],
    },
    {
      id: 'skip_cabinet_specific_topcoat',
      type: 'wrong_version',
      title: 'Specialty "kitchen-rated" topcoat or sealer for cabinet paint',
      marketingPitch: 'Engineered for kitchen humidity and grease.',
      realReason:
        'INSL-X Cabinet Coat and Benjamin Moore Advance both cure to enamel hardness — they don\'t need a topcoat. Adding a "kitchen-specific" topcoat from the same store is brand-extension product engineering. Skip the $25-40 sealer. If your paint isn\'t durable enough on its own, you bought the wrong paint.',
      amountSaved: { low: 25, high: 45 },
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['INSL-X product datasheet (enamel cures hard, no topcoat needed)'],
    },
    {
      id: 'skip_peel_stick_backsplash',
      type: 'wrong_category',
      title: 'Peel-and-stick "subway tile" backsplashes',
      realReason:
        "The Pinterest photo looks great. Reality: discolors at corners within 18 months from kitchen humidity, the grout-look detail flattens visibly, traps grease in a way real ceramic doesn't. Real subway tile DIY install is 1-2 weekends and $200-300 for materials — not 10x harder than peel-and-stick.",
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['DIY backsplash forum consensus on peel-and-stick longevity'],
    },
    {
      id: 'skip_fluorescent_undercabinet',
      type: 'wrong_category',
      title: 'Fluorescent under-cabinet "task lighting" tubes',
      realReason:
        "Even on clearance. They flicker, color rendering is poor (CRI < 80), and most modern dimmers won't run them. LED is universally better at 2026 prices.",
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['LED vs fluorescent task lighting comparison'],
    },
    {
      id: 'skip_cabinet_decals_vinyl_wraps',
      type: 'wrong_category',
      title: 'Cabinet door decals or vinyl wraps',
      realReason:
        "Lift at corners within 2 months in kitchen humidity. Printed wood-grain doesn't match cabinets next to them. Either paint or live with what you have.",
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['DIY cabinet refacing forum consensus'],
    },
    {
      id: 'skip_paint_cabinet_hardware',
      type: 'wrong_category',
      title: 'Painting your existing cabinet hardware to "save the cost of replacement"',
      realReason:
        "YouTube tutorials show this. Hardware paint chips at every grip point within 3-6 months because it's a high-touch surface. Just buy the $40 set of new pulls.",
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['DIY hardware painting forum failure reports'],
    },
    {
      id: 'skip_handleless_conversion_kit',
      type: 'wrong_category',
      title: 'Premium edge-pull / "handleless" cabinet conversion kits',
      realReason:
        "$300-500 for kits that retrofit existing cabinets into integrated-pull style. They don't work on framed cabinets (most US kitchens). If you actually want this look, it's a full cabinet replacement, not a refresh.",
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['European cabinet style retrofit forum analysis'],
    },
    {
      id: 'skip_wax_pen_scratch_repair',
      type: 'wrong_category',
      title: 'Specialty "refinishing" wax pens for scratch repair',
      realReason:
        'Marketed for "perfectly matching your cabinet color." They don\'t. Oxidize to a slightly different shade than original within 6 months. If you have scratches, plan to repaint anyway.',
      appliesToScope: ['kitchen_cosmetic_refresh'],
      citations: ['Wax pen scratch repair user reports'],
    },
  ],

  scenarioDefaults: {
    just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
    already_have_basics: {
      selectedTier: 'sweet_spot',
      alreadyHave: [
        'has_satisfactory_pulls',
        'has_satisfactory_knobs',
        'has_undercabinet_lighting',
      ],
    },
    tight_budget: { selectedTier: 'budget', alreadyHave: [] },
    premium: { selectedTier: 'premium', alreadyHave: [] },
  },

  // v7.2.14: scope-level metadata added to legacy v7.2.3 catalog.
  smartCartPromise:
    'Spend $80-$220 to refresh the kitchen with paint, hardware, and lighting — no remodel.',
  primaryCustomerPain:
    'The kitchen feels dated, but a remodel is years away or out of scope. Most homeowners either live with it or overspend on a half-measure.',
  valueProposition:
    'A Saturday-DIY pass on cabinets, pulls, and undercabinet lighting buys 5-10 more years of comfort with the existing kitchen for under $250 — vs. the $15-30k remodel later.',
  routeOutRules: [
    {
      condition: 'cabinets_water_damaged_or_warped',
      destination: 'small_pro',
      reason:
        "Damaged cabinets won't take paint cleanly. If sides are bowed or doors are warped, refresh won't hide it — refacing or replacement is the right scope.",
    },
    {
      condition: 'planning_kitchen_remodel',
      destination: 'verify_first',
      reason:
        "If you're planning a full remodel within 12 months, refresh dollars are mostly wasted. Skip the cosmetic round.",
    },
  ],
}
