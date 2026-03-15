import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const required = ['name','email','phone','trade','yearsExp','insured']
    for (const f of required) {
      if (!b[f]) return NextResponse.json({ error: 'Missing: ' + f }, { status: 400 })
    }
    if (!b.counties || b.counties.length === 0) {
      return NextResponse.json({ error: 'Select at least one county' }, { status: 400 })
    }
    const now = new Date().toISOString()
    const appId = 'CTAPP-' + Date.now()
    console.log('Contractor application:', appId, b.name, b.email, b.trade, b.counties.join(','))
    const webhook = process.env.CONTRACTOR_WEBHOOK_URL
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, submittedAt: now, ...b })
      })
    }
    return NextResponse.json({ success: true, appId }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
