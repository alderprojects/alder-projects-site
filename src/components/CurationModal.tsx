'use client'

// CurationModal — 2-step modal that opens when 'Build My Smart Cart'
// or 'Get My Worth-It Plan' is clicked.
//
// Step 1: Project context (topic + scope variant + scenario, plus
//         optional address for Worth-It).
// Step 2: Email + price reminder.
//
// Submit posts to /api/smart-cart/checkout or /api/worth-it/checkout
// and redirects the browser to the returned Stripe Payment Link URL.

import { useEffect, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { SCOPE_VARIANTS, getV7Topics } from '@/lib/scope-variants'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

type ProductId = 'smart_cart' | 'worth_it'

const TOPIC_LABELS: Partial<Record<TopicId, string>> = {
  kitchen: 'Kitchen',
  weatherization: 'Weatherization',
  outdoor: 'Outdoor / Deck',
  heat_pump: 'Heat pump',
  bath: 'Bath',
}

export default function CurationModal() {
  const [open, setOpen] = useState(false)
  const [product, setProduct] = useState<ProductId>('smart_cart')
  const [step, setStep] = useState<1 | 2>(1)
  const [topic, setTopic] = useState<TopicId>('kitchen')
  const [scopeVariantId, setScopeVariantId] = useState<string>('')
  const [scenario, setScenario] = useState<BriefScenarioId>('just_starting')
  const [address, setAddress] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wire global open buttons via data attributes.
  useEffect(() => {
    function handler(e: Event) {
      const target = e.target as HTMLElement
      const btn = target.closest('[data-curation-modal-open]') as HTMLElement | null
      if (!btn) return
      e.preventDefault()
      const p = (btn.getAttribute('data-curation-modal-product') as ProductId) ?? 'smart_cart'
      setProduct(p)
      setStep(1)
      const t = (btn.getAttribute('data-curation-modal-topic') as TopicId) ?? 'kitchen'
      setTopic(t)
      const s = btn.getAttribute('data-curation-modal-scenario') as BriefScenarioId | null
      if (s) setScenario(s)
      setError(null)
      setOpen(true)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Default scope variant when topic changes.
  useEffect(() => {
    const list = SCOPE_VARIANTS[topic] ?? []
    if (!list.length) {
      setScopeVariantId('')
      return
    }
    if (!list.find(v => v.id === scopeVariantId)) {
      setScopeVariantId(list[0].id)
    }
  }, [topic, scopeVariantId])

  if (!open) return null

  const v7Topics = getV7Topics()
  const variants = SCOPE_VARIANTS[topic] ?? []
  const cfg = product === 'smart_cart' ? CONFIG.products.smartCart : CONFIG.products.worthIt
  const refundCopy =
    product === 'smart_cart'
      ? `${CONFIG.products.smartCart.refundWindowHours}-hour refund window`
      : `${CONFIG.products.worthIt.refundWindowDays}-day refund window`

  async function submit() {
    setSubmitting(true)
    setError(null)
    const endpoint =
      product === 'smart_cart' ? '/api/smart-cart/checkout' : '/api/worth-it/checkout'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          topic,
          scopeVariantId,
          scenario,
          address: product === 'worth_it' ? address || undefined : undefined,
          email,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Checkout failed (${res.status})`)
      }
      const json = (await res.json()) as { checkoutUrl?: string }
      if (!json.checkoutUrl) throw new Error('No checkout URL returned')
      window.location.href = json.checkoutUrl
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Checkout failed'
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-2xl text-[#1f3a2e]">{cfg.productName}</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[#1a1f1a]/60 hover:text-[#1a1f1a] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <Field label="Project topic">
              <select
                value={topic}
                onChange={e => setTopic(e.target.value as TopicId)}
                className="w-full bg-white border border-[#e8e3d4] rounded-md px-3 py-2"
              >
                {v7Topics.map(t => (
                  <option key={t} value={t}>
                    {TOPIC_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Project scope">
              <select
                value={scopeVariantId}
                onChange={e => setScopeVariantId(e.target.value)}
                className="w-full bg-white border border-[#e8e3d4] rounded-md px-3 py-2"
              >
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              {variants.find(v => v.id === scopeVariantId)?.description && (
                <p className="mt-2 text-xs text-[#1a1f1a]/70">
                  {variants.find(v => v.id === scopeVariantId)?.description}
                </p>
              )}
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

            {product === 'worth_it' && (
              <Field label="Lock to your Vermont property (optional)">
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St, Stowe, VT"
                  className="w-full bg-white border border-[#e8e3d4] rounded-md px-3 py-2"
                />
                <p className="mt-2 text-xs text-[#1a1f1a]/70">
                  We use this to surface your town tier, regulators, and town clerk
                  contacts on the dashboard. Skip to keep it generic.
                </p>
              </Field>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!scopeVariantId}
              className="w-full bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Where should we send your unlock link?">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-[#e8e3d4] rounded-md px-3 py-2"
              />
            </Field>

            <div className="bg-white border border-[#e8e3d4] rounded-md p-4 text-sm">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[#1a1f1a]/70">{cfg.productName}</span>
                <span className="font-display text-2xl text-[#1f3a2e]">${cfg.priceUsd}</span>
              </div>
              <p className="text-xs text-[#1a1f1a]/70">{refundCopy} · One-time · No account required</p>
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 border border-[#e8e3d4] rounded-lg text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!email || submitting}
                className="flex-1 bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Loading…' : 'Continue to checkout →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#1a1f1a] mb-2">{label}</span>
      {children}
    </label>
  )
}
