// v7.2.9 — emit src/lib/image-source-manifest.json mapping image URL
// → source class. The runtime CategoryTag reads this manifest to
// label thumbnails (Illustration / Stock / Category / nothing for
// real product photos).
//
// Keyed by imageUrl path because multiple universeIds resolve to the
// same path (SVG fallbacks shared by category) and the variant
// rendered at runtime carries the path, not the universeId.
//
// Source classes:
//   manufacturer    — Tier 1 real product photo
//   pexels          — Tier 3 stock
//   ai_illustration — Tier 4 AI-generated illustration
//   svg_fallback    — Tier 4 Lucide category icon
//
// Usage:
//   npx tsx scripts/images/09-write-source-manifest.ts

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { UNIVERSE } from '../../src/content/smart-cart/universe'

type Source = 'manufacturer' | 'pexels' | 'ai_illustration' | 'svg_fallback'

interface ResultsItem {
  universeId: string
  status: string
}

function loadOk(path: string): Set<string> {
  if (!existsSync(path)) return new Set()
  const arr: ResultsItem[] = JSON.parse(readFileSync(path, 'utf8'))
  return new Set(arr.filter(r => r.status === 'ok').map(r => r.universeId))
}

function main() {
  const mfr = loadOk('scripts/images/manufacturer-results.json')
  const pex = loadOk('scripts/images/pexels-results.json')
  const ai = loadOk('scripts/images/ai-illustrations-results.json')

  const manifest: Record<string, Source> = {}
  for (const p of UNIVERSE) {
    const url = p.variant.imageUrl ?? ''
    if (!url) continue
    let source: Source
    if (mfr.has(p.universeId)) source = 'manufacturer'
    else if (pex.has(p.universeId)) source = 'pexels'
    else if (ai.has(p.universeId)) source = 'ai_illustration'
    else source = 'svg_fallback'
    // If two universeIds resolve to the same url, last write wins; the
    // values should match because the resolution is deterministic per
    // path. SVG paths get 'svg_fallback' from any svg-served entry.
    manifest[url] = source
  }

  writeFileSync(
    'src/lib/image-source-manifest.json',
    JSON.stringify(manifest, null, 2),
  )

  const counts: Record<Source, number> = {
    manufacturer: 0,
    pexels: 0,
    ai_illustration: 0,
    svg_fallback: 0,
  }
  for (const v of Object.values(manifest)) counts[v] += 1
  console.log('=== image-source manifest ===')
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(18)} ${v}`)
  console.log(`Output: src/lib/image-source-manifest.json (${Object.keys(manifest).length} unique URLs)`)
}

main()
