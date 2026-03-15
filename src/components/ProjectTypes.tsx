const PT = [
  {
    t:'Kitchen Remodel',
    d:"Cabinets, counters, appliances, layout changes. Vermont's most requested project.",
    img:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=600&q=80',
    tag:'Most Requested',
  },
  {
    t:'Bathroom Renovation',
    d:'Full gut-and-replace or targeted upgrades — tile, vanity, shower, fixtures.',
    img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80',
    tag:null,
  },
  {
    t:'Deck & Porch',
    d:'New builds, replacements, screened porches, and seasonal outdoor structures.',
    img:'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=80',
    tag:'Summer Favorite',
  },
  {
    t:'Basement Finishing',
    d:'Convert unfinished space to living area, home office, or rental apartment.',
    img:'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    tag:null,
  },
  {
    t:'Room Addition',
    d:'Bump-outs, sunrooms, mudrooms, and garage conversions.',
    img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80',
    tag:null,
  },
  {
    t:'Roofing & Weatherization',
    d:'Roof replacement, insulation, windows, and weatherproofing — critical in Vermont.',
    img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    tag:'Seasonal',
  },
  {
    t:'Plumbing & HVAC',
    d:'Heating systems, radiant floor, boiler upgrades, and plumbing repairs.',
    img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    tag:null,
  },
  {
    t:'Electrical',
    d:'Panel upgrades, wiring, EV chargers, and solar-ready prep.',
    img:'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
    tag:'High Demand',
  },
]

export default function ProjectTypes() {
  return (
    <section id="project-types" style={{padding:'clamp(56px,8vw,96px) 24px',backgroundColor:'#F5EFE0'}}>
      <div style={{maxWidth:'1152px',margin:'0 auto'}}>
        <div style={{marginBottom:'48px'}}>
          <span style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'#C8732A'}}>What We Match</span>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:600,color:'#1C2B1A',lineHeight:1.1,marginTop:'10px'}}>
            Every kind of<br/><em style={{fontStyle:'normal',color:'#C8732A'}}>Vermont renovation.</em>
          </h2>
          <p style={{color:'rgba(28,43,26,0.5)',fontSize:'16px',marginTop:'12px',maxWidth:'520px',lineHeight:1.6}}>
            Click any project type to get started — we will match you with the right Vermont contractor within 48 hours.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'20px'}}>
          {PT.map((p) => (
            <a key={p.t} href="#submit-project" style={{textDecoration:'none',display:'flex',flexDirection:'column',backgroundColor:'white',borderRadius:'4px',overflow:'hidden',border:'1px solid rgba(28,43,26,0.08)',cursor:'pointer',transition:'transform 0.2s,box-shadow 0.2s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(28,43,26,0.12)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';(e.currentTarget as HTMLElement).style.boxShadow='none'}}
            >
              <div style={{height:'170px',overflow:'hidden',position:'relative'}}>
                <img src={p.img} alt={p.t} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>
                {p.tag && (
                  <span style={{position:'absolute',top:'10px',left:'10px',backgroundColor:'#C8732A',color:'white',fontSize:'10px',fontFamily:'monospace',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',padding:'3px 8px',borderRadius:'2px'}}>
                    {p.tag}
                  </span>
                )}
              </div>
              <div style={{padding:'16px 18px 20px'}}>
                <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'16px',fontWeight:600,color:'#1C2B1A',marginBottom:'6px'}}>{p.t}</h3>
                <p style={{fontSize:'13px',color:'rgba(28,43,26,0.6)',lineHeight:1.6,margin:0}}>{p.d}</p>
              </div>
            </a>
          ))}
        </div>

        <div style={{marginTop:'40px',textAlign:'center'}}>
          <a href="#submit-project" style={{display:'inline-block',padding:'14px 32px',backgroundColor:'#1C2B1A',color:'#F5EFE0',fontWeight:600,fontSize:'14px',borderRadius:'2px',textDecoration:'none'}}>
            Post Any Project Free &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
