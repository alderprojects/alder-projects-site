import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Home Improvement Sale Calendar: When Each Category Actually Goes On Sale`,
  description: `Month-by-month guide to home improvement sale cycles. Patio furniture in November, cabinet hardware in late summer, paint in February. Save 30-50%.`,
  alternates: { canonical: 'https://alderprojects.com/guides/home-improvement-buy-timing-calendar' },
  openGraph: {
    title: `Home Improvement Sale Calendar: When Each Category Actually Goes On Sale`,
    description: `Month-by-month guide to home improvement sale cycles. Patio furniture in November, cabinet hardware in late summer, paint in February. Save 30-50%.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/home-improvement-buy-timing-calendar',
  },
}

const content = {
  eyebrow: `The Method`,
  h1: `Home Improvement Buy-Timing Calendar`,
  intro: `Every home improvement category has a predictable sale cycle. Patio furniture in November. Cabinet hardware in late summer. Paint in February. Tools in mid-June. Working with the calendar instead of against it saves 30-50% on most purchases. Here's the month-by-month map.`,
  readTime: `6 min`,
  sections: [
    {
      heading: `January — Major appliance and home gym clearance`,
      body: `One of the strongest buy-timing months across multiple categories. Retailers clear last-year appliance models and home gym equipment heading into spring.`,
      list: [
        `Major appliances: year-end model clearance, 20-40% off`,
        `Home gym equipment: post-resolution flood subsides, retailers discount unsold`,
        `Bedding and linens: white sale traditional January cycle, 30-50% off`,
        `Carpet and rugs: post-holiday cycle, 20-40% off prior-season patterns`,
      ],
    },
    {
      heading: `February — Paint, flooring, bath`,
      body: `Retailers transition spring inventory in February, clearing winter and prior-year stock.`,
      list: [
        `Paint: pre-spring rollout clearance, 20-30% off premium lines`,
        `Hardwood flooring: 15-25% off prior-year inventory`,
        `Bathroom fixtures: spring catalog refresh creates clearance window`,
        `Vanities and bath cabinetry: 20-35% off discontinued lines`,
      ],
    },
    {
      heading: `March-April — Outdoor seasonal opening`,
      body: `Outdoor inventory arrives at full retail. Worst time for patio furniture, decor, accents. Good time for tools, gardening supplies, mulch and soil (loss leaders).`,
      list: [
        `Skip: patio furniture (peak demand through October)`,
        `Skip: outdoor decor and accents (markup highest in spring)`,
        `Buy: tools with specific promos`,
        `Buy: mulch, soil, basic landscape supplies (loss leaders)`,
      ],
    },
    {
      heading: `May — Memorial Day traps and real deals`,
      body: `Most heavily marketed retail event of late spring. Most of it isn't a real deal. Some is.`,
      list: [
        `Real deals: mattresses (genuine year-best), major appliances (year-model clearance), mid-range grills (Weber Spirit, Char-Broil tier), mulch and basic landscape materials`,
        `Traps: patio furniture, outdoor decor, premium grills (BGE, Kamado Joe — wait until July-August), "Memorial Day branded" anything`,
        `Strategy: check price history before assuming Memorial Day price is below recent baseline`,
      ],
    },
    {
      heading: `June — Father's Day tools, patio still peak`,
      body: `Father's Day mid-June is a real cycle for tools, especially mid-tier and entry-level. Premium tools rarely discount.`,
      list: [
        `Buy: mid-tier tools with Father's Day promos (DeWalt, Milwaukee, Stanley)`,
        `Skip: premium tools (Festool, Knipex) — rarely discount until Black Friday`,
        `Wait: patio furniture (5 more months until real clearance)`,
        `Buy: cordless tool battery packs at promo (genuine 20-30% off)`,
      ],
    },
    {
      heading: `July-August — Mid-summer mixed`,
      body: `Few categories see meaningful sales in July. Late August begins back-to-school cycle.`,
      list: [
        `Late July-August: premium grills (BGE, Kamado Joe) finally hit promo cycle, 15-25% off`,
        `Late August (back-to-school): cabinet hardware drops 20-30%, organization products, smaller kitchen items`,
        `Skip: still wrong time for patio furniture, lighting, outdoor accents`,
      ],
    },
    {
      heading: `September — Cushion clearance and pre-fall`,
      body: `Outdoor cushions and pillows hit year-best clearance window. Less competition than November patio furniture window.`,
      list: [
        `Buy: outdoor cushions and pillows (30-50% off — year-best)`,
        `Buy: pre-fall HVAC service and tune-ups`,
        `Buy: roofing services on shoulder-season schedule`,
      ],
    },
    {
      heading: `October — Dehumidifiers and outdoor wind-down`,
      body: `Year-model clearance on dehumidifiers, winterization supplies in demand, early-bird firewood deliveries.`,
      list: [
        `Buy: dehumidifiers (25-40% off year-end models)`,
        `Buy: pipe insulation, frost-free hose bibs, winterization supplies`,
        `Skip: snow blowers (peak through December — wait for January if possible)`,
      ],
    },
    {
      heading: `November — Year's best patio furniture window`,
      body: `If you can wait, this is when the savings happen. Patio furniture, outdoor lighting, accent pricing drops 30-50% as retailers clear before holiday focus shifts.`,
      list: [
        `Buy: patio furniture (year-best, 30-50% off)`,
        `Buy: outdoor string lights, lanterns`,
        `Buy: outdoor decor and accents`,
        `Buy: under-cabinet kitchen lighting (LED strip pricing drops 25-40%)`,
        `Buy: WindowDressers community-built window inserts (Vermont, ~$40/insert)`,
      ],
    },
    {
      heading: `December-February — Deep clearance window`,
      body: `January-February clearance extends backward into December for outdoor and seasonal categories.`,
      list: [
        `Buy: patio furniture (continues from November, less selection)`,
        `Buy: mattresses (May is one window, January is the other major one)`,
        `Buy: bedding, linens, kitchen textiles (white sale)`,
        `Buy: gym equipment (post-resolution starts late January)`,
      ],
    },
    {
      heading: `How Smart Cart uses the calendar`,
      body: `Smart Cart automatically applies buy-timing to every recommendation. Build a lake-season cart in May and the Wait list says "patio furniture: wait until November, save $400-1,200." Build a weatherization cart in March and the Wait list flags WindowDressers signup deadlines. Calendar is in the cart, applied to your project.`,
    },
  ],
  faqs: [
    {
      q: `Are Black Friday and Cyber Monday actually good?`,
      a: `Mixed. Tools see real Black Friday promos. Smart home devices see real promos. Major appliances are usually better in January. Patio furniture is usually better in November. Check price history first.`,
    },
    {
      q: `Amazon Prime Day?`,
      a: `Strong for small electronics, smart home, Amazon-brand items. Mixed for tools (some real deals, lots of inflated MSRP). Weak for furniture and large-format home goods.`,
    },
    {
      q: `Should I wait for something I need now?`,
      a: `Urgent need overrides timing. Broken furnace in February requires a furnace now. The calendar is for non-urgent purchases — most home improvement, most furniture, most decor.`,
    },
    {
      q: `Vermont-specific timing patterns?`,
      a: `Mostly national retail cycles. The few VT-specific notes: WindowDressers community builds are a fall-only Vermont event. Vermont contractor scheduling premiums are higher in May-October exterior season.`,
    },
    {
      q: `Does Smart Cart show me the calendar for my items?`,
      a: `Yes. Every cart includes a Wait section flagging items in your scope with active timing improvements.`,
    },
  ],
  ctaHeading: `Get your timing-aware shopping list`,
  ctaBody: `$19.99. 24-hour refund. Smart Cart builds the buy / skip / wait list for your project with buy-timing applied to every item.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=buy_timing`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `The 5-question test`,
      href: `/guides/the-5-question-test-before-any-home-purchase`,
    },
    {
      label: `Lake season: Buy / Skip / Wait`,
      href: `/guides/lake-season-buy-skip-wait`,
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
  description: `Month-by-month guide to home improvement sale cycles. Patio furniture in November, cabinet hardware in late summer, paint in February. Save 30-50%.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/home-improvement-buy-timing-calendar',
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
