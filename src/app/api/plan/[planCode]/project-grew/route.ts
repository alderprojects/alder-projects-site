// V7 — Project Grew submission endpoint.
// Captures the user's note + plan context, writes a lead_intent
// (leadType='project_grew'), and emails hello@alderprojects.com so
// the team can follow up. The chat widget on the page handles the
// live conversation; this endpoint is the durable signal.

import { NextResponse } from 'next/server'
import {
  createLeadIntent,
  generateLeadIntentId,
  getWorthItPlan,
  logPlanEvent,
} from '@/lib/storage'

export const dynamic = 'force-dynamic'

type Body = { text?: string }

export async function POST(
  req: Request,
  { params }: { params: { planCode: string } },
) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

  const planCode = params.planCode
  const plan = await getWorthItPlan(planCode, token)
  if (!plan) return NextResponse.json({ error: 'Plan not found or invalid token' }, { status: 404 })

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const text = (body.text ?? '').trim()
  if (text.length < 10) {
    return NextResponse.json({ error: 'Tell us more — minimum 10 characters' }, { status: 400 })
  }

  await createLeadIntent({
    id: generateLeadIntentId(),
    planCode,
    leadType: 'project_grew',
    trigger: 'user_clicked_project_grew',
    tasksJson: { userNote: text },
    location: { town: plan.data.townName, town_tier: plan.data.townTier },
    intentScore: 90,
    status: 'new',
    createdAt: new Date().toISOString(),
    metadata: {
      topic: plan.data.topic,
      scopeVariantId: plan.data.scopeVariantId,
      customerEmail: plan.data.customerEmail,
    },
  })

  await logPlanEvent(planCode, 'project_grew_submitted', { textLength: text.length })

  // Email backstop: enqueue an internal alert to hello@alderprojects.com
  // via the email queue. Keeps the alert auditable; transport script
  // posts to Gmail.
  const { kv } = await import('@vercel/kv')
  const envelopeId = `eml_grew_${Date.now().toString(36)}`
  await kv.set(`email:queue:${envelopeId}`, {
    id: envelopeId,
    type: 'project_grew_alert',
    toEmail: 'hello@alderprojects.com',
    subject: `Worth-It Plan ${planCode} — project grew`,
    body: [
      `Plan: ${planCode}`,
      `Customer: ${plan.data.customerEmail}`,
      `Topic: ${plan.data.topic} / ${plan.data.scopeLabel}`,
      `Town: ${plan.data.townName ?? '(no address)'}`,
      '',
      `Note from user:`,
      text,
      '',
      `Plan link: https://alderprojects.com/worth-it/dashboard/${planCode}?token=${token}`,
    ].join('\n'),
    metadata: { planCode },
    scheduledFor: new Date().toISOString(),
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
