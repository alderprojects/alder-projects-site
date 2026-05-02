// Helpers that pick the right slice of AFFILIATE_CATALOG for a given
// rendering moment on the property page.
//
// Two layers of input:
//   - The visitor signal vector (intent / topic / scope / townTier).
//   - The property profile (used to derive characteristics — lake, flood,
//     pre-1950, rural, mobile_home).
// Plus the calling context — which module on the page is asking for a
// kit — and the current date for seasonal kits.
//
// Hard rule: researching intent gets ZERO affiliate items, regardless
// of context or season. That short-circuits before any matching runs.

import {
  AFFILIATE_CATALOG,
  type AffiliateItem,
  type PropertyCharacteristic,
  type Season,
  type SituationTag,
} from '@/data/affiliates'
import type { PropertyProfile, VisitorSignals } from './property-modules'

// ----- Season inference -----------------------------------------------

export function inferSeason(date: Date): Season {
  const month = date.getMonth() + 1
  const day = date.getDate()
  if (month === 3 || month === 4 || (month === 5 && day < 15)) return 'mud'
  if ((month === 5 && day >= 15) || (month === 6 && day < 15)) return 'spring_blackfly'
  if (
    (month === 6 && day >= 15) ||
    month === 7 ||
    month === 8 ||
    (month === 9 && day < 15)
  )
    return 'lake'
  if ((month === 9 && day >= 15) || month === 10) return 'fall_leaf'
  if (month === 11 || (month === 12 && day < 15)) return 'pre_winter'
  return 'deep_winter'
}

// Resolves the broader 'lake' season into the four sub-windows used by
// lake-specific kits. Outside lake months returns null.
function lakeSubSeason(date: Date): 'lake_opening' | 'lake_operations' | 'lake_closing' | null {
  const month = date.getMonth() + 1
  const day = date.getDate()
  if ((month === 5 && day >= 15) || month === 6) return 'lake_opening'
  if (month === 7 || month === 8) return 'lake_operations'
  if (month === 9 || month === 10) return 'lake_closing'
  return null
}

// ----- Property characteristics ---------------------------------------

// Towns where a property is on a Vermont lake or pond worth flagging
// (Champlain shore + Memphremagog + Bomoseen + named NEK ponds + the
// scattered Central VT lakes). Conservative — prefer false negatives
// to false positives.
const LAKE_TOWNS = new Set<string>([
  // Champlain shore
  'Burlington',
  'South Burlington',
  'Colchester',
  'South Hero',
  'Grand Isle',
  'North Hero',
  'Alburgh',
  'Charlotte',
  'Shelburne',
  'Vergennes',
  'Ferrisburgh',
  'Addison',
  'Panton',
  // Memphremagog + NEK
  'Newport',
  'Derby',
  'Coventry',
  'Charleston',
  'Westmore',
  'Greensboro',
  'Hardwick',
  // Bomoseen + Rutland County lakes
  'Castleton',
  'Hubbardton',
  'Benson',
  'Sudbury',
  // Central VT lakes
  'Brookfield',
  'Roxbury',
  // Caspian / Joe's Pond / smaller central
  'Calais',
  'Marshfield',
  'Cabot',
  // Lamoille County lakes
  'Wolcott',
  'Eden',
  'Hyde Park',
  'Morristown',
])

export function isLakeProperty(profile: PropertyProfile): boolean {
  // Heuristic concerns from /api/seasonal-report sometimes mention
  // shoreland — when present, count the property as lake.
  const concernHits = profile.regulators?.concerns?.some(c =>
    /shorel|lake|waterfront/i.test(`${c.title} ${c.whyCheck}`)
  )
  if (concernHits) return true
  return LAKE_TOWNS.has(profile.town)
}

export function isFloodProperty(profile: PropertyProfile): boolean {
  return (
    profile.regulators?.concerns?.some(c =>
      /flood|river corridor|wetland/i.test(`${c.title} ${c.whyCheck}`)
    ) ?? false
  )
}

// Year-built data is not wired in yet. Returning false until we have
// the assessor mapping. The catalog still tags pre-1950 items so they
// surface naturally for the lead/asbestos test kits when wired.
export function isPre1950Property(_profile: PropertyProfile): boolean {
  return false
}

function inferPropertyCharacteristics(profile: PropertyProfile): Set<PropertyCharacteristic> {
  const chars = new Set<PropertyCharacteristic>()
  if (isLakeProperty(profile)) chars.add('lake')
  if (isFloodProperty(profile)) chars.add('flood')
  if (isPre1950Property(profile)) chars.add('pre1950')
  if (profile.bucket === 'rural') chars.add('rural')
  // mobile_home: not yet derivable from /api/property data.
  return chars
}

// ----- Situation matching ---------------------------------------------

function matchesSituation(
  sit: SituationTag,
  signals: VisitorSignals,
  chars: Set<PropertyCharacteristic>
): boolean {
  if (sit.intents && !sit.intents.includes(signals.topLevelIntent)) return false
  if (sit.topic && sit.topic !== '*' && sit.topic !== signals.topic) return false
  if (sit.scope && sit.scope !== '*' && sit.scope !== signals.scope) return false
  if (sit.townTiers && sit.townTiers !== '*' && !sit.townTiers.includes(signals.townTier)) return false
  if (sit.propertyChars && !sit.propertyChars.some(c => chars.has(c))) return false
  return true
}

function itemMatchesAnySituation(
  item: AffiliateItem,
  signals: VisitorSignals,
  chars: Set<PropertyCharacteristic>
): boolean {
  return item.situations.some(s => matchesSituation(s, signals, chars))
}

// ----- Per-context kit selection -------------------------------------

export type KitContext =
  | 'topic_module'
  | 'calendar_module'
  | 'regulatory_module'
  | 'summary'
  | 'pre_purchase'
  | 'lake_property'
  | 'flood_property'

const CAP_PER_CONTEXT: Record<KitContext, number> = {
  topic_module: 7,
  pre_purchase: 7,
  calendar_module: 6,
  regulatory_module: 6,
  summary: 6,
  lake_property: 6,
  flood_property: 4,
}

export function getInlineKitForContext(
  signals: VisitorSignals,
  profile: PropertyProfile,
  context: KitContext,
  date: Date = new Date()
): AffiliateItem[] {
  // Hard rule — researchers don't shop, no matter the context.
  if (signals.topLevelIntent === 'researching') return []

  const chars = inferPropertyCharacteristics(profile)
  const season = inferSeason(date)
  const lakeWindow = lakeSubSeason(date)

  let candidates: AffiliateItem[] = []

  if (context === 'calendar_module') {
    // Surface the seasonal kit. Lake-property + lake months gets the
    // sub-window kit (lake_opening / lake_operations / lake_closing);
    // everything else uses the broad season.
    const targetSeason: Season =
      chars.has('lake') && lakeWindow ? lakeWindow : season
    candidates = AFFILIATE_CATALOG.filter(item => item.seasons?.includes(targetSeason) ?? false)
  } else if (context === 'lake_property') {
    candidates = AFFILIATE_CATALOG.filter(item => item.category === 'lake' && itemMatchesAnySituation(item, signals, chars))
  } else if (context === 'flood_property') {
    candidates = AFFILIATE_CATALOG.filter(item =>
      item.situations.some(s => s.propertyChars?.includes('flood') || s.topic === 'flood_zone')
    )
  } else {
    // Topic / pre-purchase / summary — match against situation tags.
    candidates = AFFILIATE_CATALOG.filter(item => itemMatchesAnySituation(item, signals, chars))
  }

  // Dedupe by id.
  const seen = new Set<string>()
  const uniq: AffiliateItem[] = []
  for (const item of candidates) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    uniq.push(item)
  }

  return uniq.slice(0, CAP_PER_CONTEXT[context])
}
