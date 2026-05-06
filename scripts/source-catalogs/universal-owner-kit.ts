// scripts/source-catalogs/universal-owner-kit.ts
// V7.2.5 — Cross-project owner toolkit (topic: 'universal')

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const UNIVERSAL_OWNER_KIT_TOPIC = 'universal'
export const UNIVERSAL_OWNER_KIT_SCOPE = 'universal_owner_kit'
export const UNIVERSAL_OWNER_KIT_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'absentee_owner',
]

export const UNIVERSAL_OWNER_KIT_METADATA = {
  smartCartPromise:
    'Build the minimal owner kit that prevents extra trips and avoids buying contractor-grade tools.',
  primaryCustomerPain:
    "Vermont second-home owners face a contractor-scarcity problem. Small projects that would take a contractor 30 minutes turn into multi-week waits. Having the right $200-$400 owner kit at the property eliminates 80% of those wait-for-contractor moments.",
  valueProposition:
    "Spend $300 once. Save 6+ hours of trips per year. Skip 4-6 contractor calls for things you can handle yourself if you have the tools. The math: contractor minimum visit charge is typically $150-$250. Own kit = avoid 1-2 of these per year and break even by year 1.",
  routeOutRules: [
    {
      condition: 'electrical_or_plumbing_specific',
      destination: 'small_pro',
      reason:
        "Owner kit covers carpentry, basic mounting, drilling, sealing. It does not cover electrical (live wires) or plumbing (water under pressure). Those still go to a pro.",
    },
  ],
  seasonalUrgency: undefined, // Year-round relevance
}

export const UNIVERSAL_OWNER_KIT_SLOTS: CartSlot[] = [
  // ============================================================
  // SLOT 1: Drill / driver
  // ============================================================
  {
    slotId: 'owner_drill_driver',
    slotLabel: 'Cordless drill / driver',
    slotKind: 'core',
    conditionalOn: ['has_cordless_drill'],
    tiers: {
      budget: {
        productName: 'Black+Decker 20V MAX cordless drill kit (with battery + charger)',
        priceLow: 55,
        priceHigh: 85,
        affiliateUrl:
          'https://www.amazon.com/s?k=black+decker+20v+cordless+drill+kit&tag=alderprojects-20',
        productSpec:
          '20V MAX lithium-ion. 1 battery + charger. ~$65. Adequate torque for residential use; struggles on hardwood and large fasteners. 2-3 year typical battery life with regular use.',
      },
      sweet_spot: {
        productName: 'DeWalt DCD777 20V MAX brushless drill kit (2 batteries + charger)',
        priceLow: 145,
        priceHigh: 195,
        affiliateUrl:
          'https://www.amazon.com/s?k=dewalt+dcd777+20v+max+brushless+drill+kit&tag=alderprojects-20',
        productSpec:
          'Brushless motor (longer life than brushed). 20V MAX. 2 batteries + fast charger + bag. ~$160. The DeWalt DCD777 is the verified Wirecutter pick for homeowner use. Brushless = 50% longer motor life and runtime than brushed equivalents.',
      },
      premium: {
        productName: 'Milwaukee M18 FUEL drill + impact driver combo kit',
        priceLow: 280,
        priceHigh: 420,
        affiliateUrl:
          'https://www.amazon.com/s?k=milwaukee+m18+fuel+drill+impact+driver+combo&tag=alderprojects-20',
        productSpec:
          'Pro-grade. Drill + impact driver in one kit. Significantly higher torque than DeWalt at homeowner tier. Worth it ONLY if you have ongoing serious projects (deck building, large carpentry).',
      },
    },
    slotPurpose:
      "The single most-used owner-kit tool. Drives screws, drills holes, the foundation of all DIY.",
    whyItMatters:
      "Without a cordless drill, every project starts with a trip to borrow or buy. With one, projects start when you have time, not when the hardware store is open.",
    commonMistake:
      "Buying a premium cordless ecosystem (Milwaukee M18, DeWalt 20V MAX with 5+ tools) for one project. The premium ecosystem is for ongoing serious work. For occasional residential use, the sweet-spot drill kit alone covers 95% of needs.",
    whyThis:
      "The DeWalt DCD777 is the reviewer-validated pick at this tier. Brushless motor, 2 batteries (one charging while you work), reliable torque for residential use. ~$160 once, lasts 10+ years.",
    whyNotCheaper:
      "Black+Decker works. The motor is brushed (shorter life), torque is borderline for hardwood, battery degrades within 2-3 years. For occasional very-light use, fine. For Vermont DIY with some real projects, the DeWalt earns its premium.",
    whyNotPremium:
      "Milwaukee M18 FUEL is genuinely better. It's also genuinely overkill for a homeowner who uses it monthly. The torque headroom isn't useful for residential tasks — you're paying for capability you won't use. If you have ongoing carpentry projects, then yes; otherwise the sweet-spot DeWalt is right.",
    contextNote:
      "Stick with one battery platform for all your tools. Once you commit to DeWalt 20V MAX, expand within that ecosystem (impact driver, circular saw, etc.) — they share batteries.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'drill_bit_set',
      reason:
        "You have the drill. The next-step gap is a quality bit set. A drill without good bits is half a tool.",
    },
    whenToSkip: [
      'Already own a cordless drill (any platform)',
      'Property is rental and tools provided',
    ],
    citations: [
      'Wirecutter best cordless drill review',
      'DeWalt DCD777 product documentation',
      'Brushless vs brushed motor lifespan data',
    ],
  },

  // ============================================================
  // SLOT 2: Drill bit set
  // ============================================================
  {
    slotId: 'owner_drill_bits',
    slotLabel: 'Drill bit + driver bit set',
    slotKind: 'core',
    conditionalOn: ['has_drill_bits'],
    tiers: {
      budget: {
        productName: 'Generic 100-piece drill bit set',
        priceLow: 18,
        priceHigh: 32,
        affiliateUrl:
          'https://www.amazon.com/s?k=100+piece+drill+bit+set+homeowner&tag=alderprojects-20',
        productSpec:
          'Mixed steel drill bits + driver bits in plastic case. 100+ pieces. Most are filler (rarely-needed sizes). The 8-12 you actually use are mid-quality; rest is decoration.',
      },
      sweet_spot: {
        productName: 'DeWalt 20-piece titanium drill bit set + 30-piece driver bit set',
        priceLow: 35,
        priceHigh: 60,
        affiliateUrl:
          'https://www.amazon.com/s?k=dewalt+titanium+drill+bit+set+driver+bit+set&tag=alderprojects-20',
        productSpec:
          'Titanium-coated drill bits (longer life than uncoated). Pyramid-style driver bit set (Phillips, square, Torx). Pro-grade quality on the bits you actually use.',
      },
      premium: {
        productName: 'DeWalt cobalt drill bit set + Wera driver bit kit',
        priceLow: 90,
        priceHigh: 150,
        affiliateUrl:
          'https://www.amazon.com/s?k=dewalt+cobalt+drill+bit+set+wera+driver+bits&tag=alderprojects-20',
        productSpec:
          'Cobalt steel drill bits (cuts hardened materials, longer life). Wera driver bits — German-made, the cabinet-shop standard. Premium.',
      },
    },
    slotPurpose:
      "Bits are consumables. The drill is the tool; the bits are what actually does the work.",
    whyItMatters:
      "Cheap bits dull within 5-10 holes in hardwood. Cheap driver bits strip Phillips screws and round off square heads. Quality bits last 100+ uses and don't strip fasteners.",
    commonMistake:
      "Buying 100-piece sets for $20. Most of the pieces are sizes you'll never use (the 1/16\" bit, the #14 driver). Quality is poor on the ones you will use. Better to buy 20 quality bits than 100 cheap ones.",
    whyThis:
      "DeWalt titanium-coated bits hit the right balance. They last through hundreds of holes in pine, dozens in hardwood. The driver bit set covers the fasteners you actually encounter — Phillips, square, Torx (T20, T25 — common on outdoor screws and modern fasteners).",
    whyNotCheaper:
      "Generic 100-piece sets are filler. The bits you use are low quality, and you're paying for decoration.",
    whyNotPremium:
      "Wera bits are pro-grade. The improvement over DeWalt for residential use is real but small. Save Wera for cabinet work or where stripping a fastener is unacceptable.",
    contextNote:
      "Add bits as you discover gaps. The sweet-spot kit covers 90% of common tasks. Buy specific specialty bits (masonry, glass, large hole saw) only when you need them.",
    citations: [
      'DeWalt titanium drill bit specifications',
      'Wera driver bit reviews',
    ],
  },

  // ============================================================
  // SLOT 3: Level
  // ============================================================
  {
    slotId: 'owner_level',
    slotLabel: 'Carpenter\'s level (24")',
    slotKind: 'core',
    conditionalOn: ['has_level'],
    tiers: {
      sweet_spot: {
        productName: 'Stanley FatMax 24" magnetic level',
        priceLow: 25,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=stanley+fatmax+24+inch+magnetic+level&tag=alderprojects-20',
        productSpec:
          '24-inch aluminum body. 3 vials (horizontal, vertical, 45°). Strong magnetic edge for steel surfaces. Stanley FatMax is the standard residential level. ~$30. Lifetime accuracy if not dropped on concrete.',
      },
    },
    slotPurpose:
      "Confirm horizontal and vertical alignment before mounting anything. The single most-used tool after the drill.",
    whyItMatters:
      "Crooked shelves, picture frames, and TVs are visible from across the room. A $30 level prevents a lifetime of that.",
    whyThis:
      "Stanley FatMax is the residential standard for the right reasons. Aluminum body holds its calibration for 10+ years. 24-inch length is the right size for most household tasks — long enough for shelves, short enough to fit in a drawer.",
    whyNotCheaper:
      "Sub-$15 levels arrive out of calibration and get worse with use. They look like levels but produce wrong readings.",
    whyNotPremium:
      "Laser levels exist for $80-300+. Genuinely useful for some tasks (hanging multiple frames at the same height, tile work). For typical residential mounting, the bubble level is faster and more reliable.",
    citations: [
      'Stanley FatMax product line documentation',
      'Carpenter level calibration testing',
    ],
  },

  // ============================================================
  // SLOT 4: Stud finder
  // ============================================================
  {
    slotId: 'owner_stud_finder',
    slotLabel: 'Stud finder (electronic)',
    slotKind: 'core',
    conditionalOn: ['has_stud_finder'],
    tiers: {
      sweet_spot: {
        productName: 'Franklin Sensors ProSensor 710 stud finder',
        priceLow: 45,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=franklin+sensors+prosensor+710+stud+finder&tag=alderprojects-20',
        productSpec:
          'Multi-sensor (no calibration required). Detects studs through standard drywall. Wirecutter pick for residential use. ~$50. Battery-powered (1 9V battery).',
      },
    },
    slotPurpose:
      "Find studs reliably so wall-mounted hooks, shelves, TVs, and cabinets are anchored to structure, not just drywall.",
    whyItMatters:
      "Drywall anchors hold ~30 lb. A stud holds ~200+ lb. For anything heavy (TV, large mirror, cabinet), the difference is between secure and dangerous.",
    commonMistake:
      "Cheap single-sensor stud finders that require calibration on every wall. They produce false positives (electrical wires, plumbing pipes) and miss real studs. The Franklin multi-sensor doesn't need calibration.",
    whyThis:
      "Franklin Sensors ProSensor is the Wirecutter pick. Multi-sensor design eliminates the calibration step and shows the full edge-to-edge stud width with LED indicators. ~$50, lasts 10+ years.",
    whyNotCheaper:
      "$15 stud finders are unreliable. False readings cost more in patched holes than the $30 saved.",
    whyNotPremium:
      "Pro-grade stud finders (Bosch, Zircon Pro) are $100-200. The marginal accuracy improvement isn't worth it for residential use.",
    citations: [
      'Wirecutter best stud finder review',
      'Franklin Sensors product documentation',
    ],
  },

  // ============================================================
  // SLOT 5: Tape measure
  // ============================================================
  {
    slotId: 'owner_tape_measure',
    slotLabel: 'Tape measure (25\')',
    slotKind: 'core',
    conditionalOn: ['has_tape_measure'],
    tiers: {
      sweet_spot: {
        productName: 'Stanley FatMax 25-foot tape measure',
        priceLow: 18,
        priceHigh: 28,
        affiliateUrl:
          'https://www.amazon.com/s?k=stanley+fatmax+25+foot+tape+measure&tag=alderprojects-20',
        productSpec:
          '25-foot length. 1.25" wide blade with 11-foot standout (extends 11 feet without bending). Belt clip, magnetic tip, BladeArmor coating. Stanley FatMax is the residential standard.',
      },
    },
    slotPurpose:
      "Measure for materials, layout, and replacement parts. The most-used non-power tool.",
    whyItMatters:
      "Wrong measurements cost double — buy the wrong material, return it, buy again, install. A reliable tape measure that stays accurate over 10 years is the foundation.",
    whyThis:
      "Stanley FatMax has the longest standout of any residential tape (11 feet without bending), which matters for measuring above your head or across rooms alone. Magnetic tip catches on metal — useful for measuring against existing hardware. ~$25 for 10+ years of service.",
    whyNotCheaper:
      "Cheap tape measures have weak springs, no magnetic tip, short standout. Functional but slower for the same tasks.",
    whyNotPremium:
      "Premium tapes ($40-60) add features (laser distance, longer length) that are useful for pros. For residential use, the FatMax is right-sized.",
    citations: ['Stanley FatMax tape measure documentation'],
  },

  // ============================================================
  // SLOT 6: Utility knife
  // ============================================================
  {
    slotId: 'owner_utility_knife',
    slotLabel: 'Utility knife with blade refills',
    slotKind: 'core',
    conditionalOn: ['has_utility_knife'],
    tiers: {
      sweet_spot: {
        productName: 'Milwaukee FastBack folding utility knife + 100-pack blades',
        priceLow: 28,
        priceHigh: 42,
        affiliateUrl:
          'https://www.amazon.com/s?k=milwaukee+fastback+utility+knife+100+pack+blades&tag=alderprojects-20',
        productSpec:
          'Folding utility knife with quick-blade-change. Pocket-friendly. 100-pack of replacement blades. Milwaukee is the cabinet-shop standard. ~$15 knife + ~$20 blades.',
      },
    },
    slotPurpose:
      "Open boxes, cut rope, trim weatherstripping, slice caulk tubes — the constant small-cutting need.",
    whyItMatters:
      "Cheap utility knives have wobbly blades that slip during use (cut hazard) and don't accept standard refills. The Milwaukee FastBack is reliable and uses standard trapezoidal blades.",
    whyThis:
      "Folding knives fit in a pocket; fixed-blade knives don't. Quick-change blade is the right design — when the blade dulls, you switch in 5 seconds, not 30.",
    whyNotCheaper:
      "Sub-$10 utility knives are functional but slow blade changes and weaker mechanisms. The Milwaukee is the right-tier upgrade.",
    whyNotPremium:
      "Premium knives ($40+) add design but not function. The Milwaukee handles every residential task.",
    citations: ['Milwaukee FastBack product documentation'],
  },

  // ============================================================
  // SLOT 7: Caulk gun
  // ============================================================
  {
    slotId: 'owner_caulk_gun',
    slotLabel: 'Caulk gun (steel skeleton)',
    slotKind: 'core',
    conditionalOn: ['has_caulk_gun'],
    tiers: {
      sweet_spot: {
        productName: 'Newborn Brothers 250 steel skeleton caulk gun',
        priceLow: 18,
        priceHigh: 28,
        affiliateUrl:
          'https://www.amazon.com/s?k=newborn+brothers+250+caulk+gun&tag=alderprojects-20',
        productSpec:
          'Steel skeleton frame, 10:1 thrust ratio. Drip-free design. Pro-grade construction. ~$22. Used by professional caulkers and tile setters.',
      },
    },
    slotPurpose:
      "Apply caulk for sealing windows, doors, tubs, sinks — the small-leak prevention that prevents large damage.",
    whyItMatters:
      "Cheap plastic caulk guns slip, drip, and break the cartridge inside (waste of caulk). A steel skeleton gun lasts 20+ years.",
    whyThis:
      "Newborn Brothers 250 is the verified pro pick. 10:1 thrust ratio means clean push, drip-free design means no mid-job mess.",
    whyNotCheaper:
      "Plastic guns crack within 6-12 months. They also waste caulk (uneven push). The $5-8 saved is gone the second you ruin a tube.",
    whyNotPremium:
      "Pneumatic caulk guns exist for production work. For residential use, the manual steel gun is right-sized.",
    citations: ['Newborn Brothers product line documentation'],
  },

  // ============================================================
  // SLOT 8: Oscillating multi-tool
  // ============================================================
  {
    slotId: 'owner_multitool',
    slotLabel: 'Oscillating multi-tool (cordless)',
    slotKind: 'addon',
    conditionalOn: ['has_oscillating_multitool'],
    tiers: {
      sweet_spot: {
        productName: 'DeWalt DCS354 20V MAX brushless oscillating multi-tool (bare tool)',
        priceLow: 130,
        priceHigh: 180,
        affiliateUrl:
          'https://www.amazon.com/s?k=dewalt+dcs354+20v+max+oscillating+multi+tool&tag=alderprojects-20',
        productSpec:
          'Brushless oscillating multi-tool. Cuts, sands, scrapes, plunges. Universal blade interface. Bare tool (uses your existing DeWalt 20V battery). ~$150.',
      },
    },
    slotPurpose:
      "Cut, sand, plunge, and scrape in tight spaces where saws and grinders don't fit.",
    whyItMatters:
      "The multi-tool is the 'how do I cut THAT' answer for awkward jobs — flush-cutting a baseboard, removing old caulk, plunge-cutting drywall, sanding inside corners. Once you have one you wonder how you lived without it.",
    whyThis:
      "DeWalt DCS354 (bare tool) shares the 20V MAX battery with the drill. Brushless = quieter and longer-lasting. Universal blade interface accepts blades from any major brand.",
    whyNotCheaper:
      "Corded multi-tools work but the 20V MAX cordless integration with the drill matters — same batteries, same charger.",
    whyNotPremium:
      "Pro-grade multi-tools (Fein, Milwaukee FUEL) add power. For residential use, the DeWalt is sufficient.",
    contextNote:
      "Buy as bare tool only if you already own DeWalt 20V batteries. Otherwise the kit version with battery + charger is the right purchase.",
    citations: ['DeWalt DCS354 product documentation'],
  },

  // ============================================================
  // SLOT 9: Fastener kit
  // ============================================================
  {
    slotId: 'owner_fastener_kit',
    slotLabel: 'Screws, anchors, and fastener assortment',
    slotKind: 'core',
    conditionalOn: ['has_fastener_kit'],
    tiers: {
      sweet_spot: {
        productName: 'Drywall anchor kit + screw assortment (deck/wood/sheetmetal screws)',
        priceLow: 35,
        priceHigh: 55,
        affiliateUrl:
          'https://www.amazon.com/s?k=drywall+anchor+kit+screw+assortment+homeowner&tag=alderprojects-20',
        productSpec:
          'Plastic toggle anchors (50+), self-drilling drywall anchors (25+), wood screws (#6, #8 in various lengths), exterior deck screws, sheet metal screws. ~$40 for 200+ pieces. Covers residential mounting and small repair needs.',
      },
    },
    slotPurpose:
      "Have the right anchor and screw for whatever you're mounting, without a hardware-store run for each project.",
    whyItMatters:
      "The wrong drywall anchor is the difference between a hook that holds and a hook that pulls out. The kit covers the common scenarios so you have the right hardware on hand.",
    commonMistake:
      "Buying contractor-size assortments (1,000+ pieces, $80-120). For homeowner use, you'll never use the rare sizes. The 200-piece kit covers the common needs at half the cost.",
    whyThis:
      "Mid-size assortment hits the sweet spot — drywall anchors (the #1 missing piece), wood screws in common sizes, deck screws for exterior. Stays organized in a small toolbox.",
    whyNotCheaper:
      "Sub-$15 small kits cover only one category (drywall anchors only, or wood screws only). For the second category you're back at the store.",
    whyNotPremium:
      "Contractor-size assortments are for production work. For homeowner use, the marginal rare-size pieces aren't worth the price difference.",
    contextNote:
      "Replenish from bulk packs (Lowe's or Amazon) when you run out of a specific size. The kit is the starter; restocking is by-size.",
    citations: ['Residential fastener kit composition guidance'],
  },

  // ============================================================
  // SLOT 10: Work light
  // ============================================================
  {
    slotId: 'owner_work_light',
    slotLabel: 'Cordless work light or headlamp',
    slotKind: 'core',
    conditionalOn: ['has_work_light'],
    tiers: {
      sweet_spot: {
        productName: 'DeWalt 20V MAX LED work light + Coast headlamp',
        priceLow: 60,
        priceHigh: 100,
        affiliateUrl:
          'https://www.amazon.com/s?k=dewalt+20v+max+led+work+light+coast+headlamp&tag=alderprojects-20',
        productSpec:
          'DeWalt LED work light (uses 20V MAX battery from your drill — no separate battery needed) ~$45. Coast HL7 or HL8 headlamp ~$30 — for hands-free work in dark spaces (basements, attics, under sinks).',
      },
    },
    slotPurpose:
      "Light up dark spaces (basement plumbing, attic wiring, under-sink work) where overhead lighting doesn't reach.",
    whyItMatters:
      "Most home repair happens in poorly-lit spaces — basements, crawl spaces, behind cabinets, under sinks. Trying to work without proper light makes the job take 2-3x longer and increases the chance of mistakes.",
    whyThis:
      "DeWalt work light pairs with the drill's batteries — no extra ecosystem to manage. Coast HL7 headlamp is the verified-pick hands-free option for under-sink and tight spaces. Combined ~$70 covers all lighting needs.",
    whyNotCheaper:
      "Cheap flashlights work but you hold them in one hand, leaving only one hand for the work. The headlamp is the meaningful upgrade.",
    whyNotPremium:
      "Pro work lights ($150+) add brightness but not utility for residential use.",
    citations: [
      'DeWalt 20V MAX work light documentation',
      'Coast HL7/HL8 headlamp specifications',
    ],
  },
]

export const UNIVERSAL_OWNER_KIT_SKIP_LIST: SkipItem[] = [
  // ===== Type A =====
  {
    id: 'skip_100_piece_homeowner_kit',
    type: 'wrong_version',
    title: 'Generic 100-piece homeowner tool kits',
    marketingPitch: 'Everything you need in one box.',
    realReason:
      "These kits ($60-100) include 30 pieces you'll use, 70 pieces of filler. The pieces you use are low quality. Better to buy 8-10 quality tools individually than 100 mediocre ones. The kit's convenience pricing is fake — per-piece quality is worse than building your own.",
    amountSaved: { low: 40, high: 80 },
    appliesToScope: ['universal_owner_kit'],
    citations: ['Tool kit composition vs individual tool quality'],
  },
  {
    id: 'skip_premium_cordless_ecosystem_one_project',
    type: 'wrong_version',
    title: 'Premium cordless ecosystem (Milwaukee M18 FUEL, etc.) for one project',
    marketingPitch: 'Pro-grade tools that last forever.',
    realReason:
      "Pro-grade ecosystems make sense for ongoing serious work — daily contractor use, heavy carpentry, large remodels. For a homeowner doing 6-12 small projects per year, you're paying for capability you'll never use. The DeWalt sweet-spot tier is the right scale.",
    amountSaved: { low: 200, high: 500 },
    appliesToScope: ['universal_owner_kit'],
    citations: ['Pro vs homeowner tool ecosystem analysis'],
  },
  {
    id: 'skip_laser_levels_simple_hanging',
    type: 'wrong_version',
    title: 'Laser levels for simple hanging tasks',
    marketingPitch: 'Hang anything perfectly with laser-precise alignment.',
    realReason:
      "Laser levels ($80-300) are great for hanging multiple frames at the same height, tile work, drop-ceiling installation. For hanging a single shelf, picture, or coat hook, the bubble level is faster and just as accurate. The laser earns its place when alignment-across-distance matters.",
    amountSaved: { low: 50, high: 150 },
    appliesToScope: ['universal_owner_kit'],
    citations: ['Laser level use-case analysis'],
  },
  {
    id: 'skip_no_name_drill_bits',
    type: 'wrong_version',
    title: 'No-name drill bits in mega-packs (200+ pieces for $20)',
    marketingPitch: 'Hundreds of bits, every size you\'ll ever need.',
    realReason:
      "Most pieces are sizes you don't need. Quality is poor on the ones you do — bits dull within 5-10 holes, driver bits strip after 50 uses. Buy a 20-piece quality set instead. The math is real: 5 quality bits last 100x longer than 100 cheap ones.",
    amountSaved: { low: 5, high: 25 },
    appliesToScope: ['universal_owner_kit'],
    citations: ['Drill bit quality vs quantity analysis'],
  },
  {
    id: 'skip_wrong_drywall_anchors',
    type: 'wrong_version',
    title: 'Plastic expansion anchors for heavy items',
    marketingPitch: 'Universal drywall anchor for any project.',
    realReason:
      "Plastic expansion anchors hold ~30 lb. They're sold as 'universal' but fail under heavier loads (large mirrors, TVs, full bookshelves). For heavy loads use toggle bolts (50-100 lb) or stud-mount. The anchor kit should include both types.",
    amountSaved: { low: 0, high: 50 },
    appliesToScope: ['universal_owner_kit'],
    citations: ['Drywall anchor weight rating standards'],
  },

  // ===== Type B =====
  {
    id: 'skip_contractor_assortments_homeowner',
    type: 'wrong_category',
    title: 'Contractor-size fastener assortments for homeowner use',
    realReason:
      "1,000+ piece contractor kits ($80-120) are for production work. Homeowner-scale projects use 30-50 pieces per year. The 200-piece homeowner kit covers needs at 60% less cost. The 800 extra pieces in the contractor kit go to waste.",
    appliesToScope: ['universal_owner_kit'],
    citations: ['Fastener consumption rate by use case'],
  },
  {
    id: 'skip_specialty_tools_one_off',
    type: 'wrong_category',
    title: 'Specialty tools (tile saw, plumbing torch, etc.) for one-time use',
    realReason:
      "Tile saws, plumbing torches, drywall lifts — all useful but $100-300 for occasional use. Rent these tools instead. Home Depot tool rental is $30-80 per use. Break-even is 4-6 uses; one-time projects should rent.",
    appliesToScope: ['universal_owner_kit'],
    citations: ['Tool rental vs ownership economics'],
  },
  {
    id: 'skip_cordless_ecosystem_split',
    type: 'wrong_category',
    title: 'Splitting cordless tools across multiple battery platforms',
    realReason:
      "Buying DeWalt drill + Milwaukee circular saw + Ryobi sander means three battery chargers, three battery types, and zero interoperability. Pick one platform and stick with it. The 'best in each category' approach costs more in batteries than you save in marginal performance.",
    appliesToScope: ['universal_owner_kit'],
    citations: ['Cordless tool ecosystem standardization'],
  },
  {
    id: 'skip_tool_chest_for_starter_kit',
    type: 'wrong_category',
    title: 'Buying a rolling tool chest before owning the tools',
    realReason:
      "Tool chests ($150-500) are for organizing 50+ tools. With 8-10 starter tools, a $20 toolbox or even a tote works. Buy the chest when you outgrow the toolbox, not before.",
    appliesToScope: ['universal_owner_kit'],
    citations: ['Tool storage progression for homeowners'],
  },
]

export const UNIVERSAL_OWNER_KIT_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_cordless_drill', 'has_tape_measure', 'has_level'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
  absentee_owner: {
    selectedTier: 'sweet_spot',
    alreadyHave: [],
    // Absentee owners benefit from a labeled tote kept at the property
    // so the kit is always there.
  },
}
