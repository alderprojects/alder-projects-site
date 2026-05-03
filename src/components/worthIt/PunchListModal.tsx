'use client'

// V7 — Punch List modal. Opens on "Bundle Small Fixes" click.
//
// Pre-populates with the moves currently checked or saved in the
// plan state. The user can add timing, then either print
// (window.print) or save to plan_state.savedPunchList. POST writes
// a lead_intent row with leadType='handyman_bundle' for the V8
// routing layer to consume later.

import { useMemo, useState } from 'react'
import type { WorthItOutput } from '@/lib/buildWorthItPlan'
import { MOVES } from '@/content/moves'

type Props = {
  plan: WorthItOutput
  token: string | null
  checkedIds: string[]
  savedIds: string[]
  onClose: () => void
}

export default function PunchListModal({ plan, token, checkedIds, savedIds, onClose }: Props) {
  const allMoves = useMemo(() => MOVES.filter(m => m.topic === plan.topic), [plan.topic])
  const initialSelected = new Set([...checkedIds, ...savedIds])
  const [selected, setSelected] = useState<Set<string>>(initialSelected)
  const [timing, setTiming] = useState<string>('this_weekend')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function save() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/plan/${plan.planCode}/punch-list?token=${encodeURIComponent(token ?? '')}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moveIds: Array.from(selected), timing }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  function printList() {
    window.print()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border border-[#e8e3d4] rounded-2xl shadow-xl w-full max-w-xl p-6 md:p-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-2xl text-[#1f3a2e]">Bundle Small Fixes Into a Punch List</h3>
          <button onClick={onClose} className="text-[#1a1f1a]/60 hover:text-[#1a1f1a] text-xl leading-none">×</button>
        </div>
        <p className="text-sm text-[#1a1f1a]/75 mb-5">
          Bundling reduces trips, gives you a single material-list discount opportunity, and turns
          three separate Saturdays into one. Pick the fixes to bundle.
        </p>

        {submitted ? (
          <div className="bg-[#f5efe2] border border-[#e8e3d4] rounded-md p-4 text-sm text-[#1a1f1a]/85">
            Saved to your plan. Print the list, hand it to a handyman, or work through it yourself.
            Handyman routing goes live in V8 — your saved bundle is queued for that workflow.
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-5">
              {allMoves.map(m => (
                <label key={m.id} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium text-[#1a1f1a]">{m.title}</span>
                    <span className="block text-xs text-[#1a1f1a]/65">
                      {m.timeMinutes < 60 ? `${m.timeMinutes} min` : `${Math.round(m.timeMinutes / 60)} hr`}
                      {' · '}${m.spend.low}{m.spend.low !== m.spend.high && `-${m.spend.high}`}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <label className="block mb-5">
              <span className="block text-sm font-medium mb-2">When would you do this?</span>
              <select
                value={timing}
                onChange={e => setTiming(e.target.value)}
                className="w-full bg-[#fbf8f1] border border-[#e8e3d4] rounded-md px-3 py-2 text-sm"
              >
                <option value="this_weekend">This weekend</option>
                <option value="next_2_weeks">In the next 2 weeks</option>
                <option value="next_month">In the next month</option>
                <option value="end_of_season">By end of season</option>
                <option value="not_sure">Not sure yet</option>
              </select>
            </label>

            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={printList}
                className="border border-[#e8e3d4] rounded-md px-4 py-2.5 text-sm hover:bg-[#fbf8f1]"
              >
                Print my punch list
              </button>
              <button
                onClick={save}
                disabled={selected.size === 0 || submitting}
                className="flex-1 bg-[#1f3a2e] hover:bg-[#162a21] disabled:opacity-50 text-white text-sm px-4 py-2.5 rounded-md"
              >
                {submitting ? 'Saving…' : 'Save to my plan'}
              </button>
            </div>

            <p className="text-xs text-[#1a1f1a]/55 mt-4 text-center">
              Handyman routing coming soon. For now, save or print.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
