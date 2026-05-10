// Lightweight wrappers for sending custom GA4 events.
// All event helpers are no-ops when GA isn't loaded (SSR, blocked, dev).

// GA4 SETUP — required after deploying these events
//
// 1. CUSTOM DIMENSIONS (Admin → Custom definitions → Create):
//    - intent, topic, town, townTier, device, season, kitId
//      (event-scoped)
//    - revenueScore, recommendationScore (event-scoped, number)
//    - configVersion (event-scoped) — tracks which CONFIG produced
//      a given event, lets us A/B compare config versions
//    - V5: rowLabel, fromSection, intentDestination, source
//      (event-scoped)
//
// 2. KEY EVENTS (Admin → Events → mark as key event):
//    - recommendation_click
//    - accessory_item_click
//    - cta_get_bids_click
//    - email_capture_submit
//    - recommendation_conversion
//    - sample_demo_click (V5)
//
// 3. EXPLORATIONS (Reports → Explore → create):
//    A. Recommendation funnel: picker_topic_select →
//       recommendation_strip_view → recommendation_click →
//       recommendation_conversion
//    B. Accessory revenue funnel: accessory_kit_view →
//       accessory_item_click; group by kitId; compare device
//    C. Topic affinity discovery: cohort by initial
//       picker_topic_select; breakdown by next-clicked topic
//       in same session. Validates the configured weights.
//    D. Engagement gate health: % of sessions reaching
//       engagement_gate_passed; breakdown by device/intent/topic
//    E. Mobile vs desktop: every key event sliced by device
//    F. Homepage funnel (V5): homepage_hero_view →
//       sample_demo_click → engagement_gate_passed →
//       (accessory_item_click | recommendation_click). Cross-
//       reference fromSection/intentDestination to see which
//       homepage surface drives the warmest demo arrivals.

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

// =====================================================================
// V4 RECOMMENDER + ACCESSORY EVENTS
// =====================================================================
//
// All events here share a common visitor-context envelope so funnel
// analysis can slice on (intent × topic × town × device). Pass the
// envelope from the property page mount via the same hook the rest of
// the page reads — see PropertyInteractive's analytics wiring.

// Common visitor-context fields surfaced on every V4 event. Optional
// because some firings (e.g. the engagement gate passing) happen before
// some signals are populated; (none) is the GA convention for missing.
type VisitorContext = {
  intent?: string
  topic?: string
  town?: string
  townTier?: string
  device?: string
}

// recommendation_strip_view — fires once per session per strip render
// when the strip enters the viewport (50% threshold via
// useElementVisibility).
export function trackRecommendationStripView(params: VisitorContext & {
  recommendedTopics: string[]
  recommendationScores: number[]
  position: number
  engagementGateReason: string
}): void {
  send('recommendation_strip_view', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    recommended_topics: params.recommendedTopics.join(','),
    recommendation_scores: params.recommendationScores.join(','),
    position: params.position,
    engagement_gate_reason: params.engagementGateReason,
  })
}

// accessory_kit_view — fires once per session per kit render when the
// kit enters the viewport. revenueScore lets us prioritize tuning
// against high-revenue kits in GA explorations.
export function trackAccessoryKitView(params: VisitorContext & {
  kitId: string
  kitTitle: string
  itemIds: string[]
  estimatedTicketSize: number
  revenueScore: number
  placement: string
}): void {
  send('accessory_kit_view', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    kit_id: params.kitId,
    kit_title: params.kitTitle,
    item_ids: params.itemIds.join(','),
    estimated_ticket_size: params.estimatedTicketSize,
    revenue_score: params.revenueScore,
    placement: params.placement,
  })
}

// accessory_item_click — fires when a visitor clicks an item in a kit.
// itemPositionInKit tracks first-vs-last bias inside a kit. Marked as
// a key event in GA4.
export function trackAccessoryItemClick(params: VisitorContext & {
  kitId: string
  itemId: string
  itemDisplay: string
  itemPositionInKit: number
  kitRevenueScore: number
  estimatedItemPrice?: number
}): void {
  send('accessory_item_click', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    kit_id: params.kitId,
    item_id: params.itemId,
    item_display: params.itemDisplay,
    item_position_in_kit: params.itemPositionInKit,
    kit_revenue_score: params.kitRevenueScore,
    estimated_item_price: params.estimatedItemPrice ?? 0,
  })
}

// engagement_gate_passed — fires once per session when the gate flips.
// trigger ∈ scroll | time | chat | cost_tier; timeOnPage is seconds
// since first paint to gate-passed.
export function trackEngagementGatePassed(params: VisitorContext & {
  trigger: string
  timeOnPage: number
}): void {
  send('engagement_gate_passed', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    trigger: params.trigger,
    time_on_page: params.timeOnPage,
  })
}

// recommendation_click — fires when a recommendation card is clicked.
// (fromTopic, toTopic) is the affinity edge that the click validates.
// Key event for the recommendation funnel.
export function trackRecommendationClick(params: VisitorContext & {
  fromTopic: string
  toTopic: string
  recommendationScore: number
  positionInStrip: number
}): void {
  send('recommendation_click', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    from_topic: params.fromTopic,
    to_topic: params.toTopic,
    recommendation_score: params.recommendationScore,
    position_in_strip: params.positionInStrip,
  })
}

// recommendation_conversion — fires when a downstream conversion event
// (affiliate click, contractor lead, email capture, chat message) lands
// within 5 minutes of a recommendation_click. Stored attribution lives
// in sessionStorage 'alder.lastRecClick' (set in trackRecommendationClick).
export function trackRecommendationConversion(params: VisitorContext & {
  recommendedTopic: string
  conversionType: string
  secondsSinceRecClick: number
}): void {
  send('recommendation_conversion', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    recommended_topic: params.recommendedTopic,
    conversion_type: params.conversionType,
    seconds_since_rec_click: params.secondsSinceRecClick,
  })
}

// seasonal_context — fires once per page mount. Snapshot of the
// seasonal/property characteristics that drove ranking, so GA can
// segment retro by season + property type.
export function trackSeasonalContext(params: VisitorContext & {
  season: string
  isLakeProperty: boolean
  isFloodProperty: boolean
}): void {
  send('seasonal_context', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    season: params.season,
    is_lake_property: params.isLakeProperty,
    is_flood_property: params.isFloodProperty,
  })
}

// render_decision — fires once per page mount. Snapshots which modules
// rendered inline vs which sit in the disclosure, plus the score range,
// plus the CONFIG version that produced the render. Lets us A/B-test
// CONFIG changes by comparing render distributions across versions.
export function trackRenderDecision(params: VisitorContext & {
  inlineModuleIds: string[]
  hiddenModuleCount: number
  topModuleScore: number
  bottomModuleScore: number
  configVersion: string
}): void {
  send('render_decision', {
    intent: params.intent || '(none)',
    topic: params.topic || '(none)',
    town: params.town || '(none)',
    townTier: params.townTier || '(none)',
    device: params.device || '(none)',
    inline_module_ids: params.inlineModuleIds.join(','),
    hidden_module_count: params.hiddenModuleCount,
    top_module_score: params.topModuleScore,
    bottom_module_score: params.bottomModuleScore,
    config_version: params.configVersion,
  })
}

// =====================================================================
// V5 homepage events
// =====================================================================

// homepage_hero_view — fires once per homepage mount. Establishes the
// top of the homepage funnel and snapshots the season at landing time.
export function trackHomepageHeroView(params: {
  device?: string
  season: string
}): void {
  send('homepage_hero_view', {
    device: params.device || '(none)',
    season: params.season,
  })
}

// sample_demo_click — fires when a visitor clicks any "see a sample
// property" link (hero, intent card, cost-widget row). fromSection +
// intentDestination together describe which surface drove the click
// and which intent persona the demo lands on. Marked as a key event.
export function trackSampleDemoClick(params: {
  device?: string
  fromSection: 'hero' | 'intent_card' | 'cost_widget'
  intentDestination: 'buying' | 'owner' | 'researching'
}): void {
  send('sample_demo_click', {
    device: params.device || '(none)',
    from_section: params.fromSection,
    intent_destination: params.intentDestination,
  })
}

// homepage_seasonal_kit_view — fires once per homepage mount when the
// seasonal strip enters the viewport. season + kitId together pin
// which seasonal recommendation the visitor saw.
export function trackHomepageSeasonalKitView(params: {
  device?: string
  season: string
  kitId: string
}): void {
  send('homepage_seasonal_kit_view', {
    device: params.device || '(none)',
    season: params.season,
    kit_id: params.kitId,
  })
}

// homepage_cost_row_click — fires when a cost-widget row is clicked.
// rowLabel + topicId together let us see which cost categories drive
// demo arrivals.
export function trackHomepageCostRowClick(params: {
  device?: string
  rowLabel: string
  topicId?: string
}): void {
  send('homepage_cost_row_click', {
    device: params.device || '(none)',
    row_label: params.rowLabel,
    topic_id: params.topicId ?? '(none)',
  })
}

// homepage_town_tile_click — fires when a town-grid tile is clicked.
// town + townTier let us see whether the homepage drives traffic to
// resort_premium pages (highest revenue) or to small_city/rural.
export function trackHomepageTownTileClick(params: {
  device?: string
  town: string
  townTier: string
}): void {
  send('homepage_town_tile_click', {
    device: params.device || '(none)',
    town: params.town,
    town_tier: params.townTier,
  })
}

// email_capture_submit — fires on a successful email capture submit.
// source identifies which surface captured the email so we can compare
// homepage / property-page / article capture rates. Marked as a key event.
export function trackEmailCapture(params: {
  device?: string
  source: 'homepage' | 'property_page' | 'article'
}): void {
  send('email_capture_submit', {
    device: params.device || '(none)',
    source: params.source,
  })
}

// =====================================================================
// V7 events — Smart Cart + Worth-It Plan + Upgrade
// =====================================================================
//
// 17 events covering the V7 paid-product funnel. Naming convention
// matches existing GA4 events on this site: <noun>_<verb> with
// snake_case parameters.

// ---- Smart Cart -----------------------------------------------------

export function trackSmartCartCtaViewed(params: {
  placement: 'homepage' | 'property_page' | 'guide' | 'standalone'
  topic?: string
}): void {
  send('smart_cart_cta_viewed', {
    placement: params.placement,
    topic: params.topic || '(none)',
  })
}

export function trackSmartCartCtaClicked(params: {
  placement: string
  topic?: string
}): void {
  send('smart_cart_cta_clicked', {
    placement: params.placement,
    topic: params.topic || '(none)',
  })
}

export function trackSmartCartCurationStep1Completed(params: {
  topic: string
  scopeVariantId: string
  scenario: string
}): void {
  send('smart_cart_curation_step1_completed', {
    topic: params.topic,
    scope_variant_id: params.scopeVariantId,
    scenario: params.scenario,
  })
}

export function trackSmartCartPurchased(params: {
  cartId: string
  topic: string
  scopeVariantId: string
}): void {
  send('smart_cart_purchased', {
    cart_id: params.cartId,
    topic: params.topic,
    scope_variant_id: params.scopeVariantId,
  })
}

export function trackSmartCartResultViewed(params: { cartId: string }): void {
  send('smart_cart_result_viewed', { cart_id: params.cartId })
}

export function trackSmartCartAffiliateClicked(params: {
  cartId: string
  itemId: string
}): void {
  send('smart_cart_affiliate_clicked', {
    cart_id: params.cartId,
    item_id: params.itemId,
  })
}

// ---- v7.2.14 funnel-coverage events ---------------------------------
//
// Backfill events the v7.2.14 launch gates require:
//   - topic_view: /smart-cart/topic/[slug] mount
//   - guide_view: /guides/[slug] mount
//   - route_out_click: user clicks a route-out destination
//   - bridge_module_click: user clicks the contractor-page bridge CTA
//
// cart_start, checkout_start, purchase already covered by existing
// helpers and the durable buyer-event log (src/lib/buyer-events.ts).

export function trackTopicView(params: { slug: string; topicId?: string; scopeVariantId?: string }): void {
  send('topic_view', {
    slug: params.slug,
    topic_id: params.topicId ?? '(none)',
    scope_variant_id: params.scopeVariantId ?? '(none)',
  })
}

export function trackGuideView(params: { slug: string; topicId?: string }): void {
  send('guide_view', {
    slug: params.slug,
    topic_id: params.topicId ?? '(none)',
  })
}

export function trackRouteOutClick(params: {
  scopeVariantId: string
  condition: string
  destination: string
  surface: 'result_page' | 'topic_page' | 'banner'
}): void {
  send('route_out_click', {
    scope_variant_id: params.scopeVariantId,
    condition: params.condition,
    destination: params.destination,
    surface: params.surface,
  })
}

export function trackBridgeModuleClick(params: {
  topicSlug: string
  fromPage: string
}): void {
  send('bridge_module_click', {
    topic_slug: params.topicSlug,
    from_page: params.fromPage,
  })
}

// v7.2.15 — modal open + prefill state. Lets us see which CTAs land
// the modal already filled (good UX) vs blank (likely-broken wiring).
export function trackCurationModalOpen(params: {
  product: string
  topic?: string
  scopeVariantId?: string
  scenario?: string
  sourcePath?: string
  sourceComponent?: string
}): void {
  send('curation_modal_open', {
    product: params.product,
    topic: params.topic ?? '(none)',
    scope_variant_id: params.scopeVariantId ?? '(none)',
    scenario: params.scenario ?? '(none)',
    source_path: params.sourcePath ?? '(none)',
    source_component: params.sourceComponent ?? '(none)',
  })
}

export function trackCurationModalPrefilled(params: {
  product: string
  topic?: string
  scopeVariantId?: string
  scenario?: string
  prefillSource: 'data_attrs' | 'session_default'
}): void {
  send('curation_modal_prefilled', {
    product: params.product,
    topic: params.topic ?? '(none)',
    scope_variant_id: params.scopeVariantId ?? '(none)',
    scenario: params.scenario ?? '(none)',
    prefill_source: params.prefillSource,
  })
}

// v7.2.15 — fire on every Smart Cart CTA click that isn't on the
// /smart-cart picker (those go through smart_cart_cta_clicked already).
// `placement` describes which surface fired the click so funnel
// analysis can compare guides vs topics vs bridges.
export function trackSmartCartCtaClick(params: {
  placement: string
  topic?: string
  scopeVariantId?: string
  scenario?: string
  sourcePath?: string
}): void {
  send('smart_cart_cta_click', {
    placement: params.placement,
    topic: params.topic ?? '(none)',
    scope_variant_id: params.scopeVariantId ?? '(none)',
    scenario: params.scenario ?? '(none)',
    source_path: params.sourcePath ?? '(none)',
  })
}

export function trackContractorContinueClick(params: {
  fromPage: string
  trade?: string
}): void {
  send('contractor_continue_click', {
    from_page: params.fromPage,
    trade: params.trade ?? '(none)',
  })
}

export function trackSmartCartUpgradeClicked(params: { cartId: string }): void {
  send('smart_cart_upgrade_clicked', { cart_id: params.cartId })
}

// ---- Worth-It Plan --------------------------------------------------

export function trackWorthItCtaViewed(params: {
  placement: 'homepage' | 'property_page' | 'guide' | 'standalone'
  topic?: string
}): void {
  send('worth_it_cta_viewed', {
    placement: params.placement,
    topic: params.topic || '(none)',
  })
}

export function trackWorthItCtaClicked(params: {
  placement: string
  topic?: string
}): void {
  send('worth_it_cta_clicked', {
    placement: params.placement,
    topic: params.topic || '(none)',
  })
}

export function trackWorthItPurchased(params: {
  planCode: string
  topic: string
  scopeVariantId: string
  townTier?: string
}): void {
  send('worth_it_purchased', {
    plan_code: params.planCode,
    topic: params.topic,
    scope_variant_id: params.scopeVariantId,
    town_tier: params.townTier || '(none)',
  })
}

export function trackWorthItDashboardViewed(params: { planCode: string }): void {
  send('worth_it_dashboard_viewed', { plan_code: params.planCode })
}

export function trackWorthItPathSwitched(params: {
  planCode: string
  fromPath: string
  toPath: string
}): void {
  send('worth_it_path_switched', {
    plan_code: params.planCode,
    from_path: params.fromPath,
    to_path: params.toPath,
  })
}

export function trackMoveAddedToPlan(params: {
  planCode: string
  moveId: string
}): void {
  send('move_added_to_plan', {
    plan_code: params.planCode,
    move_id: params.moveId,
  })
}

export function trackReminderSelected(params: {
  planCode: string
  reminderType: 'friday' | 'saturday_morning' | 'sunday_followup'
  enabled: boolean
}): void {
  send('reminder_selected', {
    plan_code: params.planCode,
    reminder_type: params.reminderType,
    enabled: params.enabled,
  })
}

export function trackPunchListClicked(params: { planCode: string }): void {
  send('punch_list_clicked', { plan_code: params.planCode })
}

export function trackProjectGrewClicked(params: { planCode: string }): void {
  send('project_grew_clicked', { plan_code: params.planCode })
}

export function trackSharePlanClicked(params: {
  planCode: string
  channel: 'link_copy' | 'email' | 'sms' | 'other'
}): void {
  send('share_plan_clicked', {
    plan_code: params.planCode,
    channel: params.channel,
  })
}

// ---- Upgrade --------------------------------------------------------

export function trackUpgradeOfferEmailSent(params: { cartId: string }): void {
  send('upgrade_offer_email_sent', { cart_id: params.cartId })
}

export function trackUpgradeCompleted(params: {
  planCode: string
  fromCartId: string
}): void {
  send('upgrade_completed', {
    plan_code: params.planCode,
    from_cart_id: params.fromCartId,
  })
}

// =====================================================================
// v7.2.11 — Smart Cart result-page events
// =====================================================================
//
// Generic wrapper for the result-page refresh's many small events.
// Each event takes a free-form props object and is forwarded to GA4
// (when present) with snake_case parameter keys.

export type ResultPageEvent =
  | 'smart_cart_result_view'
  | 'result_header_view'
  | 'value_banner_view'
  | 'savings_methodology_expand'
  | 'start_here_view'
  | 'start_here_card_click'
  | 'start_here_expand_to_full'
  | 'product_card_view'
  | 'product_card_expand_why_this'
  | 'product_save'
  | 'product_quantity_change'
  | 'retailer_click'
  | 'skip_card_view'
  | 'skipped_item_add_anyway'
  | 'skipped_item_secondary_click'
  | 'skip_card_avoided_spend_view'
  | 'keep_skipped_click'
  | 'addon_card_view'
  | 'addon_add_click'
  | 'cross_scope_card_view'
  | 'cross_scope_card_click'
  | 'adjust_cart_click'
  | 'adjust_cart_chip_click'
  | 'primary_cta_view_retailers_buy_click'
  | 'retailer_modal_open'
  | 'retailer_modal_product_click'
  | 'save_for_later_click'
  | 'share_click'
  | 'download_click'
  | 'print_click'
  | 'not_right_click'
  | 'photo_beta_click'
  | 'photo_beta_signup_submit'
  // v7.2.12 — multi-select buy
  | 'cart_selection_added'
  | 'cart_selection_removed'
  | 'cart_selection_select_all'
  | 'cart_selection_select_none'
  | 'cart_selection_reset'
  | 'retailer_modal_bulk_open'
  | 'retailer_modal_fallback_click'
  // v7.2.12 — tier drawer click tracking
  | 'product_tier_budget_click'
  | 'product_tier_recommended_click'
  | 'product_tier_premium_click'

export function trackResultPageEvent(
  event: ResultPageEvent,
  params: Record<string, string | number | boolean | undefined> = {},
): void {
  // Normalize undefineds to '(none)' for GA4 readability
  const cleaned: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(params)) {
    cleaned[k] = v === undefined ? '(none)' : v
  }
  send(event, cleaned)
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, cleaned)
  }
}
