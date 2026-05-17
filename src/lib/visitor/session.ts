/**
 * Anonymous visitor session helpers (v7.3.3-B).
 *
 * The middleware mints an `alder_anon_id` cookie on first page load.
 * Server-side code reads it via `getAnonId()`, then calls
 * `ensureVisitorSession()` to upsert the corresponding `VisitorSession`
 * row (one row per cookie). The row tracks first/last seen, attribution
 * source, and — once the visitor supplies an email and goes through the
 * claim flow — the linked `userId`.
 *
 * Throws from `ensureVisitorSession()` if the cookie is missing —
 * indicates middleware misconfiguration or a direct API hit before any
 * page load. Callers should return 400 in that case rather than
 * synthesizing a fresh anon id on the server (the client wouldn't see
 * the cookie set in the response, so subsequent requests would still
 * be anonymous-less).
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

const VISITOR_ANON_COOKIE = 'alder_anon_id'

export async function getAnonId(): Promise<string | null> {
  const c = cookies()
  return c.get(VISITOR_ANON_COOKIE)?.value ?? null
}

export interface EnsureVisitorOptions {
  /** First-touch attribution. Set when ensureVisitorSession is called
   *  from a route that has clear source signal (e.g. photo_upload). */
  firstSource?: string
  /** Arbitrary first-touch signals. JSON-stored on the row. */
  signals?: Record<string, unknown>
}

/**
 * Returns the anon id. Upserts the VisitorSession row, updating
 * `lastSeenAt` on every call. If this is the first time we've seen the
 * cookie, also writes firstSource + signalsJson from options.
 *
 * Throws if the cookie isn't set — see file header comment.
 */
export async function ensureVisitorSession(
  options: EnsureVisitorOptions = {}
): Promise<string> {
  const anonId = await getAnonId()
  if (!anonId) {
    throw new Error(
      'ensureVisitorSession called without alder_anon_id cookie — middleware misconfigured or direct API hit before page load'
    )
  }

  await prisma.visitorSession.upsert({
    where: { anonId },
    create: {
      anonId,
      firstSource: options.firstSource ?? null,
      signalsJson: (options.signals ?? {}) as never,
      lastSeenAt: new Date(),
    },
    update: {
      lastSeenAt: new Date(),
    },
  })

  return anonId
}
