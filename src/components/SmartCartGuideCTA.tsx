'use client'

// v7.2.14 fix-up — Smart Cart CTA used inside guide pages.
//
// Three placements:
//   variant="top"     — narrow inline button after the lead paragraph
//   variant="inline"  — boxed inline CTA at the end of a section
//   variant="hero"    — replaces GuideFooter's property-tool hero
//                       on guides that have a paired Smart Cart scope
//
// Each variant fires the curation modal via data-curation-modal-*
// attributes. A secondary "Just want the buy/skip list" link points
// to the topic page (/smart-cart/topic/[topicPageSlug]).

import Link from 'next/link'
import type { TopicId } from '@/lib/property-modules'
import type { CartTier } from '@/lib/smart-cart-model'
import type { BriefScenarioId } from '@/lib/recommender-config.types'
import { trackSmartCartCtaClick } from '@/lib/analytics'

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  ivory: '#F5EFE0',
  cream: '#FAF7F2',
  accent: '#C8732A',
  sage: '#7A9B6F',
}
const FS = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

export type SmartCartGuideCTAConfig = {
  topicId: TopicId
  scopeVariantId: string
  scenario: BriefScenarioId
  tier?: CartTier
  topicPageSlug: string
  /** Headline shown on the hero variant. Optional. */
  heroHeadline?: string
  /** Body shown on the hero variant. Optional. */
  heroBody?: string
  /** Primary button label. Default: "Build my Smart Cart". */
  primaryLabel?: string
  /** Secondary link label. Default: "Just want the buy/skip list →". */
  secondaryLabel?: string
}

type Props = SmartCartGuideCTAConfig & {
  variant: 'top' | 'inline' | 'hero'
}

export default function SmartCartGuideCTA({
  variant,
  topicId,
  scopeVariantId,
  scenario,
  tier = 'sweet_spot',
  topicPageSlug,
  heroHeadline,
  heroBody,
  primaryLabel = 'Build my Smart Cart — $19.99',
  secondaryLabel = 'Just want the buy/skip list →',
}: Props) {
  const placementByVariant: Record<typeof variant, string> = {
    top: 'guide_cta_top',
    inline: 'guide_cta_inline',
    hero: 'guide_cta_hero',
  }
  function onCtaClick() {
    if (typeof window === 'undefined') return
    trackSmartCartCtaClick({
      placement: placementByVariant[variant],
      topic: topicId,
      scopeVariantId,
      scenario,
      sourcePath: window.location.pathname,
    })
  }
  const dataAttrs = {
    'data-curation-modal-open': true,
    'data-curation-modal-product': 'smart_cart',
    'data-curation-modal-topic': topicId,
    'data-curation-modal-scope': scopeVariantId,
    'data-curation-modal-scenario': scenario,
    'data-curation-modal-tier': tier,
    'data-source-component': placementByVariant[variant],
    // v7.2.15 — deterministic QA hooks. Manual QA can verify modal
    // prefill from DevTools without firing the modal. Mirrors the
    // modal-open attrs above; do not remove the originals (the
    // CurationModal click handler reads from those).
    'data-topic-id': topicId,
    'data-scope-id': scopeVariantId,
    'data-scenario-id': scenario,
    onClick: onCtaClick,
  }

  if (variant === 'top') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          padding: '14px 16px',
          margin: '0 auto 28px',
          maxWidth: 720,
          background: C.ivory,
          borderRadius: 4,
          border: `1px solid rgba(28,43,26,0.1)`,
          fontFamily: FB,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.accent,
            fontFamily: FM,
            fontWeight: 600,
          }}
        >
          Smart Cart · $19.99
        </span>
        <span style={{ fontSize: 14, color: C.ink, flexGrow: 1, minWidth: 200 }}>
          Skip the rabbit hole. Get the curated buy + skip list for this scope.
        </span>
        <button
          type="button"
          {...dataAttrs}
          style={{
            background: C.accent,
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            fontFamily: FB,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          {primaryLabel} →
        </button>
        <Link
          href={`/smart-cart/topic/${topicPageSlug}`}
          style={{
            fontSize: 13,
            color: C.ink,
            textDecoration: 'underline',
          }}
        >
          {secondaryLabel}
        </Link>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <aside
        style={{
          margin: '32px 0',
          padding: '24px 26px',
          background: C.ivory,
          borderRadius: 6,
          border: `1px solid rgba(28,43,26,0.1)`,
          fontFamily: FB,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontFamily: FM,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.accent,
            margin: '0 0 8px',
            fontWeight: 600,
          }}
        >
          The cart for this scope
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
          Stop reading. Start building.
        </h3>
        <p
          style={{
            fontSize: 15,
            color: C.inkSoft,
            margin: '0 0 16px',
            lineHeight: 1.6,
          }}
        >
          You read the diagnostic. The $19.99 cart is the curated buy list with
          the skip list and the route-outs already in it.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            {...dataAttrs}
            style={{
              background: C.accent,
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            {primaryLabel} →
          </button>
          <Link
            href={`/smart-cart/topic/${topicPageSlug}`}
            style={{
              fontSize: 14,
              color: C.ink,
              textDecoration: 'underline',
            }}
          >
            {secondaryLabel}
          </Link>
        </div>
      </aside>
    )
  }

  // hero variant — replaces GuideFooter property-tool funnel
  return (
    <div
      style={{
        padding: '32px 28px',
        backgroundColor: C.ink,
        color: C.cream,
        marginBottom: 40,
        fontFamily: FB,
      }}
    >
      <p
        style={{
          fontFamily: FM,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.accent,
          margin: '0 0 12px',
          fontWeight: 600,
        }}
      >
        Smart Cart · $19.99
      </p>
      <p
        style={{
          fontFamily: FS,
          fontSize: 22,
          fontWeight: 500,
          color: C.cream,
          lineHeight: 1.35,
          margin: '0 0 12px',
        }}
      >
        {heroHeadline ?? 'Done reading? Get the curated cart.'}
      </p>
      <p
        style={{
          fontSize: 15,
          color: 'rgba(245,239,224,0.78)',
          lineHeight: 1.65,
          margin: '0 0 22px',
          maxWidth: 560,
        }}
      >
        {heroBody ??
          'The buy list, the skip list, the route-outs. One scope. One winter. $19.99 with a 30-day refund window.'}
      </p>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          {...dataAttrs}
          style={{
            background: C.accent,
            color: '#fff',
            border: 'none',
            padding: '12px 22px',
            fontFamily: FB,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          {primaryLabel} →
        </button>
        <Link
          href={`/smart-cart/topic/${topicPageSlug}`}
          style={{
            fontSize: 14,
            fontFamily: FM,
            letterSpacing: '0.04em',
            color: C.sage,
            textDecoration: 'none',
            borderBottom: `1px solid ${C.sage}`,
            paddingBottom: 2,
          }}
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  )
}
