'use client'

/** v7.4.8 — revocation form for the do-not-sell page. */

import { useState } from 'react'

export default function RevokeForm() {
  const [reportId, setReportId] = useState('')
  const [key, setKey] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [detail, setDetail] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'busy' || !reportId.trim()) return
    setState('busy')
    setDetail(null)
    try {
      const res = await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: reportId.trim(), key: key.trim() || undefined }),
      })
      const json = (await res.json()) as { ok: boolean; revoked?: number; error?: string }
      if (json.ok) {
        setState('done')
      } else {
        setState('error')
        setDetail(json.error ?? null)
      }
    } catch {
      setState('error')
      setDetail('network')
    }
  }

  if (state === 'done') {
    return (
      <p style={{ background: '#eef4ec', border: '1px solid #c7dcc0', borderRadius: 8, padding: '12px 14px', fontSize: 14.5 }}>
        Done — your licensing permission is withdrawn. The record is excluded from every future licensing use starting
        now.
      </p>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
      <label style={{ fontSize: 13.5, color: '#444' }}>
        Report ID (in the link to your report)
        <input
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
          placeholder="cms3…"
          style={inputStyle}
          required
        />
      </label>
      <label style={{ fontSize: 13.5, color: '#444' }}>
        Access key (the <code>?key=</code> part of an emailed report link — only needed on a new device)
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="optional" style={inputStyle} />
      </label>
      {state === 'error' && (
        <p style={{ fontSize: 13, color: '#8a3d2e', margin: 0 }}>
          {detail === 'not_found'
            ? 'No active permission found for that report.'
            : detail === 'not_yours'
              ? "That report's permission isn't linked to this browser — paste the access key from your report email."
              : 'That didn’t work. Try again, or email hello@alderprojects.com.'}
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'busy' || !reportId.trim()}
        style={{
          background: '#1C2B1A',
          color: '#F5EFE0',
          border: 'none',
          borderRadius: 8,
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          justifySelf: 'start',
        }}
      >
        {state === 'busy' ? 'Withdrawing…' : 'Withdraw my permission'}
      </button>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 4,
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid #bbb',
  fontSize: 14,
}
