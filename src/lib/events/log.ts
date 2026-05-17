/**
 * Generic event logger.
 *
 * Thin wrapper around `prisma.eventLog.create` that fills in sensible
 * defaults (eventVersion, occurredAt, source). Use this everywhere
 * instead of calling Prisma directly so the schema's required fields
 * are always populated and the call sites stay readable.
 *
 * The EventLog table is append-only — never update an existing row, only
 * create new ones. State transitions emit a new event each time.
 */

import { prisma } from '@/lib/db'

export type EventSource = 'web' | 'email' | 'admin' | 'system' | 'cron'

export interface LogEventArgs {
  eventType: string
  subjectType?: string
  subjectId?: string
  payload?: Record<string, unknown>
  source?: EventSource
  actorId?: string | null
  anonId?: string | null
  sessionId?: string | null
}

export async function logEvent(args: LogEventArgs): Promise<void> {
  try {
    await prisma.eventLog.create({
      data: {
        eventType: args.eventType,
        eventVersion: 'v1',
        occurredAt: new Date(),
        actorId: args.actorId ?? null,
        anonId: args.anonId ?? null,
        subjectType: args.subjectType ?? null,
        subjectId: args.subjectId ?? null,
        payloadJson: (args.payload ?? {}) as never,
        sessionId: args.sessionId ?? null,
        source: args.source ?? 'web',
      },
    })
  } catch (e) {
    // Event logging failure must never break the calling flow. Surface
    // to console for ops visibility.
    console.error('[logEvent] write failed:', (e as Error).message, args.eventType)
  }
}
