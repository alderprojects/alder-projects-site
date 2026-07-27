'use client'

/** v7.4.5 — reviewed/unreviewed stamp on the session detail header. */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewButton({
  reportId,
  reviewedAt,
  reviewedBy,
}: {
  reportId: string
  reviewedAt: string | null
  reviewedBy: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const reviewed = reviewedAt != null

  async function toggle() {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, reviewed: !reviewed }),
      })
      const json = (await res.json()) as { ok: boolean }
      if (json.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <span style={{ fontSize: 12.5 }}>
      {reviewed && (
        <span style={{ color: '#1f7a33', marginRight: 8 }}>
          reviewed {reviewedAt!.slice(0, 10)} by {reviewedBy ?? '—'}
        </span>
      )}
      <button
        onClick={toggle}
        disabled={busy}
        style={{
          padding: '4px 12px',
          fontSize: 12.5,
          borderRadius: 4,
          border: '1px solid #999',
          background: reviewed ? '#f6e5e0' : '#e8f2e5',
          cursor: 'pointer',
        }}
      >
        {busy ? '…' : reviewed ? 'Mark unreviewed' : 'Mark reviewed'}
      </button>
    </span>
  )
}
