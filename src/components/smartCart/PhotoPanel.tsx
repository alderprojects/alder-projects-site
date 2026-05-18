'use client'

/**
 * v7.3.4-PR2 — Photo side panel inside CurationModal.
 *
 * The strategic wedge: visitors who don't know their topic name can
 * upload photos, see what we read, and proceed to the same paywall
 * the chat funnel uses. Per the v7.3.4 strategy doc:
 *
 *   1. Side panel (NOT primary CTA). Mounted in CurationModal.
 *   2. Reuses /api/photos/upload (no new upload pipeline).
 *   3. After all photos uploaded + extracted, calls /api/photos/preview
 *      for the free render (feature summary + 1 sample rec per
 *      category + confidence gate).
 *   4. Confidence-gated paywall: gate shut = topic-picker fallback.
 *   5. "Does this look right?" confirm step before paywall (refund
 *      protection).
 *   6. CTA "Continue to cart — $19.99" calls onPaywallProceed which
 *      pre-fills modal topic/scope and advances to step 3.
 *
 * Feature-flagged via NEXT_PUBLIC_PHOTO_PANEL_ENABLED — gated off in
 * prod until PR3 lands the Stripe webhook routing that actually
 * serves a v3 cart at the result page. Without PR3 the visitor would
 * pay $19.99 and get a v1 cart synthesized from the inferred topic —
 * acceptable for staging but not for real revenue.
 */

import { useRef, useState } from 'react'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

// =============================================================================
// LOCAL TYPES (mirror src/lib/photos/preview.ts to avoid server import)
// =============================================================================

interface SampleRecommendation {
  headline: string
  lane: 'BUY' | 'SKIP' | 'WAIT' | 'PRO_LINE'
  reasoning: string
  source: 'curated' | 'ai_generated'
}

interface PreviewCategorySummary {
  category: string
  featureCount: number
  sampleRecommendation: SampleRecommendation | null
}

interface InferredScope {
  topic: TopicId
  scopeVariantId: string
  scenario: BriefScenarioId
}

export interface PreviewMeta {
  photoCount: number
  featureCount: number
  overallConfidence: number
  dominantCategory: string | null
  inferredScope: InferredScope | null
}

interface PreviewResponse {
  ok: boolean
  paywallAllowed: boolean
  lowConfidenceReason?: string
  photoCount: number
  featureCount: number
  overallConfidence: number
  categories: PreviewCategorySummary[]
  dominantCategory: string | null
  inferredScope: InferredScope | null
}

interface UploadedPhoto {
  photoId: string
  preview: string // object URL
  status: 'ok' | 'low_confidence' | 'failed' | 'pending'
}

// =============================================================================
// PROPS
// =============================================================================

export interface PhotoPanelProps {
  open: boolean
  onClose: () => void
  /**
   * Fired when the visitor clicks "Continue to cart — $19.99" after
   * confirming the read. Modal owner pre-fills topic/scope and
   * advances to checkout.
   */
  onPaywallProceed: (scope: InferredScope, meta: PreviewMeta) => void
  /**
   * Fired when the visitor says "no, that's not right" on the
   * confirm step. Modal owner typically closes the panel and shows
   * the topic picker.
   */
  onRejectRead: () => void
}

// =============================================================================
// CONFIG
// =============================================================================

const MAX_PHOTOS = 5
const CONSENT_VERSION_NOTE =
  'Photos are stripped of location data before saving. You can revoke any time.'

type Stage =
  | 'upload'
  | 'uploading'
  | 'preview_loading'
  | 'preview'
  | 'preview_error'

// =============================================================================
// COMPONENT
// =============================================================================

export function PhotoPanel({
  open,
  onClose,
  onPaywallProceed,
  onRejectRead,
}: PhotoPanelProps) {
  const [stage, setStage] = useState<Stage>('upload')
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [confirmAsked, setConfirmAsked] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  async function uploadOne(file: File): Promise<UploadedPhoto> {
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Could not read photo file'))
      reader.readAsDataURL(file)
    })

    const res = await fetch('/api/photos/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomType: 'auto',
        scope: 'auto',
        imageBase64: base64,
        consents: {
          // Inside the modal we surface a single inline note rather
          // than 3 checkboxes — keeps the panel compact. Defaults
          // match the most generous beta-cohort behavior.
          product_improvement: true,
          valuation_research: false,
          public_content_use: false,
        },
      }),
    })

    if (!res.ok) {
      if (res.status === 504) throw new Error('Upload timed out — try a smaller photo.')
      if (res.status === 502) throw new Error('Storage write failed — try again.')
      if (res.status === 413) throw new Error('Photo is too large.')
      const text = await res.text().catch(() => '')
      throw new Error(`Upload failed (HTTP ${res.status}). ${text.slice(0, 100)}`)
    }

    let json: {
      ok: boolean
      error?: string
      photoId?: string
      extraction?: { overallConfidence: number } | null
      extractionError?: string | null
    }
    try {
      json = await res.json()
    } catch {
      throw new Error('Server returned an unreadable response. Try again.')
    }
    if (!json.ok) throw new Error(json.error ?? 'upload_failed')

    const conf = json.extraction?.overallConfidence ?? null
    const status: UploadedPhoto['status'] = json.extractionError
      ? 'failed'
      : conf !== null && conf >= 0.7
        ? 'ok'
        : 'low_confidence'

    return {
      photoId: json.photoId!,
      preview: URL.createObjectURL(file),
      status,
    }
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setStage('uploading')
    setErrorMsg('')

    fireFunnelEvent('PHOTO_UPLOAD_STARTED', { count: files.length })

    const room = MAX_PHOTOS - photos.length
    if (room <= 0) {
      setErrorMsg(`Hit the ${MAX_PHOTOS}-photo limit.`)
      setStage('upload')
      return
    }
    const filesArr = Array.from(files).slice(0, room)
    const results: UploadedPhoto[] = [...photos]
    let succeeded = 0
    let failed = 0
    const failureMsgs: string[] = []
    for (const file of filesArr) {
      try {
        const r = await uploadOne(file)
        results.push(r)
        setPhotos([...results])
        succeeded += 1
      } catch (e) {
        failed += 1
        failureMsgs.push((e as Error).message)
      }
    }
    if (failed > 0) {
      const sample = failureMsgs[0] ?? 'unknown error'
      setErrorMsg(
        succeeded > 0
          ? `${succeeded} of ${filesArr.length} uploaded. ${failed} failed: ${sample}.`
          : `All uploads failed: ${sample}.`
      )
    }
    setStage('upload')
  }

  async function loadPreview() {
    if (photos.length === 0) return
    setStage('preview_loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/photos/preview', { method: 'POST' })
      if (!res.ok) throw new Error(`Preview failed (HTTP ${res.status})`)
      const json = (await res.json()) as PreviewResponse
      setPreview(json)
      setStage('preview')
    } catch (e) {
      setErrorMsg((e as Error).message)
      setStage('preview_error')
    }
  }

  function handleConfirmRead() {
    if (!preview) return
    fireFunnelEvent('PHOTO_PREVIEW_CONFIRMED_READ', {
      dominantCategory: preview.dominantCategory,
      featureCount: preview.featureCount,
    })
    setConfirmAsked(true)
  }

  function handleRejectRead() {
    fireFunnelEvent('PHOTO_PREVIEW_REJECTED_READ', {
      dominantCategory: preview?.dominantCategory,
      featureCount: preview?.featureCount,
    })
    onRejectRead()
  }

  function handlePaywallClick() {
    if (!preview || !preview.inferredScope) return
    fireFunnelEvent('PHOTO_PAYWALL_CLICKED', {
      inferredTopic: preview.inferredScope.topic,
      inferredScope: preview.inferredScope.scopeVariantId,
    })
    onPaywallProceed(preview.inferredScope, {
      photoCount: preview.photoCount,
      featureCount: preview.featureCount,
      overallConfidence: preview.overallConfidence,
      dominantCategory: preview.dominantCategory,
      inferredScope: preview.inferredScope,
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl md:w-[480px]">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">
          Send a photo of your project
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close photo panel"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* UPLOAD STAGE */}
        {(stage === 'upload' || stage === 'uploading') && (
          <UploadStageView
            photos={photos}
            stage={stage}
            errorMsg={errorMsg}
            fileInputRef={fileInputRef}
            onFilesSelected={onFilesSelected}
            onPreview={loadPreview}
          />
        )}

        {/* PREVIEW LOADING */}
        {stage === 'preview_loading' && (
          <div className="rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-700">
            Reading your photos…
          </div>
        )}

        {/* PREVIEW ERROR */}
        {stage === 'preview_error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg || 'Something went wrong loading the preview.'}
            <button
              type="button"
              onClick={loadPreview}
              className="ml-2 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* PREVIEW RENDER */}
        {stage === 'preview' && preview && (
          <PreviewView
            preview={preview}
            confirmAsked={confirmAsked}
            onConfirmRead={handleConfirmRead}
            onRejectRead={handleRejectRead}
            onPaywallClick={handlePaywallClick}
          />
        )}
      </div>
    </div>
  )
}

// =============================================================================
// SUB-VIEWS
// =============================================================================

function UploadStageView({
  photos,
  stage,
  errorMsg,
  fileInputRef,
  onFilesSelected,
  onPreview,
}: {
  photos: UploadedPhoto[]
  stage: Stage
  errorMsg: string
  fileInputRef: React.RefObject<HTMLInputElement>
  onFilesSelected: (files: FileList | null) => void
  onPreview: () => void
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-gray-700">
        Upload 1–{MAX_PHOTOS} photos of anything around your home — basement,
        kitchen, deck, roof, electrical panel. We&apos;ll read what&apos;s
        visible and show a free preview before asking for payment.
      </p>
      <p className="mb-4 text-xs text-gray-500">{CONSENT_VERSION_NOTE}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={stage === 'uploading' || photos.length >= MAX_PHOTOS}
        className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {stage === 'uploading'
          ? 'Uploading…'
          : photos.length === 0
            ? 'Send 1–5 photos'
            : photos.length >= MAX_PHOTOS
              ? `${MAX_PHOTOS}-photo limit reached`
              : 'Add more photos'}
      </button>

      {photos.length > 0 && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div
                key={p.photoId}
                className="rounded border border-gray-200 p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.preview}
                  alt={`Photo ${i + 1}`}
                  className="h-20 w-full rounded object-cover"
                />
                <p className="mt-1 text-[10px]">
                  {p.status === 'ok' && (
                    <span className="text-emerald-700">Read</span>
                  )}
                  {p.status === 'low_confidence' && (
                    <span className="text-amber-700">Partial</span>
                  )}
                  {p.status === 'failed' && (
                    <span className="text-red-700">Failed</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onPreview}
            disabled={stage === 'uploading'}
            className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
          >
            See free preview
          </button>
        </>
      )}

      {errorMsg && (
        <p className="mt-3 text-xs text-red-700">{errorMsg}</p>
      )}
    </div>
  )
}

function PreviewView({
  preview,
  confirmAsked,
  onConfirmRead,
  onRejectRead,
  onPaywallClick,
}: {
  preview: PreviewResponse
  confirmAsked: boolean
  onConfirmRead: () => void
  onRejectRead: () => void
  onPaywallClick: () => void
}) {
  // ---- Confidence gate failed: show fallback, no paywall ----
  if (!preview.paywallAllowed) {
    return (
      <div>
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">
            We had trouble reading your photos clearly.
          </p>
          <p className="mt-2">
            {preview.lowConfidenceReason ??
              'Try a different photo, or use the topic picker instead.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRejectRead}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
        >
          Use the topic picker instead
        </button>
      </div>
    )
  }

  // ---- Healthy preview ----
  return (
    <div>
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        We read <strong>{preview.featureCount}</strong> observations from{' '}
        <strong>{preview.photoCount}</strong>{' '}
        {preview.photoCount === 1 ? 'photo' : 'photos'}
        {preview.dominantCategory
          ? ` — looks like a ${prettyCategory(preview.dominantCategory)} project.`
          : '.'}
      </div>

      <h3 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
        Sample of what we&apos;ll recommend
      </h3>
      <div className="space-y-2">
        {preview.categories.map((cat) => (
          <CategoryPreviewCard key={cat.category} cat={cat} />
        ))}
      </div>

      {!confirmAsked ? (
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-900">
            Does this read look right?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onConfirmRead}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Yes, continue
            </button>
            <button
              type="button"
              onClick={onRejectRead}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              No, use topic picker
            </button>
          </div>
        </div>
      ) : preview.inferredScope ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-900">
            Unlock the full read for $19.99.
          </p>
          <p className="mb-3 text-xs text-emerald-800">
            Includes specific products + reasoning per item, save link for
            30 days, refund guarantee.
          </p>
          <button
            type="button"
            onClick={onPaywallClick}
            className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Continue to cart — $19.99
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          We couldn&apos;t map your read to a known project scope. Use the
          topic picker to continue.
        </div>
      )}
    </div>
  )
}

function CategoryPreviewCard({ cat }: { cat: PreviewCategorySummary }) {
  return (
    <article className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-900">
          {prettyCategory(cat.category)}
        </h4>
        <span className="text-xs text-gray-500">
          {cat.featureCount} {cat.featureCount === 1 ? 'observation' : 'observations'}
        </span>
      </div>
      {cat.sampleRecommendation ? (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-900">
            {cat.sampleRecommendation.headline}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {truncate(cat.sampleRecommendation.reasoning, 140)}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          You&apos;ll see specific recommendations after payment.
        </p>
      )}
    </article>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function prettyCategory(category: string): string {
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
}

/**
 * Fire a funnel event to /api/events/funnel. Fire-and-forget — failures
 * don't block the UX. Events feed the v7.3.4 retro funnel analysis.
 */
function fireFunnelEvent(
  eventType: string,
  payload: Record<string, unknown> = {}
): void {
  fetch('/api/events/funnel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, payload }),
    keepalive: true,
  }).catch(() => {
    // Silent — telemetry must never break the UX.
  })
}
