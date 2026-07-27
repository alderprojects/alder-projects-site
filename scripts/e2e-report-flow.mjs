/**
 * v7.4.2d — Live end-to-end exercise of the Alder Check pipeline.
 *
 * Drives the REAL HTTP flow against a running server (default
 * http://localhost:3000) with real photos, then makes DB-side
 * assertions with Prisma. Exits non-zero on any invariant failure.
 *
 * Usage: node scripts/e2e-report-flow.mjs [baseUrl]
 * Env: reads .env.local for DATABASE_URL/DIRECT_URL (Prisma asserts).
 * Pass SKIP_DB=1 to skip DB-side assertions (e.g. against prod).
 */

import { readFileSync } from 'fs'
import { basename } from 'path'

const BASE = process.argv[2] || 'http://localhost:3000'
const SKIP_DB = process.env.SKIP_DB === '1'

// Load .env.local for Prisma (values never printed)
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_0-9]+)="?([^"]*)"?$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const CONSENTS = JSON.stringify({ product_improvement: true, valuation_research: true, public_content_use: false })
const BRANDS =
  /\b(Panasonic|Broan|NuTone|Mitsubishi|Daikin|Fujitsu|Whirlpool|Bosch|Honeywell|Nest|Ecobee|Frigidaire|Rheem|Kidde|First Alert|Govee|Aqara|DeWalt|Milwaukee|Ryobi)\b/

let cookie = ''
let failures = 0
const timings = {}

function ok(name, cond, detail = '') {
  const mark = cond ? 'PASS' : 'FAIL'
  if (!cond) failures++
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ''}`)
}

async function api(path, opts = {}) {
  const t0 = Date.now()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...(opts.headers || {}), ...(cookie ? { cookie } : {}) },
  })
  const setCookie = res.headers.get('set-cookie')
  if (setCookie) {
    const m = setCookie.match(/alder_anon_id=[^;]+/)
    if (m) cookie = m[0]
  }
  const ms = Date.now() - t0
  let json = null
  try {
    json = await res.json()
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json, ms }
}

async function upload(filePath) {
  const bytes = readFileSync(filePath)
  const form = new FormData()
  form.append('image', new Blob([bytes], { type: 'image/jpeg' }), basename(filePath))
  form.append('consents', CONSENTS)
  const { status, json, ms } = await api('/api/photos/upload', { method: 'POST', body: form })
  console.log(`  upload ${basename(filePath)}: ${status} in ${ms}ms, features=${json?.extraction?.featureCount ?? 'n/a'}, category=${json?.extraction?.overallCategory ?? 'n/a'}`)
  return { json, ms }
}

const prisma = SKIP_DB
  ? null
  : new (await import('@prisma/client')).PrismaClient()

// ── 0. Prime the anon session (middleware sets alder_anon_id on page
//      loads, not on direct API hits) ───────────────────────────────
console.log('\n== Step 0: prime anon session via GET / ==')
await api('/')
console.log(`  cookie acquired: ${cookie ? 'yes' : 'NO'}`)

// ── 1. Upload 3 person-free photos ─────────────────────────────────
console.log('\n== Step A: upload 3 person-free photos ==')
const snapshotIds = new Set()
let uploadOk = true
for (const p of [
  'test-photos/living_room/pexels-living-room.jpg',
  'test-photos/kitchen/pexels-old-kitchen.jpg',
  'test-photos/basement/pexels-basement.jpg',
]) {
  const { json } = await upload(p)
  if (!json?.ok || !json.snapshotId) uploadOk = false
  else snapshotIds.add(json.snapshotId)
  if (json?.extraction == null) console.log(`    extractionError: ${json?.extractionError}`)
}
ok('all uploads returned ok + snapshotId', uploadOk && snapshotIds.size >= 1, `${snapshotIds.size} snapshot(s)`)

// ── 2. Recommend (free tier) ────────────────────────────────────────
console.log('\n== Step B: POST /api/photos/recommend ==')
const rec = await api('/api/photos/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ snapshotIds: [...snapshotIds], userPrompt: 'just moved in, no heat pump' }),
})
timings.recommend = rec.ms
console.log(`  status ${rec.status} in ${rec.ms}ms`)
const R = rec.json
ok('recommend ok', R?.ok === true, R?.error)
if (!R?.ok) {
  console.log(JSON.stringify(R).slice(0, 400))
  process.exit(1)
}
const reportId = R.reportId
const freeRecs = R.recommendations ?? []
const locked = R.lockedRecommendations ?? []
console.log(`  reportId=${reportId} freeRecs=${freeRecs.length} locked=${locked.length} buyCount=${R.upsell?.buyCount}`)
ok('≤2 free recs', freeRecs.length <= 2)
ok('tenure question present', R.tenureQuestion?.key === 'tenure')
const freeText = JSON.stringify(freeRecs.map((r) => [r.title, r.summary, r.nextAction, r.visibleEvidence]))
ok('no dollar signs in free text', !/\$\s?\d/.test(freeText))
ok('no brand names in free text', !BRANDS.test(freeText))
ok('no cartArtifacts on the wire at free tier', freeRecs.every((r) => r.cartArtifacts === undefined))
ok('upsell only if ≥1 BUY', R.upsell.eligible === (R.upsell.buyCount > 0))

if (!SKIP_DB) {
  const allRecs = await prisma.recommendation.findMany({ where: { reportId } })
  const skipWait = allRecs.filter((r) => r.verdict === 'WAIT' || r.verdict === 'SKIP')
  ok('DB: ≥1 SKIP/WAIT across all tiers', skipWait.length >= 1, allRecs.map((r) => r.verdict).join(','))
  const buys = allRecs.filter((r) => r.verdict === 'BUY')
  const carts = await prisma.cartCandidate.count({ where: { recommendationId: { in: allRecs.map((r) => r.id) } } })
  ok('DB: cart artifacts persisted for BUY recs', buys.length === 0 || carts > 0, `${carts} lines for ${buys.length} BUYs`)
  ok('DB: INVESTIGATE never smartCartEligible', allRecs.every((r) => r.verdict !== 'INVESTIGATE' || !r.smartCartEligible))
}

// ── 3. Refine: tenure=rent ──────────────────────────────────────────
console.log('\n== Step C: answer tenure=rent ==')
const ans = await api('/api/photos/recommend/answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reportId, questionKey: 'tenure', answerText: 'rent' }),
})
timings.answer = ans.ms
console.log(`  status ${ans.status} in ${ans.ms}ms, changes=${JSON.stringify(ans.json?.changes ?? [])}`)
ok('answer ok', ans.json?.ok === true, ans.json?.error)
ok('status CHECK_REFINED', ans.json?.status === 'CHECK_REFINED')
if (!SKIP_DB && (ans.json?.changes ?? []).some((c) => c.from === 'BUY' && c.to !== 'BUY')) {
  const changed = ans.json.changes.filter((c) => c.from === 'BUY' && c.to !== 'BUY')
  for (const c of changed) {
    const live = await prisma.cartCandidate.count({
      where: { recommendationId: c.recommendationId, fitStatus: { not: 'removed' } },
    })
    ok(`DB: cart lines removed for demoted rec ${c.key}`, live === 0, `${live} live lines`)
  }
}

// ── 4. Person photo exclusion ───────────────────────────────────────
console.log('\n== Step D: person-photo exclusion (fresh set) ==')
const personUp = await upload('test-photos/kitchen/pexels-person-in-kitchen.jpg')
let personReportOk = true
if (personUp.json?.ok) {
  const rec2 = await api('/api/photos/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshotIds: [personUp.json.snapshotId] }),
  })
  const excluded = (rec2.json?.exclusionNotice ?? null) !== null
  if (rec2.json?.ok) {
    ok('person photo excluded', excluded, rec2.json?.exclusionNotice ?? 'NOT excluded — PROMPT GAP if extraction lacks privacy flag')
  } else {
    // If ALL photos excluded, pipeline correctly errors no_usable_features
    ok('person photo excluded (whole set rejected)', rec2.json?.error === 'no_usable_features', rec2.json?.error)
  }
  // cleanup second report if created
  if (rec2.json?.reportId) {
    await api('/api/photos/recommend/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: rec2.json.reportId }),
    })
  }
} else {
  personReportOk = false
  ok('person photo upload', false, personUp.json?.error)
}

// ── 5. report/latest sanity ─────────────────────────────────────────
console.log('\n== Step E: /api/report/latest ==')
const latest = await api(`/api/report/latest?after=2020-01-01T00:00:00Z`)
ok('latest finds the report', latest.json?.ok === true && latest.json?.found === true && latest.json?.reportId === reportId)

// ── 6. Delete (also the cleanup) ────────────────────────────────────
console.log('\n== Step F: delete report + photos ==')
const del = await api('/api/photos/recommend/delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reportId }),
})
console.log(`  status ${del.status} photosDeleted=${del.json?.photosDeleted} blobsDeleted=${del.json?.blobsDeleted}`)
ok('delete ok', del.json?.ok === true)
if (!SKIP_DB) {
  const remaining = await prisma.report.count({ where: { id: reportId } })
  ok('DB: report row gone', remaining === 0)
}

console.log(`\n== timings: recommend=${timings.recommend}ms answer=${timings.answer}ms ==`)
if (prisma) await prisma.$disconnect()
console.log(failures === 0 ? '\nE2E: ALL PASS' : `\nE2E: ${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
