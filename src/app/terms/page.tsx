/**
 * v7.4.8 — Terms placeholder (FLAG-GATED, 404s while
 * ADDRESS_CAPTURE_ENABLED is off).
 *
 * The licensing-consent checkbox is required to link to T&Cs. The
 * actual terms are counsel's deliverable, not engineering's — this page
 * exists so the flag-on preview has no broken link and so counsel can
 * see exactly where their language lands. It deliberately states no
 * terms of its own.
 *
 * BLOCKER: replace this content with counsel-reviewed terms BEFORE
 * ADDRESS_CAPTURE_ENABLED is set to true in production.
 */

import { notFound } from 'next/navigation'
import { addressCaptureEnabled } from '@/lib/consent/licensing'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Terms · Alder Projects',
  robots: { index: false },
}

export default function TermsPage() {
  if (!addressCaptureEnabled()) notFound()

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 80px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 14px', color: '#1C2B1A' }}>Terms</h1>
      <div
        style={{
          background: '#f3ecd9',
          border: '1px solid rgba(176,141,47,0.35)',
          borderRadius: 10,
          padding: '14px 16px',
          fontSize: 14.5,
          lineHeight: 1.6,
          color: '#333',
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Placeholder — pending legal review.</strong> The terms governing the data-licensing permission
          (including the financial-incentive notice and the scope of any licensing) are being reviewed by counsel and
          will be published here before that permission is offered to anyone.
        </p>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: '#333', margin: '20px 0 0' }}>
        In the meantime, our{' '}
        <a href="/privacy" style={{ color: '#C8732A' }}>
          privacy page
        </a>{' '}
        describes current practice, and{' '}
        <a href="mailto:hello@alderprojects.com" style={{ color: '#C8732A' }}>
          hello@alderprojects.com
        </a>{' '}
        reaches the founder directly.
      </p>
    </main>
  )
}
