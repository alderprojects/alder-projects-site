'use client'

import type { ReactNode } from 'react'
import type { SequenceItem } from '@/lib/property-modules'
import Disclosure from './Disclosure'

// SequenceCard renders a sequence as: scenario → milestone preview →
// stacked rebate dollar line → optional inline CTA slot → disclosure
// (full step-by-step). The CTA slot is injected by RankedModuleStream
// so the contractor lead button appears BETWEEN milestone and full
// detail — V3 had the CTA below the entire card, which read as
// trailing punctuation rather than an action moment.
//
// Used both in the inline render path (with a CTA slot) and in the
// "Show everything else" disclosure path (slot empty).

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

function scrubJargon(s: string): string {
  if (!s) return s
  return s
    .replace(/\(\s*80%\s*AMI(?:\s+or\s+below)?\s*\)/gi, '(income-qualified)')
    .replace(/at\s+or\s+below\s+80%\s+AMI/gi, 'at the income-qualified tier')
    .replace(/below\s+80%\s+Area\s+Median\s+Income/gi, 'meeting the income-qualified guideline')
    .replace(/80%\s+Area\s+Median\s+Income/gi, 'income-qualified guideline')
    .replace(/80%\s+AMI/gi, 'income-qualified tier')
    .replace(/\(\s*HH3\s*\)/gi, '(3-person household)')
    .replace(/\bHH3\b/gi, '3-person household')
}

type Props = {
  sequence: SequenceItem
  ctaSlot?: ReactNode
}

export default function SequenceCard({ sequence: seq, ctaSlot }: Props) {
  return (
    <div
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
        padding: '18px 20px',
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.accent,
          margin: '0 0 6px',
        }}
      >
        What this looks like
      </p>
      <p style={{ fontSize: 14, fontFamily: FB, color: C.ink, fontWeight: 600, margin: 0 }}>
        {seq.title}
      </p>
      <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '12px 0 14px' }}>
        {seq.scenario}
      </p>

      {/* Milestone view — arrow + step title + duration only. Reads
          like a "what to expect" overview rather than a DIY task list. */}
      <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'grid', gap: 8 }}>
        {seq.steps.map(s => (
          <li
            key={s.step}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px minmax(0, 1fr) auto',
              gap: 10,
              alignItems: 'baseline',
              fontFamily: FB,
            }}
          >
            <span style={{ fontSize: 14, color: C.accent, fontWeight: 600 }}>→</span>
            <span style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{s.title}</span>
            <span style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, whiteSpace: 'nowrap' }}>
              {s.duration}
            </span>
          </li>
        ))}
      </ol>

      <div
        style={{
          display: 'grid',
          gap: 4,
          marginBottom: 14,
          paddingTop: 12,
          borderTop: `1px solid ${C.cardLine}`,
        }}
      >
        <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: 0 }}>
          <strong>Total cost after rebates:</strong> {seq.totalCostMidVT}
        </p>
        <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: 0 }}>
          <strong style={{ color: C.accent }}>Stacked rebates:</strong>{' '}
          {scrubJargon(seq.totalRebateStack)}
        </p>
      </div>

      {/* Inline CTA slot — fires AFTER milestone preview, BEFORE the
          full step-by-step disclosure. Slot may be empty if the picker
          already used the contractor-lead CTA elsewhere on the page. */}
      {ctaSlot && <div style={{ marginBottom: 14 }}>{ctaSlot}</div>}

      <Disclosure variant="inline" label="Want the full step-by-step? Show me the details">
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {seq.steps.map(s => (
            <li
              key={s.step}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px minmax(0, 1fr)',
                gap: 12,
                paddingTop: 8,
                borderTop: `1px solid ${C.cardLine}`,
              }}
            >
              <span style={{ fontSize: 13, fontFamily: FM, color: C.inkFaint, fontWeight: 600 }}>
                {String(s.step).padStart(2, '0')}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 13, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>
                    {s.title}
                  </p>
                  <span style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint }}>{s.duration}</span>
                </div>
                <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: '4px 0 0', lineHeight: 1.5 }}>
                  {s.what}
                </p>
                <p style={{ fontSize: 11, fontFamily: FB, color: C.inkFaint, margin: '4px 0 0', fontStyle: 'italic' }}>
                  Trap: {s.trap}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Disclosure>
    </div>
  )
}
