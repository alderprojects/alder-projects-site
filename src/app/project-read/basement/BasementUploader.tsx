'use client'

/**
 * v7.3.3-C-PR1 Photo Uploader — client component.
 *
 * Originally basement-only (v7.3.3-B). PR1 opens the funnel: the
 * uploader posts photos of anything around the home; server-side open
 * extraction figures out what's in the photo. UI copy updated. The
 * roomType/scope fields in the POST body are now telemetry hints, not
 * gating constraints, so we send 'auto' to signal that the client
 * didn't pre-classify.
 *
 * Per-photo sequential upload (one POST per photo). UI shows per-photo
 * status with confidence indicator. Hard cap: 5 photos per session.
 *
 * Consent UI shows 3 checkboxes. personal_recommendations is implicit
 * (written server-side on upload) and lives in /privacy per the v7.3.3
 * architecture decision.
 */

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Stage = 'idle' | 'uploading' | 'synthesizing' | 'error'

interface UploadedPhoto {
  photoId: string
  projectId: string
  preview: string // object URL
  confidence: number | null
  status: 'ok' | 'low_confidence' | 'failed'
}

const MAX_PHOTOS = 5

export function BasementUploader() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('idle')
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [consents, setConsents] = useState({
    product_improvement: true,
    valuation_research: false,
    public_content_use: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadOne(file: File): Promise<UploadedPhoto> {
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const res = await fetch('/api/photos/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: projectId ?? undefined,
        // PR1: roomType/scope are telemetry hints only — open extraction
        // ignores them. 'auto' = client did not pre-classify.
        roomType: 'auto',
        scope: 'auto',
        imageBase64: base64,
        consents,
      }),
    })

    const json = (await res.json()) as {
      ok: boolean
      error?: string
      photoId?: string
      projectId?: string
      extraction?: { overallConfidence: number; features: unknown[] } | null
      extractionError?: string | null
    }
    if (!res.ok || !json.ok) {
      throw new Error(json.error ?? 'upload_failed')
    }
    if (!projectId && json.projectId) setProjectId(json.projectId)

    const conf = json.extraction?.overallConfidence ?? null
    const status: UploadedPhoto['status'] = json.extractionError
      ? 'failed'
      : conf !== null && conf >= 0.7
        ? 'ok'
        : 'low_confidence'

    return {
      photoId: json.photoId!,
      projectId: json.projectId!,
      preview: URL.createObjectURL(file),
      confidence: conf,
      status,
    }
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setStage('uploading')
    setErrorMsg('')

    const room = MAX_PHOTOS - photos.length
    if (room <= 0) {
      setErrorMsg(`Hit the ${MAX_PHOTOS}-photo limit. Submit what you have or start over.`)
      setStage('idle')
      return
    }
    const filesArr = Array.from(files).slice(0, room)
    const results: UploadedPhoto[] = [...photos]

    for (const file of filesArr) {
      try {
        const r = await uploadOne(file)
        results.push(r)
        setPhotos([...results]) // progressive render
      } catch (e) {
        setErrorMsg(`Couldn't upload one photo: ${(e as Error).message}. The others continued.`)
      }
    }
    setStage('idle')
  }

  async function synthesize() {
    if (!projectId) return
    setStage('synthesizing')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cart/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const json = (await res.json()) as { ok: boolean; cartId?: string; error?: string }
      if (!res.ok || !json.ok || !json.cartId) {
        throw new Error(json.error ?? 'synth_failed')
      }
      router.push(`/project-read/basement/result/${json.cartId}`)
    } catch (e) {
      setStage('error')
      setErrorMsg((e as Error).message)
    }
  }

  return (
    <div>
      {/* Consent block */}
      <section className="mb-6 rounded-lg border border-gray-200 p-4">
        <h2 className="mb-3 font-medium text-gray-900">How your photos are used</h2>
        <p className="mb-3 text-sm text-gray-600">
          Photos are stripped of location data before saving. You can revoke any of these at any time.
        </p>
        <label className="mb-2 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consents.product_improvement}
            onChange={(e) => setConsents({ ...consents, product_improvement: e.target.checked })}
            className="mt-1"
          />
          <span>
            <strong>Help improve the product.</strong> Aggregated, anonymized use to tune accuracy.
          </span>
        </label>
        <label className="mb-2 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consents.valuation_research}
            onChange={(e) => setConsents({ ...consents, valuation_research: e.target.checked })}
            className="mt-1"
          />
          <span>
            <strong>Include in property research.</strong> Used in internal home-value analysis.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consents.public_content_use}
            onChange={(e) => setConsents({ ...consents, public_content_use: e.target.checked })}
            className="mt-1"
          />
          <span>
            <strong>May appear on public guide pages.</strong> Featured (with credit, if you want) on alderprojects.com guides.
          </span>
        </label>
      </section>

      {/* Uploader */}
      <section className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          // No `capture` attribute. On iOS Safari, capture="environment"
          // forces the camera (single shot only) — blocks multi-select.
          // Without it, mobile users get the system picker showing
          // photo library (multi-select works) PLUS "Take Photo" as a
          // submenu, so both paths are preserved.
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={stage === 'uploading' || stage === 'synthesizing' || photos.length >= MAX_PHOTOS}
          className="w-full rounded-lg bg-emerald-700 px-6 py-4 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {stage === 'uploading'
            ? 'Uploading…'
            : photos.length === 0
              ? 'Send 1-5 photos'
              : photos.length >= MAX_PHOTOS
                ? `${MAX_PHOTOS}-photo limit reached`
                : 'Add more photos'}
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Up to {MAX_PHOTOS} photos. Wide shots help more than close-ups. Anything
          you want a read on — basement walls, kitchen counters, deck boards,
          roof from the ground, electrical panel, gutters.
        </p>
      </section>

      {/* Photo previews */}
      {photos.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-3 font-medium text-gray-900">Your photos</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p, i) => (
              <div key={p.photoId} className="rounded-lg border border-gray-200 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt={`Basement photo ${i + 1}`} className="h-32 w-full rounded object-cover" />
                <p className="mt-2 text-xs">
                  {p.status === 'ok' && <span className="text-emerald-700">Read clearly</span>}
                  {p.status === 'low_confidence' && <span className="text-amber-700">Read partially</span>}
                  {p.status === 'failed' && <span className="text-red-700">Couldn&apos;t read</span>}
                  {p.confidence !== null && (
                    <span className="ml-1 text-gray-400">({Math.round(p.confidence * 100)}%)</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Synthesize CTA */}
      {photos.length > 0 && stage !== 'synthesizing' && (
        <button
          onClick={synthesize}
          className="w-full rounded-lg bg-gray-900 px-6 py-4 font-medium text-white hover:bg-black"
        >
          See my read
        </button>
      )}

      {stage === 'synthesizing' && (
        <div className="rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-700">
          Building your read…
        </div>
      )}

      {errorMsg && (
        <p className="mt-4 text-sm text-red-700">{errorMsg}</p>
      )}
    </div>
  )
}
