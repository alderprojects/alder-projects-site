// Vermont homeowner small-job + maintenance reference.
// Top recurring jobs that don't fit the renovation cost framework
// — the "what does it cost to deal with this thing" questions.
//
// Includes affiliate-ready hooks for DIY-applicable items
// (tools/supplies). Affiliate disclosure required where used:
// "Some links earn a small commission if you buy. That's how a free
// Vermont site stays free. We only recommend what we'd buy ourselves."

import type { State } from './_types'
import { DEFAULT_STATE } from './_types'

export type HandymanJob = {
  id: string
  state: State
  category: 'gutters' | 'septic' | 'tree' | 'chimney' | 'snow' | 'oil_tank' | 'water' | 'dryer_vent' | 'pest' | 'foundation'
  title: string
  whenToDo: string
  vtSeasonalWindow: string  // Best months in VT
  diyVsHire: 'diy_easy' | 'diy_with_caution' | 'hire_advised' | 'hire_required'
  costRange: { low: number; high: number; unit: string }
  whatsIncluded: string
  vtSpecificNotes: string
  warningSigns: string  // Signs you've waited too long
  // Affiliate hook for DIY-applicable items (tool/supply suggestions)
  diyMaterialsList?: string[]
  // Required disclosures
  affiliateNote?: string
}

// ---------------------------------------------------------------------------
// TOP HANDYMAN JOBS — VERMONT
// ---------------------------------------------------------------------------

export const HANDYMAN_JOBS: HandymanJob[] = [
  // ─── GUTTER CLEANING ────────────────────────────────────────────────────
  {
    id: 'gutter_cleaning',
    state: 'VT',
    category: 'gutters',
    title: 'Gutter cleaning + leader inspection',
    whenToDo: 'Twice yearly: late spring (after pollen drop) and mid-fall (after most leaves down). VT homes with mature maples may need 3x/year.',
    vtSeasonalWindow: 'Late May/early June + late October',
    diyVsHire: 'diy_with_caution',
    costRange: { low: 150, high: 350, unit: 'per visit' },
    whatsIncluded: 'Hand-clearing all gutter runs, flushing downspouts, checking for separated joints or pulled fasteners, inspecting fascia for rot.',
    vtSpecificNotes: 'VT homes with metal roofs shed leaves better than asphalt. Snow/ice damage to gutters is the #1 reason for fall replacement — inspect for sagging or pulled-away spots after winter. Ice dam history strongly suggests gutter heat cable consideration.',
    warningSigns: 'Water marks behind gutters (overflow), birds nesting (clog), greenery growing in gutter (mature blockage), gutter detached at corner (failed fastener).',
    diyMaterialsList: ['Sturdy ladder rated for your height (24ft for 2-story)', 'Gutter scoop (plastic, not metal — protects coating)', 'Heavy work gloves', 'Garden hose with spray nozzle'],
    affiliateNote: 'Sturdy ladder is the one tool not to cheap out on. Werner D-rung extension ladders run ~$150-300 at Home Depot or Aubuchon and last decades.',
  },

  // ─── SEPTIC PUMPING ─────────────────────────────────────────────────────
  {
    id: 'septic_pumping',
    state: 'VT',
    category: 'septic',
    title: 'Septic tank pumping',
    whenToDo: 'Every 3-5 years for typical household. More often (2-3 years) if disposal is heavily used, household >4 people, or system is older.',
    vtSeasonalWindow: 'Late May through October only — pump trucks cannot access frozen ground or mud-season roads.',
    diyVsHire: 'hire_required',
    costRange: { low: 350, high: 650, unit: 'per pumping' },
    whatsIncluded: 'Locating tank cover, opening, pumping all liquid + sludge, basic tank inspection, pump-out report. Some companies include filter cleaning and baffle inspection.',
    vtSpecificNotes: 'Old VT systems (pre-1990s) often have no riser to grade — locating cover involves probing the lawn, sometimes excavating. Adding risers ($300-500 first time) saves $$ on every future pumping. VT-licensed septic haulers required by law.',
    warningSigns: 'Sewage smell near tank, slow drains throughout house, gurgling toilets, lush green grass over leach field (effluent surfacing).',
  },

  // ─── TREE REMOVAL ───────────────────────────────────────────────────────
  {
    id: 'tree_removal',
    state: 'VT',
    category: 'tree',
    title: 'Tree removal — single mature tree near structures',
    whenToDo: 'Year-round but winter is often best (frozen ground = less yard damage). Avoid leafless windy weather windows.',
    vtSeasonalWindow: 'Dec-Feb (frozen ground), Apr-May before leaf-out',
    diyVsHire: 'hire_required',
    costRange: { low: 800, high: 3500, unit: 'per tree' },
    whatsIncluded: 'Felling, cutting into manageable rounds, hauling debris (or stacking on-site if requested for firewood), basic stump grinding (extra: $150-400 for full grind).',
    vtSpecificNotes: 'VT tree work near power lines requires utility coordination — GMP/BED will trim or remove on their right-of-way for free if tree threatens line. Maple/oak commands premium for arborist time. Beware "fly-by-night" tree services post-storm — verify insurance + workers comp before any tree work.',
    warningSigns: 'Mushrooms growing at tree base (root rot), large dead branches over 2" diameter dropping, vertical cracks in trunk, tree leaning more than usual.',
  },

  // ─── CHIMNEY SWEEP ──────────────────────────────────────────────────────
  {
    id: 'chimney_sweep',
    state: 'VT',
    category: 'chimney',
    title: 'Chimney sweep + Level 1 inspection',
    whenToDo: 'Annually if wood-burning. Every 2-3 years for occasional use. ALWAYS before a winter season after recent purchase or renovation.',
    vtSeasonalWindow: 'August-October (before heating season)',
    diyVsHire: 'hire_advised',
    costRange: { low: 200, high: 400, unit: 'per visit' },
    whatsIncluded: 'Brushing flue, removing creosote, inspecting cap and crown, checking for cracks, basic safety report. Level 2 inspection (camera scope) +$150-300 for property purchase or after chimney fire.',
    vtSpecificNotes: "VT wood-burning is heavy use — most VT chimneys need annual sweep at minimum. CSIA-certified sweeps required for insurance compliance after chimney fire. Pellet stove vents (PVC pipe) different process — many sweeps don't handle, ask first.",
    warningSigns: 'Smoke backing up into house, black tar-like creosote falling from damper, distinctive sweet/petrochemical smell from chimney area, visible cracks in mortar joints.',
  },

  // ─── SNOW PLOWING ───────────────────────────────────────────────────────
  {
    id: 'snow_plowing',
    state: 'VT',
    category: 'snow',
    title: 'Driveway snow plowing contract',
    whenToDo: 'Sign contract by November 1 — most plow operators full by Nov 15. Mid-season signups pay 30-50% premium.',
    vtSeasonalWindow: 'Contract Oct-Nov for Dec-Mar service',
    diyVsHire: 'hire_advised',
    costRange: { low: 400, high: 1200, unit: 'season contract' },
    whatsIncluded: 'Per-event plowing for any storm dropping >2-3" (varies by contract). Sand/salt application extra (typically +$150-400/season). Per-push contracts ($35-75/event) cheaper for low-snow winters.',
    vtSpecificNotes: 'VT typical winter has 25-40 plowable events. 500ft+ driveway commands premium. Many small operators retiring without replacement — secure a relationship early. State plows (route 100, 7, etc) shoulder onto your driveway end — that "snow plow apron" is your problem to clear.',
    warningSigns: 'Plowing yourself with truck/SUV: damaged front-end, stuck axle, ruined transmission. Plow truck investment ($3-8k for used Plowman) only worth it for 600ft+ driveways or rural neighbors with combined route.',
    diyMaterialsList: ['Quality snow shovel — Garant or Suncast aluminum, $30-60', 'Roof rake for ice dam prevention — $40-80', 'Snow blower if walks/driveway under 200ft — $600-1500'],
    affiliateNote: 'For most VT homeowners with shorter driveways, a 22-26" 2-stage snow blower handles 95% of winter without contracted plowing.',
  },

  // ─── OIL TANK INSPECTION ────────────────────────────────────────────────
  {
    id: 'oil_tank_inspection',
    state: 'VT',
    category: 'oil_tank',
    title: 'Oil tank inspection (or removal)',
    whenToDo: 'Inspection every 2-3 years for tanks 15+ years old. Removal at 25+ years even if no visible problem — VT insurance requirements tightening.',
    vtSeasonalWindow: 'Year-round for above-ground tanks. Buried tanks accessible May-October only.',
    diyVsHire: 'hire_required',
    costRange: { low: 200, high: 1500, unit: 'inspection / removal' },
    whatsIncluded: 'Visual inspection of tank, fill/vent line, supply lines, oil filter, and burner. Tank ultrasonic thickness test (extra $150-200) recommended for 20+ year tanks.',
    vtSpecificNotes: "Buried oil tanks are a major VT homeowner liability — leaks trigger DEC cleanup ($5,000-50,000+). Many VT insurance policies now require buried tank removal. Replacement above-ground 275-gal tank: $1,500-2,500. Switching to heat pump? Decommissioning oil system properly (drain, abandon-in-place certification) costs $300-800. Don't just leave tank unused and forget it.",
    warningSigns: 'Oil smell in basement, dark stains on tank exterior, weeping at tank seams, oil spots on basement floor, tank visibly bowed or rusted at bottom.',
  },

  // ─── WELL WATER TESTING ─────────────────────────────────────────────────
  {
    id: 'well_water_testing',
    state: 'VT',
    category: 'water',
    title: 'Private well water testing',
    whenToDo: 'Annually for basic bacteria + nitrate. Every 3-5 years for full panel including arsenic, uranium, radon-in-water. Always test after pump replacement, flooding, or septic repair.',
    vtSeasonalWindow: 'Year-round, but late summer (lowest water table) gives most reliable contamination test',
    diyVsHire: 'diy_easy',
    costRange: { low: 30, high: 350, unit: 'per test panel' },
    whatsIncluded: 'Self-collect kit ($30-50): basic bacteria + nitrate. Lab full panel ($150-350): includes arsenic, uranium, radon, lead, hardness, pH, iron. VT Department of Health offers subsidized testing.',
    vtSpecificNotes: 'Significant portion of VT private wells exceed safe arsenic or uranium levels — bedrock geology. VT Health Dept maintains map of high-risk areas. Test BEFORE buying any well-water property — non-negotiable. Treatment costs (UV for bacteria $400-800, RO for arsenic $1,500-3,000, whole-house filter for radon $1,800-3,500).',
    warningSigns: 'Cloudy water, metallic taste, blue-green staining (copper/acidic water), red staining (iron), sulphur smell (hydrogen sulfide), suddenly different taste after rain.',
    diyMaterialsList: ['Vermont Department of Health test kit (free or low-cost)', 'For ongoing monitoring: TDS meter ~$15, pH strips ~$10'],
    affiliateNote: 'VT Health Department test kits are free or near-free — order direct from healthvermont.gov rather than commercial alternatives.',
  },

  // ─── DRYER VENT CLEANING ────────────────────────────────────────────────
  {
    id: 'dryer_vent',
    state: 'VT',
    category: 'dryer_vent',
    title: 'Dryer vent cleaning',
    whenToDo: 'Annually if heavy use, every 2 years light use. Always after extended pause (vacant property), and after birds nesting (spring).',
    vtSeasonalWindow: 'Year-round',
    diyVsHire: 'diy_easy',
    costRange: { low: 80, high: 200, unit: 'professional service' },
    whatsIncluded: 'Disconnect dryer, clean vent run from inside, clean exterior vent cap, check for blockages, verify proper airflow.',
    vtSpecificNotes: 'Long vent runs (basement laundry, exterior wall opposite from dryer) clog faster. Plastic flex vent must be replaced with rigid metal — fire code. Frequent cause of house fires in VT older homes.',
    warningSigns: 'Clothes taking 2+ cycles to dry, dryer running hot, lint visible at exterior vent cap, burning smell during operation.',
    diyMaterialsList: ['Dryer vent brush kit (drill-attachable) — $30-50', 'Replacement rigid metal vent if currently flex/plastic — $40-80', 'Aluminum foil tape for sealing connections — $8-12'],
    affiliateNote: 'A vent brush kit is one of the highest-ROI tool purchases for any homeowner. Lasts decades, prevents thousands in fire damage.',
  },
]

// ---------------------------------------------------------------------------
// AFFILIATE DISCLOSURE TEXT (footer-ready)
// ---------------------------------------------------------------------------

export const AFFILIATE_DISCLOSURE = `Some links on this page earn us a small commission if you buy through them. That's how a free Vermont site stays free. We only recommend products we'd buy ourselves — typically things you can find at Aubuchon Hardware, Home Depot, or your local lumber yard.`

// ---------------------------------------------------------------------------
// STATE-AWARE ACCESSOR
// ---------------------------------------------------------------------------

// Returns handyman jobs for the requested state. Today every entry is VT.
export function getHandymanJobsForState(state: State): HandymanJob[] {
  return HANDYMAN_JOBS.filter(j => j.state === state)
}

// ---------------------------------------------------------------------------
// COMPACT SUMMARY for chat system prompt
// ---------------------------------------------------------------------------

export function handymanSummaryForPrompt(state: State = DEFAULT_STATE): string {
  const lines: string[] = ['VERMONT HANDYMAN + MAINTENANCE REFERENCE (top recurring jobs)']
  lines.push('Use this as background for Vermont homeowner maintenance questions. Always recommend hiring vs DIY based on the diyVsHire flag.')
  lines.push('')
  for (const j of getHandymanJobsForState(state)) {
    lines.push(`### ${j.title}`)
    lines.push(`- Cost: $${j.costRange.low}-${j.costRange.high} ${j.costRange.unit}`)
    lines.push(`- DIY suitability: ${j.diyVsHire}`)
    lines.push(`- VT timing: ${j.vtSeasonalWindow}`)
    lines.push(`- When: ${j.whenToDo}`)
    lines.push(`- VT note: ${j.vtSpecificNotes}`)
    lines.push(`- Warning signs: ${j.warningSigns}`)
    if (j.diyMaterialsList) {
      lines.push(`- DIY materials: ${j.diyMaterialsList.join('; ')}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}
