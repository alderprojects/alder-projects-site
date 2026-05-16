/**
 * Prisma client singleton.
 *
 * In Next.js dev mode the module graph reloads on every change. Without
 * a singleton, each reload spawns a new PrismaClient that opens its own
 * Postgres connections — Neon's connection limit gets hit within minutes.
 *
 * The cached-on-globalThis pattern is the Prisma-recommended workaround.
 * Production never hits this branch (single process, no HMR).
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
