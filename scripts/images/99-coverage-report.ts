// v7.2.7 — coverage report.
//
// Reads:
//   - audit-output.json
//   - manufacturer-results.json
//   - pexels-results.json
//   - scans public/product-images/ for landed assets
//
// Emits a per-tier coverage table + per-topic breakdown +
// list of entries on default fallback.
//
// Usage:
//   npx tsx scripts/images/99-coverage-report.ts

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { UNIVERSE } from '../../src/content/smart-cart/universe'

const PUBLIC_IMAGES = 'public/product-images'
const CATEGORIES = 'public/product-images/categories'

interface MfrResult {
  universeId: string
  status: string
  source?: string
}
interface PexelsResult {
  universeId: string
  status: string
}

function loadJsonOrNull<T>(path: string): T | null {
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function main() {
  const mfr = loadJsonOrNull<MfrResult[]>('scripts/images/manufacturer-results.json') ?? []
  const pex = loadJsonOrNull<PexelsResult[]>('scripts/images/pexels-results.json') ?? []
  const ai = loadJsonOrNull<{ universeId: string; status: string }[]>('scripts/images/ai-illustrations-results.json') ?? []
  const mfrOk = new Set(mfr.filter(r => r.status === 'ok').map(r => r.universeId))
  const pexOk = new Set(pex.filter(r => r.status === 'ok').map(r => r.universeId))
  const aiOk = new Set(ai.filter(r => r.status === 'ok').map(r => r.universeId))

  const tier: Record<string, string[]> = {
    tier1_manufacturer: [],
    tier3_pexels: [],
    tier4_ai_illustration: [],
    tier4_fn_icon: [],
    tier4_topic_icon: [],
    tier4_default_icon: [],
  }

  const byTopic: Record<string, { total: number; tier1: number; tier3: number; ai: number; tier4: number }> = {}

  for (const p of UNIVERSE) {
    const topic = p.tags.topics[0] ?? 'unknown'
    if (!byTopic[topic]) byTopic[topic] = { total: 0, tier1: 0, tier3: 0, ai: 0, tier4: 0 }
    byTopic[topic].total += 1

    if (mfrOk.has(p.universeId) && existsSync(join(PUBLIC_IMAGES, `${p.universeId}.webp`))) {
      tier.tier1_manufacturer.push(p.universeId)
      byTopic[topic].tier1 += 1
      continue
    }
    if (pexOk.has(p.universeId) && existsSync(join(PUBLIC_IMAGES, `${p.universeId}.webp`))) {
      tier.tier3_pexels.push(p.universeId)
      byTopic[topic].tier3 += 1
      continue
    }
    if (aiOk.has(p.universeId) && existsSync(join(PUBLIC_IMAGES, `${p.universeId}.webp`))) {
      tier.tier4_ai_illustration.push(p.universeId)
      byTopic[topic].ai += 1
      continue
    }
    // Tier 4 split
    let landed = false
    for (const fn of p.tags.functions) {
      if (existsSync(join(CATEGORIES, `${fn}.svg`))) {
        tier.tier4_fn_icon.push(p.universeId)
        byTopic[topic].tier4 += 1
        landed = true
        break
      }
    }
    if (landed) continue
    for (const t of p.tags.topics) {
      if (existsSync(join(CATEGORIES, `_topic-${t}.svg`))) {
        tier.tier4_topic_icon.push(p.universeId)
        byTopic[topic].tier4 += 1
        landed = true
        break
      }
    }
    if (landed) continue
    tier.tier4_default_icon.push(p.universeId)
    byTopic[topic].tier4 += 1
  }

  const total = UNIVERSE.length
  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: total,
    coverage: {
      tier1_manufacturer: tier.tier1_manufacturer.length,
      tier3_pexels: tier.tier3_pexels.length,
      tier4_ai_illustration: tier.tier4_ai_illustration.length,
      tier4_fn_icon: tier.tier4_fn_icon.length,
      tier4_topic_icon: tier.tier4_topic_icon.length,
      tier4_default_icon: tier.tier4_default_icon.length,
    },
    byTopic,
    defaultIconEntries: tier.tier4_default_icon,
    topicIconEntries: tier.tier4_topic_icon,
    aiEntries: tier.tier4_ai_illustration,
  }

  writeFileSync('scripts/images/coverage-report.json', JSON.stringify(report, null, 2))

  console.log('=== v7.2.7 image coverage ===')
  console.log(`Total products: ${total}`)
  console.log('')
  console.log('By tier:')
  for (const [k, v] of Object.entries(report.coverage)) {
    const pct = ((v / total) * 100).toFixed(1)
    console.log(`  ${k.padEnd(22)} ${String(v).padStart(3)}  (${pct}%)`)
  }
  console.log('')
  console.log('By topic:')
  for (const [topic, c] of Object.entries(byTopic).sort()) {
    console.log(
      `  ${topic.padEnd(16)} total=${c.total}  t1=${c.tier1}  t3=${c.tier3}  ai=${c.ai}  t4=${c.tier4}`,
    )
  }
  if (report.coverage.tier4_default_icon > 0) {
    console.log('')
    console.log(`Note: ${report.coverage.tier4_default_icon} entries fell to default icon.`)
  }
}

main()
