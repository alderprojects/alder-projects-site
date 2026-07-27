'use client'

/**
 * v7.4.2 — Client side of the report-cart page: compatibility-critical
 * questions (pre-filled from Check answers, never re-asked) + email +
 * Stripe checkout handoff.
 */

import { useState } from 'react'
import { fireFunnel } from '@/lib/check/funnel'

export interface CompatQuestion {
  recommendationId: string
  recTitle: string
  key: string
  question: string
  prefilledAnswer: string | null
}

export default function ReportCartCheckout({
  reportId,
  questions,
  defaultEmail,
}: {
  reportId: string
  questions: CompatQuestion[]
  defaultEmail: string
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q) => [`${q.recommendationId}:${q.key}`, q.prefilledAnswer ?? '']))
  )
  const [email, setEmail] = useState(defaultEmail)
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function startCheckout() {
    if (!email.trim()) {
      setErrorMsg('Enter an email — the cart is delivered there.')
      setState('error')
      return
    }
    setState('working')
    try {
      // Persist any newly-answered compatibility questions first — they
      // refine fit (and can change a verdict) before payment.
      for (const q of questions) {
        const val = answers[`${q.recommendationId}:${q.key}`]?.trim()
        if (val && val !== (q.prefilledAnswer ?? '')) {
          await fetch('/api/photos/recommend/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reportId,
              questionKey: q.key,
              answerText: val,
              recommendationId: q.recommendationId,
            }),
          }).catch(() => {})
        }
      }

      const res = await fetch('/api/report/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, email: email.trim() }),
      })
      const json = await res.json()
      if (!json.ok || !json.checkoutUrl) {
        setErrorMsg(json.error === 'no_buy_verdicts' ? 'This report has no Buy verdicts — there’s nothing to cart.' : 'Checkout failed — try again.')
        setState('error')
        return
      }
      window.location.href = json.checkoutUrl as string
    } catch {
      setErrorMsg('Checkout failed — try again.')
      setState('error')
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(31,61,43,0.14)', borderRadius: 12, padding: '20px 22px' }}>
      {questions.length > 0 && (
        <>
          <h3 style={{ margin: '0 0 4px', fontSize: 17, color: '#1f3d2b' }}>Compatibility check</h3>
          <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'rgba(34,48,31,0.68)' }}>
            Only the questions that affect fit. Anything you already answered is filled in.
          </p>
          {questions.map((q) => {
            const k = `${q.recommendationId}:${q.key}`
            return (
              <div key={k} style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 13.5, color: '#22301f', marginBottom: 4 }}>
                  <strong>{q.recTitle}:</strong> {q.question}
                </label>
                <input
                  value={answers[k] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [k]: e.target.value }))}
                  style={{ width: '100%', maxWidth: 360, padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(31,61,43,0.2)', fontSize: 14 }}
                />
              </div>
            )
          })}
        </>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com — cart delivered here"
          style={{ flex: '1 1 220px', maxWidth: 320, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(31,61,43,0.2)', fontSize: 14 }}
        />
        <button
          onClick={() => {
            fireFunnel('SMARTCART_UPSELL_CLICKED', { reportId, stage: 'checkout' })
            void startCheckout()
          }}
          disabled={state === 'working'}
          style={{
            background: '#1f3d2b',
            color: '#f6f2e8',
            border: 'none',
            borderRadius: 8,
            padding: '12px 22px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {state === 'working' ? 'Opening checkout…' : 'Get my Smart Cart — $19.99'}
        </button>
      </div>
      {state === 'error' && <p style={{ color: '#8a3d2e', fontSize: 13.5, marginTop: 8 }}>{errorMsg}</p>}
      <p style={{ fontSize: 12, color: 'rgba(34,48,31,0.55)', marginTop: 12 }}>
        If a compatibility answer rules a product out after purchase, we remove the line and refund its share. Product
        links in the cart are affiliate links (tag alderprojects-20) — that never changes a verdict.
      </p>
    </div>
  )
}
