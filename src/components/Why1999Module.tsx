// v7.2.15 — concrete "Why $19.99?" trust module.
//
// Uses scope-specific copy that names the actual failure mode the buyer
// fears, instead of the generic "knowing what to buy first" line that
// reads as filler. Two variants today: window weatherization and basement
// moisture prep.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.72)',
  ivory: '#F5EFE0',
  accent: '#C8732A',
}
const FS = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export type Why1999Variant = 'window' | 'basement'

const COPY: Record<Why1999Variant, { headline: string; body: string }> = {
  window: {
    headline: "Why $19.99?",
    body:
      'You can find window film on Amazon. The $19.99 isn\'t for finding the product — it\'s for the diagnostic step you\'d skip otherwise. Most homeowners we hear from spent $300+ on the wrong scope before they understood the difference between an air-leak window and a conductive-loss window. The cart catches that.',
  },
  basement: {
    headline: "Why $19.99?",
    body:
      'You can buy a hygrometer for $15. The $19.99 isn\'t for finding the meter — it\'s for the sequence of checks before you finish, and the route-out rules for when moisture, mold, or foundation signs mean you should call a pro instead. The cart catches the difference between a humidity problem and an intrusion problem before drywall goes up.',
  },
}

type Props = {
  variant: Why1999Variant
  /** Compact rendering — used on /smart-cart picker page where space matters. */
  density?: 'standard' | 'compact'
}

export default function Why1999Module({ variant, density = 'standard' }: Props) {
  const copy = COPY[variant]
  if (density === 'compact') {
    return (
      <aside
        data-testid={`why-1999-${variant}-compact`}
        style={{
          margin: '24px 0',
          padding: '16px 18px',
          background: '#fbf8f1',
          border: '1px solid #e8e3d4',
          borderRadius: 6,
          fontFamily: FB,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontFamily: FM,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.accent,
            margin: '0 0 6px',
            fontWeight: 600,
          }}
        >
          Why $19.99?
        </p>
        <p
          style={{
            fontSize: 14,
            color: C.inkSoft,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {copy.body}
        </p>
      </aside>
    )
  }

  return (
    <aside
      data-testid={`why-1999-${variant}`}
      style={{
        margin: '32px 0',
        padding: '22px 24px',
        background: C.ivory,
        borderRadius: 6,
        border: '1px solid rgba(28,43,26,0.1)',
        fontFamily: FB,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontFamily: FM,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.accent,
          margin: '0 0 8px',
          fontWeight: 600,
        }}
      >
        Smart Cart · $19.99
      </p>
      <h3
        style={{
          fontFamily: FS,
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 10px',
          color: C.ink,
          lineHeight: 1.3,
        }}
      >
        {copy.headline}
      </h3>
      <p
        style={{
          fontSize: 15,
          color: C.inkSoft,
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {copy.body}
      </p>
    </aside>
  )
}
