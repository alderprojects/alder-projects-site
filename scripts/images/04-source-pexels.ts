// v7.2.7 — Tier 3 Pexels image fetcher.
//
// Reads PEXELS_QUERIES (CATEGORY_GENERIC entries) and queries Pexels
// for each. Downloads the top non-rejected photo's `large` variant
// to _raw/{universeId}.jpg. Logs photographer + photo URL for
// ATTRIBUTION.md.
//
// Brand-review gate: skips entries that landed in Tier 1
// manufacturer-results.json with status=ok (already covered).
//
// Pexels License: free for commercial, attribution optional.
// We attribute regardless.
//
// Output: scripts/images/pexels-results.json
//
// Usage:
//   PEXELS_API_KEY=... npx tsx scripts/images/04-source-pexels.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PEXELS_QUERIES } from './sources'
import { fetchBinary } from './fetcher'

// Lightweight .env.local loader (no dotenv dependency).
function loadEnvLocal() {
  if (!existsSync('.env.local')) return
  const text = readFileSync('.env.local', 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const API_KEY = process.env.PEXELS_API_KEY
if (!API_KEY) {
  console.error('PEXELS_API_KEY missing — set it in .env.local')
  process.exit(2)
}

const RAW_DIR = 'public/product-images/_raw'
const OUT_PATH = 'scripts/images/pexels-results.json'
const MFR_PATH = 'scripts/images/manufacturer-results.json'

interface Result {
  universeId: string
  query: string
  status: 'ok' | 'no_results' | 'api_error' | 'image_fetch_failed' | 'skipped_covered_by_tier1'
  photographer?: string
  photographerUrl?: string
  photoUrl?: string
  imageUrl?: string
  rawPath?: string
  reason?: string
}

interface PexelsPhoto {
  id: number
  url: string
  photographer: string
  photographer_url: string
  src: { original: string; large: string; medium: string }
}

interface PexelsResponse {
  total_results?: number
  photos?: PexelsPhoto[]
  error?: string
}

async function searchPexels(query: string): Promise<PexelsResponse> {
  const u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`
  try {
    const resp = await fetch(u, {
      headers: { Authorization: API_KEY!, 'User-Agent': 'AlderProjects-ImageAudit/1.0' },
      signal: AbortSignal.timeout(15_000),
    })
    if (!resp.ok) return { error: `http ${resp.status}` }
    return (await resp.json()) as PexelsResponse
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

async function processOne(
  universeId: string,
  query: string,
  alreadyCovered: Set<string>,
): Promise<Result> {
  if (alreadyCovered.has(universeId)) {
    return { universeId, query, status: 'skipped_covered_by_tier1' }
  }
  const data = await searchPexels(query)
  if (data.error) return { universeId, query, status: 'api_error', reason: data.error }
  if (!data.photos || data.photos.length === 0) {
    return { universeId, query, status: 'no_results' }
  }
  const photo = data.photos[0]
  const imageUrl = photo.src.large
  const bin = await fetchBinary(imageUrl)
  if (!bin.ok || !bin.bytes) {
    return {
      universeId,
      query,
      status: 'image_fetch_failed',
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      photoUrl: photo.url,
      imageUrl,
      reason: bin.reason,
    }
  }
  const rawPath = join(RAW_DIR, `${universeId}.jpg`)
  writeFileSync(rawPath, Buffer.from(bin.bytes))
  return {
    universeId,
    query,
    status: 'ok',
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    photoUrl: photo.url,
    imageUrl,
    rawPath,
  }
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true })

  const alreadyCovered = new Set<string>()
  if (existsSync(MFR_PATH)) {
    const mfr: Array<{ universeId: string; status: string }> = JSON.parse(
      readFileSync(MFR_PATH, 'utf8'),
    )
    for (const r of mfr) if (r.status === 'ok') alreadyCovered.add(r.universeId)
  }

  const results: Result[] = []
  const entries = Object.entries(PEXELS_QUERIES)
  let i = 0
  for (const [universeId, query] of entries) {
    i += 1
    process.stdout.write(`[${i}/${entries.length}] ${universeId}... `)
    const r = await processOne(universeId, query, alreadyCovered)
    results.push(r)
    process.stdout.write(`${r.status}\n`)
    // Pexels rate limit: 200/hour. We're well under, but 250ms between
    // requests is polite.
    await new Promise(r => setTimeout(r, 250))
  }
  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2))

  const counts: Record<string, number> = {}
  for (const r of results) counts[r.status] = (counts[r.status] ?? 0) + 1
  console.log('\n=== Tier 3 Pexels results ===')
  for (const [k, v] of Object.entries(counts).sort()) console.log(`  ${k}: ${v}`)
  console.log(`Output: ${OUT_PATH}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
