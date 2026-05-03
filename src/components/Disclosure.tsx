'use client'

import { useState, type ReactNode } from 'react'

// useState-backed disclosure. Children are NOT rendered until the
// visitor expands. The previous V3 pass leaned on native <details>,
// which technically hides children but still pays the render cost
// AND was causing visible layout leaks where collapsed content showed
// up below the toggle. Switching to conditional rendering gives a
// guaranteed "collapsed = not in DOM" behavior.
//
// Used both for the page-level "Show everything else (N)" container
// and for per-sequence "Want the full step-by-step?" toggles.

type Props = {
  label: string
  hint?: string
  children: ReactNode
  // Optional analytics hook. Fires once on first expand.
  onFirstOpen?: () => void
  // Style preset — 'panel' wraps in a card-like container; 'inline'
  // is just a button + revealed children with no chrome.
  variant?: 'panel' | 'inline'
}

const C = {
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export default function Disclosure({
  label,
  hint,
  children,
  onFirstOpen,
  variant = 'panel',
}: Props) {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && !hasOpened) {
      setHasOpened(true)
      onFirstOpen?.()
    }
  }

  if (variant === 'inline') {
    return (
      <div>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          style={{
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            padding: 0,
            fontSize: 12,
            fontFamily: FM,
            color: C.accent,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'left',
          }}
        >
          {open ? `${label} (close)` : `${label} →`}
        </button>
        {open && <div style={{ marginTop: 12 }}>{children}</div>}
      </div>
    )
  }

  return (
    <div
      style={{
        marginTop: 8,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
        padding: '12px 16px',
        background: '#fff',
      }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        style={{
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          padding: 0,
          fontFamily: FM,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.accent,
          fontWeight: 600,
          width: '100%',
          textAlign: 'left',
        }}
      >
        {open ? `Hide ${label.toLowerCase()}` : label}
      </button>
      {hint && (
        <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: '8px 0 0' }}>
          {hint}
        </p>
      )}
      {open && <div style={{ marginTop: 12, display: 'grid', gap: 16 }}>{children}</div>}
    </div>
  )
}
