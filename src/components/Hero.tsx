'use client'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const headRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const el = headRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(16px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.9s ease, transform 0.9s ease'
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
  }, [])

  return (
    <section style={{position:'relative',minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',overflow:'hidden',backgroundColor:'#0D1A0B'}}>

      {/* Vermont house in autumn foliage — Unsplash, Abhi Verma, free license */}
      <img
        src="https://images.unsplash.com/photo-1757661543986-6f418adc8cb6?auto=format&fit=crop&w=1920&q=80"
        alt=""
        aria-hidden="true"
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',zIndex:0}}
      />
      <div style={{position:'absolute',inset:0,zIndex:1,background:'linear-gradient(105deg, rgba(8,18,7,0.9) 0%, rgba(8,18,7,0.72) 50%, rgba(8,18,7,0.4) 100%)'}} />
      <div style={{position:'absolute',top:0,left:0,width:'3px',height:'100%',background:'linear-gradient(to bottom, #C8732A, rgba(200,115,42,0.1))',zIndex:2}} />

      <div style={{position:'relative',zIndex:10,maxWidth:'1152px',margin:'0 auto',width:'100%',padding:'clamp(100px,12vw,140px) 24px clamp(60px,8vw,96px)',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'48px',alignItems:'center'}}>

        <div>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 12px',border:'1px solid rgba(122,155,111,0.4)',borderRadius:'999px',marginBottom:'28px'}}>
            <span style={{width:'7px',height:'7px',borderRadius:'50%',backgroundColor:'#7A9B6F',flexShrink:0}} />
            <span style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7A9B6F'}}>Vermont&apos;s Renovation Network</span>
          </div>

          <h1 ref={headRef} style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:600,fontSize:'clamp(2.2rem,4.5vw,3.4rem)',lineHeight:1.08,letterSpacing:'-0.02em',color:'#F5EFE0',marginBottom:'20px'}}>
            Find the right<br/>
            contractor for<br/>
            your <em style={{color:'#C8732A',fontStyle:'normal'}}>Vermont</em> home.
          </h1>

          <p style={{fontSize:'17px',fontWeight:300,lineHeight:1.75,color:'rgba(245,239,224,0.65)',maxWidth:'420px',marginBottom:'36px'}}>
            Kitchens, bathrooms, decks, additions &mdash; we match Vermont homeowners with vetted local contractors across all 14 counties.
          </p>

          <div style={{display:'flex',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
            <a href="#submit-project" style={{display:'inline-block',padding:'14px 28px',backgroundColor:'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'14px',borderRadius:'3px',textDecoration:'none'}}>
              Post Your Project &rarr;
            </a>
            <a href="/contractors" style={{display:'inline-block',padding:'14px 28px',border:'1px solid rgba(122,155,111,0.45)',color:'rgba(245,239,224,0.8)',fontWeight:500,fontSize:'14px',borderRadius:'3px',textDecoration:'none'}}>
              I&apos;m a Contractor
            </a>
          </div>

          <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'0.06em',color:'rgba(245,239,224,0.22)'}}>
            Licensed &middot; Insured &middot; Vermont-based contractors only
          </p>
        </div>

        <div style={{backgroundColor:'rgba(8,16,6,0.72)',border:'1px solid rgba(122,155,111,0.18)',borderRadius:'4px',padding:'22px',backdropFilter:'blur(12px)'}}>
          <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7A9B6F',marginBottom:'14px'}}>
            Coverage &mdash; All 14 Counties
          </p>
          <div>
            {['Burlington','Montpelier','Stowe','Woodstock','Middlebury','Brattleboro','Rutland','Barre','St. Johnsbury','Bennington','Manchester','Waitsfield','Morrisville','Newport','Shelburne','Williston','South Burlington','Essex Junction','Colchester','Winooski'].map(t => (
              <span key={t} style={{display:'inline-block',margin:'3px',padding:'4px 10px',backgroundColor:'rgba(8,16,6,0.6)',border:'1px solid rgba(122,155,111,0.18)',color:'rgba(245,239,224,0.6)',fontSize:'11px',fontFamily:'monospace',borderRadius:'2px'}}>
                {t}
              </span>
            ))}
          </div>
          <div style={{display:'flex',marginTop:'18px',paddingTop:'16px',borderTop:'1px solid rgba(122,155,111,0.12)'}}>
            {[{n:'14',l:'Counties'},{n:'Free',l:'To Post'},{n:'48hr',l:'Avg Match'}].map((s,i) => (
              <div key={s.l} style={{flex:1,textAlign:'center',borderRight:i<2?'1px solid rgba(122,155,111,0.12)':'none',padding:'0 8px'}}>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700,fontSize:'20px',color:'#C8732A'}}>{s.n}</div>
                <div style={{fontSize:'10px',fontFamily:'monospace',color:'rgba(245,239,224,0.35)',marginTop:'2px',letterSpacing:'0.06em'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
