/**
 * v7.4.1 — client-side funnel event helper for the Alder Check flow.
 * Fire-and-forget; failures never block UX. Mirrors the PhotoPanel
 * pattern. GA4 mirroring rides on the existing gtag pageview stream —
 * server EventLog is the analysis source of truth.
 */

export function fireFunnel(eventType: string, payload?: Record<string, unknown>): void {
  try {
    fetch('/api/events/funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, payload: payload ?? {} }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* never throw from analytics */
  }
  // Mirror to GA4 when gtag is present (spec: mirror funnel to GA4; keep GA4).
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    w.gtag?.('event', eventType.toLowerCase(), payload ?? {})
  } catch {
    /* ignore */
  }
}
