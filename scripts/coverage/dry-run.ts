/**
 * v7.4.13 — READ-ONLY dry run of the coverage mapping against real reports.
 *
 * Writes nothing. Answers the only question the unit tests can't: does the
 * mapping table actually light regions when pointed at real production
 * extractions, or does everything fall into the generic slot?
 *
 *   npx tsx scripts/coverage/dry-run.ts [reportId]
 *
 * With no argument it runs over every report that has a captured email —
 * exactly the population the backfill would touch.
 */
import { prisma } from '@/lib/db'
import { mapFeatures, type MappableFeature } from '@/lib/coverage/mapping'
import { evaluateSlot, SLOT_QUALITY_FLOOR, type SlotObservation } from '@/lib/coverage/quality'
import { buildCoverageView, coverageHeadline, type StoredSlot } from '@/lib/coverage/state'
import { GENERIC_SLOT_ID } from '@/lib/coverage/schema'

interface ExtractionShape {
  features?: Array<{ type: string; confidence: number; category_hint?: string }>
}

async function main() {
  const argId = process.argv[2]
  const reports = await prisma.report.findMany({
    where: argId ? { id: argId } : { emailCapturedAt: { not: null }, deletedAt: null },
    select: { id: true, createdAt: true, snapshotIds: true, emailCapturedAt: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`\nDRY RUN — ${reports.length} report(s), quality floor ${SLOT_QUALITY_FLOOR}\n`)
  if (reports.length === 0) {
    console.log('No reports with a captured email. Nothing for the backfill to do.')
    return
  }

  let totalFeatures = 0
  let totalUnmapped = 0
  const unmappedTypes = new Map<string, number>()

  for (const report of reports) {
    const photos = await prisma.photo.findMany({
      where: { roomSnapshotId: { in: report.snapshotIds }, hiddenAt: null },
      include: { extractions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })

    const observations = new Map<string, SlotObservation[]>()
    for (const photo of photos) {
      const extraction = photo.extractions[0]
      if (!extraction) continue
      const json = extraction.extractionJson as unknown as ExtractionShape
      const features: MappableFeature[] = (json.features ?? []).map((f) => ({
        type: f.type, confidence: f.confidence, category_hint: f.category_hint,
      }))
      totalFeatures += features.length
      const { matches, unmapped } = mapFeatures(features)
      totalUnmapped += unmapped.length
      for (const u of unmapped) {
        unmappedTypes.set(`${u.type} (${u.categoryHint})`, (unmappedTypes.get(`${u.type} (${u.categoryHint})`) ?? 0) + 1)
      }
      matches.forEach((m, i) => {
        const key = `${m.systemId}/${m.slotId}`
        const list = observations.get(key) ?? []
        list.push({ type: features[i]?.type ?? '?', confidence: features[i]?.confidence ?? 0 })
        observations.set(key, list)
      })
    }

    const wouldFill: StoredSlot[] = []
    const coached: string[] = []
    for (const [key, obs] of Array.from(observations.entries())) {
      const [systemId, slotId] = key.split('/')
      const outcome = evaluateSlot(systemId, slotId, obs)
      if (outcome.state === 'FILL') {
        wouldFill.push({ systemId, slotId, readAt: report.createdAt, photoQualityScore: outcome.score, filledByReportId: report.id })
      } else if (outcome.state === 'COACH') {
        coached.push(`${key} (${outcome.score.toFixed(3)}) — ${outcome.message}`)
      }
    }

    const view = buildCoverageView(wouldFill, new Date())
    console.log(`── report ${report.id}  (${photos.length} photos, ${report.createdAt.toISOString().slice(0, 10)})`)
    console.log(`   ${coverageHeadline(view)}`)
    for (const s of view.systems.filter((x) => x.state !== 'dark')) {
      const generic = wouldFill.some((f) => f.systemId === s.systemId && f.slotId === GENERIC_SLOT_ID)
      console.log(`     ${s.label}: ${s.filledCount}/${s.totalCount}${generic ? ' (+ generic)' : ''}` +
        (s.genericOnly ? '  ← system seen, no specific shot' : ''))
      for (const sl of s.slots.filter((x) => x.filled)) {
        console.log(`        ✓ ${sl.label}  q=${sl.photoQualityScore?.toFixed(3)}`)
      }
    }
    if (coached.length) {
      console.log(`   coached (near-miss, no fill):`)
      for (const c of coached) console.log(`        · ${c}`)
    }
    console.log()
  }

  console.log(`── mapping coverage`)
  console.log(`   features seen:    ${totalFeatures}`)
  console.log(`   mapped:           ${totalFeatures - totalUnmapped} (${((1 - totalUnmapped / Math.max(1, totalFeatures)) * 100).toFixed(1)}%)`)
  console.log(`   unmapped:         ${totalUnmapped}`)
  if (unmappedTypes.size) {
    console.log(`   unmapped types (schema v2 input):`)
    for (const [t, n] of Array.from(unmappedTypes.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`        ${n}×  ${t}`)
    }
  }
  console.log()
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
