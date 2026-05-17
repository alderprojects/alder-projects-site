'use client'

import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')
  const [errorReason, setErrorReason] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorReason(null)
    try {
      const res = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { ok: boolean; reason?: string }
      if (!data.ok) {
        setStatus('error')
        setErrorReason(data.reason ?? 'unknown')
        return
      }
      setStatus('sent')
    } catch {
      setStatus('error')
      setErrorReason('network')
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-medium text-gray-900">Sign in to Alder Read</h1>
      <p className="mb-8 text-sm text-gray-600">
        Enter your email — we&apos;ll send you a one-time sign-in link. No password.
      </p>

      {status === 'sent' ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-medium">Check your email.</p>
          <p className="mt-1">
            If <span className="font-mono">{email}</span> is registered (or new), a sign-in link is on its
            way. It expires in 15 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
              disabled={status === 'submitting'}
            />
          </div>

          {status === 'error' && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              {errorReason === 'invalid_email'
                ? 'That email address doesn’t look valid. Try again?'
                : 'Something went wrong. Try again in a moment.'}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting' || !email}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {status === 'submitting' ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
      )}
    </main>
  )
}
