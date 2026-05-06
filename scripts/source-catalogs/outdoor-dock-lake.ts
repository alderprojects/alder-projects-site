// scripts/source-catalogs/outdoor-dock-lake.ts
// V7.2.5 — Dock + lake practical maintenance catalog

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const OUTDOOR_DOCK_LAKE_TOPIC = 'outdoor'
export const OUTDOOR_DOCK_LAKE_SCOPE = 'outdoor_dock_lake'
export const OUTDOOR_DOCK_LAKE_SCENARIOS = [
  'lake_property',
  'just_starting',
  'already_have_basics',
  'tight_budget',
]

export const OUTDOOR_DOCK_LAKE_METADATA = {
  smartCartPromise:
    'Make the dock and lake setup safer and more usable without turning every issue into a rebuild.',
  primaryCustomerPain:
    "Lake-property dock issues escalate fast: rotted boards become pulled fasteners; pulled fasteners become loose rails; loose rails become injuries. Catching issues at the small-fix stage saves 10x the cost of a rebuild.",
  valueProposition:
    "$300-$800 of right-sized dock hardware and safety upgrades preserves the dock for 5-10 more years and eliminates the most common injury risks.",
  routeOutRules: [
    {
      condition: 'has_structural_dock_movement',
      destination: 'small_pro',
      reason:
        "Dock that shifts, rocks, or has settled posts is a structural problem. Hardware upgrades don't fix foundation issues. Get a marine pro or experienced contractor.",
    },
    {
      // V7.2.5 paste 4 — original source used 'contractor_worthy'
      // which is not a valid routeOutRules destination per paste 1
      // schema. Allowed: 'worth_it' | 'small_pro' | 'contractor' |
      // 'verify_first'. Mapped to 'contractor' (the closest fit).
      condition: 'planning_full_dock_replacement',
      destination: 'contractor',
      reason:
        "Full dock replacement at $5,000-$25,000+ is a contractor project. Smart Cart covers the maintenance window before replacement; replacement itself is contractor scope.",
    },
  ],
  seasonalUrgency: {
    season: 'spring_opening',
    deadline: '05-15',
    label:
      'Best by mid-May. Vermont lake properties open Memorial Day; dock hardware should be installed before guests arrive.',
  },
}

export const OUTDOOR_DOCK_LAKE_SLOTS: CartSlot[] = [
  {
    slotId: 'dock_lines',
    slotLabel: 'Dock lines / mooring rope',
    slotKind: 'core',
    conditionalOn: ['has_dock_lines'],
    tiers: {
      budget: {
        productName: 'Generic 1/2" nylon double-braid dock line, 25 ft (single)',
        priceLow: 15,
        priceHigh: 25,
        affiliateUrl:
          'https://www.amazon.com/s?k=nylon+double+braid+dock+line+25+foot&tag=alderprojects-20',
        productSpec:
          '1/2" diameter nylon. 25 ft length with eye-spliced loop. Generic brand. Single. Adequate for small boats or temporary mooring.',
      },
      sweet_spot: {
        productName: 'New England Ropes 5/8" double-braid dock lines (4-pack, 25 ft)',
        priceLow: 95,
        priceHigh: 145,
        affiliateUrl:
          'https://www.amazon.com/s?k=new+england+ropes+dock+line+5+8+inch+4+pack&tag=alderprojects-20',
        productSpec:
          '5/8" diameter premium-grade marine rope. 25 ft length with eye-spliced loops. 4-pack covers a typical boat (bow, stern, two springs). New England Ropes is the marine industry standard. Resists UV, mildew, and stretching.',
      },
      premium: {
        productName: 'Yale Cordage Sterling Lite High-Modulus Dock Line set',
        priceLow: 220,
        priceHigh: 380,
        affiliateUrl:
          'https://www.amazon.com/s?k=yale+cordage+sterling+lite+dock+line&tag=alderprojects-20',
        productSpec:
          'Pro-grade marine cordage. Dyneema-core for minimum stretch. Used on commercial boats and racing yachts. ~5x cost of standard nylon for ~3x the lifespan plus precise mooring.',
      },
    },
    slotPurpose:
      "Tie the boat to the dock without it drifting, banging the dock, or breaking free in storms.",
    whyItMatters:
      "Cheap rope stiffens, frays, and breaks. A broken dock line during a storm is how boats end up against rocks or floating loose at 3am.",
    commonMistake:
      "Sizing rope to boat weight rather than to dock cleat hardware. 1/2\" rope works for boats under 25 ft; 5/8\" is the standard for 25-35 ft. Cheap rope of any size eventually fails.",
    whyThis:
      "New England Ropes 5/8\" 4-pack covers the typical 25-30 ft boat with bow, stern, and two spring lines. Marine-grade nylon resists UV and mildew. Lasts 5-7 seasons in Vermont conditions.",
    whyNotCheaper:
      "Generic nylon stiffens within 1-2 seasons. The eye splices unravel; the rope chafes through at the cleat. The $15 saved means buying again next year.",
    whyNotPremium:
      "Yale Cordage is for boats where mooring precision matters (racing, expensive yachts). For a typical Vermont lake property dock, the New England Ropes line is the right tier.",
    contextNote:
      "Always have at least 4 lines per boat: bow, stern, and two spring lines (forward and aft). Lines should be 1.5-2x the boat length for good shock absorption.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'dock_bumpers',
      reason:
        "You have lines. The next-step gap is bumpers between boat and dock — without them, the lines do all the work and the hull and dock both wear.",
    },
    citations: [
      'New England Ropes product documentation',
      'Marine line sizing standards',
    ],
  },
  {
    slotId: 'dock_bumpers',
    slotLabel: 'Dock bumpers / fenders',
    slotKind: 'core',
    conditionalOn: ['has_dock_bumpers'],
    tiers: {
      budget: {
        productName: 'Generic vinyl boat fenders (4-pack)',
        priceLow: 35,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=boat+fenders+vinyl+4+pack&tag=alderprojects-20',
        productSpec:
          'Inflatable vinyl fenders, ~6.5" x 23". 4-pack with hanging lines. Adequate for small boats; ~3-5 year life in Vermont sun.',
      },
      sweet_spot: {
        productName: 'Taylor Made hull bumper / dock bumper combo',
        priceLow: 80,
        priceHigh: 145,
        affiliateUrl:
          'https://www.amazon.com/s?k=taylor+made+hull+bumper+dock&tag=alderprojects-20',
        productSpec:
          'Marine-grade closed-cell vinyl. UV-stable. 6"-8" diameter sizes available. Mounts on boat or dock. Lasts 8-10 years in normal use. Taylor Made is the marine standard.',
      },
      premium: {
        productName: 'Polyform G-series fender set with line bag',
        priceLow: 200,
        priceHigh: 320,
        affiliateUrl:
          'https://www.amazon.com/s?k=polyform+g+series+fender+set&tag=alderprojects-20',
        productSpec:
          'Premium marine fenders. Highly UV-resistant. Inflatable for storage. Used on commercial and high-end recreational boats.',
      },
    },
    slotPurpose:
      "Cushion the boat-dock interface so neither one wears or damages.",
    whyItMatters:
      "Without bumpers, hull and dock contact each other directly. Wave action becomes daily impact. Hull paint chips, dock boards crack at contact points, fasteners loosen. Bumpers absorb the impact.",
    whyThis:
      "Taylor Made is the marine standard for the price. Closed-cell vinyl resists puncture, UV, and weather. 8-10 year life in typical Vermont conditions.",
    whyNotCheaper:
      "Generic vinyl fenders work for 3-5 years before UV degradation makes them brittle and they crack under impact. The Taylor Made earns its premium in lifespan alone.",
    whyNotPremium:
      "Polyform G-series is pro-grade for boats over 30 ft or harsh marine environments (saltwater, ocean spray). For Vermont freshwater, Taylor Made is right-sized.",
    contextNote:
      "Mount bumpers on the boat (move with the boat) for daily mooring. Mount on the dock for visiting boats or where the dock contacts at fixed points.",
    citations: [
      'Taylor Made marine product documentation',
      'Boat fender material durability',
    ],
  },
  {
    slotId: 'dock_marine_hardware',
    slotLabel: 'Marine-grade stainless hardware (replacement set)',
    slotKind: 'core',
    conditionalOn: ['has_marine_hardware'],
    tiers: {
      sweet_spot: {
        productName: '316 stainless steel marine bolts + nuts + washers (assortment)',
        priceLow: 38,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=316+stainless+steel+marine+hardware+bolt+nut+washer&tag=alderprojects-20',
        productSpec:
          '316 marine-grade stainless steel. ~50-piece assortment of common sizes (1/4\", 5/16\", 3/8\" diameter, 1\" to 4\" lengths). Fits most cleats, eye bolts, dock hardware. 316 is the marine standard — does NOT corrode in freshwater or saltwater.',
      },
    },
    slotPurpose:
      "Replace rusted, corroded, or undersized fasteners on dock cleats, eye bolts, and structural connections.",
    whyItMatters:
      "Galvanized hardware rusts within 1-3 seasons in lake water. Zinc-plated hardware rusts faster. 304 stainless rusts in saltwater (Vermont freshwater is fine for 304); 316 stainless is the universal marine standard. Wrong fasteners on dock hardware = injuries when they fail.",
    commonMistake:
      "Using zinc-plated or galvanized hardware on dock connections. Looks fine for 6 months, fails by year 2. The wet/dry cycle accelerates corrosion. Always 316 stainless on anything submerged or splashed.",
    whyThis:
      "316 stainless assortment kit covers the common sizes. ~$45 once, lasts the lifetime of the dock.",
    whyNotCheaper:
      "Galvanized hardware is half the price; lifespan is 1-3 seasons vs 30+ for 316 stainless. The math favors stainless once you account for replacement cycles.",
    whyNotPremium:
      "There's no real premium tier. 316 stainless is the right material; brand variation is small.",
    contextNote:
      "Inspect dock hardware annually. Pulled-out lag bolts at cleats are the #1 dock failure point. Replace any showing rust streaks.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'dock_lighting',
      reason:
        "Hardware is current. The next-step gap is dock lighting for evening safety — most dock injuries happen in low light.",
    },
    citations: [
      '316 stainless steel marine corrosion testing',
      'Dock hardware standards',
    ],
  },
  {
    slotId: 'dock_lighting',
    slotLabel: 'Dock edge lighting',
    slotKind: 'core',
    conditionalOn: ['has_dock_lighting'],
    tiers: {
      budget: {
        productName: 'Generic solar dock lights (4-pack)',
        priceLow: 25,
        priceHigh: 50,
        affiliateUrl:
          'https://www.amazon.com/s?k=solar+dock+lights+4+pack&tag=alderprojects-20',
        productSpec:
          'Solar-powered LED dock edge lights. Adhesive or screw mount. Auto-on at dusk. Battery degrades within 1-2 seasons. Cheap, but high replacement frequency.',
      },
      sweet_spot: {
        productName: 'Dock Edge LED rope lighting kit (low-voltage, 50 ft)',
        priceLow: 95,
        priceHigh: 165,
        affiliateUrl:
          'https://www.amazon.com/s?k=dock+edge+led+rope+lighting+50+ft&tag=alderprojects-20',
        productSpec:
          'Low-voltage 12V LED rope. 50 ft length. Marine-rated waterproof connectors. Plug-in transformer. Dusk-to-dawn timer included. 5-7 year life. Dock Edge is the marine industry standard for residential dock lighting.',
      },
      premium: {
        productName: 'Hardwired marine LED dock lights with motion sensor',
        priceLow: 280,
        priceHigh: 480,
        affiliateUrl:
          'https://www.amazon.com/s?k=hardwired+marine+led+dock+lights+motion+sensor&tag=alderprojects-20',
        productSpec:
          'Hardwired (requires electrician), motion-activated marine LED fixtures. Used on commercial docks. ~10-year service life.',
      },
    },
    slotPurpose:
      "Light the dock edge after dark for safe walking and boat approach.",
    whyItMatters:
      "Slips and falls on docks happen mostly in low light. Dock edge lighting is the highest-leverage safety upgrade after the bumpers and lines are sound.",
    commonMistake:
      "Buying solar lights that fail in 1-2 seasons. The Vermont winter freezes the batteries; UV degrades the housings. Solar is fine for visual marking; for actual reliable light, hardwired or low-voltage transformer is the right call.",
    whyThis:
      "Dock Edge low-voltage rope kit is the marine-standard residential dock lighting. 50 ft of continuous edge lighting, weatherproof connectors, dusk-to-dawn timing. Reliable for 5-7 years.",
    whyNotCheaper:
      "Solar lights look great in marketing photos and fail consistently in real cold-climate lake conditions. The $25-50 saved buys a 1-year solution at most.",
    whyNotPremium:
      "Hardwired marine lights are for commercial docks or where motion sensing is required. For residential dock safety lighting, the rope kit covers all needs.",
    contextNote:
      "Run the rope along the outboard edge of the dock so light shines toward the water — illuminates the edge for walkers AND approaching boats. Cover the wire with rubber edge guard so it doesn't get caught on shoes.",
    citations: [
      'Dock Edge product documentation',
      'Marine LED lighting durability',
    ],
  },
  {
    slotId: 'dock_ladder',
    slotLabel: 'Dock ladder (swim ladder)',
    slotKind: 'core',
    conditionalOn: ['has_dock_ladder'],
    tiers: {
      budget: {
        productName: 'Generic 4-step dock ladder (telescoping)',
        priceLow: 65,
        priceHigh: 110,
        affiliateUrl:
          'https://www.amazon.com/s?k=dock+ladder+4+step+telescoping&tag=alderprojects-20',
        productSpec:
          'Aluminum 4-step telescoping ladder. ~150 lb capacity. Mounts to dock edge. Adequate for kids and adult use; flex under load.',
      },
      sweet_spot: {
        productName: 'JIF Marine 5-step heavy-duty ladder with poly steps',
        priceLow: 185,
        priceHigh: 270,
        affiliateUrl:
          'https://www.amazon.com/s?k=jif+marine+5+step+heavy+duty+dock+ladder&tag=alderprojects-20',
        productSpec:
          'Welded aluminum frame, polyethylene steps (warmer underfoot than aluminum), 350 lb capacity, 5-step depth handles deeper water. Lifetime warranty on frame. JIF Marine is the marine industry standard.',
      },
      premium: {
        productName: 'Custom welded stainless steel ladder with grab handles',
        priceLow: 450,
        priceHigh: 800,
        affiliateUrl:
          'https://www.amazon.com/s?k=stainless+steel+dock+ladder+custom+grab+handle&tag=alderprojects-20',
        productSpec:
          'Custom-fabricated marine stainless. Premium aesthetic and lifespan. 30+ year service life.',
      },
    },
    slotPurpose:
      "Safe entry/exit from the water at the dock.",
    whyItMatters:
      "A wobbly or rusted ladder is a primary injury vector. Older adults, kids, and tipsy adults all rely on the ladder to get out of the water — making it sturdy is a safety basic, not a luxury.",
    commonMistake:
      "Telescoping ladders that flex under load. They feel sturdy at the top but bow at the middle, throwing balance. The welded-frame ladder doesn't flex.",
    whyThis:
      "JIF Marine 5-step is the verified marine pick. Polyethylene steps are warmer than aluminum (matters when the ladder is in the sun), 350 lb capacity handles all guests, lifetime frame warranty. Rust-resistant aluminum handles freshwater fine.",
    whyNotCheaper:
      "Generic 4-step ladders work for small kids and lightweight adults. Once you have heavier guests or arthritis-affected joints, the cheaper ladder feels unsafe.",
    whyNotPremium:
      "Custom stainless ladders are 30-year products and aesthetic statements. JIF Marine delivers the same safety profile.",
    contextNote:
      "Match the step count to your typical water depth. 4-step is fine for shallow shorelines; 5-step is right for typical lakeshore. 6-step exists for deep-water docks.",
    citations: [
      'JIF Marine product documentation',
      'Dock ladder safety standards',
    ],
  },
  {
    slotId: 'dock_mildew_cleaner',
    slotLabel: 'Mildew cleaner (decking + furniture)',
    slotKind: 'core',
    conditionalOn: ['has_mildew_cleaner'],
    tiers: {
      sweet_spot: {
        productName: '30% Hydrogen peroxide outdoor cleaner OR Wet & Forget concentrate',
        priceLow: 22,
        priceHigh: 40,
        affiliateUrl:
          'https://www.amazon.com/s?k=wet+and+forget+outdoor+cleaner+concentrate&tag=alderprojects-20',
        productSpec:
          'Wet & Forget is a no-rinse outdoor cleaner. 32 oz concentrate makes ~5 gallons of usable solution. Apply, walk away, rain rinses it. Effective on dock boards, vinyl furniture, fabric. ~$30 covers full dock area.',
      },
    },
    slotPurpose:
      "Remove green mildew and algae buildup on dock boards and outdoor surfaces without aggressive scrubbing.",
    whyItMatters:
      "Mildew on dock boards is slippery — the algae that looks green and harmless is the cause of most dock slips. Annual cleaning prevents the surface from getting glossy-slippery.",
    whyThis:
      "Wet & Forget is the verified no-effort solution. Apply with a pump sprayer once a year (early summer), walk away. It works over weeks, killing mildew at the spore level. No scrubbing, no pressure washing required.",
    whyNotCheaper:
      "Bleach works but damages wood and kills nearby plants in runoff. Wet & Forget targets only the mildew without collateral damage.",
    whyNotPremium:
      "Premium 'marine-only' cleaners exist for $50+; they do the same job as Wet & Forget at twice the price.",
    contextNote:
      "Apply on a dry, mild-temperature day with no rain forecast for 6 hours. The product needs time to penetrate before being washed off.",
    citations: [
      'Wet & Forget product documentation',
      'Dock surface mildew prevention guidance',
    ],
  },
  {
    slotId: 'dock_storage_bin',
    slotLabel: 'Weatherproof dock storage bin',
    slotKind: 'addon',
    conditionalOn: ['has_dock_storage'],
    tiers: {
      budget: {
        productName: 'Suncast 50-gallon resin deck box',
        priceLow: 65,
        priceHigh: 110,
        affiliateUrl:
          'https://www.amazon.com/s?k=suncast+50+gallon+resin+deck+box&tag=alderprojects-20',
        productSpec:
          '50-gallon capacity. Resin construction, weather-resistant. Lockable lid. ~$80. Adequate for life jackets, fishing tackle, dock essentials.',
      },
      sweet_spot: {
        productName: 'Suncast 73-gallon premium resin storage bench (with seating)',
        priceLow: 145,
        priceHigh: 220,
        affiliateUrl:
          'https://www.amazon.com/s?k=suncast+73+gallon+resin+storage+bench&tag=alderprojects-20',
        productSpec:
          '73-gallon capacity. Doubles as bench seating (350 lb capacity). Resin construction with darker UV-resistant pigment. Lockable. Holds 4 life jackets, 2 paddles, fishing gear, dock cleaner, tools. ~$170.',
      },
    },
    slotPurpose:
      "Centralize lake essentials at the dock so they're at hand and not running back and forth to the house.",
    whyItMatters:
      "Without dockside storage, every visit involves trips back to the house for forgotten items. The bin removes that friction and keeps things dry.",
    commonMistake:
      "Oversized dock boxes that trap moisture. A 100+ gallon box with poor ventilation grows mildew on everything stored inside. Right-sized with breathing slots is the correct approach.",
    whyThis:
      "Suncast 73-gallon doubles as a bench, which is genuinely useful at a dock. Holds the standard load of lake gear without being so big that things get lost in it.",
    whyNotCheaper:
      "50-gallon is fine for minimal needs (4 life jackets, basic tools). Most lake families need more capacity.",
    whyNotPremium:
      "Premium teak or cedar dock boxes are aesthetic statements at $400-800. Same storage function.",
    citations: ['Suncast product line documentation'],
  },
  {
    slotId: 'dock_non_slip_strips',
    slotLabel: 'Anti-slip strips for dock surface',
    slotKind: 'addon',
    conditionalOn: ['has_non_slip_strips'],
    tiers: {
      sweet_spot: {
        productName: 'Marine-grade anti-slip tape (4 inch x 60 ft)',
        priceLow: 32,
        priceHigh: 55,
        affiliateUrl:
          'https://www.amazon.com/s?k=marine+anti+slip+tape+4+inch+60+ft&tag=alderprojects-20',
        productSpec:
          'Same product family as outdoor_deck_refresh stair grip — universe entry reused via additive tag merge. Marine-rated extra-coarse grit. 60 ft covers full dock plus stairs.',
      },
    },
    slotPurpose:
      "Prevent slips on wet dock boards, especially the stairs from dock to lake or shore.",
    whyItMatters:
      "Wet dock boards combined with mildew are the most slippery surface on the property. Anti-slip strips at high-traffic spots (dock entry, stairs, ladder approach) reduce slip injuries.",
    whyThis:
      "Marine-grade variant of the deck refresh tape. Cross-scope reuse — same product, reapplied for dock-specific use.",
    citations: ['Cross-scope universe reuse pattern'],
  },
]

export const OUTDOOR_DOCK_LAKE_SKIP_LIST: SkipItem[] = [
  {
    id: 'skip_zinc_hardware_marine',
    type: 'wrong_version',
    title: 'Zinc-plated or galvanized hardware on dock connections',
    marketingPitch: 'Standard hardware, half the price.',
    realReason:
      "Looks fine for 6 months. Rusts within 1-3 seasons in lake water. The wet/dry cycle accelerates corrosion. Cleat or eye-bolt failure under load is how dock injuries happen. Always 316 stainless on anything submerged or splashed.",
    amountSaved: { low: 25, high: 50 },
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Marine fastener corrosion testing'],
  },
  {
    id: 'skip_solar_dock_lights',
    type: 'wrong_version',
    title: 'Solar dock lights as primary lighting',
    marketingPitch: 'No wiring, no electricity bill.',
    realReason:
      "Solar dock lights fail in 1-2 seasons. Vermont winter freezes the batteries; UV degrades the housings. They look great in spring marketing photos and rarely make it to year 3. Low-voltage rope lighting with a transformer is the right tier for residential dock lighting.",
    amountSaved: { low: 60, high: 120 },
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Solar light cold-climate failure data'],
  },
  {
    id: 'skip_oversized_dock_box',
    type: 'wrong_version',
    title: 'Oversized dock storage boxes (100+ gallons)',
    marketingPitch: 'Maximum storage capacity.',
    realReason:
      "Large bins with poor ventilation trap moisture. Within one season, contents grow mildew and the bin smells. Right-size to actual storage need (50-75 gallons typical) plus breathing slots. The 100+ gallon bin is the wrong shape for the wet-gear use case.",
    amountSaved: { low: 80, high: 200 },
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Dock storage moisture management'],
  },
  {
    id: 'skip_cheap_rope_dock',
    type: 'wrong_version',
    title: 'Cheap braided polypropylene rope as dock lines',
    marketingPitch: 'Lightweight, inexpensive marine rope.',
    realReason:
      "Polypropylene floats (good) but stiffens, fades, and frays within 1-2 seasons. Polypropylene also has lower break strength than nylon. For dock lines, marine-grade nylon double-braid is the right material; polypropylene is for ski tow ropes and casual use.",
    amountSaved: { low: 25, high: 60 },
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Marine rope fiber comparison'],
  },
  {
    id: 'skip_premium_marine_no_problem',
    type: 'wrong_category',
    title: 'Premium marine gear before any specific problem exists',
    realReason:
      "Yale Cordage rope, Polyform fenders, custom stainless ladders are upgrades you make when something specific isn't working. Buying them all preemptively at $1,500+ is over-engineering. Start with the sweet-spot tier and upgrade specific items as you identify weaknesses.",
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Dock gear upgrade sequencing'],
  },
  {
    id: 'skip_dock_movement_hardware',
    type: 'wrong_category',
    title: 'Hardware upgrades on a dock with structural movement',
    realReason:
      "If your dock rocks, sways, or has settled posts, hardware upgrades don't fix it. The dock has structural problems. New cleats on a wobbly dock just creates a stronger handle for wave loads — and the underlying structure still fails. Get a marine pro or experienced contractor.",
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Dock structural assessment guidance'],
  },
  {
    id: 'skip_decorative_lake_hardware',
    type: 'wrong_category',
    title: 'Decorative cast-iron / nautical-themed dock hardware',
    realReason:
      "Cast iron rusts in lake conditions even with paint. The 'old maritime' look at $200+ for cleats and rings is a 2-year aesthetic. 316 stainless or marine bronze are the materials that actually survive — and they look fine.",
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Dock hardware material durability'],
  },
  {
    id: 'skip_dock_box_subscription',
    type: 'wrong_category',
    title: 'Subscription dock-supply services',
    realReason:
      "Recurring delivery of dock essentials at $20-50/month. The supplies last 3-5 years; you don't need monthly delivery. Marketing construct.",
    appliesToScope: ['outdoor_dock_lake'],
    citations: ['Subscription service applicability'],
  },
]

export const OUTDOOR_DOCK_LAKE_SCENARIO_DEFAULTS = {
  lake_property: { selectedTier: 'sweet_spot', alreadyHave: [] },
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_dock_lines', 'has_dock_bumpers'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
}
