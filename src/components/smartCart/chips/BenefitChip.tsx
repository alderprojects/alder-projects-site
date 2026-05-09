// v7.2.7 — green check chip used on RecommendedPickCard.

interface Props {
  label: string
}

export default function BenefitChip({ label }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3"
        aria-hidden
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      {label}
    </span>
  )
}
