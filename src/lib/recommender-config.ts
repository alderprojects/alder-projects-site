// Single source of truth for every tunable in the recommender + accessory
// engine. Tuning the model = editing values here. Code never hard-codes
// weights, thresholds, conversion rates, or topic affinities.
//
// Each affinity weight has a citation comment grounding it in research
// (rebate program rules, NAR/Houzz/NREL studies, VT Dept of Taxes
// guidance, etc.). When retuning, update both the weight and the citation
// so future tuning passes can reason about why the number is what it is.

import type { RecommenderConfig } from './recommender-config.types'

export const CONFIG: RecommenderConfig = {
  version: '2026.05.04-v6',

  // ---------- Topic affinity matrix ------------------------------------
  // affinity[from][to] = strength of "if visitor is on `from`, recommend
  // `to`". Asymmetric on purpose — a heat-pump researcher almost always
  // benefits from weatherization, but a weatherization researcher does
  // not always next-step to a heat pump.
  topicAffinity: {
    heat_pump: {
      weatherization: {
        weight: 0.95,
        citation:
          'VPPSA $200 bonus for heat-pump-after-weatherization; EVT explicitly: weatherize first = smaller heat pump = lower cost; VT HEAR program REQUIRES weatherized homes',
      },
      rebate_strat: {
        weight: 0.85,
        citation:
          'Heat pump is the headline VT rebate ($475 ductless, $2,200 ducted, $400 fuel-switch, $600 HPWH, $500 panel)',
      },
      solar_battery: {
        weight: 0.7,
        citation: 'NYS Clean Heat program structure; electrification-then-PV sequencing',
      },
      mud_season: { weight: 0.5 },
      contractor_vetting: { weight: 0.4 },
      property_tax: { weight: 0.3 },
    },

    weatherization: {
      heat_pump: {
        weight: 0.7,
        citation:
          'Asymmetric to heat_pump→weatherization 0.95: weatherization customers do not all next-step to heat pump',
      },
      rebate_strat: {
        weight: 0.9,
        citation: 'EVT 75/90 percent tier IS weatherization',
      },
      solar_battery: { weight: 0.5 },
      rebate_eligibility: { weight: 0.6 },
      contractor_vetting: { weight: 0.3 },
    },

    solar_battery: {
      outdoor: {
        weight: 0.85,
        citation:
          'Roof-then-solar canonical sequencing. NREL bundling savings $3-5k. R&R cost $3.8-12.5k if mis-sequenced',
      },
      rebate_strat: {
        weight: 0.9,
        citation:
          'Federal 25D 30% + EVT solar+storage $0.40/Wh + VT net metering Group 2 + utility adders',
      },
      heat_pump: {
        weight: 0.6,
        citation: 'Heat pump + solar canonical pair (NYS Clean Heat)',
      },
      weatherization: { weight: 0.4 },
      contractor_vetting: { weight: 0.3 },
    },

    kitchen: {
      bath: {
        weight: 0.9,
        citation:
          'NAR/Houzz 2025: top combo. ~20% labor savings on shared crews+permits. NAR ranks kitchen+bath #1 and #2',
      },
      contractor_vetting: {
        weight: 0.7,
        citation: 'High-stakes hire ($60k-$110k mid-range VT kitchen)',
      },
      addition_adu: { weight: 0.4 },
      property_tax: { weight: 0.3 },
      heat_pump: { weight: 0.2 },
    },

    bath: {
      kitchen: {
        weight: 0.85,
        citation:
          'Asymmetric to kitchen→bath 0.9: bath remodelers often skip kitchen, but kitchen remodelers usually add bath',
      },
      property_tax: {
        weight: 0.4,
        citation: 'VT specifically: half-bath to full-bath triggers reassessment',
      },
      contractor_vetting: { weight: 0.6 },
    },

    outdoor: {
      solar_battery: {
        weight: 0.85,
        citation: 'Roof-then-solar pairing — strongest outdoor signal',
      },
      contractor_vetting: { weight: 0.5 },
      mud_season: { weight: 0.4 },
      weatherization: { weight: 0.3 },
    },

    addition_adu: {
      property_tax: {
        weight: 0.7,
        citation:
          'VT Dept of Taxes: New construction triggers supplemental tax bill from date of completion',
      },
      well_septic: {
        weight: 0.85,
        citation:
          'VT requires wastewater permit for any addition that increases design flow; ADU requires septic engineer evaluation',
      },
      contractor_vetting: {
        weight: 0.8,
        citation: 'High-stakes hire; VT Act 47 zoning compliance + permitting',
      },
      flood_zone: { weight: 0.5 },
      rebate_strat: { weight: 0.4 },
      kitchen: { weight: 0.3 },
    },

    rebate_strat: {
      heat_pump: { weight: 0.85 },
      weatherization: { weight: 0.9 },
      solar_battery: { weight: 0.7 },
      rebate_eligibility: { weight: 0.95 },
      contractor_vetting: { weight: 0.4 },
    },

    property_tax: {
      rebate_eligibility: { weight: 0.5 },
      addition_adu: { weight: 0.4 },
    },

    flood_zone: {
      addition_adu: { weight: 0.5 },
      contractor_vetting: { weight: 0.4 },
      well_septic: { weight: 0.4 },
    },

    rebate_eligibility: {
      rebate_strat: { weight: 0.95 },
      weatherization: { weight: 0.7 },
      heat_pump: { weight: 0.6 },
    },

    contractor_vetting: {
      kitchen: { weight: 0.7 },
      bath: { weight: 0.6 },
      addition_adu: { weight: 0.8 },
      outdoor: { weight: 0.5 },
      heat_pump: { weight: 0.4 },
      solar_battery: { weight: 0.3 },
    },

    general_orientation: {
      rebate_strat: { weight: 0.6 },
      contractor_vetting: { weight: 0.7 },
      property_tax: { weight: 0.5 },
      mud_season: { weight: 0.6 },
      well_septic: { weight: 0.5 },
    },

    mud_season: {
      outdoor: { weight: 0.4 },
      heat_pump: { weight: 0.3 },
      addition_adu: { weight: 0.4 },
    },

    well_septic: {
      addition_adu: { weight: 0.7 },
      flood_zone: { weight: 0.4 },
      property_tax: { weight: 0.2 },
    },
  },

  // ---------- Revenue tiers --------------------------------------------
  // Multiplier on the score for surfacing a topic with this CTA tier.
  // contractor_lead is 2x mid_tier because lead capture is our highest-
  // monetized path; info_only is heavily discounted because it has no
  // monetization and we already have plenty of info-only surfaces.
  revenueTiers: {
    contractor_lead: 3,
    mid_tier: 1.5,
    chat_handoff: 1,
    info_only: 0.3,
  },

  // ---------- Affiliate revenue assumptions ----------------------------
  // Used to score accessory kits as ticketSize × commission × CTR ×
  // conversion. Tune these against real GA4 data once revenue accrues.
  revenueAssumptions: {
    commissionRate: 0.035, // Amazon Associates avg 3-4.5%
    conversionRate: 0.12,  // industry: 8-15% of clicks convert
  },

  // ---------- CTA tier rules -------------------------------------------
  // Walked top-down — first match wins. Most specific rules first.
  ctaTierRules: [
    { when: { topic: 'addition_adu' }, tier: 'contractor_lead' },
    {
      when: {
        topic: ['heat_pump', 'kitchen', 'bath', 'solar_battery', 'outdoor', 'weatherization', 'rebate_strat'],
        townTier: ['resort_premium', 'burlington_metro'],
      },
      tier: 'contractor_lead',
    },
    {
      when: {
        topic: ['heat_pump', 'kitchen', 'bath', 'solar_battery', 'outdoor', 'weatherization', 'rebate_strat'],
      },
      tier: 'mid_tier',
    },
    {
      when: { topic: ['rebate_strat', 'rebate_eligibility'] },
      tier: 'chat_handoff',
    },
  ],

  // ---------- Engagement gate ------------------------------------------
  // Recommendations + accessory kits are gated until the visitor has
  // demonstrated engagement (we don't push affiliate links to a bouncing
  // visitor). Default: scroll past 40% OR 30s on page OR opened chat OR
  // clicked a cost-tier accordion.
  engagementGate: {
    scrollDepthPercent: 40,
    timeOnPageSeconds: 30,
    requireOneOf: ['scroll', 'chat', 'cost_tier', 'time'],
  },

  // ---------- Seasonal windows -----------------------------------------
  // Vermont calendar carved into 6 windows. deep_winter wraps year-end
  // (Dec 15 - Feb 28) — season-helpers handles that wrap.
  seasonalWindows: [
    { season: 'mud',             startMonth: 3,  startDay: 1,  endMonth: 5,  endDay: 14 },
    { season: 'spring_blackfly', startMonth: 5,  startDay: 15, endMonth: 6,  endDay: 14 },
    { season: 'lake',            startMonth: 6,  startDay: 15, endMonth: 9,  endDay: 14 },
    { season: 'fall_leaf',       startMonth: 9,  startDay: 15, endMonth: 10, endDay: 31 },
    { season: 'pre_winter',      startMonth: 11, startDay: 1,  endMonth: 12, endDay: 14 },
    { season: 'deep_winter',     startMonth: 12, startDay: 15, endMonth: 2,  endDay: 28 },
  ],

  // ---------- Seasonal topic boosts ------------------------------------
  // Topics that should rank higher when the season is right (heat pump
  // installs surge in fall / pre-winter as homeowners brace for heating
  // bills; outdoor work peaks in lake season + early fall, etc.).
  seasonalTopicBoosts: {
    weatherization: ['fall_leaf', 'pre_winter'],
    mud_season:     ['mud'],
    outdoor:        ['lake', 'fall_leaf'],
    heat_pump:      ['fall_leaf', 'pre_winter'],
  },

  // ---------- Lake town list -------------------------------------------
  // Used by isLakeProperty(). Includes Lake Champlain shoreline, Lake
  // Memphremagog, the Lakes Region (Greensboro, Hardwick, Calais),
  // Castleton/Bomoseen, Lakes Brookfield/Roxbury Pond, and the
  // Hyde Park / Morristown / Wolcott / Eden inland lake belt.
  lakeTowns: [
    'Burlington', 'Colchester', 'South Hero', 'Grand Isle',
    'North Hero', 'Alburgh', 'Charlotte', 'Shelburne',
    'Vergennes', 'Ferrisburgh', 'Addison', 'Panton',
    'Newport', 'Derby', 'Coventry', 'Charleston', 'Westmore',
    'Greensboro', 'Hardwick',
    'Castleton', 'Hubbardton', 'Benson', 'Sudbury',
    'Brookfield', 'Roxbury',
    'Calais', 'Marshfield', 'Cabot',
    'Wolcott', 'Eden', 'Hyde Park', 'Morristown',
  ],

  // ---------- Refund-risk flags ----------------------------------------
  // Personas where our data is thinner / outcomes are hard to predict.
  // We suppress contractor leads + accessory upsells for these because
  // a bad lead burns trust + costs us commission on a refund cycle.
  refundRiskFlags: [
    { name: 'mobile_home',   detect: 'topic_match',  triggers: ['mobile_home'] },
    { name: 'landlord',      detect: 'topic_match',  triggers: ['landlord', 'multi_unit'] },
    { name: 'accessibility', detect: 'topic_match',  triggers: ['accessibility', 'aging_in_place'] },
  ],

  // ---------- Reasoning templates --------------------------------------
  // One short sentence per (from→to) edge. Falls back to the 'default'
  // when an edge has no specific template.
  reasoningTemplates: {
    'heat_pump→weatherization':
      'EVT requires weatherization before paying out the heat pump rebate. Sequence and stack.',
    'heat_pump→solar_battery':
      'Heat pump + solar adds the EVT solar+storage incentive on top of your retrofit stack.',
    'heat_pump→rebate_strat':
      'Stacked rebates can hit $7-17k. Worth seeing what you actually qualify for.',
    'kitchen→bath':
      'Doing both at once cuts labor 15-20% with shared crews and one permit.',
    'kitchen→contractor_vetting':
      'Kitchen reno is the highest-stakes hire most homeowners make. Vet hard.',
    'solar_battery→outdoor':
      'Solar life is 25-30 years. If your roof has less than that, replace it first or pay $4-12k to remove + reinstall later.',
    'solar_battery→rebate_strat':
      'Federal 25D + EVT + net metering stacks here. Worth mapping.',
    'addition_adu→property_tax':
      'New construction triggers a supplemental tax bill. Plan for it.',
    'addition_adu→well_septic':
      'Adding a bedroom or ADU triggers a wastewater permit in VT. Engineer required.',
    'outdoor→solar_battery':
      'New roof? This is the moment to add solar before reinstall costs eat the budget.',
    'weatherization→heat_pump':
      'Weatherized homes need smaller, cheaper heat pumps.',
    'weatherization→rebate_strat':
      'EVT 75-90% cash back is the headline rebate. Worth checking eligibility.',
    'bath→kitchen':
      'Kitchen + bath combo cuts labor 15-20%. Shared crews and one permit.',
    'rebate_strat→heat_pump':
      'Heat pump is the highest-rebate path in Vermont.',
    'rebate_strat→weatherization':
      'Weatherization is the most-rebated project — 75-90% cash back through 2026.',
    default:
      'Often paired with this project.',
  },

  // ---------- Feature flags --------------------------------------------
  // V2 framing toggle ("Reading this for: Me / A buyer / A contractor")
  // is hidden in V4 but kept behind a flag so V5 can revive it without
  // re-implementing.
  featureFlags: {
    ENABLE_FRAMING_TOGGLE: false,
  },

  // ---------- V5: Revenue forest ---------------------------------------
  // Replaces V4's linear (ticket × CTR × commission × conversion) score.
  // Eight weighted features per kit, summed into a single revenue score.
  // inventoryDilution is intentionally negative — it penalizes a second
  // kit on the same topic so we get diversified placements, not two
  // outdoor furniture kits stacked on top of each other.
  //
  // Weight intuition:
  //   - topicAffinity (0.25): the strongest signal we have. If a visitor
  //     is on heat_pump, the smart_thermostat kit dominates.
  //   - clickThruRate (0.20): high-confidence signal — a kit with proven
  //     CTR has demonstrated revenue, regardless of ticket size.
  //   - seasonalAlignment (0.15): mud-season kit during mud season ranks
  //     above any general kit, and similar.
  //   - ticketSize (0.15): bigger basket = bigger expected commission,
  //     but it's a noisy signal so we don't over-weight it.
  //   - commissionRate (0.05): low variance across Amazon categories
  //     (3-4.5%), so it barely moves the score.
  //   - townTierMatch (0.05): resort_premium rewards higher-ticket kits;
  //     rural rewards lower-ticket kits.
  //   - engagementSignal (0.05): visitors past the gate are warmer.
  //   - inventoryDilution (-0.10): penalty when the same kit topic has
  //     already been placed on the page.
  //
  // Phase 2 (after 30 days of GA4 data): retune from real conversion data.
  // Phase 3 (after 100+ affiliate conversions): replace hand weights with
  // logistic regression coefficients fit on (features → click? buy?).
  revenueForest: {
    enabled: true,
    featureWeights: {
      topicAffinity:      0.25,
      seasonalAlignment:  0.15,
      ticketSize:         0.15,
      clickThruRate:      0.20,
      commissionRate:     0.05,
      townTierMatch:      0.05,
      engagementSignal:   0.05,
      inventoryDilution: -0.10,
    },
    normalizers: {
      maxTicketSize:     1500,
      maxClickThruRate:  0.10,
      maxCommissionRate: 0.05,
    },
  },

  // ---------- V5: Decision tree ----------------------------------------
  // Picks the per-visitor surface strategy. Branches are evaluated in
  // order; first match wins. refund_risk_suppress MUST be first so refund-
  // risk topics never receive upsells, regardless of intent or season.
  // Researching state always gets email_first (no affiliates) so we don't
  // burn that audience.
  decisionTree: {
    enabled: true,
    paths: [
      // Refund risk: zero upsell, no matter what. Must come first.
      {
        name: 'refund_risk_suppress',
        when: { refundRiskFlag: true },
        strategy: 'zero_upsell',
        kPrimary: 0,
        kRecommendation: 0,
      },

      // Researching: never push affiliates — push email instead.
      {
        name: 'researching_email_first',
        when: { intent: ['researching'] },
        strategy: 'email_first',
        kPrimary: 0,
        kRecommendation: 0,
      },

      // Lake property + outdoor + lake season = peak revenue path.
      {
        name: 'lake_season_outdoor_owner',
        when: {
          intent: ['owner'],
          topic: ['outdoor'],
          season: ['lake'],
          isLakeProperty: true,
        },
        strategy: 'aggressive_upsell',
        kPrimary: 2,
        kRecommendation: 2,
        forceKitIds: ['outdoor_furniture', 'outdoor_lighting'],
      },

      // Pre-winter heat-pump moment: smart thermostat + HVAC supplements.
      {
        name: 'prewinter_heat_pump',
        when: {
          intent: ['owner'],
          topic: ['heat_pump'],
          season: ['pre_winter', 'fall_leaf'],
        },
        strategy: 'aggressive_upsell',
        kPrimary: 2,
        kRecommendation: 2,
        forceKitIds: ['smart_thermostat', 'hvac_supplements'],
      },

      // Mud season window: highest CTR period of the year. Forest picks
      // the kit; the homepage seasonal strip surfaces mud_season_essentials.
      {
        name: 'mud_season_owner',
        when: {
          intent: ['owner'],
          season: ['mud'],
        },
        strategy: 'balanced',
        kPrimary: 2,
        kRecommendation: 2,
      },

      // Buying: first-year essentials only, no project recs (no project yet).
      {
        name: 'buying_balanced',
        when: { intent: ['buying'] },
        strategy: 'balanced',
        kPrimary: 1,
        kRecommendation: 0,
        forceKitIds: ['first_year_essentials'],
      },

      // Resort-premium owner: aggressive across the board.
      {
        name: 'resort_premium_owner',
        when: {
          intent: ['owner'],
          townTier: ['resort_premium'],
        },
        strategy: 'aggressive_upsell',
        kPrimary: 2,
        kRecommendation: 3,
      },

      // Default owner: balanced.
      {
        name: 'default_owner',
        when: { intent: ['owner'] },
        strategy: 'balanced',
        kPrimary: 2,
        kRecommendation: 2,
      },

      // Catch-all: zero upsell.
      {
        name: 'catch_all',
        when: {},
        strategy: 'zero_upsell',
        kPrimary: 0,
        kRecommendation: 0,
      },
    ],
  },

  // ---------- V5: Homepage ---------------------------------------------
  // Every homepage tunable lives here. Components carry zero magic
  // numbers. Town grid uses V4 TownBucket values (small_city / rural)
  // directly — V5 spec uses 'mid_tier' / 'rural_value' as positioning
  // language but the underlying data graph is unchanged.
  homepage: {
    enabled: true,
    sampleProperty: {
      address: 'Main Street, Stowe, VT',
      slug: 'main-street-stowe-vt',
      label: 'See a sample property →',
    },
    intentDemoLinks: {
      buying:      '/property/main-street-stowe-vt?intent=buying',
      owner:       '/property/main-street-stowe-vt?intent=owner&topic=heat_pump',
      researching: '/property/main-street-stowe-vt?intent=researching',
    },
    costWidget: {
      enabled: true,
      rows: [
        {
          label: 'Heat pump (ducted)',
          rangeLow: 11000,
          rangeHigh: 22000,
          rebateNote: 'EVT rebate up to $2,200',
          topicId: 'heat_pump',
        },
        {
          label: 'Kitchen mid-range remodel',
          rangeLow: 35000,
          rangeHigh: 65000,
          rebateNote: 'Combine with bath, save 15-20% on labor',
          topicId: 'kitchen',
        },
        {
          label: 'Solar 8kW + battery',
          rangeLow: 28000,
          rangeHigh: 42000,
          rebateNote: 'After federal 25D 30% credit',
          topicId: 'solar_battery',
        },
        {
          label: 'ADU build (900 sq ft)',
          rangeLow: 85000,
          rangeHigh: 175000,
          rebateNote: 'Plus VT wastewater permit, ~$2-5k',
          topicId: 'addition_adu',
        },
        {
          label: 'Whole-home weatherization',
          rangeLow: 4000,
          rangeHigh: 18000,
          rebateNote: 'EVT 75-90% cash back through end of 2026',
          topicId: 'weatherization',
        },
      ],
    },
    townGrid: {
      enabled: true,
      // V6 standalone town pages live at /{townSlug}. Each tile resolves
      // to a real content page with town-specific cost ranges, rebate
      // stack, contractor density notes, and FAQ.
      towns: [
        { town: 'Stowe',         townTier: 'resort_premium',   topServices: ['heat pump', 'kitchen', 'solar'],          pageSlug: 'stowe-vt' },
        { town: 'Burlington',    townTier: 'burlington_metro', topServices: ['kitchen', 'ADU', 'weatherization'],       pageSlug: 'burlington-vt' },
        { town: 'Vergennes',     townTier: 'small_city',       topServices: ['well/septic', 'ADU', 'outdoor'],          pageSlug: 'vergennes-vt' },
        { town: 'Montpelier',    townTier: 'small_city',       topServices: ['heat pump', 'weatherization', 'kitchen'], pageSlug: 'montpelier-vt' },
        { town: 'Manchester',    townTier: 'resort_premium',   topServices: ['kitchen', 'bath', 'outdoor'],             pageSlug: 'manchester-vt' },
        { town: 'Woodstock',     townTier: 'resort_premium',   topServices: ['heat pump', 'kitchen', 'addition'],       pageSlug: 'woodstock-vt' },
        { town: 'Middlebury',    townTier: 'small_city',       topServices: ['heat pump', 'weatherization', 'solar'],   pageSlug: 'middlebury-vt' },
        { town: 'Brattleboro',   townTier: 'small_city',       topServices: ['kitchen', 'weatherization', 'roof'],      pageSlug: 'brattleboro-vt' },
        { town: 'St. Johnsbury', townTier: 'rural',            topServices: ['heat pump', 'weatherization', 'roof'],    pageSlug: 'st-johnsbury-vt' },
      ],
    },
    seasonalStrip: {
      enabled: true,
      kitBySeason: {
        mud:             'mud_season_essentials',
        spring_blackfly: 'first_year_essentials',
        lake:            'outdoor_furniture',
        fall_leaf:       'diy_weatherization_tools',
        pre_winter:      'diy_weatherization_tools',
        deep_winter:     'smart_thermostat',
      },
      articleBySeason: {
        mud: {
          title: 'Vermont mud season homeowner guide',
          url: '/vermont-mud-season-homeowner-guide',
        },
        spring_blackfly: {
          title: 'Vermont spring blackfly season survival',
          url: '/vermont-spring-blackfly',
        },
        lake: {
          title: 'Vermont lake season homeowner guide',
          url: '/vermont-lake-season',
        },
        fall_leaf: {
          title: 'Vermont weatherization season guide',
          url: '/vermont-fall-leaf-weatherization',
        },
        pre_winter: {
          title: 'Vermont pre-winter prep guide',
          url: '/vermont-pre-winter-prep',
        },
        deep_winter: {
          title: 'Vermont deep winter homeowner guide',
          url: '/vermont-deep-winter',
        },
      },
    },
    trustStrip: {
      enabled: true,
      dataSources: [
        'VT Department of Taxes',
        'Efficiency Vermont',
        'Vermont DEC',
        'BED & VGS',
        'FEMA',
        'Vermont ANR Atlas',
      ],
      lastUpdatedNote: 'Updated monthly. Config 2026.05.02-v5.',
    },
    emailCapture: {
      enabled: true,
      promise: "We don't sell your data. We don't spam.",
      cadence: 'Once a month, max — seasonal warnings and rebate-deadline alerts.',
    },
    crossLinks: {
      mudSeasonArticle: '/vermont-mud-season-homeowner-guide',
      townsIndex:       '/towns',
      disclosure:       '/disclosure',
    },
  },
}
