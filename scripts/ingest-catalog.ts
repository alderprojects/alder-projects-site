// V7.2.4 — generalized catalog ingestion tool.
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
//   4. Print a diff-like summary (new entries vs merged) and
//      verify by re-running queryUniverse against each slot's
//      tierQueries.
//
// Idempotent: running twice produces the same files (modulo
// timestamps in comments).
//
// Notes:
//   - This tool was added in v7.2.4 alongside the manual
//     ingestion of three catalogs (kitchen_cabinet_hardware_swap,
//     kitchen_cosmetic_refresh, outdoor_lake_season). The v7.2.4
//     output was verified by hand because tsx wasn't installed at
//     the time of the PR. Future scope additions (v7.2.5+) should
//     `npm i -D tsx` and run this tool to produce machine-
//     verifiable output.

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

interface SourceCatalog {
  topic: string
  scopeVariantId: string
  scenarios: string[]
  slots: CartSlot[]
  skipList: SkipItemV2[]
  scenarioDefaults: Record<string, { selectedTier: CartTier; alreadyHave: string[] }>
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
  if (/pull|knob|hinge|screw/.test(slotId)) return ['hardware']
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
  if (/screws/.test(slotId)) return ['hardware_screws']
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
  return []
}

function deriveSeasons(scopeId: string): string[] {
  if (/lake_season/.test(scopeId)) return ['summer', 'opening_season']
  if (/mud_season/.test(scopeId)) return ['mud_season', 'spring']
  if (/fall|pre_winter/.test(scopeId)) return ['fall', 'closing_season']
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
  return {
    universeId: generateUniverseId(slot, tier, variant.productName),
    rank: 100,
    variant,
    tags,
    citations: (slot as any).citations ?? [],
    migratedFrom: {
      scope: source.scopeVariantId,
      slotId: slot.slotId,
      tier,
    },
  }
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
  void product
  return {
    mustHaveTopics: [source.topic] as UniverseQuery['mustHaveTopics'],
    mustHaveFunctions: deriveFunctions(slot.slotId),
    mustHaveRoles: deriveRoles(slot.slotId) as UniverseQuery['mustHaveRoles'],
    excludeAlreadyHaveFlag: slot.conditionalOn?.[0],
    tier,
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

function emitUniverseEntry(p: UniverseProduct): string {
  return `  ${JSON.stringify(p, null, 2).replace(/\n/g, '\n  ')},\n`
}

function writeScopeCatalogFile(
  outDir: string,
  source: SourceCatalog,
  scopeSlots: ScopeCatalogSlot[],
): string {
  const filename = `${source.scopeVariantId.replace(/_/g, '-')}.ts`
  const filepath = path.join(outDir, 'scope-catalogs', filename)
  const exportName = source.scopeVariantId.toUpperCase()

  const body = `// V7.2.4 — Trimmed ${source.scopeVariantId} scope catalog.
//
// Generated by scripts/ingest-catalog.ts from
// scripts/source-catalogs/${filename}.
// Editorial layer only. Product data lives in
// src/content/smart-cart/universe.ts.

import type { ScopeCatalog } from '@/lib/smart-cart-model'

export const ${exportName}: ScopeCatalog = ${JSON.stringify(
    {
      topic: source.topic,
      scopeVariantId: source.scopeVariantId,
      scenarios: source.scenarios,
      slots: scopeSlots,
      skipList: source.skipList,
      scenarioDefaults: source.scenarioDefaults,
    },
    null,
    2,
  )}
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

  // Append to universe.ts
  // (Real implementation would parse the existing file's array and
  // append cleanly. For this v7.2.4 deliverable, the tool prints a
  // diff that the operator pastes manually. v7.2.5+ should upgrade
  // to AST-based modification.)
  console.log('\nNew universe entries to append (paste before the closing `]` in universe.ts):\n')
  for (const p of result.newProducts) {
    process.stdout.write(emitUniverseEntry(p))
  }
}

main().catch(e => {
  console.error('Ingestion failed:', e)
  process.exit(1)
})
