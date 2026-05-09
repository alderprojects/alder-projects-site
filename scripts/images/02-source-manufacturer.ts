// v7.2.7 — Tier 1 manufacturer image scraper.
//
// For each universe entry, look up a SPECIFIC URL (per-product) or
// a BRAND_HERO_URL (per-brand). Fetch, extract og:image / schema
// Product image, download to _raw/{universeId}.{ext}.
//
// Failures fall through silently — the universe-update script picks
// fallback tiers in priority order.
//
// Output: scripts/images/manufacturer-results.json
//
// Usage:
//   npx tsx scripts/images/02-source-manufacturer.ts

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { UNIVERSE } from '../../src/content/smart-cart/universe'
import { SPECIFIC_URLS, BRAND_HERO_URLS } from './sources'
import {
  fetchHtml,
  fetchBinary,
  extractProductImage,
  extFromContentType,
} from './fetcher'

interface Result {
  universeId: string
  productName: string
  status: 'ok' | 'no_url' | 'fetch_failed' | 'no_image_found' | 'image_fetch_failed'
  source?: 'specific' | 'brand_hero'
  brand?: string
  pageUrl?: string
  imageUrl?: string
  rawPath?: string
  reason?: string
}

const RAW_DIR = 'public/product-images/_raw'
const OUT_PATH = 'scripts/images/manufacturer-results.json'

function pickUrl(universeId: string, productName: string): {
  url: string
  source: 'specific' | 'brand_hero'
  brand?: string
} | null {
  if (SPECIFIC_URLS[universeId]) {
    return { url: SPECIFIC_URLS[universeId], source: 'specific' }
  }
  const lower = productName.toLowerCase()
  for (const entry of BRAND_HERO_URLS) {
    if (lower.includes(entry.match)) {
      return { url: entry.url, source: 'brand_hero', brand: entry.brand }
    }
  }
  return null
}

// brand_hero pages share an image across products — fetch each unique
// page once and cache.
const pageImageCache = new Map<string, string | null>()

async function resolveImageForPage(pageUrl: string): Promise<string | null> {
  if (pageImageCache.has(pageUrl)) return pageImageCache.get(pageUrl) ?? null
  const html = await fetchHtml(pageUrl)
  if (!html.ok || !html.body) {
    pageImageCache.set(pageUrl, null)
    return null
  }
  const img = extractProductImage(html.body, pageUrl)
  pageImageCache.set(pageUrl, img)
  return img
}

const downloadCache = new Map<string, string>() // imageUrl → rawPath

async function downloadImage(imageUrl: string, universeId: string): Promise<string | null> {
  if (downloadCache.has(imageUrl)) {
    // Reuse the same downloaded file (brand-hero shared across products)
    return downloadCache.get(imageUrl)!
  }
  const bin = await fetchBinary(imageUrl)
  if (!bin.ok || !bin.bytes) return null
  const ext = extFromContentType(bin.contentType)
  const rawPath = join(RAW_DIR, `${universeId}.${ext}`)
  writeFileSync(rawPath, Buffer.from(bin.bytes))
  downloadCache.set(imageUrl, rawPath)
  return rawPath
}

async function processOne(universeId: string, productName: string): Promise<Result> {
  const pick = pickUrl(universeId, productName)
  if (!pick) {
    return { universeId, productName, status: 'no_url' }
  }
  const imageUrl = await resolveImageForPage(pick.url)
  if (!imageUrl) {
    return {
      universeId,
      productName,
      status: 'no_image_found',
      source: pick.source,
      brand: pick.brand,
      pageUrl: pick.url,
      reason: 'fetch failed or no og:image / schema image',
    }
  }
  const rawPath = await downloadImage(imageUrl, universeId)
  if (!rawPath) {
    return {
      universeId,
      productName,
      status: 'image_fetch_failed',
      source: pick.source,
      brand: pick.brand,
      pageUrl: pick.url,
      imageUrl,
    }
  }
  return {
    universeId,
    productName,
    status: 'ok',
    source: pick.source,
    brand: pick.brand,
    pageUrl: pick.url,
    imageUrl,
    rawPath,
  }
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true })
  const results: Result[] = []
  let i = 0
  for (const p of UNIVERSE) {
    i += 1
    process.stdout.write(`[${i}/${UNIVERSE.length}] ${p.universeId}... `)
    const r = await processOne(p.universeId, p.variant.productName)
    results.push(r)
    process.stdout.write(`${r.status}\n`)
  }
  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2))

  const counts: Record<string, number> = {}
  for (const r of results) counts[r.status] = (counts[r.status] ?? 0) + 1
  console.log('\n=== Tier 1 manufacturer results ===')
  for (const [k, v] of Object.entries(counts).sort()) console.log(`  ${k}: ${v}`)
  console.log(`Output: ${OUT_PATH}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
