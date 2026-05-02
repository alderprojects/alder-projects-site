// Lightweight wrappers for sending custom GA4 events.
// All event helpers are no-ops when GA isn't loaded (SSR, blocked, dev).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function send(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params)
    }
  } catch {
    // swallow — analytics must never break the page
  }
}

// =====================================================================
// Existing helpers — kept identical so current callers don't break
// =====================================================================

// Fired when a visitor clicks a "Post a Project" / lead-gen CTA. The
// 'source' tells us which surface they clicked from (home, calculator,
// header, etc.).
export function trackCtaClick(params: {
  source?: string
  category?: string
  town?: string
  budget?: string
  timeline?: string
}): void {
  send('cta_click', {
    source: params.source ?? 'unknown',
    category: params.category,
    town: params.town,
    budget: params.budget,
    timeline: params.timeline,
  })
}

export function trackProjectSubmit(params: {
  category?: string
  town?: string
  budget?: string
  timeline?: string
}): void {
  send('submit_project', {
    category: params.category,
    town: params.town,
    budget: params.budget,
    timeline: params.timeline,
  })
}

export function trackSeasonalScan(params: { town?: string }): void {
  send('seasonal_scan', {
    town: params.town,
  })
}

export function trackContractorSignup(params: {
  trade?: string
  county?: string
}): void {
  send('contractor_signup', {
    trade: params.trade,
    county: params.county,
  })
}

// =====================================================================
// Property-page architecture (Track C) — NEW
// =====================================================================

// Shared dimensions sent with every property-page event so we can pivot
// in GA4 by intent / topic / town without one-off custom params.
type PropertyContext = {
  intent?: 'buying' | 'owner' | 'researching' | string
  topic?: string
  scope?: 'diy' | 'mid' | 'big' | 'na' | string
  town?: string
  townTier?: string
  device?: 'mobile' | 'tablet' | 'desktop'
}

// Hero question — visitor clicks one of the 3 top-level intent buttons.
export function trackHeroIntentSelect(params: {
  intent: 'buying' | 'owner' | 'researching'
  town?: string
  townTier?: string
  device?: 'mobile' | 'tablet' | 'desktop'
}): void {
  send('hero_intent_select', { ...params })
}

// User clicks a project tile or topic chip (the inferred 2nd signal).
export function trackPickerTopicSelect(params: PropertyContext & {
  topic: string
  pickerType: 'project_tile' | 'topic_chip'
}): void {
  send('picker_topic_select', { ...params })
}

// Chat opens — desktop sidebar click OR mobile floating button tap.
export function trackChatOpen(params: PropertyContext & {
  trigger: 'auto' | 'sidebar_click' | 'mobile_button' | 'cta_prefill'
  prefillReason?: string
}): void {
  send('chat_open', { ...params })
}

// User actually sends a message in the chat.
export function trackChatMessageSent(params: PropertyContext & {
  messageNumber: number
}): void {
  send('chat_message_sent', { ...params })
}

// Affiliate link click. itemId = the affiliates.ts catalog id.
export function trackAffiliateClick(params: PropertyContext & {
  itemId: string
  itemDisplay?: string
  kitContext: 'topic_module' | 'calendar_module' | 'regulatory_module'
            | 'summary' | 'pre_purchase' | 'seasonal' | 'lake'
            | string
  season?: string
}): void {
  send('affiliate_click', { ...params })
}

// "Get bids" / "Send to a Vermont contractor" inline CTA.
export function trackContractorLeadCtaClick(params: PropertyContext & {
  ctaSurface: 'cost_module' | 'sequence_module' | 'vetting_module'
            | 'summary' | string
}): void {
  send('cta_get_bids_click', { ...params })
}

// "Save profile / email me reminders" — the buyer email capture.
export function trackEmailCaptureSubmit(params: PropertyContext & {
  surface: 'inherited_rebates' | 'save_profile' | string
}): void {
  send('email_capture_submit', { ...params })
}

// User clicks "Show everything else (N)" disclosure.
export function trackDisclosureExpand(params: PropertyContext & {
  hiddenModuleCount?: number
}): void {
  send('disclosure_expand', { ...params })
}

// External authoritative link click (EVT, VT AG, VT Tax Dept, etc.).
export function trackExternalLinkClick(params: PropertyContext & {
  destination: string
  context: 'vermont_basics_card' | 'sources_footer' | string
}): void {
  send('external_link_click', { ...params })
}

// Scroll-depth milestones. Fired once per page load at 25/50/75/100.
export function trackScrollDepth(params: PropertyContext & {
  depth: 25 | 50 | 75 | 100
}): void {
  send('scroll_depth', { ...params })
}

// "Walk me through it" buttons in Vermont basics state — chat-prefill CTAs.
export function trackVermontBasicsCardClick(params: {
  cardId: string
  action: 'walk_me_through' | 'external_link' | 'read_guide'
  destination?: string
}): void {
  send('vermont_basics_card_click', { ...params })
}

// =====================================================================
// Helpers — device detection & scroll-depth observer
// =====================================================================

// Returns 'mobile' | 'tablet' | 'desktop' based on viewport width.
// Safe for SSR — returns 'desktop' on the server.
export function getDeviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

// Initialize scroll-depth tracking. Call once from a 'use client' component
// on the property page. Returns a cleanup function.
//
// Usage:
//   useEffect(() => initScrollDepthTracking(propertyContext), [profile])
export function initScrollDepthTracking(
  context: PropertyContext = {}
): () => void {
  if (typeof window === 'undefined') return () => {}

  const milestones = [25, 50, 75, 100] as const
  const fired = new Set<number>()

  function check(): void {
    const doc = document.documentElement
    const scrollTop = window.scrollY || doc.scrollTop
    const viewport = window.innerHeight || doc.clientHeight
    const total = doc.scrollHeight - viewport
    if (total <= 0) return
    const pct = Math.min(100, Math.round((scrollTop / total) * 100))
    for (const m of milestones) {
      if (pct >= m && !fired.has(m)) {
        fired.add(m)
        trackScrollDepth({
          ...context,
          depth: m,
          device: getDeviceCategory(),
        })
      }
    }
  }

  let raf = 0
  function onScroll(): void {
    if (raf) return
    raf = window.requestAnimationFrame(() => {
      raf = 0
      check()
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  // Initial check in case page is already at the bottom (short pages)
  check()

  return () => {
    window.removeEventListener('scroll', onScroll)
    if (raf) window.cancelAnimationFrame(raf)
  }
}
