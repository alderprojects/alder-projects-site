import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL
    const now = new Date().toISOString()

    if (body.type === 'nurture') {
      if (!body.email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      if (webhook) {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'nurture', email: body.email, source: body.source || 'plan_page', submittedAt: now }),
        })
      }
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const required = ['homeownerName','email','town','zipCode','propertyType','category','budgetBand','timeline','description']
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: 'Missing: ' + f }, { status: 400 })
    }

    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lead',
          submittedAt: now,
          homeownerName: body.homeownerName,
          email: body.email,
          phone: body.phone || '',
          town: body.town,
          zipCode: body.zipCode,
          propertyType: body.propertyType,
          category: body.category,
          budgetBand: body.budgetBand,
          timeline: body.timeline,
          financingStatus: body.financingStatus || '',
          plansReady: body.plansReady || '',
          description: body.description,
          journeyStage: body.journeyStage || '',
        }),
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}