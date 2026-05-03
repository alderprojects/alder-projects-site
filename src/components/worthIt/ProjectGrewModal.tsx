'use client'

// V7 — Project Grew modal. Opens on "Project Grew?" click.
//
// Captures the user's free-text "what changed" and POSTs to
// /api/plan/[planCode]/project-grew, which writes a lead_intent
// (leadType='project_grew') and emails hello@alderprojects.com so
// the team can follow up. After submit we direct the user to the
// existing chat widget on the site for live-ish follow-up.

import { useState } from 'react'
import type { WorthItOutput } from '@/lib/buildWorthItPlan'

type Props = {
  plan: WorthItOutput
  token: string | null
  onClose: () => void
}

export default function ProjectGrewModal({ plan, token, onClose }: Props) {
  const [text, setText] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/plan/${plan.planCode}/project-grew?token=${encodeURIComponent(token ?? '')}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submit failed')
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
      <div className="bg-white border border-[#e8e3d4] rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-2xl text-[#1f3a2e]">Tell us how it grew</h3>
          <button onClick={onClose} className="text-[#1a1f1a]/60 hover:text-[#1a1f1a] text-xl leading-none">×</button>
        </div>

        {submitted ? (
          <>
            <p className="text-sm text-[#1a1f1a]/85 mb-4">
              Thanks — we have your update. Continue the conversation in the
              chat (bottom-right) and someone from Alder will follow up within
              one business day.
            </p>
            <button
              onClick={onClose}
              className="bg-[#1f3a2e] hover:bg-[#162a21] text-white px-5 py-2.5 rounded-md text-sm"
            >
              Got it
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-[#1a1f1a]/75 mb-4">
              The plan was built around <strong>{plan.scopeLabel}</strong>. If the scope changed
              (you found rot, you decided to redo cabinets, the contractor flagged something),
              tell us in your own words and we will route it.
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              placeholder="What changed about your project?"
              className="w-full bg-[#fbf8f1] border border-[#e8e3d4] rounded-md px-3 py-2 text-sm mb-4"
            />
            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="border border-[#e8e3d4] rounded-md px-4 py-2.5 text-sm hover:bg-[#fbf8f1]"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={text.length < 10 || submitting}
                className="flex-1 bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white text-sm px-4 py-2.5 rounded-md"
              >
                {submitting ? 'Sending…' : 'Submit & continue'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
