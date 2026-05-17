/**
 * v7.3.3-B Basement Photo Reader landing page.
 *
 * Anonymous-friendly entry — middleware mints alder_anon_id on this
 * page load, then the embedded BasementUploader posts photos under
 * that anon id.
 *
 * Free during beta. Normally $19.99 (pricing copy lives ONLY here per
 * v7.3.3 architecture decision — no other page repeats the price).
 */

import type { Metadata } from 'next'
import { BasementUploader } from './BasementUploader'

export const metadata: Metadata = {
  title: 'Basement Moisture Read — Alder',
  description:
    'Send 1-5 photos of your basement. Alder reads them and tells you what to buy, what to skip, what to wait on, and when to call a pro.',
}

export default function BasementReadPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-wide text-emerald-700">
          Beta · Vermont
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Basement moisture read
        </h1>
        <p className="mt-3 text-lg text-gray-700">
          Send photos of one basement. Alder reads them and tells you what to buy,
          what to skip, what to wait on, and when to call a pro.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Free during beta · normally $19.99
        </p>
      </header>

      <BasementUploader />
    </main>
  )
}
