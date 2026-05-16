/**
 * v7.2.19 — Memorial Day action card.
 * Above-fold scannable Buy/Skip/Wait grid for /guides/memorial-day-vermont-2026
 * and /guides/memorial-day-2026-what-to-skip-vermont.
 */
import Link from 'next/link'

type Item = { label: string; sub?: string }

const BUY: Item[] = [
  { label: 'Mattresses', sub: 'Year-best window' },
  { label: 'Major appliances', sub: 'Last-year clearance' },
  { label: 'Mid-range grills', sub: 'Weber Spirit tier' },
  { label: 'Mulch + soil', sub: 'Loss leaders' },
]

const SKIP: Item[] = [
  { label: 'Patio furniture', sub: 'Peak demand price' },
  { label: 'Outdoor decor', sub: 'Highest markup of year' },
  { label: 'Premium grills', sub: 'Wait until late July' },
  { label: '"Memorial Day branded"', sub: 'Marketing tax' },
]

const WAIT: Item[] = [
  { label: 'Patio furniture', sub: 'Buy Nov–Feb, save 30–50%' },
  { label: 'Cabinet hardware', sub: 'Late August sale cycle' },
  { label: 'Dehumidifiers', sub: 'October model-year clearance' },
  { label: 'String lights', sub: 'November holiday cycle' },
]

function Col({ title, items, color }: { title: string; items: Item[]; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: '180px' }}>
      <div style={{
        fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
        textTransform: 'uppercase', color, marginBottom: '12px',
        paddingBottom: '8px', borderBottom: `1px solid ${color}33`,
      }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it.label} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C2B1A' }}>{it.label}</div>
            {it.sub && (
              <div style={{ fontSize: '12px', color: 'rgba(28,43,26,0.55)', marginTop: '2px' }}>
                {it.sub}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MemorialDayActionCard() {
  return (
    <section
      style={{
        backgroundColor: 'white',
        border: '1px solid rgba(28,43,26,0.12)',
        borderRadius: '6px',
        padding: '28px',
        marginBottom: '32px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#7A9B6F', marginBottom: '6px',
        }}>
          Memorial Day 2026 · Vermont
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '24px', fontWeight: 600, color: '#1C2B1A',
          margin: 0, lineHeight: 1.2,
        }}>
          The Memorial Day shopping decision at a glance
        </h2>
      </div>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <Col title="Buy" items={BUY} color="#27ae60" />
        <Col title="Skip" items={SKIP} color="#c0392b" />
        <Col title="Wait" items={WAIT} color="#7A9B6F" />
      </div>
      <Link
        href="/smart-cart?topic=outdoor&scope=memorial_day_weekend&utm_source=guide&utm_medium=action_card&utm_campaign=md_2026_top"
        style={{
          display: 'inline-block',
          padding: '12px 22px',
          backgroundColor: '#C8732A',
          color: '#FAF7F2',
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: '3px',
          textDecoration: 'none',
        }}
      >
        Build my Memorial Day Smart Cart — $19.99 →
      </Link>
      <p style={{
        fontSize: '11px', fontFamily: 'monospace',
        color: 'rgba(28,43,26,0.4)', marginTop: '10px', marginBottom: 0,
      }}>
        30-day refund · Reply "refund" to the receipt · No form
      </p>
    </section>
  )
}
