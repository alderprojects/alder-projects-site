'use client'

/**
 * v7.3.4-PR3.6 — V3 Cart View (shared client component).
 *
 * Commerce-moment retrofit per the v7.3.4 amendment:
 *   - 4-lane vocab: BUY, SKIP, WAIT, MONITOR (PRO_LINE / CALL A PRO removed)
 *   - Brief intro section above the lanes (max 2-3 sentences, set by
 *     synthesizeCartV3's deterministic composer)
 *   - "Want the full diagnostic?" v75_signup footer (email capture for
 *     the future Project Read product launch)
 *   - Per-section instrumentation: RESULT_SECTION_ENGAGEMENT fires
 *     on scroll-into-view, reaction-click, affiliate-click, signup-click
 *   - Page-level instrumentation: RESULT_VIEW_SECONDS via beacon on
 *     page unload
 *
 * Renders at both result URLs:
 *   - /project-read/basement/result/[cartId] (free beta)
 *   - /smart-cart/result/[cartId] (paid v3 carts, dispatched in PR1)
 *
 * The reaction substrate (👍/dismiss/doesn't apply + inline freeform
 * text on doesn't-apply) shipped in PR1 stays unchanged.
 */

import { useEffect, useRef, useState } from 'react'

// =============================================================================
// PUBLIC TYPES
// =============================================================================

export interface CartItemV3 {
  slot: string
  productId: string
  productName: string
  affiliateUrl: string
  tier: 'budget' | 'sweet_spot' | 'premium'
  priceBand: string
  selectionReason: string
  lane: 'BUY' | 'SKIP' | 'WAIT' | 'MONITOR'
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
  /** changeSummaryJson now carries introText per PR3.6 amendment. */
  changeSummaryJson: unknown
}

export interface ClarificationFeature {
  type: string
  condition: string
  confidence: number
  category_hint: string
}

export interface V3CartViewProps {
  cartId: string
  items: CartItemV3[]
  /** Set by SmartCart.changeSummaryJson.introText if present. */
  introText?: string | null
  /** PR3.7 §1.2 — render category-clarification surface instead of lanes. */
  needsCategoryClarification?: boolean
  /** PR3.7 §1.6 — render needs-more-photos state instead of lanes. */
  needsMorePhotos?: boolean
  /** Features the extraction was confident about; surfaced in §1.2 and §1.6 states. */
  clarificationFeatures?: ClarificationFeature[]
  /** Show the email-save block under the cart (free beta only). */
  showEmailSave?: boolean
  /** Cart heading copy. */
  heading?: string
  /** Show the v7.5 diagnostic-product waitlist footer (paid carts only). */
  showV75Footer?: boolean
  /** Optional URL to send the visitor to when they need to upload more photos. */
  uploadMoreHref?: string
}

// =============================================================================
// LANE STYLING (4-lane vocab post-amendment)
// =============================================================================

const LANE_STYLE: Record<CartItemV3['lane'], string> = {
  BUY: 'bg-emerald-100 text-emerald-800',
  SKIP: 'bg-gray-200 text-gray-700',
  WAIT: 'bg-amber-100 text-amber-800',
  MONITOR: 'bg-blue-100 text-blue-800',
}

const LANE_LABEL: Record<CartItemV3['lane'], string> = {
  BUY: 'BUY',
  SKIP: 'SKIP',
  WAIT: 'WAIT',
  MONITOR: 'MONITOR',
}

const LANE_DESCRIPTION: Record<CartItemV3['lane'], string> = {
  BUY: 'Buy this — what to get for your project.',
  SKIP: 'Skip this — common recommendations that don’t apply.',
  WAIT: 'Buy this later — here’s the trigger.',
  MONITOR: 'Track these conditions before related buys.',
}

// PR3.7 §1.4: commerce-moment order. BUY first (what the customer is
// paying attention for), then WAIT (what to defer), MONITOR (what to
// track), SKIP last (saves money but is not the headline).
const LANE_ORDER: Array<CartItemV3['lane']> = ['BUY', 'WAIT', 'MONITOR', 'SKIP']

type ReactionType = 'thumbs_up' | 'dismiss' | 'doesnt_apply'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function V3CartView({
  cartId,
  items,
  introText,
  needsCategoryClarification = false,
  needsMorePhotos = false,
  clarificationFeatures = [],
  showEmailSave = false,
  heading = 'Your Smart Cart',
  showV75Footer = true,
  uploadMoreHref = '/project-read/home',
}: V3CartViewProps) {
  const [reactionState, setReactionState] = useState<
    Record<string, 'pending' | 'done'>
  >({})

  // ---- Instrumentation: RESULT_VIEW_SECONDS on unload ----
  const mountedAtRef = useRef<number>(Date.now())
  useEffect(() => {
    function fireBeacon() {
      const secondsOnPage = Math.round((Date.now() - mountedAtRef.current) / 1000)
      if (secondsOnPage <= 0) return
      const body = JSON.stringify({
        eventType: 'RESULT_VIEW_SECONDS',
        payload: { cartId, secondsOnPage },
      })
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon('/api/events/funnel', blob)
      } else {
        // Fallback for environments without sendBeacon
        fetch('/api/events/funnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {})
      }
    }
    // Use pagehide (more reliable than unload on mobile) + visibilitychange.
    const onHide = () => fireBeacon()
    window.addEventListener('pagehide', onHide)
    return () => {
      window.removeEventListener('pagehide', onHide)
    }
  }, [cartId])

  async function postReaction(
    signature: string,
    reactionType: ReactionType,
    feedbackText?: string
  ) {
    const key = `${signature}:${reactionType}`
    if (reactionState[key]) return
    setReactionState((prev) => ({ ...prev, [key]: 'pending' }))
    try {
      const res = await fetch('/api/cart/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, signature, reactionType, feedbackText }),
      })
      if (!res.ok) {
        setReactionState((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        return
      }
      setReactionState((prev) => ({ ...prev, [key]: 'done' }))
      // Section engagement event
      fireFunnelEvent('RESULT_SECTION_ENGAGEMENT', {
        cartId,
        section: laneToSection(items.find((i) => i.signature === signature)?.lane),
        engagementType: 'clicked_reaction',
        reactionType,
      })
    } catch {
      setReactionState((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Group items into the 4 lane buckets in fixed lane order.
  const itemsByLane: Record<CartItemV3['lane'], CartItemV3[]> = {
    BUY: [],
    SKIP: [],
    WAIT: [],
    MONITOR: [],
  }
  for (const item of items) {
    itemsByLane[item.lane].push(item)
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
      </header>

      {/* PR3.7 §1.2: category-clarification surface comes FIRST when
          the extraction couldn't confidently pick a project category.
          Renders before the intro/lanes so the visitor's pick can
          re-route the experience. */}
      {needsCategoryClarification ? (
        <CategoryClarificationSurface
          cartId={cartId}
          clarificationFeatures={clarificationFeatures}
          uploadMoreHref={uploadMoreHref}
        />
      ) : needsMorePhotos ? (
        /* PR3.7 §1.6: needs-more-photos state when extraction was OK
           but synthesis produced zero BUY items. */
        <NeedsMorePhotosSurface
          cartId={cartId}
          clarificationFeatures={clarificationFeatures}
          uploadMoreHref={uploadMoreHref}
        />
      ) : (
        <>
          {/* PR3.6 commerce-moment intro. 1-3 sentences. */}
          {introText && (
            <SectionTracker
              cartId={cartId}
              section="intro"
              className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
            >
              {introText}
            </SectionTracker>
          )}

          {/* PR3.7 §1.4 lane order: BUY -> WAIT -> MONITOR -> SKIP.
              Empty lanes collapse to a one-line "no X items for your
              situation" rather than render an empty header. */}
          <section className="mb-8 space-y-6">
            {LANE_ORDER.map((lane) => {
              const laneItems = itemsByLane[lane]
              if (laneItems.length === 0) {
                return (
                  <p
                    key={lane}
                    className="text-xs text-gray-500"
                  >
                    No {LANE_LABEL[lane]} items for your situation.
                  </p>
                )
              }
              return (
                <SectionTracker
                  key={lane}
                  cartId={cartId}
                  section={laneToSection(lane)}
                >
                  <div className="mb-2 flex items-baseline gap-2">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs uppercase tracking-wide ${LANE_STYLE[lane]}`}
                    >
                      {LANE_LABEL[lane]} · {laneItems.length}
                    </span>
                    <span className="text-xs text-gray-500">
                      {LANE_DESCRIPTION[lane]}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {laneItems.map((item) => (
                      <CartItemCard
                        key={item.signature}
                        item={item}
                        reactionState={reactionState}
                        onReact={postReaction}
                        onAffiliateClick={() => {
                          fireFunnelEvent('RESULT_SECTION_ENGAGEMENT', {
                            cartId,
                            section: laneToSection(item.lane),
                            engagementType: 'clicked_affiliate',
                            signature: item.signature,
                          })
                        }}
                      />
                    ))}
                  </div>
                </SectionTracker>
              )
            })}
          </section>

          {showV75Footer && <V75WaitlistFooter cartId={cartId} />}

          {showEmailSave && <EmailSaveBlock cartId={cartId} />}
        </>
      )}
    </div>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function CartItemCard({
  item,
  reactionState,
  onReact,
  onAffiliateClick,
}: {
  item: CartItemV3
  reactionState: Record<string, 'pending' | 'done'>
  onReact: (
    signature: string,
    reactionType: ReactionType,
    feedbackText?: string
  ) => void | Promise<void>
  onAffiliateClick: () => void
}) {
  const isProduct = item.lane === 'BUY' && item.affiliateUrl
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  const stateOf = (rt: ReactionType) => reactionState[`${item.signature}:${rt}`]

  return (
    <article className="rounded-lg border border-gray-200 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SourceBadge
          source={item.source}
          confidence={item.confidence}
          selectionReason={item.selectionReason}
        />
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
            onClick={onAffiliateClick}
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

      {/* Reaction row */}
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

/**
 * PR3.7 §1.5: badge is now SELECTIVE, not universal.
 * Shown only when both:
 *   - confidence === 'low' (item is ai_generated without strong reactions), AND
 *   - the item's reasoning has a photo-specific anchor (mentions "saw",
 *     "your", or contains a non-generic feature reference)
 * When there's no photo anchor, no badge — the item stands on its content.
 */
function SourceBadge({
  source,
  confidence,
  selectionReason,
}: {
  source: CartItemV3['source']
  confidence: CartItemV3['confidence']
  selectionReason: string
}) {
  if (confidence === 'high') return null
  const lower = selectionReason.toLowerCase()
  const hasPhotoAnchor =
    lower.includes('we saw') ||
    lower.includes('we noticed') ||
    lower.includes('your photo') ||
    lower.includes('in your') ||
    lower.includes('based on your') ||
    lower.includes('the photos show')
  if (!hasPhotoAnchor) return null
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

// ---- PR3.7 §1.2 Category clarification surface ----

const CATEGORY_CHIPS: Array<{ id: string; label: string }> = [
  { id: 'basement', label: 'Basement / foundation' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'deck_or_patio', label: 'Deck or exterior' },
  { id: 'roof_or_gutter', label: 'Roof / gutters' },
  { id: 'electrical_panel', label: 'Electrical' },
  { id: 'hvac', label: 'HVAC / mechanical' },
  { id: 'unclear', label: 'None of these — something else' },
]

function CategoryClarificationSurface({
  cartId,
  clarificationFeatures,
  uploadMoreHref,
}: {
  cartId: string
  clarificationFeatures: ClarificationFeature[]
  uploadMoreHref: string
}) {
  function onPick(categoryId: string) {
    fireFunnelEvent('CATEGORY_CLARIFICATION_SUBMITTED', {
      cartId,
      pickedCategory: categoryId,
      hadExtractedFeatures: clarificationFeatures.length,
    })
    // For v0 we route the visitor to the topic picker with the
    // category pre-selected (chat-funnel entry). Per PR3.7 §1.6
    // secondary CTA. A future PR may re-run synthesis with the
    // category as a hint instead.
    if (categoryId === 'unclear') {
      window.location.href = '/smart-cart'
    } else {
      window.location.href = `/smart-cart?source=photo_clarify&category=${encodeURIComponent(categoryId)}`
    }
  }

  return (
    <SectionTracker
      cartId={cartId}
      section="intro"
      className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
    >
      <h2 className="text-lg font-medium text-amber-900">
        We see what&apos;s in your photos, but not what project this is for.
      </h2>
      {clarificationFeatures.length > 0 && (
        <>
          <p className="mt-2 text-sm text-amber-900">
            From your photos, we can see:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
            {clarificationFeatures.slice(0, 4).map((f) => (
              <li key={f.type}>{f.condition}</li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-3 text-sm font-medium text-amber-900">
        Pick the project this is for, so we can focus the cart:
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onPick(chip.id)}
            className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            {chip.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-amber-800">
        Or{' '}
        <a href={uploadMoreHref} className="underline">
          add a wider photo
        </a>{' '}
        to help us read the project.
      </p>
    </SectionTracker>
  )
}

// ---- PR3.7 §1.6 Needs-more-photos surface (BUY lane empty) ----

function NeedsMorePhotosSurface({
  cartId,
  clarificationFeatures,
  uploadMoreHref,
}: {
  cartId: string
  clarificationFeatures: ClarificationFeature[]
  uploadMoreHref: string
}) {
  return (
    <SectionTracker
      cartId={cartId}
      section="intro"
      className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4"
    >
      <h2 className="text-lg font-medium text-emerald-900">
        We need a different angle to give you a confident shopping list.
      </h2>
      {clarificationFeatures.length > 0 ? (
        <>
          <p className="mt-2 text-sm text-emerald-900">
            From your photos, we can see:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-emerald-900">
            {clarificationFeatures.slice(0, 4).map((f) => (
              <li key={f.type}>{f.condition}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-emerald-900">
            To give you specific buy recommendations, we need a wider shot of
            the area, a clearer view of the conditions above, or photos of
            related parts of the project (fixtures, the wall behind/around,
            adjacent surfaces).
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-emerald-900">
          Your photos didn&apos;t give us enough detail to ground specific
          product picks. Try a wider shot of the area, with more of the room
          in frame.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={uploadMoreHref}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Add more photos
        </a>
        <a
          href="/smart-cart"
          className="text-xs text-emerald-800 underline hover:text-emerald-900"
        >
          Or pick a topic to focus on
        </a>
      </div>
    </SectionTracker>
  )
}

// ---- v7.5 product-tier waitlist footer (PR3.6 amendment Change 3) ----

function V75WaitlistFooter({ cartId }: { cartId: string }) {
  const [email, setEmail] = useState('')
  const [stage, setStage] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit() {
    if (!email) return
    setStage('sending')
    fireFunnelEvent('RESULT_SECTION_ENGAGEMENT', {
      cartId,
      section: 'v75_signup',
      engagementType: 'clicked_signup',
    })
    try {
      const res = await fetch('/api/v75-signup', {
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
    <SectionTracker
      cartId={cartId}
      section="v75_signup"
      className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h3 className="text-sm font-medium text-gray-900">
        Want the full diagnostic on whether to do this project at all?
      </h3>
      <p className="mt-1 text-xs text-gray-600">
        Smart Cart answers <em>what to buy</em>. We&apos;re building a separate
        product (Project Read) that answers <em>whether and when</em> to do the
        project in the first place. Get notified when it launches.
      </p>
      {stage === 'sent' ? (
        <p className="mt-3 text-sm text-emerald-700">
          Thanks. We&apos;ll email you when Project Read launches.
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!email || stage === 'sending'}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-60"
          >
            {stage === 'sending' ? 'Sending…' : 'Notify me'}
          </button>
        </div>
      )}
      {stage === 'error' && (
        <p className="mt-2 text-xs text-red-700">Couldn&apos;t send. Try again.</p>
      )}
    </SectionTracker>
  )
}

// ---- IntersectionObserver wrapper for section-engagement tracking ----

function SectionTracker({
  cartId,
  section,
  className,
  children,
}: {
  cartId: string
  section: string
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fireFunnelEvent('RESULT_SECTION_ENGAGEMENT', {
            cartId,
            section,
            engagementType: 'scrolled_into_view',
          })
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cartId, section])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// ---- Legacy free-beta email-save block ----

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

// =============================================================================
// HELPERS
// =============================================================================

function laneToSection(lane: CartItemV3['lane'] | undefined): string {
  if (!lane) return 'unknown'
  return lane.toLowerCase()
}

function fireFunnelEvent(eventType: string, payload: Record<string, unknown> = {}): void {
  fetch('/api/events/funnel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, payload }),
    keepalive: true,
  }).catch(() => {})
}

// Re-export for the SmartCartRow consumer in result/page.tsx
export type { SmartCartRow }
