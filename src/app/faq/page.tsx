import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ | Alder Projects — Vermont Home Renovation',
  description: 'Common questions about Alder Projects — how project matching works, what contractors are approved, costs, and how we differ from lead platforms.',
  alternates: { canonical: 'https://alderprojects.com/faq' },
}

const homeownerFaqs = [
  { q: 'What happens after I submit a project?', a: "We review your submission and match it to Vermont contractors who specialize in your work and serve your area. You'll hear from us by email within 1–2 business days. Your contact info stays private until you choose a contractor." },
  { q: 'Is it really free to post?', a: "Yes. There's no charge to submit a project, no account required, and no obligation to hire anyone." },
  { q: 'How many contractors will contact me?', a: "We don't send your project to every contractor on the platform. A small, matched set of local contractors sees your request — no flood of calls from people you didn't ask to hear from." },
  { q: 'Do I have to hire someone?', a: "No. Submitting a project doesn't commit you to anything. You decide whether to move forward, and when." },
  { q: "What if I'm not ready to start yet?", a: "Submit with your honest timeline — even 'planning phase, 12+ months out' is fine. We'll match you with contractors who take planning-stage clients. Or use our planning guide to work through scope and budget first." },
  { q: 'Are the contractors licensed and insured?', a: "We only work with Vermont-based contractors. Every application is reviewed — we check trade, location, and insurance coverage before approving anyone onto the platform." },
  { q: 'What kinds of projects do you match?', a: "Kitchens, bathrooms, decks, additions, roofing, electrical, plumbing, HVAC, painting, basement finishing — any residential renovation across all 14 Vermont counties." },
  { q: 'How is this different from Angi or HomeAdvisor?', a: "We review every project before routing it. You're not entered into an auction. A small matched set of local contractors sees your request — not a national platform's entire database bidding for your click." },
  { q: 'Will I get phone calls from contractors?', a: "We follow up by email, not phone. Contractors receive your contact details only after they've accepted your project request — you won't get unsolicited calls." },
  { q: 'What areas do you cover?', a: "All 14 Vermont counties. Our current contractor density is strongest in Chittenden, Addison, and Lamoille counties." },
]

const contractorFaqs = [
  { q: 'What do I see before deciding to accept a project request?', a: "Project type, town, scope description, and budget range. Full contact details — name, email, phone — are only released when you accept." },
  { q: 'What does a project request cost?', a: "A flat fee only when you accept. No subscription, no monthly minimum, no fee for requests you decline. Your first three project requests are free during our launch period." },
  { q: 'How are homeowners screened before a request reaches me?', a: "Every submission is reviewed manually before it reaches any contractor. We filter out vague descriptions, clearly out-of-scope budgets, and low-quality requests." },
  { q: 'Do I have to respond to every request?', a: "No. Each request is your call. There's no penalty for declining, and no minimum number of requests you're required to take." },
  { q: 'How many contractors see the same request?', a: "We don't auction requests. A small, matched set of contractors — typically 2–3 — sees each project request based on trade and service area alignment." },
  { q: 'Can I update my trade or service area after applying?', a: "Yes. Email hello@alderprojects.com and we'll update your profile same day." },
  { q: 'How is this different from Angi or HomeAdvisor?', a: "You see project details before paying for anything. We don't sell the same request to your entire competition simultaneously. And there's no monthly subscription whether or not you take any work." },
  { q: "What happens if a homeowner doesn't respond after I accept?", a: "We're building a review process for unresponsive homeowners. For now, we monitor request quality manually and flag patterns. Contact us if you accept a request and don't hear back within 48 hours." },
]

export default function FaqPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      <header style={{ backgroundColor: '#0D1A0B', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(122,155,111,0.12)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F" />
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A" />
          </svg>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '18px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
        <Link href="/" style={{ fontSize: '12px', color: 'rgba(245,239,224,0.4)', fontFamily: 'monospace', textDecoration: 'none' }}>&larr; Back to home</Link>
      </header>

      <div style={{ backgroundColor: '#0D1A0B', padding: 'clamp(48px,8vw,72px) 24px', borderBottom: '1px solid rgba(122,155,111,0.12)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A9B6F' }}>FAQ</span>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginTop: '10px', marginBottom: '14px' }}>Common questions.</h1>
          <p style={{ color: 'rgba(245,239,224,0.5)', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
            For homeowners and contractors. If something isn&apos;t answered here, email hello@alderprojects.com.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(48px,6vw,72px) 24px 80px' }}>
        <div style={{ marginBottom: '64px' }}>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8732A', border: '1px solid rgba(200,115,42,0.3)', padding: '4px 10px', borderRadius: '2px' }}>Homeowners</span>
          </div>
          {homeownerFaqs.map((faq, i) => (
            <div key={i} style={{ borderTop: '1px solid rgba(28,43,26,0.08)', padding: '20px 0' }}>
              <h2 style={{ fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: '15px', fontWeight: 600, color: '#1C2B1A', marginBottom: '8px' }}>{faq.q}</h2>
              <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.65)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
          <div style={{ marginTop: '32px', padding: '20px 24px', backgroundColor: '#1C2B1A', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: 'rgba(245,239,224,0.65)', fontSize: '14px', margin: 0 }}>Ready to post your project?</p>
            <Link href="/#submit-project" style={{ fontSize: '13px', fontFamily: 'monospace', color: '#C8732A', textDecoration: 'none' }}>Post a project request &rarr;</Link>
          </div>
        </div>

        <div>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F', border: '1px solid rgba(122,155,111,0.3)', padding: '4px 10px', borderRadius: '2px' }}>Contractors</span>
          </div>
          {contractorFaqs.map((faq, i) => (
            <div key={i} style={{ borderTop: '1px solid rgba(28,43,26,0.08)', padding: '20px 0' }}>
              <h2 style={{ fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: '15px', fontWeight: 600, color: '#1C2B1A', marginBottom: '8px' }}>{faq.q}</h2>
              <p style={{ fontSize: '14px', color: 'rgba(28,43,26,0.65)', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
          <div style={{ marginTop: '32px', padding: '20px 24px', backgroundColor: '#1C2B1A', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: 'rgba(245,239,224,0.65)', fontSize: '14px', margin: 0 }}>Ready to apply?</p>
            <Link href="/contractors" style={{ fontSize: '13px', fontFamily: 'monospace', color: '#7A9B6F', textDecoration: 'none' }}>Apply to join &rarr;</Link>
          </div>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(28,43,26,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.45)', fontFamily: 'monospace' }}>
            Something not answered here?{' '}
            <a href="mailto:hello@alderprojects.com" style={{ color: '#C8732A', textDecoration: 'none' }}>hello@alderprojects.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}