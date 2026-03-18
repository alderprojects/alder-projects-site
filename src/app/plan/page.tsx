import type { Metadata } from 'next'
import Link from 'next/link'
import PlanForm from './PlanForm'

export const metadata: Metadata = {
  title: 'Plan Your Vermont Renovation | Alder Projects',
  description: 'Not ready to post a project yet? Start here. Get our free Vermont renovation planning guide and learn how to prepare before talking to a contractor.',
  alternates: { canonical: 'https://alderprojects.com/plan' },
}

const steps = [
  { n:'01', t:'Define your scope', b:'Which rooms, what changes, what stays. The more specific you can be, the more accurate your contractor conversations will be. You do not need a full blueprint — a clear written description is enough to start.' },
  { n:'02', t:'Set a realistic budget', b:'Research what similar projects have cost in Vermont — costs vary more locally than national averages suggest. Build in a 15–20% contingency. If you do not have a number yet, that is fine — but having a range helps contractors give you useful information.' },
  { n:'03', t:'Think about timing', b:'Vermont contractors book out 4–8 weeks for most projects. Permitting adds time for structural, electrical, or plumbing work. If you want to start in spring, the right time to talk to contractors is late winter.' },
]

const links = [
  { label:'Kitchen remodeling in Burlington', href:'/kitchen-remodeling-burlington-vt' },
  { label:'Bathroom remodeling in Vermont', href:'/bathroom-remodeling-vermont' },
  { label:'Deck builders in Vermont', href:'/deck-builders-vermont' },
  { label:'Roofing contractors in Burlington', href:'/roofing-burlington-vt' },
]

export default function PlanPage() {
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#FAF7F2' }}>
      <header style={{ backgroundColor:'#0D1A0B', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(122,155,111,0.12)' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F" />
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A" />
          </svg>
          <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'18px', fontWeight:600, color:'#F5EFE0' }}>Alder Projects</span>
        </Link>
        <Link href="/" style={{ fontSize:'12px', color:'rgba(245,239,224,0.4)', fontFamily:'monospace', textDecoration:'none' }}>&larr; Back to home</Link>
      </header>
      <div style={{ backgroundColor:'#0D1A0B', padding:'clamp(48px,8vw,80px) 24px', borderBottom:'1px solid rgba(122,155,111,0.12)' }}>
        <div style={{ maxWidth:'580px', margin:'0 auto', textAlign:'center' }}>
          <span style={{ fontSize:'10px', fontFamily:'monospace', letterSpacing:'0.14em', textTransform:'uppercase', color:'#7A9B6F' }}>Start Planning</span>
          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:600, color:'#F5EFE0', lineHeight:1.1, marginTop:'10px', marginBottom:'14px' }}>
            Not ready to post yet?<br /><em style={{ color:'#C8732A', fontStyle:'normal' }}>Start here.</em>
          </h1>
          <p style={{ color:'rgba(245,239,224,0.55)', fontSize:'16px', lineHeight:1.7, maxWidth:'460px', margin:'0 auto' }}>
            Most homeowners spend a few weeks thinking through scope before they are ready to talk to a contractor. Here is how to use that time well.
          </p>
        </div>
      </div>
      <div style={{ maxWidth:'640px', margin:'0 auto', padding:'clamp(40px,6vw,64px) 24px 80px' }}>
        <div style={{ marginBottom:'48px' }}>
          {steps.map((step,i) => (
            <div key={step.n} style={{ display:'flex', gap:'24px', marginBottom:'32px', paddingBottom:'32px', borderBottom:i<steps.length-1?'1px solid rgba(28,43,26,0.08)':'none' }}>
              <div style={{ fontFamily:'monospace', fontSize:'28px', fontWeight:700, color:'rgba(28,43,26,0.1)', flexShrink:0, width:'48px', paddingTop:'4px' }}>{step.n}</div>
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'1.2rem', fontWeight:600, color:'#1C2B1A', marginBottom:'8px' }}>{step.t}</h2>
                <p style={{ fontSize:'15px', lineHeight:1.75, color:'rgba(28,43,26,0.65)', margin:0 }}>{step.b}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor:'#1C2B1A', borderRadius:'4px', padding:'36px', marginBottom:'48px' }}>
          <p style={{ fontSize:'10px', fontFamily:'monospace', letterSpacing:'0.12em', textTransform:'uppercase', color:'#7A9B6F', marginBottom:'10px' }}>Free Resource</p>
          <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'1.5rem', fontWeight:600, color:'#F5EFE0', marginBottom:'10px' }}>Get the Vermont renovation planning checklist</h2>
          <p style={{ color:'rgba(245,239,224,0.5)', fontSize:'14px', lineHeight:1.65, marginBottom:'24px' }}>A short, practical checklist covering scope, budget, timing, and what to ask a contractor before you hire. Vermont-specific.</p>
          <PlanForm />
        </div>
        <div style={{ marginBottom:'40px' }}>
          <p style={{ fontSize:'11px', fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(28,43,26,0.4)', marginBottom:'14px' }}>Local Project Guides</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {links.map(link => (
              <Link key={link.href} href={link.href} style={{ display:'inline-block', padding:'8px 14px', border:'1px solid rgba(28,43,26,0.15)', borderRadius:'2px', fontSize:'13px', color:'rgba(28,43,26,0.65)', textDecoration:'none', fontFamily:'monospace' }}>
                {link.label} &rarr;
              </Link>
            ))}
          </div>
        </div>
        <div style={{ textAlign:'center', padding:'32px', border:'1px solid rgba(28,43,26,0.1)', borderRadius:'3px', backgroundColor:'white' }}>
          <p style={{ fontSize:'14px', color:'rgba(28,43,26,0.6)', marginBottom:'16px' }}>When you are ready to find a contractor —</p>
          <Link href="/#submit-project" style={{ display:'inline-block', padding:'14px 28px', backgroundColor:'#C8732A', color:'#FAF7F2', fontWeight:600, fontSize:'14px', borderRadius:'3px', textDecoration:'none' }}>Post Your Project Request &rarr;</Link>
          <p style={{ fontSize:'11px', fontFamily:'monospace', color:'rgba(28,43,26,0.3)', marginTop:'12px' }}>Free &middot; No account required &middot; We review and follow up by email</p>
        </div>
      </div>
    </div>
  )
}