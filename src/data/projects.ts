// Vermont renovation cost data — single source of truth.
// Used by the chat backend to ground cost answers.
// Eventually the calculator will import from here too.
//
// Cost ranges are 2026 figures sourced from Vermont contractor quotes,
// EIA RSMeans VT regional adjustment factors, and EVT contractor network data.
// Update annually around January.

export type Trade =
  | 'kitchen'
  | 'bathroom'
  | 'deck'
  | 'addition'
  | 'basement'
  | 'roofing'
  | 'siding'
  | 'window'
  | 'flooring'
  | 'painting_interior'
  | 'painting_exterior'
  | 'electrical_panel'
  | 'plumbing'
  | 'hvac'

export type Scope = 'budget' | 'mid' | 'high'

export type TownBucket =
  | 'burlington_metro' // Burlington, S Burlington, Essex, Williston, Colchester, Winooski
  | 'chittenden_other' // rest of Chittenden county
  | 'resort_premium'  // Stowe, Manchester, Woodstock, Killington area
  | 'small_city'      // Montpelier, Rutland, Brattleboro, Bennington, Barre
  | 'rural'           // most of state

export type CostRange = {
  low: number
  high: number
  median: number
  unit: 'project' | 'sqft' | 'linear_ft' | 'each'
}

export type ProjectCost = {
  trade: Trade
  scope: Scope
  description: string
  whatsIn: string
  whatsNot: string
  pushesHigh: string
  // Costs by town bucket
  costs: Record<TownBucket, CostRange>
  // VT-specific notes
  vtNotes: string
  permitFee: { low: number; high: number; note: string }
}

// ---------------------------------------------------------------------------
// PROJECTS — full cost catalog
// ---------------------------------------------------------------------------

export const PROJECT_COSTS: ProjectCost[] = [
  // ─── KITCHENS ────────────────────────────────────────────────────────────
  {
    trade: 'kitchen',
    scope: 'budget',
    description: 'Cosmetic refresh — paint, hardware, refinish cabinets, lighting upgrade, no layout changes',
    whatsIn: 'Cabinet refacing or repaint, new pulls, countertop replacement (laminate or low-end stone), new sink/faucet, lighting, basic appliance swap',
    whatsNot: 'No layout changes, no walls moved, no major electrical or plumbing work, keeping existing flooring',
    pushesHigh: 'Solid wood cabinet refacing, premium hardware, mid-range stone counters, new flooring',
    costs: {
      burlington_metro: { low: 12000, high: 25000, median: 17000, unit: 'project' },
      chittenden_other: { low: 11000, high: 23000, median: 16000, unit: 'project' },
      resort_premium:   { low: 14000, high: 30000, median: 20000, unit: 'project' },
      small_city:       { low: 10000, high: 22000, median: 15000, unit: 'project' },
      rural:            { low: 9000,  high: 20000, median: 13500, unit: 'project' },
    },
    vtNotes: 'Mud season (March-May) is the quietest contractor window — book March for May/June start. Most VT kitchen refresh projects done in 4-6 weeks if no surprises.',
    permitFee: { low: 0, high: 50, note: 'Cosmetic refresh usually no permit needed unless plumbing or electrical moves' },
  },
  {
    trade: 'kitchen',
    scope: 'mid',
    description: 'Standard remodel — new cabinets, counters, appliances, possible minor layout tweaks',
    whatsIn: 'New stock or semi-custom cabinets, quartz or granite counters, mid-range appliances, new flooring, new sink/faucet, new lighting, possible relocation of one fixture',
    whatsNot: 'No structural walls moved, no addition, no new bump-outs',
    pushesHigh: 'Custom cabinets, premium counters, high-end appliances, removing a wall, new windows',
    costs: {
      burlington_metro: { low: 50000, high: 85000, median: 65000, unit: 'project' },
      chittenden_other: { low: 45000, high: 78000, median: 60000, unit: 'project' },
      resort_premium:   { low: 60000, high: 110000, median: 80000, unit: 'project' },
      small_city:       { low: 42000, high: 72000, median: 55000, unit: 'project' },
      rural:            { low: 38000, high: 65000, median: 50000, unit: 'project' },
    },
    vtNotes: 'Plan 8-14 week timeline. VT cabinet lead times can run 8-12 weeks alone. Order before tearout starts. EVT rebates may apply if you upgrade to induction range or heat pump water heater during the remodel.',
    permitFee: { low: 75, high: 250, note: 'Burlington ~$150-250 for kitchen permit including plumbing/electrical. Most towns charge by project value: $50-150 base plus per-$1000 of work.' },
  },
  {
    trade: 'kitchen',
    scope: 'high',
    description: 'Gut remodel — full layout change, possibly removing walls, premium finishes',
    whatsIn: 'Custom cabinets, high-end stone or specialty counters, professional-grade appliances, possible structural wall removal, new windows, premium flooring, possible new electrical service',
    whatsNot: 'Not a full home remodel — kitchen footprint only',
    pushesHigh: 'Walk-in pantry, butlers pantry, second sink, chef-grade range with venthood, integrated panels for fridge/dishwasher',
    costs: {
      burlington_metro: { low: 95000, high: 175000, median: 130000, unit: 'project' },
      chittenden_other: { low: 88000, high: 160000, median: 120000, unit: 'project' },
      resort_premium:   { low: 120000, high: 250000, median: 175000, unit: 'project' },
      small_city:       { low: 80000, high: 145000, median: 110000, unit: 'project' },
      rural:            { low: 72000, high: 130000, median: 100000, unit: 'project' },
    },
    vtNotes: 'High-end VT kitchen remodels are 16-24 weeks. Engineering required for wall removal — old VT houses (pre-1950) often have surprises in framing. Budget 15-20% contingency on top of estimate.',
    permitFee: { low: 200, high: 600, note: 'Structural permits require engineer stamp ($500-1500). Burlington high-end project permit total ~$400-600.' },
  },

  // ─── BATHROOMS ───────────────────────────────────────────────────────────
  {
    trade: 'bathroom',
    scope: 'budget',
    description: 'Cosmetic update — vanity, fixtures, paint, possibly new toilet',
    whatsIn: 'New vanity and top, new toilet, new mirror/lighting, new faucet, paint, possibly new flooring (vinyl or basic tile)',
    whatsNot: 'No tile shower, no tub replacement, no plumbing relocation',
    pushesHigh: 'Tile floor, premium vanity, new shower fixtures',
    costs: {
      burlington_metro: { low: 4500, high: 9000, median: 6500, unit: 'project' },
      chittenden_other: { low: 4200, high: 8500, median: 6000, unit: 'project' },
      resort_premium:   { low: 5500, high: 11000, median: 8000, unit: 'project' },
      small_city:       { low: 4000, high: 8000, median: 5800, unit: 'project' },
      rural:            { low: 3800, high: 7500, median: 5500, unit: 'project' },
    },
    vtNotes: 'Half-bath cosmetic refresh under $4k common in rural VT. Powder room with new vanity + toilet + paint can be done in a weekend if DIY-inclined.',
    permitFee: { low: 0, high: 75, note: 'Like-for-like fixture replacement usually no permit. New plumbing adds permit ($50-100).' },
  },
  {
    trade: 'bathroom',
    scope: 'mid',
    description: 'Full remodel — new tile, shower, vanity, fixtures, possibly new layout',
    whatsIn: 'Tile shower with door, new tub or just shower, new vanity with stone top, new toilet, tile floor, new lighting/exhaust, new fixtures throughout',
    whatsNot: 'No structural changes, no expansion of footprint',
    pushesHigh: 'Heated floor, frameless glass shower, double vanity, premium tile, soaking tub',
    costs: {
      burlington_metro: { low: 18000, high: 32000, median: 24000, unit: 'project' },
      chittenden_other: { low: 16500, high: 29000, median: 22000, unit: 'project' },
      resort_premium:   { low: 22000, high: 42000, median: 30000, unit: 'project' },
      small_city:       { low: 15000, high: 27000, median: 20000, unit: 'project' },
      rural:            { low: 13500, high: 25000, median: 18500, unit: 'project' },
    },
    vtNotes: 'Bathroom remodels often expose plumbing problems in old VT houses. Cast iron stack replacement adds $2-5k. Galvanized supply line replacement another $1.5-3k. Budget 15% contingency.',
    permitFee: { low: 100, high: 250, note: 'Standard town bath remodel permit. Burlington ~$150.' },
  },
  {
    trade: 'bathroom',
    scope: 'high',
    description: 'Premium spa-grade or expansion bath — moved walls, premium materials, custom touches',
    whatsIn: 'Heated floors, frameless glass, custom tile work, double vanity, soaking tub plus separate shower, premium fixtures (Kohler/Toto), possibly added square footage',
    whatsNot: 'Not a full home renovation — bath only',
    pushesHigh: 'Steam shower, sauna, custom millwork, walk-in closet integration',
    costs: {
      burlington_metro: { low: 42000, high: 80000, median: 58000, unit: 'project' },
      chittenden_other: { low: 38000, high: 72000, median: 53000, unit: 'project' },
      resort_premium:   { low: 55000, high: 110000, median: 78000, unit: 'project' },
      small_city:       { low: 35000, high: 68000, median: 50000, unit: 'project' },
      rural:            { low: 32000, high: 62000, median: 45000, unit: 'project' },
    },
    vtNotes: 'Old VT house masters retrofitting an ensuite bath often requires moving plumbing stacks, structural reinforcement of subfloor for tile/stone, and venting through old roofs.',
    permitFee: { low: 200, high: 500, note: 'Higher fees for structural changes, additions, or new water service.' },
  },

  // ─── DECKS ───────────────────────────────────────────────────────────────
  {
    trade: 'deck',
    scope: 'budget',
    description: 'Pressure-treated deck, basic rails, ground level',
    whatsIn: 'PT framing and decking, basic 4x4 PT railings, footings to frost line (4ft in VT), simple stairs',
    whatsNot: 'No screened porch, no roof, no composite, no built-ins',
    pushesHigh: 'Composite decking instead of PT, premium railings, more square footage',
    costs: {
      burlington_metro: { low: 35,  high: 55,  median: 42, unit: 'sqft' },
      chittenden_other: { low: 33,  high: 52,  median: 40, unit: 'sqft' },
      resort_premium:   { low: 42,  high: 65,  median: 50, unit: 'sqft' },
      small_city:       { low: 32,  high: 50,  median: 38, unit: 'sqft' },
      rural:            { low: 28,  high: 45,  median: 35, unit: 'sqft' },
    },
    vtNotes: 'VT frost line is 48" minimum statewide, 60" in some towns. That makes footings expensive. Sonotube footings $250-400 each in VT.',
    permitFee: { low: 75, high: 250, note: 'Most VT towns require deck permit if attached to house or over 30" off ground. Setback compliance critical near property lines.' },
  },
  {
    trade: 'deck',
    scope: 'mid',
    description: 'Composite deck with quality railings, possibly multi-level',
    whatsIn: 'Trex/Azek composite decking, aluminum or cable railings, lighting, possibly built-in benches, multi-level option',
    whatsNot: 'No roof, no screened section, no outdoor kitchen',
    pushesHigh: 'Adding a roof or pergola, screened section, outdoor kitchen rough-in',
    costs: {
      burlington_metro: { low: 60,  high: 95,  median: 75, unit: 'sqft' },
      chittenden_other: { low: 55,  high: 90,  median: 70, unit: 'sqft' },
      resort_premium:   { low: 75,  high: 120, median: 95, unit: 'sqft' },
      small_city:       { low: 52,  high: 85,  median: 67, unit: 'sqft' },
      rural:            { low: 48,  high: 78,  median: 62, unit: 'sqft' },
    },
    vtNotes: 'VT outdoor season is short — book deck builders by January for May/June construction. Many take a winter pause Dec-Feb.',
    permitFee: { low: 100, high: 300, note: 'Same as budget plus possible electrical permit for lighting.' },
  },
  {
    trade: 'deck',
    scope: 'high',
    description: 'Screened porch or 3-season room with full structure',
    whatsIn: 'Full roof structure, screened or 3-season walls, premium decking, electrical for fans/lighting, possibly heating, premium finishes',
    whatsNot: 'Not a 4-season heated addition',
    pushesHigh: 'Stone fireplace, full HVAC integration, kitchen rough-in, premium roof material',
    costs: {
      burlington_metro: { low: 150, high: 250, median: 195, unit: 'sqft' },
      chittenden_other: { low: 140, high: 230, median: 180, unit: 'sqft' },
      resort_premium:   { low: 180, high: 320, median: 240, unit: 'sqft' },
      small_city:       { low: 130, high: 215, median: 170, unit: 'sqft' },
      rural:            { low: 120, high: 200, median: 155, unit: 'sqft' },
    },
    vtNotes: 'A real 3-season room in VT means being able to use it April-October. Add heat and you have a 4-season — but then you cross into addition territory and code requirements jump.',
    permitFee: { low: 300, high: 800, note: 'Structural addition permits in most towns.' },
  },

  // ─── ADDITION ────────────────────────────────────────────────────────────
  {
    trade: 'addition',
    scope: 'budget',
    description: 'Bump-out (under 100 sqft) — extending a single room',
    whatsIn: 'Foundation, framing, roof tied in, exterior finish to match, basic interior, electrical extension',
    whatsNot: 'Not a full room, no plumbing extension typically, no premium finishes',
    pushesHigh: 'Adding plumbing, premium siding, roof complications',
    costs: {
      burlington_metro: { low: 350, high: 500, median: 420, unit: 'sqft' },
      chittenden_other: { low: 320, high: 470, median: 390, unit: 'sqft' },
      resort_premium:   { low: 425, high: 600, median: 510, unit: 'sqft' },
      small_city:       { low: 300, high: 450, median: 370, unit: 'sqft' },
      rural:            { low: 280, high: 420, median: 350, unit: 'sqft' },
    },
    vtNotes: 'Foundation in VT is the killer cost. Frost wall to 48" + slab is $7-12k for a small addition before anything else.',
    permitFee: { low: 400, high: 900, note: 'Building permit + zoning compliance. Setback variance if needed adds $300-1500.' },
  },
  {
    trade: 'addition',
    scope: 'mid',
    description: 'Real room addition (100-400 sqft) — bedroom, family room, mudroom, etc.',
    whatsIn: 'Full foundation, framing, roof, exterior, drywall, flooring, electrical, possible plumbing, integrated with existing house',
    whatsNot: 'Not an in-law suite, no kitchen, basic finishes',
    pushesHigh: 'Adding bathroom (+15-25k), kitchenette, separate entry, premium finishes, vaulted ceilings',
    costs: {
      burlington_metro: { low: 280, high: 450, median: 360, unit: 'sqft' },
      chittenden_other: { low: 260, high: 420, median: 335, unit: 'sqft' },
      resort_premium:   { low: 350, high: 550, median: 440, unit: 'sqft' },
      small_city:       { low: 240, high: 400, median: 315, unit: 'sqft' },
      rural:            { low: 220, high: 375, median: 290, unit: 'sqft' },
    },
    vtNotes: 'Most VT additions go 4-7 months from break-ground to occupancy. Budget early — engineering, permits, and design can take 2-3 months before construction starts.',
    permitFee: { low: 600, high: 1500, note: 'Building + electrical + plumbing permits. Architecture/engineer fees separate ($3-8k for a real addition).' },
  },
  {
    trade: 'addition',
    scope: 'high',
    description: 'Full ADU or in-law suite (500-900 sqft) — kitchen, bath, bedroom, separate entry',
    whatsIn: 'Full foundation, complete dwelling unit, kitchen, bathroom, bedroom, possibly separate utilities, ADU code compliance',
    whatsNot: 'Not a full second house — attached or detached ADU only',
    pushesHigh: 'Detached ADU vs attached (detached costs more), septic upgrade, separate utility services',
    costs: {
      burlington_metro: { low: 350, high: 550, median: 440, unit: 'sqft' },
      chittenden_other: { low: 325, high: 510, median: 410, unit: 'sqft' },
      resort_premium:   { low: 425, high: 700, median: 550, unit: 'sqft' },
      small_city:       { low: 300, high: 480, median: 380, unit: 'sqft' },
      rural:            { low: 275, high: 450, median: 350, unit: 'sqft' },
    },
    vtNotes: 'Vermont allows ADUs by right statewide as of 2024 (Act 47). Most towns can no longer ban them. But local septic capacity is the practical constraint — old systems sized for 3 bedrooms cant support an ADU bedroom without a system upgrade ($15-35k).',
    permitFee: { low: 800, high: 2500, note: 'ADU permit + possible septic permit. Wastewater permit (if expansion needed) adds $500-1500.' },
  },

  // ─── BASEMENT FINISHING ──────────────────────────────────────────────────
  {
    trade: 'basement',
    scope: 'budget',
    description: 'Basic finished space — drywall, flooring, ceiling, basic lighting',
    whatsIn: 'Framing, insulation, drywall, drop ceiling or drywall ceiling, flooring (LVP), basic electrical, paint',
    whatsNot: 'No bathroom, no kitchen, no egress window addition, no waterproofing if not present',
    pushesHigh: 'Adding egress, waterproofing, bathroom, ceiling height issues',
    costs: {
      burlington_metro: { low: 35,  high: 60,  median: 45, unit: 'sqft' },
      chittenden_other: { low: 32,  high: 55,  median: 42, unit: 'sqft' },
      resort_premium:   { low: 42,  high: 72,  median: 55, unit: 'sqft' },
      small_city:       { low: 30,  high: 52,  median: 40, unit: 'sqft' },
      rural:            { low: 28,  high: 48,  median: 37, unit: 'sqft' },
    },
    vtNotes: 'Vermont basements are wet. Address moisture FIRST or finishing is wasted money. Sump pump + interior drain $3-7k. Dehumidifier with humidistat $500-800. If you smell musty, have radon tested before anything else (free test kits from VT Health Dept).',
    permitFee: { low: 100, high: 300, note: 'Most towns require permit for basement finishing especially if adding bedroom (egress required).' },
  },
  {
    trade: 'basement',
    scope: 'mid',
    description: 'Full finished basement with bathroom and one designated room',
    whatsIn: 'All budget items plus a 3/4 bath, family room, possibly office or guest room with proper egress',
    whatsNot: 'No kitchen, no separate entry, no in-law suite designation',
    pushesHigh: 'Egress window cut into foundation ($3-6k), upgraded electrical service, premium finishes',
    costs: {
      burlington_metro: { low: 65,  high: 105, median: 82, unit: 'sqft' },
      chittenden_other: { low: 60,  high: 98,  median: 76, unit: 'sqft' },
      resort_premium:   { low: 78,  high: 130, median: 100, unit: 'sqft' },
      small_city:       { low: 56,  high: 92,  median: 72, unit: 'sqft' },
      rural:            { low: 52,  high: 87,  median: 68, unit: 'sqft' },
    },
    vtNotes: 'Adding a bedroom in a finished basement requires legal egress (proper window or walk-out). Cutting an egress in poured foundation $3-7k, in stone foundation can be $8-15k. Without egress its an office or rec room, not a bedroom.',
    permitFee: { low: 200, high: 600, note: 'Permit complexity rises with bath addition.' },
  },

  // ─── ROOFING ─────────────────────────────────────────────────────────────
  {
    trade: 'roofing',
    scope: 'budget',
    description: 'Architectural asphalt shingle replacement on simple roof',
    whatsIn: 'Tear-off existing one layer, ice/water shield to 6ft from eaves, synthetic underlayment, 30-year architectural shingles, ridge vents, drip edge, basic flashing replacement',
    whatsNot: 'No deck replacement (assumes plywood is sound), no skylight reflashing extras, no major chimney work',
    pushesHigh: 'Multiple layers to tear off, plywood replacement, complex roof shape, steep pitch',
    costs: {
      burlington_metro: { low: 6.50,  high: 10.50, median: 8.25, unit: 'sqft' },
      chittenden_other: { low: 6.00,  high: 9.75,  median: 7.75, unit: 'sqft' },
      resort_premium:   { low: 7.50,  high: 12.50, median: 9.75, unit: 'sqft' },
      small_city:       { low: 5.75,  high: 9.25,  median: 7.50, unit: 'sqft' },
      rural:            { low: 5.50,  high: 9.00,  median: 7.00, unit: 'sqft' },
    },
    vtNotes: 'VT requires ice/water shield to 6ft minimum from eaves in all new roofs (ice dam protection). Most VT roofers schedule May-October — winter roofing only on emergency basis at premium pricing.',
    permitFee: { low: 0, high: 150, note: 'Some towns no permit for like-for-like reroof. Burlington requires roofing permit ~$50-100.' },
  },
  {
    trade: 'roofing',
    scope: 'mid',
    description: 'Standing seam metal roof — steel or aluminum',
    whatsIn: 'Tear-off, ice/water shield, full underlayment, 24/26ga standing seam metal panels, snow guards above doors, custom flashings, ridge vent, drip edge',
    whatsNot: 'No deck replacement, no chimney rebuild',
    pushesHigh: 'Premium aluminum vs steel, copper, complex roof, snow rails for full eaves',
    costs: {
      burlington_metro: { low: 14, high: 22, median: 17, unit: 'sqft' },
      chittenden_other: { low: 13, high: 20, median: 16, unit: 'sqft' },
      resort_premium:   { low: 16, high: 26, median: 20, unit: 'sqft' },
      small_city:       { low: 12, high: 19, median: 15, unit: 'sqft' },
      rural:            { low: 11, high: 18, median: 14, unit: 'sqft' },
    },
    vtNotes: 'Standing seam is the right roof for Vermont — sheds snow, lasts 50+ years, handles ice dams. Pay 2x asphalt cost up front, save 2x over lifetime. Snow guards over entries mandatory or it sheets off and kills you.',
    permitFee: { low: 50, high: 200, note: 'Same as asphalt.' },
  },

  // ─── SIDING ──────────────────────────────────────────────────────────────
  {
    trade: 'siding',
    scope: 'mid',
    description: 'Vinyl or fiber cement (Hardie) siding replacement',
    whatsIn: 'Tear-off, house wrap, new siding, trim, basic flashing, painted soffit/fascia',
    whatsNot: 'No new windows, no insulation upgrade (separate)',
    pushesHigh: 'Hardie vs vinyl (Hardie ~30% more), complex trim, three stories, wrap-around porches',
    costs: {
      burlington_metro: { low: 9,  high: 16, median: 12, unit: 'sqft' },
      chittenden_other: { low: 8.5, high: 15, median: 11.5, unit: 'sqft' },
      resort_premium:   { low: 11, high: 19, median: 14.5, unit: 'sqft' },
      small_city:       { low: 8,  high: 14, median: 11, unit: 'sqft' },
      rural:            { low: 7.5, high: 13, median: 10, unit: 'sqft' },
    },
    vtNotes: 'Hardie is the right choice in VT for fire resistance and longevity. Vinyl is fine but cheaper-looking. Wood siding (clapboard) is traditional but $18-25/sqft and needs paint every 7-10 years.',
    permitFee: { low: 50, high: 200, note: 'Most towns require permit for whole-house siding replacement.' },
  },

  // ─── WINDOW REPLACEMENT ─────────────────────────────────────────────────
  {
    trade: 'window',
    scope: 'mid',
    description: 'Vinyl/fiberglass replacement window, full-frame',
    whatsIn: 'Mid-grade replacement window (Andersen 100, Marvin Essential, Pella), proper flashing, interior trim restoration',
    whatsNot: 'Not custom architectural shapes, not wood storm windows',
    pushesHigh: 'Wood-clad windows ($1500-2500/window), historic-replica wood windows ($2500-4500/window)',
    costs: {
      burlington_metro: { low: 850, high: 1500, median: 1100, unit: 'each' },
      chittenden_other: { low: 800, high: 1400, median: 1050, unit: 'each' },
      resort_premium:   { low: 1000, high: 1750, median: 1300, unit: 'each' },
      small_city:       { low: 750, high: 1300, median: 1000, unit: 'each' },
      rural:            { low: 700, high: 1250, median: 950, unit: 'each' },
    },
    vtNotes: 'EVT rebates available for ENERGY STAR Northern Climate Zone windows ($25-100 per window depending on program). Air sealing during install matters more than U-value rating in old VT houses.',
    permitFee: { low: 0, high: 50, note: 'Like-for-like usually no permit. Resizing openings adds permit.' },
  },

  // ─── HEAT PUMP — NEW INSTALL ────────────────────────────────────────────
  {
    trade: 'hvac',
    scope: 'mid',
    description: 'Cold-climate heat pump install — single zone ductless',
    whatsIn: 'Mitsubishi/Fujitsu cold-climate single zone (1 outdoor + 1 indoor), refrigerant lines, electrical hookup, condenser pad, basic install',
    whatsNot: 'Not whole-house ducted, not multi-zone',
    pushesHigh: 'Multiple indoor heads (each adds $1500-3000), longer line sets, electrical service upgrade',
    costs: {
      burlington_metro: { low: 5000, high: 8500, median: 6500, unit: 'project' },
      chittenden_other: { low: 4800, high: 8000, median: 6200, unit: 'project' },
      resort_premium:   { low: 6000, high: 10500, median: 8000, unit: 'project' },
      small_city:       { low: 4600, high: 7800, median: 5900, unit: 'project' },
      rural:            { low: 4500, high: 7500, median: 5800, unit: 'project' },
    },
    vtNotes: 'EVT rebate $475 per indoor head. GMP +$2000 income bonus, VPPSA +$1000. Net out-of-pocket on a single-zone for a GMP income-eligible household: typically $2-4k. Use an EVT-network installer — they file the paperwork.',
    permitFee: { low: 75, high: 200, note: 'Electrical permit ($50-150). HVAC permit varies by town.' },
  },
  {
    trade: 'hvac',
    scope: 'high',
    description: 'Whole-house ducted heat pump (3-5 ton) — full ductwork system',
    whatsIn: 'Cold-climate ducted unit (Mitsubishi PVA, Daikin Fit), full ductwork, return air, blower, refrigerant lines, electrical, thermostat, condensate management',
    whatsNot: 'Not a multi-zone ductless mash-up, not adding ductwork to existing forced-air system',
    pushesHigh: 'Adding ductwork to a house that has none ($8-15k extra), electrical service upgrade, removing old oil tank',
    costs: {
      burlington_metro: { low: 18000, high: 28000, median: 22000, unit: 'project' },
      chittenden_other: { low: 16500, high: 26000, median: 21000, unit: 'project' },
      resort_premium:   { low: 20000, high: 32000, median: 25000, unit: 'project' },
      small_city:       { low: 15500, high: 24500, median: 19500, unit: 'project' },
      rural:            { low: 15000, high: 24000, median: 19000, unit: 'project' },
    },
    vtNotes: 'EVT rebate $2,200. GMP income bonus +$2000, VPPSA +$1000. Weatherize FIRST — a tighter house needs a smaller (cheaper) heat pump and runs more efficiently. Old oil furnaces hidden costs: oil tank removal ($500-1500), chimney decommission ($300-800), ductwork in old houses often has asbestos wrap ($1500-4000 for proper abatement).',
    permitFee: { low: 200, high: 600, note: 'Building + electrical + mechanical permits. Old oil tank removal may require additional permit.' },
  },
]

// ---------------------------------------------------------------------------
// TOWN BUCKET LOOKUP — town name to bucket
// ---------------------------------------------------------------------------

export const TOWN_TO_BUCKET: Record<string, TownBucket> = {
  // Burlington metro
  'burlington': 'burlington_metro',
  'south burlington': 'burlington_metro',
  'essex': 'burlington_metro',
  'essex junction': 'burlington_metro',
  'williston': 'burlington_metro',
  'colchester': 'burlington_metro',
  'winooski': 'burlington_metro',
  'shelburne': 'burlington_metro',

  // Chittenden other
  'jericho': 'chittenden_other',
  'underhill': 'chittenden_other',
  'richmond': 'chittenden_other',
  'huntington': 'chittenden_other',
  'hinesburg': 'chittenden_other',
  'charlotte': 'chittenden_other',
  'milton': 'chittenden_other',

  // Resort premium
  'stowe': 'resort_premium',
  'manchester': 'resort_premium',
  'manchester center': 'resort_premium',
  'woodstock': 'resort_premium',
  'killington': 'resort_premium',
  'warren': 'resort_premium',
  'waitsfield': 'resort_premium',
  'waterbury': 'resort_premium',
  'dorset': 'resort_premium',

  // Small city
  'montpelier': 'small_city',
  'rutland': 'small_city',
  'brattleboro': 'small_city',
  'bennington': 'small_city',
  'barre': 'small_city',
  'st. johnsbury': 'small_city',
  'st johnsbury': 'small_city',
  'newport': 'small_city',
  'middlebury': 'small_city',
  'morrisville': 'small_city',
  'springfield': 'small_city',
}

export function bucketForTown(town: string | undefined): TownBucket {
  if (!town) return 'rural'
  const key = town.toLowerCase().trim()
  return TOWN_TO_BUCKET[key] || 'rural'
}

// ---------------------------------------------------------------------------
// SUMMARIZE for chat system prompt — compact per-trade summary
// ---------------------------------------------------------------------------

export function projectsSummaryForPrompt(): string {
  const lines: string[] = ['VERMONT RENOVATION COSTS (2026 figures)']
  lines.push('Cost ranges below are pre-rebate, pre-tax. Add 15% contingency for old VT houses.')
  lines.push('Town buckets: burlington_metro = Burlington/S Burlington/Essex/Williston/Colchester. resort_premium = Stowe/Manchester/Woodstock/Killington/Warren/Waitsfield. small_city = Montpelier/Rutland/Brattleboro/Bennington/Barre/St Johnsbury/Newport/Middlebury. rural = everywhere else (most of state). Resort premium is ~15-25% above rural; Burlington metro is ~10-20% above rural.')
  lines.push('')

  // Group by trade
  const byTrade: Record<string, ProjectCost[]> = {}
  for (const p of PROJECT_COSTS) {
    if (!byTrade[p.trade]) byTrade[p.trade] = []
    byTrade[p.trade].push(p)
  }

  for (const [trade, scopes] of Object.entries(byTrade)) {
    lines.push(`## ${trade.toUpperCase()}`)
    for (const s of scopes) {
      const ruralMed = s.costs.rural.median
      const metroMed = s.costs.burlington_metro.median
      const resortMed = s.costs.resort_premium.median
      const unit = s.costs.rural.unit
      const fmt = (n: number) => unit === 'sqft' || unit === 'linear_ft' ? `$${n}/${unit}` : unit === 'each' ? `$${n.toLocaleString()}/each` : `$${n.toLocaleString()}`
      lines.push(`- ${s.scope}: ${s.description}`)
      lines.push(`  Median: ${fmt(ruralMed)} rural / ${fmt(metroMed)} Burlington metro / ${fmt(resortMed)} resort towns`)
      lines.push(`  In: ${s.whatsIn}`)
      lines.push(`  Pushes high: ${s.pushesHigh}`)
      lines.push(`  VT note: ${s.vtNotes}`)
      lines.push(`  Permit: $${s.permitFee.low}-${s.permitFee.high}. ${s.permitFee.note}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}
