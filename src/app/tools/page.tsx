import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home Project Tools | Alder Projects Vermont',
  description: 'Free cost calculator and $19.99 personalized Smart Cart for Vermont home projects. Tools that help you shop smarter.',
  alternates: { canonical: 'https://alderprojects.com/tools' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://alderprojects.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://alderprojects.com/tools' },
  ],
}

export default function ToolsIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
        <header style={{ backgroundColor: '#0D1A0B', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
              <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
            </svg>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
          </Link>
          <Link href="/guides" style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.5)', textDecoration: 'none' }}>Guides</Link>
        </header>

        <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,64px) 24px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '10px' }}>Tools</span>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.15, marginBottom: '14px' }}>Vermont home project tools</h1>
            <p style={{ fontSize: '16px', color: 'rgba(245,239,224,0.6)', lineHeight: 1.7, margin: 0 }}>Two ways to shop smarter for your Vermont home project. Start free with the cost calculator. Upgrade to Smart Cart for the personalized buy/skip/wait list.</p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(32px,5vw,56px) 24px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <Link href="/calculator?utm_source=tools_index&utm_medium=card" style={{ display: 'block', padding: '28px', backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '4px', textDecoration: 'none' }}>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '10px' }}>Free Tool</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '10px' }}>Vermont Cost Calculator</h2>
              <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.7)', lineHeight: 1.6, marginBottom: '16px' }}>Estimate your project cost in 30 seconds. 8 project types, location adjustments, contingency slider. Real Vermont ranges from 2026 quotes.</p>
              <span style={{ fontSize: '13px', color: '#C8732A', fontWeight: 600 }}>Start estimating →</span>
            </Link>

            <Link href="/smart-cart?utm_source=tools_index&utm_medium=card" style={{ display: 'block', padding: '28px', backgroundColor: '#1C2B1A', borderRadius: '4px', textDecoration: 'none' }}>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8732A', display: 'block', marginBottom: '10px' }}>$19.99 · 30-day refund</span>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 600, color: '#F5EFE0', marginBottom: '10px' }}>Smart Cart</h2>
              <p style={{ fontSize: '14px', color: 'rgba(245,239,224,0.7)', lineHeight: 1.6, marginBottom: '16px' }}>Personalized buy/skip/wait list for your specific project. Real product picks, dollar amounts saved per skip, buy-timing for each item. Covers 9 project scopes.</p>
              <span style={{ fontSize: '13px', color: '#C8732A', fontWeight: 600 }}>Build my Smart Cart →</span>
            </Link>
          </div>

          <div style={{ marginTop: '40px', padding: '24px', backgroundColor: 'rgba(122,155,111,0.08)', borderRadius: '4px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#1C2B1A', marginBottom: '10px' }}>Read first, decide later</h3>
            <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.7)', lineHeight: 1.6, marginBottom: '12px' }}>If you'd like to understand the method behind Smart Cart before deciding, the Buy/Skip/Wait pillar guide walks through four real Vermont projects and the dollar-amount logic behind each recommendation.</p>
            <Link href="/guides/how-to-shop-for-home-projects-without-overspending?utm_source=tools_index&utm_medium=card" style={{ fontSize: '13px', color: '#C8732A', textDecoration: 'none', fontWeight: 600 }}>
              Read the Buy/Skip/Wait method →
            </Link>
          </div>
        </div>

        <footer style={{ backgroundColor: '#1C2B1A', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.3)', margin: 0 }}>© {new Date().getFullYear()} Alder Projects LLC · Vermont</p>
        </footer>
      </div>
    </>
  )
}
