'use client'

/**
 * v7.3.4-PR1 — V3 Cart View (shared client component).
 *
 * Lifted from the v7.3.3-C `/project-read/basement/result/[cartId]/ResultView.tsx`.
 * Renders a v3 LearningStore-synthesized cart (mixed-category, source-aware)
 * in both result locations:
 *
 *   1. `/project-read/basement/result/[cartId]` — free photo-beta cart
 *      (anon-owned, no payment).
 *   2. `/smart-cart/result/[cartId]` — paid cart whose synthesisVersion
 *      is `v3_learning_store` (chat-fallback-to-v3 carts from PR4, and
 *      photo-originated paid carts from PR3 once Stripe is wired).
 *
 * Adds the v7.3.4-PR1 reaction substrate:
 *   - 👍 / dismiss / "doesn't apply" buttons on every cart item
 *   - "doesn't apply" opens an inline freeform text field so the
 *     visitor can explain what was wrong; submission writes a
 *     LearningStoreFeedback row.
 *   - Reactions POST to /api/cart/reaction which updates
 *     LearningStore counts + writes EventLog.
 *
 * Idempotency: buttons disable after click in this session (per
 * cartId + signature + reactionType). A determined user can dual-tab
 * to double-vote — accepted tradeoff for v0; revisit in v7.5.
 */

import { useState } from 'react'

// Local type duplicates SynthCartItemV3 from synthesize-v3 so this
// client component doesn't import server-only code.
export interface CartItemV3 {
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

export interface V3CartViewProps {
  cartId: string
  items: CartItemV3[]
  /** Show the email-save block under the cart (free beta only). */
  showEmailSave?: boolean
  /** Free-photo-beta vs paid context drives header copy. */
  heading?: string
  subhead?: string
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

type ReactionType = 'thumbs_up' | 'dismiss' | 'doesnt_apply'

export function V3CartView({
  cartId,
  items,
  showEmailSave = false,
  heading = 'Your home photo read',
  subhead,
}: V3CartViewProps) {
  // Tracks per-item reaction state so buttons disable after click.
  // Key is `${signature}:${reactionType}`. Value is 'pending' during
  // POST or 'done' after success.
  const [reactionState, setReactionState] = useState<
    Record<string, 'pending' | 'done'>
  >({})

  const grouped = groupByCategory(items)

  async function postReaction(
    signature: string,
    reactionType: ReactionType,
    feedbackText?: string
  ) {
    const key = `${signature}:${reactionType}`
    if (reactionState[key]) return // already pending or done
    setReactionState((prev) => ({ ...prev, [key]: 'pending' }))
    try {
      const res = await fetch('/api/cart/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          signature,
          reactionType,
          feedbackText,
        }),
      })
      if (!res.ok) {
        // Roll back so the user can retry.
        setReactionState((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        return
      }
      setReactionState((prev) => ({ ...prev, [key]: 'done' }))
    } catch {
      setReactionState((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const fallbackSubhead =
    items.length > 0
      ? `We turned your photos into ${items.length} ${
          items.length === 1 ? 'recommendation' : 'recommendations'
        }${grouped.length > 1 ? ` across ${grouped.length} categories` : ''}. Each one is tied to something we actually saw.`
      : "We couldn't turn your photos into specific recommendations this time. Try uploading clearer wide-angle photos."

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
        <p className="mt-2 text-sm text-gray-600">{subhead ?? fallbackSubhead}</p>
      </header>

      {grouped.length === 0 ? (
        <div className="mb-8 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
          We don&apos;t have anything to surface for these photos yet. As more
          homeowners use the Read, this gets smarter — recommendations for the
          situations you uploaded will accumulate in our curated cache.
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
                  <CartItemCard
                    key={item.signature}
                    item={item}
                    reactionState={reactionState}
                    onReact={postReaction}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {showEmailSave && <EmailSaveBlock cartId={cartId} />}
    </div>
  )
}

function CartItemCard({
  item,
  reactionState,
  onReact,
}: {
  item: CartItemV3
  reactionState: Record<string, 'pending' | 'done'>
  onReact: (
    signature: string,
    reactionType: ReactionType,
    feedbackText?: string
  ) => void | Promise<void>
}) {
  const isProduct = item.lane === 'BUY' && item.affiliateUrl
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  const stateOf = (rt: ReactionType) => reactionState[`${item.signature}:${rt}`]

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

      {item.caution && item.lane === 'BUY' && (
        <p className="mt-2 text-sm text-amber-800">
          <strong>Heads up:</strong> {item.caution}
        </p>
      )}

      {/* PR1 reaction row */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-500">Did this help?</span>
        <ReactionButton
          label="👍 Yes"
          disabled={!!stateOf('thumbs_up')}
          done={stateOf('thumbs_up') === 'done'}
          onClick={() => onReact(item.signature, 'thumbs_up')}
        />
        <ReactionButton
          label="Dismiss"
          disabled={!!stateOf('dismiss')}
          done={stateOf('dismiss') === 'done'}
          onClick={() => onReact(item.signature, 'dismiss')}
        />
        <ReactionButton
          label="Doesn’t apply"
          disabled={!!stateOf('doesnt_apply')}
          done={stateOf('doesnt_apply') === 'done'}
          onClick={() => {
            if (stateOf('doesnt_apply')) return
            setFeedbackOpen((open) => !open)
          }}
        />
      </div>

      {feedbackOpen && !stateOf('doesnt_apply') && (
        <div className="mt-3 space-y-2 rounded-md bg-gray-50 p-3">
          <label
            htmlFor={`feedback-${item.signature}`}
            className="block text-xs text-gray-600"
          >
            Tell us what’s different about your situation (optional but helps):
          </label>
          <textarea
            id={`feedback-${item.signature}`}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="e.g. The dehumidifier in our basement is broken."
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReact(item.signature, 'doesnt_apply', feedbackText || undefined)
                setFeedbackOpen(false)
              }}
              className="rounded bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-black"
            >
              Send
            </button>
            <button
              onClick={() => {
                setFeedbackOpen(false)
                setFeedbackText('')
              }}
              className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {stateOf('doesnt_apply') === 'done' && (
        <p className="mt-2 text-xs text-emerald-700">Thanks — that helps us learn.</p>
      )}
    </article>
  )
}

function ReactionButton({
  label,
  disabled,
  done,
  onClick,
}: {
  label: string
  disabled: boolean
  done: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-3 py-1 text-xs ${
        done
          ? 'bg-emerald-100 text-emerald-800'
          : disabled
            ? 'bg-gray-100 text-gray-400'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {done ? '✓ Sent' : label}
    </button>
  )
}

function SourceBadge({
  source,
  confidence,
}: {
  source: CartItemV3['source']
  confidence: CartItemV3['confidence']
}) {
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
    if (existing) existing.push(item)
    else map.set(item.category, [item])
  }
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
        Email yourself a link to come back to this list later, or to tell us how
        things went in 30 days.
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
