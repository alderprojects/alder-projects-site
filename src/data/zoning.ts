// Vermont zoning + permit reference per top town.
// Vermont passed Act 47 (June 2024) which made ADUs by-right statewide,
// but local septic capacity, setbacks, and historical district rules
// still create real friction.
//
// 2026 figures. Verify with town zoning office before final design —
// town zoning bylaws update on rolling basis.

export type ZoningCategory =
  | 'residential_single_family'
  | 'residential_multi_family'
  | 'mixed_use'
  | 'rural_residential'
  | 'historic_overlay'
  | 'shoreline_overlay'
  | 'flood_overlay'

export type ADURules = {
  byRight: boolean        // Allowed by right under Act 47 + local interpretation
  maxSizeSqFt: number     // Most VT towns cap ADUs at 30% of primary or specific number
  ownerOccupancyRequired: boolean   // Some towns still require owner-occupy primary
  parkingRequirement: string         // Min spaces required
  separateUtilities: 'allowed' | 'required' | 'discouraged'
  notes: string
}

export type TownZoning = {
  town: string
  county: string
  populationApprox: number
  // Average residential lot setbacks (front/side/rear in feet)
  setbacks: { front: number; side: number; rear: number }
  // Maximum lot coverage (impervious surface as % of lot)
  maxLotCoverage: number  // 0-1
  // Maximum building height in feet
  maxBuildingHeight: number
  adu: ADURules
  // Building permit fee structure
  permitFeeStructure: string
  // Historic / overlay districts to be aware of
  overlays: string[]
  // Quirks worth knowing
  notes: string
  // Town zoning office contact (where to verify)
  zoningOffice: string
}

// ---------------------------------------------------------------------------
// TOP 12 VERMONT TOWNS — zoning detail
// ---------------------------------------------------------------------------

export const TOWN_ZONING: TownZoning[] = [
  // ─── Burlington ─────────────────────────────────────────────────────────
  {
    town: 'Burlington',
    county: 'Chittenden',
    populationApprox: 44743,
    setbacks: { front: 15, side: 8, rear: 25 },
    maxLotCoverage: 0.55,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 900,
      ownerOccupancyRequired: false,  // Burlington dropped owner-occupancy 2023
      parkingRequirement: 'No additional parking required for ADU',
      separateUtilities: 'allowed',
      notes: 'Burlington is the most ADU-friendly city in VT. Both attached and detached allowed in all residential zones. inclusionary zoning may apply for new construction over 5 units but not single ADU additions.',
    },
    permitFeeStructure: '$0.50 per square foot of new construction, $150 minimum. Plus $80 plan review for projects over $25k. Electrical permit separate ($95 minimum + $25/circuit).',
    overlays: ['Hill Section Historic District', 'Old North End Historic District', 'Battery Street Historic District', 'Lake Champlain Shoreline'],
    notes: 'Stricter rules in historic districts — exterior changes require Design Review Board approval (4-8 week process). Lake shoreline 100ft setback critical for any waterside construction. Burlington is also doing a comprehensive zoning rewrite as of 2025-2026.',
    zoningOffice: 'Department of Permitting & Inspections, 645 Pine St, (802) 865-7188',
  },

  // ─── South Burlington ───────────────────────────────────────────────────
  {
    town: 'South Burlington',
    county: 'Chittenden',
    populationApprox: 20292,
    setbacks: { front: 30, side: 10, rear: 30 },
    maxLotCoverage: 0.40,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 1000,
      ownerOccupancyRequired: true,
      parkingRequirement: '1 space per ADU bedroom',
      separateUtilities: 'allowed',
      notes: 'South Burlington requires owner to occupy either primary or ADU. ADUs on lots ≥40,000 sqft can go up to 1,200 sqft.',
    },
    permitFeeStructure: '$60 base + $0.30/sqft. Plan review for projects >$50k adds $200. Stormwater impact fee on new impervious surface (>500 sqft).',
    overlays: ['Airport Approach Zone', 'Williston Rd corridor design', 'Wetland Protection'],
    notes: 'Airport noise overlay restricts new residential construction in some zones. Stormwater rules are stricter than Burlington — any new driveway or addition triggers stormwater review.',
    zoningOffice: 'Planning & Zoning, 575 Dorset St, (802) 846-4106',
  },

  // ─── Essex ──────────────────────────────────────────────────────────────
  {
    town: 'Essex',
    county: 'Chittenden',
    populationApprox: 22094,
    setbacks: { front: 35, side: 15, rear: 35 },
    maxLotCoverage: 0.30,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 800,
      ownerOccupancyRequired: true,
      parkingRequirement: '2 spaces total for primary + ADU combined',
      separateUtilities: 'allowed',
      notes: 'Essex (town and former village merged 2022) — rules harmonized but still some legacy variance between former Essex Junction and Essex Town areas. Verify with planning office.',
    },
    permitFeeStructure: '$75 base + $0.25/sqft. Septic permit fees separate ($150-400 depending on complexity).',
    overlays: ['Essex Junction Historic District (limited)', 'Indian Brook Watershed', 'Five Corners design district'],
    notes: 'Essex annexation from Junction completed 2022. Most rural Essex still subject to septic capacity issues for ADUs — town test results often determine feasibility. Larger lots required (typically 1+ acre) for new homes outside village center.',
    zoningOffice: 'Community Development, 81 Main St, (802) 879-0413',
  },

  // ─── Williston ──────────────────────────────────────────────────────────
  {
    town: 'Williston',
    county: 'Chittenden',
    populationApprox: 10117,
    setbacks: { front: 50, side: 25, rear: 35 },
    maxLotCoverage: 0.25,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 900,
      ownerOccupancyRequired: true,
      parkingRequirement: '1 space per ADU bedroom (min 1)',
      separateUtilities: 'allowed',
      notes: 'Williston is rural-suburban hybrid — ADU rules favorable in growth center, more restrictive in rural conservation district.',
    },
    permitFeeStructure: '$100 base + $0.30/sqft. Higher fees in rural conservation district to discourage sprawl.',
    overlays: ['Growth Center', 'Rural Conservation', 'Allen Brook Watershed', 'Tax Increment Financing District'],
    notes: 'Williston has strong rural conservation policy — new dwellings outside designated growth center face significant scrutiny. ADUs within existing structure often easier than new detached units.',
    zoningOffice: 'Planning & Zoning, 7900 Williston Rd, (802) 878-6704',
  },

  // ─── Colchester ─────────────────────────────────────────────────────────
  {
    town: 'Colchester',
    county: 'Chittenden',
    populationApprox: 17524,
    setbacks: { front: 30, side: 15, rear: 30 },
    maxLotCoverage: 0.30,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 800,
      ownerOccupancyRequired: false,
      parkingRequirement: '1 space per ADU',
      separateUtilities: 'allowed',
      notes: 'Colchester one of more permissive Chittenden towns for ADU. Lakeside/Malletts Bay area has additional design review.',
    },
    permitFeeStructure: '$80 base + $0.25/sqft. Shoreline buffer requirements add cost for projects within 250ft of Lake Champlain.',
    overlays: ['Malletts Bay Design Review', 'Shoreline Protection', 'Wetland'],
    notes: 'Lake Champlain shoreline buffer = no construction within 100ft of mean water level except by VT shoreline permit (separate from town permit). Camp conversions to year-round homes trigger full code compliance.',
    zoningOffice: 'Planning Department, 781 Blakely Rd, (802) 264-5604',
  },

  // ─── Stowe ──────────────────────────────────────────────────────────────
  {
    town: 'Stowe',
    county: 'Lamoille',
    populationApprox: 5360,
    setbacks: { front: 50, side: 25, rear: 50 },
    maxLotCoverage: 0.20,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 1200,
      ownerOccupancyRequired: true,
      parkingRequirement: '2 spaces per dwelling unit',
      separateUtilities: 'discouraged',
      notes: 'Stowe ADU rules favor owner-occupied long-term rentals over short-term. Short-term rental of ADU is allowed but requires registration + lodging tax compliance + town STR permit ($500 annual).',
    },
    permitFeeStructure: '$200 base + $0.50/sqft. Design review fees ($300-1500) for any project visible from Mountain Road or Main Street.',
    overlays: ['Mountain Road Design District', 'Stowe Village Historic District', 'Mountain Resort District', 'Ridgeline Protection'],
    notes: 'Strict design review for visible projects. Mountain Road corridor especially regulated. STR (short-term rental) registration and rules change frequently — verify before assuming Airbnb model. Septic system upgrades common cost driver — old systems sized for occasional weekend use.',
    zoningOffice: 'Planning & Zoning, 67 Main St, (802) 253-6141',
  },

  // ─── Middlebury ─────────────────────────────────────────────────────────
  {
    town: 'Middlebury',
    county: 'Addison',
    populationApprox: 9152,
    setbacks: { front: 30, side: 12, rear: 25 },
    maxLotCoverage: 0.35,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 800,
      ownerOccupancyRequired: true,
      parkingRequirement: '1 space per ADU',
      separateUtilities: 'allowed',
      notes: 'Middlebury allows ADU in nearly all residential zones. College-town rental market makes ADUs especially viable economically.',
    },
    permitFeeStructure: '$60 base + $0.20/sqft. Historic district adds $150 review fee.',
    overlays: ['Middlebury Village Historic District', 'Otter Creek Floodplain', 'Middlebury College Campus Overlay'],
    notes: 'Middlebury College housing creates strong rental demand for ADUs. Historic district covers most of village center — exterior changes require Historic Preservation Review Commission approval.',
    zoningOffice: 'Planning & Zoning, 77 Main St, (802) 388-8104',
  },

  // ─── Montpelier ─────────────────────────────────────────────────────────
  {
    town: 'Montpelier',
    county: 'Washington',
    populationApprox: 8074,
    setbacks: { front: 20, side: 10, rear: 20 },
    maxLotCoverage: 0.45,
    maxBuildingHeight: 40,
    adu: {
      byRight: true,
      maxSizeSqFt: 800,
      ownerOccupancyRequired: false,
      parkingRequirement: 'None additional in central district',
      separateUtilities: 'allowed',
      notes: 'Capital city has urbanist-leaning zoning. ADUs strongly encouraged. State employee rental demand keeps ADU economics solid.',
    },
    permitFeeStructure: '$50 base + $0.20/sqft. Floodplain projects (significant area of city) require ABFE compliance.',
    overlays: ['Downtown Historic District', 'Winooski/North Branch Floodplain', 'Capitol Complex Historic District'],
    notes: 'July 2023 flood scarred Montpelier — much of downtown got 4-6ft of water. Floodplain mapping updated 2024. Many homes now require flood vents, elevated mechanical, and updated insurance. Permit fees waived for flood-recovery rebuilds through 2026.',
    zoningOffice: 'Planning & Community Development, 39 Main St, (802) 223-9501',
  },

  // ─── Brattleboro ────────────────────────────────────────────────────────
  {
    town: 'Brattleboro',
    county: 'Windham',
    populationApprox: 12184,
    setbacks: { front: 25, side: 8, rear: 20 },
    maxLotCoverage: 0.45,
    maxBuildingHeight: 40,
    adu: {
      byRight: true,
      maxSizeSqFt: 1000,
      ownerOccupancyRequired: false,
      parkingRequirement: 'None additional within walking-distance overlay',
      separateUtilities: 'allowed',
      notes: 'Brattleboro one of most permissive ADU policies in southern VT. Strong rental market from Marlboro College closure backfill + arts community.',
    },
    permitFeeStructure: '$50 base + $0.25/sqft. Brookside floodplain projects require additional engineering review.',
    overlays: ['Downtown Historic District', 'Connecticut River Floodplain', 'West Brattleboro Village Center'],
    notes: 'Flood overlay covers significant downtown area. Walking-distance ADU bonus means no parking required if within 1/4 mile of downtown core.',
    zoningOffice: 'Planning Services, 230 Main St, (802) 251-8154',
  },

  // ─── Rutland ────────────────────────────────────────────────────────────
  {
    town: 'Rutland City',
    county: 'Rutland',
    populationApprox: 15807,
    setbacks: { front: 25, side: 10, rear: 25 },
    maxLotCoverage: 0.50,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 800,
      ownerOccupancyRequired: false,
      parkingRequirement: '1 space per ADU',
      separateUtilities: 'allowed',
      notes: 'Rutland City lower-cost ADU market — economics depend on specific neighborhood. North Main commercial corridor spillover residential is most opportunity.',
    },
    permitFeeStructure: '$50 base + $0.20/sqft. Lower fees in designated revitalization districts.',
    overlays: ['Rutland Historic District', 'North Main Revitalization', 'Otter Creek Riparian'],
    notes: 'Older housing stock means ADU conversions in existing carriage houses, second-floor walk-ups common. Not a high-rent market — ADU economics need careful proforma. Lead paint concerns in pre-1978 homes critical.',
    zoningOffice: 'Department of Planning & Development, City Hall, 1 Strongs Ave, (802) 773-1800',
  },

  // ─── Manchester ─────────────────────────────────────────────────────────
  {
    town: 'Manchester',
    county: 'Bennington',
    populationApprox: 4380,
    setbacks: { front: 50, side: 25, rear: 35 },
    maxLotCoverage: 0.20,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 1000,
      ownerOccupancyRequired: true,
      parkingRequirement: '2 spaces per ADU',
      separateUtilities: 'discouraged',
      notes: 'Manchester resort town — ADUs often used for STR. Town has aggressive STR registration and tax enforcement.',
    },
    permitFeeStructure: '$150 base + $0.40/sqft. Design review fees for projects in design district ($250-1000).',
    overlays: ['Manchester Village Historic District', 'Equinox Mountain Ridgeline', 'Battenkill River Watershed'],
    notes: 'Manchester Village (separate from Manchester Center) has stricter design review. Equinox ridgeline rules limit anything visible from public roads. Conservation easements common — verify before purchase.',
    zoningOffice: 'Town of Manchester Planning, 6041 Main St, (802) 362-1313',
  },

  // ─── Woodstock ──────────────────────────────────────────────────────────
  {
    town: 'Woodstock',
    county: 'Windsor',
    populationApprox: 3286,
    setbacks: { front: 50, side: 25, rear: 50 },
    maxLotCoverage: 0.15,
    maxBuildingHeight: 35,
    adu: {
      byRight: true,
      maxSizeSqFt: 900,
      ownerOccupancyRequired: true,
      parkingRequirement: '2 spaces per dwelling',
      separateUtilities: 'discouraged',
      notes: 'Woodstock has strictest rural-character zoning in VT. ADU possible but design review intensive.',
    },
    permitFeeStructure: '$200 base + $0.60/sqft. Design review mandatory for any visible exterior change ($500-2500).',
    overlays: ['Woodstock Village Historic District', 'Ottauquechee River Floodplain', 'Rural Character Overlay'],
    notes: 'Woodstock village center is a National Historic Landmark — exterior changes nearly impossible without Historic Preservation Review approval. Rural character overlay restricts visible new construction broadly. STR rules are restrictive.',
    zoningOffice: 'Planning Department, 31 The Green, (802) 457-3456',
  },
]

// ---------------------------------------------------------------------------
// LOOKUP HELPER
// ---------------------------------------------------------------------------

export function zoningForTown(town: string | undefined): TownZoning | null {
  if (!town) return null
  const key = town.toLowerCase().trim()
  // Try exact match
  for (const tz of TOWN_ZONING) {
    if (tz.town.toLowerCase() === key) return tz
    // Also match "Burlington" against "Burlington" sub-strings
    if (key.includes(tz.town.toLowerCase()) || tz.town.toLowerCase().includes(key)) return tz
  }
  return null
}

// ---------------------------------------------------------------------------
// STATEWIDE NOTES (Act 47 + general framework)
// ---------------------------------------------------------------------------

export const VT_STATEWIDE_ZONING_NOTES = `
VERMONT STATEWIDE ZONING FRAMEWORK (2026)

Act 47 (HOME Act, signed June 2024):
- ADUs by-right statewide on any residential lot
- Single-family and duplex by-right in any zone allowing residential
- Local towns cannot ban — but can regulate setbacks, size, design review
- 5+ unit projects allowed by-right within 1/4 mile of designated growth centers

Act 250 (statewide land use, 1970):
- Triggers state-level review for: subdivisions of 6+ lots, commercial projects >10 acres,
  most residential projects >10 lots, ALL development above 2,500 ft elevation
- Most homeowner ADU/addition projects do NOT trigger Act 250
- Major renovations to historic structures may trigger Section 106 review separately

Septic + wastewater (cross-cutting):
- Old VT homes built pre-1990s often have undersized septic
- Adding bedrooms (ADU, addition, basement conversion) almost always triggers septic permit
- New septic permit cost: $300-1500. New system install: $15,000-45,000
- Town wastewater capacity is the practical constraint on ADU feasibility, not zoning

Floodplain (post-2023 Montpelier flood + 2024 mapping update):
- Many VT towns now have updated FEMA flood zones
- Construction in special flood hazard area requires elevation certificate, flood vents,
  flood insurance — adds $5,000-15,000 to project costs
- Check FEMA Flood Map Service Center before committing to a property

Permits common to all towns:
- Building permit (cost varies — see per-town data)
- Electrical permit (state-level Department of Public Safety, $50-200)
- Plumbing permit (state-level Department of Public Safety, $50-200)
- Wastewater permit (state Agency of Natural Resources, $100-1500)
`

// ---------------------------------------------------------------------------
// COMPACT SUMMARY for chat system prompt
// ---------------------------------------------------------------------------

export function zoningSummaryForPrompt(): string {
  const lines: string[] = ['VERMONT ZONING + PERMIT REFERENCE (top 12 towns)']
  lines.push(VT_STATEWIDE_ZONING_NOTES.trim())
  lines.push('')
  lines.push('PER-TOWN HIGHLIGHTS:')
  for (const tz of TOWN_ZONING) {
    lines.push(`### ${tz.town} (${tz.county} County, ~${tz.populationApprox.toLocaleString()})`)
    lines.push(`Setbacks: ${tz.setbacks.front}/${tz.setbacks.side}/${tz.setbacks.rear} (front/side/rear). Lot coverage cap ${Math.round(tz.maxLotCoverage * 100)}%. Height ${tz.maxBuildingHeight}ft.`)
    lines.push(`ADU: max ${tz.adu.maxSizeSqFt} sqft, owner-occupy ${tz.adu.ownerOccupancyRequired ? 'YES' : 'no'}, parking: ${tz.adu.parkingRequirement}.`)
    lines.push(`Permit fee: ${tz.permitFeeStructure}`)
    lines.push(`Overlays: ${tz.overlays.join(', ') || 'none'}`)
    lines.push(`Notes: ${tz.notes}`)
    lines.push('')
  }
  return lines.join('\n')
}
