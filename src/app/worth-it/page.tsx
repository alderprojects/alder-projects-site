// V7 — Worth-It Plan pre-sale page.

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WorthItPreSaleHero from '@/components/worthIt/WorthItPreSaleHero'
import CurationModal from '@/components/CurationModal'

export const metadata: Metadata = {
  title: 'Worth-It Plan — Know the best move. The move after that. — Alder Projects',
  description:
    "Alder ranks the highest-payoff DIY moves for your home, shows alternate paths, and keeps your plan saved. $39.99, one-time, no subscription.",
  alternates: { canonical: 'https://alderprojects.com/worth-it' },
  openGraph: {
    title: 'Worth-It Plan — Alder Projects',
    description:
      "Ranked moves. If-you-already-did-that paths. Saturday plan. DIY stop line. Optional reminders. $39.99 one-time.",
    url: 'https://alderprojects.com/worth-it',
  },
  robots: { index: true, follow: true },
}

export default function WorthItPreSalePage() {
  return (
    <main className="min-h-screen bg-[#fbf8f1]">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <WorthItPreSaleHero />

        <section className="mt-10 grid md:grid-cols-2 gap-6">
          <aside className="bg-white border border-[#e8e3d4] rounded-xl p-6 text-sm text-[#1a1f1a]/75">
            <p>
              Real homeowner reviews land here once the first 30 plans have
              shipped. We do not fabricate testimonials.
            </p>
          </aside>
          <aside className="bg-[#f5efe2] border border-[#e8e3d4] rounded-xl p-6 text-sm text-[#1a1f1a]/85">
            <h4 className="font-display text-lg mb-2 text-[#1f3a2e]">
              Why a Worth-It Plan?
            </h4>
            <p>
              Most homeowner advice answers "what should I do?" without ranking
              moves against the actual project shape, the alternate paths if
              the obvious step is already done, or the DIY stop line for your
              property. The Worth-It Plan ships those four answers in one saved
              dashboard, plus a Saturday plan and optional Friday/Saturday/
              Sunday reminders.
            </p>
          </aside>
        </section>
      </div>
      <CurationModal />
      <Footer />
    </main>
  )
}
