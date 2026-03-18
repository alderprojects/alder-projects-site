'use client'
import { useState } from 'react'
import Link from 'next/link'

const PROJECTS = [
  { id: 'kitchen', label: 'Kitchen Remodel', scopes: [
    { id: 'refresh', label: 'Minor refresh (counters, hardware, paint)', low: 8000, high: 20000 },
    { id: 'mid', label: 'Mid-range (new cabinets, layout changes)', low: 25000, high: 55000 },
    { id: 'full', label: 'Full gut renovation (custom, structural)', low: 60000, high: 120000 },
  ]},
  { id: 'bathroom', label: 'Bathroom Remodel', scopes: [
    { id: 'refresh', label: 'Minor refresh (fixtures, vanity, paint)', low: 5000, high: 12000 },
    { id: 'mid', label: 'Mid-range (tile, new shower, layout)', low: 12000, high: 28000 },
    { id: 'full', label: 'Full gut renovation (custom tile, radiant)', low: 25000, high: 55000 },
  ]},
  { id: 'deck', label: 'Deck / Porch', scopes: [
    { id: 'small', label: 'Small deck (under 200 sq ft, PT wood)', low: 8000, high: 15000 },
    { id: 'mid', label: 'Mid-size deck (200–400 sq ft, composite)', low: 15000, high: 32000 },
    { id: 'large', label: 'Large / multi-level with features', low: 30000, high: 65000 },
  ]},
  { id: 'basement', label: 'Basement Finishing', scopes: [
    { id: 'basic', label: 'Basic finish (drywall, flooring, lighting)', low: 15000, high: 28000 },
    { id: 'full', label: 'Full finish (bedroom, bath, kitchenette)', low: 30000, high: 65000 },
  ]},
  { id: 'addition', label: 'Home Addition', scopes: [
    { id: 'small', label: 'Small addition (mudroom, sunroom, under 300 sq ft)', low: 60000, high: 120000 },
    { id: 'mid', label: 'Primary suite or garage conversion', low: 100000, high: 200000 },
    { id: 'large', label: 'Major addition (500+ sq ft, structural)', low: 180000, high: 400000 },
  ]},
  { id: 'roofing', label: 'Roofing', scopes: [
    { id: 'asphalt', label: 'Asphalt shingle replacement', low: 8000, high: 18000 },
    { id: 'metal', label: 'Metal roofing', low: 14000, high: 35000 },
    { id: 'repair', label: 'Partial repair / sections only', low: 2500, high: 8000 },
  ]},
  { id: 'painting', label: 'Painting', scopes: [
    { id: 'interior', label: 'Interior — full home', low: 3500, high: 8000 },
    { id: 'exterior', label: 'Exterior repaint', low: 3000, high: 9000 },
    { id: 'both', label: 'Interior + exterior', low: 6000, high: 16000 },
  ]},
  { id: 'windows', label: 'Window Replacement', scopes: [
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
        <Link href="/#submit-project" style={{ padding: '7px 16px', backgroundColor: '#C8732A', color: '#FAF7F2', fontSize: '12px', fontWeight: 600, borderRadius: '2px', textDecoration: 'none' }}>Post a Project</Link>
      </header>

      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(40px,6vw,60px) 24px', borderBottom: '1px solid rgba(122,155,111,0.1)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '10px' }}>Cost Calculator</span>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '10px' }}>Vermont Renovation Cost Estimator</h1>
          <p style={{ fontSize: '16px', color: 'rgba(245,239,224,0.6)', lineHeight: 1.7, margin: 0 }}>Real Vermont cost ranges by project type, scope, and location. With a contingency buffer for the surprises Vermont homes tend to produce.</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(40px,6vw,60px) 24px 80px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '4px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={lbl}>Project type</label>
              <select style={sel} value={projectId} onChange={e => { setProjectId(e.target.value); setScopeId('') }}>
                <option value="">Select a project...</option>
                {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Scope</label>
              <select style={sel} value={scopeId} onChange={e => setScopeId(e.target.value)} disabled={!projectId}>
                <option value="">Select scope...</option>
                {project?.scopes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px' }}>
            <div>
              <label style={lbl}>Location in Vermont</label>
              <select style={sel} value={locId} onChange={e => setLocId(e.target.value)}>
                {Object.entries(LOCS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Contingency buffer: {contingency}%</label>
              <div style={{ paddingTop: '8px' }}>
                <input type="range" min={0} max={30} value={contingency}
                  onChange={e => setContingency(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#C8732A' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.4)', marginTop: '4px' }}>
                  <span>0%</span><span>15% recommended</span><span>30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(low != null && high != null && baseLow != null && baseHigh != null) ? (
          <>
            <div style={{ backgroundColor: '#1C2B1A', borderRadius: '4px', padding: '28px 32px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: 'rgba(245,239,224,0.4)', marginBottom: '8px' }}>Estimated total range (with {contingency}% contingency)</p>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 600, color: '#F5EFE0', margin: '0 0 20px' }}>{fmt(low)} – {fmt(high)}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(122,155,111,0.15)' }}>
                {([
                  ['Base range (no contingency)', fmt(baseLow) + ' – ' + fmt(baseHigh)],
                  ['Contingency (' + contingency + '%)', fmt(low - baseLow) + ' – ' + fmt(high - baseHigh)],
                  ['Location', LOCS[locId]?.label ?? ''],
                  ['Project', (project?.label ?? '') + ' — ' + (scope?.label.split('(')[0].trim() ?? '')],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.4)' }}>{k}</span>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.65)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '3px', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#1C2B1A', margin: '0 0 3px' }}>Ready to get a real quote?</p>
                <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.55)', margin: 0 }}>Post your project — we match you with local Vermont contractors for your trade and area.</p>
              </div>
              <Link href="/#submit-project" style={{ padding: '10px 20px', backgroundColor: '#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>Post Your Project →</Link>
            </div>
            <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.4)', lineHeight: 1.7, padding: '14px 16px', backgroundColor: 'rgba(28,43,26,0.04)', borderRadius: '2px' }}>
              Estimates based on typical Vermont project costs as of 2026. Actual costs depend on site conditions, material choices, and contractor availability. Always get multiple quotes before committing.
            </p>
          </>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed rgba(28,43,26,0.15)', borderRadius: '4px', color: 'rgba(28,43,26,0.4)', fontFamily: 'monospace', fontSize: '13px' }}>
            Select a project type and scope above to see Vermont cost estimates.
          </div>
        )}

        <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid rgba(28,43,26,0.08)' }}>
          <p style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(28,43,26,0.4)', marginBottom: '10px' }}>Related guides</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {([
              ['Kitchen remodel costs in Vermont', '/guides/how-much-does-kitchen-remodel-cost-vermont'],
              ['How long does a bathroom remodel take?', '/guides/how-long-does-bathroom-remodel-take-vermont'],
              ['How to find a contractor', '/guides/how-to-find-contractor-vermont'],
              ['Vermont permit guide', '/guides/vermont-renovation-permit-guide'],
            ] as [string, string][]).map(([l, h]) => (
              <Link key={h} href={h} style={{ padding: '6px 12px', border: '1px solid rgba(28,43,26,0.12)', borderRadius: '2px', fontSize: '12px', color: 'rgba(28,43,26,0.65)', textDecoration: 'none', fontFamily: 'monospace' }}>{l} →</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}