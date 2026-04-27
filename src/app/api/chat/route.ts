import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// Heat pump + weatherization + Vermont property awareness for v1.
// All numbers below are 2026 figures sourced from Efficiency Vermont,
// GMP, VPPSA, and the federal OBBBA timeline. Update quarterly.
const SYSTEM_PROMPT = `You are a knowledgeable Vermont local helping homeowners think through heat pump, weatherization, and Vermont property decisions. You sound like a 50-year-old Vermont general contractor: plain, direct, specific. No hype, no jargon, no marketing voice. You write the way Vermonters actually talk.

YOUR SCOPE
You can help with:
- Heat pumps (cold-climate ductless and ducted) in Vermont
- Weatherization (air sealing, insulation, the order of operations)
- Vermont state, utility, and federal rebates that apply to the above
- Choosing between heat pump and furnace replacement
- The connection between weatherization and heat pump sizing
- Property-specific questions when the user mentions a Vermont address (flood zones, shoreland rules, septic, zoning, ADU feasibility)

If someone asks about a kitchen, bathroom, deck, roof, or other renovation project cost, say something like: "For project costs by trade and town, our cost calculator at /calculator has Vermont-specific ranges. For other questions about your property, I can help — just give me an address." Then stop.

VERMONT REBATE STACK (as of October 2026 — these numbers ALWAYS WIN over any other source)

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
- IMPORTANT: If property context data mentions Federal 25C as active, that data is stale. Always tell the user 25C expired Dec 31, 2025.

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

USING ADDRESS CONTEXT
If the user mentions a Vermont address and the system has retrieved property data for them, you'll see an ADDRESS CONTEXT block below. When that block is present:
- Weave the context naturally into your answer ("since you're in Burlington and a GMP customer...")
- Use the town/county/utility/water source/zoning to give specific advice, not generic
- Mention concerns from the property scan when they're relevant to the user's question
- DO NOT say "I ran a property scan" or "based on the scan" — just answer with the context informed
- DO NOT invent property facts not in the context block
- If the user asks something the address context doesn't cover (e.g., kitchen costs), use your normal scope rules

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

type SeasonalReport = {
  summary?: string
  snapshot?: {
    address?: string
    town?: string
    county?: string
    facts?: Array<{ label: string; value: string }>
  }
  concerns?: Array<{ title: string; whyCheck?: string; howToResolve?: string; cost?: string; resolvedWhen?: string }>
  actions?: Array<{ title: string; why?: string; cost?: string; priority?: string; nextStep?: string }>
  seasonal?: Array<{ action: string; timing?: string; why?: string }>
  programs?: Array<{ name: string; why?: string; value?: string; caveat?: string; url?: string }>
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5-20250929'

// ---------- Address detection + property context ----------

// Cache property lookups per request lifetime to avoid repeat hits.
// (Vercel's serverless model means this resets per cold start, which is fine.)
const propertyCache = new Map<string, SeasonalReport | null>()

function extractVermontAddress(text: string): string | null {
  if (!text) return null
  // Strategy: look for either a clear "<num> <street> ... VT" pattern,
  // or "<num> <street>, <town>" where town is in our VT town list (rough heuristic).
  // Keep it permissive — false positives are cheap (API returns nothing harmful).

  // Pattern 1: house number + street + comma + word + (VT or Vermont) optional zip
  const fullPattern = /(d{1,5})s+([A-Za-z][A-Za-z0-9 .'-]{2,60})s*,s*([A-Za-z][A-Za-z .'-]{2,40})(?:s*,?s*(?:VT|Vermont))?/i
  const m = text.match(fullPattern)
  if (m) {
    // Reconstruct a clean address string
    const num = m[1].trim()
    const street = m[2].trim()
    const town = m[3].trim()
    return `${num} ${street}, ${town}, VT`
  }

  // Pattern 2: just "<street>, <town>, VT" (no house number) — looser
  const noNumPattern = /([A-Za-z][A-Za-z0-9 .'-]{4,60})s*,s*([A-Za-z][A-Za-z .'-]{2,40})s*,s*(?:VT|Vermont)/i
  const m2 = text.match(noNumPattern)
  if (m2) {
    const street = m2[1].trim()
    const town = m2[2].trim()
    return `${street}, ${town}, VT`
  }

  return null
}

async function fetchPropertyContext(address: string, originUrl: string): Promise<SeasonalReport | null> {
  if (propertyCache.has(address)) return propertyCache.get(address) || null
  try {
    // Build absolute URL to the seasonal-report endpoint.
    // originUrl is the request's host (https://alderprojects.com).
    const url = new URL('/api/seasonal-report', originUrl).toString()
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      propertyCache.set(address, null)
      return null
    }
    const data = (await res.json()) as SeasonalReport
    if (!data || !data.snapshot) {
      propertyCache.set(address, null)
      return null
    }
    propertyCache.set(address, data)
    return data
  } catch (e) {
    propertyCache.set(address, null)
    return null
  }
}

function formatPropertyContext(report: SeasonalReport): string {
  const parts: string[] = ['ADDRESS CONTEXT']

  if (report.snapshot) {
    parts.push(`The user has mentioned a property at: ${report.snapshot.address || 'unknown'}`)
    if (report.snapshot.town) parts.push(`Town: ${report.snapshot.town}`)
    if (report.snapshot.county) parts.push(`County: ${report.snapshot.county}`)
    if (Array.isArray(report.snapshot.facts)) {
      for (const f of report.snapshot.facts) {
        if (f.label && f.label !== 'Town' && f.label !== 'County') {
          parts.push(`${f.label}: ${f.value}`)
        }
      }
    }
  }

  if (report.summary) {
    parts.push('', `Summary: ${report.summary}`)
  }

  if (Array.isArray(report.concerns) && report.concerns.length > 0) {
    parts.push('', 'Concerns flagged for this property:')
    for (const c of report.concerns.slice(0, 5)) {
      const bits = [c.title]
      if (c.whyCheck) bits.push(c.whyCheck)
      if (c.howToResolve) bits.push(`Resolution: ${c.howToResolve}`)
      if (c.cost) bits.push(`Cost: ${c.cost}`)
      parts.push(`- ${bits.join(' — ')}`)
    }
  }

  if (Array.isArray(report.actions) && report.actions.length > 0) {
    parts.push('', 'Recommended next actions for this property:')
    for (const a of report.actions.slice(0, 5)) {
      const bits = [a.title]
      if (a.priority) bits.push(`(${a.priority})`)
      if (a.cost) bits.push(`Cost: ${a.cost}`)
      if (a.why) bits.push(a.why)
      parts.push(`- ${bits.join(' — ')}`)
    }
  }

  if (Array.isArray(report.seasonal) && report.seasonal.length > 0) {
    parts.push('', 'Seasonal items for this property:')
    for (const s of report.seasonal.slice(0, 4)) {
      parts.push(`- ${s.action}${s.timing ? ' (' + s.timing + ')' : ''}${s.why ? ' — ' + s.why : ''}`)
    }
  }

  parts.push(
    '',
    'IMPORTANT: Use this property context naturally. Do not say "I ran a scan." Just answer with this context informed. If property programs data conflicts with your authoritative VERMONT REBATE STACK above, your stack ALWAYS wins (the seasonal-report data may be stale on rebate amounts).'
  )

  return parts.join('\n')
}

// ---------- Claude call ----------

async function callClaude(
  messages: Message[],
  systemPromptOverride?: string
) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const systemPrompt = systemPromptOverride || SYSTEM_PROMPT

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
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!webhook) {
    console.error('GOOGLE_SHEETS_WEBHOOK_URL not configured — lead not routed')
    return { ok: false, reason: 'webhook not configured' }
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Routing field
      type: 'chat_lead',
      // PascalCase keys (LeadsDB sheet column names)
      LeadID: `CHAT-${Date.now()}`,
      SubmittedAt: new Date().toISOString(),
      LeadStatus: 'new',
      HomeownerName: lead.name,
      Email: lead.email,
      Phone: '',
      ZipCode: lead.zip || '',
      Timeline: lead.timeline || '',
      Category: 'Heat pump / weatherization',
      Description: lead.transcript.map(m => `${m.role}: ${m.content}`).join('\n---\n'),
      LeadBriefJSON: lead.summary,
      // Lowercase mirror keys (in case Apps Script reads these)
      leadId: `CHAT-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      leadStatus: 'new',
      homeownerName: lead.name,
      name: lead.name,
      email: lead.email,
      phone: '',
      zipCode: lead.zip || '',
      zip: lead.zip || '',
      timeline: lead.timeline || '',
      category: 'Heat pump / weatherization',
      description: lead.transcript.map(m => `${m.role}: ${m.content}`).join('\n---\n'),
      transcript: lead.transcript.map(m => `${m.role}: ${m.content}`).join('\n---\n'),
      leadBriefJSON: lead.summary,
      summary: lead.summary,
      source: lead.source || 'chat',
    }),
  })

  return { ok: res.ok, status: res.status }
}

// ---------- POST handler ----------

export async function POST(req: Request) {
  try {
    const body = await req.json()

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

    const { messages, context } = body as ChatRequest
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const MAX_TURNS = 30
    const trimmed = messages.length > MAX_TURNS ? messages.slice(-MAX_TURNS) : messages

    // Address detection: scan the most recent user message AND the conversation
    // history (in case address was mentioned earlier and is still relevant).
    let propertyContext: SeasonalReport | null = null
    let detectedAddress: string | null = null
    const recentText = trimmed
      .filter(m => m.role === 'user')
      .slice(-3) // last 3 user messages
      .map(m => m.content)
      .join(' ')
    detectedAddress = extractVermontAddress(recentText)

    if (detectedAddress) {
      const origin = new URL(req.url).origin
      propertyContext = await fetchPropertyContext(detectedAddress, origin)
    }

    // Build the system prompt for this turn
    let turnSystemPrompt = SYSTEM_PROMPT
    if (context?.referrer) {
      turnSystemPrompt += `\n\nThe user came from: ${context.referrer}`
    }
    if (context?.calculatorState) {
      turnSystemPrompt += `\n\nCalculator state from the user's session: ${JSON.stringify(context.calculatorState)}`
    }
    if (propertyContext) {
      turnSystemPrompt += `\n\n${formatPropertyContext(propertyContext)}`
    }

    const reply = await callClaude(trimmed, turnSystemPrompt)
    return NextResponse.json({ reply, addressDetected: detectedAddress })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('chat route error:', msg)
    return NextResponse.json({ error: 'chat unavailable', detail: msg.substring(0, 200) }, { status: 500 })
  }
}
