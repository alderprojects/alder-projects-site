'use client'
import Link from 'next/link'

type PTLink = { label: string; href: string }
type PT = { t: string; d: string; img: string; tag: string | null; links: PTLink[] }

const PT: PT[] = [
  { t: "Kitchen Remodel", d: "Cabinets, counters, appliances, layout changes. Vermont's most requested project.", img: "https://plus.unsplash.com/premium_photo-1686090447480-9eef06ce4723?auto=format&fit=crop&w=600&q=80", tag: "Most Requested", links: [{ label: "Cost guide", href: "/guides/how-much-does-kitchen-remodel-cost-vermont" }, { label: "Estimate cost", href: "/calculator" }] },
  { t: "Bathroom Renovation", d: "Full gut-and-replace or targeted upgrades â tile, vanity, shower, fixtures.", img: "https://plus.unsplash.com/premium_photo-1686090446868-92b77789ad08?auto=format&fit=crop&w=600&q=80", tag: null, links: [{ label: "Timeline guide", href: "/guides/how-long-does-bathroom-remodel-take-vermont" }, { label: "Estimate cost", href: "/calculator" }] },
  { t: "Deck & Porch", d: "New builds, replacements, screened porches, and seasonal outdoor structures.", img: "https://images.unsplash.com/photo-1754597215918-b4b1f113ca77?auto=format&fit=crop&w=600&q=80", tag: "Summer Favorite", links: [{ label: "Deck cost guide", href: "/guides/how-much-does-a-deck-cost-vermont" }, { label: "Estimate cost", href: "/calculator" }] },
  { t: "Basement Finishing", d: "Convert unfinished space to living area, home office, or or apartment.", img: "https://images.unsplash.com/photo-1646592491741-e79ae5953486?auto=format&fit=crop&w=600&q=80", tag: null, links: [{ label: "Estimate cost", href: "/calculator" }] },
  { t: "Room Addition", d: "Bump-outs, sunrooms, mudrooms, and garage conversions.", img: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=600&q=80", tag: null, links: [{ label: "Permit guide", href: "/guides/vermont-renovation-permit-guide" }, { label: "Estimate cost", href: "/calculator" }] },
  { t: "Roofing & Weatherization", d: "Roof replacement, insulation, windows, and weatherproofing â critical in Vermont.", img: "https://plus.unsplash.com/premium_photo-1686090449192-4ab1d00cb735?auto=format&fit=crop&w=600&q=80", tag: "Seasonal", links: [{ label: "Roof cost guide", href: "/guides/how-much-does-roof-replacement-cost-vermont" }, { label: "Estimate cost", href: "/calculator" }] },
  { t: "Plumbing & HVAC", d: "Heating systems, radiant floor, boiler upgrades, and plumbing repairs.", img: "https://plus.unsplash.com/premium_photo-1664298589198-b15ff5382648?auto=format&fit=crop&w=600&q=80", tag: null, links: [{ label: "HVAC contractors", href: "/hvac-contractors-vermont" }, { label: "Plumbing contractors", href: "/plumbing-contractors-vermont" }] },
  { t: "Electrical", d: "Panel upgrades, wiring, EV chargers, and solar-ready prep.", img: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80", tag: "High Demand", links: [{ label: "Electrical contractors", href: "/electrical-contractors-vermont" }, { label: "Estimate cost", href: "/calculator" }] },
]

export default function ProjectTypes() {
  return (
    <section id="project-types" style={{ padding: 'clamp(56px,8vw,96px) 24px', backgroundColor: '#F5EFE0' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C8732A' }}>What We Match</span>
          <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 600, color: '#1C2B1A', lineHeight: 1.1, marginTop: '10px' }}>
            Every kind of<br/><em style={{ fontStyle: 'normal', color: '#C8732A' }}>Vermont renovation.</em>
          </h2>
          <p style={{ color: 'rgba(28,43,26,0.5)', fontSize: '16px', marginTop: '12px', maxWidth: '520px', lineHeight: 1.6 }}>
            Click any project type to get started. Not sure yet? Use the guides and cost calculator.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px' }}>
          {PT.map((p) => (
            <div key={p.t}
              style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(28,43,26,0.08)', transition: 'transform 0.2s,box-shadow 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 32px rgba(28,43,26,0.12)'; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
            >
              <a href="#submit-project" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ height: '170px', overflow: 'hidden', position: 'relative', backgroundColor: '#e8e0d4' }}>
                  <img src={p.img} alt={p.t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  {p.tag && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#C8732A', color: 'white', fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '2px' }}>
                      {p.tag}
                    </span>
                  )}
                </div>
                <div style={{ padding: '16px 18px 12px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '16px', fontWeight: 600, color: '#1C2B1A', marginBottom: '6px' }}>{p.t}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.6)', lineHeight: 1.6, margin: 0 }}>{p.d}</p>
                </div>
              </a>
              <div style={{ padding: '8px 18px 14px', borderTop: '1px solid rgba(28,43,26,0.06)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {p.links.map(l => (
                  <Link key={l.href} href={l.href} style={{ fontSize: '11px', fontFamily: 'monospace', color: '#C8732A', textDecoration: 'none' }}>
                    {l.label} &rarr;
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a href="#submit-project" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#1C2B1A', color: '#F5EFE0', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>
            Post Any Project Free &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
