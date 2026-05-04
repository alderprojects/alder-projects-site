// V7.2.1 — Cross-sell while Worth-It is paused.
//
// On Smart Cart pages we used to upsell Worth-It; now we point at the
// coming-soon page with a notify-me cue. On Worth-It pages this
// component is no longer rendered (the page is the coming-soon page).

type Props = { fromProduct: 'smart_cart' | 'worth_it' }

export default function CrossSellSection({ fromProduct }: Props) {
  if (fromProduct !== 'smart_cart') return null

  return (
    <aside className="my-10 bg-[#1f3a2e] text-white rounded-xl p-6 md:p-8 grid md:grid-cols-3 gap-4 items-center">
      <div className="md:col-span-2">
        <div className="text-xs uppercase tracking-wide text-white/70 mb-2">
          Coming back
        </div>
        <h3 className="font-display text-xl mb-2">
          More than just a shopping list?
        </h3>
        <p className="text-sm text-white/85">
          Worth-It Plan returns soon — ranked moves, alternate paths,
          DIY stop line, all tied to your property. Get notified when
          it ships.
        </p>
      </div>
      <a
        href="/worth-it"
        className="bg-white text-[#1f3a2e] font-medium px-5 py-3 rounded-lg hover:bg-[#f5efe2] inline-block text-center"
      >
        Get notified →
      </a>
    </aside>
  )
}
