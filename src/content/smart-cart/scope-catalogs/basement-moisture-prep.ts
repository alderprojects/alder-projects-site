// V7.2.14 — Basement moisture prep scope catalog.
//
// Pilot catalog for narrow validation release. Diagnostic kit, NOT a
// repair kit. Editorial layer only; product data lives in
// src/content/smart-cart/universe.ts. Pairs with the guide at
// /guides/before-finishing-basement-moisture-checks-vermont and the
// pre-cart landing at /smart-cart/topic/basement-moisture-prep.
//
// Brand thesis: a $80-$300 diagnostic kit tells you whether the
// basement is dry enough to finish before you commit $20-$50k to
// the finish project. Active water, visible mold, and structural
// foundation issues route OUT of the cart to specialists.

import type { ScopeCatalog } from '@/lib/smart-cart-model'

export const BASEMENT_MOISTURE_PREP: ScopeCatalog = {
  topic: 'home_repair',
  scopeVariantId: 'basement_moisture_prep',
  scenarios: ['just_starting', 'already_have_basics', 'tight_budget', 'absentee_owner'],

  slots: [
    // ---------- SLOT 1: Hygrometer ----------
    {
      slotId: 'basement_hygrometer',
      slotLabel: 'Digital hygrometer (humidity monitor)',
      slotKind: 'core',
      conditionalOn: ['has_hygrometer'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['home_repair'],
          mustHaveFunctions: ['hygrometer'],
          mustHaveRoles: ['sensor', 'monitor', 'measurement_tool'],
          excludeAlreadyHaveFlag: 'has_hygrometer',
          tier: 'budget',
          limit: 1,
        },
        sweet_spot: {
          mustHaveTopics: ['home_repair'],
          mustHaveFunctions: ['hygrometer'],
          mustHaveRoles: ['sensor', 'monitor', 'measurement_tool'],
          excludeAlreadyHaveFlag: 'has_hygrometer',
          tier: 'sweet_spot',
          limit: 1,
        },
        premium: {
          mustHaveTopics: ['home_repair'],
          mustHaveFunctions: ['hygrometer'],
          mustHaveRoles: ['sensor', 'monitor', 'measurement_tool'],
          excludeAlreadyHaveFlag: 'has_hygrometer',
          tier: 'premium',
          limit: 1,
        },
      },
      whyThis:
        "Govee WiFi 3-pack covers the highest-risk corners (typically the corner farthest from the dehumidifier, against a north-facing wall, and near the sump or stored items). 30-day continuous logging is the gold-standard diagnostic — single-reading checks miss the seasonal swings that drive finish-time mold problems.",
      whyNotCheaper:
        "AcuRite single is fine if you only have one reading point. For pre-finish diagnosis, multiple sensors over 30 days is the right scope; the WiFi 3-pack lets you read the data without going to each sensor.",
      whyNotPremium:
        "SensorPush is more accurate but the marginal benefit is invisible at the 60% mold-growth threshold. Worth it for humidor or instrument-storage; overkill for residential basement diagnosis.",
      contextNote:
        "Run for 30 days minimum, ideally including a wet stretch (spring snowmelt or summer humidity peak). The 60% threshold is the EPA mold-growth cutoff. Average under 60% with daily peaks under 65% = dry enough.",
      citations: [
        'Govee WiFi Hygrometer documentation',
        'EPA mold growth thresholds',
        'Vermont DoH basement humidity guidance',
      ],
      slotPurpose:
        'Continuously measure basement humidity over 30+ days to determine whether the space is dry enough to finish.',
      whyItMatters:
        "A single warm-day reading hides the problem. Vermont basements run 65-80% humidity in summer; spring snowmelt drives spikes. Finishing over an unmeasured basement is the #1 way moisture gets walled in.",
      nextBestIfAlreadyHave: {
        targetSlotOrFunction: 'moisture_meter',
        reason:
          "You're tracking ambient humidity. The next-step gap is wood/drywall surface moisture — distinguishes 'dry, just musty' from 'actively wet'.",
      },
    },

    // ---------- SLOT 2: Moisture meter ----------
    {
      slotId: 'basement_moisture_meter',
      slotLabel: 'Pin or pinless moisture meter',
      slotKind: 'core',
      conditionalOn: ['has_moisture_meter'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor', 'home_repair'],
          mustHaveFunctions: ['moisture_meter'],
          mustHaveRoles: ['measurement_tool'],
          excludeAlreadyHaveFlag: 'has_moisture_meter',
          tier: 'budget',
          limit: 1,
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor', 'home_repair'],
          mustHaveFunctions: ['moisture_meter'],
          mustHaveRoles: ['measurement_tool'],
          excludeAlreadyHaveFlag: 'has_moisture_meter',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "General Tools MMD4E is the verified residential moisture meter. Cross-scope reuse from outdoor_deck_refresh and home_moisture_control. Test the bottom 24 inches of every wall, the framing of any partition, and the subfloor near drains.",
      whyNotCheaper:
        "Sub-$20 meters give inconsistent readings — they produce numbers that look authoritative but mislead diagnosis.",
      whyNotPremium:
        "Pro-grade meters are unnecessary for residential pre-finish diagnosis.",
      contextNote:
        "Wood at 15%+ and drywall at 17%+ are 'wet' for our purposes. Below those levels, the issue is ambient humidity (use the dehumidifier). Above, there's a water source (find and fix before finishing).",
      citations: [
        'General Tools MMD4E specifications',
        'Cross-scope universe reuse pattern',
      ],
      slotPurpose: "Measure surface moisture in wood and drywall to find localized water sources.",
      whyItMatters:
        "Hygrometer measures air. Moisture meter measures materials. A wall reading 22% moisture has water IN the wall — not just in the air. That's a different problem with a different fix; finishing over it traps the source.",
    },

    // ---------- SLOT 3: Water leak alarm ----------
    {
      slotId: 'basement_leak_alarm',
      slotLabel: 'Water leak alarm (battery or WiFi)',
      slotKind: 'core',
      conditionalOn: ['has_leak_detection'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor', 'home_repair'],
          mustHaveFunctions: ['leak_detector'],
          mustHaveRoles: ['sensor'],
          excludeAlreadyHaveFlag: 'has_leak_detection',
          tier: 'budget',
          limit: 1,
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor', 'home_repair'],
          mustHaveFunctions: ['leak_detector'],
          mustHaveRoles: ['sensor'],
          excludeAlreadyHaveFlag: 'has_leak_detection',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "Cross-scope reuse from outdoor_freeze_prevention. Govee WiFi 3-pack with gateway sends app alerts; place under water heater, washing machine, sump pump, and at the lowest floor point. Run for one full season including rainstorm and snowmelt.",
      whyNotCheaper:
        "Audible-only alarms work if someone is in the house when they trigger. For absentee or seasonal owners, WiFi alerts are the actual product.",
      whyNotPremium:
        "Whole-home water shut-off systems exist at $300+. For pre-finish diagnostic, the alarm is sufficient — the goal is detection, not automated shut-off.",
      contextNote:
        "A single trip during a once-in-five-years storm is acceptable; recurring trips mean the foundation takes water and finishing is the wrong scope until drainage is fixed.",
      citations: ['Govee H5054 product documentation', 'Cross-scope universe reuse pattern'],
      slotPurpose: 'Catch active leaks during the diagnostic window so they\'re found before drywall goes in.',
      whyItMatters:
        "An undetected slow leak under a water heater or washing machine adds gallons per day of water to a basement. Finishing over it walls the leak in; discovery is months later when the new drywall stains.",
    },

    // ---------- SLOT 4: Dehumidifier ----------
    {
      slotId: 'basement_dehumidifier',
      slotLabel: 'Dehumidifier sized for typical basement',
      slotKind: 'core',
      conditionalOn: ['has_dehumidifier'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor', 'home_repair'],
          mustHaveFunctions: ['dehumidifier_entry', 'dehumidifier_whole'],
          mustHaveRoles: ['appliance', 'preventer'],
          excludeAlreadyHaveFlag: 'has_dehumidifier',
          tier: 'budget',
          limit: 1,
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor', 'home_repair'],
          mustHaveFunctions: ['dehumidifier_entry', 'dehumidifier_whole'],
          mustHaveRoles: ['appliance', 'preventer'],
          excludeAlreadyHaveFlag: 'has_dehumidifier',
          tier: 'sweet_spot',
          limit: 1,
        },
        premium: {
          mustHaveTopics: ['outdoor', 'home_repair'],
          mustHaveFunctions: ['dehumidifier_entry', 'dehumidifier_whole'],
          mustHaveRoles: ['appliance', 'preventer'],
          excludeAlreadyHaveFlag: 'has_dehumidifier',
          tier: 'premium',
          limit: 1,
        },
      },
      whyThis:
        "hOmeLabs 50-pint with continuous drain is the verified pick for typical Vermont 1,500-2,500 sq ft basements. Cross-scope reuse from home_moisture_control and outdoor_seasonal_opening. Plan to keep this running indefinitely after finishing — it's permanent infrastructure, not a temporary fix.",
      whyNotCheaper:
        "30-pint units are sized for under 1,500 sq ft basements. Undersized dehumidifiers run continuously and still don't pull humidity below 65% on a humid Vermont summer day.",
      whyNotPremium:
        "Aprilaire whole-house is integrated with HVAC. Right answer if the home has central HVAC and the goal is whole-house humidity control. For a basement-only solution, the standalone 50-pint is the right scope.",
      contextNote:
        "Continuous drain to a sump or floor drain. Manual-empty units don't work for absentee owners — the bucket fills, the unit shuts off, humidity climbs. Always plumb the drain.",
      citations: [
        'hOmeLabs 50-pint product documentation',
        'Cross-scope universe reuse pattern',
      ],
      slotPurpose: 'Active humidity control during the diagnostic window AND permanent infrastructure for a finished basement.',
      whyItMatters:
        "Vermont basements need active dehumidification. Without it, summer humidity tracks ambient and stays above 60% for months. The dehumidifier is non-negotiable for a finished basement; buying it now serves both the diagnostic and the finished space.",
    },

    // ---------- SLOT 5: Air mover ----------
    {
      slotId: 'basement_air_mover',
      slotLabel: 'Air mover / circulation fan',
      slotKind: 'addon',
      conditionalOn: ['has_air_mover'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['home_repair'],
          mustHaveFunctions: ['air_mover'],
          mustHaveRoles: ['appliance'],
          excludeAlreadyHaveFlag: 'has_air_mover',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "Lasko 3300 is the standard residential air mover. Cross-scope reuse from home_moisture_control. Improves dehumidifier reach into corners by circulating the air the dehumidifier dries.",
      whyNotCheaper:
        "Small desk fans don't move enough air to circulate a basement. The 20-inch wind machine is the right scale.",
      whyNotPremium:
        "Industrial air movers exist for water-damage restoration. For pre-finish circulation, the residential fan is sufficient.",
      citations: ['Lasko 3300 product documentation'],
      slotPurpose: 'Distribute the dehumidifier\'s effect to far corners of the basement that otherwise stay damp.',
      whyItMatters:
        "Without circulation, the dehumidifier dries the immediate area while distant corners (typically the corner farthest from where the unit sits) stay damp. The air mover prevents the dehumidifier from being defeated by stagnant zones.",
    },

    // ---------- SLOT 6: Mold test kit ----------
    {
      slotId: 'basement_mold_test',
      slotLabel: 'Mold test kit (DIY screening only)',
      slotKind: 'addon',
      conditionalOn: ['has_recent_mold_test'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['home_repair'],
          mustHaveFunctions: ['mold_test_kit'],
          mustHaveRoles: ['measurement_tool', 'safety_item'],
          excludeAlreadyHaveFlag: 'has_recent_mold_test',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "DIY kit is the screening tool for ambiguous cases (musty smell but no visible mold). If results show common mold genera in concerning concentration, the next step is pro inspection. Visible mold over ~10 sq ft is professional remediation territory per EPA — do NOT DIY remediate large mold.",
      contextNote:
        "Screening, not diagnosis. A clean DIY result doesn't mean no mold; a positive result usually means call a pro. The kit is for disambiguation, not for substitution.",
      citations: [
        'EPA mold remediation guidance',
        'My Mold Detective product documentation',
      ],
      slotPurpose: 'Screen for mold presence when there\'s a musty smell without visible growth.',
      whyItMatters:
        "Visible mold over 10 sq ft = pro inspection. Smell without visible mold = DIY screening identifies whether mold is present and informs whether to call a pro. They're different products for different situations.",
      commonMistake:
        'Buying a DIY mold test as a substitute for pro inspection when there\'s already visible mold. The DIY kit is screening; the pro inspection is diagnosis.',
      routeOutOfSmartCartIf: [
        {
          condition: 'has_visible_mold_over_10_sqft',
          destination: 'small_pro',
          reason: 'EPA guidance: mold over ~10 sq ft requires professional remediation. DIY removal spreads spores throughout the house.',
        },
      ],
    },

    // ---------- SLOT 7: Vapor barrier / storage protection ----------
    {
      slotId: 'basement_vapor_barrier',
      slotLabel: 'Vapor barrier sheeting + storage protection',
      slotKind: 'addon',
      conditionalOn: ['has_vapor_barrier'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['home_repair', 'outdoor'],
          mustHaveFunctions: ['vapor_barrier'],
          mustHaveRoles: ['consumable_material', 'preventer'],
          excludeAlreadyHaveFlag: 'has_vapor_barrier',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "6-mil polyethylene is the standard residential vapor barrier. Use under stored items currently in the basement, along the wall-floor joint, and over any earth-floor crawlspace. Pairs with airtight totes for items you don't want to move out during the diagnostic window.",
      whyNotCheaper:
        "Thin painter's plastic (1-3 mil) tears under foot traffic and stored items. 6-mil is the minimum for actual protection.",
      whyNotPremium:
        "Reinforced poly sheeting (8-10 mil) exists for crawlspace encapsulation. Worth it for the full encapsulation project, overkill for storage protection.",
      contextNote:
        "Not a substitute for fixing the moisture source. Vapor barrier protects items above it; doesn't reduce humidity in the air.",
      citations: [
        'EPA basement moisture management guidance',
        'Polyethylene vapor barrier residential applications',
      ],
      slotPurpose: 'Protect stored items (and the floor itself) from ambient moisture during the diagnostic window — and after, for any items you choose to keep storing.',
      whyItMatters:
        "Items stored directly on a basement floor accumulate moisture from the floor itself. The vapor barrier breaks the conductive path. Critical for boxes, furniture, electronics that aren't in airtight totes.",
    },

    // ---------- SLOT 8: Activated charcoal odor absorber ----------
    {
      slotId: 'basement_odor_absorber',
      slotLabel: 'Activated charcoal odor absorber',
      slotKind: 'addon',
      conditionalOn: ['has_odor_absorber'],
      tierQueries: {
        sweet_spot: {
          mustHaveTopics: ['home_repair'],
          mustHaveFunctions: ['odor_absorber'],
          mustHaveRoles: ['consumable_material', 'cleaner'],
          excludeAlreadyHaveFlag: 'has_odor_absorber',
          tier: 'sweet_spot',
          limit: 1,
        },
      },
      whyThis:
        "Moso bamboo charcoal is the verified Wirecutter pick. Cross-scope reuse from home_moisture_control. Reusable (sun-dry monthly to reactivate). Per-month cost is ~$1.",
      whyNotCheaper:
        "Cheap charcoal bags use lower-quality charcoal that loses adsorption capacity within months.",
      whyNotPremium:
        "$60+ air purification systems are for active filtration of allergens. For odor adsorption during the diagnostic window, the charcoal bags do the job.",
      contextNote:
        "Charcoal works AFTER the moisture source is addressed. Putting charcoal in a damp basement without a dehumidifier saturates it within weeks. Fix moisture first, then deploy charcoal.",
      citations: [
        'Moso bamboo charcoal product documentation',
        'Wirecutter air purifier and odor absorber testing',
      ],
      slotPurpose: 'Reduce existing musty smell during the 30-day diagnostic so you can tell whether the smell is improving as humidity drops.',
      whyItMatters:
        "If the smell persists after moisture is controlled, the source isn't ambient humidity — it's likely hidden mold or a slow leak. The charcoal helps you isolate the variable.",
      commonMistake:
        'Using scented air fresheners to cover the smell. Plug-ins, sprays, candles. They mask while the underlying problem worsens. Charcoal removes; air fresheners disguise.',
    },
  ],

  skipList: [
    {
      id: 'skip_premium_dehumidifier_no_humidity_test',
      type: 'wrong_version',
      title: 'Premium whole-basement dehumidifier system before measuring humidity',
      marketingPitch: '"Whole-basement humidity solution — set it and forget it."',
      realReason:
        "Built-in or whole-house dehumidifier systems run $1,500-$3,500 installed. They're the right answer for a 3,000+ sq ft basement OR an integrated HVAC setup. For a typical Vermont 1,500-2,500 sq ft basement, a $250 standalone 50-pint with continuous drain handles the load. Measure first; size to actual humidity numbers, not max.",
      amountSaved: { low: 200, high: 400 },
      appliesToScope: ['basement_moisture_prep'],
      citations: ['Dehumidifier sizing guidance', 'Whole-house vs standalone economics'],
    },
    {
      id: 'skip_finishing_materials_before_test',
      type: 'wrong_version',
      title: 'Buying drywall and framing before moisture testing',
      marketingPitch: '"Sale on basement-grade drywall — buy now, save later."',
      realReason:
        "If the basement fails the diagnostic, the drywall and framing are wasted purchases (or returned at restocking fees). The $80-$300 diagnostic kit pays for itself the first time it catches a basement that wasn't ready to finish. Test before buying materials.",
      amountSaved: { low: 100, high: 300 },
      appliesToScope: ['basement_moisture_prep'],
      citations: ['Sequence-of-operations basement finishing'],
    },
    {
      id: 'skip_pro_mold_inspector_for_clean_smell',
      type: 'wrong_version',
      title: 'Booking a pro mold inspector before screening',
      marketingPitch: 'Mold inspection — the safe choice.',
      realReason:
        "Pro mold inspection is the right tool for visible mold or a positive screening result. For a clean-looking basement with a faint musty smell, the $20-50 DIY screening kit narrows the question first. Pro inspection at $250-500 is appropriate AFTER the screening, not before.",
      amountSaved: { low: 200, high: 450 },
      appliesToScope: ['basement_moisture_prep'],
      citations: ['DIY mold screening vs pro inspection'],
    },
    {
      id: 'skip_premium_smart_mold_sensor',
      type: 'wrong_version',
      title: 'Premium "smart" mold sensors that actually screen humidity',
      marketingPitch: '"AI-powered mold prediction sensor."',
      realReason:
        "Most consumer 'mold sensors' are humidity sensors with marketing — they detect the conditions where mold grows, not mold itself. The $30-80 hygrometer in this cart does the same job. Save the $100+ premium for a real mold test kit.",
      amountSaved: { low: 80, high: 200 },
      appliesToScope: ['basement_moisture_prep'],
      citations: ['Consumer mold sensor accuracy testing'],
    },
    {
      id: 'skip_universal_water_alarm_no_wifi',
      type: 'wrong_version',
      title: 'Audible-only water alarms in an absentee basement',
      marketingPitch: 'Loud audible water alarm — alerts you immediately.',
      realReason:
        "Audible-only alarms work when someone's home. For a Vermont second home or seasonal residence, the alarm trips, no one hears it, and the leak runs for days. WiFi alerts are the actual product for absentee owners — same hardware, $20 more, sends to your phone.",
      amountSaved: { low: 25, high: 60 },
      appliesToScope: ['basement_moisture_prep'],
      citations: ['Water alarm audible vs WiFi for second homes'],
    },
    {
      id: 'skip_mold_killing_fogger',
      type: 'wrong_category',
      title: 'Mold-killing foggers and sprays as remediation substitute',
      realReason:
        "Foggers spread chemicals throughout the room without addressing the underlying moisture source. The mold returns once moisture conditions return. Real remediation requires removing affected materials and fixing the moisture source. Foggers are theater.",
      appliesToScope: ['basement_moisture_prep'],
      citations: ['EPA mold remediation guidance — fogger limitations'],
    },
    {
      id: 'skip_basement_paint_waterproofing',
      type: 'wrong_category',
      title: 'Basement waterproofing paint without diagnosing source',
      realReason:
        "DRYLOK and similar paints can hold back minor capillary moisture in a fundamentally dry basement. They CANNOT stop active water intrusion or hydrostatic pressure. Painting over a wall that takes water during snowmelt traps the water in the wall and accelerates damage. Diagnose first; paint is at most a finishing step, not a fix.",
      appliesToScope: ['basement_moisture_prep'],
      citations: ['Waterproofing paint applicability guidance'],
    },
    {
      id: 'skip_ozone_machines',
      type: 'wrong_category',
      title: 'Ozone machines for basement odor / mold',
      realReason:
        "EPA explicitly warns against ozone for residential indoor air. Ozone is a respiratory irritant. Damages plants, rubber, and electronics. The musty smell returns once ozone is gone because the moisture source remains. Use the dehumidifier + charcoal solution.",
      appliesToScope: ['basement_moisture_prep'],
      citations: ['EPA ozone generator guidance'],
    },
    {
      id: 'skip_french_drain_no_diagnosis',
      type: 'wrong_category',
      title: 'Interior French drain installation without diagnosing the water source',
      realReason:
        "Interior perimeter drains run $3,000-$8,000 installed. They're the right answer for chronic active water entry. They're expensive overkill if the actual issue is a clogged downspout or grading problem that costs $200 to fix. Diagnose source first; the cheapest source-fix often eliminates 80% of the water.",
      appliesToScope: ['basement_moisture_prep'],
      citations: ['Basement waterproofing diagnosis sequence'],
    },
  ],

  scenarioDefaults: {
    just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
    already_have_basics: {
      selectedTier: 'sweet_spot',
      alreadyHave: ['has_dehumidifier', 'has_hygrometer'],
    },
    tight_budget: { selectedTier: 'budget', alreadyHave: [] },
    absentee_owner: { selectedTier: 'sweet_spot', alreadyHave: [] },
  },

  smartCartPromise:
    'Spend $80-$300 to check humidity, leaks, alarms, and water risk before committing $20-$50k to a finished basement.',
  primaryCustomerPain:
    "Vermont basements develop musty smells over winter, hold elevated humidity in summer, and occasionally take water during snowmelt. Finishing over an unmeasured basement is the most common avoidable basement-finish mistake — the moisture problem gets walled in and discovered six months later.",
  valueProposition:
    "A $80-$300 diagnostic kit (hygrometer + moisture meter + water alarm + properly-sized dehumidifier + mold screen) tells you whether the basement is dry enough to finish before you commit to a $20-50k project. The kit pays back many times over the first time it catches a basement that wasn't ready.",
  routeOutRules: [
    {
      condition: 'has_active_water_intrusion',
      destination: 'small_pro',
      reason:
        "Standing water or active leaks during rain mean the foundation drainage has failed. Smart Cart is not the right tool for active water. Call a Vermont basement waterproofing specialist for diagnosis and quote — interior perimeter drain, sump installation, or exterior excavation depending on severity.",
    },
    {
      condition: 'has_visible_mold',
      destination: 'small_pro',
      reason:
        "Visible mold over ~10 sq ft is professional remediation per EPA guidance. DIY removal at this scale spreads spores throughout the house. Call a certified mold remediation contractor.",
    },
    {
      condition: 'has_foundation_structural_issue',
      destination: 'small_pro',
      reason:
        "Foundation cracks wider than 1/8 inch, stair-step cracking in block walls, bowing walls, or repeated water entry are structural concerns. Smart Cart is not the right tool. Call a foundation specialist or structural engineer for assessment.",
    },
    {
      condition: 'humidity_persists_above_65_with_dehumidifier',
      destination: 'verify_first',
      reason:
        "If the basement humidity won't drop below 65% with a properly-sized dehumidifier running, there's a water source the dehumidifier can't keep up with. Diagnose source (slow plumbing leak, foundation seepage, dryer venting indoors) before finishing. The $250 dehumidifier can't outwork a leak adding water faster than it removes it.",
    },
  ],

  seasonalUrgency: {
    season: 'pre-finish',
    deadline: '11-01',
    label: 'Run the diagnostic over a full season — start early',
  },
}
