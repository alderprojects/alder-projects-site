/**
 * v7.4.0/v7.4.1 — POST /api/photos/recommend/answer
 *
 * "Improve this recommendation": persist a clarifying answer, re-run
 * enrichment (rules-only for tenure; full re-reason otherwise), and
 * return what changed plus the refreshed report at the caller's tier.
 *
 * Verdict changes propagate to cart artifacts per the continuum rule —
 * the response's `changes` array is what the UI renders as "what changed."
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { refineReport, RefineError } from '@/lib/recommend/refine'
import { shapeResponse } from '@/lib/recommend/disclosure'
import type { DisclosureTier } from '@/lib/recommend/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// 90 like the recommend route: non-tenure answers re-run candidate
// generation (the same LLM long pole). Tenure answers are rules-only
// and return in ~2s regardless.
export const maxDuration = 90

const BodySchema = z.object({
  reportId: z.string().min(1),
  questionKey: z.string().min(1).max(60),
  answerText: z.string().min(1).max(500),
  recommendationId: z.string().optional(),
  // v7.4.2f — capability key (email-link sessions on other devices)
  key: z.string().max(64).optional(),
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

  let anonId: string | null = null
  try {
    anonId = await ensureVisitorSession({ firstSource: 'photo_report' })
  } catch {
    // Key-holders (email links on another device) have no cookie — the
    // refine call authorizes on the key instead.
    if (!body.key) {
      return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
    }
  }

  const visitor = anonId ? await prisma.visitorSession.findUnique({ where: { anonId } }) : null
  const callerTier: DisclosureTier = body.key || visitor?.claimedByUserId ? 'email' : 'free'

  try {
    const result = await refineReport({
      reportId: body.reportId,
      anonId,
      key: body.key ?? null,
      questionKey: body.questionKey,
      answerText: body.answerText,
      recommendationId: body.recommendationId,
    })

    const { visible, locked } = shapeResponse(result.recs, callerTier)
    for (const w of visible) {
      w.id = result.recIds.get(w.key)
    }

    return NextResponse.json({
      ok: true,
      reportId: result.reportId,
      status: result.status,
      tier: callerTier,
      changes: result.changes,
      recommendations: visible,
      lockedRecommendations: locked,
      upsell: result.buyCount > 0 ? { eligible: true, buyCount: result.buyCount } : { eligible: false, buyCount: 0 },
    })
  } catch (e) {
    if (e instanceof RefineError) {
      const status = e.code === 'not_your_report' ? 403 : e.code === 'report_not_found' ? 404 : 422
      return NextResponse.json({ ok: false, error: e.code, detail: e.message }, { status })
    }
    console.error('[photos/recommend/answer] failed:', (e as Error).message)
    return NextResponse.json(
      { ok: false, error: 'refine_failed', detail: (e as Error).message.slice(0, 300) },
      { status: 500 }
    )
  }
}
