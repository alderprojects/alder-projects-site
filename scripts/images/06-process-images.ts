// v7.2.7 — image processor.
//
// Reads everything in public/product-images/_raw/, normalizes to
// 800x800 white-padded square, strips EXIF, and emits both .webp
// (primary) and .jpg (fallback) into public/product-images/.
//
// Usage:
//   npx tsx scripts/images/06-process-images.ts

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const RAW_DIR = 'public/product-images/_raw'
const OUT_DIR = 'public/product-images'

async function processOne(rawPath: string, universeId: string) {
  try {
    const pipeline = sharp(rawPath)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .withMetadata({})

    await pipeline
      .clone()
      .webp({ quality: 85 })
      .toFile(join(OUT_DIR, `${universeId}.webp`))
    await pipeline
      .clone()
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(join(OUT_DIR, `${universeId}.jpg`))
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    }
  }
}

async function main() {
  if (!existsSync(RAW_DIR)) {
    console.log('No raw directory; nothing to process.')
    return
  }
  mkdirSync(OUT_DIR, { recursive: true })

  const files = readdirSync(RAW_DIR).filter(f => {
    const p = join(RAW_DIR, f)
    return statSync(p).isFile() && !f.startsWith('.')
  })

  let ok = 0
  let failed = 0
  for (const f of files) {
    const { name } = parse(f)
    const rawPath = join(RAW_DIR, f)
    process.stdout.write(`processing ${name}... `)
    const r = await processOne(rawPath, name)
    if (r.ok) {
      ok += 1
      process.stdout.write('ok\n')
    } else {
      failed += 1
      process.stdout.write(`fail: ${r.reason}\n`)
    }
  }
  console.log(`\n=== Image processing ===`)
  console.log(`  ok: ${ok}`)
  console.log(`  failed: ${failed}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
