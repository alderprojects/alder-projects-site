/**
 * GET /account/sign-in/verify/[token]
 *
 * Email magic-link landing. The user clicks the link in their email and
 * lands here. We consume the token, mint a session, set the auth cookie,
 * and redirect to /account.
 *
 * Why a Route Handler instead of a Server Component page:
 *
 *   The original v7.3.1 implementation was a server-component page that
 *   called mintSession() → cookies().set(). In Next.js 14, server
 *   components can READ cookies but cannot WRITE them — cookies().set()
 *   throws ("Cookies can only be modified in a Server Action or Route
 *   Handler"). The page worked in local dev because Next.js sometimes
 *   surfaces this as a warning rather than a hard error, but in
 *   production it threw a 500.
 *
 *   Route handlers run in a context where cookies are writable. Same URL,
 *   same email-link compatibility, no email template change needed.
 *
 * On failure (invalid / expired / already-consumed token) we render a
 * minimal HTML error page with a link back to /account/sign-in.
 */

import { NextRequest, NextResponse } from 'next/server'
import { consumeMagicLink } from '@/lib/auth/magic-link'
import { mintSession } from '@/lib/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { token: string } }
): Promise<Response> {
  const { token } = context.params

  const result = await consumeMagicLink(token)
  if (!result.ok || !result.userId) {
    return errorHtml(result.reason ?? 'unknown')
  }

  await mintSession(result.userId)

  // 303 See Other so the browser switches to GET on /account (which is
  // the default redirect behavior, but explicit for clarity).
  return NextResponse.redirect(new URL('/account', request.url), 303)
}

function errorHtml(reason: string): Response {
  const message =
    reason === 'expired'
      ? 'This sign-in link has expired (links are valid for 15 minutes). Request a new one and try again.'
      : reason === 'already_consumed'
        ? 'This link was already used. For your security, each link works only once.'
        : reason === 'not_found'
          ? "We couldn't find that sign-in link. It may have been mistyped or already used."
          : "We couldn't complete sign-in. Request a new link and try again."

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign-in link didn't work · Alder Read</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 60px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.5; }
    h1 { font-size: 24px; font-weight: 600; margin: 0 0 12px; color: #b91c1c; }
    p { font-size: 15px; color: #4b5563; margin: 0 0 20px; }
    a.btn { display: inline-block; padding: 12px 24px; background: #1d4ed8; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; }
    a.btn:hover { background: #1e40af; }
  </style>
</head>
<body>
  <h1>Link didn't work</h1>
  <p>${message}</p>
  <a class="btn" href="/account/sign-in">Request a new link</a>
</body>
</html>`

  return new Response(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
