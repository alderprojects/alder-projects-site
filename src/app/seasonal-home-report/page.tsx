'use client'
import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'

export type PropertyMode = 'owner' | 'buyer' | 'unknown'

interface ActionItem { title: string; priority: string; why: string; nextStep: string; cost: string }
interface Concern { title: string; whyCheck: string; howToResolve: string; resolvedWhen: string; cost: string }
interface ProjectIdea { title: string; scope: 'big' | 'small'; cost: string; impact: string; dependencies: string; timing: string; productUrl?: string }
interface DataLink { label: string; url: string; what: string }
interface SnapshotFact { label: string; value: string }
interface GIS { geocoded: boolean; lat?: number; lng?: number; matchScore?: number; matchType?: string; floodZone?: string; inFloodZone?: boolean; inShoreland?: boolean; inRiverCorridor?: boolean; inWetland?: boolean }
interface Report { summary: string; snapshot: { address: string; town: string; county: string; facts: SnapshotFact[] }; strengths?: unknown[]; concerns: Concern[]; actions: ActionItem[]; projects: ProjectIdea[]; avoidances: { action: string; why: string }[]; seasonal: { action: string; why: string; timing: string }[]; programs: { name: string; value: string; url?: string }[]; dataLinks: DataLink[]; generatedAt: string }
interface Suggestion { text: string; magicKey: string }

const EX = ['Greensboro', 'Stowe', 'Peacham', 'Charlotte']
const SUGGEST = 'https://maps.vcgi.vermont.gov/arcgis/rest/services/EGC_services/GCS_E911_COMPOSITE_SP_v2/GeocodeServer/suggest'
const GEO = 'https://maps.vcgi.vermont.gov/arcgis/rest/services/EGC_services/GCS_E911_COMPOSITE_SP_v2/GeocodeServer/findAddressCandidates'
const ANR = 'https://anrmaps.vermont.gov/arcgis/rest/services/Open_Data'
const TAG = 'alderprojects-20'
const az = (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${TAG}`
const qparams = (params: Record<string, string>) => {
  const sp = new URLSearchParams()
  sp.set('source', 'seasonal-report')
  Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
  return '/?' + sp.toString() + '#submit-project'
}

async function qGIS(addr: string, magicKey?: string): Promise<GIS> {
  try {
    const params = magicKey
      ? `magicKey=${magicKey}&f=json&outSR=4326`
      : `SingleLine=${encodeURIComponent(addr)}&f=json&maxLocations=1&outSR=4326`
    const g = await fetch(`${GEO}?${params}`, { signal: AbortSignal.timeout(8000) })
    const d = await g.json()
    const c = d.candidates?.[0]
    if (!c || c.score < 60) return { geocoded: false }
    const lat = c.location.y, lng = c.location.x
    const q = `geometry=${lng},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&f=json&inSR=4326&returnGeometry=false`
    const [fl, sh, rv, wt] = await Promise.all([
      fetch(`${ANR}/OPENDATA_ANR_EMERGENCY_SP_NOCACHE_v2/MapServer/57/query?${q}&outFields=FLD_ZONE,SFHA_TF`, { signal: AbortSignal.timeout(5000) }).then(r => r.json()).catch(() => ({ features: [] })),
      fetch(`${ANR}/OPENDATA_ANR_WATER_SP_NOCACHE_v2/MapServer/175/query?${q}&outFields=OBJECTID`, { signal: AbortSignal.timeout(5000) }).then(r => r.json()).catch(() => ({ features: [] })),
      fetch(`${ANR}/OPENDATA_ANR_WATER_SP_NOCACHE_v2/MapServer/176/query?${q}&outFields=OBJECTID`, { signal: AbortSignal.timeout(5000) }).then(r => r.json()).catch(() => ({ features: [] })),
      fetch(`${ANR}/OPENDATA_ANR_WATER_SP_NOCACHE_v2/MapServer/193/query?${q}&outFields=OBJECTID&distance=100&units=esriSRUnit_Meter`, { signal: AbortSignal.timeout(5000) }).then(r => r.json()).catch(() => ({ features: [] })),
    ])
    const fa = fl.features?.[0]?.attributes as Record<string, string> | undefined
    return {
      geocoded: true, lat, lng, matchScore: c.score, matchType: c.attributes?.Addr_type || '',
      floodZone: fa?.FLD_ZONE,
      inFloodZone: fl.features?.length > 0 && fa?.SFHA_TF === 'T',
      inShoreland: (sh.features?.length || 0) > 0,
      inRiverCorridor: (rv.features?.length || 0) > 0,
      inWetland: (wt.features?.length || 0) > 0,
    }
  } catch {
    return { geocoded: false }
  }
}

function formatSuggestion(text: string): string {
  // "123 MAIN ST, STOWE, VT, 05672" -> "123 Main St, Stowe"
  const parts = text.split(',').map(p => p.trim())
  if (parts.length < 2) return text
  const street = parts[0].split(' ').map(w => w.length > 0 ? w[0] + w.slice(1).toLowerCase() : '').join(' ')
  const town = parts[1].split(' ').map(w => w.length > 0 ? w[0] + w.slice(1).toLowerCase() : '').join(' ')
  return `${street}, ${town}`
}

export function PropertyReportInner({ mode }: { mode: PropertyMode }) {
  const [addr, setAddr] = useState('')
  const [r, setR] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [sug, setSug] = useState('')
  const [dd, setDd] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [gis, setGis] = useState<GIS | null>(null)
  const [gisL, setGisL] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const iR = useRef<HTMLInputElement>(null)
  const dR = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dR.current && !dR.current.contains(e.target as Node) && iR.current && !iR.current.contains(e.target as Node)) setDd(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      return
    }
    setSuggestLoading(true)
    try {
      const res = await fetch(`${SUGGEST}?text=${encodeURIComponent(q)}&maxSuggestions=8&f=json`, {
        signal: AbortSignal.timeout(4000),
      })
      const d = await res.json()
      const sugs: Suggestion[] = (d.suggestions || []).map((s: { text: string; magicKey: string }) => ({
        text: s.text, magicKey: s.magicKey,
      }))
      setSuggestions(sugs)
      setDd(sugs.length > 0)
      setHighlightIdx(-1)
    } catch {
      setSuggestions([])
    } finally {
      setSuggestLoading(false)
    }
  }, [])

  function onType(v: string) {
    setAddr(v)
    setSelectedKey(null)
    setErr('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { fetchSuggestions(v) }, 200)
  }

  function pickSuggestion(s: Suggestion) {
    const formatted = formatSuggestion(s.text)
    setAddr(formatted)
    setSelectedKey(s.magicKey)
    setSuggestions([])
    setDd(false)
    setHighlightIdx(-1)
    // Auto-scan after picking
    setTimeout(() => go(s.text, s.magicKey), 100)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!dd || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      pickSuggestion(suggestions[highlightIdx])
    } else if (e.key === 'Escape') {
      setDd(false)
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setErr('Geolocation not available in this browser.')
      return
    }
    setLoading(true)
    setErr('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`https://maps.vcgi.vermont.gov/arcgis/rest/services/EGC_services/GCS_E911_COMPOSITE_SP_v2/GeocodeServer/reverseGeocode?location=${longitude},${latitude}&f=json&outSR=4326`, { signal: AbortSignal.timeout(8000) })
          const d = await res.json()
          if (d.address?.Match_addr) {
            const formatted = formatSuggestion(d.address.Match_addr)
            setAddr(formatted)
            await go(d.address.Match_addr)
          } else {
            setErr('Could not find an address at your current location.')
            setLoading(false)
          }
        } catch {
          setErr('Location lookup failed.')
          setLoading(false)
        }
      },
      () => {
        setErr('Could not access your location.')
        setLoading(false)
      },
      { timeout: 10000 }
    )
  }

  async function go(a?: string, magicKey?: string) {
    const t = (a || addr).trim()
    if (!t) return
    const withVT = t.match(/,\s*VT/i) ? t : `${t}, VT`
    // Display formatted version (Title Case) of the picked address
    setAddr(formatSuggestion(t))
    setLoading(true)
    setErr('')
    setSug('')
    setR(null)
    setGis(null)
    setDd(false)
    try {
      const res = await fetch('/api/seasonal-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: withVT }),
      })
      const d = await res.json()
      if (!res.ok) {
        setErr(d.error || 'Could not find that address.')
        setSug(d.suggestion || 'Try the suggestion dropdown as you type.')
      } else {
        setR(d)
        setGisL(true)
        qGIS(withVT, magicKey || selectedKey || undefined).then(g => { setGis(g); setGisL(false) }).catch(() => setGisL(false))
      }
    } catch {
      setErr('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  type Pill = { label: string; status: 'good' | 'warn' }
  const pills: Pill[] = []
  type Step = { title: string; why: string; cost: string; tag?: string; tagType?: string; cta?: string; ctaUrl?: string; guideLabel?: string; guideUrl?: string; products?: { label: string; url: string }[]; subs?: { title: string; detail: string; cost: string }[] }
  const steps: Step[] = []
  if (gis?.geocoded) {
    pills.push({ label: gis.inFloodZone ? `Flood zone ${gis.floodZone}` : 'No flood insurance needed', status: gis.inFloodZone ? 'warn' : 'good' })
    pills.push({ label: gis.inShoreland ? 'Shoreland rules apply' : 'No shoreland restrictions', status: gis.inShoreland ? 'warn' : 'good' })
    if (gis.inWetland) pills.push({ label: 'Wetlands affect where you can dig', status: 'warn' })
    if (gis.inRiverCorridor) pills.push({ label: 'River corridor limits building', status: 'warn' })
    if (gis.inFloodZone) steps.push({ title: 'Get a flood elevation certificate', why: "You're in a flood zone \u2014 that's the deal here. Before you renovate, you need an elevation certificate. About $400. Without it, the 50% rule can blow up your project: spend more than half your home's value on improvements and the town can require you to rebuild to current flood code. The cert tells you where you stand.", cost: '$300\u2013$600', tag: 'flood zone', tagType: 'warn', cta: 'Post your project', ctaUrl: qparams({ category: 'Other', town: r?.snapshot?.town || '', description: `Flood elevation certificate. Property is in flood zone ${gis.floodZone || ''}. Need a certified land surveyor to determine base flood elevation for renovation planning.`, budget: 'Under $10,000', timeline: 'Within 1\u20133 months' }), guideLabel: 'Read: the 50% rule explained', guideUrl: '/guides/vermont-flood-zone-renovation' })
    if (!gis.inFloodZone) steps.push({ title: 'First, find the basics', why: "Where's the water shutoff? Heat source? Septic cover? Most owners can't answer this on day one. Half an hour with a notebook and you'll know more about your house than 90% of buyers did at closing.", cost: 'Free', tag: 'good news', tagType: 'good', cta: 'Post your project', ctaUrl: qparams({ town: r?.snapshot?.town || '' }), guideLabel: 'Read: winterizing checklist', guideUrl: '/guides/winterizing-vermont-seasonal-home' })
    if (gis.inWetland) steps.push({ title: 'Get the septic inspected', why: "Wetlands close by means your septic is the most expensive thing on the property. An inspection runs $300\u2013500. A failed system runs $20k\u201340k. Worth knowing which one you've got before you plan anything.", cost: '$300\u2013$500', tag: 'wetlands', tagType: 'warn', cta: 'Post your project', ctaUrl: qparams({ category: 'Plumbing / HVAC', town: r?.snapshot?.town || '', description: 'Septic system inspection. Wetlands present within 100m of property \u2014 need a licensed septic inspector to verify capacity and condition before any renovation planning.', budget: 'Under $10,000', timeline: 'Within 1\u20133 months' }), guideLabel: 'Read: septic guide for seasonal owners', guideUrl: '/guides/vermont-septic-what-to-know' })
    if (gis.inRiverCorridor) steps.push({ title: 'Call town zoning about the river corridor', why: "You're in a mapped erosion zone \u2014 the state thinks the river might move. Town zoning will tell you if that limits what you can build. Call before you draw anything. Free, takes ten minutes.", cost: 'Free', tag: 'corridor', tagType: 'warn', cta: 'Post your project', ctaUrl: qparams({ category: 'Other', town: r?.snapshot?.town || '', description: 'Property is in a Vermont river corridor / mapped erosion zone. Looking for guidance on zoning restrictions and what we can build where.', budget: 'Not sure yet', timeline: 'Flexible / not sure' }), guideLabel: 'Read: flood zone guide', guideUrl: '/guides/vermont-flood-zone-renovation' })
    steps.push({ title: "Make it monitor itself", why: "Most house damage happens when nobody's home \u2014 frozen pipes, slow leaks, mice. Few hundred bucks of sensors and you'll catch it on your phone instead of finding out in May.", cost: '$50\u2013$800 total', cta: 'Get a handyman to do it', ctaUrl: qparams({ category: 'Other', town: r?.snapshot?.town || '', description: 'Handyman day visit for seasonal prep: install leak/freeze sensors, set up dehumidifier and smart thermostat, install chimney cap, mouse-proof the basement, set out radon test. Looking for someone to do it all in one visit.', budget: 'Under $10,000', timeline: 'Within 1\u20133 months' }), guideLabel: 'Read: winterizing checklist', guideUrl: '/guides/winterizing-vermont-seasonal-home'})
    steps.push({ title: 'Button up the exterior', why: "Ice dams and bad gutters cause more Vermont insurance claims than fires. Few hundred bucks now beats a few grand in roof repair next March.", cost: '$100\u20132,000', cta: 'Get a handyman to do it', ctaUrl: qparams({ category: 'Other', town: r?.snapshot?.town || '', description: 'Exterior buttoning for winter: install gutter guards, add interior storm window inserts, insulate exposed pipes, install heat tape on roof edge for ice dam prevention.', budget: 'Under $10,000', timeline: 'Within 1\u20133 months' }), guideLabel: 'Read: winterizing checklist', guideUrl: '/guides/winterizing-vermont-seasonal-home'})
    if (gis.inShoreland) steps.push({ title: 'Get a shoreland survey before designing outdoor work', why: "You're inside the 250-foot shoreland buffer \u2014 that means the state has rules about what you can do near the water. Want a deck? A dock? Even a new fire pit? You'll need a surveyor to mark the buffer first or no permit will get approved. Costs $500\u20132k.", cost: '$500\u20132,000', tag: 'shoreland', tagType: 'warn', cta: 'Post your project', ctaUrl: qparams({ category: 'Other', town: r?.snapshot?.town || '', description: 'Property is inside the Vermont 250-foot shoreland buffer. Need a licensed land surveyor to delineate the buffer for designing a deck / dock / landscaping that will be permittable.', budget: 'Under $10,000', timeline: 'Within 1\u20133 months' }), guideLabel: 'Read: flood zone guide', guideUrl: '/guides/vermont-flood-zone-renovation' })
    steps.push({ title: "Or pay someone $400 to do all of it", why: "Steps 2 and 3 are one day's work for a handyman. Around here that's $200\u2013800 \u2014 sensors, mouse-proofing, pipe insulation, gutter guards, chimney cap. One visit, everything handled. Most of our owners do this.", cost: '$200\u2013$800 for a day', cta: 'Post your project', ctaUrl: qparams({ category: 'Other', town: r?.snapshot?.town || '', description: 'Full-day handyman seasonal prep: sensors, mouse exclusion, pipe insulation, gutter guards, chimney cap, basic winterizing checklist. Looking for one person to handle all of it in a single visit.', budget: 'Under $10,000', timeline: 'Within 1\u20133 months' }), guideLabel: 'Read: what a handyman can do for your seasonal home', guideUrl: '/guides/handyman-seasonal-home-vermont' })
    const lake = r?.snapshot?.facts?.find(f => f.label === 'Water')?.value
    const subs: { title: string; detail: string; cost: string }[] = []
    subs.push({ title: 'Heat pump', detail: 'Use it year-round. Strong rebates available.', cost: '$3k\u2013$12k after rebates' })
    if (lake) subs.push({ title: 'Dock rebuild', detail: `Adds real value on ${lake}.`, cost: '$5k\u2013$25k' })
    subs.push({ title: 'Insulation + air sealing', detail: 'Cuts heating costs 30\u201350%.', cost: '$5k\u2013$15k' })
    subs.push({ title: 'Guest cabin / ADU', detail: 'Rental income or family space.', cost: '$50k+' })
    steps.push({ title: 'Plan a bigger project', why: "Once the basics are sorted, this is where most Vermont owners spend their next renovation dollar.", cost: '', cta: 'Post your project', ctaUrl: qparams({ category: 'Other', town: r?.snapshot?.town || '', description: 'Planning a larger renovation \u2014 looking for contractor matches. Open to discussion on scope (heat pump, insulation, dock, ADU, etc.).', budget: '$25,000 \u2013 $50,000', timeline: 'Within 3\u20136 months' }), guideLabel: 'Read: heat pump rebates in 2026', guideUrl: '/guides/heat-pump-rebates-vermont', subs })
  } else {
    for (const a of (r?.actions || [])) {
      steps.push({ title: a.title, why: a.why, cost: a.cost, cta: 'Post your project', ctaUrl: qparams({ town: r?.snapshot?.town || '', description: a.title + '. ' + a.why }) })
    }
  }
  let sum = r?.summary || ''
  if (gis?.geocoded) {
    const flags = [
      gis.inFloodZone && "it's in a flood zone \u2014 that changes what you can renovate",
      gis.inWetland && 'wetlands nearby affect drainage and where you can dig',
      gis.inShoreland && 'shoreland rules limit outdoor work near the water',
      gis.inRiverCorridor && 'a river corridor restricts where you can build',
    ].filter(Boolean)
    if (flags.length > 0) sum = 'Yeah, we checked your address. Heads up: ' + flags.join(', and ') + ". Here's what that actually means for you."
    else sum = 'We checked your address. Nothing unusual \u2014 no flood zone, no shoreland rules, no wetlands. You\'ve got real flexibility here.'
  }
  const pc = (s: string) => s === 'good' ? { bg: '#EAF3DE', dot: '#639922', tx: '#3B6D11' } : { bg: '#FAEEDA', dot: '#BA7517', tx: '#854F0B' }
  const F = 'Outfit,system-ui,sans-serif'

  return (
    <div className="min-h-screen" style={{ fontFamily: F, background: '#fafaf8' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Nav />
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '88px 24px 100px' }}>
        <div style={{ paddingTop: 60, paddingBottom: 32 }}>
          <p style={{ fontSize: 28, fontWeight: 300, color: '#1c1917', lineHeight: 1.3, margin: 0 }}>What's this place<br />going to cost you?</p>
          <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 8 }}>Type any Vermont address. We&apos;ll check the maps and tell you what&apos;s going to be a project &mdash; and what isn&apos;t.</p>
        </div>
        <div style={{ marginBottom: 32 }}>
          <form onSubmit={(e) => { e.preventDefault(); go() }} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={iR}
                type="text"
                value={addr}
                onChange={(e) => onType(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => { if (suggestions.length > 0) setDd(true) }}
                placeholder="Start typing your street address..."
                autoComplete="off"
                autoCapitalize="words"
                style={{ width: '100%', padding: '14px 60px 14px 0', border: 'none', borderBottom: '2px solid #e7e5e4', background: 'transparent', fontSize: 16, color: '#1c1917', outline: 'none', fontFamily: F, boxSizing: 'border-box' }}
              />
              <button
                type="submit"
                disabled={loading || !addr.trim()}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: loading || !addr.trim() ? '#d6d3d1' : '#1c1917', cursor: 'pointer', fontFamily: F }}
              >
                {loading ? 'Scanning...' : 'Scan'}
              </button>
              {suggestLoading && (
                <span style={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)', display: 'inline-block', width: 10, height: 10, border: '1.5px solid #d6d3d1', borderTopColor: '#1c1917', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
            </div>
            {dd && suggestions.length > 0 && (
              <div ref={dR} style={{ position: 'absolute', zIndex: 10, left: 0, right: 0, top: '100%', marginTop: 4, background: 'white', border: '1px solid #f5f5f4', borderRadius: 8, boxShadow: '0 16px 48px rgba(0,0,0,0.08)', overflow: 'hidden', animation: 'fadeIn 0.15s ease-out' }}>
                {suggestions.map((s, i) => (
                  <button
                    key={s.magicKey}
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    onMouseEnter={() => setHighlightIdx(i)}
                    style={{ display: 'block', width: '100%', textAlign: 'left' as const, padding: '11px 16px', border: 'none', background: highlightIdx === i ? '#fafaf8' : 'transparent', fontSize: 13, color: '#1c1917', cursor: 'pointer', fontFamily: F, borderBottom: i < suggestions.length - 1 ? '1px solid #fafaf8' : 'none' }}
                  >
                    <span style={{ display: 'inline-block', marginRight: 8, color: '#d6d3d1' }}>→</span>
                    {formatSuggestion(s.text)}
                  </button>
                ))}
              </div>
            )}
          </form>
          {!r && !loading && (
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: '#d6d3d1' }}>Or try:</span>
                {EX.map(ex => (
                  <button key={ex} onClick={() => { setAddr(`123 Main St, ${ex}`); go(`123 Main St, ${ex}, VT`) }} style={{ border: 'none', background: 'transparent', fontSize: 11, color: '#a8a29e', cursor: 'pointer', fontFamily: F, padding: 0, textDecoration: 'underline', textDecorationColor: '#e7e5e4', textUnderlineOffset: 3 }}>{ex}</button>
                ))}
              </div>
              <button onClick={useMyLocation} style={{ border: 'none', background: 'transparent', fontSize: 11, color: '#a8a29e', cursor: 'pointer', fontFamily: F, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12 }}>◎</span> Use my location
              </button>
            </div>
          )}
          {err && (<p style={{ marginTop: 10, fontSize: 12, color: '#dc2626' }}>{err} {sug}</p>)}
        </div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 14, height: 14, border: '1.5px solid #d6d3d1', borderTopColor: '#1c1917', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
        {r && (
          <div style={{ border: '1px solid #eeedeb', borderRadius: 12, background: 'white', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 20px' }}>
              <p style={{ fontSize: 11, color: '#a8a29e', margin: '0 0 4px' }}>{r.snapshot.town}, Vermont</p>
              <p style={{ fontSize: 15, fontWeight: 400, color: '#44403c', lineHeight: 1.6, margin: 0 }}>{sum}</p>
              {pills.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  {pills.map(p => {
                    const c = pc(p.status)
                    return (
                      <span key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 6, background: c.bg, color: c.tx }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
                        {p.label}
                      </span>
                    )
                  })}
                </div>
              )}
              {gisL && (<p style={{ marginTop: 8, fontSize: 10, color: '#a8a29e', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse 2s infinite' }} />Scanning state records...</p>)}
              {gis?.geocoded && !gisL && (<p style={{ marginTop: 8, fontSize: 10, color: '#639922', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: '#639922', display: 'inline-block' }} />Source: VT ANR Atlas + FEMA. Free public data.</p>)}
            </div>
            <div style={{ borderTop: '1px solid #f5f5f4', padding: '20px 24px' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1c1917', margin: '0 0 16px' }}>What to do \u2014 easy stuff first</p>
              {steps.map((s, i) => (
                <div key={s.title} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, color: '#d6d3d1', minWidth: 16, lineHeight: '20px' }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1c1917', margin: 0, lineHeight: '20px' }}>
                        {s.title}
                        {s.tag && (<span style={{ fontSize: 10, marginLeft: 6, padding: '1px 6px', borderRadius: 4, background: s.tagType === 'warn' ? '#FAEEDA' : s.tagType === 'good' ? '#EAF3DE' : '#f5f5f4', color: s.tagType === 'warn' ? '#854F0B' : s.tagType === 'good' ? '#3B6D11' : '#a8a29e' }}>{s.tag}</span>)}
                      </p>
                      <p style={{ fontSize: 12, color: '#78716c', margin: '3px 0 0', lineHeight: 1.5 }}>{s.why}{s.cost && <span style={{ color: '#a8a29e' }}> {s.cost}.</span>}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                        {s.guideUrl && (<a href={s.guideUrl} style={{ fontSize: 11, color: '#78716c', textDecoration: 'none', borderBottom: '1px solid #eeedeb' }}>{s.guideLabel} →</a>)}
                        {s.cta && s.ctaUrl && (<a href={s.ctaUrl} style={{ fontSize: 11, color: '#185FA5', textDecoration: 'none' }}>{s.cta} →</a>)}
                      </div>
                      {s.products && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {s.products.map(p => (
                            <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#185FA5', textDecoration: 'none', padding: '4px 10px', border: '1px solid #eeedeb', borderRadius: 6 }}>{p.label} →</a>
                          ))}
                        </div>
                      )}
                      {s.subs && (
                        <div style={{ marginTop: 8 }}>
                          {s.subs.map(sub => (
                            <div key={sub.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #fafaf8' }}>
                              <div>
                                <p style={{ fontSize: 12, fontWeight: 500, color: '#1c1917', margin: 0 }}>{sub.title}</p>
                                <p style={{ fontSize: 11, color: '#78716c', margin: 0 }}>{sub.detail} {sub.cost}.</p>
                              </div>
                              <a href="/#submit-project" style={{ fontSize: 11, color: '#185FA5', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 8 }}>Get quotes →</a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fafaf8', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1c1917', margin: 0 }}>Need a contractor?</p>
                <p style={{ fontSize: 11, color: '#78716c', margin: '2px 0 0' }}>Tell us what you need. We'll find 2\u20133 locals who do this work and aren't booked out till next summer.</p>
              </div>
              <a href="/#submit-project" style={{ fontSize: 11, fontWeight: 600, color: 'white', background: '#1c1917', textDecoration: 'none', padding: '8px 16px', borderRadius: 999 }}>Post project →</a>
            </div>
          </div>
        )}
        {r && (
          <div style={{ marginTop: 32, padding: '20px 24px', background: 'white', border: '1px solid #eeedeb', borderRadius: 12 }}>
            <p style={{ fontSize: 11, color: '#a8a29e', marginBottom: 4, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>If you'd rather DIY</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#1c1917', margin: '0 0 4px' }}>Doing it yourself? Here's the gear list</p>
            <p style={{ fontSize: 12, color: '#78716c', margin: '0 0 14px', lineHeight: 1.5 }}>Everything from steps 2 and 3, sourced. About $300–800 depending on house size. Same prices everywhere — Amazon links, but we get a small cut to keep the tool free.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                { label: 'Leak & freeze sensors', url: az('wifi water leak sensor freeze alert') },
                { label: 'Dehumidifier', url: az('basement dehumidifier energy star') },
                { label: 'Smart thermostat', url: az('smart thermostat wifi remote') },
                { label: 'Chimney cap', url: az('stainless steel chimney cap') },
                { label: 'Mouse-proofing kit', url: az('mouse exclusion kit steel wool') },
                { label: 'Radon test', url: az('radon test kit home') },
                { label: 'Gutter guards', url: az('gutter guards stainless steel') },
                { label: 'Storm window inserts', url: az('interior storm window insert kit') },
                { label: 'Pipe insulation', url: az('pipe insulation foam outdoor') },
                { label: 'Heat tape', url: az('roof heat cable ice dam') },
              ].map(p => (
                <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer sponsored" style={{ fontSize: 11, color: '#185FA5', textDecoration: 'none', padding: '4px 10px', border: '1px solid #eeedeb', borderRadius: 6 }}>{p.label} →</a>
              ))}
            </div>
            <p style={{ fontSize: 10, color: '#c4c0b8', marginTop: 12, marginBottom: 0 }}>Affiliate links. Same price for you, small commission for us — helps keep this tool free.</p>
          </div>
        )}
        {r && (
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 11, color: '#a8a29e', marginBottom: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Real Vermont guides \u2014 written by someone who's done it</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <a href="/guides/winterizing-vermont-seasonal-home" style={{ padding: 14, border: '1px solid #eeedeb', borderRadius: 8, textDecoration: 'none', background: 'white' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#1c1917', margin: 0 }}>How to winterize a Vermont seasonal home</p>
                <p style={{ fontSize: 11, color: '#a8a29e', margin: '3px 0 0' }}>The complete checklist</p>
              </a>
              <a href="/guides/vermont-septic-what-to-know" style={{ padding: 14, border: '1px solid #eeedeb', borderRadius: 8, textDecoration: 'none', background: 'white' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#1c1917', margin: 0 }}>Vermont septic systems: what seasonal owners should know</p>
                <p style={{ fontSize: 11, color: '#a8a29e', margin: '3px 0 0' }}>Capacity, inspections, costs</p>
              </a>
              <a href="/guides/vermont-flood-zone-renovation" style={{ padding: 14, border: '1px solid #eeedeb', borderRadius: 8, textDecoration: 'none', background: 'white' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#1c1917', margin: 0 }}>Renovating in a Vermont flood zone</p>
                <p style={{ fontSize: 11, color: '#a8a29e', margin: '3px 0 0' }}>The 50% rule explained</p>
              </a>
              <a href="/guides/handyman-seasonal-home-vermont" style={{ padding: 14, border: '1px solid #eeedeb', borderRadius: 8, textDecoration: 'none', background: 'white' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#1c1917', margin: 0 }}>What a handyman can do for your seasonal home</p>
                <p style={{ fontSize: 11, color: '#a8a29e', margin: '3px 0 0' }}>The gap between DIY and contractor</p>
              </a>
              <a href="/guides/heat-pump-rebates-vermont" style={{ padding: 14, border: '1px solid #eeedeb', borderRadius: 8, textDecoration: 'none', background: 'white' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#1c1917', margin: 0 }}>Vermont heat pump rebates in 2026</p>
                <p style={{ fontSize: 11, color: '#a8a29e', margin: '3px 0 0' }}>What you actually get back</p>
              </a>
            </div>
          </div>
        )}
        {r && (
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {r.dataLinks?.map(dl => (<a key={dl.label} href={dl.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#c4c0b8', textDecoration: 'none' }}>{dl.label} →</a>))}
            <span style={{ fontSize: 9, color: '#d6d3d1' }}>Not advice. © 2026 Alder Projects</span>
          </div>
        )}
        {!r && !loading && !err && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 12, color: '#d6d3d1' }}>Enter an address to begin.</p>
          </div>
        )}
      </main>
    </div>
  )
}


function PageInner() {
  const sp = useSearchParams()
  const m = sp?.get('mode')
  const mode: PropertyMode = m === 'owner' || m === 'buyer' ? m : 'unknown'
  return <PropertyReportInner mode={mode} />
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  )
}
