/**
 * v7.4.9 — ScoringConfig: versioned in the repo, env-overridable, and
 * VALIDATED so the cardinal rules cannot be traded away by configuration.
 *
 * CR1 — Grounding is a gate, not a weight. `groundingFloor` must exist
 *       and be > 0. Grounding has no entry in `weights` at all: there is
 *       no code path in which it contributes a partial score.
 * CR2 — Revenue never touches inclusion or lane assignment. The single
 *       revenue-adjacent lever is `actionabilityTieBreak`, hard-capped at
 *       ACTIONABILITY_HARD_CAP and applied ONLY within the BUY lane.
 *
 * validateScoringConfig() throws on violation. It runs at module load,
 * so a bad env override fails the build/boot rather than silently
 * shipping a weakened rule.
 */

export const SCORE_VERSION = 'recscore-v1.0.0'

/** CR2: no configuration may raise the revenue-adjacent lever above this. */
export const ACTIONABILITY_HARD_CAP = 0.1

export interface ScoringWeights {
  reactionPrior: number
  photoQuality: number
  regionFit: number
  specificity: number
  /** BUY-lane only, ≤ ACTIONABILITY_HARD_CAP. */
  actionabilityTieBreak: number
}

export interface ScoringConfig {
  version: string
  /** CR1 gate. Items below this are SUPPRESSED, never demoted. */
  groundingFloor: number
  /** Reactions needed before a SignaturePrior stops returning neutral. */
  priorMinN: number
  /** Laplace smoothing pseudo-count. */
  priorSmoothing: number
  weights: ScoringWeights
  /** Auto-curation bounds (§1.5.2). */
  autoRule: {
    doesntApplyRateThreshold: number
    minN: number
    maxNewRulesPerWeek: number
  }
  /** Weekly shadow re-score drift alarm (§1.5.3). */
  shadowDriftThreshold: number
}

const DEFAULT_CONFIG: ScoringConfig = {
  version: SCORE_VERSION,
  groundingFloor: 0.8,
  priorMinN: 5,
  priorSmoothing: 2,
  weights: {
    reactionPrior: 0.35,
    photoQuality: 0.25,
    regionFit: 0.15,
    specificity: 0.15,
    actionabilityTieBreak: 0.1,
  },
  autoRule: {
    doesntApplyRateThreshold: 0.4,
    minN: 8,
    maxNewRulesPerWeek: 5,
  },
  shadowDriftThreshold: 0.15,
}

export class ScoringConfigError extends Error {
  constructor(message: string) {
    super(`ScoringConfig invalid: ${message}`)
    this.name = 'ScoringConfigError'
  }
}

/**
 * Mechanical enforcement of CR1 + CR2. Exported so the test plan can
 * assert rejection directly (§1-T "CR2 mechanical").
 */
export function validateScoringConfig(cfg: ScoringConfig): ScoringConfig {
  // --- CR1 ---
  if (typeof cfg.groundingFloor !== 'number' || Number.isNaN(cfg.groundingFloor)) {
    throw new ScoringConfigError('groundingFloor is required (CR1: grounding is a gate)')
  }
  if (cfg.groundingFloor <= 0 || cfg.groundingFloor > 1) {
    throw new ScoringConfigError(`groundingFloor must be in (0,1]; got ${cfg.groundingFloor} (CR1)`)
  }
  if ('grounding' in (cfg.weights as unknown as Record<string, unknown>)) {
    throw new ScoringConfigError('grounding must not appear in weights — it is a gate, not a weight (CR1)')
  }

  // --- CR2 ---
  const tb = cfg.weights.actionabilityTieBreak
  if (typeof tb !== 'number' || Number.isNaN(tb) || tb < 0) {
    throw new ScoringConfigError('actionabilityTieBreak must be a non-negative number (CR2)')
  }
  if (tb > ACTIONABILITY_HARD_CAP) {
    throw new ScoringConfigError(
      `actionabilityTieBreak ${tb} exceeds the hard cap ${ACTIONABILITY_HARD_CAP} (CR2: revenue never touches inclusion or lanes)`
    )
  }

  // --- General sanity ---
  for (const [k, v] of Object.entries(cfg.weights)) {
    if (typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 1) {
      throw new ScoringConfigError(`weight ${k} must be in [0,1]; got ${v}`)
    }
  }
  if (cfg.autoRule.maxNewRulesPerWeek < 0 || cfg.autoRule.maxNewRulesPerWeek > 20) {
    throw new ScoringConfigError('autoRule.maxNewRulesPerWeek out of sane bounds (0-20)')
  }
  if (cfg.autoRule.doesntApplyRateThreshold <= 0 || cfg.autoRule.doesntApplyRateThreshold > 1) {
    throw new ScoringConfigError('autoRule.doesntApplyRateThreshold must be in (0,1]')
  }
  return cfg
}

function numFromEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw == null || raw.trim() === '') return fallback
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) throw new ScoringConfigError(`${name} is not a number: "${raw}"`)
  return parsed
}

function buildConfig(): ScoringConfig {
  const cfg: ScoringConfig = {
    ...DEFAULT_CONFIG,
    groundingFloor: numFromEnv('SCORE_GROUNDING_FLOOR', DEFAULT_CONFIG.groundingFloor),
    weights: {
      reactionPrior: numFromEnv('SCORE_W_REACTION_PRIOR', DEFAULT_CONFIG.weights.reactionPrior),
      photoQuality: numFromEnv('SCORE_W_PHOTO_QUALITY', DEFAULT_CONFIG.weights.photoQuality),
      regionFit: numFromEnv('SCORE_W_REGION_FIT', DEFAULT_CONFIG.weights.regionFit),
      specificity: numFromEnv('SCORE_W_SPECIFICITY', DEFAULT_CONFIG.weights.specificity),
      actionabilityTieBreak: numFromEnv('SCORE_W_ACTIONABILITY', DEFAULT_CONFIG.weights.actionabilityTieBreak),
    },
    autoRule: {
      doesntApplyRateThreshold: numFromEnv('SCORE_AUTORULE_THRESHOLD', DEFAULT_CONFIG.autoRule.doesntApplyRateThreshold),
      minN: numFromEnv('SCORE_AUTORULE_MIN_N', DEFAULT_CONFIG.autoRule.minN),
      maxNewRulesPerWeek: numFromEnv('SCORE_AUTORULE_MAX_PER_WEEK', DEFAULT_CONFIG.autoRule.maxNewRulesPerWeek),
    },
  }
  return validateScoringConfig(cfg)
}

/** Validated at module load — a bad override fails fast, never ships quietly. */
export const SCORING_CONFIG: ScoringConfig = buildConfig()
