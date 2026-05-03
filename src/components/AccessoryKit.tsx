'use client'

import { useCallback } from 'react'
import type { AccessoryKitRec } from '@/lib/accessory-recommender'
import { resolveKitItems } from '@/data/affiliates'

// AccessoryKit renders a single recommended kit. Per the V4 spec it is
// NEVER a full-width box — instead a small horizontal text-button row:
// kit title, Real Talk VT line, then 4-6 inline item buttons. The
// "small horizontal" treatment keeps revenue surfaces from competing
// with the actual property content for visual weight.
//
// Wraps to a 2-column grid below ~600px so 6-item kits stay readable
// on a phone.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.12)',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

type Props = {
  kit: AccessoryKitRec
  placement?: string
  // Optional click reporter — wired up in commit 20 for analytics.
  onItemClick?: (params: {
    kitId: string
    itemId: string
    itemDisplay: string
    itemPositionInKit: number
    estimatedItemPrice?: number
  }) => void
}

export default function AccessoryKit({ kit, placement = 'topic_module_inline', onItemClick }: Props) {
  const items = resolveKitItems(kit)

  const handleClick = useCallback(
    (
      kitId: string,
      itemId: string,
      itemDisplay: string,
      itemPositionInKit: number,
      estimatedItemPrice?: number
    ) => {
      onItemClick?.({ kitId, itemId, itemDisplay, itemPositionInKit, estimatedItemPrice })
    },
    [onItemClick]
  )

  if (items.length === 0) return null

  return (
    <section
      data-component="accessory-kit"
      data-kit-id={kit.id}
      data-kit-placement={placement}
      style={{
        padding: '12px 0',
        borderTop: `1px solid ${C.cardLine}`,
        borderBottom: `1px solid ${C.cardLine}`,
        margin: '4px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontFamily: FM,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.accent,
              margin: 0,
            }}
          >
            While you are at it
          </p>
          <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, fontWeight: 600, margin: '4px 0 0' }}>
            {kit.title}
          </p>
        </div>
      </div>
      <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.5, margin: '0 0 10px' }}>
        {kit.description}
      </p>

      <div
        className="kit-items-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 6,
        }}
      >
        {items.map((item, idx) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            data-item-id={item.id}
            data-item-position={idx}
            onClick={() =>
              handleClick(kit.id, item.id, item.display, idx)
            }
            style={{
              display: 'block',
              padding: '8px 12px',
              border: `1px solid ${C.cardLine}`,
              borderRadius: 4,
              background: 'transparent',
              fontFamily: FB,
              fontSize: 12,
              color: C.ink,
              textDecoration: 'none',
              transition: 'border-color 150ms ease, background-color 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = C.accent
              e.currentTarget.style.background = C.accentSoft
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = C.cardLine
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, color: C.ink, margin: 0 }}>
              {item.display}
            </p>
            <p style={{ fontSize: 11, color: C.inkFaint, margin: '2px 0 0', fontFamily: FM }}>
              See on Amazon →
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}
