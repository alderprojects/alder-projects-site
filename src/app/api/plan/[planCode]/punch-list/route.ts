// V7 — Punch List submission endpoint.
// Saves the bundle to plan_state.savedPunchList AND writes a
// lead_intent (leadType='handyman_bundle') for V8 to consume.

import { NextResponse } from 'next/server'
import {
  updatePlanState,
  createLeadIntent,
  generateLeadIntentId,
  getWorthItPlan,
  logPlanEvent,
} from '@/lib/storage'

export const dynamic = 'force-dynamic'

type Body = { moveIds?: string[]; timing?: string }

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
  const moveIds = body.moveIds ?? []
  const timing = body.timing ?? 'this_weekend'
  if (moveIds.length === 0) {
    return NextResponse.json({ error: 'No moves selected' }, { status: 400 })
  }

  await updatePlanState(planCode, token, {
    savedPunchList: { taskIds: moveIds, whenSaved: new Date().toISOString(), timing },
  })

  await createLeadIntent({
    id: generateLeadIntentId(),
    planCode,
    leadType: 'handyman_bundle',
    trigger: 'user_clicked_bundle_small_fixes',
    tasksJson: { moveIds, timing },
    location: { town: plan.data.townName, town_tier: plan.data.townTier },
    intentScore: 70,
    status: 'new',
    createdAt: new Date().toISOString(),
  })

  await logPlanEvent(planCode, 'punch_list_saved', { moveCount: moveIds.length, timing })

  return NextResponse.json({ ok: true })
}
