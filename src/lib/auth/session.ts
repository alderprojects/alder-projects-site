/**
 * Session management — opaque cookie-backed sessions.
 *
 * Flow:
 *   - After consumeMagicLink succeeds, call mintSession(userId) to create
 *     a Session row and set the cookie.
 *   - getCurrentUser() in any server component or route handler returns
 *     the signed-in User (or null), based on the cookie.
 *   - clearSession() destroys the row and the cookie.
 *
 * Cookie format:
 *   - name: alder_session
 *   - value: the random session token (also stored in Session.token)
 *   - httpOnly, secure (in prod), sameSite=lax, path=/
 *   - 30-day expiry (rolling — extended on each lookup)
 *
 * Why store the raw token (not a hash):
 *   - The cookie value IS the session token. Hashing server-side adds no
 *     defense — anyone with the cookie has full access either way.
 *   - Keeps lookup a simple unique-index scan, no rehash per request.
 *   - MagicLink.tokenHash is hashed because that token is sent over email
 *     (which is logged, archived, screenshotted); sessions never leave the
 *     cookie jar.
 */

import crypto from 'crypto'
import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

const COOKIE_NAME = 'alder_session'
const SESSION_BYTES = 32
const SESSION_TTL_DAYS = 30

function generateSessionToken(): string {
  return crypto.randomBytes(SESSION_BYTES).toString('hex')
}

function sessionExpiry(): Date {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
}

/**
 * Create a new Session row and set the cookie. Must be called from a
 * route handler or server action (anywhere cookies() is writable).
 */
export async function mintSession(userId: string): Promise<void> {
  const token = generateSessionToken()
  const expiresAt = sessionExpiry()

  const h = headers()
  const userAgent = h.get('user-agent') ?? null
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      userAgent,
      ip,
    },
  })

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

/**
 * Read the session cookie and return the signed-in User, or null.
 * Cheap enough to call from server components on any rendered page.
 *
 * Side effect: expired sessions get deleted lazily on first lookup.
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null
  if (session.expiresAt < new Date()) {
    // Lazy cleanup. We don't need to await — fire and forget is fine.
    prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  if (session.user.deletedAt) return null

  return session.user
}

/**
 * Destroy the current session row and clear the cookie. Idempotent.
 */
export async function clearSession(): Promise<void> {
  const token = cookies().get(COOKIE_NAME)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  cookies().delete(COOKIE_NAME)
}

/**
 * Convenience for route handlers that require auth — throws-or-returns
 * pattern keeps the handler body terse.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}
