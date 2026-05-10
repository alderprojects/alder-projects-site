'use client'

// v7.2.11 — photo beta signup form. POSTs to /api/photo-beta-signup
// which logs server-side. No real email integration in v7.2.11.

import { useState } from 'react'
import { trackResultPageEvent } from '@/lib/analytics'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export default function PhotoBetaSignupForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/.+@.+\..+/.test(email)) {
      setErrorMsg('Enter a valid email.')
      setStatus('error')
      return
    }
    setStatus('sending')
    setErrorMsg(null)
    try {
      const resp = await fetch('/api/photo-beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!resp.ok) throw new Error(`http ${resp.status}`)
      trackResultPageEvent('photo_beta_signup_submit')
      setStatus('ok')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-5">
        <strong>You&rsquo;re on the list.</strong> We&rsquo;ll email you when
        there&rsquo;s a photo beta to try. No spam — only when this is real.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#e8e3d4] rounded-xl p-5">
      <label htmlFor="photo-beta-email" className="block text-sm font-medium text-[#1a1f1a] mb-2">
        Email
      </label>
      <input
        id="photo-beta-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
        disabled={status === 'sending'}
        className="w-full px-3 py-2 border border-[#e8e3d4] rounded-lg focus:outline-none focus:border-[#1f3a2e] mb-3"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-[#1f3a2e] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#162a21] disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Join photo beta'}
      </button>
      {errorMsg && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  )
}
