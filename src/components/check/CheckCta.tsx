'use client'

/**
 * v7.4.1b — The homepage CTA that IS the product entry point.
 *
 * One tap on mobile opens the camera/photo picker directly (hidden
 * <input type="file" accept="image/*" capture="environment" multiple>);
 * desktop gets the same button plus a drag-and-drop zone. On selection
 * the heavy flow bundle is dynamically imported and the report renders
 * in place on `/` — no interstitial, no second page before value.
 *
 * Performance guardrail: this component is the only client JS above the
 * fold, and it imports CheckFlow lazily on first interaction.
 */

import { lazy, Suspense, useCallback, useRef, useState, useEffect } from 'react'
import { fireFunnel } from '@/lib/check/funnel'

const CheckFlow = lazy(() => import('./CheckFlow'))

export default function CheckCta() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[] | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const heroFired = useRef(false)

  useEffect(() => {
    if (!heroFired.current) {
      heroFired.current = true
      fireFunnel('HOME_HERO_VIEWED')
    }
  }, [])

  const onPick = useCallback(() => {
    fireFunnel('HOME_CTA_TAPPED', { method: 'button' })
    inputRef.current?.click()
  }, [])

  const onFiles = useCallback((list: FileList | File[] | null) => {
    const picked = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'))
    if (picked.length > 0) setFiles(picked.slice(0, 5))
  }, [])

  if (files) {
    return (
      <Suspense
        fallback={
          <div style={{ padding: 32, textAlign: 'center', color: 'rgba(34,48,31,0.68)', fontSize: 15 }}>
            Getting your photos ready…
          </div>
        }
      >
        <CheckFlow initialFiles={files} />
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
          marginTop: 14,
          border: `2px dashed ${dragOver ? '#b08d2f' : 'rgba(31,61,43,0.25)'}`,
          borderRadius: 12,
          padding: '18px 16px',
          fontSize: 14,
          color: 'rgba(34,48,31,0.6)',
          background: dragOver ? 'rgba(176,141,47,0.08)' : 'transparent',
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        …or drag photos here. 1–5 photos of any room. Free. No account required.
      </div>
    </div>
  )
}
