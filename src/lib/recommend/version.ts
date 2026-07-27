/**
 * v7.4.0 — Recommendation engine version constants.
 *
 * Every Report row records all three so any report can be replayed or
 * re-evaluated when the prompt, rules, or model change (v7.4.4 eval
 * harness depends on this).
 */

// Model for candidate generation (text reasoning over merged extractions —
// no vision; photos were already extracted at upload time by lib/vision).
export const RECOMMEND_MODEL = process.env.RECOMMEND_MODEL || 'claude-opus-4-8'

// Bump on any change to the candidate-generation prompt in candidates.ts.
export const RECOMMEND_PROMPT_VERSION = 'recommend-v1.0.0'

// Bump on any change to deterministic verdict rules (verdicts.ts),
// safety routing (safety.ts), or the validation pass (validate.ts).
export const RULES_VERSION = 'rules-v1.0.0'
