'use client'
import { useState } from 'react'
import Link from 'next/link'

const PROJECTS = [
  { id: 'kitchen', label: 'Kitchen Remodel', bswHref: '/guides/kitchen-refresh-buy-skip-wait', bswLabel: 'Kitchen Buy/Skip/Wait guide', scopes: [
    { id: 'refresh', label: 'Minor refresh (counters, hardware, paint)', low: 8000, high: 20000 },
    { id: 'mid', label: 'Mid-range (new cabinets, layout changes)', low: 25000, high: 55000 },
    { id: 'full', label: 'Full gut renovation (custom, structural)', low: 60000, high: 120000 },
  ]},
  { id: 'bathroom', label: 'Bathroom Remodel', bswHref: '/guides/vermont-home-project-cost-reality-2026', bswLabel: 'Vermont cost reality', scopes: [
    { id: 'refresh', label: 'Minor refresh (fixtures, vanity, paint)', low: 5000, high: 12000 },
    { id: 'mid', label: 'Mid-range (tile, new shower, layout)', low: 12000, high: 28000 },
    { id: 'full', label: 'Full gut renovation (custom tile, radiant)', low: 25000, high: 55000 },
  ]},
  { id: 'deck', label: 'Deck / Porch', bswHref: '/guides/lake-season-buy-skip-wait', bswLabel: 'Outdoor Buy/Skip/Wait guide', scopes: [
    { id: 'small', label: 'Small deck (under 200 sq ft, PT wood)', low: 8000, high: 15000 },
    { id: 'mid', label: 'Mid-size deck (200–400 sq ft, composite)', low: 15000, high: 32000 },
    { id: 'large', label: 'Large / multi-level with features', low: 30000, high: 65000 },
  ]},
  { id: 'basement', label: 'Basement Finishing', bswHref: '/guides/basement-buy-skip-wait', bswLabel: 'Basement Buy/Skip/Wait guide', scopes: [
    { id: 'basic', label: 'Basic finish (drywall, flooring, lighting)', low: 15000, high: 28000 },
    { id: 'full', label: 'Full finish (bedroom, bath, kitchenette)', low: 30000, high: 65000 },
  ]},
  { id: 'addition', label: 'Home Addition', bswHref: '/guides/vermont-home-project-cost-reality-2026', bswLabel: 'Vermont cost reality', scopes: [
    { id: 'small', label: 'Small addition (mudroom, sunroom, under 300 sq ft)', low: 60000, high: 120000 },
    { id: 'mid', label: 'Primary suite or garage conversion', low: 100000, high: 200000 },
    { id: 'large', label: 'Major addition (500+ sq ft, structural)', low: 180000, high: 400000 },
  ]},
  { id: 'roofing', label: 'Roofing', bswHref: '/guides/vermont-home-project-cost-reality-2026', bswLabel: 'Vermont cost reality', scopes: [
    { id: 'asphalt', label: 'Asphalt shingle replacement', low: 8000, high: 18000 },
    { id: 'metal', label: 'Metal roofing', low: 14000, high: 35000 },
    { id: 'repair', label: 'Partial repair / sections only', low: 2500, high: 8000 },
  ]},
  { id: 'painting', label: 'Painting', bswHref: '/guides/best-paint-stores-in-vermont', bswLabel: 'Best Vermont paint stores', scopes: [
    { id: 'interior', label: 'Interior — full home', low: 3500, high: 8000 },
    { id: 'exterior', label: 'Exterior repaint', low: 3000, high: 9000 },
    { id: 'both', label: 'Interior + exterior', low: 6000, high: 16000 },
  ]},
  { id: 'windows', label: 'Window Replacement', bswHref: '/guides/windows-buy-skip-wait', bswLabel: 'Windows Buy/Skip/Wait guide', scopes: [
    { id: 'few', label: '1–5 windows', low: 1500, high: 4500 },
    { id: 'several', label: '6–12 windows', low: 4000, high: 10000 },
    { id: 'full', label: 'Full home (13+ windows)', low: 8000, high: 22000 },
  ]},
]

const LOCS: Record<string, { label: string; mult: number }> = {
  burlington: { label: 'Burlington / South Burlington', mult: 1.0 },
  chittenden: { label: 'Chittenden County suburbs', mult: 0.97 },
  stowe: { label: 'Stowe / Lamoille County', mult: 1.05 },
  middlebury: { label: 'Middlebury / Addison County', mult: 0.93 },
  rural: { label: 'Rural / small town Vermont', mult: 0.88 },
  other: { label: 'Other Vermont location', mult: 0.95 },
}

function fmt(n: number): string {
  return '$' + (Math.round(n / 500) * 500).toLocaleString()
}

export default function Calculator() {
  const [projectId, setProjectId] = useState('')
  const [scopeId, setScopeId] = useState('')
  const [locId, setLocId] = useState('burlington')
  const [contingency, setContingency] = useState(15)

  const project = PROJECTS.find(p => p.id === projectId)
  const scope = project?.scopes.find(s => s.id === scopeId)
  const mult = LOCS[locId]?.mult ?? 1.0

  const baseLow = scope ? Math.round(scope.low * mult) : null
  const baseHigh = scope ? Math.round(scope.high * mult) : null
  const low = baseLow ? Math.round(baseLow * (1 + contingency / 100)) : null
  const high = baseHigh ? Math.round(baseHigh * (1 + contingency / 100)) : null

  const sel: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid rgba(28,43,26,0.18)', borderRadius: '3px', fontSize: '14px', color: '#1C2B1A', backgroundColor: 'white', fontFamily: "'DM Sans',system-ui,sans-serif" }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(28,43,26,0.55)', marginBottom: '8px' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      <header style={{ backgroundColor: '#0D1A0B', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(122,155,111,0.12)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
            <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
          </svg>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '16px', fontWeight: 600, color: '#F5EFE0' }}>Alder Projects</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/guides" style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.5)', textDecoration: 'none' }}>Guides</Link>
          <Link href="/smart-cart" style={{ padding: '7px 16px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '12px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none' }}>Smart Cart $19.99</Link>
        </div>
      </header>

      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,60px) 24px', borderBottom: '1px solid rgba(122,155,111,0.1)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '10px' }}>Cost Calculator</span>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '10px' }}>Vermont Renovation Cost Estimator</h1>
          <p style={{ fontSize: '16px', color: 'rgba(245,239,224,0.6)', lineHeight: 1.7, margin: 0 }}>Real Vermont cost ranges by project type, scope, and location. After estimating, see what to actually buy, skip, and wait on for your project.</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(32px,5vw,56px) 24px 40px' }}>
        <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={lbl}>Project Type</label>
            <select style={sel} value={projectId} onChange={(e) => { setProjectId(e.target.value); setScopeId('') }}>
              <option value="">Select a project...</option>
              {PROJECTS.map(p => (<option key={p.id} value={p.id}>{p.label}</option>))}
            </select>
          </div>

          {project && (
            <div>
              <label style={lbl}>Scope</label>
              <select style={sel} value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
                <option value="">Select scope...</option>
                {project.scopes.map(s => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
            </div>
          )}

          <div>
            <label style={lbl}>Location in Vermont</label>
            <select style={sel} value={locId} onChange={(e) => setLocId(e.target.value)}>
              {Object.entries(LOCS).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
            </select>
          </div>

          <div>
            <label style={lbl}>Contingency: {contingency}% (recommended: 15-20%)</label>
            <input type="range" min="0" max="30" step="5" value={contingency} onChange={(e) => setContingency(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </div>

        {scope && low && high && (
          <div style={{ padding: '24px', backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '4px', marginBottom: '24px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(28,43,26,0.5)', display: 'block', marginBottom: '8px' }}>Estimated Range</span>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 600, color: '#1C2B1A', marginBottom: '6px' }}>{fmt(low)} – {fmt(high)}</div>
            <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.6)', margin: 0, lineHeight: 1.6 }}>Includes {contingency}% contingency. Location-adjusted for {LOCS[locId].label}. Real Vermont quotes typically fall in this range.</p>

            {project?.bswHref && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#FAF7F2', borderRadius: '3px', borderLeft: '3px solid #7A9B6F' }}>
                <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.75)', margin: '0 0 10px 0', lineHeight: 1.55 }}>
                  <strong>Want to spend less of this?</strong> Read {project.bswLabel.toLowerCase()} for what to actually buy, skip, and wait on.
                </p>
                <Link href={project.bswHref + '?utm_source=calculator&utm_medium=tool&utm_campaign=bsw_sidebar'} style={{ fontSize: '13px', color: '#C8732A', textDecoration: 'none', fontWeight: 600 }}>
                  Read the {project.bswLabel} →
                </Link>
              </div>
            )}

            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#1C2B1A', borderRadius: '3px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(245,239,224,0.75)', margin: '0 0 10px 0', lineHeight: 1.55 }}>
                Get a personalized Buy / Skip / Wait list for your specific project — real product picks, dollar amounts saved per skip, buy-timing for each item.
              </p>
              <Link href="/smart-cart?utm_source=calculator&utm_medium=tool&utm_campaign=cta_after_estimate" style={{ display: 'inline-block', padding: '10px 18px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '13px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none' }}>
                Build My Smart Cart — $19.99 →
              </Link>
              <p style={{ fontSize: '11px', color: 'rgba(245,239,224,0.5)', margin: '8px 0 0 0' }}>24-hour full refund.</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px 56px' }}>
        <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '22px', fontWeight: 600, color: '#1C2B1A', marginBottom: '16px' }}>Common Questions About Vermont Renovation Costs</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { q: 'Why are Vermont renovation costs higher than national averages?', a: 'Three structural reasons: lower contractor density per capita (especially outside Chittenden County), shorter exterior work season (May-October), and higher travel time for rural job sites. The labor differential is real and structural, not a markup.' },
            { q: 'What is a typical Vermont contractor deposit?', a: 'Standard 20-33% on signing. Anything over 33% upfront is a yellow flag in Vermont. Vermont law (9 V.S.A. § 4205) requires registered contractors for jobs over $10,000.' },
            { q: 'How long do Vermont renovations take to start?', a: 'Add 4-12 weeks of lead time before start for contractor availability. Kitchens take 6-14 weeks once started; bathrooms 3-6 weeks; basement finishing 6-10 weeks; decks 1-3 weeks; roof replacement 1-4 days; heat pump install 2-5 days.' },
            { q: 'How do I verify a Vermont contractor?', a: 'Vermont Secretary of State professional registry at secure.professionals.vermont.gov verifies active registration (required for jobs over $10K) and shows any disciplinary actions. Vermont Builders & Remodelers Association directory at homebuildersvt.com lists code-of-ethics members.' },
            { q: 'Is it cheaper to renovate in winter?', a: 'For interior work, sometimes. Some contractors discount 5-15% for January-March schedules to fill slow months. Exterior work is rarely cheaper in winter because most exterior contractors do not work then, so supply is not there to discount.' },
            { q: 'How accurate is this estimator?', a: 'Ranges are based on Vermont quotes from 2025-2026, adjusted by location. Real quotes typically fall within the displayed range 80%+ of the time. Outliers happen — historic restoration, structural surprises, lakefront builds — and those tend to be above the high end.' },
            { q: 'Should I add a contingency to my budget?', a: 'Yes. 15-20% is standard for cosmetic and mid-range projects. 20-25% for older homes or full renovations. Vermont homes often surprise contractors during demo with hidden issues — knob-and-tube wiring, asbestos, settled framing — that drive cost overruns.' },
          ].map((f, i) => (
            <details key={i} style={{ padding: '16px', backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '3px' }}>
              <summary style={{ fontWeight: 600, color: '#1C2B1A', cursor: 'pointer', fontSize: '14px' }}>{f.q}</summary>
              <p style={{ marginTop: '10px', fontSize: '13px', color: 'rgba(28,43,26,0.7)', lineHeight: 1.65, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <footer style={{ backgroundColor: '#1C2B1A', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.3)', margin: 0 }}>© {new Date().getFullYear()} Alder Projects LLC · Vermont</p>
      </footer>
    </div>
  )
}
