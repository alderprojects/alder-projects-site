import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Weber Spirit vs Big Green Egg vs Kamado Joe: Is BGE Worth $2,500?`,
  description: `Honest comparison: gas grill vs ceramic kamado. Cook quality by food type, 5-year total cost of ownership, footprint, who should buy what.`,
  alternates: { canonical: 'https://alderprojects.com/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost' },
  openGraph: {
    title: `Weber Spirit vs Big Green Egg vs Kamado Joe: Is BGE Worth $2,500?`,
    description: `Honest comparison: gas grill vs ceramic kamado. Cook quality by food type, 5-year total cost of ownership, footprint, who should buy what.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost',
  },
}

const content = {
  eyebrow: `Comparison`,
  h1: `Weber Spirit vs Big Green Egg vs Kamado Joe: real-cost comparison`,
  intro: `$600 for a Weber Spirit II. $1,500 for a Kamado Joe Classic III. $2,500 for a Big Green Egg Large. All three cook food outdoors. The premium ones cook some food noticeably better. The question is whether you actually cook that food often enough to justify 4x the price.`,
  readTime: `6 min`,
  sections: [
    {
      heading: `Cook quality by food type`,
      body: `The three grills have meaningfully different sweet spots. The premium options aren't just "better at everything" — they're substantially better at a narrow range of foods and roughly equivalent on the everyday range.`,
      list: [
        `Burgers, hot dogs, chicken breasts, vegetables, fish fillets: all three perform within 5% of each other. The Weber is faster (gas vs charcoal startup); the ceramic ones add subtle smoke flavor.`,
        `Steaks, slow-smoked brisket, ribs, whole roasts: ceramic kamados (BGE, Kamado Joe) genuinely win on temperature stability and smoke quality. The Weber Spirit can do them but works harder.`,
        `Pizza, wood-fired bread: ceramic kamados dominate. The Weber cannot replicate the radiant-heat ceiling effect of a kamado at pizza temps.`,
        `Cold-smoking, low-and-slow brisket: ceramic kamados can hold 225°F for 14+ hours; gas cannot maintain that without active management.`,
        `Quick weeknight cooking, kids' food, summer dinner-on-the-porch reality: Weber Spirit wins on convenience.`,
      ],
    },
    {
      heading: `5-year total cost of ownership`,
      body: `Sticker price isn't the full picture. Consumables, accessories, and replacement schedules matter.`,
      list: [
        `Weber Spirit II ($600 grill) + propane ($75/year) + grates and replacement parts (~$50/year) = $1,225 over 5 years.`,
        `Kamado Joe Classic III ($1,500 grill) + lump charcoal ($150/year) + accessories (~$100/year) = $2,750 over 5 years.`,
        `Big Green Egg Large ($2,500 grill + stand $400) + lump charcoal ($150/year) + accessories (~$100/year) = $4,150 over 5 years.`,
        `5-year delta Weber vs BGE: $2,925. Delta Weber vs Kamado Joe: $1,525.`,
      ],
    },
    {
      heading: `Footprint and storage`,
      body: `Different grills demand different outdoor real estate.`,
      list: [
        `Weber Spirit II: rolls easily, lighter weight, can be tucked under cover or moved to garage in winter`,
        `Kamado Joe: heavy ceramic, requires a stand or table, typically lives in one place year-round`,
        `Big Green Egg: heaviest, requires a permanent stand or built-in surround, lives in one place permanently`,
      ],
    },
    {
      heading: `Verdict by user profile`,
      body: `There's a right grill for each user. Be honest about which one you are.`,
      list: [
        `Weeknight cook, family with kids, weekend burgers and the occasional steak: Weber Spirit II. The right answer. Save the $1,500-2,000.`,
        `Serious BBQ enthusiast, smokes 4+ times a year, makes pizza outdoors monthly: Kamado Joe Classic III. Real performance gain over the Weber.`,
        `Lifestyle cook, willing to invest in cooking as a hobby, built-in outdoor kitchen, pizza weekly: Big Green Egg. Worth the premium if you'll actually use it.`,
        `Lake camp, infrequent use, 4-8 weekends a year: Weber Spirit II. Kamado at a camp is overkill that sits unused 50 weeks a year.`,
      ],
    },
  ],
  faqs: [
    {
      q: `Are Big Green Egg and Kamado Joe actually different products?`,
      a: `Yes — different manufacturers, different designs, different accessories. Kamado Joe has more standard features (slow roller, divide & conquer rack) included; BGE charges extra for similar accessories. Performance is comparable; ecosystems are different.`,
    },
    {
      q: `Can a Weber Spirit make good barbecue?`,
      a: `Yes, with effort. Gas grills can do low-and-slow with indirect heat, wood chip boxes, and active management. The ceramic kamado is just easier and more consistent for those cooks.`,
    },
    {
      q: `What about the cheap kamado-style grills under $500?`,
      a: `Mixed quality. Some perform reasonably for 2-3 years before ceramic cracking or hardware failure. The BGE and Kamado Joe price premium reflects longer warranty and proven ceramic durability — they're often warrantied for decades.`,
    },
    {
      q: `Pellet grills (Traeger, etc.) — where do they fit?`,
      a: `Different category — convenient, set-and-forget for smoking, but generally weaker for high-heat searing than gas or charcoal. Worth considering as a fourth option but not directly comparable in this matchup.`,
    },
    {
      q: `Smart Cart's recommendation?`,
      a: `Weber Spirit II in the Buy list for most lake-season scenarios. Kamado Joe in the optional add-ons for BBQ-enthusiast scenarios. Big Green Egg explicitly noted with the "only if you'll really use it" caveat.`,
    },
  ],
  ctaHeading: `Get your personalized lake-season cart`,
  ctaBody: `$19.99. 24-hour refund. Smart Cart picks the right grill tier for your specific outdoor situation and cooking habits.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=grills_vs`,
  relatedGuides: [
    {
      label: `Lake season: Buy / Skip / Wait`,
      href: `/guides/lake-season-buy-skip-wait`,
    },
    {
      label: `Brightech vs Pottery Barn lights`,
      href: `/guides/brightech-vs-pottery-barn-vs-restoration-hardware-string-lights`,
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
  description: `Honest comparison: gas grill vs ceramic kamado. Cook quality by food type, 5-year total cost of ownership, footprint, who should buy what.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost',
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
