// V7 — Plan state PATCH endpoint.

import { NextResponse } from 'next/server'
import { updatePlanState, logPlanEvent, type PlanState } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: { planCode: string } },
) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

  let patch: Partial<PlanState>
  try {
    patch = (await req.json()) as Partial<PlanState>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const next = await updatePlanState(params.planCode, token, patch)
  if (!next) return NextResponse.json({ error: 'Not found or invalid token' }, { status: 404 })

  // Lightweight event logging. Skip noisy lastOpenedAt-only updates.
  const eventKeys = Object.keys(patch).filter(k => k !== 'lastOpenedAt')
  if (eventKeys.length) {
    await logPlanEvent(params.planCode, 'state_patched', { keys: eventKeys })
  }

  return NextResponse.json({ state: next })
}
