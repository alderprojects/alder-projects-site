// V6 scaffold audit — run at the start of V7 work to confirm the
// V6 dependencies V7 reads from are in place.
//
// V7 commits 4-32 reference these artifacts as upstream:
//   - src/content/facts.ts          FACTS table (numeric citations)
//   - src/content/traps.ts          TRAPS table (structured callouts)
//   - src/content/voice-guide.md    voice rules (Real Talk VT)
//   - src/components/GuideFooter.tsx  E-E-A-T scaffold
//   - src/lib/jsonld.ts             JSON-LD helpers
//
// Exits 0 if all present; exits 1 with a missing-files list if any
// are absent. Spec calls for scripts/v6-audit.ts; matches existing
// audit script convention (.mjs) so it runs without a TS toolchain.
//
// Usage: node scripts/v6-audit.mjs

import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')

const REQUIRED = [
  { path: 'src/content/facts.ts',          purpose: 'V6 FACTS table — numeric citations' },
  { path: 'src/content/traps.ts',          purpose: 'V6 TRAPS table — structured trap callouts' },
  { path: 'src/content/voice-guide.md',    purpose: 'V6 voice spec — Real Talk VT' },
  { path: 'src/components/GuideFooter.tsx', purpose: 'V6 E-E-A-T scaffold' },
  { path: 'src/lib/jsonld.ts',             purpose: 'V6 JSON-LD helpers' },
]

let missingCount = 0
const missing = []

console.log('V6 scaffold audit')
console.log('')

for (const { path, purpose } of REQUIRED) {
  const full = join(REPO_ROOT, path)
  const present = existsSync(full)
  const mark = present ? 'OK' : 'MISSING'
  console.log(`  [${mark.padEnd(7)}] ${path}  — ${purpose}`)
  if (!present) {
    missingCount += 1
    missing.push(path)
  }
}

console.log('')
if (missingCount === 0) {
  console.log('All V6 scaffold present. V7 work can proceed.')
  process.exit(0)
} else {
  console.log(`${missingCount} V6 artifact(s) missing — ship V6 catch-up before V7 work:`)
  for (const path of missing) console.log(`  - ${path}`)
  process.exit(1)
}
