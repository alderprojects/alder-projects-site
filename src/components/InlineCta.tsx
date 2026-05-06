'use client'

import type { CSSProperties, ReactNode } from 'react'
import EmailCaptureCard from './EmailCaptureCard'
import type {
  PropertyModule,
  PropertyProfile,
  TopicId,
  VisitorSignals,
} from '@/lib/property-modules'
import {
  getInlineKitForContext,
  inferSeason,
  isFloodProperty,
  isLakeProperty,
  type KitContext,
} from '@/lib/property-affiliates'
import type { AffiliateItem } from '@/data/affiliates'

// Inline CTAs + situational affiliate kits, attached to module renders
// by RankedModuleStream. Replaces the V1 standalone billboards plus the
// hardcoded mini-kits from polish v2 — all kits now route through the
// AFFILIATE_CATALOG via property-affiliates.getInlineKitForContext.
//
// Hard rules enforced here:
//   - Researching intent gets ZERO affiliate items anywhere.
//   - Inline kits are small horizontal text-button rows, never
//     full-width boxes.
//   - Each module gets at most ONE CTA + ONE kit per render pass
//     (tracked via the `picked` set).

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

// Generic affiliate kit row — small, never full-width box. The heading
// label tells the visitor what frame the items belong in
// (e.g., "DIY tools that help here", "Gear for mud season",
// "Lake property essentials"). One disclosure line under the row.
function KitInline({ heading, items }: { heading: string; items: AffiliateItem[] }) {
  if (items.length === 0) return null
  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: `1px dashed ${C.cardLine}`,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontFamily: FM,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: C.inkFaint,
          margin: '0 0 8px',
        }}
      >
        ── {heading} ──
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map(it => (
          <a
            key={it.id}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            title={it.shortNote}
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
            {it.display} →
          </a>
        ))}
      </div>
      <p style={{ fontSize: 10, fontFamily: FM, color: C.inkFaint, margin: '8px 0 0' }}>
        We use these on Vermont projects. Affiliate links keep this free.
      </p>
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

// Owner+summary footer: chat prompt + first-year-as-owner toolkit
// (because the summary view does not surface a topic-tied module that
// would otherwise carry the kit).
export function OwnerSummaryFooterCta({
  profile,
  signals,
}: {
  profile: PropertyProfile
  signals: VisitorSignals
}) {
  const items = getInlineKitForContext(signals, profile, 'summary', new Date())
  return (
    <div
      style={{
        marginTop: 4,
        padding: '14px 18px',
        backgroundColor: C.card,
        border: `1px solid ${C.cardLine}`,
        borderRadius: 6,
      }}
    >
      <div
        style={{
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
      {items.length > 0 && <KitInline heading="First-year Vermont homeowner toolkit" items={items} />}
    </div>
  )
}

// ---------- Topic prompt / label helpers ------------------------------

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
    mudroom: 'a mudroom or entry reset',
    home_repair: 'home repair work',
    universal: 'a project',
  }
  return map[t]
}

function tradeForTopic(t: TopicId | null): string | null {
  if (!t) return null
  const map: Partial<Record<TopicId, string>> = {
    kitchen: 'kitchen',
    bath: 'bathroom',
    outdoor: 'deck',
    addition_adu: 'addition',
    heat_pump: 'hvac',
    solar_battery: 'solar',
    weatherization: 'window',
  }
  return map[t] ?? null
}

// Anchor module IDs where a topic kit should attach. The anchor is the
// most-relevant rendered module per topic — usually the matching cost
// module, falling back to a sequence or rebate module for topics that
// do not have a dedicated cost trade (solar_battery has no cost_solar;
// rebate_strat has no cost module at all). Order matters — first match
// wins, so anchors[0] is preferred when multiple render.
const TOPIC_KIT_ANCHORS: Partial<Record<TopicId, string[]>> = {
  heat_pump: ['cost_hvac', 'cost_electrical_panel'],
  weatherization: ['rebate_stack_detail', 'cost_window'],
  kitchen: ['cost_kitchen'],
  bath: ['cost_bathroom'],
  outdoor: ['cost_deck'],
  solar_battery: ['sequence_roof_then_solar', 'rebate_stack_detail'],
  rebate_strat: ['rebate_stack_detail'],
  // addition_adu intentionally omitted per spec — contractor CTA only.
}

function maybeAppendTopicKit(
  out: ReactNode[],
  module: PropertyModule,
  profile: PropertyProfile,
  signals: VisitorSignals,
  picked: Picked
): void {
  if (picked.has('topic_kit')) return
  if (signals.topLevelIntent !== 'owner') return
  const topic = signals.topic
  if (!topic) return
  const anchors = TOPIC_KIT_ANCHORS[topic]
  if (!anchors || !anchors.includes(module.moduleId)) return
  const items = getInlineKitForContext(signals, profile, 'topic_module')
  if (items.length === 0) return
  picked.add('topic_kit')
  out.push(<KitInline key="topic_kit" heading={kitHeadingFor('topic_module', topic)} items={items} />)
}

// Heading copy per kit context. Pulled into a helper so the catalog
// labels and the inline-render labels stay in sync.
function kitHeadingFor(context: KitContext, topic: TopicId | null, season?: string): string {
  if (context === 'pre_purchase') return 'Pre-purchase inspection prep'
  if (context === 'lake_property') return 'Lake property essentials'
  if (context === 'flood_property') return 'Storm prep gear'
  if (context === 'calendar_module') {
    const seasonLabel: Record<string, string> = {
      mud: 'mud season',
      spring_blackfly: 'spring blackfly season',
      lake_opening: 'lake opening',
      lake_operations: 'lake season',
      lake_closing: 'lake closing',
      fall_leaf: 'fall leaf season',
      pre_winter: 'pre-winter',
      deep_winter: 'deep winter',
      lake: 'lake season',
    }
    return `Gear that helps for ${seasonLabel[season ?? ''] ?? 'this season'}`
  }
  if (context === 'summary') return 'First-year Vermont homeowner toolkit'
  // topic_module
  if (topic === 'weatherization') return 'DIY weatherization kit'
  if (topic === 'heat_pump') return 'Heat-pump season prep'
  if (topic === 'kitchen') return 'Kitchen DIY upgrades'
  if (topic === 'bath') return 'Bath DIY upgrades'
  if (topic === 'outdoor') return 'Deck DIY tools'
  if (topic === 'solar_battery') return 'Pre-solar energy monitoring'
  if (topic === 'rebate_strat') return 'DIY rebate-eligible materials'
  return 'DIY tools that help here'
}

// ---------- Module-level CTA + kit picker -----------------------------

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

  // ---------- Researcher: address-prompt only, ZERO affiliates
  if (intent === 'researching') {
    if (ctype === 'info' || ctype === 'regulatory' || ctype === 'rebate' || ctype === 'calendar') {
      return <AddressPromptCta />
    }
    return null
  }

  // ---------- Calendar module — append seasonal kit (one per page).
  if (ctype === 'calendar' && !picked.has('seasonal_kit')) {
    picked.add('seasonal_kit')
    const items = getInlineKitForContext(signals, profile, 'calendar_module')
    if (items.length > 0) {
      const date = new Date()
      const lake = isLakeProperty(profile)
      let seasonKey: string = inferSeason(date)
      if (lake && (seasonKey === 'lake' || seasonKey === 'spring_blackfly' || seasonKey === 'fall_leaf')) {
        const month = date.getMonth() + 1
        if (month >= 5 && month <= 6) seasonKey = 'lake_opening'
        else if (month === 7 || month === 8) seasonKey = 'lake_operations'
        else if (month === 9 || month === 10) seasonKey = 'lake_closing'
      }
      return <KitInline heading={kitHeadingFor('calendar_module', topic, seasonKey)} items={items} />
    }
    return null
  }

  // ---------- Regulatory module — lake essentials (lake property) and
  // storm prep (flood property). Both can fire — they cover different
  // categories of items, and the spec caps at one kit per page anyway
  // through the `picked` set keys.
  if (ctype === 'regulatory') {
    const out: ReactNode[] = []
    if (intent === 'buying' && !picked.has('pre_purchase_kit')) {
      picked.add('pre_purchase_kit')
      const items = getInlineKitForContext(signals, profile, 'pre_purchase')
      if (items.length > 0) out.push(<KitInline key="pp" heading={kitHeadingFor('pre_purchase', topic)} items={items} />)
    }
    if (isLakeProperty(profile) && !picked.has('lake_kit')) {
      picked.add('lake_kit')
      const items = getInlineKitForContext(signals, profile, 'lake_property')
      if (items.length > 0) out.push(<KitInline key="lake" heading={kitHeadingFor('lake_property', topic)} items={items} />)
    }
    if (isFloodProperty(profile) && !picked.has('flood_kit')) {
      picked.add('flood_kit')
      const items = getInlineKitForContext(signals, profile, 'flood_property')
      if (items.length > 0) out.push(<KitInline key="flood" heading={kitHeadingFor('flood_property', topic)} items={items} />)
    }
    if (intent === 'buying' && (moduleId === 'flood_regulatory_deep_dive' || moduleId === 'regulatory_flags')) {
      if (!picked.has('buyer_inspection')) {
        picked.add('buyer_inspection')
        out.push(
          <ChatPromptCta
            key="cta"
            text="Considering an offer on this property?"
            prompt={`I am considering an offer on ${profile.address}. What should I flag in the inspection?`}
            label="Ask the chat what to flag"
          />
        )
      }
    }
    return out.length > 0 ? <>{out}</> : null
  }

  // ---------- Buyer rebate / sequence / other
  if (intent === 'buying') {
    if (ctype === 'rebate' && !picked.has('buyer_email')) {
      picked.add('buyer_email')
      const out: ReactNode[] = [
        <div key="email" style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.cardLine}` }}>
          <EmailCaptureCard kind="buyer" profile={profile} topic={topic} />
        </div>,
      ]
      // First-year-as-owner toolkit at the bottom of the inherited rebate stack.
      const items = getInlineKitForContext(signals, profile, 'topic_module')
      if (items.length > 0) {
        out.push(<KitInline key="kit" heading="First-year-as-owner toolkit" items={items.slice(0, 7)} />)
      }
      return <>{out}</>
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

  // ---------- Owner with no topic — handled by OwnerSummaryFooterCta
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

  // ---------- Owner with a topic: scope-tier CTAs + topic-module kit
  if (intent === 'owner') {
    const matchTrade = tradeForTopic(topic)
    const isTopicMatchedCost = ctype === 'cost' && matchTrade && moduleId === `cost_${matchTrade}`

    // Scope-based CTA logic builds an `out` list; topic kit attaches
    // separately at the end via maybeAppendTopicKit so it covers
    // anchor modules that the per-scope branches do not address
    // (e.g. solar_battery has no cost_solar — kit anchors on the
    // sequence module instead).
    const out: ReactNode[] = []

    if (scope === 'big') {
      if (isTopicMatchedCost && !picked.has('owner_big_cost')) {
        picked.add('owner_big_cost')
        out.push(
          <ChatPromptCta
            key="cta"
            text="Ready for real numbers? We will line up three Vermont contractors."
            prompt={`I want bids on ${topicLabel(topic)} in ${town}. Here is what I have in mind: ...`}
            label="Get 3 Vermont bids — start in chat"
          />
        )
      }
      if (ctype === 'sequence' && !picked.has('owner_big_seq')) {
        picked.add('owner_big_seq')
        out.push(
          <ChatPromptCta
            key="seq"
            text="Send this sequence to a Vermont contractor?"
            prompt={`I want to start the sequence "${module.title}" on ${profile.address}. Help me brief a contractor.`}
            label="Send to a contractor"
          />
        )
      }
      if (ctype === 'vetting' && !picked.has('owner_big_vet')) {
        picked.add('owner_big_vet')
        out.push(
          <ChatPromptCta
            key="vet"
            text="Want me to introduce you to a vetted Vermont contractor?"
            prompt={`Introduce me to a vetted Vermont contractor for ${topicLabel(topic)} in ${town}.`}
            label="Introduce me to a vetted contractor"
          />
        )
      }
    } else if (scope === 'mid') {
      if (isTopicMatchedCost && !picked.has('owner_mid_cost')) {
        picked.add('owner_mid_cost')
        out.push(
          <ChatPromptCta
            key="cta"
            text={`This is handyman territory in ${town}.`}
            prompt={`I need a handyman in ${town} for ${topicLabel(topic)}. Tell me what to look for.`}
            label="Tell the chat what you need"
          />
        )
      }
      if (ctype === 'rebate' && !picked.has('owner_mid_rebate')) {
        picked.add('owner_mid_rebate')
        out.push(
          <ChatPromptCta
            key="rebate"
            text="Want help filing the rebate paperwork?"
            prompt={`Walk me through filing the rebates for ${topicLabel(topic)} on ${profile.address}.`}
            label="Get help filing — chat"
          />
        )
      }
    } else if (scope === 'diy') {
      if (isTopicMatchedCost && !picked.has('owner_diy_chat')) {
        picked.add('owner_diy_chat')
        out.push(
          <ChatPromptCta
            key="cta"
            text="Stuck? The chat has the Vermont playbook loaded."
            prompt={`I am working on ${topicLabel(topic)} myself at ${profile.address}. Stuck on this part: ...`}
            label="Ask the chat"
          />
        )
      }
    }

    // Topic kit attaches to its anchor module regardless of scope.
    maybeAppendTopicKit(out, module, profile, signals, picked)

    return out.length > 0 ? <>{out}</> : null
  }

  return null
}
