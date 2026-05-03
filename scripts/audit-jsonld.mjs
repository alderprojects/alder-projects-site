// JSON-LD coverage audit. Walks the prerendered HTML output and
// verifies each indexable URL ships at minimum BreadcrumbList +
// (Article OR WebPage). Content pages with FAQ sections get FAQPage.
// Town pages get LocalBusiness.
//
// Usage: node scripts/audit-jsonld.mjs
//   (run AFTER `next build` so .next/server/app/*.html exists)
//
// Verifies via grep against the prerendered HTML — JSON-LD is in
// <script type="application/ld+json"> tags. Any indexable surface
// without the required schema is flagged.
//
// Spot-check 1-2 URLs in Google Rich Results Test after deploy:
//   https://search.google.com/test/rich-results
//
// To re-build before audit: npm run build && node scripts/audit-jsonld.mjs

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const HTML_DIR = join(REPO_ROOT, '.next/server/app')

// Pages that should have specific schema types.
function classify(slug) {
  // Slug is the .html filename without extension, e.g.
  //   'kitchen-remodeling-stowe-vt'
  //   'guides/heat-pump-rebates-vermont'
  //   'stowe-vt'

  if (slug === 'index' || slug === '_app' || slug === '_document') return null

  // Property pages are noindex — skip
  if (slug.startsWith('property/')) return null

  // V6 town × service or service or county pages
  if (/^[a-z-]+-(burlington|south-burlington|williston|essex|colchester|stowe|middlebury|montpelier|woodstock|manchester|brattleboro|st-johnsbury|vergennes|vermont)-vt?$/.test(slug)) {
    return { type: 'service-page', requires: ['BreadcrumbList', 'Article'] }
  }
  if (/^[a-z-]+-vermont$/.test(slug)) {
    return { type: 'statewide-service-page', requires: ['BreadcrumbList', 'Article'] }
  }
  if (/^[a-z-]+-county-vt$/.test(slug)) {
    return { type: 'county-page', requires: ['BreadcrumbList', 'Article'] }
  }

  // V6 standalone town pages (e.g. stowe-vt)
  if (/^(stowe|burlington|vergennes|montpelier|manchester|woodstock|middlebury|brattleboro|st-johnsbury)-vt$/.test(slug)) {
    return { type: 'town-page', requires: ['BreadcrumbList', 'Article', 'LocalBusiness', 'FAQPage'] }
  }

  // V6 seasonal guides
  if (/^vermont-(lake-season|spring-blackfly|fall-leaf-weatherization|pre-winter-prep|deep-winter|mud-season-homeowner-guide)$/.test(slug)) {
    return { type: 'seasonal-guide', requires: ['BreadcrumbList', 'Article', 'FAQPage'] }
  }

  // /guides/* topic guides + existing guides
  if (slug.startsWith('guides/') && slug !== 'guides') {
    return { type: 'topic-guide', requires: ['BreadcrumbList', 'Article'] }
  }

  // Index pages
  if (slug === 'guides') {
    return { type: 'guides-index', requires: ['BreadcrumbList', 'ItemList'] }
  }
  if (slug === 'towns') {
    return { type: 'towns-index', requires: ['BreadcrumbList', 'ItemList'] }
  }
  if (slug === 'seasons') {
    return { type: 'seasons-index', requires: ['BreadcrumbList', 'ItemList'] }
  }

  // Homepage
  if (slug === 'page' || slug === '') {
    return { type: 'homepage', requires: ['WebSite', 'Organization'] }
  }

  return null  // skip unclassified pages (chat, plan, faq, etc.)
}

function listHtmlFiles() {
  const out = []
  const stack = [HTML_DIR]
  while (stack.length > 0) {
    const cur = stack.pop()
    let entries
    try {
      entries = readdirSync(cur)
    } catch (e) {
      continue
    }
    for (const ent of entries) {
      const full = join(cur, ent)
      let s
      try {
        s = statSync(full)
      } catch (e) {
        continue
      }
      if (s.isDirectory()) stack.push(full)
      else if (ent.endsWith('.html')) {
        const rel = full.slice(HTML_DIR.length + 1)
        const slug = rel.replace(/\.html$/, '')
        out.push({ slug, file: full })
      }
    }
  }
  return out
}

function detectSchemas(html) {
  const found = new Set()
  // Find all <script type="application/ld+json"> blocks and detect
  // @type values (including arrays).
  const blocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/g) ?? []
  for (const block of blocks) {
    const inner = block.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')
    // Pull all "@type": "X" values
    const types = inner.match(/"@type"\s*:\s*"([^"]+)"/g) ?? []
    for (const t of types) {
      const m = t.match(/"@type"\s*:\s*"([^"]+)"/)
      if (m) found.add(m[1])
    }
  }
  return found
}

function run() {
  let exists = true
  try {
    statSync(HTML_DIR)
  } catch (e) {
    exists = false
  }
  if (!exists) {
    console.error('No .next/server/app dir. Run `npm run build` first.')
    process.exit(1)
  }

  const files = listHtmlFiles()
  const violations = []
  let audited = 0

  for (const { slug, file } of files) {
    const cls = classify(slug)
    if (!cls) continue
    audited++
    const html = readFileSync(file, 'utf8')
    const found = detectSchemas(html)
    const missing = cls.requires.filter(r => !found.has(r))
    if (missing.length > 0) {
      violations.push({
        slug,
        type: cls.type,
        required: cls.requires,
        found: [...found],
        missing,
      })
    }
  }

  console.log(`Audited ${audited} prerendered pages.\n`)

  if (violations.length === 0) {
    console.log('All audited pages ship the required JSON-LD schemas.')
    return
  }

  console.log(`Flagged ${violations.length} pages with missing schemas:\n`)
  for (const v of violations) {
    console.log(`  ${v.slug.padEnd(60)}  ${v.type.padEnd(20)}  missing ${v.missing.join(', ')}`)
  }
}

run()
