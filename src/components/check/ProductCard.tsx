'use client'

/**
 * v7.4.10 §2.4 — the product card. Same grammar on the result page and
 * in the cart email (the email renders its own table version of this).
 *
 * CR4 — lane honesty, enforced here rather than trusted to callers:
 *   BUY         image · name+spec · price + "as of" · "View on Amazon →"
 *   WAIT        image · name+spec · wait-until framing, NO buy CTA
 *   SKIP        nothing renders — this component returns null
 *   INVESTIGATE nothing renders — this component returns null
 *
 * CR5 — image is either the PA-API primary image (ASIN-resolved) or a
 * Blob/static brand illustration. There is no third source.
 *
 * Positioning guard (§2.4): the CTA is a utility link, not a shop-now
 * button. The $19.99 story is the diagnostic, not product-finding.
 */

// Local palette copy: importing PALETTE from VerdictCard would create a
// cycle (VerdictCard renders this component). Values mirror the site tokens.
const PALETTE = {
  ink: '#22301F',
  inkSoft: 'rgba(34,48,31,0.68)',
  green: '#2F5233',
  line: 'rgba(34,48,31,0.16)',
}

export interface ProductCardData {
  verdict: string
  productName: string
  spec?: string | null
  price?: number | null
  priceAsOf?: string | null
  url?: string | null
  imageUrl?: string | null
  illustration: string
  resolutionMode?: 'ASIN' | 'SEARCH' | null
  waitUntil?: string | null
}

const LANE_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  BUY: { bg: '#e4efe0', fg: '#1f7a33', label: 'BUY' },
  WAIT: { bg: '#f6efd9', fg: '#8a6d1a', label: 'WAIT' },
}

export default function ProductCard({
  data,
  onAffiliateClick,
}: {
  data: ProductCardData
  onAffiliateClick?: () => void
}) {
  // CR4: only BUY and WAIT ever render a product card.
  if (data.verdict !== 'BUY' && data.verdict !== 'WAIT') return null

  const isBuy = data.verdict === 'BUY'
  const badge = LANE_BADGE[data.verdict]
  // CR5: PA-API image when we truly resolved a product; otherwise the
  // brand illustration. Never a generated depiction of a real product.
  const img = data.resolutionMode === 'ASIN' && data.imageUrl ? data.imageUrl : data.illustration

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        border: `1px solid ${PALETTE.line}`,
        borderRadius: 10,
        padding: '10px 12px',
        background: '#fff',
        marginTop: 10,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt=""
        width={64}
        height={64}
        style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 6, flexShrink: 0, background: '#faf8f2' }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.06em',
              background: badge.bg,
              color: badge.fg,
              borderRadius: 3,
              padding: '1px 6px',
            }}
          >
            {badge.label}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink }}>{data.productName}</span>
        </div>

        {data.spec && (
          <div style={{ fontSize: 12.5, color: PALETTE.inkSoft, marginTop: 3 }}>{data.spec}</div>
        )}

        {/* Price renders for BUY only, and never without its "as of" date. */}
        {isBuy && data.price != null && data.priceAsOf && (
          <div style={{ fontSize: 13, color: PALETTE.ink, marginTop: 4 }}>
            <strong>${data.price.toFixed(2)}</strong>{' '}
            <span style={{ color: PALETTE.inkSoft, fontSize: 12 }}>as of {data.priceAsOf}</span>
          </div>
        )}

        {isBuy ? (
          data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={onAffiliateClick}
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: 13.5,
                color: PALETTE.green,
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              View on Amazon →
            </a>
          )
        ) : (
          // WAIT: identification only, no buy CTA (CR4).
          <div style={{ marginTop: 6, fontSize: 13, color: PALETTE.inkSoft, fontStyle: 'italic' }}>
            {data.waitUntil || 'Worth knowing what to buy — but not yet. Revisit when the conditions above change.'}
          </div>
        )}
      </div>
    </div>
  )
}

/** §2.4 — ships on both surfaces in the same deploy. */
export function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <p
      style={{
        fontSize: compact ? 11.5 : 12,
        color: PALETTE.inkSoft,
        margin: compact ? '10px 0 0' : '18px 0 0',
        lineHeight: 1.5,
      }}
    >
      As an Amazon Associate, Alder earns from qualifying purchases.
    </p>
  )
}
