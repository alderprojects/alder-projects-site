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
// v1.1.0 — latency discipline: 3-5 candidates (max 6), no INVESTIGATE
// padding, terse summaries. Measured: output tokens ≈ 98% of wall time.
// v1.2.0 (v7.4.7): reasoning rule 9 + REGION CONTEXT block — region
// facts may inform candidates but are never photo observations.
// v1.3.0 (v7.4.9): numbered observations + visible_evidence claims cite
// feature_refs — the grounding substrate GroundingScore gates on.
export const RECOMMEND_PROMPT_VERSION = 'recommend-v1.3.0'

// Bump on any change to deterministic verdict rules (verdicts.ts),
// safety routing (safety.ts), or the validation pass (validate.ts).
export const RULES_VERSION = 'rules-v1.0.0'
