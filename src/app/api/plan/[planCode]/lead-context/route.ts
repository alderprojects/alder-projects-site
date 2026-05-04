// V7.1 — POST /api/plan/[planCode]/lead-context
//
// Generic lead-capture sink for the four dashboard modals
// (StartChecklist, SkipList, DiyStopLine, ComparePaths). Each modal
// posts {intentType, trigger} and gets a saved lead_intent the V8
// routing layer will pick up. Token-gated like other plan mutations.

import { NextResponse } from 'next/server'
import {
  getWorthItPlan,
  createLeadIntent,
  generateLeadIntentId,
  logPlanEvent,
  type LeadIntentType,
} from '@/lib/storage'

export const dynamic = 'force-dynamic'

const ALLOWED_INTENTS: LeadIntentType[] = [
  'handyman_bundle',
  'contractor_needed',
  'project_grew',
  'product_affiliate',
  'chat_followup',
]

type Body = { intentType?: LeadIntentType; trigger?: string }

export async function POST(
  req: Request,
  { params }: { params: { planCode: string } },
) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

  const planCode = params.planCode
  const plan = await getWorthItPlan(planCode, token)
  if (!plan) {
    return NextResponse.json(
      { error: 'Plan not found or invalid token' },
      { status: 404 },
    )
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const intentType = body.intentType
  const trigger = body.trigger ?? 'unknown'
  if (!intentType || !ALLOWED_INTENTS.includes(intentType)) {
    return NextResponse.json(
      { error: 'Invalid intentType' },
      { status: 400 },
    )
  }

  await createLeadIntent({
    id: generateLeadIntentId(),
    planCode,
    leadType: intentType,
    trigger,
    location: { town: plan.data.townName, town_tier: plan.data.townTier },
    intentScore: 60,
    status: 'new',
    createdAt: new Date().toISOString(),
  })

  await logPlanEvent(planCode, 'lead_context_captured', {
    intentType,
    trigger,
  })

  return NextResponse.json({ ok: true })
}
