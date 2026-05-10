'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// v7.2.14 fix-up — Smart Cart dropdown added to global nav.
//
// Desktop: hover-or-click dropdown lists the same scopes as the
// /smart-cart picker. Each row links to /smart-cart/topic/[slug] for
// the two pilots (window, basement) and to /smart-cart?scope=[id] for
// the other scopes (legacy curation modal will pre-select via the
// existing data-curation-modal-* plumbing).
//
// Mobile: "Smart Cart" expands inline to show the same list. The
// previous "Ask →" pill is preserved.

const PRIMARY_LINKS: { href: string; label: string }[] = [
  { href: '/guides', label: 'Guides' },
]

type CartNavItem = {
  label: string
  href: string
  /** Display price string. Defaults to $19.99. */
  price?: string
}

const SMART_CART_NAV_ITEMS: CartNavItem[] = [
  {
    label: 'Window weatherization',
    href: '/smart-cart/topic/window-weatherization-vermont',
  },
  {
    label: 'Basement moisture prep',
    href: '/smart-cart/topic/basement-moisture-prep',
  },
  { label: 'Mudroom & entry', href: '/smart-cart?scope=mudroom_entry_reset' },
  { label: 'Deck & outdoor', href: '/smart-cart?scope=outdoor_lake_season' },
  { label: 'Kitchen organizers', href: '/smart-cart?scope=kitchen_organizers' },
  { label: 'Winterizing', href: '/smart-cart?scope=window_weatherization' },
  { label: 'Opening the house', href: '/smart-cart?scope=outdoor_lake_season' },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [smartCartOpen, setSmartCartOpen] = useState(false)
  const [mobileSmartCartOpen, setMobileSmartCartOpen] = useState(false)
  const desktopRef = useRef<HTMLDivElement | null>(null)

  // Close the desktop dropdown on outside click + on Escape.
  useEffect(() => {
    if (!smartCartOpen) return
    function onClickOutside(e: MouseEvent) {
      if (
        desktopRef.current &&
        !desktopRef.current.contains(e.target as Node)
      ) {
        setSmartCartOpen(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setSmartCartOpen(false)
    }
    document.addEventListener('click', onClickOutside)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onClickOutside)
      document.removeEventListener('keydown', onEsc)
    }
  }, [smartCartOpen])

  return (
    <nav
      style={{
        backgroundColor: '#1f3a2e',
        borderBottom: '1px solid #2c4a3e',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight"
          style={{
            color: '#fdfcf9',
            fontFamily: 'Playfair Display, serif',
          }}
        >
          Alder Projects
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {PRIMARY_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm hover:underline"
              style={{
                color: '#e8e4d8',
                fontFamily: 'DM Sans, system-ui, sans-serif',
              }}
            >
              {l.label}
            </Link>
          ))}

          {/* v7.2.14 — Smart Cart dropdown */}
          <div
            ref={desktopRef}
            className="relative"
            onMouseEnter={() => setSmartCartOpen(true)}
            onMouseLeave={() => setSmartCartOpen(false)}
          >
            <Link
              href="/smart-cart"
              onClick={(e) => {
                // On click: toggle the dropdown rather than navigate, unless
                // the user holds modifier (open in new tab) or click-throughs.
                if (e.metaKey || e.ctrlKey || e.shiftKey) return
                e.preventDefault()
                setSmartCartOpen(o => !o)
              }}
              className="text-sm hover:underline inline-flex items-center gap-1"
              style={{
                color: '#e8e4d8',
                fontFamily: 'DM Sans, system-ui, sans-serif',
              }}
              aria-haspopup="menu"
              aria-expanded={smartCartOpen}
            >
              Smart Cart <span aria-hidden="true">▾</span>
            </Link>
            {smartCartOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 6,
                  minWidth: 280,
                  backgroundColor: '#fdfcf9',
                  color: '#1f3a2e',
                  border: '1px solid #d8d4c4',
                  borderRadius: 4,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  padding: '6px 0',
                }}
              >
                {SMART_CART_NAV_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSmartCartOpen(false)}
                    role="menuitem"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 14px',
                      fontSize: 14,
                      color: '#1f3a2e',
                      textDecoration: 'none',
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: 12, color: '#1f3a2e99' }}>
                      {item.price ?? '$19.99'}
                    </span>
                  </Link>
                ))}
                <div
                  style={{
                    borderTop: '1px solid #d8d4c4',
                    margin: '6px 0 0',
                  }}
                />
                <Link
                  href="/smart-cart"
                  onClick={() => setSmartCartOpen(false)}
                  role="menuitem"
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#C8732A',
                    textDecoration: 'none',
                  }}
                >
                  See all →
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#fdfcf9',
              color: '#1f3a2e',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            }}
          >
            <span>Ask the assistant</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Mobile: chat CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/chat"
            className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: '#fdfcf9',
              color: '#1f3a2e',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            }}
          >
            Ask →
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="p-2"
            style={{ color: '#fdfcf9' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: '#2c4a3e', backgroundColor: '#1f3a2e' }}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {PRIMARY_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm py-2"
                style={{
                  color: '#e8e4d8',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                }}
              >
                {l.label}
              </Link>
            ))}

            {/* v7.2.14 — Smart Cart expandable section */}
            <button
              type="button"
              onClick={() => setMobileSmartCartOpen(o => !o)}
              aria-expanded={mobileSmartCartOpen}
              className="text-sm py-2 inline-flex items-center justify-between"
              style={{
                color: '#e8e4d8',
                fontFamily: 'DM Sans, system-ui, sans-serif',
                background: 'transparent',
                border: 'none',
                padding: 0,
                textAlign: 'left',
              }}
            >
              <span>Smart Cart</span>
              <span aria-hidden="true">{mobileSmartCartOpen ? '▴' : '▾'}</span>
            </button>
            {mobileSmartCartOpen && (
              <div className="pl-3 flex flex-col gap-2 pb-2">
                {SMART_CART_NAV_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setMobileSmartCartOpen(false)
                      setMobileOpen(false)
                    }}
                    className="text-sm py-1 inline-flex items-center justify-between"
                    style={{
                      color: '#e8e4d8',
                      fontFamily: 'DM Sans, system-ui, sans-serif',
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: 11, color: '#e8e4d899' }}>
                      {item.price ?? '$19.99'}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/smart-cart"
                  onClick={() => {
                    setMobileSmartCartOpen(false)
                    setMobileOpen(false)
                  }}
                  className="text-sm py-1 font-semibold"
                  style={{
                    color: '#C8732A',
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                  }}
                >
                  See all →
                </Link>
              </div>
            )}

            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="text-sm py-2"
              style={{
                color: '#e8e4d8',
                fontFamily: 'DM Sans, system-ui, sans-serif',
              }}
            >
              Ask the assistant →
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
