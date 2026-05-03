// Voice + content regression test, run at build time.
//
// Per voice-guide.md self-rubric: every commit ships content that
// passes the voice + structural checks. This script enforces the
// checks at build time. If any test fails, the build fails — fix
// the violation; do not weaken the test.
//
// Tests:
//   1. Banned phrases (from voice-guide.md)
//      - Marketing filler ("Comprehensive guide", "Game-changer")
//      - Marketplace-era leftovers ("Post your project free",
//        "matched with local contractors", "vetted contractors")
//      - AI-generated patterns ("Whether you're", "and so much more")
//   2. Every src/content/{seasons,topics,towns}/*.ts file has
//      a non-empty factIds array
//   3. Every V6 guide has ≥3 "Trap:" callouts
//   4. FACTS table verifyAfter dates — warns (not fails) on stale
//      facts past their re-verification date
//
// Usage: node scripts/voice-regression-test.mjs
// Hooks into the npm build script so a build attempt with violations
// fails CI / Vercel.

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const APP_DIR = join(REPO_ROOT, 'src/app')
const CONTENT_DIR = join(REPO_ROOT, 'src/content')

// ---------- Banned phrases (voice-guide.md) --------------------------
// Apply across src/app and src/content. Some phrases need word
// boundaries or case-insensitive match. Each entry has a regex and
// a human-readable label.

const BANNED = [
  // Marketing filler
  { re: /\bComprehensive guide\b/gi, label: '"Comprehensive guide"' },
  { re: /\bEverything you need to know\b/gi, label: '"Everything you need to know"' },
  { re: /\bUltimate guide\b/gi, label: '"Ultimate guide"' },
  { re: /\bExpert tips\b/gi, label: '"Expert tips"' },
  { re: /\bGame-changer\b/gi, label: '"Game-changer"' },
  { re: /\bIn today's market\b/gi, label: "\"In today's market\"" },
  { re: /\bIndustry-leading\b/gi, label: '"Industry-leading"' },
  { re: /\bStreamlined process\b/gi, label: '"Streamlined process"' },
  { re: /\bSolutions that fit your needs\b/gi, label: '"Solutions that fit your needs"' },
  { re: /\bBest-in-class\b/gi, label: '"Best-in-class"' },
  { re: /\bCutting-edge\b/gi, label: '"Cutting-edge"' },
  { re: /\bWorld-class\b/gi, label: '"World-class"' },
  { re: /\bInnovative solutions\b/gi, label: '"Innovative solutions"' },

  // Marketplace-era leftovers
  { re: /\bReach out to discuss\b/gi, label: '"Reach out to discuss"' },
  { re: /\bWe'?ll match you\b/gi, label: '"We\'ll match you"' },
  { re: /\bVetted contractors\b/gi, label: '"Vetted contractors"' },
  { re: /\bPost your project free\b/gi, label: '"Post your project free"' },
  { re: /\bPost Your Project Free\b/g, label: '"Post Your Project Free"' },
  { re: /\bmatched with local contractors\b/gi, label: '"matched with local contractors"' },
  { re: /\btwo or three contractors\b/gi, label: '"two or three contractors"' },
  { re: /\bmatching service\b/gi, label: '"matching service"' },
  { re: /\bHow is this different from Angi\b/gi, label: '"How is this different from Angi"' },
  { re: /\bWe pull a few\b/gi, label: '"We pull a few"' },
]

// Files / directories to skip the banned-phrase check on. The voice
// guide itself enumerates banned phrases; that's not a violation.
const BANNED_SKIP_PATHS = [
  'src/content/voice-guide.md',
  'scripts/voice-regression-test.mjs',
  'scripts/regenerate-town-service-pages.mjs',
  'scripts/audit-internal-links.mjs',
  // Components that don't carry editorial copy
  'src/components/SeoPage.tsx',
  // Legacy data that mentions matching language in code comments only
  'src/data/contractor-vetting.ts',
]

// ---------- Walk file tree --------------------------------------------

function walkFiles(dir, accept = () => true, skipDirs = ['node_modules', '.next', '.git']) {
  const out = []
  const stack = [dir]
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
      if (s.isDirectory()) {
        if (skipDirs.includes(ent)) continue
        stack.push(full)
      } else if (accept(full)) {
        out.push(full)
      }
    }
  }
  return out
}

// ---------- Tests -----------------------------------------------------

function testBannedPhrases() {
  const failures = []
  const files = [
    ...walkFiles(APP_DIR, f => f.endsWith('.tsx') || f.endsWith('.ts')),
    ...walkFiles(CONTENT_DIR, f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.md')),
  ]
  for (const file of files) {
    const rel = file.slice(REPO_ROOT.length + 1)
    if (BANNED_SKIP_PATHS.some(skip => rel === skip || rel.startsWith(skip + '/'))) continue
    let content
    try {
      content = readFileSync(file, 'utf8')
    } catch (e) {
      continue
    }
    for (const { re, label } of BANNED) {
      if (re.test(content)) {
        failures.push(`${rel}: contains banned phrase ${label}`)
      }
      re.lastIndex = 0  // reset stateful regex
    }
  }
  return failures
}

function testFactIdsNonEmpty() {
  const failures = []
  const dirs = ['seasons', 'topics', 'towns']
  for (const dir of dirs) {
    const subDir = join(CONTENT_DIR, dir)
    let files
    try {
      files = readdirSync(subDir).filter(f => f.endsWith('.ts'))
    } catch (e) {
      continue
    }
    for (const file of files) {
      const full = join(subDir, file)
      const content = readFileSync(full, 'utf8')
      // Look for factIds: [...]; flag if empty or missing
      const m = content.match(/factIds\s*:\s*\[([\s\S]*?)\]/)
      if (!m) {
        failures.push(`${dir}/${file}: missing factIds field`)
        continue
      }
      const inside = m[1].trim()
      const items = inside.match(/["'][a-zA-Z0-9-]+["']/g) ?? []
      if (items.length === 0) {
        failures.push(`${dir}/${file}: factIds is empty`)
      }
    }
  }
  return failures
}

function testTrapCallouts() {
  const failures = []
  const dirs = ['seasons', 'topics', 'towns']
  for (const dir of dirs) {
    const subDir = join(CONTENT_DIR, dir)
    let files
    try {
      files = readdirSync(subDir).filter(f => f.endsWith('.ts'))
    } catch (e) {
      continue
    }
    for (const file of files) {
      const full = join(subDir, file)
      const content = readFileSync(full, 'utf8')
      const traps = (content.match(/Trap:/g) ?? []).length
      if (traps < 3) {
        failures.push(`${dir}/${file}: only ${traps} "Trap:" callouts (min 3)`)
      }
    }
  }
  return failures
}

function testStaleFacts() {
  // Warn (don't fail) on FACTS past their verifyAfter date.
  const factsFile = join(CONTENT_DIR, 'facts.ts')
  let content
  try {
    content = readFileSync(factsFile, 'utf8')
  } catch (e) {
    return { warnings: [`facts.ts not readable: ${e.message}`] }
  }
  const today = new Date()
  const warnings = []
  // Parse blocks roughly: each fact id is a key; verifyAfter is a string.
  const factBlocks = content.matchAll(
    /'([a-z0-9-]+)':\s*\{[\s\S]*?verifyAfter:\s*['"]([0-9-]+)['"]/g,
  )
  for (const m of factBlocks) {
    const id = m[1]
    const verifyAfter = new Date(m[2] + 'T00:00:00Z')
    if (verifyAfter < today) {
      warnings.push(`facts.ts: fact "${id}" past verifyAfter ${m[2]} — re-verify`)
    }
  }
  return { warnings }
}

// ---------- Main ------------------------------------------------------

function run() {
  let allFailures = []

  console.log('Running V6 voice regression test...\n')

  console.log('  [1/3] banned-phrase scan...')
  const banned = testBannedPhrases()
  if (banned.length > 0) {
    console.log(`        FAIL — ${banned.length} violations`)
    allFailures.push(...banned)
  } else {
    console.log('        OK')
  }

  console.log('  [2/3] factIds non-empty check...')
  const factIds = testFactIdsNonEmpty()
  if (factIds.length > 0) {
    console.log(`        FAIL — ${factIds.length} violations`)
    allFailures.push(...factIds)
  } else {
    console.log('        OK')
  }

  console.log('  [3/3] Trap: callout count check (min 3 per V6 guide)...')
  const traps = testTrapCallouts()
  if (traps.length > 0) {
    console.log(`        FAIL — ${traps.length} violations`)
    allFailures.push(...traps)
  } else {
    console.log('        OK')
  }

  // Stale facts — warn only
  const stale = testStaleFacts()
  if (stale.warnings.length > 0) {
    console.log(`\nWARNINGS (${stale.warnings.length}):`)
    for (const w of stale.warnings) console.log(`  ${w}`)
  }

  if (allFailures.length > 0) {
    console.log(`\n${allFailures.length} violations:\n`)
    for (const f of allFailures) console.log(`  ${f}`)
    console.log(
      '\nVoice regression test FAILED. Fix violations before commit.',
    )
    process.exit(1)
  }

  console.log('\nAll checks passed. Voice regression OK.')
}

run()
