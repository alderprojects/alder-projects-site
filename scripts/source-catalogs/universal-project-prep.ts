// scripts/source-catalogs/universal-project-prep.ts
// V7.2.5 — Project prep, measure, document catalog (topic: 'universal')

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const UNIVERSAL_PROJECT_PREP_TOPIC = 'universal'
export const UNIVERSAL_PROJECT_PREP_SCOPE = 'universal_project_prep'
export const UNIVERSAL_PROJECT_PREP_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
]

export const UNIVERSAL_PROJECT_PREP_METADATA = {
  smartCartPromise:
    'Get the measurements, photos, and notes right before buying materials or calling someone.',
  primaryCustomerPain:
    "Most botched projects fail at the prep step. Wrong measurement = wrong material = wasted trip. Bad photos = contractor quote that's off by 30%. Picking paint without sample boards = repaint.",
  valueProposition:
    "$50-$120 of measure-and-document tools prevents 4-6 hours of rework per project. For a homeowner doing 6 projects per year, that's 30+ hours saved annually.",
  routeOutRules: undefined,
  seasonalUrgency: undefined,
}

export const UNIVERSAL_PROJECT_PREP_SLOTS: CartSlot[] = [
  {
    slotId: 'prep_laser_measure',
    slotLabel: 'Laser distance measure',
    slotKind: 'core',
    conditionalOn: ['has_laser_measure'],
    tiers: {
      budget: {
        productName: 'Bosch GLM 20 Blaze 65-foot laser distance measure',
        priceLow: 38,
        priceHigh: 58,
        affiliateUrl:
          'https://www.amazon.com/s?k=bosch+glm+20+blaze+laser+distance+measure&tag=alderprojects-20',
        productSpec:
          '65-foot range, +/- 1/8 inch accuracy. Single-button operation. ~$45. Bosch is the consumer-pro standard.',
      },
      sweet_spot: {
        productName: 'Bosch GLM 165-27 165-foot laser measure with Bluetooth',
        priceLow: 95,
        priceHigh: 145,
        affiliateUrl:
          'https://www.amazon.com/s?k=bosch+glm+165+laser+measure+bluetooth&tag=alderprojects-20',
        productSpec:
          '165-foot range. Area, volume, length calculations. Bluetooth syncs with Bosch app for measurement logging. Pythagoras mode for indirect measurement. ~$120.',
      },
    },
    slotPurpose:
      "Measure rooms, walls, and large distances accurately and alone (no holding the other end of the tape).",
    whyItMatters:
      "Tape measure works for small distances. Beyond 12 feet, holding both ends accurately is hard, and the tape sags. Laser measure gives accurate readings at room scale or beyond — critical for accurate quotes, material lists, and project planning.",
    commonMistake:
      "Buying a premium laser measure for one simple room. The Bosch GLM 20 Blaze handles 95% of residential needs. Premium features (Bluetooth, app) are useful for ongoing renovation work — not for a one-off project.",
    whyThis:
      "Bosch GLM 20 Blaze is the verified-pick consumer laser measure. ±1/8 inch accuracy is sufficient for residential use. ~$45 for 10+ years of service. Pocket-sized.",
    whyNotCheaper:
      "Sub-$30 laser measures are generally accurate to ±1/4 inch. Fine for rough work; not for cabinet ordering or trim work. The Bosch is the right tier.",
    whyNotPremium:
      "GLM 165 is for renovation projects with multiple rooms. For one project, the Blaze covers all needs.",
    contextNote:
      "Measure twice, mount once. Use the laser for the initial measure; verify with tape measure for critical dimensions before cutting.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'graph_paper_kit',
      reason:
        "You can measure accurately. The next-step gap is documenting the measurements — graph paper for room layouts, painter's tape for marking on-site.",
    },
    citations: [
      'Bosch GLM product documentation',
      'Wirecutter best laser distance measure review',
    ],
  },
  {
    slotId: 'prep_graph_paper_kit',
    slotLabel: 'Graph paper + scale ruler kit',
    slotKind: 'core',
    conditionalOn: ['has_graph_paper'],
    tiers: {
      sweet_spot: {
        productName: 'Engineering graph paper pad + architectural scale ruler',
        priceLow: 18,
        priceHigh: 32,
        affiliateUrl:
          'https://www.amazon.com/s?k=engineering+graph+paper+architectural+scale+ruler&tag=alderprojects-20',
        productSpec:
          '8.5"x11" 1/4" engineering graph paper pad (50+ sheets) + Mr. Pen architectural scale ruler ($8) + clipboard. ~$25 total. Sketch room layouts at scale (1 square = 1 ft).',
      },
    },
    slotPurpose:
      "Sketch rooms and project layouts on graph paper at scale, so contractors and material lists work from accurate plans.",
    whyItMatters:
      "Sketches without scale produce wrong material orders. Sketches with scale (1 square = 1 ft) are accurate enough for contractor quotes and DIY material lists.",
    whyThis:
      "Engineering graph paper + scale ruler combo is the prep-kit foundation. Lay it out on the kitchen table; sketch the room; annotate with measurements from the laser.",
    whyNotCheaper:
      "Plain notebook paper without scale is the wrong tool. The graph + ruler combo is cheap and right.",
    whyNotPremium:
      "CAD software exists for free (Sketchup) and at low cost. For a homeowner doing one room, the paper sketch is faster and adequate. CAD is for renovation pros.",
    contextNote:
      "Photograph the sketch when done. Send to contractors when getting quotes. The visual is more useful than verbal description.",
    citations: ['Architectural scale standards'],
  },
  {
    slotId: 'prep_painters_tape',
    slotLabel: "Painter's tape (multi-pack)",
    slotKind: 'core',
    conditionalOn: ['has_painters_tape'],
    tiers: {
      sweet_spot: {
        productName: 'FrogTape 1.41" multi-surface 4-pack (60 yd each)',
        priceLow: 28,
        priceHigh: 42,
        affiliateUrl:
          'https://www.amazon.com/s?k=frogtape+multi+surface+1.41+inch+4+pack&tag=alderprojects-20',
        productSpec:
          'Green FrogTape multi-surface, 1.41" wide, 60 yards per roll, 4-pack. PaintBlock technology prevents bleed-through. Multi-purpose: painting, marking layout on-site, labeling boxes, masking trim.',
      },
    },
    slotPurpose:
      "Mark layout on-site, mask edges for painting, label boxes during projects.",
    whyItMatters:
      "Painter's tape on the wall shows you where the cabinet will go before drilling. On the floor, it shows where the rug will sit. On the trim, it gives clean paint lines. The tape is the cheap version of 'measure twice'.",
    whyThis:
      "FrogTape is the verified Wirecutter pick. The PaintBlock prevents bleed-through (clean paint lines), and the 4-pack is enough for a full painting project plus marking.",
    whyNotCheaper:
      "Cheap painter's tape leaves residue and bleeds paint underneath. The clean line that FrogTape produces is the actual product — that's what you're paying for.",
    whyNotPremium:
      "Premium specialty tapes exist for delicate surfaces. For typical residential use, FrogTape multi-surface covers all needs.",
    contextNote:
      "Apply tape to dry, dust-free surface. Press edge firmly with a credit card or putty knife for cleanest line. Remove within 14 days — longer adheres permanently.",
    citations: [
      'FrogTape product documentation',
      "Wirecutter painter's tape review",
    ],
  },
  {
    slotId: 'prep_label_maker',
    slotLabel: 'Label maker (handheld)',
    slotKind: 'addon',
    conditionalOn: ['has_label_maker'],
    tiers: {
      sweet_spot: {
        productName: 'Brother P-touch PT-D210 label maker',
        priceLow: 38,
        priceHigh: 58,
        affiliateUrl:
          'https://www.amazon.com/s?k=brother+p+touch+pt+d210+label+maker&tag=alderprojects-20',
        productSpec:
          'Handheld thermal label maker. Multiple font sizes, frames, symbols. Uses standard TZe-tape (laminated, water-resistant). 6 AAA batteries. ~$45 + tape refills. Brother P-touch is the consumer-pro label maker standard.',
      },
    },
    slotPurpose:
      "Label boxes, bins, shutoffs, electrical panels, and project folders so anyone can find anything.",
    whyItMatters:
      "Handwritten labels fade and smear. Laminated thermal labels last 10+ years and stay legible. The labeled mudroom bins (paste 3) and the labeled shutoffs (freeze prevention scope) are made by this device.",
    whyThis:
      "Brother P-touch is the residential standard. ~$45 once + ~$10 per tape refill. One refill labels 50+ items — plenty for whole-house labeling.",
    whyNotCheaper:
      "Cheap label makers ($15-25) use inferior tape that peels and fades. The Brother is the right tier.",
    whyNotPremium:
      "Industrial label makers (Brady, etc.) exist for $100+. Same function for residential use.",
    contextNote:
      "Apply to clean, dry, smooth surface. Pre-laminated labels survive freezer, bathroom, and outdoor conditions.",
    citations: ['Brother P-touch product line documentation'],
  },
  {
    slotId: 'prep_sample_boards',
    slotLabel: 'Sample boards / paint test cards',
    slotKind: 'addon',
    conditionalOn: ['has_sample_boards'],
    tiers: {
      sweet_spot: {
        productName: 'Pre-primed white sample boards (12-pack, 11"x14")',
        priceLow: 22,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=pre+primed+sample+boards+11x14+12+pack&tag=alderprojects-20',
        productSpec:
          'Pre-primed plywood or hardboard sample boards. 11"x14". 12-pack. Use for testing paint colors, stain colors, sample finishes. Movable around the room to test in different lighting.',
      },
    },
    slotPurpose:
      "Test paint and stain colors on a movable surface that matches your wall, not on the wall itself.",
    whyItMatters:
      "Paint colors look completely different at different times of day, on different walls (north-facing vs south-facing), and against different trim. A sample painted directly on the wall locks you in. Sample boards move freely so you see the color in actual conditions.",
    whyThis:
      "Pre-primed sample boards are the right format. Apply paint sample, hang in the room, observe over a few days at different times. Then commit.",
    whyNotCheaper:
      "Cardboard or unprimed boards absorb paint differently than your wall. The pre-primed boards match the actual painted wall surface.",
    whyNotPremium:
      "Premium 'test boards' that match specific wall textures exist for $5+ each. For residential use, the standard pre-primed is fine.",
    contextNote:
      "Test 2-3 colors at once on separate boards. Move them around the room over 2-3 days. Commit only when one consistently looks right.",
    citations: ['Paint sample testing best practices'],
  },
  {
    slotId: 'prep_phone_tripod',
    slotLabel: 'Phone tripod + clip light',
    slotKind: 'addon',
    conditionalOn: ['has_phone_tripod'],
    tiers: {
      sweet_spot: {
        productName: 'Manfrotto PIXI mini tripod + clip-on LED ring light',
        priceLow: 35,
        priceHigh: 60,
        affiliateUrl:
          'https://www.amazon.com/s?k=manfrotto+pixi+mini+tripod+clip+on+led+ring+light&tag=alderprojects-20',
        productSpec:
          'Manfrotto PIXI mini tabletop tripod ($25) + clip-on LED ring light ($15-25). Tripod holds phone steady for room photos and video walkthroughs. Ring light fills shadows in dark rooms (basements, closets, under sinks).',
      },
    },
    slotPurpose:
      "Take steady, well-lit photos of project areas for contractor quotes, before/after documentation, and material reference.",
    whyItMatters:
      "Bad photos lead to wrong contractor quotes. Steady photos with proper lighting show what's actually in the room. The phone tripod removes the shake; the ring light fills the shadows.",
    whyThis:
      "Manfrotto PIXI is the standard mini tripod. Clip ring light fills shadows that ceiling lights miss. Combined ~$45.",
    whyNotCheaper:
      "Cheap mini tripods wobble. The Manfrotto is solid.",
    whyNotPremium:
      "Premium tripods are for photographers. For residential project documentation, the mini is right-sized.",
    citations: ['Manfrotto PIXI product documentation'],
  },
  {
    slotId: 'prep_inspection_mirror',
    slotLabel: 'Telescoping inspection mirror + endoscope',
    slotKind: 'addon',
    conditionalOn: ['has_inspection_mirror'],
    tiers: {
      sweet_spot: {
        productName: 'Telescoping inspection mirror + USB endoscope camera',
        priceLow: 28,
        priceHigh: 50,
        affiliateUrl:
          'https://www.amazon.com/s?k=telescoping+inspection+mirror+usb+endoscope+camera&tag=alderprojects-20',
        productSpec:
          'Telescoping inspection mirror (extends to 25") for under-cabinet, around-corner, and tight-space visual inspection. USB endoscope camera ($15-25) for going around bends — connects to phone via USB-C, shows live image of pipe interiors, wall cavities, drains.',
      },
    },
    slotPurpose:
      "See into spaces your eye and a flashlight can't reach: under cabinets, behind appliances, inside walls, down drains, into pipes.",
    whyItMatters:
      "Many home repairs are diagnosed by what you can see. The hidden leak under a cabinet, the rust deep inside a drain, the wire routing behind a wall — the inspection mirror and endoscope show you what's actually there before you cut, drill, or call someone.",
    whyThis:
      "Combo of mirror + endoscope covers all use cases. Mirror for direct visual; endoscope for around bends. ~$35 total.",
    whyNotCheaper:
      "Just the mirror without endoscope misses the in-pipe applications. The combo is right.",
    whyNotPremium:
      "Pro-grade endoscopes (Ridgid, etc.) at $200+ are for plumbers diagnosing complex issues. For residential diagnosis, the consumer endoscope is sufficient.",
    citations: ['Inspection tool product comparisons'],
  },
]

export const UNIVERSAL_PROJECT_PREP_SKIP_LIST: SkipItem[] = [
  {
    id: 'skip_buying_before_measuring',
    type: 'wrong_version',
    title: 'Buying materials before measuring',
    marketingPitch: '"Just grab a couple boards and see what fits."',
    realReason:
      "Wrong material count + wrong dimensions = wasted trip + wasted material. Measure first, document, then buy. The 30 minutes spent measuring saves 2-3 hours of rework. The laser measure pays for itself on the first project.",
    amountSaved: { low: 50, high: 200 },
    appliesToScope: ['universal_project_prep'],
    citations: ['Project prep efficiency analysis'],
  },
  {
    id: 'skip_premium_laser_one_room',
    type: 'wrong_version',
    title: 'Premium laser measure for one simple room',
    marketingPitch: 'Bluetooth, 165-foot range, app integration.',
    realReason:
      "Premium features (Bluetooth, app, Pythagoras mode) are useful for ongoing renovation work. For a single project — paint a room, measure for cabinets — the Bosch GLM 20 Blaze does the job at $45 vs $130. Right tier for the actual scope.",
    amountSaved: { low: 50, high: 100 },
    appliesToScope: ['universal_project_prep'],
    citations: ['Laser measure feature analysis'],
  },
  {
    id: 'skip_paint_directly_on_wall',
    type: 'wrong_version',
    title: 'Paint samples directly on the wall instead of sample boards',
    marketingPitch: '"Paint a small swatch on the wall to see the color."',
    realReason:
      "Painted swatches lock you to the wall — you can't move it to test in different lighting. The same color looks completely different at 8am vs 4pm vs against your trim. Sample boards let you move and compare. Plus: the wall now needs primer + paint before final color, vs starting clean.",
    amountSaved: { low: 0, high: 30 },
    appliesToScope: ['universal_project_prep'],
    citations: ['Paint testing best practices'],
  },
  {
    id: 'skip_photos_no_scale',
    type: 'wrong_version',
    title: 'Photo documentation without scale reference',
    marketingPitch: '"Take some pictures of the kitchen and send to contractors."',
    realReason:
      "Photos without scale are visual only. Contractors quote off them but can't size. Include a tape measure or yardstick in the frame for reference. The photo with scale is 10x more useful for getting accurate quotes.",
    amountSaved: { low: 0, high: 0 },
    appliesToScope: ['universal_project_prep'],
    citations: ['Contractor quote accuracy guidance'],
  },
  {
    id: 'skip_quote_no_documentation',
    type: 'wrong_version',
    title: 'Requesting quotes without measurements or photos',
    marketingPitch: "\"They'll come out and measure when they get here.\"",
    realReason:
      "Contractor walk-throughs without prior documentation are 30-60 minutes that the contractor charges back into the bid. Plus they're guessing on materials between the visit and the quote. Send measurements, sketches, and photos — get tighter quotes faster.",
    amountSaved: { low: 100, high: 500 },
    appliesToScope: ['universal_project_prep'],
    citations: ['Contractor bid accuracy and prep'],
  },
  {
    id: 'skip_premium_layout_tools_simple_project',
    type: 'wrong_category',
    title: 'Premium layout tools (CAD software, laser layout systems) for a simple project',
    realReason:
      "$200-$1,000 layout tools for renovation pros. For a homeowner doing a paint job or hanging a couple shelves, graph paper + tape measure + laser measure cover all needs. Don't buy pro tools for amateur projects.",
    appliesToScope: ['universal_project_prep'],
    citations: ['Project tool sizing analysis'],
  },
  {
    id: 'skip_smart_home_for_documentation',
    type: 'wrong_category',
    title: 'Smart home cameras as project documentation tools',
    realReason:
      "Smart cameras at $50-$200 are for security and surveillance, not project documentation. The phone you already own + tripod + ring light cover all documentation needs at a fraction of the cost.",
    appliesToScope: ['universal_project_prep'],
    citations: ['Documentation tool selection'],
  },
]

export const UNIVERSAL_PROJECT_PREP_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_tape_measure', 'has_painters_tape'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
}
