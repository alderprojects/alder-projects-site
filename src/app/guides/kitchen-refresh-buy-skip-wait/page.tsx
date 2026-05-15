import type { Metadata } from 'next'
import GuidePage from '@/components/GuidePage'

export const metadata: Metadata = {
  title: `Kitchen Refresh: How $2,000 of Shopping Becomes $480 (And Looks Better)`,
  description: `The $2,000 kitchen refresh that should have been $480. Cabinet hardware, faucets, lighting, and the skip-list that saves most of the budget.`,
  alternates: { canonical: 'https://alderprojects.com/guides/kitchen-refresh-buy-skip-wait' },
  openGraph: {
    title: `Kitchen Refresh: How $2,000 of Shopping Becomes $480 (And Looks Better)`,
    description: `The $2,000 kitchen refresh that should have been $480. Cabinet hardware, faucets, lighting, and the skip-list that saves most of the budget.`,
    type: 'article',
    url: 'https://alderprojects.com/guides/kitchen-refresh-buy-skip-wait',
  },
}

const content = {
  eyebrow: `Buy / Skip / Wait`,
  h1: `Kitchen Refresh: Buy / Skip / Wait`,
  intro: `A kitchen refresh is the highest-ROI low-spend home project most homeowners can do themselves. The trap is that it's also where the most marketing-heavy products live. $2,000 of well-intentioned shopping turns into $480 of well-targeted shopping with the right filter applied.`,
  readTime: `6 min`,
  sections: [
    {
      heading: `The 3 moves that actually transform a kitchen`,
      body: `Most of the visual impact comes from three changes. Each under $250. Total: $260-480 for a mid-size kitchen.`,
      list: [
        `Cabinet hardware swap: $80-180 for a full kitchen in real metal (not plastic-coated). 20-30 pulls or knobs. Single biggest visual move under $200.`,
        `Faucet upgrade: $140-220 for Moen or Delta mid-range with magnetic dock. Quality matters more than aesthetics for what your hand touches daily.`,
        `Under-cabinet lighting: $40-80 for plug-in LED strips, no electrical work. Transforms counter-task experience and adds ambient evening light.`,
      ],
    },
    {
      heading: `Buy: supporting items that earn their place`,
      body: `Beyond the core three, these add real value if budget allows.`,
      list: [
        `Cabinet refinishing supplies: $150-250 (sander rental, primer, paint, brushes) if cabinets are scratched but structurally fine. Beats $2,000+ for new doors.`,
        `Drawer organizers: $30-80 for bamboo or wood inserts that actually fit your drawers.`,
        `Pull-out trash and recycling: $80-150 for a soft-close pull-out kit. Worth it if you don't have one.`,
        `Open shelving on one wall: $40-80 for floating shelves with real wood. Most rented "renovation feel" for lowest cost.`,
      ],
    },
    {
      heading: `Skip: items that don't earn their cost`,
      body: `Most of the $2,000 list that becomes $480 disappears here.`,
      list: [
        `Skip peel-and-stick backsplash ($150-300). Looks fine in photos and bad in 6 months.`,
        `Skip new cabinet doors at $80-200 per door installed. 25-door kitchen is $2,000-5,000. Refinish for $200, replace for $5,000 — math is rarely close.`,
        `Skip smart kitchen gadgets — wifi kettle, bluetooth scale, smart soap dispenser. None makes a kitchen better.`,
        `Skip premium paint ($90-110/gallon) for cabinet refinishing. $35/gallon mid-grade covers the same surface with good prep.`,
        `Skip designer cabinet hardware at $20-40 per pull when mid-range solid metal at $5-8 is identical in feel. Multiply by 25 pulls — savings $300-800.`,
      ],
    },
    {
      heading: `Wait: the timing moves`,
      body: `Kitchen retail has more predictable seasonality than most categories.`,
      list: [
        `Wait for cabinet hardware sales in late summer (August-September, back-to-school). Most lines drop 20-30%.`,
        `Wait for under-cabinet lighting in November (holiday cycle). LED strip pricing drops 25-40%.`,
        `Wait for kitchen paint in late winter (February-March) when retailers clear inventory.`,
      ],
    },
  ],
  faqs: [
    {
      q: `Actual cost of kitchen cosmetic refresh in Vermont?`,
      a: `Real refreshes (no structural, no plumbing or electrical moves, no new cabinets) run $400-1,500 in materials for a mid-size kitchen if you DIY. One of the highest-ROI projects in home improvement — most visual impact from $250-500 of hardware, faucet, lighting swaps.`,
    },
    {
      q: `Refinish or replace cabinet doors?`,
      a: `Refinish almost always wins unless doors are warped, water-damaged, or structurally failing. Doors at $80-200 each installed turn into $2,000-5,000 for a typical kitchen. Refinishing same set: $150-300 in materials and a weekend. Result looks 90% as good in most cases.`,
    },
    {
      q: `Are smart kitchen gadgets ever worth it?`,
      a: `For a specific use case, sometimes. A real Vitamix or Wusthof is worth the money to someone who cooks daily. A wifi kettle or app-connected toaster solves a problem that wasn't one. Test: would you buy this if it weren't smart? If no, skip.`,
    },
    {
      q: `Vermont-specific kitchen consideration?`,
      a: `Older Vermont kitchens often have plaster walls — skip peel-and-stick backsplash even more emphatically (adheres poorly to textured plaster). Pre-1960 homes often have non-standard counter heights — measure before buying a faucet with specific clearance requirements.`,
    },
    {
      q: `Does Smart Cart cover full kitchen renovation?`,
      a: `Kitchen scope covers cosmetic refresh, cabinet hardware swap, kitchen organizers — the under-$2,000 DIY range. Full renovation isn't in scope because it requires contractor involvement and on-site decisions Smart Cart can't make for you. For full renos, get three contractor quotes and use Buy-Skip-Wait on finish materials they let you supply.`,
    },
  ],
  ctaHeading: `Get your personalized kitchen refresh cart`,
  ctaBody: `$19.99. 24-hour refund. The 3-move core list, named skip list, and cabinet hardware / faucet / lighting picks across budget tiers.`,
  ctaHref: `/smart-cart?utm_source=guide&utm_medium=article&utm_campaign=kitchen_bsw`,
  relatedGuides: [
    {
      label: `The full method`,
      href: `/guides/how-to-shop-for-home-projects-without-overspending`,
    },
    {
      label: `Cabinet pulls: designer vs mid-tier`,
      href: `/guides/cabinet-pulls-designer-vs-mid-tier-real-difference`,
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
  description: `The $2,000 kitchen refresh that should have been $480. Cabinet hardware, faucets, lighting, and the skip-list that saves most of the budget.`,
  author: { '@type': 'Organization', name: 'Alder Projects' },
  publisher: { '@type': 'Organization', name: 'Alder Projects', url: 'https://alderprojects.com' },
  datePublished: '2026-05-13',
  mainEntityOfPage: 'https://alderprojects.com/guides/kitchen-refresh-buy-skip-wait',
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
