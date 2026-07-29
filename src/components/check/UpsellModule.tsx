'use client'

/**
 * v7.4.16 §1.3 — the Check → Smart Cart upsell.
 *
 * CR4 — invited, not sprayed. Enforcement lives here rather than in each
 * caller: `renderable` is false on coaching/empty states, and the caller
 * may mount at most MAX_UPSELLS_PER_RESULT positions ('focus' and 'end').
 * A SKIP group never receives one because neither position sits inside a
 * group at all.
 *
 * CR2 — the estimate is passed in already computed by estimateCartSavings().
 * This component cannot produce a number: with no estimate it renders the
 * fallback copy, which contains no figure other than the price.
 */

import { useEffect, useRef } from 'react'
import { fireFunnel } from '@/lib/check/funnel'
import { upsellWithEstimate, upsellFallback, CTA_CART } from '@/lib/copy/canon'
import { formatSavings, type SavingsEstimate } from '@/lib/result/savings'
import { PALETTE } from './VerdictCard'

export type UpsellPosition = 'focus' | 'end'

/**
 * CR4 gate. A read that delivered nothing is never upsold.
 */
export function upsellRenderable(args: {
  itemCount: number
  coaching: boolean
  eligible: boolean
}): boolean {
  if (args.coaching) return false
  if (args.itemCount === 0) return false
  return args.eligible
}

export default function UpsellModule({
  position,
  estimate,
  reportId,
  href = '/smart-cart',
  compact = false,
}: {
  position: UpsellPosition
  estimate: SavingsEstimate | null
  reportId: string
  href?: string
  compact?: boolean
}) {
  const variant = estimate ? 'estimate' : 'fallback'
  const copy = estimate ? upsellWithEstimate(formatSavings(estimate)) : upsellFallback()

  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    fireFunnel('UPSELL_SHOWN', { variant, position, reportId })
    // §1.4 — every rendered estimate logs its arithmetic, so any figure a
    // customer saw can be reconstructed later.
    if (estimate) {
      fireFunnel('SAVINGS_ESTIMATE_SHOWN', {
        low: estimate.low,
        high: estimate.high,
        components: estimate.components,
        reportId,
        position,
      })
    }
  }, [variant, position, estimate, reportId])

  return (
    <section
      style={{
        background: '#fff',
        border: `1px solid ${PALETTE.line}`,
        borderRadius: 12,
        padding: compact ? '14px 16px' : '18px 20px',
        margin: compact ? '20px 0 0' : '20px 0',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: compact ? 14 : 15,
          color: PALETTE.ink,
          lineHeight: 1.55,
        }}
      >
        {copy}
      </p>
      <a
        href={href}
        onClick={() => fireFunnel('UPSELL_CLICKED', { variant, position, reportId })}
        style={{
          display: 'inline-block',
          background: PALETTE.green,
          color: '#fff',
          fontWeight: 600,
          fontSize: 14.5,
          borderRadius: 8,
          padding: '10px 18px',
          textDecoration: 'none',
        }}
      >
        {CTA_CART}
      </a>
    </section>
  )
}
