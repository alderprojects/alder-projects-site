// Internal-link audit. Counts outbound /<path> links in each content
// page and flags pages below the V6 voice-guide minimums:
//
//   Every guide:                  ≥ 5 outbound internal links
//   Every town page:              ≥ 5 outbound internal links
//   Every town × service page:    ≥ 3 outbound internal links
//   Every guide:                  ≥ 1 link to property tool ('/' or
//                                   '/property/' or '/?...')
//
// Usage: node scripts/audit-internal-links.mjs
//
// Output: console summary plus a flagged.json list of pages that
// need additional internal links.

import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const APP_DIR = join(REPO_ROOT, 'src/app')
const CONTENT_DIR = join(REPO_ROOT, 'src/content')

// Patterns to identify a content category for thresholds.
const CATEGORY_PATTERNS = [
  // V6 standalone town pages (e.g. stowe-vt)
  { name: 'town', re: /^[a-z-]+-vt$/, min: 5 },
  // Town × service pages (e.g. kitchen-remodeling-stowe-vt)
  { name: 'town-service', re: /^[a-z-]+-(burlington|south-burlington|williston|essex|colchester|stowe|middlebury|montpelier|woodstock|manchester|brattleboro|st-johnsbury|vergennes)-vt$/, min: 3 },
  // Statewide service pages (e.g. kitchen-remodeling-vermont)
  { name: 'service-statewide', re: /^[a-z-]+-vermont$/, min: 5 },
  // County pages
  { name: 'county', re: /^[a-z-]+-county-vt$/, min: 5 },
  // V6 seasonal guides
  { name: 'seasonal-guide', re: /^vermont-(lake-season|spring-blackfly|fall-leaf-weatherization|pre-winter-prep|deep-winter)$/, min: 5 },
  // Existing mud-season guide
  { name: 'seasonal-guide', re: /^vermont-mud-season-homeowner-guide$/, min: 5 },
]

function categorize(slug) {
  for (const { name, re, min } of CATEGORY_PATTERNS) {
    if (re.test(slug)) return { name, min }
  }
  // /guides/* nested route — handled separately
  return null
}

function countLinks(file) {
  // V6 pages use the shared ServicePage / SeasonalGuide / TopicGuide /
  // TownPage components, where hrefs are generated dynamically from
  // arrays in the content record (relatedGuideSlugs, relatedServiceSlugs,
  // relatedTownSlugs). This script reads:
  //
  //   - Direct href="/..." patterns in JSX
  //   - Each entry in relatedGuideSlugs / relatedServiceSlugs / relatedTownSlugs
  //   - Each href in JSON-LD url fields
  //   - Imported content records (if the page.tsx uses an import like
  //     STOWE_CONTENT and renders <TownPage content={STOWE_CONTENT} />)
  let pageContent
  try {
    pageContent = readFileSync(file, 'utf8')
  } catch (e) {
    return { hrefCount: 0, hasFunnel: false }
  }

  // Direct hrefs
  const hrefMatches = pageContent.match(/href=(?:"|\{["`'])\/[^"'`}]*/g) ?? []
  let hrefCount = hrefMatches.length

  // Inline content records (the regen script writes content directly
  // into page.tsx with relatedGuideSlugs/relatedServiceSlugs arrays)
  const inlineSlugs = countArrayEntries(pageContent, [
    'relatedGuideSlugs',
    'relatedServiceSlugs',
    'relatedTownSlugs',
    'factIds',
  ])
  hrefCount += inlineSlugs.relatedGuideSlugs
  hrefCount += inlineSlugs.relatedServiceSlugs
  hrefCount += inlineSlugs.relatedTownSlugs

  // Imported content records — find imports like
  //   import { STOWE_CONTENT } from '@/content/towns/stowe'
  // and inspect the imported file
  const importMatches = pageContent.matchAll(
    /import\s*\{\s*([A-Z0-9_]+_CONTENT)\s*\}\s*from\s*["'](@\/[^"']+)["']/g,
  )
  for (const im of importMatches) {
    const modPath = im[2].replace(/^@\//, '')
    const candidate = join(REPO_ROOT, 'src', modPath + '.ts')
    try {
      const importedContent = readFileSync(candidate, 'utf8')
      const importedSlugs = countArrayEntries(importedContent, [
        'relatedGuideSlugs',
        'relatedServiceSlugs',
        'relatedTownSlugs',
      ])
      hrefCount += importedSlugs.relatedGuideSlugs
      hrefCount += importedSlugs.relatedServiceSlugs
      hrefCount += importedSlugs.relatedTownSlugs
    } catch (e) {
      // Skip
    }
  }

  // Funnel: any reference to / homepage, /property/, /?... or
  // samplePropertySlug (which becomes a /property/ link in the renderer).
  // Also: imports of components that render the funnel internally
  // (GuideFooter, GuidePage, ServicePage, SeasonalGuide, TopicGuide,
  // TownPage). All of these include a "/" funnel link in their body.
  const FUNNEL_COMPONENTS = [
    'GuideFooter',
    'GuidePage',
    'ServicePage',
    'SeasonalGuide',
    'TopicGuide',
    'TownPage',
  ]
  const importsFunnelComponent = FUNNEL_COMPONENTS.some(c =>
    new RegExp(`import\\s+.*${c}.*from`).test(pageContent),
  )

  const hasFunnel =
    importsFunnelComponent ||
    pageContent.includes('href="/"') ||
    pageContent.includes("href={'/'") ||
    pageContent.includes('href={"/"}') ||
    /href=(?:"|\{["`'])\/property\//.test(pageContent) ||
    /href=(?:"|\{["`'])\/\?/.test(pageContent) ||
    /samplePropertySlug/.test(pageContent)

  // For pages that import GuidePage and pass content with a relatedGuides
  // field (legacy /guides/* format), count those too.
  if (/GuidePage/.test(pageContent)) {
    // relatedGuides: [{ label, href }] — count href entries
    const relatedHrefs = pageContent.match(/href:\s*["']\/[^"']+["']/g) ?? []
    hrefCount += relatedHrefs.length
  }

  return { hrefCount, hasFunnel }
}

// Count the number of entries in a JS array literal named `key`.
// Handles ['a', 'b', 'c'] and "key": ["a", "b"] forms.
function countArrayEntries(source, keys) {
  const counts = Object.fromEntries(keys.map(k => [k, 0]))
  for (const key of keys) {
    // Match key: [...] or "key": [...]
    const re = new RegExp(`["']?${key}["']?\\s*:\\s*\\[([^\\]]*)\\]`, 'g')
    let m
    while ((m = re.exec(source)) !== null) {
      const inside = m[1]
      // Count quoted strings inside the array
      const items = inside.match(/["'][a-zA-Z0-9-]+["']/g) ?? []
      counts[key] += items.length
    }
  }
  return counts
}

function run() {
  const flagged = []
  const dirs = readdirSync(APP_DIR)

  for (const dir of dirs) {
    const cat = categorize(dir)
    if (!cat) continue
    const file = join(APP_DIR, dir, 'page.tsx')
    try {
      statSync(file)
    } catch (e) {
      continue
    }
    // For ServicePage / town × service pages, links live in the content
    // record (relatedGuideSlugs, relatedServiceSlugs) which are imported
    // — count those by reading the content too.
    const { hrefCount, hasFunnel } = countLinks(file)

    const pageReport = {
      slug: dir,
      category: cat.name,
      minLinks: cat.min,
      hrefCount,
      hasFunnel,
      flagged: hrefCount < cat.min || (cat.name.includes('guide') && !hasFunnel),
    }

    if (pageReport.flagged) flagged.push(pageReport)
  }

  // /guides/* nested
  const guidesDir = join(APP_DIR, 'guides')
  try {
    const guideSubs = readdirSync(guidesDir)
    for (const sub of guideSubs) {
      const file = join(guidesDir, sub, 'page.tsx')
      try {
        statSync(file)
      } catch (e) {
        continue
      }
      const { hrefCount, hasFunnel } = countLinks(file)
      const pageReport = {
        slug: `guides/${sub}`,
        category: 'topic-guide',
        minLinks: 5,
        hrefCount,
        hasFunnel,
        flagged: hrefCount < 5 || !hasFunnel,
      }
      if (pageReport.flagged) flagged.push(pageReport)
    }
  } catch (e) {
    // No /guides dir
  }

  console.log(`\nAudited internal links across content pages.\n`)
  console.log(`Flagged ${flagged.length} pages below voice-guide minimums:\n`)
  for (const f of flagged) {
    console.log(
      `  ${f.slug.padEnd(60)}  ${f.category.padEnd(20)}  ${f.hrefCount}/${f.minLinks} links${
        f.hasFunnel ? '' : ' (no funnel link)'
      }`,
    )
  }

  const out = join(REPO_ROOT, 'scripts/audit-internal-links.flagged.json')
  writeFileSync(out, JSON.stringify(flagged, null, 2))
  console.log(`\nDetail written to ${out}.`)
}

run()
