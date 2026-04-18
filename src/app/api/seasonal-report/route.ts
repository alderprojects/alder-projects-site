import { NextRequest, NextResponse } from 'next/server'

type EvidenceType = 'FACT' | 'INFERENCE' | 'REGIONAL_CONTEXT' | 'UNRESOLVED'
interface Evidence { id: string; statement: string; type: EvidenceType; source: string; confidence: 'high' | 'moderate' | 'low'; verifyHow?: string }
interface RiskFlag { title: string; severity: 'high' | 'medium' | 'low'; category: string; description: string; supportingEvidence: string[]; verifyNext: string }
interface Action { title: string; actionType: string; priority: 'critical' | 'high' | 'moderate' | 'low' | 'defer'; costRange: string; upside: string; taxCreditNote: string; avoidIf: string; rationale: string; supportingEvidence: string[] }
interface Program { name: string; provider: string; whyScreen: string; estimatedValue: string; caveat: string; url?: string }
interface PropertySnapshot { normalizedAddress: string; town: string; county: string; state: string; facts: { label: string; value: string; evidenceType: EvidenceType; source: string }[] }
interface AnalysisReport { snapshot: PropertySnapshot; confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[]; risks: RiskFlag[]; actions: Action[]; programs: Program[]; evidenceLog: Evidence[]; thinData: boolean; generatedAt: string }

const TOWN_COUNTIES: Record<string, string> = {
  'addison': 'Addison', 'bridport': 'Addison', 'bristol': 'Addison', 'cornwall': 'Addison',
  'ferrisburgh': 'Addison', 'goshen': 'Addison', 'granville': 'Addison', 'hancock': 'Addison',
  'leicester': 'Addison', 'lincoln': 'Addison', 'middlebury': 'Addison', 'monkton': 'Addison',
  'new haven': 'Addison', 'orwell': 'Addison', 'panton': 'Addison', 'ripton': 'Addison',
  'salisbury': 'Addison', 'shoreham': 'Addison', 'starksboro': 'Addison', 'vergennes': 'Addison',
  'waltham': 'Addison', 'weybridge': 'Addison', 'whiting': 'Addison',
  'arlington': 'Bennington', 'bennington': 'Bennington', 'dorset': 'Bennington',
  'glastenbury': 'Bennington', 'landgrove': 'Bennington', 'manchester': 'Bennington',
  'peru': 'Bennington', 'pownal': 'Bennington', 'readsboro': 'Bennington', 'rupert': 'Bennington',
  'sandgate': 'Bennington', 'searsburg': 'Bennington', 'shaftsbury': 'Bennington',
  'stamford': 'Bennington', 'sunderland': 'Bennington', 'winhall': 'Bennington', 'woodford': 'Bennington',
  'barnet': 'Caledonia', 'burke': 'Caledonia', 'danville': 'Caledonia', 'groton': 'Caledonia',
  'hardwick': 'Caledonia', 'kirby': 'Caledonia', 'lyndon': 'Caledonia', 'lyndonville': 'Caledonia',
  'newark': 'Caledonia', 'peacham': 'Caledonia', 'ryegate': 'Caledonia',
  'sheffield': 'Caledonia', 'st. johnsbury': 'Caledonia', 'saint johnsbury': 'Caledonia',
  'st johnsbury': 'Caledonia', 'stannard': 'Caledonia', 'sutton': 'Caledonia',
  'walden': 'Caledonia', 'waterford': 'Caledonia', 'wheelock': 'Caledonia',
  'bolton': 'Chittenden', 'burlington': 'Chittenden', 'charlotte': 'Chittenden',
  'colchester': 'Chittenden', 'essex': 'Chittenden', 'essex junction': 'Chittenden',
  'hinesburg': 'Chittenden', 'huntington': 'Chittenden', 'jericho': 'Chittenden',
  'milton': 'Chittenden', 'richmond': 'Chittenden', 'shelburne': 'Chittenden',
  'south burlington': 'Chittenden', 'st. george': 'Chittenden', 'underhill': 'Chittenden',
  'westford': 'Chittenden', 'williston': 'Chittenden', 'winooski': 'Chittenden',
  'averill': 'Essex', 'bloomfield': 'Essex', 'brighton': 'Essex', 'brunswick': 'Essex',
  'canaan': 'Essex', 'concord': 'Essex', 'east haven': 'Essex', 'granby': 'Essex',
  'guildhall': 'Essex', 'island pond': 'Essex', 'lemington': 'Essex', 'lunenburg': 'Essex',
  'maidstone': 'Essex', 'norton': 'Essex', 'victory': 'Essex',
  'bakersfield': 'Franklin', 'berkshire': 'Franklin', 'enosburg': 'Franklin',
  'enosburg falls': 'Franklin', 'fairfax': 'Franklin', 'fairfield': 'Franklin',
  'fletcher': 'Franklin', 'franklin': 'Franklin', 'georgia': 'Franklin',
  'highgate': 'Franklin', 'montgomery': 'Franklin', 'richford': 'Franklin',
  'sheldon': 'Franklin', 'st. albans': 'Franklin', 'saint albans': 'Franklin',
  'st albans': 'Franklin', 'swanton': 'Franklin',
  'cabot': 'Washington', 'calais': 'Washington', 'duxbury': 'Washington',
  'east montpelier': 'Washington', 'fayston': 'Washington', 'marshfield': 'Washington',
  'middlesex': 'Washington', 'montpelier': 'Washington', 'moretown': 'Washington',
  'northfield': 'Washington', 'plainfield': 'Washington', 'roxbury': 'Washington',
  'waitsfield': 'Washington', 'warren': 'Washington', 'washington': 'Washington',
  'waterbury': 'Washington', 'woodbury': 'Washington', 'worcester': 'Washington',
  'barre': 'Washington', 'berlin': 'Washington',
  'belvidere': 'Lamoille', 'cambridge': 'Lamoille', 'eden': 'Lamoille',
  'elmore': 'Lamoille', 'hyde park': 'Lamoille', 'johnson': 'Lamoille',
  'morristown': 'Lamoille', 'morrisville': 'Lamoille', 'stowe': 'Lamoille',
  'waterville': 'Lamoille', 'wolcott': 'Lamoille',
  'barnard': 'Windsor', 'bethel': 'Windsor', 'bridgewater': 'Windsor', 'cavendish': 'Windsor',
  'chester': 'Windsor', 'hartford': 'Windsor', 'hartland': 'Windsor', 'ludlow': 'Windsor',
  'norwich': 'Windsor', 'plymouth': 'Windsor', 'pomfret': 'Windsor', 'reading': 'Windsor',
  'rochester': 'Windsor', 'royalton': 'Windsor', 'sharon': 'Windsor',
  'springfield': 'Windsor', 'stockbridge': 'Windsor', 'weathersfield': 'Windsor',
  'west windsor': 'Windsor', 'weston': 'Windsor', 'windsor': 'Windsor', 'woodstock': 'Windsor',
  'white river junction': 'Windsor', 'quechee': 'Windsor',
  'athens': 'Windham', 'brattleboro': 'Windham', 'brookline': 'Windham',
  'dover': 'Windham', 'dummerston': 'Windham', 'grafton': 'Windham',
  'guilford': 'Windham', 'halifax': 'Windham', 'jamaica': 'Windham',
  'londonderry': 'Windham', 'marlboro': 'Windham', 'newfane': 'Windham',
  'putney': 'Windham', 'rockingham': 'Windham', 'somerset': 'Windham',
  'stratton': 'Windham', 'townshend': 'Windham', 'vernon': 'Windham',
  'wardsboro': 'Windham', 'west dover': 'Windham', 'westminster': 'Windham',
  'whitingham': 'Windham', 'wilmington': 'Windham', 'windham': 'Windham',
  'bellows falls': 'Windham', 'saxtons river': 'Windham',
  'albany': 'Orleans', 'barton': 'Orleans', 'brownington': 'Orleans',
  'charleston': 'Orleans', 'coventry': 'Orleans', 'craftsbury': 'Orleans',
  'derby': 'Orleans', 'glover': 'Orleans', 'greensboro': 'Orleans',
  'holland': 'Orleans', 'irasburg': 'Orleans', 'jay': 'Orleans',
  'lowell': 'Orleans', 'morgan': 'Orleans', 'newport': 'Orleans',
  'troy': 'Orleans', 'westfield': 'Orleans', 'westmore': 'Orleans',
  'brandon': 'Rutland', 'castleton': 'Rutland', 'chittenden': 'Rutland',
  'clarendon': 'Rutland', 'danby': 'Rutland', 'fair haven': 'Rutland',
  'hubbardton': 'Rutland', 'ira': 'Rutland', 'killington': 'Rutland',
  'mendon': 'Rutland', 'middletown springs': 'Rutland', 'mount holly': 'Rutland',
  'mount tabor': 'Rutland', 'pawlet': 'Rutland', 'pittsfield': 'Rutland',
  'pittsford': 'Rutland', 'poultney': 'Rutland', 'proctor': 'Rutland',
  'rutland': 'Rutland', 'sherburne': 'Rutland', 'shrewsbury': 'Rutland',
  'sudbury': 'Rutland', 'tinmouth': 'Rutland', 'wallingford': 'Rutland',
  'wells': 'Rutland', 'west rutland': 'Rutland',
  'bradford': 'Orange', 'braintree': 'Orange', 'brookfield': 'Orange',
  'chelsea': 'Orange', 'corinth': 'Orange', 'fairlee': 'Orange',
  'newbury': 'Orange', 'orange': 'Orange', 'randolph': 'Orange',
  'strafford': 'Orange', 'thetford': 'Orange', 'topsham': 'Orange',
  'tunbridge': 'Orange', 'vershire': 'Orange',
  'west fairlee': 'Orange', 'williamstown': 'Orange',
  'alburgh': 'Grand Isle', 'grand isle': 'Grand Isle', 'isle la motte': 'Grand Isle',
  'north hero': 'Grand Isle', 'south hero': 'Grand Isle',
}

const ALL_TOWNS = Object.keys(TOWN_COUNTIES)

function fuzzyMatchTown(input: string): string | null {
  const lower = input.toLowerCase().trim()
  if (TOWN_COUNTIES[lower]) return lower
  const cleaned = lower.replace(/\s+(village|city|town|center|centre)$/i, '')
  if (TOWN_COUNTIES[cleaned]) return cleaned
  for (const town of ALL_TOWNS) {
    if (lower.includes(town) && town.length > 3) return town
  }
  for (const town of ALL_TOWNS) {
    if (town.startsWith(lower) || lower.startsWith(town)) return town
  }
  return null
}

interface ParsedAddress { street: string; town: string; county: string; state: string; isWaterfront: boolean; isRural: boolean; townConfidence: 'high' | 'moderate' | 'low' }
interface ParseResult { ok: boolean; parsed?: ParsedAddress; error?: string; suggestion?: string }

function normalizeAndParse(raw: string): ParseResult {
  let cleaned = raw.trim().replace(/\s+/g, ' ')
  if (cleaned.length < 3) return { ok: false, error: 'Address is too short.', suggestion: 'Try: 142 Lakeshore Drive, Greensboro, VT' }
  cleaned = cleaned.replace(/\b\d{5}(-\d{4})?\b/g, '').trim()
  const hasState = /,?\s*(VT|Vermont|V\.T\.)\s*$/i.test(cleaned)
  const withoutState = cleaned.replace(/,?\s*(VT|Vermont|V\.T\.)\s*$/i, '').trim()
  const parts = withoutState.split(',').map(s => s.trim()).filter(Boolean)
  let street = '', townRaw = '', townConfidence: 'high' | 'moderate' | 'low' = 'low'

  if (parts.length >= 2) {
    street = parts[0]
    townRaw = parts[1]
  } else if (parts.length === 1) {
    const words = parts[0].split(' ')
    let foundTown: string | null = null
    for (let i = words.length - 1; i >= 1; i--) {
      const match = fuzzyMatchTown(words.slice(i).join(' '))
      if (match) { foundTown = match; street = words.slice(0, i).join(' '); break }
    }
    if (!foundTown) {
      for (let i = words.length - 2; i >= 1; i--) {
        const match = fuzzyMatchTown(words.slice(i, i + 2).join(' '))
        if (match) { foundTown = match; street = words.slice(0, i).join(' '); break }
      }
    }
    if (foundTown) { townRaw = foundTown }
    else if (!hasState) { return { ok: false, error: `Could not identify a Vermont town in "${raw}".`, suggestion: 'Add a comma and town name, like: 123 Main St, Stowe, VT' } }
    else { street = parts[0]; townRaw = '' }
  }

  const matchedTown = fuzzyMatchTown(townRaw)
  if (matchedTown) {
    const properTown = matchedTown.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    const county = TOWN_COUNTIES[matchedTown] || 'Unknown county'
    townConfidence = county ? 'high' : 'moderate'
    const lf = raw.toLowerCase()
    const isWaterfront = ['lake','shore','pond','river','beach','cove','bay','point','landing','harbor','marina','waterfront'].some(s => lf.includes(s))
    const isRural = ['route ','rt ','mountain','hill','hollow','ridge','kingdom','lot ','class 4','dirt road','gravel'].some(s => lf.includes(s))
    return { ok: true, parsed: { street: street || raw.split(',')[0]?.trim() || raw, town: properTown, county, state: 'VT', isWaterfront, isRural, townConfidence } }
  }

  if (townRaw) {
    const close = ALL_TOWNS.filter(t => t.includes(townRaw.toLowerCase().slice(0, 4)) || townRaw.toLowerCase().includes(t.slice(0, 4))).slice(0, 3)
    const suggestion = close.length > 0 ? `Did you mean: ${close.map(t => t.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')).join(', ')}?` : 'Make sure the town is in Vermont. Example: 123 Main St, Stowe, VT'
    return { ok: false, error: `"${townRaw}" was not recognized as a Vermont town.`, suggestion }
  }
  return { ok: false, error: `Could not identify a town in "${raw}".`, suggestion: 'Include a Vermont town. Example: 142 Lakeshore Drive, Greensboro, VT' }
}

let eid = 0
function makeId(): string { return `e-${++eid}` }

function gatherEvidence(p: ParsedAddress): { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] } {
  eid = 0
  const confirmed: Evidence[] = [], inferred: Evidence[] = [], unresolved: Evidence[] = []
  confirmed.push({ id: makeId(), type: 'FACT', statement: `Property is in ${p.town}, ${p.county} County, Vermont.`, source: 'Address input — town matched to VT database', confidence: p.townConfidence })
  if (p.isWaterfront) inferred.push({ id: makeId(), type: 'INFERENCE', statement: 'Address contains waterfront keywords. Property is likely on or near water.', source: 'Address keyword analysis', confidence: 'moderate', verifyHow: 'Confirm via town parcel map or ANR shoreland layer.' })
  if (p.isRural) inferred.push({ id: makeId(), type: 'INFERENCE', statement: 'Address contains rural keywords. Property likely has private road or limited access.', source: 'Address keyword analysis', confidence: 'moderate', verifyHow: 'Confirm road class via town road map.' })
  confirmed.push({ id: makeId(), type: 'REGIONAL_CONTEXT', statement: 'Vermont non-primary residences are taxed at the non-residential education tax rate, typically higher than the homestead rate.', source: 'Vermont Dept. of Taxes — HS-122', confidence: 'high' })
  confirmed.push({ id: makeId(), type: 'REGIONAL_CONTEXT', statement: 'All Vermont electric ratepayers are eligible for Efficiency Vermont rebates on insulation, heat pumps, and appliances.', source: 'Efficiency Vermont program rules', confidence: 'high' })
  confirmed.push({ id: makeId(), type: 'REGIONAL_CONTEXT', statement: 'Vermont requires septic systems to meet current standards for any change of use, expansion, or failed-inspection transfer.', source: 'Vermont DEC Wastewater Division', confidence: 'high' })
  confirmed.push({ id: makeId(), type: 'REGIONAL_CONTEXT', statement: 'Vermont recommends annual well testing for coliform/E. coli and 5-year testing for arsenic, lead, uranium.', source: 'Vermont DEC Drinking Water Division', confidence: 'high' })
  if (p.isWaterfront) confirmed.push({ id: makeId(), type: 'REGIONAL_CONTEXT', statement: 'Vermont Shoreland Protection Act (2014) restricts clearing, impervious surface, and construction within 250 ft of lakes/ponds.', source: 'Vermont ANR Shoreland Protection', confidence: 'high' })
  confirmed.push({ id: makeId(), type: 'REGIONAL_CONTEXT', statement: `Development in ${p.town} exceeding Act 250 thresholds requires state environmental permit review.`, source: 'Vermont NRB — Act 250', confidence: 'high' })
  inferred.push({ id: makeId(), type: 'INFERENCE', statement: 'As a seasonal/second home, the property is likely taxed at the non-residential education rate. Improvements may trigger reassessment.', source: 'Heuristic: seasonal-home + VT tax rules', confidence: 'high', verifyHow: 'Check HS-122 status with town clerk.' })
  inferred.push({ id: makeId(), type: 'INFERENCE', statement: 'VT seasonal properties frequently rely on on-site septic and private wells. System age and condition are the dominant infrastructure constraints.', source: 'Heuristic: VT seasonal-home patterns', confidence: 'moderate', verifyHow: 'Confirm septic and water source from town records.' })
  const unknowns = [
    { s: 'Year built is unknown. Building age determines condition of foundation, wiring, plumbing, insulation, and septic.', v: 'Check town grand list or property listing.' },
    { s: 'Septic system status unknown — type, age, last inspection. Single most consequential infrastructure unknown for VT seasonal property.', v: 'Request septic permit records from Vermont DEC or town health officer.' },
    { s: 'Water source and quality unknown. Private wells are common in rural VT and require testing.', v: 'Confirm source. If well, request most recent water test.' },
    { s: 'Heating system type and adequacy unknown. Many VT seasonal homes lack year-round heating.', v: 'Inspect property or check listing for heating details.' },
    { s: 'Assessed and market value unknown. The gap determines reassessment risk from improvements.', v: 'Check town grand list; compare to recent comparable sales.' },
    { s: 'Flood zone status not confirmed. FEMA designation affects insurance, improvement limits, lender requirements.', v: 'Check FEMA flood map (msc.fema.gov) or contact town zoning.' },
  ]
  if (p.isWaterfront) unknowns.push({ s: 'Shoreland permit status and setback compliance unknown. Waterfront properties face strict expansion limits.', v: 'Request shoreland permit history from Vermont ANR.' })
  unknowns.forEach(u => unresolved.push({ id: makeId(), type: 'UNRESOLVED', statement: u.s, source: 'Not available from address alone', confidence: 'low', verifyHow: u.v }))
  return { confirmed, inferred, unresolved }
}

function generateRisks(p: ParsedAddress, ev: { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] }): RiskFlag[] {
  const all = [...ev.confirmed, ...ev.inferred, ...ev.unresolved]
  const find = (kw: string) => all.filter(e => e.statement.toLowerCase().includes(kw)).map(e => e.id)
  const risks: RiskFlag[] = []
  risks.push({ title: 'Septic system status unknown', severity: 'high', category: 'Infrastructure', description: 'Septic age, type, and condition cannot be determined from address alone. A failing septic is the most common deal-breaker for VT seasonal properties — blocks sale, prevents use changes, costs $15,000–$40,000+ to replace.', supportingEvidence: find('septic'), verifyNext: 'Request septic permit records from Vermont DEC. Ask owner for pump-out and inspection records.' })
  risks.push({ title: 'Water source and quality unverified', severity: 'high', category: 'Infrastructure', description: 'Private wells are common in rural VT. Arsenic, coliform, and low flow are frequent. Lenders require satisfactory test results.', supportingEvidence: find('water'), verifyNext: 'Confirm well vs. municipal water. If well, request test results.' })
  if (p.isWaterfront) risks.push({ title: 'Shoreland protection may restrict improvements', severity: 'high', category: 'Regulatory', description: 'Waterfront address suggests VT Shoreland Protection Act may apply. Expansion, clearing, impervious surfaces within 250 ft require permits.', supportingEvidence: find('shoreland'), verifyNext: 'Confirm waterfront status. Check ANR permit history. Review town setbacks.' })
  risks.push({ title: 'Non-homestead tax rate likely applies', severity: 'medium', category: 'Tax', description: 'Seasonal homes pay the non-residential education tax rate, typically higher. Improvements can trigger reassessment.', supportingEvidence: find('tax'), verifyNext: 'Verify HS-122 status. Model tax impact before large improvements.' })
  risks.push({ title: 'Heating adequacy unknown', severity: 'medium', category: 'Infrastructure', description: 'Many VT seasonal homes have insufficient heating. This limits use, rental potential, and insurability.', supportingEvidence: find('heating'), verifyNext: 'Inspect heating system. Check fuel type and freeze protection.' })
  return risks
}

function generateActions(p: ParsedAddress, ev: { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] }): Action[] {
  const all = [...ev.confirmed, ...ev.inferred, ...ev.unresolved]
  const find = (kw: string) => all.filter(e => e.statement.toLowerCase().includes(kw)).map(e => e.id)
  const actions: Action[] = []
  actions.push({ title: 'Determine septic system status', actionType: 'Constraint investigation', priority: 'critical', costRange: '$200–$500 for records/inspection; $15,000–$40,000+ if replacement needed', upside: 'Removes the largest unknown. Functioning septic required for habitation and sale.', taxCreditNote: 'No direct credits, but failed system blocks all other investment.', avoidIf: 'System inspected and passed within last 3 years.', rationale: 'Septic is constraint #1 for VT seasonal properties. Everything else is gated by this.', supportingEvidence: find('septic') })
  actions.push({ title: 'Verify water source and test quality', actionType: 'Constraint investigation', priority: 'critical', costRange: '$100–$400 for testing; $2,000–$10,000+ if treatment needed', upside: 'Confirms potability and flow. Required for use changes and financed sales.', taxCreditNote: 'None.', avoidIf: 'Water tested within last 12 months with clean results.', rationale: 'Well water quality is non-negotiable. Coliform, arsenic, flow problems common in rural VT.', supportingEvidence: find('water') })
  actions.push({ title: 'Assess heating system and winterization', actionType: 'Constraint investigation', priority: 'high', costRange: '$0 to assess; $3,000–$25,000 for upgrade', upside: 'Determines year-round usability. Reduces pipe-burst risk. May enable rental.', taxCreditNote: 'Heat pump installs may qualify for Efficiency Vermont rebates and federal 25C credit. Verify eligibility.', avoidIf: 'Strictly summer-only with no freeze-vulnerable plumbing.', rationale: 'Heating adequacy gates use flexibility. No heat = seasonal-only.', supportingEvidence: find('heating') })
  if (p.isWaterfront) actions.push({ title: 'Screen planned work through shoreland/zoning review', actionType: 'Regulatory screen', priority: 'high', costRange: '$500–$3,000 for survey and permit consultation', upside: 'Prevents violations. Identifies what is buildable.', taxCreditNote: 'No credits. Violations carry fines and forced remediation.', avoidIf: 'No expansion or site work planned.', rationale: 'Shoreland rules gate waterfront improvements. Design before checking = expensive mistake.', supportingEvidence: find('shoreland') })
  actions.push({ title: 'Review tax classification and reassessment exposure', actionType: 'Tax screen', priority: 'moderate', costRange: '$0–$500', upside: 'Avoids overpayment and surprise reassessment.', taxCreditNote: 'Homestead vs. non-residential rates differ significantly.', avoidIf: 'Classification verified within last tax year.', rationale: 'Improvements to underassessed properties trigger reassessment. Model tax impact first.', supportingEvidence: find('tax') })
  actions.push({ title: 'Evaluate building envelope and roof', actionType: 'Resilience', priority: 'moderate', costRange: '$5,000–$30,000', upside: 'Prevents cascading moisture damage. Insulation reduces carrying costs.', taxCreditNote: 'Insulation may qualify for Efficiency Vermont rebates.', avoidIf: 'Roof replaced recently and envelope professionally assessed.', rationale: 'Compromised envelope accelerates decay of everything inside.', supportingEvidence: [] })
  actions.push({ title: 'Screen for energy upgrade incentives', actionType: 'Incentive screen', priority: 'moderate', costRange: '$5,000–$20,000 net after rebates (if eligible)', upside: 'Reduced carrying costs. Rebates may offset 30–50% if eligible.', taxCreditNote: 'Efficiency Vermont and federal credits available. Do not underwrite savings until confirmed.', avoidIf: 'Infrastructure constraints unresolved.', rationale: 'Energy incentives strong in VT but should not precede constraint resolution.', supportingEvidence: find('rebate') })
  actions.push({ title: 'Defer cosmetic and custom finishes', actionType: 'Avoid', priority: 'defer', costRange: 'N/A', upside: 'Avoids capital loss from finishes destroyed by septic replacement or re-roofing.', taxCreditNote: 'No benefit. Custom finishes rarely return cost in rural VT.', avoidIf: 'All infrastructure and regulatory items resolved.', rationale: 'Lowest-priority spend when constraints unresolved. Worst ROI for seasonal properties.', supportingEvidence: [] })
  return actions
}

function generatePrograms(): Program[] {
  return [
    { name: 'Efficiency Vermont Rebates', provider: 'Efficiency Vermont', whyScreen: 'All VT electric ratepayers eligible for rebates on insulation, heat pumps, appliances. Enhanced for income-qualified.', estimatedValue: '$500–$4,000 depending on scope', caveat: 'Some rebates require participating contractors. Verify current terms.', url: 'https://www.efficiencyvermont.com/rebates' },
    { name: 'Federal 25C Clean Energy Credit', provider: 'IRS / Federal', whyScreen: 'Heat pump conversion may qualify for 30% federal tax credit.', estimatedValue: 'Up to $2,000/year', caveat: 'Second homes have limited 25C eligibility. Consult tax advisor.' },
    { name: 'Vermont Weatherization Assistance', provider: 'VT Office of Economic Opportunity', whyScreen: 'Free weatherization for income-eligible. Market-rate via Efficiency Vermont network.', estimatedValue: 'Free if eligible; $3,000–$8,000 market rate', caveat: 'Income eligibility required. Seasonal homes may have limited eligibility.' },
    { name: 'Vermont Net Metering / Solar', provider: 'Vermont PUC / Green Mountain Power', whyScreen: 'Solar offsets electricity costs, especially with heat pumps.', estimatedValue: 'Varies by system and utility territory', caveat: 'Do not assume savings without site assessment. Community solar may work for poor-access sites.' },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const address = body.address as string
    if (!address || address.trim().length < 3) return NextResponse.json({ error: 'Please enter an address.', suggestion: 'Example: 142 Lakeshore Drive, Greensboro, VT' }, { status: 400 })
    const result = normalizeAndParse(address)
    if (!result.ok || !result.parsed) return NextResponse.json({ error: result.error, suggestion: result.suggestion }, { status: 400 })
    const parsed = result.parsed
    const evidence = gatherEvidence(parsed)
    const risks = generateRisks(parsed, evidence)
    const actions = generateActions(parsed, evidence)
    const programs = generatePrograms()
    const allEvidence = [...evidence.confirmed, ...evidence.inferred, ...evidence.unresolved]
    const snapshot: PropertySnapshot = {
      normalizedAddress: `${parsed.street}, ${parsed.town}, ${parsed.county} County, VT`,
      town: parsed.town, county: parsed.county, state: 'VT',
      facts: [
        { label: 'Town', value: parsed.town, evidenceType: parsed.townConfidence === 'high' ? 'FACT' : 'INFERENCE', source: 'Town database match' },
        { label: 'County', value: parsed.county || 'Unknown', evidenceType: parsed.county ? 'FACT' : 'UNRESOLVED', source: 'Town-county lookup' },
        { label: 'Waterfront signals', value: parsed.isWaterfront ? 'Yes — address keywords suggest waterfront' : 'None detected', evidenceType: 'INFERENCE', source: 'Address keyword scan' },
        { label: 'Rural signals', value: parsed.isRural ? 'Yes — address keywords suggest rural' : 'None detected', evidenceType: 'INFERENCE', source: 'Address keyword scan' },
        { label: 'Year built', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available' },
        { label: 'Septic / sewer', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available' },
        { label: 'Water source', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available' },
        { label: 'Heating type', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available' },
      ],
    }
    const report: AnalysisReport = { snapshot, confirmed: evidence.confirmed, inferred: evidence.inferred, unresolved: evidence.unresolved, risks, actions, programs, evidenceLog: allEvidence, thinData: true, generatedAt: new Date().toISOString() }
    return NextResponse.json(report)
  } catch { return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 }) }
}
