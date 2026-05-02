'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Reading-frame toggle. Sits at the top of the article column on the
// property page. Three options (Me / Buyer / Contractor) feed:
//   - the URL as ?for=me|buyer|contractor (shareable + the chat reads it)
//   - sessionStorage as 'alder.framing' (session-stable across refresh)
//
// The chat route reads context.framing in commit 10's prompt-injection
// block and adjusts pronoun usage. Module copy on the page is not
// rewritten — the toggle's selected state itself contextualizes who
// the visitor is reading for.

type Framing = 'me' | 'buyer' | 'contractor'

const OPTS: { id: Framing; label: string; sub: string }[] = [
  { id: 'me', label: 'Me', sub: 'I own or am the homeowner' },
  { id: 'buyer', label: 'A buyer', sub: 'For someone else looking' },
  { id: 'contractor', label: 'A contractor', sub: 'Evaluating for a client' },
]

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.12)',
  bg: '#FAF7F2',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export default function PropertyFraming() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = (searchParams?.get('for') as Framing | null) ?? 'me'

  function pick(id: Framing) {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (id === 'me') params.delete('for')
    else params.set('for', id)
    try {
      sessionStorage.setItem('alder.framing', id)
    } catch {
      /* ignore */
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.inkFaint,
        }}
      >
        Reading this for
      </span>
      <div role="radiogroup" aria-label="Reading frame" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {OPTS.map(o => {
          const selected = current === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${o.label}. ${o.sub}`}
              title={o.sub}
              onClick={() => pick(o.id)}
              style={{
                padding: '6px 12px',
                border: `1px solid ${selected ? C.accent : C.cardLine}`,
                borderRadius: 999,
                background: selected ? C.accentSoft : C.bg,
                color: C.ink,
                fontFamily: FB,
                fontSize: 12,
                fontWeight: selected ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
