'use client'
import { useEffect, useRef } from 'react'

const VT_COUNTIES = [
  'Addison','Bennington','Caledonia','Chittenden','Essex',
  'Franklin','Grand Isle','Lamoille','Orange','Orleans',
  'Rutland','Washington','Windham','Windsor'
]

export default function Hero() {
  const headRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = headRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out'
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{backgroundColor: '#1C2B1A'}}
    >
      {/* Vermont mountain silhouette — pure SVG, no external deps */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full" style={{height:'320px'}}>
          <path
            fill="#7A9B6F"
            d="M0,320 L0,200 L120,140 L200,170 L300,100 L400,130 L480,60 L560,90 L640,30 L720,70 L800,20 L880,55 L960,10 L1040,50 L1120,80 L1200,40 L1300,90 L1380,150 L1440,130 L1440,320 Z"
          />
          <path
            fill="#2D4A2A"
            d="M0,320 L0,240 L80,200 L160,220 L260,170 L360,190 L440,150 L520,170 L600,130 L700,160 L780,120 L860,145 L940,110 L1060,140 L1140,160 L1240,130 L1340,170 L1440,200 L1440,320 Z"
          />
        </svg>
      </div>

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT: headline + CTA */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{border: '1px solid rgba(122,155,111,0.4)'}}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:'#7A9B6F'}} />
              <span className="text-xs font-mono tracking-widest uppercase" style={{color:'#7A9B6F'}}>
                Vermont’s Construction Network
              </span>
            </div>

            {/* SEO H1 — clear, readable, not oversized */}
            <h1
              ref={headRef}
              className="font-display font-semibold mb-6"
              style={{color:'#F5EFE0', fontSize:'clamp(2.2rem,5vw,3.5rem)', lineHeight:'1.12', letterSpacing:'-0.02em'}}
            >
              Find the right contractor<br/>
              for your Vermont build.
            </h1>

            <p className="text-lg font-light leading-relaxed mb-10" style={{color:'rgba(245,239,224,0.72)', maxWidth:'480px'}}>
              Alder Projects connects homeowners and developers across all 14 Vermont counties with vetted local contractors who know the terrain, the towns, and the work.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#submit-project"
                className="px-7 py-4 font-semibold text-sm rounded-sm transition-all text-center"
                style={{backgroundColor:'#C8732A', color:'#FAF7F2'}}
                onMouseEnter={e=>(e.currentTarget.style.backgroundColor='#A84E1A')}
                onMouseLeave={e=>(e.currentTarget.style.backgroundColor='#C8732A')}
              >
                Post Your Project →
              </a>
              <a
                href="#for-contractors"
                className="px-7 py-4 font-medium text-sm rounded-sm transition-all text-center"
                style={{border:'1px solid rgba(122,155,111,0.5)', color:'rgba(245,239,224,0.75)'}}
              >
                I’m a Contractor
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-8 text-xs font-mono" style={{color:'rgba(245,239,224,0.3)'}}>
              Licensed · Insured · Vermont-based contractors only
            </p>
          </div>

          {/* RIGHT: county coverage card */}
          <div
            className="rounded-sm p-6"
            style={{backgroundColor:'rgba(45,74,42,0.5)', border:'1px solid rgba(122,155,111,0.2)'}}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{color:'#7A9B6F'}}>
              Coverage Area — All 14 Counties
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {VT_COUNTIES.map(c => (
                <span
                  key={c}
                  className="px-2.5 py-1 text-xs rounded-sm font-mono"
                  style={{
                    backgroundColor:'rgba(28,43,26,0.7)',
                    border:'1px solid rgba(122,155,111,0.25)',
                    color:'rgba(245,239,224,0.65)'
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4" style={{borderTop:'1px solid rgba(122,155,111,0.15)'}}>
              {[
                {n:'14', l:'Counties Covered'},
                {n:'Free', l:'To Post a Project'},
                {n:'48hr', l:'Avg. Match Time'},
              ].map(s => (
                <div key={s.l} className="text-center">
                  <div className="font-display font-bold text-xl" style={{color:'#C8732A'}}>{s.n}</div>
                  <div className="text-xs font-mono mt-0.5 leading-tight" style={{color:'rgba(245,239,224,0.4)'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
