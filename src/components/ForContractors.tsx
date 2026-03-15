const B = [
  {t:'Renovation-Focused Leads',d:'Kitchens, bathrooms, decks, additions. Real projects from Vermont homeowners actively looking for contractors.'},
  {t:'No Subscription Fees',d:'Pay only when you win a job. We grow when you grow.'},
  {t:'Vermont-First Network',d:'Built exclusively for Vermont contractors. No competing with out-of-state nationals on your own turf.'},
  {t:'Your Profile Does the Work',d:'Build a verified profile once. Let homeowners in your county find you year-round.'},
]

export default function ForContractors() {
  return (
    <section id="for-contractors" style={{position:'relative',overflow:'hidden',backgroundColor:'#1C2B1A',padding:'clamp(64px,8vw,96px) 24px'}}>
      {/* Vermont autumn forest — Unsplash photo-1441974231531 */}
      <div style={{
        position:'absolute',top:0,right:0,width:'50%',height:'100%',
        backgroundImage:"url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=960&q=80')",
        backgroundSize:'cover',backgroundPosition:'center',opacity:0.3,
      }} />
      {/* Gradient fade from left */}
      <div style={{position:'absolute',top:0,right:'30%',width:'25%',height:'100%',background:'linear-gradient(to right,#1C2B1A,transparent)'}} />

      <div style={{position:'relative',zIndex:10,maxWidth:'1152px',margin:'0 auto'}}>
        <div style={{maxWidth:'580px'}}>
          <span style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'#7A9B6F'}}>For Vermont Contractors</span>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'10px',marginBottom:'16px'}}>
            Your pipeline,<br/><em style={{color:'#C8732A',fontStyle:'normal'}}>filled.</em>
          </h2>
          <p style={{color:'rgba(245,239,224,0.5)',fontSize:'16px',lineHeight:1.7,marginBottom:'36px'}}>
            You know these roads, these towns, these winters.
            Stop chasing referrals and let qualified Vermont renovation leads come to you.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'20px',marginBottom:'40px'}}>
            {B.map((b) => (
              <div key={b.t} style={{display:'flex',gap:'14px',alignItems:'flex-start'}}>
                <div style={{width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'rgba(122,155,111,0.2)',border:'1px solid rgba(122,155,111,0.4)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px'}}>
                  <span style={{color:'#7A9B6F',fontSize:'11px',fontWeight:'bold'}}>&#10003;</span>
                </div>
                <div>
                  <p style={{color:'#F5EFE0',fontWeight:600,fontSize:'14px',marginBottom:'2px'}}>{b.t}</p>
                  <p style={{color:'rgba(245,239,224,0.45)',fontSize:'14px',lineHeight:1.6}}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="mailto:hello@alderprojects.com" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 28px',border:'1px solid rgba(122,155,111,0.6)',color:'#F5EFE0',fontWeight:600,fontSize:'14px',borderRadius:'2px',textDecoration:'none'}}>
            Apply to Join the Network &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
