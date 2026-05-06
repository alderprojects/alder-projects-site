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
  // V7.2.1 — kitchen_organizers
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

  // V7.2.4 — kitchen_cabinet_hardware_swap + kitchen_cosmetic_refresh
  cabinetPaint: 'cabinet_paint',
  bondingPrimer: 'bonding_primer',
  cabinetPull: 'cabinet_pull',
  cabinetKnob: 'cabinet_knob',
  softCloseHinge: 'soft_close_hinge',
  undercabinetLighting: 'undercabinet_lighting',
  kitchenCaulk: 'kitchen_caulk',
  paintingSupplies: 'painting_supplies',
  drawerSlide: 'drawer_slide',
  hardwareScrews: 'hardware_screws',
  cabinetHardwareJig: 'cabinet_hardware_jig',
  woodPutty: 'wood_putty',

  // V7.2.4 — outdoor_lake_season
  adirondackChair: 'adirondack_chair',
  outdoorSideTable: 'outdoor_side_table',
  outdoorCushion: 'outdoor_cushion',
  patioUmbrella: 'patio_umbrella',
  outdoorRug: 'outdoor_rug',
  gasGrill: 'gas_grill',
  grillCover: 'grill_cover',
  grillTools: 'grill_tools',
  outdoorStringLights: 'outdoor_string_lights',
  outdoorCooler: 'outdoor_cooler',
  lakeFloats: 'lake_floats',
  mosquitoControl: 'mosquito_control',

  // ===================================================================
  // V7.2.5 — function tags for the 10 new scopes ingested in
  // pastes 2-4. Constants are declared here so scope-catalog
  // tierQueries can reference them by name; product entries arrive
  // alongside catalog content.
  // ===================================================================

  // outdoor_freeze_prevention
  freezeSensor: 'freeze_sensor',
  pipeInsulation: 'pipe_insulation',
  heatTape: 'heat_tape',
  smartThermostat: 'smart_thermostat',
  leakDetector: 'leak_detector',
  hoseBibCover: 'hose_bib_cover',
  draftSealer: 'draft_sealer',
  shutoffLabels: 'shutoff_labels',
  pipeFreezeAlarm: 'pipe_freeze_alarm',
  smartShutoffValve: 'smart_shutoff_valve',
  freezeKitDocs: 'freeze_kit_docs',

  // outdoor_seasonal_opening
  waterTestKit: 'water_test_kit',
  bacteriaTestKit: 'bacteria_test_kit',
  filterReplacement: 'filter_replacement',
  cleaningResetKit: 'cleaning_reset_kit',
  dehumidifierEntry: 'dehumidifier_entry',
  openingTote: 'opening_tote',
  basicConsumables: 'basic_consumables',
  filterWrench: 'filter_wrench',

  // outdoor_deck_refresh
  deckCleaner: 'deck_cleaner',
  deckBrightener: 'deck_brightener',
  deckBrush: 'deck_brush',
  moistureMeter: 'moisture_meter',
  exteriorScrews: 'exterior_screws',
  boardRepairTools: 'board_repair_tools',
  deckStainSealer: 'deck_stain_sealer',
  stairGripStrips: 'stair_grip_strips',
  pressureWasher: 'pressure_washer',

  // mudroom_entry_reset
  bootTray: 'boot_tray',
  entryMat: 'entry_mat',
  wallHooks: 'wall_hooks',
  entryBench: 'entry_bench',
  wetGearRack: 'wet_gear_rack',
  gearBins: 'gear_bins',
  towelStation: 'towel_station',
  floorProtection: 'floor_protection',

  // universal_owner_kit
  drillDriver: 'drill_driver',
  drillBitSet: 'drill_bit_set',
  level: 'level',
  studFinder: 'stud_finder',
  tapeMeasure: 'tape_measure',
  utilityKnife: 'utility_knife',
  caulkGun: 'caulk_gun',
  oscillatingMultitool: 'oscillating_multitool',
  fastenerKit: 'fastener_kit',
  workLight: 'work_light',

  // home_moisture_control
  hygrometer: 'hygrometer',
  dehumidifierWhole: 'dehumidifier_whole',
  moldTestKit: 'mold_test_kit',
  odorAbsorber: 'odor_absorber',
  airMover: 'air_mover',

  // home_water_quality
  basicTestStrips: 'basic_test_strips',
  labWaterTest: 'lab_water_test',
  sedimentFilter: 'sediment_filter',
  fridgeFilter: 'fridge_filter',
  drinkingWaterFilter: 'drinking_water_filter',
  pressureGauge: 'pressure_gauge',

  // outdoor_dock_lake
  dockLines: 'dock_lines',
  dockBumpers: 'dock_bumpers',
  marineHardware: 'marine_hardware',
  dockLighting: 'dock_lighting',
  dockLadder: 'dock_ladder',
  mildewCleaner: 'mildew_cleaner',
  weatherproofBin: 'weatherproof_bin',
  nonSlipStrips: 'non_slip_strips',

  // home_safety_kit
  fireExtinguisher: 'fire_extinguisher',
  smokeCoDetector: 'smoke_co_detector',
  firstAidKit: 'first_aid_kit',
  flashlightLantern: 'flashlight_lantern',
  emergencyPower: 'emergency_power',
  emergencyDocs: 'emergency_docs',

  // universal_project_prep
  laserMeasure: 'laser_measure',
  graphPaperKit: 'graph_paper_kit',
  paintersTape: 'painters_tape',
  labelMaker: 'label_maker',
  sampleBoards: 'sample_boards',
  phoneTripod: 'phone_tripod',
  inspectionMirror: 'inspection_mirror',
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

  // ====================================================================
  // V7.2.4 — kitchen_cabinet_hardware_swap (13 products)
  // ====================================================================

  // ---------- Drawer pulls -----------------------------------------
  {
    universeId: 'liberty_hardware_bar_pulls_10_pack',
    rank: 100,
    variant: {
      productName: 'Liberty Hardware Bar Pulls 10-pack (3-3/4" or 5-1/16" center)',
      priceLow: 25,
      priceHigh: 38,
      affiliateUrl: 'https://www.amazon.com/s?k=liberty+hardware+bar+pulls+10+pack&tag=alderprojects-20',
      productSpec:
        'Zinc alloy. ~$2.50-3.80 per pull. Available at Home Depot in matte black, satin nickel, oil-rubbed bronze. Lightweight feel.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.cabinetPull],
      seasons: [],
      alreadyHaveFlag: 'has_satisfactory_pulls',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_drawer_pulls', tier: 'budget' },
  },
  {
    universeId: 'amerock_bar_pulls_5116_matte_black_10pk',
    rank: 100,
    variant: {
      productName: 'Amerock Bar Pulls 5-1/16" Matte Black 10-pack (10BX40517MB)',
      priceLow: 33,
      priceHigh: 45,
      amazonAsin: 'B0DLWN5QLH',
      affiliateUrl: 'https://www.amazon.com/dp/B0DLWN5QLH?tag=alderprojects-20',
      productSpec:
        'Zinc alloy with substantial weight. 7-3/8" overall length, 5-1/16" (128mm) center-to-center. Limited lifetime warranty. ~$3.34 per pull at Home Depot. 10+ finishes available (matte black, brushed nickel, champagne bronze, oil-rubbed bronze, satin nickel, polished chrome).',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.cabinetPull],
      seasons: [],
      alreadyHaveFlag: 'has_satisfactory_pulls',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Amerock Bar Pulls product listing (Amazon ASIN B0DLWN5QLH, Home Depot 334543944)',
      'Houzz forum thread: "Cabinet Hardware—cheap vs. expensive"',
      'Bob Vila Best Cabinet Hardware 2025 roundup',
      'Property Nest 9 Best Kitchen Cabinet Hardware Brands 2024',
    ],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_drawer_pulls', tier: 'sweet_spot' },
  },
  {
    universeId: 'top_knobs_amwell_bridgeport_bar_pulls',
    rank: 100,
    variant: {
      productName: 'Top Knobs Amwell or Bridgeport bar pulls (single)',
      priceLow: 160,
      priceHigh: 250,
      affiliateUrl: 'https://www.amazon.com/s?k=top+knobs+amwell+bar+pull&tag=alderprojects-20',
      productSpec:
        'Solid steel construction with optional knurled detail. Cabinet-shop grade. ~$16-25 per pull. Sold individually through Wayfair, designer hardware retailers.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.cabinetPull],
      seasons: [],
      alreadyHaveFlag: 'has_satisfactory_pulls',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_drawer_pulls', tier: 'premium' },
  },

  // ---------- Knobs ------------------------------------------------
  {
    universeId: 'hardware_swap_knobs__generic_round_knobs_6pk',
    rank: 100,
    variant: {
      productName: 'Generic round knobs 6-pack',
      priceLow: 8,
      priceHigh: 14,
      affiliateUrl: 'https://www.amazon.com/s?k=cabinet+knobs+round+6+pack&tag=alderprojects-20',
      productSpec:
        'Zinc alloy or plated steel. Various finishes. Often non-UV-stable.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.cabinetKnob],
      seasons: [],
      alreadyHaveFlag: 'has_satisfactory_knobs',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_knobs', tier: 'budget' },
  },
  {
    universeId: 'liberty_harmon_round_cabinet_knobs',
    rank: 100,
    variant: {
      productName: 'Liberty Harmon Round Cabinet Knobs (1.25" diameter, finish-matched)',
      priceLow: 18,
      priceHigh: 26,
      affiliateUrl: 'https://www.amazon.com/s?k=liberty+harmon+round+cabinet+knob&tag=alderprojects-20',
      productSpec:
        'Classic round profile, 1.25" diameter. Available in matte black, satin nickel, oil-rubbed bronze, polished chrome at Home Depot. 1,200+ Home Depot reviews at full 5 stars. ~$2.98 per knob.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.cabinetKnob],
      seasons: [],
      alreadyHaveFlag: 'has_satisfactory_knobs',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Bob Vila Best Cabinet Hardware roundup (Liberty Harmon: 1,200+ Home Depot 5-star reviews)',
      'Liberty Hardware finish coordination guide',
    ],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_knobs', tier: 'sweet_spot' },
  },
  {
    universeId: 'top_knobs_aspen_collection_round_knobs',
    rank: 100,
    variant: {
      productName: 'Top Knobs Aspen Collection round knobs',
      priceLow: 90,
      priceHigh: 150,
      affiliateUrl: 'https://www.amazon.com/s?k=top+knobs+aspen+round+knob&tag=alderprojects-20',
      productSpec:
        'Solid steel. Premium finishes. ~$15-25 per knob. Sold individually.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.cabinetKnob],
      seasons: [],
      alreadyHaveFlag: 'has_satisfactory_knobs',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_knobs', tier: 'premium' },
  },

  // ---------- Screws ------------------------------------------------
  {
    universeId: 'hardware_swap_screws__m4_machine_screws_assortment',
    rank: 100,
    variant: {
      productName: 'M4 machine screws assortment, 3/4" / 1" / 1-1/4" lengths',
      priceLow: 8,
      priceHigh: 14,
      affiliateUrl: 'https://www.amazon.com/s?k=M4+machine+screws+assortment+kit&tag=alderprojects-20',
      productSpec:
        'Standard M4 (8/32 thread) machine screws in 3/4", 1", and 1-1/4" lengths. ~50-100 piece variety pack. Slot mount, zinc-plated steel.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.hardwareScrews],
      seasons: [],
      alreadyHaveFlag: '',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_screws', tier: 'sweet_spot' },
  },

  // ---------- Drill jig --------------------------------------------
  {
    universeId: 'hardware_swap_jig__paper_template_tape_measure',
    rank: 100,
    variant: {
      productName: 'Paper template + tape measure',
      priceLow: 0,
      priceHigh: 5,
      affiliateUrl: 'https://www.amazon.com/s?k=cabinet+pull+template+paper&tag=alderprojects-20',
      productSpec:
        'DIY paper templates for marking pull/knob hole locations. Free if you measure carefully; ~$5 for printed templates.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['tool'],
      functions: [FN.cabinetHardwareJig],
      seasons: [],
      alreadyHaveFlag: 'hardware_holes_match_existing',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_jig', tier: 'budget' },
  },
  {
    universeId: 'kreg_khi_pull_cabinet_hardware_jig',
    rank: 100,
    variant: {
      productName: 'Kreg KHI-PULL Cabinet Hardware Jig',
      priceLow: 28,
      priceHigh: 42,
      amazonAsin: 'B01JQ74J5E',
      affiliateUrl: 'https://www.amazon.com/dp/B01JQ74J5E?tag=alderprojects-20',
      productSpec:
        'Adjustable polymer jig with hardened-steel drill guides. Movable edge guide for accurate positioning. 8.5" length, 1.7" depth. Suitable for knobs and pulls up to ~7" wide. Lifetime warranty on drill guides.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['tool'],
      functions: [FN.cabinetHardwareJig],
      seasons: [],
      alreadyHaveFlag: 'hardware_holes_match_existing',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Kreg KHI-PULL Amazon listing (B01JQ74J5E)',
      'Kreg Tool Company official product documentation',
      'Amazon review consensus on KHI-PULL accuracy and ease',
    ],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_jig', tier: 'sweet_spot' },
  },
  {
    universeId: 'kreg_khi_xlpull_cabinet_hardware_jig_pro',
    rank: 100,
    variant: {
      productName: 'Kreg KHI-XLPULL Cabinet Hardware Jig Pro',
      priceLow: 80,
      priceHigh: 120,
      amazonAsin: 'B0CPTHH4VF',
      affiliateUrl: 'https://www.amazon.com/dp/B0CPTHH4VF?tag=alderprojects-20',
      productSpec:
        'Pro version. Handles pulls 1-3/4" to 12" wide. Faster setup for production volumes.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['tool'],
      functions: [FN.cabinetHardwareJig],
      seasons: [],
      alreadyHaveFlag: 'hardware_holes_match_existing',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_jig', tier: 'premium' },
  },

  // ---------- Soft-close hinges -------------------------------------
  {
    universeId: 'hardware_swap_softclose_hinges__generic_concealed_hinge_soft_close_12pk',
    rank: 100,
    variant: {
      productName: 'Generic concealed hinge with soft-close (12-pack)',
      priceLow: 22,
      priceHigh: 32,
      affiliateUrl: 'https://www.amazon.com/s?k=concealed+cabinet+hinge+soft+close+12+pack&tag=alderprojects-20',
      productSpec:
        'Standard 35mm cup hinge. 105° opening. Adjustable. Plastic damper.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.softCloseHinge],
      seasons: [],
      alreadyHaveFlag: 'has_softclose_hinges',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_softclose_hinges', tier: 'budget' },
  },
  {
    universeId: 'blum_compact_soft_close_hinges_12pk',
    rank: 100,
    variant: {
      productName: 'Blum Compact Soft-Close hinges (12-pack)',
      priceLow: 55,
      priceHigh: 78,
      affiliateUrl: 'https://www.amazon.com/s?k=blum+compact+soft+close+hinge+12&tag=alderprojects-20',
      productSpec:
        'Cabinet-shop standard. 35mm cup, 110° opening. 3-dimensional adjustment. Lifetime damper. Industry standard at IKEA, KraftMaid, mid-tier cabinet brands.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.softCloseHinge],
      seasons: [],
      alreadyHaveFlag: 'has_softclose_hinges',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Blum hardware product datasheet',
      'Cabinet shop forum standards on Blum vs generic',
    ],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_softclose_hinges', tier: 'sweet_spot' },
  },

  // ---------- Wood putty --------------------------------------------
  {
    universeId: 'minwax_wood_putty',
    rank: 100,
    variant: {
      productName: 'Minwax Wood Putty (color-matched to cabinet finish)',
      priceLow: 5,
      priceHigh: 9,
      affiliateUrl: 'https://www.amazon.com/s?k=minwax+wood+putty+stainable&tag=alderprojects-20',
      productSpec:
        '3.75 oz tub. Pre-tinted to match common wood finishes (cherry, maple, oak, walnut, white). Stainable. Air-dries.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material'],
      functions: [FN.woodPutty],
      seasons: [],
      alreadyHaveFlag: 'hardware_holes_match_existing',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cabinet_hardware_swap', slotId: 'hardware_swap_wood_putty', tier: 'sweet_spot' },
  },

  // ====================================================================
  // V7.2.4 — kitchen_cosmetic_refresh (15 new products; 8 dedup hits
  // against hardware_swap entries above — pulls, knobs, generic hinges,
  // and Blum Compact reuse existing universe entries with no tag-merge
  // delta because the tags were already identical)
  // ====================================================================

  // ---------- Cabinet paint -----------------------------------------
  {
    universeId: 'behr_alkyd_semi_gloss_enamel_gallon',
    rank: 100,
    variant: {
      productName: 'Behr Alkyd Semi-Gloss Enamel (1 gallon)',
      priceLow: 42,
      priceHigh: 55,
      affiliateUrl: 'https://www.amazon.com/s?k=behr+alkyd+enamel+semi+gloss+gallon&tag=alderprojects-20',
      productSpec:
        'Hybrid alkyd enamel formulated for cabinets and trim. Sold at Home Depot. Water-based cleanup. Fewer reviews than INSL-X but verified by professional painters as a budget alkyd that works.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material', 'finish'],
      functions: [FN.cabinetPaint],
      seasons: [],
      alreadyHaveFlag: 'has_painted_cabinets_recently',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_cabinet_paint', tier: 'budget' },
  },
  {
    universeId: 'inslx_cabinet_coat_acrylic_urethane_satin_gallon',
    rank: 100,
    variant: {
      productName: 'INSL-X Cabinet Coat Acrylic Urethane Satin (1 gallon, white)',
      priceLow: 75,
      priceHigh: 95,
      amazonAsin: 'B07KXLPCG1',
      affiliateUrl: 'https://www.amazon.com/dp/B07KXLPCG1?tag=alderprojects-20',
      productSpec:
        'Urethane-acrylic waterborne enamel made by Benjamin Moore. 350-450 sq ft per gallon. Adheres to polyurethane and varnish without primer. Resists chipping, scuffing, food stains, grease, and water. Apply between 50-90°F.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material', 'finish'],
      functions: [FN.cabinetPaint],
      seasons: [],
      alreadyHaveFlag: 'has_painted_cabinets_recently',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Reviewed.com 2026 Best Cabinet Paint roundup',
      'Brackens Painting (4-generation paint pro) cabinet paint guide',
      'Renovated Faith 24-brand blind test (BM Advance overall winner)',
      'Greathomedepot.com INSL-X Cabinet Coat hands-on review',
    ],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_cabinet_paint', tier: 'sweet_spot' },
  },
  {
    universeId: 'benjamin_moore_advance_waterborne_alkyd_satin',
    rank: 100,
    variant: {
      productName: 'Benjamin Moore Advance Waterborne Alkyd Satin (1 gallon)',
      priceLow: 80,
      priceHigh: 95,
      affiliateUrl: 'https://www.amazon.com/s?k=benjamin+moore+advance+gallon&tag=alderprojects-20',
      productSpec:
        'Premium waterborne alkyd. Cures hard like oil-based, cleans up with water. Furniture-quality finish. 14-day cure window. Sold primarily through Benjamin Moore dealers; Amazon has limited inventory.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material', 'finish'],
      functions: [FN.cabinetPaint],
      seasons: [],
      alreadyHaveFlag: 'has_painted_cabinets_recently',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_cabinet_paint', tier: 'premium' },
  },

  // ---------- Bonding primer -----------------------------------------
  {
    universeId: 'kilz_adhesion_bonding_primer_gallon',
    rank: 100,
    variant: {
      productName: 'KILZ Adhesion Bonding Primer (1 gallon)',
      priceLow: 22,
      priceHigh: 30,
      affiliateUrl: 'https://www.amazon.com/s?k=kilz+adhesion+primer+gallon&tag=alderprojects-20',
      productSpec:
        'Acrylic bonding primer. Works on glossy laminate, glass, tile. 300 sq ft per gallon coverage.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material'],
      functions: [FN.bondingPrimer],
      seasons: [],
      alreadyHaveFlag: 'has_bare_wood_cabinets',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_bonding_primer', tier: 'budget' },
  },
  {
    universeId: 'inslx_stix_acrylic_waterborne_bonding_primer_gallon',
    rank: 100,
    variant: {
      productName: 'INSL-X Stix Acrylic Waterborne Bonding Primer (1 gallon)',
      priceLow: 38,
      priceHigh: 52,
      affiliateUrl: 'https://www.amazon.com/s?k=insl-x+stix+bonding+primer+gallon&tag=alderprojects-20',
      productSpec:
        'Acrylic-urethane bonding primer. Adheres to glossy tile, PVC, vinyl, plastic, glass, glazed block, glossy paint, fiberglass, galvanized metals. Coverage 300-400 sq ft per gallon. Cures in temps as low as 35°F.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material'],
      functions: [FN.bondingPrimer],
      seasons: [],
      alreadyHaveFlag: 'has_bare_wood_cabinets',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'INSL-X Stix product datasheet',
      'cathleendavittbell.com Stix Primer review thread',
    ],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_bonding_primer', tier: 'sweet_spot' },
  },
  {
    universeId: 'zinsser_bin_shellac_based_primer_gallon',
    rank: 100,
    variant: {
      productName: 'Zinsser BIN Shellac-Based Primer (1 gallon)',
      priceLow: 50,
      priceHigh: 65,
      affiliateUrl: 'https://www.amazon.com/s?k=zinsser+bin+shellac+primer+gallon&tag=alderprojects-20',
      productSpec:
        'Shellac-based stain blocker. Best for cabinets bleeding tannins (oak, knotty pine). Solvent cleanup, strong odor.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material'],
      functions: [FN.bondingPrimer],
      seasons: [],
      alreadyHaveFlag: 'has_bare_wood_cabinets',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_bonding_primer', tier: 'premium' },
  },

  // ---------- Soft-close hinges (premium tier; budget + sweet_spot
  //            already in universe from hardware_swap ingestion) ------
  {
    universeId: 'blum_clip_top_blumotion_12pk',
    rank: 100,
    variant: {
      productName: 'Blum Clip Top Blumotion (12-pack)',
      priceLow: 95,
      priceHigh: 130,
      affiliateUrl: 'https://www.amazon.com/s?k=blum+clip+top+blumotion+hinge&tag=alderprojects-20',
      productSpec:
        'Tool-less clip-on installation. Integrated soft-close mechanism. 110° or 155° opening options.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.softCloseHinge],
      seasons: [],
      alreadyHaveFlag: 'has_softclose_hinges',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_softclose_hinges', tier: 'premium' },
  },

  // ---------- Under-cabinet lighting --------------------------------
  {
    universeId: 'kitchen_undercabinet_lighting__generic_amazon_led_strip_kit_10ft',
    rank: 100,
    variant: {
      productName: 'Generic Amazon LED strip kit (10ft, plug-in)',
      priceLow: 14,
      priceHigh: 22,
      affiliateUrl: 'https://www.amazon.com/s?k=led+strip+kitchen+10ft+plug+in&tag=alderprojects-20',
      productSpec:
        'Adhesive-back LED strip with plug-in transformer. Various color temps. No-name brand.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['lighting'],
      functions: [FN.undercabinetLighting],
      seasons: [],
      alreadyHaveFlag: 'has_undercabinet_lighting',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_undercabinet_lighting', tier: 'budget' },
  },
  {
    universeId: 'wobane_under_cabinet_lighting_kit_10ft',
    rank: 100,
    variant: {
      productName: 'Wobane Under Cabinet LED Lighting Kit (10ft)',
      priceLow: 28,
      priceHigh: 45,
      affiliateUrl: 'https://www.amazon.com/s?k=wobane+under+cabinet+lighting&tag=alderprojects-20',
      productSpec:
        '1100 lumens, warm white (3000K), thin profile fits under standard cabinets. Adhesive-back installation. Plugs into existing outlet. 30-minute install.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['lighting'],
      functions: [FN.undercabinetLighting],
      seasons: [],
      alreadyHaveFlag: 'has_undercabinet_lighting',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Bob Vila Best Under-Cabinet Lighting 2026 roundup',
      'Lumaz hardwired-vs-plug-in guide',
      'PROLIGHTING fixture installation guide',
    ],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_undercabinet_lighting', tier: 'sweet_spot' },
  },
  {
    universeId: 'ge_direct_wire_led_bar_10ft',
    rank: 100,
    variant: {
      productName: 'GE Direct Wire LED Bar (hardwired, 10ft)',
      priceLow: 110,
      priceHigh: 160,
      affiliateUrl: 'https://www.amazon.com/s?k=ge+direct+wire+led+under+cabinet&tag=alderprojects-20',
      productSpec:
        'Linkable hardwired LED bars. Wall-switch control. Requires electrician or significant DIY electrical skill.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['lighting'],
      functions: [FN.undercabinetLighting],
      seasons: [],
      alreadyHaveFlag: 'has_undercabinet_lighting',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_undercabinet_lighting', tier: 'premium' },
  },

  // ---------- Caulk -------------------------------------------------
  {
    universeId: 'dap_alex_plus_kitchen_caulk_kit',
    rank: 100,
    variant: {
      productName: 'DAP Alex Plus Acrylic Latex + Silicone Caulk (white) + steel caulking gun',
      priceLow: 15,
      priceHigh: 24,
      affiliateUrl: 'https://www.amazon.com/s?k=dap+alex+plus+kitchen+caulk+gun&tag=alderprojects-20',
      productSpec:
        'Paintable, mildew-resistant, water cleanup. Standard pro choice for backsplash and trim seams. Steel skeleton caulking gun ~$10-15.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['consumable_material'],
      functions: [FN.kitchenCaulk],
      seasons: [],
      alreadyHaveFlag: '',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'DAP product datasheet',
      'Pro caulking guide consensus',
    ],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_caulk_kit', tier: 'sweet_spot' },
  },

  // ---------- Painting supplies kit ---------------------------------
  {
    universeId: 'wooster_shortcut_painting_supplies_kit',
    rank: 100,
    variant: {
      productName:
        'Wooster 2.5" Shortcut angled sash brush + 4" foam roller + 9x12 canvas drop cloth + 220/320 sandpaper',
      priceLow: 32,
      priceHigh: 48,
      affiliateUrl:
        'https://www.amazon.com/s?k=wooster+shortcut+brush+foam+roller+canvas+drop+cloth&tag=alderprojects-20',
      productSpec:
        'Wooster Shortcut 2.5" angled sash brush (~$8). Whizz 4" foam roller frame + covers (~$10). 9x12 canvas drop cloth (~$12). 220 + 320 grit sandpaper assortment (~$10).',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['tool', 'consumable_material'],
      functions: [FN.paintingSupplies],
      seasons: [],
      alreadyHaveFlag: '',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Wooster product line review consensus',
      'DIY painting tool guides',
    ],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_painting_supplies', tier: 'sweet_spot' },
  },

  // ---------- Drawer slides -----------------------------------------
  {
    universeId: 'kitchen_drawer_slides__side_mount_ball_bearing_slides_5pair',
    rank: 100,
    variant: {
      productName: 'Side-mount ball-bearing slides (generic, 5-pair)',
      priceLow: 35,
      priceHigh: 55,
      affiliateUrl: 'https://www.amazon.com/s?k=cabinet+drawer+slides+21+inch+5+pair&tag=alderprojects-20',
      productSpec:
        'Generic ball-bearing slides. 21" length. 75-100 lb capacity.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.drawerSlide],
      seasons: [],
      alreadyHaveFlag: 'drawers_already_full_extension',
      conditions: [],
      tier: 'budget',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_drawer_slides', tier: 'budget' },
  },
  {
    universeId: 'blum_tandem_plus_blumotion_21in_5pair',
    rank: 100,
    variant: {
      productName: 'Blum Tandem Plus Blumotion 21" full-extension slides (5-pair)',
      priceLow: 75,
      priceHigh: 110,
      affiliateUrl: 'https://www.amazon.com/s?k=blum+tandem+plus+blumotion+21+inch&tag=alderprojects-20',
      productSpec:
        'Cabinet-shop standard 21" undermount slides. Soft-close, full-extension, 100 lb capacity. Industry-standard hardware.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.drawerSlide],
      seasons: [],
      alreadyHaveFlag: 'drawers_already_full_extension',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: [],
    },
    citations: [
      'Blum Tandem product datasheet',
      'Pro cabinet shop forum standards',
    ],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_drawer_slides', tier: 'sweet_spot' },
  },
  {
    universeId: 'blum_movento_undermount_slides_5pair',
    rank: 100,
    variant: {
      productName: 'Blum Movento undermount slides (5-pair)',
      priceLow: 200,
      priceHigh: 320,
      affiliateUrl: 'https://www.amazon.com/s?k=blum+movento+slide&tag=alderprojects-20',
      productSpec:
        'Premium undermount slides invisible from outside the drawer. Cabinet-shop install required.',
    },
    tags: {
      topics: ['kitchen'],
      roles: ['hardware'],
      functions: [FN.drawerSlide],
      seasons: [],
      alreadyHaveFlag: 'drawers_already_full_extension',
      conditions: [],
      tier: 'premium',
      propertyTypes: [],
    },
    citations: [],
    migratedFrom: { scope: 'kitchen_cosmetic_refresh', slotId: 'kitchen_drawer_slides', tier: 'premium' },
  },

  // ====================================================================
  // V7.2.4 — outdoor_lake_season (32 new products; no dedup overlap
  // with the kitchen entries above. Tagged with seasons + propertyTypes
  // so future outdoor scopes (deck refresh, etc.) can share entries.)
  // ====================================================================

  // ---------- Adirondack chairs --------------------------------------
  {
    universeId: 'lake_adirondack_chairs__generic_resin_plastic_adirondack_chair_set_of_4',
    rank: 100,
    variant: {
      productName: 'Generic resin/plastic Adirondack chair (set of 4)',
      priceLow: 160,
      priceHigh: 320,
      affiliateUrl: 'https://www.amazon.com/s?k=plastic+adirondack+chair+set+of+4&tag=alderprojects-20',
      productSpec: 'Injection-molded resin or HDPE generic. ~$40-80 per chair. Lightweight (15-20 lbs).',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['furniture'],
      functions: [FN.adirondackChair],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_adirondack_chairs',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_adirondack_chairs', tier: 'budget' },
  },
  {
    universeId: 'polywood_classic_folding_adirondack_chair',
    rank: 100,
    variant: {
      productName: 'POLYWOOD Classic Folding Adirondack Chair (4-chair purchase, AD5030)',
      priceLow: 1040,
      priceHigh: 1400,
      amazonAsin: 'B001VNCJ36',
      affiliateUrl: 'https://www.amazon.com/dp/B001VNCJ36?tag=alderprojects-20',
      productSpec:
        'Marine-grade HDPE recycled lumber (~30,000 milk jugs per hour). 34 lbs each. 250-lb weight capacity. 20-year warranty against splintering, cracking, chipping, peeling. ColorStay UV-inhibitor pigments. Folds flat for storage. Made in USA. ~$260-350 per chair. Available in white, sand, black, navy, slate grey.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['furniture'],
      functions: [FN.adirondackChair],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_adirondack_chairs',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: [
      'Polywood Classic Folding Adirondack Amazon listing (B001VNCJ36)',
      'Bob Vila Best Adirondack Chairs 2026 roundup',
      'RoomforTuesday Polywood real-world review',
      'PolyTeak material comparison',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_adirondack_chairs', tier: 'sweet_spot' },
  },
  {
    universeId: 'polywood_modern_adirondack_curveback',
    rank: 100,
    variant: {
      productName: 'POLYWOOD Modern Adirondack or Nautical Curveback (4-chair, AD600 series)',
      priceLow: 1400,
      priceHigh: 1800,
      amazonAsin: 'B079Y5K6HX',
      affiliateUrl: 'https://www.amazon.com/dp/B079Y5K6HX?tag=alderprojects-20',
      productSpec:
        'Same Polywood lumber + Solidcore durability. Modern silhouette with curved back, waterfall front, ergonomic seat. ClimateTuff marine-grade hardware (18/8 stainless). ~$350-450 per chair. Heavier base for stability in lake winds.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['furniture'],
      functions: [FN.adirondackChair],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_adirondack_chairs',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [
      'Polywood Modern Adirondack Amazon listing (B079Y5K6HX)',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_adirondack_chairs', tier: 'premium' },
  },

  // ---------- Side tables --------------------------------------------
  {
    universeId: 'lake_side_tables__plastic_resin_side_table_16_round_pair',
    rank: 100,
    variant: {
      productName: 'Plastic resin side table, 16" round (pair)',
      priceLow: 50,
      priceHigh: 80,
      affiliateUrl: 'https://www.amazon.com/s?k=outdoor+side+table+plastic+resin+16+inch&tag=alderprojects-20',
      productSpec: 'Injection-molded plastic. Cracks at leg joints in 1-2 seasons.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['furniture'],
      functions: [FN.outdoorSideTable],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_side_tables',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_side_tables', tier: 'budget' },
  },
  {
    universeId: 'polywood_classic_side_table_pair',
    rank: 100,
    variant: {
      productName: 'POLYWOOD Classic Side Table (15"x19", pair)',
      priceLow: 240,
      priceHigh: 360,
      affiliateUrl: 'https://www.amazon.com/s?k=polywood+classic+side+table&tag=alderprojects-20',
      productSpec:
        'Same Polywood lumber as the chairs. 15"x19" side table. Holds drinks, books, lamps. 20-year warranty. Color-matches the chair set.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['furniture'],
      functions: [FN.outdoorSideTable],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_side_tables',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: ['Polywood furniture line documentation'],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_side_tables', tier: 'sweet_spot' },
  },
  {
    universeId: 'lake_side_tables__solid_teak_outdoor_side_tables_pair',
    rank: 100,
    variant: {
      productName: 'Solid teak outdoor side tables (pair)',
      priceLow: 400,
      priceHigh: 700,
      affiliateUrl: 'https://www.amazon.com/s?k=teak+outdoor+side+table+pair&tag=alderprojects-20',
      productSpec:
        'Solid teak hardwood. Beautiful aged silver-grey patina if untreated. Annual oil/seal recommended for color retention.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['furniture'],
      functions: [FN.outdoorSideTable],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_side_tables',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_side_tables', tier: 'premium' },
  },

  // ---------- Cushions ----------------------------------------------
  {
    universeId: 'hampton_bay_cushionguard_cushions_set_4',
    rank: 100,
    variant: {
      productName: 'Hampton Bay CushionGuard cushions (set of 4)',
      priceLow: 100,
      priceHigh: 180,
      affiliateUrl: 'https://www.amazon.com/s?k=hampton+bay+cushionguard+adirondack+cushion&tag=alderprojects-20',
      productSpec: 'Solution-dyed polyester. 3-year warranty. ~$25-45 per cushion. Sold at Home Depot.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['textile'],
      functions: [FN.outdoorCushion],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_cushions',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_cushions', tier: 'budget' },
  },
  {
    universeId: 'sunbrella_replacement_cushions_adirondack_set_4',
    rank: 100,
    variant: {
      productName: 'Sunbrella replacement cushions for Adirondack (set of 4)',
      priceLow: 280,
      priceHigh: 480,
      affiliateUrl: 'https://www.amazon.com/s?k=sunbrella+adirondack+cushion+set&tag=alderprojects-20',
      productSpec:
        'Solution-dyed acrylic. Color built into the fiber, not surface-printed. 5-year fade warranty. Survives bleach cleaning. Dries in 1-2 hours after rain. ~$70-120 per cushion.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['textile'],
      functions: [FN.outdoorCushion],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_cushions',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: [
      'Sunbrella vs CushionGuard durability comparison (Neighbor blog)',
      'FabricaKraft cost-over-time analysis',
      'Triad Cushion Factory outdoor fabric guide',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_cushions', tier: 'sweet_spot' },
  },
  {
    universeId: 'frontgate_sunbrella_cushions_premium',
    rank: 100,
    variant: {
      productName: 'Frontgate / Restoration Hardware custom Sunbrella cushions',
      priceLow: 600,
      priceHigh: 900,
      affiliateUrl: 'https://www.amazon.com/s?k=frontgate+sunbrella+cushion&tag=alderprojects-20',
      productSpec:
        'Same Sunbrella fabric. Tailored covers, custom welt detailing, higher fill density. ~$150-220 per cushion.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['textile'],
      functions: [FN.outdoorCushion],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_cushions',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_cushions', tier: 'premium' },
  },

  // ---------- Umbrella ----------------------------------------------
  {
    universeId: 'lake_umbrella__pole_and_base_9ft_umbrella_walmart_tier_polyester',
    rank: 100,
    variant: {
      productName: 'Pole-and-base 9ft umbrella (Walmart-tier polyester)',
      priceLow: 80,
      priceHigh: 140,
      affiliateUrl: 'https://www.amazon.com/s?k=outdoor+patio+umbrella+9ft&tag=alderprojects-20',
      productSpec: 'Steel pole, polyester canopy. Crank-tilt mechanism. Standard ~50lb base.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.patioUmbrella],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_umbrella',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_umbrella', tier: 'budget' },
  },
  {
    universeId: 'lake_umbrella__cantilever_umbrella_10ft_sunbrella_200lb_base',
    rank: 100,
    variant: {
      productName: '10ft cantilever umbrella with Sunbrella canopy + 200lb base',
      priceLow: 280,
      priceHigh: 440,
      affiliateUrl: 'https://www.amazon.com/s?k=cantilever+umbrella+10ft+sunbrella+200lb+base&tag=alderprojects-20',
      productSpec:
        'Cantilever (offset) design — pole sits behind seating area, freeing the table. 10ft canopy covers a 4-chair conversation area. Sunbrella canopy with 5-year fade warranty. 200lb base is minimum for 10ft cantilever in lake winds.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.patioUmbrella],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_umbrella',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: [
      'Patio umbrella wind-rating standards',
      'Sunbrella canopy fabric specs',
      'Cantilever vs pole-and-base umbrella comparison',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_umbrella', tier: 'sweet_spot' },
  },
  {
    universeId: 'treasure_garden_cantilever_11ft',
    rank: 100,
    variant: {
      productName: 'Treasure Garden Cantilever 11ft + Frankford-style 250lb base',
      priceLow: 800,
      priceHigh: 1500,
      affiliateUrl: 'https://www.amazon.com/s?k=treasure+garden+cantilever+umbrella&tag=alderprojects-20',
      productSpec:
        'Country-club tier. Solid arm, 8-direction tilt, wind-rated to 25+mph. Aluminum pole, premium hardware.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.patioUmbrella],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_umbrella',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_umbrella', tier: 'premium' },
  },

  // ---------- Outdoor rug -------------------------------------------
  {
    universeId: 'lake_outdoor_rug__generic_polyester_outdoor_rug_8x10',
    rank: 100,
    variant: {
      productName: 'Generic polyester outdoor rug (8x10)',
      priceLow: 35,
      priceHigh: 65,
      affiliateUrl: 'https://www.amazon.com/s?k=outdoor+rug+8x10+polyester&tag=alderprojects-20',
      productSpec: 'Polyester. "Outdoor" labeling cosmetic. Fades and traps mildew.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['textile'],
      functions: [FN.outdoorRug],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_rug',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_outdoor_rug', tier: 'budget' },
  },
  {
    universeId: 'lake_outdoor_rug__solution_dyed_polypropylene_outdoor_rug_8x10',
    rank: 100,
    variant: {
      productName: 'Solution-dyed polypropylene outdoor rug, 8x10',
      priceLow: 80,
      priceHigh: 180,
      affiliateUrl: 'https://www.amazon.com/s?k=polypropylene+outdoor+rug+8x10+solution+dyed&tag=alderprojects-20',
      productSpec:
        'Polypropylene fiber, solution-dyed. Survives rain, easy to hose off. UV-stable color. ~5-7 year service life with seasonal storage.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['textile'],
      functions: [FN.outdoorRug],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_rug',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: ['Outdoor rug material durability comparisons'],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_outdoor_rug', tier: 'sweet_spot' },
  },
  {
    universeId: 'lake_outdoor_rug__indoor_outdoor_woven_rug_jute_sisal_blend',
    rank: 100,
    variant: {
      productName: 'Indoor-outdoor woven rug (jute, sisal blend)',
      priceLow: 280,
      priceHigh: 500,
      affiliateUrl: 'https://www.amazon.com/s?k=indoor+outdoor+jute+sisal+rug+8x10&tag=alderprojects-20',
      productSpec: 'Natural fiber blend with synthetic backing. Indoor aesthetic.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['textile'],
      functions: [FN.outdoorRug],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_rug',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_outdoor_rug', tier: 'premium' },
  },

  // ---------- Gas grill --------------------------------------------
  {
    universeId: 'char_broil_or_nexgrill_3_burner',
    rank: 100,
    variant: {
      productName: 'Char-Broil or Nexgrill 3-burner gas grill',
      priceLow: 180,
      priceHigh: 320,
      affiliateUrl: 'https://www.amazon.com/s?k=char-broil+3+burner+gas+grill&tag=alderprojects-20',
      productSpec:
        'Generic 3-burner gas grill. 1-year warranty typical. Burners corrode within 2-3 seasons.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['appliance'],
      functions: [FN.gasGrill],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_working_grill',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_gas_grill', tier: 'budget' },
  },
  {
    universeId: 'weber_spirit_ii_e310_3_burner_lp',
    rank: 100,
    variant: {
      productName: 'Weber Spirit II E-310 3-Burner Liquid Propane Grill, Black',
      priceLow: 569,
      priceHigh: 769,
      amazonAsin: 'B077JTCMKQ',
      affiliateUrl: 'https://www.amazon.com/dp/B077JTCMKQ?tag=alderprojects-20',
      productSpec:
        '3-burner 30,000 BTU. Porcelain-enameled cast-iron grates. GS4 grilling system. Snap-Jet ignition. iGrill 3 compatible. 10-year warranty on lid and burners. Reversible cooking grates. Open-cart design. Easy-read fuel gauge.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['appliance'],
      functions: [FN.gasGrill],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_working_grill',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: [
      'Weber Spirit II E-310 Amazon listing (B077JTCMKQ)',
      'Weber 10-year warranty terms',
      'Grillio retail pricing reference',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_gas_grill', tier: 'sweet_spot' },
  },
  {
    universeId: 'weber_genesis_e325',
    rank: 100,
    variant: {
      productName: 'Weber Genesis E-325 or higher (4-burner)',
      priceLow: 1100,
      priceHigh: 1800,
      affiliateUrl: 'https://www.amazon.com/s?k=weber+genesis+gas+grill&tag=alderprojects-20',
      productSpec:
        'Premium 4-burner with sear station, side burner, more BTU output. Cast aluminum cookbox, larger cooking surface.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['appliance'],
      functions: [FN.gasGrill],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_working_grill',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_gas_grill', tier: 'premium' },
  },

  // ---------- Grill cover -------------------------------------------
  {
    universeId: 'lake_grill_cover__generic_universal_fit_grill_cover',
    rank: 100,
    variant: {
      productName: 'Generic universal-fit grill cover',
      priceLow: 18,
      priceHigh: 32,
      affiliateUrl: 'https://www.amazon.com/s?k=grill+cover+universal&tag=alderprojects-20',
      productSpec: 'Generic polyester. Loose fit. Traps moisture.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.grillCover],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_grill_cover',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_grill_cover', tier: 'budget' },
  },
  {
    universeId: 'weber_premium_grill_cover_spirit',
    rank: 100,
    variant: {
      productName: 'Weber Premium Outdoor Grill Cover (Spirit Series fit)',
      priceLow: 45,
      priceHigh: 80,
      affiliateUrl: 'https://www.amazon.com/s?k=weber+premium+grill+cover+spirit&tag=alderprojects-20',
      productSpec:
        "Heavy polyester with vinyl coating. Sized to specific Weber Spirit II model. Breathable so grill doesn't trap moisture. Weather-rated.",
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.grillCover],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_grill_cover',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: ['Weber grill cover product line', 'Grill cover material comparison'],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_grill_cover', tier: 'sweet_spot' },
  },
  {
    universeId: 'lake_grill_cover__marine_grade_premium_grill_cover',
    rank: 100,
    variant: {
      productName: '"Marine-grade" premium grill cover',
      priceLow: 120,
      priceHigh: 180,
      affiliateUrl: 'https://www.amazon.com/s?k=marine+grade+grill+cover+heavy+duty&tag=alderprojects-20',
      productSpec: 'Heavy vinyl with reinforced seams. Sea-spray rated.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.grillCover],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_grill_cover',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_grill_cover', tier: 'premium' },
  },

  // ---------- Grill tools -------------------------------------------
  {
    universeId: 'weber_grill_tools_3pc',
    rank: 100,
    variant: {
      productName: 'Weber 3-piece grilling tool set (spatula, tongs, fork)',
      priceLow: 30,
      priceHigh: 48,
      affiliateUrl: 'https://www.amazon.com/s?k=weber+3+piece+grilling+tool+set&tag=alderprojects-20',
      productSpec:
        'Stainless steel construction. Long handles for safe distance from grill. Dishwasher safe. ~$10-16 per tool.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.grillTools],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_grill_tools',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: ['Weber accessories product line'],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_grill_tools', tier: 'sweet_spot' },
  },

  // ---------- String lights -----------------------------------------
  {
    universeId: 'walmart_string_lights_50ft',
    rank: 100,
    variant: {
      productName: 'Walmart-tier string lights (50ft)',
      priceLow: 12,
      priceHigh: 25,
      affiliateUrl: 'https://www.amazon.com/s?k=outdoor+string+lights+50ft&tag=alderprojects-20',
      productSpec: 'Generic LED string with non-replaceable bulbs. 1-2 year service life.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['lighting'],
      functions: [FN.outdoorStringLights],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_lighting',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_string_lights', tier: 'budget' },
  },
  {
    universeId: 'brightech_ambience_pro_led_string_lights_48ft',
    rank: 100,
    variant: {
      productName: 'Brightech Ambience Pro LED outdoor string lights (48ft)',
      priceLow: 45,
      priceHigh: 70,
      affiliateUrl: 'https://www.amazon.com/s?k=brightech+ambience+pro+led+48ft&tag=alderprojects-20',
      productSpec:
        'Commercial-grade. Weatherproof IP65. Dimmable. LED bulbs included and replaceable. 2W per bulb. Wirecutter pick.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['lighting'],
      functions: [FN.outdoorStringLights],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_lighting',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: [
      'Wirecutter outdoor string lights review',
      'Brightech product line documentation',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_string_lights', tier: 'sweet_spot' },
  },
  {
    universeId: 'pottery_barn_west_elm_cafe_string_lights',
    rank: 100,
    variant: {
      productName: 'Pottery Barn / West Elm "café lights"',
      priceLow: 180,
      priceHigh: 280,
      affiliateUrl: 'https://www.amazon.com/s?k=pottery+barn+cafe+string+lights&tag=alderprojects-20',
      productSpec:
        'Same product class as Brightech with brand markup. Often single-source manufacturer (Brightech rebranded).',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['lighting'],
      functions: [FN.outdoorStringLights],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_outdoor_lighting',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_string_lights', tier: 'premium' },
  },

  // ---------- Cooler ------------------------------------------------
  {
    universeId: 'coleman_xtreme_5day_70qt',
    rank: 100,
    variant: {
      productName: 'Coleman Xtreme 5-day 70qt',
      priceLow: 50,
      priceHigh: 80,
      affiliateUrl: 'https://www.amazon.com/s?k=coleman+xtreme+5+day+cooler+70qt&tag=alderprojects-20',
      productSpec:
        '70qt capacity. 5-day ice retention claimed. Plastic walls, basic insulation. Steel-reinforced handles.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.outdoorCooler],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_lake_cooler',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_cooler', tier: 'budget' },
  },
  {
    universeId: 'rtic_65_hard_cooler',
    rank: 100,
    variant: {
      productName: 'RTIC 65 Hard Cooler',
      priceLow: 200,
      priceHigh: 280,
      affiliateUrl: 'https://www.amazon.com/s?k=rtic+65+hard+cooler&tag=alderprojects-20',
      productSpec:
        'Roto-molded construction. 7-day ice retention. 65qt capacity. Lifetime gasket warranty. Anti-skid feet, integrated lock points. Heavy enough to not blow off the dock.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.outdoorCooler],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_lake_cooler',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: [
      'RTIC vs Yeti Reddit r/Coolers consensus',
      'Roto-molded cooler ice retention testing',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_cooler', tier: 'sweet_spot' },
  },
  {
    universeId: 'yeti_tundra_65',
    rank: 100,
    variant: {
      productName: 'Yeti Tundra 65',
      priceLow: 350,
      priceHigh: 480,
      affiliateUrl: 'https://www.amazon.com/s?k=yeti+tundra+65+cooler&tag=alderprojects-20',
      productSpec:
        'Roto-molded construction. 7-day ice retention. 65qt capacity. Premium brand. Most-stolen cooler at public docks.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.outdoorCooler],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_lake_cooler',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_cooler', tier: 'premium' },
  },

  // ---------- Floats / lake essentials ------------------------------
  {
    universeId: 'lake_floats_essentials__inflatable_lake_floats_3pk_drink_holders_4pk',
    rank: 100,
    variant: {
      productName: 'Inflatable lake floats (3-pack) + floating drink holders (4-pack)',
      priceLow: 45,
      priceHigh: 80,
      affiliateUrl: 'https://www.amazon.com/s?k=inflatable+lake+float+3+pack+drink+holder&tag=alderprojects-20',
      productSpec:
        'Mid-grade vinyl floats with backrest. ~3-5 season durability with proper deflation/storage. Drink holders are foam, fit standard 12oz cans/bottles.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.lakeFloats],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_lake_floats',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: ['Lake float durability consumer reviews'],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_floats_essentials', tier: 'sweet_spot' },
  },

  // ---------- Bug control -------------------------------------------
  {
    universeId: 'lake_bug_control__citronella_candles_spray_repellent',
    rank: 100,
    variant: {
      productName: 'Citronella candles + spray repellent',
      priceLow: 15,
      priceHigh: 30,
      affiliateUrl: 'https://www.amazon.com/s?k=citronella+candles+lake+bug+repellent&tag=alderprojects-20',
      productSpec:
        'Citronella wax candles + DEET-based spray. Effective only within 2-3 ft of candle.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.mosquitoControl],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_bug_control',
      conditions: [],
      tier: 'budget',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_bug_control', tier: 'budget' },
  },
  {
    universeId: 'thermacell_mr300',
    rank: 100,
    variant: {
      productName: 'Thermacell MR300 Mosquito Repellent + replacement mats/butane',
      priceLow: 40,
      priceHigh: 65,
      affiliateUrl: 'https://www.amazon.com/s?k=thermacell+mr300+mosquito+repellent+refills&tag=alderprojects-20',
      productSpec:
        'Butane-powered area repellent. Creates 15-foot mosquito-free zone. Effective in still air. Allethrin-based mat (synthetic pyrethrin). Not a fire hazard. Refills: ~$5-7 per 12-hour mat pack.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.mosquitoControl],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_bug_control',
      conditions: [],
      tier: 'sweet_spot',
      propertyTypes: ['lake'],
    },
    citations: [
      'Thermacell efficacy testing data',
      'CDC mosquito control comparison resources',
    ],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_bug_control', tier: 'sweet_spot' },
  },
  {
    universeId: 'thermacell_patio_shield_rechargeable',
    rank: 100,
    variant: {
      productName: 'Thermacell Patio Shield rechargeable or full mosquito system',
      priceLow: 80,
      priceHigh: 140,
      affiliateUrl: 'https://www.amazon.com/s?k=thermacell+patio+shield+rechargeable&tag=alderprojects-20',
      productSpec:
        'Battery-powered or rechargeable models. Same allethrin chemistry, different power source.',
    },
    tags: {
      topics: ['outdoor'],
      roles: ['accessory'],
      functions: [FN.mosquitoControl],
      seasons: ['summer', 'opening_season'],
      alreadyHaveFlag: 'has_bug_control',
      conditions: [],
      tier: 'premium',
      propertyTypes: ['lake'],
    },
    citations: [],
    migratedFrom: { scope: 'outdoor_lake_season', slotId: 'lake_bug_control', tier: 'premium' },
  },
  {
    universeId: "generic_oxalic_acid_wood_deck_cleaner_1_gallon",
    rank: 100,
    variant: {
      productName: "Generic oxalic acid wood deck cleaner (1 gallon)",
      priceLow: 18,
      priceHigh: 28,
      affiliateUrl: "https://www.amazon.com/s?k=oxalic+acid+deck+cleaner+gallon&tag=alderprojects-20",
      productSpec: "Oxalic acid concentrate. Dilute with water. Cleans and brightens wood. ~$20/gallon. Treat 200-400 sq ft."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "cleaner",
        "consumable_material"
      ],
      functions: [
        "deck_cleaner"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_clean_deck",
      tier: "budget"
    },
    citations: [
      "Cabot Wood Brightener product documentation",
      "Restore-A-Deck product line",
      "Wood deck preparation guidance"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_cleaner",
      tier: "budget"
    }
  },
  {
    universeId: "cabot_wood_brightener_1_gallon",
    rank: 100,
    variant: {
      productName: "Cabot Wood Brightener (1 gallon)",
      priceLow: 22,
      priceHigh: 35,
      affiliateUrl: "https://www.amazon.com/s?k=cabot+wood+brightener+gallon&tag=alderprojects-20",
      productSpec: "Two-part cleaner: oxalic-acid based brightener that neutralizes weather-grayed wood and prepares for stain. Pairs with Cabot stains. Treats 300-500 sq ft per gallon."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "cleaner",
        "consumable_material"
      ],
      functions: [
        "deck_cleaner"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_clean_deck",
      tier: "sweet_spot"
    },
    citations: [
      "Cabot Wood Brightener product documentation",
      "Restore-A-Deck product line",
      "Wood deck preparation guidance"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_cleaner",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "restore_a_deck_two_step_cleaner_brightener_kit",
    rank: 100,
    variant: {
      productName: "Restore-A-Deck two-step cleaner + brightener kit",
      priceLow: 60,
      priceHigh: 90,
      affiliateUrl: "https://www.amazon.com/s?k=restore-a-deck+cleaner+brightener+kit&tag=alderprojects-20",
      productSpec: "Professional 2-step kit: cleaner first (removes mildew, dirt), brightener second (restores wood color). Kit pricing covers ~500 sq ft. Pro-grade results."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "cleaner",
        "consumable_material"
      ],
      functions: [
        "deck_cleaner"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_clean_deck",
      tier: "premium"
    },
    citations: [
      "Cabot Wood Brightener product documentation",
      "Restore-A-Deck product line",
      "Wood deck preparation guidance"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_cleaner",
      tier: "premium"
    }
  },
  {
    universeId: "quickie_18_deck_scrub_brush_with_telescoping_handle",
    rank: 100,
    variant: {
      productName: "Quickie 18\" deck scrub brush with telescoping handle",
      priceLow: 22,
      priceHigh: 35,
      affiliateUrl: "https://www.amazon.com/s?k=quickie+deck+scrub+brush+telescoping+handle&tag=alderprojects-20",
      productSpec: "18\" bristle head, stiff bristles for paint/stain removal. Telescoping handle to 60\". Threaded for extension poles. Dishwasher-handle compatible."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "tool"
      ],
      functions: [
        "deck_brush"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_deck_brush",
      tier: "sweet_spot"
    },
    citations: [
      "Quickie product line documentation"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_brush",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "generic_pin_type_moisture_meter",
    rank: 100,
    variant: {
      productName: "Generic pin-type moisture meter",
      priceLow: 15,
      priceHigh: 28,
      affiliateUrl: "https://www.amazon.com/s?k=pin+type+moisture+meter+wood&tag=alderprojects-20",
      productSpec: "Two-pin contact meter. Reads 0-100% wood moisture. Inexpensive, generally accurate above 5%. ~$20."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "measurement_tool"
      ],
      functions: [
        "moisture_meter"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_moisture_meter",
      tier: "budget"
    },
    citations: [
      "General Tools MMD4E documentation",
      "Deck staining moisture standards"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_moisture_meter",
      tier: "budget"
    }
  },
  {
    universeId: "general_tools_mmd4e_pin_and_pinless_moisture_meter",
    rank: 100,
    variant: {
      productName: "General Tools MMD4E pin-and-pinless moisture meter",
      priceLow: 38,
      priceHigh: 55,
      affiliateUrl: "https://www.amazon.com/s?k=general+tools+mmd4e+moisture+meter&tag=alderprojects-20",
      productSpec: "Both pin-type (contact) and pinless (surface scan) modes. LCD display with color coding. ~$40. Long-loved by reviewers."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "measurement_tool"
      ],
      functions: [
        "moisture_meter"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_moisture_meter",
      tier: "sweet_spot"
    },
    citations: [
      "General Tools MMD4E documentation",
      "Deck staining moisture standards"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_moisture_meter",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "behr_premium_semi_transparent_weatherproofing_stain_5_gallon",
    rank: 100,
    variant: {
      productName: "Behr Premium Semi-Transparent Weatherproofing Stain (5 gallon)",
      priceLow: 175,
      priceHigh: 230,
      affiliateUrl: "https://www.amazon.com/s?k=behr+premium+semi+transparent+deck+stain+5+gallon&tag=alderprojects-20",
      productSpec: "Semi-transparent oil-based weatherproofing stain. ~$190/5gal. Covers 300-450 sq ft per gallon. 3-year warranty in shaded areas; less in direct sun."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "finish"
      ],
      functions: [
        "deck_stain_sealer"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_recent_stain",
      tier: "budget"
    },
    citations: [
      "Cabot Australian Timber Oil product documentation",
      "Sherwin-Williams SuperDeck product line",
      "Behr Premium Weatherproofing documentation",
      "Reviewer aggregations on deck stain durability in Northeast climate"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_stain_sealer",
      tier: "budget"
    }
  },
  {
    universeId: "cabot_australian_timber_oil_1_gallon",
    rank: 100,
    variant: {
      productName: "Cabot Australian Timber Oil (1 gallon)",
      priceLow: 65,
      priceHigh: 90,
      amazonAsin: "B000K6HBKG",
      affiliateUrl: "https://www.amazon.com/dp/B000K6HBKG?tag=alderprojects-20",
      productSpec: "Penetrating oil + alkyd hybrid. 3-way oil protection. Covers 350-500 sq ft per gallon. Multiple natural-toned colors. 2-3 year recoat cycle in Vermont. Reviewer favorite for cedar and pressure-treated."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "finish"
      ],
      functions: [
        "deck_stain_sealer"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_recent_stain",
      tier: "sweet_spot"
    },
    citations: [
      "Cabot Australian Timber Oil product documentation",
      "Sherwin-Williams SuperDeck product line",
      "Behr Premium Weatherproofing documentation",
      "Reviewer aggregations on deck stain durability in Northeast climate"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_stain_sealer",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "sherwin_williams_superdeck_solid_color_5_gallon",
    rank: 100,
    variant: {
      productName: "Sherwin-Williams SuperDeck Solid Color (5 gallon)",
      priceLow: 220,
      priceHigh: 320,
      affiliateUrl: "https://www.amazon.com/s?k=sherwin+williams+superdeck+solid+5+gallon&tag=alderprojects-20",
      productSpec: "Acrylic solid-color deck stain. Highest opacity, longest-lasting (4-6 year recoat). Hides imperfections and old stain bleed-through. Heavy-bodied; requires brushing and back-rolling for proper coverage."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "finish"
      ],
      functions: [
        "deck_stain_sealer"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_recent_stain",
      tier: "premium"
    },
    citations: [
      "Cabot Australian Timber Oil product documentation",
      "Sherwin-Williams SuperDeck product line",
      "Behr Premium Weatherproofing documentation",
      "Reviewer aggregations on deck stain durability in Northeast climate"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_stain_sealer",
      tier: "premium"
    }
  },
  {
    universeId: "deckmate_or_grk_exterior_deck_screws_2_5_3_5_1_lb",
    rank: 100,
    variant: {
      productName: "Deckmate or GRK exterior deck screws, 2.5\"-3.5\", 1 lb",
      priceLow: 22,
      priceHigh: 38,
      affiliateUrl: "https://www.amazon.com/s?k=deckmate+grk+deck+screws+exterior+coated&tag=alderprojects-20",
      productSpec: "Coated exterior deck screws. T25 star drive (less stripping than Phillips). Self-countersinking head. ~$25/lb (200 screws). Sized 2.5\" for board attachment, 3\" for joist hangers."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "hardware"
      ],
      functions: [
        "exterior_screws"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "",
      tier: "sweet_spot"
    },
    citations: [
      "Deckmate, GRK fastener documentation"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_exterior_screws",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "deck_stair_grip__heavy_duty_anti_slip_black_tape_4_inch_x_30_ft",
    rank: 100,
    variant: {
      productName: "Heavy-duty anti-slip black tape (4 inch x 30 ft)",
      priceLow: 22,
      priceHigh: 38,
      affiliateUrl: "https://www.amazon.com/s?k=anti+slip+stair+tread+tape+4+inch+30+ft&tag=alderprojects-20",
      productSpec: "4\" wide adhesive grit tape. ~30 ft roll. Cut to fit each tread. Black. 5-7 year typical life on covered stairs; 3-4 on exposed. Coarse PEVA grit; high-friction."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "safety_item",
        "consumable_material"
      ],
      functions: [
        "stair_grip_strips"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_stair_grip",
      tier: "sweet_spot"
    },
    citations: [
      "Anti-slip stair products documentation"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_stair_grip",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "home_depot_rental_2_500_psi_gas_pressure_washer_4_hour",
    rank: 100,
    variant: {
      productName: "Home Depot rental: 2,500 PSI gas pressure washer (4-hour)",
      priceLow: 65,
      priceHigh: 95,
      affiliateUrl: "https://www.homedepot.com/c/SF_Pressure_Washer_Rental?tag=alderprojects-20",
      productSpec: "Rental from Home Depot Tool Rental Center. ~$80/4 hours. Includes nozzles. Bring fuel; return clean."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "tool"
      ],
      functions: [
        "pressure_washer"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_pressure_washer",
      tier: "budget"
    },
    citations: [
      "Sun Joe SPX3000 reviews",
      "Home Depot tool rental pricing",
      "Pressure washer technique guidance"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_pressure_washer",
      tier: "budget"
    }
  },
  {
    universeId: "sun_joe_spx3000_electric_pressure_washer_2_030_psi",
    rank: 100,
    variant: {
      productName: "Sun Joe SPX3000 electric pressure washer (2,030 PSI)",
      priceLow: 145,
      priceHigh: 195,
      affiliateUrl: "https://www.amazon.com/s?k=sun+joe+spx3000+electric+pressure+washer&tag=alderprojects-20",
      productSpec: "Electric, 2,030 PSI, 1.76 GPM. Sufficient for residential decks. 35 ft cord, 5 nozzles. Storage on the unit. ~$160. Reviewer-validated for occasional use."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "tool"
      ],
      functions: [
        "pressure_washer"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_pressure_washer",
      tier: "sweet_spot"
    },
    citations: [
      "Sun Joe SPX3000 reviews",
      "Home Depot tool rental pricing",
      "Pressure washer technique guidance"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_pressure_washer",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "generac_speedwash_3_200_psi_gas_pressure_washer",
    rank: 100,
    variant: {
      productName: "Generac SpeedWash 3,200 PSI gas pressure washer",
      priceLow: 380,
      priceHigh: 520,
      affiliateUrl: "https://www.amazon.com/s?k=generac+3200+psi+pressure+washer&tag=alderprojects-20",
      productSpec: "Gas, 3,200 PSI, 2.7 GPM. Pro-grade for serious deck/siding work. ~$450. Worth it if you have a large property and use 4+ times per year."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "tool"
      ],
      functions: [
        "pressure_washer"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_pressure_washer",
      tier: "premium"
    },
    citations: [
      "Sun Joe SPX3000 reviews",
      "Home Depot tool rental pricing",
      "Pressure washer technique guidance"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_pressure_washer",
      tier: "premium"
    }
  },
  {
    universeId: "deck_board_repair__cat_s_paw_nail_puller_multi_tool_blade_spare_deck_boards",
    rank: 100,
    variant: {
      productName: "Cat's paw (nail puller) + multi-tool blade + spare deck boards",
      priceLow: 35,
      priceHigh: 65,
      affiliateUrl: "https://www.amazon.com/s?k=cats+paw+nail+puller+oscillating+multi+tool+blade&tag=alderprojects-20",
      productSpec: "Cat's paw / pry bar (~$15) + oscillating multi-tool blade for flush cuts (~$15) + 1-2 replacement deck boards (varies by deck width, $20-30). Tools for selective board replacement during refresh."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "tool",
        "hardware"
      ],
      functions: [
        "board_repair_tools"
      ],
      seasons: [
        "spring",
        "pre_summer",
        "summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_repair_tools",
      tier: "sweet_spot"
    },
    citations: [
      "Selective deck board replacement guidance"
    ],
    migratedFrom: {
      scope: "outdoor_deck_refresh",
      slotId: "deck_board_repair",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "watersafe_all_in_one_basic_test_strips",
    rank: 100,
    variant: {
      productName: "Watersafe All-in-One basic test strips",
      priceLow: 12,
      priceHigh: 22,
      affiliateUrl: "https://www.amazon.com/s?k=watersafe+all+in+one+test+kit&tag=alderprojects-20",
      productSpec: "Quick-dip test strips for chlorine, hardness, lead, pesticides, bacteria, nitrates. Results in minutes. Useful for screening; not a substitute for lab analysis on bacteria."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "measurement_tool",
        "safety_item"
      ],
      functions: [
        "water_test_kit"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_recent_water_test",
      tier: "budget"
    },
    citations: [
      "Vermont Department of Health well water testing guidance",
      "Tap Score by SimpleLab product documentation",
      "EPA private well water testing recommendations"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_water_test_kit",
      tier: "budget"
    }
  },
  {
    universeId: "tap_score_by_simplelab_essential_well_water_mail_in_lab_test",
    rank: 100,
    variant: {
      productName: "Tap Score by SimpleLab — Essential Well Water mail-in lab test",
      priceLow: 165,
      priceHigh: 195,
      affiliateUrl: "https://www.amazon.com/s?k=tap+score+simplelab+well+water+test&tag=alderprojects-20",
      productSpec: "Mail-in lab analysis. Tests for 50+ contaminants including bacteria, lead, arsenic, radon-in-water (Vermont-specific concern), nitrates, hardness, pH. Results in 5-10 days. Includes interpretation guidance."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "measurement_tool",
        "safety_item"
      ],
      functions: [
        "water_test_kit"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_recent_water_test",
      tier: "sweet_spot"
    },
    citations: [
      "Vermont Department of Health well water testing guidance",
      "Tap Score by SimpleLab product documentation",
      "EPA private well water testing recommendations"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_water_test_kit",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "tap_score_advanced_well_water_test_95_analytes",
    rank: 100,
    variant: {
      productName: "Tap Score Advanced Well Water test (95+ analytes)",
      priceLow: 280,
      priceHigh: 360,
      affiliateUrl: "https://www.amazon.com/s?k=tap+score+advanced+well+water&tag=alderprojects-20",
      productSpec: "Comprehensive panel including pesticides, herbicides, VOCs, full metals panel. Worth it for new property purchase or known contamination concerns. Overkill for routine annual testing."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "measurement_tool",
        "safety_item"
      ],
      functions: [
        "water_test_kit"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_recent_water_test",
      tier: "premium"
    },
    citations: [
      "Vermont Department of Health well water testing guidance",
      "Tap Score by SimpleLab product documentation",
      "EPA private well water testing recommendations"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_water_test_kit",
      tier: "premium"
    }
  },
  {
    universeId: "opening_leak_check__pressure_gauge_dye_tablets_paper_towels_kit",
    rank: 100,
    variant: {
      productName: "Pressure gauge + dye tablets + paper towels kit",
      priceLow: 18,
      priceHigh: 30,
      affiliateUrl: "https://www.amazon.com/s?k=water+pressure+gauge+toilet+dye+leak+detection&tag=alderprojects-20",
      productSpec: "Hose-bib pressure gauge ($10) + toilet dye tablets ($6) + paper towels for visual inspection. Manual leak detection in 30 minutes covering toilets, supply pressure, visible-leak inspection of all fixtures."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "measurement_tool",
        "tool"
      ],
      functions: [
        "pressure_gauge",
        "leak_detector"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_leak_detector_installed",
      tier: "sweet_spot"
    },
    citations: [
      "EPA WaterSense leak detection guide",
      "Toilet dye tablet test methodology"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_leak_check",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "generic_10_sediment_filter_5_micron_single",
    rank: 100,
    variant: {
      productName: "Generic 10\" sediment filter (5-micron, single)",
      priceLow: 6,
      priceHigh: 12,
      affiliateUrl: "https://www.amazon.com/s?k=10+inch+sediment+filter+5+micron&tag=alderprojects-20",
      productSpec: "Standard 10-inch housing filter, 5-micron sediment. Covers most basic whole-house sediment filtration. Replace every 3-6 months in active use."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material"
      ],
      functions: [
        "filter_replacement"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_no_filter_system",
      tier: "budget"
    },
    citations: [
      "Pentek product documentation",
      "EPA Drinking Water filter selection guidance"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_filter_replacement",
      tier: "budget"
    }
  },
  {
    universeId: "pentek_10_sediment_carbon_block_2_pack",
    rank: 100,
    variant: {
      productName: "Pentek 10\" sediment + carbon block 2-pack",
      priceLow: 28,
      priceHigh: 45,
      affiliateUrl: "https://www.amazon.com/s?k=pentek+sediment+carbon+block+10+inch&tag=alderprojects-20",
      productSpec: "Pentek-brand 10\" filters: 1 sediment (5-micron) + 1 carbon block. Sediment removes silt and rust; carbon removes chlorine, taste, odor. Covers most Vermont well systems running 6 months. Pentek is the industry standard, longer-lasting than generic."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material"
      ],
      functions: [
        "filter_replacement"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_no_filter_system",
      tier: "sweet_spot"
    },
    citations: [
      "Pentek product documentation",
      "EPA Drinking Water filter selection guidance"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_filter_replacement",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "big_blue_4_5_x_20_filter_housing_premium_media",
    rank: 100,
    variant: {
      productName: "Big Blue 4.5\" x 20\" filter housing + premium media",
      priceLow: 95,
      priceHigh: 160,
      affiliateUrl: "https://www.amazon.com/s?k=big+blue+water+filter+housing+4.5+20&tag=alderprojects-20",
      productSpec: "Big Blue housing for high-flow whole-house filtration. Required for homes with high water demand or known sediment loads. More expensive media but lasts much longer (12+ months)."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material"
      ],
      functions: [
        "filter_replacement"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_no_filter_system",
      tier: "premium"
    },
    citations: [
      "Pentek product documentation",
      "EPA Drinking Water filter selection guidance"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_filter_replacement",
      tier: "premium"
    }
  },
  {
    universeId: "opening_cleaning_kit__basic_cleaning_consumables_lysol_mr_clean_comet_sponges",
    rank: 100,
    variant: {
      productName: "Basic cleaning consumables (Lysol, Mr Clean, Comet, sponges)",
      priceLow: 25,
      priceHigh: 45,
      affiliateUrl: "https://www.amazon.com/s?k=cleaning+supplies+kit+all+purpose+sponges&tag=alderprojects-20",
      productSpec: "Multi-surface cleaner, scrubbing cleanser, sponges, paper towels. Covers a 2-bath, 1-kitchen, basic-living-room cleaning reset."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "cleaner",
        "consumable_material"
      ],
      functions: [
        "cleaning_reset_kit"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_full_cleaning_supplies",
      tier: "budget"
    },
    citations: [
      "CDC mold cleanup guidance",
      "Method, Mrs. Meyer's product documentation"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_cleaning_kit",
      tier: "budget"
    }
  },
  {
    universeId: "method_tier_cleaning_kit_microfiber_mrs_meyer_s_bleach",
    rank: 100,
    variant: {
      productName: "Method-tier cleaning kit + microfiber + Mrs. Meyer's + bleach",
      priceLow: 60,
      priceHigh: 95,
      affiliateUrl: "https://www.amazon.com/s?k=method+mrs+meyers+microfiber+cleaning+kit&tag=alderprojects-20",
      productSpec: "Better-quality cleaners that don't leave residue. Includes microfiber for streak-free surfaces. Mrs. Meyer's for non-toxic surfaces; bleach (Concrobium or 30% hydrogen peroxide) for mold/mildew on grout and bathrooms."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "cleaner",
        "consumable_material"
      ],
      functions: [
        "cleaning_reset_kit"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_full_cleaning_supplies",
      tier: "sweet_spot"
    },
    citations: [
      "CDC mold cleanup guidance",
      "Method, Mrs. Meyer's product documentation"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_cleaning_kit",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "generic_30_pint_dehumidifier",
    rank: 100,
    variant: {
      productName: "Generic 30-pint dehumidifier",
      priceLow: 130,
      priceHigh: 200,
      affiliateUrl: "https://www.amazon.com/s?k=30+pint+dehumidifier+basement&tag=alderprojects-20",
      productSpec: "30-pint capacity. Covers ~1,500 sq ft. Manual drain bucket or hose attachment. 3-5 year typical lifespan."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "appliance",
        "preventer"
      ],
      functions: [
        "dehumidifier_entry"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_dehumidifier",
      tier: "budget"
    },
    citations: [
      "hOmeLabs product documentation",
      "EPA basement moisture control guidance"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_dehumidifier",
      tier: "budget"
    }
  },
  {
    universeId: "homelabs_50_pint_dehumidifier_with_continuous_drain",
    rank: 100,
    variant: {
      productName: "hOmeLabs 50-pint dehumidifier with continuous drain",
      priceLow: 220,
      priceHigh: 320,
      affiliateUrl: "https://www.amazon.com/s?k=homelabs+50+pint+dehumidifier+continuous+drain&tag=alderprojects-20",
      productSpec: "50-pint capacity. Covers ~3,000 sq ft. Built-in pump for continuous drain over distance. Energy Star rated. Best for damp Vermont basements that need long-running coverage."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "appliance",
        "preventer"
      ],
      functions: [
        "dehumidifier_entry"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_dehumidifier",
      tier: "sweet_spot"
    },
    citations: [
      "hOmeLabs product documentation",
      "EPA basement moisture control guidance"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_dehumidifier",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "aprilaire_whole_house_dehumidifier_1850_1830",
    rank: 100,
    variant: {
      productName: "Aprilaire whole-house dehumidifier (1850, 1830)",
      priceLow: 1100,
      priceHigh: 1900,
      affiliateUrl: "https://www.amazon.com/s?k=aprilaire+whole+house+dehumidifier+1850&tag=alderprojects-20",
      productSpec: "Whole-house unit ducted into HVAC system. Requires professional install. Best for chronic moisture problems or radon mitigation pairing. ~$2,500 installed."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "appliance",
        "preventer"
      ],
      functions: [
        "dehumidifier_entry"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_dehumidifier",
      tier: "premium"
    },
    citations: [
      "hOmeLabs product documentation",
      "EPA basement moisture control guidance"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_dehumidifier",
      tier: "premium"
    }
  },
  {
    universeId: "sterilite_27_quart_latching_tote_label_maker_labels",
    rank: 100,
    variant: {
      productName: "Sterilite 27-quart latching tote + label maker labels",
      priceLow: 22,
      priceHigh: 35,
      affiliateUrl: "https://www.amazon.com/s?k=sterilite+latching+tote+27+quart+labels&tag=alderprojects-20",
      productSpec: "Latching plastic tote, ~14\"x18\"x10\". Holds opening kit consumables: water test, leak check, cleaning supplies, filter replacements, fresh batteries, light bulbs, dead-bulb spares. Label clearly on outside."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "organizer"
      ],
      functions: [
        "opening_tote"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_organized_supplies",
      tier: "sweet_spot"
    },
    citations: [
      "Sterilite product line documentation"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_tote",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "opening_consumables__aa_aaa_battery_24_pack_6_led_bulbs_lighter_duct_tape",
    rank: 100,
    variant: {
      productName: "AA/AAA battery 24-pack + 6 LED bulbs + lighter + duct tape",
      priceLow: 35,
      priceHigh: 55,
      affiliateUrl: "https://www.amazon.com/s?k=aa+aaa+battery+pack+led+bulbs+duct+tape+lighter&tag=alderprojects-20",
      productSpec: "24-pack mixed AA/AAA batteries (Amazon Basics or Energizer). 6 LED bulbs (60W equivalent, soft white). Long-stem lighter. Roll of duct tape. Covers smoke detectors, remote controls, flashlights, light fixtures."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material"
      ],
      functions: [
        "basic_consumables"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_consumables_stocked",
      tier: "sweet_spot"
    },
    citations: [
      "Smoke detector battery replacement standards"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_consumables",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "opening_shutoff_labels__adhesive_shutoff_valve_identification_labels",
    rank: 100,
    variant: {
      productName: "Adhesive shutoff valve identification labels",
      priceLow: 8,
      priceHigh: 15,
      affiliateUrl: "https://www.amazon.com/s?k=plumbing+shutoff+valve+labels+adhesive&tag=alderprojects-20",
      productSpec: "Same product as outdoor_freeze_prevention slot — universe entry reused via additive tag merge."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "document_aid",
        "safety_item"
      ],
      functions: [
        "shutoff_labels"
      ],
      seasons: [
        "spring",
        "opening_season",
        "pre_summer"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_shutoff_labels",
      tier: "sweet_spot"
    },
    citations: [
      "Cross-scope universe reuse pattern (v7.2.4 architecture)"
    ],
    migratedFrom: {
      scope: "outdoor_seasonal_opening",
      slotId: "opening_shutoff_labels",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "govee_water_leak_detector_5_pack_audible_only_no_wifi",
    rank: 100,
    variant: {
      productName: "Govee Water Leak Detector 5-Pack (audible only, no WiFi)",
      priceLow: 22,
      priceHigh: 32,
      amazonAsin: "B07QSFRSJX",
      affiliateUrl: "https://www.amazon.com/dp/B07QSFRSJX?tag=alderprojects-20",
      productSpec: "Audible-only 100dB alarm, no WiFi or remote alerts. Battery-powered. Useful only when someone is in the house to hear it."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "sensor"
      ],
      functions: [
        "leak_detector"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_leak_detection",
      tier: "budget"
    },
    citations: [
      "Govee H5054 + H5040 gateway product documentation",
      "YoLink LoRa product specs (1/4 mile open-air range)",
      "Insurance industry data on water damage as the most common non-weather homeowner claim"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_leak_sensor",
      tier: "budget"
    }
  },
  {
    universeId: "govee_wifi_water_leak_detector_3_pack_with_gateway_h5054",
    rank: 100,
    variant: {
      productName: "Govee WiFi Water Leak Detector 3-Pack with Gateway (H5054)",
      priceLow: 45,
      priceHigh: 65,
      amazonAsin: "B07J9HZ5VN",
      affiliateUrl: "https://www.amazon.com/dp/B07J9HZ5VN?tag=alderprojects-20",
      productSpec: "WiFi gateway + 3 sensors. App and email alerts within seconds of leak. 100dB local siren. Gateway requires 2.4GHz WiFi only (not 5GHz). 5-year battery on sensors. Place at water heater, washing machine, under sinks, near sump pump."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "sensor"
      ],
      functions: [
        "leak_detector"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_leak_detection",
      tier: "sweet_spot"
    },
    citations: [
      "Govee H5054 + H5040 gateway product documentation",
      "YoLink LoRa product specs (1/4 mile open-air range)",
      "Insurance industry data on water damage as the most common non-weather homeowner claim"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_leak_sensor",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "yolink_water_leak_starter_kit_hub_2_leak_sensor_4",
    rank: 100,
    variant: {
      productName: "YoLink Water Leak Starter Kit (Hub + 2 Leak Sensor 4)",
      priceLow: 80,
      priceHigh: 120,
      amazonAsin: "B0DWWXJ4MY",
      affiliateUrl: "https://www.amazon.com/dp/B0DWWXJ4MY?tag=alderprojects-20",
      productSpec: "LoRa long-range (1/4 mile open air). Works where WiFi is spotty. Hub options include cellular (no internet required). 105dB built-in siren on each sensor. Freeze warning in addition to leak. SMS, email, app alerts. Compatible with Alexa, IFTTT, Home Assistant. Best for properties with marginal WiFi or large outbuildings."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "sensor"
      ],
      functions: [
        "leak_detector"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_leak_detection",
      tier: "premium"
    },
    citations: [
      "Govee H5054 + H5040 gateway product documentation",
      "YoLink LoRa product specs (1/4 mile open-air range)",
      "Insurance industry data on water damage as the most common non-weather homeowner claim"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_leak_sensor",
      tier: "premium"
    }
  },
  {
    universeId: "frost_king_1_2_copper_foam_pipe_insulation_6_ft_single",
    rank: 100,
    variant: {
      productName: "Frost King 1/2\" copper foam pipe insulation, 6 ft (single)",
      priceLow: 4,
      priceHigh: 7,
      amazonAsin: "B07XLQ5TPG",
      affiliateUrl: "https://www.amazon.com/dp/B07XLQ5TPG?tag=alderprojects-20",
      productSpec: "Polyethylene foam, pre-slit, 6 ft length. For 1/2\" copper pipe (which is 5/8\" OD). Single tube. Slip on, no taping needed for short runs."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "preventer"
      ],
      functions: [
        "pipe_insulation"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_pipe_insulation",
      tier: "budget"
    },
    citations: [
      "Frost King Amazon listing (B000BQLSBI, B07XLQ5TPG, B003A0YX82)",
      "EPA pipe insulation guidance for cold-climate residential",
      "NFPA freeze prevention recommendations"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_pipe_insulation",
      tier: "budget"
    }
  },
  {
    universeId: "frost_king_3_4_copper_foam_pipe_insulation_3_ft_4_pack",
    rank: 100,
    variant: {
      productName: "Frost King 3/4\" copper foam pipe insulation, 3 ft 4-pack",
      priceLow: 12,
      priceHigh: 18,
      amazonAsin: "B000BQLSBI",
      affiliateUrl: "https://www.amazon.com/dp/B000BQLSBI?tag=alderprojects-20",
      productSpec: "Polyethylene foam, pre-slit, 3/8\" wall thickness, 3 ft length × 4 tubes. For 3/4\" copper or 1/2\" iron pipe. Most common size for Vermont residential supply lines. Black color."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "preventer"
      ],
      functions: [
        "pipe_insulation"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_pipe_insulation",
      tier: "sweet_spot"
    },
    citations: [
      "Frost King Amazon listing (B000BQLSBI, B07XLQ5TPG, B003A0YX82)",
      "EPA pipe insulation guidance for cold-climate residential",
      "NFPA freeze prevention recommendations"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_pipe_insulation",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "frost_king_1_rubber_tubular_pipe_insulation_6_ft",
    rank: 100,
    variant: {
      productName: "Frost King 1\" rubber tubular pipe insulation, 6 ft",
      priceLow: 14,
      priceHigh: 22,
      amazonAsin: "B003A0YX82",
      affiliateUrl: "https://www.amazon.com/dp/B003A0YX82?tag=alderprojects-20",
      productSpec: "Closed-cell rubber, 1/2\" wall thickness, 6 ft length. For 1\" pipe ID. Higher R-value than polyethylene foam. Use on pipes in unconditioned spaces or where temperature drops below 20°F. More flexible at cold temperatures."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "preventer"
      ],
      functions: [
        "pipe_insulation"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_pipe_insulation",
      tier: "premium"
    },
    citations: [
      "Frost King Amazon listing (B000BQLSBI, B07XLQ5TPG, B003A0YX82)",
      "EPA pipe insulation guidance for cold-climate residential",
      "NFPA freeze prevention recommendations"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_pipe_insulation",
      tier: "premium"
    }
  },
  {
    universeId: "generic_constant_wattage_heat_cable_6_ft",
    rank: 100,
    variant: {
      productName: "Generic constant-wattage heat cable, 6 ft",
      priceLow: 18,
      priceHigh: 30,
      affiliateUrl: "https://www.amazon.com/s?k=heat+cable+6ft+constant+wattage&tag=alderprojects-20",
      productSpec: "Constant-wattage cable. Requires separate thermostat outlet to avoid running constantly. NOT recommended without a thermostat — fire risk."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "preventer"
      ],
      functions: [
        "heat_tape"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_heat_tape",
      tier: "budget"
    },
    citations: [
      "NFPA fire risk documentation on heat tape",
      "Frost King product line documentation",
      "Pentair / Raychem self-regulating heat cable specifications"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_heat_tape",
      tier: "budget"
    }
  },
  {
    universeId: "frost_king_6_ft_self_regulating_heat_cable_with_built_in_thermos",
    rank: 100,
    variant: {
      productName: "Frost King 6 ft self-regulating heat cable with built-in thermostat",
      priceLow: 32,
      priceHigh: 48,
      affiliateUrl: "https://www.amazon.com/s?k=frost+king+self+regulating+heat+cable+thermostat+6ft&tag=alderprojects-20",
      productSpec: "Self-regulating cable adjusts wattage based on pipe temperature. Built-in thermostat turns on at 38°F, off at 50°F. UL listed. Plug-in (no hardwiring required). 6 ft covers a single run; longer cables available in 12, 24, and 50 ft."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "preventer"
      ],
      functions: [
        "heat_tape"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_heat_tape",
      tier: "sweet_spot"
    },
    citations: [
      "NFPA fire risk documentation on heat tape",
      "Frost King product line documentation",
      "Pentair / Raychem self-regulating heat cable specifications"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_heat_tape",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "easyheat_or_pentair_self_regulating_heat_cable_kit_with_insulati",
    rank: 100,
    variant: {
      productName: "EasyHeat or Pentair self-regulating heat cable kit with insulation",
      priceLow: 75,
      priceHigh: 130,
      affiliateUrl: "https://www.amazon.com/s?k=easyheat+self+regulating+pipe+heating+cable+kit&tag=alderprojects-20",
      productSpec: "Pro-grade self-regulating cable + matching pipe insulation sleeve. Higher watt density. Used by plumbers for permanent installations. Often hardwired."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "preventer"
      ],
      functions: [
        "heat_tape"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_heat_tape",
      tier: "premium"
    },
    citations: [
      "NFPA fire risk documentation on heat tape",
      "Frost King product line documentation",
      "Pentair / Raychem self-regulating heat cable specifications"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_heat_tape",
      tier: "premium"
    }
  },
  {
    universeId: "honeywell_home_programmable_thermostat_non_smart",
    rank: 100,
    variant: {
      productName: "Honeywell Home Programmable Thermostat (non-smart)",
      priceLow: 30,
      priceHigh: 50,
      affiliateUrl: "https://www.amazon.com/s?k=honeywell+home+programmable+thermostat&tag=alderprojects-20",
      productSpec: "7-day programmable. No WiFi, no remote control, no temperature alerts. Useful for setting a vacation hold, but you cannot check temp remotely or adjust if heat fails."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "monitor",
        "preventer"
      ],
      functions: [
        "smart_thermostat"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_smart_thermostat",
      tier: "budget"
    },
    citations: [
      "Honeywell Home T9 product documentation",
      "Ecobee Premium product documentation",
      "Vermont residential heating systems compatibility data"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_smart_thermostat",
      tier: "budget"
    }
  },
  {
    universeId: "honeywell_home_t9_smart_thermostat_with_wifi",
    rank: 100,
    variant: {
      productName: "Honeywell Home T9 Smart Thermostat with WiFi",
      priceLow: 130,
      priceHigh: 200,
      affiliateUrl: "https://www.amazon.com/s?k=honeywell+home+t9+smart+thermostat&tag=alderprojects-20",
      productSpec: "WiFi connected, app-controlled, geofencing. Works with most C-wire-equipped systems. Sends alerts if home temperature drops below set threshold. Compatible with most 24V residential HVAC systems including heat pumps, gas furnaces, and many oil/propane systems. Verify compatibility with your system before buying."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "monitor",
        "preventer"
      ],
      functions: [
        "smart_thermostat"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_smart_thermostat",
      tier: "sweet_spot"
    },
    citations: [
      "Honeywell Home T9 product documentation",
      "Ecobee Premium product documentation",
      "Vermont residential heating systems compatibility data"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_smart_thermostat",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "ecobee_smart_thermostat_premium_with_sensors",
    rank: 100,
    variant: {
      productName: "Ecobee Smart Thermostat Premium with sensors",
      priceLow: 230,
      priceHigh: 290,
      affiliateUrl: "https://www.amazon.com/s?k=ecobee+smart+thermostat+premium&tag=alderprojects-20",
      productSpec: "WiFi, voice control, room sensors included. Air quality monitoring, smoke detection alerts. Best for multi-zone homes or properties wanting whole-house intelligence beyond freeze prevention."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "monitor",
        "preventer"
      ],
      functions: [
        "smart_thermostat"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_smart_thermostat",
      tier: "premium"
    },
    citations: [
      "Honeywell Home T9 product documentation",
      "Ecobee Premium product documentation",
      "Vermont residential heating systems compatibility data"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_smart_thermostat",
      tier: "premium"
    }
  },
  {
    universeId: "foam_hose_bib_cover_single",
    rank: 100,
    variant: {
      productName: "Foam hose bib cover (single)",
      priceLow: 3,
      priceHigh: 6,
      affiliateUrl: "https://www.amazon.com/s?k=foam+hose+bib+cover+outdoor+faucet&tag=alderprojects-20",
      productSpec: "Closed-cell foam, slip-on. Single bib. ~$3 each. Useful for moderate climates or short cold snaps. Less effective below 15°F."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "accessory",
        "preventer"
      ],
      functions: [
        "hose_bib_cover"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_hose_bib_covers",
      tier: "budget"
    },
    citations: [
      "Frost King hose bib cover documentation",
      "Vermont residential plumbing freeze data"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_hose_bib_cover",
      tier: "budget"
    }
  },
  {
    universeId: "frost_king_insulated_thermal_hose_bib_cover_2_pack",
    rank: 100,
    variant: {
      productName: "Frost King insulated thermal hose bib cover (2-pack)",
      priceLow: 10,
      priceHigh: 18,
      affiliateUrl: "https://www.amazon.com/s?k=frost+king+thermal+hose+bib+cover&tag=alderprojects-20",
      productSpec: "Hard plastic shell with foam interior. Strap or stake mount. Effective to ~10°F. 2-pack covers most homes."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "accessory",
        "preventer"
      ],
      functions: [
        "hose_bib_cover"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_hose_bib_covers",
      tier: "sweet_spot"
    },
    citations: [
      "Frost King hose bib cover documentation",
      "Vermont residential plumbing freeze data"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_hose_bib_cover",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "freeze_hose_bib_cover__frost_proof_outdoor_faucet_replacement_sillcock_12",
    rank: 100,
    variant: {
      productName: "Frost-proof outdoor faucet replacement (sillcock, 12\")",
      priceLow: 35,
      priceHigh: 65,
      affiliateUrl: "https://www.amazon.com/s?k=frost+proof+outdoor+faucet+sillcock+12+inch&tag=alderprojects-20",
      productSpec: "Permanent solution: replaces the faucet entirely with a frost-proof sillcock that has the shutoff valve inside the heated wall. Requires plumbing skill or pro install. Permanent fix vs. seasonal cover."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "accessory",
        "preventer"
      ],
      functions: [
        "hose_bib_cover"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_hose_bib_covers",
      tier: "premium"
    },
    citations: [
      "Frost King hose bib cover documentation",
      "Vermont residential plumbing freeze data"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_hose_bib_cover",
      tier: "premium"
    }
  },
  {
    universeId: "generic_foam_weatherstripping_tape_17_ft",
    rank: 100,
    variant: {
      productName: "Generic foam weatherstripping tape, 17 ft",
      priceLow: 5,
      priceHigh: 10,
      affiliateUrl: "https://www.amazon.com/s?k=foam+weatherstripping+tape+door+window&tag=alderprojects-20",
      productSpec: "Foam compression tape with adhesive backing. 17-30 ft roll. Compresses under door/window. Effective for 1-2 seasons before degradation."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "preventer"
      ],
      functions: [
        "draft_sealer"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_weatherstripping_recent",
      tier: "budget"
    },
    citations: [
      "M-D Building Products and Frost King weatherstripping product lines",
      "DOE residential weatherstripping guidance"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_draft_sealing",
      tier: "budget"
    }
  },
  {
    universeId: "frost_king_v_strip_door_sweep_draft_stoppers_kit",
    rank: 100,
    variant: {
      productName: "Frost King V-strip + door sweep + draft stoppers kit",
      priceLow: 25,
      priceHigh: 40,
      affiliateUrl: "https://www.amazon.com/s?k=frost+king+v+strip+door+sweep+draft+stopper&tag=alderprojects-20",
      productSpec: "V-shaped vinyl weatherstripping for door jambs (longer-lasting than foam). Door sweep for under-door gap. Foam draft stoppers for window sills. Covers a typical 3-door, 8-window Vermont home."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "preventer"
      ],
      functions: [
        "draft_sealer"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_weatherstripping_recent",
      tier: "sweet_spot"
    },
    citations: [
      "M-D Building Products and Frost King weatherstripping product lines",
      "DOE residential weatherstripping guidance"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_draft_sealing",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "freeze_draft_sealing__door_silicone_bulb_weatherstripping_storm_windows_assessment",
    rank: 100,
    variant: {
      productName: "Door silicone bulb weatherstripping + storm windows assessment",
      priceLow: 80,
      priceHigh: 150,
      affiliateUrl: "https://www.amazon.com/s?k=silicone+bulb+door+weatherstripping&tag=alderprojects-20",
      productSpec: "Silicone bulb seal for doors (premium durability). For windows, the premium answer is replacement or storm windows, not weatherstripping — at this point you should be looking at the next renovation."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "consumable_material",
        "preventer"
      ],
      functions: [
        "draft_sealer"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_weatherstripping_recent",
      tier: "premium"
    },
    citations: [
      "M-D Building Products and Frost King weatherstripping product lines",
      "DOE residential weatherstripping guidance"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_draft_sealing",
      tier: "premium"
    }
  },
  {
    universeId: "freeze_shutoff_labels__adhesive_shutoff_valve_identification_labels_assortment",
    rank: 100,
    variant: {
      productName: "Adhesive shutoff valve identification labels (assortment)",
      priceLow: 8,
      priceHigh: 15,
      affiliateUrl: "https://www.amazon.com/s?k=plumbing+shutoff+valve+labels+adhesive&tag=alderprojects-20",
      productSpec: "Pre-printed adhesive labels for water main, hot water, cold water, gas, individual fixture shutoffs. Weather-resistant. ~30 labels per pack."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "document_aid",
        "safety_item"
      ],
      functions: [
        "shutoff_labels"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_shutoff_labels",
      tier: "sweet_spot"
    },
    citations: [
      "NFPA fire and safety labeling standards",
      "Insurance industry water damage minimization guidance"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_shutoff_labels",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "moen_flo_smart_water_shutoff_3_4",
    rank: 100,
    variant: {
      productName: "Moen Flo Smart Water Shutoff (3/4\")",
      priceLow: 380,
      priceHigh: 530,
      affiliateUrl: "https://www.amazon.com/s?k=moen+flo+smart+water+shutoff+3+4&tag=alderprojects-20",
      productSpec: "WiFi-connected automatic shutoff valve installed at the main supply line. Detects abnormal flow patterns and shuts off water automatically. Manual control via app. Requires professional plumber install (1-3 hours, ~$200-400 labor)."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "hardware"
      ],
      functions: [
        "smart_shutoff_valve"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_smart_shutoff",
      tier: "sweet_spot"
    },
    citations: [
      "Moen Flo product documentation",
      "YoLink smart water shutoff specifications",
      "Insurance industry data on auto-shutoff premium discounts"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_smart_shutoff_valve",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "yolink_smart_water_shutoff_valve_with_lora_hub",
    rank: 100,
    variant: {
      productName: "YoLink Smart Water Shutoff Valve with LoRa hub",
      priceLow: 250,
      priceHigh: 400,
      affiliateUrl: "https://www.amazon.com/s?k=yolink+smart+water+shutoff+valve&tag=alderprojects-20",
      productSpec: "LoRa-based shutoff valve. Works without WiFi via cellular hub option. Pairs with YoLink leak sensors for automatic shutoff on leak detection. Better for properties with marginal WiFi."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "hardware"
      ],
      functions: [
        "smart_shutoff_valve"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_smart_shutoff",
      tier: "premium"
    },
    citations: [
      "Moen Flo product documentation",
      "YoLink smart water shutoff specifications",
      "Insurance industry data on auto-shutoff premium discounts"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_smart_shutoff_valve",
      tier: "premium"
    }
  },
  {
    universeId: "marcell_or_temp_stick_cellular_temperature_monitor",
    rank: 100,
    variant: {
      productName: "Marcell or Temp Stick cellular temperature monitor",
      priceLow: 130,
      priceHigh: 220,
      affiliateUrl: "https://www.amazon.com/s?k=marcell+cellular+temperature+monitor&tag=alderprojects-20",
      productSpec: "Cellular-connected temperature monitor with built-in SIM. No WiFi required. Sends alert when temperature drops below threshold. Subscription required for cellular service ($5-12/month)."
    },
    tags: {
      topics: [
        "outdoor"
      ],
      roles: [
        "sensor",
        "monitor"
      ],
      functions: [
        "pipe_freeze_alarm"
      ],
      seasons: [
        "fall",
        "pre_winter",
        "closing_season"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_freeze_alarm",
      tier: "sweet_spot"
    },
    citations: [
      "Marcell and Temp Stick product documentation",
      "Cellular monitoring service comparisons"
    ],
    migratedFrom: {
      scope: "outdoor_freeze_prevention",
      slotId: "freeze_alarm_non_wifi",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "moisture_hygrometer__acurite_digital_hygrometer_single",
    rank: 100,
    variant: {
      productName: "AcuRite digital hygrometer (single)",
      priceLow: 12,
      priceHigh: 22,
      affiliateUrl: "https://www.amazon.com/s?k=acurite+digital+hygrometer+thermometer&tag=alderprojects-20",
      productSpec: "Battery-powered digital hygrometer. Reads temperature + humidity. ~$15. AcuRite is the consumer standard. Local readout only — no remote alerts."
    },
    tags: {
      topics: [
        "home_repair"
      ],
      roles: [
        "sensor",
        "monitor",
        "measurement_tool"
      ],
      functions: [
        "hygrometer"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_hygrometer",
      tier: "budget"
    },
    citations: [
      "Govee WiFi Hygrometer documentation",
      "AcuRite product line",
      "SensorPush HTP.xw specifications",
      "EPA mold growth thresholds"
    ],
    migratedFrom: {
      scope: "home_moisture_control",
      slotId: "moisture_hygrometer",
      tier: "budget"
    }
  },
  {
    universeId: "govee_wifi_hygrometer_3_pack_with_app_alerts",
    rank: 100,
    variant: {
      productName: "Govee WiFi Hygrometer 3-pack with app alerts",
      priceLow: 35,
      priceHigh: 55,
      affiliateUrl: "https://www.amazon.com/s?k=govee+wifi+hygrometer+3+pack&tag=alderprojects-20",
      productSpec: "3 WiFi-connected hygrometers. App alerts when humidity exceeds threshold. Historical graphs over weeks/months. Place in basement, bedroom, kitchen for whole-house picture. Govee Home app."
    },
    tags: {
      topics: [
        "home_repair"
      ],
      roles: [
        "sensor",
        "monitor",
        "measurement_tool"
      ],
      functions: [
        "hygrometer"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_hygrometer",
      tier: "sweet_spot"
    },
    citations: [
      "Govee WiFi Hygrometer documentation",
      "AcuRite product line",
      "SensorPush HTP.xw specifications",
      "EPA mold growth thresholds"
    ],
    migratedFrom: {
      scope: "home_moisture_control",
      slotId: "moisture_hygrometer",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "moisture_hygrometer__sensorpush_htp_xw_outdoor_rated_wireless_hygrometer_kit",
    rank: 100,
    variant: {
      productName: "SensorPush HTP.xw outdoor-rated wireless hygrometer kit",
      priceLow: 145,
      priceHigh: 220,
      affiliateUrl: "https://www.amazon.com/s?k=sensorpush+wireless+hygrometer+gateway&tag=alderprojects-20",
      productSpec: "Pro-grade hygrometers. SensorPush gateway for remote access. Long-range (~100 ft). Used by humidor and instrument-storage owners for precise humidity tracking. Better accuracy than Govee."
    },
    tags: {
      topics: [
        "home_repair"
      ],
      roles: [
        "sensor",
        "monitor",
        "measurement_tool"
      ],
      functions: [
        "hygrometer"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_hygrometer",
      tier: "premium"
    },
    citations: [
      "Govee WiFi Hygrometer documentation",
      "AcuRite product line",
      "SensorPush HTP.xw specifications",
      "EPA mold growth thresholds"
    ],
    migratedFrom: {
      scope: "home_moisture_control",
      slotId: "moisture_hygrometer",
      tier: "premium"
    }
  },
  {
    universeId: "moisture_mold_test__my_mold_detective_diy_mold_test_kit",
    rank: 100,
    variant: {
      productName: "My Mold Detective DIY mold test kit",
      priceLow: 35,
      priceHigh: 55,
      affiliateUrl: "https://www.amazon.com/s?k=my+mold+detective+diy+test+kit&tag=alderprojects-20",
      productSpec: "DIY surface and air sampling. Mail-in lab analysis. Identifies common mold genera. Useful as a screening tool. NOT a substitute for professional mold inspection if you have visible mold."
    },
    tags: {
      topics: [
        "home_repair"
      ],
      roles: [
        "measurement_tool",
        "safety_item"
      ],
      functions: [
        "mold_test_kit"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_recent_mold_test",
      tier: "sweet_spot"
    },
    citations: [
      "EPA mold remediation guidance",
      "My Mold Detective product documentation"
    ],
    migratedFrom: {
      scope: "home_moisture_control",
      slotId: "moisture_mold_test",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "moisture_odor_absorber__moso_natural_bamboo_charcoal_air_purifying_bags_4_pack_200g_each",
    rank: 100,
    variant: {
      productName: "Moso Natural Bamboo Charcoal Air Purifying Bags (4-pack, 200g each)",
      priceLow: 18,
      priceHigh: 32,
      affiliateUrl: "https://www.amazon.com/s?k=moso+natural+bamboo+charcoal+air+purifying+bags+4+pack&tag=alderprojects-20",
      productSpec: "Activated bamboo charcoal in natural fabric bags. Adsorbs odors and excess moisture. 4 bags × 200g. Reactivate by sun-drying monthly. ~$25 for 2-year supply. Wirecutter-tier pick."
    },
    tags: {
      topics: [
        "home_repair"
      ],
      roles: [
        "consumable_material",
        "cleaner"
      ],
      functions: [
        "odor_absorber"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_odor_absorber",
      tier: "sweet_spot"
    },
    citations: [
      "Moso bamboo charcoal product documentation",
      "Wirecutter air purifier and odor absorber testing"
    ],
    migratedFrom: {
      scope: "home_moisture_control",
      slotId: "moisture_odor_absorber",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "moisture_air_mover__lasko_3300_wind_machine_3_speed_air_circulator",
    rank: 100,
    variant: {
      productName: "Lasko 3300 Wind Machine 3-speed air circulator",
      priceLow: 55,
      priceHigh: 85,
      affiliateUrl: "https://www.amazon.com/s?k=lasko+3300+wind+machine+air+circulator&tag=alderprojects-20",
      productSpec: "20\" diameter pivoting fan with 3 speeds. Heavy-duty plastic frame. Used for drying spaces and rapid air circulation in basements. Lasko is the consumer standard."
    },
    tags: {
      topics: [
        "home_repair"
      ],
      roles: [
        "appliance"
      ],
      functions: [
        "air_mover"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_air_mover",
      tier: "sweet_spot"
    },
    citations: [
      "Lasko 3300 product documentation"
    ],
    migratedFrom: {
      scope: "home_moisture_control",
      slotId: "moisture_air_mover",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_drill_driver__black_decker_20v_max_cordless_drill_kit_with_battery_charger",
    rank: 100,
    variant: {
      productName: "Black+Decker 20V MAX cordless drill kit (with battery + charger)",
      priceLow: 55,
      priceHigh: 85,
      affiliateUrl: "https://www.amazon.com/s?k=black+decker+20v+cordless+drill+kit&tag=alderprojects-20",
      productSpec: "20V MAX lithium-ion. 1 battery + charger. ~$65. Adequate torque for residential use; struggles on hardwood and large fasteners. 2-3 year typical battery life with regular use."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool",
        "appliance"
      ],
      functions: [
        "drill_driver"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_cordless_drill",
      tier: "budget"
    },
    citations: [
      "Wirecutter best cordless drill review",
      "DeWalt DCD777 product documentation",
      "Brushless vs brushed motor lifespan data"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_drill_driver",
      tier: "budget"
    }
  },
  {
    universeId: "owner_drill_driver__dewalt_dcd777_20v_max_brushless_drill_kit_2_batteries_charger",
    rank: 100,
    variant: {
      productName: "DeWalt DCD777 20V MAX brushless drill kit (2 batteries + charger)",
      priceLow: 145,
      priceHigh: 195,
      affiliateUrl: "https://www.amazon.com/s?k=dewalt+dcd777+20v+max+brushless+drill+kit&tag=alderprojects-20",
      productSpec: "Brushless motor (longer life than brushed). 20V MAX. 2 batteries + fast charger + bag. ~$160. The DeWalt DCD777 is the verified Wirecutter pick for homeowner use. Brushless = 50% longer motor life and runtime than brushed equivalents."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool",
        "appliance"
      ],
      functions: [
        "drill_driver"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_cordless_drill",
      tier: "sweet_spot"
    },
    citations: [
      "Wirecutter best cordless drill review",
      "DeWalt DCD777 product documentation",
      "Brushless vs brushed motor lifespan data"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_drill_driver",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_drill_driver__milwaukee_m18_fuel_drill_impact_driver_combo_kit",
    rank: 100,
    variant: {
      productName: "Milwaukee M18 FUEL drill + impact driver combo kit",
      priceLow: 280,
      priceHigh: 420,
      affiliateUrl: "https://www.amazon.com/s?k=milwaukee+m18+fuel+drill+impact+driver+combo&tag=alderprojects-20",
      productSpec: "Pro-grade. Drill + impact driver in one kit. Significantly higher torque than DeWalt at homeowner tier. Worth it ONLY if you have ongoing serious projects (deck building, large carpentry)."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool",
        "appliance"
      ],
      functions: [
        "drill_driver"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_cordless_drill",
      tier: "premium"
    },
    citations: [
      "Wirecutter best cordless drill review",
      "DeWalt DCD777 product documentation",
      "Brushless vs brushed motor lifespan data"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_drill_driver",
      tier: "premium"
    }
  },
  {
    universeId: "generic_100_piece_drill_bit_set",
    rank: 100,
    variant: {
      productName: "Generic 100-piece drill bit set",
      priceLow: 18,
      priceHigh: 32,
      affiliateUrl: "https://www.amazon.com/s?k=100+piece+drill+bit+set+homeowner&tag=alderprojects-20",
      productSpec: "Mixed steel drill bits + driver bits in plastic case. 100+ pieces. Most are filler (rarely-needed sizes). The 8-12 you actually use are mid-quality; rest is decoration."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool",
        "consumable_material"
      ],
      functions: [
        "drill_bit_set"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_drill_bits",
      tier: "budget"
    },
    citations: [
      "DeWalt titanium drill bit specifications",
      "Wera driver bit reviews"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_drill_bits",
      tier: "budget"
    }
  },
  {
    universeId: "owner_drill_bits__dewalt_20_piece_titanium_drill_bit_set_30_piece_driver_bit_set",
    rank: 100,
    variant: {
      productName: "DeWalt 20-piece titanium drill bit set + 30-piece driver bit set",
      priceLow: 35,
      priceHigh: 60,
      affiliateUrl: "https://www.amazon.com/s?k=dewalt+titanium+drill+bit+set+driver+bit+set&tag=alderprojects-20",
      productSpec: "Titanium-coated drill bits (longer life than uncoated). Pyramid-style driver bit set (Phillips, square, Torx). Pro-grade quality on the bits you actually use."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool",
        "consumable_material"
      ],
      functions: [
        "drill_bit_set"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_drill_bits",
      tier: "sweet_spot"
    },
    citations: [
      "DeWalt titanium drill bit specifications",
      "Wera driver bit reviews"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_drill_bits",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_drill_bits__dewalt_cobalt_drill_bit_set_wera_driver_bit_kit",
    rank: 100,
    variant: {
      productName: "DeWalt cobalt drill bit set + Wera driver bit kit",
      priceLow: 90,
      priceHigh: 150,
      affiliateUrl: "https://www.amazon.com/s?k=dewalt+cobalt+drill+bit+set+wera+driver+bits&tag=alderprojects-20",
      productSpec: "Cobalt steel drill bits (cuts hardened materials, longer life). Wera driver bits — German-made, the cabinet-shop standard. Premium."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool",
        "consumable_material"
      ],
      functions: [
        "drill_bit_set"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_drill_bits",
      tier: "premium"
    },
    citations: [
      "DeWalt titanium drill bit specifications",
      "Wera driver bit reviews"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_drill_bits",
      tier: "premium"
    }
  },
  {
    universeId: "owner_level__stanley_fatmax_24_magnetic_level",
    rank: 100,
    variant: {
      productName: "Stanley FatMax 24\" magnetic level",
      priceLow: 25,
      priceHigh: 38,
      affiliateUrl: "https://www.amazon.com/s?k=stanley+fatmax+24+inch+magnetic+level&tag=alderprojects-20",
      productSpec: "24-inch aluminum body. 3 vials (horizontal, vertical, 45°). Strong magnetic edge for steel surfaces. Stanley FatMax is the standard residential level. ~$30. Lifetime accuracy if not dropped on concrete."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "measurement_tool",
        "tool"
      ],
      functions: [
        "level"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_level",
      tier: "sweet_spot"
    },
    citations: [
      "Stanley FatMax product line documentation",
      "Carpenter level calibration testing"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_level",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_stud_finder__franklin_sensors_prosensor_710_stud_finder",
    rank: 100,
    variant: {
      productName: "Franklin Sensors ProSensor 710 stud finder",
      priceLow: 45,
      priceHigh: 65,
      affiliateUrl: "https://www.amazon.com/s?k=franklin+sensors+prosensor+710+stud+finder&tag=alderprojects-20",
      productSpec: "Multi-sensor (no calibration required). Detects studs through standard drywall. Wirecutter pick for residential use. ~$50. Battery-powered (1 9V battery)."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "sensor",
        "measurement_tool"
      ],
      functions: [
        "stud_finder"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_stud_finder",
      tier: "sweet_spot"
    },
    citations: [
      "Wirecutter best stud finder review",
      "Franklin Sensors product documentation"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_stud_finder",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_tape_measure__stanley_fatmax_25_foot_tape_measure",
    rank: 100,
    variant: {
      productName: "Stanley FatMax 25-foot tape measure",
      priceLow: 18,
      priceHigh: 28,
      affiliateUrl: "https://www.amazon.com/s?k=stanley+fatmax+25+foot+tape+measure&tag=alderprojects-20",
      productSpec: "25-foot length. 1.25\" wide blade with 11-foot standout (extends 11 feet without bending). Belt clip, magnetic tip, BladeArmor coating. Stanley FatMax is the residential standard."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "measurement_tool",
        "tool"
      ],
      functions: [
        "tape_measure"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_tape_measure",
      tier: "sweet_spot"
    },
    citations: [
      "Stanley FatMax tape measure documentation"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_tape_measure",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_utility_knife__milwaukee_fastback_folding_utility_knife_100_pack_blades",
    rank: 100,
    variant: {
      productName: "Milwaukee FastBack folding utility knife + 100-pack blades",
      priceLow: 28,
      priceHigh: 42,
      affiliateUrl: "https://www.amazon.com/s?k=milwaukee+fastback+utility+knife+100+pack+blades&tag=alderprojects-20",
      productSpec: "Folding utility knife with quick-blade-change. Pocket-friendly. 100-pack of replacement blades. Milwaukee is the cabinet-shop standard. ~$15 knife + ~$20 blades."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool"
      ],
      functions: [
        "utility_knife"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_utility_knife",
      tier: "sweet_spot"
    },
    citations: [
      "Milwaukee FastBack product documentation"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_utility_knife",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_caulk_gun__newborn_brothers_250_steel_skeleton_caulk_gun",
    rank: 100,
    variant: {
      productName: "Newborn Brothers 250 steel skeleton caulk gun",
      priceLow: 18,
      priceHigh: 28,
      affiliateUrl: "https://www.amazon.com/s?k=newborn+brothers+250+caulk+gun&tag=alderprojects-20",
      productSpec: "Steel skeleton frame, 10:1 thrust ratio. Drip-free design. Pro-grade construction. ~$22. Used by professional caulkers and tile setters."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "consumable_material"
      ],
      functions: [
        "caulk_gun"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_caulk_gun",
      tier: "sweet_spot"
    },
    citations: [
      "Newborn Brothers product line documentation"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_caulk_gun",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_multitool__dewalt_dcs354_20v_max_brushless_oscillating_multi_tool_bare_tool",
    rank: 100,
    variant: {
      productName: "DeWalt DCS354 20V MAX brushless oscillating multi-tool (bare tool)",
      priceLow: 130,
      priceHigh: 180,
      affiliateUrl: "https://www.amazon.com/s?k=dewalt+dcs354+20v+max+oscillating+multi+tool&tag=alderprojects-20",
      productSpec: "Brushless oscillating multi-tool. Cuts, sands, scrapes, plunges. Universal blade interface. Bare tool (uses your existing DeWalt 20V battery). ~$150."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "tool",
        "appliance"
      ],
      functions: [
        "oscillating_multitool"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_oscillating_multitool",
      tier: "sweet_spot"
    },
    citations: [
      "DeWalt DCS354 product documentation"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_multitool",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_fastener_kit__drywall_anchor_kit_screw_assortment_deck_wood_sheetmetal_screws",
    rank: 100,
    variant: {
      productName: "Drywall anchor kit + screw assortment (deck/wood/sheetmetal screws)",
      priceLow: 35,
      priceHigh: 55,
      affiliateUrl: "https://www.amazon.com/s?k=drywall+anchor+kit+screw+assortment+homeowner&tag=alderprojects-20",
      productSpec: "Plastic toggle anchors (50+), self-drilling drywall anchors (25+), wood screws (#6, #8 in various lengths), exterior deck screws, sheet metal screws. ~$40 for 200+ pieces. Covers residential mounting and small repair needs."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "hardware",
        "consumable_material"
      ],
      functions: [
        "fastener_kit"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_fastener_kit",
      tier: "sweet_spot"
    },
    citations: [
      "Residential fastener kit composition guidance"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_fastener_kit",
      tier: "sweet_spot"
    }
  },
  {
    universeId: "owner_work_light__dewalt_20v_max_led_work_light_coast_headlamp",
    rank: 100,
    variant: {
      productName: "DeWalt 20V MAX LED work light + Coast headlamp",
      priceLow: 60,
      priceHigh: 100,
      affiliateUrl: "https://www.amazon.com/s?k=dewalt+20v+max+led+work+light+coast+headlamp&tag=alderprojects-20",
      productSpec: "DeWalt LED work light (uses 20V MAX battery from your drill — no separate battery needed) ~$45. Coast HL7 or HL8 headlamp ~$30 — for hands-free work in dark spaces (basements, attics, under sinks)."
    },
    tags: {
      topics: [
        "universal"
      ],
      roles: [
        "lighting",
        "tool"
      ],
      functions: [
        "work_light"
      ],
      seasons: [
        "year_round"
      ],
      propertyTypes: [],
      conditions: [],
      alreadyHaveFlag: "has_work_light",
      tier: "sweet_spot"
    },
    citations: [
      "DeWalt 20V MAX work light documentation",
      "Coast HL7/HL8 headlamp specifications"
    ],
    migratedFrom: {
      scope: "universal_owner_kit",
      slotId: "owner_work_light",
      tier: "sweet_spot"
    }
  },
]
