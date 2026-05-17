/**
 * v7.3.3-B1 desktop -> mobile session handoff.
 *
 * Use case: visitor lands on /project-read/basement on desktop, decides
 * to upload photos from their phone (camera is right there). We mint a
 * one-time handoff token bound to their alder_anon_id, render a QR code
 * encoding /handoff/<token>. Mobile scans, server redeems the token,
 * sets a matching alder_anon_id cookie on mobile, redirects to the
 * basement page. Both devices now share the same anon session.
 *
 * Security model:
 *   - Raw token is 32-byte random hex (64 chars), unguessable
 *   - Only SHA-256 hash stored in DB; raw token only exists in QR + redemption URL
 *   - 5-minute TTL
 *   - Single-use (consumedAt set on first redemption; subsequent hits fail)
 *   - Anyone with the QR can hijack the session within the 5-min window;
 *     acceptable for v7.3.3 beta where the anon session contains
 *     basement photos + cart with no PII beyond what the visitor uploaded
 */

import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/db'

const TOKEN_TTL_MINUTES = 5

export interface IssuedHandoff {
  rawToken: string
  expiresAt: Date
}

export async function issueHandoffToken(anonId: string): Promise<IssuedHandoff> {
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000)

  await prisma.handoffToken.create({
    data: { tokenHash, anonId, expiresAt },
  })

  return { rawToken, expiresAt }
}

export type RedeemResult =
  | { ok: true; anonId: string }
  | { ok: false; reason: 'not_found' | 'expired' | 'already_consumed' }

export async function redeemHandoffToken(
  rawToken: string,
  fromIp: string | null
): Promise<RedeemResult> {
  if (typeof rawToken !== 'string' || rawToken.length !== 64) {
    return { ok: false, reason: 'not_found' }
  }
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')

  const token = await prisma.handoffToken.findUnique({ where: { tokenHash } })
  if (!token) return { ok: false, reason: 'not_found' }
  if (token.consumedAt) return { ok: false, reason: 'already_consumed' }
  if (token.expiresAt < new Date()) return { ok: false, reason: 'expired' }

  await prisma.handoffToken.update({
    where: { id: token.id },
    data: { consumedAt: new Date(), consumedFromIp: fromIp },
  })

  return { ok: true, anonId: token.anonId }
}
