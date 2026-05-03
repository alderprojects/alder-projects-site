'use client'

import { useState, type CSSProperties } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { trackEmailCapture } from '@/lib/analytics'

// Homepage email-capture form. Single instance on the homepage; same
// /api/chat capture_lead pattern that the property-page EmailCaptureCard
// uses. Promise + cadence copy come from CONFIG.homepage.emailCapture
// so we can change the language site-wide in one edit.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  bg: '#FAF7F2',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'
const FS = "'Playfair Display', Georgia, serif"

const inputStyle: CSSProperties = {
  padding: '12px 14px',
  border: `1px solid ${C.cardLine}`,
  borderRadius: 4,
  fontSize: 14,
  fontFamily: FB,
  color: C.ink,
  background: '#fff',
  outline: 'none',
  flex: 1,
  minWidth: 0,
}

export default function HomepageEmailCapture() {
  const cfg = CONFIG.homepage.emailCapture
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  if (!cfg.enabled) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture_lead',
          email: email.trim(),
          name: '(homepage capture)',
          source: 'homepage_email_capture',
          transcript: [],
        }),
      })
      if (res.ok) {
        setStatus('ok')
        trackEmailCapture({ source: 'homepage' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      data-component="homepage-email-capture"
      style={{
        backgroundColor: C.bg,
        padding: 'clamp(56px,8vw,96px) 24px',
        borderTop: `1px solid ${C.cardLine}`,
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p
          style={{
            fontSize: 11,
            fontFamily: FM,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: C.accent,
            margin: '0 0 10px',
          }}
        >
          Stay current
        </p>
        <h2
          style={{
            fontFamily: FS,
            fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.15,
            margin: '0 0 12px',
          }}
        >
          Vermont seasonal warnings, in your inbox.
        </h2>
        <p
          style={{
            fontSize: 14,
            fontFamily: FB,
            color: C.inkSoft,
            lineHeight: 1.6,
            margin: '0 0 6px',
          }}
        >
          {cfg.cadence}
        </p>
        <p
          style={{
            fontSize: 13,
            fontFamily: FB,
            color: C.inkFaint,
            lineHeight: 1.55,
            margin: '0 0 20px',
          }}
        >
          {cfg.promise}
        </p>

        {status === 'ok' ? (
          <p
            style={{
              fontSize: 14,
              fontFamily: FB,
              color: C.ink,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Got it — you are on the list. Reply to the welcome email if you want to tweak what you receive.
          </p>
        ) : (
          <form
            onSubmit={submit}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'stretch' }}
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Your email"
              required
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={status === 'sending' || !email.trim()}
              style={{
                padding: '12px 22px',
                border: 'none',
                background: status === 'sending' ? 'rgba(200,115,42,0.5)' : C.accent,
                color: '#FAF7F2',
                fontFamily: FB,
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 4,
                cursor: status === 'sending' ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Subscribe →'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p
            style={{
              fontSize: 12,
              fontFamily: FB,
              color: '#dc2626',
              margin: '10px 0 0',
            }}
          >
            Could not send. Try again in a moment.
          </p>
        )}
      </div>
    </section>
  )
}
