/**
 * Generic Resend wrapper.
 *
 * Centralizes the Resend SDK 6.x `{data, error}` response-checking
 * pattern (the v7.3.2-D fix). All other email-sending code in the
 * codebase — magic-link, daily-digest, claim flow — should use
 * sendEmail() rather than calling resend.emails.send() directly so
 * silent API rejections always log loudly.
 */

import { Resend } from 'resend'

let resendClient: Resend | null = null
function getResend(): Resend | null {
  if (resendClient) return resendClient
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  resendClient = new Resend(key)
  return resendClient
}

export interface SendEmailArgs {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
}

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; reason: 'no_resend_key' | 'email_send_failed'; error?: string }

/**
 * Send a transactional email via Resend.
 *
 * Returns `{ok: true}` on success (with Resend message id), or
 * `{ok: false, reason}` on any failure. NEVER throws — callers can
 * rely on the result discriminant. Failure modes are logged at
 * console.error with full Resend error details for ops debugging.
 *
 * `from` defaults to `MAGIC_LINK_FROM_EMAIL` env var (the most-used
 * sender), then to a generic noreply address.
 */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const resend = getResend()
  const from =
    args.from ??
    process.env.MAGIC_LINK_FROM_EMAIL ??
    'Alder <noreply@alderprojects.com>'

  if (!resend) {
    if (process.env.VERCEL_ENV === 'production') {
      console.error('[email] RESEND_API_KEY missing in production')
      return { ok: false, reason: 'no_resend_key' }
    }
    // Local dev fallback — log the would-be send instead of failing.
    console.log(
      `[email DEV] would send to=${args.to} subject="${args.subject.slice(0, 60)}"`
    )
    return { ok: true }
  }

  try {
    const result = await resend.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html ?? '',
      text: args.text ?? '',
    })
    if (result.error) {
      console.error(
        '[email] Resend API rejected send',
        JSON.stringify({
          name: result.error.name,
          message: result.error.message,
          from,
          to: args.to,
          subject: args.subject.slice(0, 60),
        })
      )
      return {
        ok: false,
        reason: 'email_send_failed',
        error: result.error.message,
      }
    }
    console.log(
      '[email] Resend accepted send',
      JSON.stringify({
        id: result.data?.id,
        from,
        to: args.to,
        subject: args.subject.slice(0, 60),
      })
    )
    return { ok: true, id: result.data?.id }
  } catch (e) {
    const msg = (e as Error).message
    console.error('[email] send threw:', msg)
    return { ok: false, reason: 'email_send_failed', error: msg }
  }
}
