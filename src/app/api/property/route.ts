import { NextRequest, NextResponse } from 'next/server'
import {
  getRebatesForState,
  utilityForTown,
  ami80ForCounty,
  type Rebate,
  type Utility,
} from '@/data/rebates'
import {
  getProjectCostsForState,
  bucketForTown,
  type ProjectCost,
  type TownBucket,
} from '@/data/projects'
import { zoningForTown, type TownZoning } from '@/data/zoning'
import { activeCalendarItems, type CalendarEntry } from '@/data/calendar'
import { getVettingStepsForState, type VettingStep } from '@/data/contractor-vetting'
import { getSequencesForState, type ProjectSequence } from '@/data/sequences'

export const runtime = 'nodejs'
export const maxDuration = 30

// /api/property — unified property profile.
// Calls /api/seasonal-report for the address parser + heuristic concerns,
// then layers state-tagged data graph entries on top: real cost ranges by
// town bucket, real rebate stack with utility-aware bonuses, real zoning
// for the top-tier towns, real calendar items for the current window,
// real contractor-vetting steps, and the canonical project sequences.

const STATE = 'VT' as const

type SnapshotFact = { label: string; value: string }
type Concern = { title: string; whyCheck: string; howToResolve: string; resolvedWhen: string; cost: string }
type SeasonalSummary = {
  summary: string
  snapshot: { address: string; town: string; county: string; facts: SnapshotFact[] }
  concerns: Concern[]
  dataLinks: { label: string; url: string; what: string }[]
  generatedAt: string
}

async function fetchSeasonalReport(address: string, originUrl: string) {
  const url = new URL('/api/seasonal-report', originUrl).toString()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
    signal: AbortSignal.timeout(10000),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data) {
    return { error: data?.error || 'Could not look up that address.', suggestion: data?.suggestion as string | undefined, status: res.status || 502 } as const
  }
  return { ok: true, data: data as SeasonalSummary } as const
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const address: string | undefined = body?.address
    if (!address || address.trim().length < 3) {
      return NextResponse.json(
        { error: 'Address required.', suggestion: 'Example: 142 Lakeshore Drive, Greensboro, VT' },
        { status: 400 }
      )
    }

    const origin = new URL(req.url).origin
    const seasonal = await fetchSeasonalReport(address.trim(), origin)
    if ('error' in seasonal) {
      return NextResponse.json({ error: seasonal.error, suggestion: seasonal.suggestion }, { status: seasonal.status })
    }

    const profile = compose(seasonal.data)
    return NextResponse.json(profile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: 'Property lookup failed.', detail: msg.substring(0, 200) }, { status: 500 })
  }
}

function compose(seasonal: SeasonalSummary) {
  const town = seasonal.snapshot.town
  const county = seasonal.snapshot.county
  const bucket = bucketForTown(town)
  const utility = utilityForTown(town)
  const ami80 = ami80ForCounty(county)
  const zoning = zoningForTown(town)

  return {
    address: seasonal.snapshot.address,
    slug: slugify(seasonal.snapshot.address),
    town,
    county,
    bucket,
    utility,
    ami80HouseholdOf3: ami80,
    generatedAt: seasonal.generatedAt,

    hero: buildHero(seasonal, bucket, utility, ami80),
    costs: buildCosts(bucket),
    rebates: buildRebates(utility, ami80),
    regulators: buildRegulators(seasonal.concerns, zoning),
    calendar: buildCalendar(),
    sequences: buildSequences(),
    vetting: buildVetting(),

    dataLinks: seasonal.dataLinks,
    chatContext: {
      address: seasonal.snapshot.address,
      town,
      county,
      bucket,
      utility,
      ami80HouseholdOf3: ami80,
      summary: seasonal.summary,
      facts: seasonal.snapshot.facts,
      concerns: (seasonal.concerns || []).slice(0, 5).map(c => ({ title: c.title, whyCheck: c.whyCheck })),
    },
  }
}

// ---------- Section builders ----------

function buildHero(seasonal: SeasonalSummary, bucket: TownBucket, utility: Utility, ami80: number | null) {
  const facts: SnapshotFact[] = [
    { label: 'Town', value: seasonal.snapshot.town },
    { label: 'County', value: `${seasonal.snapshot.county} County` },
    { label: 'Cost tier', value: bucketLabel(bucket) },
    { label: 'Utility', value: utilityLabel(utility) },
  ]
  if (ami80) facts.push({ label: '80% AMI (HH3)', value: `~$${ami80.toLocaleString()}` })
  // Carry through whatever extras the heuristic parser added — water, market.
  for (const f of seasonal.snapshot.facts) {
    if (['Water', 'Market'].includes(f.label)) facts.push(f)
  }
  return { summary: seasonal.summary, facts }
}

function buildCosts(bucket: TownBucket) {
  const all: ProjectCost[] = getProjectCostsForState(STATE)
  // Group by trade so the page can render trade → 1-3 scope cards.
  const byTrade = new Map<string, ProjectCost[]>()
  for (const p of all) {
    const arr = byTrade.get(p.trade) ?? []
    arr.push(p)
    byTrade.set(p.trade, arr)
  }
  const items = Array.from(byTrade.entries()).map(([trade, scopes]) => ({
    trade,
    label: tradeLabel(trade),
    scopes: scopes
      .sort((a, b) => scopeRank(a.scope) - scopeRank(b.scope))
      .map(s => ({
        scope: s.scope,
        description: s.description,
        whatsIn: s.whatsIn,
        whatsNot: s.whatsNot,
        pushesHigh: s.pushesHigh,
        cost: s.costs[bucket],
        permitFee: s.permitFee,
        vtNotes: s.vtNotes,
      })),
  }))
  return {
    intro: `Real ranges for ${bucketLabel(bucket).toLowerCase()} pricing. Pre-rebate, pre-tax. Add 15% contingency on anything pre-1950.`,
    items,
  }
}

function buildRebates(utility: Utility, ami80: number | null) {
  const all = getRebatesForState(STATE)
  const items = all.map(r => ({
    id: r.id,
    program: r.program,
    category: r.category,
    who: r.who,
    amount: r.amount,
    amountMaxUSD: r.amountMaxUSD,
    conditions: r.conditions,
    howToClaim: r.howToClaim,
    incomeBonus: r.incomeBonus,
    incomeLimit: r.incomeLimit,
    source: r.source,
    isExpired: r.amount === 'EXPIRED',
    // Surface utility relevance — used by the renderer to highlight stacks
    // that apply to this property's utility (income bonuses are utility-tied).
    utilityRelevant: r.incomeBonus
      ? r.incomeBonus.includes(utility)
      : true,
  }))

  const stack = computeStackTotal(all)

  return {
    intro:
      ami80
        ? `What is on the table for this property. Income-qualified tier (household at or below ~$${ami80.toLocaleString()} for a household of 3) more than doubles the headline weatherization cap.`
        : 'What is on the table for this property. Most homeowners do not realise these stack.',
    items,
    stack,
    utility: utilityLabel(utility),
  }
}

// Sums the canonical comprehensive-retrofit stack: weatherization +
// ducted heat pump + oil-to-electric bonus + heat pump water heater +
// panel upgrade. Real numbers; income tier calls out the delta.
function computeStackTotal(rebates: Rebate[]): { standardUSD: number; incomeQualifiedUSD: number; itemized: { id: string; standard: number; income: number }[] } {
  const ids = ['evt_weatherization_standard', 'evt_ducted_heatpump', 'oil_to_electric', 'evt_heatpump_water_heater', 'evt_panel_upgrade']
  const incomeIds = ['evt_weatherization_income', 'evt_ducted_heatpump', 'oil_to_electric', 'evt_heatpump_water_heater', 'evt_panel_upgrade']

  let standard = 0
  let income = 0
  const itemized: { id: string; standard: number; income: number }[] = []
  for (const id of ids) {
    const r = rebates.find(x => x.id === id)
    const v = r?.amountMaxUSD ?? 0
    standard += v
    itemized.push({ id, standard: v, income: 0 })
  }
  for (const id of incomeIds) {
    const r = rebates.find(x => x.id === id)
    const v = r?.amountMaxUSD ?? 0
    income += v
    const row = itemized.find(x => x.id === id) ?? { id, standard: 0, income: 0 }
    row.income = v
    if (!itemized.find(x => x.id === id)) itemized.push(row)
  }
  // Income tier also unlocks utility income bonuses on heat pump + panel.
  // Rough: GMP $2,000 HP + $1,500 panel = $3,500. Roll into income figure.
  income += 3500

  return { standardUSD: standard, incomeQualifiedUSD: income, itemized }
}

function buildRegulators(concerns: Concern[], zoning: TownZoning | null) {
  return {
    intro: zoning
      ? `${zoning.town} has its own bylaws on top of state rules. Worth knowing before you draw plans.`
      : 'Vermont state rules apply. Smaller towns lean on Act 250 once you cross 10 acres or trigger commercial use.',
    concerns: concerns || [],
    zoning: zoning
      ? {
          town: zoning.town,
          county: zoning.county,
          setbacks: zoning.setbacks,
          maxLotCoverage: zoning.maxLotCoverage,
          maxBuildingHeight: zoning.maxBuildingHeight,
          adu: zoning.adu,
          permitFeeStructure: zoning.permitFeeStructure,
          overlays: zoning.overlays,
          notes: zoning.notes,
          zoningOffice: zoning.zoningOffice,
        }
      : null,
  }
}

function buildCalendar() {
  const now = new Date()
  const active: CalendarEntry[] = activeCalendarItems(now, STATE)
  // Sort active items by importance, then category. Cap at 6 — the page
  // needs a digest, not the whole annual calendar.
  const order: Record<CalendarEntry['importance'], number> = { critical: 0, high: 1, medium: 2, low: 3 }
  const items = active
    .sort((a, b) => order[a.importance] - order[b.importance])
    .slice(0, 6)
    .map(e => ({
      title: e.title,
      window: formatWindow(e),
      importance: e.importance,
      category: e.category,
      description: e.description,
      action: e.homeownerAction,
    }))
  return {
    intro: `What is in season right now. Skip a step here and you redo it later.`,
    items,
  }
}

function buildSequences() {
  // Show the canonical Vermont retrofit path. The frontend renders it as a
  // collapsible step-by-step. Pull the top 3 most broadly relevant sequences.
  const all: ProjectSequence[] = getSequencesForState(STATE)
  const featuredIds = ['oil_to_heat_pump', 'kitchen_bath_combined', 'roof_then_solar']
  const items = featuredIds
    .map(id => all.find(s => s.id === id))
    .filter((s): s is ProjectSequence => Boolean(s))
    .map(s => ({
      id: s.id,
      title: s.title,
      scenario: s.scenario,
      totalCostMidVT: s.totalCostMidVT,
      totalRebateStack: s.totalRebateStack,
      steps: s.steps.map(st => ({
        step: st.step,
        title: st.title,
        what: st.what,
        whyThisOrder: st.whyThisOrder,
        trap: st.trap,
        vtTiming: st.vtTiming,
        duration: st.duration,
        applicableRebates: st.applicableRebates,
      })),
    }))
  return {
    intro: 'The canonical Vermont order of operations. Doing these out of order is where money leaks.',
    items,
  }
}

function buildVetting() {
  const all: VettingStep[] = getVettingStepsForState(STATE)
  // Surface the lowest-effort, highest-leverage steps first.
  const order: Record<VettingStep['effort'], number> = { low: 0, medium: 1, high: 2 }
  const items = [...all]
    .sort((a, b) => order[a.effort] - order[b.effort])
    .map(v => ({
      id: v.id,
      name: v.name,
      description: v.description,
      vtRationale: v.vtRationale,
      howTo: v.howTo,
      redFlags: v.redFlags,
      effort: v.effort,
      criticalFor: v.criticalFor,
    }))
  return {
    intro: 'Vermont has no GC license, so vetting is on you. These checks catch the contractors who would not survive elsewhere.',
    items,
  }
}

// ---------- Helpers ----------

function bucketLabel(b: TownBucket): string {
  switch (b) {
    case 'burlington_metro': return 'Burlington metro'
    case 'chittenden_other': return 'Chittenden county (outside metro)'
    case 'resort_premium': return 'Resort / second-home market'
    case 'small_city': return 'Small Vermont city'
    case 'rural': return 'Rural Vermont'
  }
}

function utilityLabel(u: Utility): string {
  switch (u) {
    case 'GMP': return 'Green Mountain Power'
    case 'BED': return 'Burlington Electric'
    case 'VPPSA': return 'VPPSA member utility'
    case 'VGS': return 'Vermont Gas Systems'
    case 'WEC': return 'Washington Electric Co-op'
    case 'unknown': return 'Check with town'
  }
}

function tradeLabel(t: string): string {
  const map: Record<string, string> = {
    kitchen: 'Kitchen', bathroom: 'Bathroom', deck: 'Deck or porch', addition: 'Addition',
    basement: 'Basement finishing', roofing: 'Roofing', siding: 'Siding', window: 'Windows',
    flooring: 'Flooring', painting_interior: 'Interior painting', painting_exterior: 'Exterior painting',
    electrical_panel: 'Electrical panel', plumbing: 'Plumbing', hvac: 'HVAC', adu: 'ADU',
  }
  return map[t] ?? t
}

function scopeRank(s: 'budget' | 'mid' | 'high'): number {
  return s === 'budget' ? 0 : s === 'mid' ? 1 : 2
}

function formatWindow(e: CalendarEntry): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const start = `${months[e.startMonth - 1]} ${e.startDay}`
  const end = `${months[e.endMonth - 1]} ${e.endDay}`
  if (e.startMonth === e.endMonth && e.startDay === e.endDay) return start
  return `${start} – ${end}`
}
