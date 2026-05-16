/**
 * v7.2.19 — DIY-first capture banner.
 * Drops onto every contractor-vertical page above-fold.
 * Captures the contractor-intent visitors who would otherwise leave when
 * they realize we have no contractors enrolled.
 */
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CONTRACTOR_PAGE_SCOPE_MAP, REFUND_POLICY_SHORT } from '@/lib/constants'

export default function ContractorDiyBanner() {
  const pathname = usePathname()

  // Match the exact path or a town-suffix variant (e.g. /window-replacement-burlington-vt)
  let config = pathname ? CONTRACTOR_PAGE_SCOPE_MAP[pathname] : undefined
  if (!config && pathname) {
    // Try matching parent contractor page by stripping town suffix
    const parent = pathname.replace(/-[a-z]+-vt$/, '-vermont')
    config = CONTRACTOR_PAGE_SCOPE_MAP[parent]
  }
  if (!config) return null

  const ctaHref = config.product === 'smart_cart'
    ? `/smart-cart?topic=${config.topic}&scope=${config.scope}&utm_source=contractor_page&utm_medium=diy_banner&utm_campaign=${encodeURIComponent(pathname || 'unknown')}`
    : `/worth-it?utm_source=contractor_page&utm_medium=diy_banner&utm_campaign=${encodeURIComponent(pathname || 'unknown')}`

  const ctaLabel = config.product === 'smart_cart'
    ? 'Build my Smart Cart — $19.99 →'
    : 'See Worth-It Plan — $39 →'

  return (
    <div
      style={{
        backgroundColor: '#FAF7F2',
        border: '1px solid rgba(122,155,111,0.35)',
        borderLeft: '4px solid #C8732A',
        borderRadius: '4px',
        padding: '20px 24px',
        margin: '0 0 32px 0',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{
        fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em',
        textTransform: 'uppercase', color: '#7A9B6F', marginBottom: '6px',
      }}>
        Before you call a contractor
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '20px', fontWeight: 600, color: '#1C2B1A',
        margin: '0 0 10px 0', lineHeight: 1.25,
      }}>
        {config.headline}
      </h3>
      <p style={{
        fontSize: '14px', color: 'rgba(28,43,26,0.78)',
        lineHeight: 1.55, margin: '0 0 16px 0',
      }}>
        {config.diyAngle}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <Link
          href={ctaHref}
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'contractor_page_banner_clicked', {
                page_path: pathname,
                product: config.product,
                scope_id: config.scope || 'worth_it',
              })
            }
          }}
          style={{
            padding: '10px 18px', backgroundColor: '#C8732A',
            color: '#FAF7F2', fontSize: '13px', fontWeight: 600,
            borderRadius: '3px', textDecoration: 'none',
          }}
        >
          {ctaLabel}
        </Link>
        {config.guideHref && (
          <Link
            href={config.guideHref + '?utm_source=contractor_page&utm_medium=diy_banner_secondary'}
            style={{
              fontSize: '13px', color: 'rgba(28,43,26,0.65)',
              textDecoration: 'underline',
            }}
          >
            Read the free guide first
          </Link>
        )}
      </div>
      <p style={{
        fontSize: '11px', color: 'rgba(28,43,26,0.5)',
        margin: '12px 0 0 0', fontFamily: 'monospace',
      }}>
        {REFUND_POLICY_SHORT} · Still want contractor quotes? Keep scrolling.
      </p>
    </div>
  )
}
