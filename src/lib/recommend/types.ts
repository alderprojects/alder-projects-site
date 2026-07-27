/**
 * v7.4.0 — Shared types for the recommendation pipeline.
 *
 * The continuum rule in one sentence: the Check (free) owns the DECISION,
 * the Cart (paid) owns the SELECTION, and both are computed in ONE pass
 * against the same evidence — disclosure tiers gate what crosses the wire.
 */

import { z } from 'zod'

export type Verdict = 'BUY' | 'WAIT' | 'SKIP' | 'INVESTIGATE'
export type DisclosureTier = 'free' | 'email' | 'paid'
export type Tenure = 'own' | 'rent'

// ---------------------------------------------------------------------------
// Dataset (data/vermont-costs.json)
// ---------------------------------------------------------------------------

export const CostItemSchema = z.object({
  category: z.string(),
  item: z.string(),
  costLow: z.number().nullable(),
  costHigh: z.number().nullable(),
  rebate: z
    .object({
      program: z.string(),
      amount: z.string(),
      verifiedAt: z.string(),
    })
    .nullable(),
  paybackNotes: z.string().nullable(),
  region: z.string(),
  sourceGuideSlug: z.string(),
  sourceGuideTitle: z.string().optional(),
  verifiedAt: z.string(),
})
export type CostItem = z.infer<typeof CostItemSchema>

// ---------------------------------------------------------------------------
// Candidate generation (LLM structured output — numbers FORBIDDEN here;
// the deterministic layer owns all financial conclusions)
// ---------------------------------------------------------------------------

export const CandidateSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9_]+$/),
  title: z.string().min(3).max(120),
  summary: z.string().min(10).max(500),
  // Dataset category this candidate maps to, or "other"
  dataset_category: z.string().max(60),
  // Evidence must reference what is VISIBLE in the photos
  visible_evidence: z.array(z.string().max(300)).min(1).max(6),
  // Non-load-bearing fields carry .catch() fallbacks (v7.4.2e): a model
  // emitting quantity:0 or a typo'd enum must not kill the whole report
  // (observed in prod 2026-07-27). Load-bearing verdict inputs stay
  // strict; suggested_lean's fallback is needs_verification, which
  // deterministically routes to INVESTIGATE — the honest failure mode.
  benefit_type: z.enum(['cost_savings', 'comfort', 'safety', 'prevention', 'resale']).catch('prevention'),
  // Flags the deterministic layer reads
  risk_flags: z
    .array(
      z.enum([
        'structural',
        'electrical_panel',
        'gas',
        'roofing',
        'mold_suspected',
        'foundation',
        'major_plumbing',
        'fire_safety',
        'none',
      ])
    )
    .catch(['none'])
    .default(['none']),
  // Equipment already present that makes this redundant
  duplicate_of_present_equipment: z.boolean().default(false),
  // Can a renter do this reversibly?
  renter_reversible: z.boolean(),
  confidence: z.number().min(0).max(1).catch(0.4),
  assumptions: z.array(z.string().max(300)).max(6).default([]),
  limitations: z.array(z.string().max(300)).max(6).default([]),
  // Only questions whose answer can CHANGE the verdict or cart
  clarifying_questions: z
    .array(
      z.object({
        key: z.string().max(60),
        question: z.string().max(200),
        why_it_matters: z.string().max(200),
      })
    )
    .max(3)
    .default([]),
  next_action: z.string().max(300),
  // Cart artifacts (computed same pass; disclosed only at paid tier)
  product_category: z.string().max(80),
  required_specs: z.array(z.object({ spec: z.string().max(80), why: z.string().max(200) })).max(5).default([]),
  amazon_search_query: z.string().max(120),
  quantity: z.number().int().min(1).max(20).catch(1).default(1),
  install_difficulty: z.enum(['diy_easy', 'diy_moderate', 'hire_pro']).catch('diy_moderate'),
  // The model's non-binding lean — deterministic rules decide the real
  // verdict. Invalid lean → needs_verification → INVESTIGATE (honest).
  suggested_lean: z.enum(['worth_buying', 'can_wait', 'not_worth_it', 'needs_verification']).catch('needs_verification'),
})
export type Candidate = z.infer<typeof CandidateSchema>

export const CandidateSetSchema = z.object({
  // v1.1.0: capped 8→6. Output tokens are ~98% of pipeline wall time
  // (measured 2026-07-27: 3k tokens ≈ 31s); 6 well-grounded candidates
  // beat 8 padded ones on both latency and honesty.
  candidates: z.array(CandidateSchema).min(1).max(6),
  recency_conflict: z
    .object({ detected: z.boolean(), detail: z.string().max(300).default('') })
    .default({ detected: false, detail: '' }),
  batch_notes: z.string().max(600).default(''),
})
export type CandidateSet = z.infer<typeof CandidateSetSchema>

// ---------------------------------------------------------------------------
// Enriched recommendation (post-deterministic-rules, pre-persist)
// ---------------------------------------------------------------------------

export interface Citation {
  guideSlug: string
  guideTitle: string
  verifiedAt: string
}

export interface RebateInfo {
  program: string
  amount: string
  verifiedAt: string
  /** true when verifiedAt is older than 120 days — render "check current program" */
  stale: boolean
}

export interface CartArtifact {
  tier: 'good' | 'better' | 'best'
  productName: string
  asin: string | null
  searchQuery: string
  priceLow: number | null
  priceHigh: number | null
  availability: string
  fitStatus: 'likely_fit'
  requiredSpecs: Array<{ spec: string; why: string }>
  quantity: number
  installDifficulty: string
}

export interface EnrichedRecommendation {
  key: string
  verdict: Verdict
  verdictReason: string // which deterministic rule fired — audit trail
  title: string
  summary: string
  visibleEvidence: string[]
  costLow: number | null
  costHigh: number | null
  benefitType: string
  confidenceScore: number
  confidenceLabel: 'high' | 'medium' | 'low'
  assumptions: string[]
  limitations: string[]
  riskLevel: 'none' | 'low' | 'pro_required'
  clarifyingQuestions: Array<{ key: string; question: string; why_it_matters: string }>
  smartCartEligible: boolean
  nextAction: string
  rebate: RebateInfo | null
  citations: Citation[]
  disclosureTier: DisclosureTier
  categorySearchQuery: string | null
  /** Cart metadata carried from the candidate — feeds artifact computation. */
  cartMeta: {
    productCategory: string
    requiredSpecs: Array<{ spec: string; why: string }>
    quantity: number
    installDifficulty: string
    searchQuery: string
  }
  cartArtifacts: CartArtifact[]
  sortOrder: number
}

// ---------------------------------------------------------------------------
// Pipeline IO
// ---------------------------------------------------------------------------

export interface MergedFeature {
  type: string
  location: string
  condition: string
  confidence: number
  category_hint: string
  photoId: string
}

export interface PipelineInput {
  snapshotIds: string[]
  anonId: string
  userPrompt?: string
  tenure?: Tenure
  // v7.4.7 — optional 5-digit ZIP (validated at the route); resolves to
  // a static region profile for synthesis. Omitting it changes nothing.
  zip?: string
}

export interface GateResult {
  features: MergedFeature[]
  includedPhotoCount: number
  excludedPhotoCount: number
  exclusionSummary: Array<{ photoId: string; reason: string }>
}
