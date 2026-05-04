// ValueProofGrid — 4-up grid of "what Alder helps you avoid" cards.
// Different copy for Smart Cart vs Worth-It; same visual treatment.
// Server-renderable.

type Product = 'smart_cart' | 'worth_it'

type Value = {
  title: string
  body: string
  iconSvg: string
}

const SMART_CART_VALUES: Value[] = [
  {
    title: 'Avoid duplicate products',
    body:
      "We tell you what you already have so you don't buy it twice.",
    iconSvg: 'M5 5h14v3H5V5zm0 5h14v3H5v-3zm0 5h14v3H5v-3z',
  },
  {
    title: 'Avoid kit bundles',
    body:
      'Right quantities for your space and scope — no pallets of extras.',
    iconSvg: 'M3 5h6v6H3V5zm0 8h6v6H3v-6zm8-8h6v6h-6V5zm0 8h6v6h-6v-6z',
  },
  {
    title: 'Avoid contractor-grade for a small refresh',
    body:
      'Get the right quality for the job, not more.',
    iconSvg: 'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z',
  },
  {
    title: 'Avoid extra trips',
    body:
      'One well-planned order saves time, gas, and frustration.',
    iconSvg: 'M3 12l3-3 4 4 7-7 4 4-11 11-7-7zm0 6h18v2H3v-2z',
  },
]

const WORTH_IT_VALUES: Value[] = [
  {
    title: 'Avoid the wrong remodel',
    body:
      'Refresh, repair, or replace — ranked for your project.',
    iconSvg: 'M3 4h18v3H3V4zm0 6h12v3H3v-3zm0 6h18v3H3v-3z',
  },
  {
    title: 'Avoid the wrong sequence',
    body:
      'Weatherize before you upsize. Inspect before you buy boards.',
    iconSvg: 'M3 6h12l3 3-3 3H3V6zm0 8h18l-3 3 3 3H3v-6z',
  },
  {
    title: 'Avoid oversized equipment',
    body:
      "Right-sized heat pumps, right-spec'd panels, right-sized scope.",
    iconSvg: 'M3 8h18v8H3V8zm5 2h2v4H8v-4zm6 0h2v4h-2v-4z',
  },
  {
    title: 'Avoid bad hires',
    body:
      'Vermont contractor vetting steps baked in — three questions catch most trouble.',
    iconSvg: 'M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z',
  },
]

export default function ValueProofGrid({ product }: { product: Product }) {
  const values = product === 'smart_cart' ? SMART_CART_VALUES : WORTH_IT_VALUES
  return (
    <section className="my-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {values.map(v => (
          <article
            key={v.title}
            className="bg-white border border-[#e8e3d4] rounded-xl p-5"
          >
            <div className="w-9 h-9 rounded-md bg-[#fbf8f1] flex items-center justify-center text-[#1f3a2e] mb-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d={v.iconSvg} />
              </svg>
            </div>
            <h3 className="font-display text-base text-[#1a1f1a] mb-1">
              {v.title}
            </h3>
            <p className="text-sm text-[#1a1f1a]/80 leading-relaxed">{v.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
