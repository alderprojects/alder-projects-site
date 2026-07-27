/**
 * v7.4.5 — Admin authorization layered on the existing magic-link auth.
 *
 * Authorization = signed-in User whose email ∈ ADMIN_EMAILS (comma-
 * separated env var). No roles table, no separate auth system. Anyone
 * may request a magic link; non-allowlisted emails land on the /admin
 * 403 page and the attempt is written to AdminAccessLog as DENIED.
 *
 * Every admin access to customer data (session-detail load, photo
 * passthrough issuance) writes an AdminAccessLog row — no exceptions,
 * including the owner account.
 */

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import type { User } from '@prisma/client'

export type AdminAccessAction = 'SESSION_VIEWED' | 'PHOTO_VIEWED' | 'FLAG_CREATED' | 'DENIED'

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}

export type AdminCheck =
  | { status: 'ok'; user: User }
  | { status: 'unauthenticated' }
  | { status: 'forbidden'; email: string }

/**
 * Session → allowlist check for /admin pages and /api/admin routes.
 * A signed-in non-allowlisted probe is logged as DENIED here so callers
 * can't forget to.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const user = await getCurrentUser()
  if (!user) return { status: 'unauthenticated' }
  if (!isAdminEmail(user.email)) {
    await logAdminAccess(user.email, 'DENIED', null)
    return { status: 'forbidden', email: user.email }
  }
  return { status: 'ok', user }
}

/** Append-only; a write failure must never block the admin surface. */
export async function logAdminAccess(
  adminEmail: string,
  action: AdminAccessAction,
  targetId: string | null
): Promise<void> {
  try {
    await prisma.adminAccessLog.create({ data: { adminEmail, action, targetId } })
  } catch (e) {
    console.error('[admin-access-log] write failed:', (e as Error).message)
  }
}
