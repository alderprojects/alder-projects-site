// scripts/source-catalogs/home-moisture-control.ts
// V7.2.5 — Moisture and smell prevention catalog

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const HOME_MOISTURE_CONTROL_TOPIC = 'home_repair'
export const HOME_MOISTURE_CONTROL_SCOPE = 'home_moisture_control'
export const HOME_MOISTURE_CONTROL_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'absentee_owner',
]

export const HOME_MOISTURE_CONTROL_METADATA = {
  smartCartPromise:
    'Spend $50-$400 to catch moisture problems before they become smell, mold, or repair issues.',
  primaryCustomerPain:
    "Vermont second homes and basements develop musty smells over winter. By the time you smell it, mold has typically been growing 2-3 weeks. Catching the moisture trend before the smell prevents the mold and the smell.",
  valueProposition:
    "A $150 monitoring + dehumidifier kit prevents the most common second-home complaint (musty smell) and the underlying problem (mold growth that costs $1,000-$10,000+ to remediate).",
  routeOutRules: [
    {
      condition: 'has_visible_mold',
      destination: 'small_pro',
      reason:
        "Visible mold (more than ~10 sq ft) is a remediation problem, not a moisture-control problem. Get a mold inspection. Smart Cart cannot solve active mold.",
    },
    {
      condition: 'has_visible_water_intrusion',
      destination: 'small_pro',
      reason:
        "Active water intrusion (foundation, roof, plumbing) is the underlying issue. Dehumidifiers treat ambient moisture; they don't fix water sources. Diagnose and fix the source first.",
    },
  ],
  seasonalUrgency: undefined, // Year-round relevance, peaks spring (post-winter) and fall (pre-winter)
}

export const HOME_MOISTURE_CONTROL_SLOTS: CartSlot[] = [
  // ============================================================
  // SLOT 1: Hygrometer
  // ============================================================
  {
    slotId: 'moisture_hygrometer',
    slotLabel: 'Hygrometer (humidity monitor)',
    slotKind: 'core',
    conditionalOn: ['has_hygrometer'],
    tiers: {
      budget: {
        productName: 'AcuRite digital hygrometer (single)',
        priceLow: 12,
        priceHigh: 22,
        affiliateUrl:
          'https://www.amazon.com/s?k=acurite+digital+hygrometer+thermometer&tag=alderprojects-20',
        productSpec:
          'Battery-powered digital hygrometer. Reads temperature + humidity. ~$15. AcuRite is the consumer standard. Local readout only — no remote alerts.',
      },
      sweet_spot: {
        productName: 'Govee WiFi Hygrometer 3-pack with app alerts',
        priceLow: 35,
        priceHigh: 55,
        affiliateUrl:
          'https://www.amazon.com/s?k=govee+wifi+hygrometer+3+pack&tag=alderprojects-20',
        productSpec:
          '3 WiFi-connected hygrometers. App alerts when humidity exceeds threshold. Historical graphs over weeks/months. Place in basement, bedroom, kitchen for whole-house picture. Govee Home app.',
      },
      premium: {
        productName: 'SensorPush HTP.xw outdoor-rated wireless hygrometer kit',
        priceLow: 145,
        priceHigh: 220,
        affiliateUrl:
          'https://www.amazon.com/s?k=sensorpush+wireless+hygrometer+gateway&tag=alderprojects-20',
        productSpec:
          'Pro-grade hygrometers. SensorPush gateway for remote access. Long-range (~100 ft). Used by humidor and instrument-storage owners for precise humidity tracking. Better accuracy than Govee.',
      },
    },
    slotPurpose:
      "Continuously measure humidity in spaces that grow mold (basements, crawlspaces, bathrooms) so you see problems before they become visible.",
    whyItMatters:
      "Mold grows above 60% relative humidity. By the time you smell mold, humidity has been above 60% for weeks. A hygrometer catches the trend at week 1 instead of week 4.",
    commonMistake:
      "Single-room hygrometer when the moisture problem is whole-house. Vermont basements often have humidity 20-30% higher than the upstairs. One sensor doesn't tell the whole story.",
    whyThis:
      "Govee WiFi 3-pack covers the three moisture-prone zones (basement, primary bath, utility room) and sends app alerts when humidity exceeds threshold. The historical graphs are the actual product — you see when humidity spikes (storms, baths, cooking) vs steady-state.",
    whyNotCheaper:
      "AcuRite single is fine if you only have one room of concern and you check it daily. For absentee owners or whole-house monitoring, WiFi alerts are the real value.",
    whyNotPremium:
      "SensorPush is genuinely more accurate but the marginal benefit isn't useful for mold prevention (60% threshold). Worth it for humidor or instrument-storage applications, not for residential mold prevention.",
    contextNote:
      "Set alert threshold at 60% humidity. Below 60%, mold can't grow. Above, the clock is ticking. The alert lets you act before mold appears.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'moisture_meter',
      reason:
        "You're tracking ambient humidity. The next-step gap is wood/drywall moisture meter — measures specific surface moisture in walls and floors where the hygrometer doesn't reach.",
    },
    citations: [
      'Govee WiFi Hygrometer documentation',
      'AcuRite product line',
      'SensorPush HTP.xw specifications',
      'EPA mold growth thresholds',
    ],
  },

  // ============================================================
  // SLOT 2: Dehumidifier (cross-scope reuse)
  // ============================================================
  {
    slotId: 'moisture_dehumidifier',
    slotLabel: 'Whole-basement dehumidifier (50-pint)',
    slotKind: 'core',
    conditionalOn: ['has_dehumidifier'],
    tiers: {
      budget: {
        productName: 'Generic 30-pint dehumidifier',
        priceLow: 130,
        priceHigh: 200,
        affiliateUrl:
          'https://www.amazon.com/s?k=30+pint+dehumidifier+basement&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge. 30-pint, ~1,500 sq ft.',
      },
      sweet_spot: {
        productName: 'hOmeLabs 50-pint dehumidifier with continuous drain',
        priceLow: 220,
        priceHigh: 320,
        affiliateUrl:
          'https://www.amazon.com/s?k=homelabs+50+pint+dehumidifier+continuous+drain&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge. 50-pint, continuous drain pump, Energy Star.',
      },
      premium: {
        productName: 'Aprilaire whole-house dehumidifier (1850, 1830)',
        priceLow: 1100,
        priceHigh: 1900,
        affiliateUrl:
          'https://www.amazon.com/s?k=aprilaire+whole+house+dehumidifier+1850&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge. Whole-house ducted unit.',
      },
    },
    slotPurpose:
      "Active humidity reduction in moisture-prone spaces.",
    whyItMatters:
      "When ambient humidity exceeds 60% during summer humidity peaks or after spring snowmelt, the dehumidifier is what brings it back to safe levels. Without active dehumidification, summer Vermont basements stay above 70% for months.",
    whyThis:
      "Cross-scope reuse from outdoor_seasonal_opening. hOmeLabs 50-pint with continuous drain is the verified pick for Vermont basements. Place near the highest-humidity reading from your hygrometer monitoring.",
    contextNote:
      "Dehumidifier should be sized to the space. 30-pint for ~1,500 sq ft basements. 50-pint for typical Vermont 2,500 sq ft basements with high moisture load. Aprilaire whole-house is integrated with HVAC for total home coverage.",
    citations: [
      'Cross-scope universe reuse pattern (v7.2.4 architecture)',
      'hOmeLabs 50-pint product documentation',
    ],
  },

  // ============================================================
  // SLOT 3: Moisture meter (wood/drywall)
  // ============================================================
  {
    slotId: 'moisture_meter',
    slotLabel: 'Wood / drywall moisture meter',
    slotKind: 'core',
    conditionalOn: ['has_moisture_meter'],
    tiers: {
      sweet_spot: {
        productName: 'General Tools MMD4E pin-and-pinless moisture meter',
        priceLow: 38,
        priceHigh: 55,
        affiliateUrl:
          'https://www.amazon.com/s?k=general+tools+mmd4e+moisture+meter&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_deck_refresh — universe entry reused via additive tag merge. Pin and pinless modes. ~$40.',
      },
    },
    slotPurpose:
      "Measure surface moisture in wood and drywall. Distinguishes 'dry, just musty smell' from 'actively wet, moisture source somewhere'.",
    whyItMatters:
      "Hygrometer measures air humidity. Moisture meter measures actual material moisture. If a wall reads 22% moisture, there's water IN the wall — not just humid air. That's a different problem with a different fix.",
    whyThis:
      "General Tools MMD4E is the verified residential moisture meter. Cross-scope reuse — same entry serves outdoor_deck_refresh and home_moisture_control.",
    whyNotCheaper:
      "Sub-$20 meters give inconsistent readings.",
    whyNotPremium:
      "Pro-grade meters are unnecessary for residential diagnosis.",
    contextNote:
      "Wood at 15%+ moisture and drywall at 17%+ are 'wet' for our purposes. Below those levels, ambient humidity is the issue (use dehumidifier). Above, there's a water source (route to pro).",
    citations: [
      'Cross-scope universe reuse pattern',
      'General Tools MMD4E specifications',
    ],
  },

  // ============================================================
  // SLOT 4: Mold test kit (DIY screening only) — option A fix
  // ============================================================
  // V7.2.5 paste 3 — original source had a placeholder
  // "Professional mold inspection" sweet_spot tier with an
  // alderprojects.com route-out URL, which fails the verify gate
  // (every sweet_spot must have an amazon.com affiliateUrl).
  // Option A: promote DIY kit (was budget) to sole sweet_spot tier.
  // The route-out for visible mold is preserved in
  // routeOutOfSmartCartIf below.
  {
    slotId: 'moisture_mold_test',
    slotLabel: 'Mold test kit (DIY screening only)',
    slotKind: 'addon',
    conditionalOn: ['has_recent_mold_test'],
    tiers: {
      sweet_spot: {
        productName: 'My Mold Detective DIY mold test kit',
        priceLow: 35,
        priceHigh: 55,
        affiliateUrl:
          'https://www.amazon.com/s?k=my+mold+detective+diy+test+kit&tag=alderprojects-20',
        productSpec:
          'DIY surface and air sampling. Mail-in lab analysis. Identifies common mold genera. Useful as a screening tool. NOT a substitute for professional mold inspection if you have visible mold.',
      },
    },
    slotPurpose:
      "Screen for mold presence when you have musty smell but no visible mold.",
    whyItMatters:
      "Visible mold = pro inspection. Smell without visible mold = DIY screening can identify whether mold is present and what type. The DIY result then informs whether to call a pro.",
    commonMistake:
      "Buying a DIY mold test as a substitute for pro inspection when you have visible mold. The DIY kit is screening; the pro inspection is diagnosis. They're not the same product.",
    whyThis:
      "DIY kit is the screening tool. If results show common mold genera in concerning concentrations, the next step is pro inspection. If results are clean, the smell is something else (organic decay, dampness without mold).",
    contextNote:
      "Visible mold over ~10 sq ft is per-EPA-guidance professional remediation territory. Don't DIY remediate large mold; you spread spores. Get a pro. (Pro inspection runs $250-600 and is not a Smart Cart purchase — it's a service call.)",
    routeOutOfSmartCartIf: [
      {
        condition: 'has_visible_mold_over_10_sqft',
        destination: 'small_pro',
        reason:
          "EPA guidance: mold larger than ~10 sq ft is professional remediation. DIY removal spreads spores throughout the house.",
      },
    ],
    citations: [
      'EPA mold remediation guidance',
      'My Mold Detective product documentation',
    ],
  },

  // ============================================================
  // SLOT 5: Odor absorber
  // ============================================================
  {
    slotId: 'moisture_odor_absorber',
    slotLabel: 'Activated charcoal odor absorber',
    slotKind: 'core',
    conditionalOn: ['has_odor_absorber'],
    tiers: {
      sweet_spot: {
        productName: 'Moso Natural Bamboo Charcoal Air Purifying Bags (4-pack, 200g each)',
        priceLow: 18,
        priceHigh: 32,
        affiliateUrl:
          'https://www.amazon.com/s?k=moso+natural+bamboo+charcoal+air+purifying+bags+4+pack&tag=alderprojects-20',
        productSpec:
          'Activated bamboo charcoal in natural fabric bags. Adsorbs odors and excess moisture. 4 bags × 200g. Reactivate by sun-drying monthly. ~$25 for 2-year supply. Wirecutter-tier pick.',
      },
    },
    slotPurpose:
      "Absorb residual odors after addressing moisture source. The 'mop up' step after dehumidifier and ventilation.",
    whyItMatters:
      "Even after fixing the moisture source, the smell can linger in fabric and wood. Charcoal physically adsorbs the odor molecules — doesn't mask them like air fresheners do.",
    commonMistake:
      "Using scented air fresheners to cover smells. Plug-ins, sprays, candles. They mask the smell while the underlying moisture problem worsens. The charcoal solution is removal; the air freshener is theater.",
    whyThis:
      "Moso bamboo charcoal is the verified Wirecutter pick. Reusable (sun-dry monthly to reactivate). Lasts 2 years with proper maintenance. Per-month cost is ~$1.",
    whyNotCheaper:
      "Cheap charcoal bags use lower-quality charcoal that loses adsorption capacity within months.",
    whyNotPremium:
      "Premium ($60+) air purification systems are for active filtration of allergens. For odor adsorption, the bags do the job.",
    contextNote:
      "Charcoal works AFTER the moisture source is addressed. If you put charcoal in a damp basement without dehumidifier, it adsorbs moisture and saturates within 2-4 weeks. Fix moisture first, then deploy charcoal.",
    citations: [
      'Moso bamboo charcoal product documentation',
      'Wirecutter air purifier and odor absorber testing',
    ],
  },

  // ============================================================
  // SLOT 6: Air mover / ventilation fan
  // ============================================================
  {
    slotId: 'moisture_air_mover',
    slotLabel: 'Air mover / circulation fan',
    slotKind: 'addon',
    conditionalOn: ['has_air_mover'],
    tiers: {
      sweet_spot: {
        productName: 'Lasko 3300 Wind Machine 3-speed air circulator',
        priceLow: 55,
        priceHigh: 85,
        affiliateUrl:
          'https://www.amazon.com/s?k=lasko+3300+wind+machine+air+circulator&tag=alderprojects-20',
        productSpec:
          '20" diameter pivoting fan with 3 speeds. Heavy-duty plastic frame. Used for drying spaces and rapid air circulation in basements. Lasko is the consumer standard.',
      },
    },
    slotPurpose:
      "Move air through closed/stagnant spaces (basements, crawlspaces, closed-up second homes) to dry surfaces and prevent humidity stagnation.",
    whyItMatters:
      "Dehumidifier removes water from the air. Air mover circulates the air so the dehumidifier reaches all corners. Without circulation, the dehumidifier dries the immediate area while distant corners stay damp.",
    whyThis:
      "Lasko 3300 is the standard residential air mover. Strong enough to move air across a basement, quiet enough to leave running. ~$70 once.",
    whyNotCheaper:
      "Small desk fans don't move enough air to dry a basement. The 20-inch wind machine is the right scale.",
    whyNotPremium:
      "Industrial air movers exist for water-damage restoration. For preventive moisture control, the residential fan is sufficient.",
    citations: ['Lasko 3300 product documentation'],
  },

  // ============================================================
  // SLOT 7: Leak sensor (cross-scope reuse)
  // ============================================================
  {
    slotId: 'moisture_leak_sensor',
    slotLabel: 'WiFi water leak sensor (cross-scope reuse)',
    slotKind: 'addon',
    conditionalOn: ['has_leak_detection'],
    tiers: {
      sweet_spot: {
        productName: 'Govee WiFi Water Leak Detector 3-Pack with Gateway',
        priceLow: 45,
        priceHigh: 65,
        amazonAsin: 'B07J9HZ5VN',
        affiliateUrl: 'https://www.amazon.com/dp/B07J9HZ5VN?tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_freeze_prevention — universe entry reused via additive tag merge. WiFi gateway + 3 sensors with app alerts.',
      },
    },
    slotPurpose:
      "Detect a leak that's contributing to moisture problems. Often the cause of persistent damp/musty smell is an undetected slow leak.",
    whyItMatters:
      "If your basement humidity won't go below 65% even with dehumidifier running 24/7, there's a water source. A slow leak from a water heater, washing machine, or supply line adds enough water to defeat the dehumidifier.",
    whyThis:
      "Cross-scope reuse from outdoor_freeze_prevention. Place sensors near water heater, washing machine, sump pump, under sinks.",
    citations: [
      'Cross-scope universe reuse pattern',
      'Govee H5054 product documentation',
    ],
  },
]

export const HOME_MOISTURE_CONTROL_SKIP_LIST: SkipItem[] = [
  // ===== Type A =====
  {
    id: 'skip_dehumidifier_water_source_unknown_moisture',
    type: 'wrong_version',
    title: 'Dehumidifier before identifying water source',
    marketingPitch: 'Whole-basement humidity solution.',
    realReason:
      "Dehumidifiers treat ambient moisture from condensation and air infiltration. They don't fix water sources (foundation seepage, plumbing leaks, roof leaks). If your basement floods because of foundation drainage, the dehumidifier runs continuously, costs $50/month in electricity, and the floor still gets wet. Diagnose source FIRST.",
    amountSaved: { low: 200, high: 320 },
    appliesToScope: ['home_moisture_control'],
    citations: ['EPA basement moisture diagnosis guidance'],
  },
  {
    id: 'skip_cheap_moisture_meter_moisture',
    type: 'wrong_version',
    title: 'Cheap moisture meters with poor accuracy',
    marketingPitch: '"Detects all moisture problems."',
    realReason:
      "$10-20 meters give inconsistent readings. They produce numbers that look authoritative but mislead diagnosis — you might 'fix' a wall that wasn't actually wet, or miss one that is. The General Tools MMD4E at $40 is the right tier.",
    amountSaved: { low: 10, high: 25 },
    appliesToScope: ['home_moisture_control'],
    citations: ['Moisture meter accuracy testing'],
  },
  {
    id: 'skip_single_hygrometer_whole_house',
    type: 'wrong_version',
    title: 'Single hygrometer for whole-house monitoring',
    marketingPitch: 'One sensor, whole-house view.',
    realReason:
      "Vermont basements often run 20-30% higher humidity than upstairs. One sensor in the living room misses the basement problem entirely. The 3-pack covers basement, primary bath, and utility room — the actual moisture-prone zones.",
    amountSaved: { low: 20, high: 40 },
    appliesToScope: ['home_moisture_control'],
    citations: ['Whole-house humidity zone variance data'],
  },
  {
    id: 'skip_diy_mold_test_visible_mold',
    type: 'wrong_version',
    title: 'DIY mold test kits as substitute for pro inspection',
    marketingPitch: 'Test for mold yourself, save money on inspection.',
    realReason:
      "DIY kits screen — they identify if mold is present. They don't diagnose hidden mold or quantify severity. With visible mold over 10 sq ft, you need pro inspection. The DIY kit is the wrong tool when you already know you have a problem.",
    amountSaved: { low: 250, high: 600 },
    appliesToScope: ['home_moisture_control'],
    citations: ['EPA mold remediation guidance'],
  },

  // ===== Type B =====
  {
    id: 'skip_ozone_machines',
    type: 'wrong_category',
    title: 'Ozone machines for odor / mold removal',
    realReason:
      "Ozone machines are sold for odor removal and 'mold remediation'. Ozone is a respiratory irritant; the EPA explicitly warns against using ozone for residential indoor air. They mask odors temporarily and can damage plants, rubber, and electronics. Use activated charcoal and ventilation instead.",
    appliesToScope: ['home_moisture_control'],
    citations: ['EPA ozone generator guidance'],
  },
  {
    id: 'skip_mold_bomb_foggers',
    type: 'wrong_category',
    title: 'Mold-bomb fogger products',
    realReason:
      "Marketed for DIY mold remediation. Foggers spread chemicals throughout the room without addressing the underlying moisture source. The mold returns once moisture conditions return. Real mold remediation requires removing affected materials and fixing the moisture source — not fogging.",
    appliesToScope: ['home_moisture_control'],
    citations: ['EPA mold remediation guidance — fogger limitations'],
  },
  {
    id: 'skip_scented_plug_ins',
    type: 'wrong_category',
    title: 'Scented plug-ins / sprays / candles to mask musty smell',
    realReason:
      "Plug-ins, sprays, and candles mask smells while the underlying moisture problem worsens. You're paying $5-15/month for products that hide the problem. The dehumidifier + charcoal solution is permanent; the masking products are perpetual cost.",
    appliesToScope: ['home_moisture_control'],
    citations: ['Air freshener vs root-cause solutions'],
  },
  {
    id: 'skip_damprid_for_basement',
    type: 'wrong_category',
    title: 'Tiny DampRid packs for whole-basement use',
    realReason:
      "DampRid (calcium chloride desiccant) works for closets, RVs, and small enclosed spaces. The 12 oz tubs sold for $5-7 absorb a few ounces of water before saturating. For a Vermont basement that processes gallons of moisture per day, you'd need 50+ tubs replaced weekly. Use a real dehumidifier.",
    appliesToScope: ['home_moisture_control'],
    citations: ['DampRid capacity specifications vs basement humidity loads'],
  },
]

export const HOME_MOISTURE_CONTROL_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_dehumidifier', 'has_hygrometer'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
  absentee_owner: { selectedTier: 'sweet_spot', alreadyHave: [] },
}
