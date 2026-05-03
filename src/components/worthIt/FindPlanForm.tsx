'use client'

import { useState } from 'react'

export default function FindPlanForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/plan/find', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lookup failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-[#e8e3d4] rounded-xl p-6 text-sm text-[#1a1f1a]/85">
        If a Worth-It Plan exists for that email, we just sent the magic link.
        Check your inbox (and spam) within a few minutes.
      </div>
    )
  }

  return (
    <form
      className="bg-white border border-[#e8e3d4] rounded-xl p-6"
      onSubmit={e => {
        e.preventDefault()
        if (email) submit()
      }}
    >
      <label className="block text-sm font-medium mb-2">Email used at purchase</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="w-full bg-[#fbf8f1] border border-[#e8e3d4] rounded-md px-3 py-2 mb-4"
      />
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-4">{error}</p>}
      <button
        type="submit"
        disabled={!email || submitting}
        className="w-full bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg"
      >
        {submitting ? 'Sending…' : 'Email me my plan link'}
      </button>
    </form>
  )
}
