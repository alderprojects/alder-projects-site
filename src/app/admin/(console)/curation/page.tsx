/**
 * v7.4.9 §1.3 — /admin/curation. Active and revoked curation rules with
 * one-click revoke.
 *
 * Rules DEMOTE only — there is no promotion mechanism and no suppress
 * action here by design (CR1: only the grounding gate suppresses).
 * Revoking is immediate: the serve path reads active rules per session,
 * so the next synthesis stops demoting.
 */

import { prisma } from '@/lib/db'
import RevokeButton from './RevokeButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Curation rules — admin', robots: { index: false } }

export default async function AdminCurationPage() {
  const [active, revoked] = await Promise.all([
    prisma.curationRule.findMany({ where: { revokedAt: null }, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.curationRule.findMany({ where: { revokedAt: { not: null } }, orderBy: { revokedAt: 'desc' }, take: 50 }),
  ])

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
  const thisWeek = active.filter((r) => r.source === 'AUTOEVAL' && r.createdAt >= weekAgo).length

  const td: React.CSSProperties = { padding: '8px 10px', borderTop: '1px solid #e2e2dc', fontSize: 13, verticalAlign: 'top' }

  return (
    <main style={{ padding: '26px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 6px' }}>Curation rules</h1>
      <p style={{ fontSize: 13, color: '#666', margin: '0 0 18px', lineHeight: 1.6 }}>
        Rules <strong>demote</strong> a signature to the bottom of its lane — they never suppress and never promote.
        Only the grounding gate suppresses. Auto-created rules this week: <strong>{thisWeek}</strong> of 5 (weekly cap).
      </p>

      <h2 style={{ fontSize: 15, margin: '0 0 8px' }}>Active · {active.length}</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', border: '1px solid #e2e2dc' }}>
        <thead>
          <tr style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#777' }}>
            <th style={{ ...td, textAlign: 'left' }}>Signature</th>
            <th style={{ ...td, textAlign: 'left' }}>Evidence</th>
            <th style={{ ...td, textAlign: 'left' }}>Source</th>
            <th style={{ ...td, textAlign: 'left' }}>Created</th>
            <th style={td}></th>
          </tr>
        </thead>
        <tbody>
          {active.map((r) => (
            <tr key={r.id}>
              <td style={td}>
                <code>{r.signature}</code>
                <div style={{ color: '#888', fontSize: 11.5 }}>{r.action}</div>
              </td>
              <td style={td}>
                {r.reason}
                <div style={{ color: '#888', fontSize: 11.5 }}>n = {r.evidenceN}</div>
              </td>
              <td style={td}>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 3,
                    background: r.source === 'AUTOEVAL' ? '#f3f0e4' : '#e8f2e5',
                    border: '1px solid #d8d2bc',
                  }}
                >
                  {r.source}
                </span>
              </td>
              <td style={td}>{r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
              <td style={td}>
                <RevokeButton ruleId={r.id} />
              </td>
            </tr>
          ))}
          {active.length === 0 && (
            <tr>
              <td style={{ ...td, color: '#888' }} colSpan={5}>
                No active rules.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {revoked.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, margin: '26px 0 8px' }}>Revoked · {revoked.length}</h2>
          <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', border: '1px solid #e2e2dc', opacity: 0.7 }}>
            <tbody>
              {revoked.map((r) => (
                <tr key={r.id}>
                  <td style={td}>
                    <code>{r.signature}</code>
                  </td>
                  <td style={td}>{r.reason}</td>
                  <td style={td}>
                    revoked {r.revokedAt?.toISOString().slice(0, 16).replace('T', ' ')} by {r.revokedBy ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  )
}
