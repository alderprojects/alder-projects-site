/**
 * v7.4.8 — "Do Not Sell or Share My Personal Information" (FLAG-GATED).
 *
 * 404s entirely while ADDRESS_CAPTURE_ENABLED is off: until the
 * licensing program exists there is nothing to opt out of, and a page
 * implying otherwise would be its own misstatement.
 */

import { notFound } from 'next/navigation'
import { addressCaptureEnabled } from '@/lib/consent/licensing'
import RevokeForm from './RevokeForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Do Not Sell or Share My Personal Information · Alder Projects',
  robots: { index: false },
}

const P: React.CSSProperties = { fontSize: 15, lineHeight: 1.65, color: '#333', margin: '0 0 16px' }

export default function DoNotSellPage() {
  if (!addressCaptureEnabled()) notFound()

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 80px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: '0 0 14px', color: '#1C2B1A' }}>
        Do Not Sell or Share My Personal Information
      </h1>

      <p style={P}>
        Alder does not sell your personal information in the everyday sense of the word — we don&apos;t hand your name,
        email, or photos to anyone for money.
      </p>
      <p style={P}>
        There is one thing that requires your explicit permission: if you added your address and checked the licensing
        box, you gave Alder permission to license property-level insights about that address to partners. Under some
        state privacy laws that permission counts as a &ldquo;sale&rdquo; or &ldquo;share&rdquo; of personal
        information, which is why this page exists. You were offered a free Smart Cart in exchange for that permission —
        that&apos;s a financial incentive, and it is disclosed here plainly.
      </p>
      <p style={P}>
        <strong>You can withdraw that permission at any time</strong>, and it takes effect immediately: withdrawn
        records are excluded from every future licensing use by construction, not by anyone remembering to exclude them.
        Withdrawing does not take back the Smart Cart you already received, and it doesn&apos;t affect your reports or
        your ability to use Alder.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '30px 0 10px', color: '#1C2B1A' }}>Withdraw your permission</h2>
      <RevokeForm />

      <p style={{ ...P, marginTop: 24, fontSize: 14, color: '#666' }}>
        Prefer to email? <a href="mailto:hello@alderprojects.com" style={{ color: '#C8732A' }}>hello@alderprojects.com</a> reaches
        the founder directly. See also our{' '}
        <a href="/privacy" style={{ color: '#C8732A' }}>
          privacy page
        </a>
        .
      </p>
    </main>
  )
}
