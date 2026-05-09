// v7.2.9 — AI-generated illustrations for entries currently on SVG
// fallback.
//
// Reads manufacturer-results.json + pexels-results.json to determine
// which entries already have a real raster image. For each entry that
// doesn't, calls OpenAI image API, saves base64 → _raw/{universeId}.png.
//
// Output: scripts/images/ai-illustrations-results.json
//
// Usage:
//   OPENAI_API_KEY=sk-... npx tsx scripts/images/08-source-ai-illustrations.ts [--limit N] [--dry-run]
//
// Cost: ~$0.04 per image (DALL-E 3 standard) or per current OpenAI
//   pricing. 158 entries × $0.04 ≈ $6.32. Script prints a cost
//   estimate before any calls.
//
// Rate limit: 1.5s between requests to stay well under tier-1 RPM
// limits.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { UNIVERSE } from '../../src/content/smart-cart/universe'
import { buildPrompt } from './prompt-builder'

// .env.local loader (matches the Pexels script pattern)
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

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const LIMIT_FLAG = args.indexOf('--limit')
const LIMIT = LIMIT_FLAG >= 0 ? parseInt(args[LIMIT_FLAG + 1], 10) : 0
const RAW_DIR = 'public/product-images/_raw'
const OUT_PATH = 'scripts/images/ai-illustrations-results.json'
const MFR_PATH = 'scripts/images/manufacturer-results.json'
const PEX_PATH = 'scripts/images/pexels-results.json'

const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
const SIZE = '1024x1024'
const RATE_LIMIT_MS = 1500

interface Result {
  universeId: string
  productName: string
  status: 'ok' | 'skipped_already_covered' | 'skipped_dry_run' | 'api_error' | 'no_image_in_response'
  prompt?: string
  rawPath?: string
  reason?: string
  reusedExisting?: boolean
}

function loadCovered(): Set<string> {
  const covered = new Set<string>()
  for (const path of [MFR_PATH, PEX_PATH]) {
    if (!existsSync(path)) continue
    const arr: Array<{ universeId: string; status: string }> = JSON.parse(readFileSync(path, 'utf8'))
    for (const r of arr) if (r.status === 'ok') covered.add(r.universeId)
  }
  return covered
}

async function callOpenAi(prompt: string): Promise<{ ok: true; b64: string } | { ok: false; reason: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { ok: false, reason: 'OPENAI_API_KEY missing' }
  }
  try {
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        size: SIZE,
        n: 1,
        // gpt-image-1 returns b64_json by default; for dall-e-3 we
        // request it explicitly.
        ...(MODEL === 'dall-e-3' ? { response_format: 'b64_json', quality: 'standard' } : {}),
      }),
      signal: AbortSignal.timeout(120_000),
    })
    if (!resp.ok) {
      const text = await resp.text()
      return { ok: false, reason: `http ${resp.status}: ${text.slice(0, 240)}` }
    }
    const data = (await resp.json()) as { data?: Array<{ b64_json?: string; url?: string }> }
    const first = data.data?.[0]
    if (first?.b64_json) return { ok: true, b64: first.b64_json }
    if (first?.url) {
      // Fall back: download the URL.
      const dl = await fetch(first.url, { signal: AbortSignal.timeout(60_000) })
      if (!dl.ok) return { ok: false, reason: `image download http ${dl.status}` }
      const buf = await dl.arrayBuffer()
      return { ok: true, b64: Buffer.from(buf).toString('base64') }
    }
    return { ok: false, reason: 'no image in response' }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}

async function main() {
  if (!DRY_RUN && !process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing — set it in .env.local')
    process.exit(2)
  }

  mkdirSync(RAW_DIR, { recursive: true })

  const covered = loadCovered()
  const targets = UNIVERSE.filter(p => !covered.has(p.universeId))
  const limited = LIMIT > 0 ? targets.slice(0, LIMIT) : targets

  // Cost preview
  const perImage = MODEL === 'dall-e-3' ? 0.04 : 0.04 // tier-dependent; informational
  console.log(`Model: ${MODEL}`)
  console.log(`Targets: ${limited.length} of ${targets.length} not-yet-covered entries`)
  console.log(`Estimated cost: ~$${(limited.length * perImage).toFixed(2)} (varies by model/tier)`)
  if (DRY_RUN) {
    console.log('DRY RUN — printing prompts only, no API calls.')
  }
  console.log('')

  const results: Result[] = []
  for (let i = 0; i < limited.length; i += 1) {
    const p = limited[i]
    const prompt = buildPrompt(
      p.variant.productName,
      p.variant.productSpec,
      p.tags.topics,
      p.tags.functions,
    )

    process.stdout.write(`[${i + 1}/${limited.length}] ${p.universeId}... `)

    // Reuse existing raw file if it's been generated previously (idempotent re-runs)
    const existingPath = join(RAW_DIR, `${p.universeId}.png`)
    if (existsSync(existingPath)) {
      results.push({
        universeId: p.universeId,
        productName: p.variant.productName,
        status: 'ok',
        prompt,
        rawPath: existingPath,
        reusedExisting: true,
      })
      process.stdout.write('reused existing\n')
      continue
    }

    if (DRY_RUN) {
      results.push({
        universeId: p.universeId,
        productName: p.variant.productName,
        status: 'skipped_dry_run',
        prompt,
      })
      process.stdout.write('dry\n')
      console.log(`    PROMPT: ${prompt.slice(0, 200)}...`)
      continue
    }

    const r = await callOpenAi(prompt)
    if (!r.ok) {
      results.push({
        universeId: p.universeId,
        productName: p.variant.productName,
        status: 'api_error',
        prompt,
        reason: r.reason,
      })
      process.stdout.write(`fail: ${r.reason}\n`)
      // On rate-limit failures, back off a bit harder
      if (r.reason.includes('429')) await new Promise(r => setTimeout(r, 30_000))
      continue
    }

    const rawPath = join(RAW_DIR, `${p.universeId}.png`)
    writeFileSync(rawPath, Buffer.from(r.b64, 'base64'))
    results.push({
      universeId: p.universeId,
      productName: p.variant.productName,
      status: 'ok',
      prompt,
      rawPath,
    })
    process.stdout.write('ok\n')

    if (i < limited.length - 1) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2))

  const counts: Record<string, number> = {}
  for (const r of results) counts[r.status] = (counts[r.status] ?? 0) + 1
  console.log('\n=== AI illustrations ===')
  for (const [k, v] of Object.entries(counts).sort()) console.log(`  ${k}: ${v}`)
  console.log(`Output: ${OUT_PATH}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
