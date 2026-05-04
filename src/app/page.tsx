import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HomepageIntentCards from '@/components/HomepageIntentCards'
import HomepageProductStrip from '@/components/HomepageProductStrip'
import HomepageSeasonalStrip from '@/components/HomepageSeasonalStrip'
import HomepageCostWidget from '@/components/HomepageCostWidget'
import HomepageTownGrid from '@/components/HomepageTownGrid'
import HomepageEmailCapture from '@/components/HomepageEmailCapture'
import HomepageTrustStrip from '@/components/HomepageTrustStrip'
import Footer from '@/components/Footer'
import SmartCartGuideFooterCta from '@/components/SmartCartGuideFooterCta'
import CurationModal from '@/components/CurationModal'

// V5 homepage. Server-rendered shell — Hero owns address-search and the
// homepage_hero_view tracker; everything below is config-driven from
// CONFIG.homepage. The marketplace-era FAQ block, the project-tile
// section, the affiliate-disclosure footer line, and the "matching
// service" framing are all gone. Every interaction here funnels toward
// an address entry, a topic-specific demo URL, an affiliate click, or
// an email capture.

export const metadata: Metadata = {
  title: 'Alder Projects — Vermont property tool by address',
  description:
    'Vermont permits, rebates, contractor costs, lake/flood/septic context — synthesized by address. Built for Vermont homeowners and buyers.',
  openGraph: {
    title: 'Alder Projects — Vermont property tool by address',
    description:
      'Vermont permits, rebates, contractor costs, lake/flood/septic context — synthesized by address. Free, no account.',
    url: 'https://alderprojects.com',
    siteName: 'Alder Projects',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alder Projects — Vermont property tool by address',
    description:
      'Vermont permits, rebates, contractor costs, lake/flood/septic context — synthesized by address.',
  },
  alternates: { canonical: 'https://alderprojects.com/' },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Alder Projects',
  url: 'https://alderprojects.com/',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://alderprojects.com/property/{search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Alder Projects',
  url: 'https://alderprojects.com/',
  logo: 'https://alderprojects.com/favicon.ico',
  foundingLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'VT',
      addressCountry: 'US',
    },
  },
  knowsAbout: [
    'Vermont permits',
    'Vermont rebates',
    'Efficiency Vermont weatherization',
    'Vermont property tax',
    'Vermont lake setbacks',
    'Vermont mud season',
    'Vermont contractor vetting',
    'Vermont flood zones',
    'Vermont well and septic',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@alderprojects.com',
    areaServed: 'VT',
  },
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Nav />
      <Hero />
      <div className="max-w-5xl mx-auto px-4">
        <SmartCartGuideFooterCta variant="compact" />
      </div>
      <HomepageIntentCards />
      <HomepageProductStrip />
      <HomepageSeasonalStrip />
      <HomepageCostWidget />
      <HomepageTownGrid />
      <HomepageEmailCapture />
      <HomepageTrustStrip />
      <CurationModal />
      <Footer />
    </main>
  )
}
