// V7.2.3 — Smart Cart Universe.
//
// Single tagged product table. Scope catalogs reference these
// entries via tag query (`mustHaveTopics`, `mustHaveFunctions`,
// `tier`, etc.). The builder resolves each scope-catalog slot's
// tierQueries against this table at synthesis time.
//
// v7.2.3 ships ONE migrated source: kitchen_organizers from
// v7.2.1. The 3 v7.2.2 catalogs (kitchen_cosmetic_refresh,
// kitchen_cabinet_hardware_swap, outdoor_lake_season) were blocked
// on prose content and never landed in code; they author directly
// into the new shape when content arrives.
//
// Per-product `migratedFrom` records the source slot for audit.
// Affiliate URLs were captured from the v7.2.1 catalog verbatim
// (Amazon search-query convention; real ASIN lookup automation is
// queued for v7.2.4+).

import { buildAmazonUrl } from '@/lib/buildAmazonUrl'
import type { UniverseProduct } from '@/lib/smart-cart-universe'

// ---------- Function-tag conventions ---------------------------------
//
// These constants document the function tags this universe uses so
// the scope catalog's tierQueries can reference them by name. Adding
// a new product type means adding a constant here and using it in
// both the universe entry's tags and the scope catalog's query.
export const FN = {
  cutleryDrawerOrganizer: 'cutlery_drawer_organizer',
  pullOutPantryBasket: 'pull_out_pantry_basket',
  spiceDrawerOrganizer: 'spice_drawer_organizer',
  underSinkOrganizer: 'under_sink_organizer',
  lidOrganizer: 'lid_organizer',
  bagWrapOrganizer: 'bag_wrap_organizer',
  drawerDivider: 'drawer_divider',
  lazySusan: 'lazy_susan',
  magneticSpiceStorage: 'magnetic_spice_storage',
  dishDryingMat: 'dish_drying_mat',
  fridgeOrganizer: 'fridge_organizer',
} as const

// ---------- Migration source ----------------------------------------
// Every entry below traces to a (scope, slotId, tier) triple in the
// pre-v7.2.3 catalog. The migration is lossless: product names,
// prices, productSpec, and affiliateUrls are preserved verbatim.

export const UNIVERSE: UniverseProduct[] = [
  // ---------- Slot 1: cutlery_tray ----------------------------------
  {
    universeId: 'ryqtop_bamboo_drawer_organizer',
    rank: 100,
    variant: {
      productName: 'Ryqtop Bamboo Drawer Organizer',
      priceLow: 12,
      priceHigh: 18,
      affiliateUrl: buildAmazonUrl('ryqtop bamboo drawer organizer expandable'),
      productSpec:
        'Bamboo, fits drawers up to 17 inches. Springloaded ends. 8 compartments.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.cutleryDrawerOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_cutlery_tray',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_cutlery_tray', tier: 'budget' },
  },
  {
    universeId: 'pipishell_bamboo_drawer_organizer',
    rank: 100,
    variant: {
      productName: 'Pipishell Bamboo Drawer Organizer',
      priceLow: 22,
      priceHigh: 28,
      affiliateUrl: buildAmazonUrl('pipishell bamboo drawer organizer'),
      productSpec:
        'Expandable from 13 to 19.6 inches. Spring-loaded ends. 4.7 stars over 42,000+ reviews.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.cutleryDrawerOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_cutlery_tray',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_cutlery_tray', tier: 'sweet_spot' },
  },
  {
    universeId: 'container_store_bamboo_drawer_organizers',
    rank: 100,
    variant: {
      productName: 'Container Store Bamboo Drawer Organizers',
      priceLow: 50,
      priceHigh: 70,
      affiliateUrl: buildAmazonUrl('container store bamboo drawer organizer'),
      productSpec: 'Premium bamboo, 18 to 22.25 inches expandable. Set of 2.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.cutleryDrawerOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_cutlery_tray',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_cutlery_tray', tier: 'premium' },
  },

  // ---------- Slot 2: pull_out_pantry -------------------------------
  {
    universeId: 'simple_houseware_pull_out_cabinet_sliding_basket',
    rank: 100,
    variant: {
      productName: 'Simple Houseware Pull-Out Cabinet Sliding Basket',
      priceLow: 22,
      priceHigh: 30,
      affiliateUrl: buildAmazonUrl('simple houseware pull out cabinet basket'),
      productSpec:
        'Wire basket, 17.2 inch deep, 9.7 inch wide. Quick install, no full extension.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.pullOutPantryBasket],
      seasons: [],
      alreadyHaveFlag: 'has_pantry_baskets',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_pull_out_pantry', tier: 'budget' },
  },
  {
    universeId: 'holdn_storage_pull_out_cabinet_organizer_14w_21d',
    rank: 100,
    variant: {
      productName: "HOLDN'STORAGE Pull-Out Cabinet Organizer 14W x 21D",
      priceLow: 45,
      priceHigh: 55,
      affiliateUrl: buildAmazonUrl('holdn storage pull out cabinet organizer'),
      productSpec:
        'Steel basket, full-extension slides, 50-pound capacity. Fits standard 15-1/4 inch cabinet opening. Lifetime limited warranty.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.pullOutPantryBasket],
      seasons: [],
      alreadyHaveFlag: 'has_pantry_baskets',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_pull_out_pantry', tier: 'sweet_spot' },
  },
  {
    universeId: 'rev_a_shelf_5wb2_2122cr_two_tier',
    rank: 100,
    variant: {
      productName: 'Rev-A-Shelf 5WB2-2122CR-1 Two-Tier',
      priceLow: 85,
      priceHigh: 130,
      affiliateUrl: buildAmazonUrl('rev a shelf two tier kitchen cabinet'),
      productSpec:
        'Cabinet-shop grade with soft close. Two tiers, 21 by 22 inches.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.pullOutPantryBasket],
      seasons: [],
      alreadyHaveFlag: 'has_pantry_baskets',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_pull_out_pantry', tier: 'premium' },
  },

  // ---------- Slot 3: spice_drawer ----------------------------------
  {
    universeId: 'diolove_plastic_3_tier_expandable_spice_organizer',
    rank: 100,
    variant: {
      productName: 'DIOLOVE Plastic 3-Tier Expandable Spice Organizer',
      priceLow: 12,
      priceHigh: 18,
      affiliateUrl: buildAmazonUrl('diolove plastic spice drawer organizer'),
      productSpec:
        'Plastic, 3 angled tiers, expandable 11 to 22 inches. Slip-resistant base.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.spiceDrawerOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_spice_solution',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_spice_drawer', tier: 'budget' },
  },
  {
    universeId: 'spaceaid_bamboo_spice_drawer_organizer',
    rank: 100,
    variant: {
      productName: 'SpaceAid Bamboo Spice Drawer Organizer',
      priceLow: 22,
      priceHigh: 30,
      affiliateUrl: buildAmazonUrl('spaceaid bamboo spice drawer organizer'),
      productSpec:
        '4-tier angled rack, expandable 12 to 23 inches. Holds about 48 standard spice jars. Needs 3 inch drawer depth.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.spiceDrawerOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_spice_solution',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_spice_drawer', tier: 'sweet_spot' },
  },
  {
    universeId: 'kraftmaid_wooden_spice_drawer_insert_kit',
    rank: 100,
    variant: {
      productName: 'KraftMaid Wooden Spice Drawer Insert Kit',
      priceLow: 85,
      priceHigh: 110,
      affiliateUrl: buildAmazonUrl('kraftmaid wooden spice drawer insert'),
      productSpec:
        'Solid wood drop-in, custom-trimmable to drawer width. Cabinet-shop precision.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.spiceDrawerOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_spice_solution',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_spice_drawer', tier: 'premium' },
  },

  // ---------- Slot 4: under_sink (no budget tier) -------------------
  {
    universeId: 'expandable_2_tier_carbon_steel_under_sink_organizer',
    rank: 100,
    variant: {
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
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.underSinkOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_under_sink_organization',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_under_sink', tier: 'sweet_spot' },
  },
  {
    universeId: 'rev_a_shelf_custom_under_sink_pullout_kit',
    rank: 100,
    variant: {
      productName: 'Rev-A-Shelf Custom Under-Sink Pullout Kit',
      priceLow: 120,
      priceHigh: 200,
      affiliateUrl: buildAmazonUrl('rev a shelf under sink pullout kit'),
      productSpec:
        'Cabinet-shop install. Full extension on cabinet-grade hardware.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.underSinkOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_under_sink_organization',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_under_sink', tier: 'premium' },
  },

  // ---------- Slot 5: lid_organizer (sweet_spot only) ---------------
  {
    universeId: 'everie_extendable_food_container_lid_organizer',
    rank: 100,
    variant: {
      productName: 'EVERIE Extendable Food Container Lid Organizer',
      priceLow: 24,
      priceHigh: 32,
      affiliateUrl: buildAmazonUrl('everie extendable lid organizer'),
      productSpec:
        'Adjustable length and dividers. Holds 8-12 lids vertically, sized small to large.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.lidOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_lid_organizer',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_lid_organizer', tier: 'sweet_spot' },
  },

  // ---------- Slot 6: bag_organizer ---------------------------------
  {
    universeId: 'kitchen_bag_organizer__bamboo_plastic_bag_organizer_4_pack',
    rank: 100,
    variant: {
      productName: 'Bamboo Plastic Bag Organizer (4-pack), drawer-mounted',
      priceLow: 24,
      priceHigh: 32,
      affiliateUrl: buildAmazonUrl(
        'bamboo plastic bag organizer 4 pack drawer',
      ),
      productSpec:
        'Holds gallon bags, sandwich bags, foil, plastic wrap, parchment in upright slots. Anchor clips included.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.bagWrapOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_bag_organizer',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_bag_organizer', tier: 'sweet_spot' },
  },
  {
    universeId: 'rev_a_shelf_drawer_mounted_wrap_organizer',
    rank: 100,
    variant: {
      productName: 'Rev-A-Shelf Drawer-Mounted Wrap Organizer',
      priceLow: 60,
      priceHigh: 95,
      affiliateUrl: buildAmazonUrl('rev a shelf wrap drawer organizer'),
      productSpec: 'Cabinet-shop grade with sliding cutter.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.bagWrapOrganizer],
      seasons: [],
      alreadyHaveFlag: 'has_bag_organizer',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_bag_organizer', tier: 'premium' },
  },

  // ---------- Slot 7: drawer_dividers -------------------------------
  {
    universeId: 'utoplike_bamboo_kitchen_drawer_dividers_4_pack',
    rank: 100,
    variant: {
      productName: 'Utoplike Bamboo Kitchen Drawer Dividers (4-pack)',
      priceLow: 28,
      priceHigh: 35,
      affiliateUrl: buildAmazonUrl('utoplike bamboo drawer dividers 4 pack'),
      productSpec:
        'Spring-loaded, adjustable 17 to 22 inches. Multipurpose — kitchen, bedroom, anywhere.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.drawerDivider],
      seasons: [],
      alreadyHaveFlag: 'has_drawer_dividers',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_drawer_dividers', tier: 'sweet_spot' },
  },
  {
    universeId: 'container_store_bamboo_drawer_dividers',
    rank: 100,
    variant: {
      productName: 'Container Store Bamboo Drawer Dividers',
      priceLow: 80,
      priceHigh: 100,
      affiliateUrl: buildAmazonUrl('container store bamboo drawer divider'),
      productSpec: 'Premium bamboo finish. Same spring-loaded mechanism.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.drawerDivider],
      seasons: [],
      alreadyHaveFlag: 'has_drawer_dividers',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_drawer_dividers', tier: 'premium' },
  },

  // ---------- Slot 8: lazy_susan ------------------------------------
  {
    universeId: 'kitchen_lazy_susan__generic_12_inch_plastic_lazy_susan_turntable',
    rank: 100,
    variant: {
      productName: 'Generic 12 inch plastic lazy susan turntable',
      priceLow: 18,
      priceHigh: 28,
      affiliateUrl: buildAmazonUrl('12 inch lazy susan turntable plastic'),
      productSpec: 'Plastic, single-tier, 12 inch diameter.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.lazySusan],
      seasons: [],
      alreadyHaveFlag: 'has_lazy_susan',
      conditions: ['has_corner_cabinet'],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_lazy_susan', tier: 'budget' },
  },
  {
    universeId: 'rev_a_shelf_5bbsc_dm18_cr_two_tier_18_inch',
    rank: 100,
    variant: {
      productName: 'Rev-A-Shelf 5BBSC-DM18-CR-1 Two-Tier 18 inch',
      priceLow: 45,
      priceHigh: 65,
      affiliateUrl: buildAmazonUrl('rev a shelf two tier lazy susan 18 inch'),
      productSpec:
        'Two-tier, 18 inch diameter, ball-bearing rotation. Retrofit (no cabinet modification needed).',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.lazySusan],
      seasons: [],
      alreadyHaveFlag: 'has_lazy_susan',
      conditions: ['has_corner_cabinet'],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_lazy_susan', tier: 'sweet_spot' },
  },
  {
    universeId: 'rev_a_shelf_kidney_corner_pullout_system',
    rank: 100,
    variant: {
      productName: 'Rev-A-Shelf Kidney Corner Pullout System',
      priceLow: 220,
      priceHigh: 350,
      affiliateUrl: buildAmazonUrl('rev a shelf kidney corner pullout'),
      productSpec: 'Full pullout corner system. Cabinet retrofit.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.lazySusan],
      seasons: [],
      alreadyHaveFlag: 'has_lazy_susan',
      conditions: ['has_corner_cabinet'],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_lazy_susan', tier: 'premium' },
  },

  // ---------- Add-on 1: magnetic_spice ------------------------------
  {
    universeId: 'kitchen_magnetic_spice__magnetic_spice_tin_set_range_hood_mount',
    rank: 100,
    variant: {
      productName: 'Magnetic Spice Tin Set + Range Hood Mount',
      priceLow: 28,
      priceHigh: 42,
      affiliateUrl: buildAmazonUrl('magnetic spice tin set range hood mount'),
      productSpec:
        'Steel tins with clear lids and magnetic backs. Sticks to magnetic-steel surfaces.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.magneticSpiceStorage],
      seasons: [],
      alreadyHaveFlag: '',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_magnetic_spice', tier: 'sweet_spot' },
  },

  // ---------- Add-on 2: drying_mat ----------------------------------
  {
    universeId: 'kitchen_drying_mat__roll_up_dish_drying_mat',
    rank: 100,
    variant: {
      productName: 'Roll-Up Dish Drying Mat',
      priceLow: 14,
      priceHigh: 22,
      affiliateUrl: buildAmazonUrl('roll up dish drying mat silicone'),
      productSpec:
        'Silicone-coated steel rods, rolls up for storage. Heat resistant.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.dishDryingMat],
      seasons: [],
      alreadyHaveFlag: '',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_drying_mat', tier: 'sweet_spot' },
  },

  // ---------- Add-on 3: fridge_bins ---------------------------------
  {
    universeId: 'kitchen_fridge_bins__clear_fridge_bin_set_variety_pack',
    rank: 100,
    variant: {
      productName: 'Clear Fridge Bin Set (variety pack)',
      priceLow: 28,
      priceHigh: 50,
      affiliateUrl: buildAmazonUrl('clear fridge bin set variety pack'),
      productSpec:
        'BPA-free clear bins in 4-6 sizes. Stackable, dishwasher safe.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['organizer'],
      functions: [FN.fridgeOrganizer],
      seasons: [],
      alreadyHaveFlag: '',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_organizers', slotId: 'kitchen_fridge_bins', tier: 'sweet_spot' },
  },
]
