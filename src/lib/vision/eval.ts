/**
 * Vision Prompt Evaluation Harness
 *
 * Usage:
 *   1. Drop 20-50 test photos into /test-photos/ (categorized by room type
 *      in subfolders: kitchen/, bathroom/, deck/, etc.)
 *   2. Run: npx tsx lib/vision/eval.ts
 *   3. Outputs eval-results-<timestamp>.html — open in browser, review
 *      each extraction side-by-side with the original photo.
 *
 * This is the week-1 quality gate. The vision prompt is the product;
 * before week 2 ships Smart Cart synthesis that reads from extractions,
 * we need to see the prompt produce reliable output across the full
 * range of real photos.
 *
 * Pass criteria:
 *   - Room type correct on >95% of clear photos
 *   - Era estimate within 1 decade of ground truth on >80% of photos
 *   - Boolean features (under_cabinet_lighting, backsplash_present) correct
 *     on >90% of cases where the answer is determinable
 *   - condition_note_short is factual, no value judgments, on 100% of cases
 *
 * If any of the above fails, the prompt needs revision before week 2 ships.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { extractFromPhoto, type ExtractOutput, VisionExtractionError } from './extract'

const TEST_PHOTOS_DIR = path.join(process.cwd(), 'test-photos')
const RESULTS_DIR = path.join(process.cwd(), 'eval-results')

interface EvalCase {
  filename: string
  fullPath: string
  expectedRoomType: string // from subfolder name
  result?: ExtractOutput
  error?: string
}

async function main() {
  await fs.mkdir(RESULTS_DIR, { recursive: true })

  // Walk test-photos/ — each subfolder is a room type
  const subfolders = await fs.readdir(TEST_PHOTOS_DIR, { withFileTypes: true })
  const cases: EvalCase[] = []
  for (const entry of subfolders) {
    if (!entry.isDirectory()) continue
    const roomType = entry.name
    const photos = await fs.readdir(path.join(TEST_PHOTOS_DIR, roomType))
    for (const photo of photos) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(photo)) continue
      cases.push({
        filename: photo,
        fullPath: path.join(TEST_PHOTOS_DIR, roomType, photo),
        expectedRoomType: roomType,
      })
    }
  }

  console.log(`Running ${cases.length} extractions...`)

  // For each case, upload to a temp public URL (or use a local server) and
  // call the extractor. In real CI, this would use a fixture-server; for
  // initial dev, point at a Vercel Blob staging bucket or pass data URIs.
  // For this harness, we assume the user has already uploaded photos to
  // a public bucket and passes URLs; or the harness reads local files and
  // converts to data URIs (simpler for week-1 testing).
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i]
    console.log(`[${i + 1}/${cases.length}] ${c.expectedRoomType}/${c.filename}`)
    try {
      const buf = await fs.readFile(c.fullPath)
      const mime = c.filename.match(/\.(jpe?g)$/i)
        ? 'image/jpeg'
        : c.filename.match(/\.png$/i)
          ? 'image/png'
          : 'image/webp'
      const dataUri = `data:${mime};base64,${buf.toString('base64')}`
      c.result = await extractFromPhoto({
        photoBlobUrl: dataUri,
        mimeType: mime as 'image/jpeg' | 'image/png' | 'image/webp',
        userRoomTypeHint: c.expectedRoomType,
      })
    } catch (e) {
      if (e instanceof VisionExtractionError) {
        c.error = `${e.code}: ${e.message}`
      } else {
        c.error = (e as Error).message
      }
    }
  }

  // Compute pass-rate stats
  const stats = computeStats(cases)
  console.log('\n=== EVAL STATS ===')
  console.log(JSON.stringify(stats, null, 2))

  // Write HTML report
  const htmlPath = path.join(RESULTS_DIR, `eval-${Date.now()}.html`)
  await fs.writeFile(htmlPath, buildHtmlReport(cases, stats))
  console.log(`\nReport written: ${htmlPath}`)
}

function computeStats(cases: EvalCase[]) {
  let total = 0
  let succeeded = 0
  let roomTypeCorrect = 0
  let highConfidence = 0
  let valueJudgmentInNote = 0
  let totalCostCents = 0

  // Heuristic: condition_note_short should not contain value-judgment words.
  // Catches the most common failure mode where the model slips into
  // "dated", "outdated", "old", "needs work", "modern" framing.
  const VALUE_JUDGMENT_WORDS = [
    'dated',
    'outdated',
    'old-fashioned',
    'modern',
    'beautiful',
    'ugly',
    'nice',
    'needs work',
    'needs replacement',
    'needs updating',
    'in need of',
    'should be',
    'should replace',
  ]

  for (const c of cases) {
    total++
    if (!c.result) continue
    succeeded++
    totalCostCents += c.result.apiCostCents
    if (c.result.extraction.room_type_confirmed === c.expectedRoomType) {
      roomTypeCorrect++
    }
    if (c.result.extraction.overall_confidence >= 0.7) {
      highConfidence++
    }
    const note = c.result.extraction.condition_note_short.toLowerCase()
    if (VALUE_JUDGMENT_WORDS.some((w) => note.includes(w))) {
      valueJudgmentInNote++
    }
  }

  return {
    total,
    succeeded,
    succeeded_pct: total ? Math.round((succeeded / total) * 1000) / 10 : 0,
    room_type_correct: roomTypeCorrect,
    room_type_correct_pct: succeeded ? Math.round((roomTypeCorrect / succeeded) * 1000) / 10 : 0,
    high_confidence: highConfidence,
    high_confidence_pct: succeeded ? Math.round((highConfidence / succeeded) * 1000) / 10 : 0,
    value_judgment_in_note: valueJudgmentInNote,
    value_judgment_pct: succeeded ? Math.round((valueJudgmentInNote / succeeded) * 1000) / 10 : 0,
    total_cost_cents: totalCostCents,
    avg_cost_cents_per_photo: succeeded ? Math.round((totalCostCents / succeeded) * 100) / 100 : 0,
  }
}

function buildHtmlReport(cases: EvalCase[], stats: ReturnType<typeof computeStats>): string {
  return `<!DOCTYPE html>
<html>
<head>
<title>Alder Vision Prompt Eval — ${new Date().toISOString()}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 1400px; margin: 2rem auto; padding: 0 1rem; color: #222; }
  h1 { font-weight: 500; }
  .stats { background: #f5f5f5; padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
  .stats div { margin: 0.25rem 0; font-size: 14px; }
  .stats .good { color: #1d9e75; }
  .stats .bad { color: #d85a30; }
  .case { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; padding: 1rem 0; border-top: 1px solid #eee; }
  .case img { width: 100%; max-height: 240px; object-fit: cover; border-radius: 6px; }
  .case .meta { font-size: 12px; color: #666; margin-top: 0.25rem; }
  .case pre { background: #f9f9f9; padding: 0.75rem; border-radius: 6px; font-size: 12px; overflow-x: auto; line-height: 1.4; }
  .case .note { background: #fffae5; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 13px; margin-bottom: 0.5rem; }
  .case .error { background: #fde8e8; color: #a32d2d; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 13px; }
  .case .mismatch { background: #fde8e8; padding: 4px 8px; border-radius: 3px; font-size: 12px; color: #a32d2d; }
  .case .match { background: #e1f5ee; padding: 4px 8px; border-radius: 3px; font-size: 12px; color: #0f6e56; }
</style>
</head>
<body>
<h1>Alder Vision Prompt — Eval Results</h1>
<div class="stats">
  <div>Total photos: <strong>${stats.total}</strong></div>
  <div>Succeeded: <strong>${stats.succeeded}</strong> (${stats.succeeded_pct}%)</div>
  <div class="${stats.room_type_correct_pct >= 95 ? 'good' : 'bad'}">Room type correct: <strong>${stats.room_type_correct}/${stats.succeeded}</strong> (${stats.room_type_correct_pct}%) — target ≥95%</div>
  <div>High confidence (≥0.7): <strong>${stats.high_confidence}</strong> (${stats.high_confidence_pct}%)</div>
  <div class="${stats.value_judgment_pct === 0 ? 'good' : 'bad'}">Value judgment in note: <strong>${stats.value_judgment_in_note}</strong> (${stats.value_judgment_pct}%) — target 0%</div>
  <div>Total API cost: <strong>$${(stats.total_cost_cents / 100).toFixed(2)}</strong></div>
  <div>Avg per photo: <strong>${stats.avg_cost_cents_per_photo}¢</strong></div>
</div>
${cases
  .map((c) => {
    const imgB64 = `data:image;base64,${''}` // omitted to keep report small; serve from disk instead
    if (c.error) {
      return `<div class="case">
  <div><img src="${path.relative(RESULTS_DIR, c.fullPath)}"/><div class="meta">${c.expectedRoomType}/${c.filename}</div></div>
  <div class="error"><strong>ERROR:</strong> ${escapeHtml(c.error)}</div>
</div>`
    }
    const r = c.result!
    const e = r.extraction
    const match = e.room_type_confirmed === c.expectedRoomType
    return `<div class="case">
  <div>
    <img src="${path.relative(RESULTS_DIR, c.fullPath)}"/>
    <div class="meta">
      ${c.expectedRoomType}/${c.filename}<br/>
      ${match ? '<span class="match">room match</span>' : `<span class="mismatch">expected ${c.expectedRoomType}, got ${e.room_type_confirmed}</span>`}
      &nbsp; conf ${e.overall_confidence.toFixed(2)}
      ${r.shouldReview ? ' &nbsp; <span class="mismatch">REVIEW</span>' : ''}
    </div>
  </div>
  <div>
    <div class="note"><strong>Note:</strong> ${escapeHtml(e.condition_note_short)}</div>
    <pre>${escapeHtml(JSON.stringify(e, null, 2))}</pre>
  </div>
</div>`
  })
  .join('\n')}
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
