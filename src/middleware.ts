// v7.2.13 — Session/UTM tracking middleware.
// v7.3.3-B — Also mints alder_anon_id cookie for anonymous photo reader.
// v7.4.5 — Outer gate for /admin pages and /api/admin routes.
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
//
// v7.4.5 admin gating is defense-in-depth: this edge check turns away
// requests with no credential shape at all; the REAL check (session →
// User → ADMIN_EMAILS allowlist) runs in nodejs via checkAdmin() in the
// /admin (console) layout and every /api/admin route handler.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildSessionCookies } from '@/lib/session-tracking'

const VISITOR_ANON_COOKIE = 'alder_anon_id'
const VISITOR_ANON_TTL_DAYS = 90
const AUTH_SESSION_COOKIE = 'alder_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // v7.4.5 — /api/admin/* outer gate. Session-cookie holders pass (the
  // route handler does the allowlist check); legacy ADMIN_REFUND_TOKEN
  // callers pass (those endpoints verify the token themselves, and the
  // digest-email links depend on it); everything else stops here.
  if (pathname.startsWith('/api/admin')) {
    if (req.cookies.get(AUTH_SESSION_COOKIE)?.value) return NextResponse.next()
    const expected = process.env.ADMIN_REFUND_TOKEN
    const token = req.nextUrl.searchParams.get('adminToken')
    const bearer = req.headers.get('authorization')
    if (expected && (token === expected || bearer === `Bearer ${expected}`)) {
      return NextResponse.next()
    }
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // v7.4.5 — /admin/* pages: no session cookie → login page. /admin/login
  // itself stays reachable, or nobody could ever sign in. The
  // catalog-review action pages are exempt: they're clicked from digest
  // emails with no session, and their single-use ReviewActionToken IS
  // the auth (verified in the page itself).
  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    !pathname.startsWith('/admin/catalog-review/action/')
  ) {
    if (!req.cookies.get(AUTH_SESSION_COOKIE)?.value) {
      const login = req.nextUrl.clone()
      login.pathname = '/admin/login'
      login.search = ''
      return NextResponse.redirect(login)
    }
  }

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
  // Apply to all paths EXCEPT static assets and API routes — plus
  // /api/admin explicitly (v7.4.5), which gets the outer admin gate.
  // Pages mint the anon cookie; subsequent API requests carry it. Users
  // who hit an API route first (e.g. /api/photos/upload) without ever
  // loading a page will get a 400 from ensureVisitorSession() — but
  // realistic UX always loads a page first.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
    '/api/admin/:path*',
  ],
}
