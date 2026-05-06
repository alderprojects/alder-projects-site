'use client'

import { useState, type CSSProperties } from 'react'
import type { PropertyProfile, TopicId } from '@/lib/property-modules'

// Lead-capture card used by the contractor_bid and email_capture CTA
// modules. Lives in its own 'use client' file because it carries form
// state — keeping the catalog itself a pure data module so it can be
// imported from server components without becoming a Client Reference.

const C = {
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

const cardStyle: CSSProperties = {
  backgroundColor: C.card,
  border: `1px solid ${C.cardLine}`,
  borderRadius: 6,
  padding: '18px 20px',
}
const inputStyle: CSSProperties = {
  padding: '10px 12px',
  border: `1px solid ${C.cardLine}`,
  borderRadius: 4,
  fontSize: 13,
  fontFamily: FB,
  color: C.ink,
  background: '#fff',
  outline: 'none',
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
    mudroom: 'a mudroom or entry reset',
    home_repair: 'home repair work',
    universal: 'a small project',
  }
  return map[t]
}

export default function EmailCaptureCard({
  kind,
  profile,
  topic,
}: {
  kind: 'contractor' | 'buyer'
  profile: PropertyProfile
  topic: TopicId | null
}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  const isContractor = kind === 'contractor'
  const headline = isContractor
    ? `Ready for bids on ${profile.town}?`
    : `Send me this ${profile.town} profile`
  const sub = isContractor
    ? `Drop your name and email and a Vermont contractor who handles ${topicLabelFor(topic)} will reach out within a business day.`
    : `Save the profile and we will email you reminders when you hit a closing milestone — no spam, just the property facts that move.`
  const buttonText = isContractor ? 'Send to a Vermont contractor →' : 'Send me the profile →'
  const kicker = isContractor ? 'Get bids' : 'Save profile'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    const transcript = [
      {
        role: 'user' as const,
        content: isContractor
          ? `I want bids for ${topicLabelFor(topic)} on ${profile.address}.`
          : `Send me the property profile for ${profile.address}.`,
      },
      {
        role: 'assistant' as const,
        content: `Property: ${profile.address}. Tier: ${profile.bucket}. Utility: ${profile.utility}. Topic: ${topicLabelFor(topic)}.`,
      },
    ]
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture_lead',
          name: name.trim() || '(name not given)',
          email: email.trim(),
          transcript,
          source: isContractor ? 'property_profile_contractor_bid' : 'property_profile_email_capture',
        }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div style={cardStyle}>
        <p
          style={{
            fontSize: 10,
            fontFamily: FM,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: C.accent,
            margin: '0 0 6px',
          }}
        >
          {isContractor ? 'Sent' : 'Saved'}
        </p>
        <p style={{ fontSize: 14, fontFamily: FB, color: C.ink, fontWeight: 600, margin: '0 0 10px' }}>Got it</p>
        <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, lineHeight: 1.55, margin: 0 }}>
          {isContractor
            ? `A Vermont contractor will reach out within a business day. Anything else you want to figure out in the meantime? The chat is right there.`
            : `The profile is on its way. Reply to that email if you want anything tweaked.`}
        </p>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <p
        style={{
          fontSize: 10,
          fontFamily: FM,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.accent,
          margin: '0 0 6px',
        }}
      >
        {kicker}
      </p>
      <p style={{ fontSize: 14, fontFamily: FB, color: C.ink, fontWeight: 600, margin: '0 0 10px' }}>{headline}</p>
      <p style={{ fontSize: 13, fontFamily: FB, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 12px' }}>{sub}</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name (optional)"
          aria-label="Your name"
          style={inputStyle}
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Your email"
          required
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={status === 'sending' || !email.trim()}
          style={{
            padding: '10px 16px',
            border: 'none',
            backgroundColor: status === 'sending' ? 'rgba(200,115,42,0.5)' : C.accent,
            color: '#FAF7F2',
            borderRadius: 4,
            fontFamily: FB,
            fontSize: 13,
            fontWeight: 600,
            cursor: status === 'sending' ? 'wait' : 'pointer',
          }}
        >
          {status === 'sending' ? 'Sending…' : buttonText}
        </button>
        {status === 'error' && (
          <p style={{ fontSize: 12, fontFamily: FB, color: '#dc2626', margin: 0 }}>
            Could not send. Try again in a moment, or just message the chat instead.
          </p>
        )}
      </form>
    </div>
  )
}
