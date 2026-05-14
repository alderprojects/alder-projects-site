import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `The 5-Question Test: Save 20-40% On Any Home Improvement Purchase`,
  description: `Five questions that filter any home improvement purchase. Works for windows, kitchens, decks, patio furniture, everything.`,
  alternates: { canonical: 'https://alderprojects.com/guides/the-5-question-test-before-any-home-purchase' },
  openGraph: {
    title: `The 5-Question Test: Save 20-40% On Any Home Improvement Purchase`,
    description: `Five questions that filter any home improvement purchase. Works for windows, kitchens, decks, patio furniture, everything.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/the-5-question-test-before-any-home-purchase',
  },
}

const content = {
  eyebrow: `The Method`,
  h1: `The 5-Question Test Before Any Home Purchase`,
  intro: `Before any home improvement purchase — $30 or $3,000 — run it through these five questions. If the answer is no to any of them, don't buy this week. The test takes 90 seconds and reliably saves the buyer 20-40% on what they would have spent.`,
  readTime: `5 min`,
  sections: [
    {
      heading: `Question 1: Will I actually use this in the next 30 days?`,
      body: `The single best filter against aspirational purchases. The patio heater bought in May still in the box in October. The fancy mandoline used twice. The pressure washer in the garage for two years. If no, the item belongs on the wait list — buy next year when you actually need it, in the off-season when it's cheaper.`,
    },
    {
      heading: `Question 2: Will it be measurably cheaper in 4-6 months?`,
      body: `Some categories drop predictably off-season. Some don't. The test sorts them.`,
      list: [
        `Yes — wait: patio furniture, outdoor cushions, lighting, cabinet hardware, under-cabinet lighting, paint`,
        `No — buy now if needed: mattresses, major appliances (year-model clearance), mid-range grills, mulch and landscape materials`,
        `Mixed: tools (mid-June Father's Day promos), kitchen small appliances, decorative items`,
      ],
    },
    {
      heading: `Question 3: Am I buying because I needed it before the sale existed?`,
      body: `The hardest question to answer honestly. If you weren't already shopping before you saw the sale sign, the sale is selling you, not the item. If you were genuinely already shopping and the sale brings it into range, that's the rare legitimate Memorial Day or Black Friday purchase. Buyer's needs come first, retailer's calendar second.`,
    },
    {
      heading: `Question 4: Is this the right tier?`,
      body: `Most home goods come in three tiers: entry-level (functional, may not last), mid-tier (Wirecutter picks, 90% of performance at 30-50% the price), and premium designer brands (often the same OEM-made products with a 2-5x brand markup). The test: am I paying designer markup for the same underlying product? Pottery Barn lights = Brightech lights. Frontgate cushions = mid-tier Sunbrella cushions. Polywood = Highwood. If you can identify the mid-tier equivalent and live without the brand, savings are typically 50-70%.`,
    },
    {
      heading: `Question 5: Have I checked the price history?`,
      body: `Camelcamelcamel for Amazon shows price history going back years. Most big-box retailers have less transparent history but third-party tools (Honey, Capital One Shopping, Karma) approximate. The 90-second check answers two questions: is this actually on sale or has the price been at this level for months, and is the historical low better than today's price? If lower and a known cycle is approaching, wait.`,
    },
    {
      heading: `How Smart Cart applies the test`,
      body: `Smart Cart runs all five questions automatically against each item. The Buy list passes all five for your scenario. The Skip list fails Question 4 (wrong tier) or Question 1 (won't be used). The Wait list fails Question 2 (cheaper soon). The Savings Snapshot at the bottom shows the dollar amount the test produced for your specific project. $19.99, 24-hour refund, covers nine project scopes today.`,
    },
  ],
  faqs: [
    {
      q: `Does the test apply to contractor services?`,
      a: `Yes with adaptation. Q1 (30-day use) applies to scheduling. Q2 (cheaper soon) applies to off-season pricing. Q3 (needed before deal) applies to limited-time contractor promos. Q4 (right tier) is critical — the difference between $30K and $80K kitchen is largely tier choices. Q5 (price history) is harder for services but multiple quotes from comparable contractors approximate it.`,
    },
    {
      q: `What if I have an urgent need?`,
      a: `Urgent need is a valid override. Furnace dies in February: buy a furnace. Window breaks in November: replace it. The test is for non-urgent purchases — about 80% of home improvement spending.`,
    },
    {
      q: `How is this different from just "don't buy on impulse"?`,
      a: `"Don't buy on impulse" is advice without method. The 5-question test is method. It tells you which impulses to follow (Q3 yes), reject (Q1 no), or defer (Q2 yes). The structure is what makes it work where general restraint doesn't.`,
    },
    {
      q: `Can I use it for non-home purchases?`,
      a: `Questions 1, 2, 3, and 5 generalize to almost any retail purchase. Question 4 (tier) is most useful in categories with clear OEM-and-brand patterns: outdoor goods, kitchen goods, electronics, apparel.`,
    },
    {
      q: `Does Smart Cart's Skip list actually save more than $19.99?`,
      a: `Almost always on a real project. Window weatherization scope alone typically skips $300-2,500 of overbuy. Lake-season skips $400-1,500 in designer markup. Kitchen skips $1,200-2,500 in unneeded backsplash, doors, gadgets. $19.99 is designed to pay for itself in the first skip move.`,
    },
  ],
  ctaHeading: `Try the test on your project`,
  ctaBody: `$19.99. 24-hour refund. Get the personalized Buy / Skip / Wait list for your specific project, with the test already applied to every item.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=fiveq_test`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `Buy-timing calendar`,
      href: `/guides/home-improvement-buy-timing-calendar`,
    },
    {
      label: `Windows: Buy / Skip / Wait`,
      href: `/guides/windows-buy-skip-wait`,
    },
    {
      label: `Lake season: Buy / Skip / Wait`,
      href: `/guides/lake-season-buy-skip-wait`,
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
  description: `Five questions that filter any home improvement purchase. Works for windows, kitchens, decks, patio furniture, everything.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/the-5-question-test-before-any-home-purchase',
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
