import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Brightech vs Pottery Barn vs Restoration Hardware: String Lights Compared`,
  description: `Are Pottery Barn outdoor string lights actually worth 3x the price of Brightech? Honest comparison with prices, specs, and the verdict.`,
  alternates: { canonical: 'https://alderprojects.com/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights' },
  openGraph: {
    title: `Brightech vs Pottery Barn vs Restoration Hardware: String Lights Compared`,
    description: `Are Pottery Barn outdoor string lights actually worth 3x the price of Brightech? Honest comparison with prices, specs, and the verdict.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights',
  },
}

const content = {
  eyebrow: `Comparison`,
  h1: `Brightech vs Pottery Barn vs Restoration Hardware: are designer string lights worth it?`,
  intro: `A 48-foot set of outdoor string lights costs $60 at Brightech, $180 at Pottery Barn, and $400 at Restoration Hardware. The bulbs look similar. The cords look similar. Are the premium ones actually better? Mostly, no.`,
  readTime: `5 min`,
  sections: [
    {
      heading: `Spec comparison`,
      body: `All three sell similar product categories: outdoor-rated, weather-resistant string light strands with edison-style bulbs.`,
      list: [
        `Brightech (Wirecutter pick) — 48-foot strand, 15 bulbs, $50-80 typical retail. Weather-rated, dimmable, replaceable bulbs.`,
        `Pottery Barn — 48-foot strand, 15 bulbs, $150-220 typical retail. Weather-rated, often non-dimmable, replaceable bulbs.`,
        `Restoration Hardware — 48-foot strand, 15 bulbs, $300-450 typical retail. Weather-rated, sometimes copper-wrapped sockets, replaceable bulbs.`,
      ],
    },
    {
      heading: `The OEM question`,
      body: `A common claim is that all three are made by the same OEM factory and differ only in branding. The honest answer: we cannot verify this from public information. What we can verify is that the functional performance of all three is comparable — light output similar, weather resistance similar, bulb life similar. Brightech is the only one tested and recommended by Wirecutter, which is the closest thing to an independent authority in the category.`,
    },
    {
      heading: `Where the price premium actually goes`,
      body: `When the underlying product performs similarly, the price difference goes to:`,
      list: [
        `Brand and marketing — Pottery Barn and RH spend heavily on catalogs, retail stores, photography. That cost is in the price.`,
        `Retail experience — designer brands offer in-person showrooms and white-glove customer service. Mid-tier sells through Amazon.`,
        `Aesthetic packaging — designer products often arrive in branded boxes with tissue paper. Mid-tier arrives in cardboard.`,
        `Returns and warranty handling — designer brands typically have easier returns and longer warranty windows.`,
      ],
    },
    {
      heading: `When the designer brand is actually worth it`,
      body: `There are real situations where Pottery Barn or RH is the right call.`,
      list: [
        `You want the in-store buying experience (look at it before purchase)`,
        `You value the easier return process if the lights don't work in your space`,
        `You're outfitting a high-end property and consistency with the brand's aesthetic matters`,
        `The specific product has a feature mid-tier doesn't (copper sockets, specific bulb styles, integrated dimmer)`,
      ],
    },
    {
      heading: `The verdict by use case`,
      body: `Most Vermont homeowners setting up outdoor lighting are better off with Brightech.`,
      list: [
        `Lake camp, backyard, deck, general outdoor use: Brightech wins on price and Wirecutter endorsement`,
        `High-end property aesthetic, designer renovation: Pottery Barn or RH may fit better with overall scheme`,
        `Wedding or event one-time use: Brightech (cheap enough to expense and donate)`,
        `Replacement for existing failed designer lights: match what you have if uniformity matters`,
        `First-time outdoor light buyer: Brightech, learn what you actually want before spending 3-5x`,
      ],
    },
  ],
  faqs: [
    {
      q: `Are the bulbs interchangeable across brands?`,
      a: `Often yes — most use standard E12 or E26 bases. Replacement bulbs from one brand frequently work in another brand's string. Worth confirming before mixing systems.`,
    },
    {
      q: `How long do outdoor string lights last in Vermont?`,
      a: `3-7 years if taken down for winter. 1-3 years if left up year-round through Vermont winters. Brand has less impact on lifespan than whether you take them down or leave them exposed.`,
    },
    {
      q: `Can I use indoor string lights outdoors?`,
      a: `Not safely. Outdoor-rated strings have weather-resistant insulation and socket seals. Indoor lights will fail or pose shock risk when exposed to moisture.`,
    },
    {
      q: `What about cheap Amazon string lights under $30?`,
      a: `Some are fine, some fail within a season. Pattern: look for outdoor IP rating (IP44+ minimum), replaceable bulbs (not sealed/non-serviceable), and dimmable connection. Below those specs, you're often replacing the whole set in a year.`,
    },
    {
      q: `Smart Cart's recommendation?`,
      a: `Brightech in the Buy list for most lake-season and outdoor scenarios. Pottery Barn or RH in the Skip list with the designer-markup explanation. Sealed cheap Amazon strings in the Skip list with the durability explanation.`,
    },
  ],
  ctaHeading: `Get your personalized lake-season cart`,
  ctaBody: `$19.99. 24-hour refund. Smart Cart picks the right tier for your specific outdoor situation and budget.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=lights_vs`,
  relatedGuides: [
    {
      label: `Lake season: Buy / Skip / Wait`,
      href: `/guides/lake-season-buy-skip-wait`,
    },
    {
      label: `Polywood vs Highwood Adirondacks`,
      href: `/guides/polywood-vs-highwood-vs-frontgate-adirondack-chairs`,
    },
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
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
  description: `Are Pottery Barn outdoor string lights actually worth 3x the price of Brightech? Honest comparison with prices, specs, and the verdict.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights',
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
