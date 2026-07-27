'use client'

/**
 * v7.4.4 — disable/enable a recommendation from admin-lite.
 * v7.4.5 — session-cookie auth (no more adminToken in the URL).
 */

import { useState } from 'react'

export default function ToggleButton({
  recommendationId,
  disabled,
}: {
  recommendationId: string
  disabled: boolean
}) {
  const [isDisabled, setIsDisabled] = useState(disabled)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, disabled: !isDisabled }),
      })
      const json = await res.json()
      if (json.ok) setIsDisabled(json.disabledAt != null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 4,
        border: '1px solid #999',
        background: isDisabled ? '#e8f2e5' : '#f6e5e0',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {busy ? '…' : isDisabled ? 'Enable' : 'Disable'}
    </button>
  )
}
