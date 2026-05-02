'use client'

import type { CSSProperties, ReactNode } from 'react'
import EmailCaptureCard from './EmailCaptureCard'
import type {
  PropertyModule,
  PropertyProfile,
  TopicId,
  VisitorSignals,
} from '@/lib/property-modules'

// Inline CTAs that get appended to each rendered property module by
// RankedModuleStream. Replaces the V1 standalone-billboard CTA modules
// (cta_handyman / cta_contractor_bid / cta_diy_amazon / cta_email_capture)
// which interrupted reading flow. Per Track C polish spec: every page
// state must surface at least one revenue path inline.
//
// pickInlineCta(module, profile, signals) returns the CTA appropriate
// to that combination, or null if the module should not get one.
//
// State-level (not module-level) CTAs — the researcher footer link and
// the owner+summary footer link — are exposed as separate components
// so RankedModuleStream can mount them once at the bottom of the stream.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  accentSoft: 'rgba(200,115,42,0.12)',
  bg: '#FAF7F2',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

const ROW_STYLE: CSSProperties = {
  marginTop: 10,
  paddingTop: 10,
  borderTop: `1px dashed ${C.cardLine}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
}
const TEXT_STYLE: CSSProperties = {
  fontSize: 13,
  fontFamily: FB,
  color: C.inkSoft,
  margin: 0,
  flex: 1,
  minWidth: 0,
}
const BUTTON_STYLE: CSSProperties = {
  padding: '8px 14px',
  border: 'none',
  backgroundColor: C.accent,
  color: '#FAF7F2',
  borderRadius: 4,
  fontFamily: FB,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
const LINK_STYLE: CSSProperties = {
  ...BUTTON_STYLE,
  textDecoration: 'none',
  display: 'inline-block',
}

// Local re-implementation of dispatchChatPrompt so this file does not
// import from property-modules.tsx (which is the catalog and locked
// down for the polish pass). PropertyChat listens for both signals.
function dispatchChatPrompt(text: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem('alder.chatPendingPrompt', text)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('alder:chatPrompt', { detail: { text } }))
}

// ---------- Atom-level CTA pieces ----------

function ChatPromptCta({ prompt, text, label }: { prompt: string; text: string; label: string }) {
  return (
    <div style={ROW_STYLE}>
      <p style={TEXT_STYLE}>{text}</p>
      <button type="button" onClick={() => dispatchChatPrompt(prompt)} style={BUTTON_STYLE}>
        {label} →
      </button>
    </div>
  )
}

function AddressPromptCta({ text }: { text?: string }) {
  return (
    <div style={ROW_STYLE}>
      <p style={TEXT_STYLE}>{text ?? 'Want this for your specific Vermont property?'}</p>
      <a href="/" style={LINK_STYLE}>
        Type your address →
      </a>
    </div>
  )
}

function BuyerInspectionKitInline() {
  const items = [
    { label: 'Moisture meter', q: 'pinless moisture meter' },
    { label: 'Outlet tester', q: 'gfci outlet tester' },
    { label: 'CO detector', q: 'carbon monoxide detector battery' },
    { label: 'Flashlight', q: 'led tactical flashlight inspection' },
  ]
  return (
    <div style={{ ...ROW_STYLE, alignItems: 'flex-start', flexDirection: 'column' }}>
      <p style={{ ...TEXT_STYLE, flex: 'unset' }}>
        <strong>Pre-purchase inspection prep — what to bring:</strong>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map(it => (
          <a
            key={it.label}
            href={`https://www.amazon.com/s?k=${encodeURIComponent(it.q)}&tag=alderprojects-20`}
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
    </div>
  )
}

function DiyWeatherizationKitInline() {
  const items = [
    { label: 'Caulk + gun', q: 'silicone caulk gun kit' },
    { label: 'Foam sealant', q: 'great stuff foam sealant' },
    { label: 'Weatherstripping', q: 'door weatherstripping kit' },
    { label: 'Pipe insulation', q: 'pipe insulation foam outdoor' },
    { label: 'Window film', q: 'insulating window film kit' },
  ]
  return (
    <div style={{ ...ROW_STYLE, alignItems: 'flex-start', flexDirection: 'column' }}>
      <p style={{ ...TEXT_STYLE, flex: 'unset' }}>
        <strong>Doing it yourself? Here is the kit.</strong>{' '}
        Affiliate links — same prices everywhere, helps keep the tool free.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map(it => (
          <a
            key={it.label}
            href={`https://www.amazon.com/s?k=${encodeURIComponent(it.q)}&tag=alderprojects-20`}
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
    </div>
  )
}

// ---------- State-level CTAs (rendered by RankedModuleStream) ----------

export function ResearcherFooterCta() {
  return (
    <div
      style={{
        marginTop: 4,
        padding: '14px 18px',
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <p style={{ ...TEXT_STYLE, color: C.ink }}>
        Ready to apply this to a real Vermont property?
      </p>
      <a href="/" style={LINK_STYLE}>
        Type your address →
      </a>
    </div>
  )
}

export function OwnerSummaryFooterCta() {
  return (
    <div
      style={{
        marginTop: 4,
        padding: '14px 18px',
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <p style={{ ...TEXT_STYLE, color: C.ink }}>
        Got a specific project in mind? Tell the chat — I will personalize this.
      </p>
      <button
        type="button"
        onClick={() =>
          dispatchChatPrompt(
            'Help me pick the right next project for my property — here is what I am thinking.'
          )
        }
        style={BUTTON_STYLE}
      >
        Open the chat →
      </button>
    </div>
  )
}

// ---------- Module-level CTA picker -----------------------------------

// Map a TopicId to a human label used in chat prompts.
function topicLabel(t: TopicId | null): string {
  if (!t) return 'a project'
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

// Map a TopicId to the canonical cost-module trade key. Used so the
// "Get N bids" CTA only fires on the cost module that matches the
// visitor's chosen topic, not on every cost module that happened to
// rank above the floor.
function tradeForTopic(t: TopicId | null): string | null {
  if (!t) return null
  const map: Partial<Record<TopicId, string>> = {
    kitchen: 'kitchen',
    bath: 'bathroom',
    outdoor: 'deck',
    addition_adu: 'addition',
    heat_pump: 'hvac',
    solar_battery: 'solar', // not a real trade key — falls through to no match
    weatherization: 'window',
  }
  return map[t] ?? null
}

// Track which CTAs have already fired in this render pass — avoids
// stacking three "get bids" buttons on three cost modules in a row.
type Picked = Set<string>

export function pickInlineCta(
  module: PropertyModule,
  profile: PropertyProfile,
  signals: VisitorSignals,
  picked: Picked
): ReactNode | null {
  const intent = signals.topLevelIntent
  const topic = signals.topic
  const scope = signals.scope
  const town = profile.town
  const moduleId = module.moduleId
  const ctype = module.contentType

  // ---------- Researcher: every info module gets the address prompt
  if (intent === 'researching') {
    if (ctype === 'info' || ctype === 'regulatory' || ctype === 'rebate' || ctype === 'calendar') {
      return <AddressPromptCta />
    }
    return null
  }

  // ---------- Buyer
  if (intent === 'buying') {
    if (moduleId === 'flood_regulatory_deep_dive' || moduleId === 'regulatory_flags') {
      if (picked.has('buyer_inspection')) return null
      picked.add('buyer_inspection')
      return (
        <>
          <ChatPromptCta
            text="Considering an offer on this property?"
            prompt={`I am considering an offer on ${profile.address}. What should I flag in the inspection?`}
            label="Ask the chat what to flag"
          />
          <BuyerInspectionKitInline />
        </>
      )
    }
    if (ctype === 'rebate' && !picked.has('buyer_email')) {
      picked.add('buyer_email')
      return (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.cardLine}` }}>
          <EmailCaptureCard kind="buyer" profile={profile} topic={topic} />
        </div>
      )
    }
    if (ctype === 'sequence' && !picked.has('buyer_bids')) {
      picked.add('buyer_bids')
      return (
        <ChatPromptCta
          text="Once you close, this is one of the first projects most buyers tackle."
          prompt={`Once I close on ${profile.address}, I want bids on this work. Help me line up Vermont contractors.`}
          label="Get bids when you close"
        />
      )
    }
    return null
  }

  // ---------- Owner with no topic (the "summary" path)
  if (intent === 'owner' && !topic) {
    if (moduleId === 'calendar_in_season' && !picked.has('owner_summary_cal')) {
      picked.add('owner_summary_cal')
      return (
        <ChatPromptCta
          text="Want to add any of these to your list?"
          prompt={`Help me think through what to do this season on ${profile.address}.`}
          label="Plan this with the chat"
        />
      )
    }
    return null
  }

  // ---------- Owner with a topic: scope-tier CTAs
  if (intent === 'owner') {
    const matchTrade = tradeForTopic(topic)

    if (scope === 'big') {
      if (ctype === 'cost' && matchTrade && moduleId === `cost_${matchTrade}` && !picked.has('owner_big_cost')) {
        picked.add('owner_big_cost')
        return (
          <ChatPromptCta
            text="Ready for real numbers? We will line up three Vermont contractors."
            prompt={`I want bids on ${topicLabel(topic)} in ${town}. Here is what I have in mind: ...`}
            label="Get 3 Vermont bids — start in chat"
          />
        )
      }
      if (ctype === 'sequence' && !picked.has('owner_big_seq')) {
        picked.add('owner_big_seq')
        return (
          <ChatPromptCta
            text="Send this sequence to a Vermont contractor?"
            prompt={`I want to start the sequence "${module.title}" on ${profile.address}. Help me brief a contractor.`}
            label="Send to a contractor"
          />
        )
      }
      if (ctype === 'vetting' && !picked.has('owner_big_vet')) {
        picked.add('owner_big_vet')
        return (
          <ChatPromptCta
            text="Want me to introduce you to a vetted Vermont contractor?"
            prompt={`Introduce me to a vetted Vermont contractor for ${topicLabel(topic)} in ${town}.`}
            label="Introduce me to a vetted contractor"
          />
        )
      }
      return null
    }

    if (scope === 'mid') {
      if (ctype === 'cost' && matchTrade && moduleId === `cost_${matchTrade}` && !picked.has('owner_mid_cost')) {
        picked.add('owner_mid_cost')
        return (
          <ChatPromptCta
            text={`This is handyman territory in ${town}.`}
            prompt={`I need a handyman in ${town} for ${topicLabel(topic)}. Tell me what to look for.`}
            label="Tell the chat what you need"
          />
        )
      }
      if (ctype === 'rebate' && !picked.has('owner_mid_rebate')) {
        picked.add('owner_mid_rebate')
        return (
          <ChatPromptCta
            text="Want help filing the rebate paperwork?"
            prompt={`Walk me through filing the rebates for ${topicLabel(topic)} on ${profile.address}.`}
            label="Get help filing — chat"
          />
        )
      }
      // DIY weatherization kit appears once when topic is weatherization,
      // attached to the rebate module (closest topical anchor we render).
      if (
        topic === 'weatherization' &&
        ctype === 'rebate' &&
        !picked.has('owner_mid_diy_kit')
      ) {
        picked.add('owner_mid_diy_kit')
        return <DiyWeatherizationKitInline />
      }
      return null
    }

    if (scope === 'diy') {
      if (topic === 'weatherization' && !picked.has('owner_diy_kit')) {
        picked.add('owner_diy_kit')
        return <DiyWeatherizationKitInline />
      }
      // Generic "stuck? ask the chat" on every module for DIY scope.
      if (!picked.has(`owner_diy_chat_${moduleId}`)) {
        picked.add(`owner_diy_chat_${moduleId}`)
        return (
          <ChatPromptCta
            text="Stuck? The chat has the Vermont playbook loaded."
            prompt={`I am working on ${topicLabel(topic)} myself at ${profile.address}. Stuck on this part: ...`}
            label="Ask the chat"
          />
        )
      }
      return null
    }
  }

  return null
}
