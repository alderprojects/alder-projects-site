// v7.2.7 — route-out screen.
//
// Replaces the cart slot list when cart.routedOut is set. Compliance
// gates:
//   - "Wasn't charged" copy only safe when cart.refunded is false AND
//     payment hasn't completed. We use cart.refunded as the
//     discriminator: if refunded, we say "Refund issued"; otherwise
//     "We saved you from the purchase."
//   - Routing CTAs are placeholders in v7.2.7 — link to /worth-it,
//     mailto, etc. Real lead-routing wires up in v7.4.

import type { SmartCartV2Output } from '@/lib/smart-cart-model'

const DESTINATION_LABEL: Record<NonNullable<SmartCartV2Output['routedOut']>['destination'], string> = {
  worth_it: 'Get a Worth-It Plan instead',
  small_pro: 'Find a Vermont small-job pro',
  contractor: 'Talk to a contractor',
  verify_first: 'Schedule a verification visit',
}

const DESTINATION_HREF: Record<NonNullable<SmartCartV2Output['routedOut']>['destination'], string> = {
  worth_it: '/worth-it',
  small_pro: 'mailto:hello@alderprojects.com?subject=Vermont%20small-job%20pro%20referral',
  contractor: 'mailto:hello@alderprojects.com?subject=Contractor%20referral',
  verify_first: 'mailto:hello@alderprojects.com?subject=Verification%20visit',
}

export default function RouteOutBanner({ cart }: { cart: SmartCartV2Output }) {
  if (!cart.routedOut) return null
  const refundCopy = cart.refunded
    ? 'Your $19.99 has been refunded.'
    : 'Your $19.99 wasn’t charged.'
  return (
    <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl" aria-hidden>
          ⚠
        </span>
        <h2 className="font-display text-xl text-amber-900">
          This isn&rsquo;t a Smart Cart situation.
        </h2>
      </div>
      <p className="text-amber-900 mb-4 ml-9">{cart.routedOut.reason}</p>
      <div className="ml-9">
        <p className="text-sm text-amber-900 mb-2">
          <strong>Recommended next step:</strong>
        </p>
        <a
          href={DESTINATION_HREF[cart.routedOut.destination]}
          className="inline-block bg-[#1f3a2e] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#2a4a3a]"
        >
          {DESTINATION_LABEL[cart.routedOut.destination]} &rarr;
        </a>
      </div>
      <p className="text-xs text-amber-900/75 mt-4 ml-9">
        {refundCopy} We saved you from buying things that wouldn&rsquo;t solve your real
        problem.
      </p>
    </section>
  )
}
