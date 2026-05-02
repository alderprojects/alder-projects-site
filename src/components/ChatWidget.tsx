'use client'

import { useState, useRef, useEffect } from 'react'
import Script from 'next/script'

type Message = { role: 'user' | 'assistant'; content: string }

type Props = {
  source?: string
  greeting?: string
  context?: Record<string, unknown>
  // Optional pre-loaded property profile. When set, the widget passes it to
  // /api/chat as context.propertyProfile. The chat route already detects
  // addresses and looks them up itself; sending the profile up front lets it
  // skip that round trip for property-page conversations.
  propertyProfile?: Record<string, unknown>
  variant?: 'inline' | 'page'
}

const DEFAULT_GREETING =
  "Ask me anything about Vermont property, renovation costs, rebates, or what to do about your house. I'll give you Vermont-specific numbers, not national averages."

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement | string, opts: Record<string, unknown>) => string
      execute: (id?: string) => void
      reset: (id?: string) => void
      getResponse: (id?: string) => string
    }
  }
}

export default function ChatWidget({
  source = 'unknown',
  greeting = DEFAULT_GREETING,
  context,
  propertyProfile,
  variant = 'inline',
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string>('')
  const [hcaptchaReady, setHcaptchaReady] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const captchaContainerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string>('')

  const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || ''

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!hcaptchaReady || !window.hcaptcha || !captchaContainerRef.current || !sitekey) return
    if (widgetIdRef.current) return
    try {
      widgetIdRef.current = window.hcaptcha.render(captchaContainerRef.current, {
        sitekey,
        size: 'invisible',
        callback: (token: string) => setCaptchaToken(token),
        'error-callback': () => setCaptchaToken(''),
        'expired-callback': () => setCaptchaToken(''),
      })
    } catch (e) {
      console.error('hCaptcha init failed', e)
    }
  }, [hcaptchaReady, sitekey])

  async function getCaptchaTokenIfNeeded(): Promise<string> {
    const userMessageCount = messages.filter(m => m.role === 'user').length
    if (userMessageCount > 0) return ''
    if (!sitekey) return ''
    if (!window.hcaptcha || !widgetIdRef.current) return ''
    if (captchaToken) return captchaToken
    return new Promise(resolve => {
      const start = Date.now()
      const poll = () => {
        if (captchaToken) return resolve(captchaToken)
        if (Date.now() - start > 8000) return resolve('')
        setTimeout(poll, 200)
      }
      try {
        window.hcaptcha!.execute(widgetIdRef.current)
        poll()
      } catch (e) {
        resolve('')
      }
    })
  }

  async function sendMessage(text: string) {
    if (!text.trim()) return
    const next = [...messages, { role: 'user' as const, content: text.trim() }]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const token = await getCaptchaTokenIfNeeded()
      const mergedContext = {
        ...context,
        referrer: source,
        ...(propertyProfile ? { propertyProfile } : {}),
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          context: mergedContext,
          captchaToken: token,
        }),
      })

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}))
        const reply: Message = { role: 'assistant', content: data.reply || "You've hit a rate limit. Take a break and come back later." }
        setMessages(prev => [...prev, reply])
        return
      }

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}))
        const reply: Message = { role: 'assistant', content: data.reply || "Could not verify you. Refresh and try again." }
        setMessages(prev => [...prev, reply])
        return
      }

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

  const containerClass =
    variant === 'page'
      ? 'flex flex-col h-[calc(100vh-200px)] max-w-2xl mx-auto'
      : 'flex flex-col h-[500px] max-w-2xl mx-auto border rounded-lg shadow-sm'

  return (
    <>
      {sitekey && (
        <Script
          src="https://js.hcaptcha.com/1/api.js?render=explicit"
          async
          defer
          onLoad={() => setHcaptchaReady(true)}
        />
      )}

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
            placeholder="Ask about Vermont property, costs, rebates…"
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

        <div ref={captchaContainerRef} />
      </div>
    </>
  )
}
