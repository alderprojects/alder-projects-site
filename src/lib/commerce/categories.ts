/**
 * v7.4.10 §2.3 — product-category → illustration mapping.
 *
 * CR5: these illustrations are BRAND ILLUSTRATION, never a depiction of
 * a specific product. They render for everything that is not an
 * ASIN-resolved BUY/WAIT item, plus all SKIP/INVESTIGATE items. AI
 * imagery presented as the actual product is a build error.
 *
 * Visual grammar: vivid = act, muted = don't. SKIP/INVESTIGATE render
 * the grayscale variant.
 */

export const ILLUSTRATION_CATEGORIES = [
  'sealants_caulk',
  'moisture_control',
  'hand_tools',
  'fasteners',
  'electrical',
  'plumbing',
  'insulation_weatherization',
  'cleaning_prep',
  'safety',
  'general',
] as const

export type IllustrationCategory = (typeof ILLUSTRATION_CATEGORIES)[number]

/** Ordered — first match wins, so specific patterns precede general ones. */
const RULES: Array<[RegExp, IllustrationCategory]> = [
  [/caulk|sealant|grout|silicone|weld|adhesive|epoxy/i, 'sealants_caulk'],
  [/dehumidif|humidist|moisture|damp|leak sensor|water alarm|sump|vapor|condensation/i, 'moisture_control'],
  [/insulat|weather.?strip|draft|door sweep|window film|foam board|r-?value|attic/i, 'insulation_weatherization'],
  [/gfci|outlet|receptacle|breaker|electric|wiring|light|bulb|led|switch|smart plug/i, 'electrical'],
  [/faucet|valve|pipe|drain|toilet|supply line|shut.?off|plumb|hose bib|aerator/i, 'plumbing'],
  [/detector|alarm|extinguisher|carbon monoxide|smoke|radon|first aid|safety/i, 'safety'],
  [/screw|anchor|bracket|nail|bolt|fastener|hanger|mount/i, 'fasteners'],
  [/clean|scrub|brush|degreas|primer|prep|sand|abrasive|mildew remover/i, 'cleaning_prep'],
  [/wrench|plier|driver|hammer|saw|knife|tape measure|level|caulk gun|tool/i, 'hand_tools'],
]

/** Deterministic — the same product category always maps to the same asset. */
export function categoryForProduct(productCategory: string, searchQuery = ''): IllustrationCategory {
  const text = `${productCategory} ${searchQuery}`
  for (const [re, cat] of RULES) {
    if (re.test(text)) return cat
  }
  return 'general'
}

/** Blob-hosted asset URL. Muted variant carries the "don't act" grammar. */
export function illustrationUrl(category: IllustrationCategory, muted = false): string {
  const base = process.env.NEXT_PUBLIC_ILLUSTRATION_BASE_URL || '/illustrations'
  return `${base}/${category}${muted ? '-muted' : ''}.svg`
}
