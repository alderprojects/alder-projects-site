import Link from 'next/link'

export type GuideSection = { heading: string; body: string; list?: string[] }
export type GuideFaq = { q: string; a: string }
export type GuidePageContent = {
  eyebrow: string; h1: string; intro: string; readTime: string
  sections: GuideSection[]; faqs?: GuideFaq[]
  ctaHeading: string; ctaBody: string
  relatedGuides?: { label: string; href: string }[]
  relatedPages?: { label: string; href: string }[]
}

export default function GuidePage({ content }: { content: GuidePageContent }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      <header style={{ backgroundColor: '#0D1A0B', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(122,155,111,0.12)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
          </svg>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/guides" style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.4)', textDecoration: 'none' }}>Guides</Link>
          <Link href="/#submit-project" style={{ padding: '7px 16px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '12px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none' }}>Post a Project</Link>
        </div>
      </header>
      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,64px) 24px', borderBottom: '1px solid rgba(122,155,111,0.1)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F' }}>{content.eyebrow}</span>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.25)' }}>&middot; {content.readTime} read</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '16px' }}>{content.h1}</h1>
          <p style={{ fontSize: '17px', color: 'rgba(245,239,224,0.6)', lineHeight: 1.7, maxWidth: '580px', margin: 0 }}>{content.intro}</p>
        </div>
      </div>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px 80px' }}>
        {content.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '14px' }}>{section.heading}</h2>
            <p style={{ fontSize: '15px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.85, marginBottom: section.list ? '14px' : 0 }}>{section.body}</p>
            {section.list && (
              <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'none' }}>
                {section.list.map((item, j) => (
                  <li key={j} style={{ fontSize: '15px', color: 'rgba(28,43,26,0.75)', lineHeight: 1.85, paddingLeft: '8px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '-14px', color: '#7A9B6F' }}>&#10003;</span>{item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div style={{ backgroundColor: '#1C2B1A', borderRadius: '4px', padding: '32px', margin: '48px 0' }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.4rem', color: '#F5EFE0', fontWeight: 600, margin: '0 0 10px' }}>{content.ctaHeading}</h3>
          <p style={{ fontSize: '14px', color: 'rgba(245,239,224,0.55)', lineHeight: 1.7, margin: '0 0 18px' }}>{content.ctaBody}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/#submit-project" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>Post Your Project Request &rarr;</Link>
            <Link href="/plan" style={{ display: 'inline-block', padding: '12px 24px', border: '1px solid rgba(122,155,111,0.35)', color: 'rgba(245,239,224,0.7)', fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>Start Planning First</Link>
          </div>
        </div>
        {content.faqs && content.faqs.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '20px' }}>Frequently Asked Questions</h2>
            {content.faqs.map((faq, i) => (
              <div key={i} style={{ borderTop: '1px solid rgba(28,43,26,0.08)', padding: '18px 0' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '15px', fontWeight: 600, color: '#1C2B1A', marginBottom: '6px' }}>{faq.q}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.65)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        )}
        {(content.relatedGuides?.length || content.relatedPages?.length) && (
          <div style={{ borderTop: '1px solid rgba(28,43,26,0.08)', paddingTop: '32px' }}>
            {content.relatedGuides && content.relatedGuides.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,43,26,0.4)', marginBottom: '10px' }}>Related Guides</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {content.relatedGuides.map(g => <Link key={g.href} href={g.href} style={{ fontSize: '13px', color: '#C8732A', textDecoration: 'none' }}>{g.label} &rarr;</Link>)}
                </div>
              </div>
            )}
            {content.relatedPages && content.relatedPages.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,43,26,0.4)', marginBottom: '10px' }}>Find Contractors</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {content.relatedPages.map(p => <Link key={p.href} href={p.href} style={{ padding: '6px 12px', border: '1px solid rgba(28,43,26,0.12)', borderRadius: '2px', fontSize: '12px', color: 'rgba(28,43,26,0.65)', textDecoration: 'none', fontFamily: 'monospace' }}>{p.label} &rarr;</Link>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <footer style={{ backgroundColor: '#1C2B1A', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.3)', margin: 0 }}>&copy; {new Date().getFullYear()} Alder Projects LLC &middot; Vermont &middot; <Link href="/" style={{ color: 'rgba(245,239,224,0.4)', textDecoration: 'none' }}>alderprojects.com</Link></p>
      </footer>
    </div>
  )
}