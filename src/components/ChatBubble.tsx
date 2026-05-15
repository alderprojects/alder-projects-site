/**
 * v7.2.17 — Persistent floating chat bubble.
 * Appears on every page except Smart Cart curation flow.
 * Pre-fills context from current page.
 */
'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// v7.2.18-B8 — also hide on /admin/* (internal-only) and /chat itself
// (the full-page chat IS the widget — no need to nest a bubble inside).
const HIDDEN_PATHS = [
  '/smart-cart/result',
  '/smart-cart/curation',
  '/admin',
  '/chat',
]

const PAGE_CONTEXTS: Record<string, string> = {
  '/guides/windows-buy-skip-wait': 'I have questions about window weatherization',
  '/guides/basement-buy-skip-wait': 'I have questions about basement moisture',
  '/guides/lake-season-buy-skip-wait': 'I have questions about lake season setup',
  '/guides/kitchen-refresh-buy-skip-wait': 'I have questions about a kitchen refresh',
  '/guides/how-to-shop-for-home-projects-without-overspending': 'I want to use Buy/Skip/Wait for my project',
  '/calculator': 'I have questions about my project cost estimate',
  '/smart-cart': 'I have questions about Smart Cart',
  // v7.2.18 — Memorial Day guide context.
  '/guides/memorial-day-vermont-2026': 'I am hosting Memorial Day weekend and want the cookout setup right',
  '/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost': 'I am picking a grill — Weber vs BGE vs Kamado Joe',
}

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null
  if (HIDDEN_PATHS.some(p => pathname?.startsWith(p))) return null

  const contextHint = pathname ? PAGE_CONTEXTS[pathname] || '' : ''
  const chatHref = contextHint
    ? `/chat?prefill=${encodeURIComponent(contextHint)}&utm_source=bubble&utm_medium=widget&utm_campaign=${encodeURIComponent(pathname || 'unknown')}`
    : `/chat?utm_source=bubble&utm_medium=widget`

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9998,
          width: '56px', height: '56px', borderRadius: '28px',
          backgroundColor: '#C8732A', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
        width: 'min(340px, calc(100vw - 32px))',
        backgroundColor: '#1C2B1A', borderRadius: '12px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.35)', padding: '20px',
        color: '#F5EFE0', fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A9B6F', marginBottom: '4px' }}>Ask Alder</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600 }}>Vermont project questions?</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', color: 'rgba(245,239,224,0.6)', cursor: 'pointer', fontSize: '20px', padding: 0, lineHeight: 1 }}>×</button>
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(245,239,224,0.75)', lineHeight: 1.55, margin: '0 0 14px 0' }}>
        Real Vermont answers on weatherization, lake season, kitchen refresh, basement moisture, and more. Free chat.
      </p>
      <a
        href={chatHref}
        onClick={() => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'chat_bubble_clicked', { page_path: pathname, has_context: !!contextHint })
          }
        }}
        style={{
          display: 'block', textAlign: 'center', padding: '11px 18px',
          backgroundColor: '#C8732A', color: '#FAF7F2',
          fontSize: '13px', fontWeight: 600, borderRadius: '3px',
          textDecoration: 'none',
        }}
      >
        Start chatting →
      </a>
      <p style={{ fontSize: '11px', color: 'rgba(245,239,224,0.4)', marginTop: '10px', marginBottom: 0, textAlign: 'center' }}>
        Free · No signup
      </p>
    </div>
  )
}
