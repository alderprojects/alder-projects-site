// Regenerate town × service pages with V6 voice + structure.
// Replaces V1-V3 SeoPage marketplace-era content with ServicePage
// content that imports from FACTS, cites costs, links to V6 town
// pages and topic guides, and ships full JSON-LD + GuideFooter.
//
// Usage: node scripts/regenerate-town-service-pages.mjs
//
// The script:
//   1. Inventories every existing /{service}-{town}-vt and statewide
//      /{service}-vermont page
//   2. Parses each slug into {service, town}
//   3. Looks up service config + town context
//   4. Generates V6-voice page.tsx that uses ServicePage component
//   5. Overwrites the existing page.tsx
//
// All generated content is template-driven but parameterized by
// town + service. Voice is consistent (no "Post your project free",
// no "matched in 48 hours"). Costs cite FACTS.

import { writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const APP_DIR = join(REPO_ROOT, 'src/app')

// ---------- Service definitions --------------------------------------
// label, costFactId, applicable rebates, related guide, seasonal note,
// vetting note. The relatedTopicSlugs go through /guides/{slug}.

const SERVICES = {
  'kitchen-remodeling': {
    label: 'Kitchen remodeling',
    serviceLabel: 'Kitchen remodeling',
    serviceWord: 'kitchen remodel',
    costFactId: 'vt-cost-kitchen-mid',
    fullGutFactId: 'vt-cost-kitchen-full-gut',
    rebateNote: "Pair with a heat pump install during the remodel and EVT's $2,200 ducted rebate plus the $400 fuel-switching bonus stack on top of the kitchen scope. Most Vermont kitchen remodels with electrical service upgrades qualify for the EVT $500 panel rebate.",
    timingNote: "Vermont kitchen remodels run best in late winter through spring. Mud season is fine for interior work — the contractors aren't tied up on exterior projects. Avoid the August-October window if the home will be occupied during demolition; that's when interior crews are stretched thinnest.",
    vettingNote: 'Vermont contractor registration with the AG Consumer Assistance Program is required for any project $3,500+ (free for contractors; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and a 3-day right to cancel. Missing items = unenforceable against you.',
    relatedGuides: ['how-much-does-kitchen-remodel-cost-vermont', 'how-to-find-contractor-vermont', 'vermont-renovation-permit-guide', 'vermont-contractor-red-flags', 'vermont-rebate-stack-2026'],
    pairedServices: ['bathroom-remodeling', 'electrical-contractors'],
  },
  'bathroom-remodeling': {
    label: 'Bathroom remodeling',
    serviceLabel: 'Bathroom remodeling',
    serviceWord: 'bathroom remodel',
    costFactId: 'vt-cost-bathroom-mid',
    rebateNote: 'Bathroom remodels rarely qualify for major rebates on their own, but pairing with a heat pump water heater install ($600 EVT rebate) often makes sense if the existing tank is end-of-life.',
    timingNote: "Bathroom remodels work year-round. Vermont contractors prefer winter scheduling — the fixtures arrive on time, the tile setters aren't competing with summer exterior work, and the home is at heating-bill-attention so weatherization upsells often land.",
    vettingNote: "Plumbing work in Vermont requires a Vermont-licensed plumber (state-level Department of Public Safety license). Verify the bid lists the licensed plumber by name. The contractor's general liability insurance must extend to subcontractors.",
    relatedGuides: ['how-long-does-bathroom-remodel-take-vermont', 'how-to-find-contractor-vermont', 'vermont-renovation-permit-guide', 'vermont-contractor-red-flags'],
    pairedServices: ['kitchen-remodeling', 'electrical-contractors'],
  },
  'roofing': {
    label: 'Roofing',
    serviceLabel: 'Roofing',
    serviceWord: 'roof replacement',
    costFactId: 'vt-cost-roof-asphalt',
    standingSeamFactId: 'vt-cost-roof-standing-seam',
    rebateNote: 'Roofing itself rarely qualifies for rebates, but if you are planning solar in the next 10 years, this is the moment. Vermont solar+battery stacks the federal Section 25D 30% credit plus EVT $0.40/Wh battery incentive plus Net Metering Group 2 — and replacing the roof first avoids $4,000-12,000 in solar removal/reinstall costs later.',
    timingNote: "Vermont roofing season is late April through mid-October. Mud season ends and crews can stage materials; first snow makes most asphalt installs impractical by late October. Booking a roof in May for July is realistic; booking in July for September is risky.",
    vettingNote: "Vermont winters punish roofs differently than other regions — snow load, ice dam pressure, and freeze-thaw cycles. Ask about Vermont-specific experience: ice dam mitigation, ventilation upgrades during reroofs, and snow-load engineering for steeper pitches. The cheaper out-of-state crew that doesn't know Vermont winters costs more long-term.",
    relatedGuides: ['how-much-does-roof-replacement-cost-vermont', 'vermont-solar-battery-stack-2026', 'how-to-find-contractor-vermont', 'vermont-contractor-red-flags'],
    pairedServices: ['window-replacement', 'painting-contractors'],
  },
  'deck-builders': {
    label: 'Deck building',
    serviceLabel: 'Deck building',
    serviceWord: 'deck build',
    costFactId: 'vt-cost-deck-pt',
    compositeFactId: 'vt-cost-deck-composite',
    rebateNote: 'Decks themselves do not qualify for rebates. If your project is in the shoreland buffer (250 feet from any lake larger than 10 acres, per Vermont DEC), a Vermont shoreland permit may be required — verify with the state DEC before signing.',
    timingNote: "Deck construction in Vermont runs late May through October. Frost-heave concerns make winter deck builds impractical for footings. Book by April for a same-summer deck; booking in July for October is risky because of weather variability and contractor schedules filling.",
    vettingNote: "Decks built into the side of a Vermont hill or near a lake have unique structural requirements. Ask about footing depth (Vermont frost depth runs 30-48 inches in most counties), railing code compliance (international residential code 36-inch minimum), and load engineering for snow accumulation in winter.",
    relatedGuides: ['how-much-does-a-deck-cost-vermont', 'vermont-renovation-permit-guide', 'vermont-flood-zone-renovation', 'how-to-find-contractor-vermont'],
    pairedServices: ['roofing', 'home-additions'],
  },
  'window-replacement': {
    label: 'Window replacement',
    serviceLabel: 'Window replacement',
    serviceWord: 'window replacement',
    costFactId: 'vt-cost-windows-replacement',
    rebateNote: "The federal Section 25C credit (which used to cover windows at 30% up to $1,200/year) expired December 31, 2025 and is not in current law. Window replacements in 2026 don't have a federal credit available. Stack value comes from EVT weatherization (75% standard tier, 90% income-eligible) when the project includes air-sealing around the window openings.",
    timingNote: "Window replacement work runs year-round but installs slow in deep winter (above 40°F days needed for proper caulking and sealant cure). Spring through fall is the sweet spot. Historic-district properties need design review approval — add 4-8 weeks for that step.",
    vettingNote: "Vermont contractor registration with the AG required for any project $3,500+. Modern double-pane vinyl or fiberglass windows can match historic profiles for properties in design review districts (Stowe Village, Woodstock, Burlington Hill Section). Verify the contractor has done historic-district installs if applicable.",
    relatedGuides: ['vermont-weatherization-evt-rebate', 'how-to-find-contractor-vermont', 'vermont-renovation-permit-guide', 'vermont-contractor-red-flags'],
    pairedServices: ['roofing', 'painting-contractors'],
  },
  'home-additions': {
    label: 'Home additions',
    serviceLabel: 'Home addition / ADU',
    serviceWord: 'home addition',
    costFactId: 'vt-cost-adu',
    rebateNote: "Vermont's Act 47 (effective July 2024) makes ADUs by-right statewide, overriding most town size caps. If the addition adds bedroom capacity, a Vermont DEC wastewater permit is required ($300-1,500 + $500-1,500 for the licensed septic engineer). The 50% substantial improvement rule applies in FEMA flood zones.",
    timingNote: "Home additions run 12-18 months from start to move-in including permit time. The wastewater permit process alone is 4-12 weeks. Foundation work needs above-freezing days, so ground-up additions typically start in mid-May after mud season. Garage conversions can start any time.",
    vettingNote: "Major additions are the highest-stakes Vermont contractor hire. Verify Vermont AG registration ($3,500+ threshold), 9 V.S.A. § 4006-compliant written contract, and certificate of liability insurance ($1M minimum). For projects $10k+, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.",
    relatedGuides: ['vermont-adu-permit-cost-2026', 'can-i-add-bedroom-vermont-lake-house', 'vermont-septic-what-to-know', 'how-to-find-contractor-vermont', 'vermont-contractor-red-flags'],
    pairedServices: ['kitchen-remodeling', 'bathroom-remodeling'],
  },
  'basement-finishing': {
    label: 'Basement finishing',
    serviceLabel: 'Basement finishing',
    serviceWord: 'basement finish',
    costFactId: null,
    rebateNote: "Basement finishing pairs well with weatherization scope. EVT's 75% rebate (standard tier) covers rim joist sealing and basement wall insulation when included in a Home Performance with ENERGY STAR project. Income-eligible homeowners get 90%.",
    timingNote: "Basement finishing is a winter-friendly project. Vermont contractors prefer winter scheduling — the dry interior environment works well for drywall and finish work, and crews aren't pulled away by summer exterior demand.",
    vettingNote: "Vermont egress requirements apply: any finished basement room used as a bedroom needs a code-compliant egress window. Plumbing additions trigger fixture permits. Electrical work requires a licensed Vermont electrician. Confirm scope and licensing in writing before deposit.",
    relatedGuides: ['vermont-weatherization-evt-rebate', 'vermont-renovation-permit-guide', 'how-to-find-contractor-vermont', 'vermont-contractor-red-flags'],
    pairedServices: ['home-additions', 'electrical-contractors'],
  },
  'painting-contractors': {
    label: 'Painting',
    serviceLabel: 'Painting',
    serviceWord: 'paint job',
    costFactId: null,
    rebateNote: "Interior and exterior painting do not qualify for rebates directly. If exterior painting is part of a larger weatherization project (replacing siding with insulated cladding, for example), the EVT Home Performance program may cover related work.",
    timingNote: "Vermont exterior painting is mid-May through September — above 50°F daytime temps and minimal rain are required. Interior painting works year-round. Booking exterior work in February for a June paint job locks the schedule; booking in May for July is risky.",
    vettingNote: "Lead-paint disclosure rules apply to pre-1978 Vermont homes. If your home pre-dates 1978, the contractor must follow EPA RRP (Renovation, Repair, and Painting) practices. Verify the lead-safe certified renovator (LSCR) credential before signing.",
    relatedGuides: ['how-to-find-contractor-vermont', 'vermont-renovation-permit-guide', 'vermont-contractor-red-flags'],
    pairedServices: ['window-replacement', 'roofing'],
  },
  'electrical-contractors': {
    label: 'Electrical contractors',
    serviceLabel: 'Electrical contractor',
    serviceWord: 'electrical work',
    costFactId: 'evt-electrical-service-upgrade',
    rebateNote: "Electrical service upgrades tied to electrification (heat pump, EV charger, heat pump water heater) qualify for the EVT $500 electrical panel rebate. EVT's $200 Level 2 EV charger rebate also stacks. Stand-alone panel upgrades without an electrification project don't qualify.",
    timingNote: "Vermont electrical work runs year-round indoors. Service upgrades that require a meter swap need utility coordination — schedule with your utility (GMP, BED, VPPSA member) before booking the contractor. Electrical permit fees are separate from town building permits.",
    vettingNote: "All electrical work must be done by a licensed Vermont electrician (state-level Department of Public Safety license, $50-200 permit). Verify the licensed electrician's name and license number on the bid. Subcontracted electrical work often surfaces in a Vermont mechanic's lien dispute when the GC doesn't pay the electrician.",
    relatedGuides: ['heat-pump-rebates-vermont', 'vermont-rebate-stack-2026', 'vermont-renovation-permit-guide', 'how-to-find-contractor-vermont'],
    pairedServices: ['kitchen-remodeling', 'bathroom-remodeling'],
  },
  'plumbing-contractors': {
    label: 'Plumbing',
    serviceLabel: 'Plumbing',
    serviceWord: 'plumbing work',
    costFactId: null,
    rebateNote: "Plumbing tied to a heat pump water heater install qualifies for the EVT $600 rebate. Septic upgrades trigger Vermont DEC wastewater permit requirements ($300-1,500 in fees + septic engineer evaluation $500-1,500). Most other plumbing work doesn't qualify for major rebates.",
    timingNote: "Vermont plumbing work runs year-round indoors. Outdoor service work (water main, septic) is mud-season-blocked from March through mid-May and frost-blocked from December through early April. Schedule outdoor scope for late spring through early fall.",
    vettingNote: "Vermont plumbing work requires a Vermont-licensed plumber (state Department of Public Safety license, $50-200 permit). Verify license + certificate of liability insurance. For septic and wastewater work, the licensed septic designer must also be Vermont-credentialed — separate from the plumber.",
    relatedGuides: ['vermont-septic-what-to-know', 'heat-pump-rebates-vermont', 'how-to-find-contractor-vermont', 'vermont-renovation-permit-guide'],
    pairedServices: ['bathroom-remodeling', 'kitchen-remodeling'],
  },
  'general-contractors': {
    label: 'General contractors',
    serviceLabel: 'General contractor',
    serviceWord: 'general contractor project',
    costFactId: null,
    rebateNote: "General contractor projects often pull together rebates from multiple programs — EVT weatherization ($2,200 ducted heat pump, $475 ductless head, 75% weatherization), federal 25D for solar+battery, and Vermont Net Metering. The GC coordinates the paperwork; verify each rebate is specifically named in the bid before signing.",
    timingNote: "Vermont GC projects span mud season, summer, and pre-winter. Realistic project timelines stretch 6-18 months for major scope. Book 4-6 months ahead of intended start; sign by January for summer-fall starts.",
    vettingNote: "GCs are the highest-stakes Vermont contractor hire. Vermont AG registration ($3,500+ threshold), 9 V.S.A. § 4006 compliant contract, certificate of liability insurance ($1M minimum), workers comp if employees. For projects $10k+, request all subcontractor and material supplier names BEFORE work starts to defend against mechanic's lien exposure under 9 V.S.A. Chapter 51.",
    relatedGuides: ['how-to-find-contractor-vermont', 'vermont-contractor-red-flags', 'what-to-ask-contractor-before-hiring', 'vermont-renovation-permit-guide', 'vermont-rebate-stack-2026'],
    pairedServices: ['kitchen-remodeling', 'home-additions'],
  },
  'hvac-contractors': {
    label: 'HVAC contractors',
    serviceLabel: 'HVAC contractor',
    serviceWord: 'HVAC project',
    costFactId: 'vt-cost-heat-pump-ducted',
    rebateNote: "Vermont HVAC work centers on heat pump installs. EVT pays $2,200 for ducted, $475 per ductless head, $400 fuel-switching bonus (oil removal), $600 heat pump water heater. GMP customers at or below 80% AMI add $2,000 per condenser; VPPSA customers add $1,000. BED customers have a narrower utility-side incentive layer. The federal Section 25C credit expired Dec 31, 2025.",
    timingNote: "Heat pump install demand peaks in fall (September-November). The good Vermont installers are fully booked in November for spring work. Book by April for fall installs; book by November for spring-after-mud-season. Calling in October for January is unrealistic — the strong crews are committed.",
    vettingNote: "EVT-participating contractor required for the rebate. The list is at efficiencyvermont.com/find-contractor; verify in writing. Cold-climate experience matters — ask how many NEEP-listed installs they've done in Vermont winters and which models they typically install. Vermont electrical license + AG registration mandatory for any $3,500+ project.",
    relatedGuides: ['heat-pump-rebates-vermont', 'vermont-heat-pump-rebate-stack-2026', 'vermont-rebate-stack-2026', 'vermont-weatherization-evt-rebate', 'how-to-find-contractor-vermont'],
    pairedServices: ['electrical-contractors', 'plumbing-contractors'],
  },
}

// ---------- Town definitions ------------------------------------------
// Mirrors the relevant subset of CONFIG.homepage.townGrid.towns + V6
// town content. For non-V6 towns (Williston, Essex, Colchester, etc.)
// we use a small context block.

const TOWNS = {
  'burlington': {
    name: 'Burlington', county: 'Chittenden County', tier: 'burlington_metro',
    townSlug: 'burlington-vt', samplePropertySlug: 'main-street-burlington-vt',
    utility: 'Burlington Electric Department (BED)',
    note: "Vermont's largest city. Most housing stock pre-dates 1960; knob-and-tube wiring, oil-to-electric conversions, and undersized service panels are the cost driver in older neighborhoods.",
    rebateNote: "Burlington is in BED territory, not GMP. The $2,000 GMP income-eligible heat pump bonus does NOT apply here; BED has its own narrower incentive layer. EVT statewide rebates ($2,200 ducted, $475 per ductless head, $400 fuel-switching) apply equally regardless of utility.",
    multiplier: '1.10-1.20×',
    isV6Town: true,
  },
  'south-burlington': {
    name: 'South Burlington', county: 'Chittenden County', tier: 'burlington_metro',
    townSlug: null, samplePropertySlug: null,
    utility: 'Green Mountain Power (GMP)',
    note: "Chittenden County metro tier. Newer housing stock than Burlington proper means fewer surprise electrical upgrades. GMP territory — full rebate stack applies.",
    rebateNote: "GMP territory. The $2,000 per condenser income-eligible heat pump bonus applies (households at or below 80% AMI). Stack with EVT $2,200 ducted, $400 fuel-switching, $500 panel upgrade rebate.",
    multiplier: '1.05-1.15×',
    isV6Town: false,
  },
  'williston': {
    name: 'Williston', county: 'Chittenden County', tier: 'burlington_metro',
    townSlug: null, samplePropertySlug: null,
    utility: 'Green Mountain Power (GMP)',
    note: "Chittenden County, residential-and-commercial mix. Suburban-pattern lots make most projects straightforward — fewer historic constraints than Burlington proper.",
    rebateNote: "GMP territory. Standard GMP and EVT rebate stack applies. Most Williston homes built 1985-2010 — newer construction, fewer surprise weatherization items, but also less dramatic weatherization payback.",
    multiplier: '1.05-1.15×',
    isV6Town: false,
  },
  'essex': {
    name: 'Essex', county: 'Chittenden County', tier: 'burlington_metro',
    townSlug: null, samplePropertySlug: null,
    utility: 'Green Mountain Power (GMP)',
    note: "Chittenden County. Mix of older Essex Village housing (pre-1960) and newer Essex Junction subdivision builds. The age of the property drives the cost math more than the location.",
    rebateNote: "GMP territory. The $2,000 income-eligible heat pump bonus applies. Stack with EVT $2,200 ducted, $400 fuel-switching bonus.",
    multiplier: '1.00-1.10×',
    isV6Town: false,
  },
  'colchester': {
    name: 'Colchester', county: 'Chittenden County', tier: 'burlington_metro',
    townSlug: null, samplePropertySlug: null,
    utility: 'Green Mountain Power (GMP)',
    note: "Lake Champlain shoreline drives the project planning conversation. Properties within 250 feet of the lake fall under Vermont's Shoreland Protection Act buffer — clearing, building, or new impervious surface in the buffer requires a state DEC shoreland permit.",
    rebateNote: "GMP territory; standard rebate stack applies. Lake-adjacent properties: factor in the shoreland permit timeline (4-12 weeks) before any exterior project schedule.",
    multiplier: '1.00-1.10×',
    isV6Town: false,
  },
  'stowe': {
    name: 'Stowe', county: 'Lamoille County', tier: 'resort_premium',
    townSlug: 'stowe-vt', samplePropertySlug: 'main-street-stowe-vt',
    utility: 'Stowe Electric (VPPSA member utility)',
    note: "Resort-premium tier. Cost basis runs 30-40% above statewide median. Mountain Road design review applies to any visible exterior work. Stowe Village historic district constrains exterior changes within the district boundary.",
    rebateNote: "VPPSA member utility (Stowe Electric). Income-eligible heat pump bonus is $1,000 per condenser, not $2,000 like GMP. EVT statewide rebates ($2,200 ducted, $475 ductless head, $400 fuel-switching, $500 panel) apply equally.",
    multiplier: '1.30-1.45×',
    isV6Town: true,
  },
  'middlebury': {
    name: 'Middlebury', county: 'Addison County', tier: 'small_city',
    townSlug: 'middlebury-vt', samplePropertySlug: 'main-street-middlebury-vt',
    utility: 'Green Mountain Power (GMP)',
    note: "College town. Middlebury College drives both the rental market and contractor pipeline. Student rental conversion rules tightened in 2025 — verify current cap with town zoning before assuming rental yield math.",
    rebateNote: "GMP territory. $2,000 per condenser income-eligible bonus applies. Stack with EVT $2,200 ducted heat pump, $400 fuel-switching, $500 panel upgrade.",
    multiplier: '1.00×',
    isV6Town: true,
  },
}

// Service slug aliases — slugs that map to a different SERVICES key.
// Handles e.g. 'roofing-contractors-vermont' which should resolve to
// the 'roofing' service config.
const SERVICE_ALIASES = {
  'roofing-contractors': 'roofing',
}

// Slug → { service, town } parsing
function parseSlug(slug) {
  // slug like 'kitchen-remodeling-stowe-vt' or 'kitchen-remodeling-vermont'
  // Build candidate keys (real + alias), sorted by length desc to match
  // longest prefix first.
  const ALL_KEYS = [...Object.keys(SERVICES), ...Object.keys(SERVICE_ALIASES)].sort(
    (a, b) => b.length - a.length,
  )
  for (const key of ALL_KEYS) {
    if (slug.startsWith(key + '-')) {
      const rest = slug.slice(key.length + 1)
      const serviceKey = SERVICE_ALIASES[key] ?? key
      if (rest === 'vermont') return { serviceKey, townKey: 'vermont' }
      if (rest.endsWith('-vt')) {
        const townKey = rest.slice(0, -3)
        return { serviceKey, townKey }
      }
    }
  }
  return null
}

// ---------- County page definitions -----------------------------------

const COUNTIES = {
  'addison-county-vt': {
    name: 'Addison County',
    seat: 'Middlebury',
    towns: ['Middlebury', 'Vergennes', 'Bristol', 'Ferrisburgh'],
    townSlugs: ['middlebury-vt', 'vergennes-vt'],
    serviceFocus: ['kitchen-remodeling', 'bathroom-remodeling', 'roofing', 'deck-builders'],
    contextNote: "Addison County is Vermont's lakeshore agriculture belt. Middlebury College drives the contractor pipeline; Vergennes is Vermont's smallest city. Otter Creek and the Lake Champlain shoreline mean shoreland buffer permits apply to many residential projects.",
    contractorNote: "Addison County has fewer per-capita licensed residential contractors than Chittenden or Lamoille counties. The strong crews get pulled north for Burlington-metro work or south for Middlebury College-area renovations. Start the contractor search 4-5 months before you want work to begin.",
    tier: 'small_city',
  },
  'chittenden-county-vt': {
    name: 'Chittenden County',
    seat: 'Burlington',
    towns: ['Burlington', 'South Burlington', 'Williston', 'Essex', 'Colchester', 'Winooski', 'Shelburne', 'Charlotte'],
    townSlugs: ['burlington-vt'],
    serviceFocus: ['kitchen-remodeling', 'bathroom-remodeling', 'roofing', 'home-additions', 'deck-builders', 'electrical-contractors'],
    contextNote: "Vermont's largest county. Housing stock varies dramatically — Victorian and Craftsman in Burlington's Hill Section, 1960s-1990s ranches in South Burlington and Williston, newer construction in Essex and Shelburne. Renovation cost math depends on which neighborhood you're in, not just the county.",
    contractorNote: "Highest contractor density in Vermont. Expect 4-6 serious bids on most projects. The variance between bids tells you where scope ambiguity is — cheapest is usually missing supplementary scope (electrical, plumbing modernization), most expensive is often a non-Chittenden contractor adding windshield time.",
    tier: 'burlington_metro',
  },
  'lamoille-county-vt': {
    name: 'Lamoille County',
    seat: 'Hyde Park',
    towns: ['Stowe', 'Morristown', 'Hyde Park', 'Johnson', 'Hardwick'],
    townSlugs: ['stowe-vt'],
    serviceFocus: ['kitchen-remodeling', 'bathroom-remodeling', 'roofing', 'deck-builders'],
    contextNote: "Lamoille County is Stowe's home county. The resort-tier pricing dominates project economics here — labor scarcity and design review prep time are real cost drivers. Most Lamoille County towns are on VPPSA member utilities (Stowe Electric, Hyde Park Electric, Morrisville Water & Light), not GMP.",
    contractorNote: "Lamoille County's strongest crews work mostly in Stowe at resort-tier rates. For non-Stowe projects in Hyde Park, Morristown, or Johnson, expect to draw from a smaller pool. The town clerk's permit log is the best contractor reference for non-Stowe work.",
    tier: 'resort_premium',
  },
  'rutland-county-vt': {
    name: 'Rutland County',
    seat: 'Rutland',
    towns: ['Rutland', 'Castleton', 'Brandon', 'Killington', 'West Rutland'],
    townSlugs: [],
    serviceFocus: ['roofing', 'kitchen-remodeling', 'window-replacement'],
    contextNote: "Rutland County mixes the Rutland city small-city tier with Killington-area resort pricing. Castleton's Lake Bomoseen properties trigger Vermont shoreland buffer rules. The county's older housing stock makes weatherization payback fast.",
    contractorNote: "Rutland County has decent contractor density centered on Rutland city. Killington-area work runs at near resort-premium rates. Lake Bomoseen and Lake St. Catherine projects need shoreland-experienced contractors.",
    tier: 'small_city',
  },
  'washington-county-vt': {
    name: 'Washington County',
    seat: 'Montpelier',
    towns: ['Montpelier', 'Barre', 'Waitsfield', 'Waterbury', 'Northfield'],
    townSlugs: ['montpelier-vt'],
    serviceFocus: ['kitchen-remodeling', 'roofing', 'home-additions'],
    contextNote: "Washington County is the state capital and the Mad River Valley. Montpelier's 2023 flooding reshaped the renovation conversation — the FEMA flood zone is being remapped. Mad River Valley properties (Waitsfield, Warren, Fayston) run near-resort pricing because of the Sugarbush ski-resort second-home market.",
    contractorNote: "Washington County contractor density is higher than Addison or Caledonia. Montpelier-area work peaks August-October as state-employee homeowners drive the demand cycle. Mad River Valley contractors book schedule from Sugarbush second-home owners — expect resort-style scheduling lead times.",
    tier: 'small_city',
  },
  'windsor-county-vt': {
    name: 'Windsor County',
    seat: 'Woodstock',
    towns: ['Woodstock', 'Hartford', 'White River Junction', 'Windsor', 'Springfield'],
    townSlugs: ['woodstock-vt'],
    serviceFocus: ['kitchen-remodeling', 'roofing', 'home-additions', 'window-replacement'],
    contextNote: "Windsor County splits between Quechee Lakes / Woodstock resort-tier pricing and the more affordable Springfield / Windsor mid-tier. Quechee Lakes Association layers private architectural review on top of town zoning for properties in the development.",
    contractorNote: "Windsor County contractor pool is shaped by the Connecticut River corridor — some crews work New Hampshire as much as Vermont, so verify Vermont AG registration explicitly. Woodstock-area resort work runs at premium rates; Springfield work runs at small-city tier.",
    tier: 'small_city',
  },
}

// ---------- Page generators -------------------------------------------

function generateTownServicePage(serviceKey, townKey) {
  const service = SERVICES[serviceKey]
  const town = TOWNS[townKey]
  if (!service || !town) return null

  const slug = `${serviceKey}-${townKey}-vt`
  const h1 = `${service.serviceLabel} in ${town.name}, VT — costs, contractors, rebates`
  const metaTitle = `${service.serviceLabel} in ${town.name}, VT — costs, rebates, what to know`
  const metaDescription = `What ${service.serviceWord} actually costs in ${town.name}, VT in 2026. Rebates that stack, contractors to vet, timing that works. Built for ${town.name} homeowners.`

  const leadParagraph = `${town.note} ${service.serviceLabel} in ${town.name} runs at ${town.multiplier} statewide median. Get bids that know the ${town.name} reality, not generic Vermont pricing.`

  const sections = [
    {
      h2: `${service.serviceLabel} costs in ${town.name}`,
      body: `${town.name} runs ${town.multiplier} of statewide median for ${service.serviceWord} work. Mid-2026 numbers, with ${town.name} adjustments.

${costSection(service, town)}

The cost driver in ${town.name} is ${town.tier === 'resort_premium' ? 'labor scarcity and design-review prep time most contractors quote without' : town.tier === 'burlington_metro' ? 'the age of the housing stock — pre-1960 homes need supplementary scope (electrical service upgrade, plumbing modernization) on top of the headline service' : 'the contractor pool size'}. Get three written bids and ask each one to break out the supplementary scope they expect.`,
    },
    {
      h2: `Rebates that apply for ${service.serviceWord} in ${town.name}`,
      body: `${town.rebateNote}\n\n${service.rebateNote}\n\n**Trap:** the contractor whose bid quotes a rebate stack from a different utility territory. Ask them to break out each rebate by name and confirm in writing which ones apply to ${town.name} (${town.utility}). Bids that show "$X off after rebates" without naming the rebates are the ones that lose money on the actual paperwork.`,
    },
    {
      h2: `When to schedule ${service.serviceWord} in Vermont`,
      body: service.timingNote,
    },
    {
      h2: `Vetting a ${service.serviceWord} contractor in ${town.name}`,
      body: `${service.vettingNote}\n\n**Vermont-specific:** ${town.tier === 'resort_premium' ? `${town.name} contractors charge resort-tier rates because labor demand is real. Ask each bidder where most of their work is — local ${town.name} crews price more honestly for ${town.name} projects than commuting crews who add windshield time to the bid.` : town.tier === 'burlington_metro' ? `${town.name} has stronger contractor density than rural Vermont, so expect 4-6 serious bids in a typical project. Use the variance to identify the bid that's missing scope (cheapest, often) and the bid that's overpriced for ${town.name} (most expensive, often).` : `${town.name} has narrower contractor density. Start the search 4-5 months before you want work to begin, not 4-5 weeks. The town's permit log is a public record and a better contractor reference than online reviews.`}`,
    },
  ]

  // Related: town × related service slugs (in same town when V6 town,
  // otherwise just statewide for that service); plus paired services
  // in the same town.
  const relatedServiceSlugs = []
  for (const paired of service.pairedServices) {
    relatedServiceSlugs.push(`${paired}-${townKey}-vt`)
  }
  // Always link to the statewide service page
  relatedServiceSlugs.push(`${serviceKey}-vermont`)
  // If V6 town, link to the town page too
  if (town.isV6Town) {
    relatedServiceSlugs.push(town.townSlug)
  }

  const factIds = [service.costFactId, 'vt-residential-contract-statute', 'vt-contractor-registration-threshold'].filter(Boolean)
  if (service.standingSeamFactId) factIds.push(service.standingSeamFactId)
  if (service.compositeFactId) factIds.push(service.compositeFactId)
  if (service.fullGutFactId) factIds.push(service.fullGutFactId)
  if (serviceKey === 'hvac-contractors' || serviceKey === 'electrical-contractors') {
    factIds.push('evt-ducted-heat-pump-rebate', 'evt-fuel-switching-bonus')
  }

  return {
    slug,
    serviceLabel: service.label,
    townName: town.name,
    townSlug: town.townSlug,
    county: town.county,
    metaTitle,
    metaDescription,
    h1,
    leadParagraph,
    sections,
    factIds,
    relatedGuideSlugs: service.relatedGuides,
    relatedServiceSlugs,
    samplePropertySlug: town.samplePropertySlug,
    verifyDate: '2026-05-03',
  }
}

function generateCountyPage(slug) {
  const cfg = COUNTIES[slug]
  if (!cfg) return null

  const h1 = `${cfg.name}, Vermont — costs, contractors, what to know.`
  const metaTitle = `${cfg.name}, VT property guide — costs, contractors, rebates`
  const metaDescription = `What renovation, weatherization, and contractor work actually costs in ${cfg.name}, Vermont in 2026. Built for ${cfg.name} homeowners.`

  const leadParagraph = `${cfg.contextNote} The contractor reality varies sharply across ${cfg.name} — get bids that know your specific town's pricing tier, not a generic county-level number.`

  const sections = [
    {
      h2: `What ${cfg.name} feels like for renovation work`,
      body: `${cfg.contextNote}\n\n${cfg.contractorNote}`,
    },
    {
      h2: `Project costs in ${cfg.name}`,
      body: `${cfg.name} runs at the ${cfg.tier === 'resort_premium' ? '1.30-1.45×' : cfg.tier === 'burlington_metro' ? '1.10-1.20×' : cfg.tier === 'small_city' ? '1.00×' : '0.85×'} statewide-median tier for most renovation categories. Specific ranges (verified mid-2026):\n\n**Mid-range kitchen remodel** — $35,000-65,000 statewide median (apply tier multiplier).\n**Bathroom remodel** — $12,000-28,000 statewide median.\n**Roofing replacement** — $8,000-20,000 asphalt, $20,000-40,000 standing seam metal.\n**Heat pump install** — $11,000-22,000 ducted; $3,500-5,500 single-zone ductless.\n**Whole-home weatherization** — $4,000-18,000 typical; EVT 75% rebate (standard tier) brings out-of-pocket to $1,000-4,500.\n\n**Trap:** the bid that quotes "${cfg.name}" pricing without specifying which town. The variance between resort-tier and rural ${cfg.name} towns is real money. Confirm pricing tier with each bidder.`,
    },
    {
      h2: `Rebates that apply across ${cfg.name}`,
      body: `EVT statewide rebates apply equally regardless of town: $2,200 ducted heat pump, $475 ductless head, $400 fuel-switching bonus, $500 electrical service upgrade tied to electrification, $600 heat pump water heater. Weatherization runs 75% of project cost (standard tier) or 90% income-eligible.\n\n**Vermont-specific:** the utility-side incentive layer differs by town within ${cfg.name}. Most ${cfg.name} towns are on Green Mountain Power (GMP) territory with the $2,000 per condenser income-eligible heat pump bonus. Some towns are on VPPSA member utilities with a $1,000 bonus instead. Verify your specific utility before assuming the stack.\n\nThe federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law. The 2026 stack is leaner than 2024-2025 but still strong for combined heat-pump + weatherization projects.`,
    },
    {
      h2: `Vetting a ${cfg.name} contractor`,
      body: `Vermont contractor registration with the AG Consumer Assistance Program is required for any project $3,500+ (free for contractors; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel.\n\nFor projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.\n\n**Trap:** bids that come in dramatically lower than the others. Cheap ${cfg.name} bids usually skip supplementary scope (electrical service upgrade, plumbing modernization, design review prep) that surfaces as change orders. The cheapest bid often costs the most by the time the project finishes.`,
    },
  ]

  const relatedServiceSlugs = []
  for (const svc of cfg.serviceFocus) {
    relatedServiceSlugs.push(`${svc}-${cfg.towns[0].toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}-vt`)
  }
  // Add the county's primary V6 town links
  for (const townSlug of cfg.townSlugs) {
    if (!relatedServiceSlugs.includes(townSlug)) {
      relatedServiceSlugs.push(townSlug)
    }
  }

  const factIds = [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-weatherization-standard-tier',
    'gmp-heat-pump-income-bonus',
    'federal-25c-expired',
    'vt-residential-contract-statute',
    'vt-contractor-registration-threshold',
    'vt-mechanics-lien-statute',
  ]
  if (cfg.tier === 'resort_premium') factIds.push('vt-tier-resort-premium')
  if (cfg.tier === 'burlington_metro') factIds.push('vt-tier-burlington-metro')

  return {
    slug,
    serviceLabel: `${cfg.name} renovation`,
    townName: cfg.name,
    townSlug: null,
    county: cfg.name,
    metaTitle,
    metaDescription,
    h1,
    leadParagraph,
    sections,
    factIds,
    relatedGuideSlugs: ['heat-pump-rebates-vermont', 'how-to-find-contractor-vermont', 'vermont-renovation-permit-guide', 'vermont-contractor-red-flags', 'vermont-rebate-stack-2026'],
    relatedServiceSlugs,
    samplePropertySlug: null,
    verifyDate: '2026-05-03',
  }
}

function generateStatewidePage(serviceKey) {
  const service = SERVICES[serviceKey]
  if (!service) return null

  const slug = `${serviceKey}-vermont`
  const h1 = `${service.serviceLabel} in Vermont — costs, rebates, contractor reality`
  const metaTitle = `${service.serviceLabel} in Vermont — what it actually costs in 2026`
  const metaDescription = `What ${service.serviceWord} actually costs across Vermont in 2026. Rebates that stack, contractors to vet, timing that works for the Vermont calendar.`

  const leadParagraph = `Vermont ${service.serviceWord} costs vary 30-40% between the resort-tier towns (Stowe, Manchester, Woodstock), the Burlington metro, and the rural belt. Statewide median runs at one number; your specific town's number runs at a different one. Get bids that know your specific Vermont sub-market, not generic regional pricing.`

  const sections = [
    {
      h2: `Vermont ${service.serviceWord} costs by tier`,
      body: `Vermont breaks into four cost tiers for ${service.serviceWord} work:

**Resort-premium** (Stowe, Manchester, Woodstock) — runs 30-40% above statewide median. Labor scarcity, design-review prep, second-home premiums.

**Burlington metro** (Burlington, South Burlington, Williston, Essex, Colchester, Winooski, Shelburne) — runs 10-20% above statewide median. Aging housing stock drives supplementary scope.

**Small city / regional center** (Montpelier, Middlebury, Brattleboro, Vergennes, Rutland) — runs at statewide median. Best mix of contractor density and reasonable pricing.

**Rural** (Northeast Kingdom, much of Caledonia/Orleans/Essex counties) — runs 10-20% below statewide median. Smaller bidder pool and longer scheduling lead times.

${costSection(service, null)}`,
    },
    {
      h2: `Rebates that apply for Vermont ${service.serviceWord}`,
      body: `${service.rebateNote}\n\n**Vermont-specific:** rebate stacks differ by utility territory. GMP (most of Vermont), BED (Burlington), VPPSA member utilities (Stowe, Hyde Park, Lyndonville, Northfield, etc.) each have their own incentive layer on top of the EVT statewide rebates. The federal Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year) expired December 31, 2025 and is not in current law.\n\n**Trap:** the contractor or online cost calculator that still quotes the federal 25C credit. Reject bids that include expired federal credits as part of the rebate stack.`,
    },
    {
      h2: `When to schedule ${service.serviceWord} in Vermont`,
      body: service.timingNote,
    },
    {
      h2: `Vetting a Vermont ${service.serviceWord} contractor`,
      body: `${service.vettingNote}\n\n**Vermont-specific:** the Vermont AG's Consumer Assistance Program registration is required for any residential project $3,500+. Verify the contractor is registered (free for them; refusing is a red flag). Per 9 V.S.A. § 4006, your written contract must include scope, total price, completion date, deposit terms, and 3-day right to cancel. Missing items mean the contract is unenforceable AGAINST you, but the contractor can still cash your deposit. For projects over $10,000, request a list of all subcontractors and material suppliers BEFORE work starts to defend against the Vermont mechanic's lien risk under 9 V.S.A. Chapter 51.`,
    },
  ]

  const relatedServiceSlugs = service.pairedServices.map(p => `${p}-vermont`)

  const factIds = [service.costFactId, 'vt-residential-contract-statute', 'vt-contractor-registration-threshold', 'vt-mechanics-lien-statute', 'vt-tier-resort-premium', 'vt-tier-burlington-metro', 'vt-tier-rural-discount'].filter(Boolean)
  if (service.standingSeamFactId) factIds.push(service.standingSeamFactId)
  if (service.compositeFactId) factIds.push(service.compositeFactId)
  if (service.fullGutFactId) factIds.push(service.fullGutFactId)
  if (serviceKey === 'hvac-contractors' || serviceKey === 'electrical-contractors') {
    factIds.push('evt-ducted-heat-pump-rebate', 'evt-fuel-switching-bonus', 'gmp-heat-pump-income-bonus', 'vppsa-heat-pump-income-bonus')
  }

  return {
    slug,
    serviceLabel: service.label,
    townName: 'Vermont',
    townSlug: null,
    county: null,
    metaTitle,
    metaDescription,
    h1,
    leadParagraph,
    sections,
    factIds,
    relatedGuideSlugs: service.relatedGuides,
    relatedServiceSlugs,
    samplePropertySlug: null,
    verifyDate: '2026-05-03',
  }
}

// Cost section helper — chooses appropriate FACT-cited cost lines
// based on which fact ids the service has.
function costSection(service, town) {
  const lines = []
  const tierMultText = town
    ? `In ${town.name}, multiply by ${town.multiplier}.`
    : `In resort-tier towns, multiply by 1.30-1.45×; in rural towns, multiply by 0.85×.`

  if (service.costFactId === 'vt-cost-kitchen-mid') {
    lines.push('**Mid-range kitchen remodel** — $35,000-65,000 statewide median (semi-custom cabinets, quartz/granite counters, new appliances, updated electrical).')
    lines.push('**Full gut kitchen renovation** — $60,000-120,000+ statewide median (custom cabinetry, premium stone, professional appliances, full electrical and plumbing rough-in).')
  } else if (service.costFactId === 'vt-cost-bathroom-mid') {
    lines.push('**Mid-range bathroom remodel** — $12,000-28,000 statewide median (new tile, vanity, fixtures, updated plumbing).')
    lines.push('**Full bathroom remodel** — $25,000-55,000 statewide median (full gut, premium finishes, shower-tub conversions, layout changes).')
  } else if (service.costFactId === 'vt-cost-roof-asphalt') {
    lines.push('**Asphalt shingle roof replacement** — $8,000-20,000 statewide median (architectural shingles preferred for Vermont wind/ice loads; 1,500 sq ft ranch in Burlington runs $9,000-13,000).')
    lines.push('**Standing seam metal roof** — $20,000-40,000 statewide median (sheds snow naturally, resists ice dams, 40-70 year lifespan).')
  } else if (service.costFactId === 'vt-cost-deck-pt') {
    lines.push('**Pressure-treated deck** — $8,000-18,000 statewide median (basic 10x16 deck with simple stairs $8,000-12,000).')
    lines.push('**Composite deck** — $15,000-40,000 statewide median (mid-size with aluminum railing $18,000-28,000; premium with hidden fasteners and lighting $35,000-40,000).')
  } else if (service.costFactId === 'vt-cost-windows-replacement') {
    lines.push('**12-window replacement project** — $12,000-28,000 statewide median (modern double-pane vinyl or fiberglass; historic district approval adds time but rarely cost).')
  } else if (service.costFactId === 'vt-cost-adu') {
    lines.push('**ADU build, 700-900 sq ft** — $85,000-175,000 statewide median (detached, fully built including foundation, framing, roof, exterior, full interior).')
    lines.push('**Plus** — $300-1,500 Vermont DEC wastewater permit, $500-1,500 septic engineer evaluation, $3,000-7,500 electrical service upgrade if needed.')
  } else if (service.costFactId === 'vt-cost-heat-pump-ducted') {
    lines.push('**Ducted whole-house heat pump install** — $11,000-22,000 statewide median (cold-climate NEEP-listed system).')
    lines.push('**Single-zone ductless mini-split** — $3,500-5,500 statewide median.')
    lines.push('**Multi-zone ductless (2-3 rooms)** — $7,000-12,000 statewide median.')
  } else if (service.costFactId === 'evt-electrical-service-upgrade') {
    lines.push('**200-amp service upgrade** — $3,500-7,500 statewide median (older Vermont homes with 100-amp service often need this for kitchen, HVAC, or EV-charger circuits).')
    lines.push('**EVT $500 electrical panel rebate** applies if the upgrade is tied to electrification (heat pump, EV charger, HPWH).')
  } else if (service.costFactId === null) {
    lines.push(`**Statewide median** for ${service.serviceWord} varies widely by scope. Get three written bids before assuming a budget; the variance between bids tells you where the scope ambiguity is.`)
  }

  lines.push('')
  lines.push(tierMultText)

  return lines.join('\n')
}

// ---------- Page file template ----------------------------------------

function pageFileSource(content) {
  return `import type { Metadata } from 'next'
import ServicePage from '@/components/ServicePage'

const PATH = '/${content.slug}'

const content = ${stringifyContent(content)}

export const metadata: Metadata = {
  title: ${JSON.stringify(content.metaTitle)},
  description: ${JSON.stringify(content.metaDescription)},
  alternates: { canonical: \`https://alderprojects.com\${PATH}\` },
  openGraph: {
    title: ${JSON.stringify(content.metaTitle)},
    description: ${JSON.stringify(content.metaDescription)},
    url: \`https://alderprojects.com\${PATH}\`,
    type: 'article',
  },
}

export default function Page() {
  return <ServicePage content={content} />
}
`
}

function stringifyContent(content) {
  return JSON.stringify(content, null, 2)
    .replace(/^/gm, '  ')
    .replace(/^  /, '')
}

// ---------- Main -------------------------------------------------------

function listSeoPages() {
  const dirs = readdirSync(APP_DIR)
  const pages = []
  const counties = []
  for (const dir of dirs) {
    const full = join(APP_DIR, dir, 'page.tsx')
    try {
      const stat = statSync(full)
      if (!stat.isFile()) continue
      // Counties: handled separately
      if (COUNTIES[dir]) {
        counties.push(dir)
        continue
      }
      // Service pages
      const parsed = parseSlug(dir)
      if (parsed) pages.push({ slug: dir, ...parsed })
    } catch (e) {
      // No page.tsx in this dir — skip
    }
  }
  return { pages, counties }
}

function main() {
  const { pages, counties } = listSeoPages()
  let regenerated = 0
  let skipped = 0

  for (const { slug, serviceKey, townKey } of pages) {
    const content =
      townKey === 'vermont'
        ? generateStatewidePage(serviceKey)
        : generateTownServicePage(serviceKey, townKey)
    if (!content) {
      console.log(`  SKIP: ${slug} (no service or town config)`)
      skipped++
      continue
    }
    const file = pageFileSource(content)
    const path = join(APP_DIR, slug, 'page.tsx')
    writeFileSync(path, file, 'utf8')
    console.log(`  REGEN: ${slug}`)
    regenerated++
  }

  for (const slug of counties) {
    const content = generateCountyPage(slug)
    if (!content) {
      console.log(`  SKIP: ${slug} (no county config)`)
      skipped++
      continue
    }
    const file = pageFileSource(content)
    const path = join(APP_DIR, slug, 'page.tsx')
    writeFileSync(path, file, 'utf8')
    console.log(`  REGEN: ${slug} (county)`)
    regenerated++
  }

  console.log(`\nRegenerated ${regenerated} pages, skipped ${skipped}.`)
}

main()
