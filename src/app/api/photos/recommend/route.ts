/**
 * v7.4.0 — POST /api/photos/recommend
 *
 * Input:  { snapshotIds: string[], userPrompt?: string, tenure?: "own"|"rent" }
 * Output: report at the caller's current disclosure tier. The paid layer
 *         (cart artifacts / SKUs) is computed and persisted in this same
 *         request but NEVER crosses the wire here — it is exclusively a
 *         paid-cart surface (v7.4.2).
 *
 * Anonymous session-gated: snapshots must belong to the caller's
 * alder_anon_id. Tier resolution: 'email' once the visitor session has
 * been claimed by a user (magic-link capture), else 'free'.
 *
 * Runs the full-depth pipeline synchronously. maxDuration 90 (Hobby
 * fluid compute allows up to 300) — measured 2026-07-27: the candidate
 * LLM call is ~98% of wall time at ~90-110 output tok/s; observed range
 * 32-61s per report, so 60 was too tight at p95.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { runPipeline, PipelineError } from '@/lib/recommend/pipeline'
import { shapeResponse } from '@/lib/recommend/disclosure'
import type { DisclosureTier } from '@/lib/recommend/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 90

const BodySchema = z.object({
  snapshotIds: z.array(z.string().min(1)).min(1).max(10),
  userPrompt: z.string().max(500).optional(),
  tenure: z.enum(['own', 'rent']).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'invalid_body', detail: (e as Error).message.slice(0, 300) },
      { status: 400 }
    )
  }

  let anonId: string
  try {
    anonId = await ensureVisitorSession({ firstSource: 'photo_report' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'no_anon_cookie', detail: (e as Error).message }, { status: 400 })
  }

  // Ownership check: every snapshot must belong to this anon visitor
  // (directly, or via a project owned by them).
  const snaps = await prisma.roomSnapshot.findMany({
    where: { id: { in: body.snapshotIds } },
    select: { id: true, visitorAnonId: true, project: { select: { visitorAnonId: true } } },
  })
  if (snaps.length !== body.snapshotIds.length) {
    return NextResponse.json({ ok: false, error: 'snapshot_not_found' }, { status: 404 })
  }
  for (const s of snaps) {
    const owner = s.visitorAnonId ?? s.project?.visitorAnonId
    if (owner !== anonId) {
      return NextResponse.json({ ok: false, error: 'not_your_snapshot' }, { status: 403 })
    }
  }

  // Disclosure tier: email once the anon session was claimed via magic link.
  const visitor = await prisma.visitorSession.findUnique({ where: { anonId } })
  const callerTier: DisclosureTier = visitor?.claimedByUserId ? 'email' : 'free'

  try {
    const out = await runPipeline({
      snapshotIds: body.snapshotIds,
      anonId,
      userPrompt: body.userPrompt,
      tenure: body.tenure,
    })

    const { visible, locked } = shapeResponse(out.recs, callerTier)

    // Attach persisted row ids so the client can answer clarifying questions
    for (const w of visible) {
      w.id = out.recIds.get(w.key)
    }

    // Nudge rules: upsell context only when ≥1 BUY. Copy layers may only
    // state these computed facts — never speculative teasers.
    const upsell =
      out.buyCount > 0
        ? { eligible: true, buyCount: out.buyCount }
        : { eligible: false, buyCount: 0 }

    return NextResponse.json({
      ok: true,
      reportId: out.reportId,
      status: out.status,
      tier: callerTier,
      recommendations: visible,
      lockedRecommendations: locked,
      upsell,
      exclusionNotice: out.exclusionLine,
      recency: out.recencyFlagged ? { flagged: true, detail: out.recencyDetail, question: 'Are these photos current?' } : { flagged: false },
      // Tenure fork: own/rent is always the first clarifying question when unknown
      tenureQuestion: out.tenureKnown ? null : { key: 'tenure', question: 'Do you own or rent this home?' },
    })
  } catch (e) {
    if (e instanceof PipelineError) {
      return NextResponse.json({ ok: false, error: e.code, detail: e.message }, { status: 422 })
    }
    console.error('[photos/recommend] pipeline failed:', (e as Error).message)
    return NextResponse.json(
      { ok: false, error: 'pipeline_failed', detail: (e as Error).message.slice(0, 300) },
      { status: 500 }
    )
  }
}
