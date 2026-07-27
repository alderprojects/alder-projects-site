/**
 * v7.4.4 — Admin-lite: /admin/reports
 * v7.4.5 — moved behind the console's magic-link + ADMIN_EMAILS auth
 * (was ADMIN_REFUND_TOKEN in the query string). Content unchanged: recent
 * reports with structured observations, verdict mix, confidence, flags,
 * feedback, raw pipeline log access, the disable-recommendation toggle,
 * and the flywheel CategoryObservation counts. The full review surface
 * is /admin (session list) — this stays the quick-scan ops view.
 */

import { prisma } from '@/lib/db'
import ToggleButton from './ToggleButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reports — admin-lite', robots: { index: false } }

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { days?: string }
}) {
  const days = Math.min(90, Math.max(1, parseInt(searchParams.days ?? '7', 10) || 7))
  const since = new Date(Date.now() - days * 24 * 3600 * 1000)

  const reports = await prisma.report.findMany({
    where: { createdAt: { gte: since }, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      recommendations: { orderBy: { sortOrder: 'asc' } },
      feedback: true,
    },
  })

  const observations = await prisma.categoryObservation.groupBy({
    by: ['category', 'verdict'],
    _count: { _all: true },
    orderBy: { _count: { category: 'desc' } },
    take: 40,
  })

  const td: React.CSSProperties = { padding: '6px 10px', borderTop: '1px solid #ddd', verticalAlign: 'top', fontSize: 13 }

  return (
    <main style={{ padding: '30px 24px', fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22 }}>Reports · last {days} days · {reports.length} shown</h1>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>Flywheel — CategoryObservation counts</h2>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {observations.map((o) => (
            <tr key={`${o.category}:${o.verdict}`}>
              <td style={td}>{o.category}</td>
              <td style={td}>{o.verdict}</td>
              <td style={td}>{o._count._all}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>Reports</h2>
      {reports.map((r) => {
        const log = (r.pipelineLogJson ?? {}) as { validationAdjustments?: string[]; totalMs?: number }
        return (
          <details key={r.id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '10px 0', padding: '10px 14px' }}>
            <summary style={{ cursor: 'pointer', fontSize: 14 }}>
              <code>{r.id.slice(-8)}</code> · {r.createdAt.toISOString().slice(0, 16)} · {r.status} ·{' '}
              {r.recommendations.map((x) => x.verdict).join('/')} · adj {log.validationAdjustments?.length ?? 0} ·{' '}
              {log.totalMs ? `${Math.round(log.totalMs / 1000)}s` : '—'} ·{' '}
              {r.feedback.map((f) => (f.useful ? '👍' : `👎${f.reason ?? ''}`)).join(' ') || 'no feedback'}
              {r.recencyFlagged ? ' · RECENCY' : ''}
              {r.excludedPhotoCount > 0 ? ` · ${r.excludedPhotoCount} excluded` : ''}
            </summary>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 8 }}>
              <tbody>
                {r.recommendations.map((rec) => (
                  <tr key={rec.id} style={rec.disabledAt ? { opacity: 0.45 } : undefined}>
                    <td style={td}>{rec.verdict}</td>
                    <td style={td}>
                      {rec.title}
                      <div style={{ color: '#777', fontSize: 12 }}>
                        conf {rec.confidenceScore.toFixed(2)} ({rec.confidenceLabel}) · {rec.smartCartEligible ? 'cart-eligible' : '—'}
                        {rec.disabledAt ? ` · DISABLED ${rec.disabledAt.toISOString().slice(0, 10)}` : ''}
                      </div>
                    </td>
                    <td style={td}>
                      <ToggleButton recommendationId={rec.id} disabled={rec.disabledAt != null} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <details style={{ marginTop: 6 }}>
              <summary style={{ fontSize: 12.5, color: '#666', cursor: 'pointer' }}>raw pipeline log</summary>
              <pre style={{ fontSize: 11, overflow: 'auto', maxHeight: 300, background: '#f7f7f4', padding: 10 }}>
                {JSON.stringify(r.pipelineLogJson, null, 2)}
              </pre>
            </details>
          </details>
        )
      })}
    </main>
  )
}
