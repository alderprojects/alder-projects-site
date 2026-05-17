'use client'

/**
 * v7.3.3-C-PR2 Home Read result view (client component).
 *
 * Renders the LearningStore-synthesized cart. Items can be:
 *   - Product BUYs (with affiliate link + price band)
 *   - SKIP / WAIT / PRO_LINE recommendations (no product, just guidance)
 *   - "Saw it but no rec yet" stubs (queue overflow or LLM error)
 *
 * Each item shows lane, headline, reasoning, an optional caution,
 * a category badge, and a confidence/source badge. PR3 will replace
 * the placeholder badge area with reaction buttons (thumbs-up,
 * dismiss, doesn't apply) that POST to /api/cart/reaction.
 */

import { useState } from 'react'

// Local type duplicates SynthCartItemV3 from synthesize-v3 so the
// client component doesn't import server-only code. The shape is
// load-bearing (drives the render) and bumped on schema changes.
interface CartItemV3 {
  slot: string
  productId: string
  productName: string
  affiliateUrl: string
  tier: 'budget' | 'sweet_spot' | 'premium'
  priceBand: string
  selectionReason: string
  lane: 'BUY' | 'SKIP' | 'WAIT' | 'PRO_LINE'
  source: 'curated' | 'ai_generated'
  category: string
  confidence: 'high' | 'low'
  signature: string
  occurrenceCount: number
  caution?: string
  headline: string
}

interface SmartCartRow {
  id: string
  photoChangedRecommendation: boolean | null
  cartJson: unknown
  cartItemsJsonWithPhotos: unknown
  changeSummaryJson: unknown
}

interface Props {
  cart: SmartCartRow
}

const LANE_STYLE: Record<CartItemV3['lane'], string> = {
  BUY: 'bg-emerald-100 text-emerald-800',
  SKIP: 'bg-gray-200 text-gray-700',
  WAIT: 'bg-amber-100 text-amber-800',
  PRO_LINE: 'bg-blue-100 text-blue-800',
}

const LANE_LABEL: Record<CartItemV3['lane'], string> = {
  BUY: 'BUY',
  SKIP: 'SKIP',
  WAIT: 'WAIT',
  PRO_LINE: 'CALL A PRO',
}

export function ResultView({ cart }: Props) {
  const items =
    ((cart.cartItemsJsonWithPhotos ?? cart.cartJson) as CartItemV3[]) ?? []

  const photoChanged = cart.photoChangedRecommendation === true

  // Group by category for the mixed-category render.
  const grouped = groupByCategory(items)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your home photo read</h1>
        {items.length > 0 ? (
          <p className="mt-2 text-sm text-emerald-700">
            We turned your photos into {items.length} {items.length === 1 ? 'recommendation' : 'recommendations'}
            {grouped.length > 1 ? ` across ${grouped.length} categories` : ''}. Each one is tied to something we actually saw in your photos.
          </p>
        ) : photoChanged ? (
          <p className="mt-2 text-sm text-gray-600">
            We synthesized a read but ended up with no actionable recommendations this time. Try uploading clearer wide-angle photos that show more of the area.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            We couldn&apos;t turn your photos into specific recommendations. Try uploading clearer wide-angle photos that show more of the area.
          </p>
        )}
      </header>

      {grouped.length === 0 ? (
        <div className="mb-8 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
          We don&apos;t have anything to surface for these photos yet. As more homeowners use the Read, this gets smarter — recommendations for the situations you uploaded will accumulate in our curated cache.
        </div>
      ) : (
        <section className="mb-8 space-y-6">
          {grouped.map((group) => (
            <div key={group.category}>
              <h2 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                {prettyCategory(group.category)}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <CartItemCard key={item.signature} item={item} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <EmailSaveBlock cartId={cart.id} />
    </main>
  )
}

function CartItemCard({ item }: { item: CartItemV3 }) {
  const isProduct = item.lane === 'BUY' && item.affiliateUrl

  return (
    <article className="rounded-lg border border-gray-200 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded px-2 py-1 text-xs uppercase tracking-wide ${LANE_STYLE[item.lane]}`}
        >
          {LANE_LABEL[item.lane]}
        </span>
        <SourceBadge source={item.source} confidence={item.confidence} />
        {item.occurrenceCount > 1 && (
          <span className="text-xs text-gray-500">
            seen in {item.occurrenceCount} photos
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{item.headline}</h3>
          {isProduct && (
            <p className="text-sm text-gray-500">
              {item.productName} · {item.priceBand} · {item.tier}
            </p>
          )}
        </div>
        {isProduct && (
          <a
            href={item.affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="shrink-0 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
          >
            View
          </a>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-700">{item.selectionReason}</p>

      {item.caution && item.lane !== 'BUY' && (
        // For non-BUY lanes the caution is already woven into the
        // reasoning; only show it as a separate "heads up" when
        // there's also a product to highlight a sequencing concern.
        null
      )}
      {item.caution && item.lane === 'BUY' && (
        <p className="mt-2 text-sm text-amber-800">
          <strong>Heads up:</strong> {item.caution}
        </p>
      )}
    </article>
  )
}

function SourceBadge({
  source,
  confidence,
}: {
  source: CartItemV3['source']
  confidence: CartItemV3['confidence']
}) {
  // High-confidence curated OR ai_generated-with-good-reactions look
  // the same — standard recommendation treatment, no badge needed.
  // Low-confidence (fresh ai_generated, no reaction data yet) gets
  // a "new for your situation" badge with a feedback invitation.
  if (confidence === 'high') return null
  return (
    <span
      className="inline-block rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] uppercase tracking-wider text-amber-800"
      title={
        source === 'ai_generated'
          ? 'Freshly generated for your situation — your reaction helps us learn what fits.'
          : 'Limited reaction data so far.'
      }
    >
      new for your situation
    </span>
  )
}

interface CategoryGroup {
  category: string
  items: CartItemV3[]
}

function groupByCategory(items: CartItemV3[]): CategoryGroup[] {
  const map = new Map<string, CartItemV3[]>()
  for (const item of items) {
    const existing = map.get(item.category)
    if (existing) {
      existing.push(item)
    } else {
      map.set(item.category, [item])
    }
  }
  // Order: BUY-bearing categories first, then everything else.
  return Array.from(map.entries())
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => {
      const aBuy = a.items.some((i) => i.lane === 'BUY') ? 0 : 1
      const bBuy = b.items.some((i) => i.lane === 'BUY') ? 0 : 1
      return aBuy - bBuy
    })
}

function prettyCategory(category: string): string {
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function EmailSaveBlock({ cartId }: { cartId: string }) {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState<'idle' | 'saving' | 'sent' | 'error'>('idle')

  async function save() {
    if (!email) return
    setStage('saving')
    try {
      const res = await fetch('/api/account/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cartId }),
      })
      if (res.ok) setStage('sent')
      else setStage('error')
    } catch {
      setStage('error')
    }
  }

  return (
    <aside className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-2 font-medium text-gray-900">Save this read</h3>
      <p className="mb-3 text-sm text-gray-600">
        Email yourself a link to come back to this list later, or to tell us how things went in 30 days.
      </p>
      {stage === 'sent' ? (
        <p className="text-sm text-emerald-700">Sent. Check your inbox for the link.</p>
      ) : (
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={save}
            disabled={!email || stage === 'saving'}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-60"
          >
            {stage === 'saving' ? 'Sending…' : 'Email me'}
          </button>
        </div>
      )}
      {stage === 'error' && (
        <p className="mt-2 text-sm text-red-700">Couldn&apos;t send. Try again.</p>
      )}
    </aside>
  )
}
