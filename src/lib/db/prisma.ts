/**
 * Re-export of the Prisma singleton for the v7.3.3 import path convention.
 *
 * v7.3.2 ships the singleton at @/lib/db. The v7.3.3 prompt expects it at
 * @/lib/db/prisma. Both paths now point at the same instance — no second
 * client is constructed.
 */
export { prisma } from '@/lib/db'
