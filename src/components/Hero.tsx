'use client'
import { useEffect, useRef } from 'react'

const COUNTIES = ['Addison','Bennington','Caledonia','Chittenden','Essex','Franklin','Grand Isle','Lamoille','Orange','Orleans','Rutland','Washington','Windham','Windsor']

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

      {/* Vermont Green Mountains SVG silhouette background */}
      <svg
        aria-hidden="true"
        style={{position:'absolute',bottom:0,left:0,width:'100%',height:'70%',zIndex:0,opacity:0.18}}
        viewBox="0 0 1440 500"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Far mountains */}
        <path d="M0 500 L0 280 Q80 180 160 220 Q240 260 320 160 Q400 60 480 140 Q560 220 640 100 Q720 -20 800 80 Q880 180 960 120 Q1040 60 1120 160 Q1200 260 1280 200 Q1360 140 1440 220 L1440 500 Z" fill="#2D4A1E" />
        {/* Near treeline */}
        <path d="M0 500 L0 380 Q60 340 90 360 Q110 320 130 350 Q150 300 170 340 Q200 310 230 350 Q260 300 290 340 Q330 290 360 330 Q400 280 430 320 Q470 270 510 310 Q550 260 580 300 Q630 260 670 290 Q720 250 760 280 Q800 240 840 270 Q880 230 920 260 Q970 220 1010 250 Q1050 210 1090 240 Q1130 200 1170 230 Q1210 190 1250 220 Q1300 180 1340 210 Q1380 230 1420 210 Q1430 215 1440 210 L1440 500 Z" fill="#1C3012" />
        {/* Pine trees silhouette strip */}
        <g fill="#152810" opacity="0.9">
          {[0,80,160,240,320,400,480,560,640,720,800,880,960,1040,1120,1200,1280,1360].map((x,i) => (
            <polygon key={x} points={String(x+20)+' 500 '+String(x-10+(i%3)*8)+' '+String(380-(i%4)*18)+' '+String(x+50+(i%2)*8)+' 500'} />
          ))}
        </g>
      </svg>

      {/* Subtle radial warm glow top-right — autumn sky feeling */}
      <div style={{position:'absolute',top:'-10%',right:'-5%',width:'55%',height:'70%',background:'radial-gradient(ellipse at center, rgba(180,80,20,0.12) 0%, transparent 70%)',zIndex:1,pointerEvents:'none'}} />

      {/* Left amber accent bar */}
      <div style={{position:'absolute',top:0,left:0,width:'3px',height:'100%',background:'linear-gradient(to bottom, #C8732A, rgba(200,115,42,0.1))',zIndex:2}} />

      {/* Grain texture overlay */}
      <div style={{position:'absolute',inset:0,zIndex:2,opacity:0.03,backgroundImage:"url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")",backgroundRepeat:'repeat',backgroundSize:'128px'}} />

      {/* Content */}
      <div style={{position:'relative',zIndex:10,maxWidth:'1152px',margin:'0 auto',width:'100%',padding:'clamp(100px,12vw,140px) 24px clamp(60px,8vw,96px)',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'48px',alignItems:'center'}}>

        {/* Left: text */}
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

          <p style={{fontSize:'17px',fontWeight:300,lineHeight:1.75,color:'rgba(245,239,224,0.62)',maxWidth:'420px',marginBottom:'36px'}}>
            Kitchens, bathrooms, decks, additions &mdash; we match Vermont homeowners with vetted local contractors across all 14 counties.
          </p>

          <div style={{display:'flex',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
            <a href="#submit-project" style={{display:'inline-block',padding:'14px 28px',backgroundColor:'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'14px',borderRadius:'3px',textDecoration:'none'}}>
              Post Your Project &rarr;
            </a>
            <a href="#for-contractors" style={{display:'inline-block',padding:'14px 28px',border:'1px solid rgba(122,155,111,0.4)',color:'rgba(245,239,224,0.75)',fontWeight:500,fontSize:'14px',borderRadius:'3px',textDecoration:'none'}}>
              I&apos;m a Contractor
            </a>
          </div>

          <p style={{fontSize:'11px',fontFamily:'monospace',letterSpacing:'0.06em',color:'rgba(245,239,224,0.2)'}}>
            Licensed &middot; Insured &middot; Vermont-based contractors only
          </p>
        </div>

        {/* Right: county coverage card */}
        <div style={{backgroundColor:'rgba(8,16,6,0.7)',border:'1px solid rgba(122,155,111,0.18)',borderRadius:'4px',padding:'22px',backdropFilter:'blur(12px)'}}>
          <p style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.12em',textTransform:'uppercase',color:'#7A9B6F',marginBottom:'14px'}}>
            Coverage &mdash; All 14 Counties
          </p>
          <div>
            {COUNTIES.map(c => (
              <span key={c} style={{display:'inline-block',margin:'3px',padding:'4px 10px',backgroundColor:'rgba(8,16,6,0.6)',border:'1px solid rgba(122,155,111,0.18)',color:'rgba(245,239,224,0.6)',fontSize:'11px',fontFamily:'monospace',borderRadius:'2px'}}>
                {c}
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
