'use client'

// V7.2.1 — small client island for the Worth-It coming-soon notify
// form. Posts to /api/worth-it/notify-me and shows a confirmation
// inline. Idempotent on the server, so duplicate submits are fine.

import { useState } from 'react'

export default function WorthItNotifyForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function isValidEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/worth-it/notify-me', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed (${res.status})`)
      }
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-md p-4 text-sm text-[#1a1f1a]/85">
        Thanks. You&apos;ll get one email when the new Worth-It Plan
        ships.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 bg-white border border-[#e8e3d4] rounded-md px-3 py-2.5 text-sm"
        autoComplete="email"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-md text-sm whitespace-nowrap"
      >
        {submitting ? 'Saving…' : 'Notify me'}
      </button>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 sm:basis-full">
          {error}
        </p>
      )}
    </form>
  )
}
