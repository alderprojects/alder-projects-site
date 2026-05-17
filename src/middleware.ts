// v7.2.13 — Session/UTM tracking middleware.
// v7.3.3-B — Also mints alder_anon_id cookie for anonymous photo reader.
//
// Sets a sessionId + UTM cookies on first visit so the buyer event log
// can attribute carts to traffic sources without joining GA4 to KV
// manually. No PII, no third-party pixels.
//
// Adds alder_anon_id (UUID v4, 90-day TTL) for the v7.3.3 anonymous-
// first photo reader flow. Cookie persists across visits so an anon
// visitor's Photo / Project / SmartCart rows can be attached to a stable
// owner without sign-in. When the visitor later supplies an email, the
// claim flow reassigns ownership from anonId to userId.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildSessionCookies } from '@/lib/session-tracking'

const VISITOR_ANON_COOKIE = 'alder_anon_id'
const VISITOR_ANON_TTL_DAYS = 90

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Existing v7.2.13 session/UTM tracking
  const cookiesToSet = buildSessionCookies(req)
  for (const c of cookiesToSet) {
    res.cookies.set(c.name, c.value, c.opts)
  }

  // v7.3.3-B: ensure alder_anon_id cookie is present
  const existingAnonId = req.cookies.get(VISITOR_ANON_COOKIE)?.value
  if (!existingAnonId) {
    res.cookies.set(VISITOR_ANON_COOKIE, crypto.randomUUID(), {
      maxAge: 60 * 60 * 24 * VISITOR_ANON_TTL_DAYS,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }

  return res
}

export const config = {
  // Apply to all paths EXCEPT static assets and API routes.
  // Pages mint the anon cookie; subsequent API requests carry it. Users
  // who hit an API route first (e.g. /api/photos/upload) without ever
  // loading a page will get a 400 from ensureVisitorSession() — but
  // realistic UX always loads a page first.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}
