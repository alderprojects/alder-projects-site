'use client'

// V7.1 — generic dashboard modal for the four "dead-link" actions:
// StartChecklistModal, SkipListModal, DiyStopLineModal, ComparePathsModal.
//
// Each one is a thin wrapper that picks a title, content body, and a
// "lead-capture CTA" footer. The footer button posts to
// /api/plan/[planCode]/lead-context which writes a lead_intent for
// V8 routing — works even without PropertyChat being wired into the
// dashboard yet (that integration is queued for v7.2).

import { useState } from 'react'
import type { ReactNode } from 'react'
import type { WorthItOutput } from '@/lib/buildWorthItPlan'

export type PathContextModalProps = {
  plan: WorthItOutput
  token: string | null
  title: string
  intro: string
  children: ReactNode
  ctaLabel: string
  ctaIntentType:
    | 'handyman_bundle'
    | 'contractor_needed'
    | 'project_grew'
    | 'product_affiliate'
    | 'chat_followup'
  ctaTrigger: string
  onClose: () => void
}

export default function PathContextModal({
  plan,
  token,
  title,
  intro,
  children,
  ctaLabel,
  ctaIntentType,
  ctaTrigger,
  onClose,
}: PathContextModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function captureLead() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/plan/${plan.planCode}/lead-context?token=${encodeURIComponent(token ?? '')}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            intentType: ctaIntentType,
            trigger: ctaTrigger,
          }),
        },
      )
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Lead capture failed (${res.status})`)
      }
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border border-[#e8e3d4] rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-2xl text-[#1f3a2e]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#1a1f1a]/60 hover:text-[#1a1f1a] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-[#1a1f1a]/75 mb-5">{intro}</p>

        <div className="mb-5">{children}</div>

        {submitted ? (
          <div className="bg-[#f5efe2] border border-[#e8e3d4] rounded-md p-4 text-sm text-[#1a1f1a]/85">
            Saved. We&apos;ll follow up by email and the dashboard will note
            this on your next visit.
          </div>
        ) : (
          <>
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-[#e8e3d4] rounded-md text-sm"
              >
                Close
              </button>
              <button
                onClick={captureLead}
                disabled={submitting}
                className="bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-md"
              >
                {submitting ? 'Saving…' : ctaLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
