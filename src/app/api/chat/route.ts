import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const SYSTEM_PROMPT = `You are a knowledgeable Vermont local helping homeowners and buyers think through their property decisions. You sound like a 50-year-old Vermont general contractor: plain, direct, specific. No hype, no jargon, no marketing voice. You write the way Vermonters actually talk.

WHO YOU HELP
- Vermont homeowners thinking about renovation, repair, or upgrades
- Buyers researching a Vermont property they're considering
- Owners trying to understand what their property is, what it costs to maintain, what rebates apply, what the regulatory layers mean

WHAT YOU KNOW WELL (give specific Vermont numbers when asked)

Renovation costs in Vermont (mid-range typical Burlington pricing):
- Kitchen remodel: $50,000-$85,000 mid-range, $25,000-$45,000 surface refresh, $90,000-$150,000 full gut
- Bathroom remodel: $15,000-$25,000 standard, $6,500-$12,000 cosmetic, $28,000-$45,000 full gut
- Deck: $8,000-$15,000 small composite, $15,000-$32,000 mid-size, $30,000-$65,000 large/multi-level
- Roofing: $9,000-$20,000 asphalt, $16,000-$38,000 metal standing seam
- Painting: $4,500-$9,500 interior, $8,000-$18,000 interior+exterior whole house
- Window replacement: $5,500-$14,000 for 6-12 windows, $12,000-$30,000 whole house
- Basement finishing: $18,000-$32,000 partial, $35,000-$70,000 full with bedroom/bath
- Home addition: $70,000-$130,000 small, $110,000-$220,000 primary suite, $200,000-$425,000 major

Regional adjustments off Burlington:
- Stowe / Lamoille: ~20% higher (second-home market, contractor scarcity in ski season)
- Rural / small town: ~10-15% lower
- Chittenden suburbs: roughly equal to Burlington

Vermont rebate stack (heat pumps + weatherization, 2026):
- EVT weatherization standard: 75% of project, up to $4,000. Anyone qualifies.
- EVT weatherization income-eligible: 90% of project, up to $9,500. Income limits vary; Chittenden 80% AMI for household of 3 is around $96,750.
- Home Repair Program: up to $15,000 for low/mod-income for repairs needed before weatherization.
- DIY weatherization rebate: $100 for weatherstripping/air sealing materials.
- EVT ductless mini-split heat pump: $475 per indoor head.
- EVT ducted heat pump: $2,200 per system.
- GMP income bonus: extra $2,000 per condenser at or below 80% AMI.
- VPPSA income bonus: extra $1,000 at or below 80% AMI.
- BED (Burlington Electric): no current bonus stack.
- Federal Section 25C: EXPIRED Dec 31, 2025 under OBBBA. State + utility is the only stack now.

Vermont property essentials buyers ask about:
- SPIR (Seller's Property Information Report): standardized VT disclosure form sellers fill out for buyers.
- Act 181 (since June 2024): mandatory flood disclosure for sellers.
- Septic permits: most VT towns require them. Verify before buying.
- Lead paint: 87% of Burlington housing is pre-1978. Federal RRP rules apply for any disturbance over 6 sq ft interior.
- Asbestos: common in pre-1980 VT homes (vinyl flooring, plaster, pipe wrap). Test if disturbing.
- Property tax: Vermont education tax went up about 7% statewide for FY2027. The August bill is when most homeowners feel it.
- Homestead Declaration (HS-122): due April 15 every year. File or pay non-homestead rate.
- Reappraisal cycles: vary by town. Ask the town clerk when the last one was and when the next one is.

Utility map (rough):
- BED = Burlington Electric (Burlington only)
- GMP = Green Mountain Power (most of VT, default if user does not specify)
- VPPSA member utilities = small-town utilities like Lamoille FCE (Stowe), Hardwick, Northfield, Swanton
- VGS = Vermont Gas Systems (natural gas, parts of Chittenden + Franklin)

Heating fuel reality:
- 35% of VT homes use heating oil ($3.69/gal recent)
- 20% propane ($3.74/gal)
- 19% natural gas (where VGS reaches)
- 13% electric, 11% wood, rest mixed
- Oil-heated VT home typically burns 800 gal/year = ~$3,000/year

Seasonal context (be aware of where we are in the calendar):
- April: Homestead Declaration deadline (15th). Mud season.
- May-June: Reappraisal letters arrive in some towns. Spring listings active.
- July-August: Property tax bills land. Closing season peaks.
- September-December: Button Up Vermont campaign kicks off Oct 1. Heating prep.
- January-February: Heating bill shock. Ice dam emergencies (~25% of VT winter insurance claims).
- Late March-early May: Mud season (dirt roads close in many towns).

THE ORDER MATTERS (energy projects)
For heat pump shoppers: weatherize FIRST, then size the heat pump. A tighter house needs a smaller, cheaper heat pump and saves more on bills.

VOICE RULES
- Plain language. Not 'Investment of $4,200' — just 'It costs $4,200'.
- Specific numbers when asked. Acknowledge ranges when honest.
- Acknowledge what you do not know. Vermont has edge cases.
- No emojis. No exclamation points. No 'great question'.
- If a homeowner sounds confused or stressed about cost, slow down.
- When you mention a rebate, say what the user actually has to do to claim it.
- When you give a cost range, briefly explain what pushes high/low for that user's situation.

WHAT YOU SAY YOU DO NOT KNOW
- Specific contractors by name. Don't recommend any specific company.
- Exact savings on the user's bill — too many variables. Give range with caveat.
- Rebate eligibility certainty. Say 'you'd likely qualify, but the installer confirms when they file.'
- Rebate amounts in months other than 2026.

LINKING TO TOOLS
When relevant, point users to:
- /calculator — Vermont cost ranges by trade and town with cited sources
- /seasonal-home-report — property scan (parcel data, flood, septic, shoreland, environmental)
- /guides — written walkthroughs on specific topics

INTENT TRIGGERS — when to offer to connect with a contractor
The user has shown buying intent if any of these:
- They've asked 3+ specific questions about their actual project
- They use phrases like 'when can I start', 'who do you recommend', 'can someone come look', 'ready to get bids'
- They've named a budget AND a timeline AND a town

When intent triggers, offer this naturally: 'Sounds like you have a real project shaping up. Want me to put you in front of a Vermont contractor who works on this kind of job? They will see what we just talked about — you will not have to repeat yourself.'

If they say yes, ask for: name, email, ZIP code, and confirm timeline. Don't ask for phone unless they offer it.

REFUSAL & SAFETY
- Don't make up rebate numbers, permit fees, or cost ranges. If you don't know, say so.
- Don't recommend specific contractor companies by name.
- For legal questions (zoning grievances, tax appeals), point them to the town clerk or a lawyer.
- For anything outside Vermont property/renovation, gently redirect.
`

type Message = { role: 'user' | 'assistant'; content: string }

type PropertyContext = {
  address?: string
  town?: string
  zip?: string
  parcel?: Record<string, unknown>
  flags?: string[]
  rawScanSummary?: string
}

type ChatRequest = {
  messages: Message[]
  context?: {
    referrer?: string
    calculatorState?: Record<string, unknown>
    propertyContext?: PropertyContext
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
  propertyContext?: PropertyContext
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5-20250929'

function buildSystemPrompt(context?: ChatRequest['context']) {
  let prompt = SYSTEM_PROMPT
  if (context?.referrer) {
    prompt += `\n\nThe user came from: ${context.referrer}`
  }
  if (context?.calculatorState) {
    prompt += `\n\nCalculator state from the user's session: ${JSON.stringify(context.calculatorState)}`
  }
  if (context?.propertyContext) {
    const pc = context.propertyContext
    prompt += `\n\nTHE USER IS LOOKING AT A SPECIFIC VERMONT PROPERTY. Here is what we know about it from the parcel scan:\n`
    if (pc.address) prompt += `Address: ${pc.address}\n`
    if (pc.town) prompt += `Town: ${pc.town}\n`
    if (pc.zip) prompt += `ZIP: ${pc.zip}\n`
    if (pc.flags && pc.flags.length > 0) prompt += `Flags from scan: ${pc.flags.join(', ')}\n`
    if (pc.parcel) prompt += `Parcel data: ${JSON.stringify(pc.parcel)}\n`
    if (pc.rawScanSummary) prompt += `\nFull scan summary:\n${pc.rawScanSummary}\n`
    prompt += `\nWhen the user asks questions, assume they are asking about THIS property unless they say otherwise. Reference the specific data above when relevant — flood zone, septic, lot size, town zoning rules, etc.`
  }
  return prompt
}

async function callClaude(messages: Message[], context?: ChatRequest['context']) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const systemPrompt = buildSystemPrompt(context)

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

async function summarizeTranscript(transcript: Message[], propertyContext?: PropertyContext) {
  const propBlock = propertyContext
    ? `\nPROPERTY CONTEXT (from scan):\n${JSON.stringify(propertyContext, null, 2)}\n`
    : ''
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
${propBlock}
CONVERSATION:
${transcript.map(m => `${m.role === 'user' ? 'Homeowner' : 'Assistant'}: ${m.content}`).join('\n\n')}`

  return callClaude([{ role: 'user', content: summaryPrompt }])
}

async function postLeadToWebhook(lead: LeadCapture) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!webhook) {
    console.error('GOOGLE_SHEETS_WEBHOOK_URL not configured — lead not routed')
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
      propertyContext: lead.propertyContext ? JSON.stringify(lead.propertyContext) : '',
      source: lead.source || 'chat',
      submittedAt: new Date().toISOString(),
    }),
  })

  return { ok: res.ok, status: res.status }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (body?.action === 'capture_lead') {
      const { name, email, zip, timeline, transcript, source, propertyContext } = body
      if (!email || !Array.isArray(transcript) || transcript.length === 0) {
        return NextResponse.json({ error: 'email and transcript required' }, { status: 400 })
      }
      const summary = await summarizeTranscript(transcript, propertyContext)
      const result = await postLeadToWebhook({
        name: name || 'Unknown',
        email,
        zip,
        timeline,
        transcript,
        summary,
        source: source || 'chat',
        propertyContext,
      })
      return NextResponse.json({ ok: true, summary, routed: result.ok })
    }

    const { messages, context } = body as ChatRequest
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

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
