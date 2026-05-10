'use client'

// v7.2.11 — warnings rendered with a next step instead of bare cautions.
//
// Catalog warnings are typically short imperative strings ("Check
// P-trap clearance"). This component wraps each in an amber card and
// appends a generic next-step nudge when no specific guidance is
// present — so a buyer sees "what to do" rather than just "what could
// go wrong."

interface Props {
  warnings: string[]
}

export default function WarningWithNextStep({ warnings }: Props) {
  if (!warnings || warnings.length === 0) return null
  return (
    <ul className="space-y-2 mt-3">
      {warnings.map(w => {
        const nextStep = inferNextStep(w)
        return (
          <li
            key={w}
            className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-3 py-2 text-sm flex items-start gap-2"
          >
            <span aria-hidden className="leading-none">⚠</span>
            <div>
              <div className="font-medium">{w}</div>
              <div className="text-xs text-amber-800/85 mt-0.5">{nextStep}</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function inferNextStep(warning: string): string {
  const w = warning.toLowerCase()
  if (/measur|opening must|fit|inches?\b|cm\b/.test(w)) {
    return 'Measure first — verify the dimension before you buy.'
  }
  if (/p-?trap|s-?trap|plumb|drain/.test(w)) {
    return 'Plumbing check: if you see standard P-trap, this likely fits. Older or unusual plumbing? Verify with a plumber before buying.'
  }
  if (/voltage|wir|electric|amps?\b|gfci/.test(w)) {
    return 'Electrical check: confirm circuit + receptacle type before buying. When in doubt, ask an electrician.'
  }
  if (/install|mount|hardware/.test(w)) {
    return 'Hardware check: verify mounting surface and screw type before purchase.'
  }
  return 'Verify before purchase. If unsure, contact a pro.'
}
