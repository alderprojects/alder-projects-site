/**
 * v7.2.17 — GA4 event definitions.
 * Centralizes funnel instrumentation so we can attribute revenue to channels.
 */

type GtagFn = (cmd: 'event', name: string, params?: Record<string, unknown>) => void

function getGtag(): GtagFn | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { gtag?: GtagFn }).gtag || null
}

export const Track = {
  chatSessionStarted(entryPage: string, hasContext: boolean) {
    getGtag()?.('event', 'chat_session_started', { entry_page: entryPage, has_context: hasContext })
  },
  chatIntentDetected(intent: string, scopeId?: string) {
    getGtag()?.('event', 'chat_intent_detected', { intent_type: intent, scope_id: scopeId })
  },
  chatSmartCartCtaShown(scopeId: string) {
    getGtag()?.('event', 'chat_smart_cart_cta_shown', { scope_id: scopeId })
  },
  chatSmartCartCtaClicked(scopeId: string) {
    getGtag()?.('event', 'chat_smart_cart_cta_clicked', { scope_id: scopeId })
  },
  chatBubbleClicked(pagePath: string, hasContext: boolean) {
    getGtag()?.('event', 'chat_bubble_clicked', { page_path: pagePath, has_context: hasContext })
  },
  smartCartCurationStarted(scopeId: string, source: string) {
    getGtag()?.('event', 'smart_cart_curation_started', { scope_id: scopeId, source })
  },
  smartCartCurationCompleted(scopeId: string, scenario: string) {
    getGtag()?.('event', 'smart_cart_curation_completed', { scope_id: scopeId, scenario })
  },
  smartCartCheckoutRedirect(scopeId: string, utmSource: string, utmCampaign: string) {
    getGtag()?.('event', 'smart_cart_checkout_redirect', { scope_id: scopeId, utm_source: utmSource, utm_campaign: utmCampaign })
  },
  smartCartPurchaseComplete(scopeId: string, utmSource: string, value: number) {
    getGtag()?.('event', 'smart_cart_purchase_complete', { scope_id: scopeId, utm_source: utmSource, value, currency: 'USD' })
  },
  smartCartRefundInitiated(scopeId: string, hoursSincePurchase: number) {
    getGtag()?.('event', 'smart_cart_refund_initiated', { scope_id: scopeId, hours_since_purchase: hoursSincePurchase })
  },
  calculatorEstimateCompleted(projectId: string, scopeId: string, location: string) {
    getGtag()?.('event', 'calculator_estimate_completed', { project_id: projectId, scope_id: scopeId, location })
  },
  calculatorSmartCartCtaClicked(projectId: string) {
    getGtag()?.('event', 'calculator_smart_cart_cta_clicked', { project_id: projectId })
  },
  guideInternalLinkClicked(fromGuide: string, toUrl: string) {
    getGtag()?.('event', 'guide_internal_link_clicked', { from_guide: fromGuide, to_url: toUrl })
  },
}
