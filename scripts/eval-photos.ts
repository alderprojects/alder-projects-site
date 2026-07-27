/**
 * v7.4.4 — Report-pipeline eval harness (npm run check:eval).
 *
 * Fixture-driven: test-photos/eval-manifest.json maps photo groups to
 * expectations; this runner drives the REAL HTTP flow (a dev server
 * must be running — default http://localhost:3000) and asserts the
 * non-negotiable product rules on every group:
 *
 *   A1 every report has ≥1 SKIP or WAIT (all tiers, from the DB)
 *   A2 no dollar amounts / percentages / payback claims in any
 *      LLM-authored text field (any tier)
 *   A3 no person/household-inference terms in any text field
 *   A4 no brand names in Check-visible text
 *   A5 INVESTIGATE recs are never smartCartEligible
 *   A6 tenure question present when tenure unknown
 *   A7 cart artifacts persisted for BUY recs, absent from free wire
 *
 * plus per-manifest expectations (categories, exclusions, recency).
 * Reports created here are deleted through the product's own delete
 * endpoint (blobs included). Run before every deploy.
 *
 * Usage: tsx scripts/eval-photos.ts [baseUrl]   (env from .env.local)
 */

import { readFileSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const BASE = process.argv[2] || 'http://localhost:3000'
const ROOT = path.join(__dirname, '..')

for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_0-9]+)="?([^"]*)"?$/)
  if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!
}

const prisma = new PrismaClient()

const MONEY = /\$\s?\d|(?:\d+(?:\.\d+)?)\s?%|\b\d+\s?(?:year|yr|month)s?\s+payback\b/
const PERSON =
  /\b(family|families|kids?|child(?:ren)?|baby|babies|elderly|senior|wife|husband|spouse|income|afford|wealthy|cluttered|messy|hoarder)\b/i
const BRANDS =
  /\b(Panasonic|Broan|NuTone|Mitsubishi|Daikin|Fujitsu|Whirlpool|Bosch|Honeywell|Nest|Ecobee|Frigidaire|Rheem|Kidde|First Alert|Govee|Aqara|DeWalt|Milwaukee|Ryobi)\b/

const CONSENTS = JSON.stringify({ product_improvement: true, valuation_research: true, public_content_use: false })

interface PhotoFixture {
  path: string
  expected_category?: string[]
  expect_privacy_person?: boolean
}
interface Group {
  name: string
  enabled: boolean
  photos: PhotoFixture[]
  expect_min_recs?: number
  expect_verdicts_include?: string[]
  expect_all_excluded?: boolean
  expect_recency_question?: boolean
  expect_tenure_question?: boolean
  answers?: Array<{ questionKey: string; answerText: string }>
}

let failures = 0
let checks = 0
function ok(group: string, name: string, cond: boolean, detail = '') {
  checks++
  if (!cond) failures++
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${group} :: ${name}${detail ? ` — ${detail}` : ''}`)
}

async function run() {
  const manifest = JSON.parse(readFileSync(path.join(ROOT, 'test-photos/eval-manifest.json'), 'utf8')) as {
    groups: Group[]
  }
  const groups = manifest.groups.filter((g) => g.enabled)
  const skipped = manifest.groups.filter((g) => !g.enabled).map((g) => g.name)
  if (skipped.length) console.log(`[eval] disabled groups (fixtures not present yet): ${skipped.join(', ')}`)
  if (groups.length === 0) {
    console.error('[eval] no enabled groups — nothing to assert. Failing closed.')
    process.exit(1)
  }

  for (const group of groups) {
    console.log(`\n== group: ${group.name} ==`)
    // Fresh anon session per group so exclusions don't leak across groups
    let cookie = ''
    const api = async (p: string, o: RequestInit = {}) => {
      const res = await fetch(`${BASE}${p}`, { ...o, headers: { ...(o.headers as object || {}), ...(cookie ? { cookie } : {}) } })
      const sc = res.headers.get('set-cookie')
      const m = sc?.match(/alder_anon_id=[^;]+/)
      if (m) cookie = m[0]
      let json: any = null
      try { json = await res.json() } catch { /* html */ }
      return { status: res.status, json }
    }
    await api('/')

    // Upload
    const snapshotIds: string[] = []
    const photoIds: string[] = []
    for (const photo of group.photos) {
      const bytes = readFileSync(path.join(ROOT, photo.path))
      const form = new FormData()
      form.append('image', new Blob([bytes], { type: 'image/jpeg' }), path.basename(photo.path))
      form.append('consents', CONSENTS)
      const up = await api('/api/photos/upload', { method: 'POST', body: form })
      ok(group.name, `upload ${path.basename(photo.path)}`, up.json?.ok === true, up.json?.error)
      if (!up.json?.ok) continue
      snapshotIds.push(up.json.snapshotId)
      photoIds.push(up.json.photoId)
      if (photo.expected_category) {
        ok(
          group.name,
          `category(${path.basename(photo.path)}) ∈ [${photo.expected_category}]`,
          photo.expected_category.includes(up.json.extraction?.overallCategory),
          `got ${up.json.extraction?.overallCategory}`
        )
      }
      if (photo.expect_privacy_person) {
        const ext = await prisma.visionExtraction.findFirst({
          where: { photoId: up.json.photoId },
          orderBy: { createdAt: 'desc' },
        })
        const priv = (ext?.extractionJson as any)?.privacy
        ok(group.name, `privacy object flags person`, priv?.people_present === true || priv?.faces_visible === true, JSON.stringify(priv ?? 'absent'))
      }
    }

    // Recommend
    const rec = await api('/api/photos/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshotIds }),
    })

    if (group.expect_all_excluded) {
      const wholly = rec.json?.ok === false && rec.json?.error === 'no_usable_features'
      const partially = rec.json?.ok === true && (rec.json?.exclusionNotice ?? null) !== null
      ok(group.name, 'all photos excluded pre-analysis', wholly || partially, rec.json?.error ?? rec.json?.exclusionNotice)
      if (rec.json?.reportId) await api('/api/photos/recommend/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportId: rec.json.reportId }) })
      continue
    }

    ok(group.name, 'report generated', rec.json?.ok === true, rec.json?.error)
    if (!rec.json?.ok) continue
    const reportId = rec.json.reportId as string

    // Universal assertions (DB, all tiers)
    const rows = await prisma.recommendation.findMany({ where: { reportId } })
    const verdicts = rows.map((r) => r.verdict)
    ok(group.name, 'A1 ≥1 SKIP/WAIT', verdicts.some((v) => v === 'SKIP' || v === 'WAIT'), verdicts.join(','))
    const allText = JSON.stringify(
      rows.map((r) => [r.title, r.summary, r.nextAction, r.visibleEvidenceJson, r.assumptionsJson, r.limitationsJson])
    )
    ok(group.name, 'A2 no fabricated numbers in text', !MONEY.test(allText))
    ok(group.name, 'A3 no person-inference terms', !PERSON.test(allText))
    ok(group.name, 'A4 no brands in Check text', !BRANDS.test(allText))
    ok(group.name, 'A5 INVESTIGATE never cart-eligible', rows.every((r) => r.verdict !== 'INVESTIGATE' || !r.smartCartEligible))
    const buys = rows.filter((r) => r.verdict === 'BUY')
    const cartLines = await prisma.cartCandidate.count({ where: { recommendationId: { in: rows.map((r) => r.id) } } })
    ok(group.name, 'A7 cart artifacts persisted for BUYs', buys.length === 0 || cartLines > 0, `${cartLines} lines / ${buys.length} BUYs`)
    ok(group.name, 'A7 cart artifacts absent from free wire', (rec.json.recommendations ?? []).every((r: any) => r.cartArtifacts === undefined))

    if (group.expect_min_recs) ok(group.name, `≥${group.expect_min_recs} recs`, rows.length >= group.expect_min_recs, `${rows.length}`)
    if (group.expect_verdicts_include)
      for (const v of group.expect_verdicts_include) ok(group.name, `verdicts include ${v}`, verdicts.includes(v), verdicts.join(','))
    if (group.expect_tenure_question) ok(group.name, 'A6 tenure question', rec.json.tenureQuestion?.key === 'tenure')
    if (group.expect_recency_question) ok(group.name, 'recency question', rec.json.recency?.flagged === true, JSON.stringify(rec.json.recency))

    // Answers (refinement path)
    for (const a of group.answers ?? []) {
      const ans = await api('/api/photos/recommend/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, ...a }),
      })
      ok(group.name, `answer ${a.questionKey} ok`, ans.json?.ok === true, ans.json?.error)
      if (a.questionKey === 'tenure' && a.answerText === 'rent') {
        // Rent-safety: after the rent answer, no BUY may remain whose cart
        // lines all imply permanent installation (proxy: hire_pro installs).
        const after = await prisma.recommendation.findMany({ where: { reportId, verdict: 'BUY' }, include: { cartCandidates: true } })
        const permanentBuy = after.filter(
          (r) => r.cartCandidates.length > 0 && r.cartCandidates.every((c) => c.installDifficulty === 'hire_pro' && c.fitStatus !== 'removed')
        )
        ok(group.name, 'rent-safe: no hire-pro-only BUY after rent answer', permanentBuy.length === 0, permanentBuy.map((r) => r.title).join('; '))
      }
    }

    // Cleanup via the product's own delete (removes blobs too)
    const del = await api('/api/photos/recommend/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId }),
    })
    ok(group.name, 'cleanup delete', del.json?.ok === true)
  }

  console.log(`\n[eval] ${checks} checks, ${failures} failure(s)`)
  await prisma.$disconnect()
  process.exit(failures === 0 ? 0 : 1)
}

run().catch(async (e) => {
  console.error('[eval] crashed:', e)
  await prisma.$disconnect()
  process.exit(1)
})
