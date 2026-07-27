'use client'

/** v7.4.5 — create a QAFlag on the session from the detail page. */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FLAG_TYPES = ['HALLUCINATION', 'EXTRACTION_MISS', 'LANE_ERROR', 'PEOPLE_VISIBLE', 'OTHER'] as const

export default function FlagForm({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [type, setType] = useState<string>('HALLUCINATION')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/qa-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, type, note }),
      })
      const json = (await res.json()) as { ok: boolean; error?: string }
      if (!json.ok) {
        setError(json.error ?? 'failed')
      } else {
        setNote('')
        router.refresh()
      }
    } catch {
      setError('network')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 10, fontSize: 13 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 4 }}>
          {FLAG_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy} style={{ padding: '4px 12px', cursor: 'pointer' }}>
          {busy ? '…' : 'Flag'}
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="note (optional)"
        rows={2}
        style={{ width: '100%', boxSizing: 'border-box', padding: 6, fontSize: 12.5 }}
      />
      {error && <p style={{ color: '#b91c1c', fontSize: 12, margin: '4px 0 0' }}>{error}</p>}
    </form>
  )
}
