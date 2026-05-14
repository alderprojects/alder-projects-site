import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Best Lumber Yards in Vermont: r.k. Miles, Lavalleys, Allen, Independents`,
  description: `Where Vermont contractors and serious DIYers actually buy lumber. Regional yards, contractor pricing, delivery options, and the independents worth knowing.`,
  alternates: { canonical: 'https://alderprojects.com/guides/best-lumber-yards-in-vermont' },
  openGraph: {
    title: `Best Lumber Yards in Vermont: r.k. Miles, Lavalleys, Allen, Independents`,
    description: `Where Vermont contractors and serious DIYers actually buy lumber. Regional yards, contractor pricing, delivery options, and the independents worth knowing.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/best-lumber-yards-in-vermont',
  },
}

const content = {
  eyebrow: `Vermont Best Of`,
  h1: `Best Lumber Yards in Vermont`,
  intro: `Lumber is where Vermont homeowners and contractors part ways with the big-box experience. Home Depot and Lowe's carry lumber, but anyone doing a deck, addition, framing repair, or serious renovation buys from a real lumber yard. The pricing, selection, and service difference is substantial.`,
  readTime: `6 min`,
  sections: [
    {
      heading: `Regional yards worth knowing`,
      body: `These are the lumber operations Vermont contractors use. Pricing on volume orders typically beats big-box meaningfully.`,
      list: [
        `r.k. Miles — Manchester (flagship) and additional locations across southern Vermont. Strongest lumber selection in southern VT. Open to homeowner walk-ins despite contractor focus.`,
        `Lavalleys Building Supply — multiple Vermont locations including Williston, Newport. Strong contractor relationships, competitive volume pricing.`,
        `Allen Lumber — multiple Vermont locations. Family-owned regional chain. Strong reputation for service and contractor support.`,
        `Goodro Lumber — central Vermont (Killington area). Smaller but well-regarded local yard.`,
        `Curtis Lumber (NH chain with Vermont reach) — accessible for Eastern Vermont and the upper valley.`,
        `Smaller town yards — most Vermont towns of 5,000+ have at least one local lumber operation. Selection narrower but pricing and service often competitive on basics.`,
      ],
    },
    {
      heading: `When the lumber yard beats the big box`,
      body: `For most serious lumber purchases, the yard wins on three dimensions.`,
      list: [
        `Material quality — yards stock straighter, drier, more knot-free lumber than big-box. The same nominal 2x4 from a yard vs Home Depot is often a meaningfully better stick of wood.`,
        `Pricing on volume — yards offer contractor accounts with bulk pricing that beats retail on orders of 20+ pieces or full sheets of plywood/OSB`,
        `Delivery — most yards deliver for a modest fee or free over a minimum order. Trying to fit 16-foot 2x10s into a personal vehicle is its own problem.`,
        `Special orders — yards can order specific species, dimensions, or specialty lumber (cedar, mahogany, marine-grade plywood) that big-box doesn't stock`,
        `Treated lumber quality — yards typically carry higher-quality treated lumber rated for ground contact and longer service life`,
      ],
    },
    {
      heading: `When the big box wins`,
      body: `Big-box still has a place in the Vermont lumber-buying mix.`,
      list: [
        `Small project, few pieces, immediate need — driving to Home Depot for two 2x6s is faster than scheduling a yard pickup`,
        `Sunday or evening — most yards are closed; big-box is open`,
        `Common dimensional lumber for a small project — quality difference is real but not always worth the trip if you only need 6 sticks`,
        `Specific big-box-exclusive products (some Trex composite colors, certain prefab items)`,
      ],
    },
    {
      heading: `Connecting to Smart Cart project costs`,
      body: `Several Smart Cart scopes involve lumber. Cost reality:`,
      list: [
        `Deck project ($30-80/sq ft installed): material cost from yard typically 60-65% of total. Pressure-treated $2-4/linear foot for 2x6, cedar $4-7/linear foot, composite $4-8/linear foot for decking boards.`,
        `Basement framing: ~$0.80-1.20/linear foot for 2x4 studs, plus plates and headers. A 600 sq ft basement framing-only is roughly $300-600 in lumber.`,
        `Kitchen refresh: limited lumber needs. Maybe small framing for floating shelves or trim repair, under $50 typical.`,
        `Roof repair: dimensional lumber for rafters or trusses; specialty work, get yard quotes.`,
      ],
    },
  ],
  faqs: [
    {
      q: `Do I need a contractor account to shop at a Vermont lumber yard?`,
      a: `No. All the yards on this list serve homeowner walk-ins. Contractor accounts get volume pricing and credit terms; cash homeowners get retail pricing, which is still typically competitive.`,
    },
    {
      q: `Will a lumber yard deliver to my house?`,
      a: `Most regional yards deliver across their service area. Fees vary; typically free over a minimum order ($300-500+ depending on yard) and modest below that. Worth asking before assuming.`,
    },
    {
      q: `Pressure-treated lumber — what to know in Vermont?`,
      a: `Vermont's freeze-thaw cycle is harder on pressure-treated lumber than milder climates. Buy ground-contact-rated for any deck post, fence post, or below-grade work. Above-grade decking can use the lighter-rated treatment but ground contact requires the heavier.`,
    },
    {
      q: `What about reclaimed or salvaged lumber?`,
      a: `Vermont has a small but real reclaimed lumber market. Several yards (especially in Brandon, Stowe area, and the Northeast Kingdom) carry barn beams, reclaimed flooring, and old growth lumber. Pricing varies widely; quality varies more. Worth seeing in person before buying.`,
    },
    {
      q: `Is composite decking really worth the upcharge?`,
      a: `For Vermont specifically, often yes. Pressure-treated wood decks in Vermont's freeze-thaw climate typically need annual maintenance (cleaning, sometimes re-staining) and last 15-20 years. Composite (Trex, TimberTech) costs 50-100% more upfront but typically lasts 25-30 years with minimal maintenance. The 10-year ROI is close; the lifestyle factor is real.`,
    },
  ],
  ctaHeading: `Get your project material list`,
  ctaBody: `$19.99. 24-hour refund. Smart Cart's project lists include material quantities and tier guidance — usable at any Vermont yard.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=lumber_vt`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `Vermont cost reality`,
      href: `/guides/vermont-home-project-cost-reality-2026`,
    },
    {
      label: `Best hardware stores in Vermont`,
      href: `/guides/best-hardware-stores-in-vermont`,
    },
    {
      label: `Best paint stores in Vermont`,
      href: `/guides/best-paint-stores-in-vermont`,
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
  description: `Where Vermont contractors and serious DIYers actually buy lumber. Regional yards, contractor pricing, delivery options, and the independents worth knowing.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/best-lumber-yards-in-vermont',
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
