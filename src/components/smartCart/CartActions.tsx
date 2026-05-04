'use client'

// V7.1 — client island for the Smart Cart result page header.
//
// Hosts the Print, Download, and Share buttons + the "This cart isn't
// right" edit/respin panel. The result page itself stays server-
// rendered so the bulk of the cart data ships as static HTML; only
// the interactive bits hydrate.

import { useState } from 'react'
import { SCOPE_VARIANTS } from '@/lib/scope-variants'
import { CONFIG } from '@/lib/recommender-config'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

const MAX_RESPINS = 3

type Props = {
  cartId: string
  topic: TopicId
  initialScopeVariantId: string
  initialScenario: BriefScenarioId
  respinCount: number
}

export default function CartActions({
  cartId,
  topic,
  initialScopeVariantId,
  initialScenario,
  respinCount,
}: Props) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState(initialScopeVariantId)
  const [scenario, setScenario] = useState<BriefScenarioId>(initialScenario)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const variants = SCOPE_VARIANTS[topic] ?? []
  const respinsRemaining = MAX_RESPINS - respinCount
  const lockedOut = respinCount >= MAX_RESPINS

  function flashToast(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(null), 2500)
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/smart-cart/result/${cartId}`
    try {
      await navigator.clipboard.writeText(url)
      flashToast('Link copied to clipboard.')
    } catch {
      flashToast('Copy failed. Use the URL bar.')
    }
  }

  async function submitRespin() {
    if (lockedOut) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/smart-cart/${cartId}/respin`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scopeVariantId: scope, scenario }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Respin failed (${res.status})`)
      }
      // Re-render with the new content — easiest path is a full reload.
      window.location.reload()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Respin failed')
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="text-sm border border-[#e8e3d4] rounded-md px-3 py-2 hover:bg-[#f5efe2]"
        >
          Print
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="text-sm border border-[#e8e3d4] rounded-md px-3 py-2 hover:bg-[#f5efe2]"
        >
          Download
        </button>
        <button
          type="button"
          onClick={copyShareLink}
          className="text-sm border border-[#e8e3d4] rounded-md px-3 py-2 hover:bg-[#f5efe2]"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-[#1a1f1a]/65 hover:text-[#1a1f1a] underline-offset-2 hover:underline ml-1"
        >
          This cart isn&apos;t right
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="bg-white border border-[#e8e3d4] rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-[#1f3a2e]">
                Adjust your Smart Cart
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-[#1a1f1a]/60 hover:text-[#1a1f1a] text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-[#1a1f1a]/80 mb-4">
              Re-pick scope or scenario and we&apos;ll rebuild this cart in
              place. {respinsRemaining > 0
                ? `You have ${respinsRemaining} respin${respinsRemaining === 1 ? '' : 's'} left.`
                : 'No respins left.'}
            </p>

            {lockedOut ? (
              <div className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-md p-4 text-sm text-[#1a1f1a]/85">
                Still not right? Email{' '}
                <a className="underline" href="mailto:hello@alderprojects.com">
                  hello@alderprojects.com
                </a>{' '}
                for a refund — we refund liberally inside the{' '}
                {CONFIG.products.smartCart.refundWindowHours}-hour window.
              </div>
            ) : (
              <>
                <Field label="Project scope">
                  <select
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    className="w-full bg-white border border-[#e8e3d4] rounded-md px-3 py-2"
                  >
                    {variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Where you are with this project">
                  <select
                    value={scenario}
                    onChange={e => setScenario(e.target.value as BriefScenarioId)}
                    className="w-full bg-white border border-[#e8e3d4] rounded-md px-3 py-2"
                  >
                    {CONFIG.scenarios.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {error && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                    {error}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 border border-[#e8e3d4] rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitRespin}
                    disabled={submitting}
                    className="flex-1 bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white text-sm px-4 py-2.5 rounded-md"
                  >
                    {submitting ? 'Rebuilding…' : 'Rebuild my cart'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1f1a] text-white text-sm px-4 py-2 rounded-md shadow-lg z-50">
          {toast}
        </div>
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-[#1a1f1a] mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}
