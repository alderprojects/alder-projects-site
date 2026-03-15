'use client'
import { useEffect, useRef } from 'react'

const COUNTIES = [
  'Addison','Bennington','Caledonia','Chittenden','Essex',
  'Franklin','Grand Isle','Lamoille','Orange','Orleans',
  'Rutland','Washington','Windham','Windsor',
]

const S = {
  section: { position:'relative' as const, minHeight:'100vh', display:'flex', flexDirection:'column' as const, justifyContent:'center', overflow:'hidden' },
  photoBg: { position:'absolute' as const, inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1920&q=80')", backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat' },
  overlay: { position:'absolute' as const, inset:0, backgroundColor:'rgba(18,32,16,0.78)' },
  inner: { position:'relative' as const, zIndex:10, maxWidth:'1152px', margin:'0 auto', padding:'clamp(100px,12vw,130px) 24px clamp(60px,8vw,96px)', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'48px', alignItems:'center' },
  badge: { display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 12px', border:'1px solid rgba(122,155,111,0.4)', borderRadius:'999px', marginBottom:'28px' },
  dot: { width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#7A9B6F' },
  badgeText: { fontSize:'11px', fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#7A9B6F' },
  h1: { fontFamily:"'Playfair Display',Georgia,serif", fontWeight:600, fontSize:'clamp(2rem,4.5vw,3.2rem)', lineHeight:1.12, letterSpacing:'-0.02em', color:'#F5EFE0', marginBottom:'20px' },
  em: { color:'#C8732A', fontStyle:'normal' },
  p: { fontSize:'17px', fontWeight:300, lineHeight:1.7, color:'rgba(245,239,224,0.72)', maxWidth:'460px', marginBottom:'36px' },
  btnPrimary: { display:'inline-block', padding:'14px 28px', backgroundColor:'#C8732A', color:'#FAF7F2', fontWeight:600, fontSize:'14px', borderRadius:'2px', textDecoration:'none', marginRight:'12px', marginBottom:'12px' },
  btnSecondary: { display:'inline-block', padding:'14px 28px', border:'1px solid rgba(122,155,111,0.5)', color:'rgba(245,239,224,0.75)', fontWeight:500, fontSize:'14px', borderRadius:'2px', textDecoration:'none', marginBottom:'12px' },
  trustLine: { fontSize:'11px', fontFamily:'monospace', color:'rgba(245,239,224,0.25)', marginTop:'24px' },
  card: { backgroundColor:'rgba(18,32,16,0.65)', border:'1px solid rgba(122,155,111,0.2)', borderRadius:'2px', padding:'20px', backdropFilter:'blur(8px)' },
  cardLabel: { fontSize:'11px', fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#7A9B6F', marginBottom:'14px' },
  countyTag: { display:'inline-block', padding:'4px 10px', margin:'3px', backgroundColor:'rgba(18,32,16,0.7)', border:'1px solid rgba(122,155,111,0.25)', color:'rgba(245,239,224,0.65)', fontSize:'11px', fontFamily:'monospace', borderRadius:'2px' },
  statsRow: { display:'flex', gap:'16px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(122,155,111,0.15)' },
  statItem: { flex:1, textAlign:'center' as const },
  statNum: { fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:'22px', color:'#C8732A' },
  statLabel: { fontSize:'10px', fontFamily:'monospace', color:'rgba(245,239,224,0.4)', marginTop:'2px', lineHeight:1.3 },
}

export default function Hero() {
  const headRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const el = headRef.current
    if (!el) return
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.8s ease-out,transform 0.8s ease-out'
      el.style.opacity = '1'; el.style.transform = 'none'
    })
  }, [])

  return (
    <section style={S.section}>
      {/* Vermont autumn forest — Unsplash free license */}
      <div style={S.photoBg} />
      <div style={S.overlay} />
      {/* Amber left accent */}
      <div style={{position:'absolute',top:0,left:0,width:'3px',height:'100%',background:'linear-gradient(to bottom,#C8732A,transparent)'}} />

      <div style={S.inner}>
        <div>
          <div style={S.badge}>
            <span style={S.dot} />
            <span style={S.badgeText}>Vermont&apos;s Construction Network</span>
          </div>
          <h1 ref={headRef} style={S.h1}>
            Find the right contractor<br/>
            for your <em style={S.em}>Vermont</em> build.
          </h1>
          <p style={S.p}>
            Alder Projects connects homeowners and developers across all 14 Vermont
            counties with vetted local contractors who know the terrain, the towns,
            and the work.
          </p>
          <div>
            <a href="#submit-project" style={S.btnPrimary}>Post Your Project &rarr;</a>
            <a href="#for-contractors" style={S.btnSecondary}>I&apos;m a Contractor</a>
          </div>
          <p style={S.trustLine}>Licensed &middot; Insured &middot; Vermont-based contractors only</p>
        </div>

        <div style={S.card}>
          <p style={S.cardLabel}>Coverage &mdash; All 14 Counties</p>
          <div>{COUNTIES.map(c => <span key={c} style={S.countyTag}>{c}</span>)}</div>
          <div style={S.statsRow}>
            {[{n:'14',l:'Counties'},{n:'Free',l:'To Post'},{n:'48hr',l:'Avg Match'}].map(s => (
              <div key={s.l} style={S.statItem}>
                <div style={S.statNum}>{s.n}</div>
                <div style={S.statLabel}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
