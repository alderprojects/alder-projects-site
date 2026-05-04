// V7.2.1 — Worth-It Plan paused. This page replaces the v7.1 sales
// page with a coming-soon notice + email capture. Existing buyers
// keep dashboard access via /worth-it/dashboard/[planCode]; magic-link
// recovery at /worth-it/find still works.

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'
import WorthItNotifyForm from '@/components/worthIt/WorthItNotifyForm'

export const metadata: Metadata = {
  title: 'Worth-It Plan is being rebuilt — Alder Projects',
  description:
    "Worth-It Plan is paused while we make Smart Cart unbeatable first. Get notified when the new version ships, or build a Smart Cart in the meantime.",
  alternates: { canonical: 'https://alderprojects.com/worth-it' },
  robots: { index: true, follow: true },
}

export default function WorthItPausedPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a]">
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-[#1a1f1a] leading-[1.1] mb-5">
            Worth-It Plan is being rebuilt
          </h1>
          <p className="text-lg text-[#1a1f1a]/85 mb-8 leading-relaxed">
            We&apos;re focused on making Smart Cart unbeatable first.
            Worth-It returns once we&apos;ve earned the upgrade.
          </p>

          <section className="bg-white border border-[#e8e3d4] rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="font-display text-xl text-[#1f3a2e] mb-3">
              Want to know when it&apos;s back?
            </h2>
            <p className="text-sm text-[#1a1f1a]/80 mb-4">
              One email when the new Worth-It Plan ({formatPrice(CONFIG.products.worthIt.priceUsd)}) ships. No
              other list, no spam.
            </p>
            <WorthItNotifyForm />
          </section>

          <aside className="bg-[#1f3a2e] text-white rounded-2xl p-6 md:p-8">
            <div className="text-xs uppercase tracking-wide text-white/70 mb-2">
              In the meantime
            </div>
            <h3 className="font-display text-xl mb-2">
              Need help with a kitchen project right now?
            </h3>
            <p className="text-sm text-white/85 mb-5">
              Smart Cart for kitchen organizers is curated, ranked, and
              ready. {formatPrice(CONFIG.products.smartCart.priceUsd)} one-time.
            </p>
            <a
              href="/smart-cart"
              className="inline-block bg-white text-[#1f3a2e] font-medium px-5 py-3 rounded-lg hover:bg-[#f5efe2]"
            >
              Build a Smart Cart →
            </a>
          </aside>
        </div>
        <Footer />
      </main>
    </>
  )
}
