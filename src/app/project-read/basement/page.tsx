/**
 * v7.3.3-B Basement Photo Reader landing page.
 *
 * Anonymous-friendly entry — middleware mints alder_anon_id on this
 * page load, then the embedded BasementUploader posts photos under
 * that anon id.
 *
 * v7.3.3-B1 added: server issues a short-lived handoff token + renders
 * a QR code so a desktop visitor can continue on mobile under the same
 * anon session. QR is shown only on desktop viewports.
 *
 * Free during beta. Normally $19.99 (pricing copy lives ONLY here per
 * v7.3.3 architecture decision — no other page repeats the price).
 */

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import QRCode from 'qrcode'
import { ensureVisitorSession } from '@/lib/visitor/session'
import { issueHandoffToken } from '@/lib/visitor/handoff'
import { BasementUploader } from './BasementUploader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Basement Moisture Read — Alder',
  description:
    'Send 1-5 photos of your basement. Alder reads them and tells you what to buy, what to skip, what to wait on, and when to call a pro.',
}

async function buildHandoff(baseUrl: string): Promise<{ qrDataUrl: string; url: string } | null> {
  const anonId = cookies().get('alder_anon_id')?.value
  if (!anonId) return null

  // Ensure the VisitorSession row exists so the mobile redemption
  // doesn't create one twice. ensureVisitorSession is idempotent.
  await ensureVisitorSession({ firstSource: 'basement_landing' })

  const { rawToken } = await issueHandoffToken(anonId)
  const url = `${baseUrl}/handoff/${rawToken}`
  // Inline data URL — no extra request, no CDN dep, works in the SSR HTML.
  const qrDataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 240,
    color: { dark: '#111827', light: '#ffffff' },
  })
  return { qrDataUrl, url }
}

export default async function BasementReadPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://alderprojects.com'
  const handoff = await buildHandoff(baseUrl)

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

      {handoff && (
        <aside className="mb-6 hidden rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex md:items-center md:gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={handoff.qrDataUrl}
            alt="Scan this QR code to continue on your phone"
            className="h-32 w-32 rounded border border-gray-200 bg-white p-1"
          />
          <div className="flex-1">
            <h2 className="font-medium text-gray-900">Continue on your phone?</h2>
            <p className="mt-1 text-sm text-gray-600">
              Open your phone camera, point it at this code. The link lasts 5 minutes and works once.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Your basement photos will land in the same read on this page.
            </p>
          </div>
        </aside>
      )}

      <BasementUploader />
    </main>
  )
}
