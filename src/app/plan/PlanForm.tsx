'use client'
import { useState } from 'react'
export default function PlanForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const r = await fetch('/api/submit-project', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'nurture', email, source: 'plan_page' }),
      })
      setStatus(r.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }
  if (status === 'success') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#7A9B6F', fontSize: '18px' }}>&#10003;</span>
        <p style={{ color: 'rgba(245,239,224,0.7)', fontSize: '14px', margin: 0 }}>Sent to <strong style={{ color: '#F5EFE0' }}>{email}</strong> — check your inbox.</p>
      </div>
    )
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <input required type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
        style={{ flex: 1, minWidth: '200px', backgroundColor: 'rgba(45,74,42,0.4)', border: '1px solid rgba(122,155,111,0.3)', borderRadius: '2px', padding: '11px 14px', fontSize: '14px', color: '#F5EFE0', outline: 'none', fontFamily: "'DM Sans',system-ui,sans-serif" }}
      />
      <button type="submit" disabled={status==='submitting'}
        style={{ padding: '11px 22px', backgroundColor: status==='submitting'?'rgba(200,115,42,0.4)':'#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '2px', cursor: status==='submitting'?'not-allowed':'pointer', fontFamily: "'DM Sans',system-ui,sans-serif", whiteSpace: 'nowrap' }}>
        {status==='submitting' ? 'Sending…' : 'Send it to me →'}
      </button>
      {status==='error' && <p style={{ width: '100%', color: '#E87B7B', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>Something went wrong. Email hello@alderprojects.com.</p>}
    </form>
  )
}