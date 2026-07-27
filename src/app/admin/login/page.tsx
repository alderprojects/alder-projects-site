'use client'

/**
 * v7.4.5 — Admin sign-in. Reuses the existing magic-link request
 * endpoint; the emailed link carries ?next=/admin so verification lands
 * back on the console. Any email may request a link — authorization
 * happens at the allowlist when the console renders.
 */

import { useState } from 'react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    try {
      const res = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next: '/admin' }),
      })
      const data = (await res.json()) as { ok: boolean }
      setStatus(data.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 400, margin: '90px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 20, marginBottom: 6 }}>Alder admin sign-in</h1>
      <p style={{ fontSize: 13.5, color: '#666', marginBottom: 24, lineHeight: 1.5 }}>
        One-time sign-in link by email. Admin access is allowlisted.
      </p>
      {status === 'sent' ? (
        <p style={{ fontSize: 14, background: '#e8f2e5', border: '1px solid #b8d4ad', borderRadius: 6, padding: '12px 14px' }}>
          Check your email — the link expires in 15 minutes and lands on /admin.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@alderprojects.com"
            disabled={status === 'submitting'}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              fontSize: 14,
              border: '1px solid #bbb',
              borderRadius: 6,
              marginBottom: 12,
            }}
          />
          {status === 'error' && (
            <p style={{ fontSize: 13, color: '#b91c1c', margin: '0 0 12px' }}>
              Something went wrong — try again in a moment.
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'submitting' || !email}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
              background: status === 'submitting' ? '#93a8dc' : '#1d4ed8',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {status === 'submitting' ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
      )}
    </main>
  )
}
