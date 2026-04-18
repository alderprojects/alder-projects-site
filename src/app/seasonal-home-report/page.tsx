import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seasonal Home Analysis: Caspian Lake Camp — Alder Projects',
  description: 'Sample property analysis for a 1952 lakefront camp in Greensboro, VT. Ranked improvement actions, risk flags, and Vermont incentives — infrastructure before aesthetics.',
  openGraph: {
    title: 'Seasonal Home Analysis: Caspian Lake Camp — Alder Projects',
    description: 'What should you fix first on a Vermont seasonal property? A constraint-first analysis of a Greensboro lakefront camp.',
    url: 'https://alderprojects.com/seasonal-home-report',
    siteName: 'Alder Projects',
  },
  alternates: { canonical: 'https://alderprojects.com/seasonal-home-report' },
}

const property = {
  id: 'VT-001',
  address: '142 Lakeshore Drive',
  town: 'Greensboro',
  county: 'Orleans',
  yearBuilt: 1952,
  sqft: 980,
  lotAcres: 0.4,
  beds: 2,
  baths: 1,
  assessed: 185000,
  marketEst: 310000,
  seasonal: true,
  waterfront: true,
  usePattern: 'Summer only, 8–12 weeks',
  heating: 'Propane wall heater',
  septic: true,
  well: true,
  notes: 'Classic lakefront camp on Caspian Lake. Older septic, shallow well. Shoreland buffer zone applies. No insulation. Seasonal road access only.',
}

const compositeScore = 43.8

const dimensionScores = [
  { category: 'Infrastructure Viability', score: 25, confidence: 55, factors: 'Pre-1970 septic is high-risk; private well needs testing; wall heater inadequate for VT winters' },
  { category: 'Resilience / Maintenance', score: 35, confidence: 45, factors: '1952 construction with high deferred maintenance; rural location; waterfront exposure' },
  { category: 'Tax Sensitivity', score: 40, confidence: 60, factors: 'Non-homestead classification; low assessment ratio (60%) creates reassessment risk' },
  { category: 'Regulatory Friction', score: 45, confidence: 55, factors: 'Waterfront triggers shoreland protection; multiple regulatory touchpoints' },
  { category: 'Use Flexibility', score: 50, confidence: 50, factors: 'Seasonal-only use limits flexibility' },
  { category: 'Energy Incentive Fit', score: 70, confidence: 50, factors: 'Propane heating eligible for heat pump conversion; pre-1980 qualifies for weatherization' },
  { category: 'Liquidity / Exit Fit', score: 70, confidence: 45, factors: 'Waterfront properties have strong demand in Vermont' },
]

const riskFlags = [
  { title: 'Aging Septic System', severity: 'high' as const, category: 'Infrastructure', description: 'Septic system potentially 74+ years old. Failure risk is elevated. Replacement costs $15,000–40,000+ in Vermont. A failed system can block property sale and habitation.' },
  { title: 'Shoreland Protection Restrictions', severity: 'high' as const, category: 'Regulatory', description: 'Waterfront location triggers Vermont Shoreland Protection Act. Expansion, clearing, and impervious surface additions are restricted within 250 ft of mean water level.' },
  { title: 'Private Well — Testing Required', severity: 'medium' as const, category: 'Infrastructure', description: 'Private wells in Vermont can have arsenic, coliform, or flow issues. Testing is inexpensive but critical. Lenders typically require satisfactory results.' },
  { title: 'Non-Homestead Tax Classification', severity: 'medium' as const, category: 'Tax', description: 'Seasonal homes are taxed at Vermont’s non-residential education tax rate. Major improvements may trigger reassessment.' },
  { title: 'Pre-1960 Building Envelope', severity: 'medium' as const, category: 'Resilience', description: 'Construction year 1952 suggests potential issues with foundation, insulation, wiring, and structural integrity. Lead paint and asbestos may be present.' },
]

const recommendations = [
  { rank: 1, title: 'Assess and stabilize septic/wastewater system', type: 'Constraint Removal', priority: 100, cost: '$2,000–30,000+', upside: 'Removes single largest constraint on property use and sale', taxImpact: 'None directly, but failed septic can block sale', skipIf: 'System was inspected and passed within last 3 years', rationale: 'A failing septic system can render a property unsaleable and unusable. This is constraint #1 for most older Vermont seasonal properties.' },
  { rank: 2, title: 'Verify and test water supply', type: 'Constraint Removal', priority: 98, cost: '$200–5,000', upside: 'Confirms potability and flow; required for any use change', taxImpact: 'None', skipIf: 'Water tested within last 12 months with clean results', rationale: 'Well water quality and flow rate are non-negotiable for habitation. Coliform, arsenic, and flow issues are common in rural Vermont.' },
  { rank: 3, title: 'Upgrade heating and winterization', type: 'Constraint Removal', priority: 93, cost: '$3,000–25,000', upside: 'Extends usable season; reduces pipe-burst risk; may enable year-round rental', taxImpact: 'Heat pump installs may qualify for Efficiency Vermont rebates and federal 25C credit', skipIf: 'Property is truly summer-only camp with no plumbing to freeze', rationale: 'Many Vermont seasonal homes have inadequate heating for shoulder-season use. Winterization is the gateway to use flexibility.' },
  { rank: 4, title: 'Screen expansion through shoreland/zoning review', type: 'Regulatory Screen', priority: 90, cost: '$500–3,000', upside: 'Prevents costly violations; identifies what is actually buildable', taxImpact: 'None, but violations carry fines and forced remediation', skipIf: 'No expansion or site work planned', rationale: 'Vermont shoreland protection rules gate nearly all waterfront improvements. Check before designing.' },
  { rank: 5, title: 'Address roof and building envelope', type: 'Resilience', priority: 72, cost: '$5,000–30,000', upside: 'Prevents cascading damage; extends building life; reduces insurance risk', taxImpact: 'Insulation component may qualify for Efficiency Vermont rebates', skipIf: 'Roof replaced within last 15 years and envelope is sound', rationale: 'A compromised envelope accelerates decay of everything inside. This is resilience, not aesthetics.' },
  { rank: 6, title: 'Improve access road and site drainage', type: 'Resilience', priority: 68, cost: '$2,000–15,000', upside: 'Reliable access; reduced erosion; lower flood/mud-season risk', taxImpact: 'None typically', skipIf: 'Town-maintained road with adequate drainage', rationale: 'Mud season and storm runoff can make rural Vermont properties inaccessible.' },
  { rank: 7, title: 'Review property tax classification', type: 'Tax Optimization', priority: 65, cost: '$0–500', upside: 'Correct classification; avoid surprise reassessment after improvements', taxImpact: 'Homestead vs non-residential rates differ significantly in Vermont', skipIf: 'Classification was reviewed within last tax year', rationale: 'Vermont’s homestead declaration affects tax rates. Second homes are taxed at the non-residential rate.' },
  { rank: 8, title: 'Bundle energy upgrades with incentives', type: 'Incentive Capture', priority: 40, cost: '$5,000–20,000 (net after rebates)', upside: 'Reduced carrying costs; improved comfort; rebates offset 30–50% of cost', taxImpact: 'Efficiency Vermont rebates, federal 25C/25D credits', skipIf: 'Infrastructure constraints are unresolved', rationale: 'Energy improvements have the best incentive coverage in Vermont but should not precede constraint resolution.' },
  { rank: 9, title: 'Defer cosmetic and custom finishes', type: 'Avoid', priority: 10, cost: 'N/A', upside: 'Avoids sinking capital into finishes that don’t survive a septic replacement', taxImpact: 'None', skipIf: 'All infrastructure and regulatory items are resolved', rationale: 'Custom kitchens and designer bathrooms are the lowest-priority spend for seasonal properties with unresolved constraints.' },
]

const incentives = [
  { name: 'Efficiency Vermont Rebates', provider: 'Efficiency Vermont', reason: 'All Vermont electric ratepayers are eligible for rebates on insulation, heat pumps, and appliances.', value: '$500–4,000 depending on scope', url: 'https://www.efficiencyvermont.com/rebates' },
  { name: 'Federal 25C Clean Energy Credit', provider: 'IRS / Federal', reason: 'Propane wall heater is a candidate for heat pump conversion.', value: '30% of cost, up to $2,000/year', url: null },
  { name: 'Vermont Weatherization Assistance', provider: 'VT Office of Economic Opportunity', reason: 'Pre-1952 construction likely has poor insulation and air sealing.', value: 'Free for income-eligible; otherwise market-rate', url: null },
  { name: 'Vermont Net Metering / Solar', provider: 'Vermont PUC / Green Mountain Power', reason: 'Solar may offset electricity costs, especially if converting to heat pumps.', value: 'Varies by system size', url: null },
]

function severityColor(s: 'high' | 'medium' | 'low') {
  if (s === 'high') return 'bg-red-100 text-red-800 border-red-200'
  if (s === 'medium') return 'bg-amber-50 text-amber-800 border-amber-200'
  return 'bg-green-50 text-green-800 border-green-200'
}

function severityIcon(s: 'high' | 'medium' | 'low') {
  if (s === 'high') return '●'
  if (s === 'medium') return '○'
  return '○'
}

function typeColor(t: string) {
  if (t === 'Constraint Removal') return 'bg-red-700 text-white'
  if (t === 'Regulatory Screen') return 'bg-amber-600 text-white'
  if (t === 'Resilience') return 'bg-sky-700 text-white'
  if (t === 'Tax Optimization') return 'bg-violet-700 text-white'
  if (t === 'Incentive Capture') return 'bg-emerald-700 text-white'
  if (t === 'Avoid') return 'bg-stone-500 text-white'
  return 'bg-stone-300 text-stone-800'
}

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 60 ? 'bg-emerald-600' : pct >= 40 ? 'bg-amber-500' : 'bg-red-600'
  return (
    <div className="w-full bg-stone-200 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function SeasonalHomeReport() {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="font-serif text-xl font-semibold text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>Alder Projects</a>
          <span className="text-xs tracking-widest uppercase text-stone-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>Sample Report</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">Property Analysis</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Caspian Lake Camp</h1>
          <p className="text-stone-500 text-lg">{property.address}, {property.town}, {property.county} County, VT</p>
          <p className="text-stone-400 text-sm mt-1">Sample analysis &middot; Synthetic data &middot; {property.id}</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-8 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-red-300 flex items-center justify-center bg-red-50">
                <span className="text-3xl font-semibold text-red-700">{compositeScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-stone-800 mb-1">Composite Score: {compositeScore} / 100</h2>
              <p className="text-stone-500 text-sm leading-relaxed">Weighted across infrastructure viability, use flexibility, regulatory friction, tax sensitivity, energy incentive fit, resilience, and liquidity. Scores below 50 indicate significant unresolved constraints. This property has infrastructure and regulatory issues that should be addressed before any aesthetic or expansion spending.</p>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-stone-200 p-8 mb-10 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Property Snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-sm">
            {[
              ['Year Built', property.yearBuilt],
              ['Size', `${property.sqft} sq ft / ${property.lotAcres} acres`],
              ['Beds / Baths', `${property.beds} / ${property.baths}`],
              ['Assessed Value', `$${property.assessed.toLocaleString()}`],
              ['Est. Market Value', `$${property.marketEst.toLocaleString()}`],
              ['Seasonal', property.seasonal ? 'Yes' : 'No'],
              ['Waterfront', property.waterfront ? 'Yes' : 'No'],
              ['Use Pattern', property.usePattern],
              ['Heating', property.heating],
              ['Septic', property.septic ? 'Yes (on-site)' : 'Municipal'],
              ['Well', property.well ? 'Yes (private)' : 'Municipal'],
            ].map(([label, val]) => (
              <div key={label as string}>
                <span className="text-stone-400">{label}</span>
                <p className="text-stone-800 font-medium">{val}</p>
              </div>
            ))}
          </div>
          <p className="text-stone-500 text-sm mt-5 pt-4 border-t border-stone-100">{property.notes}</p>
        </section>

        <section className="bg-white rounded-xl border border-stone-200 p-8 mb-10 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Dimension Scores</h2>
          <p className="text-sm text-stone-400 mb-5">Sorted lowest-to-highest. Lower scores indicate more urgent constraints.</p>
          <div className="space-y-4">
            {dimensionScores.map((d) => (
              <div key={d.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-stone-700">{d.category}</span>
                  <span className="text-sm font-semibold text-stone-800">{d.score}</span>
                </div>
                <ScoreBar score={d.score} />
                <p className="text-xs text-stone-400 mt-1">{d.factors}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Risk Flags</h2>
          <div className="space-y-3">
            {riskFlags.map((f) => (
              <div key={f.title} className={`rounded-lg border p-5 ${severityColor(f.severity)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg leading-none">{severityIcon(f.severity)}</span>
                  <h3 className="font-semibold">{f.title}</h3>
                  <span className="ml-auto text-xs uppercase tracking-wide opacity-70">{f.severity} &middot; {f.category}</span>
                </div>
                <p className="text-sm leading-relaxed opacity-90">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Recommended Actions</h2>
          <p className="text-sm text-stone-400 mb-5">Ranked by priority. Constraint removal and regulatory screening always outrank aesthetic upgrades.</p>
          <div className="space-y-4">
            {recommendations.map((r) => (
              <div key={r.rank} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100">
                  <span className="text-2xl font-semibold text-stone-300 w-8">{r.rank}</span>
                  <div className="flex-1"><h3 className="font-semibold text-stone-800">{r.title}</h3></div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColor(r.type)}`}>{r.type}</span>
                  <span className="text-sm font-semibold text-stone-600">{r.priority}/100</span>
                </div>
                <div className="px-6 py-4 text-sm text-stone-600 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <p><span className="text-stone-400">Est. cost:</span> {r.cost}</p>
                    <p><span className="text-stone-400">Upside:</span> {r.upside}</p>
                    <p><span className="text-stone-400">Tax/credit:</span> {r.taxImpact}</p>
                    <p><span className="text-stone-400">Skip if:</span> {r.skipIf}</p>
                  </div>
                  <p className="text-stone-500 pt-2 border-t border-stone-50">{r.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-stone-200 p-8 mb-10 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Incentives &amp; Programs to Investigate</h2>
          <p className="text-sm text-stone-400 mb-5">Potential fits based on property characteristics. Not confirmed eligibility.</p>
          <div className="space-y-4">
            {incentives.map((inc) => (
              <div key={inc.name} className="border-l-2 border-emerald-400 pl-4">
                <h3 className="font-semibold text-stone-800 text-sm">{inc.name}</h3>
                <p className="text-xs text-stone-400">{inc.provider}</p>
                <p className="text-sm text-stone-600 mt-1">{inc.reason}</p>
                <p className="text-sm text-emerald-700 font-medium mt-0.5">{inc.value}</p>
                {inc.url && (<a href={inc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline mt-1 inline-block">More info &rarr;</a>)}
              </div>
            ))}
          </div>
        </section>

        <div className="text-xs text-stone-400 leading-relaxed border-t border-stone-200 pt-6 mt-12">
          <p className="mb-2"><strong className="text-stone-500">About this report:</strong> This is a sample analysis generated by the Vermont Seasonal Home Optimization Engine, a rule-based decision engine built by Alder Projects. The property shown is synthetic. Scores are computed from weighted dimensions prioritizing infrastructure viability, regulatory constraints, and tax sensitivity over aesthetic upgrades.</p>
          <p>This is not legal, tax, or engineering advice. Verify all findings with qualified professionals before acting. Incentive eligibility, regulatory requirements, and property conditions must be independently confirmed.</p>
        </div>

        <div className="text-center mt-12 mb-8">
          <a href="/" className="inline-block px-8 py-3 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 transition-colors">Back to Alder Projects</a>
        </div>
      </main>

      <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>&copy; 2026 Alder Projects &middot; Vermont</footer>
    </div>
  )
}
