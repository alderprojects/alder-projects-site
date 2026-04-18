'use client'
import { useState, useRef, useEffect } from 'react'

interface Problem { constraint: string; soWhat: string; whenItMatters: string }
interface ActionItem { title: string; priority: string; soWhat: string; whyItMatters: string; whenToDo: string; watchFor: string; nextStep: string }
interface Avoidance { action: string; why: string }
interface SeasonalItem { action: string; consequence: string; timing: string }
interface ProgramScreen { name: string; provider: string; whyScreen: string; value: string; caveat: string; url?: string }
interface SnapshotFact { label: string; value: string; basis: string }
interface Report { summary: string; snapshot: { address: string; town: string; county: string; facts: SnapshotFact[] }; problems: Problem[]; actions: ActionItem[]; avoidances: Avoidance[]; seasonal: SeasonalItem[]; reasoning: string; programs: ProgramScreen[]; generatedAt: string }

const VT_TOWNS = ['Addison','Albany','Alburgh','Arlington','Athens','Averill','Bakersfield','Barnard','Barnet','Barre','Barton','Belvidere','Bennington','Berkshire','Berlin','Bethel','Bolton','Bradford','Braintree','Brandon','Brattleboro','Bridgewater','Bridport','Brighton','Bristol','Brookfield','Brookline','Brownington','Brunswick','Burke','Burlington','Cabot','Calais','Cambridge','Canaan','Castleton','Cavendish','Charleston','Charlotte','Chelsea','Chester','Chittenden','Clarendon','Colchester','Concord','Corinth','Cornwall','Coventry','Craftsbury','Danby','Danville','Derby','Dorset','Dover','Dummerston','Duxbury','East Haven','East Montpelier','Eden','Elmore','Enosburg','Enosburg Falls','Essex','Essex Junction','Fairfax','Fairfield','Fairlee','Fayston','Ferrisburgh','Fletcher','Franklin','Georgia','Glastenbury','Glover','Goshen','Grafton','Granby','Grand Isle','Granville','Greensboro','Groton','Guildhall','Guilford','Halifax','Hancock','Hardwick','Hartford','Hartland','Highgate','Hinesburg','Holland','Huntington','Hyde Park','Ira','Irasburg','Isle La Motte','Jamaica','Jay','Jericho','Johnson','Killington','Kirby','Landgrove','Leicester','Lemington','Lincoln','Londonderry','Lowell','Ludlow','Lunenburg','Lyndon','Lyndonville','Maidstone','Manchester','Marlboro','Marshfield','Mendon','Middlesex','Middlebury','Middletown Springs','Milton','Monkton','Montgomery','Montpelier','Moretown','Morgan','Morristown','Morrisville','Mount Holly','Mount Tabor','New Haven','Newbury','Newfane','Newport','North Hero','Northfield','Norton','Norwich','Orange','Orwell','Panton','Pawlet','Peacham','Peru','Pittsfield','Pittsford','Plainfield','Plymouth','Pomfret','Poultney','Pownal','Proctor','Putney','Quechee','Randolph','Reading','Readsboro','Richmond','Richford','Ripton','Rochester','Rockingham','Roxbury','Royalton','Rupert','Rutland','Ryegate','Salisbury','Sandgate','Saxtons River','Searsburg','Shaftsbury','Sharon','Sheffield','Shelburne','Sheldon','Sherburne','Shoreham','Shrewsbury','Somerset','South Burlington','South Hero','Springfield','St. Albans','St. George','St. Johnsbury','Stamford','Stannard','Starksboro','Stockbridge','Stowe','Strafford','Stratton','Sudbury','Sunderland','Sutton','Swanton','Thetford','Tinmouth','Topsham','Townshend','Troy','Tunbridge','Underhill','Vergennes','Vernon','Vershire','Victory','Waitsfield','Walden','Wallingford','Waltham','Wardsboro','Warren','Washington','Waterbury','Waterford','Waterville','Weathersfield','Wells','West Dover','West Fairlee','West Rutland','West Windsor','Westfield','Westford','Westminster','Westmore','Weston','Weybridge','Wheelock','White River Junction','Whitingham','Whiting','Williston','Wilmington','Windham','Windsor','Winhall','Winooski','Wolcott','Woodbury','Woodford','Woodstock','Worcester']
const EXAMPLES = ['142 Lakeshore Drive, Greensboro, VT','78 Mountain View Road, Stowe, VT','455 East Hill Road, Peacham, VT','22 Sunset Point, Charlotte, VT','9 Birch Lane, Wilmington, VT']

function Pri({ p }: { p: string }) {
  const s: Record<string,string> = { 'Do now': 'bg-red-700 text-white', 'Do before winter': 'bg-amber-600 text-white', 'Do before designing anything': 'bg-amber-600 text-white', 'Do before committing to large scope': 'bg-sky-700 text-white' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${s[p]||'bg-stone-500 text-white'}`}>{p}</span>
}

export default function Page() {
  const [address, setAddress] = useState('')
  const [report, setReport] = useState<Report|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [showDd, setShowDd] = useState(false)
  const [filtered, setFiltered] = useState<string[]>([])
  const iRef = useRef<HTMLInputElement>(null)
  const dRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{function h(e:MouseEvent){if(dRef.current&&!dRef.current.contains(e.target as Node)&&iRef.current&&!iRef.current.contains(e.target as Node))setShowDd(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[])
  function onType(v:string){setAddress(v);const parts=v.split(',');const last=(parts.length>1?parts[parts.length-1]:'').trim().replace(/\s*(VT|Vermont|V\.T\.)\s*/gi,'').trim();const s=last||(parts.length===1&&v.length>3?v.split(' ').slice(-1)[0]:'');if(s&&s.length>=2){const l=s.toLowerCase();const starts=VT_TOWNS.filter(t=>t.toLowerCase().startsWith(l));const contains=VT_TOWNS.filter(t=>!t.toLowerCase().startsWith(l)&&t.toLowerCase().includes(l));const m=[...starts,...contains].slice(0,6);setFiltered(m);setShowDd(m.length>0)}else{setShowDd(false);setFiltered([])}}
  function pick(t:string){const parts=address.split(',');if(parts.length>=2){parts[parts.length-1]=' '+t+', VT';setAddress(parts.slice(0,-1).join(',')+','+parts[parts.length-1])}else setAddress(address.trim()+(address.trim()?', ':'')+t+', VT');setShowDd(false);iRef.current?.focus()}
  async function analyze(addr?:string){const t=addr||address;if(!t.trim())return;setAddress(t);setLoading(true);setError('');setSuggestion('');setReport(null);setShowDd(false);try{const r=await fetch('/api/seasonal-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:t})});const d=await r.json();if(!r.ok){setError(d.error||'Failed.');setSuggestion(d.suggestion||'')}else setReport(d)}catch{setError('Network error.')}finally{setLoading(false)}}
  function sub(e:React.FormEvent){e.preventDefault();analyze()}

  return (
    <div className="min-h-screen bg-stone-50" style={{fontFamily:'DM Sans, sans-serif'}}>
      <nav className="bg-white border-b border-stone-200 px-6 py-4"><div className="max-w-3xl mx-auto flex items-center justify-between"><a href="/" className="text-lg font-semibold text-stone-800" style={{fontFamily:'Playfair Display, serif'}}>Alder Projects</a><span className="text-xs tracking-widest uppercase text-stone-400">Decision Engine</span></div></nav>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 mb-2" style={{fontFamily:'Playfair Display, serif'}}>Vermont Seasonal Home Analysis</h1>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xl mb-6">Enter a Vermont address. The engine determines what is constraining the property, what to do first, and what to avoid — sequenced by what blocks what.</p>
          <form onSubmit={sub} className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <input ref={iRef} type="text" value={address} onChange={e=>onType(e.target.value)} onFocus={()=>{if(filtered.length>0)setShowDd(true)}} placeholder="Street address, Town, VT" className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white" autoComplete="off" />
              {showDd&&filtered.length>0&&(<div ref={dRef} className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">{filtered.map(t=>(<button key={t} type="button" onClick={()=>pick(t)} className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-100 transition-colors border-b border-stone-50 last:border-0">{t}<span className="text-stone-400 ml-1">, VT</span></button>))}</div>)}
            </div>
            <button type="submit" disabled={loading||!address.trim()} className="px-6 py-3 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">{loading?'Analyzing...':'Analyze'}</button>
          </form>
          {!report&&!loading&&(<div className="flex flex-wrap gap-2 mt-3">{EXAMPLES.map(ex=>(<button key={ex} onClick={()=>analyze(ex)} className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors">{ex}</button>))}</div>)}
          {error&&(<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-800">{error}</p>{suggestion&&<p className="text-sm text-red-600 mt-1">{suggestion}</p>}</div>)}
        </div>
        {loading&&(<div className="text-center py-16"><div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mb-4" /><p className="text-sm text-stone-500">Analyzing...</p></div>)}
        {report&&(<div>
          <div className="bg-white border border-stone-200 rounded-lg p-6 mb-8"><p className="text-xs text-stone-400 uppercase tracking-wider mb-2">{report.snapshot.address}</p><p className="text-stone-800 leading-relaxed">{report.summary}</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-stone-100 text-sm">{report.snapshot.facts.map(f=>(<div key={f.label}><span className="text-stone-400 text-xs">{f.label}</span><p className="text-stone-700">{f.value}</p></div>))}</div></div>
          <Sec icon="\ud83d\udd34" title="What's Most Likely to Cause Problems"><div className="space-y-3">{report.problems.map(p=>(<div key={p.constraint} className="border-l-4 border-l-red-500 bg-red-50 rounded-r-lg p-4"><p className="font-medium text-stone-800 text-sm">{p.constraint}</p><p className="text-sm text-stone-600 mt-1">{p.soWhat}</p><p className="text-xs text-red-700 mt-1">When it matters: {p.whenItMatters}</p></div>))}</div></Sec>
          <Sec icon="\ud83d\udd27" title="What To Do First"><div className="space-y-4">{report.actions.map((a,i)=>(<div key={a.title} className="bg-white border border-stone-200 rounded-lg overflow-hidden"><div className="flex items-center gap-3 px-5 py-3 border-b border-stone-100"><span className="text-lg font-semibold text-stone-300">{i+1}</span><h3 className="flex-1 font-semibold text-stone-800 text-sm">{a.title}</h3><Pri p={a.priority} /></div><div className="px-5 py-4 space-y-2 text-sm"><p className="text-stone-700"><span className="text-stone-400">So what:</span> {a.soWhat}</p><p className="text-stone-700"><span className="text-stone-400">Why it matters:</span> {a.whyItMatters}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-600 pt-2 border-t border-stone-50"><p><span className="text-stone-400">When:</span> {a.whenToDo}</p><p><span className="text-stone-400">Watch for:</span> {a.watchFor}</p></div><p className="text-xs text-emerald-700 pt-2 border-t border-stone-50"><span className="font-medium">Next step:</span> {a.nextStep}</p></div></div>))}</div></Sec>
          <Sec icon="\ud83d\udeab" title="What Not To Do Yet"><div className="space-y-2">{report.avoidances.map(a=>(<div key={a.action} className="bg-stone-100 rounded-lg p-4"><p className="font-medium text-stone-800 text-sm">{a.action}</p><p className="text-sm text-stone-600 mt-1">{a.why}</p></div>))}</div></Sec>
          <Sec icon="\ud83e\uddea" title="What To Deal With Now"><div className="space-y-2">{report.seasonal.map(s=>(<div key={s.action} className="bg-white border border-amber-200 rounded-lg p-4"><p className="font-medium text-stone-800 text-sm">{s.action}</p><p className="text-sm text-stone-600 mt-1">{s.consequence}</p><p className="text-xs text-amber-700 mt-1">{s.timing}</p></div>))}</div></Sec>
          <Sec icon="\ud83d\udcb0" title="Worth Screening"><div className="space-y-3">{report.programs.map(p=>(<div key={p.name} className="bg-white border border-stone-200 rounded-lg p-4"><h3 className="font-semibold text-stone-800 text-sm">{p.name}</h3><p className="text-xs text-stone-400">{p.provider}</p><p className="text-sm text-stone-600 mt-1">{p.whyScreen}</p><p className="text-xs text-emerald-700 mt-1">{p.value}</p><p className="text-xs text-amber-700 mt-1">{p.caveat}</p>{p.url&&<a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline mt-1 inline-block">Details \u2192</a>}</div>))}</div></Sec>
          <div className="bg-stone-100 rounded-lg p-5 mb-8"><p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Why this is being recommended</p><p className="text-sm text-stone-600 leading-relaxed">{report.reasoning}</p></div>
          <div className="text-xs text-stone-400 border-t border-stone-200 pt-6 mb-8"><p>Not legal, tax, or engineering advice. Confirm all findings with qualified professionals before acting.</p></div>
        </div>)}
        {!report&&!loading&&!error&&(<div className="text-center py-8 text-sm text-stone-400">Enter an address or tap an example.</div>)}
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">\u00a9 2026 Alder Projects \u00b7 Vermont</footer>
    </div>
  )
}
function Sec({icon,title,children}:{icon:string;title:string;children:React.ReactNode}){return(<section className="mb-8"><h2 className="text-base font-semibold text-stone-800 mb-3" style={{fontFamily:'Playfair Display, serif'}}>{icon} {title}</h2>{children}</section>)}
