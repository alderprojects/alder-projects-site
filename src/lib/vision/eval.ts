/**
 * v7.3.3-C-PR1 — Open Vision Extraction Eval Harness
 *
 * Replaces the v1.0.0 closed-schema eval. Runs extractOpenFeatures
 * against every photo in eval/corpus/, writes per-photo JSON results
 * + a markdown summary to eval/results/<ISO timestamp>/.
 *
 * Usage:
 *   1. Drop CC photos into /eval/corpus/ (jpg, jpeg, png, webp).
 *      Subfolder structure is optional and used only for labeling in
 *      the report — e.g. eval/corpus/basement/*.jpg, eval/corpus/kitchen/*.jpg
 *   2. Run: `npm run vision:eval` (or `npx tsx src/lib/vision/eval.ts`)
 *   3. Inspect eval/results/<timestamp>/summary.md
 *
 * Per the v7.3.3-C brief the eval is informational, not a gate. The
 * goals are:
 *   - Confirm extractOpenFeatures works on a diverse photo set
 *   - Measure feature-count + category distribution
 *   - Surface low-confidence patterns
 *   - Track per-call latency + token cost
 *
 * The "pass criteria" from v1.0.0 (room-type accuracy, value-judgment
 * detection) don't apply to open extraction the same way. New criteria
 * are emergent — we'll define them once we see real-corpus output.
 *
 * Requires ANTHROPIC_API_KEY in env. The script intentionally does NOT
 * load Prisma — eval should not touch the database.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { extractOpenFeatures, MODEL_VERSION, OPEN_EXTRACTION_PROMPT_VERSION } from './extract'
import type { OpenExtraction } from './prompt'
import { OpenExtractionParseError } from './prompt'

const CORPUS_DIR = path.join(process.cwd(), 'eval', 'corpus')
const RESULTS_DIR = path.join(process.cwd(), 'eval', 'results')

interface EvalCase {
  filename: string
  fullPath: string
  /** Subfolder name, if any. Used only for labeling in the report. */
  label: string | null
  extraction?: OpenExtraction
  latencyMs?: number
  tokensIn?: number
  tokensOut?: number
  apiCostCents?: number
  error?: string
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set. Add it to .env.local and re-run.')
    process.exit(1)
  }

  try {
    await fs.access(CORPUS_DIR)
  } catch {
    console.error(`Corpus directory not found: ${CORPUS_DIR}`)
    console.error('Drop test photos there. See eval/README.md for instructions.')
    process.exit(1)
  }

  const cases = await collectCases(CORPUS_DIR)
  if (cases.length === 0) {
    console.error(`No photos found in ${CORPUS_DIR}.`)
    console.error('Supported formats: jpg, jpeg, png, webp.')
    process.exit(1)
  }

  console.log(`[eval] running open extraction on ${cases.length} photos`)
  console.log(`[eval] model=${MODEL_VERSION} prompt=${OPEN_EXTRACTION_PROMPT_VERSION}`)

  const startedAt = new Date()
  const runDir = path.join(RESULTS_DIR, startedAt.toISOString().replace(/[:.]/g, '-'))
  await fs.mkdir(runDir, { recursive: true })

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i]!
    const labelPrefix = c.label ? `${c.label}/` : ''
    process.stdout.write(`[${i + 1}/${cases.length}] ${labelPrefix}${c.filename} ... `)
    try {
      const buffer = await fs.readFile(c.fullPath)
      const mediaType = mediaTypeFor(c.filename)
      const result = await extractOpenFeatures({ imageBuffer: buffer, mediaType })
      c.extraction = result.extraction
      c.latencyMs = result.latencyMs
      c.tokensIn = result.tokensIn
      c.tokensOut = result.tokensOut
      c.apiCostCents = result.apiCostCents
      console.log(
        `ok (${result.extraction.features.length} features, ${result.latencyMs}ms, ${result.apiCostCents.toFixed(2)}¢)`
      )
    } catch (e) {
      if (e instanceof OpenExtractionParseError) {
        c.error = `${e.code}: ${e.message}`
      } else {
        c.error = (e as Error).message
      }
      console.log(`FAIL — ${c.error.slice(0, 100)}`)
    }
  }

  // Write per-case JSON files
  for (const c of cases) {
    const safeName = `${c.label ?? 'root'}__${c.filename}.json`.replace(/[^a-zA-Z0-9_.\-]/g, '_')
    await fs.writeFile(
      path.join(runDir, safeName),
      JSON.stringify(
        {
          filename: c.filename,
          label: c.label,
          extraction: c.extraction ?? null,
          latencyMs: c.latencyMs,
          tokensIn: c.tokensIn,
          tokensOut: c.tokensOut,
          apiCostCents: c.apiCostCents,
          error: c.error ?? null,
        },
        null,
        2
      )
    )
  }

  // Write summary
  const summary = computeSummary(cases)
  const summaryMd = renderSummary(summary, cases, startedAt)
  await fs.writeFile(path.join(runDir, 'summary.md'), summaryMd)
  await fs.writeFile(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2))

  console.log(`\n[eval] results: ${runDir}`)
  console.log(`[eval] open summary.md for the report`)
}

function mediaTypeFor(filename: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (/\.png$/i.test(filename)) return 'image/png'
  if (/\.webp$/i.test(filename)) return 'image/webp'
  return 'image/jpeg'
}

async function collectCases(root: string): Promise<EvalCase[]> {
  const cases: EvalCase[] = []
  const entries = await fs.readdir(root, { withFileTypes: true })
  // Top-level files (no subfolder)
  for (const entry of entries) {
    if (entry.isFile() && isImage(entry.name)) {
      cases.push({
        filename: entry.name,
        fullPath: path.join(root, entry.name),
        label: null,
      })
    }
    if (entry.isDirectory()) {
      const subentries = await fs.readdir(path.join(root, entry.name), { withFileTypes: true })
      for (const sub of subentries) {
        if (sub.isFile() && isImage(sub.name)) {
          cases.push({
            filename: sub.name,
            fullPath: path.join(root, entry.name, sub.name),
            label: entry.name,
          })
        }
      }
    }
  }
  return cases
}

function isImage(name: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(name)
}

interface EvalSummary {
  total: number
  succeeded: number
  failed: number
  successPct: number
  // Feature-count distribution
  featureCount: { min: number; mean: number; max: number; median: number }
  // Mean confidence across all features in all photos
  meanFeatureConfidence: number
  // How many photos returned at least one feature with confidence >= 0.7
  photosWithUsefulFeature: number
  // Category distribution (overall_photo_category)
  overallCategoryDistribution: Record<string, number>
  // Feature-type frequency (top 30)
  topFeatureTypes: Array<{ type: string; count: number }>
  // Cost
  totalCostCents: number
  meanCostCents: number
  // Latency
  meanLatencyMs: number
  // Notes — how often was a note returned non-empty
  photosWithNotes: number
}

function computeSummary(cases: EvalCase[]): EvalSummary {
  const succeeded = cases.filter((c) => !!c.extraction)
  const failed = cases.filter((c) => !c.extraction)

  const featureCounts = succeeded.map((c) => c.extraction!.features.length).sort((a, b) => a - b)
  const allFeatures = succeeded.flatMap((c) => c.extraction!.features)
  const allConfidences = allFeatures.map((f) => f.confidence)

  const meanFeatureConfidence =
    allConfidences.length > 0
      ? allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length
      : 0

  const photosWithUsefulFeature = succeeded.filter((c) =>
    c.extraction!.features.some((f) => f.confidence >= 0.7)
  ).length

  const overallCategoryDistribution: Record<string, number> = {}
  for (const c of succeeded) {
    const cat = c.extraction!.overall_photo_category
    overallCategoryDistribution[cat] = (overallCategoryDistribution[cat] ?? 0) + 1
  }

  const typeCounts: Record<string, number> = {}
  for (const f of allFeatures) {
    typeCounts[f.type] = (typeCounts[f.type] ?? 0) + 1
  }
  const topFeatureTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([type, count]) => ({ type, count }))

  const totalCostCents = succeeded.reduce((acc, c) => acc + (c.apiCostCents ?? 0), 0)
  const totalLatencyMs = succeeded.reduce((acc, c) => acc + (c.latencyMs ?? 0), 0)

  const photosWithNotes = succeeded.filter(
    (c) => c.extraction!.notes && c.extraction!.notes.trim().length > 0
  ).length

  return {
    total: cases.length,
    succeeded: succeeded.length,
    failed: failed.length,
    successPct: cases.length > 0 ? Math.round((succeeded.length / cases.length) * 1000) / 10 : 0,
    featureCount: {
      min: featureCounts[0] ?? 0,
      max: featureCounts[featureCounts.length - 1] ?? 0,
      median: featureCounts[Math.floor(featureCounts.length / 2)] ?? 0,
      mean:
        featureCounts.length > 0
          ? Math.round((featureCounts.reduce((a, b) => a + b, 0) / featureCounts.length) * 100) /
            100
          : 0,
    },
    meanFeatureConfidence: Math.round(meanFeatureConfidence * 1000) / 1000,
    photosWithUsefulFeature,
    overallCategoryDistribution,
    topFeatureTypes,
    totalCostCents: Math.round(totalCostCents * 100) / 100,
    meanCostCents:
      succeeded.length > 0 ? Math.round((totalCostCents / succeeded.length) * 100) / 100 : 0,
    meanLatencyMs:
      succeeded.length > 0 ? Math.round(totalLatencyMs / succeeded.length) : 0,
    photosWithNotes,
  }
}

function renderSummary(s: EvalSummary, cases: EvalCase[], startedAt: Date): string {
  const failedCases = cases.filter((c) => !!c.error)
  const lowConfCases = cases
    .filter((c) => c.extraction && c.extraction.features.length > 0)
    .filter((c) => {
      const mean =
        c.extraction!.features.reduce((acc, f) => acc + f.confidence, 0) /
        c.extraction!.features.length
      return mean < 0.6
    })

  const categoryRows = Object.entries(s.overallCategoryDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `| ${cat} | ${count} |`)
    .join('\n')

  const topTypesRows = s.topFeatureTypes
    .map((t) => `| ${t.type} | ${t.count} |`)
    .join('\n')

  return `# Vision Eval Summary

- **Started**: ${startedAt.toISOString()}
- **Model**: ${MODEL_VERSION}
- **Prompt version**: ${OPEN_EXTRACTION_PROMPT_VERSION}

## Run

| Metric | Value |
| --- | --- |
| Total photos | ${s.total} |
| Succeeded | ${s.succeeded} (${s.successPct}%) |
| Failed | ${s.failed} |
| Photos with ≥1 feature ≥0.7 conf | ${s.photosWithUsefulFeature} |
| Photos with non-empty notes | ${s.photosWithNotes} |
| Mean feature confidence | ${s.meanFeatureConfidence} |
| Mean latency / photo | ${s.meanLatencyMs}ms |
| Mean cost / photo | ${s.meanCostCents}¢ |
| Total run cost | ${s.totalCostCents}¢ |

## Feature count distribution

| Stat | Value |
| --- | --- |
| Min | ${s.featureCount.min} |
| Median | ${s.featureCount.median} |
| Mean | ${s.featureCount.mean} |
| Max | ${s.featureCount.max} |

## overall_photo_category distribution

| Category | Count |
| --- | --- |
${categoryRows || '| _no successful runs_ | 0 |'}

## Top feature types

| Type | Count |
| --- | --- |
${topTypesRows || '| _no features extracted_ | 0 |'}

## Failed cases

${failedCases.length === 0 ? '_none_' : failedCases.map((c) => `- \`${c.label ?? 'root'}/${c.filename}\` — ${c.error?.slice(0, 200)}`).join('\n')}

## Low-confidence cases (mean feature conf < 0.6)

${lowConfCases.length === 0 ? '_none_' : lowConfCases.map((c) => `- \`${c.label ?? 'root'}/${c.filename}\` — ${c.extraction!.features.length} features`).join('\n')}

---

Per-photo JSON files in this directory. Open any one for the full extraction.
`
}

main().catch((e) => {
  console.error('[eval] fatal:', e)
  process.exit(1)
})
