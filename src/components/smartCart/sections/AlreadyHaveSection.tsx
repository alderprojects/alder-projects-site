// v7.2.7 — "Already have? Smart move." section.
//
// Renders only when cart.nextBestGaps is populated. Informative,
// not actionable: each card just notes what to do next given that
// the buyer already owns one of the slots.
//
// Compliance: we know which alreadyHave flags the buyer set, not
// which specific products they own. Frame conservatively.

import type { SmartCartV2Output } from '@/lib/smart-cart-model'

type NextBestGap = NonNullable<SmartCartV2Output['nextBestGaps']>[number]

interface Props {
  gaps: NextBestGap[]
}

export default function AlreadyHaveSection({ gaps }: Props) {
  if (!gaps || gaps.length === 0) return null
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-[#1a1f1a]/65 text-white flex items-center justify-center font-display text-base">
          4
        </span>
        <h2 className="font-display text-xl text-[#1a1f1a]">Already have? Smart move.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {gaps.map(gap => (
          <div
            key={gap.triggeredByFlag}
            className="rounded-md p-4 border border-[#e8e3d4] bg-[#fbf8f1]"
          >
            <strong className="block text-[#1a1f1a] mb-1 text-sm">
              Already have: {gap.triggeredByFlag.replace(/_/g, ' ')}
            </strong>
            <p className="text-sm text-[#1a1f1a]/85 mb-1">
              <strong>Next best move:</strong> {gap.recommendedSlot.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-[#1a1f1a]/70">{gap.reason}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
