// Vermont rebate stack — single source of truth.
// 2026 figures. Update quarterly (EVT changes amounts, GMP/VPPSA bonuses).
// Federal status pinned to OBBBA (Sept 2025) — 25C expired Dec 31, 2025.

export type Utility = 'GMP' | 'BED' | 'VPPSA' | 'VGS' | 'WEC' | 'unknown'

export type Rebate = {
  id: string
  category: 'weatherization' | 'heat_pump' | 'water_heater' | 'solar' | 'ev_charger' | 'electrical' | 'oil_to_electric' | 'lead_safe' | 'home_repair'
  program: string
  who: string
  amount: string
  amountMaxUSD: number | null
  conditions: string
  howToClaim: string
  incomeLimit: 'none' | '80%_AMI' | '60%_AMI' | 'other'
  incomeBonus: string | null
  validFrom: string
  validThrough: string | null
  source: string
}

// ---------------------------------------------------------------------------
// FULL REBATE STACK
// ---------------------------------------------------------------------------

export const REBATES: Rebate[] = [
  // ─── WEATHERIZATION (the single most important category) ─────────────────
  {
    id: 'evt_weatherization_standard',
    category: 'weatherization',
    program: 'Efficiency Vermont Home Performance with ENERGY STAR',
    who: 'All Vermont households',
    amount: '75% of project cost',
    amountMaxUSD: 4000,
    conditions: 'Must use an EVT-network contractor. Project must include comprehensive air sealing AND insulation (attic, walls, basement). Pre/post blower door test required.',
    howToClaim: 'Hire EVT-network contractor — they file rebate paperwork on your behalf. Net out-of-pocket reflects rebate at invoicing.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/rebates',
  },
  {
    id: 'evt_weatherization_income',
    category: 'weatherization',
    program: 'Efficiency Vermont income-eligible weatherization',
    who: 'Households at or below 80% Area Median Income',
    amount: '90% of project cost',
    amountMaxUSD: 9500,
    conditions: 'Income verification required. 80% AMI varies by household size and county. Chittenden County (largest VT pop): household of 3 ~$96,750 (2026). Most rural counties run 15-25% lower.',
    howToClaim: 'Apply through EVT or partner agency. CVOEO, BROC, NEKCA, SEVCA depending on region. They confirm income eligibility, then dispatch contractor.',
    incomeLimit: '80%_AMI',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/income-eligible',
  },
  {
    id: 'wap_low_income',
    category: 'weatherization',
    program: 'Weatherization Assistance Program (WAP) — federal/state',
    who: 'Low-income households (typically below 60% State Median Income)',
    amount: '100% covered (free)',
    amountMaxUSD: 8000,
    conditions: 'Stricter income limits than EVT income-eligible. Priority for elderly, disabled, families with children. Average WAP project value ~$8,000.',
    howToClaim: 'Apply through Community Action Agency for your county (CVOEO, BROC, NEKCA, SEVCA). Long waitlist — apply early, typical wait 6-18 months.',
    incomeLimit: 'other',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'auditorvt.gov/wap',
  },
  {
    id: 'home_repair_program',
    category: 'home_repair',
    program: 'Home Repair Program',
    who: 'Low/moderate income households needing repairs that block weatherization',
    amount: 'Up to $15,000',
    amountMaxUSD: 15000,
    conditions: 'For repairs that must happen before weatherization can proceed: roof replacement, structural electrical, mold remediation, foundation work. Stacks WITH weatherization rebates.',
    howToClaim: 'Through Community Action Agency. Often combined with WAP application.',
    incomeLimit: 'other',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'auditorvt.gov',
  },
  {
    id: 'evt_diy_weatherization',
    category: 'weatherization',
    program: 'EVT DIY weatherization rebate',
    who: 'Anyone',
    amount: '$100 cash back on materials',
    amountMaxUSD: 100,
    conditions: 'Buy weatherstripping, foam, caulk, attic stairway covers, water heater blankets, pipe insulation. Submit receipts. No contractor required.',
    howToClaim: 'Submit receipts via EVT website within 90 days of purchase. Direct payment.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/diy',
  },
  {
    id: 'lead_safe_repair',
    category: 'lead_safe',
    program: 'Vermont Lead Safe + Healthy Homes Program',
    who: 'Homes built before 1978 with children under 6 or pregnant occupants',
    amount: 'Up to $20,000',
    amountMaxUSD: 20000,
    conditions: 'Lead paint mitigation, window replacement (lead-paint sash), exterior paint stabilization. Income-eligible. Stacks with weatherization.',
    howToClaim: 'Apply through VT Department of Health. Free home assessment first.',
    incomeLimit: '80%_AMI',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'healthvermont.gov/lead',
  },

  // ─── HEAT PUMPS ──────────────────────────────────────────────────────────
  {
    id: 'evt_ductless_minisplit',
    category: 'heat_pump',
    program: 'EVT cold-climate ductless heat pump rebate',
    who: 'All VT households (per indoor head)',
    amount: '$475 per indoor head',
    amountMaxUSD: 475,
    conditions: 'Must be ENERGY STAR cold-climate certified (HSPF ≥10, capacity at -5°F documented). Installer must be EVT-network certified.',
    howToClaim: 'Installer files rebate paperwork at job completion. Reflected in invoice.',
    incomeLimit: 'none',
    incomeBonus: 'GMP customers at ≤80% AMI: +$2,000 per condenser. VPPSA member-utility customers at ≤80% AMI: +$1,000 per condenser. BED: no income bonus.',
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/heat-pumps',
  },
  {
    id: 'evt_ducted_heatpump',
    category: 'heat_pump',
    program: 'EVT ducted whole-house heat pump rebate',
    who: 'All VT households',
    amount: '$2,200 per system',
    amountMaxUSD: 2200,
    conditions: 'Must be ENERGY STAR cold-climate ducted unit. EVT-network installer required. Must be primary heat (not just supplemental).',
    howToClaim: 'Installer files. Reflected in invoice.',
    incomeLimit: 'none',
    incomeBonus: 'GMP customers at ≤80% AMI: +$2,000. VPPSA at ≤80% AMI: +$1,000.',
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/heat-pumps',
  },
  {
    id: 'oil_to_electric',
    category: 'oil_to_electric',
    program: 'EVT fuel-switching bonus (oil to electric)',
    who: 'Households replacing oil furnace/boiler with heat pump as primary heat',
    amount: 'Additional $400 on top of ducted rebate',
    amountMaxUSD: 400,
    conditions: 'Must remove or decommission existing oil heating system. Documentation of fuel switch required. Stacks with EVT ducted rebate ($2,200) and income bonuses.',
    howToClaim: 'Installer files alongside main heat pump rebate.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/heat-pumps',
  },

  // ─── WATER HEATERS ───────────────────────────────────────────────────────
  {
    id: 'evt_heatpump_water_heater',
    category: 'water_heater',
    program: 'EVT heat pump water heater rebate',
    who: 'All VT households',
    amount: '$600',
    amountMaxUSD: 600,
    conditions: 'ENERGY STAR HPWH (Rheem ProTerra, AO Smith, Rheem Performance Platinum). Installation environment must be 50+ sq ft with heat source (basement OK if heated).',
    howToClaim: 'Installer files OR submit receipt to EVT for self-install (electrician permit required).',
    incomeLimit: 'none',
    incomeBonus: 'GMP +$300 for income-eligible. VPPSA +$200 income-eligible.',
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/water-heaters',
  },
  {
    id: 'evt_solar_water_heater',
    category: 'water_heater',
    program: 'EVT solar water heater rebate',
    who: 'All VT households (rare in VT now)',
    amount: '$1,000',
    amountMaxUSD: 1000,
    conditions: 'OG-300 certified solar thermal collector + tank. Most VT homes find heat pump water heater more cost-effective; this rebate program is being phased down.',
    howToClaim: 'Submit application to EVT post-install.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: '2027-12-31',
    source: 'efficiencyvermont.com/solar-thermal',
  },

  // ─── ELECTRICAL SERVICE UPGRADES ─────────────────────────────────────────
  {
    id: 'evt_panel_upgrade',
    category: 'electrical',
    program: 'EVT electrical service upgrade rebate',
    who: 'Households upgrading from <200A service to support heat pump/EV/heat pump water heater',
    amount: '$500',
    amountMaxUSD: 500,
    conditions: 'Existing service <200A. New service must be at least 200A. Must be tied to electrification project (heat pump install, EV charger, induction range, HPWH).',
    howToClaim: 'Electrician documents existing/new service. EVT verifies via tied electrification project.',
    incomeLimit: 'none',
    incomeBonus: 'Income-eligible bonus +$1500 (total $2000)',
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/electrification',
  },

  // ─── EV CHARGERS ─────────────────────────────────────────────────────────
  {
    id: 'evt_ev_charger',
    category: 'ev_charger',
    program: 'EVT Level 2 EV charger rebate',
    who: 'EV-owning VT households',
    amount: '$200',
    amountMaxUSD: 200,
    conditions: 'Hardwired Level 2 charger (Wallbox, ChargePoint, Tesla Wall Connector). Must have own EV registered in VT.',
    howToClaim: 'Submit receipt + electrical permit to EVT.',
    incomeLimit: 'none',
    incomeBonus: 'GMP utility customers: enrollment in TOU rate plan unlocks additional $500 bonus.',
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/ev',
  },
  {
    id: 'gmp_used_ev_rebate',
    category: 'ev_charger',
    program: 'GMP used EV rebate',
    who: 'GMP customers buying used EV',
    amount: '$2,500 income-eligible / $1,500 standard',
    amountMaxUSD: 2500,
    conditions: 'Vehicle must be used (not new). Must be GMP customer. Income verification for higher tier.',
    howToClaim: 'Apply through GMP within 60 days of purchase.',
    incomeLimit: '80%_AMI',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'greenmountainpower.com/rebates',
  },

  // ─── SOLAR ───────────────────────────────────────────────────────────────
  {
    id: 'vt_net_metering',
    category: 'solar',
    program: 'Vermont net metering Group 2',
    who: 'Residential solar installers up to 15kW',
    amount: 'Full retail rate credit + $0.03/kWh adder for in-state solar',
    amountMaxUSD: null,
    conditions: 'System size ≤15kW. Roof-mount or ground mount. Must register with PUC (Form CPG-NM-1). Adder declines over time — locked in at install date.',
    howToClaim: 'Installer files PUC paperwork. Credits appear on monthly utility bill.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'puc.vermont.gov/electric/net-metering',
  },
  {
    id: 'evt_solar_storage',
    category: 'solar',
    program: 'EVT solar + storage incentive',
    who: 'VT homes installing solar + battery (Powerwall, Enphase, Sonnen)',
    amount: '$0.40/Wh of battery capacity',
    amountMaxUSD: 4000,
    conditions: 'Battery must be paired with solar. Tesla Powerwall (13.5kWh): ~$5,400 rebate. Reduces if grid-services participation declined.',
    howToClaim: 'Installer files. Reflected in net invoice.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2024-01-01',
    validThrough: null,
    source: 'efficiencyvermont.com/solar-storage',
  },

  // ─── FEDERAL (POST-OBBBA REALITY) ────────────────────────────────────────
  {
    id: 'federal_25c_EXPIRED',
    category: 'heat_pump',
    program: '[EXPIRED] Federal Section 25C — Energy Efficient Home Improvement Credit',
    who: 'NONE — credit expired Dec 31, 2025',
    amount: 'EXPIRED',
    amountMaxUSD: 0,
    conditions: 'EXPIRED December 31, 2025 under the One Big Beautiful Bill Act (OBBBA). Projects completed and placed in service before that date can still claim on 2025 tax return. Anything installed Jan 1, 2026 or later: no federal credit available.',
    howToClaim: 'NOT CLAIMABLE for new projects. Installed before Dec 31 2025: file Form 5695 with 2025 tax return.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2023-01-01',
    validThrough: '2025-12-31',
    source: 'irs.gov/form5695',
  },
  {
    id: 'federal_25d_solar',
    category: 'solar',
    program: 'Federal Section 25D — Residential Clean Energy Credit (solar/battery)',
    who: 'VT homeowners installing solar PV or battery storage',
    amount: '30% of total system cost',
    amountMaxUSD: null,
    conditions: 'Applies to solar PV, solar water heating, battery storage (≥3kWh), geothermal heat pumps, and small wind. Phases out 2032+ (currently 30% through 2032, 26% in 2033, 22% in 2034).',
    howToClaim: 'File IRS Form 5695 with annual tax return. Credit applied against tax owed; rolls forward if exceeds liability.',
    incomeLimit: 'none',
    incomeBonus: null,
    validFrom: '2022-01-01',
    validThrough: '2034-12-31',
    source: 'irs.gov/form5695',
  },
]

// ---------------------------------------------------------------------------
// UTILITY MAP — VT town to utility
// ---------------------------------------------------------------------------

export const TOWN_TO_UTILITY: Record<string, Utility> = {
  // BED — Burlington Electric Department
  'burlington': 'BED',

  // VPPSA member utilities (Vermont Public Power Supply Authority)
  // Lamoille FCE, Hardwick Electric, Northfield Electric, Swanton, etc.
  'stowe': 'VPPSA',
  'morristown': 'VPPSA',
  'morrisville': 'VPPSA',
  'hardwick': 'VPPSA',
  'northfield': 'VPPSA',
  'swanton': 'VPPSA',
  'enosburg': 'VPPSA',
  'enosburgh': 'VPPSA',
  'jacksonville': 'VPPSA',
  'ludlow': 'VPPSA',
  'orleans': 'VPPSA',

  // WEC — Washington Electric Co-op (member-owned)
  'east calais': 'WEC',
  'east montpelier': 'WEC',
  'plainfield': 'WEC',
  'cabot': 'WEC',
  'marshfield': 'WEC',
  'worcester': 'WEC',

  // Default for everywhere else — GMP serves ~75% of state
  // (handled by lookup default)
}

export function utilityForTown(town: string | undefined): Utility {
  if (!town) return 'unknown'
  const key = town.toLowerCase().trim()
  return TOWN_TO_UTILITY[key] || 'GMP' // GMP is default for most of VT
}

// ---------------------------------------------------------------------------
// 80% AMI LOOKUP BY COUNTY (rough 2026 figures, household of 3)
// ---------------------------------------------------------------------------

export const AMI_80_HOUSEHOLD_OF_3: Record<string, number> = {
  'chittenden': 96750,
  'addison': 88500,
  'bennington': 76200,
  'caledonia': 72500,
  'essex': 68900,
  'franklin': 84600,
  'grand_isle': 88200,
  'lamoille': 81200,
  'orange': 79800,
  'orleans': 71500,
  'rutland': 76800,
  'washington': 84500,
  'windham': 79900,
  'windsor': 81800,
}

export function ami80ForCounty(county: string | undefined): number | null {
  if (!county) return null
  const key = county.toLowerCase().replace(/\s+county$/, '').trim()
  return AMI_80_HOUSEHOLD_OF_3[key] || null
}

// ---------------------------------------------------------------------------
// COMPACT SUMMARY for chat system prompt
// ---------------------------------------------------------------------------

export function rebatesSummaryForPrompt(): string {
  const lines: string[] = ['VERMONT REBATE STACK (2026)']
  lines.push('Federal Section 25C EXPIRED Dec 31, 2025. State and utility rebates only.')
  lines.push('Federal Section 25D (solar/battery): still active, 30% through 2032.')
  lines.push('')

  const groups: Record<string, Rebate[]> = {}
  for (const r of REBATES) {
    if (!groups[r.category]) groups[r.category] = []
    groups[r.category].push(r)
  }

  for (const [cat, rebates] of Object.entries(groups)) {
    lines.push(`## ${cat.toUpperCase().replace(/_/g, ' ')}`)
    for (const r of rebates) {
      if (r.amount === 'EXPIRED') {
        lines.push(`- ✗ ${r.program}: EXPIRED Dec 31 2025`)
        continue
      }
      lines.push(`- ${r.program} (${r.who}): ${r.amount}${r.amountMaxUSD ? ' (max $' + r.amountMaxUSD.toLocaleString() + ')' : ''}`)
      if (r.incomeBonus) lines.push(`  Income bonus: ${r.incomeBonus}`)
      lines.push(`  Conditions: ${r.conditions}`)
      lines.push(`  How to claim: ${r.howToClaim}`)
    }
    lines.push('')
  }

  lines.push('UTILITY MAP:')
  lines.push('- BED (Burlington Electric) = Burlington only — no income bonus stack')
  lines.push('- GMP (Green Mountain Power) = ~75% of state by default — best income bonus stack')
  lines.push('- VPPSA member utilities = Stowe, Hardwick, Northfield, Swanton, Morrisville, Enosburg, Ludlow, Orleans — modest income bonus')
  lines.push('- VGS (Vermont Gas Systems) = some Chittenden/Franklin towns for natural gas only')
  lines.push('- WEC (Washington Electric Co-op) = central VT towns including East Montpelier, Plainfield, Cabot, Marshfield')
  lines.push('')
  lines.push('80% AMI thresholds (household of 3, 2026): Chittenden ~$96,750. Most rural counties $70-85k. Always tell user "household income near or below this number — installer confirms when they file."')

  return lines.join('\n')
}
