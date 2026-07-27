/**
 * v7.4.1c — Standing Buy/Skip/Wait verdict box atop a guide. Rendered
 * automatically by GuidePage when the guide's path matches a verdict
 * hub's parentGuideSlug — zero per-guide edits. Numbers come from the
 * dataset at render time; the photo CTA is the conversion path.
 */

import Link from 'next/link'
import { hubForGuidePath, hubItems, type VerdictHub } from '@/lib/check/hubs'
import { isRebateStale } from '@/lib/recommend/dataset'

const VERDICT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  BUY: { bg: '#e5efe2', fg: '#2d5a3d', label: 'Buy' },
  WAIT: { bg: '#f3ecd9', fg: '#8a6d1f', label: 'Wait' },
  SKIP: { bg: '#f0e4e0', fg: '#8a3d2e', label: 'Skip' },
  INVESTIGATE: { bg: '#e7e9f0', fg: '#3d4a7a', label: 'Investigate' },
}

export function guideVerdictHub(path: string | undefined): VerdictHub | undefined {
  return path ? hubForGuidePath(path) : undefined
}

export default function GuideVerdictBox({ hub }: { hub: VerdictHub }) {
  const items = hubItems(hub)
  const headline = items.find((i) => i.costLow != null && i.costHigh != null)
  const rebateItem = items.find((i) => i.rebate)
  const style = VERDICT_STYLE[hub.verdict]

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '24px auto 0',
        background: '#fff',
        border: '1px solid rgba(28,43,26,0.12)',
        borderRadius: 10,
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <span
          style={{
            background: style.bg,
            color: style.fg,
            fontWeight: 700,
            fontSize: 12.5,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderRadius: 6,
            padding: '4px 10px',
          }}
        >
          {style.label}
        </span>
        <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b08d2f', fontWeight: 700 }}>
          Alder’s standing verdict
        </span>
      </div>
      <p style={{ fontSize: 14.5, color: 'rgba(28,43,26,0.8)', lineHeight: 1.6, margin: '0 0 10px' }}>{hub.rationale}</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14, marginBottom: 12 }}>
        {headline && (
          <span>
            <span style={{ color: 'rgba(28,43,26,0.6)' }}>Typical cost: </span>
            <strong>
              ${headline.costLow!.toLocaleString()}–${headline.costHigh!.toLocaleString()}
            </strong>
          </span>
        )}
        {rebateItem?.rebate && (
          <span>
            <span style={{ color: 'rgba(28,43,26,0.6)' }}>{rebateItem.rebate.program}: </span>
            <strong style={{ color: '#2d5a3d' }}>
              {isRebateStale(rebateItem.rebate.verifiedAt) ? 'check current program' : rebateItem.rebate.amount}
            </strong>
          </span>
        )}
      </div>
      <Link
        href="/check"
        style={{
          display: 'inline-block',
          background: '#1f3d2b',
          color: '#f6f2e8',
          borderRadius: 8,
          padding: '10px 18px',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Get your free Alder Check for YOUR home →
      </Link>
      <Link href={`/check/${hub.slug}`} style={{ marginLeft: 14, fontSize: 13.5, color: '#1f3d2b', textDecoration: 'underline' }}>
        Full verdict + numbers
      </Link>
    </div>
  )
}
