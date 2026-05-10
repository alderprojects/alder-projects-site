// v7.2.13 — Anonymous session tracking for traffic-source attribution.
//
// Sets a sessionId cookie on first visit. Captures UTM params and
// referrer at session start. The cart-creation flow reads these and
// bakes them into the cart record + buyer event log. Result: you can
// answer "of last quarter's carts, what % came from Reddit" without
// joining GA4 to KV manually.
//
// Cookie: alder_session_id, 24h rolling, refreshed on activity.
// Lightweight — no PII, no tracking pixels.

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

export interface SessionInfo {
  sessionId: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  referrer: string | null
  firstVisitAt: string | null
}

const COOKIE_NAME = 'alder_session_id'
const SESSION_TTL_SECONDS = 60 * 60 * 24 // 24h

export function readSessionFromCookies(): SessionInfo {
  try {
    const c = cookies()
    const sessionId = c.get(COOKIE_NAME)?.value ?? ''
    const utmSource = c.get('alder_utm_source')?.value ?? null
    const utmMedium = c.get('alder_utm_medium')?.value ?? null
    const utmCampaign = c.get('alder_utm_campaign')?.value ?? null
    const referrer = c.get('alder_referrer')?.value ?? null
    const firstVisitAt = c.get('alder_first_visit')?.value ?? null
    return {
      sessionId,
      utmSource,
      utmMedium,
      utmCampaign,
      referrer,
      firstVisitAt,
    }
  } catch {
    return {
      sessionId: '',
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      referrer: null,
      firstVisitAt: null,
    }
  }
}

export function generateSessionId(): string {
  return `sess_${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`
}

export function buildSessionCookies(
  req: Request,
): Array<{ name: string; value: string; opts: Record<string, unknown> }> {
  const url = new URL(req.url)
  const cookies: Array<{ name: string; value: string; opts: Record<string, unknown> }> = []
  const baseOpts = {
    httpOnly: false,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }

  const existing = req.headers
    .get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith(`${COOKIE_NAME}=`))
  if (!existing) {
    cookies.push({ name: COOKIE_NAME, value: generateSessionId(), opts: baseOpts })
    cookies.push({
      name: 'alder_first_visit',
      value: new Date().toISOString(),
      opts: { ...baseOpts, maxAge: 60 * 60 * 24 * 90 }, // 90d
    })
  }

  const utmSource = url.searchParams.get('utm_source')
  const utmMedium = url.searchParams.get('utm_medium')
  const utmCampaign = url.searchParams.get('utm_campaign')
  if (utmSource) cookies.push({ name: 'alder_utm_source', value: utmSource, opts: baseOpts })
  if (utmMedium) cookies.push({ name: 'alder_utm_medium', value: utmMedium, opts: baseOpts })
  if (utmCampaign) cookies.push({ name: 'alder_utm_campaign', value: utmCampaign, opts: baseOpts })

  const referrer = req.headers.get('referer')
  if (referrer && !referrer.includes(url.host)) {
    try {
      const refHost = new URL(referrer).host
      cookies.push({ name: 'alder_referrer', value: refHost, opts: baseOpts })
    } catch {}
  }

  return cookies
}
