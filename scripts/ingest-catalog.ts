// V7.2.4 — generalized catalog ingestion tool.
// V7.2.5 — extended for new metadata + auto-append to universe.ts.
//
// Purpose:
//   Take a v7.2.2-shape source catalog (slots with embedded
//   product variants) and split it into:
//     1. New/updated entries appended to
//        src/content/smart-cart/universe.ts
//     2. A trimmed scope catalog at
//        src/content/smart-cart/scope-catalogs/{name}.ts
//
// Usage:
//   npm i -D tsx               # one-time
//   npx tsx scripts/ingest-catalog.ts \
//     --source scripts/source-catalogs/{name}.ts \
//     [--out src/content/smart-cart]               # default
//
// Operation:
//   1. Load existing universe (by importing the runtime module).
//   2. For each slot in the source:
//        For each tier (budget, sweet_spot, premium):
//          - Lookup existing universe entry by ASIN; fall back to
//            exact productName match
//          - If exists: merge the new scope's tags additively
//          - Otherwise: create a new universe entry with derived
//            tags + migratedFrom provenance
//        Build a tierQueries entry that resolves to the universe
//        product. The query carries mustHaveTopics +
//        mustHaveFunctions + mustHaveRoles + tier; when multiple
//        products share those tags, we use mustHaveConditions
//        with a per-source-scope discriminator to disambiguate.
//   3. Write the trimmed scope catalog to
//      scope-catalogs/{name}.ts with verbatim editorial prose
//      from the source.
//   4. Auto-append new universe entries to universe.ts before
//      the closing `]` of the UNIVERSE export. Idempotent: existing
//      entries dedup via ASIN/productName match.
//   5. Print a diff-like summary (new entries vs merged).
//
// Idempotent: running twice produces the same files (modulo
// timestamps in comments).
//
// V7.2.5 additions:
//   - {SCOPE}_METADATA export (smartCartPromise, valueProposition,
//     routeOutRules, seasonalUrgency) is loaded and written to the
//     scope catalog.
//   - Slot-level new fields (slotPurpose, whyItMatters,
//     commonMistake, nextBestIfAlreadyHave, whenToSkip,
//     routeOutOfSmartCartIf) are forwarded from source slots to
//     ScopeCatalogSlot.
//   - Skip-list new fields (whenItMayBeOkay, betterAlternative,
//     customerFacingCopy) are forwarded.
//   - KNOWN_BRANDS expanded for v7.2.5 (Govee, YoLink, Frost King,
//     Honeywell, Ecobee, Pentair, Pentek, Cabot, Behr, Sun Joe,
//     Generac, Marcell, hOmeLabs, Sterilite, Method, Quickie,
//     General Tools, Sherwin-Williams, Restore-A-Deck, Moen,
//     Deckmate, GRK, EasyHeat).
//   - deriveRoles / deriveFunctions / deriveSeasons cover the new
//     freeze_*, opening_*, deck_* slot-id prefixes.
//   - Universe entries are now auto-appended to universe.ts (no
//     manual paste step required).

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as url from 'node:url'

import type {
  CartSlot,
  CartTierVariant,
  CartTier,
  ScopeCatalogSlot,
  SkipItemV2,
} from '../src/lib/smart-cart-model'
import type {
  UniverseProduct,
  UniverseQuery,
  UniverseTags,
} from '../src/lib/smart-cart-universe'

// ---------- CLI ------------------------------------------------------

interface CliArgs {
  sourcePath: string
  outDir: string
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { sourcePath: '', outDir: 'src/content/smart-cart' }
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--source') args.sourcePath = argv[++i]
    else if (a === '--out') args.outDir = argv[++i]
  }
  if (!args.sourcePath) {
    console.error(
      'Usage: npx tsx scripts/ingest-catalog.ts --source <path> [--out <dir>]',
    )
    process.exit(2)
  }
  return args
}

// ---------- Source contract -----------------------------------------
// Source files export {SCOPE}_TOPIC, {SCOPE}_SCOPE, {SCOPE}_SCENARIOS,
// {SCOPE}_SLOTS, {SCOPE}_SKIP_LIST, {SCOPE}_SCENARIO_DEFAULTS.
// V7.2.5 sources also export {SCOPE}_METADATA (optional).

interface SourceMetadata {
  smartCartPromise?: string
  primaryCustomerPain?: string
  valueProposition?: string
  routeOutRules?: Array<{
    condition: string
    destination: 'worth_it' | 'small_pro' | 'contractor' | 'verify_first'
    reason: string
  }>
  seasonalUrgency?: { season: string; deadline: string; label: string }
}

interface SourceCatalog {
  topic: string
  scopeVariantId: string
  scenarios: string[]
  slots: CartSlot[]
  skipList: SkipItemV2[]
  scenarioDefaults: Record<string, { selectedTier: CartTier; alreadyHave: string[] }>
  /** V7.2.5 — optional scope-level metadata. */
  metadata?: SourceMetadata
}

async function loadSource(sourcePath: string): Promise<SourceCatalog> {
  const abs = path.resolve(sourcePath)
  const moduleUrl = url.pathToFileURL(abs).href
  const mod: any = await import(moduleUrl)
  const upper = path
    .basename(sourcePath, path.extname(sourcePath))
    .toUpperCase()
    .replace(/-/g, '_')
  return {
    topic: mod[`${upper}_TOPIC`],
    scopeVariantId: mod[`${upper}_SCOPE`],
    scenarios: mod[`${upper}_SCENARIOS`],
    slots: mod[`${upper}_SLOTS`],
    skipList: mod[`${upper}_SKIP_LIST`],
    scenarioDefaults: mod[`${upper}_SCENARIO_DEFAULTS`],
    metadata: mod[`${upper}_METADATA`],
  }
}

// ---------- Tag derivation ------------------------------------------
// Heuristic table from v7.2.3 Section 5C, expanded for v7.2.4
// slot prefixes (lake_*, hardware_swap_*, kitchen_*).

function deriveTopics(sourceTopic: string): string[] {
  return [sourceTopic]
}

function deriveRoles(slotId: string): string[] {
  if (/paint|primer/.test(slotId)) return ['consumable_material', 'finish']
  if (/_screw|^deck_exterior_screws$|^freeze_smart_shutoff_valve$/.test(slotId)) return ['hardware']
  if (/pull|knob|hinge/.test(slotId)) return ['hardware']
  if (/jig/.test(slotId)) return ['tool']
  if (/lighting|string_lights/.test(slotId)) return ['lighting']
  if (/caulk|wood_putty/.test(slotId)) return ['consumable_material']
  if (/painting_supplies/.test(slotId)) return ['tool', 'consumable_material']
  if (/drawer_slides/.test(slotId)) return ['hardware']
  if (/adirondack|side_table|cushion|umbrella/.test(slotId)) return ['furniture']
  if (/rug/.test(slotId)) return ['textile']
  if (/grill/.test(slotId)) return ['appliance']
  if (/cooler/.test(slotId)) return ['accessory']
  if (/floats|essentials/.test(slotId)) return ['accessory']
  if (/bug_control/.test(slotId)) return ['accessory']
  if (/organizer/.test(slotId)) return ['organizer']

  // ===== V7.2.5 — outdoor_freeze_prevention =====
  if (/freeze_leak_sensor/.test(slotId)) return ['sensor']
  if (/freeze_pipe_insulation/.test(slotId)) return ['consumable_material', 'preventer']
  if (/freeze_heat_tape/.test(slotId)) return ['preventer']
  if (/freeze_smart_thermostat/.test(slotId)) return ['monitor', 'preventer']
  if (/freeze_hose_bib_cover/.test(slotId)) return ['accessory', 'preventer']
  if (/freeze_draft_sealing/.test(slotId)) return ['consumable_material', 'preventer']
  if (/freeze_shutoff_labels/.test(slotId)) return ['document_aid', 'safety_item']
  if (/freeze_alarm_non_wifi/.test(slotId)) return ['sensor', 'monitor']

  // ===== V7.2.5 — outdoor_seasonal_opening =====
  if (/opening_water_test_kit/.test(slotId)) return ['measurement_tool', 'safety_item']
  if (/opening_leak_check/.test(slotId)) return ['measurement_tool', 'tool']
  if (/opening_filter_replacement/.test(slotId)) return ['consumable_material']
  if (/opening_cleaning_kit/.test(slotId)) return ['cleaner', 'consumable_material']
  if (/opening_dehumidifier/.test(slotId)) return ['appliance', 'preventer']
  if (/opening_tote/.test(slotId)) return ['organizer']
  if (/opening_consumables/.test(slotId)) return ['consumable_material']
  if (/opening_shutoff_labels/.test(slotId)) return ['document_aid', 'safety_item']

  // ===== V7.2.5 — outdoor_deck_refresh =====
  if (/deck_cleaner/.test(slotId)) return ['cleaner', 'consumable_material']
  if (/deck_brush/.test(slotId)) return ['tool']
  if (/deck_moisture_meter/.test(slotId)) return ['measurement_tool']
  if (/deck_stain_sealer/.test(slotId)) return ['consumable_material', 'finish']
  if (/deck_stair_grip/.test(slotId)) return ['safety_item', 'consumable_material']
  if (/deck_pressure_washer/.test(slotId)) return ['tool']
  if (/deck_board_repair/.test(slotId)) return ['tool', 'hardware']

  // ===== V7.2.5 — universal_owner_kit =====
  if (/owner_drill_driver/.test(slotId)) return ['tool', 'appliance']
  if (/owner_drill_bits/.test(slotId)) return ['tool', 'consumable_material']
  if (/owner_level$/.test(slotId)) return ['measurement_tool', 'tool']
  if (/owner_stud_finder/.test(slotId)) return ['sensor', 'measurement_tool']
  if (/owner_tape_measure/.test(slotId)) return ['measurement_tool', 'tool']
  if (/owner_utility_knife/.test(slotId)) return ['tool']
  if (/owner_caulk_gun/.test(slotId)) return ['tool']
  if (/owner_multitool/.test(slotId)) return ['tool', 'appliance']
  if (/owner_fastener_kit/.test(slotId)) return ['hardware', 'consumable_material']
  if (/owner_work_light/.test(slotId)) return ['lighting', 'tool']

  // ===== V7.2.5 — home_moisture_control =====
  if (/moisture_hygrometer/.test(slotId)) return ['sensor', 'monitor', 'measurement_tool']
  if (/moisture_dehumidifier/.test(slotId)) return ['appliance', 'preventer']
  if (/^moisture_meter$/.test(slotId)) return ['measurement_tool']
  if (/moisture_mold_test/.test(slotId)) return ['measurement_tool', 'safety_item']
  if (/moisture_odor_absorber/.test(slotId)) return ['consumable_material', 'cleaner']
  if (/moisture_air_mover/.test(slotId)) return ['appliance']
  if (/moisture_leak_sensor/.test(slotId)) return ['sensor']

  // ===== V7.2.5 — mudroom_entry_reset (paste 3 pending) =====
  if (/mudroom_boot_tray/.test(slotId)) return ['accessory', 'preventer']
  if (/mudroom_entry_mat/.test(slotId)) return ['textile', 'preventer']
  if (/mudroom_wall_hooks/.test(slotId)) return ['hardware', 'organizer']
  if (/mudroom_entry_bench/.test(slotId)) return ['furniture', 'organizer']
  if (/mudroom_wet_gear_rack/.test(slotId)) return ['organizer']
  if (/mudroom_gear_bins/.test(slotId)) return ['organizer']
  if (/mudroom_towel_station/.test(slotId)) return ['textile', 'accessory']
  if (/mudroom_floor_protection/.test(slotId)) return ['textile', 'preventer']

  // ===== V7.2.5 — home_water_quality =====
  if (/water_basic_test_strips/.test(slotId)) return ['measurement_tool', 'safety_item']
  if (/water_lab_test/.test(slotId)) return ['measurement_tool', 'safety_item']
  if (/water_bacteria_test/.test(slotId)) return ['measurement_tool', 'safety_item']
  if (/water_sediment_filter/.test(slotId)) return ['consumable_material']
  if (/water_fridge_filter/.test(slotId)) return ['consumable_material']
  if (/water_drinking_filter/.test(slotId)) return ['appliance', 'consumable_material']
  if (/water_filter_wrench/.test(slotId)) return ['tool']
  if (/water_pressure_gauge/.test(slotId)) return ['measurement_tool', 'tool']

  // ===== V7.2.5 — outdoor_dock_lake =====
  if (/^dock_lines$/.test(slotId)) return ['hardware', 'safety_item']
  if (/^dock_bumpers$/.test(slotId)) return ['hardware', 'safety_item']
  if (/^dock_marine_hardware$/.test(slotId)) return ['hardware']
  if (/^dock_lighting$/.test(slotId)) return ['lighting', 'safety_item']
  if (/^dock_ladder$/.test(slotId)) return ['hardware', 'safety_item']
  if (/^dock_mildew_cleaner$/.test(slotId)) return ['cleaner', 'consumable_material']
  if (/^dock_storage_bin$/.test(slotId)) return ['organizer']
  if (/^dock_non_slip_strips$/.test(slotId)) return ['safety_item', 'consumable_material']

  // ===== V7.2.5 — home_safety_kit =====
  if (/safety_fire_extinguisher/.test(slotId)) return ['safety_item']
  if (/safety_smoke_co_detector/.test(slotId)) return ['sensor', 'monitor', 'safety_item']
  if (/safety_first_aid_kit/.test(slotId)) return ['safety_item']
  if (/safety_flashlight_lantern/.test(slotId)) return ['lighting', 'safety_item']
  if (/safety_emergency_power/.test(slotId)) return ['appliance', 'safety_item']
  if (/safety_emergency_docs/.test(slotId)) return ['document_aid', 'safety_item']

  // ===== V7.2.5 — universal_project_prep =====
  if (/prep_laser_measure/.test(slotId)) return ['measurement_tool', 'tool']
  if (/prep_graph_paper_kit/.test(slotId)) return ['document_aid', 'measurement_tool']
  if (/prep_painters_tape/.test(slotId)) return ['consumable_material', 'tool']
  if (/prep_label_maker/.test(slotId)) return ['tool', 'document_aid']
  if (/prep_sample_boards/.test(slotId)) return ['consumable_material', 'document_aid']
  if (/prep_phone_tripod/.test(slotId)) return ['tool', 'document_aid']
  if (/prep_inspection_mirror/.test(slotId)) return ['tool', 'measurement_tool']

  return []
}

function deriveFunctions(slotId: string): string[] {
  // The slot's role in the cart, plus a scope-discriminator suffix
  // when a slot maps to multiple scope-specific universe entries.
  if (/cabinet_paint/.test(slotId)) return ['cabinet_paint']
  if (/bonding_primer/.test(slotId)) return ['bonding_primer']
  if (/cabinet_pulls|drawer_pulls/.test(slotId)) return ['cabinet_pull']
  if (/cabinet_knobs|^hardware_swap_knobs$/.test(slotId)) return ['cabinet_knob']
  if (/softclose_hinges/.test(slotId)) return ['soft_close_hinge']
  if (/undercabinet_lighting/.test(slotId)) return ['undercabinet_lighting']
  if (/caulk_kit/.test(slotId)) return ['kitchen_caulk']
  if (/painting_supplies/.test(slotId)) return ['painting_supplies']
  if (/drawer_slides/.test(slotId)) return ['drawer_slide']
  // Match the kitchen cabinet-hardware screw slot, but not the
  // v7.2.5 deck_exterior_screws slot (handled below).
  if (/^hardware_swap_screws$|kitchen.*screws/.test(slotId)) return ['hardware_screws']
  if (/jig/.test(slotId)) return ['cabinet_hardware_jig']
  if (/wood_putty/.test(slotId)) return ['wood_putty']
  if (/adirondack/.test(slotId)) return ['adirondack_chair']
  if (/side_tables/.test(slotId)) return ['outdoor_side_table']
  if (/cushions/.test(slotId)) return ['outdoor_cushion']
  if (/umbrella/.test(slotId)) return ['patio_umbrella']
  if (/outdoor_rug/.test(slotId)) return ['outdoor_rug']
  if (/gas_grill/.test(slotId)) return ['gas_grill']
  if (/grill_cover/.test(slotId)) return ['grill_cover']
  if (/grill_tools/.test(slotId)) return ['grill_tools']
  if (/string_lights/.test(slotId)) return ['outdoor_string_lights']
  if (/cooler/.test(slotId)) return ['outdoor_cooler']
  if (/floats/.test(slotId)) return ['lake_floats']
  if (/bug_control/.test(slotId)) return ['mosquito_control']

  // ===== V7.2.5 — outdoor_freeze_prevention =====
  if (/freeze_leak_sensor/.test(slotId)) return ['leak_detector']
  if (/freeze_pipe_insulation/.test(slotId)) return ['pipe_insulation']
  if (/freeze_heat_tape/.test(slotId)) return ['heat_tape']
  if (/freeze_smart_thermostat/.test(slotId)) return ['smart_thermostat']
  if (/freeze_hose_bib_cover/.test(slotId)) return ['hose_bib_cover']
  if (/freeze_draft_sealing/.test(slotId)) return ['draft_sealer']
  if (/freeze_shutoff_labels/.test(slotId)) return ['shutoff_labels']
  if (/freeze_smart_shutoff_valve/.test(slotId)) return ['smart_shutoff_valve']
  if (/freeze_alarm_non_wifi/.test(slotId)) return ['pipe_freeze_alarm']

  // ===== V7.2.5 — outdoor_seasonal_opening =====
  if (/opening_water_test_kit/.test(slotId)) return ['water_test_kit']
  if (/opening_leak_check/.test(slotId)) return ['pressure_gauge', 'leak_detector']
  if (/opening_filter_replacement/.test(slotId)) return ['filter_replacement']
  if (/opening_cleaning_kit/.test(slotId)) return ['cleaning_reset_kit']
  if (/opening_dehumidifier/.test(slotId)) return ['dehumidifier_entry']
  if (/opening_tote/.test(slotId)) return ['opening_tote']
  if (/opening_consumables/.test(slotId)) return ['basic_consumables']
  // Cross-scope reuse: opening_shutoff_labels uses the same function
  // tag as freeze_shutoff_labels so the tier-query against the
  // universe finds either entry.
  if (/opening_shutoff_labels/.test(slotId)) return ['shutoff_labels']

  // ===== V7.2.5 — outdoor_deck_refresh =====
  if (/^deck_cleaner$/.test(slotId)) return ['deck_cleaner']
  if (/^deck_brush$/.test(slotId)) return ['deck_brush']
  if (/^deck_moisture_meter$/.test(slotId)) return ['moisture_meter']
  if (/^deck_stain_sealer$/.test(slotId)) return ['deck_stain_sealer']
  if (/^deck_exterior_screws$/.test(slotId)) return ['exterior_screws']
  if (/^deck_stair_grip$/.test(slotId)) return ['stair_grip_strips']
  if (/^deck_pressure_washer$/.test(slotId)) return ['pressure_washer']
  if (/^deck_board_repair$/.test(slotId)) return ['board_repair_tools']

  // ===== V7.2.5 — universal_owner_kit =====
  if (/^owner_drill_driver$/.test(slotId)) return ['drill_driver']
  if (/^owner_drill_bits$/.test(slotId)) return ['drill_bit_set']
  if (/^owner_level$/.test(slotId)) return ['level']
  if (/^owner_stud_finder$/.test(slotId)) return ['stud_finder']
  if (/^owner_tape_measure$/.test(slotId)) return ['tape_measure']
  if (/^owner_utility_knife$/.test(slotId)) return ['utility_knife']
  if (/^owner_caulk_gun$/.test(slotId)) return ['caulk_gun']
  if (/^owner_multitool$/.test(slotId)) return ['oscillating_multitool']
  if (/^owner_fastener_kit$/.test(slotId)) return ['fastener_kit']
  if (/^owner_work_light$/.test(slotId)) return ['work_light']

  // ===== V7.2.5 — home_moisture_control =====
  if (/^moisture_hygrometer$/.test(slotId)) return ['hygrometer']
  // Cross-scope reuse: moisture_dehumidifier reuses the function
  // tag from outdoor_seasonal_opening's opening_dehumidifier.
  if (/^moisture_dehumidifier$/.test(slotId)) return ['dehumidifier_entry', 'dehumidifier_whole']
  // Cross-scope reuse: moisture_meter reuses the function tag from
  // outdoor_deck_refresh's deck_moisture_meter.
  if (/^moisture_meter$/.test(slotId)) return ['moisture_meter']
  if (/^moisture_mold_test$/.test(slotId)) return ['mold_test_kit']
  if (/^moisture_odor_absorber$/.test(slotId)) return ['odor_absorber']
  if (/^moisture_air_mover$/.test(slotId)) return ['air_mover']
  // Cross-scope reuse: moisture_leak_sensor reuses the function
  // tag from outdoor_freeze_prevention's freeze_leak_sensor.
  if (/^moisture_leak_sensor$/.test(slotId)) return ['leak_detector']

  // ===== V7.2.5 — mudroom_entry_reset (paste 3 pending) =====
  if (/^mudroom_boot_tray$/.test(slotId)) return ['boot_tray']
  if (/^mudroom_entry_mat$/.test(slotId)) return ['entry_mat']
  if (/^mudroom_wall_hooks$/.test(slotId)) return ['wall_hooks']
  if (/^mudroom_entry_bench$/.test(slotId)) return ['entry_bench']
  if (/^mudroom_wet_gear_rack$/.test(slotId)) return ['wet_gear_rack']
  if (/^mudroom_gear_bins$/.test(slotId)) return ['gear_bins']
  if (/^mudroom_towel_station$/.test(slotId)) return ['towel_station']
  if (/^mudroom_floor_protection$/.test(slotId)) return ['floor_protection']

  // ===== V7.2.5 — home_water_quality =====
  if (/^water_basic_test_strips$/.test(slotId)) return ['basic_test_strips']
  if (/^water_lab_test$/.test(slotId)) return ['lab_water_test']
  if (/^water_bacteria_test$/.test(slotId)) return ['bacteria_test_kit']
  if (/^water_sediment_filter$/.test(slotId)) return ['sediment_filter']
  if (/^water_fridge_filter$/.test(slotId)) return ['fridge_filter']
  if (/^water_drinking_filter$/.test(slotId)) return ['drinking_water_filter']
  if (/^water_filter_wrench$/.test(slotId)) return ['filter_wrench']
  if (/^water_pressure_gauge$/.test(slotId)) return ['pressure_gauge']

  // ===== V7.2.5 — outdoor_dock_lake =====
  if (/^dock_lines$/.test(slotId)) return ['dock_lines']
  if (/^dock_bumpers$/.test(slotId)) return ['dock_bumpers']
  if (/^dock_marine_hardware$/.test(slotId)) return ['marine_hardware']
  if (/^dock_lighting$/.test(slotId)) return ['dock_lighting']
  if (/^dock_ladder$/.test(slotId)) return ['dock_ladder']
  if (/^dock_mildew_cleaner$/.test(slotId)) return ['mildew_cleaner']
  if (/^dock_storage_bin$/.test(slotId)) return ['weatherproof_bin']
  if (/^dock_non_slip_strips$/.test(slotId)) return ['non_slip_strips']

  // ===== V7.2.5 — home_safety_kit =====
  if (/^safety_fire_extinguisher$/.test(slotId)) return ['fire_extinguisher']
  if (/^safety_smoke_co_detector$/.test(slotId)) return ['smoke_co_detector']
  if (/^safety_first_aid_kit$/.test(slotId)) return ['first_aid_kit']
  if (/^safety_flashlight_lantern$/.test(slotId)) return ['flashlight_lantern']
  if (/^safety_emergency_power$/.test(slotId)) return ['emergency_power']
  if (/^safety_emergency_docs$/.test(slotId)) return ['emergency_docs']

  // ===== V7.2.5 — universal_project_prep =====
  if (/^prep_laser_measure$/.test(slotId)) return ['laser_measure']
  if (/^prep_graph_paper_kit$/.test(slotId)) return ['graph_paper_kit']
  if (/^prep_painters_tape$/.test(slotId)) return ['painters_tape']
  if (/^prep_label_maker$/.test(slotId)) return ['label_maker']
  if (/^prep_sample_boards$/.test(slotId)) return ['sample_boards']
  if (/^prep_phone_tripod$/.test(slotId)) return ['phone_tripod']
  if (/^prep_inspection_mirror$/.test(slotId)) return ['inspection_mirror']

  return []
}

function deriveSeasons(scopeId: string): string[] {
  if (/lake_season/.test(scopeId)) return ['summer', 'opening_season']
  if (/mud_season/.test(scopeId)) return ['mud_season', 'spring']
  if (/fall|pre_winter/.test(scopeId)) return ['fall', 'closing_season']

  // V7.2.5
  if (/freeze_prevention/.test(scopeId)) return ['fall', 'pre_winter', 'closing_season']
  if (/seasonal_opening/.test(scopeId)) return ['spring', 'opening_season', 'pre_summer']
  if (/deck_refresh/.test(scopeId)) return ['spring', 'pre_summer', 'summer']
  // Universal / home repair / mudroom — year-round.
  if (/owner_kit|moisture_control|water_quality|safety_kit|project_prep/.test(scopeId)) {
    return ['year_round']
  }
  if (/mudroom_entry_reset/.test(scopeId)) return ['mud_season', 'spring', 'year_round']
  if (/dock_lake/.test(scopeId)) return ['summer', 'opening_season', 'spring']

  return []
}

function derivePropertyTypes(scopeId: string): string[] {
  if (/lake/.test(scopeId)) return ['lake']
  return []
}

// ---------- Universe ID convention ----------------------------------
const KNOWN_BRANDS = [
  'amerock', 'liberty', 'top_knobs', 'pipishell', 'spaceaid',
  'simple_houseware', 'holdn', 'rev_a_shelf', 'utoplike',
  'wobane', 'blum', 'kreg', 'minwax', 'dap', 'wooster',
  'kraftmaid', 'insl_x', 'inslx', 'benjamin_moore', 'behr',
  'kilz', 'zinsser', 'sherwin', 'hampton_bay', 'sunbrella',
  'polywood', 'weber', 'rtic', 'yeti', 'coleman', 'brightech',
  'thermacell', 'frontgate', 'pottery_barn', 'restoration_hardware',
  'treasure_garden', 'everie', 'whizz', 'ge', 'cabot',
  'char_broil', 'nexgrill', 'walmart',
  // V7.2.5
  'govee', 'yolink', 'frost_king', 'honeywell', 'ecobee',
  'pentair', 'pentek', 'sun_joe', 'generac', 'marcell',
  'temp_stick', 'homelabs', 'sterilite', 'method', 'mrs_meyer_s',
  'mrs_meyers', 'quickie', 'general_tools', 'sherwin_williams',
  'restore_a_deck', 'moen', 'deckmate', 'grk', 'easyheat',
  'tap_score', 'watersafe', 'aprilaire', 'foam', 'home_depot',
  'big_blue',
]

function generateUniverseId(slot: CartSlot, tier: CartTier, productName: string): string {
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64)
  const startsWithBrand = KNOWN_BRANDS.some(b => slug.startsWith(b))
  if (startsWithBrand) return slug
  void tier
  return `${slot.slotId}__${slug}`.slice(0, 96)
}

// ---------- Universe load + dedup ------------------------------------

async function loadExistingUniverse(): Promise<UniverseProduct[]> {
  const universeMod: any = await import(
    url.pathToFileURL(
      path.resolve('src/content/smart-cart/universe.ts'),
    ).href
  )
  return universeMod.UNIVERSE
}

function uniqueMerge<T>(...arrays: T[][]): T[] {
  const seen = new Set<T>()
  const out: T[] = []
  for (const arr of arrays) {
    for (const v of arr) {
      if (!seen.has(v)) {
        seen.add(v)
        out.push(v)
      }
    }
  }
  return out
}

function findExistingProduct(
  variant: CartTierVariant,
  pool: UniverseProduct[],
): UniverseProduct | null {
  if (variant.amazonAsin) {
    const byAsin = pool.find(p => p.variant.amazonAsin === variant.amazonAsin)
    if (byAsin) return byAsin
  }
  return pool.find(p => p.variant.productName === variant.productName) ?? null
}

function buildUniverseProduct(
  variant: CartTierVariant,
  slot: CartSlot,
  source: SourceCatalog,
  tier: CartTier,
): UniverseProduct {
  const tags: UniverseTags = {
    topics: deriveTopics(source.topic) as UniverseTags['topics'],
    roles: deriveRoles(slot.slotId) as UniverseTags['roles'],
    functions: deriveFunctions(slot.slotId),
    seasons: deriveSeasons(source.scopeVariantId) as UniverseTags['seasons'],
    propertyTypes: derivePropertyTypes(
      source.scopeVariantId,
    ) as UniverseTags['propertyTypes'],
    conditions: [],
    alreadyHaveFlag: slot.conditionalOn?.[0] ?? '',
    tier,
  }
  const universeId = generateUniverseId(slot, tier, variant.productName)
  // V7.2.7 — auto-populate imageUrl so newly ingested entries land
  // with at least a category fallback. The image-sourcing pipeline
  // (scripts/images/) overwrites with a real photo when one is
  // sourced. Resolution priority: function-tag SVG → topic SVG →
  // default _package.svg.
  const imageUrl = resolveDefaultImageUrl(tags.functions, tags.topics)
  return {
    universeId,
    rank: 100,
    variant: { ...variant, imageUrl },
    tags,
    citations: (slot as any).citations ?? [],
    migratedFrom: {
      scope: source.scopeVariantId,
      slotId: slot.slotId,
      tier,
    },
  }
}

function resolveDefaultImageUrl(functions: string[], topics: string[]): string {
  const fs = require('node:fs') as typeof import('node:fs')
  const CATEGORIES = 'public/product-images/categories'
  for (const fn of functions) {
    if (fs.existsSync(`${CATEGORIES}/${fn}.svg`)) {
      return `/product-images/categories/${fn}.svg`
    }
  }
  for (const t of topics) {
    if (fs.existsSync(`${CATEGORIES}/_topic-${t}.svg`)) {
      return `/product-images/categories/_topic-${t}.svg`
    }
  }
  return '/product-images/categories/_package.svg'
}

function mergeProductTags(
  existing: UniverseProduct,
  slot: CartSlot,
  source: SourceCatalog,
): UniverseProduct {
  existing.tags.topics = uniqueMerge(
    existing.tags.topics,
    deriveTopics(source.topic) as UniverseTags['topics'],
  )
  existing.tags.roles = uniqueMerge(
    existing.tags.roles,
    deriveRoles(slot.slotId) as UniverseTags['roles'],
  )
  existing.tags.functions = uniqueMerge(
    existing.tags.functions,
    deriveFunctions(slot.slotId),
  )
  existing.tags.seasons = uniqueMerge(
    existing.tags.seasons,
    deriveSeasons(source.scopeVariantId) as UniverseTags['seasons'],
  )
  existing.tags.propertyTypes = uniqueMerge(
    existing.tags.propertyTypes,
    derivePropertyTypes(source.scopeVariantId) as UniverseTags['propertyTypes'],
  )
  // Tier doesn't merge — original tier stays. If the same product is
  // sweet_spot in one scope and budget in another, that's a content
  // modeling problem to flag rather than silently overwrite.
  return existing
}

// ---------- Tier query generation ------------------------------------

function buildTierQuery(
  product: UniverseProduct,
  slot: CartSlot,
  source: SourceCatalog,
  tier: CartTier,
): UniverseQuery {
  // V7.2.5 — use the resolved product's actual tags rather than the
  // source-scope-derived tags. For NEW products the two are equivalent
  // (the product was built from the same derivations). For EXISTING
  // products that this scope is REUSING, mergeProductTags has already
  // unioned the new scope's tags into the in-memory product, so the
  // resulting query (e.g. mustHaveTopics: ['outdoor', 'home_repair'])
  // OR-matches the existing on-disk entry's tags. Without this, the
  // generated query asks only for the new scope's topic and the on-
  // disk entry (still tagged with the original scope's topic) doesn't
  // match -- breaking cross-scope reuse at runtime.
  //
  // V7.2.5 paste 4 — same logic for tier. mergeProductTags preserves
  // the original tier on the universe entry (one product can be the
  // budget pick in scope A and the sweet_spot pick in scope B; tier
  // is editorial). The query must ask for the entry's canonical
  // tier, not the new scope's editorial tier, so the strict-equality
  // tier check at runtime still matches. The slot's CartSlot.tiers.X
  // assignment then presents the resolved product as the X-tier pick
  // for the new scope, regardless of its canonical storage tier.
  void tier
  void source
  return {
    mustHaveTopics: product.tags.topics as UniverseQuery['mustHaveTopics'],
    mustHaveFunctions: product.tags.functions,
    mustHaveRoles: product.tags.roles as UniverseQuery['mustHaveRoles'],
    excludeAlreadyHaveFlag: slot.conditionalOn?.[0],
    tier: product.tags.tier,
    limit: 1,
  }
}

// ---------- Scope catalog assembly -----------------------------------

interface IngestionResult {
  newProducts: UniverseProduct[]
  mergedProductIds: string[]
  scopeSlots: ScopeCatalogSlot[]
  decisionsNeeded: string[]
}

function ingestSource(
  source: SourceCatalog,
  existingUniverse: UniverseProduct[],
): IngestionResult {
  const newProducts: UniverseProduct[] = []
  const mergedProductIds = new Set<string>()
  const scopeSlots: ScopeCatalogSlot[] = []
  const decisionsNeeded: string[] = []

  for (const slot of source.slots) {
    const tierQueries: ScopeCatalogSlot['tierQueries'] = {} as any
    let sweetSpotResolved = false

    for (const tier of ['budget', 'sweet_spot', 'premium'] as const) {
      const variant = slot.tiers[tier]
      if (!variant) continue

      const pool = [...existingUniverse, ...newProducts]
      const existing = findExistingProduct(variant, pool)

      if (existing) {
        mergeProductTags(existing, slot, source)
        mergedProductIds.add(existing.universeId)
        if (existing.tags.tier !== tier) {
          decisionsNeeded.push(
            `Product ${existing.universeId} appears as ${existing.tags.tier} ` +
              `in ${existing.migratedFrom?.scope} but ${tier} in ${source.scopeVariantId}. ` +
              `Original tier preserved; review whether this is intentional.`,
          )
        }
        tierQueries[tier] = buildTierQuery(existing, slot, source, tier)
      } else {
        const product = buildUniverseProduct(variant, slot, source, tier)
        newProducts.push(product)
        tierQueries[tier] = buildTierQuery(product, slot, source, tier)
      }

      if (tier === 'sweet_spot') sweetSpotResolved = true
    }

    if (!sweetSpotResolved) {
      decisionsNeeded.push(
        `Slot ${slot.slotId} in ${source.scopeVariantId} has no sweet_spot tier`,
      )
    }

    scopeSlots.push({
      slotId: slot.slotId,
      slotLabel: slot.slotLabel,
      slotKind: slot.slotKind,
      conditionalOn: slot.conditionalOn ?? [],
      tierQueries: tierQueries as ScopeCatalogSlot['tierQueries'],
      whyThis: slot.whyThis,
      whyNotCheaper: slot.whyNotCheaper,
      whyNotPremium: slot.whyNotPremium,
      contextNote: slot.contextNote,
      warnings: slot.warnings,
      citations: (slot as any).citations ?? [],
      // V7.2.5 — forward optional editorial / route-out / next-best
      // metadata from the source slot. These are authoring-only
      // fields the source files declare on CartSlot[]; the ingestion
      // script lifts them into ScopeCatalogSlot.
      slotPurpose: slot.slotPurpose,
      whyItMatters: slot.whyItMatters,
      commonMistake: slot.commonMistake,
      nextBestIfAlreadyHave: slot.nextBestIfAlreadyHave,
      whenToSkip: slot.whenToSkip,
      routeOutOfSmartCartIf: slot.routeOutOfSmartCartIf,
    })
  }

  return {
    newProducts,
    mergedProductIds: Array.from(mergedProductIds),
    scopeSlots,
    decisionsNeeded,
  }
}

// ---------- Output writers ------------------------------------------

/**
 * Convert an object to a TypeScript object-literal string. JSON.stringify
 * with indent=2, then de-quote any property key that's a valid JS
 * identifier so the output matches the existing universe.ts hand-
 * written style. String values stay double-quoted (TS-valid).
 */
function tsLiteralFromObject(obj: unknown): string {
  const json = JSON.stringify(obj, null, 2)
  return json.replace(/"([a-zA-Z_$][a-zA-Z_$0-9]*)":/g, '$1:')
}

function emitUniverseEntry(p: UniverseProduct): string {
  return `  ${tsLiteralFromObject(p).replace(/\n/g, '\n  ')},\n`
}

/**
 * V7.2.5 — auto-append new universe entries to
 * src/content/smart-cart/universe.ts before the closing `]` of the
 * UNIVERSE array. Idempotent because findExistingProduct dedups on
 * subsequent runs.
 *
 * Returns the number of entries appended.
 */
function appendUniverseEntries(newProducts: UniverseProduct[]): number {
  if (newProducts.length === 0) return 0
  const universePath = path.resolve('src/content/smart-cart/universe.ts')
  const original = fs.readFileSync(universePath, 'utf8')
  // Match the closing `]` of the UNIVERSE array — the last `\n]` in
  // the file. If something else lands after the array (a helper, an
  // export), this needs revisiting.
  const closingIdx = original.lastIndexOf('\n]')
  if (closingIdx === -1) {
    throw new Error(
      "Couldn't locate closing `]` of UNIVERSE array in universe.ts",
    )
  }
  const before = original.slice(0, closingIdx)
  const after = original.slice(closingIdx)
  const insertion = newProducts
    .map(p => {
      const lit = tsLiteralFromObject(p)
      const indented = lit
        .split('\n')
        .map(l => '  ' + l)
        .join('\n')
      return '\n' + indented + ','
    })
    .join('')
  fs.writeFileSync(universePath, before + insertion + after, 'utf8')
  return newProducts.length
}

function writeScopeCatalogFile(
  outDir: string,
  source: SourceCatalog,
  scopeSlots: ScopeCatalogSlot[],
): string {
  const filename = `${source.scopeVariantId.replace(/_/g, '-')}.ts`
  const filepath = path.join(outDir, 'scope-catalogs', filename)
  const exportName = source.scopeVariantId.toUpperCase()

  // V7.2.5 — forward source-level metadata into the catalog. Skip-
  // list items also accept the new optional editorial fields
  // (whenItMayBeOkay, betterAlternative, customerFacingCopy) which
  // JSON.stringify carries through transparently.
  const catalogObject: any = {
    topic: source.topic,
    scopeVariantId: source.scopeVariantId,
    scenarios: source.scenarios,
    slots: scopeSlots,
    skipList: source.skipList,
    scenarioDefaults: source.scenarioDefaults,
  }
  if (source.metadata) {
    if (source.metadata.smartCartPromise) {
      catalogObject.smartCartPromise = source.metadata.smartCartPromise
    }
    if (source.metadata.primaryCustomerPain) {
      catalogObject.primaryCustomerPain = source.metadata.primaryCustomerPain
    }
    if (source.metadata.valueProposition) {
      catalogObject.valueProposition = source.metadata.valueProposition
    }
    if (source.metadata.routeOutRules?.length) {
      catalogObject.routeOutRules = source.metadata.routeOutRules
    }
    if (source.metadata.seasonalUrgency) {
      catalogObject.seasonalUrgency = source.metadata.seasonalUrgency
    }
  }

  const body = `// V7.2.5 — Trimmed ${source.scopeVariantId} scope catalog.
//
// Generated by scripts/ingest-catalog.ts from
// scripts/source-catalogs/${filename}.
// Editorial layer only. Product data lives in
// src/content/smart-cart/universe.ts.

import type { ScopeCatalog } from '@/lib/smart-cart-model'

export const ${exportName}: ScopeCatalog = ${JSON.stringify(catalogObject, null, 2)}
`
  fs.writeFileSync(filepath, body, 'utf8')
  return filepath
}

// ---------- Main ----------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2))
  console.log(`Ingesting ${args.sourcePath} ...`)

  const source = await loadSource(args.sourcePath)
  const existing = await loadExistingUniverse()
  const result = ingestSource(source, existing)

  console.log(`  scope: ${source.scopeVariantId}`)
  console.log(`  slots: ${source.slots.length}`)
  console.log(`  skip items: ${source.skipList.length}`)
  console.log(`  new universe entries: ${result.newProducts.length}`)
  console.log(`  merged with existing: ${result.mergedProductIds.length}`)
  for (const id of result.mergedProductIds) {
    console.log(`    ↪ ${id}`)
  }
  if (result.decisionsNeeded.length > 0) {
    console.log('  decisions needed:')
    for (const d of result.decisionsNeeded) console.log(`    [ ] ${d}`)
  }

  // Write scope catalog file
  const scopePath = writeScopeCatalogFile(args.outDir, source, result.scopeSlots)
  console.log(`Wrote ${scopePath}`)

  // V7.2.5 — auto-append new entries to universe.ts. Replaces the
  // v7.2.4 manual-paste workflow.
  const appended = appendUniverseEntries(result.newProducts)
  console.log(`Appended ${appended} new entries to src/content/smart-cart/universe.ts`)

  // Keep the diff output around for operator visibility (logged
  // after the file write so the operator can spot-check what landed).
  if (result.newProducts.length > 0) {
    console.log('\nNew universe entries (also written to universe.ts):\n')
    for (const p of result.newProducts) {
      process.stdout.write(emitUniverseEntry(p))
    }
  }
}

main().catch(e => {
  console.error('Ingestion failed:', e)
  process.exit(1)
})
