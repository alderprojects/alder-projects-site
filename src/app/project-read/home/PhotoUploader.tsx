'use client'

/**
 * v7.3.4-PR1.5 Photo Uploader — client component.
 *
 * Renamed from BasementUploader. The component is open-domain — the
 * server-side vision call decides what's in the photo, not the
 * client. URL stays /project-read/basement for backwards compat with
 * the Reddit beta cohort's bookmarks; the component name no longer
 * advertises a category constraint that isn't real.
 *
 * Per-photo sequential upload (one POST per photo). UI shows per-photo
 * status with confidence indicator. Hard cap: 5 photos per session.
 *
 * roomType/scope in the POST body are telemetry hints, not gating
 * constraints — we send 'auto' to signal that the client didn't
 * pre-classify.
 *
 * Consent UI shows 3 checkboxes. personal_recommendations is implicit
 * (written server-side on upload) and lives in /privacy per the v7.3.3
 * architecture decision.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { convertHeicIfNeeded } from '@/lib/photos/heic-client'

type Stage = 'idle' | 'uploading' | 'synthesizing' | 'error'

interface UploadedPhoto {
  photoId: string
  projectId: string
  preview: string // object URL
  confidence: number | null
  status: 'ok' | 'low_confidence' | 'failed'
}

const MAX_PHOTOS = 5

export function PhotoUploader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // PR3.9 Bug #2: when the visitor arrived via desktop->mobile QR
  // handoff (/handoff/[token] redirects with ?source=handoff), this
  // mobile session is the phone half of a desktop journey. Hide the
  // synthesize CTA and show "return to desktop" guidance instead, so
  // the visitor doesn't accidentally complete the buyer journey on
  // their phone and strand the desktop session at the QR.
  const isHandoffPhone = searchParams.get('source') === 'handoff'
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
  const cameraInputRef = useRef<HTMLInputElement>(null)
  // PR3.7 §1.8: show the explicit "Use camera" button on mobile only,
  // so desktop users don't see an irrelevant CTA.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setIsMobile(/iphone|ipad|ipod|android/i.test(navigator.userAgent))
  }, [])

  // PR3.10: visitor's "tell us what you're looking to do" sentence.
  // Same plumbing as PhotoPanel — written to Project.userIntent on
  // upload, surfaced to per-feature LLM synthesis as context.
  const [userIntent, setUserIntent] = useState('')

  // PR3.10: timestamp captured once at component mount so polling
  // only sees photos uploaded after THIS page session. Without it,
  // photos from a previous session in the 24h window auto-light up
  // the "uploaded from phone" banner.
  const pageLoadedAtRef = useRef<Date>(new Date())

  // PR3.8 Fix A: photos this anon has on the server (set by polling).
  // When remotePhotoCount > local photos.length, photos arrived from
  // another device (the phone, via QR handoff). Drives the
  // "uploaded from your phone" banner + lets the "See my read" CTA
  // fire even with zero local uploads. remoteProjectId is captured
  // so synthesize() can call the API with a valid projectId for
  // ownership check.
  //
  // PR3.9 Bug #1: track remoteFeatureCount distinct from
  // remotePhotoCount so we can show "reading…" between
  // PHOTO_UPLOADED and VISION_EXTRACTION_COMPLETED (~4-6s gap).
  const [remotePhotoCount, setRemotePhotoCount] = useState(0)
  const [remoteFeatureCount, setRemoteFeatureCount] = useState(0)
  const [remoteProjectId, setRemoteProjectId] = useState<string | null>(null)
  useEffect(() => {
    // Skip on mobile — mobile users aren't waiting for a phone companion.
    if (isMobile) return
    // Skip if we're already past upload / have local progress.
    if (stage === 'synthesizing' || stage === 'error') return

    let cancelled = false
    async function poll() {
      try {
        // PR3.10: send ?since=<pageLoadedAt> so polling only counts
        // photos uploaded in THIS page session. Old photos in the
        // 24h window don't auto-light the banner / CTA.
        const sinceParam = `?since=${encodeURIComponent(pageLoadedAtRef.current.toISOString())}`
        const res = await fetch(`/api/photos/preview${sinceParam}`, { method: 'POST' })
        if (!res.ok) return
        const json = (await res.json()) as {
          ok?: boolean
          photoCount?: number
          featureCount?: number
          recentProjectId?: string | null
        }
        if (cancelled) return
        if (typeof json.photoCount === 'number') {
          setRemotePhotoCount(json.photoCount)
        }
        if (typeof json.featureCount === 'number') {
          setRemoteFeatureCount(json.featureCount)
        }
        if (typeof json.recentProjectId === 'string') {
          setRemoteProjectId(json.recentProjectId)
        }
      } catch {
        /* swallow */
      }
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [isMobile, stage])

  async function uploadOne(
    rawFile: File,
    // PR1.2: explicit projectId param. The outer for-loop tracks the
    // running projectId in a local variable to work around React's
    // async setState — without this, every photo in a batch read a
    // stale closure value and the server created a new Project per
    // photo (EventLog confirmed 4 photos -> 4 separate projects).
    runningProjectId: string | null
  ): Promise<UploadedPhoto> {
    // PR3.8 Fix B: iPhone HEIC -> JPEG client-side before upload.
    // sharp on Vercel doesn't decode HEIC and previously bounced
    // with HTTP 415. heic2any is dynamic-imported so the ~700KB
    // library only loads when a HEIC is detected.
    const file = await convertHeicIfNeeded(rawFile)

    // PR3.7 §1.11: multipart/form-data instead of base64-in-JSON.
    // base64 inflates payload by 33% and pushed real iPhone photos
    // (1.7MB+) past Vercel Hobby's 4.5MB request body cap, causing
    // sharp to throw "image_decode_failed: bad seek to N" on
    // truncated buffers. Multipart sends raw bytes — no inflation,
    // server reads with req.formData().
    const formData = new FormData()
    formData.append('image', file)
    if (runningProjectId) formData.append('projectId', runningProjectId)
    formData.append('roomType', 'auto')
    formData.append('scope', 'auto')
    formData.append('consents', JSON.stringify(consents))
    // PR3.10 photo+chat: visitor's project intent. Upload route
    // writes it to Project.userIntent on create or backfills if not
    // yet set. Plumbs through synth as project-level LLM context.
    if (userIntent.trim().length > 0) {
      formData.append('userIntent', userIntent.trim())
    }

    const res = await fetch('/api/photos/upload', {
      method: 'POST',
      // No Content-Type header: browser auto-sets multipart/form-data
      // with the correct boundary.
      body: formData,
    })

    // PR1.2: check res.ok BEFORE attempting res.json(). On a Vercel
    // function timeout (504) or other infrastructure failure the
    // response body is HTML, and res.json() throws a SyntaxError that
    // iOS Safari surfaces as "The string did not match the expected
    // pattern" — useless to the user. Map common status codes to
    // human-readable messages and fall back to raw text otherwise.
    if (!res.ok) {
      if (res.status === 504) {
        throw new Error('Upload timed out — the server took too long. Try again, or try a smaller photo.')
      }
      if (res.status === 502) {
        throw new Error('Storage write failed — try again in a moment.')
      }
      if (res.status === 413) {
        throw new Error('Photo is too large — try a smaller one.')
      }
      const text = await res.text().catch(() => '')
      throw new Error(`Upload failed (HTTP ${res.status}). ${text.slice(0, 120)}`)
    }

    let json: {
      ok: boolean
      error?: string
      photoId?: string
      projectId?: string
      extraction?: { overallConfidence: number; features: unknown[] } | null
      extractionError?: string | null
    }
    try {
      json = await res.json()
    } catch {
      throw new Error('Server returned an unreadable response. Please try again.')
    }

    if (!json.ok) {
      throw new Error(json.error ?? 'upload_failed')
    }

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

    // PR1.2: track projectId locally through the loop. React's
    // setProjectId is async, so before this fix every photo in a
    // multi-photo batch saw a stale closure value and the server
    // created a new Project per photo. EventLog confirmed: 4 photos
    // ended up in 4 different projects, which broke multi-photo cart
    // synthesis (synthesize would only see 1 of the N photos).
    let runningProjectId: string | null = projectId

    // PR2: track per-batch outcome so the error banner can be honest
    // about what succeeded vs failed (the v7.3.3-C-PR1 retest surfaced
    // confusion where 3 of 4 photos uploaded fine but the banner just
    // said "Couldn't upload one photo" without surfacing the wins).
    let succeeded = 0
    let failed = 0
    const failureMsgs: string[] = []

    for (const file of filesArr) {
      try {
        const r = await uploadOne(file, runningProjectId)
        runningProjectId = r.projectId
        if (!projectId) setProjectId(r.projectId)
        results.push(r)
        setPhotos([...results]) // progressive render
        succeeded += 1
      } catch (e) {
        failed += 1
        failureMsgs.push((e as Error).message)
      }
    }

    if (failed > 0) {
      const sample = failureMsgs[0] ?? 'unknown error'
      if (succeeded > 0) {
        setErrorMsg(
          `${succeeded} of ${filesArr.length} photos uploaded. ${failed} failed: ${sample}${
            failed > 1 ? ` (+${failed - 1} more)` : ''
          }. You can continue with what loaded, or try the failed photos again.`
        )
      } else {
        setErrorMsg(
          `All ${filesArr.length} uploads failed: ${sample}${
            failed > 1 ? ` (and ${failed - 1} more)` : ''
          }. Try again.`
        )
      }
    } else {
      setErrorMsg('')
    }
    setStage('idle')
  }

  async function synthesize() {
    // PR3.8 Fix A: accept local projectId OR the remoteProjectId
    // captured by polling — that's the case where photos came in via
    // QR handoff from the phone (no local uploads on desktop).
    const effectiveProjectId = projectId ?? remoteProjectId
    if (!effectiveProjectId) return
    setStage('synthesizing')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cart/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: effectiveProjectId }),
      })
      const json = (await res.json()) as { ok: boolean; cartId?: string; error?: string }
      if (!res.ok || !json.ok || !json.cartId) {
        throw new Error(json.error ?? 'synth_failed')
      }
      // PR3.7 §1.1: canonical URL is now /project-read/home.
      router.push(`/project-read/home/result/${json.cartId}`)
    } catch (e) {
      setStage('error')
      setErrorMsg((e as Error).message)
    }
  }

  return (
    <div>
      {/* PR3.10 photo+chat: visitor's intent text. Lives ABOVE the
          uploader so it gets attention before they pick photos.
          Plumbed to Project.userIntent + into synth as LLM context.
          PR3.11: hidden on mobile-handoff sessions (?source=handoff)
          — the phone is just the "ease of uploading" device; intent
          stays on the desktop session where the journey began. */}
      {!isHandoffPhone && (
        <section className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label>
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Tell us what you&apos;re looking to do (one sentence helps a lot):
            </span>
            <textarea
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="e.g. We just bought this house — what should we tackle first in the basement?"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Optional, but the recommendations get a lot sharper when we know
            what you&apos;re trying to do, not just what&apos;s in the photo.
          </p>
        </section>
      )}

      {/* Consent block.
          PR3.12: hidden on mobile-handoff sessions (?source=handoff).
          The phone half is upload-only — consent already lives on the
          desktop side of the journey. Per user direction: "we can make
          even lighter by taking out the 'how your photos are used'
          section. just the upload." */}
      {!isHandoffPhone && (
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
      )}

      {/* Uploader */}
      <section className="mb-6">
        {/* Primary input: NO `capture` attribute. The system picker
            on iOS Safari + Android Chrome already offers BOTH
            library + camera; adding capture="environment" was tried
            in early v7.3.3 and reverted because older iOS forced
            single-shot, blocking multi-select. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        {/* PR3.7 §1.8: dedicated camera input for mobile, in addition
            to the library picker above. Two-button pattern keeps
            multi-select working AND gives mobile users a one-tap
            camera CTA. */}
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
          disabled={stage === 'uploading' || stage === 'synthesizing' || photos.length >= MAX_PHOTOS}
          className="w-full rounded-lg bg-emerald-700 px-6 py-4 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {stage === 'uploading'
            ? 'Uploading…'
            : photos.length === 0
              ? isMobile
                ? 'Choose photos from library'
                : 'Send 1-5 photos'
              : photos.length >= MAX_PHOTOS
                ? `${MAX_PHOTOS}-photo limit reached`
                : 'Add more from library'}
        </button>
        {/* PR3.7 §1.8: mobile-only dedicated camera CTA. Desktop users
            don't see it; mobile users get one tap to the back camera. */}
        {isMobile && photos.length < MAX_PHOTOS && stage !== 'uploading' && stage !== 'synthesizing' && (
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="mt-2 w-full rounded-lg border border-emerald-700 bg-white px-6 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Or take a photo with your camera
          </button>
        )}
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

      {/* PR3.8 Fix A + PR3.9 Bug #1: "uploaded from your phone" banner.
          PR3.9 distinguishes "reading…" (photo landed but extraction
          still running, no features yet) from "ready" (extraction
          complete, features available). Synthesize CTA only enables
          on "ready" — otherwise the synthesize call would land in the
          empty-features early-return and look broken to the user. */}
      {!isMobile && remotePhotoCount > photos.length && stage !== 'synthesizing' && (
        remoteFeatureCount === 0 ? (
          // PR3.11: pulsing dots + "art of distraction" so the wait
          // feels like work is happening, not like a hang.
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <span className="inline-flex shrink-0 items-center gap-1">
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
            </span>
            <span>
              {remotePhotoCount === 1
                ? '1 photo uploaded from your phone — reading it now…'
                : `${remotePhotoCount} photos uploaded from your phone — reading them now…`}
            </span>
          </div>
        ) : (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            {remotePhotoCount === 1
              ? '1 photo uploaded from your phone.'
              : `${remotePhotoCount} photos uploaded from your phone.`}{' '}
            Ready to see the read.
          </div>
        )
      )}

      {/* PR3.9 Bug #2: when this is the mobile half of a desktop->mobile
          QR handoff, show "return to desktop" guidance instead of the
          synthesize CTA. Buyer journey completes on desktop. */}
      {isHandoffPhone && photos.length > 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-900">
          <p className="font-medium">
            {photos.length === 1
              ? 'Photo uploaded.'
              : `${photos.length} photos uploaded.`}
          </p>
          <p className="mt-1 text-xs text-emerald-800">
            You can close this tab — your read will appear on the desktop
            window you scanned the QR from.
          </p>
        </div>
      ) : (
        /* Synthesize CTA — enabled when local uploads exist OR remote
           uploads have been extracted (featureCount > 0). */
        (photos.length > 0 || remoteFeatureCount > 0) &&
        stage !== 'synthesizing' && (
          <button
            onClick={synthesize}
            className="w-full rounded-lg bg-gray-900 px-6 py-4 font-medium text-white hover:bg-black"
          >
            See my read
          </button>
        )
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
