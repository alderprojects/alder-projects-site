import { NextRequest, NextResponse } from 'next/server'

type EvidenceType = 'FACT' | 'INFERENCE' | 'REGIONAL_CONTEXT' | 'UNRESOLVED'
interface Evidence { id: string; statement: string; type: EvidenceType; source: string; confidence: 'high' | 'moderate' | 'low'; verifyHow?: string }
interface RiskFlag { title: string; severity: 'high' | 'medium' | 'low'; category: string; description: string; supportingEvidence: string[]; verifyNext: string }
interface Action { title: string; actionType: string; priority: 'critical' | 'high' | 'moderate' | 'low' | 'defer'; costRange: string; upside: string; taxCreditNote: string; avoidIf: string; rationale: string; supportingEvidence: string[] }
interface Program { name: string; provider: string; whyScreen: string; estimatedValue: string; caveat: string; url?: string }
interface PropertySnapshot { normalizedAddress: string; town: string; county: string; state: string; facts: { label: string; value: string; evidenceType: EvidenceType; source: string }[] }
interface AnalysisReport { snapshot: PropertySnapshot; confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[]; risks: RiskFlag[]; actions: Action[]; programs: Program[]; evidenceLog: Evidence[]; thinData: boolean; generatedAt: string }

const TC: Record<string, string> = {
  'addison':'Addison','bridport':'Addison','bristol':'Addison','cornwall':'Addison','ferrisburgh':'Addison','goshen':'Addison','granville':'Addison','hancock':'Addison','leicester':'Addison','lincoln':'Addison','middlebury':'Addison','monkton':'Addison','new haven':'Addison','orwell':'Addison','panton':'Addison','ripton':'Addison','salisbury':'Addison','shoreham':'Addison','starksboro':'Addison','vergennes':'Addison','waltham':'Addison','weybridge':'Addison','whiting':'Addison',
  'arlington':'Bennington','bennington':'Bennington','dorset':'Bennington','glastenbury':'Bennington','landgrove':'Bennington','manchester':'Bennington','peru':'Bennington','pownal':'Bennington','readsboro':'Bennington','rupert':'Bennington','sandgate':'Bennington','searsburg':'Bennington','shaftsbury':'Bennington','stamford':'Bennington','sunderland':'Bennington','winhall':'Bennington','woodford':'Bennington',
  'barnet':'Caledonia','burke':'Caledonia','danville':'Caledonia','groton':'Caledonia','hardwick':'Caledonia','kirby':'Caledonia','lyndon':'Caledonia','lyndonville':'Caledonia','newark':'Caledonia','peacham':'Caledonia','ryegate':'Caledonia','sheffield':'Caledonia','st. johnsbury':'Caledonia','saint johnsbury':'Caledonia','st johnsbury':'Caledonia','stannard':'Caledonia','sutton':'Caledonia','walden':'Caledonia','waterford':'Caledonia','wheelock':'Caledonia',
  'bolton':'Chittenden','burlington':'Chittenden','charlotte':'Chittenden','colchester':'Chittenden','essex':'Chittenden','essex junction':'Chittenden','hinesburg':'Chittenden','huntington':'Chittenden','jericho':'Chittenden','milton':'Chittenden','richmond':'Chittenden','shelburne':'Chittenden','south burlington':'Chittenden','st. george':'Chittenden','underhill':'Chittenden','westford':'Chittenden','williston':'Chittenden','winooski':'Chittenden',
  'averill':'Essex','bloomfield':'Essex','brighton':'Essex','brunswick':'Essex','canaan':'Essex','concord':'Essex','east haven':'Essex','granby':'Essex','guildhall':'Essex','island pond':'Essex','lemington':'Essex','lunenburg':'Essex','maidstone':'Essex','norton':'Essex','victory':'Essex',
  'bakersfield':'Franklin','berkshire':'Franklin','enosburg':'Franklin','enosburg falls':'Franklin','fairfax':'Franklin','fairfield':'Franklin','fletcher':'Franklin','franklin':'Franklin','georgia':'Franklin','highgate':'Franklin','montgomery':'Franklin','richford':'Franklin','sheldon':'Franklin','st. albans':'Franklin','saint albans':'Franklin','st albans':'Franklin','swanton':'Franklin',
  'cabot':'Washington','calais':'Washington','duxbury':'Washington','east montpelier':'Washington','fayston':'Washington','marshfield':'Washington','middlesex':'Washington','montpelier':'Washington','moretown':'Washington','northfield':'Washington','plainfield':'Washington','roxbury':'Washington','waitsfield':'Washington','warren':'Washington','washington':'Washington','waterbury':'Washington','woodbury':'Washington','worcester':'Washington','barre':'Washington','berlin':'Washington',
  'belvidere':'Lamoille','cambridge':'Lamoille','eden':'Lamoille','elmore':'Lamoille','hyde park':'Lamoille','johnson':'Lamoille','morristown':'Lamoille','morrisville':'Lamoille','stowe':'Lamoille','waterville':'Lamoille','wolcott':'Lamoille',
  'barnard':'Windsor','bethel':'Windsor','bridgewater':'Windsor','cavendish':'Windsor','chester':'Windsor','hartford':'Windsor','hartland':'Windsor','ludlow':'Windsor','norwich':'Windsor','plymouth':'Windsor','pomfret':'Windsor','reading':'Windsor','rochester':'Windsor','royalton':'Windsor','sharon':'Windsor','springfield':'Windsor','stockbridge':'Windsor','weathersfield':'Windsor','west windsor':'Windsor','weston':'Windsor','windsor':'Windsor','woodstock':'Windsor','white river junction':'Windsor','quechee':'Windsor',
  'athens':'Windham','brattleboro':'Windham','brookline':'Windham','dover':'Windham','dummerston':'Windham','grafton':'Windham','guilford':'Windham','halifax':'Windham','jamaica':'Windham','londonderry':'Windham','marlboro':'Windham','newfane':'Windham','putney':'Windham','rockingham':'Windham','somerset':'Windham','stratton':'Windham','townshend':'Windham','vernon':'Windham','wardsboro':'Windham','west dover':'Windham','westminster':'Windham','whitingham':'Windham','wilmington':'Windham','windham':'Windham','bellows falls':'Windham','saxtons river':'Windham',
  'albany':'Orleans','barton':'Orleans','brownington':'Orleans','charleston':'Orleans','coventry':'Orleans','craftsbury':'Orleans','derby':'Orleans','glover':'Orleans','greensboro':'Orleans','holland':'Orleans','irasburg':'Orleans','jay':'Orleans','lowell':'Orleans','morgan':'Orleans','newport':'Orleans','troy':'Orleans','westfield':'Orleans','westmore':'Orleans',
  'brandon':'Rutland','castleton':'Rutland','chittenden':'Rutland','clarendon':'Rutland','danby':'Rutland','fair haven':'Rutland','hubbardton':'Rutland','ira':'Rutland','killington':'Rutland','mendon':'Rutland','middletown springs':'Rutland','mount holly':'Rutland','mount tabor':'Rutland','pawlet':'Rutland','pittsfield':'Rutland','pittsford':'Rutland','poultney':'Rutland','proctor':'Rutland','rutland':'Rutland','sherburne':'Rutland','shrewsbury':'Rutland','sudbury':'Rutland','tinmouth':'Rutland','wallingford':'Rutland','wells':'Rutland','west rutland':'Rutland',
  'bradford':'Orange','braintree':'Orange','brookfield':'Orange','chelsea':'Orange','corinth':'Orange','fairlee':'Orange','newbury':'Orange','orange':'Orange','randolph':'Orange','strafford':'Orange','thetford':'Orange','topsham':'Orange','tunbridge':'Orange','vershire':'Orange','west fairlee':'Orange','williamstown':'Orange',
  'alburgh':'Grand Isle','grand isle':'Grand Isle','isle la motte':'Grand Isle','north hero':'Grand Isle','south hero':'Grand Isle',
}
const TOWNS_WITH_ZONING = new Set(['burlington','south burlington','essex','colchester','williston','shelburne','charlotte','hinesburg','richmond','stowe','waterbury','montpelier','barre','middlebury','vergennes','bennington','brattleboro','rutland','st. albans','newport','hartford','norwich','woodstock','manchester','wilmington','dover','killington','ludlow','springfield','st. johnsbury','lyndon','morristown','johnson','waitsfield','warren','fayston'])
const LAKE_TOWNS: Record<string,string> = {'charlotte':'Lake Champlain','shelburne':'Lake Champlain','burlington':'Lake Champlain','colchester':'Lake Champlain','south hero':'Lake Champlain','north hero':'Lake Champlain','grand isle':'Lake Champlain','alburgh':'Lake Champlain','isle la motte':'Lake Champlain','st. albans':'Lake Champlain','swanton':'Lake Champlain','georgia':'Lake Champlain','milton':'Lake Champlain','south burlington':'Lake Champlain','greensboro':'Caspian Lake','craftsbury':'Great Hosmer Pond','barton':'Crystal Lake','glover':'Shadow Lake','westmore':'Lake Willoughby','morgan':'Seymour Lake','derby':'Lake Memphremagog','charleston':'Island Pond','holland':'Holland Pond','castleton':'Lake Bomoseen','hubbardton':'Lake Hortonia','wilmington':'Harriman Reservoir','whitingham':'Harriman Reservoir','barnard':'Silver Lake','ludlow':'Lake Rescue','groton':'Lake Groton','peacham':'Peacham Pond','danville':'Joes Pond','calais':'Mirror Lake','woodbury':'multiple lakes','elmore':'Lake Elmore','eden':'Lake Eden'}
const RESORT_TOWNS = new Set(['stowe','killington','manchester','wilmington','dover','west dover','ludlow','waitsfield','warren','jay','burke','stratton','peru','winhall','landgrove'])
const ALL_TOWNS = Object.keys(TC)

function fuzzyMatch(input: string): string | null {
  const l = input.toLowerCase().trim()
  if (TC[l]) return l
  const c = l.replace(/\s+(village|city|town|center|centre)$/i, '')
  if (TC[c]) return c
  for (const t of ALL_TOWNS) { if (l.includes(t) && t.length > 3) return t }
  for (const t of ALL_TOWNS) { if (t.startsWith(l) || l.startsWith(t)) return t }
  return null
}
interface ParsedAddress { street: string; town: string; county: string; state: string; isWaterfront: boolean; isRural: boolean; townConfidence: 'high'|'moderate'|'low'; lakeName?: string; hasZoning: boolean; isResort: boolean }
interface ParseResult { ok: boolean; parsed?: ParsedAddress; error?: string; suggestion?: string }

function normalizeAndParse(raw: string): ParseResult {
  let cleaned = raw.trim().replace(/\s+/g, ' ')
  if (cleaned.length < 3) return { ok: false, error: 'Address is too short.', suggestion: 'Try: 142 Lakeshore Drive, Greensboro, VT' }
  cleaned = cleaned.replace(/\b\d{5}(-\d{4})?\b/g, '').trim()
  const hasState = /,?\s*(VT|Vermont|V\.T\.)\s*$/i.test(cleaned)
  const ws = cleaned.replace(/,?\s*(VT|Vermont|V\.T\.)\s*$/i, '').trim()
  const parts = ws.split(',').map(s => s.trim()).filter(Boolean)
  let street = '', townRaw = ''
  if (parts.length >= 2) { street = parts[0]; townRaw = parts[1] }
  else if (parts.length === 1) {
    const words = parts[0].split(' ')
    let found: string|null = null
    for (let i = words.length-1; i >= 1; i--) { const m = fuzzyMatch(words.slice(i).join(' ')); if (m) { found = m; street = words.slice(0,i).join(' '); break } }
    if (!found) for (let i = words.length-2; i >= 1; i--) { const m = fuzzyMatch(words.slice(i,i+2).join(' ')); if (m) { found = m; street = words.slice(0,i).join(' '); break } }
    if (found) townRaw = found
    else if (!hasState) return { ok: false, error: `Could not identify a Vermont town in "${raw}".`, suggestion: 'Add a comma and town: 123 Main St, Stowe, VT' }
    else { street = parts[0]; townRaw = '' }
  }
  const matched = fuzzyMatch(townRaw)
  if (matched) {
    const proper = matched.split(' ').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ').replace(/^St\. /i,'St. ')
    const county = TC[matched]||'Unknown county'
    const lf = raw.toLowerCase()
    const isWF = ['lake','shore','pond','river','beach','cove','bay','point','landing','harbor','marina','waterfront','island'].some(s => lf.includes(s)) || !!LAKE_TOWNS[matched]
    const isR = ['route ','rt ','mountain','hill','hollow','ridge','kingdom','lot ','class 4','dirt road','gravel'].some(s => lf.includes(s))
    return { ok: true, parsed: { street: street||raw.split(',')[0]?.trim()||raw, town: proper, county, state: 'VT', isWaterfront: isWF, isRural: isR, townConfidence: 'high', lakeName: LAKE_TOWNS[matched], hasZoning: TOWNS_WITH_ZONING.has(matched), isResort: RESORT_TOWNS.has(matched) } }
  }
  if (townRaw) {
    const close = ALL_TOWNS.filter(t => t.includes(townRaw.toLowerCase().slice(0,4))||townRaw.toLowerCase().includes(t.slice(0,4))).slice(0,3)
    return { ok: false, error: `"${townRaw}" was not recognized as a Vermont town.`, suggestion: close.length > 0 ? `Did you mean: ${close.map(t => t.split(' ').map(w => w[0].toUpperCase()+w.slice(1)).join(' ')).join(', ')}?` : 'Example: 123 Main St, Stowe, VT' }
  }
  return { ok: false, error: `Could not identify a town in "${raw}".`, suggestion: 'Include a Vermont town. Example: 142 Lakeshore Drive, Greensboro, VT' }
}

let eid = 0
function mid(): string { return `e-${++eid}` }

function gatherEvidence(p: ParsedAddress): { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] } {
  eid = 0; const c: Evidence[] = [], inf: Evidence[] = [], u: Evidence[] = []
  c.push({ id: mid(), type: 'FACT', statement: `Property is located in ${p.town}, ${p.county} County, Vermont.`, source: 'Address matched to Vermont town database (250+ towns)', confidence: p.townConfidence })
  if (p.hasZoning) c.push({ id: mid(), type: 'FACT', statement: `${p.town} has adopted local zoning bylaws. Development must conform to local dimensional standards, setbacks, and use regulations.`, source: `${p.town} municipal zoning records`, confidence: 'high' })
  else c.push({ id: mid(), type: 'FACT', statement: `${p.town} may not have comprehensive zoning. Act 250 thresholds apply at 1 acre (vs 10 acres in towns with zoning).`, source: 'Vermont Act 250 jurisdiction rules', confidence: 'high' })
  if (p.lakeName) c.push({ id: mid(), type: 'FACT', statement: `${p.town} is on or near ${p.lakeName}. Properties near this water body are subject to Vermont Shoreland Protection Act.`, source: 'Vermont ANR lake/pond database', confidence: 'high' })
  if (p.isResort) inf.push({ id: mid(), type: 'INFERENCE', statement: `${p.town} is a recognized resort/ski market. Properties have higher assessed values, stronger STR demand, and more rental regulation. Market comps differ from non-resort towns.`, source: 'Vermont resort market classification', confidence: 'high', verifyHow: 'Check town STR ordinance and registration requirements.' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: `${p.county} County properties are administered by the ${p.county} County Superior Court for disputes and county tax records for assessment data.`, source: 'Vermont county administration', confidence: 'high' })
  if (p.isWaterfront) {
    inf.push({ id: mid(), type: 'INFERENCE', statement: 'Address and town context indicate likely waterfront or water-adjacent property. Shoreland protection, lake access regulations, and flood zone considerations apply.', source: 'Address keyword analysis + town lake database', confidence: 'moderate', verifyHow: 'Confirm via town parcel map or Vermont ANR shoreland layer.' })
    c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Vermont Shoreland Protection Act (2014) restricts clearing, impervious surface, and construction within 250 ft of mean water level on lakes > 10 acres.', source: 'Vermont ANR Shoreland Protection Act', confidence: 'high' })
    c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Waterfront properties may be subject to public trust doctrine preserving public access below mean water mark.', source: 'Vermont public trust doctrine', confidence: 'high' })
    inf.push({ id: mid(), type: 'INFERENCE', statement: 'Waterfront properties carry higher flood and erosion risk. FEMA flood zone designation may affect insurance and improvement restrictions.', source: 'Heuristic: VT waterfront risk', confidence: 'moderate', verifyHow: 'Check FEMA flood map at msc.fema.gov.' })
  }
  if (p.isRural) {
    inf.push({ id: mid(), type: 'INFERENCE', statement: 'Address keywords suggest rural location. Property likely depends on private road and on-site water/wastewater systems.', source: 'Address keyword analysis', confidence: 'moderate', verifyHow: 'Confirm road class via town road map. Class 4 = not winter-maintained.' })
    inf.push({ id: mid(), type: 'INFERENCE', statement: 'Rural VT properties more likely to have private wells, on-site septic, and propane/oil heating requiring owner maintenance.', source: 'Heuristic: VT rural infrastructure', confidence: 'moderate', verifyHow: 'Verify utility connections from town records.' })
  }
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Vermont non-primary residences are taxed at the non-residential education tax rate, typically higher than homestead. Distinction via annual HS-122 filing.', source: 'Vermont 32 V.S.A. § 5401', confidence: 'high' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'All Vermont electric ratepayers eligible for Efficiency Vermont rebates on insulation, heat pumps, and appliances.', source: 'Efficiency Vermont program rules (2024-2026)', confidence: 'high' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Vermont requires on-site septic to meet current rules for any change of use, expansion, or failed-inspection transfer.', source: 'Vermont DEC Environmental Protection Rules Ch. 1', confidence: 'high' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Vermont recommends annual private well testing for coliform/E. coli; 5-year testing for arsenic, lead, uranium.', source: 'Vermont DEC Drinking Water Division', confidence: 'high' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: `Act 250 environmental review applies in ${p.town} for development above ${p.hasZoning ? '10 acres' : '1 acre'} of involved land.`, source: 'Vermont 10 V.S.A. Ch. 151', confidence: 'high' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Vermont property transfers require disclosure of known defects. On-site water/wastewater systems must be disclosed under 27 V.S.A. § 261-265.', source: 'Vermont Property Disclosure statutes', confidence: 'high' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Vermont towns conduct periodic reappraisals (typically 8-12 years). Building permits for substantial improvements may trigger individual reappraisal.', source: 'Vermont Division of Property Valuation and Review', confidence: 'high' })
  c.push({ id: mid(), type: 'REGIONAL_CONTEXT', statement: 'Vermont property transfer tax: 1.1% on purchase price above $100,000 (0.5% on first $100,000).', source: 'Vermont 32 V.S.A. § 9602', confidence: 'high' })
  inf.push({ id: mid(), type: 'INFERENCE', statement: 'As a seasonal/second home, property is likely classified non-homestead. Major improvements may trigger individual reappraisal.', source: 'Heuristic: seasonal-home + VT tax rules', confidence: 'high', verifyHow: 'Check HS-122 status with town clerk.' })
  inf.push({ id: mid(), type: 'INFERENCE', statement: 'VT seasonal properties frequently rely on on-site septic and private wells. System age and condition are the dominant infrastructure constraints.', source: 'Heuristic: VT seasonal-home patterns', confidence: 'moderate', verifyHow: 'Confirm from town assessment card or listing.' })
  inf.push({ id: mid(), type: 'INFERENCE', statement: `${p.town} properties assessed by town listers. Common Level of Appraisal (CLA) determines equalization ratio for education tax.`, source: 'Heuristic: VT property tax mechanics', confidence: 'high', verifyHow: 'Check CLA at tax.vermont.gov. Below 80% or above 120% triggers equalization.' })
  const unknowns = [
    { s: 'Year built unknown. Building age determines foundation, wiring, plumbing, insulation condition, and lead paint/asbestos risk (pre-1978/1980).', v: 'Check town grand list, assessment card, or listing. Request deed history.' },
    { s: 'Septic system status unknown — type, age, design capacity, last inspection. Single most consequential infrastructure unknown for VT seasonal property.', v: 'Request septic permit/design records from Vermont DEC regional office. Ask for pump-out receipts.' },
    { s: 'Water source and quality unknown. If private well: depth, flow rate, and water quality test results are critical.', v: 'Confirm source (drilled well, dug well, spring, municipal). If private, request coliform and minerals test.' },
    { s: 'Heating system type and adequacy unknown. Fuel type, system age, distribution, and freeze protection affect usability, insurance, and costs.', v: 'Inspect property. Identify fuel type, system age, freeze protection status.' },
    { s: `Assessed value and ${p.town} CLA unknown. Gap between assessed and market value determines reassessment exposure.`, v: `Check ${p.town} grand list. Compare to recent comps.` },
    { s: 'Flood zone status not confirmed. FEMA SFHA designation affects insurance ($1,000–$5,000/year), improvement limits (substantial improvement rule), and lenders.', v: 'Check FEMA flood map (msc.fema.gov). Contact town floodplain administrator.' },
    { s: 'Electrical service capacity unknown. Older seasonal homes may have 60-100 amp service insufficient for heat pumps or EV charging.', v: 'Inspect panel. Check service amperage and wiring condition.' },
    { s: 'Insurance status unknown. Some older or remote properties face limited carrier options for seasonal/vacant coverage.', v: 'Request quote with seasonal-use disclosure. Check for vacancy exclusions.' },
  ]
  if (p.isWaterfront) {
    unknowns.push({ s: 'Shoreland permit status and setback compliance unknown. Nonconforming structures within 250 ft face strict expansion limits.', v: 'Request ANR shoreland permit history. Obtain survey showing setbacks from mean water level.' })
    unknowns.push({ s: 'Dock, mooring, and lake access rights unknown. Not all waterfront parcels have deeded access or permitted docks.', v: 'Review deed for riparian rights/easements. Check town dock permit requirements.' })
  }
  unknowns.push({ s: `Short-term rental regulation in ${p.town} unknown. Many VT towns now require registration, inspections, or limit rental frequency.`, v: `Check ${p.town} clerk or zoning admin for STR ordinance.` })
  unknowns.forEach(x => u.push({ id: mid(), type: 'UNRESOLVED', statement: x.s, source: 'Not available from address alone', confidence: 'low', verifyHow: x.v }))
  return { confirmed: c, inferred: inf, unresolved: u }
}

function generateRisks(p: ParsedAddress, ev: { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] }): RiskFlag[] {
  const all = [...ev.confirmed,...ev.inferred,...ev.unresolved]; const find = (kw: string) => all.filter(e => e.statement.toLowerCase().includes(kw)).map(e => e.id); const r: RiskFlag[] = []
  r.push({ title: 'Septic system status unknown', severity: 'high', category: 'Infrastructure', description: 'Septic age/type/condition undetermined. Failing septic blocks sale, prevents use changes, costs $15,000–$40,000+ to replace. Design flow may cap bedrooms.', supportingEvidence: find('septic'), verifyNext: 'Request septic permit/design records from Vermont DEC.' })
  r.push({ title: 'Water source and quality unverified', severity: 'high', category: 'Infrastructure', description: 'Private wells common in rural VT. Arsenic (naturally occurring in VT bedrock), coliform, low flow frequent. Lenders require test results. Treatment adds $2,000–$8,000.', supportingEvidence: find('water'), verifyNext: 'Confirm well vs municipal. Request test results.' })
  if (p.isWaterfront) {
    r.push({ title: 'Shoreland protection may restrict improvements', severity: 'high', category: 'Regulatory', description: `${p.lakeName ? p.lakeName+' — ' : ''}Shoreland Protection Act restricts clearing/impervious within 250 ft. Nonconforming structures face strict expansion limits. Violations up to $27,500/day.`, supportingEvidence: find('shoreland'), verifyNext: 'Obtain survey. Check ANR permit history. Review town overlay district.' })
    r.push({ title: 'Flood zone exposure unknown', severity: 'medium', category: 'Regulatory', description: 'Waterfront increases flood zone likelihood. FEMA SFHA triggers mandatory flood insurance for financed properties and 50% substantial improvement rule.', supportingEvidence: find('flood'), verifyNext: 'Check FEMA flood map. Request elevation certificate if needed.' })
  }
  r.push({ title: 'Non-homestead tax rate applies', severity: 'medium', category: 'Tax', description: `Seasonal homes in ${p.town} pay non-residential education rate. Improvements trigger reappraisal. CLA affects equalization.`, supportingEvidence: find('tax'), verifyNext: `Verify HS-122. Check ${p.town} CLA at tax.vermont.gov.` })
  r.push({ title: 'Heating adequacy unknown', severity: 'medium', category: 'Infrastructure', description: 'Many VT seasonal homes have insufficient heating. Limits year-round use, rental, insurability. Severe pipe freeze risk.', supportingEvidence: find('heating'), verifyNext: 'Inspect system. Check fuel type, distribution, freeze protection.' })
  r.push({ title: 'Building age and condition unknown', severity: 'medium', category: 'Infrastructure', description: 'Without year-built, foundation/wiring/insulation/hazmat status unknown. Pre-1978 = lead paint risk. Pre-1980 = asbestos risk.', supportingEvidence: find('year built'), verifyNext: 'Check assessment card for year built. Schedule inspection if pre-1980.' })
  if (p.isResort) r.push({ title: 'Short-term rental regulation', severity: 'medium', category: 'Regulatory', description: `${p.town} is a resort market where STR regulation is common. Registration, inspections, occupancy limits may apply.`, supportingEvidence: find('rental'), verifyNext: `Contact ${p.town} zoning admin for STR ordinance.` })
  return r
}

function generateActions(p: ParsedAddress, ev: { confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[] }): Action[] {
  const all = [...ev.confirmed,...ev.inferred,...ev.unresolved]; const find = (kw: string) => all.filter(e => e.statement.toLowerCase().includes(kw)).map(e => e.id); const a: Action[] = []
  a.push({ title: 'Determine septic system status', actionType: 'Constraint investigation', priority: 'critical', costRange: '$200–$500 for records/inspection; $15,000–$40,000+ if replacement', upside: 'Removes largest unknown. Functioning septic required for habitation and sale.', taxCreditNote: 'No direct credits. Failed system blocks all other investment.', avoidIf: 'System inspected and passed within last 3 years.', rationale: 'Septic is constraint #1 for VT seasonal properties. Everything else is gated by this.', supportingEvidence: find('septic') })
  a.push({ title: 'Verify water source and test quality', actionType: 'Constraint investigation', priority: 'critical', costRange: '$100–$400 for testing; $2,000–$10,000+ if treatment needed', upside: 'Confirms potability and flow. Required for use changes and financed sales.', taxCreditNote: 'None.', avoidIf: 'Water tested within last 12 months with clean results.', rationale: 'Well water quality is non-negotiable. Arsenic naturally occurs in VT bedrock.', supportingEvidence: find('water') })
  a.push({ title: 'Assess heating system and winterization', actionType: 'Constraint investigation', priority: 'high', costRange: '$0 to assess; $3,000–$25,000 for upgrade', upside: 'Determines year-round usability. Reduces pipe-burst risk. May enable rental.', taxCreditNote: 'Heat pump installs may qualify for Efficiency Vermont rebates and federal 25C. Second homes have limited 25C provisions — verify.', avoidIf: 'Strictly summer-only with no freeze-vulnerable plumbing.', rationale: 'Heating gates use flexibility. No heat = seasonal-only, limited market.', supportingEvidence: find('heating') })
  if (p.isWaterfront) a.push({ title: 'Screen planned work through shoreland/zoning review', actionType: 'Regulatory screen', priority: 'high', costRange: '$500–$3,000 for survey and permit consultation', upside: 'Prevents violations. Identifies what is actually buildable.', taxCreditNote: 'No credits. Violations up to $27,500/day and forced remediation.', avoidIf: 'No expansion, clearing, or site work planned.', rationale: 'Shoreland rules gate waterfront improvements. Design before checking = expensive mistake.', supportingEvidence: find('shoreland') })
  a.push({ title: `Obtain ${p.town} grand list entry and review tax classification`, actionType: 'Tax screen', priority: 'high', costRange: '$0–$50 for records', upside: `Confirms assessed value, acreage, classification, CLA exposure in ${p.town}. Prevents reassessment surprise.`, taxCreditNote: 'Homestead vs non-residential rates differ $0.20–$0.60 per $100 assessed.', avoidIf: 'Already reviewed within current tax year.', rationale: 'Cannot model improvement ROI without knowing current tax basis and reassessment exposure.', supportingEvidence: find('tax') })
  a.push({ title: 'Evaluate building envelope and roof', actionType: 'Resilience', priority: 'moderate', costRange: '$5,000–$30,000', upside: 'Prevents cascading moisture damage. Insulation reduces carrying costs $500–$2,000/year.', taxCreditNote: 'Insulation may qualify for Efficiency Vermont rebates ($200–$2,000) and federal 25C insulation credit.', avoidIf: 'Roof replaced within last 15 years and envelope professionally assessed.', rationale: 'Compromised envelope accelerates decay of everything inside. Infrastructure, not aesthetics.', supportingEvidence: [] })
  a.push({ title: 'Screen for energy upgrade incentives', actionType: 'Incentive screen', priority: 'moderate', costRange: '$5,000–$20,000 net after rebates (if eligible)', upside: 'Reduced carrying costs. Rebates may offset 30–50% if eligible.', taxCreditNote: 'Efficiency Vermont + federal 25C/25D. Do not underwrite savings until eligibility confirmed.', avoidIf: 'Infrastructure constraints (septic, water, structural) unresolved.', rationale: 'Energy incentives strong in VT but should not precede constraint resolution.', supportingEvidence: find('rebate') })
  a.push({ title: 'Check electrical service capacity', actionType: 'Infrastructure screen', priority: 'moderate', costRange: '$0 to inspect; $2,000–$8,000 for panel upgrade', upside: 'Ensures capacity for heat pumps, modern appliances, EV charging.', taxCreditNote: 'Panel upgrade for heat pumps may qualify for federal 25C.', avoidIf: 'Panel is 200-amp and wiring updated.', rationale: 'Many seasonal homes have outdated electrical blocking downstream improvements.', supportingEvidence: find('electrical') })
  a.push({ title: 'Defer cosmetic and custom finishes', actionType: 'Avoid', priority: 'defer', costRange: 'N/A', upside: 'Avoids capital loss when finishes destroyed by septic replacement or re-roofing.', taxCreditNote: 'No benefit. Custom finishes rarely return cost in rural VT outside resort towns.', avoidIf: 'All infrastructure and regulatory items verified and resolved.', rationale: 'Lowest-priority spend when constraints unresolved. Worst ROI for seasonal properties.', supportingEvidence: [] })
  return a
}

function generatePrograms(p: ParsedAddress): Program[] {
  return [
    { name: 'Efficiency Vermont Rebates', provider: 'Efficiency Vermont', whyScreen: 'All VT electric ratepayers eligible. Rebates on insulation ($200–$2,000), cold-climate heat pumps ($800–$2,000), HPWH ($300–$600), appliances. Enhanced for income-qualified.', estimatedValue: '$500–$4,000 depending on scope', caveat: 'Some rebates require participating contractors. Heat pump rebates require cold-climate rated equipment.', url: 'https://www.efficiencyvermont.com/rebates' },
    { name: 'Federal 25C Residential Clean Energy Credit', provider: 'IRS / Federal', whyScreen: 'Heat pump, insulation, qualifying windows/doors may be eligible for 30% credit. Heat pumps capped $2,000/year; insulation/envelope $1,200/year.', estimatedValue: 'Up to $3,200/year combined', caveat: 'Second homes have limited eligibility for some provisions. Consult tax advisor. Must be placed in service.' },
    { name: 'Vermont Weatherization Assistance', provider: 'VT Office of Economic Opportunity', whyScreen: 'Free weatherization for income-eligible. Market-rate via Efficiency Vermont contractor network.', estimatedValue: 'Free if eligible; $3,000–$8,000 market rate', caveat: 'Income thresholds apply. Seasonal homes may have limited eligibility. 6-12 month wait for free services.' },
    { name: 'Vermont Net Metering / Community Solar', provider: 'Vermont PUC / GMP / VEC', whyScreen: 'Solar offsets electricity costs especially with heat pumps. Community solar available for poor roof/site orientation.', estimatedValue: '10–15% savings on community solar; larger with on-site array', caveat: 'Net metering rates change periodically. Interconnection capacity may be limited. Get site assessment first.' },
    { name: 'Vermont Use Value Appraisal (Current Use)', provider: 'Vermont DPVR', whyScreen: `If parcel in ${p.town} includes 25+ acres of managed forest or agricultural land, enrollment may significantly reduce property tax on land portion.`, estimatedValue: 'Tax reduction of 50–90% on enrolled acreage', caveat: 'Requires active forest management plan. Land Use Change Tax (up to 20% FMV) triggered if land developed or withdrawn.' },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const address = body.address as string
    if (!address || address.trim().length < 3) return NextResponse.json({ error: 'Please enter an address.', suggestion: 'Example: 142 Lakeshore Drive, Greensboro, VT' }, { status: 400 })
    const result = normalizeAndParse(address)
    if (!result.ok || !result.parsed) return NextResponse.json({ error: result.error, suggestion: result.suggestion }, { status: 400 })
    const p = result.parsed
    const evidence = gatherEvidence(p)
    const risks = generateRisks(p, evidence)
    const actions = generateActions(p, evidence)
    const programs = generatePrograms(p)
    const allEv = [...evidence.confirmed, ...evidence.inferred, ...evidence.unresolved]
    const snapshot: PropertySnapshot = {
      normalizedAddress: `${p.street}, ${p.town}, ${p.county} County, VT`,
      town: p.town, county: p.county, state: 'VT',
      facts: [
        { label: 'Town', value: p.town, evidenceType: 'FACT', source: 'Town database match' },
        { label: 'County', value: p.county, evidenceType: 'FACT', source: 'Town-county lookup' },
        { label: 'Local zoning', value: p.hasZoning ? 'Yes — town has adopted zoning bylaws' : 'Limited — Act 250 at 1-acre threshold', evidenceType: 'FACT', source: 'VT municipal zoning records' },
        { label: 'Waterfront signals', value: p.isWaterfront ? (p.lakeName ? `Yes — near ${p.lakeName}` : 'Yes — address keywords suggest waterfront') : 'None detected', evidenceType: p.lakeName ? 'FACT' : 'INFERENCE', source: p.lakeName ? 'VT lake database' : 'Address scan' },
        { label: 'Market type', value: p.isResort ? 'Resort/ski market' : 'Standard rural/seasonal', evidenceType: 'INFERENCE', source: 'VT market classification' },
        { label: 'Year built', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available' },
        { label: 'Septic / sewer', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available' },
        { label: 'Water source', value: 'Unknown', evidenceType: 'UNRESOLVED', source: 'Not available' },
      ],
    }
    return NextResponse.json({ snapshot, confirmed: evidence.confirmed, inferred: evidence.inferred, unresolved: evidence.unresolved, risks, actions, programs, evidenceLog: allEv, thinData: false, generatedAt: new Date().toISOString() } as AnalysisReport)
  } catch { return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 }) }
}
