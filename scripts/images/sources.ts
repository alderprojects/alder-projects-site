// v7.2.7 — hand-curated source URLs for manufacturer (Tier 1) and
// Pexels (Tier 3) image fetches. The scraper tries SPECIFIC_URLS for
// per-product overrides first, then BRAND_HERO_URLS keyed by a
// substring match against productName. Anything missing falls through
// to Pexels (CATEGORY_GENERIC) or SVG (Tier 4).
//
// Fetch failures are logged, never block the pipeline.

// ---------- SPECIFIC product page URLs (16 SPECIFIC entries) -----
//
// Entries with amazonAsin in the universe. We hand-curate a
// manufacturer product page URL per entry. og:image of these pages
// is the primary product photo.

export const SPECIFIC_URLS: Record<string, string> = {
  amerock_bar_pulls_5116_matte_black_10pk:
    'https://www.amerock.com/products/cabinet-hardware/cabinet-pulls/bar-pulls',
  kreg_khi_pull_cabinet_hardware_jig:
    'https://www.kregtool.com/shop/clamping-and-measuring/jigs-and-fixtures/cabinet-hardware-jig/KHI-PULL.html',
  kreg_khi_xlpull_cabinet_hardware_jig_pro:
    'https://www.kregtool.com/shop/clamping-and-measuring/jigs-and-fixtures/cabinet-hardware-jig/KHI-XLPULL.html',
  inslx_cabinet_coat_acrylic_urethane_satin_gallon:
    'https://www.benjaminmoore.com/en-us/insl-x/cabinet-coat',
  polywood_classic_folding_adirondack_chair:
    'https://www.polywood.com/classic-folding-adirondack-chair.html',
  polywood_modern_adirondack_curveback:
    'https://www.polywood.com/modern-curveback-adirondack-chair.html',
  weber_spirit_ii_e310_3_burner_lp:
    'https://www.weber.com/US/en/grills/gas-grills/spirit-ii-series/spirit-ii-e-310/45010001.html',
  cabot_australian_timber_oil_1_gallon:
    'https://www.cabotstain.com/products/australian-timber-oil',
  govee_water_leak_detector_5_pack_audible_only_no_wifi:
    'https://us.govee.com/products/water-leak-detector-5-pack',
  govee_wifi_water_leak_detector_3_pack_with_gateway_h5054:
    'https://us.govee.com/products/govee-wifi-water-leak-detector-h5054',
  yolink_water_leak_starter_kit_hub_2_leak_sensor_4:
    'https://www.yosmart.com/products/Water-Leak-Sensor-Starter-Kit',
  frost_king_1_2_copper_foam_pipe_insulation_6_ft_single:
    'https://www.frostking.com/product/foam-pipe-insulation-tube/',
  frost_king_3_4_copper_foam_pipe_insulation_3_ft_4_pack:
    'https://www.frostking.com/product/foam-pipe-insulation-tube/',
  frost_king_1_rubber_tubular_pipe_insulation_6_ft:
    'https://www.frostking.com/product/rubber-tubular-pipe-insulation/',
  safety_fire_extinguisher__first_alert_pro5_heavy_duty_plus_3_a_40_b_c_single:
    'https://www.firstalertstore.com/store/products/product-detail/sku/PRO5.htm',
  mudroom_boot_tray__weathertech_boottray_16_x_36_black:
    'https://www.weathertech.com/boottray/',
}

// ---------- Brand hero pages (CATEGORY_BRAND, ~30 brands) -------
//
// Match key: substring against productName (case-insensitive). First
// match wins — order longer / more specific keys first. The og:image
// from each URL is fetched once and reused for all entries that match
// the same brand.
//
// This is the editorial-honesty tier: a Polywood photo for any
// "POLYWOOD ..." entry is accurate to the brand even if it's not the
// exact model. Better than a generic SVG icon.

export const BRAND_HERO_URLS: Array<{ match: string; url: string; brand: string }> = [
  // Order: longer / more specific keys first to avoid partial-match collisions
  { brand: 'Rev-A-Shelf', match: 'rev-a-shelf', url: 'https://www.revashelf.com/' },
  { brand: 'Container Store', match: 'container store', url: 'https://www.containerstore.com/s/kitchen/drawer-organizers' },
  { brand: 'Pottery Barn', match: 'pottery barn', url: 'https://www.potterybarn.com/' },
  { brand: 'First Alert', match: 'first alert', url: 'https://www.firstalertstore.com/' },
  { brand: 'Frost King', match: 'frost king', url: 'https://www.frostking.com/' },
  { brand: 'Top Knobs', match: 'top knobs', url: 'https://www.topknobs.com/' },
  { brand: 'Pentek', match: 'pentek', url: 'https://www.pentairhome.com/' },
  { brand: 'Sun Joe', match: 'sun joe', url: 'https://www.snowjoe.com/' },
  { brand: 'Wet & Forget', match: 'wet & forget', url: 'https://www.wetandforget.com/' },
  { brand: 'Tap Plastics', match: 'tap plastics', url: 'https://www.tapplastics.com/' },
  { brand: 'Solid Brass', match: 'solid brass', url: 'https://www.solidbrass.com/' },
  { brand: 'Roll-Up', match: 'roll-up', url: 'https://www.amazon.com/' },
  { brand: 'POLYWOOD', match: 'polywood', url: 'https://www.polywood.com/' },
  { brand: 'WeatherTech', match: 'weathertech', url: 'https://www.weathertech.com/boottray/' },
  { brand: 'Govee', match: 'govee', url: 'https://us.govee.com/' },
  { brand: 'YoLink', match: 'yolink', url: 'https://www.yosmart.com/' },
  { brand: 'Amerock', match: 'amerock', url: 'https://www.amerock.com/' },
  { brand: 'Liberty', match: 'liberty', url: 'https://www.libertyhardware.com/' },
  { brand: 'Kreg', match: 'kreg', url: 'https://www.kregtool.com/' },
  { brand: 'INSL-X', match: 'insl-x', url: 'https://www.benjaminmoore.com/en-us/insl-x' },
  { brand: 'Cabot', match: 'cabot', url: 'https://www.cabotstain.com/' },
  { brand: 'Weber', match: 'weber', url: 'https://www.weber.com/US/en/' },
  { brand: 'Wooster', match: 'wooster', url: 'https://www.woosterbrush.com/' },
  { brand: 'Whizz', match: 'whizz', url: 'https://www.whizzpaint.com/' },
  { brand: 'DeWalt', match: 'dewalt', url: 'https://www.dewalt.com/' },
  { brand: 'Milwaukee', match: 'milwaukee', url: 'https://www.milwaukeetool.com/' },
  { brand: 'Bosch', match: 'bosch', url: 'https://www.boschtools.com/us/en/' },
  { brand: 'Stanley', match: 'stanley', url: 'https://www.stanleytools.com/' },
  { brand: 'Behr', match: 'behr', url: 'https://www.behr.com/consumer/products/paint/' },
  { brand: 'Blum', match: 'blum', url: 'https://www.blum.com/' },
  { brand: 'KraftMaid', match: 'kraftmaid', url: 'https://www.kraftmaid.com/' },
  { brand: 'Sterilite', match: 'sterilite', url: 'https://www.sterilite.com/' },
  { brand: 'Suncast', match: 'suncast', url: 'https://www.suncast.com/' },
  { brand: 'Honeywell', match: 'honeywell', url: 'https://www.honeywellhome.com/' },
  { brand: 'Thermacell', match: 'thermacell', url: 'https://www.thermacell.com/' },
  { brand: 'mDesign', match: 'mdesign', url: 'https://mdesignhomedecor.com/' },
  { brand: 'Sunbrella', match: 'sunbrella', url: 'https://www.sunbrella.com/' },
]

// ---------- Pexels queries for CATEGORY_GENERIC (35 entries) -----
//
// Hand-curated search queries. Each yields a stock photo that
// represents the category, not a specific product.

export const PEXELS_QUERIES: Record<string, string> = {
  kitchen_lazy_susan__generic_12_inch_plastic_lazy_susan_turntable: 'lazy susan turntable',
  kitchen_magnetic_spice__magnetic_spice_tin_set_range_hood_mount: 'magnetic spice jars',
  hardware_swap_knobs__generic_round_knobs_6pk: 'cabinet knobs',
  hardware_swap_softclose_hinges__generic_concealed_hinge_soft_close_12pk:
    'cabinet hinges hardware',
  kitchen_undercabinet_lighting__generic_amazon_led_strip_kit_10ft:
    'led strip lights kitchen',
  lake_adirondack_chairs__generic_resin_plastic_adirondack_chair_set_of_4:
    'adirondack chair lake',
  lake_side_tables__plastic_resin_side_table_16_round_pair: 'outdoor side table',
  lake_umbrella__cantilever_umbrella_10ft_sunbrella_200lb_base:
    'patio umbrella outdoor',
  lake_outdoor_rug__generic_polyester_outdoor_rug_8x10: 'outdoor rug patio',
  lake_grill_cover__generic_universal_fit_grill_cover: 'grill cover',
  lake_grill_cover__marine_grade_premium_grill_cover: 'grill cover outdoor',
  generic_oxalic_acid_wood_deck_cleaner_1_gallon: 'wood deck cleaning',
  generic_pin_type_moisture_meter: 'moisture meter wood',
  generic_10_sediment_filter_5_micron_single: 'water filter cartridge',
  opening_cleaning_kit__basic_cleaning_consumables_lysol_mr_clean_comet_sponges:
    'cleaning supplies bottles',
  generic_30_pint_dehumidifier: 'dehumidifier basement',
  homelabs_50_pint_dehumidifier_with_continuous_drain: 'dehumidifier room',
  generic_constant_wattage_heat_cable_6_ft: 'heat cable pipe',
  foam_hose_bib_cover_single: 'outdoor faucet winter cover',
  generic_foam_weatherstripping_tape_17_ft: 'weatherstripping tape door',
  generic_100_piece_drill_bit_set: 'drill bit set',
  water_filter_wrench__standard_10_filter_housing_wrench_spare_o_ring_kit:
    'pipe wrench plumbing',
  generic_1_2_nylon_double_braid_dock_line_25_ft_single: 'dock rope marine',
  generic_vinyl_boat_fenders_4_pack: 'boat fenders dock',
  dock_marine_hardware__316_stainless_steel_marine_bolts_nuts_washers_assortment:
    'stainless steel hardware bolts',
  generic_solar_dock_lights_4_pack: 'solar lights dock',
  generic_4_step_dock_ladder_telescoping: 'dock ladder lake',
  dock_mildew_cleaner__30_hydrogen_peroxide_outdoor_cleaner_or_wet_forget_concentrate:
    'mildew cleaner outdoor',
  generic_100_piece_first_aid_kit: 'first aid kit',
  generic_plastic_boot_tray_30_x_15: 'boot tray entryway',
  generic_rubber_backed_coir_doormat_24_x_36: 'coir doormat entrance',
  generic_adhesive_back_hooks_5_pack: 'wall hooks adhesive',
  mudroom_gear_bins__mdesign_fabric_storage_bins_with_handles_6_pack:
    'storage bins fabric',
  mudroom_floor_protection__indoor_runner_rug_washable_2_5_x_7: 'runner rug hallway',
  simple_houseware_pull_out_cabinet_sliding_basket: 'pull out cabinet basket',
}

// ---------- Function-tag → Lucide icon name mapping (Tier 4) ----
//
// Used by the SVG fallback generator. One icon per function tag.
// Default for unmapped tags: 'package'.

export const FN_ICON: Record<string, string> = {
  // kitchen
  cutlery_drawer_organizer: 'utensils',
  pull_out_pantry_basket: 'archive',
  spice_drawer_organizer: 'leaf',
  under_sink_organizer: 'archive',
  lid_organizer: 'circle-dot',
  bag_wrap_organizer: 'archive',
  drawer_divider: 'rows-3',
  lazy_susan: 'rotate-cw',
  magnetic_spice_storage: 'magnet',
  dish_drying_mat: 'square',
  fridge_organizer: 'refrigerator',
  cabinet_paint: 'paint-bucket',
  bonding_primer: 'paint-bucket',
  cabinet_pull: 'grip-horizontal',
  cabinet_knob: 'circle',
  soft_close_hinge: 'door-open',
  undercabinet_lighting: 'lightbulb',
  kitchen_caulk: 'pencil-line',
  painting_supplies: 'paintbrush',
  drawer_slide: 'rows-3',
  hardware_screws: 'wrench',
  cabinet_hardware_jig: 'ruler',
  wood_putty: 'square',

  // outdoor
  adirondack_chair: 'armchair',
  outdoor_side_table: 'square',
  outdoor_cushion: 'square',
  patio_umbrella: 'umbrella',
  outdoor_rug: 'square',
  gas_grill: 'flame',
  grill_cover: 'square',
  grill_tools: 'utensils-crossed',
  outdoor_string_lights: 'lightbulb',
  outdoor_cooler: 'snowflake',
  lake_floats: 'waves',
  mosquito_control: 'bug',

  // weatherization / freeze
  freeze_sensor: 'thermometer-snowflake',
  pipe_insulation: 'snowflake',
  heat_tape: 'zap',
  hose_bib_cover: 'snowflake',
  weatherstripping: 'wind',
  shutoff_label: 'tag',
  emergency_doc: 'file-text',

  // bathroom
  bathroom_caulk: 'pencil-line',
  shower_head: 'shower-head',
  toilet_seat: 'circle',
  exhaust_fan: 'fan',

  // mudroom
  boot_tray: 'square',
  doormat: 'square',
  storage_bins: 'archive',
  runner_rug: 'square',
  wall_hooks: 'circle-dot',

  // tools / safety
  drill_bit_set: 'drill',
  fire_extinguisher: 'flame',
  first_aid_kit: 'cross',
  flashlight: 'flashlight',
  moisture_meter: 'thermometer',

  // water / dock
  water_filter: 'droplet',
  filter_wrench: 'wrench',
  dehumidifier: 'wind',
  dock_line: 'cable',
  boat_fender: 'circle',
  marine_hardware: 'wrench',
  dock_light: 'lightbulb',
  dock_ladder: 'arrow-up',
  mildew_cleaner: 'spray-can',

  // pressure washer / deck
  deck_cleaner: 'spray-can',
  pressure_washer: 'spray-can',
  deck_oil: 'paint-bucket',
}

export const DEFAULT_FN_ICON = 'package'
