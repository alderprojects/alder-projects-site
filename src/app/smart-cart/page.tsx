// V7 — Smart Cart pre-sale page.

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SmartCartPreSaleHero from '@/components/smartCart/SmartCartPreSaleHero'
import CurationModal from '@/components/CurationModal'

export const metadata: Metadata = {
  title: 'Smart Cart — Buy this. Skip that. — Alder Projects',
  description:
    "Alder builds the lean cart for your project so you avoid redundant products, tempting kits, and expensive mistakes. $19, one-time, no subscription.",
  alternates: { canonical: 'https://alderprojects.com/smart-cart' },
  openGraph: {
    title: 'Smart Cart — Alder Projects',
    description: 'Buy this + this. Skip that. Designed to save more than $19 before checkout.',
    url: 'https://alderprojects.com/smart-cart',
  },
  robots: { index: true, follow: true },
}

export default function SmartCartPreSalePage() {
  return (
    <main className="min-h-screen bg-[#fbf8f1]">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <SmartCartPreSaleHero />

        {/* Testimonial slot — placeholder until real testimonials land */}
        <section className="mt-10 grid md:grid-cols-2 gap-6">
          <TestimonialSkeleton />
          <TrustNote />
        </section>
      </div>
      <CurationModal />
      <Footer />
    </main>
  )
}

function TestimonialSkeleton() {
  return (
    <aside className="bg-white border border-[#e8e3d4] rounded-xl p-6 text-sm text-[#1a1f1a]/75">
      <p>
        Real homeowner reviews land here once the first 30 buyers have lived
        with their carts. We do not fabricate testimonials.
      </p>
    </aside>
  )
}

function TrustNote() {
  return (
    <aside className="bg-[#f5efe2] border border-[#e8e3d4] rounded-xl p-6 text-sm text-[#1a1f1a]/85">
      <h4 className="font-display text-lg mb-2 text-[#1f3a2e]">Why a Smart Cart?</h4>
      <p>
        Most home-improvement projects do not lose money on the big purchase.
        They lose money on the cart at the register: the bundled kit you did not
        need, the bulk pack of pulls you will not use, the $280 thermostat
        bought before air-sealing. Alder writes the lean cart for the actual
        project shape so the obvious upsells go in the skip column.
      </p>
    </aside>
  )
}
