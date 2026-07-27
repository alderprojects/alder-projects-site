'use client'

/** v7.4.5 — reviewed/unreviewed stamp on the session detail header. */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewButton({
  reportId,
  reviewedAt,
  reviewedBy,
  advanceTo,
}: {
  reportId: string
  reviewedAt: string | null
  reviewedBy: string | null
  /** v7.4.6 queue mode: after marking reviewed, jump here (next
   *  unreviewed session, or back to /admin/queue when none left). */
  advanceTo?: string
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
      if (json.ok) {
        if (!reviewed && advanceTo) router.push(advanceTo)
        else router.refresh()
      }
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
        {busy ? '…' : reviewed ? 'Mark unreviewed' : advanceTo ? 'Mark reviewed → next' : 'Mark reviewed'}
      </button>
    </span>
  )
}
