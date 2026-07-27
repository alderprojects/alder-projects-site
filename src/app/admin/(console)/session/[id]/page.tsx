/**
 * v7.4.5 — /admin/session/[id] — the "are the inspection recommendations
 * actually accurate" verification surface.
 *
 * Side-by-side: photos (served via the logged admin passthrough, never
 * raw blob URLs) + retained EXIF metadata, VisionExtraction JSON with
 * confidences, the synthesis as the customer saw it plus the raw
 * pipeline log, lane assignments, user reactions and refinement
 * answers, and QA flags.
 *
 * Every load writes AdminAccessLog SESSION_VIEWED + EventLog
 * ADMIN_SESSION_VIEWED — no exceptions, including the owner account.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { checkAdmin, logAdminAccess } from '@/lib/auth/admin'
import { logEvent } from '@/lib/events/log'
import FlagForm from './FlagForm'
import ReviewButton from './ReviewButton'

export const dynamic = 'force-dynamic'

const VERDICT_COLORS: Record<string, string> = {
  BUY: '#1f7a33',
  WAIT: '#8a6d1a',
  SKIP: '#9c3587',
  INVESTIGATE: '#b45309',
}

const box: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e2dc',
  borderRadius: 6,
  padding: '14px 16px',
  marginBottom: 16,
}

export default async function AdminSessionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const check = await checkAdmin()
  if (check.status !== 'ok') notFound() // layout already gated; belt & suspenders

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      recommendations: { orderBy: { sortOrder: 'asc' }, include: { cartCandidates: { orderBy: { sortOrder: 'asc' } } } },
      feedback: { orderBy: { createdAt: 'asc' } },
      clarifyingAnswers: { orderBy: { answeredAt: 'asc' } },
      qaFlags: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!report) notFound()

  const snapshots = report.snapshotIds.length
    ? await prisma.roomSnapshot.findMany({
        where: { id: { in: report.snapshotIds } },
        include: {
          photos: {
            where: { hiddenAt: null },
            orderBy: { uploadedAt: 'asc' },
            include: { extractions: { orderBy: { createdAt: 'desc' } } },
          },
        },
      })
    : []
  const photos = snapshots.flatMap((s) => s.photos)

  await Promise.all([
    logAdminAccess(check.user.email, 'SESSION_VIEWED', report.id),
    logEvent({
      eventType: 'ADMIN_SESSION_VIEWED',
      subjectType: 'Report',
      subjectId: report.id,
      actorId: check.user.id,
      source: 'admin',
      payload: { photoCount: photos.length },
    }),
  ])

  return (
    <main style={{ padding: '26px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <h1 style={{ fontSize: 19, margin: 0 }}>
          Session <code>{report.id}</code>
        </h1>
        <span style={{ fontSize: 13, color: '#777' }}>
          {report.createdAt.toISOString().slice(0, 16).replace('T', ' ')} · {report.status} · tenure{' '}
          {report.tenure ?? '—'}
          {report.recencyFlagged ? ' · RECENCY' : ''}
          {report.excludedPhotoCount > 0 ? ` · ${report.excludedPhotoCount} excluded pre-analysis` : ''}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <ReviewButton
            reportId={report.id}
            reviewedAt={report.reviewedAt?.toISOString() ?? null}
            reviewedBy={report.reviewedBy}
          />
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 5fr) minmax(340px, 7fr)', gap: 16 }}>
        {/* LEFT — photos + extractions */}
        <div>
          <section style={box}>
            <h2 style={{ fontSize: 15, margin: '0 0 10px' }}>Photos · {photos.length}</h2>
            {photos.length === 0 && <p style={{ fontSize: 13, color: '#888' }}>No visible photos.</p>}
            {photos.map((p) => (
              <div key={p.id} style={{ marginBottom: 16 }}>
                {p.blobConfirmedAt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/admin/photos/${p.id}`}
                    alt=""
                    style={{ maxWidth: '100%', maxHeight: 340, borderRadius: 5, display: 'block', background: '#eee' }}
                  />
                ) : (
                  <p style={{ fontSize: 12.5, color: '#999' }}>blob unconfirmed (orphan)</p>
                )}
                <div style={{ fontSize: 12, color: '#666', marginTop: 6, lineHeight: 1.6 }}>
                  <code>{p.id.slice(-8)}</code> · {(p.bytes / 1024).toFixed(0)}KB stored {p.widthPx}×{p.heightPx}
                  <br />
                  captured {p.capturedAt ? p.capturedAt.toISOString().slice(0, 16).replace('T', ' ') : '—'} · device{' '}
                  {p.deviceMake || p.deviceModel ? `${p.deviceMake ?? ''} ${p.deviceModel ?? ''}`.trim() : '—'}
                  <br />
                  original {p.origWidth && p.origHeight ? `${p.origWidth}×${p.origHeight}` : '—'} · orientation{' '}
                  {p.orientation ?? '—'} · GPS in upload:{' '}
                  <strong style={{ color: p.hadGps ? '#b45309' : '#1f7a33' }}>
                    {p.hadGps ? 'was present — stripped' : 'none'}
                  </strong>
                </div>
                {p.extractions.map((ex) => (
                  <details key={ex.id} style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 12.5, cursor: 'pointer', color: '#555' }}>
                      extraction {ex.promptVersion} · conf {ex.overallConfidence.toFixed(2)} · {ex.reviewStatus}
                    </summary>
                    <pre
                      style={{
                        fontSize: 11,
                        background: '#f7f7f4',
                        padding: 10,
                        overflow: 'auto',
                        maxHeight: 320,
                        borderRadius: 4,
                      }}
                    >
                      {JSON.stringify(ex.extractionJson, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            ))}
          </section>

          <section style={box}>
            <h2 style={{ fontSize: 15, margin: '0 0 10px' }}>QA flags</h2>
            {report.qaFlags.length === 0 && <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>None yet.</p>}
            {report.qaFlags.map((f) => (
              <div key={f.id} style={{ fontSize: 12.5, borderLeft: '3px solid #d8d2bc', padding: '2px 10px', marginBottom: 8 }}>
                <strong>{f.type}</strong> · {f.createdBy} · {f.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                {f.note && <div style={{ color: '#555' }}>{f.note}</div>}
              </div>
            ))}
            <FlagForm reportId={report.id} />
          </section>
        </div>

        {/* RIGHT — synthesis, reactions, refinement */}
        <div>
          <section style={box}>
            <h2 style={{ fontSize: 15, margin: '0 0 10px' }}>Synthesis — as the customer saw it</h2>
            {report.userPrompt && (
              <p style={{ fontSize: 12.5, color: '#555', margin: '0 0 10px' }}>
                Visitor context: “{report.userPrompt}”
              </p>
            )}
            {report.recommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  border: '1px solid #e6e2d4',
                  borderRadius: 5,
                  padding: '10px 12px',
                  marginBottom: 10,
                  opacity: rec.disabledAt ? 0.5 : 1,
                }}
              >
                <div style={{ fontSize: 13.5 }}>
                  <strong style={{ color: VERDICT_COLORS[rec.verdict] ?? '#333' }}>{rec.verdict}</strong> · {rec.title}
                  <span style={{ color: '#888', fontSize: 12 }}>
                    {' '}
                    · conf {rec.confidenceScore.toFixed(2)} ({rec.confidenceLabel}) · tier {rec.disclosureTier}
                    {rec.disabledAt ? ' · DISABLED' : ''}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: '#444', margin: '6px 0' }}>{rec.summary}</p>
                {Array.isArray(rec.visibleEvidenceJson) && (rec.visibleEvidenceJson as string[]).length > 0 && (
                  <ul style={{ fontSize: 12, color: '#555', margin: '4px 0 4px 18px', padding: 0 }}>
                    {(rec.visibleEvidenceJson as string[]).map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                )}
                <div style={{ fontSize: 12, color: '#777' }}>
                  {rec.costLow != null && rec.costHigh != null ? `$${rec.costLow}–$${rec.costHigh} · ` : ''}
                  {rec.benefitType} · risk {rec.riskLevel} · next: {rec.nextAction}
                </div>
                {rec.cartCandidates.length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 12, color: '#555', cursor: 'pointer' }}>
                      cart candidates ({rec.cartCandidates.length})
                    </summary>
                    <ul style={{ fontSize: 12, margin: '4px 0 0 18px', padding: 0 }}>
                      {rec.cartCandidates.map((c) => (
                        <li key={c.id}>
                          [{c.tier}] {c.productName} · {c.fitStatus}
                          {c.priceLow != null ? ` · $${c.priceLow}${c.priceHigh != null ? `–$${c.priceHigh}` : ''}` : ''}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12.5, color: '#666', cursor: 'pointer' }}>raw pipeline log</summary>
              <pre style={{ fontSize: 11, background: '#f7f7f4', padding: 10, overflow: 'auto', maxHeight: 420, borderRadius: 4 }}>
                {JSON.stringify(report.pipelineLogJson, null, 2)}
              </pre>
            </details>
          </section>

          <section style={box}>
            <h2 style={{ fontSize: 15, margin: '0 0 10px' }}>User reactions</h2>
            {report.feedback.length === 0 && <p style={{ fontSize: 13, color: '#888' }}>No feedback yet.</p>}
            {report.feedback.map((f) => (
              <div key={f.id} style={{ fontSize: 13, marginBottom: 6 }}>
                {f.useful ? '👍 useful' : `👎 not useful${f.reason ? ` — ${f.reason}` : ''}`}
                <span style={{ color: '#999', fontSize: 11.5 }}>
                  {' '}
                  · {f.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                </span>
              </div>
            ))}
          </section>

          <section style={box}>
            <h2 style={{ fontSize: 15, margin: '0 0 10px' }}>Refinement (clarifying answers)</h2>
            {report.clarifyingAnswers.length === 0 && <p style={{ fontSize: 13, color: '#888' }}>None.</p>}
            {report.clarifyingAnswers.map((a) => (
              <div key={a.id} style={{ fontSize: 12.5, marginBottom: 8 }}>
                <div style={{ color: '#555' }}>Q ({a.questionKey}): {a.questionText}</div>
                <div>
                  A: {a.answerText}
                  {a.verdictChanged && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#0e7490', border: '1px solid #0e7490', borderRadius: 3, padding: '0 4px' }}>
                      changed a verdict
                    </span>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  )
}
