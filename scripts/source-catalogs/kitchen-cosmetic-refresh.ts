// V7.2.4 — Source catalog (chat-curated) for kitchen_cosmetic_refresh.
// Verbatim from the v7.2.4 spec. Ingested into universe + scope
// catalog by scripts/ingest-catalog.ts (manually for v7.2.4).

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const KITCHEN_COSMETIC_REFRESH_TOPIC = 'kitchen'
export const KITCHEN_COSMETIC_REFRESH_SCOPE = 'kitchen_cosmetic_refresh'
export const KITCHEN_COSMETIC_REFRESH_SCENARIOS = [
  'just_starting', 'already_have_basics', 'tight_budget', 'premium'
]

export const KITCHEN_COSMETIC_REFRESH_SLOTS: CartSlot[] = [
  {
    slotId: 'kitchen_cabinet_paint',
    slotLabel: 'Cabinet enamel paint (1 gallon)',
    slotKind: 'core',
    conditionalOn: ['has_painted_cabinets_recently'],
    tiers: {
      budget: {
        productName: 'Behr Alkyd Semi-Gloss Enamel (1 gallon)',
        priceLow: 42,
        priceHigh: 55,
        affiliateUrl: 'https://www.amazon.com/s?k=behr+alkyd+enamel+semi+gloss+gallon&tag=alderprojects-20',
        productSpec: 'Hybrid alkyd enamel formulated for cabinets and trim. Sold at Home Depot. Water-based cleanup. Fewer reviews than INSL-X but verified by professional painters as a budget alkyd that works.'
      },
      sweet_spot: {
        productName: 'INSL-X Cabinet Coat Acrylic Urethane Satin (1 gallon, white)',
        priceLow: 75,
        priceHigh: 95,
        amazonAsin: 'B07KXLPCG1',
        affiliateUrl: 'https://www.amazon.com/dp/B07KXLPCG1?tag=alderprojects-20',
        productSpec: 'Urethane-acrylic waterborne enamel made by Benjamin Moore. 350-450 sq ft per gallon. Adheres to polyurethane and varnish without primer. Resists chipping, scuffing, food stains, grease, and water. Apply between 50-90°F.'
      },
      premium: {
        productName: 'Benjamin Moore Advance Waterborne Alkyd Satin (1 gallon)',
        priceLow: 80,
        priceHigh: 95,
        affiliateUrl: 'https://www.amazon.com/s?k=benjamin+moore+advance+gallon&tag=alderprojects-20',
        productSpec: 'Premium waterborne alkyd. Cures hard like oil-based, cleans up with water. Furniture-quality finish. 14-day cure window. Sold primarily through Benjamin Moore dealers; Amazon has limited inventory.'
      }
    },
    whyThis: 'INSL-X is the cabinet-paint sweet spot. Made by Benjamin Moore but sold through Amazon at consistent stock, with the no-primer-needed adhesion that saves a full prep step. Reviewers report factory-like finish with one product instead of three.',
    whyNotCheaper: 'Behr alkyd enamel works but reviewers consistently flag tackiness 2 weeks after painting and drawer fronts sticking together when reinstalled. The save is $30-40, but you accept a longer cure window and a real risk of having to redo the doors that stick.',
    whyNotPremium: 'Benjamin Moore Advance tests neck-and-neck with INSL-X on durability, but Advance is sold mainly through BM dealers (limited Amazon stock) and requires a separate primer for slick surfaces. INSL-X gives you the same quality finish without the primer step, and Amazon shipping is reliable.',
    warnings: [
      'Stir thoroughly — both INSL-X and Advance separate during shipping',
      'Wait 14-21 days before reinstalling doors. Curing not the same as drying.',
      'Apply between 50-90°F. Cold basement application leads to soft finish.'
    ],
    contextNote: 'A typical 10x12 kitchen needs 1 gallon for 2 coats. Larger kitchens or full upper+lower repaint may need 1.5-2 gallons.',
    citations: [
      'Reviewed.com 2026 Best Cabinet Paint roundup',
      'Brackens Painting (4-generation paint pro) cabinet paint guide',
      'Renovated Faith 24-brand blind test (BM Advance overall winner)',
      'Greathomedepot.com INSL-X Cabinet Coat hands-on review'
    ]
  },
  {
    slotId: 'kitchen_bonding_primer',
    slotLabel: 'Bonding primer (1 gallon)',
    slotKind: 'core',
    conditionalOn: ['has_bare_wood_cabinets', 'painting_with_inslx'],
    tiers: {
      budget: {
        productName: 'KILZ Adhesion Bonding Primer (1 gallon)',
        priceLow: 22,
        priceHigh: 30,
        affiliateUrl: 'https://www.amazon.com/s?k=kilz+adhesion+primer+gallon&tag=alderprojects-20',
        productSpec: 'Acrylic bonding primer. Works on glossy laminate, glass, tile. 300 sq ft per gallon coverage.'
      },
      sweet_spot: {
        productName: 'INSL-X Stix Acrylic Waterborne Bonding Primer (1 gallon)',
        priceLow: 38,
        priceHigh: 52,
        affiliateUrl: 'https://www.amazon.com/s?k=insl-x+stix+bonding+primer+gallon&tag=alderprojects-20',
        productSpec: 'Acrylic-urethane bonding primer. Adheres to glossy tile, PVC, vinyl, plastic, glass, glazed block, glossy paint, fiberglass, galvanized metals. Coverage 300-400 sq ft per gallon. Cures in temps as low as 35°F.'
      },
      premium: {
        productName: 'Zinsser BIN Shellac-Based Primer (1 gallon)',
        priceLow: 50,
        priceHigh: 65,
        affiliateUrl: 'https://www.amazon.com/s?k=zinsser+bin+shellac+primer+gallon&tag=alderprojects-20',
        productSpec: 'Shellac-based stain blocker. Best for cabinets bleeding tannins (oak, knotty pine). Solvent cleanup, strong odor.'
      }
    },
    whyThis: 'Stix is the slot to spend on if your cabinets are glossy, slick laminate, or previously oiled. Saves a full sanding step and bonds in one coat.',
    whyNotCheaper: 'KILZ Adhesion works but reviewers flag spotty coverage on glossy surfaces — you end up doing 2 coats which negates the save.',
    whyNotPremium: 'Zinsser BIN is the right call ONLY if your cabinets are oak or knotty pine bleeding tannins through the paint. For most kitchens (maple, painted, MDF), BIN is overkill at $15 more.',
    warnings: [
      'Skip this slot if your cabinets are bare wood AND sanded — INSL-X Cabinet Coat applies directly',
      'Stix needs 1 hour to dry; do not topcoat sooner'
    ],
    citations: [
      'INSL-X Stix product datasheet',
      'cathleendavittbell.com Stix Primer review thread'
    ]
  },
  {
    slotId: 'kitchen_cabinet_pulls',
    slotLabel: 'Cabinet pulls (10-pack)',
    slotKind: 'core',
    conditionalOn: ['has_satisfactory_pulls'],
    tiers: {
      budget: {
        productName: 'Liberty Hardware Bar Pulls (10-pack, 3-3/4" or 5-1/16" center)',
        priceLow: 25,
        priceHigh: 38,
        affiliateUrl: 'https://www.amazon.com/s?k=liberty+hardware+bar+pulls+10+pack&tag=alderprojects-20',
        productSpec: 'Zinc alloy. Available at Home Depot in matte black, satin nickel, oil-rubbed bronze. ~$2.50-3.80 per pull.'
      },
      sweet_spot: {
        productName: 'Amerock Bar Pulls 5-1/16" Matte Black 10-pack (10BX40517MB)',
        priceLow: 33,
        priceHigh: 45,
        amazonAsin: 'B0DLWN5QLH',
        affiliateUrl: 'https://www.amazon.com/dp/B0DLWN5QLH?tag=alderprojects-20',
        productSpec: 'Zinc alloy with substantial weight. 7-3/8" overall length, 5-1/16" (128mm) center-to-center. Limited lifetime warranty. ~$3.34 per pull at Home Depot. 10+ finishes available.'
      },
      premium: {
        productName: 'Top Knobs Bar Pulls (e.g. Amwell or Aspen line)',
        priceLow: 160,
        priceHigh: 250,
        affiliateUrl: 'https://www.amazon.com/s?k=top+knobs+amwell+bar+pull&tag=alderprojects-20',
        productSpec: 'Solid steel construction with optional knurled detail. Cabinet-shop grade. ~$16-25 per pull.'
      }
    },
    whyThis: 'Amerock is the value-per-dollar pick. Substantial enough to feel quality in-hand, threading stays tight after years of use. Most-recommended pull across professional design forums.',
    whyNotCheaper: 'Liberty pulls work fine and look the same on the cabinet. The visible difference is in the threading — Liberty\'s tends to wobble loose after 3-5 years of daily use. You\'ll be retightening pulls every 6 months.',
    whyNotPremium: 'Top Knobs is solid steel with authentic premium feel in-hand. Beautiful. The Houzz pro consensus: "When the door handle is on the cabinet you\'d be hard pressed to tell the difference." For a 16-pull kitchen, that\'s $200+ paid for in-hand quality only you can detect.',
    warnings: [
      'Measure existing pull-spread first. Common sizes: 3", 3-3/4", 5-1/16", 6-5/16". Wrong size = redrill.',
      'Buy 1-2 extra pulls beyond your count for spares.'
    ],
    citations: [
      'Houzz forum thread "Cabinet Hardware—cheap vs. expensive"',
      'Bob Vila Best Cabinet Hardware 2025 roundup',
      'Property Nest 9 Best Kitchen Cabinet Hardware Brands 2024'
    ]
  },
  {
    slotId: 'kitchen_cabinet_knobs',
    slotLabel: 'Cabinet knobs (6-pack)',
    slotKind: 'core',
    conditionalOn: ['has_satisfactory_knobs'],
    tiers: {
      budget: {
        productName: 'Generic Amazon round knobs (6-pack)',
        priceLow: 8,
        priceHigh: 14,
        affiliateUrl: 'https://www.amazon.com/s?k=cabinet+knobs+round+6+pack&tag=alderprojects-20',
        productSpec: 'Zinc alloy or plated steel. Various finishes. Often non-UV-stable.'
      },
      sweet_spot: {
        productName: 'Liberty Harmon Round Cabinet Knobs (6-pack equivalent)',
        priceLow: 18,
        priceHigh: 26,
        affiliateUrl: 'https://www.amazon.com/s?k=liberty+harmon+round+cabinet+knob&tag=alderprojects-20',
        productSpec: 'Classic round profile, 1.25" diameter. Available at Home Depot in matte black, satin nickel, oil-rubbed bronze, polished chrome. 1,200+ Home Depot reviews at full 5 stars. ~$3 per knob.'
      },
      premium: {
        productName: 'Top Knobs Aspen Collection knobs',
        priceLow: 90,
        priceHigh: 150,
        affiliateUrl: 'https://www.amazon.com/s?k=top+knobs+aspen+round+knob&tag=alderprojects-20',
        productSpec: 'Solid steel. Premium finishes. ~$15-25 per knob.'
      }
    },
    whyThis: 'Liberty Harmon is the most-reviewed cabinet knob at this tier with consistent positive feedback for finish quality. Best value-per-dollar in the category.',
    whyNotCheaper: 'Generic Amazon knobs (e.g. $9 for 6) work but the finishes aren\'t UV-stable. 18 months in a window-lit kitchen and matte black goes patchy.',
    whyNotPremium: 'Top Knobs and Anthropologie/Pottery Barn knobs ($15-30 each) are aesthetic statements. If you want a statement, do 2-4 accent knobs (kitchen island only) and use Liberty for the rest.',
    citations: [
      'Bob Vila Best Cabinet Hardware roundup (Liberty Harmon: 1,200+ Home Depot 5-star reviews)',
      'Cathleen Davitt Bell hardware comparison'
    ]
  },
  {
    slotId: 'kitchen_softclose_hinges',
    slotLabel: 'Soft-close cabinet hinges (12-pack)',
    slotKind: 'core',
    conditionalOn: ['has_softclose_hinges', 'cabinets_already_softclose'],
    tiers: {
      budget: {
        productName: 'Generic concealed hinge with soft-close (12-pack)',
        priceLow: 22,
        priceHigh: 32,
        affiliateUrl: 'https://www.amazon.com/s?k=concealed+cabinet+hinge+soft+close+12+pack&tag=alderprojects-20',
        productSpec: 'Standard 35mm cup hinge. 105° opening. Adjustable. Plastic damper.'
      },
      sweet_spot: {
        productName: 'Blum Compact Soft-Close hinges (12-pack)',
        priceLow: 55,
        priceHigh: 78,
        affiliateUrl: 'https://www.amazon.com/s?k=blum+compact+soft+close+hinge+12&tag=alderprojects-20',
        productSpec: 'Cabinet-shop standard. 35mm cup, 110° opening. 3-dimensional adjustment. Lifetime damper. Industry standard at IKEA, KraftMaid, and most mid-tier cabinet brands.'
      },
      premium: {
        productName: 'Blum Clip Top Blumotion (12-pack)',
        priceLow: 95,
        priceHigh: 130,
        affiliateUrl: 'https://www.amazon.com/s?k=blum+clip+top+blumotion+hinge&tag=alderprojects-20',
        productSpec: 'Tool-less clip-on installation. Integrated soft-close mechanism. 110° or 155° opening options.'
      }
    },
    whyThis: 'Blum hinges are the cabinet-shop standard. The damper lasts the lifetime of the kitchen. Generic hinges fail in 12-18 months and you\'re replacing them anyway.',
    whyNotCheaper: 'Generic soft-close hinges work for 12-18 months then the dampers fail. You\'re back to slamming doors and replacing the hinges twice in 5 years.',
    whyNotPremium: 'Clip Top Blumotion saves install time (tool-less clip vs screws) but the time savings on a 12-hinge install is 30-45 minutes. For a one-time DIY job, the screwdown version is the right tier.',
    warnings: [
      'Measure existing hinges before ordering. European cup hinges (35mm) and face-frame hinges are NOT interchangeable.',
      'Take an existing hinge to the store or photograph it next to a ruler.'
    ],
    citations: [
      'Blum hardware product datasheet',
      'IKEA UTRUSTA cabinet documentation references',
      'Pro forum consensus on Blum vs generic'
    ]
  },
  {
    slotId: 'kitchen_undercabinet_lighting',
    slotLabel: 'Under-cabinet LED strip lighting (plug-in, 10ft)',
    slotKind: 'core',
    conditionalOn: ['has_undercabinet_lighting'],
    tiers: {
      budget: {
        productName: 'Generic Amazon LED strip kit (10ft, plug-in)',
        priceLow: 14,
        priceHigh: 22,
        affiliateUrl: 'https://www.amazon.com/s?k=led+strip+kitchen+10ft+plug+in&tag=alderprojects-20',
        productSpec: 'Adhesive-back LED strip with plug-in transformer. Various color temps. No-name brand.'
      },
      sweet_spot: {
        productName: 'Wobane Under Cabinet LED Lighting Kit (10ft)',
        priceLow: 28,
        priceHigh: 45,
        affiliateUrl: 'https://www.amazon.com/s?k=wobane+under+cabinet+lighting&tag=alderprojects-20',
        productSpec: '1100 lumens, warm white (3000K), thin profile fits under standard cabinets. Adhesive-back installation. Plugs into existing outlet. 30-minute install.'
      },
      premium: {
        productName: 'GE Direct Wire LED Bar (hardwired, 10ft)',
        priceLow: 110,
        priceHigh: 160,
        affiliateUrl: 'https://www.amazon.com/s?k=ge+direct+wire+led+under+cabinet&tag=alderprojects-20',
        productSpec: 'Linkable hardwired LED bars. Wall-switch control. Requires electrician or significant DIY electrical skill.'
      }
    },
    whyThis: 'Wobane is the Wirecutter / Bob Vila pick at this tier. Easy DIY install, dimmable, replaceable LED segments. 5-year typical lifespan vs 6-12 months for the cheap strips.',
    whyNotCheaper: 'Generic $15 LED strips work for 6-12 months then sections fail randomly. The adhesive backing also peels in kitchen humidity within a year.',
    whyNotPremium: 'Hardwired GE bars are the polished install but require an electrician (~$200-400 of labor) or real DIY electrical skill. The visual difference at night is the absence of a cord — not worth $300+ unless you\'re refacing the kitchen anyway.',
    warnings: [
      'Use warm color temp (2700-3000K), not cool (5000K+). Cool light makes maple cabinets look gray-green.',
      'Do not run cord across cooking surface or near sink without proper rating.'
    ],
    citations: [
      'Bob Vila Best Under-Cabinet Lighting 2026 roundup',
      'Lumaz hardwired-vs-plug-in guide',
      'PROLIGHTING fixture installation guide'
    ]
  },
  {
    slotId: 'kitchen_caulk_kit',
    slotLabel: 'Kitchen-rated caulk + caulking gun',
    slotKind: 'core',
    conditionalOn: [],
    tiers: {
      sweet_spot: {
        productName: 'DAP Alex Plus Acrylic Latex + Silicone Caulk (white) + steel caulking gun',
        priceLow: 15,
        priceHigh: 24,
        affiliateUrl: 'https://www.amazon.com/s?k=dap+alex+plus+kitchen+caulk+gun&tag=alderprojects-20',
        productSpec: 'Paintable, mildew-resistant, water cleanup. Standard pro choice for backsplash and trim seams. Steel skeleton caulking gun ~$10-15.'
      }
    },
    whyThis: 'DAP Alex Plus is paintable (so you can match cabinet paint over the seam) AND mildew-resistant. Steel gun is reusable for life — skip the plastic ones.',
    whyNotCheaper: 'No real cheaper tier. Skipping caulk entirely is a category mistake — water gets behind the backsplash and ruins drywall.',
    whyNotPremium: 'GE 100% Silicone II Kitchen ($12-15) is technically superior for moisture but it\'s NOT paintable. If you want to repaint trim later, you\'re stripping silicone first.',
    citations: [
      'DAP product datasheet',
      'Pro caulking guide consensus'
    ]
  },
  {
    slotId: 'kitchen_painting_supplies',
    slotLabel: 'Painting supplies (consumables)',
    slotKind: 'core',
    conditionalOn: [],
    tiers: {
      sweet_spot: {
        productName: 'Wooster 2.5" Shortcut angled sash brush + 4" foam roller + 9x12 canvas drop cloth + 220/320 sandpaper',
        priceLow: 32,
        priceHigh: 48,
        affiliateUrl: 'https://www.amazon.com/s?k=wooster+shortcut+brush+foam+roller+canvas+drop+cloth&tag=alderprojects-20',
        productSpec: 'Wooster Shortcut 2.5" angled sash brush (~$8). Whizz 4" foam roller frame + covers (~$10). 9x12 canvas drop cloth (~$12). 220 + 320 grit sandpaper assortment (~$10).'
      }
    },
    whyThis: 'Cheap brushes shed bristles into your cabinet enamel. Every shed bristle is an artifact you\'ll see for the next 10 years. Wooster Shortcut is the verified pro brush at this tier.',
    whyNotCheaper: 'Plastic drop cloths tear and don\'t absorb spills. Generic brushes shed.',
    whyNotPremium: 'Festool sander + premium brush set is craftsman tier — for one project, $200 of overkill for $40 of work.',
    citations: [
      'Wooster product line review consensus',
      'DIY painting tool guides'
    ]
  },
  {
    slotId: 'kitchen_drawer_slides',
    slotLabel: 'Cabinet drawer slides (5-pair, full extension)',
    slotKind: 'core',
    conditionalOn: ['drawers_already_full_extension', 'no_drawer_issues'],
    tiers: {
      budget: {
        productName: 'Side-mount ball-bearing slides (generic, 5-pair)',
        priceLow: 35,
        priceHigh: 55,
        affiliateUrl: 'https://www.amazon.com/s?k=cabinet+drawer+slides+21+inch+5+pair&tag=alderprojects-20',
        productSpec: 'Generic ball-bearing slides. 21" length. 75-100 lb capacity.'
      },
      sweet_spot: {
        productName: 'Blum Tandem Plus Blumotion 21" full-extension slides (5-pair)',
        priceLow: 75,
        priceHigh: 110,
        affiliateUrl: 'https://www.amazon.com/s?k=blum+tandem+plus+blumotion+21+inch&tag=alderprojects-20',
        productSpec: 'Cabinet-shop standard 21" undermount slides. Soft-close, full-extension, 100 lb capacity. Industry-standard hardware.'
      },
      premium: {
        productName: 'Blum Movento undermount slides (5-pair)',
        priceLow: 200,
        priceHigh: 320,
        affiliateUrl: 'https://www.amazon.com/s?k=blum+movento+slide&tag=alderprojects-20',
        productSpec: 'Premium undermount slides invisible from outside the drawer. Cabinet-shop install required.'
      }
    },
    whyThis: 'Blum Tandem is the cabinet-shop standard. Drop-in compatible with most cabinets manufactured after 1995.',
    whyNotCheaper: 'Generic side-mount slides bow under load (heavy pots in lower drawers). 18 months and you\'re hitting the cabinet bottoms.',
    whyNotPremium: 'Movento is invisible from outside the drawer — beautiful but cabinet-shop install. Worth it on a kitchen rebuild, not on a refresh.',
    warnings: [
      'Skip this slot if your existing drawers are full-extension and not sagging. Most cabinets manufactured after 1995 already have decent slides.'
    ],
    citations: [
      'Blum Tandem product datasheet',
      'Pro cabinet shop forum standards'
    ]
  }
]

export const KITCHEN_COSMETIC_REFRESH_SKIP_LIST: SkipItem[] = [
  {
    id: 'skip_top_knobs_designer_pulls',
    type: 'wrong_version',
    title: 'Top Knobs / Anthropologie / Rejuvenation designer pulls (when Amerock works)',
    marketingPitch: 'The jewelry of the kitchen. These elevate the whole room.',
    realReason: 'For a 16-pull kitchen, swapping Amerock ($55) to Top Knobs ($240) for the same matte black bar pull profile is $185 paid for in-hand quality difference invisible from 3 feet away. The Houzz pro consensus on a $200 hardware decision: "When the door handle is on the cabinet you\'d be hard pressed to tell the difference."',
    amountSaved: { low: 140, high: 220 },
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['Houzz forum thread on cabinet hardware tiers', 'Bob Vila best cabinet hardware 2025']
  },
  {
    id: 'skip_behr_marquee_for_cabinets',
    type: 'wrong_version',
    title: 'Behr Marquee or Premium Plus Ultra for cabinets',
    marketingPitch: 'One-coat coverage, lifetime warranty, made for trim.',
    realReason: 'Marquee is a wall paint — it doesn\'t cure to enamel hardness. Cabinet doors get touched daily; wall paint scuffs and shows fingerprints within weeks. The Behr line that actually works on cabinets is their Cabinet & Trim Enamel (alkyd), not the wall paints. Save $20 vs INSL-X but you accept a real risk of having to repaint within 2 years.',
    amountSaved: { low: 20, high: 35 },
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['Brackens Painting cabinet paint guide', 'Reviewed.com 2026 best cabinet paint testing']
  },
  {
    id: 'skip_smart_lighting_kit',
    type: 'wrong_version',
    title: 'Smart-controlled "kitchen lighting kits" (Philips Hue, Lutron Caseta with kitchen bundle)',
    marketingPitch: 'Voice-controlled, dimmable, app-driven kitchen mood lighting.',
    realReason: '$200-300 for a kit that requires hub setup, app pairing, and a learning curve every guest at your house has to redo. The Wobane plug-in dimmable strip with a wall switch dimmer ($28 + $15 dimmer) does 90% of what you actually want for $200+ less. Smart lighting earns its place in living rooms; in kitchens you\'re flipping a switch on the way in and off on the way out.',
    amountSaved: { low: 130, high: 240 },
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['Wobane vs smart lighting comparison consensus']
  },
  {
    id: 'skip_cabinet_transformations_kit',
    type: 'wrong_version',
    title: 'Rust-Oleum Cabinet Transformations kit (or similar all-in-one kits)',
    marketingPitch: 'Complete kit, no priming, no sanding, transform your cabinets in a weekend.',
    realReason: 'These kits work — the trap is the kit pricing. The sandpaper, primer, paint, and topcoat in the kit retail for $90-120 if bought separately as the brand-name versions. The kit at $150-200 is convenience pricing for items you should size correctly anyway. 1-quart kit covers ~50 sq ft; most kitchens need 100-150 sq ft.',
    amountSaved: { low: 50, high: 90 },
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['Rust-Oleum product line vs component pricing analysis']
  },
  {
    id: 'skip_cabinet_specific_topcoat',
    type: 'wrong_version',
    title: 'Specialty "kitchen-rated" topcoat or sealer for cabinet paint',
    marketingPitch: 'Engineered for kitchen humidity and grease.',
    realReason: 'INSL-X Cabinet Coat and Benjamin Moore Advance both cure to enamel hardness — they don\'t need a topcoat. Adding a "kitchen-specific" topcoat from the same store is brand-extension product engineering. Skip the $25-40 sealer. If your paint isn\'t durable enough on its own, you bought the wrong paint.',
    amountSaved: { low: 25, high: 45 },
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['INSL-X product datasheet (enamel cures hard, no topcoat needed)']
  },
  {
    id: 'skip_peel_stick_backsplash',
    type: 'wrong_category',
    title: 'Peel-and-stick "subway tile" backsplashes',
    realReason: 'The Pinterest photo looks great. Reality: discolors at corners within 18 months from kitchen humidity, the grout-look detail flattens visibly, traps grease in a way real ceramic doesn\'t. Real subway tile DIY install is 1-2 weekends and $200-300 for materials — not 10x harder than peel-and-stick.',
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['DIY backsplash forum consensus on peel-and-stick longevity']
  },
  {
    id: 'skip_fluorescent_undercabinet',
    type: 'wrong_category',
    title: 'Fluorescent under-cabinet "task lighting" tubes',
    realReason: 'Even on clearance. They flicker, color rendering is poor (CRI < 80), and most modern dimmers won\'t run them. LED is universally better at 2026 prices.',
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['LED vs fluorescent task lighting comparison']
  },
  {
    id: 'skip_cabinet_decals_vinyl_wraps',
    type: 'wrong_category',
    title: 'Cabinet door decals or vinyl wraps',
    realReason: 'Lift at corners within 2 months in kitchen humidity. Printed wood-grain doesn\'t match cabinets next to them. Either paint or live with what you have.',
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['DIY cabinet refacing forum consensus']
  },
  {
    id: 'skip_paint_cabinet_hardware',
    type: 'wrong_category',
    title: 'Painting your existing cabinet hardware to "save the cost of replacement"',
    realReason: 'YouTube tutorials show this. Hardware paint chips at every grip point within 3-6 months because it\'s a high-touch surface. Just buy the $40 set of new pulls.',
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['DIY hardware painting forum failure reports']
  },
  {
    id: 'skip_handleless_conversion_kit',
    type: 'wrong_category',
    title: 'Premium edge-pull / "handleless" cabinet conversion kits',
    realReason: '$300-500 for kits that retrofit existing cabinets into integrated-pull style. They don\'t work on framed cabinets (most US kitchens). If you actually want this look, it\'s a full cabinet replacement, not a refresh.',
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['European cabinet style retrofit forum analysis']
  },
  {
    id: 'skip_wax_pen_scratch_repair',
    type: 'wrong_category',
    title: 'Specialty "refinishing" wax pens for scratch repair',
    realReason: 'Marketed for "perfectly matching your cabinet color." They don\'t. Oxidize to a slightly different shade than original within 6 months. If you have scratches, plan to repaint anyway.',
    appliesToScope: ['kitchen_cosmetic_refresh'],
    citations: ['Wax pen scratch repair user reports']
  }
]

export const KITCHEN_COSMETIC_REFRESH_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot' as const, alreadyHave: [] as string[] },
  already_have_basics: {
    selectedTier: 'sweet_spot' as const,
    alreadyHave: ['has_satisfactory_pulls', 'has_satisfactory_knobs', 'has_undercabinet_lighting']
  },
  tight_budget: { selectedTier: 'budget' as const, alreadyHave: [] as string[] },
  premium: { selectedTier: 'premium' as const, alreadyHave: [] as string[] }
}
