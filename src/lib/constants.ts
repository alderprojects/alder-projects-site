/**
 * v7.2.19 — Site-wide constants. Single source of truth.
 */
export const REFUND_POLICY_FULL = '30-day refund. Reply "refund" to the receipt — no form.'
export const REFUND_POLICY_SHORT = '30-day refund'

/**
 * Maps contractor-vertical pages to their best Smart Cart / Worth-It scope.
 * Used by ContractorDiyBanner on the contractor pages.
 */
export const CONTRACTOR_PAGE_SCOPE_MAP: Record<string, {
  product: 'smart_cart' | 'worth_it'
  topic?: string
  scope?: string
  headline: string
  diyAngle: string
  guideHref?: string
}> = {
  '/window-replacement-vermont': {
    product: 'smart_cart',
    topic: 'weatherization',
    scope: 'window_weatherization',
    headline: 'Before you spend $14K on replacement',
    diyAngle: '$200 of weatherization may delay $14K window replacement by 2–5 years. Most Vermont drafts are not actually the windows.',
    guideHref: '/guides/windows-buy-skip-wait',
  },
  '/basement-finishing-vermont': {
    product: 'smart_cart',
    topic: 'home_repair',
    scope: 'basement_moisture_prep',
    headline: 'Before you spend $30K on finishing',
    diyAngle: 'A $40 moisture diagnostic prevents the most expensive mistake in residential renovation. Test before you finish.',
    guideHref: '/guides/basement-buy-skip-wait',
  },
  '/bathroom-remodeling-vermont': {
    product: 'worth_it',
    headline: 'Before you spend $25K on a remodel',
    diyAngle: 'A $480 cosmetic refresh (faucet + lighting + hardware) often gets 60% of the visual win for 2% of the cost. Worth-It Plan ranks the moves.',
  },
  '/deck-builders-stowe-vt': {
    product: 'smart_cart',
    topic: 'outdoor',
    scope: 'outdoor_lake_season',
    headline: 'Before you build new',
    diyAngle: 'A $340 deck refresh adds 5+ years of life to an existing deck. Cleaner, stain, board replacement only — skip the rebuild.',
    guideHref: '/guides/lake-season-buy-skip-wait',
  },
  '/painting-contractors-vermont': {
    product: 'smart_cart',
    topic: 'kitchen',
    scope: 'kitchen_cosmetic_refresh',
    headline: 'Before you hire a painter',
    diyAngle: 'Mid-tier interior paint plus good prep equals 90% of pro quality. The skip list catches the premium-paint upcharge that does not earn its keep.',
    guideHref: '/guides/best-paint-stores-in-vermont',
  },
  '/hvac-contractors-vermont': {
    product: 'worth_it',
    headline: 'Before you sign a heat pump quote',
    diyAngle: 'Three pre-quote questions about AHRI rating, rebate paperwork ownership, and CAP eligibility catch installer mistakes worth $500–2,000. Worth-It Plan walks you through them.',
  },
  '/general-contractors-vermont': {
    product: 'worth_it',
    headline: 'Before you sign a GC contract',
    diyAngle: 'Most homeowners save 30–50% on what they hand to the GC by pre-listing materials and finish picks. Worth-It Plan ranks the moves that matter and the ones that don\'t.',
  },
  '/home-additions-vermont': {
    product: 'worth_it',
    headline: 'Before you commit to an addition',
    diyAngle: 'Worth-It Plan covers ADU vs addition vs basement-finish tradeoffs, with the Vermont permitting and Act 47 reality baked in.',
  },
  '/roofing-contractors-vermont': {
    product: 'worth_it',
    headline: 'Before you sign a roofing contract',
    diyAngle: 'Asphalt vs metal, tear-off vs overlay, the three insurance-claim questions that change the quote. Worth-It Plan walks through the decision.',
  },
} as const
