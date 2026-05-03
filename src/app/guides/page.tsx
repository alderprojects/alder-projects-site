import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { buildBreadcrumbList, buildItemList, absUrl } from '@/lib/jsonld'
export const metadata: Metadata = {
  title: 'Vermont Home Renovation Guides | Alder Projects',
  description: 'Practical guides for Vermont homeowners — seasonal home care, renovation costs, finding contractors, permits, and timelines.',
  alternates: { canonical: 'https://alderprojects.com/guides' },
}
const seasonal = [
  { href: '/guides/winterizing-vermont-seasonal-home', title: 'How to Winterize a Vermont Seasonal Home', desc: 'The complete checklist for closing up your lake house or cabin.', rt: '7 min' },
  { href: '/guides/vermont-septic-what-to-know', title: 'Vermont Septic Systems: What Seasonal Owners Should Know', desc: 'Capacity, inspections, wetlands, and the bedroom rule.', rt: '6 min' },
  { href: '/guides/vermont-flood-zone-renovation', title: 'Renovating in a Vermont Flood Zone', desc: 'The 50% substantial improvement rule explained.', rt: '5 min' },
  { href: '/guides/heat-pump-rebates-vermont', title: 'Vermont Heat Pump Rebates in 2026', desc: 'Efficiency Vermont + federal credits. Real numbers.', rt: '5 min' },
  { href: '/guides/handyman-seasonal-home-vermont', title: 'What a Handyman Can Do for Your Seasonal Home', desc: 'The gap between DIY and hiring a contractor.', rt: '5 min' },
  { href: '/guides/opening-lake-house-summer-vermont', title: 'Opening a Lake House for Summer', desc: 'The step-by-step sequence. What to check first.', rt: '5 min' },
  { href: '/guides/can-i-add-bedroom-vermont-lake-house', title: 'Can I Add a Bedroom to My Vermont Lake House?', desc: 'Septic capacity decides. Check before you design.', rt: '5 min' },
  { href: '/guides/winterizing-lake-house-vermont', title: 'Winterizing a Lake House in Vermont', desc: 'Docks, intake lines, shoreline — lake-specific steps.', rt: '6 min' },
]
const costs = [
  { href: '/guides/how-much-does-kitchen-remodel-cost-vermont', title: 'How Much Does a Kitchen Remodel Cost in Vermont?', desc: 'Real Vermont ranges by scope — minor refresh through full gut.', rt: '6 min' },
  { href: '/guides/how-much-does-a-deck-cost-vermont', title: 'How Much Does a Deck Cost in Vermont?', desc: 'PT wood vs composite, permits, and what drives price.', rt: '5 min' },
  { href: '/guides/how-much-does-roof-replacement-cost-vermont', title: 'How Much Does a Roof Replacement Cost in Vermont?', desc: 'Asphalt vs metal, ice dam risks, and Vermont-specific factors.', rt: '5 min' },
]
const hiring = [
  { href: '/guides/how-to-find-contractor-vermont', title: 'How to Find a Good Contractor in Vermont', desc: 'Vermont\'s contractor market is tight. What works.', rt: '5 min' },
  { href: '/guides/vermont-contractor-red-flags', title: 'Vermont Contractor Red Flags', desc: 'Warning signs visible before any work begins.', rt: '5 min' },
  { href: '/guides/what-to-ask-contractor-before-hiring', title: 'What to Ask a Contractor Before Hiring', desc: 'The questions that separate good from problems.', rt: '6 min' },
]
const planning = [
  { href: '/guides/vermont-renovation-permit-guide', title: 'Do I Need a Permit for My Vermont Renovation?', desc: 'Which projects require permits and why skipping them is risky.', rt: '5 min' },
  { href: '/guides/how-long-does-bathroom-remodel-take-vermont', title: 'How Long Does a Bathroom Remodel Take?', desc: 'Realistic timelines by scope and what causes delays.', rt: '5 min' },
  { href: '/guides/vermont-home-renovation-winter', title: 'Renovating Your Vermont Home in Winter', desc: 'What works year-round and the off-season advantage.', rt: '4 min' },
]
function Section({title,subtitle,guides,accent}:{title:string;subtitle:string;guides:{href:string;title:string;desc:string;rt:string}[];accent?:boolean}){
  return (
    <div style={{marginBottom:'48px'}}>
      <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'1.3rem',fontWeight:600,color:'#1C2B1A',margin:'0 0 4px'}}>{title}</h2>
      <p style={{fontSize:'13px',color:'rgba(28,43,26,0.5)',margin:'0 0 20px'}}>{subtitle}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
        {guides.map(g=>(
          <Link key={g.href} href={g.href} style={{display:'block',textDecoration:'none',padding:'20px',borderRadius:'4px',border:accent?'1px solid rgba(200,115,42,0.2)':'1px solid rgba(28,43,26,0.08)',backgroundColor:accent?'rgba(200,115,42,0.03)':'white'}}>
            <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'0.95rem',fontWeight:600,color:'#1C2B1A',margin:'0 0 6px',lineHeight:1.3}}>{g.title}</h3>
            <p style={{fontSize:'12px',color:'rgba(28,43,26,0.55)',margin:'0 0 8px',lineHeight:1.5}}>{g.desc}</p>
            <span style={{fontSize:'10px',fontFamily:'monospace',color:'rgba(28,43,26,0.3)'}}>{g.rt}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
const guidesIndexSchemas = [
  buildItemList({
    url: absUrl('/guides'),
    name: 'Vermont home renovation guides',
    items: [...seasonal, ...costs, ...hiring, ...planning].map(g => ({
      name: g.title,
      url: g.href,
    })),
  }),
  buildBreadcrumbList([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
  ]),
]

export default function Page(){
  return (
    <div style={{minHeight:'100vh',backgroundColor:'#FAF7F2'}}>
      {guidesIndexSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Nav />
      <div style={{backgroundColor:'#1C2B1A',padding:'clamp(96px,10vw,120px) 24px clamp(40px,6vw,64px)',borderBottom:'1px solid rgba(122,155,111,0.1)'}}>
        <div style={{maxWidth:'720px',margin:'0 auto'}}>
          <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7A9B6F',display:'block',marginBottom:'12px'}}>Vermont Renovation Guides</span>
          <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginBottom:'14px'}}>What Vermont homeowners need to know.</h1>
          <p style={{fontSize:'16px',color:'rgba(245,239,224,0.55)',lineHeight:1.7,margin:0}}>Guides organized by what you are trying to do — not when we wrote them.</p>
        </div>
      </div>
      <div style={{maxWidth:'720px',margin:'0 auto',padding:'clamp(40px,6vw,64px) 24px 80px'}}>
        <Link href="/seasonal-home-report" style={{display:'block',textDecoration:'none',backgroundColor:'#1C2B1A',borderRadius:'4px',padding:'24px 28px',marginBottom:'40px',border:'1px solid rgba(122,155,111,0.2)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8732A'}}>Free Tool</span>
              <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'1.3rem',fontWeight:600,color:'#F5EFE0',margin:'6px 0 4px'}}>Seasonal Home Report</h2>
              <p style={{fontSize:'13px',color:'rgba(245,239,224,0.5)',margin:0}}>Scan your Vermont property against state environmental records. 10 seconds.</p>
            </div>
            <span style={{fontSize:'13px',fontFamily:'monospace',color:'#7A9B6F',whiteSpace:'nowrap'}}>Scan your property →</span>
          </div>
        </Link>
        <Section title="Seasonal home guides" subtitle="For lake house, cabin, and second-home owners." guides={seasonal} accent />
        <Section title="What does it cost?" subtitle="Real Vermont pricing by project type." guides={costs} />
        <Section title="Finding and hiring contractors" subtitle="How to find the right one and avoid the wrong one." guides={hiring} />
        <Section title="Planning and permits" subtitle="Timelines, permits, and when to renovate." guides={planning} />
        <Link href="/calculator" style={{display:'block',textDecoration:'none',backgroundColor:'#1C2B1A',borderRadius:'4px',padding:'24px 28px',marginBottom:'40px',border:'1px solid rgba(122,155,111,0.2)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',color:'#C8732A'}}>Interactive Tool</span>
              <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'1.3rem',fontWeight:600,color:'#F5EFE0',margin:'6px 0 4px'}}>Vermont Renovation Cost Calculator</h2>
              <p style={{fontSize:'13px',color:'rgba(245,239,224,0.5)',margin:0}}>Estimate costs by project type, scope, and location.</p>
            </div>
            <span style={{fontSize:'13px',fontFamily:'monospace',color:'#7A9B6F',whiteSpace:'nowrap'}}>Open calculator →</span>
          </div>
        </Link>
        <div style={{marginTop:'48px',padding:'24px 28px',backgroundColor:'#1C2B1A',borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'14px'}}>
          <div>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'1.1rem',color:'#F5EFE0',fontWeight:500,margin:'0 0 4px'}}>Ready to post your project?</p>
            <p style={{fontSize:'13px',color:'rgba(245,239,224,0.5)',margin:0}}>Free · No account required · Matched within 1–2 business days.</p>
          </div>
          <Link href="/?source=guides-index&description=Coming+from+guides+index+%E2%80%94+ready+to+talk+to+a+contractor.#submit-project" style={{padding:'11px 22px',backgroundColor:'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'14px',borderRadius:'2px',textDecoration:'none'}}>Post a Project →</Link>
        </div>
      </div>
    </div>
  )
            }



