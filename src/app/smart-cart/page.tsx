// V7.1 — Smart Cart pre-sale page (rebuilt around intent selector).

import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CurationModal from '@/components/CurationModal'
import SalesPageClient from '@/components/intent/SalesPageClient'

export const metadata: Metadata = {
  title: 'Smart Cart — Buy this. Skip that. — Alder Projects',
  description:
    "Alder builds the lean cart for your project so you avoid redundant products, tempting kits, and expensive mistakes. $19.99, one-time, no subscription.",
  alternates: { canonical: 'https://alderprojects.com/smart-cart' },
  openGraph: {
    title: 'Smart Cart — Alder Projects',
    description: 'Buy this + this. Skip that. Designed to save more than $19.99 before checkout.',
    url: 'https://alderprojects.com/smart-cart',
  },
  robots: { index: true, follow: true },
}

// v7.2.18 — read topic/scope/scenario URL params so CTAs from
// the homepage hero, guide pages, and the chat bot's tappable cards
// can pre-select a scope tile and pre-fill the curation modal.
type Props = {
  searchParams?: { topic?: string; scope?: string; scenario?: string }
}

export default function SmartCartPreSalePage({ searchParams }: Props) {
  const initialTopic = searchParams?.topic
  const initialScope = searchParams?.scope
  const initialScenario = searchParams?.scenario

  return (
    <>
      <div
        style={{
          backgroundColor: '#1C2B1A',
          borderBottom: '1px solid rgba(122,155,111,0.2)',
          padding: '10px 20px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: 'rgba(245,239,224,0.85)',
            margin: 0,
          }}
        >
          <span style={{ color: '#7A9B6F', marginRight: '8px' }}>✓</span>
          $19.99 with full refund in the first 24 hours, no questions asked.
        </p>
      </div>
      <Nav />
      <SalesPageClient
        product="smart_cart"
        initialTopic={initialTopic}
        initialScope={initialScope}
        initialScenario={initialScenario}
      />
      <div
        style={{
          maxWidth: '720px',
          margin: '32px auto',
          padding: '20px',
          backgroundColor: 'rgba(122,155,111,0.06)',
          borderRadius: '4px',
          borderLeft: '3px solid #7A9B6F',
        }}
      >
        <p style={{ fontSize: '13px', color: 'rgba(28,43,26,0.75)', margin: '0 0 10px 0', lineHeight: 1.55 }}>
          <strong>Want to understand the method first?</strong> The Buy/Skip/Wait pillar guide walks through four real Vermont projects and the dollar logic behind each recommendation.
        </p>
        <a
          href="/guides/how-to-shop-for-home-projects-without-overspending?utm_source=smart_cart_presale&utm_medium=back_link&utm_campaign=method_pillar"
          style={{ fontSize: '13px', color: '#C8732A', textDecoration: 'none', fontWeight: 600 }}
        >
          Read the Buy/Skip/Wait method →
        </a>
      </div>
      <CurationModal />
      <Footer />
    </>
  )
}
