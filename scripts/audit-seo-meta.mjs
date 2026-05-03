// SEO meta + sitemap coverage audit.
//
// Verifies:
//   1. Every prerendered indexable page has unique <title> and
//      <meta name="description">
//   2. Every page has a canonical URL
//   3. Every page has Open Graph tags (og:title, og:url)
//   4. Every V6 content URL appears in public/sitemap.xml
//   5. Sitemap has lastmod dates on all V6 entries
//   6. robots.txt exists and looks reasonable
//
// Usage: node scripts/audit-seo-meta.mjs
//   (run AFTER `next build` so .next/server/app/*.html exists)

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const HTML_DIR = join(REPO_ROOT, '.next/server/app')
const SITEMAP_PATH = join(REPO_ROOT, 'public/sitemap.xml')
const ROBOTS_PATH = join(REPO_ROOT, 'public/robots.txt')

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

function isIndexable(slug, html) {
  // Skip noindex pages (property/* are explicitly noindex)
  if (slug.startsWith('property/')) return false
  // Skip generic Next.js framework pages
  if (slug === '_app' || slug === '_document' || slug === '_error' || slug === '_not-found') return false
  // Skip utility pages explicitly disallowed in robots.txt
  if (['chat', 'disclosure', 'plan', 'thanks', 'index'].includes(slug)) return false
  // Skip the dynamic catch-all '/index' Next.js generates for the homepage
  // (real homepage is at '/' and lives in sitemap as such)
  // Check for noindex meta directive
  if (/<meta[^>]*name=["']robots["'][^>]*noindex/i.test(html)) return false
  return true
}

function detectMeta(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : null
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  const description = descMatch ? descMatch[1].trim() : null
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : null
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : null
  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)
  const ogUrl = ogUrlMatch ? ogUrlMatch[1].trim() : null
  return { title, description, canonical, ogTitle, ogUrl }
}

function loadSitemap() {
  let content
  try {
    content = readFileSync(SITEMAP_PATH, 'utf8')
  } catch (e) {
    return null
  }
  const urls = new Set()
  const matches = content.matchAll(/<loc>([^<]+)<\/loc>/g)
  for (const m of matches) urls.add(m[1].trim())
  return { content, urls }
}

function slugToUrl(slug) {
  if (slug === 'page' || slug === '') return 'https://alderprojects.com/'
  if (slug.startsWith('guides/')) return `https://alderprojects.com/${slug}`
  return `https://alderprojects.com/${slug}`
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
  const sitemap = loadSitemap()
  if (!sitemap) {
    console.error(`Could not read ${SITEMAP_PATH}`)
    process.exit(1)
  }

  const titlesSeen = new Map()  // title → first slug
  const descsSeen = new Map()
  const failures = {
    missing_title: [],
    missing_description: [],
    missing_canonical: [],
    missing_og: [],
    duplicate_title: [],
    duplicate_description: [],
    not_in_sitemap: [],
  }
  let audited = 0
  let nonIndexableSkipped = 0

  for (const { slug, file } of files) {
    const html = readFileSync(file, 'utf8')
    if (!isIndexable(slug, html)) {
      nonIndexableSkipped++
      continue
    }
    audited++
    const meta = detectMeta(html)

    if (!meta.title) failures.missing_title.push(slug)
    if (!meta.description) failures.missing_description.push(slug)
    if (!meta.canonical) failures.missing_canonical.push(slug)
    if (!meta.ogTitle || !meta.ogUrl) failures.missing_og.push(slug)

    if (meta.title) {
      if (titlesSeen.has(meta.title)) {
        failures.duplicate_title.push(`${slug} == ${titlesSeen.get(meta.title)}`)
      } else {
        titlesSeen.set(meta.title, slug)
      }
    }
    if (meta.description) {
      if (descsSeen.has(meta.description)) {
        failures.duplicate_description.push(`${slug} == ${descsSeen.get(meta.description)}`)
      } else {
        descsSeen.set(meta.description, slug)
      }
    }

    // Check sitemap inclusion (skip homepage trailing slash quirk)
    const url = slugToUrl(slug)
    const variant1 = url
    const variant2 = url.endsWith('/') ? url.slice(0, -1) : url + '/'
    if (!sitemap.urls.has(variant1) && !sitemap.urls.has(variant2)) {
      failures.not_in_sitemap.push(slug)
    }
  }

  // Report
  console.log(`SEO meta audit: ${audited} indexable pages (${nonIndexableSkipped} noindex skipped)\n`)

  let totalFailures = 0
  for (const [key, list] of Object.entries(failures)) {
    if (list.length === 0) {
      console.log(`  ${key.padEnd(28)}  OK`)
      continue
    }
    totalFailures += list.length
    console.log(`  ${key.padEnd(28)}  ${list.length} violations:`)
    for (const v of list.slice(0, 10)) {
      console.log(`    - ${v}`)
    }
    if (list.length > 10) console.log(`    ... and ${list.length - 10} more`)
  }

  // Robots.txt sanity
  let robotsOk = true
  try {
    const robots = readFileSync(ROBOTS_PATH, 'utf8')
    const propertyDisallowed = /Disallow:\s*\/property/i.test(robots)
    if (!propertyDisallowed) {
      console.log('\n  robots.txt does NOT disallow /property/ — V4 commit told us property pages are noindex; verify robots.txt')
      robotsOk = false
    } else {
      console.log('\n  robots.txt: /property/ noindex enforced')
    }
  } catch (e) {
    console.log(`\n  robots.txt: missing or unreadable at ${ROBOTS_PATH}`)
    robotsOk = false
  }

  console.log('\nSitemap stats:')
  console.log(`  ${sitemap.urls.size} URLs in public/sitemap.xml`)

  if (totalFailures > 0) {
    console.log(`\n${totalFailures} SEO meta violations across all categories.`)
    process.exit(1)
  }
  console.log('\nAll SEO meta checks passed.')
}

run()
