'use client'

import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

type Scope = {
  id: string
  label: string
  low: number
  high: number
  median?: number
  whatsIncluded: string
  whatsNotIncluded: string[]
  pushesHigh: string[]
  diyAlternative?: { description: string; cost: string; affiliateLinks?: { label: string; url: string }[] }
}

type Project = {
  id: string
  label: string
  scopes: Scope[]
  sources: string[]
  permitRequired: boolean
}

const PROJECTS: Project[] = [
  {
    id: 'kitchen',
    label: 'Kitchen Remodel',
    permitRequired: true,
    sources: [
      'Woodstock Kitchens & Baths (Essex Junction) published tiers',
      'Chittenden County contractor quotes 2025-2026',
    ],
    scopes: [
      {
        id: 'refresh',
        label: 'Surface refresh (paint cabinets, new counters, hardware)',
        low: 25000, high: 45000, median: 32000,
        whatsIncluded: 'Existing cabinets refinished or repainted, new countertops (laminate or basic quartz), new hardware, new sink and faucet, refreshed lighting. No layout changes, no plumbing relocation.',
        whatsNotIncluded: ['Permit (~$300-600 in most VT towns)', 'Lead paint testing if pre-1978 (~$300)', 'Appliance package'],
        pushesHigh: ['Quartz vs. laminate counters', 'Cabinet boxes need replacing (not just doors)', 'Backsplash tile'],
      },
      {
        id: 'mid',
        label: 'Mid-range (semi-custom cabinets, new appliances, some layout changes)',
        low: 50000, high: 85000, median: 62000,
        whatsIncluded: 'New semi-custom cabinetry, quartz or solid-surface counters, mid-range appliance package, possible plumbing relocation, lighting upgrade, new flooring. Typical project takes 6-10 weeks of construction.',
        whatsNotIncluded: ['Permit (~$400-800 in Burlington)', 'Lead testing if pre-1978 (~$300)', 'Asbestos testing if found ($200-400) and abatement ($1,500-5,000)'],
        pushesHigh: ['Moving plumbing or gas lines ($2,000-5,000 each)', 'Pre-1940 house (most of VT)', 'Custom cabinets vs. semi-custom (+$8,000-15,000)', 'Hardwood floor refinishing during reno', 'Panel upgrade if old 100A service'],
      },
      {
        id: 'full',
        label: 'Full gut or luxury (custom cabinets, structural changes)',
        low: 90000, high: 150000, median: 115000,
        whatsIncluded: 'Custom cabinetry, premium appliances, structural changes (walls removed, layout reworked), high-end finishes, hardwood floors, custom lighting design.',
        whatsNotIncluded: ['Permit ($800-1,500)', 'Architect fees if structural ($3,000-8,000)', 'Lead/asbestos testing and abatement'],
        pushesHigh: ['Load-bearing wall removal ($5,000-15,000 with engineering)', 'Pre-1940 home structural surprises', 'Custom millwork and built-ins'],
      },
    ],
  },
  {
    id: 'bathroom',
    label: 'Bathroom Remodel',
    permitRequired: true,
    sources: [
      'Houzz Vermont contractor data 2025',
      'Chittenden County contractor quotes',
    ],
    scopes: [
      {
        id: 'refresh',
        label: 'Cosmetic refresh (paint, fixtures, new vanity)',
        low: 6500, high: 12000, median: 8500,
        whatsIncluded: 'Swap vanity and fixtures, paint, new mirror and lighting, possibly new toilet. No tile, no plumbing relocation.',
        whatsNotIncluded: ['Permit if plumbing fixtures changed (~$150-300)'],
        pushesHigh: ['Solid surface vanity vs. stock', 'New tile floor adds $1,500-3,000'],
      },
      {
        id: 'mid',
        label: 'Standard (new tile, fixtures, plumbing updates)',
        low: 15000, high: 25000, median: 19000,
        whatsIncluded: 'New tile floor and shower surround, new vanity, updated plumbing fixtures, new exhaust fan, new lighting, paint.',
        whatsNotIncluded: ['Permit (~$200-500)', 'Mold remediation if found during demo'],
        pushesHigh: ['Moving the toilet or shower drain ($1,500-3,500)', 'Hidden water damage discovered during demo', 'Custom tile work vs. standard subway', 'Heated floors (+$1,500-3,000)'],
      },
      {
        id: 'full',
        label: 'Full gut (layout changes, custom tile, radiant)',
        low: 28000, high: 45000, median: 35000,
        whatsIncluded: 'Move plumbing, rework layout, custom shower/tub, premium finishes, heated floors, custom vanity.',
        whatsNotIncluded: ['Permit ($300-700)', 'Structural work if relocating plumbing through floor joists'],
        pushesHigh: ['Walk-in shower with bench and multiple heads', 'Freestanding soaker tub', 'Steam shower'],
      },
    ],
  },
  {
    id: 'deck',
    label: 'Deck / Porch',
    permitRequired: true,
    sources: ['Vermont contractor quotes 2025'],
    scopes: [
      {
        id: 'small',
        label: 'Small deck (under 200 sq ft, pressure-treated)',
        low: 8000, high: 15000, median: 11000,
        whatsIncluded: 'PT framing and decking, basic railing, ground-level or single-step. No roof, no built-ins.',
        whatsNotIncluded: ['Permit (~$75-200)', 'Stairs to grade if elevated (+$500-1,500)'],
        pushesHigh: ['Composite vs. PT decking (+30-50%)', 'Elevated deck (more framing, stairs, footings)', 'Frost-depth footings in NEK (deeper digs)'],
      },
      {
        id: 'mid',
        label: 'Mid-size deck (200-400 sq ft, composite)',
        low: 15000, high: 32000, median: 22000,
        whatsIncluded: 'Composite decking (Trex/TimberTech tier), aluminum or composite railing, sonotube footings, basic stairs.',
        whatsNotIncluded: ['Permit ($100-250)', 'Removal of old deck if replacing'],
        pushesHigh: ['Curved or angled designs', 'Hidden fasteners', 'Lighting and outlets'],
      },
      {
        id: 'large',
        label: 'Large or multi-level with features',
        low: 30000, high: 65000, median: 42000,
        whatsIncluded: 'Multi-level layout, premium composite or hardwood, custom railing, integrated lighting, possibly pergola.',
        whatsNotIncluded: ['Permit ($200-500)', 'Hot tub electrical if planned'],
        pushesHigh: ['Hardwood (ipe, mahogany) decking', 'Built-in benches and planters', 'Pergola or roof structure'],
      },
    ],
  },
  {
    id: 'basement',
    label: 'Basement Finishing',
    permitRequired: true,
    sources: ['Vermont contractor quotes 2025'],
    scopes: [
      {
        id: 'basic',
        label: 'Basic finish (drywall, flooring, lighting)',
        low: 18000, high: 32000, median: 24000,
        whatsIncluded: 'Frame and insulate walls, drywall, basic flooring (LVP), lighting, electrical, paint. No bathroom, no kitchenette.',
        whatsNotIncluded: ['Permit ($200-500)', 'Egress window if bedroom planned ($3,500-6,000)', 'Sump pump or waterproofing if needed'],
        pushesHigh: ['Moisture issues require drainage/waterproofing first', 'Low ceiling height needs underpinning', 'Existing knob-and-tube electrical'],
      },
      {
        id: 'full',
        label: 'Full finish (bedroom, bathroom, kitchenette)',
        low: 35000, high: 70000, median: 48000,
        whatsIncluded: 'Everything in basic, plus a 3/4 bath, kitchenette, egress window for bedroom, additional electrical, possibly HVAC zone.',
        whatsNotIncluded: ['Permit ($400-900)', 'Septic capacity check if rural — adding bedroom may require system upgrade', 'ADU registration if rented out separately'],
        pushesHigh: ['Septic upgrade if bedroom triggers capacity rules ($15,000-40,000)', 'Custom millwork', 'Heat pump for the zone'],
      },
    ],
  },
  {
    id: 'addition',
    label: 'Home Addition',
    permitRequired: true,
    sources: ['Vermont GC quotes 2025-2026'],
    scopes: [
      {
        id: 'small',
        label: 'Small addition (mudroom, sunroom, under 300 sq ft)',
        low: 70000, high: 130000, median: 95000,
        whatsIncluded: 'Foundation, framing, roof, siding, windows, electrical, basic finishes. Mudroom or sunroom shell.',
        whatsNotIncluded: ['Permit ($300-800)', 'Architect/engineer if structural ($2,000-5,000)', 'Site work if grading needed'],
        pushesHigh: ['Sloped lot needs more foundation work', 'Matching existing siding/trim on older home', 'Mini-split or hydronic heat for zone'],
      },
      {
        id: 'mid',
        label: 'Primary suite or garage conversion (300-600 sq ft)',
        low: 110000, high: 220000, median: 155000,
        whatsIncluded: 'Foundation or conversion of existing slab, framing, roof, full electrical and plumbing, HVAC, finishes.',
        whatsNotIncluded: ['Permit ($600-1,500)', 'Architect fees ($4,000-10,000)', 'Septic check'],
        pushesHigh: ['Bathroom plumbing runs', 'Master suite finishes (tile, custom closet)', 'Connecting to existing HVAC'],
      },
      {
        id: 'large',
        label: 'Major addition (500+ sq ft, structural)',
        low: 200000, high: 425000, median: 285000,
        whatsIncluded: 'Full addition with foundation, structural ties to existing home, full mechanical systems, finishes throughout.',
        whatsNotIncluded: ['Permit ($1,000-3,000)', 'Architect ($8,000-25,000)', 'Possible Act 250 if disturbed acreage triggers'],
        pushesHigh: ['Two-story additions', 'Connecting to existing roof', 'Older home requiring structural reinforcement'],
      },
    ],
  },
  {
    id: 'roofing',
    label: 'Roofing',
    permitRequired: false,
    sources: ['Vermont roofing contractor quotes 2025'],
    scopes: [
      {
        id: 'asphalt',
        label: 'Asphalt shingle replacement',
        low: 9000, high: 20000, median: 14000,
        whatsIncluded: 'Tear-off existing shingles, install ice and water shield (required in VT), underlayment, architectural asphalt shingles, ridge vents, drip edge.',
        whatsNotIncluded: ['Sheathing replacement if rot found ($800-3,000)', 'Skylight replacement if leaking', 'Chimney flashing rebuild'],
        pushesHigh: ['Steep pitch (over 8/12) — fall protection adds cost', 'Multiple layers to tear off', 'Complex roof (dormers, valleys)', 'Premium designer shingles vs. standard'],
      },
      {
        id: 'metal',
        label: 'Metal roofing (standing seam)',
        low: 16000, high: 38000, median: 24000,
        whatsIncluded: 'Tear-off, ice and water shield, underlayment, standing-seam metal panels, snow guards (essential in VT), trim and flashings.',
        whatsNotIncluded: ['Sheathing replacement', 'Skylight curbs to match'],
        pushesHigh: ['Complex roof shape (cuts and trim work)', 'Premium colors/finishes', 'Copper or zinc instead of steel/aluminum'],
      },
      {
        id: 'repair',
        label: 'Partial repair / sections only',
        low: 2500, high: 8000, median: 4500,
        whatsIncluded: 'Replacing damaged sections, fixing flashings, repairing leaks.',
        whatsNotIncluded: ['Full tear-off scope'],
        pushesHigh: ['Cause is widespread — partial repair will not fix it', 'Old chimney flashing needing rebuild'],
      },
    ],
  },
  {
    id: 'painting',
    label: 'Painting',
    permitRequired: false,
    sources: ['Vermont painting contractor quotes 2025'],
    scopes: [
      {
        id: 'interior',
        label: 'Interior — full home (3-4 bedrooms)',
        low: 4500, high: 9500, median: 6800,
        whatsIncluded: 'Walls and ceilings, light prep (patching, sanding), two coats, basic trim. Standard contractor-grade paint.',
        whatsNotIncluded: ['Wallpaper removal', 'Heavy plaster repair', 'Trim painted separately'],
        pushesHigh: ['High ceilings or vaulted areas', 'Wallpaper removal ($1-3/sq ft)', 'Premium paint (Benjamin Moore Aura, Farrow & Ball)'],
        diyAlternative: {
          description: 'DIY interior painting for ~$400-900 in materials. Time investment: 30-60 hours for a 3-bedroom home.',
          cost: '$400-900',
          affiliateLinks: [
            { label: 'Quality interior paint', url: 'https://www.homedepot.com/b/Paint-Interior-Paint/N-5yc1vZbarn' },
            { label: 'Pro brushes and rollers kit', url: 'https://www.homedepot.com/b/Paint-Painting-Tools-Brushes-Rollers/N-5yc1vZbarq' },
            { label: 'Drop cloths and painter tape', url: 'https://www.homedepot.com/b/Paint-Painting-Tools-Painters-Tape/N-5yc1vZbark' },
          ],
        },
      },
      {
        id: 'exterior',
        label: 'Exterior repaint',
        low: 4000, high: 11000, median: 7000,
        whatsIncluded: 'Pressure wash, scrape and prime bare areas, two coats of exterior paint, basic trim. Single-color scheme.',
        whatsNotIncluded: ['Lead testing if pre-1978 (~$300)', 'Lead-safe practices add 15-25% to cost', 'Carpentry repair for rotted trim/clapboards'],
        pushesHigh: ['Pre-1978 home — lead-safe practices required', 'Two-story or three-story home', 'Heavy prep (peeling paint, weathered)', 'Multiple colors (body, trim, accent)'],
      },
      {
        id: 'both',
        label: 'Interior + exterior (full home)',
        low: 8000, high: 18000, median: 13000,
        whatsIncluded: 'Both scopes above combined, often with a small discount for being one project.',
        whatsNotIncluded: ['Same as separate scopes'],
        pushesHigh: ['Same as separate scopes'],
      },
    ],
  },
  {
    id: 'windows',
    label: 'Window Replacement',
    permitRequired: false,
    sources: ['Vermont window contractor quotes 2025'],
    scopes: [
      {
        id: 'few',
        label: '1-5 windows',
        low: 2500, high: 6500, median: 4200,
        whatsIncluded: 'Standard double-hung or casement vinyl/composite windows, installed with proper flashing and trim. Removal of old windows.',
        whatsNotIncluded: ['Lead-safe practices if pre-1978 (+15-25%)', 'Rotted sill or frame repair'],
        pushesHigh: ['Wood windows (Marvin, Andersen 400-series) vs. vinyl', 'Custom sizes for older Vermont homes', 'Triple-pane vs. double-pane'],
      },
      {
        id: 'several',
        label: '6-12 windows',
        low: 5500, high: 14000, median: 9000,
        whatsIncluded: 'Same as above, scaled.',
        whatsNotIncluded: ['Same'],
        pushesHigh: ['Same'],
      },
      {
        id: 'full',
        label: 'Full home (13+ windows)',
        low: 12000, high: 30000, median: 19000,
        whatsIncluded: 'Whole-house window replacement, typically with small discount for volume.',
        whatsNotIncluded: ['Same'],
        pushesHigh: ['Wood vs. vinyl/composite (often doubles cost)', 'Triple-pane for energy efficiency', 'Installation in pre-1940 home (custom sizes)'],
      },
    ],
  },
]

const LOCS: Record<string, { label: string; mult: number; note?: string }> = {
  burlington: { label: 'Burlington / South Burlington', mult: 1.00, note: 'Burlington runs at the cited Chittenden County baseline. Labor is tighter here than rural Vermont.' },
  chittenden: { label: 'Chittenden County suburbs', mult: 0.97 },
  stowe: { label: 'Stowe / Lamoille County', mult: 1.10, note: 'Stowe runs about 10% above Burlington because of the second-home market premium and limited contractor availability during ski season.' },
  middlebury: { label: 'Middlebury / Addison County', mult: 0.90 },
  rural: { label: 'Rural / small town Vermont', mult: 0.85, note: 'Rural Vermont generally runs about 15% below Burlington pricing. Owner-operator contractors carry less overhead.' },
  other: { label: 'Other Vermont location', mult: 0.95 },
}

function fmt(n: number): string {
  return '$' + (Math.round(n / 500) * 500).toLocaleString()
}

const CAT_MAP: Record<string, string> = {
  kitchen: 'Kitchen Remodel', bathroom: 'Bathroom Renovation', deck: 'Deck / Porch',
  basement: 'Basement Finishing', addition: 'Room Addition / Expansion',
  roofing: 'Roofing / Weatherization', painting: 'Painting & Interior', windows: 'Other',
}

const TOWN_MAP: Record<string, string> = {
  burlington: 'Burlington', chittenden: 'South Burlington', stowe: 'Stowe',
  middlebury: 'Middlebury', rural: '', other: '',
}

function budgetBandFor(low: number, high: number): string {
  const mid = (low + high) / 2
  if (mid < 10000) return 'Under $10,000'
  if (mid < 25000) return '$10,000 - $25,000'
  if (mid < 50000) return '$25,000 - $50,000'
  if (mid < 100000) return '$50,000 - $100,000'
  if (mid < 250000) return '$100,000 - $250,000'
  if (mid < 500000) return '$250,000 - $500,000'
  return 'Over $500,000'
}

function calcQparams(project: Project | undefined, scope: Scope | undefined, locId: string, locLabel: string, low: number, high: number, contingency: number): string {
  if (!project || !scope) return '/#submit-project'
  const sp = new URLSearchParams()
  sp.set('source', 'calculator')
  sp.set('category', CAT_MAP[project.id] || 'Other')
  if (TOWN_MAP[locId]) sp.set('town', TOWN_MAP[locId])
  sp.set('budget', budgetBandFor(low, high))
  const desc = project.label + ' — ' + scope.label + '. Located in ' + locLabel + '. Estimated range: ' + fmt(low) + ' — ' + fmt(high) + ' (with ' + contingency + '% contingency).'
  sp.set('description', desc)
  return '/?' + sp.toString() + '#submit-project'
}

export default function Calculator() {
  const [projectId, setProjectId] = useState('')
  const [scopeId, setScopeId] = useState('')
  const [locId, setLocId] = useState('')
  const [contingency, setContingency] = useState(15)

  const project = PROJECTS.find(p => p.id === projectId)
  const scope = project?.scopes.find(s => s.id === scopeId)
  const loc = LOCS[locId]
  const mult = loc?.mult ?? 1.0

  const baseLow = scope ? Math.round(scope.low * mult) : null
  const baseHigh = scope ? Math.round(scope.high * mult) : null
  const baseMedian = scope?.median ? Math.round(scope.median * mult) : null
  const low = baseLow ? Math.round(baseLow * (1 + contingency / 100)) : null
  const high = baseHigh ? Math.round(baseHigh * (1 + contingency / 100)) : null

  const sel: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid rgba(28,43,26,0.18)', borderRadius: '3px', fontSize: '14px', color: '#1C2B1A', backgroundColor: 'white', fontFamily: "'DM Sans',system-ui,sans-serif" }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(28,43,26,0.55)', marginBottom: '8px' }

  const allLowsForProject = project ? project.scopes.map(s => Math.round(s.low * mult)) : []
  const allHighsForProject = project ? project.scopes.map(s => Math.round(s.high * mult)) : []
  const projMin = allLowsForProject.length ? Math.min(...allLowsForProject) : 0
  const projMax = allHighsForProject.length ? Math.max(...allHighsForProject) : 0
  const range = projMax - projMin
  const userLowPct = range > 0 && baseLow ? ((baseLow - projMin) / range) * 100 : 0
  const userHighPct = range > 0 && baseHigh ? ((baseHigh - projMin) / range) * 100 : 100

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2' }}>
      <Nav />
      <div style={{ backgroundColor: '#1C2B1A', padding: 'clamp(96px,10vw,120px) 24px clamp(40px,6vw,60px)', borderBottom: '1px solid rgba(122,155,111,0.1)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A9B6F', display: 'block', marginBottom: '10px' }}>Cost Calculator</span>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 600, color: '#F5EFE0', lineHeight: 1.1, marginBottom: '10px' }}>What your Vermont project actually costs</h1>
          <p style={{ fontSize: '16px', color: 'rgba(245,239,224,0.6)', lineHeight: 1.7, margin: 0 }}>Real Vermont cost ranges. Cited sources, not national averages. Includes a contingency buffer for the surprises Vermont homes tend to produce.</p>
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
                <option value="">Select location...</option>
                {Object.entries(LOCS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Contingency buffer: {contingency}%</label>
              <div style={{ paddingTop: '8px' }}>
                <input type="range" min={0} max={30} value={contingency} onChange={e => setContingency(Number(e.target.value))} style={{ width: '100%', accentColor: '#C8732A' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.4)', marginTop: '4px' }}>
                  <span>0%</span><span>15% recommended</span><span>30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(low != null && high != null && baseLow != null && baseHigh != null && project && scope && loc) ? (
          <>
            <div style={{ backgroundColor: '#1C2B1A', borderRadius: '4px', padding: '28px 32px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: 'rgba(245,239,224,0.4)', marginBottom: '8px' }}>Estimated total range (with {contingency}% contingency)</p>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 600, color: '#F5EFE0', margin: '0 0 6px' }}>{fmt(low)} – {fmt(high)}</p>
              {baseMedian && <p style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.5)', margin: '0 0 20px' }}>Most projects we see in this segment land around {fmt(Math.round(baseMedian * (1 + contingency / 100)))}</p>}

              {range > 0 && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.06em', color: 'rgba(245,239,224,0.4)', marginBottom: '10px', textTransform: 'uppercase' }}>Where this falls in the {project.label.toLowerCase()} range</p>
                  <div style={{ position: 'relative', height: '8px', backgroundColor: 'rgba(245,239,224,0.1)', borderRadius: '4px' }}>
                    <div style={{ position: 'absolute', left: userLowPct + '%', width: (userHighPct - userLowPct) + '%', height: '100%', backgroundColor: '#C8732A', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.45)', marginTop: '6px' }}>
                    <span>{fmt(projMin)}</span>
                    <span>{fmt(projMax)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(122,155,111,0.15)' }}>
                {([
                  ['Base range (no contingency)', fmt(baseLow) + ' – ' + fmt(baseHigh)],
                  ['Contingency (' + contingency + '%)', fmt(low - baseLow) + ' – ' + fmt(high - baseHigh)],
                  ['Location', loc.label],
                  ['Project', project.label + ' — ' + scope.label.split('(')[0].trim()],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.4)' }}>{k}</span>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.65)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '4px', padding: '24px 28px', marginBottom: '16px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: '#7A9B6F', textTransform: 'uppercase', marginBottom: '8px' }}>What is in this number</p>
                <p style={{ fontSize: '14px', color: '#1C2B1A', lineHeight: 1.6, margin: 0 }}>{scope.whatsIncluded}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: '#C8732A', textTransform: 'uppercase', marginBottom: '8px' }}>What is not in this number</p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1C2B1A', lineHeight: 1.7 }}>
                  {scope.whatsNotIncluded.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div style={{ marginBottom: loc.note ? '20px' : 0 }}>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: 'rgba(28,43,26,0.55)', textTransform: 'uppercase', marginBottom: '8px' }}>What pushes you to the high end</p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1C2B1A', lineHeight: 1.7 }}>
                  {scope.pushesHigh.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>

              {loc.note && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(28,43,26,0.08)' }}>
                  <p style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: 'rgba(28,43,26,0.55)', textTransform: 'uppercase', marginBottom: '8px' }}>What changes for {loc.label.split('/')[0].trim()}</p>
                  <p style={{ fontSize: '14px', color: '#1C2B1A', lineHeight: 1.6, margin: 0 }}>{loc.note}</p>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'rgba(122,155,111,0.08)', border: '1px solid rgba(122,155,111,0.2)', borderRadius: '3px', padding: '14px 18px', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(28,43,26,0.55)', marginBottom: '6px' }}>Sources</p>
              <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.7)', lineHeight: 1.6, margin: 0 }}>{project.sources.join(' · ')}</p>
            </div>

            {scope.diyAlternative && (
              <div style={{ backgroundColor: 'white', border: '1px solid rgba(200,115,42,0.3)', borderLeft: '3px solid #C8732A', borderRadius: '3px', padding: '20px 24px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em', color: '#C8732A', textTransform: 'uppercase', marginBottom: '8px' }}>Or do it yourself</p>
                <p style={{ fontSize: '14px', color: '#1C2B1A', lineHeight: 1.6, margin: '0 0 14px' }}>{scope.diyAlternative.description}</p>
                {scope.diyAlternative.affiliateLinks && (
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1C2B1A', lineHeight: 1.8 }}>
                    {scope.diyAlternative.affiliateLinks.map(link => (
                      <li key={link.url}><a href={link.url} target="_blank" rel="nofollow noopener sponsored" style={{ color: '#C8732A', textDecoration: 'underline' }}>{link.label}</a></li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div style={{ backgroundColor: 'white', border: '1px solid rgba(28,43,26,0.1)', borderRadius: '3px', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#1C2B1A', margin: '0 0 3px' }}>Ready to get real bids?</p>
                <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.55)', margin: 0 }}>We match you with local Vermont contractors. Three bids, no spam.</p>
              </div>
              <Link href={calcQparams(project, scope, locId, loc.label, low, high, contingency)} style={{ padding: '10px 20px', backgroundColor: '#C8732A', color: '#FAF7F2', fontWeight: 600, fontSize: '14px', borderRadius: '2px', textDecoration: 'none' }}>Post Your Project →</Link>
            </div>

            {scope.diyAlternative?.affiliateLinks && (
              <p style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.4)', lineHeight: 1.7, padding: '10px 16px', marginBottom: '16px', textAlign: 'center' }}>
                Some links earn us a small commission. That is how we keep this free. We only link to what we would buy ourselves.
              </p>
            )}

            <p style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(28,43,26,0.4)', lineHeight: 1.7, padding: '14px 16px', backgroundColor: 'rgba(28,43,26,0.04)', borderRadius: '2px' }}>
              Estimates based on cited Vermont source data as of 2026. Actual costs depend on site conditions, material choices, and contractor availability. Always get multiple quotes before committing.
            </p>
          </>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed rgba(28,43,26,0.15)', borderRadius: '4px', color: 'rgba(28,43,26,0.4)', fontFamily: 'monospace', fontSize: '13px' }}>
            Select a project type, scope, and Vermont location to see real cost estimates.
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
