/**
 * Static wiring test — no LLM, no Anthropic key needed.
 *
 * Verifies that buildScopeContext (well, its underlying registry lookup +
 * projection) returns real scope data, not the empty stub. Run via:
 *
 *   npx tsx scripts/test-scope-wiring.ts <scopeId>
 *
 * Used during v7.3.2-B to validate the wiring before the cron sees it.
 */

import { getAllCatalogs } from '@/content/smart-cart'
import type { ScopeCatalog } from '@/lib/smart-cart-model'

const scopeId = process.argv[2] || 'window_weatherization'

const catalog: ScopeCatalog | undefined = getAllCatalogs().find(
  (c) => c.scopeVariantId === scopeId
)

if (!catalog) {
  console.error(`[test-scope-wiring] scopeId="${scopeId}" not in registry`)
  console.error(
    `Available: ${getAllCatalogs()
      .map((c) => c.scopeVariantId)
      .join(', ')}`
  )
  process.exit(1)
}

console.log(`===== ${scopeId} wiring projection =====`)
console.log(`existingProducts (${catalog.slots.length}):`)
for (const s of catalog.slots) {
  console.log(`  - ${s.slotId} / ${s.slotKind} / ${s.slotLabel}`)
}
console.log(`\nexistingSkipItems (${catalog.skipList.length}):`)
for (const sk of catalog.skipList) console.log(`  - ${sk.title}`)

const routes = catalog.routeOutRules ?? []
console.log(`\nexistingRouteOuts (${routes.length}):`)
for (const r of routes) {
  console.log(`  - ${r.condition} -> ${r.destination}: ${r.reason.slice(0, 80)}...`)
}

const desc = [
  catalog.smartCartPromise,
  catalog.primaryCustomerPain,
  catalog.valueProposition,
]
  .filter(Boolean)
  .join(' ')
  .trim()
console.log(`\nscopeDescription (${desc.length} chars):`)
console.log(`  ${desc.slice(0, 240)}${desc.length > 240 ? '...' : ''}`)
