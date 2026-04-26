'use client'
import Link from 'next/link'

export default function SeasonalReportCard() {
  return (
    <section style={{backgroundColor:'#1C2B1A',padding:'clamp(56px,8vw,88px) 24px',borderTop:'1px solid rgba(122,155,111,0.12)',borderBottom:'1px solid rgba(122,155,111,0.12)'}}>
      <div style={{maxWidth:'1120px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'40px',alignItems:'center'}}>
        <div>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'4px 10px',backgroundColor:'rgba(200,115,42,0.12)',border:'1px solid rgba(200,115,42,0.35)',borderRadius:'999px',marginBottom:'18px'}}>
            <span style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:'#C8732A'}} />
            <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.14em',textTransform:'uppercase',color:'#C8732A',fontWeight:600}}>Free Property Scan</span>
          </div>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:600,fontSize:'clamp(1.7rem,3.6vw,2.4rem)',lineHeight:1.15,letterSpacing:'-0.01em',color:'#F5EFE0',marginBottom:'16px',margin:'0 0 16px'}}>
            What does your Vermont<br/>property actually need?
          </h2>
          <p style={{fontSize:'16px',fontWeight:300,lineHeight:1.7,color:'rgba(245,239,224,0.65)',maxWidth:'460px',marginBottom:'24px'}}>
            Type any Vermont address. In ten seconds we scan your parcel against state environmental records and tell you what matters — flood zones, septic limits, shoreland rules, what to do, what to ignore.
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'center'}}>
            <Link href="/seasonal-home-report" style={{display:'inline-block',padding:'13px 26px',backgroundColor:'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'14px',borderRadius:'3px',textDecoration:'none'}}>Scan your property →</Link>
            <span style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'0.06em',color:'rgba(245,239,224,0.32)'}}>Free · No account · 10 seconds</span>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          {[
            { label: 'Flood zones', desc: 'FEMA SFHA + Vermont-specific risk' },
            { label: 'Septic capacity', desc: 'Wetlands proximity + bedroom rule' },
            { label: 'Shoreland rules', desc: '250-foot buffer + dock permits' },
            { label: 'River corridors', desc: 'Mapped erosion + zoning limits' },
          ].map(p => (
            <div key={p.label} style={{padding:'14px 16px',backgroundColor:'rgba(8,16,6,0.5)',border:'1px solid rgba(122,155,111,0.18)',borderRadius:'3px'}}>
              <p style={{fontSize:'13px',fontWeight:600,color:'#F5EFE0',margin:'0 0 4px'}}>{p.label}</p>
              <p style={{fontSize:'11px',fontFamily:'monospace',color:'rgba(245,239,224,0.45)',lineHeight:1.5,margin:0}}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
