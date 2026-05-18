'use client'

/**
 * Client-side QR rendering for the desktop -> mobile session handoff.
 *
 * Lives client-side because middleware sets the alder_anon_id cookie
 * on the OUTGOING response — server components read INCOMING request
 * cookies and would see nothing on first visit. By rendering as a
 * client effect, we guarantee the browser has the cookie before the
 * fetch fires.
 *
 * Hidden on mobile viewports (md:flex hidden on the wrapper).
 */

import { useEffect, useState } from 'react'

type State =
  | { stage: 'loading' }
  | { stage: 'ready'; qrDataUrl: string; url: string; expiresAt: string }
  | { stage: 'error' }

export function HandoffQR() {
  const [state, setState] = useState<State>({ stage: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/visitor/handoff', { method: 'POST' })
        if (!res.ok) throw new Error('handoff_failed')
        const json = (await res.json()) as {
          ok: boolean
          qrDataUrl?: string
          url?: string
          expiresAt?: string
        }
        if (cancelled) return
        if (json.ok && json.qrDataUrl && json.url && json.expiresAt) {
          setState({
            stage: 'ready',
            qrDataUrl: json.qrDataUrl,
            url: json.url,
            expiresAt: json.expiresAt,
          })
        } else {
          setState({ stage: 'error' })
        }
      } catch {
        if (!cancelled) setState({ stage: 'error' })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Hide entirely if error — degrade gracefully
  if (state.stage === 'error') return null

  return (
    <aside className="mb-6 hidden rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex md:items-center md:gap-4">
      <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded border border-gray-200 bg-white p-1">
        {state.stage === 'ready' ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={state.qrDataUrl} alt="Scan this QR code to continue on your phone" className="h-full w-full" />
        ) : (
          <span className="text-xs text-gray-400">Generating…</span>
        )}
      </div>
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
  )
}
