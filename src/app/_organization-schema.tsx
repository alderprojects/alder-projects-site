// Organization JSON-LD schema component
// Drop into root layout body: <OrganizationSchema />
export default function OrganizationSchema() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Alder Projects',
    url: 'https://alderprojects.com',
    logo: 'https://alderprojects.com/logo.png',
    description: 'Vermont home project shopping tools and Buy/Skip/Wait guides. Smart Cart $19.99 with 24-hour refund.',
    sameAs: [
      'https://alderprojects.com',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@alderprojects.com',
      availableLanguage: 'English',
      areaServed: 'Vermont',
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'VT',
      addressCountry: 'US',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Alder Projects',
    url: 'https://alderprojects.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://alderprojects.com/guides?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </>
  )
}
