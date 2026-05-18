/**
 * GET /handoff/[token]
 *
 * Mobile-device redemption endpoint for the desktop <-> mobile session
 * handoff. The QR code on /project-read/home (renamed in PR3.7 from
 * /project-read/basement) encodes a URL pointing here.
 *
 * Flow:
 *   1. Mobile scans QR -> lands here
 *   2. Verify token (single-use, 5-min TTL)
 *   3. Set alder_anon_id cookie to the desktop's anon id
 *   4. Redirect to /project-read/home
 *
 * Mobile is now in the same anon session as the originating desktop.
 * Photos uploaded from either device land under the same Project /
 * RoomSnapshot / SmartCart owner. PR3.7 §1.9: when the visitor returns
 * to the desktop after uploading from phone, the result page reads the
 * shared anon's photos and renders the cart.
 *
 * On failure: HTML error page with link back to /project-read/home
 * (where the mobile user can start their own anon session).
 */

import { NextRequest, NextResponse } from 'next/server'
import { redeemHandoffToken } from '@/lib/visitor/handoff'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VISITOR_ANON_COOKIE = 'alder_anon_id'
const VISITOR_ANON_TTL_DAYS = 90

export async function GET(
  request: NextRequest,
  context: { params: { token: string } }
): Promise<Response> {
  const { token } = context.params

  const fromIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null

  const result = await redeemHandoffToken(token, fromIp)
  if (!result.ok) {
    return errorHtml(result.reason)
  }

  // PR3.9 Bug #2: tag the redirect with ?source=handoff so the
  // mobile PhotoUploader knows it's the phone half of a desktop
  // handoff pair. PhotoUploader then hides the synthesize CTA + shows
  // a "photos uploaded — return to your desktop" message rather than
  // letting the visitor synthesize on mobile (which strands the
  // desktop session at the QR + duplicates the buyer journey).
  const res = NextResponse.redirect(
    new URL('/project-read/home?source=handoff', request.url),
    303
  )
  res.cookies.set(VISITOR_ANON_COOKIE, result.anonId, {
    maxAge: 60 * 60 * 24 * VISITOR_ANON_TTL_DAYS,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return res
}

function errorHtml(reason: string): Response {
  const message =
    reason === 'expired'
      ? 'This handoff link has expired (links are valid for 5 minutes). Reload the QR code on your other device and try again.'
      : reason === 'already_consumed'
        ? 'This handoff link has already been used. Generate a new QR code on your other device.'
        : "We couldn't find that handoff link. Generate a new QR code on your other device."

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Handoff link didn't work · Alder Read</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 60px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.5; }
    h1 { font-size: 22px; font-weight: 600; margin: 0 0 12px; color: #b91c1c; }
    p { font-size: 15px; color: #4b5563; margin: 0 0 20px; }
    a.btn { display: inline-block; padding: 12px 24px; background: #047857; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Handoff link didn't work</h1>
  <p>${message}</p>
  <a class="btn" href="/project-read/home">Start a new home photo read</a>
</body>
</html>`

  return new Response(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
