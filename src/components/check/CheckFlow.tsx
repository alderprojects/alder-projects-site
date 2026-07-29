'use client'

/**
 * v7.4.2f — The Alder Check capture flow: collect photos → explicit
 * submit → full processing screen → redirect to /report/[id] (the
 * canonical report page).
 *
 * Design decisions from live testing (2026-07-27):
 *  - NO auto-continue: users add 1-5 photos at their pace and hit one
 *    clear submit ("Get my Alder Check"). The one-tap promise is about
 *    reaching the camera/picker, not about racing the user.
 *  - Uploads run eagerly in the background as photos are added, so
 *    submit usually only pays for the analysis, not the uploads.
 *  - Processing is a full-panel branded screen (staged copy + animated
 *    verdict chips), then a hard navigation to the report page.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { PALETTE } from './VerdictCard'
import { fireFunnel } from '@/lib/check/funnel'

const CONSENTS = JSON.stringify({
  product_improvement: true,
  valuation_research: true,
  public_content_use: false,
})

const MAX_PHOTOS = 5

type Stage = 'collect' | 'processing' | 'error'

interface Slot {
  id: number
  thumb: string
  status: 'uploading' | 'done' | 'failed'
  snapshotId?: string
}

const PROCESSING_STEPS = [
  'Reading your photos…',
  'Looking at what’s actually there…',
  'Comparing cost and likely benefit…',
  'Checking verified costs and rebates…',
  'Writing your Buy / Skip / Wait plan…',
]

export default function CheckFlow({ initialFiles }: { initialFiles?: File[] }) {
  const [stage, setStage] = useState<Stage>('collect')
  const [slots, setSlots] = useState<Slot[]>([])
  const [context, setContext] = useState('')
  const [zip, setZip] = useState('') // v7.4.7 — optional, never blocking
  const [error, setError] = useState<string | null>(null)
  const [stepIdx, setStepIdx] = useState(0)

  const projectIdRef = useRef<string | null>(null)
  const nextId = useRef(0)
  const startedRef = useRef(false)
  const contextRef = useRef('')
  const zipRef = useRef('')
  const addInputRef = useRef<HTMLInputElement | null>(null)
  contextRef.current = context
  zipRef.current = zip

  const uploadOne = useCallback(async (file: File, slotId: number) => {
    try {
      const form = new FormData()
      form.append('image', file)
      form.append('consents', CONSENTS)
      if (projectIdRef.current) form.append('projectId', projectIdRef.current)
      if (contextRef.current.trim()) form.append('userIntent', contextRef.current.trim().slice(0, 500))
      const res = await fetch('/api/photos/upload', { method: 'POST', body: form })
      const json = (await res.json()) as { ok: boolean; projectId?: string; snapshotId?: string }
      if (json.ok && json.snapshotId) {
        projectIdRef.current = json.projectId ?? projectIdRef.current
        setSlots((s) => s.map((x) => (x.id === slotId ? { ...x, status: 'done', snapshotId: json.snapshotId } : x)))
      } else {
        setSlots((s) => s.map((x) => (x.id === slotId ? { ...x, status: 'failed' } : x)))
      }
    } catch {
      setSlots((s) => s.map((x) => (x.id === slotId ? { ...x, status: 'failed' } : x)))
    }
  }, [])

  const addFiles = useCallback(
    (files: File[]) => {
      setSlots((current) => {
        const room = MAX_PHOTOS - current.length
        const accepted = files.filter((f) => f.type.startsWith('image/')).slice(0, Math.max(0, room))
        const newSlots = accepted.map((f) => {
          const id = nextId.current++
          // fire the eager upload
          void uploadOne(f, id)
          return { id, thumb: URL.createObjectURL(f), status: 'uploading' as const }
        })
        return [...current, ...newSlots]
      })
    },
    [uploadOne]
  )

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const files = initialFiles ?? []
    fireFunnel('PHOTO_UPLOAD_STARTED', { source: 'check_flow', count: files.length })
    fireFunnel('ZIP_PROMPT_SHOWN', { surface: 'upload_form' })
    addFiles(files)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const readyCount = slots.filter((s) => s.status === 'done').length
  const uploadingCount = slots.filter((s) => s.status === 'uploading').length

  const submit = useCallback(async () => {
    setStage('processing')
    setStepIdx(0)
    const ticker = setInterval(() => setStepIdx((i) => Math.min(i + 1, PROCESSING_STEPS.length - 1)), 7000)
    try {
      // Wait briefly for any in-flight uploads (they started eagerly).
      for (let i = 0; i < 60; i++) {
        const stillUploading = await new Promise<number>((r) =>
          setSlots((s) => {
            r(s.filter((x) => x.status === 'uploading').length)
            return s
          })
        )
        if (stillUploading === 0) break
        await new Promise((r) => setTimeout(r, 500))
      }
      const snapshotIds = await new Promise<string[]>((r) =>
        setSlots((s) => {
          r(s.filter((x) => x.snapshotId).map((x) => x.snapshotId as string))
          return s
        })
      )
      if (snapshotIds.length === 0) throw new Error('No photos uploaded successfully — try again.')

      // v7.4.7 — ZIP rides along only when it's a valid 5-digit value;
      // anything else is omitted (optional, never blocking).
      const zipValue = /^\d{5}$/.test(zipRef.current.trim()) ? zipRef.current.trim() : undefined
      const res = await fetch('/api/photos/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotIds: Array.from(new Set(snapshotIds)),
          userPrompt: contextRef.current.trim() || undefined,
          zip: zipValue,
        }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.detail || json.error || 'report_failed')
      fireFunnel('RECS_VIEWED', { reportId: json.reportId, buyCount: json.upsell?.buyCount ?? 0 })
      // Canonical page — refreshable, bookmarkable, emailable.
      window.location.assign(`/report/${json.reportId}`)
    } catch (e) {
      clearInterval(ticker)
      setError((e as Error).message)
      setStage('error')
    }
  }, [])

  if (stage === 'error') {
    return (
      <div style={boxStyle}>
        <p style={{ color: '#8a3d2e', fontSize: 15 }}>
          Something went wrong reading your photos: {error}. Your photos weren’t lost — try submitting again.
        </p>
        <button onClick={() => setStage('collect')} style={secondaryBtn}>
          Back to my photos
        </button>
      </div>
    )
  }

  if (stage === 'processing') {
    return (
      <div style={{ ...boxStyle, padding: '36px 24px' }}>
        <ProcessingArt />
        <p style={{ color: PALETTE.green, fontSize: 18, fontWeight: 700, margin: '18px 0 6px' }}>
          {PROCESSING_STEPS[stepIdx]}
        </p>
        <p style={{ color: PALETTE.inkSoft, fontSize: 13.5, margin: '0 0 14px' }}>
          Usually 30–60 seconds. Your report opens on its own page when it’s ready.
        </p>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {PROCESSING_STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 26,
                height: 5,
                borderRadius: 3,
                background: i <= stepIdx ? PALETTE.gold : 'rgba(31,61,43,0.15)',
                transition: 'background 0.4s',
              }}
            />
          ))}
        </div>
        <style>{`@keyframes alderPulse { 0%,100% { opacity: 0.35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }`}</style>
      </div>
    )
  }

  // ── collect stage ──────────────────────────────────────────────────
  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {slots.map((s) => (
          <div key={s.id} style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.thumb}
              alt="Your photo"
              style={{
                width: 76,
                height: 76,
                objectFit: 'cover',
                borderRadius: 8,
                border: `2px solid ${s.status === 'done' ? '#7a9b6f' : s.status === 'failed' ? '#9b3f3f' : 'rgba(31,61,43,0.2)'}`,
                opacity: s.status === 'uploading' ? 0.6 : 1,
              }}
            />
            <span style={{ position: 'absolute', right: -4, top: -4, fontSize: 14 }}>
              {s.status === 'done' ? '✅' : s.status === 'failed' ? '⚠️' : '⏳'}
            </span>
          </div>
        ))}
        {slots.length < MAX_PHOTOS && (
          <button
            onClick={() => addInputRef.current?.click()}
            style={{
              width: 76,
              height: 76,
              borderRadius: 8,
              border: '2px dashed rgba(31,61,43,0.3)',
              background: 'transparent',
              color: PALETTE.green,
              fontSize: 26,
              cursor: 'pointer',
            }}
            aria-label="Add another photo"
          >
            +
          </button>
        )}
      </div>

      {/* v7.4.16 — explicit HEIC/HEIF: the `image/*` wildcard alone leaves
          iPhone library photos unselectable on several browsers. */}
      <input
        ref={addInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />

      <p style={{ fontSize: 13.5, color: PALETTE.inkSoft, margin: '0 0 12px' }}>
        {readyCount} of {slots.length} photo{slots.length === 1 ? '' : 's'} ready
        {uploadingCount > 0 ? ` · ${uploadingCount} uploading…` : ''} · up to {MAX_PHOTOS} total — more rooms, better
        Check
      </p>

      <input
        type="text"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Optional context — “just moved in, propane boiler”"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(31,61,43,0.2)',
          fontSize: 14,
          marginBottom: 10,
        }}
      />

      <div style={{ marginBottom: 14 }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="ZIP (optional)"
          aria-label="ZIP code (optional)"
          style={{
            width: 140,
            padding: '10px 12px',
            borderRadius: 8,
            border: `1px solid ${zip && !/^\d{5}$/.test(zip) ? '#c08a7a' : 'rgba(31,61,43,0.2)'}`,
            fontSize: 14,
          }}
        />
        <p style={{ fontSize: 12, color: PALETTE.inkSoft, margin: '6px 0 0' }}>
          Better accuracy for your region — frost depth, humidity, local codes and pricing.
          {zip && !/^\d{5}$/.test(zip) ? ' Needs 5 digits (or leave it blank).' : ''}
        </p>
      </div>

      <div>
        <button onClick={() => void submit()} disabled={readyCount === 0} style={{ ...primaryBtn, opacity: readyCount === 0 ? 0.5 : 1 }}>
          Get my Alder Check{readyCount > 0 ? ` (${readyCount} photo${readyCount === 1 ? '' : 's'})` : ''}
        </button>
      </div>
      <p style={{ fontSize: 12, color: PALETTE.inkSoft, marginTop: 10 }}>
        Free · no account · photos with people are excluded automatically
      </p>
    </div>
  )
}

/** Animated processing creative: room frame + verdict chips pulsing in sequence. */
function ProcessingArt() {
  const chip = (label: string, bg: string, fg: string, delay: string) => (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.06em',
        borderRadius: 8,
        padding: '6px 14px',
        margin: '0 5px',
        animation: `alderPulse 1.8s ease-in-out ${delay} infinite`,
      }}
    >
      {label}
    </span>
  )
  return (
    <div>
      <svg viewBox="0 0 120 90" width="110" height="82" fill="none" aria-hidden="true" style={{ display: 'block', margin: '0 auto' }}>
        <rect x="8" y="8" width="104" height="70" rx="8" fill="#fff" stroke="rgba(31,61,43,0.3)" strokeWidth="2.5" />
        <rect x="18" y="18" width="30" height="24" rx="3" fill="#fff" stroke="rgba(31,61,43,0.3)" strokeWidth="2" />
        <path d="M20 38l7-8 5 5 6-7 8 10H20z" fill="#7a9b6f" opacity="0.5" />
        <rect x="58" y="52" width="44" height="10" rx="3" fill="#fff" stroke="rgba(31,61,43,0.3)" strokeWidth="2" />
        <circle cx="60" cy="70" r="4" fill="#b08d2f">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div style={{ marginTop: 14 }}>
        {chip('BUY', '#e5efe2', '#2d5a3d', '0s')}
        {chip('WAIT', '#f3ecd9', '#8a6d1f', '0.3s')}
        {chip('SKIP', '#f0e4e0', '#8a3d2e', '0.6s')}
      </div>
    </div>
  )
}

const boxStyle: React.CSSProperties = {
  background: PALETTE.cream,
  border: `1px solid ${PALETTE.line}`,
  borderRadius: 16,
  padding: '24px 22px',
  textAlign: 'center',
  maxWidth: 760,
  margin: '0 auto',
}

const primaryBtn: React.CSSProperties = {
  background: PALETTE.green,
  color: PALETTE.cream,
  border: 'none',
  borderRadius: 10,
  padding: '14px 28px',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryBtn: React.CSSProperties = {
  background: '#fff',
  color: PALETTE.green,
  border: `1px solid ${PALETTE.green}`,
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 10,
}
