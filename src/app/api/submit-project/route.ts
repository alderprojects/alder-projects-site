import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const required = ['homeownerName','email','town','zipCode','county','propertyType','category','budgetBand','timeline','financingStatus','description']
    for (const f of required) {
      if (!b[f]) return NextResponse.json({ error: 'Missing: ' + f }, { status: 400 })
    }
    const now = new Date().toISOString()
    const leadId = 'LEAD-' + Date.now()
    // Row matches LeadsDB column order A–M plus Description
    const row = [
      leadId, now, now, 'New',
      b.homeownerName, b.email, b.phone || '', b.town, b.zipCode, b.county,
      b.category, b.budgetBand, b.timeline, b.propertyType,
      b.financingStatus, b.plansReady || '', b.description,
    ]
    console.log('Lead:', leadId, b.homeownerName, b.county, b.category)
    const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL
    if (webhook) {
      await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ row, leadId, submittedAt: now, ...b }) })
    }
    return NextResponse.json({ success: true, leadId }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
