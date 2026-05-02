// Property page module catalog.
//
// The /property/[slug] page is composed of typed content modules. Each
// module declares how relevant it is to a visitor's intent topology
// (top-level intent, intent mode, topic, scope, town tier). The ranker
// (see property-ranker.ts) sorts the catalog against a VisitorSignals
// vector and the page renders the top-N.
//
// Module renders are JSX-returning closures that read from a typed
// PropertyProfile (matches /api/property's response). All renders are
// pure — they never mutate signals or kick off side effects.

import type { ReactNode, CSSProperties } from 'react'
import type { TownBucket } from '@/data/projects'
import EmailCaptureCard from '@/components/EmailCaptureCard'

// ---------- Visitor signal vector --------------------------------------

export type TownTier = TownBucket // alias for spec parity; data graph calls it TownBucket

export type TopLevelIntent = 'buying' | 'owner' | 'looking' | 'researching'

export type IntentMode = 'decide' | 'do' | 'understand' | 'lookup' | 'handle'

export type Scope = 'diy' | 'mid' | 'big' | 'na'

export type TopicId =
  | 'heat_pump'
  | 'kitchen'
  | 'bath'
  | 'solar_battery'
  | 'outdoor'
  | 'addition_adu'
  | 'weatherization'
  | 'rebate_strat'
  | 'property_tax'
  | 'flood_zone'
  | 'rebate_eligibility'
  | 'contractor_vetting'
  | 'general_orientation'
  | 'mud_season'
  | 'well_septic'

export const TOPICS: readonly TopicId[] = [
  'heat_pump',
  'kitchen',
  'bath',
  'solar_battery',
  'outdoor',
  'addition_adu',
  'weatherization',
  'rebate_strat',
  'property_tax',
  'flood_zone',
  'rebate_eligibility',
  'contractor_vetting',
  'general_orientation',
  'mud_season',
  'well_septic',
] as const

export type VisitorSignals = {
  topLevelIntent: TopLevelIntent
  intentMode: IntentMode
  topic: TopicId | null
  scope: Scope
  townTier: TownTier
  utilityServiceArea: string
  refundRiskFlag: boolean
  sessionDepth: number
  cameFromArticleSlug: string | null
}

// ---------- Profile shape (mirrors /api/property) ----------------------

export type SnapshotFact = { label: string; value: string }
export type CostRange = { low: number; high: number; median: number; unit: string }

export type CostScope = {
  scope: 'budget' | 'mid' | 'high'
  description: string
  whatsIn: string
  whatsNot: string
  pushesHigh: string
  cost: CostRange
  permitFee: { low: number; high: number; note: string }
  vtNotes: string
}

export type CostItem = { trade: string; label: string; scopes: CostScope[] }

export type RebateItem = {
  id: string
  program: string
  category: string
  who: string
  amount: string
  amountMaxUSD: number | null
  conditions: string
  howToClaim: string
  incomeBonus: string | null
  incomeLimit: string
  source: string
  isExpired: boolean
  utilityRelevant: boolean
}

export type ZoningSummary = {
  town: string
  county: string
  setbacks: { front: number; side: number; rear: number }
  maxLotCoverage: number
  maxBuildingHeight: number
  adu: {
    byRight: boolean
    maxSizeSqFt: number
    ownerOccupancyRequired: boolean
    parkingRequirement: string
    separateUtilities: string
    notes: string
  }
  permitFeeStructure: string
  overlays: string[]
  notes: string
  zoningOffice: string
}

export type RegulatorConcern = {
  title: string
  whyCheck: string
  howToResolve: string
  cost: string
  resolvedWhen: string
}

export type CalendarItem = {
  title: string
  window: string
  importance: string
  category: string
  description: string
  action: string
}

export type SequenceStep = {
  step: number
  title: string
  what: string
  whyThisOrder: string
  trap: string
  vtTiming: string
  duration: string
  applicableRebates: string[]
}

export type SequenceItem = {
  id: string
  title: string
  scenario: string
  totalCostMidVT: string
  totalRebateStack: string
  steps: SequenceStep[]
}

export type VettingItem = {
  id: string
  name: string
  description: string
  vtRationale: string
  howTo: string[]
  redFlags: string[]
  effort: 'low' | 'medium' | 'high'
  criticalFor: string[]
}

export type PropertyProfile = {
  address: string
  slug: string
  town: string
  county: string
  bucket: TownTier
  utility: string
  ami80HouseholdOf3: number | null
  generatedAt: string
  hero: { summary: string; facts: SnapshotFact[] }
  costs: { intro: string; items: CostItem[] }
  rebates: {
    intro: string
    items: RebateItem[]
    stack: { standardUSD: number; incomeQualifiedUSD: number; itemized: { id: string; standard: number; income: number }[] }
    utility: string
  }
  regulators: { intro: string; concerns: RegulatorConcern[]; zoning: ZoningSummary | null }
  calendar: { intro: string; items: CalendarItem[] }
  sequences: { intro: string; items: SequenceItem[] }
  vetting: { intro: string; items: VettingItem[] }
  dataLinks: { label: string; url: string; what: string }[]
  chatContext: Record<string, unknown>
}

// ---------- Module type ------------------------------------------------

export type ContentType =
  | 'cost'
  | 'rebate'
  | 'sequence'
  | 'vetting'
  | 'regulatory'
  | 'calendar'
  | 'cta'
  | 'info'

export type CtaType =
  | 'diy_amazon'
  | 'handyman'
  | 'contractor_bid'
  | 'briefing'
  | 'email_capture'
  | 'chat'
  | null

export type RelevanceFactors = {
  intentMatch: Record<TopLevelIntent, number>
  modeMatch: Record<IntentMode, number>
  topicMatch: Partial<Record<TopicId, number>>
  scopeMatch: Record<Scope, number>
  townTierMatch: Partial<Record<TownTier, number>>
  isUniversal: boolean
}

export type PropertyModule = {
  moduleId: string
  title: string
  contentType: ContentType
  relevanceFactors: RelevanceFactors
  revenueWeight: number
  ctaType: CtaType
  refundRiskCompatible: boolean
  render: (profile: PropertyProfile, signals: VisitorSignals) => ReactNode
}

// ---------- Style tokens (kept local to the catalog) ------------------

const C = {
  bg: '#FAF7F2',
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.12)',
  green: '#1C2B1A',
  greenInk: '#F5EFE0',
  pillBg: 'rgba(122,155,111,0.12)',
  okBg: '#EAF3DE',
  okInk: '#3B6D11',
}
const FD = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

const cardStyle: CSSProperties = {
  backgroundColor: C.card,
  border: `1px solid ${C.cardLine}`,
  borderRadius: 6,
  padding: '18px 20px',
}
const titleStyle: CSSProperties = {
  fontSize: 14,
  fontFamily: FB,
  color: C.ink,
  fontWeight: 600,
  margin: 0,
}
const kickerStyle: CSSProperties = {
  fontSize: 10,
  fontFamily: FM,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: C.accent,
  margin: '0 0 6px',
}

function Card({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <div style={cardStyle}>
      <p style={kickerStyle}>{kicker}</p>
      <p style={titleStyle}>{title}</p>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  )
}

function fmtUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return `$${n.toLocaleString()}`
}

function scopeLabel(s: 'budget' | 'mid' | 'high'): string {
  return s === 'budget' ? 'Budget refresh' : s === 'mid' ? 'Mid-range' : 'High end'
}

// ---------- Cost-by-trade module builder -------------------------------

const COST_TRADES: { trade: string; label: string; topic: TopicId | null }[] = [
  { trade: 'kitchen', label: 'Kitchen', topic: 'kitchen' },
  { trade: 'bathroom', label: 'Bathroom', topic: 'bath' },
  { trade: 'deck', label: 'Deck or porch', topic: 'outdoor' },
  { trade: 'addition', label: 'Addition', topic: 'addition_adu' },
  { trade: 'basement', label: 'Basement finishing', topic: null },
  { trade: 'roofing', label: 'Roofing', topic: null },
  { trade: 'siding', label: 'Siding', topic: null },
  { trade: 'window', label: 'Windows', topic: 'weatherization' },
  { trade: 'flooring', label: 'Flooring', topic: null },
  { trade: 'painting_interior', label: 'Interior painting', topic: null },
  { trade: 'painting_exterior', label: 'Exterior painting', topic: null },
  { trade: 'electrical_panel', label: 'Electrical panel', topic: 'heat_pump' },
  { trade: 'plumbing', label: 'Plumbing', topic: null },
  { trade: 'hvac', label: 'HVAC', topic: 'heat_pump' },
  { trade: 'adu', label: 'ADU', topic: 'addition_adu' },
]

function costModule(trade: string, label: string, primaryTopic: TopicId | null): PropertyModule {
  const topicMatch: Partial<Record<TopicId, number>> = {}
  if (primaryTopic) topicMatch[primaryTopic] = 10

  return {
    moduleId: `cost_${trade}`,
    title: `${label} — cost`,
    contentType: 'cost',
    relevanceFactors: {
      intentMatch: { buying: 4, owner: 7, looking: 3, researching: 2 },
      modeMatch: { decide: 6, do: 8, understand: 3, lookup: 2, handle: 1 },
      topicMatch,
      scopeMatch: { diy: 2, mid: 7, big: 9, na: 3 },
      townTierMatch: {},
      isUniversal: false,
    },
    revenueWeight: 4,
    ctaType: null,
    refundRiskCompatible: true,
    render: profile => {
      const item = profile.costs.items.find(t => t.trade === trade)
      if (!item) return null
      return (
        <Card kicker="Cost" title={item.label}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {item.scopes.map(s => (
              <div key={s.scope} style={{ borderTop: `1px solid ${C.cardLine}`, paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: 0, fontWeight: 500 }}>
                    {scopeLabel(s.scope)}
                  </p>
                  <p style={{ fontSize: 13, fontFamily: FM, color: C.accent, fontWeight: 600, margin: 0 }}>
                    {fmtUSD(s.cost.low)}–{fmtUSD(s.cost.high)}
                  </p>
                </div>
                <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.5, margin: '6px 0 0' }}>
                  {s.description}
                </p>
                <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: '4px 0 0' }}>
                  Median {fmtUSD(s.cost.median)} · permit ${s.permitFee.low}–${s.permitFee.high}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )
    },
  }
}

const COST_MODULES: PropertyModule[] = COST_TRADES.map(t => costModule(t.trade, t.label, t.topic))

// ---------- Rebate modules -------------------------------------------

const rebateHeadline: PropertyModule = {
  moduleId: 'rebate_dollar_headline',
  title: 'Rebate stack — dollar headline',
  contentType: 'rebate',
  relevanceFactors: {
    intentMatch: { buying: 7, owner: 9, looking: 5, researching: 6 },
    modeMatch: { decide: 8, do: 7, understand: 7, lookup: 8, handle: 5 },
    topicMatch: {
      heat_pump: 9,
      weatherization: 9,
      rebate_strat: 10,
      rebate_eligibility: 10,
      solar_battery: 7,
    },
    scopeMatch: { diy: 5, mid: 7, big: 9, na: 6 },
    townTierMatch: {},
    isUniversal: true,
  },
  revenueWeight: 5,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => (
    <div
      style={{
        backgroundColor: C.green,
        color: C.greenInk,
        borderRadius: 8,
        padding: '20px 24px',
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(245,239,224,0.5)',
          margin: '0 0 10px',
        }}
      >
        On the table for this property
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, alignItems: 'baseline' }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: 0 }}>Standard tier</p>
          <p style={{ fontFamily: FD, fontSize: 28, color: C.greenInk, margin: '4px 0 0', fontWeight: 600 }}>
            ${profile.rebates.stack.standardUSD.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: '4px 0 0' }}>
            Comprehensive retrofit, all households
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: 0 }}>Income-qualified</p>
          <p style={{ fontFamily: FD, fontSize: 28, color: C.accent, margin: '4px 0 0', fontWeight: 600 }}>
            ${profile.rebates.stack.incomeQualifiedUSD.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: '4px 0 0' }}>
            {profile.ami80HouseholdOf3
              ? `Household at or below ~$${profile.ami80HouseholdOf3.toLocaleString()} (HH3)`
              : 'At or below 80% AMI'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: 0 }}>Utility</p>
          <p style={{ fontSize: 14, fontFamily: FB, color: C.greenInk, margin: '4px 0 0', fontWeight: 500 }}>
            {profile.rebates.utility}
          </p>
        </div>
      </div>
    </div>
  ),
}

const rebateStackDetail: PropertyModule = {
  moduleId: 'rebate_stack_detail',
  title: 'Rebate stack — every program',
  contentType: 'rebate',
  relevanceFactors: {
    intentMatch: { buying: 5, owner: 8, looking: 4, researching: 6 },
    modeMatch: { decide: 6, do: 8, understand: 5, lookup: 9, handle: 4 },
    topicMatch: {
      rebate_strat: 10,
      rebate_eligibility: 9,
      heat_pump: 7,
      weatherization: 8,
      solar_battery: 6,
    },
    scopeMatch: { diy: 4, mid: 7, big: 8, na: 5 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 3,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => {
    const live = profile.rebates.items.filter(r => !r.isExpired)
    return (
      <Card kicker="Rebates" title="Every program that applies">
        <div style={{ display: 'grid', gap: 10 }}>
          {live.map(r => (
            <div
              key={r.id}
              style={{
                borderLeft: `3px solid ${r.utilityRelevant ? C.accent : 'rgba(28,43,26,0.2)'}`,
                paddingLeft: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                <p style={{ fontSize: 13, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{r.program}</p>
                <p style={{ fontSize: 12, fontFamily: FM, color: C.accent, fontWeight: 600, margin: 0 }}>{r.amount}</p>
              </div>
              <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.5, margin: '4px 0 0' }}>
                <strong>Who:</strong> {r.who}
              </p>
              <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: '4px 0 0', fontStyle: 'italic' }}>
                {r.howToClaim}
              </p>
            </div>
          ))}
        </div>
      </Card>
    )
  },
}

// ---------- Sequence modules -----------------------------------------

function sequenceModule(seqId: string, primaryTopic: TopicId | null, secondaryTopics: TopicId[] = []): PropertyModule {
  const topicMatch: Partial<Record<TopicId, number>> = {}
  if (primaryTopic) topicMatch[primaryTopic] = 10
  for (const t of secondaryTopics) topicMatch[t] = 7

  return {
    moduleId: `sequence_${seqId}`,
    title: `Sequence — ${seqId.replace(/_/g, ' ')}`,
    contentType: 'sequence',
    relevanceFactors: {
      intentMatch: { buying: 5, owner: 8, looking: 4, researching: 6 },
      modeMatch: { decide: 7, do: 9, understand: 6, lookup: 4, handle: 3 },
      topicMatch,
      scopeMatch: { diy: 3, mid: 7, big: 9, na: 4 },
      townTierMatch: {},
      isUniversal: false,
    },
    revenueWeight: 3,
    ctaType: null,
    refundRiskCompatible: true,
    render: profile => {
      const seq = profile.sequences.items.find(s => s.id === seqId)
      if (!seq) return null
      return (
        <Card kicker="Order of operations" title={seq.title}>
          <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 6px' }}>
            {seq.scenario}
          </p>
          <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: '0 0 14px' }}>
            <strong style={{ color: C.accent }}>Stacked rebates:</strong> {seq.totalRebateStack}
          </p>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {seq.steps.map(s => (
              <li key={s.step} style={{ display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr)', gap: 12, paddingTop: 8, borderTop: `1px solid ${C.cardLine}` }}>
                <span style={{ fontSize: 13, fontFamily: FM, color: C.inkFaint, fontWeight: 600 }}>
                  {String(s.step).padStart(2, '0')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 13, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{s.title}</p>
                    <span style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint }}>{s.duration}</span>
                  </div>
                  <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: '4px 0 0', lineHeight: 1.5 }}>{s.what}</p>
                  <p style={{ fontSize: 11, fontFamily: FB, color: C.inkFaint, margin: '4px 0 0', fontStyle: 'italic' }}>
                    Trap: {s.trap}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )
    },
  }
}

const SEQUENCE_MODULES: PropertyModule[] = [
  sequenceModule('oil_to_heat_pump', 'heat_pump', ['weatherization', 'rebate_strat']),
  sequenceModule('kitchen_bath_combined', 'kitchen', ['bath']),
  sequenceModule('roof_then_solar', 'solar_battery', ['heat_pump']),
]

// ---------- Regulatory + zoning modules -----------------------------

const regulatoryFlags: PropertyModule = {
  moduleId: 'regulatory_flags',
  title: 'Regulatory flags',
  contentType: 'regulatory',
  relevanceFactors: {
    intentMatch: { buying: 9, owner: 6, looking: 5, researching: 4 },
    modeMatch: { decide: 8, do: 5, understand: 6, lookup: 9, handle: 4 },
    topicMatch: { flood_zone: 9, addition_adu: 6, outdoor: 6 },
    scopeMatch: { diy: 4, mid: 6, big: 8, na: 6 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 2,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => {
    if (profile.regulators.concerns.length === 0) {
      return (
        <Card kicker="Regulators" title="Nothing flagged">
          <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
            No flood / shoreland / river-corridor overlay caught for this parcel. Standard town zoning applies.
          </p>
        </Card>
      )
    }
    return (
      <Card kicker="Regulators" title="What public data flagged">
        <div style={{ display: 'grid', gap: 10 }}>
          {profile.regulators.concerns.map(c => (
            <div key={c.title} style={{ paddingTop: 10, borderTop: `1px solid ${C.cardLine}` }}>
              <p style={{ fontSize: 13, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{c.title}</p>
              <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '4px 0 0' }}>{c.whyCheck}</p>
              <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: '6px 0 0' }}>
                <strong>Resolve:</strong> {c.howToResolve} · <strong style={{ color: C.accent }}>{c.cost}</strong>
              </p>
            </div>
          ))}
        </div>
      </Card>
    )
  },
}

const zoningSummary: PropertyModule = {
  moduleId: 'zoning_summary',
  title: 'Town zoning summary',
  contentType: 'regulatory',
  relevanceFactors: {
    intentMatch: { buying: 6, owner: 7, looking: 4, researching: 4 },
    modeMatch: { decide: 7, do: 7, understand: 6, lookup: 8, handle: 3 },
    topicMatch: { addition_adu: 10, outdoor: 7, flood_zone: 5 },
    scopeMatch: { diy: 4, mid: 7, big: 9, na: 5 },
    townTierMatch: { burlington_metro: 3, resort_premium: 3, small_city: 2 },
    isUniversal: false,
  },
  revenueWeight: 2,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => {
    const z = profile.regulators.zoning
    if (!z) return null
    return (
      <Card kicker="Zoning" title={`${z.town} bylaws`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
          <ZFact label="Setbacks (F/S/R)" value={`${z.setbacks.front}/${z.setbacks.side}/${z.setbacks.rear} ft`} />
          <ZFact label="Max coverage" value={`${Math.round(z.maxLotCoverage * 100)}%`} />
          <ZFact label="Max height" value={`${z.maxBuildingHeight} ft`} />
          <ZFact label="ADU by-right" value={z.adu.byRight ? 'Yes' : 'No'} />
          <ZFact label="ADU max sq ft" value={z.adu.maxSizeSqFt.toLocaleString()} />
          <ZFact label="Owner-occ?" value={z.adu.ownerOccupancyRequired ? 'Required' : 'Not required'} />
        </div>
        <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>{z.notes}</p>
        {z.overlays.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {z.overlays.map(o => (
              <span
                key={o}
                style={{ fontSize: 11, fontFamily: FB, color: C.ink, backgroundColor: C.pillBg, padding: '4px 10px', borderRadius: 999 }}
              >
                {o}
              </span>
            ))}
          </div>
        )}
      </Card>
    )
  },
}

function ZFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontFamily: FM, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.inkFaint, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, margin: '3px 0 0', fontWeight: 500 }}>{value}</p>
    </div>
  )
}

// ---------- Calendar module ------------------------------------------

const calendarModule: PropertyModule = {
  moduleId: 'calendar_in_season',
  title: 'In-season Vermont calendar',
  contentType: 'calendar',
  relevanceFactors: {
    intentMatch: { buying: 4, owner: 8, looking: 4, researching: 5 },
    modeMatch: { decide: 5, do: 7, understand: 6, lookup: 5, handle: 9 },
    topicMatch: { mud_season: 10, weatherization: 6, heat_pump: 5 },
    scopeMatch: { diy: 6, mid: 6, big: 5, na: 6 },
    townTierMatch: {},
    isUniversal: true,
  },
  revenueWeight: 2,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => {
    if (profile.calendar.items.length === 0) return null
    return (
      <Card kicker="When to do what" title="What is in season now">
        <div style={{ display: 'grid', gap: 10 }}>
          {profile.calendar.items.map(item => (
            <div key={item.title} style={{ paddingTop: 10, borderTop: `1px solid ${C.cardLine}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 13, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{item.title}</p>
                <span style={{ fontSize: 11, fontFamily: FM, color: C.accent, fontWeight: 600 }}>{item.window}</span>
              </div>
              <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '4px 0 0' }}>{item.description}</p>
              <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: '4px 0 0' }}>
                <strong style={{ color: C.accent }}>Action:</strong> {item.action}
              </p>
            </div>
          ))}
        </div>
      </Card>
    )
  },
}

// ---------- Vetting module -------------------------------------------

const vettingModule: PropertyModule = {
  moduleId: 'vetting_checklist',
  title: 'Contractor vetting checklist',
  contentType: 'vetting',
  relevanceFactors: {
    intentMatch: { buying: 4, owner: 8, looking: 3, researching: 5 },
    modeMatch: { decide: 6, do: 8, understand: 4, lookup: 7, handle: 3 },
    topicMatch: { contractor_vetting: 10 },
    scopeMatch: { diy: 1, mid: 7, big: 9, na: 5 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 3,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => (
    <Card kicker="Who to hire" title="Vermont vetting steps that catch bad actors">
      <div style={{ display: 'grid', gap: 10 }}>
        {profile.vetting.items.map(v => (
          <div key={v.id} style={{ paddingTop: 10, borderTop: `1px solid ${C.cardLine}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{v.name}</p>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: FM,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: v.effort === 'low' ? C.okInk : v.effort === 'high' ? C.accent : C.inkFaint,
                  backgroundColor: v.effort === 'low' ? C.okBg : v.effort === 'high' ? C.accentSoft : 'rgba(28,43,26,0.06)',
                  padding: '3px 8px',
                  borderRadius: 999,
                }}
              >
                {v.effort} effort
              </span>
            </div>
            <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: '6px 0 0', lineHeight: 1.55 }}>{v.description}</p>
            <p style={{ fontSize: 11, fontFamily: FB, color: C.inkFaint, margin: '4px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
              {v.vtRationale}
            </p>
          </div>
        ))}
      </div>
    </Card>
  ),
}

// ---------- New info modules tied to question chips ------------------

const floodRegulatoryDeepDive: PropertyModule = {
  moduleId: 'flood_regulatory_deep_dive',
  title: 'Flood, river corridor, wetlands, shoreland',
  contentType: 'info',
  relevanceFactors: {
    intentMatch: { buying: 10, owner: 6, looking: 5, researching: 7 },
    modeMatch: { decide: 7, do: 4, understand: 7, lookup: 9, handle: 4 },
    topicMatch: { flood_zone: 10, outdoor: 6, addition_adu: 5 },
    scopeMatch: { diy: 4, mid: 5, big: 7, na: 7 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 1,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => (
    <Card kicker="Deep dive" title="What the maps say about this parcel">
      <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 10px' }}>
        Vermont layers four overlays you should know about before drawing plans: FEMA SFHA flood zones, the
        Shoreland Protection Act buffer (250 ft from any lake bigger than 10 acres), state-mapped river
        corridors (where the river is allowed to move), and wetland delineations. Each one constrains what
        you can build, dig, or remove without a permit.
      </p>
      {profile.regulators.concerns.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, fontFamily: FB, color: C.ink, lineHeight: 1.6 }}>
          {profile.regulators.concerns.map(c => (
            <li key={c.title}>
              <strong>{c.title}.</strong> {c.whyCheck} <em>{c.cost}.</em>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: 0 }}>
          The narrative scan did not catch any of those four overlays for this address. The live overlay
          panel above runs the actual GIS query — trust that one over this summary.
        </p>
      )}
      <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: '12px 0 0' }}>
        For the binding answer: pull the parcel on the{' '}
        <a href="https://anrmaps.vermont.gov/websites/anra5/" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
          ANR Atlas
        </a>{' '}
        and ask the town zoning office.
      </p>
    </Card>
  ),
}

const rebateEligibilityCheck: PropertyModule = {
  moduleId: 'rebate_eligibility_check',
  title: 'Rebate eligibility — standard vs income tier',
  contentType: 'info',
  relevanceFactors: {
    intentMatch: { buying: 5, owner: 9, looking: 4, researching: 7 },
    modeMatch: { decide: 6, do: 6, understand: 5, lookup: 8, handle: 3 },
    topicMatch: { rebate_eligibility: 10, rebate_strat: 8, weatherization: 7, heat_pump: 6 },
    scopeMatch: { diy: 5, mid: 7, big: 7, na: 6 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 2,
  ctaType: null,
  refundRiskCompatible: true,
  render: profile => {
    const ami = profile.ami80HouseholdOf3
    return (
      <Card kicker="Eligibility" title="Are you in the income-qualified tier?">
        <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, lineHeight: 1.6, margin: '0 0 10px' }}>
          Standard EVT weatherization caps at <strong>{fmtUSD(profile.rebates.stack.standardUSD)}</strong> stacked.
          Income-qualified stacks to{' '}
          <strong style={{ color: C.accent }}>{fmtUSD(profile.rebates.stack.incomeQualifiedUSD)}</strong> — about
          ${(profile.rebates.stack.incomeQualifiedUSD - profile.rebates.stack.standardUSD).toLocaleString()} more.
          Worth checking.
        </p>
        <div style={{ backgroundColor: C.bg, padding: '12px 14px', borderRadius: 4, marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontFamily: FM, color: C.inkFaint, margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {profile.county} County, household of 3
          </p>
          <p style={{ fontSize: 18, fontFamily: FD, color: C.ink, fontWeight: 600, margin: '4px 0 0' }}>
            {ami ? `Income at or below $${ami.toLocaleString()}` : 'Check the EVT income tables for this county'}
          </p>
          <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: '4px 0 0' }}>
            Different household sizes shift the threshold ±$10–20k. The installer confirms when they file —
            we cannot promise eligibility.
          </p>
        </div>
        <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: 0 }}>
          The exact AMI table updates annually. Source:{' '}
          <a href="https://www.efficiencyvermont.com/income-eligible" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
            EVT income-eligible weatherization
          </a>
          .
        </p>
      </Card>
    )
  },
}

const contractorSanityCheck: PropertyModule = {
  moduleId: 'contractor_sanity_check',
  title: 'Contractor sanity check',
  contentType: 'info',
  relevanceFactors: {
    intentMatch: { buying: 3, owner: 8, looking: 4, researching: 5 },
    modeMatch: { decide: 6, do: 8, understand: 5, lookup: 8, handle: 4 },
    topicMatch: { contractor_vetting: 10 },
    scopeMatch: { diy: 1, mid: 8, big: 9, na: 5 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 3,
  ctaType: 'chat',
  refundRiskCompatible: true,
  render: profile => (
    <Card kicker="Quick check" title="Is this contractor legit?">
      <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 12px' }}>
        Three questions catch most of the trouble. If any answer is no, pause.
      </p>
      <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, fontFamily: FB, color: C.ink, lineHeight: 1.7 }}>
        <li>
          <strong>Are they on the VT AG residential contractor registry?</strong> Required for any project over $3,500
          since 2021. Free to look up at ago.vermont.gov/cap.
        </li>
        <li>
          <strong>Do they carry general liability AND workers comp?</strong> Get the COI directly from their insurer,
          not a screenshot from them. Lists you as Certificate Holder.
        </li>
        <li>
          <strong>Will they pull the permit in their name?</strong> Owner-pulled permits shift code-compliance
          liability to the homeowner. Contractor-pulled keeps it where the work is.
        </li>
      </ol>
      <p style={{ fontSize: 12, fontFamily: FB, color: C.inkFaint, margin: '12px 0 0', fontStyle: 'italic' }}>
        Want a deeper check for a specific contractor in {profile.town}? Ask the assistant — it has the full
        Vermont vetting playbook loaded.
      </p>
    </Card>
  ),
}

// ---------- Stub modules ---------------------------------------------

const propertyTaxLookup: PropertyModule = {
  moduleId: 'property_tax_lookup',
  title: 'Property tax lookup',
  contentType: 'info',
  relevanceFactors: {
    intentMatch: { buying: 7, owner: 8, looking: 4, researching: 5 },
    modeMatch: { decide: 5, do: 5, understand: 6, lookup: 9, handle: 3 },
    topicMatch: { property_tax: 10 },
    scopeMatch: { diy: 5, mid: 5, big: 5, na: 7 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 1,
  ctaType: 'chat',
  refundRiskCompatible: true,
  render: profile => (
    <Card kicker="Property tax" title={`What we have for ${profile.town}`}>
      <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 10px' }}>
        We do not have detailed assessed-value or rate data wired up for every Vermont town yet. The chat
        can tell you the cycle (Homestead Declaration by April 15, reappraisals on rolling town schedules,
        tax bills generally August/February) and point you at the right town form. For the actual numbers
        on this parcel, the town clerk is the source of truth.
      </p>
      <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: 0 }}>
        Try the search:{' '}
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(profile.town + ' Vermont town clerk')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: C.accent }}
        >
          {profile.town} town clerk
        </a>{' '}
        — most VT towns publish the grand list and tax rate online.
      </p>
    </Card>
  ),
}

const generalOrientation: PropertyModule = {
  moduleId: 'general_orientation',
  title: 'New-to-Vermont orientation',
  contentType: 'info',
  relevanceFactors: {
    intentMatch: { buying: 7, owner: 5, looking: 6, researching: 8 },
    modeMatch: { decide: 5, do: 4, understand: 9, lookup: 6, handle: 3 },
    topicMatch: { general_orientation: 10 },
    scopeMatch: { diy: 5, mid: 5, big: 5, na: 8 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 2,
  ctaType: 'chat',
  refundRiskCompatible: true,
  render: () => (
    <Card kicker="Orientation" title="First time around Vermont property?">
      <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, lineHeight: 1.65, margin: 0 }}>
        Three things to anchor on: <strong>Efficiency Vermont</strong> (the state's energy-efficiency utility,
        runs every weatherization and heat-pump rebate worth claiming); <strong>Act 47</strong> (statewide
        ADU-by-right rules from 2024 that override most town caps); <strong>Homestead Declaration</strong>
        {' '}(file by April 15 each year if this is your primary residence — affects your tax rate by ~$1/per
        $100 of value). The chat can drill into any of those, plus mud season, septic, well water, what makes
        VT contractors different from other states.
      </p>
    </Card>
  ),
}

// ---------- CTA modules ---------------------------------------------
//
// Tier-aware CTAs. Escalation is handled through the relevance vector:
// a CTA with scopeMatch.na = 0 / scopeMatch.big = 10 only floats up
// once the visitor commits to a scope tier. Heavy CTAs
// (contractor_bid) are also gated on a topic being chosen, so they
// never show on first paint.

const AMAZON_TAG = 'alderprojects-20'
function az(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`
}

function dispatchChatPrompt(text: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem('alder.chatPendingPrompt', text)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('alder:chatPrompt', { detail: { text } }))
}

const ctaDiyAmazon: PropertyModule = {
  moduleId: 'cta_diy_amazon',
  title: 'DIY tools and supplies',
  contentType: 'cta',
  relevanceFactors: {
    intentMatch: { buying: 2, owner: 6, looking: 3, researching: 2 },
    modeMatch: { decide: 4, do: 7, understand: 2, lookup: 3, handle: 4 },
    topicMatch: {
      weatherization: 8,
      heat_pump: 4,
      kitchen: 3,
      bath: 3,
      outdoor: 5,
      mud_season: 6,
    },
    scopeMatch: { diy: 9, mid: 2, big: 0, na: 0 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 2,
  ctaType: 'diy_amazon',
  refundRiskCompatible: true,
  render: (_profile, signals) => {
    const topic = signals.topic ?? 'weatherization'
    const items = diyKitFor(topic)
    return (
      <Card kicker="DIY" title="The kit if you are doing this yourself">
        <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>
          Same prices as everywhere — affiliate links keep the tool free. We only link to things we would buy.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {items.map(it => (
            <a
              key={it.label}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                fontSize: 11,
                fontFamily: FB,
                color: C.accent,
                textDecoration: 'none',
                padding: '4px 10px',
                border: `1px solid ${C.cardLine}`,
                borderRadius: 6,
              }}
            >
              {it.label} →
            </a>
          ))}
        </div>
      </Card>
    )
  },
}

function diyKitFor(topic: TopicId): { label: string; url: string }[] {
  // Curated kit per topic — 4-6 items each. Generic fallback for topics
  // without a specific DIY angle.
  const generic = [
    { label: 'Stud finder', url: az('stud finder magnetic') },
    { label: 'Cordless drill', url: az('cordless drill set') },
    { label: 'Painters tape', url: az('painters tape blue') },
  ]
  const map: Partial<Record<TopicId, { label: string; url: string }[]>> = {
    weatherization: [
      { label: 'Caulk + gun', url: az('silicone caulk gun kit') },
      { label: 'Foam sealant', url: az('great stuff foam sealant') },
      { label: 'Weatherstripping', url: az('door weatherstripping kit') },
      { label: 'Pipe insulation', url: az('pipe insulation foam outdoor') },
      { label: 'Window film', url: az('insulating window film kit') },
      { label: 'Smart leak sensors', url: az('wifi water leak sensor freeze alert') },
    ],
    heat_pump: [
      { label: 'Smart thermostat', url: az('smart thermostat wifi remote') },
      { label: 'Mini-split filter set', url: az('mini split filter universal') },
    ],
    outdoor: [
      { label: 'Pressure-treated screws', url: az('exterior deck screws') },
      { label: 'Composite deck cleaner', url: az('composite deck cleaner') },
      { label: 'Joist hangers', url: az('galvanized joist hangers') },
    ],
    mud_season: [
      { label: 'Boot dryer', url: az('boot dryer') },
      { label: 'Crushed stone bags', url: az('crushed stone gravel bag') },
      { label: 'Roof rake', url: az('roof rake snow removal') },
    ],
    kitchen: [
      { label: 'Cabinet hardware', url: az('cabinet pulls brushed nickel') },
      { label: 'Iron-on edge banding', url: az('iron on edge banding') },
    ],
    bath: [
      { label: 'Caulk + gun', url: az('silicone caulk gun kit bathroom') },
      { label: 'Grout pen', url: az('grout pen white') },
    ],
  }
  return map[topic] ?? generic
}

const ctaHandyman: PropertyModule = {
  moduleId: 'cta_handyman',
  title: 'Find a Vermont handyman',
  contentType: 'cta',
  relevanceFactors: {
    intentMatch: { buying: 2, owner: 8, looking: 3, researching: 2 },
    modeMatch: { decide: 5, do: 8, understand: 3, lookup: 4, handle: 7 },
    topicMatch: {
      weatherization: 6,
      heat_pump: 4,
      mud_season: 7,
      well_septic: 6,
      outdoor: 6,
      kitchen: 4,
      bath: 4,
    },
    scopeMatch: { diy: 1, mid: 9, big: 4, na: 0 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 4,
  ctaType: 'handyman',
  refundRiskCompatible: true,
  render: (profile, signals) => {
    const topicLabel = topicLabelFor(signals.topic)
    return (
      <Card kicker="Hire it out" title="Find a Vermont handyman">
        <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 12px' }}>
          Mid-tier work where a handyman beats a full GC on price and lead time.
          Most of these jobs are a one-day visit in {profile.town}.
        </p>
        <button
          type="button"
          onClick={() =>
            dispatchChatPrompt(`I need a handyman in ${profile.town} for ${topicLabel}.`)
          }
          style={{
            padding: '10px 18px',
            border: 'none',
            backgroundColor: C.accent,
            color: '#FAF7F2',
            borderRadius: 4,
            fontFamily: FB,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Find a Vermont handyman →
        </button>
      </Card>
    )
  },
}

const ctaContractorBid: PropertyModule = {
  moduleId: 'cta_contractor_bid',
  title: 'Get contractor bids',
  contentType: 'cta',
  relevanceFactors: {
    intentMatch: { buying: 0, owner: 9, looking: 4, researching: 2 },
    modeMatch: { decide: 7, do: 9, understand: 3, lookup: 4, handle: 4 },
    topicMatch: {
      heat_pump: 8,
      kitchen: 9,
      bath: 8,
      addition_adu: 9,
      solar_battery: 7,
      outdoor: 7,
    },
    // Escalation: scope=na suppresses heavily; scope=big pushes to top.
    scopeMatch: { diy: 0, mid: 6, big: 10, na: -2 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 10,
  ctaType: 'contractor_bid',
  refundRiskCompatible: false,
  render: (profile, signals) => (
    <EmailCaptureCard
      kind="contractor"
      profile={profile}
      topic={signals.topic}
    />
  ),
}

const ctaEmailCapture: PropertyModule = {
  moduleId: 'cta_email_capture',
  title: 'Send me this profile',
  contentType: 'cta',
  relevanceFactors: {
    intentMatch: { buying: 9, owner: 4, looking: 5, researching: 4 },
    modeMatch: { decide: 7, do: 4, understand: 6, lookup: 7, handle: 3 },
    topicMatch: {},
    scopeMatch: { diy: 5, mid: 5, big: 5, na: 6 },
    townTierMatch: {},
    isUniversal: false,
  },
  revenueWeight: 8,
  ctaType: 'email_capture',
  refundRiskCompatible: true,
  render: (profile, signals) => (
    <EmailCaptureCard kind="buyer" profile={profile} topic={signals.topic} />
  ),
}

function topicLabelFor(t: TopicId | null): string {
  if (!t) return 'a small project'
  const map: Record<TopicId, string> = {
    heat_pump: 'a heat pump install',
    kitchen: 'a kitchen project',
    bath: 'a bathroom project',
    solar_battery: 'a solar + battery install',
    outdoor: 'a deck or outdoor project',
    addition_adu: 'an addition or ADU',
    weatherization: 'weatherization work',
    rebate_strat: 'planning the rebate stack',
    property_tax: 'property tax help',
    flood_zone: 'flood / shoreland questions',
    rebate_eligibility: 'rebate eligibility',
    contractor_vetting: 'vetting a contractor',
    general_orientation: 'general orientation',
    mud_season: 'mud-season prep',
    well_septic: 'a well or septic job',
  }
  return map[t]
}

// ---------- Catalog -------------------------------------------------

export const MODULES: PropertyModule[] = [
  rebateHeadline,
  rebateStackDetail,
  ...COST_MODULES,
  ...SEQUENCE_MODULES,
  regulatoryFlags,
  zoningSummary,
  calendarModule,
  vettingModule,
  floodRegulatoryDeepDive,
  rebateEligibilityCheck,
  contractorSanityCheck,
  propertyTaxLookup,
  generalOrientation,
  ctaDiyAmazon,
  ctaHandyman,
  ctaContractorBid,
  ctaEmailCapture,
]
