/**
 * v7.4.6 — /admin/dashboard. Metric cards + simple inline-SVG charts,
 * all from direct SQL (see lib/admin/metrics.ts), 5-minute cache. The
 * RESULT_VIEW_SECONDS / RESULT_SECTION_ENGAGEMENT pair sits at the top
 * with the funnel — those feed the v7.5 premium-tier decision. Each
 * card footer shows its own query time so the p95<2s budget stays
 * observable (rollup cron is backlog debt only on a recorded breach).
 */

import {
  getUploadVolume,
  getExtractionStats,
  getKillMetric,
  getFlagRates,
  getLaneDistribution,
  getFunnel,
  getResultEngagement,
  getReviewCoverage,
} from '@/lib/admin/metrics'

export const dynamic = 'force-dynamic'

const VERDICT_COLORS: Record<string, string> = {
  BUY: '#1f7a33',
  WAIT: '#8a6d1a',
  SKIP: '#9c3587',
  INVESTIGATE: '#b45309',
}

function Bars({ values, labels, color = '#1d4ed8', height = 64 }: { values: number[]; labels?: string[]; color?: string; height?: number }) {
  const max = Math.max(1, ...values)
  const barW = 100 / Math.max(1, values.length)
  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
        {values.map((v, i) => (
          <rect
            key={i}
            x={i * barW + barW * 0.12}
            y={height - (v / max) * (height - 4)}
            width={barW * 0.76}
            height={(v / max) * (height - 4)}
            fill={color}
            rx={0.6}
          />
        ))}
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999' }}>
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function Card({ title, children, queryMs, wide }: { title: string; children: React.ReactNode; queryMs: number; wide?: boolean }) {
  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #e2e2dc',
        borderRadius: 6,
        padding: '14px 16px',
        gridColumn: wide ? 'span 2' : undefined,
        minWidth: 0,
      }}
    >
      <h2 style={{ fontSize: 13.5, margin: '0 0 10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</h2>
      {children}
      <p style={{ fontSize: 10.5, color: '#bbb', margin: '10px 0 0' }}>query {queryMs}ms · cached 5m</p>
    </section>
  )
}

const big: React.CSSProperties = { fontSize: 26, fontWeight: 650, color: '#1C2B1A', lineHeight: 1.1 }
const sub: React.CSSProperties = { fontSize: 12.5, color: '#777' }

export default async function AdminDashboardPage() {
  const [uploads, extraction, kill, flags, lanes, funnel, engagement, coverage] = await Promise.all([
    getUploadVolume(),
    getExtractionStats(),
    getKillMetric(),
    getFlagRates(),
    getLaneDistribution(),
    getFunnel(),
    getResultEngagement(),
    getReviewCoverage(),
  ])

  const pct = (v: number | null) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`)
  const funnelStages = [
    { label: 'Uploaded', n: funnel.data.uploaded },
    { label: 'Result viewed', n: funnel.data.resultViewed },
    { label: 'Email captured', n: funnel.data.emailCaptured },
    { label: 'Purchased', n: funnel.data.purchased },
  ]
  const funnelMax = Math.max(1, funnel.data.uploaded)

  return (
    <main style={{ padding: '26px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 14px' }}>Ops dashboard · last 30 days</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {/* v7.5 decision pair + funnel, top of page */}
        <Card title="Funnel — upload → view → email → purchase" queryMs={funnel.queryMs} wide>
          {funnelStages.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ width: 110, fontSize: 12.5, color: '#555' }}>{s.label}</span>
              <div style={{ flex: 1, background: '#f0efe9', borderRadius: 4, height: 18 }}>
                <div
                  style={{
                    width: `${(s.n / funnelMax) * 100}%`,
                    minWidth: s.n > 0 ? 4 : 0,
                    background: '#1d4ed8',
                    height: '100%',
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ width: 60, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{s.n}</span>
            </div>
          ))}
          <p style={sub}>Anon-keyed, monotonic by construction (each stage ⊆ previous).</p>
        </Card>

        <Card title="Result view seconds (v7.5 signal)" queryMs={engagement.queryMs}>
          <div style={big}>{engagement.data.viewSeconds.median != null ? `${engagement.data.viewSeconds.median}s` : '—'}</div>
          <p style={sub}>median · {engagement.data.viewSeconds.count} views measured</p>
          <Bars values={engagement.data.viewSeconds.buckets} labels={engagement.data.viewSeconds.labels} color="#0e7490" />
        </Card>

        <Card title="Section engagement (v7.5 signal)" queryMs={engagement.queryMs}>
          {engagement.data.sections.length === 0 && <p style={sub}>No RESULT_SECTION_ENGAGEMENT events yet — instrumentation ships with this release; data accrues from the next deploy on.</p>}
          {engagement.data.sections.map((s) => (
            <div key={s.section} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', borderBottom: '1px solid #f0efe9' }}>
              <span>{s.section}</span>
              <strong>{s.count}</strong>
            </div>
          ))}
        </Card>

        <Card title="Daily upload volume" queryMs={uploads.queryMs}>
          <div style={big}>{uploads.data.points.reduce((s, p) => s + p.uploads, 0)}</div>
          <p style={sub}>uploads · failure rate {pct(uploads.data.failureRate)}</p>
          <Bars values={uploads.data.points.map((p) => p.uploads)} color="#1f7a33" />
          {Object.keys(uploads.data.failuresByClass).length > 0 && (
            <p style={{ ...sub, marginTop: 6 }}>
              failures:{' '}
              {Object.entries(uploads.data.failuresByClass)
                .map(([k, v]) => `${k} ${v}`)
                .join(' · ')}{' '}
              <span style={{ color: '#b45309' }}>(watch image_decode post-PR3.7)</span>
            </p>
          )}
        </Card>

        <Card title="Extraction confidence histogram" queryMs={extraction.queryMs}>
          <div style={big}>{extraction.data.total}</div>
          <p style={sub}>extractions · error rate {pct(extraction.data.errorRate)}</p>
          <Bars values={extraction.data.histogram} labels={['0', '', '', '', '0.5', '', '', '', '', '1']} color="#7c3aed" />
        </Card>

        <Card title="photoChangedRecommendation (kill metric)" queryMs={kill.queryMs}>
          <div style={big}>{pct(kill.data.overallRate)}</div>
          <p style={sub}>
            {kill.data.overallRate == null
              ? 'no dual-synthesis SmartCarts measured yet'
              : 'of dual-synthesis carts changed by photo signal (thesis floor: 40%)'}
          </p>
          <Bars
            values={kill.data.weekly.map((w) => (w.measured > 0 ? (w.changed / w.measured) * 100 : 0))}
            labels={kill.data.weekly.length ? [kill.data.weekly[0].week, kill.data.weekly[kill.data.weekly.length - 1].week] : undefined}
            color="#b45309"
          />
        </Card>

        <Card title="QA flag rates (per reviewed session)" queryMs={flags.queryMs}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={big}>{pct(flags.data.hallucinationRate)}</div>
              <p style={sub}>hallucination</p>
            </div>
            <div>
              <div style={big}>{pct(flags.data.extractionMissRate)}</div>
              <p style={sub}>extraction miss</p>
            </div>
            <div>
              <div style={big}>{flags.data.reviewed}</div>
              <p style={sub}>reviewed (30d)</p>
            </div>
          </div>
          {Object.keys(flags.data.flagCounts).length > 0 && (
            <p style={{ ...sub, marginTop: 8 }}>
              all flags:{' '}
              {Object.entries(flags.data.flagCounts)
                .map(([k, v]) => `${k} ${v}`)
                .join(' · ')}
            </p>
          )}
        </Card>

        <Card title="Lane distribution over time (weekly)" queryMs={lanes.queryMs} wide>
          {lanes.data.length === 0 && <p style={sub}>No recommendations in window.</p>}
          {lanes.data.map((w) => {
            const total = Object.values(w.lanes).reduce((s, n) => s + n, 0)
            return (
              <div key={w.week} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ width: 80, fontSize: 11.5, color: '#777' }}>{w.week}</span>
                <div style={{ flex: 1, display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden', background: '#f0efe9' }}>
                  {(['BUY', 'WAIT', 'SKIP', 'INVESTIGATE'] as const).map((v) =>
                    w.lanes[v] ? (
                      <div key={v} style={{ width: `${(w.lanes[v] / total) * 100}%`, background: VERDICT_COLORS[v] }} title={`${v} ${w.lanes[v]}`} />
                    ) : null
                  )}
                </div>
                <span style={{ width: 40, fontSize: 11.5, color: '#777', textAlign: 'right' }}>{total}</span>
              </div>
            )
          })}
          <p style={{ ...sub, marginTop: 6 }}>
            {(['BUY', 'WAIT', 'SKIP', 'INVESTIGATE'] as const).map((v) => (
              <span key={v} style={{ marginRight: 12 }}>
                <span style={{ display: 'inline-block', width: 9, height: 9, background: VERDICT_COLORS[v], borderRadius: 2, marginRight: 4 }} />
                {v}
              </span>
            ))}
          </p>
        </Card>

        <Card title="Review coverage (7d)" queryMs={coverage.queryMs}>
          <div style={big}>
            {coverage.data.total > 0 ? `${((coverage.data.reviewed / coverage.data.total) * 100).toFixed(0)}%` : '—'}
          </div>
          <p style={sub}>
            {coverage.data.reviewed}/{coverage.data.total} last-7-day sessions reviewed · {coverage.data.unreviewedAllTime} unreviewed all-time —{' '}
            <a href="/admin/queue" style={{ color: '#1d4ed8' }}>
              open queue
            </a>
          </p>
        </Card>
      </div>
    </main>
  )
}
