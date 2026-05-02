// ---------------------------------------------------------------------------
// VERMONT REBATE PLAYBOOKS — top 5 priority programs
//
// Each playbook tells the homeowner exactly HOW to capture a rebate, not just
// that it exists. The existing rebates.ts answers "what programs exist" —
// this file answers "what do I do, in what order, with what paperwork, by
// when, and what disqualifies me."
//
// Confidence flags on every field. Anything marked CONFIDENCE_LOW or
// CONFIDENCE_MEDIUM needs verification against current program docs before
// surfacing in the paid briefing. CONFIDENCE_HIGH = matches Vermont program
// docs as of late 2025/early 2026 to my best knowledge but should still be
// spot-checked quarterly. Programs change.
//
// SOURCES TO VERIFY AGAINST:
// - efficiencyvermont.com (EVT programs)
// - greenmountainpower.com/rebates (GMP utility)
// - bedvt.com (Burlington Electric)
// - vppsa.com (Vermont Public Power)
// - irs.gov/forms-pubs/about-form-5695 (federal 25D)
// ---------------------------------------------------------------------------

import type { State } from './_types'
import { DEFAULT_STATE } from './_types'

export type ConfidenceLevel = 'CONFIDENCE_HIGH' | 'CONFIDENCE_MEDIUM' | 'CONFIDENCE_LOW'

export type RebatePlaybook = {
  programId: string
  state: State
  name: string
  oneLineValue: string

  form: {
    name: string
    url: string
    confidence: ConfidenceLevel
    notes?: string
  }

  filer: {
    who: 'homeowner' | 'installer' | 'utility' | 'shared'
    detail: string
    confidence: ConfidenceLevel
  }

  deadline: {
    rule: string
    confidence: ConfidenceLevel
    notes?: string
  }

  documentation: {
    items: string[]
    confidence: ConfidenceLevel
    notes?: string
  }

  eligibility: {
    items: string[]
    confidence: ConfidenceLevel
  }

  trap: {
    description: string
    confidence: ConfidenceLevel
  }

  timeToReceive: {
    estimate: string
    confidence: ConfidenceLevel
  }

  stacksWith: string[]
  conflictsWith: string[]

  contractorRequirements?: {
    description: string
    listUrl?: string
    confidence: ConfidenceLevel
  }
}

export const REBATE_PLAYBOOKS: RebatePlaybook[] = [
  {
    programId: 'evt_weatherization_standard',
    state: 'VT',
    name: 'EVT Home Performance with Energy Star — standard tier',
    oneLineValue: 'Up to $4,000 back on weatherization (75% of cost)',

    form: {
      name: 'Home Performance with Energy Star rebate application',
      url: 'https://www.efficiencyvermont.com/rebates/list/home-performance-with-energy-star',
      confidence: 'CONFIDENCE_MEDIUM',
      notes: "EVT generally requires the BPI auditor or contractor to submit on the homeowner’s behalf. Standalone homeowner-submitted forms exist for some sub-programs but the Home Performance program is contractor-filed. URL may redirect — verify current EVT rebate page.",
    },

    filer: {
      who: 'installer',
      detail: 'EVT-approved BPI-certified contractor submits rebate paperwork after work completion. Homeowner signs the application but does not file directly.',
      confidence: 'CONFIDENCE_HIGH',
    },

    deadline: {
      rule: 'Application typically due within 90 days of project completion',
      confidence: 'CONFIDENCE_MEDIUM',
      notes: 'Verify on current EVT rebate page — historically 60-120 days, varies by program year',
    },

    documentation: {
      items: [
        'Completed pre-work energy audit (BPI auditor report)',
        'Itemized contractor invoice with line items per work type (air sealing vs insulation vs other)',
        'Proof of payment',
        'Blower door test results (pre and post if available)',
        'Photos of work completed (some auditors include these)',
      ],
      confidence: 'CONFIDENCE_MEDIUM',
      notes: 'Itemized invoice is critical — EVT can reject a flat-rate invoice that lumps weatherization with other work',
    },

    eligibility: {
      items: [
        'Owner-occupied single-family or 2-4 unit residence',
        'Located in Vermont',
        'Has not received the standard tier for the same measures in the last 7 years',
        'BPI-certified energy audit completed before work begins',
        'Work performed by EVT-approved contractor',
      ],
      confidence: 'CONFIDENCE_HIGH',
    },

    trap: {
      description: 'Using a contractor not on the EVT-approved list voids the rebate completely. The homeowner does the work, pays for it, and then EVT denies the claim because the contractor was not approved. Always verify contractor is on the current EVT list before signing the contract — list is updated periodically.',
      confidence: 'CONFIDENCE_HIGH',
    },

    timeToReceive: {
      estimate: '4-8 weeks after EVT receives complete paperwork',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    stacksWith: ['oil_to_electric', 'evt_panel_upgrade', 'federal_25d_solar', 'evt_heatpump_water_heater'],
    conflictsWith: ['evt_weatherization_income', 'wap_low_income', 'evt_diy_weatherization'],

    contractorRequirements: {
      description: 'Contractor must be on the EVT Home Performance with Energy Star approved list. List is published on EVT website.',
      listUrl: 'https://www.efficiencyvermont.com/contractor-network',
      confidence: 'CONFIDENCE_MEDIUM',
    },
  },
  {
    programId: 'evt_weatherization_income',
    state: 'VT',
    name: 'EVT Home Performance — income-qualified tier (HEAT)',
    oneLineValue: 'Up to $9,500 back on weatherization (90% of cost) if at or below 80% AMI',

    form: {
      name: 'Income-qualified Home Performance application + income verification packet',
      url: 'https://www.efficiencyvermont.com/rebates/list/home-performance-with-energy-star',
      confidence: 'CONFIDENCE_MEDIUM',
      notes: 'Same base form as standard tier with income documentation packet attached. Sometimes routed through Community Action Agency (CAP) instead of EVT directly — depends on county.',
    },

    filer: {
      who: 'shared',
      detail: 'Homeowner submits income verification packet. Contractor submits work paperwork. EVT (or CAP agency) reviews both before payment.',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    deadline: {
      rule: 'Income verification valid for 12 months. Project must complete within that window. Rebate application due within 90 days of completion.',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    documentation: {
      items: [
        'Most recent federal tax return (1040) for all household members',
        'Pay stubs for last 60 days (all working household members)',
        'Social Security or pension award letters if applicable',
        'Unemployment statements if applicable',
        'Self-employed: profit/loss statement + bank statements',
        'Pre-work BPI audit',
        'Itemized contractor invoice',
        'Proof of payment',
      ],
      confidence: 'CONFIDENCE_HIGH',
    },

    eligibility: {
      items: [
        'Household income at or below 80% Area Median Income for your county',
        'Owner-occupied (single-family or 2-4 unit, owner lives in one unit)',
        'Has not received income-qualified weatherization in last 7 years',
        'BPI audit completed before work',
      ],
      confidence: 'CONFIDENCE_HIGH',
    },

    trap: {
      description: 'Many Vermont homeowners qualify for the income tier but never apply for it because they assume they make too much. Vermont 80% AMI is higher than people guess — for a 3-person Chittenden County household it is roughly $80,000-90,000 (verify current AMI tables). Check ami80ForCounty() before assuming standard tier. The dollar difference is $5,500 ($4,000 standard vs $9,500 income).',
      confidence: 'CONFIDENCE_HIGH',
    },

    timeToReceive: {
      estimate: '6-12 weeks (income verification adds review time)',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    stacksWith: ['oil_to_electric', 'evt_panel_upgrade', 'federal_25d_solar', 'evt_heatpump_water_heater', 'evt_ducted_heatpump', 'evt_ductless_minisplit'],
    conflictsWith: ['evt_weatherization_standard', 'wap_low_income'],

    contractorRequirements: {
      description: 'Same as standard tier — EVT-approved contractor required',
      listUrl: 'https://www.efficiencyvermont.com/contractor-network',
      confidence: 'CONFIDENCE_MEDIUM',
    },
  },
  {
    programId: 'evt_ducted_heatpump',
    state: 'VT',
    name: 'EVT Cold Climate Heat Pump rebate — ducted',
    oneLineValue: 'Up to ~$2,200 on a NEEP-listed cold-climate ducted heat pump',

    form: {
      name: 'EVT Heat Pump rebate application',
      url: 'https://www.efficiencyvermont.com/rebates/list/heat-pumps',
      confidence: 'CONFIDENCE_MEDIUM',
      notes: 'Generally installer-submitted at time of rebate processing. Some utility-administered variants exist (GMP separate process).',
    },

    filer: {
      who: 'installer',
      detail: 'Heat pump installer files. Homeowner signs the rebate assignment.',
      confidence: 'CONFIDENCE_HIGH',
    },

    deadline: {
      rule: 'Application typically due within 90 days of installation',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    documentation: {
      items: [
        'Itemized installation invoice (model number, serial numbers, BTU rating, AHRI certificate number)',
        'Proof of payment',
        'NEEP cold-climate listing reference for the installed model',
        'AHRI matched system certificate',
        'Manual J load calculation (some variants require this)',
      ],
      confidence: 'CONFIDENCE_MEDIUM',
      notes: 'AHRI certificate is non-negotiable. Without it the rebate is denied. Confirm installer pulls and includes it.',
    },

    eligibility: {
      items: [
        'NEEP-listed cold-climate model (HSPF and capacity at 5 degrees F meet thresholds)',
        'Owner-occupied or rental property in VT',
        'Installed by Vermont licensed HVAC contractor',
        'AHRI matched system (indoor + outdoor units paired correctly)',
      ],
      confidence: 'CONFIDENCE_HIGH',
    },

    trap: {
      description: 'Installing a heat pump that is NOT on the NEEP cold-climate list. Some HVAC contractors push standard heat pumps that work in mild climates but underperform below 5 degrees F. The rebate requires NEEP listing AND adequate cold-climate performance specs. Always cross-reference the proposed model against the current NEEP listing before signing. Search "NEEP cold climate heat pump list" — updated periodically.',
      confidence: 'CONFIDENCE_HIGH',
    },

    timeToReceive: {
      estimate: '4-8 weeks after EVT receives complete paperwork',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    stacksWith: ['evt_weatherization_standard', 'evt_weatherization_income', 'oil_to_electric', 'evt_panel_upgrade'],
    conflictsWith: ['evt_ductless_minisplit'],

    contractorRequirements: {
      description: 'Vermont licensed HVAC contractor. Some EVT bonus rebates require NEEP-trained installer.',
      listUrl: 'https://neep.org/heating-cooling/cold-climate-air-source-heat-pump-list',
      confidence: 'CONFIDENCE_MEDIUM',
    },
  },
  {
    programId: 'federal_25d_solar',
    state: 'federal',
    name: 'Federal Residential Clean Energy Credit (Section 25D)',
    oneLineValue: '30% federal tax credit on solar, battery storage, geothermal, and small wind. No cap. Through 2032.',

    form: {
      name: 'IRS Form 5695 — Residential Energy Credits',
      url: 'https://www.irs.gov/forms-pubs/about-form-5695',
      confidence: 'CONFIDENCE_HIGH',
      notes: 'Form 5695 filed with annual federal tax return for the year of installation. Credit applies to qualified expenditures including labor and equipment.',
    },

    filer: {
      who: 'homeowner',
      detail: 'Homeowner files Form 5695 with their annual tax return for the tax year work was completed. Tax preparer typically handles this. Installer does not file.',
      confidence: 'CONFIDENCE_HIGH',
    },

    deadline: {
      rule: 'Filed with annual tax return — April 15 deadline (or extension date) of the year following installation',
      confidence: 'CONFIDENCE_HIGH',
      notes: 'Credit can carry forward to future tax years if it exceeds tax liability in installation year. Specific carryforward rules — verify with tax preparer.',
    },

    documentation: {
      items: [
        'Receipts for qualified equipment + labor',
        "Manufacturer’s certification statement that equipment qualifies",
        'For solar: PV system specifications, kW capacity, install date',
        'For battery: capacity (must be 3+ kWh), install date',
        'For geothermal: equipment energy efficiency certifications',
      ],
      confidence: 'CONFIDENCE_HIGH',
    },

    eligibility: {
      items: [
        'Equipment installed at primary OR secondary residence in the US (rentals do not qualify)',
        'Solar: PV panels and qualifying balance-of-system equipment',
        'Battery storage: minimum 3 kWh capacity',
        'Geothermal: must meet ENERGY STAR requirements',
        'Equipment must be new (not used)',
        'Installation must be completed (not just paid for) in the tax year claimed',
      ],
      confidence: 'CONFIDENCE_HIGH',
    },

    trap: {
      description: 'Two common traps. (1) Including ineligible costs — landscaping, structural roof reinforcement (only the additional cost beyond a standard roof), and re-roofing under solar are NOT qualified expenditures. Only the solar/battery equipment + labor for installing it. (2) Claiming the credit before the system is operational and commissioned — install date for tax purposes is when the system is operational, not when the contract was signed. Solar systems waiting for utility net metering activation do not qualify until commissioning.',
      confidence: 'CONFIDENCE_HIGH',
    },

    timeToReceive: {
      estimate: 'Reduces federal tax liability when filed. If you owe taxes, credit reduces your bill. If credit exceeds liability, carry forward applies. Refund timing follows normal IRS refund schedule — typically 3-6 weeks after e-file acceptance.',
      confidence: 'CONFIDENCE_HIGH',
    },

    stacksWith: ['evt_solar_storage', 'vt_net_metering'],
    conflictsWith: [],

    contractorRequirements: {
      description: 'No federal contractor certification required, but the equipment must be NEW and meet specifications. Some installers provide manufacturer certification statements automatically; if not, request from manufacturer.',
      confidence: 'CONFIDENCE_HIGH',
    },
  },
  {
    programId: 'evt_panel_upgrade',
    state: 'VT',
    name: 'EVT Electrical Panel Upgrade rebate',
    oneLineValue: '~$500 rebate on panel upgrades that enable electrification (heat pump, EV charger, HPWH)',

    form: {
      name: 'EVT Panel Upgrade rebate application',
      url: 'https://www.efficiencyvermont.com/rebates/list/electrical-panel-upgrade',
      confidence: 'CONFIDENCE_LOW',
      notes: 'URL pattern matches EVT site structure but specific page may vary. Some utilities (GMP, BED, VPPSA) administer their own panel rebates separately — check by-utility.',
    },

    filer: {
      who: 'shared',
      detail: 'Electrician typically submits paperwork; homeowner may need to co-sign. Some utility-specific variants are utility-filed.',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    deadline: {
      rule: 'Typically 90 days after panel inspection passes',
      confidence: 'CONFIDENCE_LOW',
      notes: 'Verify on current EVT or utility page',
    },

    documentation: {
      items: [
        'Itemized electrician invoice (panel size before and after, AMP rating)',
        'Final electrical inspection sign-off (state or town)',
        'Proof of intent or installation of qualifying load (heat pump, EV charger, HPWH)',
        'Proof of payment',
      ],
      confidence: 'CONFIDENCE_MEDIUM',
    },

    eligibility: {
      items: [
        'Panel upgrade from <200A to 200A or larger (some programs require specific load increases)',
        'Vermont licensed electrician performs work',
        'Final inspection passes',
        'Some variants require demonstrated qualifying load (heat pump, HPWH, or EV charger installed or planned)',
      ],
      confidence: 'CONFIDENCE_MEDIUM',
    },

    trap: {
      description: 'Two common traps. (1) Standalone panel upgrades (no electrification load) may not qualify under all variants — the program is intended to enable heat pump/EV/HPWH installation, not general capacity upgrades. (2) DIY work does not qualify even if you are licensed elsewhere — must be a Vermont-licensed electrician with permit + inspection. Track down the utility-specific variant if applicable: GMP, BED, and VPPSA each may administer their own version with different dollar amounts.',
      confidence: 'CONFIDENCE_MEDIUM',
    },

    timeToReceive: {
      estimate: '4-8 weeks',
      confidence: 'CONFIDENCE_LOW',
    },

    stacksWith: ['evt_ducted_heatpump', 'evt_ductless_minisplit', 'evt_heatpump_water_heater', 'evt_ev_charger', 'evt_weatherization_standard', 'evt_weatherization_income'],
    conflictsWith: [],

    contractorRequirements: {
      description: 'Vermont licensed electrician with permit and final inspection',
      confidence: 'CONFIDENCE_HIGH',
    },
  },
]

// Returns playbooks for the requested state, plus federal entries.
// Calling with 'federal' returns ONLY federal entries.
export function getRebatePlaybooksForState(state: State): RebatePlaybook[] {
  if (state === 'federal') return REBATE_PLAYBOOKS.filter(p => p.state === 'federal')
  return REBATE_PLAYBOOKS.filter(p => p.state === state || p.state === 'federal')
}

export function playbookByProgramId(id: string): RebatePlaybook | null {
  return REBATE_PLAYBOOKS.find(p => p.programId === id) || null
}

export function stackedPlaybooks(programId: string): RebatePlaybook[] {
  const root = playbookByProgramId(programId)
  if (!root) return []
  return root.stacksWith
    .map(id => playbookByProgramId(id))
    .filter((p): p is RebatePlaybook => p !== null)
}

export function estimateStackValue(programIds: string[]): {
  programs: { id: string; oneLineValue: string }[]
  caveat: string
} {
  const programs = programIds
    .map(id => playbookByProgramId(id))
    .filter((p): p is RebatePlaybook => p !== null)
    .map(p => ({ id: p.programId, oneLineValue: p.oneLineValue }))
  return {
    programs,
    caveat: 'Actual stack value depends on project scope, eligibility verification, and current program-year rules. Final amounts confirmed by installer at time of filing.',
  }
}

export function lowConfidenceFields(): { programId: string; field: string; level: ConfidenceLevel }[] {
  const out: { programId: string; field: string; level: ConfidenceLevel }[] = []
  for (const p of REBATE_PLAYBOOKS) {
    if (p.form.confidence !== 'CONFIDENCE_HIGH') out.push({ programId: p.programId, field: 'form', level: p.form.confidence })
    if (p.filer.confidence !== 'CONFIDENCE_HIGH') out.push({ programId: p.programId, field: 'filer', level: p.filer.confidence })
    if (p.deadline.confidence !== 'CONFIDENCE_HIGH') out.push({ programId: p.programId, field: 'deadline', level: p.deadline.confidence })
    if (p.documentation.confidence !== 'CONFIDENCE_HIGH') out.push({ programId: p.programId, field: 'documentation', level: p.documentation.confidence })
    if (p.eligibility.confidence !== 'CONFIDENCE_HIGH') out.push({ programId: p.programId, field: 'eligibility', level: p.eligibility.confidence })
    if (p.trap.confidence !== 'CONFIDENCE_HIGH') out.push({ programId: p.programId, field: 'trap', level: p.trap.confidence })
    if (p.timeToReceive.confidence !== 'CONFIDENCE_HIGH') out.push({ programId: p.programId, field: 'timeToReceive', level: p.timeToReceive.confidence })
    if (p.contractorRequirements && p.contractorRequirements.confidence !== 'CONFIDENCE_HIGH') {
      out.push({ programId: p.programId, field: 'contractorRequirements', level: p.contractorRequirements.confidence })
    }
  }
  return out
}

export function rebatePlaybookSummaryForPrompt(state: State = DEFAULT_STATE): string {
  const lines: string[] = []
  lines.push('REBATE PLAYBOOK STRUCTURE (for the paid briefing):')
  lines.push('')
  lines.push('For each rebate, the briefing tells the homeowner: the form name and link, who files it (homeowner vs installer vs utility), the deadline, the documentation required, the eligibility checkpoints, the disqualifying trap, expected time to receive payment, and which contractors qualify.')
  lines.push('')
  lines.push('Top 5 priority playbooks built:')
  for (const p of getRebatePlaybooksForState(state)) {
    lines.push(`  - ${p.name}: ${p.oneLineValue}`)
  }
  lines.push('')
  lines.push('When the homeowner asks "how do I claim X" or "what do I need to file," reference that the playbook in their briefing covers form, filer, deadline, docs, traps. Do not improvise filing instructions — direct them to the briefing for the playbook detail or tell them you can mention the high-level structure but the specific form-and-deadline details belong in the briefing.')
  return lines.join('\n')
}
