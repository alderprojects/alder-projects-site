// v7.2.13 — Durable buyer event log for analytics.
//
// Smart Cart records in KV expire after 30 days, so they can't power
// "what did buyers do last quarter" questions. This module is the
// always-on append log: lightweight events keyed by month, never deleted,
// queryable by topic / scope / email-hash for the admin analytics view.
//
// All buyer email is hashed before storage. Plaintext email stays only
// on the cart record itself (which expires).

import { kv } from '@vercel/kv'
import { createHash, randomBytes } from 'crypto'

export type BuyerEventType =
  | 'cart_created'
  | 'cart_refunded'
  | 'cart_selection_finalized'
  | 'cart_payment_attempt'
  | 'cart_payment_failed'

export interface BuyerEvent {
  eventId: string
  eventType: BuyerEventType
  cartId: string
  customerEmailHash: string
  topic: string
  scopeVariantId: string
  scenario: string
  town: string | null
  townTier: string | null
  fee: number
  leanCartLow: number
  leanCartHigh: number
  avoidedSpendLow: number
  avoidedSpendHigh: number
  selectedSlotCount: number | null
  totalSlotCount: number
  refundReason: string | null
  refundedAt: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  referrer: string | null
  sessionId: string | null
  createdAt: string
}

export function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

function eventId(): string {
  return `evt_${Date.now().toString(36)}_${randomBytes(6).toString('hex')}`
}

function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export async function logBuyerEvent(
  event: Omit<BuyerEvent, 'eventId' | 'createdAt'> & { createdAt?: string },
): Promise<void> {
  const fullEvent: BuyerEvent = {
    eventId: eventId(),
    createdAt: event.createdAt ?? new Date().toISOString(),
    ...event,
  }

  const month = event.createdAt
    ? monthKey(new Date(event.createdAt))
    : monthKey()

  await kv.lpush(`buyer_events:${month}`, JSON.stringify(fullEvent))
  await kv.lpush(`cart_email:${event.customerEmailHash}`, event.cartId)
  await kv.lpush(`cart_topic:${event.topic}:${month}`, event.cartId)
  await kv.lpush(`cart_scope:${event.scopeVariantId}:${month}`, event.cartId)
}

export async function getEventsForMonth(month: string): Promise<BuyerEvent[]> {
  const raw = await kv.lrange(`buyer_events:${month}`, 0, -1)
  if (!Array.isArray(raw)) return []
  const events: BuyerEvent[] = []
  for (const item of raw) {
    try {
      const parsed = typeof item === 'string' ? JSON.parse(item) : item
      events.push(parsed as BuyerEvent)
    } catch {}
  }
  return events
}

export async function getCartIdsForEmail(email: string): Promise<string[]> {
  const hash = hashEmail(email)
  const result = await kv.lrange(`cart_email:${hash}`, 0, -1)
  return Array.isArray(result) ? (result as string[]) : []
}

export async function getEventsForRange(
  fromMonth: string,
  toMonth: string,
): Promise<BuyerEvent[]> {
  const [fy, fm] = fromMonth.split('-').map(Number)
  const [ty, tm] = toMonth.split('-').map(Number)
  const months: string[] = []
  let y = fy
  let m = fm
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }

  const allEvents: BuyerEvent[] = []
  for (const month of months) {
    const events = await getEventsForMonth(month)
    allEvents.push(...events)
  }
  return allEvents
}

export interface AggregatedStats {
  totalCarts: number
  totalRevenue: number
  refundedCarts: number
  refundRate: number
  byTopic: Record<string, { count: number; revenue: number; refunded: number }>
  byScope: Record<string, { count: number; revenue: number; refunded: number }>
  byMonth: Record<string, { count: number; revenue: number; refunded: number }>
  byUtmSource: Record<string, { count: number; revenue: number }>
  refundReasons: Record<string, number>
  topTowns: Array<{ town: string; count: number }>
  uniqueBuyers: number
  repeatBuyers: number
}

export function aggregateEvents(events: BuyerEvent[]): AggregatedStats {
  const stats: AggregatedStats = {
    totalCarts: 0,
    totalRevenue: 0,
    refundedCarts: 0,
    refundRate: 0,
    byTopic: {},
    byScope: {},
    byMonth: {},
    byUtmSource: {},
    refundReasons: {},
    topTowns: [],
    uniqueBuyers: 0,
    repeatBuyers: 0,
  }

  const cartCreations = events.filter(e => e.eventType === 'cart_created')
  const refunds = events.filter(e => e.eventType === 'cart_refunded')
  const refundedCartIds = new Set(refunds.map(r => r.cartId))

  const buyerCartCounts: Record<string, number> = {}
  const townCounts: Record<string, number> = {}

  for (const e of cartCreations) {
    stats.totalCarts += 1
    stats.totalRevenue += e.fee
    const isRefunded = refundedCartIds.has(e.cartId)
    if (isRefunded) stats.refundedCarts += 1

    const t = stats.byTopic[e.topic] ?? { count: 0, revenue: 0, refunded: 0 }
    t.count += 1
    t.revenue += e.fee
    if (isRefunded) t.refunded += 1
    stats.byTopic[e.topic] = t

    const s = stats.byScope[e.scopeVariantId] ?? { count: 0, revenue: 0, refunded: 0 }
    s.count += 1
    s.revenue += e.fee
    if (isRefunded) s.refunded += 1
    stats.byScope[e.scopeVariantId] = s

    const month = e.createdAt.slice(0, 7)
    const m = stats.byMonth[month] ?? { count: 0, revenue: 0, refunded: 0 }
    m.count += 1
    m.revenue += e.fee
    if (isRefunded) m.refunded += 1
    stats.byMonth[month] = m

    const utm = e.utmSource ?? '(direct)'
    const u = stats.byUtmSource[utm] ?? { count: 0, revenue: 0 }
    u.count += 1
    u.revenue += e.fee
    stats.byUtmSource[utm] = u

    buyerCartCounts[e.customerEmailHash] = (buyerCartCounts[e.customerEmailHash] ?? 0) + 1

    if (e.town) {
      townCounts[e.town] = (townCounts[e.town] ?? 0) + 1
    }
  }

  for (const r of refunds) {
    const reason = r.refundReason ?? '(no reason given)'
    stats.refundReasons[reason] = (stats.refundReasons[reason] ?? 0) + 1
  }

  stats.refundRate = stats.totalCarts === 0 ? 0 : stats.refundedCarts / stats.totalCarts
  stats.uniqueBuyers = Object.keys(buyerCartCounts).length
  stats.repeatBuyers = Object.values(buyerCartCounts).filter(c => c > 1).length

  stats.topTowns = Object.entries(townCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([town, count]) => ({ town, count }))

  return stats
}
