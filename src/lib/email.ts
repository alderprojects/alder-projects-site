// V7 — email delivery + reminder system.
//
// Five email touchpoints:
//   1. Smart Cart receipt (immediate, post-webhook)
//   2. Worth-It delivery (immediate, post-webhook, with magic link)
//   3. Upgrade-offer email (T+72h after Smart Cart purchase)
//   4. Upgrade-complete email (immediate, post-upgrade-webhook)
//   5. Worth-It reminders (Friday / Saturday morning / Sunday — day-of-week)
//
// Transport: at V7 launch, the queue is metadata-only. Each call writes
// an envelope record to KV under email:queue:* and the Vercel Cron job
// (or operator script) actually posts via Gmail API / Postmark / Resend.
// Keeping the transport abstraction here means swapping providers does
// not touch the webhook code.
//
// This avoids accidentally sending to test customers during V7 dev and
// ensures the queue has full plan context if delivery retries.

import { kv } from '@vercel/kv'
import { Resend } from 'resend'
import { CONFIG } from './recommender-config'
import { formatPrice } from './format'
import type { SmartCartOutput } from './buildSmartCart'
import type { SmartCartV2Output } from './smart-cart-model'
import type { WorthItOutput } from './buildWorthItPlan'

// V7.1 — single Resend client, lazy-initialized so missing env vars
// during build don't crash. Returns null if Resend is not configured;
// sendNow() falls back to leaving the envelope queued.
let resendClient: Resend | null = null
function getResend(): Resend | null {
  if (resendClient) return resendClient
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  resendClient = new Resend(key)
  return resendClient
}

const SEND_MAX_ATTEMPTS = 3
const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? 'hello@alderprojects.com'

// ---------- Envelope --------------------------------------------------

type EmailEnvelope = {
  id: string
  type:
    | 'smart_cart_receipt'
    | 'worth_it_delivery'
    | 'upgrade_offer'
    | 'upgrade_complete'
    | 'reminder'
  toEmail: string
  subject: string
  body: string                          // plain-text + light markdown
  metadata: Record<string, string | number | boolean | undefined>
  scheduledFor: string                  // ISO timestamp; immediate sends use now
  status: 'queued' | 'sent' | 'failed'
  attempts: number
  createdAt: string
  sentAt?: string
  error?: string
}

const EMAIL_QUEUE_PREFIX = 'email:queue'
const EMAIL_INDEX_KEY = 'email:queue:index'

async function enqueueEmail(envelope: EmailEnvelope): Promise<void> {
  await kv.set(`${EMAIL_QUEUE_PREFIX}:${envelope.id}`, envelope)
  const index = (await kv.get<string[]>(EMAIL_INDEX_KEY)) ?? []
  await kv.set(EMAIL_INDEX_KEY, [...index, envelope.id].slice(-1000))
}

// V7.1 — sendNow: fire the envelope through Resend immediately, then
// reflect the outcome back to KV. Designed to never throw. Webhook
// callers wrap us in try/catch anyway, but extra defense matters
// because a 500 from this path retries the whole Stripe webhook.
async function sendNow(envelope: EmailEnvelope): Promise<void> {
  // Skip non-immediate sends (e.g. T+72h upgrade offers); the cron
  // job processes those when their scheduledFor lands.
  const due = new Date(envelope.scheduledFor).getTime() <= Date.now()
  if (!due) return
  const client = getResend()
  if (!client) return                                // RESEND_API_KEY unset — stay queued
  try {
    const result = await client.emails.send({
      from: FROM_ADDRESS,
      to: envelope.toEmail,
      subject: envelope.subject,
      text: envelope.body,
    })
    if (result.error) {
      throw new Error(result.error.message)
    }
    envelope.status = 'sent'
    envelope.sentAt = new Date().toISOString()
    await kv.set(`${EMAIL_QUEUE_PREFIX}:${envelope.id}`, envelope)
  } catch (e: unknown) {
    envelope.attempts += 1
    envelope.error = e instanceof Error ? e.message : String(e)
    if (envelope.attempts >= SEND_MAX_ATTEMPTS) {
      envelope.status = 'failed'
    }
    try {
      await kv.set(`${EMAIL_QUEUE_PREFIX}:${envelope.id}`, envelope)
    } catch {
      /* swallow — KV transient failure */
    }
  }
}

function newEnvelopeId(): string {
  return `eml_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

// ---------- Public API -----------------------------------------------

export async function sendSmartCartReceiptEmail(
  cart: SmartCartOutput,
  toEmail: string,
): Promise<void> {
  const subject = `Your Smart Cart for ${cart.scopeLabel}`
  const body = renderSmartCartReceiptBody(cart)
  const envelope: EmailEnvelope = {
    id: newEnvelopeId(),
    type: 'smart_cart_receipt',
    toEmail,
    subject,
    body,
    metadata: { cartId: cart.cartId, topic: cart.topic, scopeVariantId: cart.scopeVariantId },
    scheduledFor: new Date().toISOString(),
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  }
  await enqueueEmail(envelope)
  await sendNow(envelope)
}

// V7.2.1 — receipt email for v2 carts. Same envelope shape as v1 so
// the queue and admin index stay homogeneous; only the body changes.
export async function sendSmartCartReceiptEmailV2(
  cart: SmartCartV2Output,
  toEmail: string,
): Promise<void> {
  const subject = `Your Smart Cart for ${cart.scopeLabel}`
  const body = renderSmartCartReceiptBodyV2(cart)
  const envelope: EmailEnvelope = {
    id: newEnvelopeId(),
    type: 'smart_cart_receipt',
    toEmail,
    subject,
    body,
    metadata: {
      cartId: cart.cartId,
      topic: cart.topic,
      scopeVariantId: cart.scopeVariantId,
      version: 2,
    },
    scheduledFor: new Date().toISOString(),
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  }
  await enqueueEmail(envelope)
  await sendNow(envelope)
}

export async function sendWorthItDeliveryEmail(
  plan: WorthItOutput,
  toEmail: string,
): Promise<void> {
  const planUrl = buildPlanUrl(plan)
  const subject = CONFIG.products.worthIt.deliveryEmailSubject
  const body = renderWorthItDeliveryBody(plan, planUrl)
  const envelope: EmailEnvelope = {
    id: newEnvelopeId(),
    type: 'worth_it_delivery',
    toEmail,
    subject,
    body,
    metadata: { planCode: plan.planCode, topic: plan.topic, scopeVariantId: plan.scopeVariantId },
    scheduledFor: new Date().toISOString(),
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  }
  await enqueueEmail(envelope)
  await sendNow(envelope)
}

export async function scheduleUpgradeOfferEmail(
  cart: SmartCartOutput,
  delayHours: number,
): Promise<void> {
  const subject = CONFIG.products.upgrade.emailSubject
  const upgradeUrl = `https://alderprojects.com/api/upgrade/smart-cart-to-worth-it?cartId=${cart.cartId}`
  const body = CONFIG.products.upgrade.emailBodyTemplate.replace(
    '{{upgradeUrl}}',
    upgradeUrl,
  )
  const scheduledFor = new Date(Date.now() + delayHours * 3600 * 1000).toISOString()
  await enqueueEmail({
    id: newEnvelopeId(),
    type: 'upgrade_offer',
    toEmail: cart.customerEmail,
    subject,
    body,
    metadata: { cartId: cart.cartId },
    scheduledFor,
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  })
}

export async function sendUpgradeOfferEmail(cart: SmartCartOutput, toEmail: string) {
  // Direct send — used by re-trigger admin actions.
  await scheduleUpgradeOfferEmail({ ...cart, customerEmail: toEmail }, 0)
}

export async function sendUpgradeCompleteEmail(
  plan: WorthItOutput,
  fromCartId: string,
  toEmail: string,
): Promise<void> {
  const planUrl = buildPlanUrl(plan)
  const subject = `Your Worth-It Plan is ready (upgraded from Smart Cart)`
  const body = `Your Smart Cart upgraded to a Worth-It Plan.\n\nMagic link to your saved dashboard: ${planUrl}\n\nPlan code: ${plan.planCode}\n\nYour original Smart Cart ${fromCartId} stays good for the remainder of its 30-day window.`
  const envelope: EmailEnvelope = {
    id: newEnvelopeId(),
    type: 'upgrade_complete',
    toEmail,
    subject,
    body,
    metadata: { planCode: plan.planCode, fromCartId },
    scheduledFor: new Date().toISOString(),
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  }
  await enqueueEmail(envelope)
  await sendNow(envelope)
}

export async function sendReminder(
  plan: WorthItOutput,
  reminderId: 'friday' | 'saturday_morning' | 'sunday_followup',
  toEmail: string,
): Promise<void> {
  const opt = CONFIG.products.worthIt.reminderDayOptions.find(o => o.id === reminderId)
  if (!opt) return
  const planUrl = buildPlanUrl(plan)
  const body = opt.bodyTemplate.replace('{{planUrl}}', planUrl)
  await enqueueEmail({
    id: newEnvelopeId(),
    type: 'reminder',
    toEmail,
    subject: `Worth-It Plan: ${opt.label}`,
    body,
    metadata: { planCode: plan.planCode, reminderId },
    scheduledFor: new Date().toISOString(),
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  })
}

// ---------- Body rendering ------------------------------------------

function renderSmartCartReceiptBodyV2(cart: SmartCartV2Output): string {
  const url = `https://alderprojects.com/smart-cart/result/${cart.cartId}`
  return [
    `Your Smart Cart for ${cart.scopeLabel} is ready.`,
    '',
    `View it for the next 30 days at:`,
    url,
    '',
    `Lean cart total: $${cart.savings.leanCartLow}–$${cart.savings.leanCartHigh}`,
    `Potential savings vs typical first-time spend: $${cart.savings.potentialSavingsLow}–$${cart.savings.potentialSavingsHigh}+`,
    '',
    `Designed to save more than ${formatPrice(CONFIG.products.smartCart.priceUsd)} before checkout.`,
    '',
    `Need a refund? Within 24 hours of purchase, reply to this email or write hello@alderprojects.com — we refund liberally.`,
  ].join('\n')
}

function renderSmartCartReceiptBody(cart: SmartCartOutput): string {
  const url = `https://alderprojects.com/smart-cart/result/${cart.cartId}`
  return [
    `Your Smart Cart for ${cart.scopeLabel} is ready.`,
    '',
    `View it for the next 30 days at:`,
    url,
    '',
    `Lean cart total: $${cart.leanCart.totalLow}–$${cart.leanCart.totalHigh}`,
    `Potential savings vs common overbuy: $${cart.savings.potentialSavingsLow}–$${cart.savings.potentialSavingsHigh}+`,
    '',
    `Designed to save more than ${formatPrice(CONFIG.products.smartCart.priceUsd)} before checkout.`,
    '',
    `Need a refund? Within 24 hours of purchase, reply to this email or write hello@alderprojects.com — we refund liberally.`,
  ].join('\n')
}

function renderWorthItDeliveryBody(plan: WorthItOutput, planUrl: string): string {
  return [
    `Your Worth-It Plan for ${plan.scopeLabel} is ready.`,
    '',
    `Plan code: ${plan.planCode}`,
    `Magic link: ${planUrl}`,
    '',
    `Save the magic link — it unlocks your saved dashboard from any device, no account needed. The plan code plus the last 4 characters of this email also work as a backup recovery method.`,
    '',
    `Best path: ${plan.bestPath.title}`,
    plan.bestPath.description,
    '',
    `${plan.thisSaturday.length} Saturday-friendly moves are ranked at the top of the dashboard.`,
    '',
    `Need a refund? Within 7 days of purchase, reply to this email or write hello@alderprojects.com.`,
  ].join('\n')
}

function buildPlanUrl(plan: WorthItOutput): string {
  return `https://alderprojects.com/worth-it/dashboard/${plan.planCode}?token=${plan.privateToken}`
}

// ---------- Queue inspection (admin) --------------------------------

export async function listQueuedEmails(): Promise<EmailEnvelope[]> {
  const ids = (await kv.get<string[]>(EMAIL_INDEX_KEY)) ?? []
  const envs = await Promise.all(
    ids.map(id => kv.get<EmailEnvelope>(`${EMAIL_QUEUE_PREFIX}:${id}`)),
  )
  return envs.filter((e): e is EmailEnvelope => Boolean(e))
}

export async function markEmailSent(id: string): Promise<void> {
  const e = await kv.get<EmailEnvelope>(`${EMAIL_QUEUE_PREFIX}:${id}`)
  if (!e) return
  e.status = 'sent'
  e.sentAt = new Date().toISOString()
  await kv.set(`${EMAIL_QUEUE_PREFIX}:${id}`, e)
}

export async function markEmailFailed(id: string, error: string): Promise<void> {
  const e = await kv.get<EmailEnvelope>(`${EMAIL_QUEUE_PREFIX}:${id}`)
  if (!e) return
  e.status = 'failed'
  e.attempts += 1
  e.error = error
  await kv.set(`${EMAIL_QUEUE_PREFIX}:${id}`, e)
}
