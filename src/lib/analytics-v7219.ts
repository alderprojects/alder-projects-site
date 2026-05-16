/**
 * v7.2.19 — Priority analytics events for funnel measurement.
 * The minimum viable instrumentation to answer "did v7.2.17/18/19 work?"
 */
type GtagFn = (cmd: 'event', name: string, params?: Record<string, unknown>) => void

function getGtag(): GtagFn | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { gtag?: GtagFn }).gtag || null
}

/**
 * Generate or retrieve a stable chat session ID stored in localStorage.
 * Persists 30 days. Used to attribute conversions back to specific chat sessions.
 */
export function getChatSessionId(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'alder_chat_session_id'
  const EXPIRY_KEY = 'alder_chat_session_expires'
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

  try {
    const existing = localStorage.getItem(KEY)
    const expires = parseInt(localStorage.getItem(EXPIRY_KEY) || '0', 10)
    if (existing && expires > Date.now()) return existing

    const fresh = crypto.randomUUID()
    localStorage.setItem(KEY, fresh)
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + THIRTY_DAYS))
    return fresh
  } catch {
    return ''
  }
}

export const TrackPriority = {
  smartCartPurchaseComplete(scopeId: string, utmSource: string, value: number, sessionId: string) {
    getGtag()?.('event', 'smart_cart_purchase_complete', {
      scope_id: scopeId, utm_source: utmSource, value, currency: 'USD', chat_session_id: sessionId,
    })
  },
  worthItPurchaseComplete(utmSource: string, value: number, sessionId: string) {
    getGtag()?.('event', 'worth_it_purchase_complete', {
      utm_source: utmSource, value, currency: 'USD', chat_session_id: sessionId,
    })
  },
  chatSmartCartCtaClicked(scopeId: string, sessionId: string) {
    getGtag()?.('event', 'chat_smart_cart_cta_clicked', {
      scope_id: scopeId, chat_session_id: sessionId,
    })
  },
  calculatorToSmartCartClicked(projectId: string, estimateValue: number) {
    getGtag()?.('event', 'calculator_to_smart_cart_clicked', {
      project_id: projectId, estimate_value: estimateValue,
    })
  },
  calculatorToWorthItClicked(projectId: string, estimateValue: number) {
    getGtag()?.('event', 'calculator_to_worth_it_clicked', {
      project_id: projectId, estimate_value: estimateValue,
    })
  },
  contractorPageBannerClicked(pagePath: string, product: 'smart_cart' | 'worth_it', scopeId?: string) {
    getGtag()?.('event', 'contractor_page_banner_clicked', {
      page_path: pagePath, product, scope_id: scopeId,
    })
  },
  refundInitiated(scopeId: string, hoursSincePurchase: number, source: string) {
    getGtag()?.('event', 'refund_initiated', {
      scope_id: scopeId, hours_since_purchase: hoursSincePurchase, utm_source: source,
    })
  },
}
