/**
 * v7.4.8 — POST /api/report/address  (FLAG-GATED)
 *
 * Body: {reportId, line1, line2?, city, state, zip, licensingConsent: boolean, key?}
 *
 * Pre-answered decision, enforced here: an address WITHOUT the
 * licensing checkbox is accepted and stored for the visitor's own
 * record continuity — but NO credit is issued. The credit is
 * consideration for the licensing consent specifically; do not blur
 * these. Both paths are separate rows and separate events.
 *
 * 404s entirely when ADDRESS_CAPTURE_ENABLED is off — no route surface
 * exists in production until counsel clears the language.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { logEvent } from '@/lib/events/log'
import {
  CONSENT_POLICY_VERSION,
  CONSENT_TEXT,
  addressCaptureEnabled,
  consentTextHash,
  normalizeAddressHash,
} from '@/lib/consent/licensing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const BodySchema = z.object({
  reportId: z.string().min(1),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
  licensingConsent: z.boolean(),
  key: z.string().max(64).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!addressCaptureEnabled()) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  let anonId: string | null = null
  try {
    anonId = await ensureVisitorSession({ firstSource: 'report_address' })
  } catch {
    if (!body.key) return NextResponse.json({ ok: false, error: 'no_anon_cookie' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({
    where: { id: body.reportId },
    select: { id: true, visitorAnonId: true, userId: true, accessKey: true, deletedAt: true },
  })
  if (!report || report.deletedAt) {
    return NextResponse.json({ ok: false, error: 'report_not_found' }, { status: 404 })
  }
  const byCookie = anonId != null && report.visitorAnonId === anonId
  const byKey = body.key != null && report.accessKey != null && body.key === report.accessKey
  if (!byCookie && !byKey) {
    return NextResponse.json({ ok: false, error: 'not_your_report' }, { status: 403 })
  }

  const owner = { visitorAnonId: report.visitorAnonId ?? anonId, userId: report.userId }

  const property = await prisma.propertyRecord.create({
    data: {
      reportId: report.id,
      visitorAnonId: owner.visitorAnonId,
      userId: owner.userId,
      line1: body.line1.trim(),
      line2: body.line2?.trim() || null,
      city: body.city.trim(),
      state: body.state.trim().toUpperCase(),
      zip: body.zip,
      normalizedHash: normalizeAddressHash(body),
      verifiedVia: 'NONE',
    },
  })

  await logEvent({
    eventType: 'ADDRESS_SUBMITTED',
    subjectType: 'Report',
    subjectId: report.id,
    anonId: owner.visitorAnonId ?? undefined,
    source: 'web',
    payload: { propertyRecordId: property.id, withConsent: body.licensingConsent },
  })

  // No licensing consent → stored for the visitor's own record
  // continuity, no credit. This split IS the financial-incentive
  // structure; keep it explicit.
  if (!body.licensingConsent) {
    return NextResponse.json({ ok: true, propertyRecordId: property.id, creditIssued: false })
  }

  const consent = await prisma.consentRecord.create({
    data: {
      scope: 'DATA_LICENSING',
      visitorAnonId: owner.visitorAnonId,
      userId: owner.userId,
      reportId: report.id,
      propertyRecordId: property.id,
      policyVersion: CONSENT_POLICY_VERSION,
      textHash: consentTextHash(CONSENT_TEXT),
      source: 'post_result_address_module',
    },
  })

  await logEvent({
    eventType: 'CONSENT_GRANTED',
    subjectType: 'ConsentRecord',
    subjectId: consent.id,
    anonId: owner.visitorAnonId ?? undefined,
    source: 'web',
    payload: { scope: 'DATA_LICENSING', policyVersion: CONSENT_POLICY_VERSION, textHash: consent.textHash },
  })

  // One credit per report, ever — a second consent on the same report
  // does not mint a second credit.
  const existing = await prisma.smartCartCredit.findFirst({ where: { reportId: report.id } })
  if (existing) {
    return NextResponse.json({
      ok: true,
      propertyRecordId: property.id,
      consentRecordId: consent.id,
      creditIssued: false,
      creditCode: existing.code,
      alreadyIssued: true,
    })
  }

  const credit = await prisma.smartCartCredit.create({
    data: {
      code: `ALDER-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
      visitorAnonId: owner.visitorAnonId,
      userId: owner.userId,
      reportId: report.id,
      consentRecordId: consent.id,
    },
  })

  await logEvent({
    eventType: 'CREDIT_ISSUED',
    subjectType: 'SmartCartCredit',
    subjectId: credit.id,
    anonId: owner.visitorAnonId ?? undefined,
    source: 'web',
    payload: { reportId: report.id, consentRecordId: consent.id },
  })

  return NextResponse.json({
    ok: true,
    propertyRecordId: property.id,
    consentRecordId: consent.id,
    creditIssued: true,
    creditCode: credit.code,
  })
}
