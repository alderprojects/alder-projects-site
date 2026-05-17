/**
 * Alder Read v1 — Catalog Expansion Worker (Job 2)
 *
 * Picks one scope per nightly run, proposes 3-5 candidates (products,
 * skip items, route-outs, or guide sections), tags each with the Google-
 * guide-aligned commodity risk score and the evidence needed to make it
 * non-commodity.
 *
 * Per Google's "Optimizing for generative AI features" guide:
 *   - Avoid commodity content (recycled common knowledge)
 *   - Reward first-hand experience, unique perspectives
 *   - Don't fan out per-variation pages (scaled content abuse)
 *
 * This worker only generates DRAFTS. The 5 AM email digest surfaces
 * them. The admin reviews and either:
 *   1. Rejects (one-click email link)
 *   2. Approves as low-confidence commodity (one-click; ships but with
 *      low priority because it's commodity content)
 *   3. Supplies evidence (tap through to mobile form, adds the non-
 *      commodity layer, then ships)
 *
 * No candidate ever reaches the live catalog without explicit human
 * action. No fan-out. No per-town variants.
 *
 * Run cadence: nightly at 3:47 AM ET (after Job 1 refresh).
 */

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// =============================================================================
// CONFIG
// =============================================================================

export const PROMPT_VERSION = 'expand-v1.0.0'
export const MODEL_VERSION = 'claude-opus-4-7'
const MAX_CANDIDATES_PER_RUN = 5
const MAX_TOKENS = 4096

// Scopes the expansion job rotates through. One per night. Order matters —
// pilot scopes first, seasonal scopes pulled in by date.
const ROTATION_SCOPES = [
  'window_weatherization',
  'basement_moisture_prep',
  'home_water_quality',
  'mudroom_entry',
  'outdoor_freeze_prevention',
  'kitchen_refresh',
  'bathroom_refresh',
  'deck_refresh',
  'pre_listing_curb_appeal',
  'lake_season_opening',
]

// =============================================================================
// MAIN
// =============================================================================

export interface ExpansionRunResult {
  scopeId: string
  candidatesGenerated: number
  candidatesRejected: number // pre-emptively, by safety filter
  errors: string[]
  durationMs: number
}

export async function runExpansion(opts?: { scopeId?: string }): Promise<ExpansionRunResult> {
  const startMs = Date.now()
  const errors: string[] = []

  // 1. Pick the scope. If specified, use that; otherwise rotate based on
  // day-of-year so we hit every scope ~36 days apart with the current list.
  const scopeId = opts?.scopeId || pickScopeForToday()

  // 2. Pull context about the existing scope catalog. This grounds the
  // LLM so it doesn't propose products that already exist.
  const scopeContext = await buildScopeContext(scopeId)

  // 3. Call the LLM with the Google-aligned expansion prompt.
  let llmCandidates: LlmCandidate[]
  try {
    llmCandidates = await callLlmForExpansion(scopeId, scopeContext)
  } catch (e) {
    errors.push(`LLM call failed: ${(e as Error).message}`)
    return {
      scopeId,
      candidatesGenerated: 0,
      candidatesRejected: 0,
      errors,
      durationMs: Date.now() - startMs,
    }
  }

  // 4. Filter pre-emptively. Any candidate touching never-auto territory
  // (safety claims, structural advice, medical, electrical, gas) gets
  // commodityRiskScore artificially boosted so it requires evidence.
  let generated = 0
  let rejected = 0
  for (const c of llmCandidates.slice(0, MAX_CANDIDATES_PER_RUN)) {
    if (isHardFiltered(c)) {
      rejected++
      continue
    }

    const adjustedRiskScore = adjustRiskScore(c)
    const evidenceNeeded = inferEvidenceNeeded(c)

    await prisma.catalogExpansionCandidate.create({
      data: {
        scopeId,
        candidateType: c.candidateType,
        title: c.title,
        rationale: c.rationale,
        proposedSlot: c.proposedSlot,
        proposedTier: c.proposedTier,
        proposedAffiliateUrl: c.proposedAffiliateUrl,
        proposedPriceRange: c.proposedPriceRange,
        commodityRiskScore: adjustedRiskScore,
        evidenceNeededJson: evidenceNeeded,
        llmModelVersion: MODEL_VERSION,
        llmPromptVersion: PROMPT_VERSION,
        estimatedBuyerValue: c.estimatedBuyerValue,
        riskLevelJson: c.riskLevel,
        status: 'pending_review',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
    generated++
  }

  // 5. Event log
  await prisma.eventLog.create({
    data: {
      eventType: 'CATALOG_EXPANSION_RUN_COMPLETED',
      payloadJson: {
        scopeId,
        candidatesGenerated: generated,
        candidatesRejected: rejected,
        promptVersion: PROMPT_VERSION,
        modelVersion: MODEL_VERSION,
        durationMs: Date.now() - startMs,
      },
      source: 'cron',
    },
  })

  return {
    scopeId,
    candidatesGenerated: generated,
    candidatesRejected: rejected,
    errors,
    durationMs: Date.now() - startMs,
  }
}

// =============================================================================
// SCOPE SELECTION
// =============================================================================

function pickScopeForToday(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (24 * 60 * 60 * 1000)
  )
  return ROTATION_SCOPES[dayOfYear % ROTATION_SCOPES.length]
}

async function buildScopeContext(scopeId: string): Promise<ScopeContext> {
  // Pull existing catalog entries for this scope. The LLM uses this to
  // avoid proposing duplicates and to understand the structure it's
  // expanding.
  //
  // Looks up the live ScopeCatalog from src/content/smart-cart/index.ts
  // (the same registry the Smart Cart builder uses), then projects it
  // down to the prose-friendly shape the LLM prompt expects. Falls back
  // to empty context if the scope isn't registered yet — that keeps
  // expansion-cron rotation forward-compatible with scope IDs that
  // haven't been added to the registry.
  const { getAllCatalogs } = await import('@/content/smart-cart')
  const catalog = getAllCatalogs().find((c) => c.scopeVariantId === scopeId)

  if (!catalog) {
    console.warn(
      `[catalog-expand] scopeId="${scopeId}" not found in registry; using empty context`
    )
    return {
      scopeId,
      existingProducts: [],
      existingSkipItems: [],
      existingRouteOuts: [],
      scopeDescription: '',
    }
  }

  // One ScopeContext "existingProducts" row per slot — slotLabel stands
  // in for productName since slots resolve products via tierQueries at
  // synthesis time rather than naming them directly. slotKind ("core"
  // vs "addon") is the closest we have to tier at the slot level; the
  // LLM uses both to understand what shape an additional slot might take.
  const existingProducts = catalog.slots.map((s) => ({
    slot: s.slotId,
    tier: s.slotKind,
    productName: s.slotLabel,
  }))

  // Scope description = the customer-facing promise + value prop +
  // primary pain. Three short fields concatenated give the LLM real
  // grounding without leaking the editorial-internal copy.
  const scopeDescription = [
    catalog.smartCartPromise,
    catalog.primaryCustomerPain,
    catalog.valueProposition,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    scopeId,
    existingProducts,
    existingSkipItems: catalog.skipList.map((s) => s.title),
    existingRouteOuts: (catalog.routeOutRules ?? []).map(
      (r) => `${r.condition} -> ${r.destination}: ${r.reason}`
    ),
    scopeDescription,
  }
}

interface ScopeContext {
  scopeId: string
  existingProducts: Array<{ slot: string; tier: string; productName: string }>
  existingSkipItems: string[]
  existingRouteOuts: string[]
  scopeDescription: string
}

// =============================================================================
// LLM CALL
// =============================================================================

interface LlmCandidate {
  candidateType: 'product' | 'skip_item' | 'route_out' | 'new_scope' | 'guide_section'
  title: string
  rationale: string
  proposedSlot?: string
  proposedTier?: string
  proposedAffiliateUrl?: string
  proposedPriceRange?: string
  commodityRiskScore: number // 0-100, self-assessed by LLM
  estimatedBuyerValue: 'high' | 'medium' | 'low'
  riskLevel: string[]
}

const EXPANSION_SYSTEM_PROMPT = `You are an expansion proposer for Alder Projects, a Vermont contractor and shopping marketplace. You will be given a scope from Alder's Smart Cart catalog and asked to propose 3-5 candidate additions: products, skip items, route-outs, or guide sections.

Your job is to identify GAPS in the existing scope and propose candidates that would fill them. Candidates become DRAFT entries that a human will review. You are NEVER publishing live content.

# Google's content quality guide (you must internalize this)

Per Google's "Optimizing for generative AI features" guide, content quality on the modern web is judged by:

1. **Non-commodity content wins.** Common-knowledge "7 tips for X" content does not rank in AI Overviews. First-hand, expertise-based, regionally-specific content does.
2. **Fan-out variants are spam.** Producing per-town, per-trade, per-season variants of the same content is flagged as scaled content abuse. Propose ONE canonical entry per gap, never variants.
3. **First-hand experience is the moat.** A real Vermont contractor saying "we tracked claim rates on three appliance brands" is non-commodity. A summary of warranty advice from generic sources is commodity.
4. **Structured data and special markup don't help.** Don't propose schema.org additions, llms.txt files, or AI-specific formatting.

# Your output

Return a single JSON object: {"candidates": [...]}. Each candidate must include:

\`\`\`json
{
  "candidateType": "product" | "skip_item" | "route_out" | "new_scope" | "guide_section",
  "title": "short descriptive title",
  "rationale": "why this fits the scope and what gap it fills",
  "proposedSlot": "slot name if candidateType=product, else null",
  "proposedTier": "budget | sweet_spot | premium, if candidateType=product",
  "proposedAffiliateUrl": "URL if you have one (you probably don't — leave null)",
  "proposedPriceRange": "$X-$Y if known",
  "commodityRiskScore": 0-100,
  "estimatedBuyerValue": "high | medium | low",
  "riskLevel": ["array of risk tags"]
}
\`\`\`

# How to score commodityRiskScore

Be self-critical. If your candidate is the kind of thing 100 other home-improvement sites have already published, score it 70-100. Examples:

- "Use a moisture meter to check basement humidity" → 90 (commodity, on every site)
- "Vermont basement dehumidifier picks based on 3 years of contractor data" → 25 (specific, hard to fake)
- "Buy a programmable thermostat" → 95 (commodity)
- "Why Vermont net-metering rules favor smart thermostats from these 3 manufacturers" → 30 (regionally specific)

# Risk level tags

Use these exact strings for the riskLevel array:
- "safety_claim" — touches mold, electrical, gas, water, child safety, structural
- "savings_claim" — promises dollar savings
- "pro_substitute" — implies DIY can replace a professional
- "regional_claim" — Vermont-specific claim that requires local data
- "seasonal_timing" — claim about when to buy/install (winter vs summer)
- "warranty_claim" — claim about warranty/insurance coverage
- "none" — no special risk

If you tag safety_claim, savings_claim, or pro_substitute, the candidate will require evidence to publish — make sure your rationale acknowledges what evidence is needed.

# What NOT to propose

- Generic "buying guides" with no Vermont angle
- Products without a clear scope fit
- Variants of existing entries (no "kitchen X" if there's already "kitchen Y" with same fit)
- Content that would create per-town landing pages (forbidden by Google guide)
- Anything you cannot justify with a specific gap in the existing catalog
- Affiliate URLs unless you are 100% sure they work — leave null and let humans fill in

# Reminder

Return JSON only. No prose. No markdown fences. Be aggressively self-critical on commodityRiskScore — most LLM proposals are commodity, and that's fine, as long as you tag them honestly so the human reviewer knows what evidence is needed.`

async function callLlmForExpansion(scopeId: string, context: ScopeContext): Promise<LlmCandidate[]> {
  const userMsg = `Scope to expand: ${scopeId}

Existing products in this scope (${context.existingProducts.length} entries):
${context.existingProducts.length === 0 ? '(none yet)' : context.existingProducts.map((p) => `- ${p.slot} / ${p.tier} / ${p.productName}`).join('\n')}

Existing skip items (${context.existingSkipItems.length}):
${context.existingSkipItems.length === 0 ? '(none yet)' : context.existingSkipItems.map((s) => `- ${s}`).join('\n')}

Existing route-outs (${context.existingRouteOuts.length}):
${context.existingRouteOuts.length === 0 ? '(none yet)' : context.existingRouteOuts.map((r) => `- ${r}`).join('\n')}

Scope description: ${context.scopeDescription || '(no description available)'}

Propose 3-5 candidate additions. Return JSON only.`

  const response = await claude.messages.create({
    model: MODEL_VERSION,
    max_tokens: MAX_TOKENS,
    system: EXPANSION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMsg }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('LLM returned no text content')
  }

  const cleaned = textBlock.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  const parsed = JSON.parse(cleaned) as { candidates: LlmCandidate[] }

  if (!Array.isArray(parsed.candidates)) {
    throw new Error('LLM response missing candidates array')
  }

  return parsed.candidates
}

// =============================================================================
// RISK + EVIDENCE LOGIC
// =============================================================================

// Hard-filter: candidates we kill before they even enter the review queue.
// These are categories where even draft proposals are too risky to surface.
function isHardFiltered(c: LlmCandidate): boolean {
  // Never propose mold remediation specifics, electrical wiring DIY, gas
  // line work, or anything involving child safety. The LLM has been told
  // not to, but we double-check.
  const forbiddenPhrases = [
    /mold remediation/i,
    /electrical wiring/i,
    /gas line/i,
    /child safety/i,
    /load.bearing/i,
    /asbestos/i,
    /lead paint removal/i,
  ]
  const combined = `${c.title} ${c.rationale}`.toLowerCase()
  return forbiddenPhrases.some((re) => re.test(combined))
}

// Boost commodity-risk score if the candidate touches risk areas. Even if
// the LLM scored it low, claims involving safety/savings need evidence.
function adjustRiskScore(c: LlmCandidate): number {
  let score = c.commodityRiskScore
  if (c.riskLevel.includes('safety_claim')) score = Math.max(score, 70)
  if (c.riskLevel.includes('savings_claim')) score = Math.max(score, 65)
  if (c.riskLevel.includes('pro_substitute')) score = Math.max(score, 75)
  if (c.riskLevel.includes('regional_claim')) score = Math.max(score, 60)
  if (c.riskLevel.includes('warranty_claim')) score = Math.max(score, 60)
  return Math.min(100, Math.max(0, score))
}

// Infer the evidence the human reviewer needs to supply. Drives the
// 5 AM digest "needs evidence" label and the mobile evidence form.
function inferEvidenceNeeded(c: LlmCandidate): string[] {
  const needs: string[] = []
  if (c.commodityRiskScore >= 50) needs.push('first_hand_experience')
  if (c.riskLevel.includes('savings_claim')) needs.push('savings_data_point')
  if (c.riskLevel.includes('safety_claim')) needs.push('safety_source_citation')
  if (c.riskLevel.includes('regional_claim')) needs.push('vermont_specific_data')
  if (c.riskLevel.includes('pro_substitute')) needs.push('diy_vs_pro_decision_tree')
  if (c.candidateType === 'product') needs.push('verified_affiliate_url')
  if (c.candidateType === 'guide_section') needs.push('first_hand_photo')
  return needs
}
