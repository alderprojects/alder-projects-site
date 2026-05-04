// V7.1 — Smart Cart pre-sale page (rebuilt around intent selector).

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CurationModal from '@/components/CurationModal'
import SalesPageClient from '@/components/intent/SalesPageClient'

export const metadata: Metadata = {
  title: 'Smart Cart — Buy this. Skip that. — Alder Projects',
  description:
    "Alder builds the lean cart for your project so you avoid redundant products, tempting kits, and expensive mistakes. $19.99, one-time, no subscription.",
  alternates: { canonical: 'https://alderprojects.com/smart-cart' },
  openGraph: {
    title: 'Smart Cart — Alder Projects',
    description: 'Buy this + this. Skip that. Designed to save more than $19.99 before checkout.',
    url: 'https://alderprojects.com/smart-cart',
  },
  robots: { index: true, follow: true },
}

export default function SmartCartPreSalePage() {
  return (
    <>
      <Nav />
      <SalesPageClient product="smart_cart" />
      <CurationModal />
      <Footer />
    </>
  )
}
