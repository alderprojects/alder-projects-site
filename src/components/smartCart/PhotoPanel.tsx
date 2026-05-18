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

import { useEffect, useRef, useState } from 'react'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'
import { HandoffQRCard } from './HandoffQRCard'
import { convertHeicIfNeeded } from '@/lib/photos/heic-client'

// =============================================================================
// LOCAL TYPES (mirror src/lib/photos/preview.ts to avoid server import)
// =============================================================================

interface SampleRecommendation {
  headline: string
  // PR3.7 §1.7: PRO_LINE removed from the v3 photo-path vocab (Alder
  // has no contractor network to route to). Lane is now the canonical
  // 4 values from PR3.6.
  lane: 'BUY' | 'SKIP' | 'WAIT' | 'MONITOR'
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

interface PreviewTeaser {
  laneCounts: { BUY: number; SKIP: number; WAIT: number; MONITOR: number }
  totalItems: number
  sampleBuy: { headline: string; category: string } | null
  sampleSkip: { headline: string; reasoning: string } | null
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
  userIntent?: string | null
  teaser?: PreviewTeaser | null
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
  const cameraInputRef = useRef<HTMLInputElement>(null)
  // PR3.7 §1.8 — surface the mobile camera CTA only on mobile.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setIsMobile(/iphone|ipad|ipod|android/i.test(navigator.userAgent))
  }, [])

  // PR3.10: visitor's "tell us what you're looking to do" sentence.
  // Plumbed into every upload + into synthesize-time LLM prompt as
  // project-level context. Resets when the panel closes (next session
  // starts fresh).
  const [userIntent, setUserIntent] = useState('')

  // PR3.10: timestamp of when the panel opened (reset on each open).
  // Passed to /api/photos/preview as ?since= so the polling only
  // counts photos uploaded AFTER the panel opened. Without this,
  // photos from a previous session in the 24h window auto-advance
  // the modal and the visitor can't start fresh.
  const panelOpenedAtRef = useRef<Date | null>(null)
  useEffect(() => {
    if (open) {
      panelOpenedAtRef.current = new Date()
    }
  }, [open])

  // PR3.12 — REMOVED auto-advance. Per user feedback after the PR3.11
  // retest got stuck in preview_loading: "show progress of photos
  // coming in and then go back to intent box & how your photos are
  // used."
  //
  // Diagnosis (Neon EventLog): 5 photos uploaded from mobile via
  // QR handoff over a ~20s window. Polling auto-advanced on the
  // first featureCount > 0, called loadPreview, and the modal got
  // committed to preview_loading. The useEffect cleanup stopped
  // polling, so the next 4 photos arrived silently — and loadPreview
  // hit a state where the preview was already rendered but the
  // visitor saw an indefinite "Reading your photos…" hang.
  //
  // New model:
  //   - Polling stays in upload stage and updates live counts
  //     (remotePhotoCount, remoteFeatureCount).
  //   - The "See free preview" CTA shows whenever there's at least
  //     one extracted feature (local OR remote). The visitor clicks
  //     it when they're done adding photos — we don't guess.
  //   - The intent textarea + "How your photos are used" note stay
  //     visible while uploads come in, so the visitor can edit
  //     intent up to the moment they press the CTA.
  //
  // Polling runs whenever the panel is open AND in upload stage.
  // (Removed the `photos.length > 0` guard — local uploads can
  // co-exist with remote uploads in QR handoff flows.)
  const [remotePhotoCount, setRemotePhotoCount] = useState(0)
  const [remoteFeatureCount, setRemoteFeatureCount] = useState(0)
  useEffect(() => {
    if (!open) return
    if (stage !== 'upload' && stage !== 'uploading') return

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    async function pollRemoteProgress() {
      try {
        const sinceParam = panelOpenedAtRef.current
          ? `?since=${encodeURIComponent(panelOpenedAtRef.current.toISOString())}`
          : ''
        const res = await fetch(`/api/photos/preview${sinceParam}`, { method: 'POST' })
        if (!res.ok) return
        const json = (await res.json()) as PreviewResponse
        if (cancelled) return
        if (typeof json.photoCount === 'number') {
          setRemotePhotoCount(json.photoCount)
        }
        if (typeof json.featureCount === 'number') {
          setRemoteFeatureCount(json.featureCount)
        }
      } catch {
        /* swallow — poll continues */
      }
    }

    void pollRemoteProgress()
    intervalId = setInterval(pollRemoteProgress, 5000)
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [open, stage])

  if (!open) return null

  async function uploadOne(rawFile: File): Promise<UploadedPhoto> {
    // PR3.8: HEIC -> JPEG conversion before any upload work. iPhone
    // default camera format is HEIC; sharp on Vercel doesn't decode
    // HEIC, so the only path that works is client-side conversion.
    // No-op for non-HEIC files.
    const file = await convertHeicIfNeeded(rawFile)

    // PR3.7 §1.11: multipart/form-data — see PhotoUploader.tsx for the
    // full rationale (base64-in-JSON was failing on real iPhone JPEGs).
    const formData = new FormData()
    formData.append('image', file)
    formData.append('roomType', 'auto')
    formData.append('scope', 'auto')
    formData.append(
      'consents',
      JSON.stringify({
        // Inside the modal we surface a single inline note rather than
        // 3 checkboxes — keeps the panel compact.
        product_improvement: true,
        valuation_research: false,
        public_content_use: false,
      })
    )
    // PR3.10: visitor's project intent. Upload route persists to
    // Project.userIntent on create OR backfills if not yet set.
    if (userIntent.trim().length > 0) {
      formData.append('userIntent', userIntent.trim())
    }

    const res = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData,
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

  // PR3.11 — reverts PR3.10's teaser=1 path. Per user strategic
  // direction: photo+intent feeds the EXISTING Smart Cart v1/v2
  // engine, not a separate v3 path. The preview just confirms what
  // we read (topic, feature count) and advances to the existing
  // CurationModal sneak peek (step 1 of the new 3-step flow), where
  // the chat-funnel's DynamicExampleCard already shows the v1/v2
  // teaser. No need to run server-side synthesis here.
  //
  // PR3.10's teaser=1 synth was the cause of the "stuck on reading
  // photos" bug — 5+ photos = 6 parallel LLM calls = ~10s = Vercel
  // 504. Reverted.
  async function loadPreview() {
    // PR3.12: visitor-initiated. Gate on having SOMETHING to show —
    // local uploads OR a remote feature extracted via QR handoff.
    if (photos.length === 0 && remoteFeatureCount === 0) return
    setStage('preview_loading')
    setErrorMsg('')
    try {
      const sinceParam = panelOpenedAtRef.current
        ? `?since=${encodeURIComponent(panelOpenedAtRef.current.toISOString())}`
        : ''
      const res = await fetch(`/api/photos/preview${sinceParam}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error(`Preview failed (HTTP ${res.status})`)
      const json = (await res.json()) as PreviewResponse
      setPreview(json)
      setStage('preview')
    } catch (e) {
      setErrorMsg((e as Error).message)
      setStage('preview_error')
    }
  }

  // PR3.12: bail-out from preview_loading. If the /api/photos/preview
  // call hangs (LLM slow, Vercel 504), the visitor should be able to
  // back out to the upload stage rather than stare at the dots
  // indefinitely. Also auto-bails after 30s as a hard ceiling.
  function bailOutOfPreviewLoading() {
    setStage('upload')
    setErrorMsg('Preview is taking longer than expected. Add or remove photos and try again.')
  }
  useEffect(() => {
    if (stage !== 'preview_loading') return
    const t = setTimeout(() => {
      bailOutOfPreviewLoading()
    }, 30_000)
    return () => clearTimeout(t)
  }, [stage])

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
            cameraInputRef={cameraInputRef}
            isMobile={isMobile}
            remotePhotoCount={remotePhotoCount}
            remoteFeatureCount={remoteFeatureCount}
            userIntent={userIntent}
            onUserIntentChange={setUserIntent}
            onFilesSelected={onFilesSelected}
            onPreview={loadPreview}
          />
        )}

        {/* PREVIEW LOADING — PR3.11 added pulsing dots; PR3.12 added
            an explicit bail-out button + 30s auto-bail so a slow
            preview doesn't strand the visitor. */}
        {stage === 'preview_loading' && (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-gray-100 p-6 text-center text-sm text-gray-700">
            <PulsingDots />
            <span>Reading your photos…</span>
            <span className="text-xs text-gray-500">
              Usually 4–8 seconds per photo.
            </span>
            <button
              type="button"
              onClick={bailOutOfPreviewLoading}
              className="mt-2 text-xs text-gray-600 underline hover:text-gray-900"
            >
              Cancel and go back
            </button>
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
  cameraInputRef,
  isMobile,
  remotePhotoCount,
  remoteFeatureCount,
  userIntent,
  onUserIntentChange,
  onFilesSelected,
  onPreview,
}: {
  photos: UploadedPhoto[]
  stage: Stage
  errorMsg: string
  fileInputRef: React.RefObject<HTMLInputElement>
  cameraInputRef: React.RefObject<HTMLInputElement>
  isMobile: boolean
  remotePhotoCount: number
  remoteFeatureCount: number
  userIntent: string
  onUserIntentChange: (value: string) => void
  onFilesSelected: (files: FileList | null) => void
  onPreview: () => void
}) {
  // PR3.12: live count of "have we read it yet" combined across local
  // and remote sources. Remote counts come from polling; local counts
  // come from uploadOne's return status. The CTA only enables when at
  // least one feature has been extracted somewhere.
  const localReadCount = photos.filter((p) => p.status === 'ok' || p.status === 'low_confidence').length
  const totalUploaded = Math.max(photos.length, remotePhotoCount)
  const totalRead = Math.max(localReadCount, remoteFeatureCount > 0 ? remotePhotoCount : 0)
  const anyReadyToPreview = photos.length > 0 || remoteFeatureCount > 0
  const stillReading = totalUploaded > 0 && totalRead < totalUploaded
  const remoteOnly = photos.length === 0 && remotePhotoCount > 0
  return (
    <div>
      <p className="mb-3 text-sm text-gray-700">
        Upload 1–{MAX_PHOTOS} photos of anything around your home — basement,
        kitchen, deck, roof, electrical panel. We&apos;ll read what&apos;s
        visible and show a free preview before asking for payment.
      </p>

      {/* PR3.10 photo+chat: visitor's freeform "tell us what you're
          looking to do" sentence. Plumbed to Project.userIntent on
          upload + into per-feature LLM synthesis prompt as
          project-level context. Optional but heavily encouraged —
          intent + photo dramatically out-performs photo alone for
          recommendation quality. */}
      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-gray-900">
          Tell us what you&apos;re looking to do (one sentence is enough):
        </span>
        <textarea
          value={userIntent}
          onChange={(e) => onUserIntentChange(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="e.g. We just bought this house — what should we tackle first in the basement?"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <p className="mb-4 text-xs text-gray-500">{CONSENT_VERSION_NOTE}</p>

      {/* PR3.8 Fix A: QR for desktop -> mobile handoff inside the
          Smart Cart modal. Hidden on mobile via the component's own
          md: visibility classes. When the customer scans + uploads
          from phone, the panel's polling effect auto-advances to
          the preview stage. */}
      <HandoffQRCard
        variant="panel"
        subtitle="Scan with your phone to upload photos there. The preview will appear here automatically."
      />

      {/* PR3.12: live progress banner. Shows the running count of
          photos uploaded (local + remote via QR handoff) vs. how
          many have been extracted. Pulsing dots only animate while
          extraction is still catching up. The visitor stays on the
          upload stage — they decide when to press "See free
          preview" — so new mobile uploads can keep streaming in. */}
      {totalUploaded > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {stillReading && <PulsingDots />}
          <span>
            {remoteOnly
              ? `${remotePhotoCount} ${remotePhotoCount === 1 ? 'photo' : 'photos'} from your phone`
              : `${totalUploaded} ${totalUploaded === 1 ? 'photo' : 'photos'} uploaded`}
            {stillReading
              ? ` — reading ${totalRead === 0 ? 'now' : `(${totalRead}/${totalUploaded} read)`}…`
              : ` — ${totalRead === 1 ? 'read' : 'all read'}.`}
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
      />
      {/* PR3.7 §1.8: mobile-only camera input (back camera hinted). */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        capture="environment"
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
            ? isMobile
              ? 'Choose photos from library'
              : 'Send 1–5 photos'
            : photos.length >= MAX_PHOTOS
              ? `${MAX_PHOTOS}-photo limit reached`
              : 'Add more from library'}
      </button>
      {isMobile && photos.length < MAX_PHOTOS && stage !== 'uploading' && (
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="mt-2 w-full rounded-lg border border-emerald-700 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Or take a photo with your camera
        </button>
      )}

      {photos.length > 0 && (
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
      )}

      {/* PR3.12: visitor-controlled CTA. Enables as soon as ONE
          feature has been extracted (local or remote), so QR-handoff
          flows with zero local uploads still work. Stays disabled
          until then so a press during "uploading" or "reading" won't
          trigger an empty-features early return on the preview API. */}
      {anyReadyToPreview && (
        <button
          type="button"
          onClick={onPreview}
          disabled={stage === 'uploading'}
          className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
        >
          {stillReading ? 'See preview so far' : 'See free preview'}
        </button>
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

      {/* PR3.10: cart teaser. When server-side synthesis ran, render
          lane counts + sample BUY/SKIP — the "so what" preview that
          tells the visitor what the $19.99 unlocks. Falls back to the
          old per-category sample-rec layout if teaser is missing
          (e.g. synthesis failed or polling-cheap call didn't include
          teaser=1). */}
      {preview.teaser ? (
        <PreviewTeaserBlock
          teaser={preview.teaser}
          userIntent={preview.userIntent ?? null}
        />
      ) : (
        <>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
            Sample of what we&apos;ll recommend
          </h3>
          <div className="space-y-2">
            {preview.categories.map((cat) => (
              <CategoryPreviewCard key={cat.category} cat={cat} />
            ))}
          </div>
        </>
      )}

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

// PR3.11 — "art of distraction" loading indicator. Three pulsing
// dots that show work is happening during extraction wait. CSS-only,
// no external deps. Uses Tailwind's animate-pulse with staggered
// inline delays so the dots cycle.
function PulsingDots() {
  return (
    <div className="inline-flex items-center gap-1">
      <span
        className="h-2 w-2 animate-pulse rounded-full bg-emerald-700"
        style={{ animationDelay: '0ms', animationDuration: '1.2s' }}
      />
      <span
        className="h-2 w-2 animate-pulse rounded-full bg-emerald-700"
        style={{ animationDelay: '200ms', animationDuration: '1.2s' }}
      />
      <span
        className="h-2 w-2 animate-pulse rounded-full bg-emerald-700"
        style={{ animationDelay: '400ms', animationDuration: '1.2s' }}
      />
    </div>
  )
}

// PR3.10 cart teaser: lane counts + sample BUY headline + sample SKIP
// reasoning. The "so what" preview that motivates the visitor to pay.
// Per the PR3.6 amendment's free-preview discipline: enough to
// persuade, not enough to bypass the paywall (no product names on
// BUY, no affiliate URLs).
function PreviewTeaserBlock({
  teaser,
  userIntent,
}: {
  teaser: PreviewTeaser
  userIntent: string | null
}) {
  const LANE_PILLS: Array<[keyof PreviewTeaser['laneCounts'], string, string]> = [
    ['BUY', 'BUY', 'bg-emerald-100 text-emerald-800'],
    ['SKIP', 'SKIP', 'bg-gray-200 text-gray-700'],
    ['WAIT', 'WAIT', 'bg-amber-100 text-amber-800'],
    ['MONITOR', 'MONITOR', 'bg-blue-100 text-blue-800'],
  ]
  return (
    <div>
      {userIntent && (
        <div className="mb-4 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
          You said: <em>&ldquo;{userIntent}&rdquo;</em>
        </div>
      )}
      <h3 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
        What your full Smart Cart will contain
      </h3>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {LANE_PILLS.map(([lane, label, style]) => (
          <div
            key={lane}
            className={`rounded p-2 text-center ${style}`}
          >
            <div className="text-lg font-semibold">{teaser.laneCounts[lane]}</div>
            <div className="text-[10px] uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>
      {teaser.sampleBuy && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-emerald-700">
            Sample BUY recommendation
          </div>
          <div className="text-sm font-medium text-emerald-900">
            {teaser.sampleBuy.headline}
          </div>
          <div className="mt-1 text-xs text-emerald-800">
            Specific product + affiliate link unlocked after payment.
          </div>
        </div>
      )}
      {teaser.sampleSkip && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-gray-600">
            Sample SKIP — saves you money
          </div>
          <div className="text-sm font-medium text-gray-900">
            {teaser.sampleSkip.headline}
          </div>
          <div className="mt-1 text-xs text-gray-700">
            {teaser.sampleSkip.reasoning}
          </div>
        </div>
      )}
      {!teaser.sampleBuy && !teaser.sampleSkip && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          Your full cart has {teaser.totalItems} items across the lanes above.
          Unlock to see them all.
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
