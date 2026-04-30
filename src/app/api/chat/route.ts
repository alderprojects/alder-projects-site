import { NextResponse } from 'next/server'
import { projectsSummaryForPrompt } from '@/data/projects'
import { rebatesSummaryForPrompt } from '@/data/rebates'
import { calendarSummaryForPrompt } from '@/data/calendar'
import { zoningSummaryForPrompt } from '@/data/zoning'
import { handymanSummaryForPrompt } from '@/data/handyman'
import { vettingSummaryForPrompt } from '@/data/contractor-vetting'
import { sequencesSummaryForPrompt } from '@/data/sequences'

// ---------- Rate limiting (in-memory) ----------
// Per-IP rate limits to prevent bot abuse and runaway API costs.
// In-memory storage means limits reset on serverless cold starts — acceptable
// for now; upgrade to Vercel KV when the product earns it.

type RateBucket = { count: number; windowStart: number }
const RATE_LIMIT_HOUR_MAX = 12  // messages per hour per IP
const RATE_LIMIT_DAY_MAX = 30   // messages per day per IP
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const hourlyBuckets = new Map<string, RateBucket>()
const dailyBuckets = new Map<string, RateBucket>()

function getClientIp(req: Request): string {
  // Vercel/Cloudflare standard headers
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

// hCaptcha verification — checks the token on the first user message of a session.
// Fail-open if HCAPTCHA_SECRET not configured (avoids breaking dev/preview).
async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  if (!token) return false
  const secret = process.env.HCAPTCHA_SECRET
  if (!secret) {
    console.warn('HCAPTCHA_SECRET not configured — captcha verification skipped')
    return true
  }
  try {
    const params = new URLSearchParams()
    params.append('secret', secret)
    params.append('response', token)
    params.append('remoteip', ip)
    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = await res.json()
    return !!data.success
  } catch (err) {
    console.error('captcha verify failed:', err)
    return false
  }
}

function checkRateLimit(ip: string): { allowed: boolean; reason?: string; retryAfterSec?: number } {
  const now = Date.now()

  // Hourly bucket
  const h = hourlyBuckets.get(ip)
  if (!h || now - h.windowStart > HOUR_MS) {
    hourlyBuckets.set(ip, { count: 1, windowStart: now })
  } else {
    h.count++
    if (h.count > RATE_LIMIT_HOUR_MAX) {
      const retryAfterSec = Math.ceil((h.windowStart + HOUR_MS - now) / 1000)
      return {
        allowed: false,
        reason: 'You have hit the hourly chat limit. Try again in about an hour, or grab the briefing if you want everything in one shot.',
        retryAfterSec,
      }
    }
  }

  // Daily bucket
  const d = dailyBuckets.get(ip)
  if (!d || now - d.windowStart > DAY_MS) {
    dailyBuckets.set(ip, { count: 1, windowStart: now })
  } else {
    d.count++
    if (d.count > RATE_LIMIT_DAY_MAX) {
      const retryAfterSec = Math.ceil((d.windowStart + DAY_MS - now) / 1000)
      return {
        allowed: false,
        reason: 'You have hit the daily chat limit. Try again tomorrow, or grab the briefing if you want a full Vermont property write-up now.',
        retryAfterSec,
      }
    }
  }

  // Periodic cleanup — keep buckets from growing unbounded
  if (hourlyBuckets.size > 5000) {
    hourlyBuckets.forEach((v, k) => {
      if (now - v.windowStart > HOUR_MS) hourlyBuckets.delete(k)
    })
  }
  if (dailyBuckets.size > 5000) {
    dailyBuckets.forEach((v, k) => {
      if (now - v.windowStart > DAY_MS) dailyBuckets.delete(k)
    })
  }

  return { allowed: true }
}

// ---------- Conversation length safety cap ----------
const SOFT_WARN_AT = 25  // chat softly mentions briefing
const HARD_CAP_AT = 40   // refuse new Anthropic call


export const runtime = 'nodejs'
export const maxDuration = 30

// Heat pump + weatherization + Vermont property awareness for v1.
// All numbers below are 2026 figures sourced from Efficiency Vermont,
// GMP, VPPSA, and the federal OBBBA timeline. Update quarterly.
const SYSTEM_PROMPT = `You are a knowledgeable Vermont local helping homeowners think through heat pump, weatherization, and Vermont property decisions. You sound like a 50-year-old Vermont general contractor: plain, direct, specific. No hype, no jargon, no marketing voice. You write the way Vermonters actually talk.

YOUR SCOPE
You are a Vermont homeowner reference. You can help with:
- Renovation project costs by town (kitchens, bathrooms, decks, additions, basements, roofing, siding, windows, HVAC) — with VT-specific ranges, NOT national averages
- Heat pumps (cold-climate ductless and ducted) and weatherization
- Vermont state, utility, and federal rebates and tax credits
- ADU rules and zoning by town (post-Act 47 statewide framework + town-specific gotchas)
- Annual maintenance jobs (gutters, septic, chimney, snow plowing, oil tank, well water, dryer vent, tree work) — honest DIY-vs-hire framing
- Seasonal timing (when to do what, when permits are easiest, when contractors are booked)
- Property tax cycle (Homestead Declaration, reappraisal, tax bills)
- Property-specific questions when the user mentions a Vermont address

You ANSWER questions in conversation. You do not redirect to the calculator or other pages unless the user explicitly wants to "calculate" something themselves. If they ask "what does a kitchen remodel cost in Stowe", you give them the number range from your data, plus what's-included and what-pushes-it-high — same as a 50-year-old VT GC would over coffee.

For things genuinely outside this scope (legal advice, tax filing specifics, medical, contractor disputes, things requiring a specific licensed professional), say so plainly and direct them to the right kind of pro.

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

REBATE STACK SYNTHESIS — your most valuable behavior
When a user describes a project that touches multiple rebates, name the dollar amounts and the stack TOTAL out loud. Vermont homeowners overwhelmingly do not know that rebates stack. Surfacing the stack is the single most useful thing you can do for them.

Examples of stack synthesis:
- Oil furnace owner asking about heat pumps: "You'd qualify for ducted heat pump rebate around $2,200, oil-to-electric bonus of $400, weatherization rebate up to $4,000 if you tighten the envelope first, and the panel rebate around $500. Stacked, that's roughly $7,100 against a project that retail prices at $25-35k. If you're under 80% AMI for your county, the weatherization rebate jumps to $9,500, putting the stack closer to $12,600."
- Anyone considering solar: name the federal 25D credit (30%, no cap, through 2032) plus EVT solar+storage rebate up to $4,000.
- Income-qualified homeowner: ALWAYS check ami80ForCounty and call out the income tier explicitly. The dollar difference between standard and income-qualified weatherization is $5,500 — the highest-leverage thing you can flag.

Be specific. "$2,200 ducted heat pump rebate" not "there's a heat pump rebate." Use real Vermont numbers from the rebate data above.

Do NOT explain the FILING process step-by-step in chat (that's the briefing's job). Do say what's stacked, what they'd qualify for, and roughly what the total is. Then offer the briefing.

THE BRIEFING — your soft pivot after rebate synthesis
After you've named 3+ rebates that apply to the user's situation, naturally offer the Vermont Property Briefing as the next step. The briefing is a $19 PDF that turns the conversation into a playbook: form names and links, who files what, deadlines, the documentation needed, the disqualifying traps, and a year-1 calendar specific to the property.

How to offer it (vary the wording, keep it natural):
- "I can put together a Vermont Property Briefing for your house — the actual forms, who files them, and the order of operations. Walks through the $X,XXX in stacked rebates step by step. $19 if you want it."
- "There's a lot of paperwork on the rebate side — if you want the actual playbook (form names, deadlines, the trap that disqualifies most people), the briefing covers it. $19, delivered as a PDF. Want me to put one together?"
- "Want me to package this into a Vermont Property Briefing? It's the rebate playbook for your specific house — $19, includes all the forms and contractor checklists."

Voice rules for the briefing offer:
- Mention it AT MOST once per conversation. Don't pester.
- Lead with the dollar value the user would capture, not the briefing itself.
- If they decline or ignore it, drop it and keep helping. The chat is free; the briefing is opt-in.
- If they say yes, get their name + email naturally as part of the order: "Great. What name and email should I send it to?"
- Never paywall the chat. Even if they buy the briefing, the chat keeps helping them.

INTERACTION WITH CONTRACTOR HANDOFF
The chat has TWO possible value-capture paths and they don't conflict:
1. Briefing ($19 PDF, immediate) — for users who want the playbook to act on themselves
2. Contractor handoff (free, name+email lead) — for users who want a Vermont contractor to do the work

The briefing is appropriate when: user is research-phase, planning, has a long timeline, or is multi-trade
The contractor handoff is appropriate when: user is action-phase, has a short timeline, says "ready to get bids", or asks "who should I call"

Sometimes both apply. That's fine — offer the briefing first (it's the ROI artifact), and let the contractor handoff happen naturally if they say "OK so who do I call about this." Don't force-rank.


INTENT TRIGGERS — when to ask for contact info in the conversation
The user has shown buying intent if any of these are true:
- They've asked 3+ specific questions about their actual project (their house, their utility, their timeline)
- They use phrases like "when can I start", "who do you recommend", "can someone come look", "ready to get bids"
- They've named a budget AND a timeline AND a town

When intent triggers, ask for name + email INLINE in the conversation. Use phrasing like:
"Sounds like you've got a real project shaping up. Want me to send what we just talked about to a Vermont installer who handles the rebate paperwork? Drop your name and email and I'll loop them in within a business day."

DO NOT direct the user to a separate form, button, or page. The conversation IS the intake. Ask in plain text and they'll reply in plain text.

When the user gives you a name + email in their next message:
- Acknowledge naturally and warmly: "Got it, [first name]. They'll be in touch within a business day. Anything else you want to figure out in the meantime?"
- DO NOT say "I've captured your information," "Submitting now," or any system-y language.
- Stay in conversation mode. The user is welcome to keep asking questions after the handoff.

If the user gives you ONLY an email (no name):
- Acknowledge it: "Got it. Anything else you'd want the installer to know before they reach out?"
- Don't badger them for a name. The lead is captured either way.

If the user gives you ONLY a name (no email):
- Ask once, casually: "What email's the best way to reach you?"
- Don't repeat if they don't want to share.

If the user declines or stays vague:
- No problem. Keep answering their questions. Don't push.

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

// ---------- Contact info detection (auto-capture) ----------

const EMAIL_REGEX = /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/

function extractEmail(text: string): string | null {
  if (!text) return null
  const m = text.match(EMAIL_REGEX)
  return m ? m[1].toLowerCase() : null
}

// Try to pull a plausible name from a message that also contains an email.
// Heuristics: TitleCase first+last (e.g., "Jane Doe"), or "I'm <Name>", or
// "<Name>, <email>". Conservative — false positives are worse than misses
// (we'd rather capture with empty name than capture the wrong name).
function extractName(text: string, email: string): string | null {
  if (!text) return null

  // Strip the email from the text first so its local-part doesn't get matched as a name
  const withoutEmail = text.replace(email, '').replace(/<[^>]*>/g, '')

  // Pattern 1: "I'm Jane Doe" / "I am Jane Doe" / "this is Jane Doe" / "name's Jane"
  const introPattern = /(?:I'?m|I am|this is|name'?s|call me)\s+([A-Z][a-z]+(?:[\s'-][A-Z][a-z]+)?)/
  const m1 = withoutEmail.match(introPattern)
  if (m1) return m1[1].trim()

  // Pattern 2: TitleCase FirstName LastName not preceded by other words
  // (avoid "the Jane Doe place" matching)
  const namePattern = /(?:^|[\s,—-])([A-Z][a-z]{1,15}(?:[\s'-][A-Z][a-z]{1,20})+)(?:[\s,—-]|$)/
  const m2 = withoutEmail.match(namePattern)
  if (m2) return m2[1].trim()

  // Pattern 3: Single TitleCase word right next to email (like "Jane <email>")
  const adjPattern = /(?:^|[\s,—-])([A-Z][a-z]{2,20})[\s,—-]+$/
  const m3 = withoutEmail.match(adjPattern)
  if (m3) return m3[1].trim()

  return null
}

// Has the assistant offered an installer connection in any prior turn?
// Used as the gate so we don't auto-capture from random emails earlier in chat.
function offerWasMade(messages: Message[]): boolean {
  return messages.some(
    m =>
      m.role === 'assistant' &&
      /(installer|put you in front|loop them in|send what we just talked about|put a vermont installer|connect.*contractor|connect.*installer)/i.test(
        m.content
      )
  )
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
    // Rate-limit check — applies to ALL POSTs (chat + capture_lead).
    // Prevents bots from racking up Anthropic costs even via the lead webhook.
    const clientIp = getClientIp(req)
    const rate = checkRateLimit(clientIp)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: rate.reason },
        {
          status: 429,
          headers: rate.retryAfterSec ? { 'Retry-After': String(rate.retryAfterSec) } : {},
        }
      )
    }

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

    // Captcha check — only on the very first user message of a conversation.
    // After that, the rate limiter and conversation cap take over.
    const userMessageCount = messages.filter((m: { role: string }) => m.role === 'user').length
    if (userMessageCount === 1) {
      const captchaOk = await verifyCaptcha(body.captchaToken || '', clientIp)
      if (!captchaOk) {
        // Fail-open: log the captcha rejection but let the request through.
        // Rate limit (Layer 1) and conversation cap (Layer 3) still protect.
        // hCaptcha invisible mode over-rejects on cold sites, blocking real users.
        // Treat captcha as a soft signal rather than a hard gate.
        console.warn('captcha verification failed for ip', clientIp, '— allowing through; rate limit will still apply')
      }
    }

    // Hard cap on per-conversation length. A single conversation thread that
    // crosses HARD_CAP_AT messages is either abuse or someone who needs the
    // briefing more than another chat reply.
    if (messages.length >= HARD_CAP_AT) {
      return NextResponse.json({
        reply: "We've covered a ton of ground in this conversation — way more than most folks need. The Vermont property briefing pulls everything together (rebate playbook, sequence, contractor checklist, calendar, year ahead) in one PDF for your specific address. That's the right next step. Refresh the page if you want to start a new conversation about something different.",
        capped: true,
      })
    }

    // Soft warn — model sees a system-level note appended to the system prompt
    // suggesting the briefing handoff. Doesn't block the call.
    const conversationDepthHint = messages.length >= SOFT_WARN_AT
      ? `\n\nCONVERSATION DEPTH NOTE: This conversation has reached ${messages.length} messages. The user has gotten significant value already. In your next reply, naturally suggest the Vermont property briefing as the consolidated next step ("we've covered a lot — want me to put it all in a briefing?"), then answer their current question concisely. Do not lecture or moralize.`
      : ''

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

    // Always inject the rebate stack and seasonal calendar — those are the
    // most-referenced data sets and worth the tokens on every turn.
    turnSystemPrompt += `\n\n=== REBATE DATA ===\n\n${rebatesSummaryForPrompt()}`
    turnSystemPrompt += `\n\n=== SEASONAL CALENDAR ===\n\n${calendarSummaryForPrompt(new Date())}`

    // Inject project costs whenever the conversation mentions a renovation
    // category. Cheap heuristic on recent user messages.
    const recentUserText = trimmed
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content)
      .join(' ')
      .toLowerCase()
    const renovationKeywords = ['kitchen', 'bathroom', 'bath ', 'deck', 'addition', 'basement', 'roof', 'siding', 'window', 'hvac', 'furnace', 'remodel', 'renovat', 'cost', 'budget', 'price', 'estimate', 'quote']
    if (renovationKeywords.some(k => recentUserText.includes(k))) {
      turnSystemPrompt += `\n\n=== PROJECT COSTS (VT-specific) ===\n\n${projectsSummaryForPrompt()}`
    }

    // Inject ADU/zoning data when the conversation mentions ADU/zoning topics
    // OR whenever a town is identified (cheap context).
    const zoningKeywords = ['adu', 'accessory', 'in-law', 'mother-in-law', 'zoning', 'permit', 'setback', 'short-term rental', 'airbnb', 'add a unit', 'rental unit', 'separate unit']
    if (zoningKeywords.some(k => recentUserText.includes(k)) || detectedAddress) {
      turnSystemPrompt += `\n\n=== ADU & ZONING ===\n\n${zoningSummaryForPrompt()}`
    }

    // Inject handyman data when the conversation mentions any maintenance/seasonal topic
    const handymanKeywords = ['gutter', 'septic', 'chimney', 'plow', 'snow', 'oil tank', 'well water', 'dryer vent', 'tree', 'maintenance', 'fall', 'winter', 'spring', 'seasonal', 'diy', 'do it myself', 'should i hire']
    if (handymanKeywords.some(k => recentUserText.includes(k))) {
      turnSystemPrompt += `\n\n=== HANDYMAN & SEASONAL ===\n\n${handymanSummaryForPrompt()}`
    }

    // Inject contractor vetting guidance when the conversation is about hiring,
    // bids, contracts, or finding/evaluating a contractor.
    const vettingKeywords = ['contractor', 'hire', 'bid', 'quote', 'estimate', 'reference', 'license', 'insurance', 'permit', 'vetting', 'check', 'reputable', 'reliable', 'scam', 'rip off', 'how do i find', 'how to find', 'who should i', 'who do i call']
    if (vettingKeywords.some(k => recentUserText.includes(k))) {
      turnSystemPrompt += `\n\n=== CONTRACTOR VETTING (VT-specific) ===\n\n${vettingSummaryForPrompt()}\n\n=== PROJECT SEQUENCES ===\n\n${sequencesSummaryForPrompt()}\n\n=== VERMONT CALENDAR ===\n\n${calendarSummaryForPrompt()}`
    }

    if (context?.referrer) {
      turnSystemPrompt += `\n\nThe user came from: ${context.referrer}`
    }
    if (context?.calculatorState) {
      turnSystemPrompt += `\n\nCalculator state from the user's session: ${JSON.stringify(context.calculatorState)}`
    }
    if (propertyContext) {
      turnSystemPrompt += `\n\n${formatPropertyContext(propertyContext)}`
    }

    // Append conversation-depth hint if we hit the soft-warn threshold above.
    turnSystemPrompt += conversationDepthHint

    const reply = await callClaude(trimmed, turnSystemPrompt)

    // Auto-capture: if the user's most recent message contains an email AND
    // the conversation has prior installer-offer context, capture the lead silently.
    let leadCaptured = false
    try {
      const lastUserMsg = trimmed.filter(m => m.role === 'user').pop()
      if (lastUserMsg && offerWasMade(trimmed)) {
        const email = extractEmail(lastUserMsg.content)
        if (email) {
          const name = extractName(lastUserMsg.content, email) || ''
          // Build full transcript including the assistant reply we just generated
          const fullTranscript: Message[] = [...trimmed, { role: 'assistant', content: reply }]
          const summary = await summarizeTranscript(fullTranscript)
          await postLeadToWebhook({
            name: name || '(name not given)',
            email,
            zip: '',
            timeline: '',
            transcript: fullTranscript,
            summary,
            source: 'chat_auto_capture',
          })
          leadCaptured = true
        }
      }
    } catch (captureErr) {
      // Don't break the chat reply if capture fails — log and continue
      console.error('auto-capture error:', captureErr instanceof Error ? captureErr.message : captureErr)
    }

    return NextResponse.json({ reply, addressDetected: detectedAddress, leadCaptured })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('chat route error:', msg)
    return NextResponse.json({ error: 'chat unavailable', detail: msg.substring(0, 200) }, { status: 500 })
  }
  }
