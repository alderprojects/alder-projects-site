// Vermont homeowner annual cycle.
// What matters when, by month — for chat to give time-aware advice.
// Stable data — review annually for date shifts (deadline changes etc).

export type CalendarEntry = {
  startMonth: number   // 1-12
  startDay: number     // 1-31
  endMonth: number
  endDay: number
  category: 'tax' | 'permit' | 'maintenance' | 'contractor_market' | 'weather' | 'rebate_window' | 'buying' | 'selling'
  importance: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  homeownerAction: string
}

// ---------------------------------------------------------------------------
// VT HOMEOWNER ANNUAL CYCLE
// ---------------------------------------------------------------------------

export const VT_CALENDAR: CalendarEntry[] = [
  // ─── JANUARY ────────────────────────────────────────────────────────────
  {
    startMonth: 1, startDay: 1, endMonth: 2, endDay: 28,
    category: 'weather',
    importance: 'critical',
    title: 'Ice dam season',
    description: 'Roof ice dams cause ~25% of VT winter homeowner insurance claims. Caused by attic heat loss melting roof snow that refreezes at the eaves.',
    homeownerAction: 'If you see icicles forming or water staining ceilings, act immediately. Short-term: roof rake. Long-term: address attic insulation and air sealing — this is exactly what EVT weatherization rebates pay for.',
  },
  {
    startMonth: 1, startDay: 1, endMonth: 1, endDay: 31,
    category: 'tax',
    importance: 'high',
    title: 'Heating bill shock — fuel cost reckoning',
    description: 'January oil/propane bills land. Most VT homeowners realize the actual annual fuel cost. Triggers many heat pump conversion conversations.',
    homeownerAction: 'If your January oil/propane bill exceeds $500, you spend $3,000+/yr on heat. Heat pump payback after weatherization is typically 5-9 years in VT.',
  },

  // ─── FEBRUARY ───────────────────────────────────────────────────────────
  {
    startMonth: 2, startDay: 1, endMonth: 2, endDay: 28,
    category: 'contractor_market',
    importance: 'high',
    title: 'Best month to schedule spring contractors',
    description: 'VT contractors are filling spring/summer schedules in February. Calling now means May/June starts. Wait until April and you\'re booked into August.',
    homeownerAction: 'Get on contractor calendars NOW for any spring project. Quote requests in Feb get priority over April requests.',
  },

  // ─── MARCH ──────────────────────────────────────────────────────────────
  {
    startMonth: 3, startDay: 1, endMonth: 5, endDay: 15,
    category: 'weather',
    importance: 'high',
    title: 'Mud season',
    description: 'Frost coming out of ground turns dirt roads to soup. Heavy equipment access restricted in many rural towns. Septic pumping trucks, ready-mix concrete, oil delivery may all be limited.',
    homeownerAction: 'Don\'t schedule excavation, foundation pours, or septic work for March-mid May. Plan around it. If your driveway is dirt, expect to be car-bound in 2WD vehicles for parts of these weeks.',
  },
  {
    startMonth: 3, startDay: 15, endMonth: 4, endDay: 15,
    category: 'tax',
    importance: 'critical',
    title: 'Vermont Homestead Declaration deadline (Form HS-122)',
    description: 'Every VT homeowner who occupies their home as primary residence MUST file Form HS-122 annually to receive Homestead property tax classification (vs. higher non-homestead rate). Deadline April 15.',
    homeownerAction: 'File HS-122 every spring even if you filed last year. File HI-144 (Income Schedule) if your household income is below ~$134,000 to claim property tax credit. You will not be reminded — town reassessor will not call you.',
  },

  // ─── APRIL ──────────────────────────────────────────────────────────────
  {
    startMonth: 4, startDay: 1, endMonth: 4, endDay: 30,
    category: 'buying',
    importance: 'high',
    title: 'Spring real estate market opens',
    description: 'VT spring market typically opens with mud-season thaw. Listings surge late April. Inspections become possible (frost out of ground). Pre-approved buyers move fast.',
    homeownerAction: 'Buyers: get pre-approved March, ready to make offers April. Sellers: pre-listing inspection in April, list early May for peak May/June market.',
  },
  {
    startMonth: 4, startDay: 15, endMonth: 4, endDay: 15,
    category: 'tax',
    importance: 'critical',
    title: 'Federal AND state tax filing deadline',
    description: 'Same day. VT state refund claims (HS-122 + HI-144) also due. Homestead Declaration is filed with state return.',
    homeownerAction: 'Don\'t miss this. Late HS-122 means you pay non-homestead property tax for a year — that\'s real money on a $300k home (~$500-1000 difference).',
  },

  // ─── MAY ────────────────────────────────────────────────────────────────
  {
    startMonth: 5, startDay: 1, endMonth: 5, endDay: 31,
    category: 'tax',
    importance: 'high',
    title: 'Town reappraisal letters arrive (in reappraisal years)',
    description: 'Town listers send new property assessments after a town-wide reappraisal. About a third of VT towns reappraise each year on rotating schedule.',
    homeownerAction: 'Open the letter immediately. Grievance window is 14 days from notice (in most towns). Late = stuck with new assessment for the year. If your assessment seems wrong, appeal — it\'s often successful.',
  },
  {
    startMonth: 5, startDay: 15, endMonth: 6, endDay: 30,
    category: 'maintenance',
    importance: 'medium',
    title: 'Annual home maintenance window opens',
    description: 'Frost out, ground dry, perfect for: deck staining, gutter cleaning, exterior paint, septic pump-out (every 3-5 years), well water testing.',
    homeownerAction: 'Get septic pumped if it\'s been 3+ years (~$300-500). Test well water annually if private well (DIY kit ~$30 or full lab panel ~$300).',
  },

  // ─── JUNE ───────────────────────────────────────────────────────────────
  {
    startMonth: 6, startDay: 1, endMonth: 6, endDay: 30,
    category: 'tax',
    importance: 'high',
    title: 'VT property tax credit determination letters',
    description: 'Tax Department sends letters confirming amount of property tax credit (based on April HI-144 filing). Credit applied to summer property tax bill.',
    homeownerAction: 'Verify the credit amount matches your expectation. If you didn\'t file HI-144, you\'ll get nothing — most VT households leave money on the table.',
  },

  // ─── JULY ───────────────────────────────────────────────────────────────
  {
    startMonth: 7, startDay: 1, endMonth: 7, endDay: 31,
    category: 'buying',
    importance: 'medium',
    title: 'Real estate closing peak',
    description: 'Most VT closings happen mid-June through July. Movers booked solid. Closing attorneys backed up.',
    homeownerAction: 'If buying or selling, book your moving service 6+ weeks ahead in July. Closing attorneys should be retained by May for July closing.',
  },

  // ─── AUGUST ─────────────────────────────────────────────────────────────
  {
    startMonth: 8, startDay: 1, endMonth: 9, endDay: 30,
    category: 'tax',
    importance: 'critical',
    title: 'Annual property tax bills land',
    description: 'Most VT towns issue annual tax bills in early August (some in September). Half is typically due by mid-Aug, balance by mid-Feb.',
    homeownerAction: 'Open bill immediately. Verify the homestead vs non-homestead rate is correct. Verify property tax credit was applied. Errors are common — call town clerk if any number looks wrong.',
  },

  // ─── SEPTEMBER ──────────────────────────────────────────────────────────
  {
    startMonth: 9, startDay: 15, endMonth: 11, endDay: 15,
    category: 'maintenance',
    importance: 'high',
    title: 'Fall winterization window',
    description: 'Window for: heating system tune-up, oil/propane fill, chimney sweep, gutter cleaning, outdoor faucet shut-off, snow tire install, generator transfer switch test.',
    homeownerAction: 'Schedule heating system tune-up in September before HVAC techs are slammed in November. $150-250 saves emergency winter calls.',
  },

  // ─── OCTOBER ────────────────────────────────────────────────────────────
  {
    startMonth: 10, startDay: 1, endMonth: 10, endDay: 31,
    category: 'rebate_window',
    importance: 'high',
    title: 'Button Up Vermont campaign launches',
    description: 'EVT runs Button Up Vermont in October — extra rebates, free workshops, and DIY weatherization kit sales. Consumer-facing weatherization push.',
    homeownerAction: 'Watch for stacked rebates during Button Up month. EVT often offers $100 bonus on top of standard weatherization rebates if project committed in October.',
  },

  // ─── NOVEMBER ───────────────────────────────────────────────────────────
  {
    startMonth: 11, startDay: 1, endMonth: 11, endDay: 30,
    category: 'maintenance',
    importance: 'high',
    title: 'Last chance for outdoor work',
    description: 'Most outdoor contractor work shuts down by late November. Frost is in the ground, foundations cant be poured, dirt-road access becomes risky. Roofing, painting, deck work — done by Thanksgiving.',
    homeownerAction: 'If outdoor work isn\'t done by Thanksgiving, it waits until April-May. Don\'t agree to work that promises December completion outdoors.',
  },

  // ─── DECEMBER ───────────────────────────────────────────────────────────
  {
    startMonth: 12, startDay: 1, endMonth: 12, endDay: 31,
    category: 'tax',
    importance: 'high',
    title: 'Tax Commissioner property projection letter',
    description: 'VT Department of Taxes sends statewide letter with property tax projections for next fiscal year. Educational, not actionable — but signals what next August\'s bill will look like.',
    homeownerAction: 'Read it. Big projection swings = town listers about to do reappraisal OR education spending changes. Plan accordingly.',
  },
  {
    startMonth: 12, startDay: 25, endMonth: 12, endDay: 31,
    category: 'rebate_window',
    importance: 'critical',
    title: 'Federal energy credit deadlines (END OF YEAR)',
    description: 'Anything claimed under federal Section 25D (solar, battery) must be PLACED IN SERVICE by Dec 31 to claim on that tax year.',
    homeownerAction: 'If you have a solar install pending, ensure permission-to-operate is granted before Dec 31 to claim 30% federal credit on this years taxes.',
  },
]

// ---------------------------------------------------------------------------
// CURRENT-MONTH CONTEXT FOR CHAT PROMPT
// ---------------------------------------------------------------------------

// Returns calendar entries that are active or imminent (within next 45 days).
// Used to inject month-aware context into the chat system prompt.
export function activeCalendarItems(now: Date): CalendarEntry[] {
  const m = now.getMonth() + 1  // 1-12
  const d = now.getDate()

  // 45-day forward window — items whose START date falls in next 45 days
  const dayOfYear = (mm: number, dd: number) => {
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let total = dd
    for (let i = 0; i < mm - 1; i++) total += monthDays[i]
    return total
  }

  const todayDay = dayOfYear(m, d)
  return VT_CALENDAR.filter(e => {
    const startDoY = dayOfYear(e.startMonth, e.startDay)
    const endDoY = dayOfYear(e.endMonth, e.endDay)
    // Currently in window
    if (todayDay >= startDoY && todayDay <= endDoY) return true
    // Window starts within next 45 days
    const daysToStart = startDoY - todayDay
    if (daysToStart > 0 && daysToStart <= 45) return true
    // Wrap year-end (e.g., today Dec 1, item Jan 1)
    if (startDoY < todayDay - 320) {
      // item is in next year, distance is ~365 - todayDay + startDoY
      const distance = 365 - todayDay + startDoY
      if (distance <= 45) return true
    }
    return false
  })
}

export function calendarSummaryForPrompt(now: Date = new Date()): string {
  const active = activeCalendarItems(now)
  if (active.length === 0) {
    return `SEASONAL CONTEXT: Today is ${now.toDateString()}. No major Vermont homeowner deadlines in the immediate window.`
  }

  const lines: string[] = []
  lines.push(`SEASONAL CONTEXT: Today is ${now.toDateString()}.`)
  lines.push('Active or imminent VT homeowner moments (use these naturally if relevant to the user\'s question):')
  for (const e of active) {
    lines.push(`- [${e.importance}] ${e.title}: ${e.description}`)
    lines.push(`  Action: ${e.homeownerAction}`)
  }
  return lines.join('\n')
}
