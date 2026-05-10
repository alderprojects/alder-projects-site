'use client'

// SalesPageClient — shared client wrapper for the rebuilt /smart-cart
// and /worth-it sales pages. Manages selectedIntentId, drives the
// DynamicExampleCard, and threads the live (topic, scope, scenario)
// into the PricingCTA's data attributes so the CurationModal lands
// pre-filled with the visitor's choice.
//
// Both pages share this component because the structure is identical
// (hero → selector → example → values → fit → cross-sell → pricing).
// The product prop switches the catalog (categories vs decisions) and
// the copy.

import { useMemo, useState } from 'react'
import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'
import {
  SMART_CART_CATEGORIES,
  WORTH_IT_DECISIONS,
  type SmartCartCategory,
  type WorthItDecision,
} from '@/lib/intent-config'
import IntentSelector, {
  type IntentSelectorItem,
} from './IntentSelector'
import DynamicExampleCard from './DynamicExampleCard'
import Why1999Module, { type Why1999Variant } from '@/components/Why1999Module'
import ValueProofGrid from './ValueProofGrid'
import ProductFitSection from './ProductFitSection'
import CrossSellSection from './CrossSellSection'
import PricingCTA from './PricingCTA'

type Product = 'smart_cart' | 'worth_it'

type Props = { product: Product }

const SCENARIO_LABELS: Record<string, string> = {
  just_starting: 'Just starting',
  already_have_basics: 'Already have basics',
  tight_budget: 'Tight budget',
  premium: 'Premium',
  lake_property: 'Lake property',
}

// v7.2.15 — map picker scope-variant to the concrete "Why $19.99?" copy.
// Falls through to no module on scopes without a paired variant.
const WHY_VARIANT_BY_SCOPE: Record<string, Why1999Variant> = {
  window_weatherization: 'window',
  basement_moisture_prep: 'basement',
}

export default function SalesPageClient({ product }: Props) {
  const cfg =
    product === 'smart_cart'
      ? CONFIG.products.smartCart
      : CONFIG.products.worthIt
  const items =
    product === 'smart_cart' ? SMART_CART_CATEGORIES : WORTH_IT_DECISIONS

  // Default to the first 'curated' item; fall back to the first overall.
  const defaultId = useMemo(
    () => items.find(i => i.curationStatus === 'curated')?.id ?? items[0].id,
    [items],
  )
  const [selectedId, setSelectedId] = useState<string>(defaultId)
  const selected = items.find(i => i.id === selectedId) ?? items[0]

  const topic =
    product === 'smart_cart'
      ? (selected as SmartCartCategory).topicId
      : (selected as WorthItDecision).primaryTopicId
  const scope = selected.defaultScopeVariantId
  const scenario = selected.defaultScenarioId
  const teaser = selected.teaser

  const selectorItems: IntentSelectorItem[] = items.map(i => ({
    id: i.id,
    label: i.label,
    iconSvg: i.iconSvg,
    curationStatus: i.curationStatus,
  }))

  const otherProduct =
    product === 'smart_cart'
      ? {
          label: 'Worth-It Plan',
          href: '/worth-it',
          bullets:
            (selected as SmartCartCategory).notRightIfPointsToWorthIt ?? [],
        }
      : {
          label: 'Smart Cart',
          href: '/smart-cart',
          bullets:
            (selected as WorthItDecision).notRightIfPointsToSmartCart ?? [],
        }

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#1a1f1a]">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <Hero
          product={product}
          headline={cfg.headline}
          subhead={cfg.subhead}
          price={cfg.priceUsd}
          ctaCopy={cfg.ctaCopy}
          topic={topic}
          scope={scope}
          scenario={scenario}
        />

        <IntentSelector
          title={
            product === 'smart_cart'
              ? "What are you working on?"
              : 'What decision are you stuck on?'
          }
          items={selectorItems}
          value={selectedId}
          onChange={setSelectedId}
        />

        <DynamicExampleCard
          teaser={teaser}
          scopeLabel={selected.label}
          scenarioLabel={SCENARIO_LABELS[scenario] ?? scenario}
          productPrice={cfg.priceUsd}
        />

        {/* v7.2.15 — concrete "Why $19.99?" right under the example card,
            keyed on the selected scope. Compact density to fit alongside
            the picker without crowding the conversion CTA. */}
        {product === 'smart_cart' && WHY_VARIANT_BY_SCOPE[scope] && (
          <Why1999Module
            variant={WHY_VARIANT_BY_SCOPE[scope]}
            density="compact"
          />
        )}

        <ValueProofGrid product={product} />

        <ProductFitSection
          product={product}
          rightForYouIf={
            product === 'smart_cart'
              ? (selected as SmartCartCategory).rightForYouIf
              : (selected as WorthItDecision).rightForYouIf
          }
          otherProduct={otherProduct}
        />

        <CrossSellSection fromProduct={product} />

        <PricingCTA
          product={product}
          topic={topic}
          scopeVariantId={scope}
          scenario={scenario}
          ctaCopy={cfg.ctaCopy}
        />
      </div>
    </main>
  )
}

// ---------- Hero -----------------------------------------------------

function Hero({
  product,
  headline,
  subhead,
  price,
  ctaCopy,
  topic,
  scope,
  scenario,
}: {
  product: Product
  headline: string
  subhead: string
  price: number
  ctaCopy: string
  topic: string
  scope: string
  scenario: string
}) {
  return (
    <section className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-[#1a1f1a] leading-[1.1] mb-5">
          {headline}
        </h1>
        <p className="text-lg leading-relaxed text-[#1a1f1a]/85 mb-6">
          {subhead}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            data-curation-modal-open
            data-curation-modal-product={product}
            data-curation-modal-topic={topic}
            data-curation-modal-scope={scope}
            data-curation-modal-scenario={scenario}
            data-topic-id={topic}
            data-scope-id={scope}
            data-scenario-id={scenario}
            className="bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {ctaCopy} — {formatPrice(price)}
          </button>
          <a
            href="#example-preview"
            onClick={smoothScrollToExample}
            className="text-sm text-[#1f3a2e] underline-offset-2 hover:underline"
          >
            See an example below ↓
          </a>
        </div>
      </div>
      <aside className="bg-white border border-[#e8e3d4] rounded-xl p-5 text-sm">
        <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/55 mb-2">
          What you get
        </div>
        <p className="text-[#1a1f1a]/85 leading-relaxed">
          {product === 'smart_cart'
            ? 'A lean cart for your specific project, a skip list of what to avoid, an overbuy-trap callout, and a 30-day saved view.'
            : 'A ranked plan for your project: highest-payoff moves, alternate paths, what to skip, and a DIY stop line tied to your property.'}
        </p>
      </aside>
    </section>
  )
}

function smoothScrollToExample(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const el = document.getElementById('example-preview')
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

