'use client'

import { useEffect, useRef, useState } from 'react'
import ChatWidget from './ChatWidget'
import type { PropertyProfile } from '@/lib/property-modules'

// PropertyChat is the chat copilot wrapper for the property page.
//
// Desktop: renders inline as a card. The page wraps it in a
// position: sticky aside; nothing positional happens here.
//
// Mobile: replaces the inline panel with a floating button at the
// bottom-right. Tapping the button opens a bottom sheet that fills the
// viewport. Both surfaces share the same ChatWidget instance.
//
// Listens for 'alder:chatPrompt' (dispatched by PropertyHero when the
// visitor submits the chat input there) and relays the text into
// ChatWidget via the initialPrompt prop, which auto-sends it.
//
// Idle pulse: if the visitor has not picked an intent within 6 seconds
// of mount, pulse the chat card to suggest "or just ask" as a path
// forward. The pulse is purely CSS and self-clears on first interaction.

type Props = {
  profile: PropertyProfile
}

const C = {
  bg: '#FAF7F2',
  ink: '#1C2B1A',
  inkSoft: 'rgba(28,43,26,0.65)',
  inkFaint: 'rgba(28,43,26,0.45)',
  card: '#ffffff',
  cardLine: 'rgba(28,43,26,0.1)',
  accent: '#C8732A',
  green: '#1C2B1A',
  greenInk: '#F5EFE0',
}
const FB = "'DM Sans', system-ui, sans-serif"
const FM = 'monospace'

function bucketLabel(b: string): string {
  switch (b) {
    case 'burlington_metro':
      return 'Burlington metro'
    case 'chittenden_other':
      return 'Chittenden county (outside metro)'
    case 'resort_premium':
      return 'Resort / second-home market'
    case 'small_city':
      return 'Small Vermont city'
    case 'rural':
      return 'Rural Vermont'
    default:
      return b
  }
}

export default function PropertyChat({ profile }: Props) {
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(undefined)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pulse, setPulse] = useState(false)
  const interactedRef = useRef(false)

  const tier = bucketLabel(profile.bucket)
  const greeting = `I have ${profile.address} loaded — that's ${tier.toLowerCase()}, on ${profile.utility}. What do you want to know?`

  // Hero-input prompts arrive via CustomEvent. Pull from sessionStorage on
  // mount in case the event fired before this component hydrated.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('alder.chatPendingPrompt')
      if (stored) {
        setPendingPrompt(stored)
        sessionStorage.removeItem('alder.chatPendingPrompt')
        interactedRef.current = true
        setMobileOpen(true)
      }
    } catch {
      /* ignore */
    }

    const onPrompt = (e: Event) => {
      const detail = (e as CustomEvent<{ text: string }>).detail
      if (!detail?.text) return
      setPendingPrompt(detail.text)
      interactedRef.current = true
      setMobileOpen(true)
    }
    window.addEventListener('alder:chatPrompt', onPrompt)
    return () => window.removeEventListener('alder:chatPrompt', onPrompt)
  }, [])

  // Idle pulse: 6 seconds without any URL signal change or chat prompt.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (interactedRef.current) return
      // Check the URL one more time at fire time — visitor might have
      // clicked an intent button without focusing the chat.
      const params = new URL(window.location.href).searchParams
      if (params.get('intent') || params.get('topic')) return
      setPulse(true)
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  // Cancel pulse on any user interaction inside the panel.
  function onInteract() {
    interactedRef.current = true
    setPulse(false)
  }

  return (
    <>
      <div
        className={`property-chat-desktop${pulse ? ' property-chat-pulse' : ''}`}
        onPointerDown={onInteract}
        style={{
          backgroundColor: C.card,
          border: `1px solid ${C.cardLine}`,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${C.cardLine}`,
            backgroundColor: C.bg,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontFamily: FM,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.inkFaint,
              margin: 0,
            }}
          >
            Ask about this property
          </p>
          <p style={{ fontSize: 13, fontFamily: FB, color: C.ink, lineHeight: 1.5, margin: '4px 0 0' }}>
            The assistant has the profile loaded as context.
          </p>
        </div>
        <ChatWidget
          source={`property_profile_${profile.slug}`}
          variant="inline"
          propertyProfile={profile.chatContext}
          greeting={greeting}
          initialPrompt={pendingPrompt}
        />
      </div>

      {/* Mobile floating button — visible only on narrow viewports. */}
      <button
        type="button"
        className="property-chat-fab"
        aria-label="Open the assistant for this property"
        onClick={() => {
          setMobileOpen(true)
          onInteract()
        }}
        style={{
          position: 'fixed',
          bottom: 18,
          right: 18,
          zIndex: 60,
          padding: '14px 20px',
          borderRadius: 999,
          border: 'none',
          backgroundColor: C.accent,
          color: '#FAF7F2',
          fontFamily: FB,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
          cursor: 'pointer',
        }}
      >
        Ask the assistant
      </button>

      {/* Mobile bottom sheet. The desktop panel is hidden on narrow
          viewports; opening this sheet does not unmount the desktop
          ChatWidget — that one keeps state. We render the sheet wrapper
          but the conversation lives in the desktop panel above.
          To keep mobile UX coherent, the sheet contains its own
          ChatWidget so opening it on mobile starts a usable session. */}
      {mobileOpen && (
        <div
          className="property-chat-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Property assistant"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setMobileOpen(false)
          }}
        >
          <div
            style={{
              width: '100%',
              maxHeight: '85vh',
              backgroundColor: C.card,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: `1px solid ${C.cardLine}`,
                backgroundColor: C.bg,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontFamily: FB,
                  color: C.ink,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Ask about {profile.town}
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close assistant"
                style={{
                  padding: '6px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: C.inkSoft,
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatWidget
                source={`property_profile_${profile.slug}_mobile`}
                variant="inline"
                propertyProfile={profile.chatContext}
                greeting={greeting}
                initialPrompt={pendingPrompt}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .property-chat-desktop { display: none; }
        }
        @media (min-width: 961px) {
          .property-chat-fab { display: none; }
          .property-chat-sheet { display: none; }
        }
        .property-chat-pulse {
          box-shadow: 0 0 0 0 rgba(200,115,42,0.5);
          animation: alderChatPulse 1.6s ease-out 2;
        }
        @keyframes alderChatPulse {
          0% { box-shadow: 0 0 0 0 rgba(200,115,42,0.45); }
          100% { box-shadow: 0 0 0 18px rgba(200,115,42,0); }
        }
      `}</style>
    </>
  )
}
