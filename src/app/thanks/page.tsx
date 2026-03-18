import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Project Received | Alder Projects',
  description: 'Your project request has been received. We will review it and follow up by email within 1–2 business days.',
  alternates: { canonical: 'https://alderprojects.com/thanks' },
  robots: { index: false },
}

export default function ThanksPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0D1A0B', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(122,155,111,0.12)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F" />
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A" />
          </svg>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '18px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(122,155,111,0.15)', border: '1px solid rgba(122,155,111,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#7A9B6F', fontSize: '24px' }}>&#10003;</div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#F5EFE0', fontWeight: 600, marginBottom: '14px' }}>Project received.</h1>
          <p style={{ color: 'rgba(245,239,224,0.55)', fontSize: '16px', lineHeight: 1.7, marginBottom: '36px' }}>Here is what happens next:</p>
          <div style={{ textAlign: 'left', marginBottom: '40px' }}>
            {[
              { n: '01', t: 'We review your submission', b: 'A real person reads every project request before it goes anywhere.' },
              { n: '02', t: 'We match it to local contractors', b: 'We identify Vermont contractors who match your trade, location, and scope.' },
              { n: '03', t: 'You hear from us by email', b: 'We follow up within 1–2 business days. No phone spam.' },
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
          <div style={{ borderTop: '1px solid rgba(122,155,111,0.12)', paddingTop: '28px' }}>
            <p style={{ color: 'rgba(245,239,224,0.35)', fontSize: '13px', marginBottom: '16px' }}>While you wait — useful reading:</p>
            <Link href="/plan" style={{ display: 'inline-block', padding: '10px 20px', border: '1px solid rgba(122,155,111,0.3)', color: 'rgba(245,239,224,0.6)', fontSize: '13px', borderRadius: '2px', textDecoration: 'none', fontFamily: 'monospace' }}>
              Renovation planning guide &rarr;
            </Link>
          </div>
          <p style={{ color: 'rgba(245,239,224,0.2)', fontSize: '11px', fontFamily: 'monospace', marginTop: '28px' }}>Questions? hello@alderprojects.com</p>
        </div>
      </div>
    </div>
  )
}