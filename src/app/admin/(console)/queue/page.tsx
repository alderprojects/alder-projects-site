/**
 * v7.4.6 — /admin/queue. Oldest-first unreviewed sessions with one-click
 * advance: "start" opens the oldest in queue mode; marking it reviewed
 * jumps straight to the next. Supports the weekly QA ritual.
 */

import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminQueuePage() {
  const unreviewed = await prisma.report.findMany({
    where: { reviewedAt: null, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 100,
    select: {
      id: true,
      createdAt: true,
      status: true,
      recommendations: { select: { verdict: true } },
      qaFlags: { select: { type: true } },
    },
  })

  const td: React.CSSProperties = { padding: '7px 10px', borderTop: '1px solid #e2e2dc', fontSize: 13 }

  return (
    <main style={{ padding: '26px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Unreviewed queue · {unreviewed.length}{unreviewed.length === 100 ? '+' : ''}</h1>
        {unreviewed.length > 0 && (
          <Link
            href={`/admin/session/${unreviewed[0].id}?queue=1`}
            style={{ fontSize: 13.5, background: '#1d4ed8', color: '#fff', padding: '7px 14px', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}
          >
            Start reviewing (oldest first) →
          </Link>
        )}
      </div>
      {unreviewed.length === 0 ? (
        <p style={{ fontSize: 14, color: '#1f7a33' }}>Queue clear — every session is reviewed.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', border: '1px solid #e2e2dc' }}>
          <tbody>
            {unreviewed.map((r, i) => (
              <tr key={r.id}>
                <td style={{ ...td, color: '#999', width: 30 }}>{i + 1}</td>
                <td style={td}>
                  <Link href={`/admin/session/${r.id}?queue=1`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>
                    <code>{r.id.slice(-8)}</code>
                  </Link>
                </td>
                <td style={td}>{r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                <td style={td}>{r.status}</td>
                <td style={td}>{r.recommendations.map((x) => x.verdict).join('/') || '—'}</td>
                <td style={td}>{r.qaFlags.length > 0 ? `${r.qaFlags.length} flag${r.qaFlags.length === 1 ? '' : 's'}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
