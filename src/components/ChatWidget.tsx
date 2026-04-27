'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

type Props = {
  // Where the widget is embedded (used in lead routing + system prompt context)
  source?: string
  // First message to seed the conversation, e.g. opening line on calculator results page
  greeting?: string
  // Optional context to pass to the API (referrer, calculator state, etc.)
  context?: Record<string, unknown>
  // Display variant: 'inline' for embedded blocks, 'page' for full-page chat
  variant?: 'inline' | 'page'
}

const DEFAULT_GREETING =
  "Ask me anything about Vermont heat pumps, weatherization, or rebates. I'll give you Vermont-specific numbers, not national averages."

export default function ChatWidget({
  source = 'unknown',
  greeting = DEFAULT_GREETING,
  context,
  variant = 'inline',
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [lead, setLead] = useState({ name: '', email: '', zip: '', timeline: '' })

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Heuristic: trigger lead capture offer after 3+ user turns OR when assistant
  // explicitly mentions connecting to a contractor.
  useEffect(() => {
    if (showLeadForm || leadSubmitted) return
    const userTurns = messages.filter(m => m.role === 'user').length
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')?.content || ''
    const offered = /installer|contractor|put you in front|handle the rebate paperwork/i.test(lastAssistant)
    if (userTurns >= 3 && offered) {
      setShowLeadForm(true)
    }
  }, [messages, showLeadForm, leadSubmitted])

  async function sendMessage(text: string) {
    if (!text.trim()) return
    const next = [...messages, { role: 'user' as const, content: text.trim() }]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context: { ...context, referrer: source } }),
      })
      if (!res.ok) throw new Error('chat unavailable')
      const data = await res.json()
      const reply: Message = { role: 'assistant', content: data.reply || '(no response)' }
      setMessages(prev => [...prev, reply])
    } catch (e) {
      setError('Something went sideways. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  async function submitLead(e: FormEvent) {
    e.preventDefault()
    if (!lead.email) return
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture_lead',
          ...lead,
          transcript: messages,
          source,
        }),
      })
      if (!res.ok) throw new Error('lead routing failed')
      setLeadSubmitted(true)
      setShowLeadForm(false)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Got it. We'll review your situation and someone will reach out within one business day. In the meantime, ask me anything else.",
        },
      ])
    } catch (e) {
      setError('Could not send that through. Try again or email hello@alderprojects.com directly.')
    } finally {
      setLoading(false)
    }
  }

  const containerClass =
    variant === 'page'
      ? 'flex flex-col h-[calc(100vh-200px)] max-w-2xl mx-auto'
      : 'flex flex-col h-[500px] max-w-2xl mx-auto border rounded-lg shadow-sm'

  return (
    <div className={containerClass} style={{ borderColor: '#d4cfc4', backgroundColor: '#fdfcf9' }}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap leading-relaxed"
              style={{
                backgroundColor: m.role === 'user' ? '#2c4a3e' : '#ffffff',
                color: m.role === 'user' ? '#ffffff' : '#1a1a1a',
                border: m.role === 'assistant' ? '1px solid #e5e0d4' : 'none',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2 rounded-lg text-sm italic"
              style={{ backgroundColor: '#fff', color: '#7a7568', border: '1px solid #e5e0d4' }}
            >
              thinking…
            </div>
          </div>
        )}
        {error && (
          <div className="text-sm text-red-700 px-2">{error}</div>
        )}

        {showLeadForm && !leadSubmitted && (
          <form
            onSubmit={submitLead}
            className="mt-4 p-4 rounded-lg space-y-3"
            style={{ backgroundColor: '#f5f1e8', border: '1px solid #d4cfc4' }}
          >
            <div className="text-sm font-medium" style={{ color: '#2c4a3e' }}>
              Connect with a Vermont installer
            </div>
            <div className="text-xs" style={{ color: '#5a554a' }}>
              We'll send a Vermont contractor a summary of what we discussed. They'll reach
              out within one business day.
            </div>
            <input
              type="text"
              required
              placeholder="Your name"
              value={lead.name}
              onChange={e => setLead({ ...lead, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border"
              style={{ borderColor: '#d4cfc4', backgroundColor: '#fff' }}
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={lead.email}
              onChange={e => setLead({ ...lead, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border"
              style={{ borderColor: '#d4cfc4', backgroundColor: '#fff' }}
            />
            <input
              type="text"
              placeholder="ZIP code"
              value={lead.zip}
              onChange={e => setLead({ ...lead, zip: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border"
              style={{ borderColor: '#d4cfc4', backgroundColor: '#fff' }}
            />
            <input
              type="text"
              placeholder="When are you hoping to start?"
              value={lead.timeline}
              onChange={e => setLead({ ...lead, timeline: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border"
              style={{ borderColor: '#d4cfc4', backgroundColor: '#fff' }}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !lead.email}
                className="px-4 py-2 text-sm rounded font-medium"
                style={{ backgroundColor: '#2c4a3e', color: '#fff' }}
              >
                Send my info
              </button>
              <button
                type="button"
                onClick={() => setShowLeadForm(false)}
                className="px-4 py-2 text-sm rounded"
                style={{ color: '#5a554a' }}
              >
                Not yet
              </button>
            </div>
          </form>
        )}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          sendMessage(input)
        }}
        className="border-t px-3 py-3 flex gap-2"
        style={{ borderColor: '#e5e0d4' }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about heat pumps, weatherization, rebates…"
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm rounded border"
          style={{ borderColor: '#d4cfc4', backgroundColor: '#fff' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm rounded font-medium"
          style={{ backgroundColor: '#2c4a3e', color: '#fff', opacity: loading || !input.trim() ? 0.5 : 1 }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
