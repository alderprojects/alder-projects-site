/**
 * v7.4.7 — Static region profile lookup. No external geo APIs, ever.
 *
 * Resolution: 5-digit ZIP → ZIP3 prefix → (override table | state base
 * table) → RegionProfile. The base table is state-level, derived from
 * the dominant IECC climate zone per state; the override table adds
 * ZIP3 granularity where a state clearly spans distinct zones (FL, TX,
 * CA, NY, NV, AZ, OR, WA, PA, TN, IL, ME, MI, MN, UT, NM, NJ, NC).
 * Residual in-state granularity is recorded backlog debt (per the
 * series brief's pre-answered fallback) — refine with the full
 * IECC county↔ZIP mapping when the data product track needs it.
 *
 * regionNote is written for synthesis consumption: a short, plain
 * climate statement the prompt may use to contextualize
 * recommendations. It must never be phrased as a photo observation —
 * that rule is enforced in the candidate prompt.
 */

export interface RegionProfile {
  climateZone: string // IECC zone, e.g. "6A"
  frostDepthClass: 'none' | 'shallow' | 'moderate' | 'deep' | 'very_deep'
  humidityClass: 'humid' | 'dry' | 'marine' | 'mixed'
  regionNote: string
}

function profile(
  climateZone: string,
  frostDepthClass: RegionProfile['frostDepthClass'],
  humidityClass: RegionProfile['humidityClass'],
  regionNote: string
): RegionProfile {
  return { climateZone, frostDepthClass, humidityClass, regionNote }
}

// Shared profiles per IECC zone family (note text reused across states
// in the same zone; state tables pick the fitting one).
const Z1_HUMID = profile('1A', 'none', 'humid', 'Very hot, humid climate (IECC zone 1) — cooling, humidity control, and corrosion resistance dominate; freezing is not a design concern.')
const Z2_HUMID = profile('2A', 'none', 'humid', 'Hot, humid climate (IECC zone 2) — cooling loads, indoor humidity, and mold-resistant materials matter most; frost is rarely a concern.')
const Z2_DRY = profile('2B', 'none', 'dry', 'Hot, dry climate (IECC zone 2B) — cooling and sun/UV exposure dominate; humidity and frost are minor concerns.')
const Z3_HUMID = profile('3A', 'shallow', 'humid', 'Warm, humid climate (IECC zone 3A) — cooling-season humidity and moisture management matter; freezes are brief and the frost line is shallow.')
const Z3_DRY = profile('3B', 'shallow', 'dry', 'Warm, dry climate (IECC zone 3B) — heat and UV exposure dominate; brief freezes only, shallow frost line.')
const Z3_MARINE = profile('3C', 'shallow', 'marine', 'Mild marine climate (IECC zone 3C) — damp coastal air and moderate temperatures; ventilation and moisture matter more than deep cold.')
const Z4_MIXED = profile('4A', 'moderate', 'mixed', 'Mixed climate (IECC zone 4A) — real heating and cooling seasons, moderate frost line; both humidity control and winter air-sealing pay off.')
const Z4_DRY = profile('4B', 'moderate', 'dry', 'Mixed dry climate (IECC zone 4B) — hot summers, cold nights, moderate frost line; air-sealing and sun exposure both matter.')
const Z4_MARINE = profile('4C', 'shallow', 'marine', 'Marine climate (IECC zone 4C) — long damp season, mild temperatures; moisture management and ventilation lead, deep frost is uncommon.')
const Z5_MIXED = profile('5A', 'deep', 'mixed', 'Cool climate (IECC zone 5A) — significant heating season and a deep frost line; insulation, air-sealing, and winter moisture control pay off.')
const Z5_DRY = profile('5B', 'deep', 'dry', 'Cool, dry climate (IECC zone 5B) — cold winters with a deep frost line but low humidity; heating efficiency and freeze protection matter.')
const Z6_HUMID = profile('6A', 'deep', 'mixed', 'Cold climate (IECC zone 6) — the frost line runs deep, the heating season is long, and spring moisture is real; weatherization and freeze protection are high-value.')
const Z6_DRY = profile('6B', 'deep', 'dry', 'Cold, dry climate (IECC zone 6B) — long heating season, deep frost line, low humidity; heating efficiency and freeze protection dominate.')
const Z7 = profile('7', 'very_deep', 'mixed', 'Very cold climate (IECC zone 7) — a very deep frost line and a dominant heating season; insulation, freeze protection, and ice-dam prevention lead everything.')

// State base table (dominant IECC zone per state; granularity debt noted
// in the module header).
const STATE_PROFILES: Record<string, RegionProfile> = {
  AL: Z3_HUMID, AK: Z7, AZ: Z2_DRY, AR: Z3_HUMID, CA: Z3_DRY, CO: Z5_DRY,
  CT: Z5_MIXED, DE: Z4_MIXED, DC: Z4_MIXED, FL: Z2_HUMID, GA: Z3_HUMID,
  HI: Z1_HUMID, ID: Z5_DRY, IL: Z5_MIXED, IN: Z5_MIXED, IA: Z5_MIXED,
  KS: Z4_MIXED, KY: Z4_MIXED, LA: Z2_HUMID, ME: Z6_HUMID, MD: Z4_MIXED,
  MA: Z5_MIXED, MI: Z5_MIXED, MN: Z6_HUMID, MS: Z3_HUMID, MO: Z4_MIXED,
  MT: Z6_DRY, NE: Z5_MIXED, NV: Z3_DRY, NH: Z6_HUMID, NJ: Z4_MIXED,
  NM: Z4_DRY, NY: Z5_MIXED, NC: Z3_HUMID, ND: Z7, OH: Z5_MIXED,
  OK: Z3_HUMID, OR: Z4_MARINE, PA: Z5_MIXED, RI: Z5_MIXED, SC: Z3_HUMID,
  SD: Z6_HUMID, TN: Z4_MIXED, TX: Z2_HUMID, UT: Z5_DRY, VT: Z6_HUMID,
  VA: Z4_MIXED, WA: Z4_MARINE, WV: Z4_MIXED, WI: Z6_HUMID, WY: Z6_DRY,
  PR: Z1_HUMID,
}

// USPS ZIP3 → state. Ranges are inclusive [lo, hi] on the 3-digit prefix.
const ZIP3_STATE_RANGES: Array<[number, number, string]> = [
  [5, 5, 'NY'], [6, 9, 'PR'], [10, 27, 'MA'], [28, 29, 'RI'], [30, 38, 'NH'],
  [39, 49, 'ME'], [50, 59, 'VT'], [60, 69, 'CT'], [70, 89, 'NJ'],
  [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'], [200, 205, 'DC'],
  [206, 219, 'MD'], [220, 246, 'VA'], [247, 268, 'WV'], [270, 289, 'NC'],
  [290, 299, 'SC'], [300, 319, 'GA'], [320, 349, 'FL'], [350, 369, 'AL'],
  [370, 385, 'TN'], [386, 397, 'MS'], [398, 399, 'GA'], [400, 427, 'KY'],
  [430, 458, 'OH'], [460, 479, 'IN'], [480, 499, 'MI'], [500, 528, 'IA'],
  [530, 549, 'WI'], [550, 567, 'MN'], [570, 577, 'SD'], [580, 588, 'ND'],
  [590, 599, 'MT'], [600, 629, 'IL'], [630, 658, 'MO'], [660, 679, 'KS'],
  [680, 693, 'NE'], [700, 714, 'LA'], [716, 729, 'AR'], [730, 749, 'OK'],
  [750, 799, 'TX'], [800, 816, 'CO'], [820, 831, 'WY'], [832, 838, 'ID'],
  [840, 847, 'UT'], [850, 865, 'AZ'], [870, 884, 'NM'], [885, 885, 'TX'],
  [889, 898, 'NV'], [900, 961, 'CA'], [962, 966, 'CA'], [967, 968, 'HI'],
  [970, 979, 'OR'], [980, 994, 'WA'], [995, 999, 'AK'],
]

// ZIP3 overrides where a state clearly splits across zones. Checked
// before the state base table.
const ZIP3_OVERRIDES: Record<string, RegionProfile> = {
  // FL: south FL / Keys are zone 1A
  '330': Z1_HUMID, '331': Z1_HUMID, '332': Z1_HUMID, '333': Z1_HUMID,
  // TX: DFW-ish 3A; Panhandle 4B; Lubbock + El Paso 3B
  '750': Z3_HUMID, '751': Z3_HUMID, '752': Z3_HUMID, '753': Z3_HUMID,
  '754': Z3_HUMID, '755': Z3_HUMID, '756': Z3_HUMID, '757': Z3_HUMID,
  '758': Z3_HUMID, '759': Z3_HUMID, '760': Z3_HUMID, '761': Z3_HUMID,
  '762': Z3_HUMID, '763': Z3_HUMID, '764': Z3_HUMID, '766': Z3_HUMID,
  '767': Z3_HUMID, '790': Z4_DRY, '791': Z4_DRY, '793': Z3_DRY,
  '794': Z3_DRY, '798': Z3_DRY, '799': Z3_DRY, '885': Z3_DRY,
  // CA: SF Bay marine; far-north coast marine 4C; Tahoe/Sierra 6B
  '940': Z3_MARINE, '941': Z3_MARINE, '943': Z3_MARINE, '944': Z3_MARINE,
  '954': Z4_MARINE, '955': Z4_MARINE, '960': Z5_DRY, '961': Z6_DRY,
  // NY: NYC + Long Island 4A; Adirondacks/North Country 6A
  '100': Z4_MIXED, '101': Z4_MIXED, '102': Z4_MIXED, '103': Z4_MIXED,
  '104': Z4_MIXED, '105': Z4_MIXED, '106': Z4_MIXED, '107': Z4_MIXED,
  '108': Z4_MIXED, '109': Z4_MIXED, '110': Z4_MIXED, '111': Z4_MIXED,
  '112': Z4_MIXED, '113': Z4_MIXED, '114': Z4_MIXED, '115': Z4_MIXED,
  '116': Z4_MIXED, '117': Z4_MIXED, '118': Z4_MIXED, '119': Z4_MIXED,
  '128': Z6_HUMID, '129': Z6_HUMID,
  // NV: Reno/north 5B
  '894': Z5_DRY, '895': Z5_DRY, '897': Z5_DRY, '898': Z5_DRY,
  // AZ: Flagstaff/high country 5B
  '859': Z5_DRY, '860': Z5_DRY,
  // OR: east of the Cascades 5B
  '977': Z5_DRY, '978': Z5_DRY, '979': Z5_DRY,
  // WA: east of the Cascades 5B
  '988': Z5_DRY, '989': Z5_DRY, '990': Z5_DRY, '991': Z5_DRY,
  '992': Z5_DRY, '993': Z5_DRY, '994': Z5_DRY,
  // PA: southeast (Philly corridor) 4A
  '190': Z4_MIXED, '191': Z4_MIXED, '193': Z4_MIXED, '194': Z4_MIXED, '195': Z4_MIXED, '196': Z4_MIXED,
  // TN: Memphis/west 3A
  '380': Z3_HUMID, '381': Z3_HUMID, '383': Z3_HUMID, '384': Z3_HUMID,
  // IL: far south 4A
  '620': Z4_MIXED, '628': Z4_MIXED, '629': Z4_MIXED,
  // ME: far north zone 7
  '047': Z7, '048': Z7, '049': Z7,
  // MI: northern lower + UP 6A/7
  '496': Z6_HUMID, '497': Z6_HUMID, '498': Z7, '499': Z7,
  // MN: far north zone 7
  '566': Z7, '567': Z7,
  // UT: St. George / Dixie 3B
  '847': Z3_DRY,
  // NM: southern desert 3B
  '880': Z3_DRY, '882': Z3_DRY, '883': Z3_DRY,
  // NJ: north highlands 5A is base-adjacent; NJ base 4A already fits the
  // populous corridor — no override needed (kept for documentation).
  // NC: mountains 4A
  '287': Z4_MIXED, '288': Z4_MIXED, '289': Z4_MIXED,
}

export function stateForZip3(zip3: number): string | null {
  for (const [lo, hi, state] of ZIP3_STATE_RANGES) {
    if (zip3 >= lo && zip3 <= hi) return state
  }
  return null
}

/** 5-digit ZIP → RegionProfile, or null when the ZIP is invalid/unmapped. */
export function regionProfileForZip(zip: string): RegionProfile | null {
  if (!/^\d{5}$/.test(zip)) return null
  const zip3str = zip.slice(0, 3)
  const override = ZIP3_OVERRIDES[zip3str]
  if (override) return override
  const state = stateForZip3(parseInt(zip3str, 10))
  if (!state) return null
  return STATE_PROFILES[state] ?? null
}
