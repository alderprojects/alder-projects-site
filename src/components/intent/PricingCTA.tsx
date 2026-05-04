// PricingCTA — sticky bottom-of-page CTA. The button itself fires
// CurationModal via data-curation-modal-open, carrying the live
// intent's topic / scope / scenario / address as data attributes so
// the modal lands pre-filled.

import { CONFIG } from '@/lib/recommender-config'
import { formatPrice } from '@/lib/format'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

type Product = 'smart_cart' | 'worth_it'

type Props = {
  product: Product
  topic: TopicId
  scopeVariantId: string
  scenario: BriefScenarioId
  address?: string
  ctaCopy?: string
  sticky?: boolean
}

export default function PricingCTA({
  product,
  topic,
  scopeVariantId,
  scenario,
  address,
  ctaCopy,
  sticky,
}: Props) {
  const cfg =
    product === 'smart_cart'
      ? CONFIG.products.smartCart
      : CONFIG.products.worthIt
  const refundCopy =
    product === 'smart_cart'
      ? `${CONFIG.products.smartCart.refundWindowHours}-hour refund window`
      : `${CONFIG.products.worthIt.refundWindowDays}-day refund window`
  const buttonText = ctaCopy ?? cfg.ctaCopy
  const wrapperClasses = sticky
    ? 'sticky bottom-0 z-30 -mx-4 md:mx-0 md:relative md:bottom-auto'
    : ''

  return (
    <section className={`${wrapperClasses} my-10`}>
      <div className="bg-white border border-[#e8e3d4] rounded-2xl p-6 md:p-8 grid md:grid-cols-3 gap-6 items-center shadow-sm">
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-display text-3xl text-[#1f3a2e]">
              {formatPrice(cfg.priceUsd)}
            </span>
            <span className="text-sm text-[#1a1f1a]/65">{refundCopy}</span>
          </div>
          <p className="text-sm text-[#1a1f1a]/85">{cfg.subhead}</p>
        </div>
        <button
          type="button"
          data-curation-modal-open
          data-curation-modal-product={product}
          data-curation-modal-topic={topic}
          data-curation-modal-scope={scopeVariantId}
          data-curation-modal-scenario={scenario}
          data-curation-modal-address={address ?? ''}
          className="bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-5 py-3 rounded-lg transition-colors"
        >
          {buttonText} →
        </button>
      </div>
    </section>
  )
}
