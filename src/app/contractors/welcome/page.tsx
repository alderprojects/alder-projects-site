import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Application Received | Alder Projects',
  description: 'Your contractor application has been received. We will review it and follow up by email within one business day.',
  alternates: { canonical: 'https://alderprojects.com/contractors/welcome' },
  robots: { index: false },
}

export default function ContractorWelcomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1A0B', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(122,155,111,0.12)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F" />
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A" />
          </svg>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '18px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
        <Link href="/" style={{ fontSize: '12px', color: 'rgba(245,239,224,0.35)', fontFamily: 'monospace', textDecoration: 'none' }}>Homeowner site &rarr;</Link>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(122,155,111,0.15)', border: '1px solid rgba(122,155,111,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#7A9B6F', fontSize: '24px' }}>&#10003;</div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#F5EFE0', fontWeight: 600, marginBottom: '14px' }}>Application received.</h1>
          <p style={{ color: 'rgba(245,239,224,0.55)', fontSize: '16px', lineHeight: 1.7, marginBottom: '36px' }}>Here is what happens next:</p>
          <div style={{ textAlign: 'left', marginBottom: '40px' }}>
            {[
              { n: '01', t: 'We review your application', b: 'Usually within one business day. We check trade, location, and coverage.' },
              { n: '02', t: 'We reach out by email', b: 'If it is a good fit, we will confirm your approval and explain how project requests work.' },
              { n: '03', t: 'You start receiving project requests', b: 'We send you project details that match your trade and service area. You decide on each one.' },
            ].map((step, i) => (
              <div key={step.n} style={{ display: 'flex', gap: '16px', marginBottom: i < 2 ? '20px' : 0 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#7A9B6F', flexShrink: 0, paddingTop: '2px', letterSpacing: '0.06em' }}>{step.n}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#F5EFE0', marginBottom: '3px' }}>{step.t}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(245,239,224,0.45)', margin: 0, lineHeight: 1.55 }}>{step.b}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ border: '1px solid rgba(122,155,111,0.15)', borderRadius: '3px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(245,239,224,0.4)', fontFamily: 'monospace', margin: 0, lineHeight: 1.65 }}>No subscription &middot; No monthly fee &middot; You only pay when you accept a project request</p>
          </div>
          <p style={{ color: 'rgba(245,239,224,0.2)', fontSize: '11px', fontFamily: 'monospace' }}>Questions? hello@alderprojects.com</p>
        </div>
      </div>
    </div>
  )
}