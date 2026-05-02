'use client'

import Link from 'next/link'
import { useState } from 'react'

const PRIMARY_LINKS = [
  { href: '/guides', label: 'Guides' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

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
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="p-2"
            style={{ color: '#fdfcf9' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {open ? (
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
      {open && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: '#2c4a3e', backgroundColor: '#1f3a2e' }}
        >
          <div className="px-4 py-3 flex flex-col gap-3">
            {PRIMARY_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm py-1"
                style={{
                  color: '#e8e4d8',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
