// V7.2.1 — kitchen_organizers slot universe.
//
// Eight core slots + three add-ons. Every product name, price range,
// crossover prose, warning, and context note is hand-curated for the
// initial v2 release. Affiliate URLs use Amazon search queries —
// real ASIN lookup automation is a v7.2.2 follow-up.
//
// Slot ordering is the order the cart renders top to bottom on the
// result page.

import type { CartSlot } from '@/lib/smart-cart-model'
import { buildAmazonUrl } from '@/lib/buildAmazonUrl'

export const KITCHEN_ORGANIZERS_SLOTS: CartSlot[] = [
  // ---------- SLOT 1: Cutlery tray ----------------------------------
  {
    slotId: 'kitchen_cutlery_tray',
    slotLabel: 'Cutlery tray — expandable bamboo',
    slotKind: 'core',
    conditionalOn: ['has_cutlery_tray'],
    tiers: {
      budget: {
        productName: 'Ryqtop Bamboo Drawer Organizer',
        priceLow: 12,
        priceHigh: 18,
        affiliateUrl: buildAmazonUrl('ryqtop bamboo drawer organizer expandable'),
        productSpec:
          'Bamboo, fits drawers up to 17 inches. Springloaded ends. 8 compartments.',
      },
      sweet_spot: {
        productName: 'Pipishell Bamboo Drawer Organizer',
        priceLow: 22,
        priceHigh: 28,
        affiliateUrl: buildAmazonUrl('pipishell bamboo drawer organizer'),
        productSpec:
          'Expandable from 13 to 19.6 inches. Spring-loaded ends. 4.7 stars over 42,000+ reviews.',
      },
      premium: {
        productName: 'Container Store Bamboo Drawer Organizers',
        priceLow: 50,
        priceHigh: 70,
        affiliateUrl: buildAmazonUrl('container store bamboo drawer organizer'),
        productSpec:
          'Premium bamboo, 18 to 22.25 inches expandable. Set of 2.',
      },
    },
    whyThis:
      'Expandable bamboo, fits standard residential 18-22 inch drawers — measure yours. Holds silverware plus 2-3 serving utensils.',
    whyNotCheaper:
      "Ryqtop only fits drawers up to 17 inches. Most kitchen drawers built post-1985 are wider, so the cheap one leaves gaps that let utensils migrate. Save $8 today, regret it the first time you reach for a wooden spoon and it's two compartments over.",
    whyNotPremium:
      "The Container Store version is genuinely beautiful but doesn't subdivide better than the Pipishell. The Kitchn's reviewer ranked them: 'Container Store was the prettiest, but Pipishell did the job for less than half the price.' Premium is for show kitchens, not function.",
  },

  // ---------- SLOT 2: Pull-out pantry baskets -----------------------
  {
    slotId: 'kitchen_pull_out_pantry',
    slotLabel: 'Pull-out pantry baskets — heavy-duty steel',
    slotKind: 'core',
    conditionalOn: ['has_pantry_baskets'],
    tiers: {
      budget: {
        productName: 'Simple Houseware Pull-Out Cabinet Sliding Basket',
        priceLow: 22,
        priceHigh: 30,
        affiliateUrl: buildAmazonUrl('simple houseware pull out cabinet basket'),
        productSpec:
          'Wire basket, 17.2 inch deep, 9.7 inch wide. Quick install, no full extension.',
      },
      sweet_spot: {
        productName: "HOLDN'STORAGE Pull-Out Cabinet Organizer 14W x 21D",
        priceLow: 45,
        priceHigh: 55,
        affiliateUrl: buildAmazonUrl('holdn storage pull out cabinet organizer'),
        productSpec:
          'Steel basket, full-extension slides, 50-pound capacity. Fits standard 15-1/4 inch cabinet opening. Lifetime limited warranty.',
      },
      premium: {
        productName: 'Rev-A-Shelf 5WB2-2122CR-1 Two-Tier',
        priceLow: 85,
        priceHigh: 130,
        affiliateUrl: buildAmazonUrl('rev a shelf two tier kitchen cabinet'),
        productSpec:
          'Cabinet-shop grade with soft close. Two tiers, 21 by 22 inches.',
      },
    },
    whyThis:
      'Heavy-duty steel that handles canned goods and small appliances without the wire bowing. Full-extension slides bring the back of the cabinet to you.',
    whyNotCheaper:
      "Simple Houseware uses a wire basket that bows under canned goods. The 17 inch depth is a tease — your cabinet is probably 22+ inches deep, so the wire won't reach. If you store food in this cabinet, you'll replace it within a year.",
    whyNotPremium:
      "Rev-A-Shelf two-tier is cabinet-shop grade with soft close. Two tiers is a tax for a feature you didn't ask for — most under-counter cabinets are 22-24 inches tall, and the top tier ends up sitting empty or holding things you can't reach.",
    warnings: [
      'Measure first — cabinet opening must be at least 15-1/4 inches wide. Many older cabinets are narrower.',
    ],
  },

  // ---------- SLOT 3: Spice drawer -----------------------------------
  {
    slotId: 'kitchen_spice_drawer',
    slotLabel: 'Spice drawer organizer — expandable bamboo, 4-tier',
    slotKind: 'core',
    conditionalOn: ['has_spice_solution'],
    tiers: {
      budget: {
        productName: 'DIOLOVE Plastic 3-Tier Expandable Spice Organizer',
        priceLow: 12,
        priceHigh: 18,
        affiliateUrl: buildAmazonUrl('diolove plastic spice drawer organizer'),
        productSpec:
          'Plastic, 3 angled tiers, expandable 11 to 22 inches. Slip-resistant base.',
      },
      sweet_spot: {
        productName: 'SpaceAid Bamboo Spice Drawer Organizer',
        priceLow: 22,
        priceHigh: 30,
        affiliateUrl: buildAmazonUrl('spaceaid bamboo spice drawer organizer'),
        productSpec:
          '4-tier angled rack, expandable 12 to 23 inches. Holds about 48 standard spice jars. Needs 3 inch drawer depth.',
      },
      premium: {
        productName: 'KraftMaid Wooden Spice Drawer Insert Kit',
        priceLow: 85,
        priceHigh: 110,
        affiliateUrl: buildAmazonUrl('kraftmaid wooden spice drawer insert'),
        productSpec:
          'Solid wood drop-in, custom-trimmable to drawer width. Cabinet-shop precision.',
      },
    },
    whyThis:
      'Expandable bamboo fits 12-23 inch drawers. Holds ~48 standard spice jars across 4 tiers.',
    whyNotCheaper:
      "DIOLOVE's plastic is functionally similar but the vents collect spice dust the bamboo doesn't, and reviews flag the non-slip pads detaching after 3-4 months in a humid kitchen. Vermont kitchens with summer humidity over 60 percent see this fast.",
    whyNotPremium:
      "KraftMaid drop-in looks great but you're paying for cabinet-shop precision in a drawer that holds spice jars regardless. The expandable bamboo is the right buy unless you're refacing.",
    warnings: [
      "Measure first — drawer interior must be at least 3 inches deep. Older kitchen drawers can be exactly 2-3/4 inches and won't fit.",
    ],
  },

  // ---------- SLOT 4: Under-sink organizer --------------------------
  {
    slotId: 'kitchen_under_sink',
    slotLabel: 'Under-sink organizer — expandable, P-trap friendly',
    slotKind: 'core',
    conditionalOn: ['has_under_sink_organization'],
    tiers: {
      // No budget tier — see whyNotCheaper for reasoning.
      sweet_spot: {
        productName:
          'Expandable 2-Tier Carbon Steel Under-Sink Organizer (26.8 to 35.8 inches)',
        priceLow: 50,
        priceHigh: 65,
        affiliateUrl: buildAmazonUrl(
          'expandable under sink organizer carbon steel two tier',
        ),
        productSpec:
          'Expands wide, 4 removable panels and 4 sliding baskets. Routes around P-trap and disposal. 100-ounce weight capacity.',
      },
      premium: {
        productName: 'Rev-A-Shelf Custom Under-Sink Pullout Kit',
        priceLow: 120,
        priceHigh: 200,
        affiliateUrl: buildAmazonUrl('rev a shelf under sink pullout kit'),
        productSpec:
          'Cabinet-shop install. Full extension on cabinet-grade hardware.',
      },
    },
    whyThis:
      "Expandable steel that routes around your P-trap and garbage disposal — that's the whole point of the modular panels. Holds detergents and cast iron without sagging.",
    whyNotCheaper:
      "There isn't a real budget tier worth recommending here. Most $20-30 under-sink racks have a fixed frame that assumes a flat cabinet floor and no plumbing. They literally don't fit around a garbage disposal — you'd return it.",
    whyNotPremium:
      "Rev-A-Shelf custom kit is real cabinet-shop install. If you're doing a sink replacement anyway, time it then. Otherwise this is overkill for 'I want to find the dish soap.'",
    warnings: [
      "Plumbing check: this product is for cabinets with standard P-trap or P-trap-and-disposal configurations. If your sink has an S-trap (older homes), you may have a code situation that needs addressing first — don't put an organizer over it.",
    ],
  },

  // ---------- SLOT 5: Lid organizer ---------------------------------
  {
    slotId: 'kitchen_lid_organizer',
    slotLabel: 'Tupperware / food container lid organizer',
    slotKind: 'core',
    conditionalOn: ['has_lid_organizer'],
    tiers: {
      sweet_spot: {
        productName: 'EVERIE Extendable Food Container Lid Organizer',
        priceLow: 24,
        priceHigh: 32,
        affiliateUrl: buildAmazonUrl('everie extendable lid organizer'),
        productSpec:
          'Adjustable length and dividers. Holds 8-12 lids vertically, sized small to large.',
      },
    },
    whyThis:
      "Most plastic-divider lid organizers tip when you grab one. The EVERIE adjustable holds lids upright — that's the point.",
    contextNote:
      'Honest call — if you have fewer than 6 lids total, skip this entirely and use a small bin you already own. The lid organizer pays off when you\'re past 8 lids and the chaos is real.',
  },

  // ---------- SLOT 6: Bag/wrap organizer ----------------------------
  {
    slotId: 'kitchen_bag_organizer',
    slotLabel: 'Plastic bag and wrap organizer',
    slotKind: 'core',
    conditionalOn: ['has_bag_organizer'],
    tiers: {
      sweet_spot: {
        productName: 'Bamboo Plastic Bag Organizer (4-pack), drawer-mounted',
        priceLow: 24,
        priceHigh: 32,
        affiliateUrl: buildAmazonUrl(
          'bamboo plastic bag organizer 4 pack drawer',
        ),
        productSpec:
          'Holds gallon bags, sandwich bags, foil, plastic wrap, parchment in upright slots. Anchor clips included.',
      },
      premium: {
        productName: 'Rev-A-Shelf Drawer-Mounted Wrap Organizer',
        priceLow: 60,
        priceHigh: 95,
        affiliateUrl: buildAmazonUrl('rev a shelf wrap drawer organizer'),
        productSpec: 'Cabinet-shop grade with sliding cutter.',
      },
    },
    whyThis:
      'Holds bags, foil, wrap, parchment in one drawer. Anchor clips keep it from migrating when you open the drawer.',
    whyNotCheaper:
      'Single-slot bag organizers (~$10) work for one box but you end up buying 4 at the same per-unit cost as the bundle.',
    whyNotPremium:
      "Rev-A-Shelf wrap organizer is overkill unless you're refacing. The bamboo 4-pack is what most people need.",
    contextNote:
      'Vermont tip — keep this in a drawer near the stove, not the fridge. Cooking workstation placement makes the difference.',
  },

  // ---------- SLOT 7: Drawer dividers --------------------------------
  {
    slotId: 'kitchen_drawer_dividers',
    slotLabel: 'Drawer dividers — adjustable bamboo, set of 4',
    slotKind: 'core',
    conditionalOn: ['has_drawer_dividers'],
    tiers: {
      sweet_spot: {
        productName: 'Utoplike Bamboo Kitchen Drawer Dividers (4-pack)',
        priceLow: 28,
        priceHigh: 35,
        affiliateUrl: buildAmazonUrl('utoplike bamboo drawer dividers 4 pack'),
        productSpec:
          'Spring-loaded, adjustable 17 to 22 inches. Multipurpose — kitchen, bedroom, anywhere.',
      },
      premium: {
        productName: 'Container Store Bamboo Drawer Dividers',
        priceLow: 80,
        priceHigh: 100,
        affiliateUrl: buildAmazonUrl('container store bamboo drawer divider'),
        productSpec:
          'Premium bamboo finish. Same spring-loaded mechanism.',
      },
    },
    whyThis:
      'Spring-loaded bamboo dividers that adapt to any drawer. Pros use these to break up deep drawers (food containers, baking pans, hot pads) without buying purpose-built organizers for each. One $30 set replaces $80 of single-purpose organizers.',
    whyNotPremium:
      'Container Store version is the same mechanism in prettier wood. Beautiful, no functional advantage.',
  },

  // ---------- SLOT 8: Lazy Susan -------------------------------------
  {
    slotId: 'kitchen_lazy_susan',
    slotLabel: 'Lazy Susan — corner cabinet retrofit',
    slotKind: 'core',
    // Hide if user has a Susan already OR if they have no corner cabinet.
    conditionalOn: ['has_lazy_susan', 'no_corner_cabinet'],
    tiers: {
      budget: {
        productName: 'Generic 12 inch plastic lazy susan turntable',
        priceLow: 18,
        priceHigh: 28,
        affiliateUrl: buildAmazonUrl('12 inch lazy susan turntable plastic'),
        productSpec: 'Plastic, single-tier, 12 inch diameter.',
      },
      sweet_spot: {
        productName: 'Rev-A-Shelf 5BBSC-DM18-CR-1 Two-Tier 18 inch',
        priceLow: 45,
        priceHigh: 65,
        affiliateUrl: buildAmazonUrl('rev a shelf two tier lazy susan 18 inch'),
        productSpec:
          'Two-tier, 18 inch diameter, ball-bearing rotation. Retrofit (no cabinet modification needed).',
      },
      premium: {
        productName: 'Rev-A-Shelf Kidney Corner Pullout System',
        priceLow: 220,
        priceHigh: 350,
        affiliateUrl: buildAmazonUrl('rev a shelf kidney corner pullout'),
        productSpec:
          'Full pullout corner system. Cabinet retrofit.',
      },
    },
    whyThis:
      'Two-tier 18 inch fits most corner cabinets. Ball-bearing rotation handles canned goods. No cabinet modification needed.',
    whyNotCheaper:
      "$20 plastic spinners aren't strong enough for canned goods. They wobble, items fall behind the spinner, and you've created a worse problem.",
    whyNotPremium:
      'Full kidney pullout is real cabinet retrofit — worth it if your corner cabinet is dead space and you cook a lot. Not for first-time organizers.',
    warnings: [
      "Skip this slot entirely if you don't have a corner cabinet.",
    ],
  },

  // ---------- ADD-ON 1: Magnetic spice ------------------------------
  {
    slotId: 'kitchen_magnetic_spice',
    slotLabel: 'Magnetic spice tin set + range hood mount',
    slotKind: 'addon',
    tiers: {
      sweet_spot: {
        productName: 'Magnetic Spice Tin Set + Range Hood Mount',
        priceLow: 28,
        priceHigh: 42,
        affiliateUrl: buildAmazonUrl('magnetic spice tin set range hood mount'),
        productSpec:
          'Steel tins with clear lids and magnetic backs. Sticks to magnetic-steel surfaces.',
      },
    },
    whyThis:
      "Magnetic tins on a steel range hood put your most-used spices in arm's reach. Real failure mode: people buy these for stainless steel hoods and the magnets don't hold — only buy if your hood is actual steel.",
    warnings: [
      'Test with a fridge magnet first — stainless steel range hoods are non-magnetic.',
    ],
  },

  // ---------- ADD-ON 2: Drying mat -----------------------------------
  {
    slotId: 'kitchen_drying_mat',
    slotLabel: 'Roll-up dish drying mat',
    slotKind: 'addon',
    tiers: {
      sweet_spot: {
        productName: 'Roll-Up Dish Drying Mat',
        priceLow: 14,
        priceHigh: 22,
        affiliateUrl: buildAmazonUrl('roll up dish drying mat silicone'),
        productSpec:
          'Silicone-coated steel rods, rolls up for storage. Heat resistant.',
      },
    },
    whyThis:
      "If you don't have a dishwasher or hand-wash a lot. Skip otherwise.",
  },

  // ---------- ADD-ON 3: Fridge bins ----------------------------------
  {
    slotId: 'kitchen_fridge_bins',
    slotLabel: 'Clear fridge bin set (variety pack)',
    slotKind: 'addon',
    tiers: {
      sweet_spot: {
        productName: 'Clear Fridge Bin Set (variety pack)',
        priceLow: 28,
        priceHigh: 50,
        affiliateUrl: buildAmazonUrl('clear fridge bin set variety pack'),
        productSpec:
          'BPA-free clear bins in 4-6 sizes. Stackable, dishwasher safe.',
      },
    },
    whyThis:
      "Different category but bought together. Real win: low-cost, immediate visual change. Real loss: doesn't fit door-shelf-style fridges.",
    warnings: [
      'Measure your fridge interior first — door-shelf designs have non-standard widths.',
    ],
  },
]
