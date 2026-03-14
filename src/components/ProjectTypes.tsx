const PT = [
  {t:'New Home Construction',d:'Ground-up builds for custom homes, spec homes, and ADUs.',tag:'Most Common'},
  {t:'Renovations & Remodels',d:'Kitchen, bath, basement, whole-home renovations.',tag:null},
  {t:'Additions & Expansions',d:'Add square footage — sunrooms, garages, second stories.',tag:null},
  {t:'Commercial Build-Out',d:'Office, retail, restaurant, and light industrial.',tag:null},
  {t:'Roofing & Weatherization',d:'Roof replacement, insulation, windows — critical in VT.',tag:'Seasonal'},
  {t:'Decks & Outdoor',d:'Decks, porches, patios, fences, and outdoor structures.',tag:null},
  {t:'Plumbing & HVAC',d:'Heating systems, radiant floor, plumbing and finish.',tag:null},
  {t:'Electrical',d:'Panel upgrades, wiring, EV chargers, solar-ready prep.',tag:'High Demand'},
]
export default function ProjectTypes() {
  return (
    <section id="project-types" className="py-28 bg-[#F5EFE0]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 reveal">
          <span className="text-[#C8732A] text-xs font-mono uppercase tracking-widest">What We Match</span>
          <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#1C2B1A] font-semibold">Every kind of<br/>Vermont build.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PT.map((p, i) => (
            <div key={p.t} className="reveal bg-[#FAF7F2] hover:bg-[#1C2B1A] group p-6 rounded-sm border border-[#1C2B1A]/10 hover:border-transparent transition-all duration-300" style={{transitionDelay:`${i*50}ms`}}>
              <h3 className="font-display text-lg font-semibold text-[#1C2B1A] group-hover:text-[#F5EFE0] transition-colors mb-2">{p.t}</h3>
              {p.tag && <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#C8732A]/15 text-[#C8732A] rounded-full">{p.tag}</span>}
              <p className="text-[#3D4A3A]/60 group-hover:text-[#F5EFE0]/60 text-sm leading-relaxed transition-colors mt-2">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
