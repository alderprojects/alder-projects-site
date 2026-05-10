// v7.2.13 — Session/UTM tracking middleware.
//
// Sets a sessionId + UTM cookies on first visit so the buyer event log
// can attribute carts to traffic sources without joining GA4 to KV
// manually. No PII, no third-party pixels.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildSessionCookies } from '@/lib/session-tracking'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const cookiesToSet = buildSessionCookies(req)
  for (const c of cookiesToSet) {
    res.cookies.set(c.name, c.value, c.opts)
  }
  return res
}

export const config = {
  // Apply to all paths EXCEPT static assets and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}
