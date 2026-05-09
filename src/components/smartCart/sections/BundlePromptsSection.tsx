// v7.2.7 — "Buy these together" bundle prompts.
//
// Renders when cart.bundlePrompts is populated. Light editorial
// callout under the recommended picks; not a hard CTA.

import type { SmartCartV2Output } from '@/lib/smart-cart-model'

type Bundle = NonNullable<SmartCartV2Output['bundlePrompts']>[number]

interface Props {
  prompts: Bundle[]
}

export default function BundlePromptsSection({ prompts }: Props) {
  if (!prompts || prompts.length === 0) return null
  return (
    <section className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 mb-6">
      <h3 className="font-display text-base text-emerald-900 mb-3">
        Buy these together
      </h3>
      <ul className="space-y-2">
        {prompts.map(p => (
          <li key={p.primaryUniverseId} className="text-sm text-emerald-900/85">
            {p.bundleReason}
          </li>
        ))}
      </ul>
    </section>
  )
}
