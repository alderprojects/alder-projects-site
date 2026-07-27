'use client'

/**
 * v7.4.8 — Post-result address + licensing-consent module. FLAG-GATED:
 * the server only passes `enabled` when ADDRESS_CAPTURE_ENABLED is on,
 * so with the flag off this component never renders and no DOM,
 * copy, or link exists.
 *
 * Honest framing (do not "improve" this copy without re-reading the
 * series brief): in this release the address does NOT change synthesis
 * output — parcel enrichment is backlogged. The value claimed is
 * therefore record continuity + future property-specific accuracy, and
 * the free Smart Cart is consideration for the LICENSING CONSENT
 * specifically, never for the address alone.
 */

import { useEffect, useState } from 'react'
import { PALETTE } from './VerdictCard'
import { fireFunnel } from '@/lib/check/funnel'

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI',
  'MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

export default function AddressModule({
  reportId,
  accessKey,
  prefillZip,
  consentText,
}: {
  reportId: string
  accessKey?: string
  prefillZip?: string | null
  /** The exact language hashed into ConsentRecord.textHash. */
  consentText: string
}) {
  const [open, setOpen] = useState(false)
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('VT')
  const [zip, setZip] = useState(prefillZip ?? '')
  const [consent, setConsent] = useState(false) // unchecked by default — never pre-check
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ creditCode?: string; creditIssued: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fireFunnel('ADDRESS_PROMPT_SHOWN', { reportId })
  }, [reportId])

  const valid = line1.trim() && city.trim() && /^\d{5}$/.test(zip)

  async function submit() {
    if (!valid || busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/report/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state,
          zip,
          licensingConsent: consent,
          ...(accessKey ? { key: accessKey } : {}),
        }),
      })
      const json = (await res.json()) as { ok: boolean; creditIssued?: boolean; creditCode?: string; error?: string }
      if (!json.ok) {
        setError(json.error ?? 'failed')
        return
      }
      setResult({ creditIssued: !!json.creditIssued, creditCode: json.creditCode })
    } catch {
      setError('network')
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    return (
      <div style={{ ...panel, background: '#eef4ec', borderColor: '#c7dcc0' }}>
        <p style={{ margin: 0, fontSize: 14.5, color: PALETTE.ink }}>
          {result.creditIssued
            ? 'Saved. Your free Smart Cart credit is below — it applies at checkout for this report.'
            : 'Address saved to this property’s read history. No permission was given for licensing, so no credit was issued.'}
        </p>
        {result.creditCode && (
          <p style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', color: PALETTE.green }}>
            {result.creditCode}
          </p>
        )}
      </div>
    )
  }

  if (!open) {
    return (
      <div style={panel}>
        <p style={{ margin: '0 0 8px', fontSize: 14.5, color: PALETTE.ink, fontWeight: 600 }}>
          Verify your address → save this property’s read history and get a free Smart Cart ($19.99 value).
        </p>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: PALETTE.inkSoft }}>
          Your address links this and future Checks to one property, so your read history stays together — and so
          upcoming property-specific accuracy can apply to it. It does not change the recommendations above.
        </p>
        <button onClick={() => setOpen(true)} style={btn}>
          Add my address
        </button>
      </div>
    )
  }

  return (
    <div style={panel}>
      <p style={{ margin: '0 0 10px', fontSize: 14.5, fontWeight: 600, color: PALETTE.ink }}>
        Verify your address
      </p>
      <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
        <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Street address" style={input} />
        <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apt, unit (optional)" style={input} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" style={{ ...input, flex: '2 1 140px' }} />
          <select value={state} onChange={(e) => setState(e.target.value)} style={{ ...input, flex: '0 0 76px' }}>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/[^\d]/g, ''))}
            maxLength={5}
            inputMode="numeric"
            placeholder="ZIP"
            style={{ ...input, flex: '0 0 84px' }}
          />
        </div>
      </div>

      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: PALETTE.ink, marginBottom: 10 }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
        <span>
          {consentText}{' '}
          <a href="/terms" style={{ color: PALETTE.green }}>
            Terms
          </a>{' '}
          ·{' '}
          <a href="/privacy" style={{ color: PALETTE.green }}>
            Privacy
          </a>
          <br />
          <span style={{ color: PALETTE.inkSoft, fontSize: 12 }}>
            The free Smart Cart is given in exchange for this permission. You can save your address without it — you
            just won&apos;t receive the credit. You can withdraw the permission at any time.
          </span>
        </span>
      </label>

      {error && <p style={{ fontSize: 12.5, color: '#8a3d2e', margin: '0 0 8px' }}>That didn&apos;t save ({error}). Try again.</p>}

      <button onClick={() => void submit()} disabled={!valid || busy} style={{ ...btn, opacity: valid && !busy ? 1 : 0.5 }}>
        {busy ? 'Saving…' : consent ? 'Save address + claim free Smart Cart' : 'Save address'}
      </button>
    </div>
  )
}

const panel: React.CSSProperties = {
  background: '#f3ecd9',
  border: '1px solid rgba(176,141,47,0.35)',
  borderRadius: 10,
  padding: '14px 16px',
  marginBottom: 16,
}

const input: React.CSSProperties = {
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid rgba(31,61,43,0.2)',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
}

const btn: React.CSSProperties = {
  background: PALETTE.green,
  color: PALETTE.cream,
  border: 'none',
  borderRadius: 8,
  padding: '9px 16px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
}
