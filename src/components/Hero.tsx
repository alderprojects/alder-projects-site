'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CONFIG } from '@/lib/recommender-config'
import { inferSeason } from '@/lib/season-helpers'
import {
  trackHomepageHeroView,
  trackSampleDemoClick,
} from '@/lib/analytics'

// V5 homepage hero. Address-first — submitting routes to /property/[slug]
// with the canonical address carried through as a query param so the SSR
// page works whether the user typed it here, shared the URL, or returned
// later. Cold visitors who do not have an address yet get a pre-built
// sample demo link below the form.
//
// Autocomplete uses the open VT E911 composite geocoder (VCGI). No key
// required; debounce typing and show the top suggestions.
//
// Fires homepage_hero_view once on mount (top-of-funnel) and
// sample_demo_click on the sample-property link.

const SUGGEST = 'https://maps.vcgi.vermont.gov/arcgis/rest/services/EGC_services/GCS_E911_COMPOSITE_SP_v2/GeocodeServer/suggest'

type Suggestion = { text: string; magicKey: string }

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function formatSuggestion(text: string): string {
  const parts = text.split(',').map(p => p.trim())
  if (parts.length < 2) return text
  const titleCase = (s: string) =>
    s
      .split(' ')
      .map(w => (w.length > 0 ? w[0] + w.slice(1).toLowerCase() : ''))
      .join(' ')
  return `${titleCase(parts[0])}, ${titleCase(parts[1])}`
}

export default function Hero() {
  const router = useRouter()
  const [addr, setAddr] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ddRef = useRef<HTMLDivElement>(null)

  // homepage_hero_view fires once per session — top of the homepage funnel.
  useEffect(() => {
    const season = inferSeason(new Date())
    const device =
      typeof window !== 'undefined' && window.innerWidth < 600 ? 'mobile' : 'desktop'
    trackHomepageHeroView({ season, device })
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        ddRef.current &&
        !ddRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      return
    }
    try {
      const res = await fetch(`${SUGGEST}?text=${encodeURIComponent(q)}&maxSuggestions=8&f=json`, {
        signal: AbortSignal.timeout(4000),
      })
      const d = await res.json()
      const sugs: Suggestion[] = (d.suggestions || []).map((s: { text: string; magicKey: string }) => ({
        text: s.text,
        magicKey: s.magicKey,
      }))
      setSuggestions(sugs)
      setOpen(sugs.length > 0)
      setHighlight(-1)
    } catch {
      setSuggestions([])
    }
  }, [])

  function onType(v: string) {
    setAddr(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 200)
  }

  function go(picked?: string) {
    const raw = (picked || addr).trim()
    if (!raw) return
    const withVT = /,\s*VT\b/i.test(raw) ? raw : `${raw}, VT`
    setLoading(true)
    const slug = slugify(withVT)
    router.push(`/property/${slug}?address=${encodeURIComponent(withVT)}`)
  }

  function pickSuggestion(s: Suggestion) {
    const formatted = formatSuggestion(s.text)
    setAddr(formatted)
    setOpen(false)
    go(s.text)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault()
      pickSuggestion(suggestions[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function onSampleClick() {
    const device =
      typeof window !== 'undefined' && window.innerWidth < 600 ? 'mobile' : 'desktop'
    trackSampleDemoClick({
      fromSection: 'hero',
      intentDestination: 'owner',
      device,
    })
  }

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#0D1A0B',
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1757661543986-6f418adc8cb6?auto=format&fit=crop&w=1920&q=80"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(105deg, rgba(8,18,7,0.92) 0%, rgba(8,18,7,0.78) 50%, rgba(8,18,7,0.5) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          background: 'linear-gradient(to bottom, #C8732A, rgba(200,115,42,0.1))',
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 920,
          margin: '0 auto',
          width: '100%',
          padding: 'clamp(96px,12vw,140px) 24px clamp(64px,8vw,96px)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            border: '1px solid rgba(122,155,111,0.4)',
            borderRadius: 999,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#7A9B6F',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#7A9B6F',
            }}
          >
            Vermont property tool
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 600,
            fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#F5EFE0',
            marginBottom: 18,
          }}
        >
          Vermont properties have <em style={{ color: '#C8732A', fontStyle: 'normal' }}>stories.</em>
        </h1>

        <p
          style={{
            fontSize: 17,
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'rgba(245,239,224,0.7)',
            maxWidth: 600,
            marginBottom: 32,
          }}
        >
          Permits, rebates, lake setbacks, mud-season timing, contractor history. We pull all of it
          together, by address, in one page.
        </p>

        <form
          onSubmit={e => {
            e.preventDefault()
            go()
          }}
          style={{ position: 'relative', maxWidth: 560 }}
        >
          <div
            style={{
              display: 'flex',
              gap: 0,
              backgroundColor: 'rgba(8,16,6,0.72)',
              border: '1px solid rgba(122,155,111,0.3)',
              borderRadius: 4,
              overflow: 'hidden',
              backdropFilter: 'blur(8px)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={addr}
              onChange={e => onType(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setOpen(true)
              }}
              placeholder="123 Mountain Road, Stowe"
              autoComplete="off"
              autoCapitalize="words"
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: 'transparent',
                fontSize: 16,
                color: '#F5EFE0',
                outline: 'none',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            />
            <button
              type="submit"
              disabled={loading || !addr.trim()}
              style={{
                padding: '0 24px',
                border: 'none',
                backgroundColor: addr.trim() ? '#C8732A' : 'rgba(200,115,42,0.4)',
                color: '#FAF7F2',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                letterSpacing: '0.04em',
                cursor: addr.trim() ? 'pointer' : 'not-allowed',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Loading…' : 'See profile →'}
            </button>
          </div>
          {open && suggestions.length > 0 && (
            <div
              ref={ddRef}
              style={{
                position: 'absolute',
                zIndex: 20,
                left: 0,
                right: 0,
                top: 'calc(100% + 4px)',
                background: 'white',
                borderRadius: 4,
                boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
                overflow: 'hidden',
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={s.magicKey}
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  onMouseEnter={() => setHighlight(i)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left' as const,
                    padding: '11px 16px',
                    border: 'none',
                    background: highlight === i ? '#FAF7F2' : 'transparent',
                    fontSize: 13,
                    color: '#1C2B1A',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    borderBottom: i < suggestions.length - 1 ? '1px solid #FAF7F2' : 'none',
                  }}
                >
                  <span style={{ display: 'inline-block', marginRight: 8, color: '#C8732A' }}>→</span>
                  {formatSuggestion(s.text)}
                </button>
              ))}
            </div>
          )}
        </form>

        <p
          style={{
            fontSize: 13,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: 'rgba(245,239,224,0.6)',
            marginTop: 22,
            maxWidth: 560,
          }}
        >
          Don&apos;t have a Vermont address yet?{' '}
          <Link
            href={CONFIG.homepage.intentDemoLinks.owner}
            onClick={onSampleClick}
            style={{
              color: '#C8732A',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {CONFIG.homepage.sampleProperty.label}
          </Link>
        </p>

        <p
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
            color: 'rgba(245,239,224,0.3)',
            marginTop: 36,
          }}
        >
          Real Vermont data · Free · No account · No spam
        </p>
      </div>
    </section>
  )
}
