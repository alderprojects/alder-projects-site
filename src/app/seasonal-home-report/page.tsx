'use client'

import { useState } from 'react'

type EvidenceType = 'FACT' | 'INFERENCE' | 'REGIONAL_CONTEXT' | 'UNRESOLVED'

interface Evidence {
  id: string
  statement: string
  type: EvidenceType
  source: string
  confidence: 'high' | 'moderate' | 'low'
  verifyHow?: string
}

interface RiskFlag {
  title: string
  severity: 'high' | 'medium' | 'low'
  category: string
  description: string
  supportingEvidence: string[]
  verifyNext: string
}

interface Action {
  title: string
  actionType: string
  priority: 'critical' | 'high' | 'moderate' | 'low' | 'defer'
  costRange: string
  upside: string
  taxCreditNote: string
  avoidIf: string
  rationale: string
  supportingEvidence: string[]
}

interface Program {
  name: string
  provider: string
  whyScreen: string
  estimatedValue: string
  caveat: string
  url?: string
}

interface PropertySnapshot {
  normalizedAddress: string
  town: string
  county: string
  state: string
  facts: { label: string; value: string; evidenceType: EvidenceType; source: string }[]
}

interface AnalysisReport {
  snapshot: PropertySnapshot
  confirmed: Evidence[]
  inferred: Evidence[]
  unresolved: Evidence[]
  risks: RiskFlag[]
  actions: Action[]
  programs: Program[]
  evidenceLog: Evidence[]
  thinData: boolean
  generatedAt: string
}

function evidenceTypeTag(t: EvidenceType) {
  const styles: Record<EvidenceType, string> = {
    FACT: 'bg-emerald-100 text-emerald-800',
    INFERENCE: 'bg-amber-100 text-amber-800',
    REGIONAL_CONTEXT: 'bg-sky-100 text-sky-800',
    UNRESOLVED: 'bg-red-100 text-red-800',
  }
  const labels: Record<EvidenceType, string> = {
    FACT: 'Fact',
    INFERENCE: 'Inference',
    REGIONAL_CONTEXT: 'VT Context',
    UNRESOLVED: 'Unresolved',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[t]}`}>{labels[t]}</span>
}

function confidenceTag(c: 'high' | 'moderate' | 'low') {
  const styles = { high: 'text-emerald-700', moderate: 'text-amber-700', low: 'text-red-700' }
  return <span className={`text-xs ${styles[c]}`}>{c} confidence</span>
}

function severityStyle(s: 'high' | 'medium' | 'low') {
  if (s === 'high') return 'border-l-red-600 bg-red-50'
  if (s === 'medium') return 'border-l-amber-500 bg-amber-50'
  return 'border-l-stone-400 bg-stone-50'
}

function priorityTag(p: string) {
  const styles: Record<string, string> = {
    critical: 'bg-red-700 text-white',
    high: 'bg-amber-600 text-white',
    moderate: 'bg-sky-700 text-white',
    low: 'bg-stone-500 text-white',
    defer: 'bg-stone-400 text-white',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[p] || 'bg-stone-300'}`}>{p}</span>
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-stone-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h2>
      {subtitle && <p className="text-xs text-stone-400 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </section>
  )
}

export default function SeasonalHomeReport() {
  const [address, setAddress] = useState('')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim()) return
    setLoading(true)
    setError('')
    setReport(null)
    try {
      const res = await fetch('/api/seasonal-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed.')
      } else {
        setReport(data)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const evidenceMap: Record<string, Evidence> = {}
  if (report) {
    report.evidenceLog.forEach(e => { evidenceMap[e.id] = e })
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-semibold text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>Alder Projects</a>
          <span className="text-xs tracking-widest uppercase text-stone-400">Seasonal Home Engine</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-stone-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Vermont Seasonal Home Analysis</h1>
          <p className="text-sm text-stone-500 mb-6 leading-relaxed max-w-xl">Enter a Vermont address to generate an evidence-led analysis. The engine identifies what is known, what is inferred, what is unknown, and what to do first. It prioritizes infrastructure constraints over aesthetic upgrades.</p>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 142 Lakeshore Drive, Greensboro, VT" className="flex-1 px-4 py-3 border border-stone-300 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent bg-white" />
            <button type="submit" disabled={loading || !address.trim()} className="px-6 py-3 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">{loading ? 'Analyzing...' : 'Analyze'}</button>
          </form>
          {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>}
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin mb-4" />
            <p className="text-sm text-stone-500">Gathering evidence and computing analysis...</p>
          </div>
        )}

        {report && (
          <div>
            {report.thinData && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-1">Limited evidence available</p>
                <p className="text-xs text-amber-700 leading-relaxed">This analysis is based on address parsing and Vermont-wide regulatory context only. No property-specific records (assessment, septic, listing data) were retrieved. Findings below are framed accordingly — each item is tagged as a confirmed fact, inference, regional context, or unresolved unknown.</p>
              </div>
            )}

            <Section title="Property Snapshot">
              <div className="bg-white border border-stone-200 rounded-lg p-5">
                <p className="font-medium text-stone-800 mb-3">{report.snapshot.normalizedAddress}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {report.snapshot.facts.map(f => (
                    <div key={f.label} className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-stone-400 text-xs">{f.label}</span>
                        <p className="text-stone-700">{f.value}</p>
                      </div>
                      {evidenceTypeTag(f.evidenceType)}
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="What We Know" subtitle="Confirmed facts and applicable Vermont regulatory context.">
              <div className="space-y-2">
                {report.confirmed.map(e => (
                  <div key={e.id} className="bg-white border border-stone-200 rounded-lg p-4 text-sm">
                    <div className="flex items-start gap-2 mb-1">{evidenceTypeTag(e.type)}{confidenceTag(e.confidence)}</div>
                    <p className="text-stone-700 leading-relaxed">{e.statement}</p>
                    <p className="text-xs text-stone-400 mt-1">Source: {e.source}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="What We Infer" subtitle="Heuristic conclusions from available evidence. Each should be verified.">
              <div className="space-y-2">
                {report.inferred.map(e => (
                  <div key={e.id} className="bg-white border border-amber-200 rounded-lg p-4 text-sm">
                    <div className="flex items-start gap-2 mb-1">{evidenceTypeTag(e.type)}{confidenceTag(e.confidence)}</div>
                    <p className="text-stone-700 leading-relaxed">{e.statement}</p>
                    <p className="text-xs text-stone-400 mt-1">Basis: {e.source}</p>
                    {e.verifyHow && <p className="text-xs text-amber-700 mt-1">Verify: {e.verifyHow}</p>}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Unknowns — Must Verify" subtitle="Critical information gaps. These must be resolved before committing capital.">
              <div className="space-y-2">
                {report.unresolved.map(e => (
                  <div key={e.id} className="bg-white border border-red-200 rounded-lg p-4 text-sm">
                    <div className="flex items-start gap-2 mb-1">{evidenceTypeTag(e.type)}</div>
                    <p className="text-stone-700 leading-relaxed">{e.statement}</p>
                    {e.verifyHow && <p className="text-xs text-red-700 mt-1">How to resolve: {e.verifyHow}</p>}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Top Risk Flags" subtitle="Ordered by severity. Each links to supporting evidence.">
              <div className="space-y-3">
                {report.risks.map(r => (
                  <div key={r.title} className={`border-l-4 rounded-lg p-5 ${severityStyle(r.severity)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-stone-800 text-sm">{r.title}</h3>
                      <span className="text-xs uppercase text-stone-400">{r.severity} · {r.category}</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed mb-2">{r.description}</p>
                    <p className="text-xs text-stone-500">Verify next: {r.verifyNext}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Ranked Actions" subtitle="Constraint investigation and regulatory screening always rank above aesthetic work.">
              <div className="space-y-3">
                {report.actions.map((a, i) => (
                  <div key={a.title} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-stone-100">
                      <span className="text-lg font-semibold text-stone-300 w-6">{i + 1}</span>
                      <h3 className="flex-1 font-semibold text-stone-800 text-sm">{a.title}</h3>
                      {priorityTag(a.priority)}
                      <span className="text-xs text-stone-400">{a.actionType}</span>
                    </div>
                    <div className="px-5 py-4 text-sm text-stone-600 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                        <p><span className="text-stone-400">Cost range:</span> {a.costRange}</p>
                        <p><span className="text-stone-400">Upside:</span> {a.upside}</p>
                        <p><span className="text-stone-400">Tax/credit:</span> {a.taxCreditNote}</p>
                        <p><span className="text-stone-400">Skip if:</span> {a.avoidIf}</p>
                      </div>
                      <p className="text-stone-500 text-xs pt-2 border-t border-stone-50">{a.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Programs Worth Screening" subtitle="Potential incentive fits. Eligibility is not confirmed — screen each before relying on it.">
              <div className="space-y-3">
                {report.programs.map(p => (
                  <div key={p.name} className="bg-white border border-stone-200 rounded-lg p-4">
                    <h3 className="font-semibold text-stone-800 text-sm">{p.name}</h3>
                    <p className="text-xs text-stone-400 mb-1">{p.provider}</p>
                    <p className="text-sm text-stone-600">{p.whyScreen}</p>
                    <p className="text-xs text-emerald-700 mt-1">Potential value: {p.estimatedValue}</p>
                    <p className="text-xs text-amber-700 mt-1">Caveat: {p.caveat}</p>
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline mt-1 inline-block">Program details →</a>}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Evidence Log" subtitle="All evidence items used in this analysis, with type and source.">
              <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-stone-100">
                  {report.evidenceLog.map(e => (
                    <div key={e.id} className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-stone-400 font-mono">{e.id}</span>
                        {evidenceTypeTag(e.type)}
                        {confidenceTag(e.confidence)}
                      </div>
                      <p className="text-stone-600">{e.statement}</p>
                      <p className="text-stone-400">Source: {e.source}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <div className="text-xs text-stone-400 leading-relaxed border-t border-stone-200 pt-6 mt-6">
              <p className="mb-2"><strong className="text-stone-500">About this analysis:</strong> Generated by the Vermont Seasonal Home Optimization Engine. This is a rule-based analysis using address parsing and Vermont-wide regulatory context. No property-specific records were retrieved in this version. Every finding is tagged with its evidence type and confidence level. Items marked “Unresolved” must be verified before acting.</p>
              <p>This is not legal, tax, or engineering advice. All findings must be independently confirmed by qualified professionals.</p>
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-12 text-sm text-stone-400">
            <p>Enter a Vermont address above to generate an analysis.</p>
            <p className="mt-1 text-xs">The engine works best with a full address including town and “VT”.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">© 2026 Alder Projects · Vermont</footer>
    </div>
  )
}
