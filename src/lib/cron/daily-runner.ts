/**
 * v7.4.18 — the one nightly job, sequenced under a wall-clock budget.
 *
 * Everything used to be staggered across five cron entries (08:17, 08:47,
 * 09:17 Mondays, 05:00, 10:00 UTC). Nothing actually depended on the
 * spacing — it was just habit — so it all collapses into one run that
 * lands in the inbox before 5am ET.
 *
 * THE CONSTRAINT THAT SHAPES THIS FILE: a Vercel function has a hard
 * ceiling (maxDuration 300s here), and `runCatalogRefresh` alone is
 * documented at 3-4 minutes for ~220 SKUs. Chaining five jobs naively
 * would blow the ceiling and the RUN WOULD DIE BEFORE SENDING THE EMAIL —
 * strictly worse than the staggered version it replaces.
 *
 * So: steps run in priority order, each one gated on the remaining budget,
 * each individually try/caught so one failure cannot abort the rest. The
 * email is not a step — it is the guaranteed deliverable, with time
 * RESERVED for it up front. Whatever did not fit is named in the email
 * rather than silently dropped.
 *
 * Ordering rationale (autoeval runs FIRST, in the route, because the
 * email's data lens reads its typed result — it is never deferrable):
 *   1. anon-cleanup   seconds; housekeeping
 *   2. catalog-expand short; cheap to keep
 *   3. gsc-sync       Mondays only; feeds the SEO lens
 *   4. catalog-refresh LONGEST and most deferrable — a day-old price is fine
 *
 * A step skipped for budget is not an error. It runs tomorrow.
 */

export type StepStatus = 'ok' | 'failed' | 'skipped_budget' | 'skipped_day' | 'skipped_flag'

export interface StepResult {
  name: string
  status: StepStatus
  ms: number
  detail: string | null
}

export interface RunnerResult {
  steps: StepResult[]
  elapsedMs: number
  budgetMs: number
}

/**
 * Total wall clock the pre-email work may consume.
 *
 * maxDuration is 300s. Reserve 40s for building and sending the email, and
 * a little slack for cold start and the function's own teardown.
 */
export const STEP_BUDGET_MS = 240_000

/** A step is only started if at least this much budget remains. */
const MIN_SLICE_MS = 5_000

interface Step {
  name: string
  /** Estimated worst case, used to decide whether to start it at all. */
  estimateMs: number
  /** Return a short detail string for the report. */
  run: () => Promise<string>
  /** Optional gate — e.g. weekly jobs. */
  when?: (now: Date) => boolean
  /** Env flag that disables the step. */
  disableFlag?: string
}

const STEPS: Step[] = [
  {
    name: 'anon-cleanup',
    estimateMs: 15_000,
    disableFlag: 'DISABLE_ANON_CLEANUP',
    run: async () => {
      const { runAnonCleanup } = await import('./anon-cleanup')
      const r = await runAnonCleanup()
      return `${r.photosDeleted} photos, ${r.sessionsFullyDeleted} sessions purged`
    },
  },
  {
    name: 'catalog-expand',
    estimateMs: 45_000,
    disableFlag: 'DISABLE_CATALOG_EXPAND',
    run: async () => {
      const { runExpansion } = await import('@/lib/catalog/expand')
      const r = (await runExpansion({})) as { candidatesCreated?: number } | null
      return `${r?.candidatesCreated ?? 0} candidates`
    },
  },
  {
    name: 'gsc-sync',
    estimateMs: 60_000,
    disableFlag: 'DISABLE_GSC_CRON',
    // Mondays only — matches the schedule it replaces (17 9 * * 1).
    when: (now) => now.getUTCDay() === 1,
    run: async () => {
      const { runGscSync } = await import('@/lib/gsc/feedback')
      const r = (await runGscSync()) as { pagesUpserted?: number } | null
      return `${r?.pagesUpserted ?? 0} pages`
    },
  },
  {
    name: 'catalog-refresh',
    estimateMs: 240_000,
    disableFlag: 'DISABLE_CATALOG_REFRESH',
    run: async () => {
      const { runCatalogRefresh } = await import('@/lib/catalog/refresh')
      const r = (await runCatalogRefresh({ dryRun: false, write: true })) as
        | { productsRefreshed?: number }
        | null
      return `${r?.productsRefreshed ?? 0} SKUs`
    },
  },
]

/**
 * Run the pre-email steps. `autoeval` is NOT in this list: the caller runs
 * it directly because its typed result feeds the email.
 */
export async function runDailySteps(
  now: Date,
  startedAt: number,
  budgetMs: number = STEP_BUDGET_MS
): Promise<RunnerResult> {
  const steps: StepResult[] = []

  for (const step of STEPS) {
    const spent = Date.now() - startedAt
    const remaining = budgetMs - spent

    if (step.disableFlag && process.env[step.disableFlag] === 'true') {
      steps.push({ name: step.name, status: 'skipped_flag', ms: 0, detail: step.disableFlag })
      continue
    }
    if (step.when && !step.when(now)) {
      steps.push({ name: step.name, status: 'skipped_day', ms: 0, detail: 'not scheduled today' })
      continue
    }
    // Start only if the worst case fits, or at minimum a usable slice does.
    if (remaining < MIN_SLICE_MS || remaining < Math.min(step.estimateMs, MIN_SLICE_MS * 2)) {
      steps.push({
        name: step.name,
        status: 'skipped_budget',
        ms: 0,
        detail: `${Math.round(remaining / 1000)}s left, needs ~${Math.round(step.estimateMs / 1000)}s`,
      })
      continue
    }

    const t0 = Date.now()
    try {
      const detail = await step.run()
      steps.push({ name: step.name, status: 'ok', ms: Date.now() - t0, detail })
    } catch (e) {
      // One step failing must never cost the rest of the run, or the email.
      steps.push({ name: step.name, status: 'failed', ms: Date.now() - t0, detail: (e as Error).message.slice(0, 160) })
    }
  }

  return { steps, elapsedMs: Date.now() - startedAt, budgetMs }
}

/** Steps worth raising to the top of the email. */
export function runnerAlerts(result: RunnerResult): string[] {
  const out: string[] = []
  for (const s of result.steps) {
    if (s.status === 'failed') out.push(`Nightly step failed: ${s.name} — ${s.detail ?? ''}`)
    if (s.status === 'skipped_budget') out.push(`Nightly step skipped for time: ${s.name}`)
  }
  return out
}
