// V7.1 — Worth-It Plan pre-sale page (rebuilt around decision selector).

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CurationModal from '@/components/CurationModal'
import SalesPageClient from '@/components/intent/SalesPageClient'

export const metadata: Metadata = {
  title: 'Worth-It Plan — DIY, hire, or hold? — Alder Projects',
  description:
    "Alder ranks the highest-payoff path for your project, shows what to skip, and gives you the next move based on your property, budget, and goal. $39.99, one-time, no subscription.",
  alternates: { canonical: 'https://alderprojects.com/worth-it' },
  openGraph: {
    title: 'Worth-It Plan — Alder Projects',
    description:
      "Ranked moves. Alternate paths. Saturday plan. DIY stop line. Optional reminders. $39.99 one-time.",
    url: 'https://alderprojects.com/worth-it',
  },
  robots: { index: true, follow: true },
}

export default function WorthItPreSalePage() {
  return (
    <>
      <Nav />
      <SalesPageClient product="worth_it" />
      <CurationModal />
      <Footer />
    </>
  )
}
