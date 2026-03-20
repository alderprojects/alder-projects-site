import type { Metadata } from 'next'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Vermont Home Renovation Guides | Alder Projects',
  description: 'Practical guides for Vermont homeowners on renovation costs, finding contractors, permits, timelines, and what to watch out for.',
  alternates: { canonical: 'https://alderprojects.com/guides' },
}
const guides = [
  { href: '/guides/how-much-does-kitchen-remodel-cost-vermont', eyebrow: 'Cost Guide', title: 'How Much Does a Kitchen Remodel Cost in Vermont?', desc: 'Real Vermont ranges by scope — minor refresh through full gut.', rt: '6 min' },
  { href: '/guides/how-much-does-a-deck-cost-vermont', eyebrow: 'Cost Guide', title: 'How Much Does a Deck Cost in Vermont?', desc: 'PT wood vs composite, permit requirements, and what drives price.', rt: '5 min' },
  { href: '/guides/how-much-does-roof-replacement-cost-vermont', eyebrow: 'Cost Guide', title: 'How Much Does a Roof Replacement Cost in Vermont?', desc: 'Asphalt vs metal, ice dam risks, and Vermont-specific cost factors.', rt: '5 min' },
  { href: '/guides/how-to-find-contractor-vermont', eyebrow: 'Hiring Guide', title: 'How to Find a Good Contractor in Vermont', desc: "Vermont's contractor market is tight. What works and what to verify.", rt: '5 min' },
  { href: '/guides/vermont-contractor-red-flags', eyebrow: 'Hiring Guide', title: 'Vermont Contractor Red Flags: What to Watch For', desc: 'The warning signs visible before any work begins.', rt: '5 min' },
  { href: '/guides/what-to-ask-contractor-before-hiring', eyebrow: 'Hiring Checklist', title: 'What to Ask a Contractor Before Hiring', desc: 'The questions that separate good contractors from problems.', rt: '6 min' },
  { href: '/guides/vermont-renovation-permit-guide', eyebrow: 'Permits', title: 'Do I Need a Permit for My Vermont Renovation?', desc: 'Which projects require permits and why skipping them is riskier than it sounds.', rt: '5 min' },
  { href: '/guides/how-long-does-bathroom-remodel-take-vermont', eyebrow: 'Timeline Guide', title: 'How Long Does a Bathroom Remodel Take in Vermont?', desc: 'Realistic timelines by scope and what causes most delays.', rt: '5 min' },
  { href: '/guides/vermont-home-renovation-winter', eyebrow: 'Planning Guide', title: 'Renovating Your Vermont Home in Winter', desc: 'What works year-round, what to skip, and the off-season availability advantage.', rt: '4 min' },
]
export default function GuidesPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      <header style={{ backgroundColor: '#0D1A0B', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(122,155,111,0.12)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/><path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/></svg>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '16px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
        <Link href="/#submit-project" style={{ padding: '7px 16px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '12px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none' }}>Post a Project</Link>
      </header>
      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,64px) 24px', borderBottom: '1px solid rgba(122,155,111,0.1)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '12px' }}>Vermont Renovation Guides</span>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '14px' }}>What Vermont homeowners need to know.</h1>
          <p style={{ fontSize: '16px', color: 'rgba(245,239,224,0.55)', lineHeight: 1.7, margin: 0 }}>Practical guides on costs, hiring, permits, and timelines — specific to Vermont.</p>
        </div>
      </div>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px 80px' }}>
        <Link href="/calculator" style={{ display: 'block', textDecoration: 'none', backgroundColor: '#1C2B1A', borderRadius: '4px', padding: '24px 28px', marginBottom: '32px', border: '1px solid rgba(122,155,111,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8732A' }}>Interactive Tool</span>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.3rem', fontWeight: 600, color: '#F5EFE0', margin: '6px 0 4px' }}>Vermont Renovation Cost Calculator</h2>
              <p style={{ fontSize: '13px', color: 'rgba(245,239,224,0.5)', margin: 0 }}>Estimate costs by project type, scope, and location.</p>
            </div>
            <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#7A9B6F', whiteSpace: 'nowrap' }}>Open calculator →</span>
          </div>
        </Link>
        {guides.map((g, i) => (
          <Link key={g.href} href={g.href} style={{ display: 'block', textDecoration: 'none', borderTop: i===0?'1px solid rgba(28,43,26,0.08)':undefined }}>
            <div style={{ padding: '24px 0', borderBottom: '1px solid rgba(28,43,26,0.08)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8732A' }}>{g.eyebrow}</span>
                <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.15rem', fontWeight: 600, color: '#1C2B1A', margin: '6px 0 6px', lineHeight: 1.2 }}>{g.title}</h2>
                <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.6)', margin: 0, lineHeight: 1.65 }}>{g.desc}</p>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.35)', whiteSpace: 'nowrap', paddingTop: '4px' }}>{g.rt}</span>
            </div>
          </Link>
        ))}
        <div style={{ marginTop: '48px', padding: '24px 28px', backgroundColor: '#1C2B1A', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.1rem', color: '#F5EFE0', fontWeight: 500, margin: '0 0 4px' }}>Ready to post your project?</p>
            <p style={{ fontSize: '13px', color: 'rgba(245,239,224,0.5)', margin: 0 }}>Free · No account required · Matched within 1–2 business days.</p>
          </div>
          <Link href="/#submit-project" style={{ padding: '11px 22px', backgroundColor: '#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>Post a Project →</Link>
        </div>
      </div>
    </div>
  )
}