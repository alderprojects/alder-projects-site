'use client'

/**
 * v7.4.13 — /record client shell: the map plus the selected system panel.
 *
 * CR2: the "what's next" strip orders in-window systems first and says why,
 * honestly. It never hides, disables, or defers anything — every dark
 * system is one tap from a read, in July or January.
 */

import { useState } from 'react'
import CoverageMap from './CoverageMap'
import type { CoverageView, SystemView } from '@/lib/coverage/state'

function formatRead(d: Date | string | null): string {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default function RecordView({ view, nextUp }: { view: CoverageView; nextUp: string[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = view.systems.find((s) => s.systemId === selectedId) ?? null

  return (
    <div className="space-y-8">
      <section>
        <CoverageMap systems={view.systems} selectedId={selectedId} onSelect={setSelectedId} />
        <p className="mt-3 text-center text-xs text-gray-500">Tap a region to see what has been read.</p>
      </section>

      {selected ? (
        <SystemPanel system={selected} onClose={() => setSelectedId(null)} />
      ) : (
        <NextUpStrip view={view} nextUp={nextUp} onSelect={setSelectedId} />
      )}
    </div>
  )
}

function NextUpStrip({
  view,
  nextUp,
  onSelect,
}: {
  view: CoverageView
  nextUp: string[]
  onSelect: (id: string) => void
}) {
  const systems = nextUp
    .map((id) => view.systems.find((s) => s.systemId === id))
    .filter((s): s is SystemView => s != null)
    .slice(0, 3)

  if (systems.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-gray-900">What&rsquo;s next</h2>
      <div className="space-y-2">
        {systems.map((s) => (
          <button
            key={s.systemId}
            onClick={() => onSelect(s.systemId)}
            className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-gray-900">{s.label}</span>
              <span className="shrink-0 text-xs text-gray-500">
                {s.state === 'dark' ? 'not read yet' : `${s.filledCount}/${s.totalCount}`}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {s.state === 'dark' ? s.invitation : s.state === 'aging' ? 'Refresh due' : 'Add the remaining shots'}
            </p>
            {s.windowNote && <p className="mt-1 text-xs text-gray-500">{s.windowNote}</p>}
          </button>
        ))}
      </div>
    </section>
  )
}

function SystemPanel({ system, onClose }: { system: SystemView; onClose: () => void }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-gray-900">{system.label}</h2>
          <p className="mt-0.5 text-sm text-gray-600">
            {system.state === 'dark'
              ? system.invitation
              : `${system.filledCount} of ${system.totalCount} shots read` +
                (system.lastReadAt ? ` · last read ${formatRead(system.lastReadAt)}` : '')}
          </p>
        </div>
        <button onClick={onClose} className="shrink-0 text-sm text-gray-500 hover:text-gray-900" aria-label="Close panel">
          Close
        </button>
      </div>

      {system.genericOnly && (
        <p className="mb-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          We have seen this system in your photos, but not any of the specific shots below yet.
        </p>
      )}

      {system.windowNote && <p className="mb-4 text-xs text-gray-500">{system.windowNote}</p>}

      <ul className="space-y-3">
        {system.slots.map((slot) => (
          <li key={slot.slotId} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                slot.state === 'lit'
                  ? 'bg-[#1f3d2b]'
                  : slot.state === 'aging'
                    ? 'bg-[#7a9b6f]'
                    : 'border border-gray-300 bg-transparent'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-gray-900">{slot.label}</span>
                {slot.filled ? (
                  <span className="shrink-0 text-xs text-gray-500">
                    {formatRead(slot.readAt)}
                    {slot.state === 'aging' && ' · refresh soon'}
                  </span>
                ) : slot.state === 'stale' ? (
                  <span className="shrink-0 text-xs text-gray-500">last read {formatRead(slot.readAt)}</span>
                ) : null}
              </div>
              {!slot.filled && (
                <>
                  <p className="mt-0.5 text-sm text-gray-600">{slot.guidance}</p>
                  <a
                    href={`/check?system=${system.systemId}&slot=${slot.slotId}`}
                    className="mt-1.5 inline-block text-sm font-medium text-[#1f3d2b] underline underline-offset-2"
                  >
                    Read this
                  </a>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
