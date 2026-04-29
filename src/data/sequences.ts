// ---------------------------------------------------------------------------
// VERMONT HOMEOWNER PROJECT SEQUENCES
//
// The order of operations matters more than which projects you pick. Doing
// things in the wrong order in Vermont specifically can cost real money:
// oversized heat pumps from skipping weatherization, voided rebates from
// missing the audit step, electrical panel work that has to be redone.
//
// Each sequence here is the right order for a common Vermont retrofit path,
// with the "why this first" reasoning, the trap to avoid, and which rebates
// apply at which step. The chat assistant uses these to give consistent
// order-of-operations guidance instead of generating it fresh each time.
// ---------------------------------------------------------------------------

export type SequenceStep = {
  step: number
  title: string
  what: string
  whyThisOrder: string
  trap: string
  applicableRebates: string[]
  vtTiming: string
  duration: string
}

export type ProjectSequence = {
  id: string
  title: string
  scenario: string
  triggers: string[]
  steps: SequenceStep[]
  rationale: string
  assumes: string
  ifDifferent: string
  totalCostMidVT: string
  totalRebateStack: string
}

export const PROJECT_SEQUENCES: ProjectSequence[] = [
  {
    id: 'oil_to_heat_pump',
    title: 'Switching from oil heat to heat pumps',
    scenario: 'Vermont homeowner with an oil furnace wants to switch to heat pumps. Most common Vermont retrofit path.',
    triggers: ['switching from oil', 'oil furnace replacement', 'heat pump conversion', 'getting rid of oil', 'oil to electric', 'oil furnace dying'],
    rationale: 'Weatherize before sizing the heat pump, or you pay for a heat pump bigger and more expensive than you need. Vermont homes leak heat. A tighter house also runs the heat pump in its efficient operating range more of the year.',
    assumes: 'Owner-occupied single-family home with existing oil furnace. Electrical panel adequate or upgradeable. House is at least 30 years old.',
    ifDifferent: 'If the panel is already 200A and modern, skip step 3. If post-2010 and already tight, weatherization rebate value drops and you can move faster to step 4. For hybrid systems (heat pump + wood backup), heat pump can be sized smaller.',
    totalCostMidVT: '$15,000 to $35,000 out of pocket after rebates, depending on home size and weatherization scope',
    totalRebateStack: 'Up to ~$7,000 standard tier, up to ~$13,000 if income-qualified (80% AMI or below), plus federal 25D if any solar is added',
    steps: [
      {
        step: 1,
        title: 'Free EVT energy audit',
        what: 'Schedule a free energy audit through Efficiency Vermont. Auditor walks the home, blower-door tests, identifies air sealing and insulation priorities, prepares rebate paperwork.',
        whyThisOrder: 'Audit is a prerequisite for the income-qualified weatherization tier. Even for standard tier, audit identifies which work qualifies. Skip this and you might do work that does not get rebated.',
        trap: 'Starting weatherization work before the audit. EVT requires the audit on file before work begins for the rebate to apply.',
        applicableRebates: ['EVT energy audit (free)'],
        vtTiming: 'April-May (mud season availability) or September-October (before winter rush). Avoid December-February when audits book out 4-6 weeks.',
        duration: '2-3 hours on site, written report 1-2 weeks later',
      },
      {
        step: 2,
        title: 'Weatherization (air sealing + insulation)',
        what: 'Air sealing throughout the building envelope, attic insulation to R-49+, basement rim joists, any wall insulation gaps. EVT-approved contractor.',
        whyThisOrder: 'A leaky Vermont house has a heat load that drives heat pump sizing 30-50% larger than needed. Tighten first and the heat pump in step 4 is smaller, cheaper, more efficient. Highest-ROI step.',
        trap: 'Using a contractor not on the EVT preferred list. Rebate is void if contractor is not approved. Confirm before signing.',
        applicableRebates: ['EVT weatherization standard (75% up to $4,000)', 'EVT weatherization income-qualified (90% up to $9,500) if at or below 80% AMI', 'WAP if income-qualified — services may be free'],
        vtTiming: 'Spring through early fall. Cellulose blowers cannot work below freezing. Schedule May-October.',
        duration: '2-5 days on site',
      },
      {
        step: 3,
        title: 'Electrical panel assessment and upgrade if needed',
        what: 'Vermont licensed electrician assesses whether panel can handle future heat pump load (typically 30-50A new circuit). Upgrade from 100A to 200A if needed.',
        whyThisOrder: 'Many VT homes have 100A or 150A panels that will not support a heat pump plus existing loads. Discovering on heat pump install day is a 2-3 week delay. Sort separately. Also: $500 utility panel rebate is easier to capture as standalone step.',
        trap: 'Skipping assessment because "the electrician can deal with it on heat pump install day." Heat pump installers do not always do panel work.',
        applicableRebates: ['Utility electrical panel rebate ($500, varies by utility)'],
        vtTiming: 'Any time of year — interior work',
        duration: 'Assessment 1 hour, upgrade 4-8 hours if needed',
      },
      {
        step: 4,
        title: 'Heat pump install (sized for now-tighter house)',
        what: 'NEEP cold-climate heat pump install. Ducted or ductless. Sized based on Manual J calculation for the post-weatherization home.',
        whyThisOrder: 'Heat pump now sized for tightened envelope, not leaky one. Manual J done after weatherization, not before. Sizing on original loose-house heat load means heat pump 25-40% larger than necessary.',
        trap: 'Letting installer size from a quick walkthrough instead of Manual J. Bigger is not better with heat pumps — oversized systems short-cycle and lose efficiency.',
        applicableRebates: ['EVT heat pump rebate (ducted ~$2,200, ductless ~$475/head)', 'Oil-to-electric bonus (+$400)', 'GMP income bonus (+$2,000) if GMP customer and income-qualified', 'VPPSA income bonus (+$1,000) if VPPSA territory and income-qualified'],
        vtTiming: 'Spring-summer install gives time to dial in before winter. Avoid November-December rush.',
        duration: '1-3 days install, 1-2 weeks lead time on equipment',
      },
      {
        step: 5,
        title: 'Oil tank decommission',
        what: 'Drain oil tank, abandon-in-place certification (if buried) or removal (if above-ground). Required if switching to fully electric heating.',
        whyThisOrder: 'Last because the oil furnace stays as backup until heat pump is dialed in through one Vermont winter. Decommissioning before that means no fallback if heat pump has install issues.',
        trap: 'Leaving a buried oil tank in place "for now." VT insurance increasingly requires buried tank removal. A leak triggers DEC cleanup of $5,000-50,000+.',
        applicableRebates: ['No specific rebate, but qualifies you for the +$400 oil-to-electric bonus on heat pump rebate'],
        vtTiming: 'After one full winter of heat pump operation, typically March-April of following year',
        duration: '$300-800, half a day on site',
      },
    ],
  },
  {
    id: 'full_electrification',
    title: 'Full home electrification: weatherize, heat pump, heat pump water heater',
    scenario: 'Vermont homeowner doing the full retrofit in one coordinated push. Going all-electric.',
    triggers: ['going all electric', 'full electrification', 'getting off fossil fuels', 'heat pump and water heater', 'whole home retrofit'],
    rationale: 'Same logic as oil-to-heat-pump, plus water heater swap. Stack the work so electrician does panel + heat pump circuit + HPWH circuit in one visit, saving 2-3 hours of labor and possibly bundled permit fees.',
    assumes: 'Owner-occupied home with existing fossil-fuel heating and a tank water heater 8+ years old (or already failed).',
    ifDifferent: 'If water heater is brand new, defer step 5 until it actually fails. If natural gas instead of oil, same sequence applies but no oil-to-electric bonus.',
    totalCostMidVT: '$18,000 to $42,000 out of pocket after rebates',
    totalRebateStack: 'Up to ~$8,200 standard tier, up to ~$15,000 income-qualified',
    steps: [
      {
        step: 1,
        title: 'Free EVT energy audit',
        what: 'Audit identifies envelope priorities AND advises on hot water needs.',
        whyThisOrder: 'Audit gates the income-qualified tier and identifies right HPWH sizing.',
        trap: 'Starting work before audit voids rebates.',
        applicableRebates: ['EVT energy audit (free)'],
        vtTiming: 'April-May or September-October',
        duration: '2-3 hours, report in 1-2 weeks',
      },
      {
        step: 2,
        title: 'Weatherization',
        what: 'Air sealing, insulation. Same as oil-to-heat-pump step 2.',
        whyThisOrder: 'Tighten envelope before sizing any new equipment.',
        trap: 'Non-EVT-approved contractor voids rebate.',
        applicableRebates: ['EVT weatherization standard or income-qualified', 'WAP if income-qualified'],
        vtTiming: 'May-October',
        duration: '2-5 days',
      },
      {
        step: 3,
        title: 'Panel upgrade + new circuits in one visit',
        what: 'Electrician assesses panel, upgrades to 200A if needed, pulls dedicated circuits for both heat pump (30-50A) and HPWH (30A). One trip, one permit, one inspection.',
        whyThisOrder: 'Bundling saves significant labor cost. Three separate visits for panel + heat pump + water heater is 4-8 extra billable hours.',
        trap: 'Forgetting to plan circuit space for HPWH at panel upgrade. Coming back later means another permit and inspection.',
        applicableRebates: ['Utility electrical panel rebate ($500)'],
        vtTiming: 'Any time',
        duration: '4-10 hours',
      },
      {
        step: 4,
        title: 'Heat pump install',
        what: 'Cold-climate heat pump sized for tightened home. NEEP-listed equipment.',
        whyThisOrder: 'Same logic as oil-to-heat-pump step 4.',
        trap: 'Oversized system from skipping Manual J.',
        applicableRebates: ['EVT heat pump rebate', 'Oil-to-electric bonus if applicable', 'Utility income bonus if applicable'],
        vtTiming: 'Spring-summer',
        duration: '1-3 days',
      },
      {
        step: 5,
        title: 'Heat pump water heater',
        what: 'Replace tank water heater with HPWH. Located in basement or utility space, not closet.',
        whyThisOrder: 'After panel upgrade so circuit is ready. Can be done same week as heat pump or as separate visit.',
        trap: 'Putting HPWH in a closet — needs 700+ cubic feet of air to draw heat from. Closet installs short-cycle.',
        applicableRebates: ['EVT HPWH rebate ($600)'],
        vtTiming: 'Any time',
        duration: 'Half day',
      },
    ],
  },
  {
    id: 'solar_storage',
    title: 'Adding solar plus battery storage in Vermont',
    scenario: 'Vermont homeowner adding rooftop solar with battery backup. Either alongside or after electrification.',
    triggers: ['solar panels', 'rooftop solar', 'battery backup', 'solar plus storage', 'going solar'],
    rationale: 'Solar should come AFTER electrification because system size depends on post-electrification load. Putting solar on first means you size for the wrong load.',
    assumes: 'Roof in good condition (10+ years remaining life), south-facing or east/west with good exposure, no major shading.',
    ifDifferent: 'If roof more than 15 years old, replace roof FIRST. Solar adds 25-30 years of life expectations and re-roofing under existing solar is brutally expensive ($3,000-8,000 to remove and reinstall the array).',
    totalCostMidVT: '$18,000 to $40,000 out of pocket after rebates and federal credit, for a 6-10kW system with battery',
    totalRebateStack: 'Federal 25D 30% (no cap, through 2032). EVT solar+storage rebate up to $4,000. State and utility net metering rates.',
    steps: [
      {
        step: 1,
        title: 'Roof condition assessment',
        what: 'Roofer assesses the roof. Less than 10 years remaining life: replace before solar. 15+ years: proceed.',
        whyThisOrder: 'Re-roofing under solar is $3,000-8,000 surprise. Cheapest decision to get right at the start.',
        trap: 'Skipping inspection because roof "looks fine." A roofer can assess remaining life accurately. A homeowner cannot.',
        applicableRebates: ['None for inspection — typically free from a roofer hoping to bid the work'],
        vtTiming: 'Any time',
        duration: '1 hour',
      },
      {
        step: 2,
        title: 'Energy audit and load analysis',
        what: 'Get EVT audit if not already done, plus pull 12 months of electric bills to understand actual annual kWh use.',
        whyThisOrder: 'Solar sizing depends on annual electric load. Without post-electrification load, you size wrong.',
        trap: 'Sizing solar based on last year electric bills when you are about to add a heat pump that will double your load.',
        applicableRebates: ['EVT audit free'],
        vtTiming: 'Any time',
        duration: '2-3 hours',
      },
      {
        step: 3,
        title: 'Solar installer bids — get 3',
        what: 'Bids from at least 3 NEEP-listed Vermont solar installers. Compare $/watt installed, equipment warranties, monitoring included.',
        whyThisOrder: 'Solar pricing varies wildly in VT. $2.50/watt vs $4.00/watt is the difference between a $20,000 and $32,000 system for same capacity.',
        trap: 'Going with first bid because salesperson was nice. Bidding is exactly where you save $5,000-10,000.',
        applicableRebates: ['None at bid stage'],
        vtTiming: 'Any time, but bids may take 2-4 weeks each',
        duration: '4-8 weeks for full bidding process',
      },
      {
        step: 4,
        title: 'Net metering interconnection application',
        what: 'Installer files net metering interconnection with utility (GMP, BED, VPPSA, etc.). Required before install.',
        whyThisOrder: 'Net metering approval can take 30-90 days. Run in parallel with permit applications.',
        trap: 'Letting installer skip net metering because "we will deal with it later." Panels do not pay you back without net metering active.',
        applicableRebates: ['Net metering not a rebate but is the value flow that makes solar economic'],
        vtTiming: 'Any time',
        duration: '30-90 days approval',
      },
      {
        step: 5,
        title: 'Solar install',
        what: 'Mount, wire, inverter, battery if specified. Inspector signs off. Utility commissions and net meter goes live.',
        whyThisOrder: 'Net metering and permits both need to be live before commissioning.',
        trap: 'Adding battery as afterthought. Decide at quote stage, because it changes inverter and wiring choices.',
        applicableRebates: ['Federal 25D 30% (claim on tax return for install year)', 'EVT solar+storage rebate up to $4,000 (file post-install)'],
        vtTiming: 'May-October install window — installers slow in winter for safety reasons',
        duration: '2-4 days install',
      },
    ],
  },
  {
    id: 'adu_build',
    title: 'Building an ADU on existing property',
    scenario: 'Vermont homeowner adding an ADU — basement conversion, garage conversion, addition, or detached structure.',
    triggers: ['building an ADU', 'accessory dwelling unit', 'in-law apartment', 'rental unit on my property', 'basement apartment', 'guest house'],
    rationale: 'ADU sequencing dominated by zoning and permit logic, not construction. Get zoning right BEFORE design, design BEFORE bid, bid BEFORE financing. Out of order wastes thousands in design fees on a project that turns out illegal in your town.',
    assumes: 'Owner-occupied primary residence in a Vermont municipality. Some towns easier than others; Act 47 statewide rules apply where local zoning silent.',
    ifDifferent: 'If town has stricter local rules than Act 47 (some do), local rules apply. Historic district adds 4-6 weeks of review on top of standard permits.',
    totalCostMidVT: '$80,000 (basement conversion) to $250,000+ (detached new build)',
    totalRebateStack: 'Limited rebates apply directly. Energy efficiency rebates apply to the new unit if highly efficient.',
    steps: [
      {
        step: 1,
        title: 'Town zoning check',
        what: 'Visit town clerk OR zoning administrator. Confirm what kind of ADU is allowed at your address: attached only, detached, max sq ft, owner-occupancy required, parking minimums, setbacks.',
        whyThisOrder: 'Zoning answers determine the rest. Spending $5,000 on plans for a detached ADU when town caps detached at 600 sq ft is a $5,000 mistake.',
        trap: 'Trusting Act 47 statewide rules without checking local overlay. Some VT towns layer restrictions (Stowe, Burlington).',
        applicableRebates: ['None'],
        vtTiming: 'Any time, town offices have limited hours',
        duration: '1-2 hours, possibly multiple visits',
      },
      {
        step: 2,
        title: 'Architectural design',
        what: 'Hire architect or designer. Plans must conform to zoning constraints from step 1.',
        whyThisOrder: 'Plans drive the bid. Without plans, contractors quote vague and high. With plans, bids comparable.',
        trap: 'Going to contractor first and letting them sketch design. Contractor-designed ADUs maximize their margin, not your usable space.',
        applicableRebates: ['None at design stage'],
        vtTiming: 'Any time',
        duration: '4-8 weeks',
      },
      {
        step: 3,
        title: 'Permit submission',
        what: 'Submit zoning permit, building permit, septic permits to the town. Some require neighborhood notice (15-30 day waiting period).',
        whyThisOrder: 'Permits can take 30-90 days. Submit early so they approve while you bid.',
        trap: 'Skipping septic permit. Adding a bedroom or unit can trigger septic system review. Surprise septic upgrades are $15,000-30,000.',
        applicableRebates: ['None'],
        vtTiming: 'Any time, town review slowest in summer',
        duration: '30-90 days approval',
      },
      {
        step: 4,
        title: 'Contractor bids — get 3',
        what: 'Three bids from VT-registered general contractors who do ADU work. Compare scope, timeline, exclusions.',
        whyThisOrder: 'Bid with permits in hand and plans final. Bids on incomplete plans always go up via change orders.',
        trap: 'Accepting low bid without checking what is excluded. Many low ADU bids exclude site work, utility hookups, finishes — adding $20,000-40,000.',
        applicableRebates: ['None at bid stage'],
        vtTiming: '4-6 weeks',
        duration: '4-6 weeks',
      },
      {
        step: 5,
        title: 'Construction',
        what: 'Standard ADU build. Track progress against contract milestones. Inspect before each progress payment.',
        whyThisOrder: 'Last because every prior step is a precondition.',
        trap: 'Paying final 10% before punch list complete and signed. Final payment is your only leverage to fix small issues.',
        applicableRebates: ['Energy efficiency rebates (heat pump, panel) if applicable to new unit'],
        vtTiming: 'Spring-fall ideal; winter possible but slower for exterior',
        duration: '4-8 months for new construction, 6-12 weeks for basement conversion',
      },
    ],
  },
  {
    id: 'roof_then_solar',
    title: 'Re-roofing then adding solar',
    scenario: 'Vermont homeowner whose roof is at end of life and is also considering solar. Critical to do these in order.',
    triggers: ['old roof and solar', 'reroof and solar', 'should I do roof or solar first', 'roof under solar', 'roof replacement'],
    rationale: 'Solar arrays last 25-30 years. Asphalt roofs last 20-30. If your roof is more than 10 years old, do the roof first. Re-roofing under existing solar costs $3,000-8,000 just to remove and reinstall the array.',
    assumes: 'Roof shows wear (curling shingles, missing shingles, granules in gutters) or known to be 15+ years old.',
    ifDifferent: 'If roof genuinely under 10 years old, skip step 1 and go straight to solar. Get roofer assessment letter to be sure.',
    totalCostMidVT: '$15,000-25,000 for roof + $20,000-35,000 for 6-8kW solar after federal credit',
    totalRebateStack: 'Federal 25D 30% on solar. EVT solar+storage rebate up to $4,000.',
    steps: [
      {
        step: 1,
        title: 'Roof replacement',
        what: 'Asphalt or metal. Vermont metal roofs last 40-60 years, asphalt 20-30. For solar compatibility, asphalt is fine but metal lasts longer than panels.',
        whyThisOrder: 'Roof first so solar mounts onto fresh substrate that will outlast the panels.',
        trap: 'Choosing cheapest asphalt when roof will need replacement before panels do. Spend extra $2,000-4,000 for premium asphalt or metal — pays for itself by avoiding panel-removal cost in 20 years.',
        applicableRebates: ['None on roofing typically; some insurers offer credits for impact-rated shingles'],
        vtTiming: 'May-October install window, avoid wet weather',
        duration: '2-4 days',
      },
      {
        step: 2,
        title: 'Solar planning and bidding',
        what: 'Get 3 solar bids on the new roof. Roof is in known condition; bids do not need to discount for roof risk.',
        whyThisOrder: 'New roof gives installers full confidence in mount integrity. Bids come in cleaner.',
        trap: 'Letting same contractor do roof and solar without separate bids. Bundled pricing often hides markup. Get them as separate jobs.',
        applicableRebates: ['None at bid stage'],
        vtTiming: 'Any time',
        duration: '4-8 weeks bidding',
      },
      {
        step: 3,
        title: 'Solar install',
        what: 'Standard solar install on the new roof.',
        whyThisOrder: 'Last because everything is a precondition.',
        trap: 'Letting installer use cheap roof penetrations. Quality flashing kits non-negotiable for a roof you just paid for.',
        applicableRebates: ['Federal 25D 30%', 'EVT solar+storage rebate up to $4,000'],
        vtTiming: 'May-October',
        duration: '2-4 days install',
      },
    ],
  },
  {
    id: 'kitchen_bath_combined',
    title: 'Kitchen and bathroom renovation in one project',
    scenario: 'Vermont homeowner doing both a kitchen and at least one bathroom in a coordinated push. Common pattern after home purchase or as a major refresh.',
    triggers: ['kitchen and bathroom remodel', 'whole home refresh', 'doing kitchen and bath', 'renovating after purchase', 'major renovation'],
    rationale: 'Kitchen and bath share contractors (plumbers, electricians, tile setters, cabinet installers). Sequencing right keeps each trade busy and minimizes mobilization. Wrong means each trade comes back twice.',
    assumes: 'Both spaces coming down to studs or close to it. Significant plumbing and electrical work involved.',
    ifDifferent: 'If only one space goes to studs and the other is cosmetic, do them as separate projects with the cosmetic one second.',
    totalCostMidVT: '$50,000-150,000 combined depending on town tier and finish level',
    totalRebateStack: 'Limited — energy rebates may apply if you swap a water heater or add efficient appliances. Renovation itself not rebated.',
    steps: [
      {
        step: 1,
        title: 'Design and selection',
        what: 'Layouts, cabinets, tile, fixtures for BOTH spaces upfront. Lock in everything before construction.',
        whyThisOrder: 'Lead times on cabinets are 8-16 weeks. Lock orders early or construction stalls waiting for materials.',
        trap: 'Starting demo before all selections made. Half-finished selections during construction means change orders, delays, budget creep.',
        applicableRebates: ['None'],
        vtTiming: 'Budget 6-10 weeks',
        duration: '6-10 weeks',
      },
      {
        step: 2,
        title: 'Demolition (both spaces same week)',
        what: 'Demo kitchen and bath in one mobilization. One dumpster.',
        whyThisOrder: 'One demo mobilization vs two saves $1,500-3,000. Dumpster, dust protection, debris removal all shared.',
        trap: 'Demoing both but living without a working kitchen for 8 weeks. Plan a temporary kitchen setup before demo day.',
        applicableRebates: ['None'],
        vtTiming: 'Spring or fall — windows can be open for dust',
        duration: '3-5 days',
      },
      {
        step: 3,
        title: 'Rough plumbing and electrical (both spaces)',
        what: 'Plumber and electrician work on both spaces same week. Inspection covers both.',
        whyThisOrder: 'One mobilization, one inspection, one round of corrections. Sequential doubles time and inspection fees.',
        trap: 'Forgetting to coordinate fixture selections with rough-in. Tubs, sinks, dishwashers have specific rough-in requirements.',
        applicableRebates: ['Possible HPWH rebate if you replace water heater during plumbing rough-in'],
        vtTiming: 'Any time',
        duration: '1-2 weeks',
      },
      {
        step: 4,
        title: 'Drywall and paint (both spaces)',
        what: 'Same drywaller, same painter, same week. Tape, finish, paint both.',
        whyThisOrder: 'Drywall and paint hate dust from active construction. Get them done while no other trade is active.',
        trap: 'Painting before tile and cabinets are in. Touch-ups unavoidable later, but base coat now means less work later.',
        applicableRebates: ['None'],
        vtTiming: 'Any time',
        duration: '1-2 weeks',
      },
      {
        step: 5,
        title: 'Cabinets, tile, fixtures (kitchen first, bath second)',
        what: 'Install cabinets and tile in kitchen, then bath. Fixtures and final hookups follow.',
        whyThisOrder: 'Kitchen first because harder to live without. Get kitchen functional, then move trades to bath.',
        trap: 'Letting cabinet installer punch through finished tile to install. Cabinets go in BEFORE the floor tile under cabinets, not after.',
        applicableRebates: ['Possible Energy Star appliance rebates depending on year'],
        vtTiming: 'Any time',
        duration: '2-4 weeks each',
      },
      {
        step: 6,
        title: 'Punch list and final inspection',
        what: 'Walk both spaces with GC, identify finish defects, agree on completion. Pay final 10% only after sign-off.',
        whyThisOrder: 'Last leverage point. Hold final payment until punch list done.',
        trap: 'Signing off because you are tired and want it done. Take a day, walk both spaces with a checklist.',
        applicableRebates: ['None'],
        vtTiming: 'End of project',
        duration: '1-2 weeks',
      },
    ],
  },
]

export function sequenceById(id: string): ProjectSequence | null {
  return PROJECT_SEQUENCES.find(s => s.id === id) || null
}

export function sequencesForQuery(query: string): ProjectSequence[] {
  const q = query.toLowerCase()
  return PROJECT_SEQUENCES.filter(s =>
    s.triggers.some(t => q.includes(t.toLowerCase())) || q.includes(s.id.replace(/_/g, ' '))
  )
}

export function sequencesSummaryForPrompt(): string {
  const lines: string[] = []
  lines.push('VERMONT PROJECT SEQUENCES (order of operations):')
  lines.push('')

  for (const seq of PROJECT_SEQUENCES) {
    lines.push(`## ${seq.title}`)
    lines.push(`Scenario: ${seq.scenario}`)
    lines.push(`Why this order: ${seq.rationale}`)
    lines.push(`Assumes: ${seq.assumes}`)
    lines.push(`If different: ${seq.ifDifferent}`)
    lines.push(`Total mid-tier cost (VT): ${seq.totalCostMidVT}`)
    lines.push(`Total rebate stack possible: ${seq.totalRebateStack}`)
    lines.push('Steps:')
    for (const step of seq.steps) {
      lines.push(`  ${step.step}. ${step.title}`)
      lines.push(`     What: ${step.what}`)
      lines.push(`     Why this order: ${step.whyThisOrder}`)
      lines.push(`     Trap: ${step.trap}`)
      if (step.applicableRebates.length > 0) {
        lines.push(`     Rebates: ${step.applicableRebates.join('; ')}`)
      }
      lines.push(`     VT timing: ${step.vtTiming}`)
      lines.push(`     Duration: ${step.duration}`)
    }
    lines.push('')
  }

  lines.push('When the homeowner describes a project that matches one of these sequences, walk through the order and the why. Call out the trap at each step.')
  lines.push('When asked "what should I do first" or "in what order," reach for the matching sequence. Do not improvise from scratch.')
  lines.push('Sequences ABOVE override general advice. Always ground in the specific sequence when one applies.')

  return lines.join('\n')
}
