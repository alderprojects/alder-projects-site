/**
 * v7.4.1 — Verdict card. Presentational and server-safe: the homepage
 * renders two static example cards from eval-fixture data (crawlers and
 * AI assistants see real product output), and the live flow renders the
 * same component with API data.
 *
 * Design language: deep green / warm off-white / muted gold, verdict
 * badges, trusted-advisor tone. Naming rule: "Alder Check" appears in
 * UI copy only — this component's data shapes stay report/recommendation.
 */

import ProductCard from './ProductCard'
import { LANES } from '@/lib/copy/canon'

const PALETTE = {
  green: '#1f3d2b',
  cream: '#f6f2e8',
  gold: '#b08d2f',
  ink: '#22301f',
  inkSoft: 'rgba(34,48,31,0.68)',
  line: 'rgba(31,61,43,0.14)',
  card: '#ffffff',
}

// v7.4.14 — lane styling and labels come from the copy canon so the
// result card and every marketing surface cannot drift apart. The stored
// verdict enum is unchanged (still INVESTIGATE); only its label moved to
// "Monitor".
const VERDICT_STYLE: Record<string, { bg: string; fg: string; label: string }> = Object.fromEntries(
  LANES.map((l) => [l.id, { bg: l.bg, fg: l.fg, label: l.label }])
)

export interface VerdictCardData {
  verdict: string
  title: string
  summary: string
  visibleEvidence: string[]
  costLow?: number | null
  costHigh?: number | null
  rebate?: { program: string; display: string } | null
  citations?: Array<{ guideSlug: string; guideTitle: string; verifiedAt: string }>
  nextAction?: string
  categorySearchUrl?: string | null
  confidenceLabel?: string
  /** v7.4.10 — product card payload; BUY/WAIT only (CR4). */
  product?: {
    productName?: string
    spec?: string | null
    resolutionMode: 'ASIN' | 'SEARCH'
    url: string
    imageUrl: string | null
    illustration: string
    title: string | null
    price: number | null
    priceAsOf: string | null
  } | null
  productName?: string
  productSpec?: string | null
}

function fmtMonthYear(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function VerdictCard({
  data,
  onAffiliateClick,
}: {
  data: VerdictCardData
  onAffiliateClick?: () => void
}) {
  const style = VERDICT_STYLE[data.verdict] ?? VERDICT_STYLE.INVESTIGATE
  const hasCost = data.costLow != null && data.costHigh != null
  const citation = data.citations?.[0]

  return (
    <article
      style={{
        background: PALETTE.card,
        border: `1px solid ${PALETTE.line}`,
        borderRadius: 12,
        padding: '20px 22px',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span
          style={{
            background: style.bg,
            color: style.fg,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderRadius: 6,
            padding: '4px 10px',
          }}
        >
          {style.label}
        </span>
        <h3 style={{ margin: 0, fontSize: 17, color: PALETTE.ink, fontWeight: 600 }}>{data.title}</h3>
      </div>

      <p style={{ margin: '0 0 12px', color: PALETTE.inkSoft, fontSize: 15, lineHeight: 1.55 }}>{data.summary}</p>

      {data.visibleEvidence.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: PALETTE.gold, marginBottom: 4 }}>
            What we saw
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: PALETTE.inkSoft, fontSize: 14, lineHeight: 1.5 }}>
            {data.visibleEvidence.slice(0, 3).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {(hasCost || data.rebate) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontSize: 14 }}>
          {hasCost && (
            <div>
              <span style={{ color: PALETTE.inkSoft }}>Typical cost: </span>
              <strong style={{ color: PALETTE.ink }}>
                ${data.costLow!.toLocaleString()}–${data.costHigh!.toLocaleString()}
              </strong>
            </div>
          )}
          {data.rebate && (
            <div>
              <span style={{ color: PALETTE.inkSoft }}>{data.rebate.program}: </span>
              <strong style={{ color: '#2d5a3d' }}>{data.rebate.display}</strong>
            </div>
          )}
        </div>
      )}

      {data.nextAction && (
        <p style={{ margin: '0 0 10px', fontSize: 14, color: PALETTE.ink }}>
          <strong>Next step:</strong> {data.nextAction}
        </p>
      )}

      {/* v7.4.10 — resolved product card (BUY/WAIT only; ProductCard
          itself returns null for other lanes, so CR4 is enforced in one
          place rather than trusted to every caller). */}
      {data.product && (
        <ProductCard
          data={{
            verdict: data.verdict,
            productName: data.product.productName || data.productName || data.product.title || 'Recommended option',
            spec: data.product.spec ?? data.productSpec ?? null,
            price: data.product.price,
            priceAsOf: data.product.priceAsOf,
            url: data.product.url,
            imageUrl: data.product.imageUrl,
            illustration: data.product.illustration,
            resolutionMode: data.product.resolutionMode,
          }}
          onAffiliateClick={onAffiliateClick}
        />
      )}

      {/* Legacy category link only when nothing was resolved and the lane
          allows a link at all (never SKIP/INVESTIGATE). */}
      {!data.product && data.categorySearchUrl && data.verdict === 'BUY' && (
        <a
          href={data.categorySearchUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          onClick={onAffiliateClick}
          style={{ fontSize: 14, color: PALETTE.green, fontWeight: 600, textDecoration: 'underline' }}
        >
          Browse options on Amazon →
        </a>
      )}

      {citation && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${PALETTE.line}`, fontSize: 12.5, color: PALETTE.inkSoft }}>
          Cost basis:{' '}
          <a href={`/guides/${citation.guideSlug}`} style={{ color: PALETTE.green, textDecoration: 'underline' }}>
            {citation.guideTitle}
          </a>
          , verified {fmtMonthYear(citation.verifiedAt)}
        </div>
      )}
    </article>
  )
}

export { PALETTE }
