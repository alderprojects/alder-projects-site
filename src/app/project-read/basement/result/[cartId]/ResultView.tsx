'use client'

/**
 * v7.3.3-B Basement Read result view (client component).
 *
 * Renders the V2 (with-photo) cart. Shows a top banner reporting
 * whether photos changed the recommendation. Each item shows lane
 * (BUY/SKIP/WAIT/PRO_LINE), product, why-this prose, plus
 * photo-derived reasoning when present.
 *
 * Email-save block lets the visitor save by entering an email — POSTs
 * to /api/account/claim (PR 7.3.3-C). Anti-enumeration: always
 * returns "Sent" regardless of whether the email is registered.
 */

import { useState } from 'react'
import type { SynthCartItem } from '@/lib/smart-cart/synthesize-v2'

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

export function ResultView({ cart }: Props) {
  const items = ((cart.cartItemsJsonWithPhotos ?? cart.cartJson) as SynthCartItem[]) ?? []
  const photoChanged = cart.photoChangedRecommendation === true

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your basement read</h1>
        {photoChanged ? (
          <p className="mt-2 text-sm text-emerald-700">
            Your photos changed this recommendation. The items below reflect what we saw in your basement.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            Your photos didn&apos;t change our base recommendation for basement moisture prep.
          </p>
        )}
      </header>

      <section className="mb-8 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
            We don&apos;t have a matched product list for your basement yet. Try uploading clearer wide-angle photos and try again.
          </div>
        ) : (
          items.map((item) => <CartItemCard key={item.productId} item={item} />)
        )}
      </section>

      <EmailSaveBlock cartId={cart.id} />
    </main>
  )
}

function CartItemCard({ item }: { item: SynthCartItem }) {
  const laneStyle: Record<SynthCartItem['lane'], string> = {
    BUY: 'bg-emerald-100 text-emerald-800',
    SKIP: 'bg-gray-200 text-gray-700',
    WAIT: 'bg-amber-100 text-amber-800',
    PRO_LINE: 'bg-blue-100 text-blue-800',
  }
  return (
    <article className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-block rounded px-2 py-1 text-xs uppercase tracking-wide ${laneStyle[item.lane]}`}>
            {item.lane}
          </span>
          <h2 className="mt-2 text-lg font-medium text-gray-900">{item.productName}</h2>
          <p className="text-sm text-gray-500">{item.priceBand} · {item.tier}</p>
        </div>
        {item.lane === 'BUY' && item.affiliateUrl && (
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
      <p className="mt-3 text-sm text-gray-700">
        <strong>Why this:</strong> {item.selectionReason}
      </p>
      {item.photoDerivedReasoning && (
        <p className="mt-2 text-sm text-emerald-800">
          <strong>From your photos:</strong> {item.photoDerivedReasoning}
        </p>
      )}
    </article>
  )
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
