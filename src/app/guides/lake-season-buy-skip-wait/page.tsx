import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Lake House Setup: $2,400 Lean vs $7,500 Catalog — Designer Markup Map`,
  description: `Setting up a lake house or camp? The designer-markup pattern, the patio furniture buy-timing trap, and the 6-item skip list that saves the most money.`,
  alternates: { canonical: 'https://alderprojects.com/guides/lake-season-buy-skip-wait' },
  openGraph: {
    title: `Lake House Setup: $2,400 Lean vs $7,500 Catalog — Designer Markup Map`,
    description: `Setting up a lake house or camp? The designer-markup pattern, the patio furniture buy-timing trap, and the 6-item skip list that saves the most money.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/lake-season-buy-skip-wait',
  },
}

const content = {
  eyebrow: `Buy / Skip / Wait`,
  h1: `Lake Season: Buy / Skip / Wait`,
  intro: `Lake property setup is where homeowners overspend the most, because the catalog brands have figured out exactly how to sell aspiration. A first-time Champlain camp setup commonly runs $4,800-7,500 when the right version delivers everything actually needed for $2,400-3,800. The savings come from one pattern.`,
  readTime: `7 min`,
  sections: [
    {
      heading: `The designer-markup pattern (the highest-savings move)`,
      body: `Across outdoor furniture, lighting, cushions, and grilling gear, premium designer brands routinely sell the same underlying product as a mid-tier brand at 3-5x markup. This is the single move that produces most of the savings.`,
      list: [
        `Pottery Barn and Restoration Hardware string lights ($250-500 set) are frequently the same products as Brightech (the Wirecutter winner) at 3x markup.`,
        `Frontgate outdoor cushions ($300-500 each) use the same Sunbrella fabric as $80 cushions from mid-tier makers.`,
        `Big Green Egg and Kamado Joe ($1,200-2,500) are real ceramic-cooking products — but for burgers, chicken, occasional steak, a Weber Spirit II ($600) delivers 95% of the cook quality.`,
        `Polywood Adirondack chairs ($200-300) use the same recycled HDPE as Highwood and similar Type B-tier brands ($80-130).`,
      ],
    },
    {
      heading: `Buy: the lake-season essentials`,
      body: `Items that earn their place in the lean cart. Each solves a real lake-season problem and works for years.`,
      list: [
        `Polywood or Highwood Adirondack chairs: $80-300 per chair depending on tier. UV-stable, rot-proof.`,
        `Brightech outdoor string lights: $40-80 per set. The Wirecutter pick.`,
        `Sunbrella-fabric cushions: $60-120 each from a mid-tier brand.`,
        `Solo Stove or basic propane fire pit: $200-450.`,
        `Thermacell for mosquitos: $30-50. Real EPA efficacy data, unlike citronella.`,
        `Weber Spirit II grill (or Char-Broil mid-tier): $400-600. Real Memorial Day deal — buy now if needed.`,
      ],
    },
    {
      heading: `Skip: lake-season items that don't earn their cost`,
      body: `Six categories where most buyers overspend. Each skip is real money saved.`,
      list: [
        `Skip patio heaters for spring lake use ($200-400 plus fuel) — a sweater and a fire pit do better.`,
        `Skip smart outdoor lighting hubs ($300-500) — an indoor problem disguised as outdoor.`,
        `Skip universal-fit furniture covers ($40-120 per piece) — Polywood, Sunbrella, Weber are rated to live outdoors uncovered. Covers create condensation pockets where mold grows.`,
        `Skip citronella torches as bug control ($30-80) — EPA data says less than 1% effectiveness of Thermacell. Buy for ambiance, not mosquitos.`,
        `Skip lake-themed decor and signage ($100-300 typical) — the items the next owner throws out.`,
        `Skip premium dock fenders and marine hardware before you actually need them.`,
      ],
    },
    {
      heading: `Wait: the timing moves`,
      body: `Lake-season retail has the most predictable buy-timing pattern in home goods.`,
      list: [
        `Wait for patio furniture until November-February. May-June is peak demand pricing. 4-piece wicker set listed at $899 in May was $499 in December.`,
        `Wait for cushions and pillows: late August-September clearance is year-best, 30-50% off.`,
        `Wait for premium grills (Big Green Egg, Kamado Joe) until late July-August. Mid-range grills are fine to buy at Memorial Day.`,
        `Wait for string lights until November holiday clearance, 30-40% off.`,
      ],
    },
  ],
  faqs: [
    {
      q: `Are designer outdoor brands ever worth the price?`,
      a: `For specific use cases. Treasure Garden umbrellas are genuinely better for properties on open water. Big Green Egg is genuinely better for ceramic and wood cooking. The trap is buying designer for everyday use where mid-tier delivers 90-95% of the performance at one-third the price.`,
    },
    {
      q: `What's the actual best month to buy patio furniture?`,
      a: `November through February. Retailers clear inventory aggressively after Labor Day. End-of-season clearance from last year (call independent garden centers) and Facebook Marketplace (supply spikes in May as people upgrade) are the two best non-November options.`,
    },
    {
      q: `Is a Memorial Day patio furniture sale ever real?`,
      a: `Floor models and last-year clearance at independent garden centers, occasionally. The big-box "Memorial Day patio furniture sale" prices are almost always 20-30% higher than the same items in November-December.`,
    },
    {
      q: `Champlain-specific outdoor consideration?`,
      a: `Lake reflection roughly doubles UV exposure on lakeside furniture — UV stability matters more than non-waterfront properties. Wind off the lake destroys lightweight decor without anchor systems. Marine-grade hardware on the dock side is worth the upcharge — wet-dry cycling is harder on hardware than saltwater.`,
    },
    {
      q: `Does Smart Cart cover dock and marine gear?`,
      a: `Lake-season scope covers outdoor furniture, lighting, cushions, fire pits, grills, and bug control. Dock-specific marine hardware, watercraft, and lift systems aren't in scope yet — those typically need a marine specialist anyway.`,
    },
  ],
  ctaHeading: `Get your personalized lake-season cart`,
  ctaBody: `$19.99. 30-day refund. Named designer-markup skip list, real product picks across tiers, buy-timing calendar that saves 30-50%.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=lake_bsw`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `Brightech vs Pottery Barn lights`,
      href: `/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights`,
    },
    {
      label: `Polywood vs Highwood Adirondacks`,
      href: `/guides/polywood-vs-highwood-vs-frontgate-adirondack-chairs`,
    },
    {
      label: `Weber vs Big Green Egg vs Kamado Joe`,
      href: `/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost`,
    },
    {
      label: `Buy-timing calendar`,
      href: `/guides/home-improvement-buy-timing-calendar`,
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
  description: `Setting up a lake house or camp? The designer-markup pattern, the patio furniture buy-timing trap, and the 6-item skip list that saves the most money.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/lake-season-buy-skip-wait',
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <GuidePage content={content} smartCartCta={{ href: content.ctaHref }} />
    </>
  )
}
