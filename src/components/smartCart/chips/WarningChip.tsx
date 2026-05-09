// v7.2.7 — amber chip for skip-premium / conditional-recommend cases.

interface Props {
  label: string
}

export default function WarningChip({ label }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3"
        aria-hidden
      >
        <path d="M12 5.99L19.53 19H4.47zM12 2L1 21h22z M11 16h2v2h-2zm0-6h2v5h-2z" />
      </svg>
      {label}
    </span>
  )
}
