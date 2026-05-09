// v7.2.7 — Smart Cart product-image audit.
//
// Classifies every UniverseProduct into one of four image-source
// classes and emits an audit JSON the rest of the v7.2.7 pipeline
// reads as its worklist.
//
// Classes:
//   SPECIFIC        — variant.amazonAsin set. A specific SKU is in scope.
//   CATEGORY_BRAND  — Amazon search URL + productName names a specific
//                     brand (used for editorial honesty: a Pexels stock
//                     photo here misleads, so these route to vendor
//                     outreach / Tier-4 SVG fallback in v7.2.7).
//   CATEGORY_GENERIC — Amazon search URL + productName generic. Pexels
//                     is editorially honest here.
//   SERVICE         — affiliateUrl is empty or non-Amazon (route-outs,
//                     rental links, etc.). Concept illustration only.
//
// Usage:
//   npx tsx scripts/images/01-audit-products.ts
//
// Output: scripts/images/audit-output.json

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { UNIVERSE } from '../../src/content/smart-cart/universe'
import type { UniverseProduct } from '../../src/lib/smart-cart-universe'

type ImageClass =
  | 'SPECIFIC'
  | 'CATEGORY_BRAND'
  | 'CATEGORY_GENERIC'
  | 'SERVICE'

interface AuditEntry {
  universeId: string
  productName: string
  imageClass: ImageClass
  amazonAsin?: string
  affiliateUrl: string
  topics: string[]
  functions: string[]
  brandHeuristic?: string
}

// Generic-noun starters — productName begins with one of these and we
// treat the entry as CATEGORY_GENERIC even though Amazon search is the
// affiliate target. Examples: "Generic 100-piece drill bit set",
// "Foam hose bib cover (single)".
const GENERIC_STARTERS = new Set([
  'generic',
  'foam',
  'pipe',
  'outdoor',
  'indoor',
  'standard',
  'basic',
  'simple',
  'plastic',
  'metal',
  'wood',
  'rubber',
  'silicone',
  'magnetic',
  'led',
  'usb',
  'wifi',
  'smart',
  'cordless',
])

function classify(p: UniverseProduct): ImageClass {
  const url = p.variant.affiliateUrl ?? ''
  const isAmazon = /amazon\.com\//.test(url)

  if (!isAmazon) return 'SERVICE'
  if (p.variant.amazonAsin) return 'SPECIFIC'

  // Heuristic: brand-prominent if first word is title-cased AND not in
  // the generic-noun whitelist. "Polywood Adirondack..." → BRAND;
  // "Generic 100-piece..." → GENERIC; "DEWALT DWA1184..." → BRAND.
  const firstWord = p.variant.productName.trim().split(/\s+/)[0] ?? ''
  const lower = firstWord.toLowerCase()
  if (GENERIC_STARTERS.has(lower)) return 'CATEGORY_GENERIC'

  // All-caps (DEWALT, KREG) or TitleCase (Polywood) = brand.
  const isBrandShape = /^[A-Z]/.test(firstWord) && firstWord.length > 1
  return isBrandShape ? 'CATEGORY_BRAND' : 'CATEGORY_GENERIC'
}

function brandHeuristic(p: UniverseProduct): string | undefined {
  const firstWord = p.variant.productName.trim().split(/\s+/)[0]
  if (!firstWord) return undefined
  if (GENERIC_STARTERS.has(firstWord.toLowerCase())) return undefined
  if (!/^[A-Z]/.test(firstWord)) return undefined
  return firstWord
}

function main() {
  const entries: AuditEntry[] = UNIVERSE.map(p => ({
    universeId: p.universeId,
    productName: p.variant.productName,
    imageClass: classify(p),
    amazonAsin: p.variant.amazonAsin,
    affiliateUrl: p.variant.affiliateUrl,
    topics: p.tags.topics,
    functions: p.tags.functions,
    brandHeuristic: brandHeuristic(p),
  }))

  const byClass: Record<ImageClass, AuditEntry[]> = {
    SPECIFIC: [],
    CATEGORY_BRAND: [],
    CATEGORY_GENERIC: [],
    SERVICE: [],
  }
  for (const e of entries) byClass[e.imageClass].push(e)

  const summary = {
    total: entries.length,
    byClass: {
      SPECIFIC: byClass.SPECIFIC.length,
      CATEGORY_BRAND: byClass.CATEGORY_BRAND.length,
      CATEGORY_GENERIC: byClass.CATEGORY_GENERIC.length,
      SERVICE: byClass.SERVICE.length,
    },
    distinctBrands: Array.from(
      new Set(byClass.CATEGORY_BRAND.map(e => e.brandHeuristic).filter(Boolean)),
    ).sort(),
  }

  const output = {
    generatedAt: new Date().toISOString(),
    summary,
    byClass,
    entries,
  }

  const outPath = join(__dirname, 'audit-output.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log('=== v7.2.7 product-image audit ===')
  console.log(`Total universe entries: ${summary.total}`)
  console.log('')
  console.log('By image class:')
  console.log(`  SPECIFIC         (has amazonAsin):     ${summary.byClass.SPECIFIC}`)
  console.log(`  CATEGORY_BRAND   (search URL, brand):  ${summary.byClass.CATEGORY_BRAND}`)
  console.log(`  CATEGORY_GENERIC (search URL, generic): ${summary.byClass.CATEGORY_GENERIC}`)
  console.log(`  SERVICE          (no Amazon URL):      ${summary.byClass.SERVICE}`)
  console.log('')
  console.log(`Distinct brands detected: ${summary.distinctBrands.length}`)
  console.log(`Output: ${outPath}`)

  // Plan declared 15 + 165 + 23 = 203. Reconcile.
  const PLAN_TOTAL = 203
  if (summary.total !== PLAN_TOTAL) {
    console.log('')
    console.log(`*** GAP: plan assumed ${PLAN_TOTAL}, audit found ${summary.total} ***`)
    console.log(`    Delta: +${summary.total - PLAN_TOTAL} entries unaccounted for in plan.`)
  }
}

main()
