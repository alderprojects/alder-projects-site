export default function HowItWorks() {
  const steps = [
    {n:'01',t:'Tell Us What You Need',b:'Five minutes. No account. Just what you need done, where, and roughly when.'},
    {n:'02',t:'We Read It',b:'Someone actually reads it — not a bot. We pick a few contractors who do this kind of work in your town.'},
    {n:'03',t:'We Reach Out',b:"Couple days later you'll hear from 2–3 Vermonters. Not 17. Not none. A few real ones."},
    {n:'04',t:'Pick One',b:'Talk to them. Get bids. Pick one. They know Vermont work — frost lines, mud season, all of it.'},
  ]
  return (
    <section id="how-it-works" className="py-28 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16 reveal">
          <span className="text-[#C8732A] text-xs font-mono uppercase tracking-widest">How It Works</span>
          <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#1C2B1A] font-semibold">From idea to<br/>contractor in days,<br/><em>not weeks.</em></h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.n} className={`reveal p-8 border-t-2 ${i===0?'border-[#C8732A]':'border-[#1C2B1A]/10'} hover:border-[#C8732A] transition-all`} style={{transitionDelay:`${i*80}ms`}}>
              <div className="font-mono text-5xl font-bold text-[#1C2B1A]/10 mb-4">{step.n}</div>
              <h3 className="font-display text-xl font-semibold text-[#1C2B1A] mb-3">{step.t}</h3>
              <p className="text-[#3D4A3A]/60 text-sm leading-relaxed">{step.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
