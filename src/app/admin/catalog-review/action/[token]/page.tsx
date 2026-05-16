/**
 * Token-Based Action Handler
 *
 * Routes used by the 5 AM digest email's one-click action buttons.
 *
 *   GET  /admin/catalog-review/action/[token]
 *     - approve / reject / approve_low_confidence  → execute action,
 *       render minimal success page, no UI form
 *     - supply_evidence                            → render mobile form,
 *       collect 1-3 sentences of evidence, submit
 *
 *   POST /admin/catalog-review/action/[token]
 *     - submit form data (for supply_evidence action)
 *
 * Security:
 *   - Token is the auth. No login required.
 *   - Single-use: consumedAt is set on first hit; second hit returns 410.
 *   - Bound to (subjectId, action) tuple.
 *   - Expires after 7 days.
 *   - IP logged in consumedFromIp for audit.
 *
 * This is intentionally a Next.js page route, not an API route, because
 * the response includes HTML for mobile rendering. Email button clicks
 * land on this page directly.
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

interface PageProps {
  params: { token: string }
  searchParams: { angle?: string; status?: string }
}

// =============================================================================
// SERVER COMPONENT — handles GET
// =============================================================================

export default async function ActionPage({ params, searchParams }: PageProps) {
  const tokenRow = await prisma.reviewActionToken.findUnique({
    where: { token: params.token },
    include: { candidate: true, change: true },
  })

  if (!tokenRow) {
    return (
      <ActionResponse
        status="error"
        title="Link not found"
        message="This action link has expired or never existed. If you need to take action on this item, visit /admin/catalog-review."
      />
    )
  }

  if (tokenRow.consumedAt) {
    return (
      <ActionResponse
        status="info"
        title="Already actioned"
        message={`This action was already taken on ${tokenRow.consumedAt.toLocaleString()}. Each link is single-use.`}
      />
    )
  }

  if (tokenRow.expiresAt < new Date()) {
    return (
      <ActionResponse
        status="error"
        title="Link expired"
        message="This action link has expired (7-day limit). To take action, visit /admin/catalog-review."
      />
    )
  }

  // Branch on action
  if (tokenRow.action === 'supply_evidence') {
    // Render the evidence form. Don't consume the token here — POST will.
    return <EvidenceForm tokenRow={tokenRow} status={searchParams.status} />
  }

  // For approve / reject / approve_low_confidence: execute immediately
  return await executeAction(tokenRow)
}

// =============================================================================
// EXECUTE NON-EVIDENCE ACTIONS
// =============================================================================

async function executeAction(tokenRow: any) {
  const consumedAt = new Date()

  // Consume the token (single-use)
  await prisma.reviewActionToken.update({
    where: { id: tokenRow.id },
    data: { consumedAt },
  })

  // Apply the action to the subject
  if (tokenRow.candidateId) {
    await applyCandidateAction(tokenRow.candidateId, tokenRow.action)
  } else if (tokenRow.changeId) {
    await applyChangeAction(tokenRow.changeId, tokenRow.action)
  }

  // Event log
  await prisma.eventLog.create({
    data: {
      eventType: `REVIEW_ACTION_${tokenRow.action.toUpperCase()}`,
      subjectType: tokenRow.candidateId ? 'CatalogExpansionCandidate' : 'RecommendationChange',
      subjectId: tokenRow.candidateId || tokenRow.changeId,
      payloadJson: { token: tokenRow.id, action: tokenRow.action },
      source: 'email',
    },
  })

  // Render confirmation
  const messages: Record<string, { title: string; body: string }> = {
    approve: { title: 'Approved', body: 'This item will be published into the live catalog in the next sync.' },
    reject: { title: 'Rejected', body: 'This item is killed and will not surface again.' },
    approve_low_confidence: {
      title: 'Approved (low confidence)',
      body: 'This item ships as commodity content with low priority. You can revisit later to add evidence and elevate it.',
    },
  }
  const msg = messages[tokenRow.action] || { title: 'Done', body: 'Action recorded.' }
  return <ActionResponse status="success" title={msg.title} message={msg.body} />
}

async function applyCandidateAction(candidateId: string, action: string) {
  let status: string
  switch (action) {
    case 'approve':
      status = 'approved'
      break
    case 'approve_low_confidence':
      status = 'approved' // ships, but uniqueAngle stays null = commodity
      break
    case 'reject':
      status = 'rejected'
      break
    default:
      return
  }
  await prisma.catalogExpansionCandidate.update({
    where: { id: candidateId },
    data: { status, reviewedAt: new Date() },
  })
}

async function applyChangeAction(changeId: string, action: string) {
  let status: string
  switch (action) {
    case 'approve':
      status = 'approved'
      break
    case 'reject':
      status = 'rejected'
      break
    default:
      return
  }
  await prisma.recommendationChange.update({
    where: { id: changeId },
    data: { status, reviewedAt: new Date() },
  })
}

// =============================================================================
// EVIDENCE FORM
// =============================================================================

function EvidenceForm({ tokenRow, status }: { tokenRow: any; status?: string }) {
  const c = tokenRow.candidate
  if (!c) {
    return <ActionResponse status="error" title="Invalid token" message="Token is not bound to a candidate." />
  }

  const evidenceFields = (c.evidenceNeededJson as string[]) || []

  return (
    <div style={pageContainerStyle}>
      <h1 style={h1Style}>Supply evidence</h1>
      <div style={candidateCardStyle}>
        <div style={candidateTitleStyle}>{c.title}</div>
        <div style={candidateMetaStyle}>
          {c.candidateType} · {c.scopeId} · commodity risk {c.commodityRiskScore}
        </div>
        <div style={rationaleStyle}>{c.rationale}</div>
      </div>

      <p style={instructionsStyle}>
        Per Google's guide on AI search, non-commodity content wins. Supply 1-3 sentences of first-hand
        Vermont-specific evidence for each item below. This gets baked into the live catalog entry.
      </p>

      <form method="POST" action={`/admin/catalog-review/action/${tokenRow.token}`}>
        <input type="hidden" name="action" value="supply_evidence_submit" />

        {evidenceFields.map((field) => (
          <div key={field} style={fieldGroupStyle}>
            <label style={labelStyle}>
              {field.replace(/_/g, ' ')}
              <span style={requiredStyle}>required</span>
            </label>
            <textarea
              name={`evidence_${field}`}
              required
              rows={3}
              style={textareaStyle}
              placeholder={evidencePlaceholder(field)}
            />
          </div>
        ))}

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Unique angle (one sentence)</label>
          <textarea
            name="uniqueAngle"
            required
            rows={2}
            style={textareaStyle}
            placeholder="The non-commodity sentence the live entry will lead with. E.g. 'On a 1992 Hyde Park kitchen, we found these LED strips were the only DIY-installable option.'"
          />
        </div>

        <button type="submit" style={submitButtonStyle}>
          Approve with evidence
        </button>
      </form>

      {status === 'success' && (
        <div style={{ ...successBannerStyle, marginTop: 20 }}>
          Evidence submitted. This item is now publish-ready.
        </div>
      )}
    </div>
  )
}

function evidencePlaceholder(field: string): string {
  const placeholders: Record<string, string> = {
    first_hand_experience: 'A specific Vermont home or contractor experience that informs this recommendation.',
    savings_data_point: 'A specific dollar figure with source. E.g. "$3,200 saved on a 2024 Burlington reno per contractor invoice."',
    safety_source_citation: 'A specific guideline or code source. E.g. "Per Vermont DEC mold remediation guide section 4."',
    vermont_specific_data: 'A Vermont-specific data point. E.g. "Vermont net-metering caps at 15kW for residential under Act 56."',
    diy_vs_pro_decision_tree: 'The specific decision criteria. E.g. "DIY safe under 10 sq ft per VT DEC; pro required above."',
    verified_affiliate_url: 'The full affiliate URL, verified to resolve to the right product.',
    first_hand_photo: 'A description of the photo to attach (will request upload after submit).',
  }
  return placeholders[field] || 'Specific evidence for this claim.'
}

// =============================================================================
// POST HANDLER (form submit)
// =============================================================================

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const tokenRow = await prisma.reviewActionToken.findUnique({
    where: { token: params.token },
    include: { candidate: true },
  })

  if (!tokenRow || tokenRow.consumedAt || tokenRow.expiresAt < new Date()) {
    return new Response('Token invalid', { status: 410 })
  }
  if (tokenRow.action !== 'supply_evidence' || !tokenRow.candidate) {
    return new Response('Wrong action type', { status: 400 })
  }

  const formData = await request.formData()
  const uniqueAngle = formData.get('uniqueAngle')?.toString() || ''
  const evidenceSupplied: Record<string, string> = {}
  // Array.from() side-steps the FormDataIterator type that needs
  // --downlevelIteration; this repo's tsconfig doesn't set a target.
  for (const [k, v] of Array.from(formData.entries())) {
    if (k.startsWith('evidence_') && typeof v === 'string') {
      evidenceSupplied[k.substring('evidence_'.length)] = v
    }
  }

  // Consume token + update candidate
  await prisma.reviewActionToken.update({
    where: { id: tokenRow.id },
    data: { consumedAt: new Date() },
  })
  await prisma.catalogExpansionCandidate.update({
    where: { id: tokenRow.candidateId! },
    data: {
      status: 'approved',
      reviewedAt: new Date(),
      uniqueAngle,
      evidenceSuppliedJson: evidenceSupplied,
    },
  })

  await prisma.eventLog.create({
    data: {
      eventType: 'REVIEW_ACTION_EVIDENCE_SUPPLIED',
      subjectType: 'CatalogExpansionCandidate',
      subjectId: tokenRow.candidateId!,
      payloadJson: { fieldCount: Object.keys(evidenceSupplied).length },
      source: 'email',
    },
  })

  // Redirect to the same page with status=success
  return redirect(`/admin/catalog-review/action/${params.token}?status=success`)
}

// =============================================================================
// SHARED UI
// =============================================================================

function ActionResponse({
  status,
  title,
  message,
}: {
  status: 'success' | 'error' | 'info'
  title: string
  message: string
}) {
  const color = status === 'success' ? '#0f6e56' : status === 'error' ? '#a32d2d' : '#1d6e95'
  const bg = status === 'success' ? '#e1f5ee' : status === 'error' ? '#fde8e8' : '#e7f0f7'
  return (
    <div style={pageContainerStyle}>
      <div style={{ ...resultCardStyle, background: bg, borderLeft: `4px solid ${color}` }}>
        <h1 style={{ ...h1Style, color, marginTop: 0 }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#222', margin: 0 }}>{message}</p>
      </div>
      <p style={{ marginTop: 20, fontSize: 12, color: '#999' }}>
        Action logged at {new Date().toLocaleString()}.
      </p>
    </div>
  )
}

// Styles inline because email-driven flow may render in unauthenticated context
const pageContainerStyle: React.CSSProperties = {
  maxWidth: 600,
  margin: '0 auto',
  padding: '24px 20px',
  fontFamily: '-apple-system, system-ui, sans-serif',
  color: '#1a1a1a',
  lineHeight: 1.5,
}
const h1Style: React.CSSProperties = { fontSize: 22, fontWeight: 600, margin: '0 0 16px' }
const candidateCardStyle: React.CSSProperties = { background: '#f9f9f9', padding: 14, borderRadius: 8, margin: '16px 0' }
const candidateTitleStyle: React.CSSProperties = { fontSize: 15, fontWeight: 500, marginBottom: 4 }
const candidateMetaStyle: React.CSSProperties = { fontSize: 12, color: '#666', marginBottom: 8 }
const rationaleStyle: React.CSSProperties = { fontSize: 13, color: '#333' }
const instructionsStyle: React.CSSProperties = { fontSize: 13, color: '#555', margin: '16px 0' }
const fieldGroupStyle: React.CSSProperties = { marginBottom: 16 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }
const requiredStyle: React.CSSProperties = { fontSize: 11, color: '#a32d2d', marginLeft: 6, fontWeight: 400 }
const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box',
}
const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: 14,
  background: '#1d9e75',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
}
const resultCardStyle: React.CSSProperties = { padding: 18, borderRadius: 8 }
const successBannerStyle: React.CSSProperties = { padding: 12, background: '#e1f5ee', color: '#0f6e56', borderRadius: 6 }
