const B = [
  {t:'Qualified Leads Only',d:'Pre-screened projects matching your trade, area, and capacity.'},
  {t:'No Subscription Fees',d:'Pay only when you win. We grow when you grow.'},
  {t:'Vermont-First Network',d:'Built exclusively for Vermont contractors — no out-of-state competition.'},
  {t:'Your Profile Does the Work',d:'Build a verified profile once. Let homeowners find you year-round.'},
]
export default function ForContractors() {
  return (
    <section id="for-contractors" className="py-28 bg-[#1C2B1A]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <span className="text-[#7A9B6F] text-xs font-mono uppercase tracking-widest">For Contractors</span>
            <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#F5EFE0] font-semibold leading-[1.05]">Your pipeline,<br/><em className="text-[#C8732A]">filled.</em></h2>
            <p className="mt-6 text-[#F5EFE0]/50 text-lg font-light leading-relaxed">Stop chasing referrals. Get vetted Vermont project leads that match your specialty.</p>
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
            <a href="#contractor-signup" className="mt-10 inline-flex items-center gap-2 px-7 py-4 border border-[#7A9B6F] hover:bg-[#7A9B6F] text-[#F5EFE0] font-semibold text-sm rounded-sm transition-all">Apply to Join the Network →</a>
          </div>
          <div className="reveal bg-[#2D4A2A]/50 border border-[#7A9B6F]/25 rounded-sm p-7">
            <h4 className="text-[#F5EFE0] font-display text-xl font-semibold mb-2">Green Mountain Builds</h4>
            <p className="text-[#7A9B6F] text-sm mb-5">Burlington, VT · Est. 2011 · Verified ✓</p>
            <div className="bg-[#C8732A]/10 border border-[#C8732A]/30 rounded-sm p-4">
              <p className="text-[#C8732A] text-sm font-semibold">New Lead Match</p>
              <p className="text-[#F5EFE0]/50 text-xs mt-0.5">2,400 sq ft addition · Stowe, VT · Est. $180K</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
