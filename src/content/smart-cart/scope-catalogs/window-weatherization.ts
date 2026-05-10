// V7.2.14 — Window weatherization scope catalog.
//
// Pilot catalog for narrow validation release. Editorial layer only;
// product data lives in src/content/smart-cart/universe.ts. Pairs
// with /guides/window-film-vs-replacement-vermont and the pre-cart
// landing at /smart-cart/topic/window-weatherization-vermont.
//
// Brand thesis: spend $80-$220 to close drafts for one winter and
// decide whether $800-$1,500/window replacement is actually needed.
// Frames are the route-out — visible rot, broken glass, and failed
// sashes do NOT belong in this cart.

import type { ScopeCatalog } from '@/lib/smart-cart-model'

export const WINDOW_WEATHERIZATION: ScopeCatalog = {
  topic: 'weatherization',
  scopeVariantId: 'window_weatherization',
  scenarios: ['just_starting', 'already_have_basics', 'tight_budget', 'absentee_owner'],

  slots: [
    // ---------- SLOT 1: Interior shrink-film window kit ----------
    {
      slotId: 'window_shrink_film_kit',
      slotLabel: 'Interior shrink-film window kit',
      slotKind: 'core',
      conditionalOn: ['has_window_film_current'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['weatherization', 'outdoor'],
          mustHaveFunctions: ['window_shrink_film'],
          mustHaveRoles: ['consumable_material'],
          excludeAlreadyHaveFlag: 'has_window_film_current',
          tier: 'budget',
          limit: 1,
        },
        sweet_spot: {
          mustHaveTopics: ['weatherization', 'outdoor'],
          mustHaveFunctions: ['window_shrink_film'],
          mustHaveRoles: ['consumable_material'],
          excludeAlreadyHaveFlag: 'has_window_film_current',
          tier: 'sweet_spot',
          limit: 1,
        },
        premium: {
          mustHaveTopics: ['weatherization', 'outdoor'],
          mustHaveFunctions: ['window_shrink_film'],
          mustHaveRoles: ['consumable_material'],
          excludeAlreadyHaveFlag: 'has_window_film_current',
          tier: 'premium',
          limit: 1,
        },
      },
      whyThis:
        '3M Indoor or Duck MAX is the verified pick. The film creates a sealed air gap between film and glass — adds R-1 to R-1.5 of insulating value and stops air leakage at the frame. Barely visible when applied correctly. Lasts one winter; remove in spring.',
      whyNotCheaper:
        "Generic store-brand films tear in cold rooms (basement windows, north walls). The marginal cost of Duck MAX or 3M is $5-10 per kit and the failure rate drops noticeably.",
      whyNotPremium:
        "The 10-window pack is for whole-house coverage. If you have a smaller home or are testing the approach on 4-6 windows, the 5-window kit is the right size — premium is bulk pricing, not a better product.",
      contextNote:
        "Apply on a 50-70°F day. Film adheres better in warm rooms; shrink works better when the air can carry the heat from a hair dryer. Don't try to install on a 30°F day in an unheated room.",
      warnings: [
        'Film won\'t bond to wet, moldy, or peeling-paint frames. Inspect before buying.',
      ],
      citations: [
        '3M Indoor Window Insulator Kit product documentation',
        'Duck Brand product line',
        'DOE residential window insulation guidance',
      ],
      slotPurpose:
        'Add an insulating air gap to single-pane or working double-pane windows for one winter. Diagnostic AND mitigation: how the windows perform with film tells you whether replacement is warranted.',
      whyItMatters:
        'A typical leaky double-hung loses 20-40 CFM of conditioned air at 50 Pa. Sealing it with film closes 70-90% of that leakage at $4-8 per window. The marginal energy cost saved usually pays for the film in one winter.',
      commonMistake:
        'Applying film to a window with visible frame rot or a broken sash. The film is a stopgap for sound windows, not a substitute for repair. If the frame is rotted, the air gap is the smaller problem — water in the wall is the bigger one.',
      nextBestIfAlreadyHave: {
        targetSlotOrFunction: 'insulated_curtain',
        reason:
          'Film is on. The next-step gap is thermal curtains for the worst-radiating windows — adds R-2 to R-3 of additional thermal break for north-facing single-pane.',
      },
      whenToSkip: ['Frame is visibly rotted', 'Glass has visibly fogged or failed seal'],
      routeOutOfSmartCartIf: [
        {
          condition: 'has_visible_frame_rot',
          destination: 'small_pro',
          reason: 'Rot in window frames means water is in the wall. Film won\'t fix; window installer is the right scope.',
        },
      ],
    },

    // ---------- SLOT 2: Window weatherstripping ----------
    {
      slotId: 'window_weatherstripping',
      slotLabel: 'Window & door weatherstripping',
      slotKind: 'core',
      conditionalOn: ['has_weatherstripping_recent'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['weatherization', 'outdoor'],
          mustHaveFunctions: ['draft_sealer'],
          mustHaveRoles: ['consumable_material'],
          excludeAlreadyHaveFlag: 'has_weatherstripping_recent',
          tier: 'budget',
          limit: 1,
        },
        sweet_spot: {
          mustHaveTopics: ['weatherization', 'outdoor'],
          mustHaveFunctions: ['draft_sealer'],
          mustHaveRoles: ['consumable_material'],
          excludeAlreadyHaveFlag: 'has_weatherstripping_recent',
          tier: 'sweet_spot',
          limit: 1,
        },
        premium: {
          mustHaveTopics: ['weatherization', 'outdoor'],
          mustHaveFunctions: ['draft_sealer'],
          mustHaveRoles: ['consumable_material'],
          excludeAlreadyHaveFlag: 'has_weatherstripping_recent',
          tier: 'premium',
          limit: 1,
        },
      },
      whyThis:
        "Cross-scope reuse from outdoor_freeze_prevention. Frost King V-strip kit is the verified pick — V-channel for window sashes, door sweep, and draft stoppers in one box. Covers a typical 3-door, 8-window Vermont home.",
      whyNotCheaper:
        "Foam compression tape is the budget option and works for one season. The V-strip lasts 3-5 years with proper installation; the cost difference is $15-25.",
      whyNotPremium:
        "Silicone bulb seals are premium-durable and right for high-use exterior doors, but overkill for windows that only see seasonal use.",
      contextNote:
        "Clean the surface with denatured alcohol before applying weatherstrip. Adhesive bonds 80% better on a degreased surface, and the strip lasts 2-3x longer.",
      citations: [
        'Cross-scope universe reuse pattern',
        'Frost King product line',
        'DOE residential weatherstripping guidance',
      ],
      slotPurpose: 'Seal the gaps between window sash and frame, between door and jamb, where the weatherstripping has worn out or never existed.',
      whyItMatters:
        "Most pre-1990 windows have weatherstripping that crumbled within 5-10 years and was never replaced. The original gap returns; air leaks resume. New weatherstripping is the cheapest meaningful fix.",
    },

    // ---------- SLOT 3: Sash sealant + smoothing tool ----------
    {
      slotId: 'window_sash_sealant',
      slotLabel: 'Removable seasonal caulk + smoothing tool',
      slotKind: 'core',
      conditionalOn: ['has_seasonal_caulk'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['weatherization'],
          mustHaveFunctions: ['weatherization_caulk'],
          mustHaveRoles: ['consumable_material'],
          excludeAlreadyHaveFlag: 'has_seasonal_caulk',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "DAP Seal 'N Peel is the seasonal-removable caulk most pros recommend for windows that need to operate in summer. Peels off cleanly in spring without damaging paint. Two tubes typically cover an 8-window house.",
      whyNotCheaper: 'Standard 100% silicone is permanent and doesn\'t come off without paint damage. The removable version is the right product for windows you want to open in summer.',
      whyNotPremium: 'Pro-grade urethane caulks are overkill for seasonal windows and don\'t peel off cleanly.',
      contextNote:
        "Apply along the bottom rail and meeting rail of the sash from the inside. The caulk seals the gap between the operable sash and the fixed frame for the cold season; you peel it off and the window opens normally in spring.",
      citations: ["DAP Seal 'N Peel product datasheet"],
      slotPurpose: 'Seal the operable joints of a window for winter without committing to permanent caulk that prevents the window from opening.',
      whyItMatters:
        'On older double-hungs, the largest air leaks are often at the meeting rail and bottom rail of the sash itself — gaps that weatherstripping can\'t reach. Removable caulk seals these for the season.',
      commonMistake:
        'Using permanent silicone caulk instead of removable. The window can\'t open in summer, and trying to peel it off later damages paint and woodwork.',
    },

    // ---------- SLOT 4: Draft detector / smoke pencil ----------
    {
      slotId: 'window_draft_detector',
      slotLabel: 'Smoke pencil + IR thermometer diagnostic kit',
      slotKind: 'addon',
      conditionalOn: ['has_draft_detector'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['weatherization', 'home_repair'],
          mustHaveFunctions: ['draft_detector'],
          mustHaveRoles: ['measurement_tool'],
          excludeAlreadyHaveFlag: 'has_draft_detector',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        'Combined kit reveals air movement (smoke pencil) AND surface temperature (IR thermometer) for $25-50. Tells you which problem each window has — air leak, conductive cold, or both — before you decide where to spend.',
      whyNotCheaper:
        'A $5 stick of incense substitutes for the smoke pencil. The IR thermometer matters more — distinguishes single-pane from failed-IGU from working double-pane.',
      whyNotPremium:
        'Thermal imaging cameras are $200-400 and reveal the same information as a $30 IR thermometer for residential window diagnosis. Worth it for pros, not for one-time DIY.',
      contextNote:
        'Test on a windy day or with the bath fan running (depressurizes the house and exaggerates leaks). Dead-calm days hide leaks even at problem windows.',
      citations: [
        'Building science blower-door diagnostic methodology',
        'IR thermometer building diagnostic use',
      ],
      slotPurpose: 'Diagnose each window before buying anything. Identifies which windows weatherize, which need replacement, and which can wait.',
      whyItMatters:
        'Without diagnosis, you spend on the wrong fix at the wrong window. The kit is $25-50; misdiagnosis at one window can cost $1,500 in unneeded replacement or $200 in unneeded film. Worth running before buying anything.',
    },

    // ---------- SLOT 5: Insulated curtain / thermal liner ----------
    {
      slotId: 'window_insulated_curtain',
      slotLabel: 'Insulated curtain or thermal liner (functional)',
      slotKind: 'addon',
      conditionalOn: ['has_thermal_curtains'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['weatherization', 'outdoor', 'home_repair'],
          mustHaveFunctions: ['insulated_curtain'],
          mustHaveRoles: ['textile'],
          excludeAlreadyHaveFlag: 'has_thermal_curtains',
          tier: 'budget',
          limit: 1,
        },
        sweet_spot: {
          mustHaveTopics: ['weatherization', 'outdoor', 'home_repair'],
          mustHaveFunctions: ['insulated_curtain'],
          mustHaveRoles: ['textile'],
          excludeAlreadyHaveFlag: 'has_thermal_curtains',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        'Triple-weave thermal-insulated curtains add R-2 to R-3 when closed. Best deployed at the worst-radiating windows (single-pane, north-facing). Closes the radiant heat loss that film can\'t fully address on cold glass.',
      whyNotCheaper:
        "Standard non-thermal curtains do almost nothing for heat loss. The thermal lining is the actual product.",
      whyNotPremium:
        "Designer thermal curtains at $150-300/window are the same R-value as $40 NICETOWN — you're paying for fabric appearance, not thermal performance.",
      contextNote:
        "Close them at sunset, open them at sunrise. The curtain only insulates when closed; leaving them open at night defeats the point.",
      citations: ['DOE window covering thermal performance', 'NICETOWN thermal curtain testing'],
      slotPurpose: 'Add a second layer of thermal break at the worst-radiating windows.',
      whyItMatters:
        "Single-pane glass is roughly R-1. Thermal curtain adds R-2 to R-3 when closed. For 12 hours/night during a Vermont winter, that's a meaningful comfort improvement at $30-140/window.",
    },

    // ---------- SLOT 6: Interior storm panel (addon, premium) ----------
    {
      slotId: 'window_interior_storm',
      slotLabel: 'Interior storm panel (one priority window)',
      slotKind: 'addon',
      conditionalOn: ['has_interior_storm_panel'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['weatherization', 'outdoor', 'home_repair'],
          mustHaveFunctions: ['interior_storm_panel'],
          mustHaveRoles: ['preventer'],
          excludeAlreadyHaveFlag: 'has_interior_storm_panel',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "DIY magnetic-frame acrylic interior storm panel for the worst single-pane window in the house — typically a north-facing single-pane in a long-term residence. Lower cost than custom Indow inserts ($400+); much higher performance than film alone.",
      whyNotCheaper:
        "Film alone closes most drafts. Adding an interior storm panel only makes sense for a long-term home where the worst window is single-pane and replacement is years away.",
      whyNotPremium:
        "Custom acrylic Indow inserts run $400-700/window. The DIY magnetic panel at $80-180 is 80% of the performance for 30% of the cost. Indow is right for whole-house premium, not for one-window stopgap.",
      contextNote:
        "Best deployed on the worst window only. Adding storm panels to every window is the wrong scope — at that scale, replacement is closer in cost.",
      citations: ['DIY interior storm panel comparisons', 'DOE storm window guidance'],
      slotPurpose: 'A semi-permanent interior storm for the worst single-pane window — when film + curtain isn\'t enough but replacement isn\'t happening yet.',
      whyItMatters:
        "Adds roughly R-2 to R-3 of insulating value (similar to a thermal curtain) but works without closing the curtain. Useful when the window is in a frequently-used room and natural light matters.",
    },
  ],

  skipList: [
    {
      id: 'skip_indow_premium_inserts_no_test',
      type: 'wrong_version',
      title: 'Custom acrylic Indow inserts before testing if film does the job',
      marketingPitch: '"Acoustic + thermal insert that looks invisible."',
      realReason:
        "Indow inserts run $400-700/window installed. They're a real product but the wrong starting point — film at $4-8/window closes 70-80% of the same air leakage. Use film for one winter; if the issue is genuinely conductive (cold radiating off the glass) and you want a permanent indoor solution, Indow is the upgrade. Most Vermont buyers find film does enough.",
      // v7.2.15 — capped to a credible single-window overbuy. The $400-700
      // Indow upside per window is real, but the "buyer was about to do
      // every window" framing is closer to project-deferral copy than to
      // an avoided-overbuy claim.
      amountSaved: { low: 200, high: 400 },
      appliesToScope: ['window_weatherization'],
      citations: ['Indow product documentation', 'Window film vs interior storm comparison'],
    },
    {
      id: 'skip_designer_thermal_curtains',
      type: 'wrong_version',
      title: 'Designer thermal curtains at $150-300/window',
      marketingPitch: 'Premium thermal curtains in designer fabrics.',
      realReason:
        "Designer thermal curtains are sold at 3-5x the price of NICETOWN or Rose Home Fashion at the same R-value. The thermal performance is identical — you're paying for fabric appearance and brand. If the room is high-visibility (living room, primary bedroom), spend the upgrade on the sweet-spot tier; if it's a back room, the budget tier is the same R-value.",
      amountSaved: { low: 80, high: 200 },
      appliesToScope: ['window_weatherization'],
      citations: ['Thermal curtain R-value comparison', 'DOE window covering performance'],
    },
    {
      id: 'skip_premium_weatherstrip_5x_markup',
      type: 'wrong_version',
      title: 'Premium "energy-saver" weatherstripping at 5x the price of basic V-strip',
      marketingPitch: '"Pro-grade energy-sealing weatherstripping system."',
      realReason:
        "Big-box premium weatherstripping kits at $50-100 are basic V-strip and door sweep with marketing. The Frost King kit at $25-40 is the same product family. Save the difference for a sweet-spot product elsewhere in the cart.",
      amountSaved: { low: 25, high: 60 },
      appliesToScope: ['window_weatherization'],
      citations: ['Weatherstripping price-vs-performance analysis'],
    },
    {
      // v7.2.15 — recategorized as wrong_category (no amountSaved). The
      // dollar value here belongs to project deferral, not avoided
      // overbuying on this $19.99 cart. Surfaced via DEFERRAL_COPY in the
      // value banner instead.
      id: 'skip_replacement_no_diagnosis',
      type: 'wrong_category',
      title: 'Whole-house window replacement before diagnosing each window',
      realReason:
        "A $10,000 whole-house replacement quote treats every window as identical. In a typical Vermont pre-1990 home, 60-80% of windows are leaky-but-intact (weatherize) and 20-40% are genuinely past saving (replace). Diagnose first; the same money on selective replacement plus weatherization on the rest goes 2-3x further.",
      appliesToScope: ['window_weatherization'],
      citations: ['Selective vs whole-house replacement economics'],
    },
    {
      id: 'skip_thermal_imaging_camera_diy',
      type: 'wrong_version',
      title: 'Buying a thermal imaging camera for one-time diagnosis',
      marketingPitch: '"See every air leak in HD thermal."',
      realReason:
        "Thermal imaging cameras run $200-400 for residential-grade. For a one-time DIY window diagnosis, the $25-50 IR thermometer + smoke pencil kit reveals the same information. Cameras are right for pros doing this weekly; not right for a single-house DIY pass.",
      amountSaved: { low: 175, high: 375 },
      appliesToScope: ['window_weatherization'],
      citations: ['IR thermometer vs thermal camera for residential diagnosis'],
    },
    {
      id: 'skip_film_over_failed_igu',
      type: 'wrong_category',
      title: 'Shrink film applied over a failed double-pane (visible fogging)',
      realReason:
        "Failed IGUs (insulated glass units with visible fog between panes) have lost their insulating gas fill. The R-value has dropped from R-3 to R-1.5 or worse. Film adds R-1 to R-1.5 on top — net R-2.5, still well below working double-pane. The right scope is sash repair or window replacement; film is masking, not solving.",
      appliesToScope: ['window_weatherization'],
      citations: ['Failed IGU thermal performance'],
    },
    {
      id: 'skip_caulk_window_sashes_with_silicone',
      type: 'wrong_category',
      title: 'Permanent silicone caulk on operable window sashes',
      realReason:
        "100% silicone caulk is permanent and doesn't come off without paint damage. Caulking the meeting rail or bottom rail of a sash with silicone seals the window shut for the rest of its life. Use removable seasonal caulk (DAP Seal 'N Peel) for any joint that needs to operate. Permanent caulk is for fixed-frame joints only.",
      appliesToScope: ['window_weatherization'],
      citations: ['Silicone vs removable caulk for window applications'],
    },
    {
      id: 'skip_replacement_before_weatherization',
      type: 'wrong_category',
      title: 'Replacing windows before doing the EVT energy audit',
      realReason:
        "Efficiency Vermont's audit identifies the highest-payback weatherization scope, which on most pre-1990 Vermont homes is rim joist sealing, attic plate sealing, and attic insulation — NOT window replacement. Replacing windows first usually means oversizing the heat pump that follows and overspending on a low-payback scope. Get the audit; sequence the projects by payback.",
      appliesToScope: ['window_weatherization'],
      citations: ['EVT Home Performance program scope-priority guidance'],
    },
  ],

  scenarioDefaults: {
    just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
    already_have_basics: {
      selectedTier: 'sweet_spot',
      alreadyHave: ['has_weatherstripping_recent'],
    },
    tight_budget: { selectedTier: 'budget', alreadyHave: [] },
    absentee_owner: { selectedTier: 'sweet_spot', alreadyHave: [] },
  },

  smartCartPromise:
    'Spend $80-$220 to close window drafts for one winter — before deciding whether $800-$1,500/window replacement is actually needed.',
  primaryCustomerPain:
    "Vermont winters expose every weak window. The instinct is to replace, but most pre-1990 Vermont windows have intact frames and air-leak problems that weatherization fixes for one winter at a fraction of the replacement cost.",
  valueProposition:
    "A $80-$220 weatherization kit closes 70-90% of the felt drafts on most pre-1990 Vermont windows for one winter — and tells you which windows are genuinely past saving and which can ride another decade.",
  routeOutRules: [
    {
      condition: 'has_visible_frame_rot',
      destination: 'small_pro',
      reason:
        "Rot in window frames or sashes means water has been getting into the wall. Weatherization is the wrong scope; window replacement plus careful flashing is the right answer. Hire a window installer.",
    },
    {
      condition: 'has_broken_glass_or_failed_sash',
      destination: 'small_pro',
      reason:
        "Broken glass, failed sash, or non-operable window is repair or replacement territory, not weatherization. Hire a window installer or repair specialist.",
    },
    {
      condition: 'single_pane_long_term_residence',
      destination: 'verify_first',
      reason:
        "Single-pane in a long-term primary residence where comfort and resale are real goals — weatherization is a stopgap, not a permanent solution. Get a replacement or storm-window quote alongside the cart, and decide whether the comfort premium is worth $800-$1,500/window over the next decade.",
    },
  ],

  seasonalUrgency: {
    season: 'pre-winter',
    deadline: '11-15',
    label: 'Apply before mid-November for full-winter benefit',
  },
}
