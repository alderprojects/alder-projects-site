export default function ContractorBand() {
  return (
    <section style={{backgroundColor:'#0D1A0B',borderTop:'1px solid rgba(122,155,111,0.15)',borderBottom:'1px solid rgba(122,155,111,0.15)'}}>
      <div style={{maxWidth:'1152px',margin:'0 auto',padding:'clamp(40px,6vw,64px) 24px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,460px),1fr))',gap:'32px',alignItems:'center'}}>

        {/* Left */}
        <div>
          <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.14em',textTransform:'uppercase',color:'#7A9B6F'}}>Vermont Contractors</span>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.6rem,3.5vw,2.4rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'8px',marginBottom:'12px'}}>
            Get matched with local<br/>renovation leads.
          </h2>
          <p style={{color:'rgba(245,239,224,0.45)',fontSize:'15px',lineHeight:1.7,maxWidth:'400px',marginBottom:'0'}}>
            Join Vermont&apos;s contractor network. Pre-screened homeowner projects delivered to your county. No subscription — pay only when you win.
          </p>
        </div>

        {/* Right */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'20px',marginBottom:'4px'}}>
            {[
              {n:'Pay per job',d:'No monthly fees'},
              {n:'Pre-screened',d:'Qualified leads only'},
              {n:'Your county',d:'No out-of-state competition'},
            ].map(s => (
              <div key={s.n} style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                <span style={{fontSize:'13px',fontWeight:600,color:'#C8732A',fontFamily:"'DM Sans',system-ui,sans-serif"}}>{s.n}</span>
                <span style={{fontSize:'12px',fontFamily:'monospace',color:'rgba(245,239,224,0.35)',letterSpacing:'0.04em'}}>{s.d}</span>
              </div>
            ))}
          </div>
          <div>
            <a
              href="/contractors"
              style={{display:'inline-flex',alignItems:'center',gap:'10px',padding:'13px 24px',backgroundColor:'transparent',border:'1px solid rgba(122,155,111,0.5)',color:'#F5EFE0',fontWeight:600,fontSize:'14px',borderRadius:'2px',textDecoration:'none',fontFamily:"'DM Sans',system-ui,sans-serif",transition:'all 0.15s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='rgba(122,155,111,0.1)';(e.currentTarget as HTMLElement).style.borderColor='rgba(122,155,111,0.8)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.backgroundColor='transparent';(e.currentTarget as HTMLElement).style.borderColor='rgba(122,155,111,0.5)'}}
            >
              Apply to Join the Network
              <span style={{color:'#7A9B6F',fontSize:'16px'}}>&#8594;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
