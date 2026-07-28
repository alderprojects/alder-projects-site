'use client'

/** v7.4.9 — one-click revoke for a curation rule. */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RevokeButton({ ruleId }: { ruleId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function revoke() {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/curation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, action: 'revoke' }),
      })
      const json = (await res.json()) as { ok: boolean }
      if (json.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={revoke}
      disabled={busy}
      style={{
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 4,
        border: '1px solid #999',
        background: '#f6e5e0',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {busy ? '…' : 'Revoke'}
    </button>
  )
}
