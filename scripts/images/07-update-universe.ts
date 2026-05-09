// v7.2.7 — populate variant.imageUrl across all entries in
// src/content/smart-cart/universe.ts.
//
// Resolution priority per universeId:
//   1. public/product-images/{universeId}.webp exists → use it
//   2. public/product-images/categories/{firstFunctionTag}.svg exists → use it
//   3. public/product-images/categories/_topic-{firstTopic}.svg exists → use it
//   4. public/product-images/categories/_package.svg (always exists)
//
// The resolved path is inserted as `imageUrl: '...'` line immediately
// before `productSpec:` inside each variant block. Idempotent: if an
// imageUrl line already exists, it's overwritten in place.
//
// Usage:
//   npx tsx scripts/images/07-update-universe.ts

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { UNIVERSE } from '../../src/content/smart-cart/universe'

const UNIVERSE_PATH = 'src/content/smart-cart/universe.ts'
const PUBLIC_IMAGES = 'public/product-images'
const CATEGORIES = 'public/product-images/categories'

function resolveImageUrl(universeId: string, functions: string[], topics: string[]): string {
  if (existsSync(join(PUBLIC_IMAGES, `${universeId}.webp`))) {
    return `/product-images/${universeId}.webp`
  }
  for (const fn of functions) {
    if (existsSync(join(CATEGORIES, `${fn}.svg`))) {
      return `/product-images/categories/${fn}.svg`
    }
  }
  for (const topic of topics) {
    if (existsSync(join(CATEGORIES, `_topic-${topic}.svg`))) {
      return `/product-images/categories/_topic-${topic}.svg`
    }
  }
  return '/product-images/categories/_package.svg'
}

interface UpdateMap {
  [universeId: string]: string
}

function buildUpdateMap(): UpdateMap {
  const map: UpdateMap = {}
  for (const p of UNIVERSE) {
    map[p.universeId] = resolveImageUrl(p.universeId, p.tags.functions, p.tags.topics)
  }
  return map
}

// Insert/replace imageUrl in each variant block by scanning the file
// line-by-line. The structure of each entry is consistent enough to
// regex-match: `universeId: '<id>',` then within that entry's body,
// `      productSpec:` is the marker we anchor to.
function updateUniverseFile(map: UpdateMap): { updated: number; inserted: number; skipped: number } {
  const original = readFileSync(UNIVERSE_PATH, 'utf8')
  const lines = original.split('\n')

  let inserted = 0
  let updated = 0
  let skipped = 0

  let currentUniverseId: string | null = null
  // We need to insert/replace ONE imageUrl per entry. Track whether
  // we've already handled the current entry.
  let currentHandled = false

  const out: string[] = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    // New entry boundary: opens at `universeId: '<id>',`
    const idMatch = line.match(/^\s*universeId:\s*['"]([^'"]+)['"],?\s*$/)
    if (idMatch) {
      currentUniverseId = idMatch[1]
      currentHandled = false
    }

    // If we see an existing imageUrl line, replace it.
    if (currentUniverseId && /^\s*imageUrl:\s*['"][^'"]*['"],?\s*$/.test(line) && !currentHandled) {
      const desired = map[currentUniverseId]
      if (desired) {
        const indent = line.match(/^(\s*)/)?.[1] ?? '      '
        out.push(`${indent}imageUrl: '${desired}',`)
        updated += 1
        currentHandled = true
        continue
      }
    }

    // Insert imageUrl right BEFORE productSpec, if not yet handled.
    if (
      currentUniverseId &&
      !currentHandled &&
      /^\s*productSpec:/.test(line)
    ) {
      const desired = map[currentUniverseId]
      if (desired) {
        const indent = line.match(/^(\s*)/)?.[1] ?? '      '
        out.push(`${indent}imageUrl: '${desired}',`)
        inserted += 1
        currentHandled = true
      } else {
        skipped += 1
      }
    }

    out.push(line)
  }

  writeFileSync(UNIVERSE_PATH, out.join('\n'))
  return { updated, inserted, skipped }
}

function main() {
  const map = buildUpdateMap()
  const counts: Record<string, number> = { specific: 0, fnIcon: 0, topicIcon: 0, defaultIcon: 0 }
  for (const url of Object.values(map)) {
    if (/\/product-images\/[^/]+\.webp$/.test(url)) counts.specific += 1
    else if (url.includes('/categories/_topic-')) counts.topicIcon += 1
    else if (url.includes('/categories/_package.svg')) counts.defaultIcon += 1
    else counts.fnIcon += 1
  }
  console.log('=== imageUrl resolution ===')
  console.log(`  specific (webp):  ${counts.specific}`)
  console.log(`  function icon:    ${counts.fnIcon}`)
  console.log(`  topic icon:       ${counts.topicIcon}`)
  console.log(`  default icon:     ${counts.defaultIcon}`)
  console.log(`  total:            ${Object.keys(map).length}`)

  const result = updateUniverseFile(map)
  console.log('\n=== universe.ts update ===')
  console.log(`  inserted: ${result.inserted}`)
  console.log(`  updated:  ${result.updated}`)
  console.log(`  skipped:  ${result.skipped}`)
}

main()
