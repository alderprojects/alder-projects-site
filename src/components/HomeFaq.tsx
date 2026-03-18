export default function HomeFaq() {
  const faqs = [
    { q: 'What happens after I submit a project?', a: "We review your submission and match it to Vermont contractors who specialize in your work and serve your area. You'll hear from us by email within 1–2 business days." },
    { q: 'Is it really free to post?', a: "Yes. There's no charge to submit a project, no account required, and no obligation to hire anyone." },
    { q: 'How many contractors will contact me?', a: "We don't send your project to every contractor on the platform. A small, matched set of local contractors sees your request — no flood of calls from people you didn't ask." },
    { q: 'Do I have to hire someone?', a: "No. Submitting a project doesn't commit you to anything. You decide whether to move forward, and when." },
    { q: "What if I'm not ready yet?", a: "Use our planning guide to work through scope and budget first, then post when you're ready. Or submit now and we'll follow up when the timing works for you." },
    { q: 'Are the contractors licensed and insured?', a: "We only work with Vermont-based contractors. Every application is reviewed — we check trade, location, and insurance coverage before approving anyone." },
    { q: 'What kinds of projects do you match?', a: "Kitchens, bathrooms, decks, additions, roofing, electrical, plumbing, HVAC, painting, basement finishing — any residential renovation across all 14 Vermont counties." },
    { q: 'How is this different from Angi or HomeAdvisor?', a: "We review every project before routing it. You're not entered into an auction. A small matched set of local contractors sees your request — not a national platform's entire database." },
  ]
  return (
    <section style={{ backgroundColor: '#FAF7F2', padding: 'clamp(56px,8vw,96px) 24px', borderTop: '1px solid rgba(28,43,26,0.08)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C8732A' }}>Common Questions</span>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 600, color: '#1C2B1A', lineHeight: 1.1, marginTop: '10px', marginBottom: 0 }}>
            What homeowners ask us.
          </h2>
        </div>
        <div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderTop: '1px solid rgba(28,43,26,0.08)', padding: '20px 0' }}>
              <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '15px', fontWeight: 600, color: '#1C2B1A', margin: '0 0 8px' }}>{faq.q}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.65)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(28,43,26,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.5)', margin: 0 }}>More questions?</p>
          <a href="/faq" style={{ fontSize: '13px', fontFamily: 'monospace', color: '#C8732A', textDecoration: 'none' }}>Full FAQ →</a>
        </div>
      </div>
    </section>
  )
}