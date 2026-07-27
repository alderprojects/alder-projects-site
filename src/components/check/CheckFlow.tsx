'use client'

/**
 * v7.4.1 — The Alder Check flow. Renders in place on `/` after the
 * visitor picks photos (no interstitial, no second page before value).
 *
 * Stages: uploading → analyzing → report | error.
 *
 * - Uploads 1–5 photos through the existing multipart endpoint
 *   (auto-upload on select, "Add another photo", auto-continue after a
 *   short delay), then runs the full-depth report pipeline.
 * - Renders: exclusion notice, recency question, tenure fork (always
 *   first when unknown), 2 free verdict cards + locked stubs, email
 *   unlock, Smart Cart upsell (only when the report has ≥1 BUY —
 *   zero-BUY reports get save-this-report copy instead), lightweight
 *   feedback, and the delete-my-report control.
 * - "Improve this recommendation" answers re-run enrichment server-side
 *   and surface what changed.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import VerdictCard, { PALETTE, type VerdictCardData } from './VerdictCard'
import { fireFunnel } from '@/lib/check/funnel'

const CONSENTS = JSON.stringify({
  product_improvement: true,
  valuation_research: true,
  public_content_use: false,
})

const MAX_PHOTOS = 5
const AUTO_CONTINUE_MS = 2500

interface WireRec extends VerdictCardData {
  id?: string
  key: string
  clarifyingQuestions: Array<{ key: string; question: string }>
  smartCartEligible: boolean
  assumptions?: string[]
  limitations?: string[]
}

interface ReportState {
  reportId: string
  tier: string
  recommendations: WireRec[]
  lockedRecommendations: Array<{ verdict: string; title: string }>
  upsell: { eligible: boolean; buyCount: number }
  exclusionNotice: string | null
  recency: { flagged: boolean; detail?: string | null; question?: string }
  tenureQuestion: { key: string; question: string } | null
  changes?: Array<{ key: string; title: string; from: string; to: string }>
}

type Stage = 'uploading' | 'analyzing' | 'report' | 'error'

const ANALYZE_COPY = ['Looking at the room…', 'Comparing cost and likely benefit…', 'Checking Vermont costs and rebates…']

export default function CheckFlow({ initialFiles }: { initialFiles: File[] }) {
  const [stage, setStage] = useState<Stage>('uploading')
  const [thumbs, setThumbs] = useState<string[]>([])
  const [uploadedCount, setUploadedCount] = useState(0)
  const [statusCopy, setStatusCopy] = useState('Uploading photo…')
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ReportState | null>(null)
  const [context, setContext] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [deleted, setDeleted] = useState(false)

  const snapshotIdsRef = useRef<Set<string>>(new Set())
  const projectIdRef = useRef<string | null>(null)
  const pendingFilesRef = useRef<File[]>([])
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedRef = useRef(false)
  const contextRef = useRef('')
  const addInputRef = useRef<HTMLInputElement | null>(null)

  contextRef.current = context

  const uploadOne = useCallback(async (file: File): Promise<void> => {
    const form = new FormData()
    form.append('image', file)
    form.append('consents', CONSENTS)
    if (projectIdRef.current) form.append('projectId', projectIdRef.current)
    if (contextRef.current.trim()) form.append('userIntent', contextRef.current.trim().slice(0, 500))
    const res = await fetch('/api/photos/upload', { method: 'POST', body: form })
    const json = (await res.json()) as { ok: boolean; projectId?: string; snapshotId?: string; error?: string; detail?: string }
    if (!json.ok || !json.snapshotId) {
      throw new Error(json.detail || json.error || 'upload_failed')
    }
    projectIdRef.current = json.projectId ?? projectIdRef.current
    snapshotIdsRef.current.add(json.snapshotId)
    setUploadedCount((n) => n + 1)
  }, [])

  const runReport = useCallback(async () => {
    setStage('analyzing')
    let i = 0
    setStatusCopy(ANALYZE_COPY[0])
    const ticker = setInterval(() => {
      i = Math.min(i + 1, ANALYZE_COPY.length - 1)
      setStatusCopy(ANALYZE_COPY[i])
    }, 6000)
    try {
      const res = await fetch('/api/photos/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotIds: Array.from(snapshotIdsRef.current),
          userPrompt: contextRef.current.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.detail || json.error || 'report_failed')
      setReport(json as ReportState)
      setStage('report')
      fireFunnel('RECS_VIEWED', { reportId: json.reportId, buyCount: json.upsell?.buyCount ?? 0 })
    } catch (e) {
      setError((e as Error).message)
      setStage('error')
    } finally {
      clearInterval(ticker)
    }
  }, [])

  const drainQueue = useCallback(async () => {
    while (pendingFilesRef.current.length > 0 && snapshotIdsRef.current.size + 1 <= MAX_PHOTOS) {
      const file = pendingFilesRef.current.shift() as File
      setStatusCopy('Uploading photo…')
      try {
        await uploadOne(file)
      } catch (e) {
        setError((e as Error).message)
        setStage('error')
        return
      }
    }
    // Auto-continue after a short pause unless more photos get added.
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    setStatusCopy('Photo received. Add another, or we’ll start your Check in a moment…')
    autoTimerRef.current = setTimeout(() => {
      void runReport()
    }, AUTO_CONTINUE_MS)
  }, [uploadOne, runReport])

  const enqueueFiles = useCallback(
    (files: File[]) => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
      const room = MAX_PHOTOS - snapshotIdsRef.current.size - pendingFilesRef.current.length
      const accepted = files.slice(0, Math.max(0, room))
      for (const f of accepted) {
        setThumbs((t) => [...t, URL.createObjectURL(f)])
      }
      pendingFilesRef.current.push(...accepted)
      void drainQueue()
    },
    [drainQueue]
  )

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    fireFunnel('PHOTO_UPLOAD_STARTED', { source: 'homepage_hero', count: initialFiles.length })
    enqueueFiles(initialFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const answerQuestion = useCallback(
    async (questionKey: string, answerText: string, recommendationId?: string) => {
      if (!report) return
      setBusy(true)
      try {
        const res = await fetch('/api/photos/recommend/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId: report.reportId, questionKey, answerText, recommendationId }),
        })
        const json = await res.json()
        if (json.ok) {
          setReport((prev) =>
            prev
              ? {
                  ...prev,
                  recommendations: json.recommendations,
                  lockedRecommendations: json.lockedRecommendations,
                  upsell: json.upsell,
                  changes: json.changes,
                  tenureQuestion: questionKey === 'tenure' ? null : prev.tenureQuestion,
                  recency: questionKey === 'photos_current' ? { flagged: false } : prev.recency,
                }
              : prev
          )
        }
      } finally {
        setBusy(false)
      }
    },
    [report]
  )

  const submitEmail = useCallback(async () => {
    if (!report || !emailValue.trim()) return
    setEmailState('sending')
    try {
      const res = await fetch('/api/report/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.reportId, email: emailValue.trim() }),
      })
      const json = await res.json()
      if (json.ok) {
        setEmailState('done')
        if (json.recommendations) {
          setReport((prev) =>
            prev
              ? { ...prev, tier: 'email', recommendations: json.recommendations, lockedRecommendations: [] }
              : prev
          )
        }
      } else {
        setEmailState('error')
      }
    } catch {
      setEmailState('error')
    }
  }, [report, emailValue])

  const sendFeedback = useCallback(
    async (useful: boolean, reason?: string) => {
      if (!report) return
      setFeedbackDone(true)
      fireFunnel('FEEDBACK_SUBMITTED', { reportId: report.reportId, useful })
      fetch('/api/report/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.reportId, useful, reason }),
      }).catch(() => {})
    },
    [report]
  )

  const deleteReport = useCallback(async () => {
    if (!report) return
    if (!window.confirm('Delete this report and its photos? This cannot be undone.')) return
    await fetch('/api/photos/recommend/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: report.reportId }),
    }).catch(() => {})
    setDeleted(true)
  }, [report])

  // ── Render ──────────────────────────────────────────────────────────

  if (deleted) {
    return (
      <div style={boxStyle}>
        <p style={{ color: PALETTE.ink, fontSize: 16 }}>Your report and photos have been deleted.</p>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div style={boxStyle}>
        <p style={{ color: '#8a3d2e', fontSize: 15 }}>
          Something went wrong reading your photos: {error}. Refresh and try again — nothing was charged, nothing is
          stored without a report.
        </p>
      </div>
    )
  }

  if (stage === 'uploading' || stage === 'analyzing') {
    return (
      <div style={boxStyle}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          {thumbs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Photo ${i + 1}`}
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: `1px solid ${PALETTE.line}` }}
            />
          ))}
        </div>
        <p style={{ color: PALETTE.ink, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{statusCopy}</p>
        <p style={{ color: PALETTE.inkSoft, fontSize: 13, marginBottom: 14 }}>
          {uploadedCount} of {Math.min(thumbs.length, MAX_PHOTOS)} photo{thumbs.length === 1 ? '' : 's'} received
        </p>
        {stage === 'uploading' && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {thumbs.length < MAX_PHOTOS && (
              <>
                <input
                  ref={addInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? [])
                    if (files.length > 0) enqueueFiles(files)
                    e.target.value = ''
                  }}
                />
                <button onClick={() => addInputRef.current?.click()} style={secondaryBtn}>
                  Add another photo
                </button>
              </>
            )}
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Optional: any context? (“just moved in, propane boiler”)"
              style={{
                flex: '1 1 260px',
                maxWidth: 380,
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${PALETTE.line}`,
                fontSize: 14,
              }}
            />
          </div>
        )}
      </div>
    )
  }

  if (!report) return null

  const buyCount = report.upsell.buyCount

  return (
    <div style={{ ...boxStyle, textAlign: 'left' }}>
      <h2 style={{ fontSize: 22, color: PALETTE.green, margin: '0 0 4px', fontWeight: 700 }}>Your Alder Check</h2>
      <p style={{ color: PALETTE.inkSoft, fontSize: 14, margin: '0 0 16px' }}>
        {report.recommendations.length + report.lockedRecommendations.length} findings ·{' '}
        {buyCount} worth buying · honest about the rest
      </p>

      {report.exclusionNotice && (
        <p style={noticeStyle}>{report.exclusionNotice} Not stored, not analyzed.</p>
      )}

      {report.changes && report.changes.length > 0 && (
        <div style={{ ...noticeStyle, background: '#eef4ec', borderColor: '#c7dcc0' }}>
          <strong>What changed:</strong>{' '}
          {report.changes.map((c) => `${c.title}: ${c.from} → ${c.to}`).join(' · ')}
        </div>
      )}

      {report.recency.flagged && (
        <QuestionRow
          question={report.recency.question ?? 'Are these photos current?'}
          options={[
            { label: 'Yes, current', value: 'yes_current' },
            { label: 'No, older photos', value: 'not_current' },
          ]}
          disabled={busy}
          onAnswer={(v) => void answerQuestion('photos_current', v)}
        />
      )}

      {report.tenureQuestion && (
        <QuestionRow
          question={report.tenureQuestion.question}
          options={[
            { label: 'Own', value: 'own' },
            { label: 'Rent', value: 'rent' },
          ]}
          disabled={busy}
          onAnswer={(v) => void answerQuestion('tenure', v)}
        />
      )}

      <div style={{ display: 'grid', gap: 14, margin: '16px 0' }}>
        {report.recommendations.map((rec) => (
          <div key={rec.key}>
            <VerdictCard
              data={rec}
              onAffiliateClick={() => fireFunnel('AFFILIATE_CLICKED', { reportId: report.reportId, recKey: rec.key })}
            />
            {rec.clarifyingQuestions.length > 0 && (
              <details style={{ marginTop: 6 }}>
                <summary style={{ fontSize: 13.5, color: PALETTE.green, cursor: 'pointer', fontWeight: 600 }}>
                  Improve this recommendation
                </summary>
                <div style={{ padding: '8px 0 0' }}>
                  {rec.clarifyingQuestions.map((q) => (
                    <ImproveQuestion
                      key={q.key}
                      question={q.question}
                      disabled={busy}
                      onSubmit={(answer) => void answerQuestion(q.key, answer, rec.id)}
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>

      {report.lockedRecommendations.length > 0 && (
        <div style={{ border: `1px dashed ${PALETTE.gold}`, borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', color: PALETTE.ink, fontSize: 15, fontWeight: 600 }}>
            {report.lockedRecommendations.length} more finding
            {report.lockedRecommendations.length === 1 ? '' : 's'} in your Check:
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 18, color: PALETTE.inkSoft, fontSize: 14 }}>
            {report.lockedRecommendations.map((l, i) => (
              <li key={i}>
                <strong>{l.verdict}</strong> — {l.title}
              </li>
            ))}
          </ul>
          {emailState === 'done' ? (
            <p style={{ margin: 0, fontSize: 14, color: '#2d5a3d' }}>Unlocked — full report above. We also emailed you a link to it.</p>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="you@email.com"
                style={{ flex: '1 1 200px', maxWidth: 300, padding: '10px 12px', borderRadius: 8, border: `1px solid ${PALETTE.line}`, fontSize: 14 }}
              />
              <button onClick={() => void submitEmail()} disabled={emailState === 'sending'} style={primaryBtn}>
                {emailState === 'sending' ? 'Unlocking…' : 'Unlock the full report — free'}
              </button>
              {emailState === 'error' && <span style={{ fontSize: 13, color: '#8a3d2e' }}>That didn’t work — check the email address.</span>}
            </div>
          )}
        </div>
      )}

      {buyCount > 0 ? (
        <div style={{ background: PALETTE.green, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <p style={{ color: PALETTE.cream, fontSize: 15.5, margin: '0 0 10px', lineHeight: 1.5 }}>
            Your Check found <strong>{buyCount}</strong> thing{buyCount === 1 ? '' : 's'} worth buying. Smart Cart turns{' '}
            {buyCount === 1 ? 'it' : 'them'} into the exact products and specs — $19.99.
          </p>
          <a
            href={`/report/${report.reportId}/cart`}
            onClick={() => fireFunnel('SMARTCART_UPSELL_CLICKED', { reportId: report.reportId, buyCount })}
            style={{ ...primaryBtn, background: PALETTE.gold, color: '#fff', textDecoration: 'none', display: 'inline-block' }}
          >
            Build My Smart Cart
          </a>
        </div>
      ) : (
        <div style={{ ...noticeStyle, marginBottom: 16 }}>
          Nothing worth buying right now — that’s the honest answer. Unlock the full report above and we’ll save it so
          you can re-check when something changes.
        </div>
      )}

      {!feedbackDone ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: PALETTE.inkSoft }}>
          Was this useful?
          <button onClick={() => void sendFeedback(true)} style={secondaryBtn}>
            Yes
          </button>
          <button onClick={() => void sendFeedback(false, 'not_really')} style={secondaryBtn}>
            Not really
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 14, color: PALETTE.inkSoft }}>Thanks — that feedback tunes the engine.</p>
      )}

      <p style={{ marginTop: 18, fontSize: 12.5, color: PALETTE.inkSoft }}>
        Photos are analyzed only to create your report.{' '}
        <button onClick={() => void deleteReport()} style={{ background: 'none', border: 'none', padding: 0, color: '#8a3d2e', textDecoration: 'underline', cursor: 'pointer', fontSize: 12.5 }}>
          Delete my report and photos
        </button>
      </p>
    </div>
  )
}

function QuestionRow({
  question,
  options,
  onAnswer,
  disabled,
}: {
  question: string
  options: Array<{ label: string; value: string }>
  onAnswer: (value: string) => void
  disabled: boolean
}) {
  return (
    <div style={{ ...noticeStyle, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 600 }}>{question}</span>
      {options.map((o) => (
        <button key={o.value} onClick={() => onAnswer(o.value)} disabled={disabled} style={secondaryBtn}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function ImproveQuestion({
  question,
  onSubmit,
  disabled,
}: {
  question: string
  onSubmit: (answer: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState('')
  const [sent, setSent] = useState(false)
  if (sent) return <p style={{ fontSize: 13, color: '#2d5a3d', margin: '4px 0' }}>Answered — updating your Check…</p>
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0', flexWrap: 'wrap' }}>
      <label style={{ fontSize: 13.5, color: PALETTE.ink }}>{question}</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${PALETTE.line}`, fontSize: 13.5, flex: '1 1 160px', maxWidth: 240 }}
      />
      <button
        onClick={() => {
          if (value.trim()) {
            setSent(true)
            onSubmit(value.trim())
          }
        }}
        disabled={disabled}
        style={secondaryBtn}
      >
        Answer
      </button>
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

const noticeStyle: React.CSSProperties = {
  background: '#f3ecd9',
  border: '1px solid rgba(176,141,47,0.35)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: PALETTE.ink,
  marginBottom: 12,
}

const primaryBtn: React.CSSProperties = {
  background: PALETTE.green,
  color: PALETTE.cream,
  border: 'none',
  borderRadius: 8,
  padding: '10px 18px',
  fontSize: 14.5,
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
}
