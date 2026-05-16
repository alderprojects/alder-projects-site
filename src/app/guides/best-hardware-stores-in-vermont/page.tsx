import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Best Hardware Stores in Vermont: Independent and Chain Options by Region`,
  description: `Honest review of Vermont hardware stores. r.k. Miles, Aubuchon, Lavalleys, and the local independents that beat the big-box experience.`,
  alternates: { canonical: 'https://alderprojects.com/guides/best-hardware-stores-in-vermont' },
  openGraph: {
    title: `Best Hardware Stores in Vermont: Independent and Chain Options by Region`,
    description: `Honest review of Vermont hardware stores. r.k. Miles, Aubuchon, Lavalleys, and the local independents that beat the big-box experience.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/best-hardware-stores-in-vermont',
  },
}

const content = {
  eyebrow: `Vermont Best Of`,
  h1: `Best Hardware Stores in Vermont`,
  intro: `Vermont's hardware scene is one of the things that makes living here different. The big chains exist, but the local hardware stores that have been in business for 80+ years still win for service, selection of weird stuff you actually need for old Vermont homes, and the staff who know what they're talking about.`,
  readTime: `6 min`,
  sections: [
    {
      heading: `Independent and regional chains worth knowing`,
      body: `These are the stores Vermont homeowners and contractors actually use. Not exhaustive, but a strong starting point by region.`,
      list: [
        `r.k. Miles — Manchester, Bennington, and surrounding southern Vermont. Lumber, building supplies, hardware, paint. Best lumber selection in southern VT.`,
        `Aubuchon Hardware — multiple Vermont locations including Burlington, Rutland, St. Albans. Regional chain with broad selection. Better service than big-box.`,
        `Lavalleys Building Supply — multiple Vermont locations. Strong for lumber and contractor supplies. Friendly to homeowner walk-ins despite contractor focus.`,
        `Allen Lumber — Vermont chain across central and northern VT. Lumber-first but full hardware. Worth knowing for any deck or framing project.`,
        `Spear Street Hardware — South Burlington. Independent, deep selection of small specialty items.`,
        `True Value stores — multiple Vermont towns, especially smaller ones. Independent franchise model means quality varies; the good ones are very good.`,
      ],
    },
    {
      heading: `When the independent beats the big box`,
      body: `Home Depot and Lowe's exist in Vermont (mostly Chittenden County, Rutland, and a few other markets) and they're fine for some things. But for several common Vermont-homeowner tasks, the independent wins:`,
      list: [
        `Anything for an old-house project — independent staff have actually worked on similar houses and know what fits a 1920s plaster wall or 1880s lath situation`,
        `Specialty fasteners and hardware — independents stock the brass screws, square-drive Robertson screws, and odd-size carriage bolts that big boxes don't carry`,
        `Sharpening, repair, and rental — many independents offer chain saw sharpening, tool repair, and equipment rental that big boxes don't`,
        `Color matching and paint advice — independent paint counter staff at Sherwin-Williams or Benjamin Moore dealers consistently outperform big-box color matching`,
        `Quick decisions — you walk in knowing what you need, the staff knows where it is, you're out in 5 minutes. Big-box on a Saturday is a 30-minute commitment.`,
      ],
    },
    {
      heading: `When the big box wins`,
      body: `There are situations where Home Depot or Lowe's is genuinely the right call.`,
      list: [
        `Major appliance purchases with delivery — selection and pricing are competitive`,
        `Bulk lumber for a large project — pricing can beat independents on volume`,
        `Sunday afternoon or late-evening purchases — independents are often closed`,
        `Big-ticket tool purchases with credit financing options`,
      ],
    },
    {
      heading: `Connecting to Smart Cart guides`,
      body: `Many products in Smart Cart's Buy lists are stocked at the Vermont stores above. Some specific examples:`,
      list: [
        `V-strip weatherstripping (windows guide): Aubuchon, r.k. Miles, Allen Lumber all carry the V-strip brands Smart Cart recommends`,
        `Cabinet hardware (kitchen guide): r.k. Miles and larger Aubuchons carry mid-tier pulls; smaller stores carry decent basic options`,
        `Dehumidifiers (basement guide): big-box wins on selection here, but Aubuchon and Lavalleys carry mid-size units in season`,
        `Weather sealant and caulk (multiple guides): every store on the list carries it, often at better prices than big-box during off-season`,
      ],
    },
  ],
  faqs: [
    {
      q: `Is True Value in Vermont worth shopping?`,
      a: `Depends on the location. True Value is an independent franchise model — each store is owned and operated separately. The good ones (Brandon, Middlebury, Hardwick, and others) are excellent. Some smaller-town locations have spotty inventory. Ask other locals before relying on any specific one.`,
    },
    {
      q: `Do Vermont hardware stores deliver?`,
      a: `Most regional chains (Aubuchon, Allen, Lavalleys, r.k. Miles) deliver for larger orders, especially lumber and building materials. Smaller items typically require pickup. Confirm before assuming.`,
    },
    {
      q: `Best store for old-house specialty parts?`,
      a: `r.k. Miles in Manchester and several Aubuchon locations have surprisingly good specialty hardware sections. For very specialty items (period-appropriate hardware, old window weight chains, etc.), check Burlington's specialty stores or order online from old-house specialists.`,
    },
    {
      q: `Pricing — independent vs big-box?`,
      a: `Mixed. On commodity items (basic screws, common lumber, paint), big-box often wins on price. On specialty items and contractor-friendly volume orders, independents often match or beat. The independent's real value is service and curation, not always price.`,
    },
    {
      q: `Are these stores good for Smart Cart shopping lists?`,
      a: `Yes — every store on this list carries the mid-tier brands Smart Cart recommends. The independent stores are often better for buying single items quickly; the chains are better for bulk material orders.`,
    },
  ],
  ctaHeading: `Get your project shopping list`,
  ctaBody: `$19.99. 30-day refund. Smart Cart tells you what to buy, what to skip, and what to wait on — usable at any of the Vermont stores above.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=hardware_vt`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `Best paint stores in Vermont`,
      href: `/guides/best-paint-stores-in-vermont`,
    },
    {
      label: `Best lumber yards in Vermont`,
      href: `/guides/best-lumber-yards-in-vermont`,
    },
    {
      label: `Vermont cost reality`,
      href: `/guides/vermont-home-project-cost-reality-2026`,
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: content.faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: content.h1,
  description: `Honest review of Vermont hardware stores. r.k. Miles, Aubuchon, Lavalleys, and the local independents that beat the big-box experience.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/best-hardware-stores-in-vermont',
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <GuidePage content={content} />
    </>
  )
}
