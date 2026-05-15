/**
 * v7.2.18-B3 — Smart Cart CTA card.
 *
 * Rendered inside chat assistant messages in place of raw smart-cart URLs.
 * Detects a Smart Cart URL pattern in the assistant's reply, parses the
 * scope param, and renders a tappable card with scope name + price + CTA.
 *
 * The bot's prompt (see SMART_CART_CONTEXT) instructs it to emit the URL
 * inline; this UI suppresses the raw URL and replaces it with the card so
 * mobile taps land on the right scope without users having to copy-paste.
 */

import { SMART_CART_SCOPES } from '@/lib/smart-cart-context'

// ---------- URL parsing ---------------------------------------------------

// Match either absolute (https://alderprojects.com/smart-cart?...) or
// relative (/smart-cart?...) Smart Cart URLs. Capture the query string.
const SMART_CART_URL_RE =
  /(?:https?:\/\/(?:www\.)?alderprojects\.com)?(\/smart-cart\?[^\s)]+)/g

export type ChatSmartCartCta = {
  rawUrl: string // the matched URL text in the message
  href: string // normalized relative href for Next Link
  scopeId: string | null
  topic: string | null
  scopeLabel: string // "Memorial Day weekend cookout" etc.
  leanCartHint: string // 3-5 word summary
}

const SCOPE_LEAN_CART_HINTS: Record<string, string> = {
  window_weatherization: 'Drafts, gaps, films — the $100 fix.',
  basement_moisture_prep: 'Diagnostic before the $20k finish.',
  mudroom_entry_reset: 'Boots, coats, slush — sized for VT.',
  outdoor_lake_season: 'Lean lake setup, no designer markup.',
  kitchen_organizers: 'Drawer, pantry, cabinet — what fits.',
  outdoor_freeze_prevention: 'Pipes, bibs, drains — pre-freeze.',
  outdoor_seasonal_opening: 'Camp open-up — diagnostic first.',
  kitchen_cosmetic_refresh: 'Hardware + faucet + lighting.',
  kitchen_cabinet_hardware_swap: 'Pulls + knobs without designer markup.',
  memorial_day_weekend: 'Cookout setup, no peak-priced traps.',
  grill_purchase: 'Right tier without the upsell.',
}

function parseSmartCartUrl(rawUrl: string): ChatSmartCartCta {
  const href = rawUrl.replace(/^https?:\/\/(?:www\.)?alderprojects\.com/, '')
  // Use URL parser on a dummy base so relative paths parse cleanly.
  let scopeId: string | null = null
  let topic: string | null = null
  try {
    const u = new URL(href, 'https://alderprojects.com')
    scopeId = u.searchParams.get('scope')
    topic = u.searchParams.get('topic')
  } catch {
    /* ignore */
  }
  const scopeRecord = scopeId
    ? SMART_CART_SCOPES.find(s => s.id === scopeId)
    : null
  const scopeLabel = scopeRecord?.label ?? 'Smart Cart'
  const leanCartHint =
    (scopeId && SCOPE_LEAN_CART_HINTS[scopeId]) ||
    'Real picks, real Vermont notes.'
  return { rawUrl, href, scopeId, topic, scopeLabel, leanCartHint }
}

// ---------- Renderer -----------------------------------------------------

/**
 * Detect all Smart Cart URLs in a chat message. Returns ordered segments:
 * each is either plain text (which the caller renders as-is) or a CTA card.
 */
export function segmentChatMessage(
  content: string,
): Array<{ kind: 'text'; text: string } | { kind: 'cta'; cta: ChatSmartCartCta }> {
  const out: Array<{ kind: 'text'; text: string } | { kind: 'cta'; cta: ChatSmartCartCta }> = []
  let lastIndex = 0
  // RegExp.exec with global flag mutates lastIndex; reset before iterating.
  const re = new RegExp(SMART_CART_URL_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const rawUrl = m[0]
    const start = m.index
    if (start > lastIndex) {
      const text = content.slice(lastIndex, start)
      out.push({ kind: 'text', text })
    }
    out.push({ kind: 'cta', cta: parseSmartCartUrl(rawUrl) })
    lastIndex = start + rawUrl.length
  }
  if (lastIndex < content.length) {
    out.push({ kind: 'text', text: content.slice(lastIndex) })
  }
  return out
}

// ---------- Card UI ------------------------------------------------------

export function SmartCartCtaCard({ cta }: { cta: ChatSmartCartCta }) {
  return (
    <a
      href={cta.href}
      style={{
        display: 'block',
        margin: '8px 0',
        padding: '14px 16px',
        backgroundColor: '#1C2B1A',
        color: '#F5EFE0',
        textDecoration: 'none',
        borderRadius: '8px',
        border: '1px solid rgba(122,155,111,0.3)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A9B6F', marginBottom: '4px' }}>
        Smart Cart
      </div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.25 }}>
        Your {cta.scopeLabel} cart
      </div>
      <div style={{ fontSize: '13px', color: 'rgba(245,239,224,0.7)', marginBottom: '10px', lineHeight: 1.45 }}>
        {cta.leanCartHint}
      </div>
      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.55)', marginBottom: '10px' }}>
        $19.99 · 24-hour full refund
      </div>
      <div
        style={{
          display: 'inline-block',
          padding: '8px 14px',
          backgroundColor: '#C8732A',
          color: '#FAF7F2',
          fontSize: '13px',
          fontWeight: 600,
          borderRadius: '3px',
        }}
      >
        Build it now →
      </div>
    </a>
  )
}
