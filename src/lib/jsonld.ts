// JSON-LD schema helpers.
//
// Every content page in V6+ ships at minimum: BreadcrumbList. Article
// pages add Article schema. Pages with a Q&A section add FAQPage.
// Town pages add LocalBusiness.
//
// These helpers return plain JS objects; pages JSON.stringify() them
// into <script type="application/ld+json"> tags via dangerouslySetInnerHTML.
// Helper renderJsonLd() returns the script-tag-ready string for code-
// gen scripts (commit 11 town × service regen).
//
// Schema reference:
//   https://schema.org/Article
//   https://schema.org/FAQPage
//   https://schema.org/BreadcrumbList
//   https://schema.org/LocalBusiness
//   https://schema.org/WebPage
//   https://schema.org/ItemList

const BASE_URL = 'https://alderprojects.com'
const PUBLISHER_NAME = 'Alder Projects'
const PUBLISHER_LOGO = `${BASE_URL}/favicon.ico`

export type BreadcrumbCrumb = {
  name: string
  url: string                     // absolute or path-only; helper resolves
}

export function buildBreadcrumbList(crumbs: BreadcrumbCrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url.startsWith('http')
        ? c.url
        : `${BASE_URL}${c.url.startsWith('/') ? c.url : '/' + c.url}`,
    })),
  }
}

export type ArticleSchemaInput = {
  headline: string                // page <h1>
  description: string             // meta description / lead summary
  url: string                     // canonical absolute URL
  datePublished?: string          // ISO YYYY-MM-DD
  dateModified: string            // ISO YYYY-MM-DD (use verifyDate)
  authorName?: string             // defaults to publisher
  imageUrl?: string               // OG image fallback
}

export function buildArticle(input: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    url: input.url,
    datePublished: input.datePublished ?? input.dateModified,
    dateModified: input.dateModified,
    author: {
      '@type': 'Organization',
      name: input.authorName ?? PUBLISHER_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO,
      },
    },
    image: input.imageUrl ?? PUBLISHER_LOGO,
  }
}

export type FaqEntry = {
  question: string
  answer: string                  // plain text, no HTML
}

export function buildFaqPage(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(e => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: e.answer,
      },
    })),
  }
}

export type LocalBusinessInput = {
  name: string                    // 'Alder Projects — Stowe, VT'
  url: string                     // absolute URL of the town page
  description: string
  townName: string                // 'Stowe'
  region?: string                 // 'VT'
  areaServed: string              // 'Stowe, Vermont'
}

export function buildLocalBusiness(input: LocalBusinessInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: input.name,
    url: input.url,
    description: input.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: input.townName,
      addressRegion: input.region ?? 'VT',
      addressCountry: 'US',
    },
    areaServed: input.areaServed,
    parentOrganization: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      url: BASE_URL,
    },
  }
}

export type WebPageInput = {
  url: string
  name: string
  description: string
  dateModified?: string           // ISO
}

export function buildWebPage(input: WebPageInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: PUBLISHER_NAME,
      url: BASE_URL,
    },
  }
}

export type ItemListInput = {
  url: string
  name: string
  items: { name: string; url: string }[]
}

export function buildItemList(input: ItemListInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    url: input.url,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: it.url.startsWith('http')
        ? it.url
        : `${BASE_URL}${it.url.startsWith('/') ? it.url : '/' + it.url}`,
      name: it.name,
    })),
  }
}

// Helper for code-gen: returns a fully-formed <script> tag string
// ready to interpolate into a server-rendered page template.
export function renderJsonLdScript(schemaObj: object): string {
  return `<script type="application/ld+json">${JSON.stringify(schemaObj)}</script>`
}

// Helper for canonical URL building from a path.
export function absUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`
}
