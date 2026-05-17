/**
 * v7.3.3-B Basement Read result page.
 *
 * Server component: validates ownership (anon-cookie match), fetches
 * SmartCart row, hands off to client ResultView for rendering.
 *
 * Robots: noindex/nofollow. These are private reads with personal home
 * photos. Canonical points to the category landing, not this result.
 *
 * Ownership: anon visitors see their own carts via the alder_anon_id
 * cookie. Owner mismatch returns 404 (not 403) to avoid leaking
 * existence of other visitors' reads.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { ResultView } from './ResultView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your basement read · Alder',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://alderprojects.com/project-read/basement',
  },
}

interface PageProps {
  params: { cartId: string }
}

export default async function ResultPage({ params }: PageProps) {
  const { cartId } = params
  const anonId = cookies().get('alder_anon_id')?.value

  const cart = await prisma.smartCart.findUnique({
    where: { id: cartId },
    include: { project: true },
  })
  if (!cart) notFound()

  // Owner check — anon visitor must own the cart (or, eventually, the
  // user must own it via claim — v7.3.3-C reassigns visitorAnonId to
  // null + sets userId). Don't leak existence on mismatch.
  const ownedByAnon = !!anonId && cart.visitorAnonId === anonId
  if (!ownedByAnon) notFound()

  return <ResultView cart={cart} />
}
