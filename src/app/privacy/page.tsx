/**
 * v7.4.5 §1.6 — Privacy page, plain language.
 *
 * The series brief requires two disclosures shipped with the admin
 * console: (a) uploads may be reviewed internally for quality and
 * safety, (b) GPS/location data embedded in photos is removed at
 * upload. No policy page existed before this release, so this page
 * seeds one in the FAQ's plain-language voice. The full counsel-review
 * rewrite is a tracked backlog item — this page states current practice
 * honestly and nothing more.
 */

import Link from 'next/link'

export const metadata = {
  title: 'Privacy & your photos · Alder Projects',
  description: 'What Alder collects, what happens to your photos, and the controls you have.',
}

const P: React.CSSProperties = { fontSize: 15, lineHeight: 1.65, color: '#333', margin: '0 0 16px' }
const H2: React.CSSProperties = { fontSize: 18, fontWeight: 600, margin: '30px 0 10px', color: '#1C2B1A' }

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 80px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px', color: '#1C2B1A' }}>Privacy &amp; your photos</h1>
      <p style={{ ...P, color: '#777', fontSize: 13.5 }}>Plain language, current practice. Updated July 2026.</p>

      <h2 style={H2}>What we collect</h2>
      <p style={P}>
        Alder Check works without an account. When you upload photos we store the images, the report we
        generate from them, and — if you choose to share it — your email address for unlocking and saving
        your report. Anonymous usage events (pages viewed, report created, and similar) are recorded so we
        can see whether the product works.
      </p>

      <h2 style={H2}>What happens to your photos</h2>
      <p style={P}>
        Photos are analyzed only to create your report. Images containing people, faces, documents, or
        readable screens are detected and excluded before analysis, and every exclusion is reported to you.
      </p>
      <p style={P}>
        <strong>We automatically remove location data (GPS) embedded in your photos when you upload
        them.</strong> The stored image files carry no location data, and GPS coordinates from your photos
        are never saved, logged, or used anywhere. We keep only basic capture facts: when the photo was
        taken, the device make and model, image dimensions, and a yes/no note that location data was
        present before we removed it.
      </p>
      <p style={P}>
        <strong>Uploads may be reviewed internally for quality and safety.</strong> A human on our team may
        look at a report — the photos and the recommendations generated from them — to check that the
        analysis was accurate and safe. Every internal access is individually logged.
      </p>

      <h2 style={H2}>How long we keep things</h2>
      <p style={P}>
        Photos are stored no longer than the retention window (90 days by default). Every report includes a
        working delete control that removes both the report and the photo files immediately — deletion is
        real, not a hide.
      </p>

      <h2 style={H2}>What we don&apos;t do</h2>
      <p style={P}>
        We don&apos;t sell your personal information. We don&apos;t require an address, a ZIP code, or an
        account to use Alder Check. Photo use beyond creating your own report happens only with permissions
        you explicitly grant at upload.
      </p>

      <h2 style={H2}>Questions</h2>
      <p style={P}>
        Email <a href="mailto:hello@alderprojects.com" style={{ color: '#C8732A' }}>hello@alderprojects.com</a> —
        it reaches the founder directly. See also the{' '}
        <Link href="/check" style={{ color: '#C8732A' }}>
          Alder Check FAQ
        </Link>
        .
      </p>
    </main>
  )
}
