'use client'

/**
 * v7.4.1b/v7.4.2b — The Alder Check entry point (used on `/` and `/check`).
 *
 * Fewest-clicks rules:
 *  - Mobile: ONE tap — the button opens the camera/photo picker directly
 *    (hidden <input type="file" accept="image/*" capture="environment">).
 *  - Desktop: same button + drag-and-drop + an always-visible QR (reuses
 *    the v7.3.3 handoff-token infra, dest=check). Scan → phone shares the
 *    desktop's anon session → photos upload from the phone → THIS
 *    component polls /api/report/latest and renders the finished report
 *    in place on the desktop. Zero extra clicks on either device.
 *
 * The heavy flow bundle stays lazy — imported on first file selection
 * or when a polled report arrives.
 */

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { fireFunnel } from '@/lib/check/funnel'

const CheckFlow = lazy(() => import('./CheckFlow'))

type HandoffState =
  | { stage: 'idle' }
  | { stage: 'ready'; qrDataUrl: string; url: string; expiresAt: string; issuedAt: string }
  | { stage: 'error' }

const POLL_MS = 5000
const POLL_MAX_MS = 30 * 60 * 1000

export default function CheckCta() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[] | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [polledReport, setPolledReport] = useState<any | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [handoff, setHandoff] = useState<HandoffState>({ stage: 'idle' })
  const heroFired = useRef(false)
  const pollStop = useRef(false)

  useEffect(() => {
    if (!heroFired.current) {
      heroFired.current = true
      fireFunnel('HOME_HERO_VIEWED')
    }
  }, [])

  // ── QR handoff (desktop only — the wrapper is hidden on mobile) ────
  const loadQr = useCallback(async () => {
    try {
      const res = await fetch('/api/visitor/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dest: 'check' }),
      })
      const json = await res.json()
      if (json.ok && json.qrDataUrl) {
        setHandoff({
          stage: 'ready',
          qrDataUrl: json.qrDataUrl,
          url: json.url,
          expiresAt: json.expiresAt,
          issuedAt: new Date().toISOString(),
        })
      } else {
        setHandoff({ stage: 'error' })
      }
    } catch {
      setHandoff({ stage: 'error' })
    }
  }, [])

  useEffect(() => {
    // Only bother issuing a token on viewports where the QR renders.
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      void loadQr()
    }
  }, [loadQr])

  // Auto-refresh the QR just before its 5-minute expiry.
  useEffect(() => {
    if (handoff.stage !== 'ready') return
    const ms = new Date(handoff.expiresAt).getTime() - Date.now() - 15_000
    const t = setTimeout(() => void loadQr(), Math.max(ms, 30_000))
    return () => clearTimeout(t)
  }, [handoff, loadQr])

  // Poll for a report created by the phone half of the handoff.
  useEffect(() => {
    if (handoff.stage !== 'ready' || files || polledReport) return
    pollStop.current = false
    const startedAt = Date.now()
    const since = handoff.issuedAt
    const timer = setInterval(async () => {
      if (pollStop.current || Date.now() - startedAt > POLL_MAX_MS) {
        clearInterval(timer)
        return
      }
      try {
        const res = await fetch(`/api/report/latest?after=${encodeURIComponent(since)}`)
        const json = await res.json()
        if (json.ok && json.found) {
          pollStop.current = true
          clearInterval(timer)
          setPolledReport(json)
        }
      } catch {
        /* transient — keep polling */
      }
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [handoff, files, polledReport])

  const onPick = useCallback(() => {
    fireFunnel('HOME_CTA_TAPPED', { method: 'button' })
    inputRef.current?.click()
  }, [])

  const onFiles = useCallback((list: FileList | File[] | null) => {
    const picked = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'))
    if (picked.length > 0) {
      pollStop.current = true
      setFiles(picked.slice(0, 5))
    }
  }, [])

  if (files || polledReport) {
    return (
      <Suspense
        fallback={
          <div style={{ padding: 32, textAlign: 'center', color: 'rgba(34,48,31,0.68)', fontSize: 15 }}>
            {files ? 'Getting your photos ready…' : 'Loading your report…'}
          </div>
        }
      >
        {files ? <CheckFlow initialFiles={files} /> : <CheckFlow initialReport={polledReport} />}
      </Suspense>
    )
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <button
        onClick={onPick}
        style={{
          background: '#1f3d2b',
          color: '#f6f2e8',
          border: 'none',
          borderRadius: 10,
          padding: '16px 34px',
          fontSize: 18,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(31,61,43,0.25)',
        }}
      >
        Get My Free Alder Check
      </button>

      {/* Desktop: drop zone + QR side by side. Mobile: neither (the
          button already opens the camera — nothing else needed). */}
      <div className="hidden md:flex" style={{ gap: 14, justifyContent: 'center', alignItems: 'stretch', marginTop: 14, flexWrap: 'wrap' }}>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            fireFunnel('HOME_CTA_TAPPED', { method: 'drop' })
            onFiles(e.dataTransfer.files)
          }}
          style={{
            border: `2px dashed ${dragOver ? '#b08d2f' : 'rgba(31,61,43,0.25)'}`,
            borderRadius: 12,
            padding: '18px 16px',
            fontSize: 14,
            color: 'rgba(34,48,31,0.6)',
            background: dragOver ? 'rgba(176,141,47,0.08)' : 'transparent',
            flex: '1 1 240px',
            maxWidth: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          …or drag photos here. 1–5 photos of any room. Free. No account required.
        </div>

        {handoff.stage === 'ready' && (
          <div
            style={{
              border: '1px solid rgba(31,61,43,0.15)',
              borderRadius: 12,
              padding: '12px 16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              maxWidth: 320,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={handoff.qrDataUrl} alt="Scan to continue on your phone" width={96} height={96} style={{ borderRadius: 6 }} />
            <div style={{ textAlign: 'left', fontSize: 13, color: 'rgba(34,48,31,0.75)', lineHeight: 1.45 }}>
              <strong style={{ color: '#1f3d2b', display: 'block', fontSize: 13.5 }}>Photos on your phone?</strong>
              Scan with your camera — shoot and upload from the phone, and your report appears right here.
            </div>
          </div>
        )}
      </div>

      {/* Mobile hint line (desktop shows the drop zone instead) */}
      <p className="md:hidden" style={{ marginTop: 12, fontSize: 13.5, color: 'rgba(34,48,31,0.6)' }}>
        One tap opens your camera. 1–5 photos of any room. Free. No account required.
      </p>
    </div>
  )
}
