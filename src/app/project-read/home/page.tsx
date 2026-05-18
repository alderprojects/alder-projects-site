/**
 * v7.3.4-PR3.7 Home Photo Reader landing page.
 *
 * Canonical URL: /project-read/home (renamed from /project-read/basement
 * in PR3.7). The basement URL still works via a 301 redirect set in
 * next.config.js — Reddit cohort bookmarks stay live.
 *
 * The page accepts photos of any part of the home (basement, kitchen,
 * deck, roof, electrical panel, exterior, attic, garage). Server-side
 * open extraction decides what's in each photo; downstream synthesis
 * grounds recommendations only in the features the extraction
 * surfaced (PR3.7 §1.3 allow-list discipline).
 *
 * v7.3.3-B1/B2: desktop -> mobile QR handoff via the HandoffQR client
 * component. The QR is fetched client-side from /api/visitor/handoff
 * because the middleware-set cookie isn't visible to a server component
 * in the same request. PR3.7 §1.9 extended the handoff to bidirectional
 * so the result renders on whichever device the user returns to.
 *
 * Free during beta. Normally $19.99 (pricing copy lives ONLY here per
 * v7.3.3 architecture decision — no other page repeats the price).
 */

import type { Metadata } from 'next'
import { PhotoUploader } from './PhotoUploader'
import { HandoffQRCard } from '@/components/smartCart/HandoffQRCard'

// PR3.9 Bug #2: PhotoUploader uses useSearchParams() to read
// ?source=handoff (mobile session arrived via desktop QR). That hook
// forces the page out of static generation. Mark dynamic so Next
// doesn't try to prerender.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Home Photo Read — Alder',
  description:
    'Send photos of anything around your home. Alder reads them and tells you what to buy, what to skip, and what to wait on.',
}

export default function PhotoReadPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-wide text-emerald-700">
          Beta · Vermont
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Home photo read
        </h1>
        <p className="mt-3 text-lg text-gray-700">
          Send photos of anything around your home. Alder reads them and tells
          you what to buy, what to skip, and what to wait on.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Free during beta · normally $19.99
        </p>
      </header>

      <HandoffQRCard variant="page" />

      <PhotoUploader />
    </main>
  )
}
