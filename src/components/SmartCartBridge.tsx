'use client'

import Link from 'next/link'
import {
  trackBridgeModuleClick,
  trackContractorContinueClick,
} from '@/lib/analytics'

// v7.2.14 — Smart Cart bridge module.
// Renders above contractor / town × service page content where
// the cart is a better first step for some users. Pairs with the
// pre-cart landing page for the topic.
//
// v7.2.15 — secondary text can either stay as an italic line (default,
// non-blocking on pages where the contractor list is right below) or
// surface as a clickable secondary CTA (used on /basement-finishing-vermont
// where urgent pro intent — active water, mold, structural — should not
// be sent to a $19.99 cart by default).

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  ivory: '#F5EFE0',
  cream: '#FAF7F2',
  accent: '#C8732A',
}
const FS = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"

export type SmartCartBridgeProps = {
  /** Headline ("Before you replace the windows:" etc.) */
  headline: string
  /** 1-2 sentences explaining when the cart is a better first step. */
  body: string
  /** Pre-cart landing page slug (under /smart-cart/topic/). */
  topicSlug: string
  /** CTA text shown on the primary button. */
  ctaText: string
  /** Optional secondary line (e.g. "Still need a pro? Continue below ↓"). */
  secondaryText?: string
  /**
   * v7.2.15 — optional contractor / pro continuation CTA. Renders as a
   * second clickable link next to the primary cart CTA. When set, the
   * `secondaryText` italic line is suppressed in favor of the link.
   */
  contractorCta?: { text: string; href: string; trade?: string }
}

export default function SmartCartBridge({
  headline,
  body,
  topicSlug,
  ctaText,
  secondaryText,
  contractorCta,
}: SmartCartBridgeProps) {
  return (
    <aside
      data-testid="smart-cart-bridge"
      style={{
        background: C.ivory,
        border: `1px solid rgba(28,43,26,0.12)`,
        borderRadius: 6,
        padding: '20px 22px',
        margin: '0 0 32px',
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontFamily: FB,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.accent,
          margin: '0 0 8px',
        }}
      >
        Smart Cart · $19.99
      </p>
      <h3
        style={{
          fontFamily: FS,
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 8px',
          color: C.ink,
          lineHeight: 1.3,
        }}
      >
        {headline}
      </h3>
      <p
        style={{
          fontSize: 15,
          color: C.inkSoft,
          lineHeight: 1.6,
          margin: '0 0 14px',
        }}
      >
        {body}
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link
          href={`/smart-cart/topic/${topicSlug}`}
          data-source-component="smart_cart_bridge"
          onClick={() => {
            if (typeof window === 'undefined') return
            trackBridgeModuleClick({
              topicSlug,
              fromPage: window.location.pathname,
            })
          }}
          style={{
            display: 'inline-block',
            background: C.accent,
            color: '#fff',
            fontFamily: FB,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: 4,
          }}
        >
          {ctaText} →
        </Link>
        {contractorCta && (
          <Link
            href={contractorCta.href}
            data-source-component="smart_cart_bridge_contractor"
            onClick={() => {
              if (typeof window === 'undefined') return
              trackContractorContinueClick({
                fromPage: window.location.pathname,
                trade: contractorCta.trade,
              })
            }}
            style={{
              fontFamily: FB,
              fontSize: 14,
              fontWeight: 600,
              color: C.ink,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {contractorCta.text} →
          </Link>
        )}
      </div>
      {!contractorCta && secondaryText && (
        <p
          style={{
            fontSize: 13,
            color: C.inkSoft,
            margin: '12px 0 0',
            fontStyle: 'italic',
          }}
        >
          {secondaryText}
        </p>
      )}
    </aside>
  )
}
