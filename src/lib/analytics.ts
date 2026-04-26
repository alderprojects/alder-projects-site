// Lightweight wrappers for sending custom GA4 events.
// All event helpers are no-ops when GA isn't loaded (window.gtag undefined),
// so callers can fire-and-forget without try/catch boilerplate.

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, any>) => void
  }
}

export type CtaSource =
  | 'home'
  | 'service-page'
  | 'guide-page'
  | 'guides-index'
  | 'plan-page'
  | 'calculator'
  | 'seasonal-report'
  | 'county-page'
  | 'header'
  | 'unknown'

function send(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  try {
    window.gtag('event', eventName, params || {})
  } catch {
    // swallow — analytics must never break the page
  }
}

// Fired when a visitor clicks a "Post a Project" CTA. The 'source' tells us
// which page generated the click, so in GA we can see which entry points
// drive the most submissions.
export function trackCtaClick(params: { source: CtaSource; category?: string; town?: string }): void {
  send('cta_click', {
    source: params.source,
    category: params.category || '(none)',
    town: params.town || '(none)',
  })
}

// Fired when the project submission form succeeds. This is the primary
// conversion event — every fire is a lead.
export function trackProjectSubmit(params: {
  source?: string
  category?: string
  town?: string
  budget?: string
  timeline?: string
}): void {
  send('submit_project', {
    source: params.source || '(none)',
    category: params.category || '(none)',
    town: params.town || '(none)',
    budget: params.budget || '(none)',
    timeline: params.timeline || '(none)',
  })
}

// Fired when the seasonal property scan completes successfully.
export function trackSeasonalScan(params: { hasFloodZone?: boolean; hasShoreland?: boolean }): void {
  send('seasonal_scan', {
    has_flood_zone: !!params.hasFloodZone,
    has_shoreland: !!params.hasShoreland,
  })
}

// Fired when a contractor signs up via the contractor form.
export function trackContractorSignup(params: { trade?: string; county?: string }): void {
  send('contractor_signup', {
    trade: params.trade || '(none)',
    county: params.county || '(none)',
  })
}
