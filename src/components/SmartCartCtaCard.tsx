/**
 * v7.2.18-B3 — Smart Cart / Worth-It CTA card.
 *
 * Rendered inside chat assistant messages in place of raw product URLs.
 * Detects a Smart Cart or Worth-It URL pattern in the assistant's reply,
 * parses the scope/plan param, and renders a tappable card with name +
 * price + CTA.
 *
 * v7.2.18-B6 extends the original Smart Cart-only renderer to also catch
 * Worth-It Plan URLs (/worth-it?...) so the bot can offer either product
 * inline and the UI swaps them for tappable cards.
 *
 * The bot's prompt (see SMART_CART_CONTEXT) instructs it to emit the URL
 * inline; this UI suppresses the raw URL and replaces it with the card so
 * mobile taps land on the right scope/plan without users copy-pasting.
 */

import { SMART_CART_SCOPES } from '@/lib/smart-cart-context'

// ---------- URL parsing ---------------------------------------------------

// Match either absolute (https://alderprojects.com/{smart-cart|worth-it}?...)
// or relative (/{smart-cart|worth-it}?...) URLs. Capture the path + query.
const CHAT_CTA_URL_RE =
  /(?:https?:\/\/(?:www\.)?alderprojects\.com)?(\/(?:smart-cart|worth-it)\?[^\s)]+)/g

export type ChatCtaProduct = 'smart_cart' | 'worth_it'

export type ChatCta = {
  product: ChatCtaProduct
  rawUrl: string // the matched URL text in the message
  href: string // normalized relative href for Next Link
  scopeId: string | null // smart-cart scope OR worth-it plan id
  topic: string | null
  scopeLabel: string // "Memorial Day weekend cookout" / "Worth-It Plan"
  leanCartHint: string // 3-5 word summary
}

// Back-compat alias for v7.2.18-B3 callers.
export type ChatSmartCartCta = ChatCta

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

function parseCtaUrl(rawUrl: string): ChatCta {
  const href = rawUrl.replace(/^https?:\/\/(?:www\.)?alderprojects\.com/, '')
  const product: ChatCtaProduct = href.startsWith('/worth-it')
    ? 'worth_it'
    : 'smart_cart'
  let scopeId: string | null = null
  let topic: string | null = null
  try {
    const u = new URL(href, 'https://alderprojects.com')
    // Worth-It uses ?plan= where Smart Cart uses ?scope=. Read either.
    scopeId = u.searchParams.get('scope') ?? u.searchParams.get('plan')
    topic = u.searchParams.get('topic')
  } catch {
    /* ignore */
  }

  if (product === 'worth_it') {
    return {
      product,
      rawUrl,
      href,
      scopeId,
      topic,
      scopeLabel: 'Worth-It Plan',
      leanCartHint:
        'Ranked playbook for your property — what to do first, where the DIY stop line is.',
    }
  }

  const scopeRecord = scopeId
    ? SMART_CART_SCOPES.find(s => s.id === scopeId)
    : null
  const scopeLabel = scopeRecord?.label ?? 'Smart Cart'
  const leanCartHint =
    (scopeId && SCOPE_LEAN_CART_HINTS[scopeId]) ||
    'Real picks, real Vermont notes.'
  return { product, rawUrl, href, scopeId, topic, scopeLabel, leanCartHint }
}

// ---------- Renderer -----------------------------------------------------

/**
 * Detect all Smart Cart / Worth-It URLs in a chat message. Returns ordered
 * segments: each is either plain text (rendered as-is) or a CTA card.
 */
export function segmentChatMessage(
  content: string,
): Array<{ kind: 'text'; text: string } | { kind: 'cta'; cta: ChatCta }> {
  const out: Array<{ kind: 'text'; text: string } | { kind: 'cta'; cta: ChatCta }> = []
  let lastIndex = 0
  // RegExp.exec with global flag mutates lastIndex; reset before iterating.
  const re = new RegExp(CHAT_CTA_URL_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const rawUrl = m[0]
    const start = m.index
    if (start > lastIndex) {
      const text = content.slice(lastIndex, start)
      out.push({ kind: 'text', text })
    }
    out.push({ kind: 'cta', cta: parseCtaUrl(rawUrl) })
    lastIndex = start + rawUrl.length
  }
  if (lastIndex < content.length) {
    out.push({ kind: 'text', text: content.slice(lastIndex) })
  }
  return out
}

// ---------- Card UI ------------------------------------------------------

export function SmartCartCtaCard({ cta }: { cta: ChatCta }) {
  const isWorthIt = cta.product === 'worth_it'
  const eyebrow = isWorthIt ? 'Worth-It Plan' : 'Smart Cart'
  const headline = isWorthIt
    ? cta.scopeLabel === 'Worth-It Plan'
      ? 'Your Worth-It Plan'
      : `Your ${cta.scopeLabel} plan`
    : `Your ${cta.scopeLabel} cart`
  const priceLine = isWorthIt
    ? '$39 · 24-hour full refund'
    : '$19.99 · 24-hour full refund'
  const ctaLabel = isWorthIt ? 'Build my plan →' : 'Build it now →'
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
        {eyebrow}
      </div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '16px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.25 }}>
        {headline}
      </div>
      <div style={{ fontSize: '13px', color: 'rgba(245,239,224,0.7)', marginBottom: '10px', lineHeight: 1.45 }}>
        {cta.leanCartHint}
      </div>
      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(245,239,224,0.55)', marginBottom: '10px' }}>
        {priceLine}
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
        {ctaLabel}
      </div>
    </a>
  )
}
