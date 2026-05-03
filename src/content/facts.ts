// Single source of truth for every Vermont numeric claim that appears
// in any guide, town page, or service page.
//
// Rule 4 of voice-guide.md: "Every dollar figure or rebate amount comes
// with: the date verified, the source, and what the number actually
// means in practice."
//
// Pages MUST import from FACTS — never hardcode numbers in prose.
// Updating EVT's heat pump rebate amount = 1 file edit, propagates
// everywhere.
//
// verifyAfter: when this fact needs re-verification. The
// commit-time voice-regression-test (commit 17) warns on items past
// their verifyAfter date.

export type Fact = {
  id: string
  label: string
  value: string
  verifyDate: string       // ISO YYYY-MM-DD
  verifyAfter: string      // ISO YYYY-MM-DD — re-verify by this date
  sourceUrl: string
  sourceLabel: string
  notes?: string
}

export const FACTS: Record<string, Fact> = {
  // ---------- EVT (Efficiency Vermont) rebates -------------------------
  'evt-ducted-heat-pump-rebate': {
    id: 'evt-ducted-heat-pump-rebate',
    label: 'EVT ducted heat pump rebate',
    value: '$2,200',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/cold-climate-heat-pump',
    sourceLabel: 'Efficiency Vermont — Cold Climate Heat Pump',
    notes: 'Per system, paid to contractor at job completion. Reflected as net invoice line, not a check you receive.',
  },
  'evt-ductless-heat-pump-rebate': {
    id: 'evt-ductless-heat-pump-rebate',
    label: 'EVT ductless heat pump rebate',
    value: '$475',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/cold-climate-heat-pump',
    sourceLabel: 'Efficiency Vermont — Cold Climate Heat Pump',
    notes: 'Per indoor head. Multiple heads stack within rebate program rules.',
  },
  'evt-fuel-switching-bonus': {
    id: 'evt-fuel-switching-bonus',
    label: 'EVT fuel-switching bonus (oil to electric)',
    value: '$400',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/cold-climate-heat-pump',
    sourceLabel: 'Efficiency Vermont — Cold Climate Heat Pump',
    notes: 'On top of ducted rebate. Requires removing oil furnace/boiler as primary heat.',
  },
  'evt-heat-pump-water-heater': {
    id: 'evt-heat-pump-water-heater',
    label: 'EVT heat pump water heater rebate',
    value: '$600',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/heat-pump-water-heater',
    sourceLabel: 'Efficiency Vermont — Heat Pump Water Heater',
    notes: 'Includes self-install with electrician permit.',
  },
  'evt-electrical-service-upgrade': {
    id: 'evt-electrical-service-upgrade',
    label: 'EVT electrical service upgrade rebate',
    value: '$500',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/electrical-panel',
    sourceLabel: 'Efficiency Vermont — Electrical Panel',
    notes: 'Tied to electrification project. Verifies via paired heat pump or EV charger install.',
  },
  'evt-weatherization-standard-tier': {
    id: 'evt-weatherization-standard-tier',
    label: 'EVT Home Performance with ENERGY STAR — standard tier',
    value: '75% of project cost',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/home-performance-with-energy-star',
    sourceLabel: 'Efficiency Vermont — Home Performance',
    notes: 'Cap depends on scope. Stacked rebates can total ~$7,700.',
  },
  'evt-weatherization-income-eligible': {
    id: 'evt-weatherization-income-eligible',
    label: 'EVT income-eligible weatherization',
    value: '90% of project cost',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/income-eligible',
    sourceLabel: 'Efficiency Vermont — Income Eligible',
    notes: 'Stacked rebates can total ~$16,700. 80% AMI qualifying threshold.',
  },
  'evt-diy-weatherization-rebate': {
    id: 'evt-diy-weatherization-rebate',
    label: 'EVT DIY weatherization rebate',
    value: '$100 cash back on materials',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/diy-weatherization',
    sourceLabel: 'Efficiency Vermont — DIY Weatherization',
    notes: 'Submit receipts within 90 days of purchase.',
  },
  'evt-solar-storage-incentive': {
    id: 'evt-solar-storage-incentive',
    label: 'EVT solar + storage incentive',
    value: '$0.40/Wh of battery capacity',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/solar-storage',
    sourceLabel: 'Efficiency Vermont — Solar + Storage',
    notes: 'Powerwall, Enphase IQ Battery, Sonnen all eligible. Tesla Powerwall (13.5kWh) ~$5,400.',
  },
  'evt-l2-ev-charger': {
    id: 'evt-l2-ev-charger',
    label: 'EVT Level 2 EV charger rebate',
    value: '$200',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/ev-charger',
    sourceLabel: 'Efficiency Vermont — EV Charger',
  },

  // ---------- Utility-specific (GMP, BED, VPPSA) -----------------------
  'gmp-used-ev-standard': {
    id: 'gmp-used-ev-standard',
    label: 'GMP used EV rebate (standard)',
    value: '$1,500',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://greenmountainpower.com/rebates-programs/electric-vehicles/',
    sourceLabel: 'Green Mountain Power — EV Rebates',
    notes: 'Apply within 60 days of purchase.',
  },
  'gmp-used-ev-income-eligible': {
    id: 'gmp-used-ev-income-eligible',
    label: 'GMP used EV rebate (income-eligible)',
    value: '$2,500',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://greenmountainpower.com/rebates-programs/electric-vehicles/',
    sourceLabel: 'Green Mountain Power — EV Rebates',
  },
  'gmp-heat-pump-income-bonus': {
    id: 'gmp-heat-pump-income-bonus',
    label: 'GMP income-eligible heat pump bonus',
    value: '+$2,000 per condenser',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://greenmountainpower.com/rebates-programs/',
    sourceLabel: 'Green Mountain Power — Heat Pump Rebates',
    notes: 'On top of EVT rebate. Households at or below 80% AMI.',
  },
  'vppsa-heat-pump-income-bonus': {
    id: 'vppsa-heat-pump-income-bonus',
    label: 'VPPSA member-utility heat pump income bonus',
    value: '+$1,000 per condenser',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.vppsa.com/',
    sourceLabel: 'VPPSA — Member Utility Programs',
    notes: 'On top of EVT rebate. VPPSA towns: Hyde Park, Stowe, Northfield, Ludlow, Lyndonville, Hardwick, Morrisville, Enosburg, Swanton, Barton, Jacksonville, Johnson, Orleans, Readsboro.',
  },

  // ---------- Federal credits ------------------------------------------
  'federal-25d-clean-energy': {
    id: 'federal-25d-clean-energy',
    label: 'Federal Section 25D Residential Clean Energy Credit',
    value: '30% of total system cost',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.energystar.gov/about/federal_tax_credits/residential_clean_energy_property_credit',
    sourceLabel: 'IRS — Residential Clean Energy Credit',
    notes: 'Solar PV and battery storage eligible. File IRS Form 5695. Rolls forward if exceeds tax liability. No cap.',
  },
  'federal-25c-expired': {
    id: 'federal-25c-expired',
    label: 'Federal Section 25C Energy Efficient Home Improvement Credit',
    value: 'Expired December 31, 2025',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.energystar.gov/about/federal_tax_credits/energy_efficient_home_improvement_tax_credit',
    sourceLabel: 'IRS — Energy Efficient Home Improvement',
    notes: 'Was 30% up to $1,200/year on insulation, windows, doors. Federal credit expired end of 2025; not in current law.',
  },

  // ---------- Vermont law + statutes -----------------------------------
  'vt-act-47-adu': {
    id: 'vt-act-47-adu',
    label: 'Vermont Act 47 — statewide ADU-by-right',
    value: 'In effect since July 2024',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://legislature.vermont.gov/bill/status/2024/H.687',
    sourceLabel: 'Vermont Legislature — H.687 / Act 47',
    notes: 'Overrides most town ADU caps. Town zoning saying "no ADUs over 800 sq ft" not enforceable. Towns can still regulate setbacks, lot coverage, parking.',
  },
  'vt-shoreland-buffer': {
    id: 'vt-shoreland-buffer',
    label: 'Vermont Shoreland Protection Act buffer',
    value: '250 feet from any lake larger than 10 acres',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://dec.vermont.gov/watershed/lakes-ponds/permit/shoreland',
    sourceLabel: 'Vermont DEC — Shoreland Protection',
    notes: 'Permit required for clearing, building, or impervious surface within buffer.',
  },
  'vt-mechanics-lien-statute': {
    id: 'vt-mechanics-lien-statute',
    label: "Vermont mechanic's lien law",
    value: '9 V.S.A. Chapter 51',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://legislature.vermont.gov/statutes/chapter/09/051',
    sourceLabel: 'Vermont Statutes — 9 V.S.A. Ch. 51',
    notes: "Subcontractors and suppliers can lien YOUR property if the GC doesn't pay them. Defense: lien waivers from every sub before final payment.",
  },
  'vt-residential-contract-statute': {
    id: 'vt-residential-contract-statute',
    label: 'Vermont residential contract requirements',
    value: '9 V.S.A. § 4006',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://legislature.vermont.gov/statutes/section/09/063/04006',
    sourceLabel: 'Vermont Statutes — 9 V.S.A. § 4006',
    notes: 'Written contract required for residential work over $1,000. Must include scope, price, completion date, deposit terms, 3-day right to cancel. Missing required items = unenforceable AGAINST you.',
  },
  'vt-contractor-registration-threshold': {
    id: 'vt-contractor-registration-threshold',
    label: 'Vermont AG contractor registration threshold',
    value: '$3,500',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://ago.vermont.gov/cap',
    sourceLabel: 'Vermont AG Consumer Assistance Program',
    notes: 'Required for any residential project $3,500+ since 2021. Free for contractors. Closest VT has to a license.',
  },
  'vt-net-metering-group2': {
    id: 'vt-net-metering-group2',
    label: 'Vermont Net Metering Group 2',
    value: 'Full retail rate credit + $0.03/kWh adder for in-state solar',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://puc.vermont.gov/electric/net-metering',
    sourceLabel: 'Vermont Public Utility Commission — Net Metering',
    notes: 'Residential up to 15kW. Installer files PUC paperwork.',
  },

  // ---------- Vermont property tax + dates -----------------------------
  'vt-homestead-declaration-deadline': {
    id: 'vt-homestead-declaration-deadline',
    label: 'Vermont Homestead Declaration deadline',
    value: 'April 15 each year',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://tax.vermont.gov/property/homestead-declaration',
    sourceLabel: 'Vermont Department of Taxes — Homestead Declaration',
    notes: 'File HS-122 if primary residence. Affects tax rate by ~$1 per $100 of value. Late = pay non-homestead rate for the year (~$500-1000 difference on a $300k home).',
  },
  'vt-property-tax-credit-form': {
    id: 'vt-property-tax-credit-form',
    label: 'Vermont Property Tax Credit form',
    value: 'HI-144',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://tax.vermont.gov/property/property-tax-credit',
    sourceLabel: 'Vermont Department of Taxes — Property Tax Credit',
    notes: "File with HS-122 by April 15. Income threshold ~$134,000. If you don't file, you get nothing — most VT households leave money on the table.",
  },
  'vt-grievance-window': {
    id: 'vt-grievance-window',
    label: 'Vermont property assessment grievance window',
    value: '14 days from notice (most towns)',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://tax.vermont.gov/property/grievance',
    sourceLabel: 'Vermont Department of Taxes — Grievance',
    notes: 'Late = stuck with new assessment for the year. Appeals are often successful when assessment is wrong.',
  },

  // ---------- Vermont seasons + climate --------------------------------
  'vt-mud-season-window': {
    id: 'vt-mud-season-window',
    label: 'Vermont mud season',
    value: 'Roughly March 1 - May 15 (varies by elevation)',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://www.fpr.vermont.gov/forest/mud-season',
    sourceLabel: 'Vermont FPR — Mud Season',
    notes: 'Many towns post weight limits. Heavy contractor work delayed until ground firms.',
  },
  'vt-blackfly-window': {
    id: 'vt-blackfly-window',
    label: 'Vermont blackfly season',
    value: 'Mid-May through mid-June',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://www.uvm.edu/extension',
    sourceLabel: 'UVM Extension — Blackflies',
    notes: 'Worst near streams and rivers. DEET-based repellent or permethrin-treated clothing required for outdoor work. Window varies by elevation.',
  },
  'vt-heating-degree-days': {
    id: 'vt-heating-degree-days',
    label: 'Vermont heating degree days (annual)',
    value: '7,500-8,500 HDD',
    verifyDate: '2026-04-15',
    verifyAfter: '2030-12-31',
    sourceUrl: 'https://www.degreedays.net/',
    sourceLabel: 'NOAA — Heating Degree Days',
    notes: 'Higher than 90% of US states. Drives heat pump sizing and weatherization payback math.',
  },

  // ---------- Vermont cost ranges (verified mid-2026) ------------------
  // These are statewide median ranges. Town pages multiply by their tier
  // multiplier (resort_premium 1.4×, burlington_metro 1.15×, small_city
  // 1.0×, rural 0.85×) to localize.
  'vt-cost-kitchen-mid': {
    id: 'vt-cost-kitchen-mid',
    label: 'Vermont mid-range kitchen remodel',
    value: '$35,000-$65,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/home-performance-with-energy-star',
    sourceLabel: 'Statewide median, NAR/Houzz 2025 + VT contractor data',
    notes: 'Semi-custom cabinets, quartz/granite counters, new appliances, updated electrical. Add ~40% in resort towns.',
  },
  'vt-cost-kitchen-full-gut': {
    id: 'vt-cost-kitchen-full-gut',
    label: 'Vermont full gut kitchen renovation',
    value: '$60,000-$120,000+',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.houzz.com/research',
    sourceLabel: 'Statewide median, NAR/Houzz 2025',
    notes: 'Custom cabinetry, premium stone, professional appliances, full electrical and plumbing rough-in. 1860s-era farmhouses often hit the high end due to code-compliance work.',
  },
  'vt-cost-bathroom-mid': {
    id: 'vt-cost-bathroom-mid',
    label: 'Vermont mid-range bathroom remodel',
    value: '$12,000-$28,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.houzz.com/research',
    sourceLabel: 'Statewide median, NAR/Houzz 2025',
    notes: 'New tile, vanity, fixtures, updated plumbing. Half-to-full bath conversion triggers reassessment.',
  },
  'vt-cost-roof-asphalt': {
    id: 'vt-cost-roof-asphalt',
    label: 'Vermont asphalt shingle roof replacement',
    value: '$8,000-$20,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.remodeling.hw.net/cost-vs-value/2025/east-north-central/',
    sourceLabel: 'Remodeling Magazine — Cost vs. Value 2025',
    notes: 'Architectural shingles preferred for VT wind/ice loads. 1,500 sq ft ranch in Burlington runs $9,000-$13,000.',
  },
  'vt-cost-roof-standing-seam': {
    id: 'vt-cost-roof-standing-seam',
    label: 'Vermont standing seam metal roof',
    value: '$20,000-$40,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.remodeling.hw.net/cost-vs-value/',
    sourceLabel: 'Remodeling Magazine — Cost vs. Value 2025',
    notes: 'Sheds snow naturally, resists ice dams, 40-70 year lifespan. Premium choice for steeper VT roofs.',
  },
  'vt-cost-deck-pt': {
    id: 'vt-cost-deck-pt',
    label: 'Vermont pressure-treated deck',
    value: '$8,000-$18,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.remodeling.hw.net/cost-vs-value/',
    sourceLabel: 'Remodeling Magazine — Cost vs. Value 2025',
    notes: 'Basic 10x16 deck with simple stairs runs $8,000-$12,000 installed. Higher with multi-level or pergola.',
  },
  'vt-cost-deck-composite': {
    id: 'vt-cost-deck-composite',
    label: 'Vermont composite deck',
    value: '$15,000-$40,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.remodeling.hw.net/cost-vs-value/',
    sourceLabel: 'Remodeling Magazine — Cost vs. Value 2025',
    notes: 'Mid-size composite with aluminum railing $18,000-$28,000. Premium with hidden fasteners and lighting reaches $35,000-$40,000.',
  },
  'vt-cost-windows-replacement': {
    id: 'vt-cost-windows-replacement',
    label: 'Vermont window replacement (12-window project)',
    value: '$12,000-$28,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/',
    sourceLabel: 'Statewide median, EVT-network installer estimates',
    notes: 'Modern double-pane vinyl or fiberglass. Historic district approval adds time but rarely cost — modern profiles can match historic look.',
  },
  'vt-cost-heat-pump-ducted': {
    id: 'vt-cost-heat-pump-ducted',
    label: 'Vermont ducted whole-house heat pump install',
    value: '$11,000-$22,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/cold-climate-heat-pump',
    sourceLabel: 'Statewide median, EVT-network installer estimates',
    notes: 'Cold-climate NEEP-listed system. Resort-tier towns reach $14,000-$28,000.',
  },
  'vt-cost-heat-pump-ductless-single': {
    id: 'vt-cost-heat-pump-ductless-single',
    label: 'Vermont single-zone ductless mini-split',
    value: '$3,500-$5,500',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/cold-climate-heat-pump',
    sourceLabel: 'Statewide median, EVT-network installer estimates',
  },
  'vt-cost-heat-pump-ductless-multi': {
    id: 'vt-cost-heat-pump-ductless-multi',
    label: 'Vermont multi-zone ductless heat pump (2-3 rooms)',
    value: '$7,000-$12,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/cold-climate-heat-pump',
    sourceLabel: 'Statewide median, EVT-network installer estimates',
  },
  'vt-cost-solar-8kw': {
    id: 'vt-cost-solar-8kw',
    label: 'Vermont 8kW solar + battery (after credits)',
    value: '$28,000-$42,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/solar-storage',
    sourceLabel: 'Statewide median, VT solar installer estimates',
    notes: 'After federal 25D 30% credit + EVT solar+storage incentive. Out-of-state cost calculators often quote $50,000+ pre-credit.',
  },
  'vt-cost-adu': {
    id: 'vt-cost-adu',
    label: 'Vermont ADU build (900 sq ft)',
    value: '$85,000-$175,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://legislature.vermont.gov/bill/status/2024/H.687',
    sourceLabel: 'VT contractor estimates, Act 47 implementation',
    notes: 'Plus VT wastewater permit ($300-$1,500), septic engineer eval ($500-$1,500). Most lots need electrical service upgrade ($3,000-$8,000).',
  },
  'vt-cost-weatherization-whole-home': {
    id: 'vt-cost-weatherization-whole-home',
    label: 'Vermont whole-home weatherization',
    value: '$4,000-$18,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.efficiencyvermont.com/rebates/list/home-performance-with-energy-star',
    sourceLabel: 'Statewide median, EVT Home Performance program',
    notes: 'Air sealing + insulation. Total out-of-pocket after EVT 75% rebate runs $1,000-$4,500 standard tier.',
  },
  'vt-cost-septic-conventional': {
    id: 'vt-cost-septic-conventional',
    label: 'Vermont conventional septic system',
    value: '$15,000-$25,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://dec.vermont.gov/wastewater',
    sourceLabel: 'Vermont DEC — Wastewater',
    notes: 'New install. Mound or engineered systems run $30,000-$45,000.',
  },
  'vt-cost-septic-engineered': {
    id: 'vt-cost-septic-engineered',
    label: 'Vermont mound or engineered septic',
    value: '$30,000-$45,000',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://dec.vermont.gov/wastewater',
    sourceLabel: 'Vermont DEC — Wastewater',
    notes: 'Required where soil percs poorly or shallow water table.',
  },
  'vt-cost-handyman-rate': {
    id: 'vt-cost-handyman-rate',
    label: 'Vermont handyman rate',
    value: '$40-$75/hour or $300-$600/day',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://www.bls.gov/oes/current/oes_vt.htm',
    sourceLabel: 'BLS Vermont occupational employment',
    notes: 'Materials extra. Full seasonal prep visit with materials runs $400-$800.',
  },
  'vt-cost-flood-insurance': {
    id: 'vt-cost-flood-insurance',
    label: 'Vermont flood insurance (Zone A or AE)',
    value: '$1,000-$5,000/year',
    verifyDate: '2026-04-15',
    verifyAfter: '2026-12-31',
    sourceUrl: 'https://www.floodsmart.gov/',
    sourceLabel: 'FEMA — National Flood Insurance Program',
    notes: 'Drops significantly with elevation certificate showing floor at or above base flood elevation.',
  },
  'vt-cost-elevation-cert': {
    id: 'vt-cost-elevation-cert',
    label: 'Vermont elevation certificate',
    value: '$300-$600',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://www.fema.gov/glossary/elevation-certificate',
    sourceLabel: 'FEMA — Elevation Certificate',
    notes: 'Survey doc. Required to optimize flood insurance pricing.',
  },

  // ---------- Vermont town tier multipliers ----------------------------
  'vt-tier-resort-premium': {
    id: 'vt-tier-resort-premium',
    label: 'Resort-premium town cost premium',
    value: '30-40% above statewide median',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://tax.vermont.gov/property/equalization',
    sourceLabel: 'VT Department of Taxes — Property equalization',
    notes: 'Stowe, Manchester, Woodstock. Drivers: labor scarcity, second-home premiums, design-review prep time.',
  },
  'vt-tier-burlington-metro': {
    id: 'vt-tier-burlington-metro',
    label: 'Burlington metro cost premium',
    value: '10-20% above statewide median',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://tax.vermont.gov/property/equalization',
    sourceLabel: 'VT Department of Taxes — Property equalization',
    notes: 'Burlington, South Burlington, Williston, Essex, Colchester, Winooski.',
  },
  'vt-tier-rural-discount': {
    id: 'vt-tier-rural-discount',
    label: 'Rural Vermont cost discount',
    value: '10-20% below statewide median',
    verifyDate: '2026-04-15',
    verifyAfter: '2027-12-31',
    sourceUrl: 'https://tax.vermont.gov/property/equalization',
    sourceLabel: 'VT Department of Taxes — Property equalization',
    notes: 'St. Johnsbury, NEK, parts of Orleans/Essex/Caledonia counties. Trade-off: lower contractor density, longer lead times.',
  },
}

// ---------- Helpers ----------------------------------------------------

// Render a fact inline. Returns { value, cite } where cite is a short
// "Verified [date], source: [label]" string suitable for a footnote.
export function renderFact(id: string): { value: string; cite: string } {
  const f = FACTS[id]
  if (!f) throw new Error(`Unknown fact id: ${id}`)
  return {
    value: f.value,
    cite: `Verified ${f.verifyDate}, source: ${f.sourceLabel}`,
  }
}

// Resolve a list of fact ids to full Fact records. Used by GuideFooter
// to render the Sources block. Unknown ids are filtered out (with a
// warning at build time via voice-regression-test, not at runtime).
export function getSourcesForGuide(factIds: string[]): Fact[] {
  return factIds.map(id => FACTS[id]).filter(Boolean)
}

// True if the fact is past its verifyAfter date as of the given date.
// Used by stale-fact audit script (commit 19).
export function isFactStale(fact: Fact, asOf: Date = new Date()): boolean {
  return new Date(fact.verifyAfter) < asOf
}

// All fact ids — for build-time sanity checks.
export function allFactIds(): string[] {
  return Object.keys(FACTS)
}
