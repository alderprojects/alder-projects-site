const B = [
  {t:'Qualified Leads Only',d:'Every project is pre-screened. You only see leads matching your trade, your service area, and your capacity.'},
  {t:'No Subscription Fees',d:'Pay only when you win a job. We grow when you grow.'},
  {t:'Vermont-First Network',d:'Built exclusively for Vermont contractors. No competing with out-of-state nationals for local work.'},
  {t:'Your Profile Does the Work',d:'Build a verified profile once. Let homeowners in your county find you year-round.'},
]

export default function ForContractors() {
  return (
    <section id="for-contractors" style={{position:'relative',overflow:'hidden',backgroundColor:'#1C2B1A'}}>
      {/* Vermont mountain photo — right half background, plain CSS */}
      <div style={{
        position:'absolute', top:0, right:0, width:'45%', height:'100%',
        backgroundImage:"url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=960&q=80')",
        backgroundSize:'cover', backgroundPosition:'center',
        opacity:0.25,
      }} />
      {/* Gradient fade left */}
      <div style={{position:'absolute',top:0,right:'30%',width:'20%',height:'100%',background:'linear-gradient(to right,#1C2B1A,transparent)'}} />

      <div style={{position:'relative',zIndex:10,maxWidth:'1152px',margin:'0 auto',padding:'clamp(64px,8vw,96px) 24px'}}>
        <div style={{maxWidth:'560px'}}>
          <span style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'#7A9B6F'}}>For Vermont Contractors</span>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'10px',marginBottom:'16px'}}>
            Your pipeline,<br/><em style={{color:'#C8732A',fontStyle:'normal'}}>filled.</em>
          </h2>
          <p style={{color:'rgba(245,239,224,0.5)',fontSize:'16px',lineHeight:1.7,marginBottom:'36px'}}>
            You know these towns. You know the terrain, the permit offices, the mud season.
            Stop chasing referrals and let qualified project leads come to you.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'20px',marginBottom:'40px'}}>
            {B.map((b,i) => (
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
