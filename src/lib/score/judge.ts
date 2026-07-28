/**
 * v7.4.9 — LLM grounding judge. CRON PATHS ONLY; never in the customer
 * request path (§0.6).
 *
 * Asks one narrow question: which claims in this synthesis are not
 * supported by this extraction JSON? It is an auditor of the deployed
 * gate, not a second gate — its findings become QAFlags and digest
 * lines, never live suppressions.
 *
 * Cached by (extractionHash, synthesisHash): a judged pair is never
 * re-judged, which is what keeps nightly cost flat as the corpus grows.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/db'

/** Haiku-class: this is a cheap, high-volume auditing pass. */
export const JUDGE_MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 2048

const JudgeResultSchema = z.object({
  unsupported: z
    .array(
      z.object({
        rec_key: z.string().max(120).default(''),
        claim: z.string().max(400),
        why: z.string().max(400).default(''),
      })
    )
    .max(20)
    .default([]),
})

export type JudgeFinding = z.infer<typeof JudgeResultSchema>['unsupported'][number]

const SYSTEM_PROMPT = `You audit home-inspection report text against the structured observations it was supposedly derived from.

You are given:
  1. EXTRACTION — the observations a vision model recorded from the homeowner's photos.
  2. SYNTHESIS — the claims a recommendation engine wrote.

List ONLY claims in SYNTHESIS that are not supported by EXTRACTION — things asserted as visible or present in the home that the observations do not establish. Be strict about invented specifics (equipment that appears nowhere in the observations, conditions never recorded) and lenient about ordinary reasoning, generic advice, and safety caution that does not assert a new observation.

Regional or climate statements are NOT photo claims — ignore them.

Return ONE JSON object, no prose, no markdown fences:
{"unsupported": [{"rec_key": "...", "claim": "...", "why": "..."}]}
An empty array means everything checks out.`

export function hashJson(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value ?? null), 'utf8').digest('hex')
}

export interface JudgeInput {
  reportId: string
  extraction: unknown
  synthesis: unknown
}

export interface JudgeOutcome {
  cached: boolean
  findings: JudgeFinding[]
  verdictId: string
}

/**
 * Judge one session. Returns immediately from cache when this exact
 * (extraction, synthesis) pair was judged before — the cache assert in
 * §1-T depends on this making ZERO model calls on a second run.
 */
export async function judgeSession(input: JudgeInput): Promise<JudgeOutcome> {
  const extractionHash = hashJson(input.extraction)
  const synthesisHash = hashJson(input.synthesis)

  const cached = await prisma.judgeVerdict.findUnique({
    where: { extractionHash_synthesisHash: { extractionHash, synthesisHash } },
  })
  if (cached) {
    return {
      cached: true,
      findings: (cached.unsupportedJson ?? []) as JudgeFinding[],
      verdictId: cached.id,
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set')
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const resp = await client.messages.create({
    model: JUDGE_MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `EXTRACTION:\n${JSON.stringify(input.extraction).slice(0, 24000)}\n\nSYNTHESIS:\n${JSON.stringify(input.synthesis).slice(0, 24000)}\n\nReturn the JSON object described in your instructions.`,
      },
    ],
  })

  const raw = resp.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text)
    .join('')
    .trim()
    .replace(/^```(?:json)?\s*/gm, '')
    .replace(/```\s*$/gm, '')
    .trim()

  let findings: JudgeFinding[] = []
  try {
    findings = JudgeResultSchema.parse(JSON.parse(raw)).unsupported
  } catch {
    // A judge that returns garbage must not fail the nightly run or
    // invent violations — record a clean verdict and move on.
    findings = []
  }

  const verdict = await prisma.judgeVerdict.create({
    data: {
      reportId: input.reportId,
      extractionHash,
      synthesisHash,
      unsupportedJson: findings as never,
      violationCount: findings.length,
      modelVersion: JUDGE_MODEL,
    },
  })

  return { cached: false, findings, verdictId: verdict.id }
}
