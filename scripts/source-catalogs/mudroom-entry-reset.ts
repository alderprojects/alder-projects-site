// scripts/source-catalogs/mudroom-entry-reset.ts
// V7.2.5 — Mudroom and entry reset catalog

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const MUDROOM_ENTRY_RESET_TOPIC = 'mudroom'
export const MUDROOM_ENTRY_RESET_SCOPE = 'mudroom_entry_reset'
export const MUDROOM_ENTRY_RESET_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'mud_season',
]

export const MUDROOM_ENTRY_RESET_METADATA = {
  smartCartPromise:
    'Spend $100-$500 to keep mud, boots, wet gear, and lake stuff from taking over the house.',
  primaryCustomerPain:
    "Vermont mud season runs March through May. Lake-property summer brings sand and wet swim gear. Without an entry strategy, the mess migrates through the whole house — within weeks the floors, rugs, and furniture all show it.",
  valueProposition:
    "$200 of right-sized entry gear prevents $1,500 in floor refinishing and rug replacement, and removes the daily friction of shoes-on-shoes-off chaos that wears down everyone in the household.",
  routeOutRules: [
    {
      condition: 'planning_built_in_mudroom',
      destination: 'verify_first',
      reason:
        "If you're considering custom built-ins ($3,000-$8,000), test the layout with portable furniture first. Built-ins lock in choices that don't always work once the room is in use. Smart Cart covers the test phase.",
    },
  ],
  seasonalUrgency: {
    season: 'mud_season',
    deadline: '03-15',
    label:
      "Best by mid-March. Vermont mud season starts late March; gear shipped in February is ready when the boots get muddy.",
  },
}

export const MUDROOM_ENTRY_RESET_SLOTS: CartSlot[] = [
  // ============================================================
  // SLOT 1: Boot tray
  // ============================================================
  {
    slotId: 'mudroom_boot_tray',
    slotLabel: 'Boot tray (entry-sized)',
    slotKind: 'core',
    conditionalOn: ['has_boot_tray'],
    tiers: {
      budget: {
        productName: 'Generic plastic boot tray, 30" x 15"',
        priceLow: 18,
        priceHigh: 32,
        affiliateUrl:
          'https://www.amazon.com/s?k=plastic+boot+tray+30+inch+entry&tag=alderprojects-20',
        productSpec:
          'Hard plastic, 30"x15". Holds 2-3 pairs of boots. Cracks at corners after 2-3 freeze-thaw cycles. Inexpensive but short life.',
      },
      sweet_spot: {
        productName: 'WeatherTech BootTray 16" x 36" (Black)',
        priceLow: 39,
        priceHigh: 55,
        amazonAsin: 'B0134VP96Q',
        affiliateUrl: 'https://www.amazon.com/dp/B0134VP96Q?tag=alderprojects-20',
        productSpec:
          'TPE (thermoplastic elastomer) — flexible, durable, freeze-tolerant. 16" x 36" holds up to 4 pairs of boots. Engineered channels keep water and debris off the shoes. Made in USA. Multiple colors. Stays put on hardwood and tile (no sliding).',
      },
      premium: {
        productName: 'WeatherTech BootTray 16" x 36" PLUS IndoorMat 24"x39"',
        priceLow: 100,
        priceHigh: 145,
        affiliateUrl:
          'https://www.amazon.com/s?k=weathertech+boottray+indoor+mat+combo&tag=alderprojects-20',
        productSpec:
          'BootTray for the boot rack zone + matching IndoorMat for the immediately-inside-the-door zone. Two-zone strategy: tray catches the wet boots, mat catches the wet socks/feet that transition off the tray.',
      },
    },
    slotPurpose:
      "Contain water, mud, and snow from boots in one defined location at the entry.",
    whyItMatters:
      "Without a defined boot zone, wet boots get parked anywhere there's space and the water spreads. A 36-inch tray defines the zone for the whole household and trains the habit.",
    commonMistake:
      "Buying too-small boot trays. A 24-inch tray fits 2 pairs of boots; a household with 3+ people needs 36 inches minimum. The wrong size means boots end up off the tray, defeating the purpose.",
    whyThis:
      "WeatherTech BootTray is the verified pick by Wirecutter and Bob Vila for cold-climate entries. The TPE material is flexible enough not to crack in freeze-thaw and stiff enough to hold shape under heavy boots. 'Made in USA' isn't marketing here — the material quality is the differentiator.",
    whyNotCheaper:
      "Hard plastic trays crack at the corners after 2-3 winters. The crack lets water onto the floor — exactly what the tray is supposed to prevent. The $20 saved over 3 years is one replacement away from net-zero.",
    whyNotPremium:
      "The tray + mat combo is the right answer for very high-traffic entries (3+ kids, dogs, lake property with daily wet swim gear). For most households, the tray alone covers 90% of the need.",
    contextNote:
      "Place the tray INSIDE the door, not outside. An outside tray collects rain and snow itself; inside, it's a clean dry zone where boots dry and mud falls into channels.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'entry_mat',
      reason:
        "You have a boot tray. The next-step gap is the entry mat — what catches the wet socks, the dripping coats, the dog paws, and everything that doesn't belong on the tray.",
    },
    whenToSkip: [
      'Entry already has tile or stone flooring designed to handle wet boots',
      'Mudroom has a built-in floor drain',
    ],
    citations: [
      'WeatherTech BootTray Amazon listing (B0134VP96Q)',
      'WeatherTech material specifications',
      'Wirecutter best boot tray testing',
    ],
  },

  // ============================================================
  // SLOT 2: Entry mat
  // ============================================================
  {
    slotId: 'mudroom_entry_mat',
    slotLabel: 'Heavy-duty entry mat',
    slotKind: 'core',
    conditionalOn: ['has_entry_mat'],
    tiers: {
      budget: {
        productName: 'Generic rubber-backed coir doormat, 24" x 36"',
        priceLow: 22,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=coir+doormat+heavy+duty+rubber+backed+24x36&tag=alderprojects-20',
        productSpec:
          'Natural coir fiber on rubber backing. 24" x 36". Effective for dry debris; sheds itself onto the floor over time. ~2-3 year typical life.',
      },
      sweet_spot: {
        productName: 'Gorilla Grip Original Durable Natural Rubber Door Mat (47" x 35")',
        priceLow: 48,
        priceHigh: 75,
        affiliateUrl:
          'https://www.amazon.com/s?k=gorilla+grip+natural+rubber+door+mat+47+35&tag=alderprojects-20',
        productSpec:
          'TPR (thermoplastic rubber) waffle pattern. 47" x 35". Drains water and traps dirt. Stays put on hardwood, tile, vinyl. 5-7 year lifespan with regular hosing-off. Wirecutter pick at this tier.',
      },
      premium: {
        productName: 'WaterHog Eco Premier 4x6 commercial-grade entry mat',
        priceLow: 165,
        priceHigh: 240,
        affiliateUrl:
          'https://www.amazon.com/s?k=waterhog+eco+premier+4x6+entry+mat&tag=alderprojects-20',
        productSpec:
          'Commercial-grade. 4 ft x 6 ft. Polypropylene fiber on rubber backing. Found in hotel lobbies and high-traffic commercial entries. 10+ year lifespan. Captures water and debris far better than residential mats.',
      },
    },
    slotPurpose:
      "Capture water, mud, and debris that comes off the boots and onto the surrounding floor.",
    whyItMatters:
      "The boot tray contains the worst of it. The entry mat catches the rest — the dripping coat sleeve, the wet sock that just came out of a boot, the dog paw. Without this layer, the floor still suffers.",
    commonMistake:
      "Indoor decorative rugs at lake or mud entries. Cotton, wool, jute — beautiful, wrong material. Holds water, traps mildew, ruins fast. The entry rug must be synthetic and rubber-backed.",
    whyThis:
      "Gorilla Grip is the Wirecutter pick at this tier. Stays put without curling, drains water, traps dirt deep in the waffle pattern. Hose-off cleaning. 5-7 year lifespan = $0.20/week amortized.",
    whyNotCheaper:
      "Coir mats shed themselves onto the floor and lose effectiveness within 2 years. The fiber comes off on socks. Acceptable for occasional use; wrong for Vermont mud season + lake summer.",
    whyNotPremium:
      "WaterHog Eco Premier is hotel-lobby grade and overkill for residential use. The right call for very high-traffic entries (3+ kids, dogs, lake property with constant wet gear). For typical use, Gorilla Grip is the right tier.",
    contextNote:
      "Place this mat INSIDE the entry, after the boot tray. Outside doormats are different category — they protect outside; this protects inside.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'wall_hooks',
      reason:
        "You have boot tray + mat. The next-step gap is wall hooks for coats and bags — keeps them off the floor and the mat clean.",
    },
    citations: [
      'Gorilla Grip product line documentation',
      'Wirecutter best entry mat testing',
      'WaterHog commercial-grade specifications',
    ],
  },

  // ============================================================
  // SLOT 3: Wall hooks
  // ============================================================
  {
    slotId: 'mudroom_wall_hooks',
    slotLabel: 'Wall hooks (5-pack with anchors)',
    slotKind: 'core',
    conditionalOn: ['has_wall_hooks'],
    tiers: {
      budget: {
        productName: 'Generic adhesive-back hooks, 5-pack',
        priceLow: 8,
        priceHigh: 14,
        affiliateUrl:
          'https://www.amazon.com/s?k=adhesive+wall+hooks+heavy+duty&tag=alderprojects-20',
        productSpec:
          '3M-style adhesive hooks. 5-15 lb capacity (varies). No anchors, no drilling. Effective for light loads; fail with heavy wet coats.',
      },
      sweet_spot: {
        productName: 'Liberty Hardware steel wall hooks (5-pack) + drywall anchors',
        priceLow: 22,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=liberty+hardware+wall+hook+5+pack+oil+rubbed&tag=alderprojects-20',
        productSpec:
          'Cast steel hooks with oil-rubbed bronze, satin nickel, or matte black finish. 30+ lb capacity. Includes wall anchors. Mount with screws into studs or drywall anchors. Liberty is the standard at this tier.',
      },
      premium: {
        productName: 'Pottery Barn cast iron coat hooks (5-pack equivalent)',
        priceLow: 75,
        priceHigh: 130,
        affiliateUrl:
          'https://www.amazon.com/s?k=cast+iron+coat+hooks+wall+mount&tag=alderprojects-20',
        productSpec:
          'Solid cast iron, antique-finish. ~$15-25 per hook. Statement piece. Same load capacity as Liberty — premium is aesthetic.',
      },
    },
    slotPurpose:
      "Hang wet coats, hats, bags, and dog leashes off the floor and off the entry mat.",
    whyItMatters:
      "Coats on the floor or on the mat ruin both. Hooks at the right height keep the entry organized and the wet stuff drying upward.",
    commonMistake:
      "Adhesive hooks for wet winter coats. The combination of weight and humidity defeats the adhesive. Within 3-6 months the hook falls off the wall, the coat ends up on the floor, and you're patching paint.",
    whyThis:
      "Liberty steel hooks at $5-7 each are the right hardware for the load. With drywall anchors or stud mounting, they hold for 20+ years. The finish options match most home aesthetics.",
    whyNotCheaper:
      "Adhesive hooks are fine for towels in a bathroom; they fail under wet coat weight. The fall-off cycle creates more work than just installing real hooks once.",
    whyNotPremium:
      "Pottery Barn cast iron is beautiful and aesthetic. For mudroom use, the coat covers the hook anyway. The visible difference from 6 feet is minimal.",
    contextNote:
      "Mount at adult shoulder height (~60 inches) for coats. Lower row at child height (~42 inches) for kid coats. Two rows is the right setup for households with kids.",
    warnings: [
      "Always anchor into a stud or use real drywall anchors. Loose hooks pull straight out under load.",
      "Test with weight before trusting with the family's good coat.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'entry_bench',
      reason:
        "You have hooks. The next-step gap is a bench — sit-down zone for putting boots on/off without standing on one foot.",
    },
    citations: [
      'Liberty Hardware product line documentation',
      'Drywall anchor weight ratings',
    ],
  },

  // ============================================================
  // SLOT 4: Entry bench with storage
  // ============================================================
  {
    slotId: 'mudroom_bench',
    slotLabel: 'Entry bench with under-storage',
    slotKind: 'core',
    conditionalOn: ['has_entry_bench'],
    tiers: {
      budget: {
        productName: 'IKEA TJUSIG bench (or equivalent IKEA bench with shoe storage)',
        priceLow: 80,
        priceHigh: 130,
        affiliateUrl:
          'https://www.amazon.com/s?k=ikea+tjusig+bench+shoe+storage&tag=alderprojects-20',
        productSpec:
          'Pine bench with open shoe storage underneath. ~$100. Self-assembly. Holds 4-6 pairs of shoes below; 2-3 person seating above. IKEA quality — works, not durable for 10+ years.',
      },
      sweet_spot: {
        productName: 'Solid wood entry bench with cubby storage (44" wide)',
        priceLow: 180,
        priceHigh: 280,
        affiliateUrl:
          'https://www.amazon.com/s?k=solid+wood+entry+bench+shoe+storage+44&tag=alderprojects-20',
        productSpec:
          'Solid wood (pine or rubberwood) construction. 44" wide. Three open cubbies underneath for boots/shoes. Seating for 2-3. 10+ year lifespan with normal use.',
      },
      premium: {
        productName: 'Pottery Barn Samantha entry bench or equivalent custom-shop bench',
        priceLow: 600,
        priceHigh: 1100,
        affiliateUrl:
          'https://www.amazon.com/s?k=pottery+barn+samantha+entry+bench&tag=alderprojects-20',
        productSpec:
          'Hardwood, soft-close drawers, fabric cushion. Statement furniture — the mudroom centerpiece. Built to last 20+ years.',
      },
    },
    slotPurpose:
      "Sit-down zone for boots on/off. Storage below for shoe rotation.",
    whyItMatters:
      "Without a bench, people sit on the floor or on a step to take boots off. Awkward, slow, and bad for older household members. The bench transforms the entry from chore zone to functional space.",
    commonMistake:
      "White or linen-upholstered benches in lake or mud entries. Beautiful in a Pinterest photo, ruined in a season. Mudroom upholstery must be wipe-able or removable.",
    whyThis:
      "Solid wood with open cubbies is the proven pattern. Wood handles wet boots without staining; open cubbies let air circulate so shoes dry between wears.",
    whyNotCheaper:
      "IKEA particle-board benches sag within 2-3 years and the shoe cubbies show wear at the corners. Acceptable starter; replace within 5 years.",
    whyNotPremium:
      "Pottery Barn entry benches are aesthetic statement pieces. Worth it if entry is also a guest-receiving zone visible from the front door. For utility mudroom (back door, garage entry), the sweet-spot wood bench does the same functional work.",
    contextNote:
      "44 inches wide fits 2-3 people. 60 inches fits 3-4. Match width to peak family + guest scenario, not minimum daily use.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'gear_bins',
      reason:
        "You have a bench with cubbies. The next-step gap is gear bins for the seasonal stuff — winter hats, gloves, swim gear, sunscreen — that needs a designated home.",
    },
    citations: [
      'Solid wood entry bench durability comparisons',
      'Mudroom layout guidance',
    ],
  },

  // ============================================================
  // SLOT 5: Wet gear rack
  // ============================================================
  {
    slotId: 'mudroom_wet_gear_rack',
    slotLabel: 'Wet gear drying rack',
    slotKind: 'core',
    conditionalOn: ['has_wet_gear_rack'],
    tiers: {
      budget: {
        productName: 'Folding clothesline or expandable wall-mount drying rack',
        priceLow: 22,
        priceHigh: 42,
        affiliateUrl:
          'https://www.amazon.com/s?k=wall+mount+folding+drying+rack+laundry&tag=alderprojects-20',
        productSpec:
          'Wall-mounted folding rack. 16-20 inches deep when extended. Holds 4-8 wet items. Folds flat against wall when not in use.',
      },
      sweet_spot: {
        productName: 'Stacking accordion-style drying rack with floor pan',
        priceLow: 55,
        priceHigh: 95,
        affiliateUrl:
          'https://www.amazon.com/s?k=accordion+drying+rack+floor+pan+wet+gear&tag=alderprojects-20',
        productSpec:
          'Multi-tier accordion rack with drip pan below. 35"+ height. Holds wetsuits, snow gear, towels. Floor pan catches drip water. Folds for storage.',
      },
    },
    slotPurpose:
      "Dry wet snow gear (mid-winter), wetsuits and swim gear (summer), and rain gear (year-round) without spreading drips through the house.",
    whyItMatters:
      "Wet gear that doesn't dry properly grows mildew within 24-48 hours. A drying rack with controlled drip catches the water and lets the gear actually dry instead of staying wet under itself.",
    commonMistake:
      "Hanging wet gear from existing coat hooks. Drips on the floor; gear stays damp because air doesn't circulate around it; drips run down the wall and damage paint.",
    whyThis:
      "The accordion rack with floor pan is the right call for actual wet gear (lake/snow). Vertical air circulation between layers, drip catch below, foldable when not in season.",
    whyNotCheaper:
      "Folding wall racks are fine for occasional damp items. For sustained wet-season use, the floor-pan model is necessary — without it, you're mopping under the rack twice a day.",
    citations: [
      'Wet gear drying best practices',
      'Mildew prevention guidance',
    ],
  },

  // ============================================================
  // SLOT 6: Gear bins
  // ============================================================
  {
    slotId: 'mudroom_gear_bins',
    slotLabel: 'Storage bins for seasonal gear (set of 3)',
    slotKind: 'core',
    conditionalOn: ['has_gear_bins'],
    tiers: {
      budget: {
        productName: 'Sterilite plastic storage bins, 27 qt, 3-pack',
        priceLow: 28,
        priceHigh: 45,
        affiliateUrl:
          'https://www.amazon.com/s?k=sterilite+27+quart+storage+bin+latching+3+pack&tag=alderprojects-20',
        productSpec:
          'Latching plastic bins. 27 qt each (~14"x18"x10"). Stackable. Holds gloves, hats, scarves, sunscreen, swim toys. Sterilite is the durability standard for plastic bins.',
      },
      sweet_spot: {
        productName: 'mDesign fabric storage bins with handles, 6-pack',
        priceLow: 38,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=mdesign+fabric+storage+bins+with+handles+6+pack&tag=alderprojects-20',
        productSpec:
          'Linen/canvas-look fabric on rigid frame. 6 bins (~10"x10"x10"). Aesthetic upgrade from plastic. Spot-clean only — not for actually wet gear, but for dry rotation (gloves, hats).',
      },
      premium: {
        productName: 'Container Store custom bin system with labels',
        priceLow: 120,
        priceHigh: 220,
        affiliateUrl:
          'https://www.amazon.com/s?k=container+store+labeled+storage+bins+modular&tag=alderprojects-20',
        productSpec:
          'Designer-grade modular bins. Custom-fit your shelves. ~$30-40 per bin. Aesthetic premium; functional parity with cheaper bins.',
      },
    },
    slotPurpose:
      "Defined home for gloves, hats, scarves, swim gear, sunscreen, dog gear, leashes — the misc category that otherwise lives on every horizontal surface.",
    whyItMatters:
      "Mudroom clutter is mostly 'small stuff with no home.' Bins create homes. The bin labeled 'Winter Gloves' is where winter gloves live; out of season, the bin moves to storage.",
    commonMistake:
      "Decorative baskets for actually wet gear. Wicker, jute, woven cotton — beautiful, ruined by lake water or melting snow within a season. Wet gear goes in plastic bins; aesthetic baskets are for dry rotation only.",
    whyThis:
      "mDesign fabric bins are the right balance: aesthetic enough to look intentional, structural enough to survive use. Use them for dry gear; use Sterilite plastic for actually-wet stuff.",
    whyNotCheaper:
      "Sterilite plastic is genuinely the right call for wet/lake gear. Don't upgrade to fabric for swim trunks and wetsuits — they ruin the bins.",
    whyNotPremium:
      "Container Store modular systems are aesthetic statements. For mudroom utility, the cheaper bin lasts as long.",
    contextNote:
      "Label every bin clearly. Use a label maker (or printed labels). Without labels, the bins become anonymous and the system breaks down within a month.",
    citations: [
      'Sterilite product line documentation',
      'mDesign storage bin specifications',
    ],
  },

  // ============================================================
  // SLOT 7: Towel station
  // ============================================================
  {
    slotId: 'mudroom_towel_station',
    slotLabel: 'Quick-dry towel station',
    slotKind: 'addon',
    conditionalOn: ['has_towel_station'],
    tiers: {
      sweet_spot: {
        productName: 'Wall-mount towel rack + 6 microfiber towels',
        priceLow: 35,
        priceHigh: 60,
        affiliateUrl:
          'https://www.amazon.com/s?k=wall+mount+towel+rack+microfiber+towel+set&tag=alderprojects-20',
        productSpec:
          'Wall-mounted towel rack with 4-6 hooks/bars. Plus 6 absorbent microfiber towels (16"x24"). Microfiber dries faster than cotton, holds more water per ounce.',
      },
    },
    slotPurpose:
      "Quick-grab towels for wet dogs, wet kids coming off the lake, and post-rain coat wipe-downs.",
    whyItMatters:
      "Without a towel station, the kitchen bath towels become the dog towel. Defines a separate utility-towel zone so household towels stay clean.",
    whyThis:
      "Microfiber is the right material for utility wipe-down: fast-drying, machine-washable, more absorbent per ounce than cotton. 6 towels = 1 in use, 3 drying, 2 in laundry rotation.",
    whyNotCheaper:
      "Cotton bath towels work but take 24+ hours to dry between uses. With heavy use (lake summer, dog walks), they smell musty fast.",
    whyNotPremium:
      "Premium absorbent towels exist but the marginal benefit is tiny over standard microfiber.",
    citations: ['Microfiber vs cotton absorbency comparison'],
  },

  // ============================================================
  // SLOT 8: Floor protection
  // ============================================================
  {
    slotId: 'mudroom_floor_protection',
    slotLabel: 'Floor protection runner (high-traffic transition)',
    slotKind: 'addon',
    conditionalOn: ['has_floor_protection'],
    tiers: {
      sweet_spot: {
        productName: 'Indoor runner rug (washable, 2.5\' x 7\')',
        priceLow: 45,
        priceHigh: 85,
        affiliateUrl:
          'https://www.amazon.com/s?k=washable+runner+rug+2.5+ft+x+7+ft+entryway&tag=alderprojects-20',
        productSpec:
          '2.5 ft x 7 ft synthetic runner. Machine washable. Rubber-backed. Bridges from entry mat to nearest carpeted/finished room. Synthetic fiber (not cotton or wool).',
      },
    },
    slotPurpose:
      "Capture residual moisture and dirt that gets past the entry mat as people walk further into the house.",
    whyItMatters:
      "Even with mat + boot tray, some moisture and dirt makes it onto socked feet. The runner extends the protection zone to the next 7 feet of floor — typically the highest-wear corridor in the house.",
    whyThis:
      "Washable runners can go in the laundry every 2-4 weeks during heavy seasons. Rubber backing prevents sliding on hardwood/tile. Synthetic fiber survives the wash cycle.",
    whyNotCheaper:
      "Non-washable runners need professional cleaning at $50-80 each. The washable version pays back in cleaning cost saved within a year.",
    whyNotPremium:
      "Premium runners ($150-300) are aesthetic upgrades. Functional parity with the washable.",
    citations: [
      'Indoor runner rug product comparisons',
      'Washable rug fiber durability',
    ],
  },
]

export const MUDROOM_ENTRY_RESET_SKIP_LIST: SkipItem[] = [
  // ===== Type A =====
  {
    id: 'skip_decorative_baskets_wet_gear',
    type: 'wrong_version',
    title: 'Decorative wicker or jute baskets for wet gear',
    marketingPitch: 'Stylish entry organization that hides clutter.',
    realReason:
      "Wicker and jute hold water, mold, and rot in 1-2 seasons of actual wet-gear use. The Pinterest photo shows them dry; reality is wet swimsuits and dripping winter gloves. Use plastic bins for wet stuff and reserve aesthetic baskets for dry rotation only.",
    amountSaved: { low: 30, high: 70 },
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Mudroom storage material durability'],
  },
  {
    id: 'skip_indoor_decorative_rug_lake',
    type: 'wrong_version',
    title: 'Indoor decorative rugs at lake or mud entries',
    marketingPitch: 'Welcoming entry rug, statement piece.',
    realReason:
      "Cotton, wool, jute, sisal — beautiful materials, all wrong for actual mud/lake use. Hold water, ruin in 1-2 seasons, retain mildew. Synthetic rubber-backed mats are the right material here. Save the decorative rug for the formal entry, not the working one.",
    amountSaved: { low: 80, high: 200 },
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Wirecutter best entry mat by material'],
  },
  {
    id: 'skip_too_small_boot_tray',
    type: 'wrong_version',
    title: 'Too-small boot trays (24-inch or smaller for 3+ person households)',
    marketingPitch: 'Compact boot tray for small entries.',
    realReason:
      "24-inch trays fit 2 pairs of boots. A household with 3+ people needs 36 inches minimum. Wrong size means boots end up off the tray on the floor — defeats the entire purpose. Measure household needs before buying.",
    amountSaved: { low: 0, high: 15 },
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Mudroom layout sizing guidance'],
  },
  {
    id: 'skip_adhesive_hooks_wet_coats',
    type: 'wrong_version',
    title: 'Adhesive (3M-style) hooks for wet winter coats',
    marketingPitch: 'No drilling, no holes, easy install.',
    realReason:
      "Wet coat weight + humidity defeats the adhesive within 3-6 months. Hook falls off, coat hits the floor, you're patching paint where the adhesive ripped off. Real wall hooks with anchors are a one-time install for 20+ years of service.",
    amountSaved: { low: 10, high: 25 },
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Adhesive hook weight failure data'],
  },
  {
    id: 'skip_white_linen_bench',
    type: 'wrong_version',
    title: 'White or linen-upholstered benches for working entries',
    marketingPitch: 'Bright, welcoming statement piece.',
    realReason:
      "Pinterest photo lasts; reality lasts 2-3 weeks of actual lake/mud-season use. Upholstery becomes permanently stained and ruined. The mudroom isn't the formal entry; use materials that work — wood, vinyl, or wipe-able fabric.",
    amountSaved: { low: 100, high: 300 },
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Mudroom upholstery durability'],
  },

  // ===== Type B =====
  {
    id: 'skip_custom_built_ins_first',
    type: 'wrong_category',
    title: 'Custom mudroom built-ins before testing layout',
    realReason:
      "Custom built-ins ($3,000-$8,000) lock in choices that may not work once the room is in use. Test the layout with portable furniture (bench, hooks, bins) for at least one full season. Then customize what works. Locked-in built-ins that don't fit the daily flow are expensive mistakes.",
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Mudroom design iteration guidance'],
  },
  {
    id: 'skip_smart_locks_for_mudroom',
    type: 'wrong_category',
    title: 'Smart locks for mudroom entry (interior door)',
    realReason:
      "Smart locks make sense for exterior doors. The mudroom-to-house door is interior. The marketing pitch ('keep mud sealed in') is real, but a regular lock with a hook works for $5 instead of $200. Skip.",
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Smart lock use-case analysis'],
  },
  {
    id: 'skip_air_curtain',
    type: 'wrong_category',
    title: 'Air curtain blowers for mudroom entries',
    realReason:
      "Commercial buildings use air curtains to separate climate zones. In a residential mudroom they're noisy ($300+), don't really stop dirt, and consume electricity continuously. Skip in favor of a tight door and a good entry mat.",
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Residential vs commercial entry strategies'],
  },
  {
    id: 'skip_mud_specific_specialty_furniture',
    type: 'wrong_category',
    title: 'Mud-specific specialty furniture (slatted benches, drainage seats)',
    realReason:
      "Niche products marketed for 'mudroom-specific' use at $400+. A solid wood bench with cubbies does the same work. Specialty 'drainage' designs are usually solving a problem that doesn't exist in residential settings.",
    appliesToScope: ['mudroom_entry_reset'],
    citations: ['Mudroom furniture category analysis'],
  },
]

export const MUDROOM_ENTRY_RESET_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_boot_tray', 'has_entry_mat', 'has_wall_hooks'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
  mud_season: { selectedTier: 'sweet_spot', alreadyHave: [] },
}
