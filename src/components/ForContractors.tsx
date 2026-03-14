const B = [
  {t:'Qualified Leads Only',d:'Every project is pre-screened. You only see leads that match your trade, your service area, and your capacity.'},
  {t:'No Subscription Fees',d:'Pay only when you win a job. Our success-based model means we grow when you grow.'},
  {t:'Vermont-First Network',d:'Built exclusively for Vermont contractors. No competing with out-of-state nationals for local work.'},
  {t:'Your Profile Does the Work',d:'Build a verified profile once. Let homeowners in your county find you year-round.'},
]

export default function ForContractors() {
  return (
    <section id="for-contractors" className="py-28 bg-[#1C2B1A] overflow-hidden relative">
      {/* Vermont barn photo — right side */}
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block opacity-20">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=960&q=80')"}}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C2B1A] via-[#1C2B1A]/60 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <span className="text-[#7A9B6F] text-xs font-mono uppercase tracking-widest">For Vermont Contractors</span>
            <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#F5EFE0] font-semibold leading-[1.05]">
              Your pipeline,<br/><em className="text-[#C8732A]">filled.</em>
            </h2>
            <p className="mt-6 text-[#F5EFE0]/50 text-lg font-light leading-relaxed">
              You know these towns. You know the terrain, the permit offices, the weather. Stop chasing referrals and let qualified project leads come to you.
            </p>
            <div className="mt-10 flex flex-col gap-5">
              {B.map((b, i) => (
                <div key={b.t} className="reveal flex gap-4 items-start" style={{transitionDelay:`${i*80}ms`}}>
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[#7A9B6F]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#7A9B6F] text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-[#F5EFE0] font-semibold text-sm">{b.t}</p>
                    <p className="text-[#F5EFE0]/45 text-sm mt-0.5 leading-relaxed">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="mailto:hello@alderprojects.com" className="mt-10 inline-flex items-center gap-2 px-7 py-4 border border-[#7A9B6F] hover:bg-[#7A9B6F] text-[#F5EFE0] font-semibold text-sm rounded-sm transition-all">
              Apply to Join the Network →
            </a>
          </div>

          {/* Vermont landscape photo — visible on mobile, hidden on desktop (decorative) */}
          <div className="reveal lg:hidden rounded-sm overflow-hidden h-64">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=960&q=80"
              alt="Vermont landscape"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
