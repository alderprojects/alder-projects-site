'use client'

/**
 * v7.4.16 §1.1 — the restructured result: inventory strip, grouped verdict
 * sections, and the "Start here" focus module.
 *
 * Presentation only. These components receive already-shaped wire items and
 * reorder them; they never alter a verdict, a lane, or any evidence text.
 *
 * §1.1.4 — grouping activates at ≥2 subjects. A single-subject read renders
 * exactly as it did before: no strip, no headers, no added structure.
 */

import { useEffect, useRef } from 'react'
import { fireFunnel } from '@/lib/check/funnel'
import { groupBySubject, inventoryChips, type GroupableItem } from '@/lib/result/subjects'
import { selectFocus, focusHeadline } from '@/lib/result/focus'
import { PALETTE } from './VerdictCard'

export interface StructurableItem extends GroupableItem {
  key: string
  summary?: string
  nextAction?: string
}

/** Shared shape: the wire already carries `subject`, so no claimLinks here. */
function asGroupable(items: StructurableItem[]): StructurableItem[] {
  return items
}

// ---------------------------------------------------------------------------
// Inventory strip (§1.1.1)
// ---------------------------------------------------------------------------

export function InventoryStrip({ chips }: { chips: string[] }) {
  if (chips.length < 2) return null
  return (
    <section style={{ marginBottom: 20 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: PALETTE.gold,
          marginBottom: 8,
        }}
      >
        We looked at
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chips.map((c) => (
          <span
            key={c}
            style={{
              fontSize: 13.5,
              color: PALETTE.green,
              background: '#fff',
              border: `1px solid ${PALETTE.line}`,
              borderRadius: 999,
              padding: '5px 12px',
              fontWeight: 600,
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Focus module (§1.1.3)
// ---------------------------------------------------------------------------

export function FocusModule({
  subject,
  lane,
  reason,
  safety,
  laneStyle,
}: {
  subject: string
  lane: string
  reason: string
  safety: boolean
  laneStyle: { bg: string; fg: string; label: string }
}) {
  // Fire once per mount, not per render (§1.5 FOCUS_ITEM_RENDERED).
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    fireFunnel('FOCUS_ITEM_RENDERED', { subject, lane, safety })
  }, [subject, lane, safety])

  return (
    <section
      style={{
        background: '#fff',
        border: `2px solid ${PALETTE.green}`,
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: PALETTE.gold,
          }}
        >
          Start here
        </span>
        <span
          style={{
            background: laneStyle.bg,
            color: laneStyle.fg,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderRadius: 6,
            padding: '3px 9px',
          }}
        >
          {laneStyle.label}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 15.5, color: PALETTE.ink, lineHeight: 1.55 }}>
        <strong>If you do one thing: {subject}</strong> — {reason}
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Grouped sections (§1.1.2)
// ---------------------------------------------------------------------------

export function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        margin: '22px 0 10px',
        paddingBottom: 6,
        borderBottom: `1px solid ${PALETTE.line}`,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: PALETTE.ink }}>{label}</h3>
      <span style={{ fontSize: 12.5, color: PALETTE.inkSoft }}>
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  )
}

/**
 * Compute the full structure for a read. Returns `multiSubject: false` for
 * single-subject reads so the caller can render the flat list unchanged.
 */
export function useResultStructure(items: StructurableItem[]) {
  const grouping = groupBySubject(asGroupable(items))
  const focus = selectFocus(items)
  return {
    grouping,
    focus,
    chips: inventoryChips(grouping),
    multiSubject: grouping.multiSubject,
  }
}

export { focusHeadline }
