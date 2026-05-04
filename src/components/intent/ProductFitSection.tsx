// ProductFitSection — two-column "right for you / use the other product"
// strip. Sits below the value proof grid on the rebuilt sales pages.
// Server-renderable.

type OtherProductLink = {
  label: string                          // "Worth-It Plan" / "Smart Cart"
  href: string
  bullets: string[]
}

type Props = {
  product: 'smart_cart' | 'worth_it'
  rightForYouIf: string[]
  otherProduct: OtherProductLink
}

export default function ProductFitSection({
  product,
  rightForYouIf,
  otherProduct,
}: Props) {
  const productLabel = product === 'smart_cart' ? 'Smart Cart' : 'Worth-It Plan'
  return (
    <section className="my-10 grid md:grid-cols-2 gap-4">
      <article className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-xl p-6">
        <h3 className="font-display text-lg text-[#1f3a2e] mb-4">
          {productLabel} is right for you if…
        </h3>
        <ul className="space-y-2 text-sm text-[#1a1f1a]/85">
          {rightForYouIf.map(b => (
            <li key={b} className="flex items-start gap-2">
              <CheckIcon />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </article>
      <article className="bg-white border border-[#e8e3d4] rounded-xl p-6">
        <h3 className="font-display text-lg text-[#1a1f1a] mb-4">
          Use {otherProduct.label} instead if…
        </h3>
        <ul className="space-y-2 text-sm text-[#1a1f1a]/85 mb-4">
          {otherProduct.bullets.map(b => (
            <li key={b} className="flex items-start gap-2">
              <InfoIcon />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <a
          href={otherProduct.href}
          className="text-sm text-[#1f3a2e] underline-offset-2 hover:underline"
        >
          See {otherProduct.label} →
        </a>
      </article>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-1 text-[#1f3a2e] flex-shrink-0">
      <path
        fillRule="evenodd"
        d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 111.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-1 text-[#1a1f1a]/55 flex-shrink-0">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-5h2v5zm-1-7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  )
}
