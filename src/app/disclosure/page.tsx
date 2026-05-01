import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclosures — Alder Projects',
  description: 'How Alder Projects makes money, what we recommend, and what we never do with your information.',
  alternates: { canonical: 'https://alderprojects.com/disclosure' },
  robots: { index: true, follow: true },
}

export default function DisclosurePage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#1a1a1a', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>How we make money</h1>
      <p style={{ color: '#7a7568', fontSize: 14, marginBottom: 32 }}>Last updated: April 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>The short version</h2>
        <p>
          Alder Projects is a free Vermont homeowner reference. We make money in three ways: affiliate commissions when you buy products we link to, eventual referral fees from Vermont contractors when you ask us to connect you with one, and (soon) a paid Vermont Property Briefing for homeowners who want the full playbook in one document.
        </p>
        <p>
          We never sell your email or phone number. We never recommend products or contractors we wouldn{'’'}t use ourselves.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Affiliate links</h2>
        <p>
          Some links on this site, and some product recommendations from our chat assistant, are affiliate links. If you click one and buy something, we earn a small commission at no extra cost to you. That{'’'}s how a free Vermont site stays free.
        </p>
        <p>
          As an Amazon Associate, Alder Projects earns from qualifying purchases.
        </p>
        <p>
          We only recommend products we{'’'}d buy ourselves for a Vermont house. The recommendations come first, the affiliate link is a way to monetize a click that{'’'}s already going to happen.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Contractor referrals</h2>
        <p>
          When the Vermont contractor pipeline is active, we{'’'}ll connect homeowners with vetted local contractors. Contractors pay us a flat lead fee when they accept a homeowner{'’'}s project. Homeowners pay nothing for the referral.
        </p>
        <p>
          We don{'’'}t take referral fees from contractors we wouldn{'’'}t hire ourselves.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Paid briefing (when available)</h2>
        <p>
          We sell a Vermont Property Briefing for $19. It packages everything our chat assistant covers (current rebate stack, order of operations, contractor vetting checklist, year calendar specific to your property) into one document tied to your address.
        </p>
        <p>
          The free chat covers the same ground in conversation form. The briefing exists for homeowners who want it organized once, in one place, in writing.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>What we don{'’'}t do</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>We don{'’'}t sell email addresses or phone numbers.</li>
          <li>We don{'’'}t share your conversation transcripts with contractors unless you ask us to (for example, when you want to be matched).</li>
          <li>We don{'’'}t accept payment to recommend a contractor or product we don{'’'}t actually trust.</li>
          <li>We don{'’'}t make claims about rebate eligibility you can{'’'}t verify yourself. Final eligibility is always confirmed by the installer or program administrator.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>Questions</h2>
        <p>
          Email{' '}<a href="mailto:hello@alderprojects.com" style={{ color: '#7A9B6F' }}>hello@alderprojects.com</a>.
        </p>
      </section>
    </main>
  )
}
