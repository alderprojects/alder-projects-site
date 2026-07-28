/** §2-T Phase 2 tests: match scorer, confidence gate, CR4, CR5, freshness, quota drill. */
import { PrismaClient } from '@prisma/client'
import { matchScore, resolveOne, specHashFor, RESOLUTION_FLOOR } from '@/lib/commerce/resolve'
import { categoryForProduct, illustrationUrl, ILLUSTRATION_CATEGORIES } from '@/lib/commerce/categories'

const p = new PrismaClient()
let pass = 0, fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  [PASS] ${name}`) } else { fail++; console.log(`  [FAIL] ${name} ${detail}`) }
}

const caulkReq = {
  recKey: 'caulk', verdict: 'BUY',
  productCategory: 'mildew-resistant bathroom sealant',
  searchQuery: 'mildew resistant bathroom caulk sealant',
  requiredSpecs: [{ spec: 'mold-resistant formulation', why: 'wet area' }, { spec: '5.5 oz cartridge', why: 'standard gun' }],
  specificity: 0.8,
}

async function main() {
  console.log('\n=== §2-T: match scorer (deterministic, no LLM) ===')
  {
    const good = matchScore(caulkReq, { title: 'Mildew Resistant Bathroom Caulk Sealant, 5.5oz Cartridge, White' })
    const wrong = matchScore(caulkReq, { title: 'Garden Hose Reel Cart 100ft Heavy Duty' })
    const partial = matchScore(caulkReq, { title: 'Silicone Sealant Clear' })
    console.log(`      good=${good.toFixed(3)} partial=${partial.toFixed(3)} wrong=${wrong.toFixed(3)} floor=${RESOLUTION_FLOOR}`)
    check('exact-type + size match scores above the floor', good >= RESOLUTION_FLOOR, String(good))
    check('wrong product type scores far below floor', wrong < 0.4, String(wrong))
    check('good beats partial beats wrong', good > partial && partial > wrong)
    check('scorer is deterministic', matchScore(caulkReq, { title: 'Mildew Resistant Bathroom Caulk Sealant, 5.5oz Cartridge, White' }) === good)
    check('empty title scores 0', matchScore(caulkReq, { title: null }) === 0)
  }

  console.log('\n=== §2-T: confidence gate — vague fixture → SEARCH + illustration ===')
  {
    const vague = { recKey: 'vague', verdict: 'BUY', productCategory: 'some caulk', searchQuery: 'caulk', requiredSpecs: [], specificity: 0.2 }
    const r = await resolveOne(vague)
    check('vague item resolves in SEARCH mode', r.resolutionMode === 'SEARCH', r.resolutionMode)
    check('vague item has NO asin', r.asin === null)
    check('vague item gets a tagged search url', /amazon\./.test(r.url) && /tag=/.test(r.url), r.url)
    check('vague item gets an illustration', r.illustration.endsWith('.svg'), r.illustration)
    check('illustration category is sensible', r.category === 'sealants_caulk', r.category)
  }

  console.log('\n=== §2-T: CR4 lane honesty (resolver never runs off-lane) ===')
  {
    const { resolveForReport } = await import('@/lib/commerce/resolve')
    const reqs = ['BUY', 'WAIT', 'SKIP', 'INVESTIGATE'].map((v) => ({ ...caulkReq, recKey: `k_${v}`, verdict: v }))
    const map = await resolveForReport(reqs)
    check('BUY resolved', map.has('k_BUY'))
    check('WAIT resolved (identification, no CTA at render)', map.has('k_WAIT'))
    check('SKIP NOT resolved — no link can exist', !map.has('k_SKIP'))
    check('INVESTIGATE NOT resolved — no link can exist', !map.has('k_INVESTIGATE'))
  }

  console.log('\n=== §2-T: CR5 image sources ===')
  {
    check('every category has a vivid + muted asset', ILLUSTRATION_CATEGORIES.every((c) =>
      illustrationUrl(c, false).endsWith(`${c}.svg`) && illustrationUrl(c, true).endsWith(`${c}-muted.svg`)))
    check('10 categories defined', ILLUSTRATION_CATEGORIES.length === 10)
    check('unknown product falls back to general', categoryForProduct('zzz unknown thing') === 'general')
    check('leak sensor → moisture_control', categoryForProduct('battery water leak sensor') === 'moisture_control')
    check('GFCI → electrical', categoryForProduct('GFCI receptacle upgrade') === 'electrical')
  }

  console.log('\n=== §2-T: caching + freshness ===')
  {
    const h1 = specHashFor(caulkReq)
    const h2 = specHashFor({ ...caulkReq, requiredSpecs: [...caulkReq.requiredSpecs].reverse() })
    check('specHash is order-insensitive (identical specs resolve once)', h1 === h2)
    const h3 = specHashFor({ ...caulkReq, searchQuery: 'different query entirely' })
    check('different spec → different hash', h1 !== h3)

    const row = await p.resolvedProduct.findUnique({ where: { specHash: specHashFor({ productCategory: 'some caulk', searchQuery: 'caulk', requiredSpecs: [] }) } })
    check('resolution persisted to ResolvedProduct', row != null)
    check('persisted row records SEARCH mode', row?.resolutionMode === 'SEARCH')
  }

  console.log('\n=== §2-T: quota drill (API unavailable → still renders) ===')
  {
    // PA-API keys are absent in this environment, so searchItems() returns
    // [] on every call — this IS the quota/outage path.
    const r = await resolveOne({ ...caulkReq, recKey: 'quota_drill' })
    check('API unavailable → result still resolves', r != null)
    check('degrades to SEARCH mode, never a guessed ASIN', r.resolutionMode === 'SEARCH' && r.asin === null)
    check('customer still gets a working link', /amazon\./.test(r.url))
    const ev = await p.eventLog.findFirst({ where: { eventType: 'PRODUCT_RESOLUTION_FALLBACK' }, orderBy: { occurredAt: 'desc' } })
    check('PRODUCT_RESOLUTION_FALLBACK event logged', ev != null)
    check('fallback reason recorded', ev != null && /no_candidates|below_floor/.test(JSON.stringify(ev.payloadJson)))
  }

  await p.resolvedProduct.deleteMany({ where: { query: { in: ['caulk', caulkReq.searchQuery] } } })
  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
  await p.$disconnect()
  process.exit(fail === 0 ? 0 : 1)
}
main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1) })
