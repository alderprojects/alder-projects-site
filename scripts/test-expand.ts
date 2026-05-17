/**
 * One-shot test harness for catalog expansion.
 *
 * Usage:
 *   npx tsx scripts/test-expand.ts <scopeId>
 *   npx tsx scripts/test-expand.ts window_weatherization
 *
 * Calls runExpansion() once for the specified scope, prints the result
 * JSON. The candidates land in CatalogExpansionCandidate as usual.
 *
 * Used during v7.3.2-B to validate that buildScopeContext is wired to
 * the real ScopeCatalog registry — rationale text on generated
 * candidates should reference actual scope slots, skip items, and
 * route-out rules rather than generic Claude knowledge.
 */

import { runExpansion } from '@/lib/catalog/expand'

const scopeId = process.argv[2] || 'window_weatherization'

async function main() {
  console.log(`[test-expand] running expansion for scope=${scopeId}`)
  const result = await runExpansion({ scopeId })
  console.log(JSON.stringify(result, null, 2))
}

main().catch((e) => {
  console.error('[test-expand] failed:', e)
  process.exit(1)
})
