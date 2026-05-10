'use client'

// v7.2.12 — selection checkbox for product cards.

import { useOptionalCartSelectionContext } from './CartSelectionContext'

interface Props {
  slotId: string
  defaultSelected?: boolean
  ariaLabel?: string
  size?: 'default' | 'hero'
}

export default function SelectionCheckbox({
  slotId,
  defaultSelected,
  ariaLabel,
  size = 'default',
}: Props) {
  const ctx = useOptionalCartSelectionContext()

  if (!ctx) {
    return (
      <div
        aria-hidden="true"
        className={`${
          size === 'hero' ? 'w-6 h-6' : 'w-5 h-5'
        } rounded border-2 ${
          defaultSelected
            ? 'bg-[#1f3a2e] border-[#1f3a2e]'
            : 'bg-white border-[#d4cfc0]'
        } flex items-center justify-center flex-shrink-0`}
      >
        {defaultSelected && (
          <svg
            viewBox="0 0 16 16"
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    )
  }

  const checked = ctx.isSelected(slotId)

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={
        ariaLabel
          ? `${checked ? 'Remove' : 'Add'} ${ariaLabel} ${
              checked ? 'from' : 'to'
            } your selection`
          : undefined
      }
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        ctx.toggle(slotId)
      }}
      className={`${
        size === 'hero' ? 'w-7 h-7' : 'w-6 h-6'
      } rounded border-2 transition-colors flex-shrink-0 inline-flex items-center justify-center ${
        checked
          ? 'bg-[#1f3a2e] border-[#1f3a2e] hover:bg-[#162a21]'
          : 'bg-white border-[#d4cfc0] hover:border-[#1f3a2e]/60'
      } focus-visible:ring-2 focus-visible:ring-[#1f3a2e]/40 focus-visible:outline-none`}
    >
      {checked && (
        <svg
          viewBox="0 0 16 16"
          className={`${size === 'hero' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-white`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden="true"
        >
          <path
            d="M3 8.5l3 3 7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
