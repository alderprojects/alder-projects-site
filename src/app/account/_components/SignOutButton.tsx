'use client'

import { useState } from 'react'

export default function SignOutButton() {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (busy) return
    setBusy(true)
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
    } finally {
      window.location.href = '/account/sign-in'
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
