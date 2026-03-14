'use client'
import { useEffect, useRef } from 'react'

const VT = ['Addison','Bennington','Caledonia','Chittenden','Essex','Franklin','Grand Isle','Lamoille','Orange','Orleans','Rutland','Washington','Windham','Windsor']

export default function Hero() {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.style.opacity = '0'; el.style.transform = 'translateY(32px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .9s ease-out,transform .9s ease-out'
      el.style.opacity = '1'; el.style.transform = 'none'
    })
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Vermont autumn landscape — Unsplash free license, photo by Caleb Minear */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{backgroundImage:"url('https://images.unsplash.com/photo-1572985025058-0e31c9d50e8f?auto=format&fit=crop&w=1920&q=80')"}}
      />
      {/* Dark forest green overlay */}
      <div className="absolute inset-0 bg-[#1C2B1A]/78" />
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C8732A] to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#7A9B6F]/40 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-[#7A9B6F] animate-pulse" />
            <span className="text-[#7A9B6F] text-xs font-mono tracking-widest uppercase">Vermont’s Build Network</span>
          </div>
          <h1 ref={ref} className="text-[#F5EFE0] text-5xl md:text-6xl lg:text-7xl font-display font-semibold mb-6 leading-[1.05]">
            Match your<br/><em className="text-[#C8732A] not-italic">project</em> with<br/>the right<br/>contractor.
          </h1>
          <p className="text-[#F5EFE0]/70 text-lg font-light leading-relaxed mb-10">
            Alder Projects connects Vermont homeowners and developers with vetted local contractors — people who know these roads, these winters, and these communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#submit-project" className="px-7 py-4 bg-[#C8732A] hover:bg-[#A84E1A] text-[#FAF7F2] font-semibold text-sm rounded-sm transition-all text-center">
              Post Your Project →
            </a>
            <a href="#for-contractors" className="px-7 py-4 border border-[#7A9B6F]/50 text-[#F5EFE0]/70 hover:text-[#F5EFE0] hover:border-[#7A9B6F] font-medium text-sm rounded-sm transition-all text-center">
              I’m a Contractor
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="bg-[#1C2B1A]/60 backdrop-blur-sm border border-[#7A9B6F]/20 rounded-sm p-5">
            <p className="text-[#7A9B6F] text-xs font-mono uppercase tracking-widest mb-3">All 14 Vermont Counties</p>
            <div className="flex flex-wrap gap-2">
              {VT.map(c => (
                <span key={c} className="px-2.5 py-1 bg-[#1C2B1A]/60 border border-[#7A9B6F]/25 text-[#F5EFE0]/60 text-xs rounded-sm font-mono">{c}</span>
              ))}
            </div>
          </div>
          <p className="text-[#F5EFE0]/30 text-xs font-mono text-right">Licensed · Insured · Vermont-based</p>
        </div>
      </div>
    </section>
  )
}
