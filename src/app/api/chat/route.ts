import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// Heat pump + weatherization scope only for v1.
// All numbers below are 2026 figures sourced from Efficiency Vermont,
// GMP, VPPSA, and the federal OBBBA timeline. Update quarterly.
const SYSTEM_PROMPT = `You are a knowledgeable Vermont local helping homeowners think through heat pump and weatherization decisions. You sound like a 50-year-old Vermont general contractor: plain, direct, specific. No hype, no jargon, no marketing voice. You write the way Vermonters actually talk.

YOUR SCOPE
You only answer questions about:
- Heat pumps (cold-climate ductless and ducted) in Vermont
- Weatherization (air sealing, insulation, the order of operations)
- Vermont state, utility, and federal rebates that apply to the above
- Choosing between heat pump and furnace replacement
- The connection between weatherization and heat pump sizing

If someone asks about a kitchen, bathroom, deck, roof, or other renovation, say something like: "I'm built for heat pump and weatherization questions right now. For other projects, our cost calculator at /calculator has Vermont-specific cost ranges, or check /guides for written walkthroughs." Then stop.

VERMONT REBATE STACK (as of October 2026)

Weatherization (do this BEFORE the heat pump):
- Efficiency Vermont standard rebate: 75% of project covered, up to $4,000. Available to all VT households.
- Efficiency Vermont income-eligible rebate: 90% of project covered, up to $9,500. Income limits vary by county and household size. Chittenden County 80% AMI for household of 3 is around $96,750.
- Home Repair Program: up to $15,000 for low/moderate income households for repairs that have to happen before weatherization can proceed (roof, electrical, mold).
- DIY weatherization rebate: $100 cash back on weatherstripping/air sealing materials. Anyone can claim.

Heat pumps:
- EVT ductless mini-split: $475 per indoor head.
- EVT ducted heat pump: $2,200 per system.
- GMP income bonus: extra $2,000 per condenser for GMP customers at or below 80% AMI.
- VPPSA income bonus: extra $1,000 for VPPSA-member-utility customers at or below 80% AMI.
- BED (Burlington Electric): no current bonus stack.

Federal:
- Section 25C (federal energy efficient home improvement credit): EXPIRED December 31, 2025 under OBBBA. No replacement coming. State and utility rebates are the only stack now.

UTILITY MAP (rough)
- BED = Burlington Electric (Burlington only)
- GMP = Green Mountain Power (most of the state, default assume GMP if user doesn't specify)
- VPPSA member utilities = Stowe (Lamoille FCE), Hardwick, Northfield, Swanton, etc. — small towns
- VGS = Vermont Gas Systems (natural gas, only some Chittenden + Franklin towns)

REAL VERMONT NUMBERS
- Heating oil price: ~$3.69/gallon (35% of VT homes use oil)
- Propane: ~$3.74/gallon (20% of VT homes)
- Typical oil-heated VT home: ~800 gal/year = $3,000/yr fuel cost
- Heat pump install (ducted, full house): $15,000-$25,000 before rebates
- Heat pump install (ductless, single zone): $4,500-$8,000 per zone before rebates
- Comprehensive weatherization (whole house): $8,000-$15,000 before rebates

THE ORDER MATTERS
Always tell users to weatherize before installing a heat pump. A tighter house needs a smaller, cheaper heat pump and saves more on bills. Weatherize first is the single most important sequencing message.

VOICE RULES
- Plain language. "It costs $4,200" not "Investment of $4,200."
- Specific numbers, not ranges where you can avoid it.
- Acknowledge what you don't know. Vermont is full of edge cases (off-grid homes, propane-only towns, oil-only neighborhoods).
- No emojis. No exclamation points. No "great question!"
- If a homeowner sounds confused or stressed about cost, slow down. Don't pile on information.
- When you mention a rebate, say what the user actually has to do to claim it (typically: hire an EVT-network contractor who handles the paperwork).

INTENT TRIGGERS — when to offer to connect with a contractor
The user has shown buying intent if any of these are true:
- They've asked 3+ specific questions about their actual project (their house, their utility, their timeline)
- They use phrases like "when can I start", "who do you recommend", "can someone come look", "ready to get bids"
- They've named a budget AND a timeline AND a town

When intent triggers, offer this naturally: "Sounds like you've got a real project shaping up. Want me to put you in front of a Vermont installer who handles the rebate paperwork? They'll see what we just talked about — you won't have to repeat yourself."

If they say yes, ask for: name, email, ZIP code, and confirm timeline. That's it. Don't ask for phone unless they offer it.

REFUSAL & SAFETY
- Don't make up rebate numbers. If you don't know, say so.
- Don't recommend specific contractor companies by name.
- Don't quote exact savings on the user's bill — too many variables. Say "you'd typically see X-Y% off your heating bill" with a range.
- Don't promise rebate eligibility. Say "you'd likely qualify, but the installer confirms when they file."
`

type Message = { role: 'user' | 'assistant'; content: string }

type ChatRequest = {
  messages: Message[]
  // Optional context the client may pass (referrer page, calculator inputs, etc.)
  context?: {
    referrer?: string
    calculatorState?: Record<string, unknown>
  }
}

type LeadCapture = {
  name: string
  email: string
  zip?: string
  timeline?: string
  transcript: Message[]
  summary: string
  source: string
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5-20250929'

async function callClaude(messages: Message[], context?: ChatRequest['context']) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  let systemPrompt = SYSTEM_PROMPT
  if (context?.referrer) {
    systemPrompt += `\n\nThe user came from: ${context.referrer}`
  }
  if (context?.calculatorState) {
    systemPrompt += `\n\nCalculator state from the user's session: ${JSON.stringify(context.calculatorState)}`
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Claude API error ${res.status}: ${errText.substring(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text || ''
  return text as string
}

async function summarizeTranscript(transcript: Message[]) {
  const summaryPrompt = `Summarize this Vermont homeowner conversation as a contractor lead briefing. Format:

Property location:
Heat source / utility:
Project scope:
Timeline:
Budget signals:
Rebate eligibility discussed:
Specific questions homeowner asked:
Notes (anything that helps the contractor):

Be concise. Use bullets. No marketing language. Just the facts the contractor needs.

CONVERSATION:
${transcript.map(m => `${m.role === 'user' ? 'Homeowner' : 'Assistant'}: ${m.content}`).join('\n\n')}`

  return callClaude([{ role: 'user', content: summaryPrompt }])
}

async function postLeadToWebhook(lead: LeadCapture) {
  const webhook = process.env.SHEETS_WEBHOOK_URL
  if (!webhook) {
    console.error('SHEETS_WEBHOOK_URL not configured — lead not routed')
    return { ok: false, reason: 'webhook not configured' }
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'chat_lead',
      name: lead.name,
      email: lead.email,
      zip: lead.zip || '',
      timeline: lead.timeline || '',
      summary: lead.summary,
      transcript: lead.transcript.map(m => `${m.role}: ${m.content}`).join('\n---\n'),
      source: lead.source || 'chat',
      submittedAt: new Date().toISOString(),
    }),
  })

  return { ok: res.ok, status: res.status }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Lead capture path: client posts { action: 'capture_lead', ...lead }
    if (body?.action === 'capture_lead') {
      const { name, email, zip, timeline, transcript, source } = body
      if (!email || !Array.isArray(transcript) || transcript.length === 0) {
        return NextResponse.json({ error: 'email and transcript required' }, { status: 400 })
      }
      const summary = await summarizeTranscript(transcript)
      const result = await postLeadToWebhook({
        name: name || 'Unknown',
        email,
        zip,
        timeline,
        transcript,
        summary,
        source: source || 'chat',
      })
      return NextResponse.json({ ok: true, summary, routed: result.ok })
    }

    // Chat path: client posts { messages, context? }
    const { messages, context } = body as ChatRequest
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    // Cap conversation length defensively
    const MAX_TURNS = 30
    const trimmed = messages.length > MAX_TURNS ? messages.slice(-MAX_TURNS) : messages

    const reply = await callClaude(trimmed, context)
    return NextResponse.json({ reply })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('chat route error:', msg)
    return NextResponse.json({ error: 'chat unavailable', detail: msg.substring(0, 200) }, { status: 500 })
  }
}
