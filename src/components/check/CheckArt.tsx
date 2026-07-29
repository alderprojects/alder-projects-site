/**
 * v7.4.2c — Brand illustrations for the Check surfaces. All inline SVG:
 * server-rendered, zero network requests, zero LCP cost, and they hold
 * the palette (deep green / warm cream / muted gold) in both themes.
 * Decorative only — every root carries aria-hidden.
 */

const G = '#1f3d2b'
const CREAM = '#f6f2e8'
const GOLD = '#b08d2f'
const SAGE = '#7a9b6f'
const RED = '#9b3f3f'
const LINE = 'rgba(31,61,43,0.35)'

/** Hero: a room "photo" with verdict chips coming off it. */
export function HeroArt() {
  return (
    <svg viewBox="0 0 420 340" fill="none" aria-hidden="true" style={{ width: '100%', height: 'auto', maxWidth: 420 }}>
      {/* photo frame */}
      <rect x="24" y="28" width="252" height="196" rx="14" fill="#fff" stroke={LINE} strokeWidth="2" />
      <rect x="40" y="44" width="220" height="140" rx="8" fill={CREAM} />
      {/* window */}
      <rect x="56" y="58" width="64" height="52" rx="4" fill="#fff" stroke={LINE} strokeWidth="2" />
      <path d="M88 58v52M56 84h64" stroke={LINE} strokeWidth="2" />
      {/* mountains through window */}
      <path d="M60 100l12-14 9 10 10-12 13 16H60z" fill={SAGE} opacity="0.55" />
      {/* baseboard heater */}
      <rect x="140" y="150" width="104" height="16" rx="4" fill="#fff" stroke={LINE} strokeWidth="2" />
      <path d="M150 154v8M162 154v8M174 154v8M186 154v8M198 154v8M210 154v8M222 154v8M234 154v8" stroke={LINE} strokeWidth="1.6" />
      {/* plant */}
      <path d="M146 128c0-14 10-24 10-24s10 10 10 24" stroke={SAGE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M156 132v-22" stroke={SAGE} strokeWidth="3" strokeLinecap="round" />
      <rect x="146" y="132" width="20" height="16" rx="3" fill={GOLD} opacity="0.85" />
      {/* armchair suggestion */}
      <rect x="196" y="112" width="48" height="34" rx="8" fill={SAGE} opacity="0.4" />
      <rect x="192" y="128" width="56" height="20" rx="6" fill={SAGE} opacity="0.6" />
      {/* camera notch on frame */}
      <circle cx="150" cy="204" r="7" fill={CREAM} stroke={LINE} strokeWidth="2" />
      <circle cx="150" cy="204" r="2.5" fill={G} />

      {/* dotted connectors */}
      <path d="M278 84c28 2 44 10 58 24" stroke={GOLD} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M278 140c30 4 46 14 60 30" stroke={GOLD} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M240 226c26 24 60 30 96 26" stroke={GOLD} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M214 252c40 42 74 52 112 54" stroke={GOLD} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />

      {/* verdict chips */}
      <g>
        <rect x="330" y="92" width="72" height="32" rx="8" fill="#e5efe2" stroke="#2d5a3d" strokeWidth="1.5" />
        <text x="366" y="113" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#2d5a3d">
          BUY
        </text>
      </g>
      <g>
        <rect x="336" y="156" width="72" height="32" rx="8" fill="#f3ecd9" stroke={GOLD} strokeWidth="1.5" />
        <text x="372" y="177" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#8a6d1f">
          WAIT
        </text>
      </g>
      <g>
        <rect x="330" y="238" width="72" height="32" rx="8" fill="#f0e4e0" stroke={RED} strokeWidth="1.5" />
        <text x="366" y="259" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" fill={RED}>
          SKIP
        </text>
      </g>
      {/* v7.4.14 §1.3 — the fourth lane. Blue, matching the MONITOR entry
          in lib/copy/canon.ts and the result card. */}
      <g>
        <rect x="322" y="292" width="94" height="32" rx="8" fill="#e7e9f0" stroke="#3d4a7a" strokeWidth="1.5" />
        <text x="369" y="313" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#3d4a7a">
          MONITOR
        </text>
      </g>

      {/* evidence tick under the frame */}
      <rect x="24" y="244" width="180" height="14" rx="7" fill={G} opacity="0.12" />
      <rect x="24" y="266" width="132" height="14" rx="7" fill={G} opacity="0.08" />
    </svg>
  )
}

/** Step 1: phone camera over a doorway. */
export function StepSnapArt() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" width="72" height="72">
      <rect x="30" y="10" width="36" height="66" rx="8" fill="#fff" stroke={LINE} strokeWidth="2.5" />
      <rect x="36" y="20" width="24" height="40" rx="3" fill={CREAM} />
      <rect x="40" y="26" width="10" height="14" rx="2" fill={SAGE} opacity="0.6" />
      <rect x="42" y="46" width="12" height="8" rx="2" fill={GOLD} opacity="0.8" />
      <circle cx="48" cy="68" r="3.5" stroke={LINE} strokeWidth="2" />
      {/* shutter flare */}
      <path d="M76 22l8-8M80 34h10M70 12V4" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Step 2: verdict card with badge. */
export function StepVerdictArt() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" width="72" height="72">
      <rect x="14" y="22" width="68" height="56" rx="8" fill="#fff" stroke={LINE} strokeWidth="2.5" />
      <rect x="20" y="30" width="26" height="12" rx="4" fill="#e5efe2" stroke="#2d5a3d" strokeWidth="1.5" />
      <path d="M25 36l3 3 5-6" stroke="#2d5a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="20" y="50" width="56" height="6" rx="3" fill={G} opacity="0.18" />
      <rect x="20" y="62" width="42" height="6" rx="3" fill={G} opacity="0.12" />
      {/* dollar tag */}
      <circle cx="74" cy="20" r="12" fill={GOLD} />
      <text x="74" y="25" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#fff">
        $
      </text>
    </svg>
  )
}

/** Step 3: cart with Good/Better/Best tiers. */
export function StepCartArt() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" width="72" height="72">
      <path d="M14 22h10l8 40h38l8-28H30" stroke={G} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="74" r="5" fill={G} />
      <circle cx="62" cy="74" r="5" fill={G} />
      {/* tier bars */}
      <rect x="42" y="30" width="7" height="14" rx="2" fill={SAGE} />
      <rect x="53" y="24" width="7" height="20" rx="2" fill={GOLD} />
      <rect x="64" y="18" width="7" height="26" rx="2" fill={G} />
    </svg>
  )
}

/** Small product-card icons (40px). */
export function IconCheckBadge() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" width="40" height="40">
      <rect x="4" y="8" width="32" height="24" rx="5" fill="#e5efe2" stroke="#2d5a3d" strokeWidth="2" />
      <path d="M13 20l5 5 9-11" stroke="#2d5a3d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconCart() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" width="40" height="40">
      <path d="M5 9h5l4 18h17l4-13H12" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="16" cy="33" r="2.5" fill={GOLD} />
      <circle cx="27" cy="33" r="2.5" fill={GOLD} />
    </svg>
  )
}

export function IconGuides() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" width="40" height="40">
      <path d="M8 8h10c2 0 4 1.5 4 3.5V32c0-2-2-3.5-4-3.5H8V8z" fill={CREAM} stroke={G} strokeWidth="2" strokeLinejoin="round" />
      <path d="M36 8H26c-2 0-4 1.5-4 3.5V32c0-2 2-3.5 4-3.5h10V8z" fill="#fff" stroke={G} strokeWidth="2" strokeLinejoin="round" />
      <path d="M27 14h6M27 19h6" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
