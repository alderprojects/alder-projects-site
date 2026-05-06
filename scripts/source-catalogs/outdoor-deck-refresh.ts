// scripts/source-catalogs/outdoor-deck-refresh.ts
// V7.2.5 — Deck surface refresh catalog

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const OUTDOOR_DECK_REFRESH_TOPIC = 'outdoor'
export const OUTDOOR_DECK_REFRESH_SCOPE = 'outdoor_deck_refresh'
export const OUTDOOR_DECK_REFRESH_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'premium',
]

export const OUTDOOR_DECK_REFRESH_METADATA = {
  smartCartPromise:
    'Spend $150-$1,500 to refresh or stabilize a deck surface before jumping into replacement.',
  primaryCustomerPain:
    "Vermont decks see hard freeze-thaw cycles, ice melt, snow shovels, and intense summer UV. By year 8-12, the deck looks tired and the obvious thought is replacement at $15,000-$40,000. Often a $200-$1,500 refresh restores it for another 5-7 years.",
  valueProposition:
    "If framing is sound and only the surface is weathered, refresh defers replacement by 5-7 years and produces visibly better results than letting it slide. The math is real: $1,200 refresh vs $25,000 replacement for the same end-state in year 1.",
  routeOutRules: [
    {
      condition: 'has_framing_concerns',
      destination: 'small_pro',
      reason:
        "If you see soft spots, sagging joists, or rot in the framing (not just surface boards), you're past refresh. Get a structural assessment before spending money on stain.",
    },
    {
      condition: 'deck_over_15_years_old',
      destination: 'verify_first',
      reason:
        "Vermont decks over 15 years deserve a structural inspection before refresh investment. If framing has 1-2 years left, refresh is throwing money at the wrong problem.",
    },
  ],
  seasonalUrgency: {
    season: 'pre_summer',
    deadline: '06-01',
    label:
      "Best by June 1. Deck stain needs 3-5 dry days for proper cure; Vermont's wet spring narrows the window.",
  },
}

export const OUTDOOR_DECK_REFRESH_SLOTS: CartSlot[] = [
  // ============================================================
  // SLOT 1: Deck cleaner
  // ============================================================
  {
    slotId: 'deck_cleaner',
    slotLabel: 'Deck cleaner / brightener',
    slotKind: 'core',
    conditionalOn: ['has_clean_deck'],
    tiers: {
      budget: {
        productName: 'Generic oxalic acid wood deck cleaner (1 gallon)',
        priceLow: 18,
        priceHigh: 28,
        affiliateUrl:
          'https://www.amazon.com/s?k=oxalic+acid+deck+cleaner+gallon&tag=alderprojects-20',
        productSpec:
          'Oxalic acid concentrate. Dilute with water. Cleans and brightens wood. ~$20/gallon. Treat 200-400 sq ft.',
      },
      sweet_spot: {
        productName: 'Cabot Wood Brightener (1 gallon)',
        priceLow: 22,
        priceHigh: 35,
        affiliateUrl:
          'https://www.amazon.com/s?k=cabot+wood+brightener+gallon&tag=alderprojects-20',
        productSpec:
          "Two-part cleaner: oxalic-acid based brightener that neutralizes weather-grayed wood and prepares for stain. Pairs with Cabot stains. Treats 300-500 sq ft per gallon.",
      },
      premium: {
        productName: 'Restore-A-Deck two-step cleaner + brightener kit',
        priceLow: 60,
        priceHigh: 90,
        affiliateUrl:
          'https://www.amazon.com/s?k=restore-a-deck+cleaner+brightener+kit&tag=alderprojects-20',
        productSpec:
          'Professional 2-step kit: cleaner first (removes mildew, dirt), brightener second (restores wood color). Kit pricing covers ~500 sq ft. Pro-grade results.',
      },
    },
    slotPurpose:
      "Remove weather-induced graying, mildew, and surface dirt before any stain or sealer.",
    whyItMatters:
      "Stain over dirty/grayed wood looks stained, not refreshed. The cleaner restores the wood color and surface texture so the stain bonds properly and the result looks intentional, not patched.",
    commonMistake:
      "Pressure washing too aggressively. High-pressure (>1,500 PSI) on softwood deck boards causes 'fuzzing' that requires sanding to fix. Use 1,000-1,200 PSI maximum.",
    whyThis:
      "Cabot is the cabinet-shop standard for deck prep. Brightener does the job and pairs cleanly with Cabot stains for color match.",
    whyNotCheaper:
      "Generic oxalic acid works but you mix yourself; mistakes dilute incorrectly. Cabot's pre-formulated blend is foolproof.",
    whyNotPremium:
      "Restore-A-Deck 2-step is for severely weathered decks needing deep restoration. For most refresh projects, the 1-step Cabot Brightener is sufficient.",
    contextNote:
      "Apply on cool overcast day, NOT hot direct sun. Sun causes uneven drying and streaks.",
    warnings: [
      "Wear nitrile gloves and eye protection. Oxalic acid is mildly corrosive on skin.",
      "Rinse plants and surrounding shrubs with water before and after — runoff can yellow leaves.",
      "Wait 48 hours after cleaning before applying stain. Wood must be dry below 15% moisture.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'deck_brightener',
      reason:
        "You've cleaned. The next-step gap is brightening (separate from cleaning) — restores wood color before stain.",
    },
    whenToSkip: [
      'Deck was cleaned within last 4 weeks',
      'Composite decking (no wood to brighten)',
    ],
    citations: [
      'Cabot Wood Brightener product documentation',
      'Restore-A-Deck product line',
      'Wood deck preparation guidance',
    ],
  },

  // ============================================================
  // SLOT 2: Deck brush
  // ============================================================
  {
    slotId: 'deck_brush',
    slotLabel: 'Deck brush (long-handle stiff bristle)',
    slotKind: 'core',
    conditionalOn: ['has_deck_brush'],
    tiers: {
      sweet_spot: {
        productName: 'Quickie 18" deck scrub brush with telescoping handle',
        priceLow: 22,
        priceHigh: 35,
        affiliateUrl:
          'https://www.amazon.com/s?k=quickie+deck+scrub+brush+telescoping+handle&tag=alderprojects-20',
        productSpec:
          '18" bristle head, stiff bristles for paint/stain removal. Telescoping handle to 60". Threaded for extension poles. Dishwasher-handle compatible.',
      },
    },
    slotPurpose:
      "Apply cleaner and brightener to the deck surface; agitate dirt out of the wood grain.",
    whyItMatters:
      "Cleaner without agitation is 50% less effective. The brush is what makes the chemistry work — sprayed on and not scrubbed leaves dirt in the grain.",
    whyThis:
      "Quickie is the standard pro-grade deck brush. Stiff enough to scrub, soft enough not to scratch wood. Telescoping handle saves your back.",
    whyNotCheaper:
      "$10 brushes shed bristles into the deck and lose stiffness within one use.",
    whyNotPremium:
      "Power scrubbers exist but for residential decks the manual brush works fine and avoids the rental/storage hassle.",
    citations: ['Quickie product line documentation'],
  },

  // ============================================================
  // SLOT 3: Moisture meter
  // ============================================================
  {
    slotId: 'deck_moisture_meter',
    slotLabel: 'Moisture meter (verify before staining)',
    slotKind: 'core',
    conditionalOn: ['has_moisture_meter'],
    tiers: {
      budget: {
        productName: 'Generic pin-type moisture meter',
        priceLow: 15,
        priceHigh: 28,
        affiliateUrl:
          'https://www.amazon.com/s?k=pin+type+moisture+meter+wood&tag=alderprojects-20',
        productSpec:
          'Two-pin contact meter. Reads 0-100% wood moisture. Inexpensive, generally accurate above 5%. ~$20.',
      },
      sweet_spot: {
        productName: 'General Tools MMD4E pin-and-pinless moisture meter',
        priceLow: 38,
        priceHigh: 55,
        affiliateUrl:
          'https://www.amazon.com/s?k=general+tools+mmd4e+moisture+meter&tag=alderprojects-20',
        productSpec:
          'Both pin-type (contact) and pinless (surface scan) modes. LCD display with color coding. ~$40. Long-loved by reviewers.',
      },
    },
    slotPurpose:
      "Confirm wood is dry enough to stain. Wood above 15% moisture rejects stain and the result peels.",
    whyItMatters:
      "Staining wet wood is the most common deck-refresh failure. Stain doesn't bond, peels in 6-12 months, and you're stripping and re-staining. A $40 meter prevents the most common $500 mistake.",
    whyThis:
      "MMD4E has both pin and pinless modes. Pinless lets you scan without poking holes; pin gives precise readings. The dual mode is worth $20 over a pin-only meter.",
    whyNotCheaper:
      "Pin-only meters are fine for verifying. The pinless mode of the better meter is faster and doesn't damage already-stained boards.",
    whyNotPremium:
      "Pro-grade ($150+) meters add features for hardwood flooring, drywall, etc. For a deck refresh, the General Tools is enough.",
    citations: ['General Tools MMD4E documentation', 'Deck staining moisture standards'],
  },

  // ============================================================
  // SLOT 4: Deck stain / sealer
  // ============================================================
  {
    slotId: 'deck_stain_sealer',
    slotLabel: 'Deck stain / sealer (5 gallon bucket)',
    slotKind: 'core',
    conditionalOn: ['has_recent_stain'],
    tiers: {
      budget: {
        productName: 'Behr Premium Semi-Transparent Weatherproofing Stain (5 gallon)',
        priceLow: 175,
        priceHigh: 230,
        affiliateUrl:
          'https://www.amazon.com/s?k=behr+premium+semi+transparent+deck+stain+5+gallon&tag=alderprojects-20',
        productSpec:
          'Semi-transparent oil-based weatherproofing stain. ~$190/5gal. Covers 300-450 sq ft per gallon. 3-year warranty in shaded areas; less in direct sun.',
      },
      sweet_spot: {
        productName: 'Cabot Australian Timber Oil (1 gallon)',
        priceLow: 65,
        priceHigh: 90,
        amazonAsin: 'B000K6HBKG',
        affiliateUrl: 'https://www.amazon.com/dp/B000K6HBKG?tag=alderprojects-20',
        productSpec:
          'Penetrating oil + alkyd hybrid. 3-way oil protection. Covers 350-500 sq ft per gallon. Multiple natural-toned colors. 2-3 year recoat cycle in Vermont. Reviewer favorite for cedar and pressure-treated.',
      },
      premium: {
        productName: 'Sherwin-Williams SuperDeck Solid Color (5 gallon)',
        priceLow: 220,
        priceHigh: 320,
        affiliateUrl:
          'https://www.amazon.com/s?k=sherwin+williams+superdeck+solid+5+gallon&tag=alderprojects-20',
        productSpec:
          'Acrylic solid-color deck stain. Highest opacity, longest-lasting (4-6 year recoat). Hides imperfections and old stain bleed-through. Heavy-bodied; requires brushing and back-rolling for proper coverage.',
      },
    },
    slotPurpose:
      "Protect the deck wood from UV degradation, water absorption, and seasonal expansion/contraction.",
    whyItMatters:
      "Vermont weather is brutal: deep freeze, snow load, intense summer UV. Untreated wood degrades 4x faster than treated. A 3-year recoat cycle preserves the deck for 15+ years; without stain, replacement is 8-12.",
    commonMistake:
      "Buying solid-color stain when the deck is in good condition. Solid stain is for hiding age. If your deck is sound and you want it to look like wood, semi-transparent or transparent is the right choice.",
    whyThis:
      "Cabot Australian Timber Oil is the best penetrating oil-finish for Vermont's freeze-thaw cycles. Penetrating finishes don't peel; they wear and fade evenly. Recoat without stripping.",
    whyNotCheaper:
      "Behr Premium is fine for shaded decks. In direct Vermont sun, the 3-year warranty is generous; real-world life is 2 years before recoat. Cabot lasts longer at modest premium.",
    whyNotPremium:
      "Sherwin SuperDeck solid color is the right call for old, weathered decks where you can't get the wood to look uniform. For decks in good condition, solid color hides what you want to show.",
    contextNote:
      "Color choice matters. Lighter stains show wear; darker hide it. For Vermont (heavy use, dirt, leaves), mid-tone browns are most forgiving. Test on a small area first.",
    warnings: [
      "Apply on overcast days when deck temperature is 50-90°F. Hot sun causes lap marks and uneven drying.",
      "Always back-brush after rolling — eliminates streaks and ensures penetration into grain.",
      "Reapply every 2-3 years for penetrating stains. Don't wait until peeling.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'stair_grip_strips',
      reason:
        "Deck is sealed. The next-step gap is safety on stairs — non-slip grip strips are the highest-leverage safety addition for stairs that have lost grip from age.",
    },
    citations: [
      'Cabot Australian Timber Oil product documentation',
      'Sherwin-Williams SuperDeck product line',
      'Behr Premium Weatherproofing documentation',
      'Reviewer aggregations on deck stain durability in Northeast climate',
    ],
  },

  // ============================================================
  // SLOT 5: Exterior screws
  // ============================================================
  {
    slotId: 'deck_exterior_screws',
    slotLabel: 'Exterior deck screws (1 lb assortment)',
    slotKind: 'core',
    conditionalOn: [],
    tiers: {
      sweet_spot: {
        productName: 'Deckmate or GRK exterior deck screws, 2.5"-3.5", 1 lb',
        priceLow: 22,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=deckmate+grk+deck+screws+exterior+coated&tag=alderprojects-20',
        productSpec:
          'Coated exterior deck screws. T25 star drive (less stripping than Phillips). Self-countersinking head. ~$25/lb (200 screws). Sized 2.5" for board attachment, 3" for joist hangers.',
      },
    },
    slotPurpose:
      "Replace popped, rusted, or stripped deck screws during refresh.",
    whyItMatters:
      "Loose screws are a trip hazard and accelerate wood damage at the screw hole. Refresh is the right window to replace them — wood is dry, surface is open.",
    commonMistake:
      "Using interior screws outdoors. Standard drywall screws rust within months in a damp deck environment. Always coated or stainless for outdoor use.",
    whyThis:
      "Deckmate (Lowe's) and GRK are reviewer-validated. The T25 star drive is much harder to strip than Phillips, especially when working overhead.",
    whyNotCheaper:
      "Bulk packs are ~$15 but mixed quality. The branded T25 is consistently better for the small price difference.",
    whyNotPremium:
      "Stainless steel screws ($60+/lb) are for permanent installations on cedar or where corrosion is severe (coastal, salt-spray). For most residential refreshes, coated steel is fine.",
    contextNote:
      "Replace ALL screws that have backed out, not just the obvious ones. The wood is moving and tightening one means another is stressed.",
    citations: ['Deckmate, GRK fastener documentation'],
  },

  // ============================================================
  // SLOT 6: Stair grip strips
  // ============================================================
  {
    slotId: 'deck_stair_grip',
    slotLabel: 'Anti-slip stair tread strips',
    slotKind: 'addon',
    conditionalOn: ['has_stair_grip'],
    tiers: {
      sweet_spot: {
        productName: 'Heavy-duty anti-slip black tape (4 inch x 30 ft)',
        priceLow: 22,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=anti+slip+stair+tread+tape+4+inch+30+ft&tag=alderprojects-20',
        productSpec:
          '4" wide adhesive grit tape. ~30 ft roll. Cut to fit each tread. Black. 5-7 year typical life on covered stairs; 3-4 on exposed. Coarse PEVA grit; high-friction.',
      },
    },
    slotPurpose:
      "Prevent slips on deck stairs, especially after stain reduces wood texture.",
    whyItMatters:
      "Slip-and-fall on deck stairs is the most common deck-related injury. Stain restores beauty but reduces grip. Grip strips restore safety without sacrificing aesthetics.",
    whyThis:
      "Anti-slip tape is the right material — visible enough to be noticed in low light, long-lasting. 4\" x 30 ft roll covers most residential stair runs.",
    whyNotCheaper:
      "Cheap rubber mats lift at the corners and become a worse trip hazard. Tape stays put.",
    whyNotPremium:
      "Cast aluminum stair nosing exists but for residential refresh, it's overkill.",
    contextNote:
      "Apply when stain is fully cured (7+ days). Adhesive needs to bond to cured stain, not fresh.",
    citations: ['Anti-slip stair products documentation'],
  },

  // ============================================================
  // SLOT 7: Pressure washer (rent vs buy)
  // ============================================================
  {
    slotId: 'deck_pressure_washer',
    slotLabel: 'Pressure washer (rent first, buy second)',
    slotKind: 'addon',
    conditionalOn: ['has_pressure_washer'],
    tiers: {
      budget: {
        productName: 'Home Depot rental: 2,500 PSI gas pressure washer (4-hour)',
        priceLow: 65,
        priceHigh: 95,
        affiliateUrl:
          'https://www.homedepot.com/c/SF_Pressure_Washer_Rental?tag=alderprojects-20',
        productSpec:
          'Rental from Home Depot Tool Rental Center. ~$80/4 hours. Includes nozzles. Bring fuel; return clean.',
      },
      sweet_spot: {
        productName: 'Sun Joe SPX3000 electric pressure washer (2,030 PSI)',
        priceLow: 145,
        priceHigh: 195,
        affiliateUrl:
          'https://www.amazon.com/s?k=sun+joe+spx3000+electric+pressure+washer&tag=alderprojects-20',
        productSpec:
          'Electric, 2,030 PSI, 1.76 GPM. Sufficient for residential decks. 35 ft cord, 5 nozzles. Storage on the unit. ~$160. Reviewer-validated for occasional use.',
      },
      premium: {
        productName: 'Generac SpeedWash 3,200 PSI gas pressure washer',
        priceLow: 380,
        priceHigh: 520,
        affiliateUrl:
          'https://www.amazon.com/s?k=generac+3200+psi+pressure+washer&tag=alderprojects-20',
        productSpec:
          'Gas, 3,200 PSI, 2.7 GPM. Pro-grade for serious deck/siding work. ~$450. Worth it if you have a large property and use 4+ times per year.',
      },
    },
    slotPurpose:
      "Surface preparation for deck refresh — removes loose dirt, grayed wood fibers, embedded mildew.",
    whyItMatters:
      "Pressure washing reduces hand-scrubbing time from 4 hours to 1 hour for a typical deck. The right pressure (1,000-1,500 PSI) cleans without fuzzing the wood.",
    commonMistake:
      "Buying a pressure washer for a one-time deck refresh. The rental at $80 is much cheaper than ownership unless you use it 4+ times per year.",
    whyThis:
      "If you only need it for the deck refresh, rent. If you have siding to wash, walkway to clean, and a deck — buy the Sun Joe. The math: rental break-even is ~3 uses per year.",
    whyNotCheaper:
      "Rental is genuinely cheaper for one-time use. The Sun Joe is the right buy if you're committing to ongoing use.",
    whyNotPremium:
      "Gas pressure washers are pro-grade for large decks/siding/walkways. For a typical 200-400 sq ft residential deck, electric is sufficient and quieter.",
    contextNote:
      "Use 25° or 40° fan nozzle, NEVER 0° (pencil jet). 0° destroys wood. Stay 12+ inches from surface; closer fuzzes the wood.",
    warnings: [
      "Wear eye protection. Pressure washers fling debris.",
      "Stay 12+ inches from wood. Closer than 6\" causes 'fuzzing' that requires sanding to fix.",
      "Avoid pressure washing in direct hot sun — uneven drying causes streaks.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'deck_brightener',
      reason:
        "You have a pressure washer. The next-step is a brightener to neutralize and brighten the wood after pressure washing.",
    },
    citations: [
      'Sun Joe SPX3000 reviews',
      'Home Depot tool rental pricing',
      'Pressure washer technique guidance',
    ],
  },

  // ============================================================
  // SLOT 8: Board repair tools (cat's paw + cut-off saw)
  // ============================================================
  {
    slotId: 'deck_board_repair',
    slotLabel: 'Board repair tools (selective replacement)',
    slotKind: 'addon',
    conditionalOn: ['has_repair_tools', 'all_boards_sound'],
    tiers: {
      sweet_spot: {
        productName: "Cat's paw (nail puller) + multi-tool blade + spare deck boards",
        priceLow: 35,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=cats+paw+nail+puller+oscillating+multi+tool+blade&tag=alderprojects-20',
        productSpec:
          "Cat's paw / pry bar (~$15) + oscillating multi-tool blade for flush cuts (~$15) + 1-2 replacement deck boards (varies by deck width, $20-30). Tools for selective board replacement during refresh.",
      },
    },
    slotPurpose:
      "Replace 1-3 individual rotten or damaged boards during refresh, not the whole deck.",
    whyItMatters:
      "Most decks have 1-3 boards in trouble shape and the rest sound. Selective replacement is much cheaper than full re-deck and the new boards weather to match the rest within a season.",
    whyThis:
      "Cat's paw + multi-tool blade is the right kit for prying old boards and cutting flush at the joist. New boards same dimension as existing.",
    whyNotCheaper:
      "There's no real cheaper version. Tools and lumber prices are what they are.",
    whyNotPremium:
      "Pneumatic deck-board removal tools exist but for 1-3 boards, manual is fine.",
    contextNote:
      "Match new board dimensions to existing — Vermont decks of various ages have different actual dimensions of 'standard' lumber. Take an old board to the lumber yard.",
    warnings: [
      "Treat new boards before installing. Pre-treat the cut ends with stain to prevent uneven wear.",
    ],
    routeOutOfSmartCartIf: [
      {
        condition: 'multiple_rotten_joists',
        destination: 'small_pro',
        reason:
          "Multiple bad joists indicate framing issues beyond surface refresh. Get a structural assessment.",
      },
    ],
    citations: ['Selective deck board replacement guidance'],
  },
]

export const OUTDOOR_DECK_REFRESH_SKIP_LIST: SkipItem[] = [
  // ===== Type A =====
  {
    id: 'skip_stain_before_dry',
    type: 'wrong_version',
    title: 'Staining before deck moisture is below 15%',
    marketingPitch: '"Apply over slightly damp wood for best penetration."',
    realReason:
      "This is wrong. Stain over damp wood (above 15% moisture) doesn't bond and peels within 6-12 months. The marketing claim about 'damp wood penetration' applies to specific water-based products, not the oil-based stains most homeowners use. Buy a moisture meter, verify dry, then stain.",
    amountSaved: { low: 0, high: 0 },
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Cabot, Sherwin SuperDeck application guidance'],
  },
  {
    id: 'skip_pressure_wash_too_hard',
    type: 'wrong_version',
    title: 'Pressure washing at 3,000+ PSI on softwood',
    marketingPitch: 'Maximum cleaning power for tough surfaces.',
    realReason:
      "High pressure on softwood deck boards (cedar, pine, fir) causes 'fuzzing' — fibers torn from the wood surface. The fuzz then needs sanding to remove or your stain looks rough. 1,200 PSI maximum on softwood. Above 2,000 PSI is for masonry, not wood.",
    amountSaved: { low: 0, high: 50 },
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Pressure washer pressure guidelines for wood'],
  },
  {
    id: 'skip_replace_boards_check_framing',
    type: 'wrong_version',
    title: 'Replacing surface boards before checking framing',
    marketingPitch: 'New boards on existing framing — quick fix.',
    realReason:
      "If the framing is rotting, new boards on top fail in 2-3 years. The boards rest on rotting joists; the joists keep rotting; everything fails. Inspect framing FIRST. If joists are sound, surface refresh works. If not, you're past Smart Cart's scope.",
    amountSaved: { low: 200, high: 800 },
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Deck framing inspection guidance'],
  },
  {
    id: 'skip_hidden_fasteners_old_framing',
    type: 'wrong_version',
    title: 'Hidden fastener systems for old uneven framing',
    marketingPitch: 'Clean look, no visible screws.',
    realReason:
      "Hidden fastener systems (Camo, etc.) require precise board edges and even framing. On a 15-year-old Vermont deck with framing that has shifted, hidden fasteners squeak, lift, and require re-tightening. The visible screw is honest. Save the hidden fastener for new construction.",
    amountSaved: { low: 50, high: 150 },
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Hidden fastener installation requirements'],
  },
  {
    id: 'skip_interior_screws_outdoors',
    type: 'wrong_version',
    title: 'Interior screws (drywall, etc.) outdoors',
    marketingPitch: 'Universal screws.',
    realReason:
      "Drywall screws and other interior fasteners rust within months in a damp deck environment. Rust streaks the wood, weakens the connection, and you're replacing all of them in 1-2 years anyway. Always exterior-rated coated or stainless.",
    amountSaved: { low: 5, high: 15 },
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Exterior fastener corrosion testing'],
  },
  {
    id: 'skip_stain_over_mildew',
    type: 'wrong_version',
    title: 'Staining over visible mildew',
    marketingPitch: '"Mildew-blocking" stains.',
    realReason:
      "Mildew under stain doesn't disappear; it grows under the seal and causes the stain to bubble and peel. Clean with bleach + brightener FIRST. The 'mildew-blocking' claims are for prevention going forward, not for hiding existing growth.",
    amountSaved: { low: 0, high: 0 },
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['EPA mold/mildew remediation guidance'],
  },

  // ===== Type B =====
  {
    id: 'skip_complete_deck_kit',
    type: 'wrong_category',
    title: '"Complete deck restoration kit" with everything bundled',
    realReason:
      "These kits ($200-300) bundle cleaner, brightener, stain, sealer, and tools. The bundle is convenience pricing and often includes products that don't fit your specific deck. Buy each component for your specific deck size and condition; you'll save $50-100 and get the right amounts.",
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Per-component vs kit pricing analysis'],
  },
  {
    id: 'skip_composite_deck_resurfacing',
    type: 'wrong_category',
    title: 'Resurfacing products for composite decking',
    realReason:
      "Composite deck boards (Trex, TimberTech) don't take stain. The boards are colored throughout, not surface-finished. 'Resurfacing' products marketed for composite are decorative coatings that wear in 1-2 years and look worse than the original. If your composite is faded, it's faded — refresh isn't a real option.",
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Composite decking surface treatment limitations'],
  },
  {
    id: 'skip_cleaning_with_bleach_only',
    type: 'wrong_category',
    title: 'Bleach-only deck cleaning',
    realReason:
      "Bleach kills mildew but doesn't restore wood color or remove gray. After bleach, the deck looks bleached, not refreshed. Use the proper cleaner (oxalic acid base) plus brightener — that's what restores color. Bleach as the only treatment is the wrong tool.",
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Wood deck restoration chemistry'],
  },
  {
    id: 'skip_pressure_washer_for_deck_only',
    type: 'wrong_category',
    title: 'Buying a pressure washer for a one-time deck refresh',
    realReason:
      "Rental at $80 is much cheaper than $200+ ownership for a single use. The break-even point is 3+ uses per year. If you only do the deck once every 2-3 years, rent. If you have siding, walkway, and other surfaces, buy.",
    appliesToScope: ['outdoor_deck_refresh'],
    citations: ['Tool rental vs ownership economics'],
  },
]

export const OUTDOOR_DECK_REFRESH_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_pressure_washer', 'has_deck_brush', 'has_repair_tools'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
  premium: { selectedTier: 'premium', alreadyHave: [] },
}
