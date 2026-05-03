// Vercel KV-backed persistence layer for V7 Smart Cart and Worth-It
// Plan. Two key spaces because data needs differ:
//
//   smartcart:<cartId>             — read-only, 30-day TTL
//   plan:<planCode>                — persistent, no TTL
//   email:<emailHash>              — list of planCodes for a given email
//   pending:smartcart:<cartId>     — 30-min holding pending Stripe webhook
//   pending:plan:<planCode>        — 30-min holding pending Stripe webhook
//   events:<planCode>              — append-only event log (capped 100)
//   leadintents                   — append-only signal capture for V8
//
// Required environment variables:
//   KV_REST_API_URL
//   KV_REST_API_TOKEN
//
// Vercel auto-injects these when a KV instance is bound to the project.

import { kv } from '@vercel/kv'
import { createHash } from 'crypto'
import type { SmartCartOutput } from './buildSmartCart'
import type { WorthItOutput } from './buildWorthItPlan'

// ---------- Plan state -----------------------------------------------

export type PlanState = {
  selectedPath: string
  checkedTaskIds: string[]
  savedMoveIds: string[]
  dismissedMoveIds: string[]
  reminderPreferences: {
    friday: boolean
    saturday_morning: boolean
    sunday_followup: boolean
  }
  shareCount: number
  pdfDownloaded: boolean
  checklistStarted: boolean
  checklistCompleted: boolean
  lastOpenedAt: string
  savedPunchList?: { taskIds: string[]; whenSaved: string; timing?: string }
}

export function defaultPlanState(): PlanState {
  return {
    selectedPath: 'best_overall',
    checkedTaskIds: [],
    savedMoveIds: [],
    dismissedMoveIds: [],
    reminderPreferences: {
      friday: false,
      saturday_morning: false,
      sunday_followup: false,
    },
    shareCount: 0,
    pdfDownloaded: false,
    checklistStarted: false,
    checklistCompleted: false,
    lastOpenedAt: new Date().toISOString(),
  }
}

// ---------- Lead intents (V8 bridge) ---------------------------------

export type LeadIntentType =
  | 'handyman_bundle'
  | 'contractor_needed'
  | 'project_grew'
  | 'product_affiliate'
  | 'chat_followup'

export type LeadIntent = {
  id: string
  planCode?: string
  cartId?: string
  leadType: LeadIntentType
  trigger: string
  tasksJson?: object
  location?: { town?: string; town_tier?: string }
  intentScore: number
  status: 'new' | 'routed' | 'closed'
  createdAt: string
  metadata?: Record<string, unknown>
}

// ---------- Hashing ---------------------------------------------------

export function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

// ---------- Smart Cart -----------------------------------------------

const SMART_CART_TTL_SECONDS = 30 * 24 * 3600
const PENDING_TTL_SECONDS = 30 * 60                  // 30 minutes

export async function savePendingSmartCart(
  cartId: string,
  input: object,
): Promise<void> {
  await kv.set(`pending:smartcart:${cartId}`, input, { ex: PENDING_TTL_SECONDS })
}

export async function getPendingSmartCart(cartId: string): Promise<object | null> {
  const v = await kv.get(`pending:smartcart:${cartId}`)
  return (v as object) ?? null
}

export async function saveSmartCart(cart: SmartCartOutput): Promise<void> {
  await kv.set(`smartcart:${cart.cartId}`, cart, { ex: SMART_CART_TTL_SECONDS })
}

export async function getSmartCart(cartId: string): Promise<SmartCartOutput | null> {
  const v = await kv.get(`smartcart:${cartId}`)
  return (v as SmartCartOutput) ?? null
}

export async function markSmartCartRefunded(cartId: string): Promise<void> {
  const cart = await getSmartCart(cartId)
  if (!cart) return
  cart.refunded = true
  await saveSmartCart(cart)
}

// ---------- Worth-It Plan --------------------------------------------

type PlanRecord = {
  data: WorthItOutput
  state: PlanState
  tokenHash: string
  emailHash: string
}

export async function savePendingWorthItPlan(
  planCode: string,
  input: object,
): Promise<void> {
  await kv.set(`pending:plan:${planCode}`, input, { ex: PENDING_TTL_SECONDS })
}

export async function getPendingWorthItPlan(planCode: string): Promise<object | null> {
  const v = await kv.get(`pending:plan:${planCode}`)
  return (v as object) ?? null
}

export async function saveWorthItPlan(
  plan: WorthItOutput,
  state: PlanState,
): Promise<void> {
  const record: PlanRecord = {
    data: plan,
    state,
    tokenHash: plan.privateTokenHash,
    emailHash: hashEmail(plan.customerEmail),
  }
  await kv.set(`plan:${plan.planCode}`, record)

  // Email index for "Find My Plan" recovery.
  const key = `email:${record.emailHash}`
  const existing = (await kv.get<string[]>(key)) ?? []
  if (!existing.includes(plan.planCode)) {
    await kv.set(key, [...existing, plan.planCode])
  }
}

export async function getWorthItPlan(
  planCode: string,
  token: string,
): Promise<{ data: WorthItOutput; state: PlanState } | null> {
  const record = (await kv.get(`plan:${planCode}`)) as PlanRecord | null
  if (!record) return null
  const computed = createHash('sha256').update(token).digest('hex')
  if (computed !== record.tokenHash) return null
  return { data: record.data, state: record.state }
}

export async function getWorthItPlanByPasscode(
  planCode: string,
  emailLast4: string,
): Promise<{ data: WorthItOutput; state: PlanState } | null> {
  const record = (await kv.get(`plan:${planCode}`)) as PlanRecord | null
  if (!record) return null
  const last4 = record.data.customerEmail.slice(-4).toLowerCase()
  if (last4 !== emailLast4.toLowerCase()) return null
  return { data: record.data, state: record.state }
}

export async function updatePlanState(
  planCode: string,
  token: string,
  patch: Partial<PlanState>,
): Promise<PlanState | null> {
  const record = (await kv.get(`plan:${planCode}`)) as PlanRecord | null
  if (!record) return null
  const computed = createHash('sha256').update(token).digest('hex')
  if (computed !== record.tokenHash) return null
  const next = { ...record.state, ...patch, lastOpenedAt: new Date().toISOString() }
  await kv.set(`plan:${planCode}`, { ...record, state: next })
  return next
}

export async function findPlansByEmail(email: string): Promise<string[]> {
  const key = `email:${hashEmail(email)}`
  return (await kv.get<string[]>(key)) ?? []
}

export async function markWorthItPlanRefunded(planCode: string): Promise<void> {
  const record = (await kv.get(`plan:${planCode}`)) as PlanRecord | null
  if (!record) return
  record.data.refunded = true
  await kv.set(`plan:${planCode}`, record)
}

// ---------- Events (append-only, capped per plan) -------------------

export async function logPlanEvent(
  planCode: string,
  eventType: string,
  metadata: object = {},
): Promise<void> {
  const key = `events:${planCode}`
  const existing = (await kv.get<Array<object>>(key)) ?? []
  const event = {
    eventType,
    metadata,
    at: new Date().toISOString(),
  }
  const next = [...existing, event].slice(-100)       // cap at 100 most recent
  await kv.set(key, next)
}

// ---------- Lead intents (V8 bridge) --------------------------------

export async function createLeadIntent(intent: LeadIntent): Promise<void> {
  const key = 'leadintents'
  const existing = (await kv.get<LeadIntent[]>(key)) ?? []
  await kv.set(key, [...existing, intent].slice(-1000))   // cap at 1000 most recent
}

export async function listLeadIntents(): Promise<LeadIntent[]> {
  return (await kv.get<LeadIntent[]>('leadintents')) ?? []
}

// ---------- Convenience id generator for lead intents ---------------

export function generateLeadIntentId(): string {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
