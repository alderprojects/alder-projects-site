export default function HowItWorks() {
  const steps = [
    {n:'01',t:'Post Your Project',b:'Describe your build — scope, timeline, location. Under 5 minutes. No account required.'},
    {n:'02',t:'We Match You',b:'Our system routes your project to vetted Vermont contractors who specialize in your work.'},
    {n:'03',t:'Get Qualified Bids',b:'Receive bids from 2–4 matched contractors. Compare credentials and pricing transparently.'},
    {n:'04',t:'Build with Confidence',b:'Choose your contractor, sign a contract, and break ground — Vermont Builder Guarantee.'},
  ]
  return (
    <section id="how-it-works" className="py-28 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16 reveal">
          <span className="text-[#C8732A] text-xs font-mono uppercase tracking-widest">How It Works</span>
          <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#1C2B1A] font-semibold">From idea to<br/>bid in days,<br/><em>not weeks.</em></h2>
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
        <div className="mt-16 reveal flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#1C2B1A] px-8 py-7 rounded-sm">
          <p className="font-display text-2xl text-[#F5EFE0] font-medium italic">Ready to find your contractor?</p>
          <a href="#submit-project" className="shrink-0 px-7 py-3.5 bg-[#C8732A] hover:bg-[#A84E1A] text-[#FAF7F2] text-sm font-semibold rounded-sm">Post a Project Free →</a>
        </div>
      </div>
    </section>
  )
}
