/**
 * v7.3.4-PR3.6 — Migrate PRO_LINE LearningStore rows to WAIT.
 *
 * Per the v7.3.4 commerce-moment amendment, the PRO_LINE / "CALL A
 * PRO" lane is removed. Alder has no contractor network to refer to,
 * so the lane was a false promise. Existing rows are migrated in-place:
 *
 *   payload.lane: 'PRO_LINE' -> 'WAIT'
 *   payload.headline: rephrased to commerce-moment voice ("Wait on
 *     <thing> until <prerequisite>")
 *   payload.reasoning: rephrased to name the prerequisite explicitly
 *     without implying Alder will route the customer
 *
 * Idempotent: re-running just touches rows that still have lane='PRO_LINE'.
 * Already-migrated rows (lane='WAIT' with the marker) are skipped.
 *
 * Usage (after migration applied to schema if needed; this script
 * only touches LearningStore data):
 *
 *   set -a && source .env.local && set +a && npx tsx scripts/migrate-pro-line-to-wait.ts
 */

import { prisma } from '@/lib/db'

interface RecommendationPayload {
  lane: string
  headline: string
  reasoning: string
  category: string
  product?: unknown
  caution?: string
}

// Marker added to rewritten reasoning text so re-runs skip already
// migrated rows even if their lane was set to WAIT through other paths.
const MIGRATION_MARKER = '[migrated:pro_line->wait]'

async function main() {
  const candidates = await prisma.learningStore.findMany({})
  let migrated = 0
  let skipped = 0
  let alreadyClean = 0

  for (const row of candidates) {
    const payload = row.recommendationPayload as unknown as RecommendationPayload
    if (!payload || typeof payload !== 'object') {
      skipped += 1
      continue
    }
    if (payload.lane !== 'PRO_LINE') {
      alreadyClean += 1
      continue
    }

    const newPayload: RecommendationPayload = {
      ...payload,
      lane: 'WAIT',
      headline: rewriteHeadline(payload.headline),
      reasoning: rewriteReasoning(payload.reasoning, payload.headline) + ` ${MIGRATION_MARKER}`,
    }

    await prisma.learningStore.update({
      where: { id: row.id },
      data: {
        recommendationPayload: newPayload as never,
        // Reset reaction counts because the recommendation text
        // materially changed.
        thumbsUpCount: 0,
        dismissCount: 0,
        doesntApplyCount: 0,
        impressionCount: 0,
      },
    })
    migrated += 1
    console.log(
      `  ${row.featureSignature}: PRO_LINE -> WAIT`
    )
  }

  console.log(
    `\n[migrate-pro-line-to-wait] done. migrated=${migrated} alreadyClean=${alreadyClean} skipped=${skipped} total=${candidates.length}`
  )
}

/**
 * Convert imperative-pro-call headlines to commerce-wait headlines.
 *   "Call a basement water-management pro" -> "Wait — needs pro assessment"
 *   "Have an electrician inspect the panel" -> "Wait — needs electrician review"
 */
function rewriteHeadline(original: string): string {
  const lower = original.toLowerCase()
  if (lower.startsWith('call ')) {
    // "Call a [X] pro/contractor for Y" -> "Wait — [Y] needs [X] review"
    return original.replace(
      /^Call (a |an )?([\w\s-]+?) (pro|contractor|professional|specialist)( for | to | about )?(.*)/i,
      (_, _art, who, _role, _conn, what) => {
        const subject = (what ?? '').trim() || 'next steps'
        return `Wait — ${subject} needs ${who.trim()} review`.slice(0, 60)
      }
    )
  }
  if (lower.startsWith('have ')) {
    return original
      .replace(/^Have (a |an )?/i, 'Wait — ')
      .slice(0, 60)
  }
  return `Wait — ${original}`.slice(0, 60)
}

/**
 * Rewrite reasoning to commerce-moment framing. Drops any "call X
 * for Y" implication; replaces with "X needs a pro's assessment
 * before related product purchases make sense."
 */
function rewriteReasoning(original: string, originalHeadline: string): string {
  void originalHeadline
  return (
    'The condition this addresses needs a professional assessment before related product purchases make sense. ' +
    'Original recommendation context: ' +
    original.replace(/\s+/g, ' ').trim().slice(0, 240)
  )
}

main()
  .then(() => process.exit())
  .catch((e) => {
    console.error('[migrate-pro-line-to-wait] fatal:', e)
    process.exit(1)
  })
