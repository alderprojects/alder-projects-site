'use client'

import { useState } from 'react'

type EvidenceType = 'FACT' | 'INFERENCE' | 'REGIONAL_CONTEXT' | 'UNRESOLVED'

interface Evidence { id: string; statement: string; type: EvidenceType; source: string; confidence: 'high' | 'moderate' | 'low'; verifyHow?: string }
interface RiskFlag { title: string; severity: 'high' | 'medium' | 'low'; category: string; description: string; supportingEvidence: string[]; verifyNext: string }
interface Action { title: string; actionType: string; priority: string; costRange: string; upside: string; taxCreditNote: string; avoidIf: string; rationale: string; supportingEvidence: string[] }
interface Program { name: string; provider: string; whyScreen: string; estimatedValue: string; caveat: string; url?: string }
interface PropertySnapshot { normalizedAddress: string; town: string; county: string; state: string; facts: { label: string; value: string; evidenceType: EvidenceType; source: string }[] }
interface AnalysisReport { snapshot: PropertySnapshot; confirmed: Evidence[]; inferred: Evidence[]; unresolved: Evidence[]; risks: RiskFlag[]; actions: Action[]; programs: Program[]; evidenceLog: Evidence[]; thinData: boolean; generatedAt: string }

function EvTag({ type }: { type: EvidenceType }) {
  const s: Record<EvidenceType, string> = { FACT: 'bg-emerald-100 text-emerald-800', INFERENCE: 'bg-amber-100 text-amber-800', REGIONAL_CONTEXT: 'bg-sky-100 text-sky-800', UNRESOLVED: 'bg-red-100 text-red-800' }
  const l: Record<EvidenceType, string> = { FACT: 'Fact', INFERENCE: 'Inference', REGIONAL_CONTEXT: 'VT Context', UNRESOLVED: 'Unresolved' }
  return <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${s[type]}`}>{l[type]}</span>
}

function Conf({ c }: { c: string }) {
  const s: Record<string, string> = { high: 'text-emerald-600', moderate: 'text-amber-600', low: 'text-red-600' }
  return <span className={`text-xs ${s[c] || 'text-stone-400'}`}>{c}</span>
}

function PriorityTag({ p }: { p: string }) {
  const s: Record<string, string> = { critical: 'bg-red-700 text-white', high: 'bg-amber-600 text-white', moderate: 'bg-sky-700 text-white', low: 'bg-stone-500 text-white', defer: 'bg-stone-400 text-white' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${s[p] || 'bg-stone-300 text-stone-700'}`}>{p}</span>
}

const EXAMPLES = [
  '142 Lakeshore Drive, Greensboro, VT',
  '78 Mountain View Road, Stowe, VT',
  '455 East Hill Road, Peacham, VT',
  '22 Sunset Point, Charlotte, VT',
  '9 Birch Lane, Wilmington, VT',
]

export default function SeasonalHomeReport() {
  const [address, setAddress] = useState('')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState('')

  async function analyze(addr?: string) {
    const target = addr || address
    if (!target.trim()) return
    setAddress(target)
    setLoading(true)
    setError('')
    setSuggestion('')
    setReport(null)
    try {
      const res = await fetch('/api/seasonal-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: target }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed.')
        setSuggestion(data.suggestion || '')
      } else {
        setReport(data)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); analyze() }

  const eMap: Record<string, Evidence> = {}
  if (report) report.evidenceLog.forEach(e => { eMap[e.id] = e })

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-semibold text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>Alder Projects</a>
          <span className="text-xs tracking-widest uppercase text-stone-400">Seasonal Home Engine</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Vermont Seasonal Home Analysis</h1>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xl mb-6">Enter any Vermont address. The engine identifies confirmed facts, inferences, unknowns, risks, and ranked actions — prioritizing infrastructure constraints over aesthetic upgrades.</p>
          <form onSubmit={handleSubmit} className="flex gap-3 mb-3">
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address, Town, VT" className="flex-1 px-4 py-3 border border-stone-300 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white" />
            <button type="submit" disabled={loading || !address.trim()} className="px-6 py-3 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">{loading ? 'Analyzing...' : 'Analyze'}</button>
          </form>
          <p className="text-xs text-stone-400 mb-2">Format: street, town, VT — the engine recognizes 250+ Vermont towns.</p>
          {!report && !loading && (
            <div className="flex flex-wrap gap-2 mt-3">
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => analyze(ex)} className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors">{ex}</button>
              ))}
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
              {suggestion && <p className="text-sm text-red-600 mt-1">{suggestion}</p>}
            </div>
          )}
        </div>
        {loading && (<div className="text-center py-16"><div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mb-4" /><p className="text-sm text-stone-500">Analyzing address...</p></div>)}

        {report && (
          <div>
            {report.thinData && (<div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg"><p className="text-sm font-medium text-amber-800 mb-1">Limited evidence</p><p className="text-xs text-amber-700 leading-relaxed">Based on address parsing and Vermont regulatory context only. No property-specific records were retrieved. Every item below is tagged by evidence type.</p></div>)}
            <Sec title="Property Snapshot">
              <div className="bg-white border border-stone-200 rounded-lg p-5">
                <p className="font-medium text-stone-800 mb-3">{report.snapshot.normalizedAddress}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {report.snapshot.facts.map(f => (<div key={f.label} className="flex items-start justify-between gap-2"><div><span className="text-stone-400 text-xs">{f.label}</span><p className="text-stone-700">{f.value}</p></div><EvTag type={f.evidenceType} /></div>))}
                </div>
              </div>
            </Sec>
            <Sec title="What We Know" sub="Confirmed facts and applicable Vermont context.">
              <div className="space-y-2">
                {report.confirmed.map(e => (<div key={e.id} className="bg-white border border-stone-200 rounded-lg p-4 text-sm"><div className="flex items-center gap-2 mb-1"><EvTag type={e.type} /><Conf c={e.confidence} /></div><p className="text-stone-700 leading-relaxed">{e.statement}</p><p className="text-xs text-stone-400 mt-1">Source: {e.source}</p></div>))}
              </div>
            </Sec>
            <Sec title="What We Infer" sub="Heuristic conclusions. Each should be verified.">
              <div className="space-y-2">
                {report.inferred.map(e => (<div key={e.id} className="bg-white border border-amber-200 rounded-lg p-4 text-sm"><div className="flex items-center gap-2 mb-1"><EvTag type={e.type} /><Conf c={e.confidence} /></div><p className="text-stone-700 leading-relaxed">{e.statement}</p><p className="text-xs text-stone-400 mt-1">Basis: {e.source}</p>{e.verifyHow && <p className="text-xs text-amber-700 mt-1">Verify: {e.verifyHow}</p>}</div>))}
              </div>
            </Sec>
            <Sec title="Unknowns — Must Verify" sub="Critical gaps. Resolve before committing capital.">
              <div className="space-y-2">
                {report.unresolved.map(e => (<div key={e.id} className="bg-white border border-red-200 rounded-lg p-4 text-sm"><div className="flex items-center gap-2 mb-1"><EvTag type={e.type} /></div><p className="text-stone-700 leading-relaxed">{e.statement}</p>{e.verifyHow && <p className="text-xs text-red-700 mt-1">How to resolve: {e.verifyHow}</p>}</div>))}
              </div>
            </Sec>
            <Sec title="Risk Flags" sub="By severity. Each links to evidence.">
              <div className="space-y-3">
                {report.risks.map(r => (<div key={r.title} className={`border-l-4 rounded-lg p-5 ${r.severity === 'high' ? 'border-l-red-600 bg-red-50' : r.severity === 'medium' ? 'border-l-amber-500 bg-amber-50' : 'border-l-stone-400 bg-stone-50'}`}><div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-stone-800 text-sm">{r.title}</h3><span className="text-xs uppercase text-stone-400">{r.severity} · {r.category}</span></div><p className="text-sm text-stone-600 leading-relaxed mb-2">{r.description}</p><p className="text-xs text-stone-500">Verify next: {r.verifyNext}</p></div>))}
              </div>
            </Sec>
            <Sec title="Ranked Actions" sub="Constraint investigation ranks above aesthetic work.">
              <div className="space-y-3">
                {report.actions.map((a, i) => (<div key={a.title} className="bg-white border border-stone-200 rounded-lg overflow-hidden"><div className="flex items-center gap-3 px-5 py-3 border-b border-stone-100"><span className="text-lg font-semibold text-stone-300 w-6">{i + 1}</span><h3 className="flex-1 font-semibold text-stone-800 text-sm">{a.title}</h3><PriorityTag p={a.priority} /><span className="text-xs text-stone-400">{a.actionType}</span></div><div className="px-5 py-4 text-stone-600 space-y-2"><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs"><p><span className="text-stone-400">Cost:</span> {a.costRange}</p><p><span className="text-stone-400">Upside:</span> {a.upside}</p><p><span className="text-stone-400">Tax/credit:</span> {a.taxCreditNote}</p><p><span className="text-stone-400">Skip if:</span> {a.avoidIf}</p></div><p className="text-stone-500 text-xs pt-2 border-t border-stone-50">{a.rationale}</p></div></div>))}
              </div>
            </Sec>
            <Sec title="Programs Worth Screening" sub="Potential fits. Eligibility not confirmed.">
              <div className="space-y-3">
                {report.programs.map(p => (<div key={p.name} className="bg-white border border-stone-200 rounded-lg p-4"><h3 className="font-semibold text-stone-800 text-sm">{p.name}</h3><p className="text-xs text-stone-400 mb-1">{p.provider}</p><p className="text-sm text-stone-600">{p.whyScreen}</p><p className="text-xs text-emerald-700 mt-1">Potential value: {p.estimatedValue}</p><p className="text-xs text-amber-700 mt-1">Caveat: {p.caveat}</p>{p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline mt-1 inline-block">Program details →</a>}</div>))}
              </div>
            </Sec>
            <Sec title="Evidence Log" sub="All evidence used, with type and source.">
              <div className="bg-white border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100">
                {report.evidenceLog.map(e => (<div key={e.id} className="px-4 py-3 text-xs"><div className="flex items-center gap-2 mb-1"><span className="text-stone-400 font-mono">{e.id}</span><EvTag type={e.type} /><Conf c={e.confidence} /></div><p className="text-stone-600">{e.statement}</p><p className="text-stone-400">Source: {e.source}</p></div>))}
              </div>
            </Sec>
            <div className="text-xs text-stone-400 leading-relaxed border-t border-stone-200 pt-6 mt-6 mb-8">
              <p className="mb-2"><strong className="text-stone-500">About this analysis:</strong> Generated by a rule-based engine using address parsing and Vermont regulatory context. No property-specific records were retrieved. Every finding is tagged by evidence type and confidence. “Unresolved” items must be verified before acting.</p>
              <p>Not legal, tax, or engineering advice. All findings must be independently confirmed.</p>
            </div>
          </div>
        )}
        {!report && !loading && !error && (<div className="text-center py-8 text-sm text-stone-400"><p>Enter an address above, or tap an example to try it.</p></div>)}
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">© 2026 Alder Projects · Vermont</footer>
    </div>
  )
}

function Sec({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (<section className="mb-10"><h2 className="text-base font-semibold text-stone-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h2>{sub && <p className="text-xs text-stone-400 mb-4">{sub}</p>}{!sub && <div className="mb-4" />}{children}</section>)
}
