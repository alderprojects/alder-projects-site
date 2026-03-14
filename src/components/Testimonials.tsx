export default function Testimonials() {
  return (
    <section className="py-28 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 reveal">
          <span className="text-[#C8732A] text-xs font-mono uppercase tracking-widest">From Vermont Builders &amp; Owners</span>
          <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#1C2B1A] font-semibold">
            Real projects.<br/><em>Real results.</em>
          </h2>
          <p className="mt-4 text-[#3D4A3A]/60 text-lg max-w-xl leading-relaxed">
            We’re just getting started in Vermont’s communities. Reviews will appear here as real projects get matched and completed — no made-up stories.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {['Chittenden County','Washington County','Windsor County'].map((county) => (
            <div key={county} className="reveal bg-white border-2 border-dashed border-[#1C2B1A]/12 p-8 rounded-sm flex flex-col items-center justify-center text-center min-h-[200px] hover:border-[#C8732A]/30 transition-colors duration-300">
              <div className="w-10 h-10 rounded-full bg-[#7A9B6F]/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F" opacity="0.4"/>
                </svg>
              </div>
              <p className="font-display text-lg text-[#1C2B1A] font-semibold mb-1">{county}</p>
              <p className="text-[#8C8070] text-sm font-mono">First review coming soon</p>
            </div>
          ))}
        </div>
        <div className="mt-12 reveal text-center">
          <p className="text-[#3D4A3A]/50 text-sm font-mono">
            Worked with us? We’d love to hear how it went. 
            <a href="mailto:hello@alderprojects.com" className="text-[#C8732A] underline underline-offset-4 hover:text-[#A84E1A] transition-colors">
              Share your experience
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
