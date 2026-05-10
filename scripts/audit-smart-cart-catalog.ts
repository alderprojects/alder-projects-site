// scripts/audit-smart-cart-catalog.ts
//
// Run: npx tsx scripts/audit-smart-cart-catalog.ts > catalog-audit.md
//
// Reads universe + all scope catalogs and the SCOPE_VARIANTS registry,
// runs gate checks against the actual ScopeCatalog/UniverseProduct
// schema (v7.2.5/v7.2.6), and outputs a markdown report covering:
//   1. Universe health
//   2. Per-scope audit (picks, skips, savings credibility, route-out)
//   3. Gap analysis: variant inventory vs catalog coverage,
//      universe products unused by any scope, missing topic coverage.

import { getAllCatalogs, getUniverse } from '../src/content/smart-cart'
import {
  SCOPE_VARIANTS,
  getReadyVariants,
} from '../src/lib/scope-variants'
import type {
  ScopeCatalog,
  ScopeCatalogSkipItem,
  ScopeCatalogSlot,
} from '../src/lib/smart-cart-model'
import type { UniverseProduct } from '../src/lib/smart-cart-universe'

// ---------- Credibility thresholds ----------------------------------

const CREDIBLE_SAVINGS_PER_PICK_MIN = 30
const CREDIBLE_SAVINGS_PER_PICK_MAX = 400
const MIN_PICKS_FOR_LAUNCH = 6
const PICK_EXPAND_THRESHOLD = 8

// ---------- Per-scope audit -----------------------------------------

interface ScopeAudit {
  topic: string
  scopeVariantId: string
  pickCount: number
  coreSlotCount: number
  addonSlotCount: number
  slotsConditionalOnly: number     // slots that only show when alreadyHave is empty for the flag
  skipCount: number
  skipTypeA: number                // wrong_version (has amountSaved)
  skipTypeB: number                // wrong_category (no amountSaved)
  skipMissingAmountSaved: number   // Type A skips missing or zero amountSaved
  totalSavingsLow: number
  totalSavingsHigh: number
  savingsPerPickHigh: number
  hasRouteOut: boolean
  hasPromise: boolean
  hasValueProp: boolean
  scenarioCount: number
  flags: string[]
  status: 'launch-ready' | 'fixable' | 'hide-or-rebuild'
}

function auditScope(catalog: ScopeCatalog): ScopeAudit {
  const flags: string[] = []

  const slots = catalog.slots ?? []
  const skips = catalog.skipList ?? []

  const pickCount = slots.length
  const coreSlotCount = slots.filter((s) => s.slotKind === 'core').length
  const addonSlotCount = slots.filter((s) => s.slotKind === 'addon').length
  const slotsConditionalOnly = slots.filter(
    (s) => s.conditionalOn && s.conditionalOn.length > 0,
  ).length

  const skipCount = skips.length
  const typeA = skips.filter((s) => s.type === 'wrong_version')
  const typeB = skips.filter((s) => s.type === 'wrong_category')
  const skipTypeA = typeA.length
  const skipTypeB = typeB.length

  const skipMissingAmountSaved = typeA.filter(
    (s) =>
      !s.amountSaved ||
      (s.amountSaved.low === 0 && s.amountSaved.high === 0),
  ).length

  const totalSavingsLow = typeA.reduce(
    (sum, s) => sum + (s.amountSaved?.low ?? 0),
    0,
  )
  const totalSavingsHigh = typeA.reduce(
    (sum, s) => sum + (s.amountSaved?.high ?? 0),
    0,
  )
  const savingsPerPickHigh = pickCount > 0 ? totalSavingsHigh / pickCount : 0

  const hasRouteOut = Array.isArray(catalog.routeOutRules)
    ? catalog.routeOutRules.length > 0
    : false
  const hasPromise = Boolean(catalog.smartCartPromise)
  const hasValueProp = Boolean(catalog.valueProposition)
  const scenarioCount = catalog.scenarios?.length ?? 0

  // ---------- Flags ----------

  if (pickCount < MIN_PICKS_FOR_LAUNCH) {
    flags.push(
      `PICK_COUNT_LOW: ${pickCount} picks (min ${MIN_PICKS_FOR_LAUNCH})`,
    )
  }
  if (skipCount === 0) {
    flags.push(`NO_SKIP_ITEMS: scope has no skip list at all`)
  }
  if (skipTypeA === 0 && skipCount > 0) {
    flags.push(
      `NO_TYPE_A_SKIPS: ${skipCount} skips but none are wrong_version (no $ savings)`,
    )
  }
  if (skipMissingAmountSaved > 0) {
    flags.push(
      `SKIP_MISSING_SAVINGS: ${skipMissingAmountSaved}/${skipTypeA} Type-A skips missing amountSaved`,
    )
  }
  if (totalSavingsHigh === 0 && skipCount > 0) {
    flags.push(
      `ZERO_SAVINGS: ${skipCount} skip items present but total savings is $0`,
    )
  }
  if (
    pickCount > 0 &&
    savingsPerPickHigh > 0 &&
    savingsPerPickHigh < CREDIBLE_SAVINGS_PER_PICK_MIN
  ) {
    flags.push(
      `SAVINGS_PER_PICK_LOW: $${savingsPerPickHigh.toFixed(0)}/pick (floor $${CREDIBLE_SAVINGS_PER_PICK_MIN})`,
    )
  }
  if (pickCount > 0 && savingsPerPickHigh > CREDIBLE_SAVINGS_PER_PICK_MAX) {
    flags.push(
      `SAVINGS_PER_PICK_HIGH: $${savingsPerPickHigh.toFixed(0)}/pick (ceiling $${CREDIBLE_SAVINGS_PER_PICK_MAX}) — recalibrate or add route-out`,
    )
  }
  if (!hasRouteOut && savingsPerPickHigh > CREDIBLE_SAVINGS_PER_PICK_MAX) {
    flags.push(`MISSING_ROUTE_OUT: high savings without route-out rules`)
  }
  if (pickCount > PICK_EXPAND_THRESHOLD) {
    flags.push(
      `LARGE_PICK_SET: ${pickCount} picks — verify default-expand UI behavior`,
    )
  }
  if (!hasPromise) flags.push(`MISSING_PROMISE: no smartCartPromise set`)
  if (!hasValueProp) flags.push(`MISSING_VALUE_PROP: no valueProposition set`)
  if (scenarioCount === 0) flags.push(`NO_SCENARIOS: scenarios array empty`)

  // ---------- Status ----------

  const blocking = flags.filter(
    (f) =>
      f.startsWith('PICK_COUNT_LOW') ||
      f.startsWith('ZERO_SAVINGS') ||
      f.startsWith('SAVINGS_PER_PICK_HIGH') ||
      f.startsWith('NO_SKIP_ITEMS') ||
      f.startsWith('NO_TYPE_A_SKIPS'),
  )

  let status: ScopeAudit['status']
  if (blocking.length === 0 && flags.length === 0) status = 'launch-ready'
  else if (blocking.length === 0) status = 'fixable'
  else status = 'hide-or-rebuild'

  return {
    topic: catalog.topic,
    scopeVariantId: catalog.scopeVariantId,
    pickCount,
    coreSlotCount,
    addonSlotCount,
    slotsConditionalOnly,
    skipCount,
    skipTypeA,
    skipTypeB,
    skipMissingAmountSaved,
    totalSavingsLow,
    totalSavingsHigh,
    savingsPerPickHigh,
    hasRouteOut,
    hasPromise,
    hasValueProp,
    scenarioCount,
    flags,
    status,
  }
}

// ---------- Universe checks -----------------------------------------

interface UniverseAudit {
  total: number
  byTopic: Record<string, number>
  byTier: Record<string, number>
  byRole: Record<string, number>
  missingPrice: string[]
  missingImage: string[]
  missingAffiliate: string[]
  missingFunctions: string[]
  unusedByAnyScope: string[]      // universeIds no scope references via mustHaveFunctions/topics
  duplicateProductNames: string[]
}

function auditUniverse(
  universe: UniverseProduct[],
  catalogs: ScopeCatalog[],
): UniverseAudit {
  const byTopic: Record<string, number> = {}
  const byTier: Record<string, number> = {}
  const byRole: Record<string, number> = {}
  const missingPrice: string[] = []
  const missingImage: string[] = []
  const missingAffiliate: string[] = []
  const missingFunctions: string[] = []

  for (const p of universe) {
    for (const t of p.tags.topics) byTopic[t] = (byTopic[t] ?? 0) + 1
    byTier[p.tags.tier] = (byTier[p.tags.tier] ?? 0) + 1
    for (const r of p.tags.roles) byRole[r] = (byRole[r] ?? 0) + 1

    const v = p.variant
    if (!v.priceLow && !v.priceHigh) missingPrice.push(p.universeId)
    if (!v.imageUrl) missingImage.push(p.universeId)
    if (!v.affiliateUrl) missingAffiliate.push(p.universeId)
    if (!p.tags.functions || p.tags.functions.length === 0)
      missingFunctions.push(p.universeId)
  }

  // Determine which universe products are referenced by any scope
  // catalog. A product is "used" if its function tags overlap with any
  // tierQuery's mustHaveFunctions in any slot, AND topics overlap.
  const referencedFunctions = new Set<string>()
  const referencedTopics = new Set<string>()
  for (const c of catalogs) {
    for (const slot of c.slots) {
      for (const tier of ['budget', 'sweet_spot', 'premium'] as const) {
        const q = slot.tierQueries[tier]
        if (!q) continue
        for (const f of q.mustHaveFunctions ?? [])
          referencedFunctions.add(f)
        for (const t of q.mustHaveTopics ?? []) referencedTopics.add(t)
      }
    }
  }

  const unusedByAnyScope: string[] = []
  for (const p of universe) {
    const fnHit = p.tags.functions.some((f) => referencedFunctions.has(f))
    const topicHit = p.tags.topics.some((t) =>
      referencedTopics.has(t as string),
    )
    if (!fnHit || !topicHit) unusedByAnyScope.push(p.universeId)
  }

  // Duplicate product names (display collisions)
  const nameCounts: Record<string, number> = {}
  for (const p of universe) {
    const name = p.variant.productName
    nameCounts[name] = (nameCounts[name] ?? 0) + 1
  }
  const duplicateProductNames = Object.entries(nameCounts)
    .filter(([, n]) => n > 1)
    .map(([name, n]) => `${name} (×${n})`)

  return {
    total: universe.length,
    byTopic,
    byTier,
    byRole,
    missingPrice,
    missingImage,
    missingAffiliate,
    missingFunctions,
    unusedByAnyScope,
    duplicateProductNames,
  }
}

// ---------- Gap analysis --------------------------------------------

interface GapAnalysis {
  variantsTotal: number
  variantsReadyFlagged: number
  variantsReadyWithCatalog: string[]      // ready=true AND catalog exists
  variantsReadyMissingCatalog: string[]   // ready=true AND no catalog
  variantsNotReady: string[]              // ready=false (the SEO/paid backlog)
  catalogsWithoutReadyFlag: string[]      // catalog exists but variant ready=false (mismatch)
  topicsWithVariants: string[]
  topicsWithoutVariants: string[]
  variantsByTopic: Record<string, { id: string; ready: boolean }[]>
}

function gapAnalysis(catalogs: ScopeCatalog[]): GapAnalysis {
  const ready = new Set(getReadyVariants().map((v) => `${v.topic}/${v.id}`))
  const catalogKeys = new Set(
    catalogs.map((c) => `${c.topic}/${c.scopeVariantId}`),
  )

  const variantsReadyWithCatalog: string[] = []
  const variantsReadyMissingCatalog: string[] = []
  const variantsNotReady: string[] = []
  const catalogsWithoutReadyFlag: string[] = []
  const topicsWithVariants: string[] = []
  const topicsWithoutVariants: string[] = []
  const variantsByTopic: GapAnalysis['variantsByTopic'] = {}

  let variantsTotal = 0
  let variantsReadyFlagged = 0

  for (const [topic, variants] of Object.entries(SCOPE_VARIANTS)) {
    if (variants.length === 0) {
      topicsWithoutVariants.push(topic)
      continue
    }
    topicsWithVariants.push(topic)
    variantsByTopic[topic] = variants.map((v) => ({
      id: v.id,
      ready: v.smartCartReady,
    }))
    for (const v of variants) {
      variantsTotal++
      const key = `${v.topic}/${v.id}`
      if (v.smartCartReady) {
        variantsReadyFlagged++
        if (catalogKeys.has(key)) variantsReadyWithCatalog.push(key)
        else variantsReadyMissingCatalog.push(key)
      } else {
        variantsNotReady.push(key)
      }
    }
  }

  for (const key of Array.from(catalogKeys)) {
    if (!ready.has(key)) catalogsWithoutReadyFlag.push(key)
  }

  return {
    variantsTotal,
    variantsReadyFlagged,
    variantsReadyWithCatalog,
    variantsReadyMissingCatalog,
    variantsNotReady,
    catalogsWithoutReadyFlag,
    topicsWithVariants,
    topicsWithoutVariants,
    variantsByTopic,
  }
}

// ---------- Markdown render -----------------------------------------

function renderReport(
  scopeAudits: ScopeAudit[],
  universeAudit: UniverseAudit,
  gaps: GapAnalysis,
): string {
  const out: string[] = []
  out.push(`# Smart Cart Catalog Audit`)
  out.push(`Generated: ${new Date().toISOString()}`)
  out.push(``)

  // ---------- Headline ----------
  const counts = scopeAudits.reduce(
    (acc, a) => {
      acc[a.status]++
      return acc
    },
    { 'launch-ready': 0, fixable: 0, 'hide-or-rebuild': 0 } as Record<
      string,
      number
    >,
  )
  out.push(`## Headline`)
  out.push(``)
  out.push(
    `- **Catalogs:** ${scopeAudits.length} (launch-ready ${counts['launch-ready']}, fixable ${counts.fixable}, hide-or-rebuild ${counts['hide-or-rebuild']})`,
  )
  out.push(
    `- **Variants in registry:** ${gaps.variantsTotal} total / ${gaps.variantsReadyFlagged} flagged smartCartReady=true`,
  )
  out.push(
    `- **Variants with smartCartReady=false (SEO/paid backlog):** ${gaps.variantsNotReady.length}`,
  )
  out.push(`- **Universe products:** ${universeAudit.total}`)
  out.push(
    `- **Universe products NOT referenced by any scope:** ${universeAudit.unusedByAnyScope.length}`,
  )
  out.push(``)

  // ---------- Triage table ----------
  out.push(`## Triage summary (per scope)`)
  out.push(``)
  out.push(
    `| Scope | Picks (core/addon) | Skips (A/B) | Savings $low–$high | $/pick (high) | Promise | ValueProp | RouteOut | Status | Flags |`,
  )
  out.push(`|---|---|---|---|---|---|---|---|---|---|`)
  for (const a of scopeAudits) {
    out.push(
      `| \`${a.topic}/${a.scopeVariantId}\` | ${a.pickCount} (${a.coreSlotCount}/${a.addonSlotCount}) | ${a.skipCount} (${a.skipTypeA}/${a.skipTypeB}) | $${a.totalSavingsLow}–$${a.totalSavingsHigh} | $${a.savingsPerPickHigh.toFixed(0)} | ${a.hasPromise ? 'y' : '—'} | ${a.hasValueProp ? 'y' : '—'} | ${a.hasRouteOut ? 'y' : '—'} | ${a.status} | ${a.flags.length} |`,
    )
  }
  out.push(``)

  // ---------- Per-scope detail ----------
  out.push(`## Per-scope detail`)
  for (const a of scopeAudits) {
    out.push(``)
    out.push(`### \`${a.topic}/${a.scopeVariantId}\` — ${a.status}`)
    out.push(`- Picks: ${a.pickCount} (core ${a.coreSlotCount}, addon ${a.addonSlotCount}, conditional ${a.slotsConditionalOnly})`)
    out.push(
      `- Skip items: ${a.skipCount} — Type A (wrong_version, $-saving) ${a.skipTypeA}, Type B (wrong_category) ${a.skipTypeB}, missing-amountSaved ${a.skipMissingAmountSaved}`,
    )
    out.push(
      `- Total savings: $${a.totalSavingsLow}–$${a.totalSavingsHigh} (high $/pick: $${a.savingsPerPickHigh.toFixed(0)})`,
    )
    out.push(`- Scenarios authored: ${a.scenarioCount}`)
    out.push(
      `- Has: promise=${a.hasPromise} valueProp=${a.hasValueProp} routeOut=${a.hasRouteOut}`,
    )
    if (a.flags.length === 0) out.push(`- Flags: none`)
    else {
      out.push(`- Flags:`)
      for (const f of a.flags) out.push(`  - ${f}`)
    }
  }

  // ---------- Universe ----------
  out.push(``)
  out.push(`## Universe health`)
  out.push(``)
  out.push(`- Total products: ${universeAudit.total}`)
  out.push(
    `- By topic: ${Object.entries(universeAudit.byTopic).map(([k, v]) => `${k}=${v}`).join(', ')}`,
  )
  out.push(
    `- By tier: ${Object.entries(universeAudit.byTier).map(([k, v]) => `${k}=${v}`).join(', ')}`,
  )
  out.push(
    `- By role: ${Object.entries(universeAudit.byRole).map(([k, v]) => `${k}=${v}`).join(', ')}`,
  )
  out.push(`- Missing price: ${universeAudit.missingPrice.length}`)
  if (universeAudit.missingPrice.length > 0)
    out.push(`  - ${universeAudit.missingPrice.slice(0, 20).join(', ')}${universeAudit.missingPrice.length > 20 ? `, … +${universeAudit.missingPrice.length - 20}` : ''}`)
  out.push(`- Missing image: ${universeAudit.missingImage.length}`)
  if (universeAudit.missingImage.length > 0)
    out.push(`  - ${universeAudit.missingImage.slice(0, 20).join(', ')}${universeAudit.missingImage.length > 20 ? `, … +${universeAudit.missingImage.length - 20}` : ''}`)
  out.push(`- Missing affiliate URL: ${universeAudit.missingAffiliate.length}`)
  if (universeAudit.missingAffiliate.length > 0)
    out.push(`  - ${universeAudit.missingAffiliate.slice(0, 20).join(', ')}${universeAudit.missingAffiliate.length > 20 ? `, … +${universeAudit.missingAffiliate.length - 20}` : ''}`)
  out.push(`- Missing function tags: ${universeAudit.missingFunctions.length}`)
  if (universeAudit.missingFunctions.length > 0)
    out.push(`  - ${universeAudit.missingFunctions.slice(0, 20).join(', ')}${universeAudit.missingFunctions.length > 20 ? `, … +${universeAudit.missingFunctions.length - 20}` : ''}`)
  out.push(
    `- Duplicate product names: ${universeAudit.duplicateProductNames.length}`,
  )
  if (universeAudit.duplicateProductNames.length > 0)
    out.push(`  - ${universeAudit.duplicateProductNames.slice(0, 20).join('; ')}`)
  out.push(
    `- Universe products not referenced by any scope: ${universeAudit.unusedByAnyScope.length}`,
  )
  if (universeAudit.unusedByAnyScope.length > 0) {
    out.push(`  <details><summary>List</summary>`)
    out.push(``)
    for (const id of universeAudit.unusedByAnyScope.slice(0, 80))
      out.push(`  - ${id}`)
    if (universeAudit.unusedByAnyScope.length > 80)
      out.push(`  - … +${universeAudit.unusedByAnyScope.length - 80} more`)
    out.push(`  </details>`)
  }

  // ---------- Gap analysis ----------
  out.push(``)
  out.push(`## Gap analysis: variant inventory vs catalog coverage`)
  out.push(``)
  out.push(`### Topics with at least one variant`)
  out.push(`- ${gaps.topicsWithVariants.join(', ') || '(none)'}`)
  out.push(``)
  out.push(`### Topics with NO variants (SEO/paid blank slate)`)
  out.push(`- ${gaps.topicsWithoutVariants.join(', ') || '(none)'}`)
  out.push(``)
  out.push(`### Variants flagged smartCartReady=true and have a catalog`)
  for (const v of gaps.variantsReadyWithCatalog) out.push(`- ${v}`)
  out.push(``)
  out.push(`### Variants flagged smartCartReady=true but NO catalog (broken state)`)
  if (gaps.variantsReadyMissingCatalog.length === 0) out.push(`- (none)`)
  else for (const v of gaps.variantsReadyMissingCatalog) out.push(`- ${v}`)
  out.push(``)
  out.push(
    `### Variants flagged smartCartReady=false (the backlog — these are the SEO/paid-search gaps)`,
  )
  if (gaps.variantsNotReady.length === 0) out.push(`- (none)`)
  else for (const v of gaps.variantsNotReady) out.push(`- ${v}`)
  out.push(``)
  out.push(
    `### Catalogs that exist but the variant is not flagged ready (audit mismatch)`,
  )
  if (gaps.catalogsWithoutReadyFlag.length === 0) out.push(`- (none)`)
  else for (const v of gaps.catalogsWithoutReadyFlag) out.push(`- ${v}`)
  out.push(``)

  out.push(`### Variants by topic`)
  out.push(``)
  for (const [topic, vs] of Object.entries(gaps.variantsByTopic)) {
    out.push(`**${topic}** (${vs.length})`)
    for (const v of vs)
      out.push(`  - ${v.id} — ${v.ready ? 'READY' : 'not ready'}`)
  }

  return out.join('\n')
}

// ---------- Main ----------------------------------------------------

async function main() {
  const universe = getUniverse()
  const catalogs = getAllCatalogs()

  const scopeAudits = catalogs
    .map((c) => auditScope(c))
    .sort((a, b) => {
      const order: Record<ScopeAudit['status'], number> = {
        'hide-or-rebuild': 0,
        fixable: 1,
        'launch-ready': 2,
      }
      return (
        order[a.status] - order[b.status] ||
        a.topic.localeCompare(b.topic) ||
        a.scopeVariantId.localeCompare(b.scopeVariantId)
      )
    })

  const universeAudit = auditUniverse(universe, catalogs)
  const gaps = gapAnalysis(catalogs)
  const report = renderReport(scopeAudits, universeAudit, gaps)
  process.stdout.write(report)
}

main().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
