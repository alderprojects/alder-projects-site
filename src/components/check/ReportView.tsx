'use client'

/**
 * v7.4.2f — The Alder Check report UI, extracted from CheckFlow so the
 * canonical /report/[id] page owns it. Works in two access modes:
 * same-device (anon cookie) and email-link (accessKey prop) — every
 * mutating call passes the key through so no journey ever hits a
 * login wall. There are no accounts in this product.
 */

import { useCallback, useState } from 'react'
import VerdictCard, { PALETTE, type VerdictCardData } from './VerdictCard'
import { fireFunnel } from '@/lib/check/funnel'

interface WireRec extends VerdictCardData {
  id?: string
  key: string
  clarifyingQuestions: Array<{ key: string; question: string }>
  smartCartEligible: boolean
  assumptions?: string[]
  limitations?: string[]
}

export interface ReportPayload {
  reportId: string
  tier: string
  status: string
  recommendations: WireRec[]
  lockedRecommendations: Array<{ verdict: string; title: string }>
  upsell: { eligible: boolean; buyCount: number }
  exclusionNotice: string | null
  recency: { flagged: boolean; detail?: string | null; question?: string }
  tenureQuestion: { key: string; question: string } | null
  changes?: Array<{ key: string; title: string; from: string; to: string }>
}

export default function ReportView({
  initialReport,
  accessKey,
}: {
  initialReport: ReportPayload
  accessKey?: string
}) {
  const [report, setReport] = useState<ReportPayload>(initialReport)
  const [busy, setBusy] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [deleted, setDeleted] = useState(false)

  const withKey = useCallback(
    (body: Record<string, unknown>) => (accessKey ? { ...body, key: accessKey } : body),
    [accessKey]
  )

  const answerQuestion = useCallback(
    async (questionKey: string, answerText: string, recommendationId?: string) => {
      setBusy(true)
      try {
        const res = await fetch('/api/photos/recommend/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withKey({ reportId: report.reportId, questionKey, answerText, recommendationId })),
        })
        const json = await res.json()
        if (json.ok) {
          setReport((prev) => ({
            ...prev,
            recommendations: json.recommendations,
            lockedRecommendations: json.lockedRecommendations,
            upsell: json.upsell,
            changes: json.changes,
            tenureQuestion: questionKey === 'tenure' ? null : prev.tenureQuestion,
            recency: questionKey === 'photos_current' ? { flagged: false } : prev.recency,
          }))
        }
      } finally {
        setBusy(false)
      }
    },
    [report.reportId, withKey]
  )

  const submitEmail = useCallback(async () => {
    if (!emailValue.trim()) return
    setEmailState('sending')
    try {
      const res = await fetch('/api/report/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withKey({ reportId: report.reportId, email: emailValue.trim() })),
      })
      const json = await res.json()
      if (json.ok) {
        setEmailState('done')
        if (json.recommendations) {
          setReport((prev) => ({ ...prev, tier: 'email', recommendations: json.recommendations, lockedRecommendations: [] }))
        }
      } else setEmailState('error')
    } catch {
      setEmailState('error')
    }
  }, [report.reportId, emailValue, withKey])

  const sendFeedback = useCallback(
    (useful: boolean, reason?: string) => {
      setFeedbackDone(true)
      fireFunnel('FEEDBACK_SUBMITTED', { reportId: report.reportId, useful })
      fetch('/api/report/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withKey({ reportId: report.reportId, useful, reason })),
      }).catch(() => {})
    },
    [report.reportId, withKey]
  )

  const deleteReport = useCallback(async () => {
    if (!window.confirm('Delete this report and its photos? This cannot be undone.')) return
    await fetch('/api/photos/recommend/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withKey({ reportId: report.reportId })),
    }).catch(() => {})
    setDeleted(true)
  }, [report.reportId, withKey])

  if (deleted) {
    return (
      <div style={boxStyle}>
        <p style={{ color: PALETTE.ink, fontSize: 16 }}>Your report and photos have been deleted.</p>
      </div>
    )
  }

  const buyCount = report.upsell.buyCount
  const cartHref = `/report/${report.reportId}/cart${accessKey ? `?key=${encodeURIComponent(accessKey)}` : ''}`

  return (
    <div style={{ ...boxStyle, textAlign: 'left' }}>
      {report.exclusionNotice && <p style={noticeStyle}>{report.exclusionNotice} Not stored, not analyzed.</p>}

      {report.changes && report.changes.length > 0 && (
        <div style={{ ...noticeStyle, background: '#eef4ec', borderColor: '#c7dcc0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <strong>Your answers changed the math:</strong>
          {report.changes.map((c) => (
            <span key={c.key} style={{ background: '#fff', border: '1px solid #c7dcc0', borderRadius: 999, padding: '3px 12px', fontSize: 13 }}>
              {c.title}: <s style={{ opacity: 0.6 }}>{c.from}</s> → <strong>{c.to}</strong>
            </span>
          ))}
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
                    <ImproveQuestion key={q.key} question={q.question} disabled={busy} onSubmit={(a) => void answerQuestion(q.key, a, rec.id)} />
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
        {busy && (
          <p style={{ fontSize: 13.5, color: PALETTE.inkSoft, textAlign: 'center' }}>Re-checking with your answer…</p>
        )}
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
            <p style={{ margin: 0, fontSize: 14, color: '#2d5a3d' }}>
              Unlocked — full report above. We also emailed you the whole report with a link that works on any device.
            </p>
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
          <p style={{ margin: '8px 0 0', fontSize: 12, color: PALETTE.inkSoft }}>
            No account, no password — we email you the full report and a link back to this page.
          </p>
        </div>
      )}

      {buyCount > 0 ? (
        <div style={{ background: PALETTE.green, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <p style={{ color: PALETTE.cream, fontSize: 15.5, margin: '0 0 10px', lineHeight: 1.5 }}>
            Your Check found <strong>{buyCount}</strong> thing{buyCount === 1 ? '' : 's'} worth buying. Smart Cart turns{' '}
            {buyCount === 1 ? 'it' : 'them'} into the exact products and specs — $19.99.
          </p>
          <a
            href={cartHref}
            onClick={() => fireFunnel('SMARTCART_UPSELL_CLICKED', { reportId: report.reportId, buyCount })}
            style={{ ...primaryBtn, background: PALETTE.gold, color: '#fff', textDecoration: 'none', display: 'inline-block' }}
          >
            Build My Smart Cart
          </a>
        </div>
      ) : (
        <div style={{ ...noticeStyle, marginBottom: 16 }}>
          Nothing worth buying right now — that’s the honest answer. Save this page (the email link works on any
          device) and re-check when the season or the symptoms change.
        </div>
      )}

      {!feedbackDone ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: PALETTE.inkSoft }}>
          Was this useful?
          <button onClick={() => sendFeedback(true)} style={secondaryBtn}>
            Yes
          </button>
          <button onClick={() => sendFeedback(false, 'not_really')} style={secondaryBtn}>
            Not really
          </button>
        </div>
      ) : (
        <p style={{ fontSize: 14, color: PALETTE.inkSoft }}>Thanks — that feedback tunes the engine.</p>
      )}

      <p style={{ marginTop: 18, fontSize: 12.5, color: PALETTE.inkSoft }}>
        Photos are analyzed only to create your report.{' '}
        <button
          onClick={() => void deleteReport()}
          style={{ background: 'none', border: 'none', padding: 0, color: '#8a3d2e', textDecoration: 'underline', cursor: 'pointer', fontSize: 12.5 }}
        >
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
