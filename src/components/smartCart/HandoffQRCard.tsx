'use client'

/**
 * v7.3.4-PR3.8 — Shared desktop->mobile QR handoff card.
 *
 * Lifted from src/app/project-read/home/HandoffQR.tsx so the same
 * component renders both on the free-beta /project-read/home page AND
 * inside the Smart Cart CurationModal's PhotoPanel (where it was
 * missing — PR3.7 retest surfaced "no ability on desktop to upload
 * with mobile" inside the modal).
 *
 * The QR encodes a single-use 5-minute token that, when redeemed by
 * the phone via /handoff/[token], sets the mobile's alder_anon_id
 * cookie to match the desktop's. From that point both devices share
 * the same anon session — photos uploaded from phone write under the
 * desktop's anon, and the desktop session polls /api/photos/preview
 * to detect when those photos arrive (caller does the polling).
 *
 * Two visual variants:
 *   - 'page'  — full-width card with copy, used on /project-read/home
 *   - 'panel' — compact, used inside the modal where space is tight
 *
 * Hidden on mobile viewports (Tailwind md:flex hidden on the wrapper)
 * since mobile users would scan their own QR — nonsensical.
 */

import { useEffect, useState } from 'react'

type State =
  | { stage: 'loading' }
  | { stage: 'ready'; qrDataUrl: string; url: string; expiresAt: string }
  | { stage: 'error' }

export interface HandoffQRCardProps {
  /** 'page' (default, used on /project-read/home) or 'panel' (compact). */
  variant?: 'page' | 'panel'
  /** Copy that appears under "Continue on your phone?" — varies by surface. */
  subtitle?: string
}

export function HandoffQRCard({
  variant = 'page',
  subtitle,
}: HandoffQRCardProps) {
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

  if (state.stage === 'error') return null

  const wrapperClass =
    variant === 'panel'
      ? 'mb-4 hidden rounded-lg border border-gray-200 bg-gray-50 p-3 md:flex md:items-start md:gap-3'
      : 'mb-6 hidden rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex md:items-center md:gap-4'

  const qrSize = variant === 'panel' ? 'h-24 w-24' : 'h-32 w-32'
  const headingClass =
    variant === 'panel'
      ? 'text-sm font-medium text-gray-900'
      : 'font-medium text-gray-900'
  const bodyClass =
    variant === 'panel'
      ? 'mt-1 text-xs text-gray-600'
      : 'mt-1 text-sm text-gray-600'

  const defaultSubtitle =
    'Open your phone camera, point it at this code. The link lasts 5 minutes and works once. Photos land back here automatically.'

  return (
    <aside className={wrapperClass}>
      <div className={`flex shrink-0 items-center justify-center rounded border border-gray-200 bg-white p-1 ${qrSize}`}>
        {state.stage === 'ready' ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={state.qrDataUrl}
            alt="Scan this QR code to continue on your phone"
            className="h-full w-full"
          />
        ) : (
          <span className="text-xs text-gray-400">Generating…</span>
        )}
      </div>
      <div className="flex-1">
        <h3 className={headingClass}>Continue on your phone?</h3>
        <p className={bodyClass}>{subtitle ?? defaultSubtitle}</p>
      </div>
    </aside>
  )
}
