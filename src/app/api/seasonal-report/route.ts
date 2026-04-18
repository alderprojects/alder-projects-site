import { NextRequest, NextResponse } from 'next/server'

interface Problem { constraint: string; soWhat: string; whenItMatters: string }
interface ActionItem { title: string; priority: string; soWhat: string; whyItMatters: string; whenToDo: string; watchFor: string; nextStep: string }
interface Avoidance { action: string; why: string }
interface SeasonalItem { action: string; consequence: string; timing: string }
interface ProgramScreen { name: string; provider: string; whyScreen: string; value: string; caveat: string; url?: string }
interface SnapshotFact { label: string; value: string; basis: string }
interface Report { summary: string; snapshot: { address: string; town: string; county: string; facts: SnapshotFact[] }; problems: Problem[]; actions: ActionItem[]; avoidances: Avoidance[]; seasonal: SeasonalItem[]; reasoning: string; programs: ProgramScreen[]; generatedAt: string }

const TC: Record<string,string> = {
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
const LAKE_TOWNS: Record<string,string> = {'charlotte':'Lake Champlain','shelburne':'Lake Champlain','burlington':'Lake Champlain','colchester':'Lake Champlain','south hero':'Lake Champlain','north hero':'Lake Champlain','grand isle':'Lake Champlain','alburgh':'Lake Champlain','isle la motte':'Lake Champlain','st. albans':'Lake Champlain','swanton':'Lake Champlain','georgia':'Lake Champlain','milton':'Lake Champlain','greensboro':'Caspian Lake','craftsbury':'Great Hosmer Pond','barton':'Crystal Lake','glover':'Shadow Lake','westmore':'Lake Willoughby','morgan':'Seymour Lake','derby':'Lake Memphremagog','charleston':'Island Pond','castleton':'Lake Bomoseen','hubbardton':'Lake Hortonia','wilmington':'Harriman Reservoir','whitingham':'Harriman Reservoir','barnard':'Silver Lake','ludlow':'Lake Rescue','groton':'Lake Groton','peacham':'Peacham Pond','danville':'Joes Pond','calais':'Mirror Lake','woodbury':'multiple lakes','elmore':'Lake Elmore','eden':'Lake Eden'}
const ZONED = new Set(['burlington','south burlington','essex','colchester','williston','shelburne','charlotte','hinesburg','richmond','stowe','waterbury','montpelier','barre','middlebury','vergennes','bennington','brattleboro','rutland','st. albans','newport','hartford','norwich','woodstock','manchester','wilmington','dover','killington','ludlow','springfield','st. johnsbury','lyndon','morristown','johnson','waitsfield','warren','fayston'])
const RESORT = new Set(['stowe','killington','manchester','wilmington','dover','west dover','ludlow','waitsfield','warren','jay','burke','stratton','peru','winhall','landgrove'])
const ALL_TOWNS = Object.keys(TC)

function fuzzyMatch(input: string): string|null {
  const l = input.toLowerCase().trim(); if (TC[l]) return l
  const c = l.replace(/\s+(village|city|town|center|centre)$/i,''); if (TC[c]) return c
  for (const t of ALL_TOWNS) { if (l.includes(t)&&t.length>3) return t }
  for (const t of ALL_TOWNS) { if (t.startsWith(l)||l.startsWith(t)) return t }
  return null
}
interface Parsed { street:string; town:string; county:string; isWaterfront:boolean; isRural:boolean; lakeName?:string; hasZoning:boolean; isResort:boolean }
interface ParseResult { ok:boolean; parsed?:Parsed; error?:string; suggestion?:string }

function parse(raw: string): ParseResult {
  let cleaned = raw.trim().replace(/\s+/g,' ').replace(/\b\d{5}(-\d{4})?\b/g,'').trim()
  if (cleaned.length<3) return {ok:false,error:'Address is too short.',suggestion:'Try: 142 Lakeshore Drive, Greensboro, VT'}
  const ws = cleaned.replace(/,?\s*(VT|Vermont|V\.T\.)\s*$/i,'').trim()
  const hasState = ws !== cleaned
  const parts = ws.split(',').map(s=>s.trim()).filter(Boolean)
  let street='',townRaw=''
  if (parts.length>=2){street=parts[0];townRaw=parts[1]}
  else {
    const words = parts[0]?.split(' ')||[]; let found:string|null=null
    for (let i=words.length-1;i>=1;i--){const m=fuzzyMatch(words.slice(i).join(' '));if(m){found=m;street=words.slice(0,i).join(' ');break}}
    if (!found) for (let i=words.length-2;i>=1;i--){const m=fuzzyMatch(words.slice(i,i+2).join(' '));if(m){found=m;street=words.slice(0,i).join(' ');break}}
    if (found) townRaw=found; else if (!hasState) return {ok:false,error:`Could not identify a Vermont town in "${raw}".`,suggestion:'Add comma and town: 123 Main St, Stowe, VT'}
    else {street=parts[0]||'';townRaw=''}
  }
  const matched = fuzzyMatch(townRaw)
  if (matched) {
    const proper=matched.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ').replace(/^St\. /i,'St. ')
    const lf=raw.toLowerCase()
    const isWF=['lake','shore','pond','river','beach','cove','bay','point','landing','harbor','marina','waterfront','island'].some(s=>lf.includes(s))||!!LAKE_TOWNS[matched]
    const isR=['route ','rt ','mountain','hill','hollow','ridge','kingdom','lot ','class 4','dirt road','gravel'].some(s=>lf.includes(s))
    return {ok:true,parsed:{street:street||raw.split(',')[0]?.trim()||raw,town:proper,county:TC[matched]||'Unknown',isWaterfront:isWF,isRural:isR,lakeName:LAKE_TOWNS[matched],hasZoning:ZONED.has(matched),isResort:RESORT.has(matched)}}
  }
  if (townRaw) {
    const close=ALL_TOWNS.filter(t=>t.includes(townRaw.toLowerCase().slice(0,4))||townRaw.toLowerCase().includes(t.slice(0,4))).slice(0,3)
    return {ok:false,error:`"${townRaw}" not recognized as a Vermont town.`,suggestion:close.length?`Did you mean: ${close.map(t=>t.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')).join(', ')}?`:'Example: 123 Main St, Stowe, VT'}
  }
  return {ok:false,error:`Could not identify a town in "${raw}".`,suggestion:'Include a Vermont town: 142 Lakeshore Drive, Greensboro, VT'}
}

function buildReport(p: Parsed): Report {
  const month = new Date().getMonth()
  const isWinter = month>=10||month<=3, isSummer = month>=5&&month<=8

  let summary = ''
  if (p.isWaterfront) summary = `This ${p.town} waterfront property${p.lakeName?` near ${p.lakeName}`:''} is most likely constrained by wastewater capacity, shoreline regulation, and winter reliability. Before planning any expansion or renovation, confirm the septic system can support it and check what shoreland rules actually allow. The most expensive mistake is designing improvements that require permits you can\'t get.`
  else if (p.isRural) summary = `This ${p.town} property is most likely constrained by wastewater and water system reliability, heating adequacy, and access during mud season. The priority is confirming infrastructure can handle the intended use before spending on anything visible. Skipping system checks and jumping to finishes is the most common way owners waste money on Vermont seasonal properties.`
  else summary = `This ${p.town} property is most likely constrained by the condition of its wastewater, water, and heating systems. For a seasonal home in ${p.county} County, the priority is confirming these systems support your intended use pattern before committing to improvements. Spending on finishes before resolving infrastructure is the single most common sequencing mistake.`

  const facts: SnapshotFact[] = [
    {label:'Town',value:p.town,basis:'Address match'},
    {label:'County',value:p.county,basis:'Town lookup'},
    {label:'Local zoning',value:p.hasZoning?'Town has zoning bylaws':`No comprehensive zoning — Act 250 at 1 acre`,basis:'Municipal records'},
  ]
  if (p.isWaterfront) facts.push({label:'Water body',value:p.lakeName||'Waterfront indicated by address',basis:p.lakeName?'VT lake database':'Address keywords'})
  if (p.isResort) facts.push({label:'Market',value:'Resort/ski town — different rental rules and comps',basis:'Market classification'})
  facts.push({label:'Tax classification',value:'Non-homestead education tax rate applies to seasonal homes',basis:'VT 32 V.S.A. § 5401'})

  const problems: Problem[] = [
    {constraint:'Wastewater capacity may limit what you can do with this property',soWhat:'Septic design flow caps bedrooms and blocks expansion. Replacement runs $15,000–$40,000+.',whenItMatters:'Before any renovation, addition, or use change.'},
    {constraint:'Water system reliability is unverified',soWhat:'A failed well test or low flow rate can block a sale, void a rental permit, or require $2,000–$10,000 in treatment.',whenItMatters:'Before committing to improvements or listing for sale.'},
    {constraint:'Heating and freeze protection determine whether this is a 3-season or 4-season property',soWhat:'Without adequate heat, pipes freeze, insurance gets harder, and the property can only be used May–October.',whenItMatters:'Before planning shoulder-season or winter use.'},
  ]
  if (p.isWaterfront) problems.push({constraint:`Shoreline regulation limits what can be built within 250 ft of ${p.lakeName||'the water'}`,soWhat:'Vermont Shoreland Protection Act restricts clearing, impervious surface, and expansion. Violations carry fines up to $27,500/day.',whenItMatters:'Before designing any site work, addition, or dock modification.'})

  const actions: ActionItem[] = [
    {title:'Confirm wastewater system can support your plans',priority:'Do now',soWhat:'If septic can\'t handle additional load, nothing else matters — can\'t add bedrooms, convert use, or pass sale inspection.',whyItMatters:'This is the gate. Every downstream decision depends on wastewater capacity.',whenToDo:'Before planning any renovation or expansion.',watchFor:'Systems older than 25 years, unknown inspection history, or design flow below current bedroom count.',nextStep:'Request septic permit and design records from Vermont DEC regional office. Get pump-out and inspection from licensed hauler.'},
    {title:'Test water supply and confirm flow rate',priority:'Do now',soWhat:'Arsenic is naturally occurring in Vermont bedrock. A failed test means treatment ($2,000–$8,000) before the property is habitable or financeable.',whyItMatters:'Lenders require passing water tests. Rental permits may too. Cheap to check, expensive to discover late.',whenToDo:'This month. Testing takes 1–2 weeks for results.',watchFor:'Coliform, E. coli, arsenic, lead, uranium. Flow rate under 3 GPM limits practical use.',nextStep:'Contact a state-certified lab. Draw samples per instructions. Cost $100–$400.'},
    {title:'Assess heating system and freeze protection',priority:'Do before winter',soWhat:'Woodstove-only or wall-heater setups leave pipes exposed. One freeze event can cause $10,000–$50,000 in damage.',whyItMatters:'Determines whether property is usable beyond summer and insurable for vacant periods.',whenToDo:'Before October. Heat pump installs have 4–8 week lead times.',watchFor:'Fuel type, distribution method, whether any plumbing runs through unheated spaces.',nextStep:'Walk the property. Identify every water line. Unheated crawlspaces or exterior walls without insulation are the priority.'},
  ]
  if (p.isWaterfront) actions.splice(2,0,{title:`Check what shoreland rules actually allow on this parcel`,priority:'Do before designing anything',soWhat:'Designing an addition or deck within the 250-ft shoreland zone is wasted money if you can\'t get the permit.',whyItMatters:`Shoreland Protection Act applies to all properties near ${p.lakeName||'lakes over 10 acres'}. Existing nonconforming structures face strict expansion limits.`,whenToDo:'Before hiring architect or contractor for site work.',watchFor:'250-ft setback from mean water level, impervious surface limits, clearing restrictions.',nextStep:'Get property survey showing shoreland buffer. Contact Vermont ANR for permit history. Talk to town zoning administrator.'})
  actions.push({title:`Pull ${p.town} grand list entry and model tax exposure`,priority:'Do before committing to large scope',soWhat:`Major improvements to underassessed property trigger reappraisal. In ${p.town}, this can increase annual tax $1,000–$5,000+ depending on scope.`,whyItMatters:'Can\'t model true cost of improvements without knowing current assessed value and gap to market.',whenToDo:'Before finalizing any renovation budget over $25,000.',watchFor:`Gap between assessed and market value. If town CLA is below 80%, you\'re already under-assessed.`,nextStep:`Request property record card from ${p.town} town clerk. Compare assessed value to recent comps.`})

  const avoidances: Avoidance[] = [
    {action:'Don\'t renovate kitchens or bathrooms until wastewater and water are confirmed',why:'A septic replacement tears through finished spaces. A failed water test after a $30,000 kitchen remodel means you can\'t use it.'},
    {action:'Don\'t design additions before checking permits and setbacks',why:`${p.isWaterfront?'Shoreland rules may prohibit what you\'re planning. ':''}Act 250 review kicks in at ${p.hasZoning?'10 acres':'1 acre'} of involved land in ${p.town}. Getting this wrong means permit denial after you\'ve already paid for plans.`},
    {action:'Don\'t invest in custom or high-end finishes for a seasonal property with unresolved systems',why:'Custom tile, exotic floors, and designer fixtures have the worst ROI in rural Vermont markets. They don\'t survive system replacements and they don\'t move the needle at sale.'},
  ]

  const seasonal: SeasonalItem[] = []
  if (isWinter) {
    seasonal.push({action:'Verify freeze protection on all water lines before the next cold snap',consequence:'One burst pipe during a vacancy can cause $10,000+ in water damage before anyone notices.',timing:'This week.'})
    seasonal.push({action:'Confirm heating system is running and fuel supply is adequate',consequence:'A heating failure during extended cold can freeze entire plumbing system in 24–48 hours.',timing:'Check weekly if property is vacant.'})
    seasonal.push({action:'Clear roof of heavy snow loads if structure is older',consequence:'Pre-1980 framing may not meet modern snow load standards. Ice dams cause interior water damage.',timing:'After any storm dropping 12+ inches.'})
  } else if (isSummer) {
    seasonal.push({action:'Get septic pumped and inspected before peak use season',consequence:'Hosting guests on a system not serviced in 3+ years risks backups and accelerated failure.',timing:'Before Memorial Day or first extended stay.'})
    seasonal.push({action:'Test water quality now — results take 1–2 weeks',consequence:'You don\'t want to find out about coliform or arsenic after a week of drinking it.',timing:'This month.'})
    seasonal.push({action:`Check ${p.town} short-term rental rules if renting any portion of the season`,consequence:'Many Vermont towns now require registration. Operating without it can trigger fines.',timing:'Before listing.'})
  } else {
    seasonal.push({action:'Winterize or confirm winterization before freeze risk begins',consequence:'Vermont can see freezing temps as early as late September at elevation. Drain-down or heat — pick one.',timing:'By mid-October.'})
    seasonal.push({action:'Schedule contractor work now — Vermont contractors book 2–4 months out',consequence:'Waiting until spring means your project starts in July at earliest.',timing:'Now, for spring/summer execution.'})
    seasonal.push({action:'Inspect roof, gutters, and drainage before snow load arrives',consequence:'Damaged gutters and poor drainage cause ice dams and foundation water intrusion.',timing:'Before first snowfall.'})
  }
  if (p.isWaterfront) seasonal.push({action:'Inspect dock, shoreline, and erosion status',consequence:'Storm damage and ice heave can change shoreline access. Unpermitted repairs in shoreland zone carry fines.',timing:isSummer?'At start of lake season.':'In spring before launch.'})

  let reasoning = `Vermont seasonal properties in ${p.county} County share a common pattern: the systems you can\'t see — wastewater, water supply, heating — determine what the property can actually do. `
  reasoning += `Most owners focus on kitchens and bathrooms first, but in this market those investments are gated by infrastructure. `
  if (p.isWaterfront) reasoning += `Waterfront parcels${p.lakeName?` on ${p.lakeName}`:''} carry regulatory constraints under the Shoreland Protection Act that can block common improvement plans. `
  if (p.isResort) reasoning += `As a resort-market property in ${p.town}, STR regulation and higher carrying costs add complexity. `
  reasoning += `The recommendations above are sequenced to resolve constraints before committing capital — the order matters as much as the actions themselves.`

  const programs: ProgramScreen[] = [
    {name:'Efficiency Vermont Rebates',provider:'Efficiency Vermont',whyScreen:'If upgrading to heat pumps, rebates offset $800–$2,000. Insulation rebates $200–$2,000.',value:'$500–$4,000 depending on scope',caveat:'Requires cold-climate rated equipment and participating contractors.',url:'https://www.efficiencyvermont.com/rebates'},
    {name:'Federal 25C Clean Energy Credit',provider:'IRS',whyScreen:'Heat pump and insulation upgrades may qualify for 30% federal tax credit. Heat pumps capped $2,000/year.',value:'Up to $3,200/year combined',caveat:'Second homes have limited eligibility. Talk to your tax advisor.'},
    {name:'Vermont Weatherization',provider:'VT Office of Economic Opportunity',whyScreen:'Free weatherization for income-eligible. Market-rate via Efficiency Vermont network.',value:'Free if eligible; $3,000–$8,000 market rate',caveat:'Income thresholds apply. Seasonal homes may have limited eligibility. 6–12 month wait.'},
  ]

  return {summary,snapshot:{address:`${p.street}, ${p.town}, ${p.county} County, VT`,town:p.town,county:p.county,facts},problems,actions,avoidances,seasonal,reasoning,programs,generatedAt:new Date().toISOString()}
}

export async function POST(req: NextRequest) {
  try {
    const {address} = await req.json()
    if (!address||address.trim().length<3) return NextResponse.json({error:'Please enter an address.',suggestion:'Example: 142 Lakeshore Drive, Greensboro, VT'},{status:400})
    const result = parse(address)
    if (!result.ok||!result.parsed) return NextResponse.json({error:result.error,suggestion:result.suggestion},{status:400})
    return NextResponse.json(buildReport(result.parsed))
  } catch { return NextResponse.json({error:'Analysis failed. Please try again.'},{status:500}) }
}
