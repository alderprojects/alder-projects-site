// ---------------------------------------------------------------------------
// AFFILIATE PROGRAM CONFIGURATION
//
// This file defines all active affiliate programs and provides URL-building
// helpers. Affiliate IDs come from environment variables (never hardcoded
// in source) so they can be rotated without a code deploy.
//
// To add a new affiliate program:
// 1. Sign up for the program online, save the affiliate ID
// 2. Add the env var to Vercel (Production + Preview + Development)
// 3. Add a new entry to AFFILIATE_PROGRAMS below
// 4. Use buildAffiliateUrl() to construct tracked URLs in chat replies
//    or briefing content
//
// Disclosure (per FTC rules + brand promise to users):
// "Some links earn us a small commission. That's how a free Vermont site
// stays free. We only recommend what we'd buy ourselves."
// This text appears in briefings and on the site footer.
// ---------------------------------------------------------------------------

export type AffiliateProgram = {
  id: string
  name: string
  category: 'home_improvement' | 'general_retail' | 'insurance' | 'financial' | 'tools' | 'specialty'
  envVar: string
  trackingParam: string
  baseUrl: string
  active: boolean
  notes?: string
}

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: 'amazon',
    name: 'Amazon Associates',
    category: 'general_retail',
    envVar: 'AMAZON_ASSOCIATES_TAG',
    trackingParam: 'tag',
    baseUrl: 'https://www.amazon.com',
    active: false,
    notes: 'Use for: smart thermostats, water-leak sensors, weatherstripping, CO/smoke detectors, basic tools.',
  },
  {
    id: 'home_depot',
    name: 'Home Depot (via Impact.com)',
    category: 'home_improvement',
    envVar: 'HOME_DEPOT_AFFILIATE_ID',
    trackingParam: 'cm_mmc',
    baseUrl: 'https://www.homedepot.com',
    active: false,
    notes: 'Use for: insulation, paint, contractor-grade tools, weatherization materials.',
  },
  {
    id: 'lowes',
    name: 'Lowe’s (via Rakuten Advertising)',
    category: 'home_improvement',
    envVar: 'LOWES_AFFILIATE_ID',
    trackingParam: 'cm_mmc',
    baseUrl: 'https://www.lowes.com',
    active: false,
    notes: 'Use for: same as Home Depot — most VT homeowners shop both.',
  },
  {
    id: 'wayfair',
    name: 'Wayfair Affiliate',
    category: 'home_improvement',
    envVar: 'WAYFAIR_AFFILIATE_ID',
    trackingParam: 'refid',
    baseUrl: 'https://www.wayfair.com',
    active: false,
    notes: 'Use for: kitchen/bath fixtures, deck furniture, larger furnishings. 7% commission.',
  },
  {
    id: 'lemonade',
    name: 'Lemonade Insurance (via Impact)',
    category: 'insurance',
    envVar: 'LEMONADE_AFFILIATE_ID',
    trackingParam: 'irclickid',
    baseUrl: 'https://www.lemonade.com',
    active: false,
    notes: 'Use for: home insurance recommendations, especially pre-purchase persona.',
  },
]

export function getProgram(programId: string): AffiliateProgram | null {
  const p = AFFILIATE_PROGRAMS.find(x => x.id === programId)
  if (!p) return null
  return p
}

export function getAffiliateIdFromEnv(programId: string): string {
  const program = getProgram(programId)
  if (!program) return ''
  if (typeof process === 'undefined' || !process.env) return ''
  return process.env[program.envVar] || ''
}

export function buildAffiliateUrl(programId: string, destUrl: string): string {
  const program = getProgram(programId)
  if (!program) return destUrl

  const affiliateId = getAffiliateIdFromEnv(programId)
  if (!affiliateId) return destUrl

  let target: URL
  try {
    target = new URL(destUrl, program.baseUrl)
  } catch {
    return destUrl
  }

  target.searchParams.set(program.trackingParam, affiliateId)
  return target.toString()
}

export function trackedAffiliateLink(
  programId: string,
  destUrl: string,
  label?: string
): string {
  const program = getProgram(programId)
  if (!program) return destUrl

  const params = new URLSearchParams()
  params.set('p', programId)
  params.set('u', destUrl)
  if (label) params.set('label', label)

  return '/api/affiliate/click?' + params.toString()
}

export const AFFILIATE_DISCLOSURE_SHORT =
  'Some links earn us a small commission. That’s how a free Vermont site stays free.'

export const AFFILIATE_DISCLOSURE_LONG =
  'Some links on this site and in your briefing earn us a small commission if you buy through them. That’s how a free Vermont homeowner reference stays free. We only recommend products we’d buy ourselves and the commission never affects what we recommend or how we describe it. Vermont-specific picks are made on Vermont merit, not on commission rate.'
