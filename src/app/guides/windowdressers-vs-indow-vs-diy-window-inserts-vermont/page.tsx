import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `WindowDressers vs Indow vs DIY: Vermont Window Inserts Compared`,
  description: `Three-way comparison of WindowDressers community builds vs Indow custom acrylic vs DIY storm window kits. Real prices, lead times, lifespan, who installs.`,
  alternates: { canonical: 'https://alderprojects.com/guides/windowdressers-vs-indow-vs-diy-window-inserts-vermont' },
  openGraph: {
    title: `WindowDressers vs Indow vs DIY: Vermont Window Inserts Compared`,
    description: `Three-way comparison of WindowDressers community builds vs Indow custom acrylic vs DIY storm window kits. Real prices, lead times, lifespan, who installs.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/windowdressers-vs-indow-vs-diy-window-inserts-vermont',
  },
}

const content = {
  eyebrow: `Comparison`,
  h1: `WindowDressers vs Indow vs DIY: which window insert wins for Vermont?`,
  intro: `Three Vermont homeowners with the same drafty old windows pick three different solutions: one signs up for WindowDressers in June for a November build, one orders custom Indow inserts at $400 a window, one buys $30 DIY kits at the hardware store. Which one made the right call? Depends on the situation.`,
  readTime: `7 min`,
  sections: [
    {
      heading: `The three options at a glance`,
      body: `Each option solves the same surface problem (drafty interior of an old window) with different trade-offs on price, lead time, lifespan, and aesthetics.`,
      list: [
        `WindowDressers — community-built interior storm window inserts. ~$40 per insert with Efficiency Vermont rebate support. 4-6 month lead time. Build with neighbors at a workshop.`,
        `Indow — custom-measured acrylic inserts professionally installed. $300-500 per window installed. 4-8 week lead time. Best aesthetic of the three.`,
        `DIY storm window insert kits — magnetic or friction-fit acrylic kits sold at hardware stores. $30-50 per window. Same-day. Less polished but functional.`,
      ],
    },
    {
      heading: `WindowDressers — community-built, lowest cost`,
      body: `Vermont nonprofit that runs community workshops where neighbors build interior storm window inserts together. The result is a wood-framed acrylic insert that friction-fits inside the window casing. Removes seasonally. Stores flat. Lasts 10+ years with reasonable care.`,
      list: [
        `Cost: ~$40 per insert at the community build (plus your time at the workshop)`,
        `Lead time: sign up in summer for a November build. Workshops fill quickly in some towns.`,
        `Lifespan: 10+ years with seasonal removal and flat storage`,
        `Who installs: you, at the workshop, with help from volunteers`,
        `EVT rebate support: yes, qualifying installations get incentive`,
        `Best for: homeowners who can plan ahead, want the lowest cost, and value community involvement`,
      ],
    },
    {
      heading: `Indow — custom acrylic, premium aesthetic`,
      body: `For-profit company that custom-measures each window opening and produces acrylic inserts with silicone edges that compression-fit the window frame. No hardware, no holes. Visually almost invisible from outside or inside. The premium option.`,
      list: [
        `Cost: $300-500 per window installed, varies by size and tier`,
        `Lead time: 4-8 weeks from order to install`,
        `Lifespan: 10-15 years; replacement edges available if silicone degrades`,
        `Who installs: Indow team or DIY with included instructions`,
        `EVT rebate support: limited, varies by program year`,
        `Best for: homeowners with budget who want the cleanest aesthetic, can't wait for WindowDressers, and want a product they don't have to remove seasonally`,
      ],
    },
    {
      heading: `DIY kits — fast, cheap, functional`,
      body: `Magnetic or friction-fit acrylic kits sold at most hardware stores and lumber yards. Cut to size from a standard sheet, attach with magnetic strips or compression edging. Less polished than the other two but works.`,
      list: [
        `Cost: $30-50 per window in materials`,
        `Lead time: same-day at most hardware stores`,
        `Lifespan: 3-5 years; magnetic strips can fail`,
        `Who installs: you, with basic tools`,
        `EVT rebate support: typically no (not a qualifying product class)`,
        `Best for: homeowners who need a fix this winter, can't wait for community build, and don't want the premium price of Indow`,
      ],
    },
    {
      heading: `The honest verdict by situation`,
      body: `There's no universal winner. Each option dominates a different scenario.`,
      list: [
        `Can plan 4-6 months ahead, value lowest cost: WindowDressers`,
        `Want premium aesthetic, have budget, can't wait for community build: Indow`,
        `Need it this winter, on a budget, OK with less polish: DIY kits`,
        `Multiple buildings to outfit (camp + main house, e.g.): mix — WindowDressers for one, DIY for the other`,
        `Just trying weatherization for the first time, not sure if windows are really the issue: start with DIY kits + weatherstripping, see if it solves the problem before committing to Indow or WindowDressers`,
      ],
    },
  ],
  faqs: [
    {
      q: `Can I use WindowDressers and Indow in the same house?`,
      a: `Yes. Some Vermonters use WindowDressers for the bulk of windows (back of house, less visible) and Indow for the front-facing or formal-living-room windows where aesthetics matter most.`,
    },
    {
      q: `Are DIY kits really as effective?`,
      a: `On the thermal performance, yes — same acrylic, same air gap, same physics. The difference is in fit precision, durability of edge seals, and visual finish. Thermal R-value improvement is similar across all three options.`,
    },
    {
      q: `Does WindowDressers serve every Vermont town?`,
      a: `Most populated areas, but not all. Their site lists active community-build locations. Some towns have waitlists. Some neighboring states have similar programs that aren't WindowDressers branded.`,
    },
    {
      q: `Does Indow ship to Vermont?`,
      a: `Yes — Indow ships nationally. Vermont installations are coordinated through their order pipeline; some installations are DIY with included instructions, some are professional.`,
    },
    {
      q: `What if my windows are too far gone for inserts?`,
      a: `All three options assume the underlying window is intact (frame solid, sash functional, glass not failed). If frames are rotted, sashes broken, or glass seals failed (visible fog), inserts won't help — replacement is the answer. The cheap diagnostic comes first.`,
    },
  ],
  ctaHeading: `Get your personalized window cart`,
  ctaBody: `$19.99. 24-hour refund. Smart Cart picks the right option for your specific situation and timeline — and tells you when to skip the inserts entirely.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=wd_vs_indow`,
  relatedGuides: [
    {
      label: `Windows: Buy / Skip / Wait`,
      href: `/guides/windows-buy-skip-wait`,
    },
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
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
  description: `Three-way comparison of WindowDressers community builds vs Indow custom acrylic vs DIY storm window kits. Real prices, lead times, lifespan, who installs.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/windowdressers-vs-indow-vs-diy-window-inserts-vermont',
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
