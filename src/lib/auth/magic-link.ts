/**
 * Magic-link authentication.
 *
 * Flow:
 *   1. User submits email at /account/sign-in
 *   2. POST /api/auth/magic-link/request calls requestMagicLink(email):
 *      - find or create User
 *      - generate 32-byte random token (64 hex chars)
 *      - store SHA-256 hash in MagicLink.tokenHash, expiry 15 min
 *      - email the plaintext token as a link
 *   3. User clicks link → GET /account/sign-in/verify/[token]
 *   4. That page server-renders, calls consumeMagicLink(token):
 *      - hash the plaintext, find MagicLink by tokenHash
 *      - reject if missing, expired, or already consumed
 *      - mark consumedAt, return userId
 *   5. Caller mints a session (lib/auth/session.ts) and redirects to /account
 *
 * Security notes:
 *   - tokenHash is SHA-256 of the URL-safe token. We never store plaintext.
 *   - Expiry is 15 minutes; consumption is one-shot.
 *   - The /request endpoint always returns 200 regardless of whether the
 *     email exists, to avoid email enumeration.
 *   - Magic links are sent only to addresses the user typed — never auto-
 *     populated, never harvested from observed content.
 */

import crypto from 'crypto'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'

const TOKEN_BYTES = 32
const EXPIRY_MINUTES = 15

let resendClient: Resend | null = null
function getResend(): Resend | null {
  if (resendClient) return resendClient
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  resendClient = new Resend(key)
  return resendClient
}

function hashToken(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex')
}

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex')
}

function normalizeEmail(input: string): string {
  return input.trim().toLowerCase()
}

function isValidEmail(input: string): boolean {
  // Pragmatic regex — RFC 5322 is overkill for sign-in. Catches typos,
  // not adversarial inputs.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) && input.length <= 254
}

export interface RequestResult {
  ok: boolean
  // We always return ok: true to the client to prevent email enumeration.
  // This field is only consumed server-side for logging / rate limiting.
  reason?: 'invalid_email' | 'email_send_failed' | 'no_resend_key'
}

/**
 * Generate and send a magic link. Always returns ok: true to the caller
 * unless the email is structurally invalid (in which case we surface to
 * the user). Send failures are logged but not exposed.
 */
export async function requestMagicLink(emailRaw: string): Promise<RequestResult> {
  const email = normalizeEmail(emailRaw)
  if (!isValidEmail(email)) {
    return { ok: false, reason: 'invalid_email' }
  }

  // Find or create user. We don't require email verification at this step —
  // clicking the magic link is the verification.
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  // One-shot token
  const plaintext = generateToken()
  const tokenHash = hashToken(plaintext)
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000)

  await prisma.magicLink.create({
    data: {
      userId: user.id,
      tokenHash,
      purpose: 'signin',
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/account/sign-in/verify/${plaintext}`

  const resend = getResend()
  if (!resend) {
    // In local dev with no Resend key, log the link instead of sending.
    // Never do this in production — surfaced via VERCEL_ENV check.
    if (process.env.VERCEL_ENV === 'production') {
      console.error('RESEND_API_KEY missing in production')
      return { ok: true, reason: 'no_resend_key' }
    }
    console.log(`[magic-link DEV] ${email} → ${link}`)
    return { ok: true }
  }

  const fromAddress =
    process.env.MAGIC_LINK_FROM_EMAIL ?? 'Alder Read <read@alderprojects.com>'

  try {
    // Resend SDK 6.x returns { data, error } and does NOT throw on
    // 4xx/5xx API responses — sandbox-sender rejections, unverified
    // domain bounces, etc. all come back via the `error` field. The
    // try/catch below only catches network/runtime exceptions.
    const result = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Sign in to Alder Read',
      html: buildEmailHtml(link),
      text: buildEmailText(link),
    })
    if (result.error) {
      console.error(
        '[magic-link] Resend API rejected send',
        JSON.stringify({
          name: result.error.name,
          message: result.error.message,
          from: fromAddress,
          to: email,
        })
      )
      return { ok: true, reason: 'email_send_failed' }
    }
    console.log(
      '[magic-link] Resend accepted send',
      JSON.stringify({ id: result.data?.id, from: fromAddress, to: email })
    )
  } catch (e) {
    console.error('[magic-link] email send threw:', (e as Error).message)
    return { ok: true, reason: 'email_send_failed' }
  }

  return { ok: true }
}

export interface ConsumeResult {
  ok: boolean
  userId?: string
  reason?: 'not_found' | 'expired' | 'already_consumed'
}

/**
 * Verify and consume a magic-link token. Returns the userId on success.
 * One-shot — repeat calls with the same token return already_consumed.
 */
export async function consumeMagicLink(plaintext: string): Promise<ConsumeResult> {
  if (typeof plaintext !== 'string' || plaintext.length !== TOKEN_BYTES * 2) {
    return { ok: false, reason: 'not_found' }
  }
  const tokenHash = hashToken(plaintext)

  const link = await prisma.magicLink.findUnique({
    where: { tokenHash },
  })

  if (!link) {
    return { ok: false, reason: 'not_found' }
  }
  if (link.consumedAt) {
    return { ok: false, reason: 'already_consumed' }
  }
  if (link.expiresAt < new Date()) {
    return { ok: false, reason: 'expired' }
  }

  await prisma.magicLink.update({
    where: { id: link.id },
    data: { consumedAt: new Date() },
  })

  // Mark email as verified now that the user proved they own it.
  await prisma.user.update({
    where: { id: link.userId },
    data: { emailVerifiedAt: new Date() },
  })

  return { ok: true, userId: link.userId }
}

// =============================================================================
// Email templates
// =============================================================================

function buildEmailHtml(link: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #222;">
  <h1 style="font-size: 18px; font-weight: 500; margin: 0 0 16px;">Sign in to Alder Read</h1>
  <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px;">Click the button below to sign in. This link expires in 15 minutes and works one time.</p>
  <p style="margin: 0 0 24px;">
    <a href="${link}" style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">Sign in</a>
  </p>
  <p style="font-size: 12px; color: #666; line-height: 1.5; margin: 0 0 8px;">Or paste this link into your browser:</p>
  <p style="font-size: 12px; color: #666; word-break: break-all; margin: 0 0 32px;">${link}</p>
  <p style="font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; margin: 0;">If you did not request this, you can ignore this email.</p>
</body>
</html>`
}

function buildEmailText(link: string): string {
  return `Sign in to Alder Read

Click this link to sign in (expires in 15 minutes, one-time use):
${link}

If you did not request this, you can ignore this email.`
}
