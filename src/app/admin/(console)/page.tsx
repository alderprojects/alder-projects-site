/**
 * v7.4.5 — /admin session list.
 *
 * Reverse-chron paginated (25/page) list of photo sessions. A "session"
 * is a Report row — the entity that groups one photo set + its verdicts
 * (the doc's VisitorSession/Project guess predates the v7.4 Report
 * layer). Lane counts use the live verdict vocabulary
 * BUY/WAIT/SKIP/INVESTIGATE. The "refined" badge marks sessions where a
 * clarifying answer changed a verdict (the Report-layer analogue of the
 * SmartCart photoChangedRecommendation boolean).
 *
 * Filters: date range, category (extraction overall_photo_category),
 * flagged-only, unreviewed-only.
 */

import Link from 'next/link'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const VERDICT_COLORS: Record<string, string> = {
  BUY: '#1f7a33',
  WAIT: '#8a6d1a',
  SKIP: '#9c3587',
  INVESTIGATE: '#b45309',
}

interface SearchParams {
  page?: string
  from?: string
  to?: string
  category?: string
  flagged?: string
  unreviewed?: string
}

export default async function AdminSessionListPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const from = DATE_RE.test(searchParams.from ?? '') ? searchParams.from! : ''
  const to = DATE_RE.test(searchParams.to ?? '') ? searchParams.to! : ''
  const category = (searchParams.category ?? '').trim().slice(0, 60)
  const flaggedOnly = searchParams.flagged === '1'
  const unreviewedOnly = searchParams.unreviewed === '1'

  const where: Prisma.ReportWhereInput = { deletedAt: null }
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`)
    if (to) where.createdAt.lt = new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 86_400_000)
  }
  if (flaggedOnly) where.qaFlags = { some: {} }
  if (unreviewedOnly) where.reviewedAt = null

  // Category filter runs on the extraction JSON, which Prisma can't
  // reach through the snapshotIds array — one raw id-list query first.
  if (category) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT DISTINCT r."id" FROM "Report" r
      JOIN "Photo" p ON p."roomSnapshotId" = ANY(r."snapshotIds")
      JOIN "VisionExtraction" ve ON ve."photoId" = p."id"
      WHERE ve."extractionJson"->>'overall_photo_category' = ${category}`
    where.id = { in: rows.map((r) => r.id) }
  }

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        recommendations: { select: { verdict: true, disabledAt: true } },
        qaFlags: { select: { type: true } },
        clarifyingAnswers: { where: { verdictChanged: true }, select: { id: true }, take: 1 },
      },
    }),
  ])

  // Photos per report via snapshotIds (thumbnail + count + category chip)
  const allSnapIds = Array.from(new Set(reports.flatMap((r) => r.snapshotIds)))
  const photos = allSnapIds.length
    ? await prisma.photo.findMany({
        where: { roomSnapshotId: { in: allSnapIds }, hiddenAt: null },
        select: {
          id: true,
          roomSnapshotId: true,
          blobConfirmedAt: true,
          uploadedAt: true,
          extractions: {
            select: { extractionJson: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { uploadedAt: 'asc' },
      })
    : []
  const photosBySnap = new Map<string, typeof photos>()
  for (const p of photos) {
    const list = photosBySnap.get(p.roomSnapshotId) ?? []
    list.push(p)
    photosBySnap.set(p.roomSnapshotId, list)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const qs = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (category) params.set('category', category)
    if (flaggedOnly) params.set('flagged', '1')
    if (unreviewedOnly) params.set('unreviewed', '1')
    for (const [k, v] of Object.entries(overrides)) params.set(k, String(v))
    const s = params.toString()
    return s ? `?${s}` : ''
  }

  const td: React.CSSProperties = {
    padding: '8px 10px',
    borderTop: '1px solid #e2e2dc',
    fontSize: 13,
    verticalAlign: 'middle',
  }

  return (
    <main style={{ padding: '26px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 14px' }}>
        Sessions · {total} match{total === 1 ? '' : 'es'}
      </h1>

      <form
        method="get"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end', marginBottom: 18, fontSize: 13 }}
      >
        <label>
          From
          <br />
          <input type="date" name="from" defaultValue={from} style={{ padding: 4 }} />
        </label>
        <label>
          To
          <br />
          <input type="date" name="to" defaultValue={to} style={{ padding: 4 }} />
        </label>
        <label>
          Category
          <br />
          <input
            type="text"
            name="category"
            defaultValue={category}
            placeholder="e.g. basement"
            style={{ padding: 4, width: 140 }}
          />
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" name="flagged" value="1" defaultChecked={flaggedOnly} /> flagged only
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" name="unreviewed" value="1" defaultChecked={unreviewedOnly} /> unreviewed only
        </label>
        <button type="submit" style={{ padding: '6px 14px' }}>
          Filter
        </button>
        <Link href="/admin" style={{ fontSize: 12.5, color: '#666' }}>
          reset
        </Link>
      </form>

      <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', border: '1px solid #e2e2dc' }}>
        <thead>
          <tr style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#777' }}>
            <th style={{ ...td, textAlign: 'left' }}>Photo</th>
            <th style={{ ...td, textAlign: 'left' }}>Created</th>
            <th style={{ ...td, textAlign: 'left' }}>Category</th>
            <th style={{ ...td, textAlign: 'right' }}>Photos</th>
            <th style={{ ...td, textAlign: 'left' }}>Lanes</th>
            <th style={{ ...td, textAlign: 'left' }}>Flags</th>
            <th style={{ ...td, textAlign: 'left' }}>State</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const rPhotos = r.snapshotIds.flatMap((sid) => photosBySnap.get(sid) ?? [])
            const thumb = rPhotos.find((p) => p.blobConfirmedAt)
            const cat =
              (rPhotos[0]?.extractions[0]?.extractionJson as { overall_photo_category?: string } | null)
                ?.overall_photo_category ?? '—'
            const lanes: Record<string, number> = {}
            for (const rec of r.recommendations) lanes[rec.verdict] = (lanes[rec.verdict] ?? 0) + 1
            const flagTypes = Array.from(new Set(r.qaFlags.map((f) => f.type)))
            const refined = r.clarifyingAnswers.length > 0
            return (
              <tr key={r.id}>
                <td style={td}>
                  <Link href={`/admin/session/${r.id}`}>
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/admin/photos/${thumb.id}`}
                        alt=""
                        width={64}
                        height={48}
                        style={{ objectFit: 'cover', borderRadius: 4, display: 'block', background: '#eee' }}
                      />
                    ) : (
                      <span style={{ color: '#999', fontSize: 12 }}>no photo</span>
                    )}
                  </Link>
                </td>
                <td style={td}>
                  <Link href={`/admin/session/${r.id}`} style={{ color: '#1d4ed8', textDecoration: 'none' }}>
                    <code>{r.id.slice(-8)}</code>
                  </Link>
                  <div style={{ color: '#888', fontSize: 12 }}>{r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</div>
                </td>
                <td style={td}>{cat}</td>
                <td style={{ ...td, textAlign: 'right' }}>{rPhotos.length}</td>
                <td style={td}>
                  {Object.entries(lanes).map(([v, n]) => (
                    <span
                      key={v}
                      style={{
                        display: 'inline-block',
                        marginRight: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: VERDICT_COLORS[v] ?? '#555',
                      }}
                    >
                      {v} {n}
                    </span>
                  ))}
                  {refined && (
                    <span style={{ fontSize: 11, color: '#0e7490', border: '1px solid #0e7490', borderRadius: 3, padding: '1px 5px' }}>
                      refined
                    </span>
                  )}
                </td>
                <td style={td}>
                  {flagTypes.length === 0
                    ? '—'
                    : flagTypes.map((t) => (
                        <span
                          key={t}
                          style={{
                            display: 'inline-block',
                            margin: '0 4px 2px 0',
                            fontSize: 10.5,
                            background: t === 'PEOPLE_VISIBLE' ? '#fde8e8' : '#f3f0e4',
                            border: '1px solid #d8d2bc',
                            borderRadius: 3,
                            padding: '1px 5px',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                </td>
                <td style={td}>
                  {r.reviewedAt ? (
                    <span style={{ color: '#1f7a33', fontSize: 12 }}>reviewed</span>
                  ) : (
                    <span style={{ color: '#b45309', fontSize: 12 }}>unreviewed</span>
                  )}
                </td>
              </tr>
            )
          })}
          {reports.length === 0 && (
            <tr>
              <td style={{ ...td, color: '#888' }} colSpan={7}>
                No sessions match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 13.5 }}>
        {page > 1 && <Link href={`/admin${qs({ page: page - 1 })}`}>← newer</Link>}
        <span style={{ color: '#777' }}>
          page {page} / {totalPages}
        </span>
        {page < totalPages && <Link href={`/admin${qs({ page: page + 1 })}`}>older →</Link>}
      </div>
    </main>
  )
}
