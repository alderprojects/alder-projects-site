/**
 * v7.4.9 — POST /api/admin/curation  {ruleId, action: "revoke"}
 *
 * Revoke sets revokedAt; the rule row is kept as the audit trail (same
 * append-only discipline as consent). Re-creating a rule for the same
 * signature later is a NEW row.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAdmin } from '@/lib/auth/admin'
import { logEvent } from '@/lib/events/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(req: NextRequest): Promise<NextResponse> {
  const check = await checkAdmin()
  if (check.status === 'unauthenticated') {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (check.status === 'forbidden') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  let body: { ruleId?: unknown; action?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }
  const ruleId = typeof body.ruleId === 'string' ? body.ruleId : ''
  if (!ruleId || body.action !== 'revoke') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const updated = await prisma.curationRule.updateMany({
    where: { id: ruleId, revokedAt: null },
    data: { revokedAt: new Date(), revokedBy: check.user.email },
  })
  if (updated.count === 0) {
    return NextResponse.json({ ok: false, error: 'not_found_or_already_revoked' }, { status: 404 })
  }

  await logEvent({
    eventType: 'CURATION_RULE_REVOKED',
    subjectType: 'CurationRule',
    subjectId: ruleId,
    actorId: check.user.id,
    source: 'admin',
    payload: { revokedBy: check.user.email },
  })

  return NextResponse.json({ ok: true })
}
