import Link from 'next/link'

export type SeoPageContent = {
  h1: string
  intro: string
  sections: { heading: string; body: string }[]
  townLinks?: { label: string; href: string }[]
  faqs: { q: string; a: string }[]
  ctaText?: string
  internalLinks: { label: string; href: string }[]
}

export default function SeoPage({ content }: { content: SeoPageContent }) {
  return (
    <main style={{ backgroundColor: '#FAF7F2', minHeight: '100vh' }}>

      {/* Nav strip */}
      <div style={{ backgroundColor: '#1C2B1A', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
          </svg>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
        <Link href="/#submit-project" style={{ padding: '8px 18px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '13px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          Post a Project
        </Link>
      </div>

      {/* Hero */}
      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,72px) 24px', borderBottom: '1px solid rgba(122,155,111,0.15)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '16px' }}>
            {content.h1}
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(245,239,224,0.65)', lineHeight: 1.7, maxWidth: '560px', marginBottom: '28px' }}>
            {content.intro}
          </p>
          <Link href="/#submit-project" style={{ display: 'inline-block', padding: '13px 26px', backgroundColor: '#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {content.ctaText || 'Post Your Project Free →'}
          </Link>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px' }}>
        {content.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '12px' }}>
              {s.heading}
            </h2>
            <div style={{ fontSize: '15px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: s.body }}
            />
          </div>
        ))}
        {content.townLinks && content.townLinks.length > 0 && (
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '14px' }}>
              Serving These Vermont Communities
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {content.townLinks.map(l => (
                <Link key={l.href} href={l.href} style={{ padding: '6px 14px', backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.15)', borderRadius: '2px', fontSize: '13px', color: '#1C2B1A', textDecoration: 'none', fontFamily: 'monospace' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div style={{ backgroundColor: '#1C2B1A', borderRadius: '4px', padding: '28px 32px', marginBottom: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.2rem', color: '#F5EFE0', fontWeight: 500, margin: 0 }}>Ready to find a contractor?</p>
          <Link href="/#submit-project" style={{ padding: '12px 24px', backgroundColor: '#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none', flexShrink: 0, fontFamily: "'DM Sans', system-ui, sans-serif" }}>Post Your Project Free →</Link>
        </div>
        {content.faqs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '20px' }}>Frequently Asked Questions</h2>
            {content.faqs.map((faq, i) => (
              <div key={i} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: i < content.faqs.length - 1 ? '1px solid rgba(28,43,26,0.08)' : 'none' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1C2B1A', marginBottom: '6px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.65)', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        )}
        {content.internalLinks.length > 0 && (
          <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(28,43,26,0.08)' }}>
            <p style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,43,26,0.4)', marginBottom: '12px' }}>See Also</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {content.internalLinks.map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: '13px', color: '#C8732A', textDecoration: 'none', fontFamily: "'DM Sans', system-ui, sans-serif" }}>{l.label} →</Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ backgroundColor: '#1C2B1A', padding: '24px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.3)', margin: 0 }}>
          © {new Date().getFullYear()} Alder Projects LLC · Vermont · <Link href="/" style={{ color: 'rgba(245,239,224,0.4)', textDecoration: 'none' }}>alderprojects.com</Link>
        </p>
      </div>
    </main>
  )
}
