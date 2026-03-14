const T = [
  {q:'We posted Tuesday and had three bids by Thursday. Ended up with a crew from Morrisville that was exactly right — local, fair price, great references.',n:'Sarah M.',r:'Homeowner',l:'Stowe, VT',p:'Barn Renovation · $95K'},
  {q:'Alder is different — every lead is a real Vermont project with a real budget. No tire-kickers. We\'ve booked four jobs this season.',n:'Doug K.',r:'General Contractor',l:'Barre, VT',p:'Member since 2023'},
  {q:'Alder matched us with a contractor who had actually built net-zero before. That specificity was everything.',n:'Priya & Tom R.',r:'Homeowners',l:'Woodstock, VT',p:'New Construction · $520K'},
]
export default function Testimonials() {
  return (
    <section className="py-28 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 reveal">
          <span className="text-[#C8732A] text-xs font-mono uppercase tracking-widest">From Vermont Builders & Owners</span>
          <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#1C2B1A] font-semibold">Real projects.<br/><em>Real results.</em></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {T.map((t, i) => (
            <div key={t.n} className="reveal bg-white border border-[#1C2B1A]/08 p-7 rounded-sm hover:shadow-lg transition-shadow flex flex-col" style={{transitionDelay:`${i*100}ms`}}>
              <div className="font-display text-6xl text-[#C8732A]/20 leading-none mb-2 select-none">“</div>
              <p className="text-[#3D4A3A] text-sm leading-relaxed flex-1 mb-6">{t.q}</p>
              <div className="border-t border-[#1C2B1A]/08 pt-5 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#1C2B1A] text-sm">{t.n}</p>
                  <p className="text-[#8C8070] text-xs mt-0.5">{t.r} · {t.l}</p>
                </div>
                <span className="text-xs font-mono text-[#C8732A] bg-[#C8732A]/08 px-2 py-1 rounded-sm">{t.p}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
