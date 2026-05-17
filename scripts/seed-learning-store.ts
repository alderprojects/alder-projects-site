/**
 * v7.3.3-C-PR2 — Seed LearningStore with the 3 basement rules.
 *
 * Run once per environment (local + prod) after the
 * v733c_pr2_learning_store migration has been applied:
 *
 *   set -a && source .env.local && set +a && npx tsx scripts/seed-learning-store.ts
 *
 * What gets seeded (these were the 3 hardcoded rules in synthesize-v2):
 *
 *   1. dehumidifier_present:basement:moderate  -> SKIP
 *      Headline: "Skip a new dehumidifier"
 *      Reasoning: existing equipment is doing the job.
 *
 *   2. active_water:basement:severe -> PRO_LINE
 *      Headline: "Call a basement water-management pro"
 *      Reasoning: active water needs sizing/inspection beyond a
 *      generic recommendation. No product (catalog has no
 *      sized-dehumidifier SKUs).
 *
 *   3. finished_basement_walls:basement:moderate -> SKIP
 *      Headline: "Skip vapor barrier sheeting"
 *      Reasoning: vapor barriers go under unfinished slabs/walls.
 *
 * Idempotent: re-running upserts in place. Counts get reset to zero
 * because upsertRecommendation() treats re-synthesis as "start the
 * trust curve over."
 *
 * Run with the production DATABASE_URL when you want to seed prod
 * (the script doesn't care which DB it's pointed at — it inserts the
 * same 3 rows wherever DATABASE_URL points).
 */

import {
  upsertRecommendation,
  type RecommendationPayload,
} from '@/lib/learning/store'

interface SeedEntry {
  featureSignature: string
  payload: RecommendationPayload
}

const SEEDS: SeedEntry[] = [
  {
    featureSignature: 'dehumidifier_present:basement:moderate',
    payload: {
      lane: 'SKIP',
      category: 'basement',
      headline: 'Skip a new dehumidifier',
      reasoning:
        "We saw a dehumidifier already running in your basement. The right next step is to confirm it's sized for your square footage and humidity load — not to buy a second one.",
      caution:
        "Check the existing unit's pint-per-day rating against your basement's square footage. If it's running constantly at max, capacity may be undersized.",
    },
  },
  {
    featureSignature: 'active_water:basement:severe',
    payload: {
      lane: 'PRO_LINE',
      category: 'basement',
      headline: 'Call a basement water-management pro',
      reasoning:
        "Active water in a basement isn't a product purchase — it's a sizing and inspection problem. A pro can determine whether you need a sump pump, French drain, grading work, or a larger dehumidifier sized for your moisture load.",
      caution:
        'Take photos and notes about when the water appears (after rain? always?) so the pro can diagnose source vs symptom.',
    },
  },
  {
    featureSignature: 'finished_basement_walls:basement:moderate',
    payload: {
      lane: 'SKIP',
      category: 'basement',
      headline: 'Skip vapor barrier sheeting',
      reasoning:
        "Your basement walls are already finished. Vapor barrier sheeting belongs under unfinished slabs and behind unfinished framing, not over a completed wall surface. Adding it now can trap moisture against the finish.",
    },
  },
]

async function main() {
  console.log(`[seed-learning-store] seeding ${SEEDS.length} curated entries`)
  for (const seed of SEEDS) {
    try {
      const row = await upsertRecommendation({
        featureSignature: seed.featureSignature,
        recommendationPayload: seed.payload,
        source: 'curated',
      })
      console.log(
        `  ✓ ${seed.featureSignature} -> ${seed.payload.lane} (id=${row.id})`
      )
    } catch (e) {
      console.error(
        `  ✗ ${seed.featureSignature} FAILED: ${(e as Error).message}`
      )
      process.exitCode = 1
    }
  }
  console.log('[seed-learning-store] done')
}

main()
  .then(() => process.exit())
  .catch((e) => {
    console.error('[seed-learning-store] fatal:', e)
    process.exit(1)
  })
