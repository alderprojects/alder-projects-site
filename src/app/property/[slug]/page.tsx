import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

// Per-address pages are noindex by decision. They are working surfaces for
// a homeowner, not SEO entry points; the SEO entry points are the town and
// guide pages.
export async function generateMetadata({
  searchParams,
  params,
}: {
  params: { slug: string }
  searchParams?: { address?: string }
}): Promise<Metadata> {
  const address = (searchParams?.address || '').trim() || deslug(params.slug)
  return {
    title: `Property profile · ${address} · Alder Projects`,
    description:
      'Vermont property profile — what to do, what it costs, what the regulators say, what to hire out. Built from public Vermont data and the Alder rebate stack.',
    robots: { index: false, follow: false },
  }
}

function deslug(slug: string): string {
  let s = slug.replace(/-+/g, ' ').trim()
  if (/\bvt\b/i.test(s)) s = s.replace(/\bvt\b/i, ', VT')
  else s = `${s}, VT`
  return s
}

// ---- Profile types — mirror /api/property response ----------------------

type SnapshotFact = { label: string; value: string }
type CostRange = { low: number; high: number; median: number; unit: string }

type Profile = {
  address: string
  slug: string
  town: string
  county: string
  bucket: string
  utility: string
  ami80HouseholdOf3: number | null
  generatedAt: string
  hero: { summary: string; facts: SnapshotFact[] }
  costs: {
    intro: string
    items: {
      trade: string
      label: string
      scopes: {
        scope: 'budget' | 'mid' | 'high'
        description: string
        whatsIn: string
        whatsNot: string
        pushesHigh: string
        cost: CostRange
        permitFee: { low: number; high: number; note: string }
        vtNotes: string
      }[]
    }[]
  }
  rebates: {
    intro: string
    items: {
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
    }[]
    stack: {
      standardUSD: number
      incomeQualifiedUSD: number
      itemized: { id: string; standard: number; income: number }[]
    }
    utility: string
  }
  regulators: {
    intro: string
    concerns: { title: string; whyCheck: string; howToResolve: string; cost: string; resolvedWhen: string }[]
    zoning: {
      town: string
      county: string
      setbacks: { front: number; side: number; rear: number }
      maxLotCoverage: number
      maxBuildingHeight: number
      adu: { byRight: boolean; maxSizeSqFt: number; ownerOccupancyRequired: boolean; parkingRequirement: string; separateUtilities: string; notes: string }
      permitFeeStructure: string
      overlays: string[]
      notes: string
      zoningOffice: string
    } | null
  }
  calendar: {
    intro: string
    items: { title: string; window: string; importance: string; category: string; description: string; action: string }[]
  }
  sequences: {
    intro: string
    items: {
      id: string
      title: string
      scenario: string
      totalCostMidVT: string
      totalRebateStack: string
      steps: {
        step: number
        title: string
        what: string
        whyThisOrder: string
        trap: string
        vtTiming: string
        duration: string
        applicableRebates: string[]
      }[]
    }[]
  }
  vetting: {
    intro: string
    items: {
      id: string
      name: string
      description: string
      vtRationale: string
      howTo: string[]
      redFlags: string[]
      effort: 'low' | 'medium' | 'high'
      criticalFor: string[]
    }[]
  }
  dataLinks: { label: string; url: string; what: string }[]
  chatContext: Record<string, unknown>
}

type ApiError = { error: string; suggestion?: string }

async function loadProfile(address: string): Promise<Profile | ApiError> {
  const h = headers()
  const host = h.get('host') || 'alderprojects.com'
  const proto = h.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  try {
    const res = await fetch(`${proto}://${host}/api/property`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
      cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data) {
      return { error: data?.error || 'Could not load property profile.', suggestion: data?.suggestion }
    }
    return data as Profile
  } catch {
    return { error: 'Network hiccup loading the property profile.' }
  }
}

// ---- Style tokens — match the rest of the site ------------------------

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
}
const FD = "'Playfair Display', Georgia, serif"
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

// ---- Page ---------------------------------------------------------------

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { address?: string }
}) {
  const address = (searchParams?.address || '').trim() || deslug(params.slug)
  const data = await loadProfile(address)

  if ('error' in data) return <ErrorView error={data.error} suggestion={data.suggestion} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>
      <Nav />
      <AddressStrip address={data.address} />

      <main
        className="property-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '40px 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: 40,
          alignItems: 'start',
        }}
      >
        <article style={{ minWidth: 0 }}>
          <SectionHero data={data} />
          <SectionCosts data={data} />
          <SectionRebates data={data} />
          <SectionRegulators data={data} />
          <SectionWhenToDo data={data} />
          <SectionVetting data={data} />
          {data.dataLinks.length > 0 && <Sources data={data} />}
        </article>

        <aside className="property-aside" style={{ position: 'sticky', top: 88, alignSelf: 'start' }}>
          <ChatPanel data={data} />
        </aside>
      </main>

      <Footer />

      {/* Mobile: collapse the grid (acceptable, not optimised). */}
      <style>{`
        @media (max-width: 960px) {
          .property-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .property-aside {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}

// ---- Top-level chrome ---------------------------------------------------

function ErrorView({ error, suggestion }: { error: string; suggestion?: string }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg }}>
      <Nav />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '120px 24px' }}>
        <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Could not load this property
        </p>
        <h1 style={{ fontFamily: FD, fontSize: '2rem', color: C.ink, marginBottom: 16 }}>{error}</h1>
        {suggestion && (
          <p style={{ fontFamily: FB, fontSize: 15, color: C.inkSoft, lineHeight: 1.7, marginBottom: 24 }}>
            {suggestion}
          </p>
        )}
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: C.ink,
            color: C.greenInk,
            fontFamily: FB,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: 3,
          }}
        >
          Try another address →
        </Link>
      </main>
      <Footer />
    </div>
  )
}

function AddressStrip({ address }: { address: string }) {
  return (
    <div
      style={{
        backgroundColor: C.green,
        color: C.greenInk,
        padding: '14px 24px',
        fontFamily: FB,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontSize: 10,
              fontFamily: FM,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(245,239,224,0.5)',
              marginRight: 12,
            }}
          >
            Property profile
          </span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{address}</span>
        </div>
        <Link href="/" style={{ fontSize: 12, color: 'rgba(245,239,224,0.7)', textDecoration: 'underline' }}>
          Try another address
        </Link>
      </div>
    </div>
  )
}

function ChatPanel({ data }: { data: Profile }) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.cardLine}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.cardLine}`, backgroundColor: C.bg }}>
        <p
          style={{
            fontSize: 10,
            fontFamily: FM,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.inkFaint,
            marginBottom: 4,
          }}
        >
          Ask about this property
        </p>
        <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, lineHeight: 1.5, margin: 0 }}>
          The assistant has the profile loaded as context. Ask anything specific to this house.
        </p>
      </div>
      <ChatWidget
        source={`property_profile_${data.slug}`}
        variant="inline"
        propertyProfile={data.chatContext}
        greeting={`I have the profile loaded for ${data.address}. Ask anything — flood, septic, rebates, what to do first, what it might cost.`}
      />
    </div>
  )
}

// ---- Section building blocks ----------------------------------------

function SectionShell({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string
  title: string
  intro?: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.accent,
          marginBottom: 8,
        }}
      >
        {kicker}
      </p>
      <h2
        style={{
          fontFamily: FD,
          fontSize: 'clamp(1.4rem, 2.4vw, 1.8rem)',
          fontWeight: 600,
          color: C.ink,
          marginBottom: 10,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {intro && (
        <p
          style={{
            fontSize: 14,
            fontFamily: FB,
            color: C.inkSoft,
            lineHeight: 1.6,
            margin: '8px 0 24px',
            maxWidth: 680,
          }}
        >
          {intro}
        </p>
      )}
      {children}
    </section>
  )
}

// ---- Hero ---------------------------------------------------------------

function SectionHero({ data }: { data: Profile }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <p
        style={{
          fontSize: 11,
          fontFamily: FM,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.accent,
          marginBottom: 14,
        }}
      >
        Here is the deal with this property
      </p>
      <h1
        style={{
          fontFamily: FD,
          fontSize: 'clamp(1.8rem, 3.4vw, 2.4rem)',
          fontWeight: 600,
          color: C.ink,
          lineHeight: 1.2,
          marginBottom: 20,
          margin: 0,
        }}
      >
        {data.hero.summary}
      </h1>
      {data.hero.facts.length > 0 && (
        <div
          style={{
            marginTop: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            paddingTop: 24,
            borderTop: `1px solid ${C.cardLine}`,
          }}
        >
          {data.hero.facts.map(f => (
            <div key={f.label}>
              <p
                style={{
                  fontSize: 10,
                  fontFamily: FM,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.inkFaint,
                  margin: 0,
                }}
              >
                {f.label}
              </p>
              <p style={{ fontSize: 14, fontFamily: FB, color: C.ink, margin: '4px 0 0', fontWeight: 500 }}>
                {f.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ---- Costs --------------------------------------------------------------

function fmtUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return `$${n.toLocaleString()}`
}

function scopeLabel(s: 'budget' | 'mid' | 'high'): string {
  return s === 'budget' ? 'Budget refresh' : s === 'mid' ? 'Mid-range' : 'High end'
}

function SectionCosts({ data }: { data: Profile }) {
  if (data.costs.items.length === 0) return null
  return (
    <SectionShell kicker="Section 2" title="What it will cost" intro={data.costs.intro}>
      <div style={{ display: 'grid', gap: 18 }}>
        {data.costs.items.map(trade => (
          <div
            key={trade.trade}
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.cardLine}`,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.cardLine}`, backgroundColor: C.bg }}>
              <p style={{ fontSize: 14, fontFamily: FB, color: C.ink, fontWeight: 600, margin: 0 }}>{trade.label}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {trade.scopes.map(s => (
                <div
                  key={s.scope}
                  style={{
                    padding: '14px 18px',
                    borderRight: `1px solid ${C.cardLine}`,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 6,
                      gap: 8,
                    }}
                  >
                    <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: 0, fontWeight: 500 }}>
                      {scopeLabel(s.scope)}
                    </p>
                    <p style={{ fontSize: 13, fontFamily: FM, color: C.accent, margin: 0, fontWeight: 600 }}>
                      {fmtUSD(s.cost.low)}–{fmtUSD(s.cost.high)}
                    </p>
                  </div>
                  <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
                    {s.description}
                  </p>
                  <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: '6px 0 0' }}>
                    Median {fmtUSD(s.cost.median)} · permit ${s.permitFee.low}–${s.permitFee.high}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

// ---- Rebates ------------------------------------------------------------

function SectionRebates({ data }: { data: Profile }) {
  const live = data.rebates.items.filter(r => !r.isExpired)
  const expired = data.rebates.items.filter(r => r.isExpired)
  return (
    <SectionShell kicker="Section 3" title="The money on the table" intro={data.rebates.intro}>
      <div
        style={{
          backgroundColor: C.green,
          color: C.greenInk,
          borderRadius: 6,
          padding: '20px 24px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 18,
            alignItems: 'baseline',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontFamily: FM,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(245,239,224,0.5)',
                margin: 0,
              }}
            >
              Comprehensive retrofit stack
            </p>
            <p style={{ fontFamily: FD, fontSize: 28, color: C.greenInk, margin: '4px 0 0', fontWeight: 600 }}>
              ${data.rebates.stack.standardUSD.toLocaleString()}
            </p>
            <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: '4px 0 0' }}>
              Standard tier · weatherization + heat pump + oil-to-electric + HPWH + panel
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontFamily: FM,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(245,239,224,0.5)',
                margin: 0,
              }}
            >
              If income-qualified
            </p>
            <p style={{ fontFamily: FD, fontSize: 28, color: C.accent, margin: '4px 0 0', fontWeight: 600 }}>
              ${data.rebates.stack.incomeQualifiedUSD.toLocaleString()}
            </p>
            <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: '4px 0 0' }}>
              {data.ami80HouseholdOf3
                ? `Household at or below ~$${data.ami80HouseholdOf3.toLocaleString()} (HH3)`
                : 'Household at or below 80% AMI for the county'}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontFamily: FM,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(245,239,224,0.5)',
                margin: 0,
              }}
            >
              Utility
            </p>
            <p style={{ fontSize: 14, fontFamily: FB, color: C.greenInk, margin: '4px 0 0', fontWeight: 500 }}>
              {data.rebates.utility}
            </p>
            <p style={{ fontSize: 11, fontFamily: FM, color: 'rgba(245,239,224,0.55)', margin: '4px 0 0' }}>
              Income bonuses on heat pump and panel are utility-tied
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {live.map(r => (
          <div
            key={r.id}
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.cardLine}`,
              borderLeft: `3px solid ${r.utilityRelevant ? C.accent : 'rgba(28,43,26,0.2)'}`,
              borderRadius: 4,
              padding: '14px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 16,
                marginBottom: 6,
                flexWrap: 'wrap',
              }}
            >
              <p style={{ fontSize: 14, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{r.program}</p>
              <p style={{ fontSize: 13, fontFamily: FM, color: C.accent, fontWeight: 600, margin: 0 }}>{r.amount}</p>
            </div>
            <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: '0 0 6px', lineHeight: 1.55 }}>
              <strong>Who:</strong> {r.who}
            </p>
            <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, margin: '0 0 6px', lineHeight: 1.55 }}>
              {r.conditions}
            </p>
            {r.incomeBonus && (
              <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: '6px 0 0', lineHeight: 1.55 }}>
                <strong style={{ color: C.accent }}>Income bonus:</strong> {r.incomeBonus}
              </p>
            )}
            <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: '8px 0 0' }}>
              <em>{r.howToClaim}</em>
            </p>
          </div>
        ))}
      </div>

      {expired.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: 10,
              fontFamily: FM,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: C.inkFaint,
              marginBottom: 8,
            }}
          >
            Already expired (do not budget)
          </p>
          <div style={{ display: 'grid', gap: 6 }}>
            {expired.map(r => (
              <p
                key={r.id}
                style={{
                  fontSize: 12,
                  fontFamily: FB,
                  color: C.inkFaint,
                  margin: 0,
                  textDecoration: 'line-through',
                }}
              >
                {r.program} — {r.conditions}
              </p>
            ))}
          </div>
        </div>
      )}
    </SectionShell>
  )
}

// ---- Regulators ---------------------------------------------------------

function SectionRegulators({ data }: { data: Profile }) {
  const z = data.regulators.zoning
  return (
    <SectionShell kicker="Section 4" title="What the regulators say" intro={data.regulators.intro}>
      {z && (
        <div
          style={{
            backgroundColor: C.card,
            border: `1px solid ${C.cardLine}`,
            borderRadius: 6,
            padding: '18px 20px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <p style={{ fontSize: 14, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>
              {z.town} zoning at a glance
            </p>
            <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, margin: 0 }}>{z.zoningOffice}</p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <ZFact label="Setbacks (F/S/R)" value={`${z.setbacks.front}/${z.setbacks.side}/${z.setbacks.rear} ft`} />
            <ZFact label="Max coverage" value={`${Math.round(z.maxLotCoverage * 100)}%`} />
            <ZFact label="Max height" value={`${z.maxBuildingHeight} ft`} />
            <ZFact label="ADU by-right" value={z.adu.byRight ? 'Yes' : 'No'} />
            <ZFact label="ADU max" value={`${z.adu.maxSizeSqFt.toLocaleString()} sq ft`} />
            <ZFact label="Owner-occ?" value={z.adu.ownerOccupancyRequired ? 'Required' : 'Not required'} />
          </div>
          <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 8px' }}>
            {z.notes}
          </p>
          {z.overlays.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {z.overlays.map(o => (
                <span
                  key={o}
                  style={{
                    fontSize: 11,
                    fontFamily: FB,
                    color: C.ink,
                    backgroundColor: C.pillBg,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  {o}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {data.regulators.concerns.length === 0 ? (
        <p style={{ fontSize: 14, fontFamily: FB, color: C.inkSoft, fontStyle: 'italic', margin: 0 }}>
          No specific regulatory flags from the public-data scan. Standard town rules apply — no flood / shoreland /
          river-corridor overlay caught.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {data.regulators.concerns.map(c => (
            <div
              key={c.title}
              style={{ backgroundColor: C.card, border: `1px solid ${C.cardLine}`, borderRadius: 4, padding: '14px 18px' }}
            >
              <p style={{ fontSize: 14, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{c.title}</p>
              <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.6, margin: '6px 0 10px' }}>
                {c.whyCheck}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  paddingTop: 10,
                  borderTop: `1px solid ${C.cardLine}`,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontFamily: FM,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: C.inkFaint,
                      margin: 0,
                    }}
                  >
                    How to resolve
                  </p>
                  <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: '4px 0 0', lineHeight: 1.5 }}>
                    {c.howToResolve}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontFamily: FM,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: C.inkFaint,
                      margin: 0,
                    }}
                  >
                    Cost
                  </p>
                  <p style={{ fontSize: 12, fontFamily: FM, color: C.accent, margin: '4px 0 0', fontWeight: 600 }}>
                    {c.cost}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

function ZFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: C.inkFaint,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, margin: '3px 0 0', fontWeight: 500 }}>{value}</p>
    </div>
  )
}

// ---- When to do what (calendar + sequences) ----------------------------

function SectionWhenToDo({ data }: { data: Profile }) {
  return (
    <SectionShell kicker="Section 5" title="When to do what" intro={data.calendar.intro}>
      {data.calendar.items.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
          {data.calendar.items.map(item => (
            <div
              key={item.title}
              style={{
                backgroundColor: C.card,
                border: `1px solid ${C.cardLine}`,
                borderRadius: 4,
                padding: '14px 18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 4,
                }}
              >
                <p style={{ fontSize: 14, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{item.title}</p>
                <span style={{ fontSize: 11, fontFamily: FM, color: C.accent, fontWeight: 600 }}>{item.window}</span>
              </div>
              <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 6px' }}>
                {item.description}
              </p>
              <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: 0, lineHeight: 1.55 }}>
                <strong style={{ color: C.accent }}>Action:</strong> {item.action}
              </p>
            </div>
          ))}
        </div>
      )}

      {data.sequences.items.length > 0 && (
        <>
          <p
            style={{
              fontSize: 11,
              fontFamily: FM,
              color: C.inkFaint,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            And if you are taking on the work — order of operations
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {data.sequences.items.map(seq => (
              <details
                key={seq.id}
                style={{
                  backgroundColor: C.card,
                  border: `1px solid ${C.cardLine}`,
                  borderRadius: 4,
                  padding: '12px 18px',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    fontFamily: FB,
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.ink,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{seq.title}</span>
                  <span style={{ fontSize: 11, fontFamily: FM, color: C.accent, fontWeight: 500 }}>
                    {seq.totalCostMidVT}
                  </span>
                </summary>
                <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '10px 0 6px' }}>
                  {seq.scenario}
                </p>
                <p style={{ fontSize: 12, fontFamily: FB, color: C.ink, margin: '0 0 14px' }}>
                  <strong style={{ color: C.accent }}>Stacked rebates:</strong> {seq.totalRebateStack}
                </p>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                  {seq.steps.map(s => (
                    <li
                      key={s.step}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px minmax(0, 1fr)',
                        gap: 12,
                        paddingTop: 10,
                        borderTop: `1px solid ${C.cardLine}`,
                      }}
                    >
                      <span style={{ fontSize: 13, fontFamily: FM, color: C.inkFaint, fontWeight: 600 }}>
                        {String(s.step).padStart(2, '0')}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            gap: 12,
                            flexWrap: 'wrap',
                          }}
                        >
                          <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, fontWeight: 600, margin: 0 }}>
                            {s.title}
                          </p>
                          <span style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint }}>{s.duration}</span>
                        </div>
                        <p style={{ fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.5, margin: '4px 0 0' }}>
                          {s.what}
                        </p>
                        <p style={{ fontSize: 11, fontFamily: FB, color: C.inkFaint, fontStyle: 'italic', margin: '4px 0 0', lineHeight: 1.5 }}>
                          Trap: {s.trap}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </>
      )}
    </SectionShell>
  )
}

// ---- Vetting ------------------------------------------------------------

function SectionVetting({ data }: { data: Profile }) {
  return (
    <SectionShell kicker="Section 6" title="Who to hire" intro={data.vetting.intro}>
      <div style={{ display: 'grid', gap: 10 }}>
        {data.vetting.items.map(v => (
          <div
            key={v.id}
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.cardLine}`,
              borderRadius: 4,
              padding: '14px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 6,
              }}
            >
              <p style={{ fontSize: 14, fontFamily: FB, fontWeight: 600, color: C.ink, margin: 0 }}>{v.name}</p>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: FM,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: v.effort === 'low' ? '#3B6D11' : v.effort === 'high' ? C.accent : C.inkFaint,
                  backgroundColor:
                    v.effort === 'low' ? '#EAF3DE' : v.effort === 'high' ? C.accentSoft : 'rgba(28,43,26,0.06)',
                  padding: '3px 8px',
                  borderRadius: 999,
                }}
              >
                {v.effort} effort
              </span>
            </div>
            <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, margin: 0, lineHeight: 1.55 }}>{v.description}</p>
            <p
              style={{
                fontSize: 12,
                fontFamily: FB,
                color: C.inkFaint,
                fontStyle: 'italic',
                margin: '6px 0 0',
                lineHeight: 1.55,
              }}
            >
              {v.vtRationale}
            </p>
            {v.redFlags.length > 0 && (
              <details style={{ marginTop: 10 }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    fontSize: 11,
                    fontFamily: FM,
                    color: C.accent,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Red flags this catches
                </summary>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12, fontFamily: FB, color: C.inkSoft, lineHeight: 1.6 }}>
                  {v.redFlags.map(f => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

// ---- Sources footer ----------------------------------------------------

function Sources({ data }: { data: Profile }) {
  return (
    <section style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.cardLine}` }}>
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.inkFaint,
          marginBottom: 12,
        }}
      >
        Sources
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        {data.dataLinks.map(d => (
          <a
            key={d.url}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: C.inkSoft,
              textDecoration: 'none',
              borderBottom: `1px solid ${C.cardLine}`,
            }}
          >
            {d.label} →
          </a>
        ))}
      </div>
      <p style={{ fontSize: 11, fontFamily: FM, color: C.inkFaint, marginTop: 16 }}>
        Generated{' '}
        {new Date(data.generatedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}{' '}
        · Not legal advice.
      </p>
    </section>
  )
}
