/**
 * v7.3.3-C-PR1 Photo Reader landing page.
 *
 * Originally basement-only (v7.3.3-B). PR1 opens the funnel — the same
 * upload pipeline now accepts photos of anything around the home and
 * extracts an open feature array. The URL stays /project-read/basement
 * because the Reddit beta cohort already has the link; v7.3.4+ will
 * fork a /project-read/photo route as a cleaner entry.
 *
 * Anonymous-friendly entry — middleware mints alder_anon_id on this
 * page load, then the embedded uploader posts photos under that anon
 * id.
 *
 * v7.3.3-B1/B2: desktop -> mobile QR handoff via the HandoffQR client
 * component. The QR is fetched client-side from /api/visitor/handoff
 * because the middleware-set cookie isn't visible to a server component
 * in the same request.
 *
 * Free during beta. Normally $19.99 (pricing copy lives ONLY here per
 * v7.3.3 architecture decision — no other page repeats the price).
 */

import type { Metadata } from 'next'
import { BasementUploader } from './BasementUploader'
import { HandoffQR } from './HandoffQR'

export const metadata: Metadata = {
  title: 'Home Photo Read — Alder',
  description:
    'Send 1-5 photos of any part of your home. Alder reads them and tells you what to buy, what to skip, what to wait on, and when to call a pro.',
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
          Send photos of anything around your home — basement, kitchen, deck,
          roof, electrical panel. Alder reads them and tells you what to buy,
          what to skip, what to wait on, and when to call a pro.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Free during beta · normally $19.99
        </p>
      </header>

      <HandoffQR />

      <BasementUploader />
    </main>
  )
}
