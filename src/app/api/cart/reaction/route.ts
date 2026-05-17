/**
 * v7.3.4-PR1 — Cart reaction endpoint.
 *
 * POST /api/cart/reaction
 * Body: {
 *   cartId: string
 *   signature: string         // LearningStore.featureSignature
 *   reactionType: 'thumbs_up' | 'dismiss' | 'doesnt_apply'
 *   feedbackText?: string     // present only on doesnt_apply
 * }
 *
 * Behavior:
 *   - Increments the right counter on LearningStore (thumbsUpCount /
 *     dismissCount / doesntApplyCount).
 *   - On 'doesnt_apply' with feedbackText, also writes a
 *     LearningStoreFeedback row tying the freeform text to
 *     (signature, anonId, cartId).
 *   - Writes a CART_REACTION EventLog row for funnel analysis.
 *
 * Auth: anon-cookie identity is enough for PR1. The route silently
 * no-ops if no anon cookie is set (rather than 401) so a determined
 * spammer can't enumerate behavior, and so accidental client retries
 * after cookie expiry don't surface scary errors.
 *
 * Idempotency: NOT enforced server-side in PR1. Client disables
 * buttons after click, which is sufficient against accidental
 * double-clicks. A determined dual-tab user can double-vote.
 * Refine in v7.5 if reaction noise warrants it.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAnonId } from '@/lib/visitor/session'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 5

const ReactionType = z.enum(['thumbs_up', 'dismiss', 'doesnt_apply'])

const BodySchema = z.object({
  cartId: z.string().min(1).max(80),
  signature: z.string().min(1).max(200),
  reactionType: ReactionType,
  feedbackText: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'invalid_body', detail: (e as Error).message.slice(0, 200) },
      { status: 400 }
    )
  }

  const anonId = await getAnonId()
  if (!anonId) {
    // No anon cookie — silently accept and no-op. Avoids surfacing
    // a scary 401 on cookie expiry edge cases.
    return NextResponse.json({ ok: true, recorded: false, reason: 'no_anon' })
  }

  // Look up the LearningStore row; if missing, the signature was
  // surfaced by an old cart and the row has since been purged.
  // No-op cleanly.
  const lsRow = await prisma.learningStore.findUnique({
    where: { featureSignature: body.signature },
  })
  if (!lsRow) {
    return NextResponse.json({
      ok: true,
      recorded: false,
      reason: 'signature_not_in_store',
    })
  }

  // Map reaction type -> count column name.
  const countField =
    body.reactionType === 'thumbs_up'
      ? 'thumbsUpCount'
      : body.reactionType === 'dismiss'
        ? 'dismissCount'
        : 'doesntApplyCount'

  // Single-row update + (optional) feedback insert in a transaction
  // so the EventLog write isn't blocked behind a stale count if the
  // second write fails.
  await prisma.$transaction(async (tx) => {
    await tx.learningStore.update({
      where: { id: lsRow.id },
      data: { [countField]: { increment: 1 } },
    })
    if (
      body.reactionType === 'doesnt_apply' &&
      body.feedbackText &&
      body.feedbackText.trim().length > 0
    ) {
      await tx.learningStoreFeedback.create({
        data: {
          learningStoreId: lsRow.id,
          anonId,
          cartId: body.cartId,
          reactionType: body.reactionType,
          feedbackText: body.feedbackText.trim(),
        },
      })
    }
  })

  // Audit log — the funnel retro reads this.
  await logEvent({
    eventType: 'CART_REACTION',
    subjectType: 'SmartCart',
    subjectId: body.cartId,
    anonId,
    source: 'web',
    payload: {
      signature: body.signature,
      reactionType: body.reactionType,
      withFeedbackText:
        body.reactionType === 'doesnt_apply' &&
        !!body.feedbackText &&
        body.feedbackText.trim().length > 0,
    },
  })

  return NextResponse.json({ ok: true, recorded: true })
}
