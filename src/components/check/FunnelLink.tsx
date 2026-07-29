'use client'

/**
 * v7.4.14 — a Link that fires a funnel event on click.
 *
 * Used by the homepage real-example CTA (REAL_EXAMPLE_CTA_CLICKED) and the
 * /smart-cart Worth-It waitlist link (ASSESSMENT_INTEREST). Fire-and-forget:
 * navigation is never blocked or delayed by the event write.
 */

import Link from 'next/link'
import { fireFunnel } from '@/lib/check/funnel'

export default function FunnelLink({
  href,
  eventType,
  payload,
  style,
  className,
  children,
}: {
  href: string
  eventType: string
  payload?: Record<string, unknown>
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={className}
      style={style}
      onClick={() => fireFunnel(eventType, payload)}
    >
      {children}
    </Link>
  )
}
