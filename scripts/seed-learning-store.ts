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
    // v7.3.4-PR3.6 amendment: PRO_LINE removed. Active-water findings
    // now route to WAIT with a prerequisite-assessment frame. Commerce-
    // moment voice — the customer is shopping, and we tell them WHY
    // they should wait on related purchases until the underlying
    // condition is professionally assessed. We do NOT recommend a
    // specific pro (Alder has no contractor network to route to).
    featureSignature: 'active_water:basement:severe',
    payload: {
      lane: 'WAIT',
      category: 'basement',
      headline: 'Wait on basement product purchases until water is assessed',
      reasoning:
        "Active water in a basement is a sizing-and-source problem that needs professional assessment before related product purchases (sump pumps, vapor barriers, larger dehumidifiers) make sense. The right scope depends on where the water is coming from and how much capacity is needed — neither answer should be guessed from a product page.",
      caution:
        'Note when the water appears (after rain? always?) and take photos — that context speeds any professional evaluation.',
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
