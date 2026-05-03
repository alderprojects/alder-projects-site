// V7 — Find My Plan recovery page.

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import FindPlanForm from '@/components/worthIt/FindPlanForm'

export const metadata: Metadata = {
  title: 'Find My Plan — Alder Projects',
  description: 'Recover your Worth-It Plan magic link by email.',
  robots: { index: false, follow: false },
}

export default function FindMyPlanPage() {
  return (
    <main className="min-h-screen bg-[#fbf8f1]">
      <Nav />
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="font-display text-3xl text-[#1f3a2e] mb-2">Find My Plan</h1>
        <p className="text-sm text-[#1a1f1a]/80 mb-8">
          Enter the email you used at purchase. We will email you the magic
          link for any Worth-It Plan tied to that address.
        </p>
        <FindPlanForm />
      </div>
      <Footer />
    </main>
  )
}
