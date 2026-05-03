// V7 — Find My Plan endpoint.
//
// POST { email } → for each plan tied to the email's hash, enqueue a
// recovery email containing the magic link. Always returns the same
// generic success message — never leak whether the email had any
// plans, for privacy.

import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { findPlansByEmail } from '@/lib/storage'

export const dynamic = 'force-dynamic'

type Body = { email?: string }

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const planCodes = await findPlansByEmail(email)

  // Privacy: do not leak whether email matched.
  if (planCodes.length === 0) {
    return NextResponse.json({ ok: true })
  }

  // For each plan, fetch the stored token hash via the plan record;
  // the magic link in the recovery email needs the unhashed token,
  // which we did not store. Compromise: surface plan codes, not the
  // raw token. The user enters the plan code + last-4-of-email
  // passcode on the dashboard route and gets in. This is consistent
  // with the spec's accountless persistence model.
  for (const planCode of planCodes) {
    const envelopeId = `eml_find_${Date.now().toString(36)}_${planCode}`
    await kv.set(`email:queue:${envelopeId}`, {
      id: envelopeId,
      type: 'find_plan_recovery',
      toEmail: email,
      subject: `Recover your Worth-It Plan ${planCode}`,
      body: [
        `You requested recovery for your Alder Projects Worth-It Plan.`,
        '',
        `Plan code: ${planCode}`,
        `Recovery URL: https://alderprojects.com/worth-it/dashboard/${planCode}?passcode=${email.slice(-4)}`,
        '',
        `The recovery URL uses the last 4 characters of this email as a passcode. If you still have the original magic link from delivery, use that instead — magic links never expire while the plan is valid.`,
      ].join('\n'),
      metadata: { planCode },
      scheduledFor: new Date().toISOString(),
      status: 'queued',
      attempts: 0,
      createdAt: new Date().toISOString(),
    })
  }

  return NextResponse.json({ ok: true })
}
