import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Wet Vermont Basement? The $40 Diagnostic Before You Spend $30,000`,
  description: `Before you finish, encapsulate, or call a waterproofer — the cheap diagnostic that prevents the most expensive home repair mistake.`,
  alternates: { canonical: 'https://alderprojects.com/guides/basement-buy-skip-wait' },
  openGraph: {
    title: `Wet Vermont Basement? The $40 Diagnostic Before You Spend $30,000`,
    description: `Before you finish, encapsulate, or call a waterproofer — the cheap diagnostic that prevents the most expensive home repair mistake.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/basement-buy-skip-wait',
  },
}

const content = {
  eyebrow: `Buy / Skip / Wait`,
  h1: `Basement: Buy / Skip / Wait`,
  intro: `Basement decisions are where Vermont homeowners make the most expensive mistakes. The $30,000 finishing project that grew from a $200 dehumidifier problem. The $12,000 encapsulation that should have been a $40 downspout extension. Here's the diagnostic-first method.`,
  readTime: `7 min`,
  sections: [
    {
      heading: `Before anything: the cheap diagnostic week`,
      body: `Drop $40 at the hardware store. A digital hygrometer ($15-20), a wood moisture meter ($15-25), and a flashlight bright enough to see corners. Leave the hygrometer on the slab for one full week. Walk the perimeter with the moisture meter on framing, rim joist, any visible wood. Read the numbers. Over 60% sustained humidity = active moisture problem. Over 18% wood moisture content = wood-rot risk. This $40 of diagnostic work prevents the most common $30,000 mistake in Vermont home renovation.`,
    },
    {
      heading: `Buy: the items that solve real basement problems`,
      body: `If diagnostics confirm moisture, these are the high-leverage moves. Each sized to the problem, not sold as a system.`,
      list: [
        `Hygrometer + wood moisture meter: $40 total. The most important $40 you'll spend on the basement.`,
        `Dehumidifier sized to space: $200-450 for a 50-70 pint unit. Look for Energy Star and a built-in pump.`,
        `Downspout extensions: $10-25 per downspout. Half of wet basement problems are surface water that never gets the chance to be a basement problem if gutters discharge 6+ feet from the foundation.`,
        `Foundation perimeter grading fix: not a product, a project. Soil should slope away 6 inches in first 10 feet. Often a $200 weekend with a shovel.`,
        `Vapor barrier on dirt-floor crawl spaces: $1-2/sq ft for 6-mil poly. Real cure for crawl-space moisture in older Vermont homes.`,
      ],
    },
    {
      heading: `Skip: the moves that don't pencil out`,
      body: `Upsells that happen when a contractor or salesperson skips the diagnostic.`,
      list: [
        `Skip basement encapsulation systems at $8,000-15,000 before knowing the moisture source. Encapsulation makes sense for some crawl spaces with chronic groundwater. Overkill for surface-water problems that downspout extensions and grading fix for $300.`,
        `Skip interior French drain systems at $5,000-12,000 before exterior grading and gutters are fixed. Interior drains treat symptoms; exterior fixes solve problems.`,
        `Skip finishing the basement before a full moisture year. New drywall against a wall with hidden moisture is mold in 18 months.`,
        `Skip whole-house dehumidifiers at $2,500-4,500 installed when a portable $300 unit handles 90% of Vermont basements.`,
        `Skip foundation waterproofing paint — it traps moisture in the concrete and accelerates deterioration.`,
      ],
    },
    {
      heading: `Wait: the timing moves`,
      body: `Basement work has real seasonality in Vermont.`,
      list: [
        `Wait for fall dehumidifier sales. October model-year changes bring 25-40% discounts.`,
        `Wait to finish until you've documented a full year of humidity data. Vermont basements are wettest May-August.`,
        `Wait on exterior grading until late spring (May-June) when ground is workable. November-March is the wrong season for foundation work.`,
      ],
    },
    {
      heading: `When to skip the cart and call a pro`,
      body: `Some conditions need a foundation or waterproofing professional.`,
      list: [
        `Active water entering through foundation cracks, especially wider than a quarter inch`,
        `Efflorescence (white mineral deposits) covering large areas`,
        `Standing water that returns within 24 hours of being pumped`,
        `Visible mold colonies covering more than ~10 square feet`,
        `Settlement cracks (stair-step pattern in block walls) indicating structural movement`,
      ],
    },
  ],
  faqs: [
    {
      q: `Groundwater vs condensation vs surface water — what's the difference?`,
      a: `Groundwater enters through floor or wall from saturated soil — typically constant when present. Condensation forms on cool surfaces from humid summer air — typically warm-weather only. Surface water enters from gutters, downspouts, or grading — typically tied to specific rain events. Each has a different fix.`,
    },
    {
      q: `What's the cost to finish a basement in Vermont?`,
      a: `$30-80 per square foot all-in for standard finish (framing, insulation, drywall, flooring, basic lighting, outlets). A 600 sq ft basement is typically $18,000-48,000. Code requires egress windows for bedroom use, adding $2,000-5,000 if not present.`,
    },
    {
      q: `Is a basement waterproofing salesperson's free inspection worth taking?`,
      a: `Yes — if you treat it as one data point. Most waterproofing companies sell systems they install. Their diagnosis is biased toward their solution. Take the free inspection, then get a second opinion from a foundation contractor or structural engineer who doesn't sell the same system.`,
    },
    {
      q: `What humidity reading is acceptable?`,
      a: `Under 50% is ideal. 50-60% is acceptable. Over 60% sustained is an active moisture problem requiring intervention before finishing. Vermont basements peak in July-August; worst reading of the year under 55% with a running dehumidifier is good.`,
    },
    {
      q: `Can I finish with concrete floors that show occasional moisture?`,
      a: `Not safely without addressing the moisture source first. Concrete floor moisture migrates through any new flooring and into framing. Identify the source, fix it, run a dehumidifier for a season, confirm humidity stays low, then finish.`,
    },
  ],
  ctaHeading: `Get your personalized basement cart`,
  ctaBody: `$19.99. 24-hour refund. The diagnostic-first product list, named skip-list, and clear route-outs to professionals when the problem is beyond DIY.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=basement_bsw`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `Windows: Buy / Skip / Wait`,
      href: `/guides/windows-buy-skip-wait`,
    },
    {
      label: `Vermont cost reality`,
      href: `/guides/vermont-home-project-cost-reality-2026`,
    },
    {
      label: `Cost Calculator`,
      href: `/calculator`,
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
  description: `Before you finish, encapsulate, or call a waterproofer — the cheap diagnostic that prevents the most expensive home repair mistake.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/basement-buy-skip-wait',
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
