import { NextRequest, NextResponse } from 'next/server'

// ── Evidence types ──────────────────────────────────────────

type EvidenceType = 'FACT' | 'INFERENCE' | 'REGIONAL_CONTEXT' | 'UNRESOLVED'

interface Evidence {
  id: string
  statement: string
  type: EvidenceType
  source: string
  confidence: 'high' | 'moderate' | 'low'
  verifyHow?: string
}

interface RiskFlag {
  title: string
  severity: 'high' | 'medium' | 'low'
  category: string
  description: string
  supportingEvidence: string[]
  verifyNext: string
}

interface Action {
  title: string
  actionType: string
  priority: 'critical' | 'high' | 'moderate' | 'low' | 'defer'
  costRange: string
  upside: string
  taxCreditNote: string
  avoidIf: string
  rationale: string
  supportingEvidence: string[]
}

interface Program {
  name: string
  provider: string
  whyScreen: string
  estimatedValue: string
  caveat: string
  url?: string
}

interface PropertySnapshot {
  normalizedAddress: string
  town: string
  county: string
  state: string
  facts: { label: string; value: string; evidenceType: EvidenceType; source: string }[]
}

interface AnalysisReport {
  snapshot: PropertySnapshot
  confirmed: Evidence[]
  inferred: Evidence[]
  unresolved: Evidence[]
  risks: RiskFlag[]
  actions: Action[]
  programs: Program[]
  evidenceLog: Evidence[]
  thinData: boolean
  generatedAt: string
}

// ── Address parsing ─────────────────────────────────────────

function parseAddress(raw: string): {
  street: string; town: string; county: string; state: string;
  isWaterfront: boolean; isRural: boolean;
} | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ')
  if (cleaned.length < 5) return null

  const vtMatch = cleaned.match(/,?\s*(VT|Vermont)\s*(\d{5})?$/i)
  if (!vtMatch) return null

  const withoutState = cleaned.replace(/,?\s*(VT|Vermont)\s*(\d{5})?$/i, '').trim()
  const parts = withoutState.split(',').map(s => s.trim()).filter(Boolean)

  const street = parts[0] || withoutState
  const town = parts[1] || inferTown(street)
  const county = inferCounty(town)

  const lowerFull = cleaned.toLowerCase()
  const waterfrontSignals = ['lake', 'shore', 'pond', 'river', 'beach', 'cove', 'bay', 'point', 'landing']
  const isWaterfront = waterfrontSignals.some(s => lowerFull.includes(s))
  const ruralSignals = ['route ', 'rt ', 'mountain', 'hill', 'hollow', 'ridge', 'kingdom', 'lot ']
  const isRural = ruralSignals.some(s => lowerFull.includes(s))

  return { street, town, county, state: 'VT', isWaterfront, isRural }
}

function inferTown(street: string): string {
  return 'Unknown town'
}

const TOWN_COUNTIES: Record<string, string> = {
  'burlington': 'Chittenden', 'south burlington': 'Chittenden', 'essex': 'Chittenden',
  'colchester': 'Chittenden', 'williston': 'Chittenden', 'charlotte': 'Chittenden',
  'shelburne': 'Chittenden', 'hinesburg': 'Chittenden', 'richmond': 'Chittenden',
  'stowe': 'Lamoille', 'morrisville': 'Lamoille', 'hyde park': 'Lamoille',
  'greensboro': 'Orleans', 'craftsbury': 'Orleans', 'barton': 'Orleans', 'newport': 'Orleans',
  'middlebury': 'Addison', 'vergennes': 'Addison', 'bristol': 'Addison', 'granville': 'Addison',
  'montpelier': 'Washington', 'barre': 'Washington', 'waterbury': 'Washington',
  'woodstock': 'Windsor', 'hartford': 'Windsor', 'norwich': 'Windsor',
  'bennington': 'Bennington', 'manchester': 'Bennington', 'dorset': 'Bennington',
  'brattleboro': 'Windham', 'wilmington': 'Windham', 'putney': 'Windham',
  'st. johnsbury': 'Caledonia', 'burke': 'Caledonia', 'peacham': 'Caledonia', 'lyndon': 'Caledonia',
  'rutland': 'Rutland', 'killington': 'Rutland', 'castleton': 'Rutland',
  'st. albans': 'Franklin', 'swanton': 'Franklin',
  'island pond': 'Essex', 'guildhall': 'Essex',
  'randolph': 'Orange', 'bradford': 'Orange',
  'johnson': 'Lamoille', 'wolcott': 'Lamoille',
}

function inferCounty(town: string): string {
  const key = town.toLowerCase().trim()
  return TOWN_COUNTIES[key] || 'Unknown county'
}

// ── Evidence engine ─────────────────────────────────────────

let eid = 0
function makeId(): string { return `e-${++eid}` }

function gatherEvidence(parsed: ReturnType<typeof parseAddress> & {}): {
  confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[];
} {
  eid = 0
  const confirmed: Evidence[] = []
  const inferred: Evidence[] = []
  const unresolved: Evidence[] = []

  confirmed.push({
    id: makeId(), type: 'FACT',
    statement: `Address is in ${parsed.town}, ${parsed.county} County, Vermont.`,
    source: 'Address input (parsed)',
    confidence: parsed.town === 'Unknown town' ? 'low' : 'high',
  })

  if (parsed.isWaterfront) {
    inferred.push({
      id: makeId(), type: 'INFERENCE',
      statement: 'Address contains waterfront-associated keywords (lake, shore, pond, etc). Property is likely waterfront or near water.',
      source: 'Address keyword analysis',
      confidence: 'moderate',
      verifyHow: 'Confirm via town parcel map or ANR shoreland layer.',
    })
  }

  if (parsed.isRural) {
    inferred.push({
      id: makeId(), type: 'INFERENCE',
      statement: 'Address contains rural-associated keywords (route, mountain, hill, etc). Property is likely rural with private road or limited access.',
      source: 'Address keyword analysis',
      confidence: 'moderate',
      verifyHow: 'Confirm road class via town road map. Check if Class 3 or Class 4.',
    })
  }

  confirmed.push({
    id: makeId(), type: 'REGIONAL_CONTEXT',
    statement: 'Vermont non-primary residences are taxed at the non-residential education tax rate, which is typically higher than the homestead rate.',
    source: 'Vermont Dept. of Taxes — Homestead Declaration (HS-122)',
    confidence: 'high',
  })

  confirmed.push({
    id: makeId(), type: 'REGIONAL_CONTEXT',
    statement: 'All Vermont electric ratepayers are eligible for base rebates from Efficiency Vermont on insulation, heat pumps, and appliances.',
    source: 'Efficiency Vermont program rules',
    confidence: 'high',
  })

  confirmed.push({
    id: makeId(), type: 'REGIONAL_CONTEXT',
    statement: 'Vermont requires septic systems to meet current standards for any change of use, expansion, or property transfer with a failed inspection.',
    source: 'Vermont DEC Wastewater Division',
    confidence: 'high',
  })

  confirmed.push({
    id: makeId(), type: 'REGIONAL_CONTEXT',
    statement: 'Vermont recommends annual well water testing for coliform and E. coli. Testing for arsenic, lead, and uranium is recommended every 5 years for private wells.',
    source: 'Vermont DEC Drinking Water Division',
    confidence: 'high',
  })

  if (parsed.isWaterfront) {
    confirmed.push({
      id: makeId(), type: 'REGIONAL_CONTEXT',
      statement: 'Vermont Shoreland Protection Act (2014) establishes a 250-ft protected shoreland area with restrictions on clearing, impervious surface, and new construction near lakes and ponds.',
      source: 'Vermont ANR Shoreland Protection',
      confidence: 'high',
    })
  }

  confirmed.push({
    id: makeId(), type: 'REGIONAL_CONTEXT',
    statement: 'Development exceeding Act 250 thresholds in Vermont requires state environmental permit review. Thresholds vary by town (1 acre without zoning, 10 acres with).',
    source: 'Vermont Natural Resources Board — Act 250',
    confidence: 'high',
  })

  inferred.push({
    id: makeId(), type: 'INFERENCE',
    statement: 'As a seasonal/second home in Vermont, the property is likely taxed at the non-residential education rate. Improvements may trigger reassessment.',
    source: 'Heuristic: seasonal-home + VT tax rules',
    confidence: 'high',
    verifyHow: 'Check current Homestead Declaration status with town clerk.',
  })

  inferred.push({
    id: makeId(), type: 'INFERENCE',
    statement: 'Seasonal properties in Vermont frequently rely on on-site septic and private wells. Age and condition of these systems are the dominant infrastructure constraints.',
    source: 'Heuristic: VT seasonal-home infrastructure patterns',
    confidence: 'moderate',
    verifyHow: 'Confirm septic and water source from town assessment records or property listing.',
  })

  unresolved.push({
    id: makeId(), type: 'UNRESOLVED',
    statement: 'Year built is unknown. Building age determines likely condition of foundation, wiring, plumbing, insulation, and septic system.',
    source: 'Not available from address alone',
    confidence: 'low',
    verifyHow: 'Check town grand list, assessment records, or property listing.',
  })

  unresolved.push({
    id: makeId(), type: 'UNRESOLVED',
    statement: 'Septic system type, age, and last inspection date are unknown. This is the single most consequential infrastructure unknown for a Vermont seasonal property.',
    source: 'Not available from address alone',
    confidence: 'low',
    verifyHow: 'Request septic permit records from Vermont DEC or town health officer.',
  })

  unresolved.push({
    id: makeId(), type: 'UNRESOLVED',
    statement: 'Water source and quality are unknown. Private wells are common in rural Vermont and require testing.',
    source: 'Not available from address alone',
    confidence: 'low',
    verifyHow: 'Confirm water source and request most recent test results from owner or town.',
  })

  unresolved.push({
    id: makeId(), type: 'UNRESOLVED',
    statement: 'Heating system type and adequacy are unknown. Many Vermont seasonal homes lack heating sufficient for year-round use.',
    source: 'Not available from address alone',
    confidence: 'low',
    verifyHow: 'Inspect property or check listing data for heating system details.',
  })

  unresolved.push({
    id: makeId(), type: 'UNRESOLVED',
    statement: 'Assessed value and market value are unknown. The gap between these determines reassessment risk from improvements.',
    source: 'Not available from address alone',
    confidence: 'low',
    verifyHow: 'Check town grand list for assessment; compare to recent comparable sales.',
  })

  if (parsed.isWaterfront) {
    unresolved.push({
      id: makeId(), type: 'UNRESOLVED',
      statement: 'Shoreland permit status and setback compliance are unknown. Waterfront properties face strict limits on expansion and site work.',
      source: 'Not available from address alone',
      confidence: 'low',
      verifyHow: 'Request shoreland permit history from Vermont ANR. Review town zoning setbacks.',
    })
  }

  unresolved.push({
    id: makeId(), type: 'UNRESOLVED',
    statement: 'Flood zone status is not confirmed. FEMA flood zone designation affects insurance costs, improvement restrictions, and lender requirements.',
    source: 'Not available from address alone',
    confidence: 'low',
    verifyHow: 'Check FEMA flood map at msc.fema.gov or contact town zoning administrator.',
  })

  return { confirmed, inferred, unresolved }
}

// ── Risk flags ────────────────────────────────────────────

function generateRisks(
  parsed: ReturnType<typeof parseAddress> & {},
  evidence: { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] }
): RiskFlag[] {
  const risks: RiskFlag[] = []
  const allEvidence = [...evidence.confirmed, ...evidence.inferred, ...evidence.unresolved]

  const septicEvidence = allEvidence.filter(e => e.statement.toLowerCase().includes('septic')).map(e => e.id)
  risks.push({
    title: 'Septic system status unknown',
    severity: 'high',
    category: 'Infrastructure',
    description: 'Septic age, type, and condition cannot be determined from address alone. For Vermont seasonal properties, a failing septic system is the single most common deal-breaker — it can block sale, prevent use changes, and cost $15,000–$40,000+ to replace.',
    supportingEvidence: septicEvidence,
    verifyNext: 'Request septic permit records from Vermont DEC. Ask owner for most recent pump-out and inspection records.',
  })

  const waterEvidence = allEvidence.filter(e => e.statement.toLowerCase().includes('water') || e.statement.toLowerCase().includes('well')).map(e => e.id)
  risks.push({
    title: 'Water source and quality unverified',
    severity: 'high',
    category: 'Infrastructure',
    description: 'Private wells are common in rural Vermont. Arsenic, coliform, and low flow are frequent issues. Lenders typically require satisfactory water test results for financing.',
    supportingEvidence: waterEvidence,
    verifyNext: 'Confirm whether property uses a private well or municipal water. If well, request most recent water test.',
  })

  if (parsed.isWaterfront) {
    const shorelandEvidence = allEvidence.filter(e => e.statement.toLowerCase().includes('shoreland')).map(e => e.id)
    risks.push({
      title: 'Shoreland protection may restrict improvements',
      severity: 'high',
      category: 'Regulatory',
      description: 'Waterfront address triggers likely applicability of Vermont Shoreland Protection Act. Expansion, clearing, and new impervious surfaces within 250 ft of mean water level require permits and face strict limits.',
      supportingEvidence: shorelandEvidence,
      verifyNext: 'Confirm waterfront status via parcel map. Check ANR shoreland permit history. Consult town zoning for local setback requirements.',
    })
  }

  const taxEvidence = allEvidence.filter(e => e.statement.toLowerCase().includes('tax') || e.statement.toLowerCase().includes('homestead')).map(e => e.id)
  risks.push({
    title: 'Non-homestead tax rate likely applies',
    severity: 'medium',
    category: 'Tax',
    description: 'Seasonal/second homes in Vermont are taxed at the non-residential education rate, which is typically higher. Major improvements can trigger reassessment, increasing the tax burden.',
    supportingEvidence: taxEvidence,
    verifyNext: 'Verify current Homestead Declaration (HS-122) filing with town clerk. Model tax impact before committing to large improvement scope.',
  })

  const heatingEvidence = allEvidence.filter(e => e.statement.toLowerCase().includes('heating')).map(e => e.id)
  risks.push({
    title: 'Heating adequacy unknown',
    severity: 'medium',
    category: 'Infrastructure',
    description: 'Many Vermont seasonal homes have heating systems insufficient for year-round use — ranging from woodstove-only to inadequate propane wall heaters. This limits use flexibility, rental potential, and insurability.',
    supportingEvidence: heatingEvidence,
    verifyNext: 'Inspect heating system. Determine if central heat exists, fuel type, and whether plumbing is protected from freezing.',
  })

  return risks
}

// ── Ranked actions ──────────────────────────────────────────

function generateActions(
  parsed: ReturnType<typeof parseAddress> & {},
  evidence: { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] }
): Action[] {
  const allEvidence = [...evidence.confirmed, ...evidence.inferred, ...evidence.unresolved]
  const actions: Action[] = []

  actions.push({
    title: 'Determine septic system status',
    actionType: 'Constraint investigation',
    priority: 'critical',
    costRange: '$200–$500 for records request and inspection; $15,000–$40,000+ if replacement needed',
    upside: 'Removes the single largest unknown. A functioning septic system is required for habitation and sale.',
    taxCreditNote: 'No direct credits, but a failed system blocks all other investment.',
    avoidIf: 'System was inspected and passed within last 3 years with documented results.',
    rationale: 'For Vermont seasonal properties, septic is constraint #1. Everything else — expansion, renovation, rental conversion — is gated by this.',
    supportingEvidence: allEvidence.filter(e => e.statement.toLowerCase().includes('septic')).map(e => e.id),
  })

  actions.push({
    title: 'Verify water source and test quality',
    actionType: 'Constraint investigation',
    priority: 'critical',
    costRange: '$100–$400 for testing; $2,000–$10,000+ if treatment or new well needed',
    upside: 'Confirms potability and flow rate. Required for any use change or sale with financing.',
    taxCreditNote: 'None.',
    avoidIf: 'Water tested within last 12 months with clean results on file.',
    rationale: 'Well water quality is non-negotiable for habitation. Coliform, arsenic, and flow issues are common in rural Vermont.',
    supportingEvidence: allEvidence.filter(e => e.statement.toLowerCase().includes('water') || e.statement.toLowerCase().includes('well')).map(e => e.id),
  })

  actions.push({
    title: 'Assess heating system and winterization',
    actionType: 'Constraint investigation',
    priority: 'high',
    costRange: '$0 for assessment; $3,000–$25,000 for upgrade',
    upside: 'Determines whether property can be used beyond summer. Extends usable season, reduces pipe-burst risk, may enable rental.',
    taxCreditNote: 'Heat pump installations may qualify for Efficiency Vermont rebates ($500–$2,000) and federal 25C credit (30% of cost, up to $2,000/year). Eligibility must be verified.',
    avoidIf: 'Property is intended strictly as a summer-only camp with no plumbing at risk of freezing.',
    rationale: 'Heating adequacy gates use flexibility. Without it, the property is locked into seasonal-only use.',
    supportingEvidence: allEvidence.filter(e => e.statement.toLowerCase().includes('heating') || e.statement.toLowerCase().includes('winter')).map(e => e.id),
  })

  if (parsed.isWaterfront) {
    actions.push({
      title: 'Screen any planned work through shoreland and zoning review',
      actionType: 'Regulatory screen',
      priority: 'high',
      costRange: '$500–$3,000 for survey and permit consultation',
      upside: 'Prevents costly violations and identifies what is actually buildable before investing in design.',
      taxCreditNote: 'No credits, but violations carry fines ($1,000–$27,500/day under state law) and forced remediation.',
      avoidIf: 'No expansion, clearing, or site work is planned.',
      rationale: 'Vermont shoreland protection rules gate nearly all waterfront improvements. Designing before checking is a common and expensive mistake.',
      supportingEvidence: allEvidence.filter(e => e.statement.toLowerCase().includes('shoreland')).map(e => e.id),
    })
  }

  actions.push({
    title: 'Review property tax classification and reassessment exposure',
    actionType: 'Tax screen',
    priority: 'moderate',
    costRange: '$0–$500',
    upside: 'Correct classification avoids overpayment. Modeling reassessment risk before improvements prevents tax surprises.',
    taxCreditNote: 'Homestead vs. non-residential education tax rates differ significantly. Filing errors are common.',
    avoidIf: 'Classification was verified within the last tax year.',
    rationale: 'Improvements to underassessed properties can trigger reassessment. Model the tax impact before committing to large scope.',
    supportingEvidence: allEvidence.filter(e => e.statement.toLowerCase().includes('tax') || e.statement.toLowerCase().includes('homestead') || e.statement.toLowerCase().includes('assessment')).map(e => e.id),
  })

  actions.push({
    title: 'Evaluate building envelope and roof condition',
    actionType: 'Resilience',
    priority: 'moderate',
    costRange: '$5,000–$30,000 for repair/upgrade',
    upside: 'Prevents cascading moisture damage and extends building life. Insulation improvements reduce carrying costs.',
    taxCreditNote: 'Insulation may qualify for Efficiency Vermont rebates. Must use participating contractor.',
    avoidIf: 'Roof replaced within last 15 years and envelope has been professionally assessed as sound.',
    rationale: 'A compromised envelope accelerates decay of everything inside. This is infrastructure, not aesthetics.',
    supportingEvidence: [],
  })

  actions.push({
    title: 'Screen for energy upgrade incentives',
    actionType: 'Incentive screen',
    priority: 'moderate',
    costRange: '$5,000–$20,000 net after rebates (if eligible)',
    upside: 'Reduced carrying costs and improved comfort. Rebates may offset 30–50% of cost if eligible.',
    taxCreditNote: 'Efficiency Vermont rebates, federal 25C/25D credits potentially available. Eligibility must be verified — do not underwrite savings until confirmed.',
    avoidIf: 'Infrastructure constraints (septic, water, structural) are unresolved. Fix those first.',
    rationale: 'Energy improvements have the best incentive coverage in Vermont but should not precede constraint resolution.',
    supportingEvidence: allEvidence.filter(e => e.statement.toLowerCase().includes('efficiency vermont') || e.statement.toLowerCase().includes('rebate')).map(e => e.id),
  })

  actions.push({
    title: 'Defer cosmetic and custom finishes',
    actionType: 'Avoid',
    priority: 'defer',
    costRange: 'N/A',
    upside: 'Avoids sinking capital into finishes that may be destroyed by a septic replacement, foundation repair, or re-roofing.',
    taxCreditNote: 'No tax benefit. Custom finishes rarely return cost at sale in rural Vermont markets.',
    avoidIf: 'All infrastructure, regulatory, and tax items have been resolved and verified.',
    rationale: 'Custom kitchens, exotic flooring, and designer bathrooms are the lowest-priority spend when constraints are unresolved. They also have the worst ROI for seasonal properties in small Vermont markets.',
    supportingEvidence: [],
  })

  return actions
}

// ── Programs ──────────────────────────────────────────────

function generatePrograms(parsed: ReturnType<typeof parseAddress> & {}): Program[] {
  return [
    {
      name: 'Efficiency Vermont Rebates',
      provider: 'Efficiency Vermont',
      whyScreen: 'All Vermont electric ratepayers are eligible for base rebates on insulation, heat pumps, and appliances. Income-qualified households receive enhanced incentives.',
      estimatedValue: '$500–$4,000 depending on scope and income qualification',
      caveat: 'Must use participating contractors for some rebates. Verify current program terms before planning.',
      url: 'https://www.efficiencyvermont.com/rebates',
    },
    {
      name: 'Federal 25C Clean Energy Credit',
      provider: 'IRS / Federal',
      whyScreen: 'Properties with oil, propane, or electric-resistance heating are candidates for heat pump conversion with a 30% federal tax credit.',
      estimatedValue: 'Up to $2,000/year for qualifying heat pump equipment',
      caveat: 'Second homes may qualify for some but not all 25C provisions. Consult a tax advisor before relying on this credit.',
    },
    {
      name: 'Vermont Weatherization Assistance',
      provider: 'Vermont Office of Economic Opportunity',
      whyScreen: 'Older construction typically has poor insulation. Free weatherization is available for income-eligible households; market-rate services available through Efficiency Vermont network.',
      estimatedValue: 'Free for income-eligible; otherwise $3,000–$8,000 market rate',
      caveat: 'Income eligibility required for free services. Seasonal homes may have limited eligibility.',
    },
    {
      name: 'Vermont Net Metering / Solar',
      provider: 'Vermont PUC / Green Mountain Power',
      whyScreen: 'Solar may offset electricity costs, especially if converting to electric heat pumps.',
      estimatedValue: 'Varies significantly by system size, orientation, and utility territory',
      caveat: 'Interconnection requirements apply. Community solar may be an alternative for sites with poor solar access. Do not assume savings without a site assessment.',
    },
  ]
}

// ── Main handler ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const address = body.address as string

    if (!address || address.trim().length < 5) {
      return NextResponse.json({ error: 'Please enter a valid Vermont address.' }, { status: 400 })
    }

    const parsed = parseAddress(address)
    if (!parsed) {
      return NextResponse.json({
        error: 'Address must be in Vermont (include "VT" or "Vermont"). Example: 142 Lakeshore Drive, Greensboro, VT'
      }, { status: 400 })
    }

    const evidence = gatherEvidence(parsed)
    const risks = generateRisks(parsed, evidence)
    const actions = generateActions(parsed, evidence)
    const programs = generatePrograms(parsed)
    const allEvidence = [...evidence.confirmed, ...evidence.inferred, ...evidence.unresolved]

    const snapshot: PropertySnapshot = {
      normalizedAddress: `${parsed.street}, ${parsed.town}, ${parsed.county} County, VT`,
      town: parsed.town,
      county: parsed.county,
      state: 'VT',
      facts: [
        { label: 'Town', value: parsed.town, evidenceType: parsed.town === 'Unknown town' ? 'UNRESOLVED' : 'FACT', source: 'Address input' },
        { label: 'County', value: parsed.county, evidenceType: parsed.county === 'Unknown county' ? 'UNRESOLVED' : 'INFERENCE', source: 'Town-county lookup' },
        { label: 'Likely waterfront', value: parsed.isWaterfront ? 'Yes (from address keywords)' : 'Not indicated by address', evidenceType: 'INFERENCE', source: 'Address keyword analysis' },
        { label: 'Likely rural', value: parsed.isRural ? 'Yes (from address keywords)' : 'Not indicated by address', evidenceType: 'INFERENCE', source: 'Address keyword analysis' },
        { label: 'Year built', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available from address' },
        { label: 'Septic / sewer', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available from address' },
        { label: 'Water source', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available from address' },
        { label: 'Heating type', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available from address' },
      ],
    }

    const report: AnalysisReport = {
      snapshot,
      confirmed: evidence.confirmed,
      inferred: evidence.inferred,
      unresolved: evidence.unresolved,
      risks,
      actions,
      programs,
      evidenceLog: allEvidence,
      thinData: true,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(report)
  } catch (err) {
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
