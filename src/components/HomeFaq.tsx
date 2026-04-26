export default function HomeFaq() {
  const faqs = [
    { q: 'What happens after I submit?', a: "Someone here actually reads what you wrote. We pull a few contractors who do this kind of work in your town and email you their info in a couple days. That's it." },
    { q: 'Is it really free to post?', a: "Yeah, free. No account, no hidden fees, no obligation. Contractors pay us when they take your job — that's our model." },
    { q: 'How many contractors will contact me?', a: "Two or three. Not the 17-call avalanche you get from Angi." },
    { q: 'Do I have to hire someone?', a: "Nope. If their bids are too high, the timing's wrong, or you change your mind — walk away. No charge." },
    { q: "What if I'm not ready yet?", a: "That's fine. Use the cost calculator and the guides to figure out roughly what you're looking at, then come back. Or post now and tell us 'spring 2027' — we'll keep it on file." },
    { q: 'Are the contractors licensed and insured?', a: "Yes. Every contractor we work with is Vermont-based, and we check their license and insurance before letting them in. We talk to them — not just check their LinkedIn." },
    { q: 'What kinds of projects do you match?', a: "Kitchens, bathrooms, decks, additions, roofing, plumbing, HVAC, electrical, paint, basements — basically any residential project, anywhere in the state." },
    { q: 'How is this different from Angi?', a: "Angi sells your phone number to ten contractors who buy leads in bulk. We don't. Your info goes to two or three Vermont contractors we know. They call you, you call them. That's the whole transaction." },
  ]
  return (
    <section style={{ backgroundColor: '#FAF7F2', padding: 'clamp(56px,8vw,96px) 24px', borderTop: '1px solid rgba(28,43,26,0.08)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C8732A' }}>Common Questions</span>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 600, color: '#1C2B1A', lineHeight: 1.1, marginTop: '10px', marginBottom: 0 }}>
            Stuff people ask.
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
