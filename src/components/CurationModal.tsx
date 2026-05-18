'use client'

// CurationModal — multi-step intake that opens when 'Build My Smart Cart'
// or 'Get My Worth-It Plan' is clicked.
//
// V7.1 step structure:
//   Step 0 — email-first capture (fires /api/intent/start fire-and-forget)
//   Step 1 — topic / scope / scenario / address (existing fields)
//   Step 2 — Sneak Peek (DynamicExampleCard, recomputed for the actual
//            selection via /api/intent/teaser)
//   Step 3 — Payment confirmation + Continue to checkout
//
// Submit posts to /api/smart-cart/checkout or /api/worth-it/checkout
// and redirects the browser to the returned Stripe Payment Link URL.

import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'
import { SCOPE_VARIANTS, getV7Topics } from '@/lib/scope-variants'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'
import type { IntentTeaser } from '@/lib/intent-config'
import type { CartTier } from '@/lib/smart-cart-model'
import {
  trackCurationModalOpen,
  trackCurationModalPrefilled,
} from '@/lib/analytics'
import DynamicExampleCard from './intent/DynamicExampleCard'
import { PhotoPanel, type PreviewMeta } from './smartCart/PhotoPanel'

// v7.3.4-PR2: feature flag for the photo side panel. Off by default
// until v7.3.4-PR3 lands Stripe webhook routing — without webhook
// routing a paid visitor coming through the photo path would get a
// v1 cart synthesized from the inferred topic, not the v3
// LearningStore cart their photos warrant. Flip to 'true' (or any
// truthy string) after PR3.
const PHOTO_PANEL_ENABLED =
  process.env.NEXT_PUBLIC_PHOTO_PANEL_ENABLED === 'true'

type ProductId = 'smart_cart' | 'worth_it'
type Step = 0 | 1 | 2 | 3

const TOPIC_LABELS: Partial<Record<TopicId, string>> = {
  kitchen: 'Kitchen',
  weatherization: 'Weatherization',
  outdoor: 'Outdoor / Deck',
  heat_pump: 'Heat pump',
  bath: 'Bath',
}

const SCENARIO_LABELS: Record<BriefScenarioId, string> = {
  just_starting: 'Just starting',
  already_have_basics: 'Already have basics',
  tight_budget: 'Tight budget',
  premium: 'Premium',
  lake_property: 'Lake property',
  // v7.2.5 — implicit scenarios; surfaced by intent-config when
  // scope-specific (pastes 2-4).
  absentee_owner: 'Absentee owner',
  pre_winter_prep: 'Pre-winter prep',
  spring_opening: 'Spring opening',
  mud_season: 'Mud season',
}

export default function CurationModal() {
  const [open, setOpen] = useState(false)
  const [product, setProduct] = useState<ProductId>('smart_cart')
  const [step, setStep] = useState<Step>(0)
  const [topic, setTopic] = useState<TopicId>('kitchen')
  const [scopeVariantId, setScopeVariantId] = useState<string>('')
  const [scenario, setScenario] = useState<BriefScenarioId>('just_starting')
  const [address, setAddress] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teaser, setTeaser] = useState<IntentTeaser | null>(null)
  const [teaserLoading, setTeaserLoading] = useState(false)
  // V7.2.1 — data plumbing for the v2 model. State-probe UI ships in
  // v7.2.2; for now these read from optional data attributes on the
  // open-button so callers can pre-fill them. When unset, the
  // checkout endpoint fills them from SCENARIO_DEFAULTS.
  const [selectedTier, setSelectedTier] = useState<CartTier | undefined>(undefined)
  const [alreadyHave, setAlreadyHave] = useState<string[] | undefined>(undefined)
  // v7.3.4-PR2: photo side panel state.
  const [photoPanelOpen, setPhotoPanelOpen] = useState(false)
  // Set when the visitor arrives at step 3 via the photo panel
  // (rather than the chat-driven topic picker). Drives a small
  // banner on step 3 confirming the topic was inferred from photos.
  const [photoPrefilledFromPanel, setPhotoPrefilledFromPanel] = useState(false)
  // Captured from the panel for downstream telemetry on submit
  // (PR3 reads this and stamps Stripe metadata.product_source).
  const [photoPreviewMeta, setPhotoPreviewMeta] = useState<PreviewMeta | null>(null)

  // V7.2.2 — guard for the modal-open race. The "default scope when
  // topic changes" effect runs after each commit and used to stomp
  // an explicitly-passed data-curation-modal-scope when the prior
  // scope state didn't match the new topic's variants. The ref lets
  // the open handler signal "the scope I just set is intentional;
  // skip the next auto-default tick".
  const explicitlySetScopeRef = useRef(false)

  // Wire global open buttons via data attributes.
  useEffect(() => {
    function handler(e: Event) {
      const target = e.target as HTMLElement
      const btn = target.closest('[data-curation-modal-open]') as HTMLElement | null
      if (!btn) return
      e.preventDefault()
      const requested = btn.getAttribute('data-curation-modal-product')
      // V7.2.1 — Worth-It is paused. Any leftover worth_it open-button
      // redirects to the coming-soon page instead of opening the modal.
      if (requested === 'worth_it') {
        window.location.href = '/worth-it'
        return
      }
      const p: ProductId = 'smart_cart'
      setProduct(p)
      setStep(0)
      setTeaser(null)
      const t = (btn.getAttribute('data-curation-modal-topic') as TopicId) ?? 'kitchen'
      setTopic(t)
      const sc = btn.getAttribute('data-curation-modal-scope')
      if (sc) {
        setScopeVariantId(sc)
        // V7.2.2 — flag this explicit set so the topic-change effect
        // doesn't immediately reset us to list[0] when the prior
        // scopeVariantId state belongs to a different topic.
        explicitlySetScopeRef.current = true
      }
      const s = btn.getAttribute('data-curation-modal-scenario') as BriefScenarioId | null
      if (s) setScenario(s)
      const addr = btn.getAttribute('data-curation-modal-address')
      if (addr) setAddress(addr)
      // V7.2.1 — optional v2 data plumbing.
      const tierAttr = btn.getAttribute('data-curation-modal-tier') as CartTier | null
      setSelectedTier(tierAttr ?? undefined)
      const haveAttr = btn.getAttribute('data-curation-modal-already-have')
      setAlreadyHave(
        haveAttr
          ? haveAttr.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
      )
      setError(null)
      // v7.2.15 — fire modal_open and (when prefilled) modal_prefilled.
      // sourcePath comes from window.location, sourceComponent from the
      // nearest data-source-component on the open button if present.
      try {
        const sourceComponent =
          btn.getAttribute('data-source-component') ??
          btn.closest('[data-source-component]')?.getAttribute('data-source-component') ??
          undefined
        const sourcePath = window.location.pathname
        trackCurationModalOpen({
          product: 'smart_cart',
          topic: t,
          scopeVariantId: sc ?? undefined,
          scenario: s ?? undefined,
          sourcePath,
          sourceComponent,
        })
        if (sc || s) {
          trackCurationModalPrefilled({
            product: 'smart_cart',
            topic: t,
            scopeVariantId: sc ?? undefined,
            scenario: s ?? undefined,
            prefillSource: 'data_attrs',
          })
        }
      } catch {
        // analytics is best-effort
      }
      setOpen(true)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Default scope variant when topic changes.
  useEffect(() => {
    // v7.2.14: only consider ready variants when defaulting, otherwise
    // the modal could land on a stub scope and 500 on result render.
    const list = (SCOPE_VARIANTS[topic] ?? []).filter(v => v.smartCartReady)
    if (!list.length) {
      setScopeVariantId('')
      return
    }
    // V7.2.2 — if the open handler just set scope explicitly, don't
    // overwrite it. Consume the flag so subsequent topic changes
    // (when the user picks a different topic in the dropdown) still
    // auto-default to the first variant of the new topic.
    if (explicitlySetScopeRef.current) {
      explicitlySetScopeRef.current = false
      return
    }
    if (!list.find(v => v.id === scopeVariantId)) {
      setScopeVariantId(list[0].id)
    }
  }, [topic, scopeVariantId])

  // V7.2.2 — reset the explicit-scope flag whenever the modal closes,
  // so a subsequent open with no data-curation-modal-scope attribute
  // gets fresh auto-default behavior.
  useEffect(() => {
    if (!open) {
      explicitlySetScopeRef.current = false
    }
  }, [open])

  if (!open) return null

  const v7Topics = getV7Topics()
  // v7.2.14: filter to ready variants only so non-launched scopes
  // (smartCartReady=false) cannot be selected and 500 the result page.
  const variants = (SCOPE_VARIANTS[topic] ?? []).filter(v => v.smartCartReady)
  const cfg = product === 'smart_cart' ? CONFIG.products.smartCart : CONFIG.products.worthIt
  const refundCopy =
    product === 'smart_cart'
      ? `${CONFIG.products.smartCart.refundWindowHours}-hour refund window`
      : `${CONFIG.products.worthIt.refundWindowDays}-day refund window`
  const scopeLabel =
    variants.find(v => v.id === scopeVariantId)?.label ?? scopeVariantId

  function isValidEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
  }

  async function continueFromEmail() {
    setError(null)
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    // Fire-and-forget intent start. Don't block UX on this.
    const sourcePageUrl =
      typeof window !== 'undefined' ? window.location.href : ''
    void fetch('/api/intent/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, product, sourcePageUrl }),
    }).catch(() => {
      /* swallow — intent capture is best-effort */
    })
    setStep(1)
  }

  async function continueToSneakPeek() {
    setError(null)
    setTeaserLoading(true)
    setStep(2)
    try {
      const params = new URLSearchParams({
        product,
        topic,
        scope: scopeVariantId,
        scenario,
      })
      const res = await fetch(`/api/intent/teaser?${params.toString()}`)
      if (!res.ok) throw new Error(`Teaser fetch failed (${res.status})`)
      const data = (await res.json()) as { teaser?: IntentTeaser }
      if (!data.teaser) throw new Error('No teaser returned')
      setTeaser(data.teaser)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not load preview'
      setError(msg)
    } finally {
      setTeaserLoading(false)
    }
  }

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
          // V7.2.1 — pass through optional v2 model probe values.
          // Server fills SCENARIO_DEFAULTS when these are undefined.
          selectedTier,
          alreadyHave,
          // v7.3.4-PR2: include photo-source hint when the visitor
          // arrived via the side panel. PR3 reads this on the Stripe
          // checkout payload + bakes into webhook metadata so the
          // post-payment synthesizer runs v3 against the visitor's
          // extracted features instead of v1 against topic/scope.
          // Until PR3 ships, the checkout route ignores these fields
          // (no schema break) so PR2 is safely deploy-able.
          productSource: photoPrefilledFromPanel ? 'photo' : 'chat',
          photoPreviewMeta: photoPreviewMeta ?? undefined,
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
      <div className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
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

        {/* v7.3.4-PR2: photo side panel entry. v7.3.4-PR3.7 §1.10
            promoted from a small text link to a noticeable secondary
            CTA — visible weight, full-width button with emerald
            border, sits between the modal header and the step
            indicator so it's hard to miss on first scan. Shown on
            steps 0-1 (before the visitor has committed to a topic);
            disappears once the visitor has invested in scope picking
            so it doesn't compete with the primary path. Flag-gated
            until v7.3.4-PR3 webhook routing lands. */}
        {PHOTO_PANEL_ENABLED && (step === 0 || step === 1) && (
          <button
            type="button"
            onClick={() => {
              setPhotoPanelOpen(true)
              void fetch('/api/events/funnel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventType: 'PHOTO_PANEL_OPENED',
                  payload: { source: 'curation_modal_button', stepWhenOpened: step },
                }),
                keepalive: true,
              }).catch(() => {})
            }}
            className="mb-4 w-full rounded-lg border-2 border-emerald-700 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            Have photos? Upload them instead →
          </button>
        )}

        <StepIndicator step={step} />

        {step === 0 && (
          <div className="space-y-5">
            <Field label="Where should we send your unlock link?">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-[#e8e3d4] rounded-md px-3 py-2"
              />
              <p className="mt-2 text-xs text-[#1a1f1a]/70">
                We email the link the moment your {cfg.productName.toLowerCase()} is ready.
                We never sell your email.
              </p>
            </Field>
            {error && <ErrorBanner text={error} />}
            <button
              type="button"
              onClick={continueFromEmail}
              className="w-full bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="px-4 py-3 border border-[#e8e3d4] rounded-lg text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={continueToSneakPeek}
                disabled={!scopeVariantId}
                className="flex-1 bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Show my sneak peek →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {teaserLoading && (
              <p className="text-sm text-[#1a1f1a]/70">Building your preview…</p>
            )}
            {error && <ErrorBanner text={error} />}
            {teaser && (
              <DynamicExampleCard
                teaser={teaser}
                scopeLabel={scopeLabel}
                scenarioLabel={SCENARIO_LABELS[scenario] ?? scenario}
                productPrice={cfg.priceUsd}
              />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 border border-[#e8e3d4] rounded-lg text-sm"
              >
                ← Tweak my answers
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!teaser}
                className="flex-1 bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Continue to checkout — {formatPrice(cfg.priceUsd)}
              </button>
            </div>
          </div>
        )}

        {/* PhotoPanel mount — only renders content when photoPanelOpen
            is true. Defined here (vs the very bottom of the JSX)
            because it lives inside the modal's z-stack and shares the
            backdrop click-outside-to-close semantic. */}
        {PHOTO_PANEL_ENABLED && (
          <PhotoPanel
            open={photoPanelOpen}
            onClose={() => setPhotoPanelOpen(false)}
            onRejectRead={() => {
              setPhotoPanelOpen(false)
              // Visitor stays on whatever step they were on; the
              // chat picker is right there for them to use instead.
            }}
            onPaywallProceed={(scope, meta) => {
              setTopic(scope.topic)
              setScopeVariantId(scope.scopeVariantId)
              explicitlySetScopeRef.current = true
              setScenario(scope.scenario)
              setPhotoPrefilledFromPanel(true)
              setPhotoPreviewMeta(meta)
              setPhotoPanelOpen(false)
              setStep(3)
            }}
          />
        )}

        {step === 3 && (
          <div className="space-y-5">
            {/* v7.3.4-PR2 banner: when the visitor arrived at step 3
                via the photo panel, surface a tiny inline note so they
                know their topic was pre-filled from their photos and
                not silently guessed. */}
            {photoPrefilledFromPanel && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-2">
                Pre-filled from your photos. You can change topic/scope above if needed.
              </p>
            )}
            <div className="bg-white border border-[#e8e3d4] rounded-md p-4 text-sm">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[#1a1f1a]/70">{cfg.productName}</span>
                <span className="font-display text-2xl text-[#1f3a2e]">{formatPrice(cfg.priceUsd)}</span>
              </div>
              <p className="text-xs text-[#1a1f1a]/70">{refundCopy} · One-time · No account required</p>
              <ul className="mt-3 text-xs text-[#1a1f1a]/75 space-y-1">
                <li>Topic: <strong>{TOPIC_LABELS[topic] ?? topic}</strong></li>
                <li>Scope: <strong>{scopeLabel}</strong></li>
                <li>Scenario: <strong>{SCENARIO_LABELS[scenario] ?? scenario}</strong></li>
                <li>Email: <strong>{email}</strong></li>
                {address && <li>Address: <strong>{address}</strong></li>}
              </ul>
            </div>
            {error && <ErrorBanner text={error} />}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 border border-[#e8e3d4] rounded-lg text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
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

function StepIndicator({ step }: { step: Step }) {
  const labels = ['Email', 'Project', 'Sneak peek', 'Confirm']
  return (
    <div className="flex items-center gap-1.5 mb-6 text-[10px] uppercase tracking-wide">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              i <= step ? 'bg-[#1f3a2e]' : 'bg-[#e8e3d4]'
            }`}
          />
          <span className={i === step ? 'text-[#1f3a2e]' : 'text-[#1a1f1a]/40'}>
            {l}
          </span>
          {i < labels.length - 1 && <span className="text-[#1a1f1a]/30">·</span>}
        </div>
      ))}
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

function ErrorBanner({ text }: { text: string }) {
  return (
    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
      {text}
    </p>
  )
}
