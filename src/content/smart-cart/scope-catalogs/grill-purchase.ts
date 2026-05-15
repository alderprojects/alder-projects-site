// V7.2.18 — Grill purchase Smart Cart scope.
//
// Year-round grill-buying scope (active April-September). Editorial
// layer maps onto existing outdoor universe entries: gas_grill,
// grill_cover, grill_tools.
//
// Propane setup, lump charcoal, smoker box, and BGE / Kamado Joe
// kamado content from source live in valueProposition and skip-list
// prose — those product categories are not yet in the universe.

import type { ScopeCatalog } from '@/lib/smart-cart-model'
import { FN } from '../universe'

export const GRILL_PURCHASE: ScopeCatalog = {
  topic: 'outdoor',
  scopeVariantId: 'grill_purchase',
  scenarios: ['just_starting', 'already_have_basics', 'tight_budget', 'premium'],

  slots: [
    // ---------- Gas grill (3 tiers) -------------------------------
    {
      slotId: 'grill_purchase_gas_grill',
      slotLabel: 'Gas grill — your tier',
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
        "Weber Spirit II E-310 is the honest answer for 80% of buyers. Three burners (enough for two-zone cooking), porcelain-coated grates, 5-10 year warranty Weber actually honors. Survives Vermont winters under a cover. $499 on Memorial Day, $549 most of the year, $499-579 baseline.",
      whyNotCheaper:
        "Char-Broil / Nexgrill 3-burner generic — Vermont winters kill these in 2 seasons. The $249 box-store grill is a $125-per-year cost. The $499 Weber Spirit at 8+ years is $62-per-year. False economy.",
      whyNotPremium:
        "Weber Genesis is the build-quality upgrade most can skip. Stainless cookbox vs Spirit's porcelain-enameled is the real difference, not cooking ability. Worth it if you host weekly and budget allows. Skip the kamado tier (BGE, Kamado Joe) unless you're serious about long smoking sessions — for once-a-week burgers it's a $1,400 overspend.",
      warnings: [
        'Buy a Weber-fit cover with the grill. Generic covers tear in one Vermont winter.',
        'If your patio has overhang, no cover needed. If exposed, the cover pays for itself.',
      ],
      citations: [
        'Weber Spirit II E-310 Amazon listing (B077JTCMKQ)',
        'Weber 10-year warranty terms',
      ],
    },

    // ---------- Grill cover ---------------------------------------
    {
      slotId: 'grill_purchase_cover',
      slotLabel: 'Grill cover (brand-fit)',
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
        "Buy the brand-fit Weber Premium cover, not the generic Amazon $20 cover that tears in one winter. The $40-80 Weber cover lasts 4-7 seasons and is sized to specific Spirit or Genesis model.",
      whyNotCheaper:
        "Generic universal-fit covers trap moisture and seams tear in the first ice storm.",
      whyNotPremium:
        '"Marine-grade" $120+ covers are for boat-deck exposure. Overkill for a grill on a covered patio.',
      citations: [],
    },

    // ---------- Grill tools (addon, sweet_spot only) --------------
    {
      slotId: 'grill_purchase_tools',
      slotLabel: 'Grilling tools (3-piece set)',
      slotKind: 'addon',
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
        'Weber 3-piece (spatula, tongs, fork), stainless, dishwasher-safe. $30-48 for the set vs $60+ buying individually. Skip the $129 "starter bundle" — that\'s $40 of tools and $89 of nylon storage case.',
      whyNotCheaper:
        "Sub-$15 single-piece tools bend at the joint within a season. Buy the matched set.",
      whyNotPremium:
        "Pro-line tools ($80+) are for restaurant kitchens. Overkill for backyard.",
      citations: ['Weber accessories product line'],
    },
  ],

  // ---------- Skip list (5 items from source) ----------------------
  skipList: [
    {
      id: 'grill_skip_under_300',
      type: 'wrong_version',
      title: 'Any grill under $300',
      marketingPitch: '"Full-size 3-burner gas grill — $249!"',
      realReason:
        "Vermont winters kill these in 2 seasons. The $249 box-store grill is $125-per-year. The $499 Weber Spirit at 8+ years is $62-per-year. False economy.",
      amountSaved: { low: 200, high: 400 },
      appliesToScope: ['grill_purchase'],
      citations: [],
    },
    {
      id: 'grill_skip_smart_wifi',
      type: 'wrong_category',
      title: '"Smart" Wi-Fi grills (Brisk-It, GE Profile, etc.)',
      realReason:
        'Firmware deprecates in 3-5 years and the manufacturer stops pushing updates. The $1,400 "smart" grill becomes a $1,400 regular grill with a broken app. Buy a $25 ThermoPro thermometer with a phone app instead.',
      amountSaved: { low: 400, high: 1200 },
      appliesToScope: ['grill_purchase'],
      citations: [],
    },
    {
      id: 'grill_skip_starter_bundles',
      type: 'wrong_version',
      title: 'Pre-bundled "grilling starter kit" tools',
      marketingPitch: '12-piece grilling kit in a zippered case — $129!',
      realReason:
        "The $129 bundle is $40 of tools and $89 of nylon storage case. Buy a long-handled spatula ($12), tongs ($15), and a thermometer ($25) separately and you're done.",
      amountSaved: { low: 60, high: 100 },
      appliesToScope: ['grill_purchase'],
      citations: [],
    },
    {
      id: 'grill_skip_extended_warranty',
      type: 'wrong_category',
      title: 'Extended warranty / protection plan',
      realReason:
        "Standard Weber / BGE warranties already cover the parts most likely to fail. Extended warranties pay out on <8% of claims industry-wide. Pure margin for the retailer.",
      appliesToScope: ['grill_purchase'],
      citations: [],
    },
    {
      id: 'grill_skip_pellet_lock_in',
      type: 'wrong_version',
      title: 'Pellet grill starter pack with proprietary pellets',
      marketingPitch: 'Traeger starter pack — pellet grill + 20lb proprietary pellet bag.',
      realReason:
        "If you're considering pellet, the lock-in pellet pricing is the trap. Traeger pellets are 2x generic hardwood pellets at the same quality. Skip the bundle; buy generic hardwood pellets in bulk.",
      amountSaved: { low: 60, high: 180 },
      appliesToScope: ['grill_purchase'],
      citations: [],
    },
  ],

  scenarioDefaults: {
    just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
    already_have_basics: {
      selectedTier: 'sweet_spot',
      alreadyHave: ['has_grill_tools'],
    },
    tight_budget: { selectedTier: 'budget', alreadyHave: [] },
    premium: { selectedTier: 'premium', alreadyHave: [] },
  },

  smartCartPromise:
    "The right grill for your actual use case, without the upsell — and the real buy window for premium gear if you're going there.",
  primaryCustomerPain:
    'Picking a grill is a $400 to $3,000 decision and the upsell is brutal. The premium tier almost never discounts on holidays; the budget tier dies in two seasons.',
  valueProposition:
    "Weber Spirit + Weber-fit cover + 3-piece tool set lands at $565-695 — vs $1,100+ for the marketed starter bundle. If kamado (BGE Large, Kamado Joe Classic III) is your serious answer, the real buy window is late July, not Memorial Day. The Weber vs BGE vs Kamado Joe comparison guide walks through which one fits.",
  routeOutRules: [
    {
      condition: 'wants_premium_kamado_now',
      destination: 'verify_first',
      reason:
        "Premium kamados (BGE, Kamado Joe) don't meaningfully discount before late July. If you're committed, wait 8 weeks for the real promo window — $200-500 savings on a $1,500+ grill.",
    },
  ],
}
