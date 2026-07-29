'use client'

/**
 * v7.4.13 — The coverage map: a stylized house cutaway, nine regions.
 *
 * This is NOT an attempt to draw the reader's actual home (locked decision
 * #2). It is a standard cutaway in the v7.4.x illustration style — same
 * palette, same line weight, same inline-SVG approach as CheckArt. Regions
 * light per system; we never pretend to know their floor plan.
 *
 * CR1: three states, none of them a warning.
 *   lit    — brand green, slot count
 *   aging  — desaturated sage, "refresh soon"
 *   dark   — outline only, an invitation
 * The palette's RED is deliberately unused on this surface.
 */

import type { SystemView } from '@/lib/coverage/state'

const G = '#1f3d2b'
const CREAM = '#f6f2e8'
const GOLD = '#b08d2f'
const SAGE = '#7a9b6f'
const LINE = 'rgba(31,61,43,0.35)'

/** Region geometry, in the order they stack in the cutaway. */
const REGIONS: Record<string, { d: string; label: [number, number] }> = {
  roof_attic: { d: 'M200 24 L372 116 L28 116 Z', label: [200, 92] },
  windows_doors: { d: 'M40 124 H196 V206 H40 Z', label: [118, 168] },
  bath: { d: 'M204 124 H360 V206 H204 Z', label: [282, 168] },
  kitchen: { d: 'M40 214 H196 V296 H40 Z', label: [118, 258] },
  hvac: { d: 'M204 214 H360 V296 H204 Z', label: [282, 258] },
  electrical: { d: 'M40 304 H196 V352 H40 Z', label: [118, 332] },
  plumbing: { d: 'M204 304 H360 V352 H204 Z', label: [282, 332] },
  basement_foundation: { d: 'M40 360 H360 V416 H40 Z', label: [200, 392] },
  exterior_drainage: { d: 'M8 424 H392 V456 H8 Z', label: [200, 444] },
}

function fillFor(state: SystemView['state']): string {
  if (state === 'lit') return G
  if (state === 'aging') return SAGE
  return CREAM
}

function textFor(state: SystemView['state']): string {
  return state === 'dark' ? G : CREAM
}

export interface CoverageMapProps {
  systems: SystemView[]
  selectedId: string | null
  onSelect: (systemId: string) => void
}

export default function CoverageMap({ systems, selectedId, onSelect }: CoverageMapProps) {
  const byId = new Map(systems.map((s) => [s.systemId, s]))

  return (
    <svg
      viewBox="0 0 400 470"
      style={{ width: '100%', height: 'auto', maxWidth: 460 }}
      role="group"
      aria-label="Your home record — nine systems"
    >
      {/* ground line behind the exterior band */}
      <path d="M8 424 H392" stroke={LINE} strokeWidth="2" />

      {Object.entries(REGIONS).map(([systemId, geo]) => {
        const sys = byId.get(systemId)
        if (!sys) return null
        const selected = selectedId === systemId
        const [lx, ly] = geo.label
        const short = SHORT_LABEL[systemId] ?? sys.label

        return (
          <g
            key={systemId}
            onClick={() => onSelect(systemId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(systemId)
              }
            }}
            tabIndex={0}
            role="button"
            aria-pressed={selected}
            aria-label={
              sys.state === 'dark'
                ? `${sys.label}. ${sys.invitation}`
                : `${sys.label}. ${sys.filledCount} of ${sys.totalCount} shots read${sys.state === 'aging' ? ', refresh soon' : ''}`
            }
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <path
              d={geo.d}
              fill={fillFor(sys.state)}
              fillOpacity={sys.state === 'dark' ? 1 : 0.92}
              stroke={selected ? GOLD : LINE}
              strokeWidth={selected ? 3 : 2}
              strokeDasharray={sys.state === 'dark' ? '5 4' : undefined}
            />
            <text
              x={lx}
              y={ly - 6}
              textAnchor="middle"
              fill={textFor(sys.state)}
              fontSize="13"
              fontWeight={600}
            >
              {short}
            </text>
            <text x={lx} y={ly + 12} textAnchor="middle" fill={textFor(sys.state)} fontSize="11" opacity={0.85}>
              {sys.state === 'dark'
                ? 'not read yet'
                : sys.genericOnly
                  ? 'seen'
                  : `${sys.filledCount}/${sys.totalCount}`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** The map is small on a phone; regions get a short label. */
const SHORT_LABEL: Record<string, string> = {
  roof_attic: 'Roof & Attic',
  windows_doors: 'Windows',
  bath: 'Bath',
  kitchen: 'Kitchen',
  hvac: 'Heating',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  basement_foundation: 'Basement',
  exterior_drainage: 'Outside',
}
