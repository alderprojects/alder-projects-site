import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `How to Shop for Home Projects Without Overspending (Buy/Skip/Wait)`,
  description: `The honest Buy/Skip/Wait method for any home project. Real dollar amounts, named designer-markup patterns, and the 5-question test before any purchase.`,
  alternates: { canonical: 'https://alderprojects.com/guides/how-to-shop-for-home-projects-without-overspending' },
  openGraph: {
    title: `How to Shop for Home Projects Without Overspending (Buy/Skip/Wait)`,
    description: `The honest Buy/Skip/Wait method for any home project. Real dollar amounts, named designer-markup patterns, and the 5-question test before any purchase.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/how-to-shop-for-home-projects-without-overspending',
  },
}

const content = {
  eyebrow: `The Method`,
  h1: `How to shop for home projects without overspending`,
  intro: `Three Google searches and four contractor quotes later, most homeowners still don't know whether they're overspending. The problem isn't lack of information — it's that aggregator review sites earn commission from the brands they recommend, and they won't tell you what to skip. This is the Buy-Skip-Wait method, applied across four common home projects.`,
  readTime: `12 min`,
  sections: [
    {
      heading: `The problem: too many options, no honest filter`,
      body: `A homeowner planning a kitchen refresh sees twenty articles, six contractor quotes, and a Wirecutter list. None are wrong, exactly. But none tell you which $35 paint to skip in favor of the $90 one, or which $90 product is just the $35 one with a designer tag. The information is everywhere. The judgment is what's missing. Buy-Skip-Wait is judgment, structured.`,
    },
    {
      heading: `The Buy-Skip-Wait method`,
      body: `Three categories. Every home project decomposes into them. Most products in a home category fall into one of three buckets: items that actually deliver value, items that are designer markup or solve fake problems, and items that are real but priced 30-50% lower in a different season.`,
      list: [
        `Buy: items that actually deliver, in the tier that makes sense for your situation. Tier matters more than brand — mid-tier Brightech outdoor lights beat entry-level Frontgate every time.`,
        `Skip: designer-markup traps and overkill products. Always with the dollar amount saved per skip.`,
        `Wait: items that drop 30-50% off-season. Patio furniture in November. Cabinet hardware in late summer. Tools in mid-June and Black Friday.`,
      ],
    },
    {
      heading: `Walked example #1: Vermont window weatherization`,
      body: `A homeowner has a $14,000 replacement quote on the kitchen table. Old farmhouse, 8 windows, drafty since they moved in. The replacement is real work, but it's also the wrong first move.`,
      list: [
        `Buy: V-strip or silicone weatherstripping, decent caulk, window insulator film, door-bottom sweeps. Core cart $70-115. All-in $255-485.`,
        `Skip: Indow custom acrylic inserts at $300-500/window installed. For an 8-window farmhouse that's $2,400-4,000 to solve what $200 of weatherstripping handles for a season. Also skip full replacement before the cheap diagnostic.`,
        `Wait: WindowDressers community builds at ~$40/insert with Efficiency Vermont rebate support. Sign up in summer for a November build.`,
      ],
    },
    {
      heading: `Walked example #2: Basement before finishing`,
      body: `A homeowner is about to spend $30,000 to finish their basement. The contractor quote includes framing, drywall, flooring, lighting, the works. What's missing: any reference to moisture. This is the most expensive mistake in residential construction.`,
      list: [
        `Buy: $15 hygrometer to leave on the basement slab for a week. $25 wood moisture meter. Properly sized dehumidifier. Total under $200.`,
        `Skip: finishing before the moisture diagnostic. Skip basement encapsulation at $8,000-15,000 before knowing the moisture source. Skip interior French drain systems before exterior grading and gutters are fixed.`,
        `Wait: dehumidifier sales in October. Run a temporary unit through summer and buy permanent in fall — save 25-40%.`,
      ],
    },
    {
      heading: `Walked example #3: Lake season outdoor`,
      body: `A first-time lake property owner is setting up their Memorial Day cookout. Catalog says they need $4,800-7,500. Buy-Skip-Wait gets the same setup for $2,400-3,800. Savings come almost entirely from skipping designer-markup brands selling identical underlying products.`,
      list: [
        `Buy: Polywood (or Highwood at 50% less) Adirondack chairs, Brightech outdoor string lights, Sunbrella-fabric cushions from a mid-tier maker, a Solo Stove or basic propane fire pit, a Thermacell for mosquitos.`,
        `Skip: Pottery Barn / Restoration Hardware string lights ($250-500 set). Frontgate cushions ($300-500 each). Patio heaters. Smart outdoor lighting hubs. Citronella torches.`,
        `Wait: patio furniture. Memorial Day is the worst window. 4-piece wicker set listed at $899 in May was $499 in December. Wait until November, save 30-50%.`,
      ],
    },
    {
      heading: `Walked example #4: Kitchen cosmetic refresh`,
      body: `A homeowner has a $2,000 kitchen refresh list queued up. After Buy-Skip-Wait, the list comes out to $480 and the kitchen looks better than the $2,000 version would have.`,
      list: [
        `Buy: cabinet hardware swap ($80-180 for a full kitchen in real metal), faucet upgrade ($140-220 Moen/Delta mid-range), under-cabinet lighting ($40-80 plug-in LED).`,
        `Skip: peel-and-stick backsplash ($150-300, looks bad in 6 months). New cabinet doors ($80-200 each — refinish for $200 instead). Smart kitchen gadgets. Premium paint.`,
        `Wait: cabinet hardware sales late summer (back-to-school). Under-cabinet lighting drops in November.`,
      ],
    },
    {
      heading: `The 5-question test before any home purchase`,
      body: `When in doubt on any item, any project, run it through this filter. If the answer is no to any of these, don't buy this week.`,
      list: [
        `Will I actually use this in the next 30 days?`,
        `Will it be measurably cheaper in 4-6 months? (Patio furniture: yes. Mattresses: no.)`,
        `Am I buying because I needed it, or because the sale exists?`,
        `Is this the right tier, or am I paying designer markup for the same underlying product?`,
        `Have I checked the price history? (Camelcamelcamel for Amazon, store-specific tools for big box.)`,
      ],
    },
    {
      heading: `How Smart Cart does this for you`,
      body: `The walked examples above are general method. Smart Cart is the personalized version — $19.99, 30-day refund. You pick your project (window weatherization, basement moisture prep, lake season setup, kitchen refresh, cabinet hardware swap, mudroom reset, and more), your scenario (just starting, already shopping, tight budget, premium picks, just curious), and Smart Cart returns the Buy list with real product names, the Skip list with dollar amounts saved per skip, the Wait list with month-by-month buy-timing, and route-out advice on when to call a pro. Most carts deliver $400-3,000 in savings on the first project alone.`,
    },
  ],
  faqs: [
    {
      q: `Is $19.99 worth it for a shopping list?`,
      a: `If your project has any meaningful budget — anything above $500 — the answer is almost always yes. Smart Cart is designed to save more than $19.99 in skip moves alone on the first project. If it doesn't, the 30-day refund covers you.`,
    },
    {
      q: `How is this different from Wirecutter?`,
      a: `Wirecutter tells you what to buy. Smart Cart tells you what to buy, what to skip with dollar amounts saved per skip, and what to wait on with specific months each item drops in price. Aggregators don't flag designer-brand markup patterns because they earn commission on those brands.`,
    },
    {
      q: `What if my project isn't covered yet?`,
      a: `Smart Cart currently covers window weatherization, basement moisture prep, lake season outdoor, kitchen cosmetic refresh, cabinet hardware swap, kitchen organizers, mudroom reset, outdoor freeze prevention, and seasonal opening. More roll out through 2026.`,
    },
    {
      q: `Is this Vermont-only?`,
      a: `Built in Vermont with Vermont-specific examples (Efficiency Vermont, WindowDressers, Champlain context). The method itself works anywhere. Cold-climate Northeast fits closest.`,
    },
    {
      q: `What does Smart Cart actually look like?`,
      a: `A personalized result page with four sections: Lean Cart (items to buy with real names and prices), Optional Add-Ons (maybe items for specific situations), Skip For Now (named with reasoning and dollar amounts saved), Savings Snapshot (math on what you'd have spent vs what you spent). 30-day access.`,
    },
    {
      q: `What's the refund policy?`,
      a: `Full refund within 30 days of purchase, no questions asked, if the Smart Cart doesn't match your situation.`,
    },
  ],
  ctaHeading: `Try the method on your project`,
  ctaBody: `$19.99. 30-day refund. Covers nine project scopes today, more rolling out monthly. Built in Vermont, works wherever you live in cold-climate Northeast.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=method_pillar`,
  relatedGuides: [
    {
      label: `Windows: Buy / Skip / Wait`,
      href: `/guides/windows-buy-skip-wait`,
    },
    {
      label: `Basement: Buy / Skip / Wait`,
      href: `/guides/basement-buy-skip-wait`,
    },
    {
      label: `Lake season: Buy / Skip / Wait`,
      href: `/guides/lake-season-buy-skip-wait`,
    },
    {
      label: `Kitchen refresh: Buy / Skip / Wait`,
      href: `/guides/kitchen-refresh-buy-skip-wait`,
    },
    {
      label: `The 5-question test`,
      href: `/guides/the-5-question-test-before-any-home-purchase`,
    },
    {
      label: `Buy-timing calendar`,
      href: `/guides/home-improvement-buy-timing-calendar`,
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
  description: `The honest Buy/Skip/Wait method for any home project. Real dollar amounts, named designer-markup patterns, and the 5-question test before any purchase.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/how-to-shop-for-home-projects-without-overspending',
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
