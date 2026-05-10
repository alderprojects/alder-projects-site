// v7.2.14 — Dynamic sitemap generator.
//
// Replaces public/sitemap.xml. Combines:
//   1. Hardcoded major non-dynamic routes (homepage, /faq, /smart-cart, etc.)
//   2. Town × service pages (transcribed from previous static sitemap)
//   3. Seasonal landing pages
//   4. Dynamic guides via TOPIC_CONTENT registry
//   5. Dynamic Smart Cart pre-cart topic pages via SMART_CART_TOPIC_LANDINGS
//
// New guides added to src/content/topics.ts and new topic-landing
// entries added to src/content/smart-cart-topic-pages.ts will appear
// in the sitemap automatically.

import type { MetadataRoute } from 'next'
import { TOPIC_CONTENT } from '@/content/topics'
import { SMART_CART_TOPIC_LANDINGS } from '@/content/smart-cart-topic-pages'

const BASE = 'https://alderprojects.com'

type Entry = {
  loc: string
  lastmod?: string
  changefreq?: MetadataRoute.Sitemap[number]['changeFrequency']
  priority?: number
}

// Hardcoded entries that aren't programmatically registered.
// When a new town × service page or seasonal page lands, add it here.
const STATIC_ENTRIES: Entry[] = [
  { loc: '/', changefreq: 'weekly', priority: 1.0 },
  { loc: '/towns', changefreq: 'weekly', priority: 0.9 },
  { loc: '/seasons', lastmod: '2026-05-03', changefreq: 'weekly', priority: 0.9 },
  { loc: '/plan', changefreq: 'monthly', priority: 0.8 },
  { loc: '/faq', changefreq: 'monthly', priority: 0.8 },
  { loc: '/contractors', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides', changefreq: 'weekly', priority: 0.9 },
  { loc: '/smart-cart', changefreq: 'weekly', priority: 0.9 },

  // Legacy /guides/* not in TOPIC_CONTENT
  { loc: '/guides/how-much-does-kitchen-remodel-cost-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/guides/how-to-find-contractor-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/guides/vermont-renovation-permit-guide', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/what-to-ask-contractor-before-hiring', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/how-long-does-bathroom-remodel-take-vermont', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/how-much-does-a-deck-cost-vermont', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/how-much-does-roof-replacement-cost-vermont', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/vermont-contractor-red-flags', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/vermont-home-renovation-winter', changefreq: 'monthly', priority: 0.7 },
  { loc: '/guides/can-i-add-bedroom-vermont-lake-house', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/handyman-seasonal-home-vermont', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.7 },
  { loc: '/guides/heat-pump-rebates-vermont', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/guides/opening-lake-house-summer-vermont', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/vermont-flood-zone-renovation', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/vermont-septic-what-to-know', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/winterizing-lake-house-vermont', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },
  { loc: '/guides/winterizing-vermont-seasonal-home', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },

  // Trade × Vermont
  { loc: '/electrical-contractors-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/plumbing-contractors-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/hvac-contractors-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/general-contractors-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/roofing-contractors-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/painting-contractors-vermont', changefreq: 'monthly', priority: 0.8 },
  { loc: '/kitchen-remodeling-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/bathroom-remodeling-vermont', changefreq: 'monthly', priority: 0.9 },
  { loc: '/deck-builders-vermont', changefreq: 'monthly', priority: 0.8 },
  { loc: '/basement-finishing-vermont', changefreq: 'monthly', priority: 0.8 },
  { loc: '/home-additions-vermont', changefreq: 'monthly', priority: 0.8 },
  { loc: '/window-replacement-vermont', changefreq: 'monthly', priority: 0.8 },

  // Trade × Town
  { loc: '/electrical-contractors-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/kitchen-remodeling-burlington-vt', changefreq: 'monthly', priority: 0.9 },
  { loc: '/kitchen-remodeling-south-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/kitchen-remodeling-stowe-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/kitchen-remodeling-middlebury-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/kitchen-remodeling-williston-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/kitchen-remodeling-essex-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/bathroom-remodeling-burlington-vt', changefreq: 'monthly', priority: 0.9 },
  { loc: '/bathroom-remodeling-south-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/bathroom-remodeling-stowe-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/bathroom-remodeling-middlebury-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/deck-builders-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/deck-builders-stowe-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/deck-builders-middlebury-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/basement-finishing-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/basement-finishing-middlebury-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/basement-finishing-south-burlington-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/basement-finishing-essex-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/basement-finishing-colchester-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/roofing-burlington-vt', changefreq: 'monthly', priority: 0.9 },
  { loc: '/roofing-middlebury-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/roofing-south-burlington-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/roofing-stowe-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/roofing-essex-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/roofing-williston-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/roofing-colchester-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/home-additions-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/home-additions-south-burlington-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/window-replacement-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/window-replacement-stowe-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/window-replacement-williston-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/window-replacement-colchester-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/painting-contractors-burlington-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/painting-contractors-essex-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/painting-contractors-williston-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/painting-contractors-south-burlington-vt', changefreq: 'monthly', priority: 0.7 },

  // Counties
  { loc: '/chittenden-county-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/addison-county-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/lamoille-county-vt', changefreq: 'monthly', priority: 0.7 },
  { loc: '/washington-county-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/rutland-county-vt', changefreq: 'monthly', priority: 0.8 },
  { loc: '/windsor-county-vt', changefreq: 'monthly', priority: 0.8 },

  // Standalone town pages
  { loc: '/stowe-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/burlington-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/vergennes-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },
  { loc: '/montpelier-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/manchester-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/woodstock-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/middlebury-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/brattleboro-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/st-johnsbury-vt', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },

  // Seasonal landing pages
  { loc: '/vermont-mud-season-homeowner-guide', lastmod: '2026-05-01', changefreq: 'monthly', priority: 0.9 },
  { loc: '/vermont-lake-season', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/vermont-spring-blackfly', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.7 },
  { loc: '/vermont-fall-leaf-weatherization', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
  { loc: '/vermont-pre-winter-prep', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.8 },
  { loc: '/vermont-deep-winter', lastmod: '2026-05-03', changefreq: 'monthly', priority: 0.9 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [...STATIC_ENTRIES]

  // Dynamic: TOPIC_CONTENT guides
  for (const slug of Object.keys(TOPIC_CONTENT)) {
    const c = TOPIC_CONTENT[slug]
    entries.push({
      loc: `/guides/${slug}`,
      lastmod: c.verifyDate,
      changefreq: 'monthly',
      priority: 0.9,
    })
  }

  // Dynamic: Smart Cart pre-cart topic landing pages
  for (const slug of Object.keys(SMART_CART_TOPIC_LANDINGS)) {
    entries.push({
      loc: `/smart-cart/topic/${slug}`,
      lastmod: '2026-05-10',
      changefreq: 'monthly',
      priority: 0.9,
    })
  }

  // Deduplicate by loc; later entries win.
  const byLoc = new Map<string, Entry>()
  for (const e of entries) byLoc.set(e.loc, e)

  return Array.from(byLoc.values()).map((e) => ({
    url: `${BASE}${e.loc}`,
    lastModified: e.lastmod ? new Date(e.lastmod) : undefined,
    changeFrequency: e.changefreq,
    priority: e.priority,
  }))
}
