// V7.2.18 — Memorial Day weekend Smart Cart scope.
//
// Time-bound seasonal scope (May 10-27, 2026). Editorial layer maps
// onto existing outdoor universe entries: gas_grill, grill_cover,
// outdoor_cushion, outdoor_string_lights, outdoor_side_table.
//
// Propane top-off and meat thermometer items from the source content
// live in valueProposition prose rather than as resolved slots — those
// product categories are not yet in the universe.

import type { ScopeCatalog } from '@/lib/smart-cart-model'
import { FN } from '../universe'

export const MEMORIAL_DAY_WEEKEND: ScopeCatalog = {
  topic: 'outdoor',
  scopeVariantId: 'memorial_day_weekend',
  scenarios: ['just_starting', 'tight_budget', 'premium', 'lake_property'],

  slots: [
    // ---------- Gas grill (Memorial Day window) -------------------
    {
      slotId: 'md_gas_grill',
      slotLabel: 'Gas grill — Memorial Day window',
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
        "Memorial Day is one of two real Weber promo windows (late August is the other). $499 this weekend vs $579 normal. Three burners handle 8+ people. Porcelain-coated grates that survive Vermont winters under a cover.",
      whyNotCheaper:
        "Sub-$300 gas grills die in 2 Vermont seasons. The $249 box-store grill is $125-per-year; the $499 Weber Spirit at 8+ years is $62-per-year.",
      whyNotPremium:
        "Premium grills (BGE, Kamado Joe, Traeger) almost never discount Memorial Day. BGE Large is $1,099 at every VT dealer this weekend. Late July is the real premium buy window.",
      citations: [
        'Weber Spirit II E-310 Amazon listing (B077JTCMKQ)',
        'Memorial Day 2026 Weber promo tracking — verified May 13-15',
      ],
    },

    // ---------- Outdoor cushion pair (addon, if needed) -----------
    {
      slotId: 'md_outdoor_cushion_pair',
      slotLabel: 'Sunbrella replacement cushion pair (if needed)',
      slotKind: 'addon',
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
        "Buy ONLY if you have existing chairs that need new cushions THIS weekend. Real Sunbrella fabric, not the knockoffs. Cushion clearance is September — but if you need them now, buy two not eight. Most hosts overbuy.",
      whyNotCheaper:
        "Cheap polyester cushions fade and mold by August. Sunbrella holds up 5+ seasons in Vermont sun and rain.",
      whyNotPremium:
        "Frontgate cushion sets are $200+ per pair for the same Sunbrella spec. Pay for fabric, not branding.",
      warnings: [
        'Real clearance is September — 30-50% off. If you can wait, wait.',
      ],
      citations: [
        'Sunbrella fabric spec sheet',
        'Memorial Day 2026 cushion price tracking',
      ],
    },

    // ---------- String lights (commercial-grade) ------------------
    {
      slotId: 'md_string_lights',
      slotLabel: 'Outdoor string lights — commercial-grade',
      slotKind: 'core',
      conditionalOn: ['has_outdoor_lights'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorStringLights],
          excludeAlreadyHaveFlag: 'has_outdoor_lights',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorStringLights],
          excludeAlreadyHaveFlag: 'has_outdoor_lights',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorStringLights],
          excludeAlreadyHaveFlag: 'has_outdoor_lights',
          tier: 'premium',
        },
      },
      whyThis:
        "Brightech commercial-grade or the Costco bundle does the same job as Pottery Barn / RH / Frontgate at a quarter of the price. Vermont mosquitos are why you want lights, not aesthetic — function over name.",
      whyNotCheaper:
        "Sub-$30 string lights have weaker insulation and the bulbs blow in the first thunderstorm. Commercial-grade is the floor.",
      whyNotPremium:
        "Pottery Barn / RH / Frontgate string lights are at MSRP this weekend. Spec-for-spec, Brightech is the same product at 1/4 the price.",
      contextNote:
        'See /guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights for the full spec comparison.',
      citations: [
        'Brightech vs designer string light spec comparison (alderprojects.com)',
      ],
    },

    // ---------- Grill cover (addon) -------------------------------
    {
      slotId: 'md_grill_cover',
      slotLabel: 'Weber-fit grill cover',
      slotKind: 'addon',
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
        "Add only if you bought a new grill in the buy list. Skip the generic $20 Amazon covers — they tear in one Vermont winter. Weber-fit cover is $40 and lasts 4-5 seasons.",
      whyNotCheaper:
        "Generic universal covers trap moisture and tear at the seams. Weather-rated only on the label.",
      whyNotPremium:
        '"Marine-grade" $120+ covers are for boat decks. Overkill for a grill under an eave.',
      citations: [],
    },

    // ---------- Side table (addon) --------------------------------
    {
      slotId: 'md_side_table',
      slotLabel: 'Folding prep / side table',
      slotKind: 'addon',
      conditionalOn: ['has_side_table'],
      tierQueries: {
        budget: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorSideTable],
          excludeAlreadyHaveFlag: 'has_side_table',
          tier: 'budget',
        },
        sweet_spot: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorSideTable],
          excludeAlreadyHaveFlag: 'has_side_table',
          tier: 'sweet_spot',
        },
        premium: {
          mustHaveTopics: ['outdoor'],
          mustHaveFunctions: [FN.outdoorSideTable],
          excludeAlreadyHaveFlag: 'has_side_table',
          tier: 'premium',
        },
      },
      whyThis:
        "If your grill doesn't have integrated side shelves: $35 folding table beats balancing a platter on a chair arm. Skip if your Genesis already has shelves.",
      whyNotPremium:
        "Permanent prep stations are a winter-storage problem. Folding is right for Vermont.",
      citations: [],
    },
  ],

  // ---------- Skip list (6 items from source) ----------------------
  skipList: [
    {
      id: 'md_skip_premium_grill',
      type: 'wrong_version',
      title: 'Premium grill (BGE, Kamado Joe, Traeger) on Memorial Day',
      marketingPitch: 'Once-a-year Memorial Day pricing on premium grills.',
      realReason:
        "Premium grills almost never discount Memorial Day. BGE Large is $1,099 at every VT dealer this weekend, same as last weekend, same as next month. The real BGE buy window is late July — Father's Day clearance into early-summer inventory rotation.",
      amountSaved: { low: 200, high: 600 },
      appliesToScope: ['memorial_day_weekend'],
      citations: ['BGE pricing tracking May 2026'],
    },
    {
      id: 'md_skip_full_patio_set',
      type: 'wrong_version',
      title: 'Full patio dining set on Memorial Day',
      marketingPitch: 'Up to 40% off complete patio sets this weekend!',
      realReason:
        "Peak demand pricing through October. Year-best clearance hits November. If you can wait six months, you save 40-60%. If you absolutely cannot wait, the Lake Season guide has the $2,400 lean approach instead of the $7,500 catalog setup.",
      amountSaved: { low: 600, high: 2800 },
      appliesToScope: ['memorial_day_weekend'],
      citations: ['Memorial Day 2026 patio set price tracking'],
    },
    {
      id: 'md_skip_designer_string_lights',
      type: 'wrong_version',
      title: 'Pottery Barn / RH / Frontgate string lights',
      marketingPitch: 'Designer outdoor string lights — set the lakeside mood.',
      realReason:
        "At MSRP this weekend. Brightech commercial-grade at Costco does the same job for a quarter of the price. The string light comparison guide breaks down spec-for-spec — they're not actually better, just more expensive.",
      amountSaved: { low: 60, high: 220 },
      appliesToScope: ['memorial_day_weekend'],
      citations: [
        'Brightech vs Pottery Barn vs RH string light comparison (alderprojects.com)',
      ],
    },
    {
      id: 'md_skip_md_branded_bundles',
      type: 'wrong_version',
      title: '"Memorial Day BBQ bundle" packages',
      marketingPitch: 'Everything for the weekend — grill + cover + tools + thermometer in one box.',
      realReason:
        "Bundle pricing is consistently 15-25% above buying components separately. The grill + cover + tools + thermometer starter bundle at $649 is the grill ($499) + a $40 cover + a $25 thermometer + tongs you already own — $85 markup for nothing.",
      amountSaved: { low: 80, high: 200 },
      appliesToScope: ['memorial_day_weekend'],
      citations: ['Memorial Day 2026 bundle vs component price tracking'],
    },
    {
      id: 'md_skip_glass_top_table',
      type: 'wrong_category',
      title: 'Glass-top patio dining table',
      realReason:
        "Wrong product for Vermont regardless of price. Cracks from ice every winter. The replacement glass is $200-400 and a 6-week lead time when you actually need it (June, mid-season). Either Polywood or aluminum top — never glass.",
      appliesToScope: ['memorial_day_weekend'],
      citations: [],
    },
    {
      id: 'md_skip_wicker_outdoor',
      type: 'wrong_category',
      title: 'Wicker or rattan outdoor furniture',
      realReason:
        'Mold magnet. Dead in two lake seasons regardless of "all-weather" marketing claims. Resin wicker is better than natural but still loses to poly lumber or aluminum for VT.',
      appliesToScope: ['memorial_day_weekend'],
      citations: [],
    },
  ],

  scenarioDefaults: {
    just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
    tight_budget: { selectedTier: 'budget', alreadyHave: [] },
    premium: { selectedTier: 'premium', alreadyHave: [] },
    lake_property: { selectedTier: 'sweet_spot', alreadyHave: [] },
  },

  smartCartPromise:
    'The lean cookout cart for Memorial Day weekend — real deals on Weber + commercial-grade lights, skip the peak-priced patio markups.',
  primaryCustomerPain:
    "Memorial Day is heavily marketed and about a third of it is real. The rest is peak-pricing dressed up with a flag graphic.",
  valueProposition:
    "Build the cookout setup for under $720 (vs $1,280 typical) by buying the genuine deals — Weber Spirit, commercial-grade lights, targeted essentials — and waiting on the premium grill, full patio set, and designer accents for their real discount windows in July, September, and November. Propane top-off and a $25 ThermoPro thermometer round out the weekend.",
  seasonalUrgency: {
    season: 'memorial_day_weekend',
    deadline: '05-27',
    label: 'Memorial Day pricing window closes Tuesday',
  },
}
